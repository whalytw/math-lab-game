/* 數學實驗室 — 華麗特效（3D）
   設定頁「特效：華麗」時啟用。效能設計（以 Surface Pro 8 接 4K 大螢幕為目標）：
   1. 整個畫面只有一張透明 WebGL 畫布蓋在三區上方，三區共用；每區用自己的視窗（scissor）各畫一次，不複製畫面。
   2. 畫布以較低解析度（預設 60% × 設定頁「畫面解析度」）繪製再放大。
   3. 只在轉場、答對、答錯、求救、總分時播放；沒有特效時畫布隱藏、完全不繪製（作答時零負擔）。
   4. 大量碎片合併成一個網格一次畫完；光暈用半透明貼圖；不用陰影與後製；幾何與貼圖事先建好重複使用。
   5. 三區同時播放的「重」特效最多約 2 個，超過時改播較輕的那一種，或延後 0.3 秒。
   6. 持續偵測流暢度：連續 2 秒低於 45 fps，就自動改回「完整」。
   每個時機有兩種特效，隨機決定，同一區連續兩次不會一樣。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const F = {
    ok: false, failed: false, active: [], layers: [], last: {},
    degraded: false, forceOn: false, stressing: false, visible: false,
    fps: 0, mon: { frames: 0, time: 0, low: 0 }
  };
  LG.fx3d = F;

  const BUDGET = 4;           // 同時播放的「重量」上限（重特效 2、輕特效 1 或 0.5）
  const LOW_FPS = 45;         // 低於此值連續 2 秒就自動降級
  const RES = 0.6;            // 3D 畫布解析度比例

  F.enabled = () => !F.failed && (F.forceOn || LG.settings.data.fx === 'rich') && !!window.THREE;

  /* ---------- 初始化 ---------- */
  F.init = () => {
    if (F.ok) return true;
    if (F.failed || !window.THREE) return false;
    try {
      const cv = document.createElement('canvas');
      cv.className = 'fx3d-cv';
      document.body.appendChild(cv);
      cv.addEventListener('webglcontextlost', e => { e.preventDefault(); F.lost = true; });
      cv.addEventListener('webglcontextrestored', () => { F.lost = false; });
      const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: 'high-performance', premultipliedAlpha: true });
      r.setClearColor(0x000000, 0);
      r.autoClear = false;
      r.outputColorSpace = THREE.SRGBColorSpace;
      F.cv = cv; F.r = r;
      F.layers = [0, 1, 2].map(() => makeLayer());
      F.ok = true;
      F.resize();
      window.addEventListener('resize', () => F.resize());
      setTimeout(F.prewarm, 50);
    } catch (e) {
      console.warn('華麗特效無法啟用（WebGL 不可用），改用完整特效', e);
      F.failed = true;
    }
    return F.ok;
  };

  function makeLayer() {
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 0.6, 0.1, 200);
    cam.position.set(0, 0, 14);
    scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x6a5a48, 1.5));   // 地面反光改成暖灰，背光面不會黑到和背景融在一起
    const dl = new THREE.DirectionalLight(0xffffff, 2.2);
    dl.position.set(4, 6, 10);
    scene.add(dl);
    const fill = new THREE.DirectionalLight(0xfff2dc, 1.1);   // 左後方補光：照亮旋轉到背面的部分
    fill.position.set(-7, 2, -3);
    scene.add(fill);
    return { scene, cam, w: 1, h: 1, hh: 14 * Math.tan(20 * Math.PI / 180) };
  }

  F.resize = () => {
    if (!F.ok) return;
    const host = document.getElementById('zones');
    if (!host) return;
    const rc = host.getBoundingClientRect();
    F.rect = rc;
    Object.assign(F.cv.style, { left: rc.left + 'px', top: rc.top + 'px', width: rc.width + 'px', height: rc.height + 'px' });
    const pr = Math.min(window.devicePixelRatio || 1, 2) * RES * LG.settings.data.renderScale;
    if (F.pr !== pr) { F.pr = pr; F.r.setPixelRatio(pr); }
    F.r.setSize(rc.width, rc.height, false);
  };

  /* 第一次使用材質時要編譯著色器，會卡一下：開啟華麗特效時先在背景編譯 */
  F.prewarm = () => {
    if (!F.ok || F.warmed) return;
    F.warmed = true;
    try {
      const L = F.layers[0];
      const tmp = [new THREE.Mesh(R.octa(), stdMat(0xffffff)), new THREE.Mesh(R.plane(), basicMat(0xffffff)),
        new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)), pointsMat(0.3))];
      tmp.forEach(m => L.scene.add(m));
      F.r.compile(L.scene, L.cam);
      tmp.forEach(m => { L.scene.remove(m); if (m.material.dispose) m.material.dispose(); });
    } catch (e) { /* ignore */ }
  };

  /* ---------- 共用資源（只建一次） ---------- */
  const DS = () => (THREE.DoubleSide != null ? THREE.DoubleSide : 2);
  const R = {};
  R.glow = () => R._glow || (R._glow = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  R.plane = () => R._plane || (R._plane = new THREE.PlaneGeometry(0.34, 0.2).toNonIndexed());
  R.unit = () => R._unit || (R._unit = new THREE.PlaneGeometry(1, 1));
  R.box = () => R._box || (R._box = new THREE.BoxGeometry(2.2, 2.2, 2.2));
  R.octa = () => R._octa || (R._octa = (() => {
    const s = 0.22, v = [s, 0, 0, -s, 0, 0, 0, s, 0, 0, -s, 0, 0, 0, s, 0, 0, -s];
    const idx = [0, 2, 4, 2, 1, 4, 1, 3, 4, 3, 0, 4, 2, 0, 5, 1, 2, 5, 3, 1, 5, 0, 3, 5];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx);
    const ng = g.toNonIndexed(); ng.computeVertexNormals(); return ng;
  })());
  R.tri = () => R._tri || (R._tri = (() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.3, -0.2, 0, 0.32, -0.12, 0, -0.02, 0.34, 0], 3));
    g.computeVertexNormals(); return g;
  })());
  R.cone = () => R._cone || (R._cone = new THREE.CylinderGeometry(0.06, 1.7, 6.5, 24, 1, true));
  R.symTex = {};
  R.sym = ch => R.symTex[ch] || (R.symTex[ch] = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    g.font = '900 104px "Times New Roman", "Microsoft JhengHei", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(255,60,80,0.9)'; g.shadowBlur = 14;
    g.fillStyle = '#ff5a6a'; g.fillText(ch, 64, 70);
    g.shadowBlur = 0; g.lineWidth = 3; g.strokeStyle = '#ffd0d5'; g.strokeText(ch, 64, 70);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  /* 旋轉體（獎盃用）：pts 為 [半徑, 高度] */
  function lathe(pts, segs) {
    // 頭尾那一圈共用同一組頂點（不另外複製），法向量才會平順；否則接縫處光影斷開，看起來像裂了一道缺口
    const pos = [], idx = [];
    for (let i = 0; i < segs; i++) {
      const a = i / segs * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      for (const [r, y] of pts) pos.push(r * c, y, r * s);
    }
    const n = pts.length;
    for (let i = 0; i < segs; i++) for (let j = 0; j < n - 1; j++) {
      const a = i * n + j, b = ((i + 1) % segs) * n + j;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  R.trophy = () => R._trophy || (R._trophy = lathe([
    [0.001, -1.6], [0.95, -1.6], [0.95, -1.35], [0.32, -1.25], [0.2, -0.9], [0.14, -0.35], [0.3, -0.15], [0.62, 0.1],
    [0.86, 0.55], [0.98, 1.1], [1.02, 1.45], [0.9, 1.5], [0.82, 1.15], [0.66, 0.6], [0.001, 0.35]], 48));
  /* 獎盃把手：C 字形的圓管（左邊一個，右邊用鏡射） */
  R.handle = () => R._handle || (R._handle = (() => {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const a = (70 + 220 * i / 40) * Math.PI / 180; pts.push([-0.93 + 0.37 * Math.cos(a), 0.85 + 0.37 * Math.sin(a)]); }
    return tube(pts, 0.075, 10);
  })());
  R.plinth = () => R._plinth || (R._plinth = new THREE.BoxGeometry(1.5, 0.36, 1.5));
  /* 管線（轉場曲線用）：沿著 xy 平面上的點建立圓管 */
  function tube(pts, radius, radial) {
    const pos = [], idx = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[Math.min(n - 1, i + 1)], o = pts[Math.max(0, i - 1)];
      let tx = q[0] - o[0], ty = q[1] - o[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const nx = -ty, ny = tx; // 法向量（在 xy 平面內），副法向量為 z 軸
      for (let k = 0; k < radial; k++) {
        const a = k / radial * Math.PI * 2, c = Math.cos(a) * radius, s = Math.sin(a) * radius;
        pos.push(p[0] + nx * c, p[1] + ny * c, s);
      }
    }
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < radial; k++) {
      const a = i * radial + k, b = i * radial + (k + 1) % radial, c = a + radial, d = b + radial;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    g.userData.segIdx = radial * 6;
    return g;
  }
  const CURVE = {
    sin: x => 1.5 * Math.sin(1.25 * x),
    exp: x => Math.pow(2, x * 0.75) - 2.2,
    log: x => 1.6 * Math.log(x + 4.2) - 1.6,
    mirror: x => 1.4 * Math.sin(0.8 * x) + 0.12 * x,
    poly: x => 0.11 * x * (x - 2.2) * (x + 2.6),
    vec: x => 0.55 * x,
    all: x => 1.1 * Math.sin(1.1 * x) + 0.18 * x
  };
  R.tubes = {};
  R.tube = kind => R.tubes[kind] || (R.tubes[kind] = (() => {
    let pts = [];
    if (kind === 'circle') { for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2 + Math.PI / 2; pts.push([2.4 * Math.cos(a), 2.4 * Math.sin(a)]); } }
    else { const f = CURVE[kind] || CURVE.all; for (let i = 0; i <= 160; i++) { const x = -4 + 8 * i / 160; pts.push([x, U.clamp(f(x), -3.2, 3.2)]); } }
    const g = tube(pts, 0.13, 10); g.userData.pts = pts; return g;
  })());

  /* 本專案的 three.js 是精簡版（沒有 InstancedMesh、MeshStandardMaterial、Sprite），
     所以用 Lambert 光照材質；大量碎片用 Batch 把所有碎片合併成一個網格、一次畫完。 */
  function stdMat(color, o) {
    const p = Object.assign({}, o || {});
    delete p.roughness; delete p.metalness;
    return new THREE.MeshLambertMaterial(Object.assign({ color, transparent: true, opacity: 1 }, p));
  }
  /* 合併網格：n 個相同形狀的碎片共用一個 BufferGeometry，每格畫面在 CPU 上算好位置（每次一次繪製） */
  function Batch(base, n, mat) {
    const bp = base.attributes.position.array, bn = base.attributes.normal.array, vc = bp.length / 3;
    const pos = new Float32Array(n * vc * 3), nor = new Float32Array(n * vc * 3), colr = new Float32Array(n * vc * 3).fill(1);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    // 有貼圖座標（例如花瓣貼圖）時，每個碎片沿用同一組 UV
    if (base.attributes.uv) {
      const bu = base.attributes.uv.array, uv = new Float32Array(n * vc * 2);
      for (let i = 0; i < n; i++) uv.set(bu, i * vc * 2);
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    }
    mat.vertexColors = true;
    const mesh = new THREE.Mesh(g, mat);
    mesh.frustumCulled = false;
    return {
      mesh, geo: g,
      /* 第 i 個碎片：位置 (x,y,z)、繞單位軸 (kx,ky,kz) 轉 ang、縮放 s */
      set(i, x, y, z, kx, ky, kz, ang, s) {
        const c = Math.cos(ang), sn = Math.sin(ang), t = 1 - c, o = i * vc * 3;
        for (let j = 0; j < vc; j++) {
          const b = j * 3;
          let vx = bp[b], vy = bp[b + 1], vz = bp[b + 2], d = kx * vx + ky * vy + kz * vz;
          pos[o + b] = x + s * (vx * c + (ky * vz - kz * vy) * sn + kx * d * t);
          pos[o + b + 1] = y + s * (vy * c + (kz * vx - kx * vz) * sn + ky * d * t);
          pos[o + b + 2] = z + s * (vz * c + (kx * vy - ky * vx) * sn + kz * d * t);
          vx = bn[b]; vy = bn[b + 1]; vz = bn[b + 2]; d = kx * vx + ky * vy + kz * vz;
          nor[o + b] = vx * c + (ky * vz - kz * vy) * sn + kx * d * t;
          nor[o + b + 1] = vy * c + (kz * vx - kx * vz) * sn + ky * d * t;
          nor[o + b + 2] = vz * c + (kx * vy - ky * vx) * sn + kz * d * t;
        }
      },
      color(i, cc) { for (let j = 0; j < vc; j++) colr.set([cc.r, cc.g, cc.b], (i * vc + j) * 3); },
      commit() { g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true; },
      commitColor() { g.attributes.color.needsUpdate = true; },
      dispose() { g.dispose(); }
    };
  }
  /* 光暈片（取代 Sprite）：面向鏡頭的平面＋放射狀漸層貼圖、加法混色 */
  function glowQuad(color) {
    const m = new THREE.MeshBasicMaterial({ map: R.glow(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    return new THREE.Mesh(R.unit(), m);
  }
  function basicMat(color, o) { return new THREE.MeshBasicMaterial(Object.assign({ color, transparent: true, opacity: 1, side: DS() }, o || {})); }
  function pointsMat(size, o) {
    return new THREE.PointsMaterial(Object.assign({ size, map: R.glow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, opacity: 1 }, o || {}));
  }
  const col = c => new THREE.Color(c);
  const PALETTE = ['#ffb547', '#ff8f73', '#4fe0b0', '#f2f6fb', '#8ec5ff', '#ffd34d', '#e79bff'];

  /* ---------- 座標換算：區域內的 CSS px → 該區 3D 世界座標（z = 0 平面） ---------- */
  function W(L, px, py) {
    const aspect = L.w / L.h;
    return [(px / L.w - 0.5) * 2 * L.hh * aspect, (0.5 - py / L.h) * 2 * L.hh];
  }
  function zonePos(zone, el) {
    if (!el) return { x: zone.inner.clientWidth / 2, y: zone.inner.clientHeight / 2 };
    return zone.fx.rel(el);
  }

  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const rndAxis = () => V3(U.rand(-1, 1), U.rand(-1, 1), U.rand(-1, 1)).normalize();

  /* ================= 特效 ================= */
  const FX = {};

  /* 答對 A：3D 彩紙翻轉飄落 */
  FX.confetti = (L, zone, o) => {
    const n = 200, mat = stdMat(0xffffff, { side: DS() });
    const B = Batch(R.plane(), n, mat);
    const c = W(L, o.x, o.y);
    const P = [];
    for (let i = 0; i < n; i++) {
      const a = U.rand(-Math.PI * 0.85, -Math.PI * 0.15), v = U.rand(6, 13);
      P.push({ p: V3(c[0] + U.rand(-0.6, 0.6), c[1], U.rand(-1, 1)), v: V3(Math.cos(a) * v * 0.7, -Math.sin(a) * v, U.rand(-3, 3)),
        ax: rndAxis(), ang: U.rand(0, 6), w: U.rand(6, 14), s: U.rand(0.8, 1.3) });
      B.color(i, col(U.pick(PALETTE)));
    }
    B.commitColor();
    L.scene.add(B.mesh);
    return {
      dur: 2.4, weight: 2,
      update(dt, t) {
        const damp = Math.exp(-1.6 * dt);
        for (let i = 0; i < n; i++) {
          const p = P[i];
          p.v.y -= 11 * dt; p.v.multiplyScalar(damp);
          if (p.v.y < -2.6) p.v.y = -2.6; // 空氣阻力：彩紙慢慢飄
          p.p.addScaledVector(p.v, dt);
          p.p.x += Math.sin(t * 3 + i) * 0.6 * dt;
          p.ang += p.w * dt;
          B.set(i, p.p.x, p.p.y, p.p.z, p.ax.x, p.ax.y, p.ax.z, p.ang, p.s);
        }
        B.commit();
        mat.opacity = U.clamp((this.dur - t) / 0.6, 0, 1);
      },
      dispose() { L.scene.remove(B.mesh); B.dispose(); mat.dispose(); }
    };
  };

  /* 答對 B：發光多面體爆開，再飛進分數欄 */
  FX.shards = (L, zone, o) => {
    const n = 90, uc = col(U.UNIT_HEX[zone.meta ? zone.meta.unit : 1] || '#ffd34d');
    const mat = stdMat(0xffffff, { flatShading: true, emissive: uc, emissiveIntensity: 0.4 });
    const B = Batch(R.octa(), n, mat);
    const c = W(L, o.x, o.y), tgt = W(L, o.tx, o.ty);
    const P = [];
    for (let i = 0; i < n; i++) {
      P.push({ p: V3(c[0], c[1], 0), v: rndAxis().multiplyScalar(U.rand(4, 9)), ax: rndAxis(),
        ang: 0, w: U.rand(4, 10), sc: U.rand(0.7, 1.6), delay: U.rand(0, 0.35), mid: null });
      B.color(i, i % 3 ? uc : col('#ffffff'));
    }
    B.commitColor();
    const flash = glowQuad(uc);
    flash.position.set(c[0], c[1], 0.5);
    L.scene.add(B.mesh); L.scene.add(flash);
    const T = V3(tgt[0], tgt[1], 1);
    return {
      dur: 1.9, weight: 2,
      update(dt, t) {
        const fs = U.clamp(1 - t / 0.35, 0, 1);
        flash.scale.setScalar(1.5 + 9 * (1 - fs)); flash.material.opacity = fs;
        const damp = Math.exp(-3.2 * dt);
        for (let i = 0; i < n; i++) {
          const p = P[i];
          p.ang += p.w * dt;
          let k2 = 1;
          if (t < 0.75) { p.v.multiplyScalar(damp); p.p.addScaledVector(p.v, dt); }
          else {
            if (!p.mid) p.mid = p.p.clone();
            const u = U.clamp((t - 0.75 - p.delay) / 0.75, 0, 1);
            p.p.lerpVectors(p.mid, T, U.ease.inOutCubic(u));
            k2 = 1 - u * 0.8;
          }
          B.set(i, p.p.x, p.p.y, p.p.z, p.ax.x, p.ax.y, p.ax.z, p.ang, p.sc * k2);
        }
        B.commit();
        mat.opacity = U.clamp((this.dur - t) / 0.25, 0, 1);
      },
      dispose() { L.scene.remove(B.mesh); L.scene.remove(flash); B.dispose(); mat.dispose(); flash.material.dispose(); }
    };
  };

  /* 轉場 A：數字方塊翻滾飛入＋星點隧道 */
  FX.cubes = (L, zone, o) => {
    const uc = U.UNIT_HEX[o.meta ? o.meta.unit : 1] || '#8ec5ff';
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 256, 256);
    gr.addColorStop(0, uc); gr.addColorStop(1, '#0d2440');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 10; g.strokeRect(8, 8, 240, 240);
    g.fillStyle = '#ffffff'; g.font = '800 170px "Barlow Condensed", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(o.num || 1), 128, 140);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = stdMat(0xffffff, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 });
    const cube = new THREE.Mesh(R.box(), mat);
    // 星點隧道
    const N = 520, pos = new Float32Array(N * 3), colr = new Float32Array(N * 3), cc = col(uc), white = col('#ffffff');
    for (let i = 0; i < N; i++) {
      const a = U.rand(0, Math.PI * 2), r = U.rand(2.5, 9);
      pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r; pos[i * 3 + 2] = U.rand(-60, 10);
      const c = i % 2 ? cc : white; colr[i * 3] = c.r; colr[i * 3 + 1] = c.g; colr[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = pointsMat(0.32);
    const stars = new THREE.Points(geo, pm);
    L.scene.add(stars); L.scene.add(cube);
    const top = L.hh * 0.42;
    return {
      dur: 1.95, weight: 2,
      update(dt, t) {
        const sp = 38 * (1 - U.clamp((t - 1.2) / 0.7, 0, 0.8));
        for (let i = 0; i < N; i++) { pos[i * 3 + 2] += sp * dt; if (pos[i * 3 + 2] > 12) pos[i * 3 + 2] -= 72; }
        geo.attributes.position.needsUpdate = true;
        pm.opacity = U.clamp(1 - (t - 1.4) / 0.5, 0, 1);
        // 方塊：0～0.7 秒從遠處翻滾飛入；停留；最後向鏡頭衝出淡出
        const k = U.ease.outBack(U.clamp(t / 0.75, 0, 1)), e = U.clamp((t - 1.45) / 0.45, 0, 1);
        cube.position.set(0, top + (1 - k) * 2, -38 * (1 - k) + 9 * U.ease.inCubic(e));
        cube.rotation.set((1 - k) * 6 + 0.35 + Math.sin(t * 2) * 0.12, (1 - k) * 8 - 0.5 + t * 0.6, (1 - k) * 2);
        mat.opacity = 1 - e;
      },
      dispose() { L.scene.remove(stars); L.scene.remove(cube); geo.dispose(); pm.dispose(); mat.dispose(); tex.dispose(); }
    };
  };

  /* 轉場 B：本單元的代表曲線化成發光管線，在空中轉一圈 */
  FX.tube = (L, zone, o) => {
    const kind = (o.meta && o.meta.curve) || 'all';
    const geo = R.tube(kind).clone(), uc = col(U.UNIT_HEX[o.meta ? o.meta.unit : 1] || '#8ec5ff');
    // 淺色底（水墨、粉彩）不發光：水墨像一筆濃墨，粉彩像一條糖果色軟管；深海（soft）發光收斂、頭部不用白光
    const ink = LG.theme.brush, light = LG.theme.light, soft = LG.theme.soft;
    const mat = stdMat(uc, ink ? { emissive: uc, emissiveIntensity: 0.15 } : light ? { emissive: uc, emissiveIntensity: 0.35 } : soft ? { emissive: uc, emissiveIntensity: 0.4 } : { emissive: uc, emissiveIntensity: 0.65, roughness: 0.3, metalness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    const grp = new THREE.Group(); grp.add(mesh);
    const head = ink ? inkQuad(R.blot(1), 0x221d18) : light ? inkQuad(R.starTex(), 0xffd66e) : glowQuad(soft ? 0x9fe0d8 : 0xffffff);
    head.scale.setScalar(1.4); grp.add(head);
    const total = geo.index.count, seg = geo.userData.segIdx, pts = geo.userData.pts;
    grp.position.set(0, -L.hh * 0.32, -4);
    L.scene.add(grp);
    return {
      dur: 1.95, weight: 1,
      update(dt, t) {
        const k = U.ease.inOutCubic(U.clamp((t - 0.15) / 0.95, 0, 1));
        const nseg = Math.max(1, Math.floor(k * (pts.length - 1)));
        geo.setDrawRange(0, Math.min(total, nseg * seg));
        const hp = pts[Math.min(pts.length - 1, nseg)];
        head.position.set(hp[0], hp[1], 0); head.material.opacity = k < 1 ? 1 : 0;
        grp.rotation.set(0.25 * Math.sin(t * 1.4), -1.1 + 1.7 * U.ease.inOutCubic(U.clamp(t / 1.9, 0, 1)), 0.05);
        mat.opacity = U.clamp((this.dur - t) / 0.45, 0, 1);
      },
      dispose() { L.scene.remove(grp); geo.dispose(); mat.dispose(); head.material.dispose(); }
    };
  };

  /* 答錯 A：題目區裂成紅色碎片掉落（搭配 CSS 傾斜晃動） */
  FX.shatter = (L, zone, o) => {
    cssPulse(zone.stage, 'tilt3d', 700);
    const n = 70, mat = stdMat(0xffffff, { side: DS(), emissive: col('#5a0010'), emissiveIntensity: 0.6 });
    const B = Batch(R.tri(), n, mat);
    const c = W(L, o.x, o.y), span = W(L, o.x + o.w / 2, o.y)[0] - c[0];
    const P = [];
    for (let i = 0; i < n; i++) {
      const gx = (i % 10) / 9 - 0.5, gy = Math.floor(i / 10) / 6 - 0.5;
      P.push({ p: V3(c[0] + gx * span * 1.8, c[1] + gy * span * 1.1, 0), v: V3(gx * U.rand(2, 5), U.rand(1, 4), U.rand(2, 6)),
        ax: rndAxis(), ang: 0, w: U.rand(3, 9), s: U.rand(0.7, 1.4) });
      B.color(i, col(i % 4 ? '#ff5a6a' : '#ffd0d5'));
    }
    B.commitColor();
    L.scene.add(B.mesh);
    return {
      dur: 1.6, weight: 1,
      update(dt, t) {
        for (let i = 0; i < n; i++) {
          const p = P[i];
          p.v.y -= 14 * dt; p.p.addScaledVector(p.v, dt); p.ang += p.w * dt;
          B.set(i, p.p.x, p.p.y, p.p.z, p.ax.x, p.ax.y, p.ax.z, p.ang, p.s);
        }
        B.commit();
        mat.opacity = U.clamp((this.dur - t) / 0.5, 0, 1);
      },
      dispose() { L.scene.remove(B.mesh); B.dispose(); mat.dispose(); }
    };
  };

  /* 答錯 B：紅色立體符號掉下來彈跳 */
  FX.symbols = (L, zone, o) => {
    const chars = ['✕', 'π', '√', '÷', '?', '∞'];
    const n = 11, items = [], floor = -L.hh * 0.62, aspect = L.w / L.h;
    for (let i = 0; i < n; i++) {
      const mat = basicMat(0xffffff, { map: R.sym(chars[i % chars.length]), depthWrite: false });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), mat);
      mesh.position.set(U.rand(-0.85, 0.85) * L.hh * aspect, L.hh + U.rand(0.5, 4), U.rand(-2, 2));
      L.scene.add(mesh);
      items.push({ mesh, mat, vy: 0, vx: U.rand(-1.2, 1.2), wy: U.rand(-5, 5), wz: U.rand(-3, 3), bounced: 0 });
    }
    return {
      dur: 1.9, weight: 1,
      update(dt, t) {
        for (const it of items) {
          const p = it.mesh.position;
          it.vy -= 22 * dt; p.y += it.vy * dt; p.x += it.vx * dt;
          if (p.y < floor && it.vy < 0) { p.y = floor; it.vy = -it.vy * 0.5; it.bounced++; }
          it.mesh.rotation.y += it.wy * dt; it.mesh.rotation.z += it.wz * dt;
          it.mat.opacity = U.clamp((this.dur - t) / 0.45, 0, 1);
        }
      },
      dispose() { for (const it of items) { L.scene.remove(it.mesh); it.mesh.geometry.dispose(); it.mat.dispose(); } }
    };
  };

  /* 星點環繞（求救、獎盃共用） */
  function sparkles(L, cx, cy, r, n, color) {
    const pos = new Float32Array(n * 3), colr = new Float32Array(n * 3), cc = col(color), w = col('#ffffff'), ph = [];
    for (let i = 0; i < n; i++) { const c = i % 3 ? cc : w; colr.set([c.r, c.g, c.b], i * 3); ph.push([U.rand(0, 6.28), U.rand(0.6, 1.2), U.rand(-0.6, 0.6)]); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = pointsMat(0.28); const pts = new THREE.Points(geo, pm); L.scene.add(pts);
    return {
      update(t, alpha) {
        for (let i = 0; i < n; i++) {
          const [a0, rr, h] = ph[i], a = a0 + t * 2.2 * rr;
          pos[i * 3] = cx + Math.cos(a) * r * rr; pos[i * 3 + 1] = cy + h * r * 0.6 + Math.sin(t * 3 + a0) * 0.15; pos[i * 3 + 2] = Math.sin(a) * r * rr;
        }
        geo.attributes.position.needsUpdate = true; pm.opacity = alpha;
      },
      dispose() { L.scene.remove(pts); geo.dispose(); pm.dispose(); }
    };
  }

  /* 求救 A：提示框 3D 翻面＋星點 */
  FX.helpFlip = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'flip3d', 700);
    const c = W(L, o.x, o.y), sp = sparkles(L, c[0], c[1], 1.6, 60, '#ffd34d');
    return { dur: 1.1, weight: 0.5, update(dt, t) { sp.update(t, U.clamp((this.dur - t) / 0.4, 0, 1)); }, dispose() { sp.dispose(); } };
  };

  /* 求救 B：提示框從下方立起來＋聚光燈 */
  FX.helpSpot = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'rise3d', 750);
    const c = W(L, o.x, o.y);
    const mat = basicMat(0xffe7a0, { blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const cone = new THREE.Mesh(R.cone(), mat);
    cone.position.set(c[0], c[1] + 3.1, -1);
    L.scene.add(cone);
    return {
      dur: 1.3, weight: 0.5,
      update(dt, t) { mat.opacity = 0.22 * Math.min(1, t / 0.25) * U.clamp((this.dur - t) / 0.45, 0, 1); cone.rotation.y += dt * 0.8; },
      dispose() { L.scene.remove(cone); mat.dispose(); }
    };
  };

  /* 總分 A：旋轉獎盃＋聚光燈（金、銀、銅依稱號） */
  FX.trophy = (L, zone, o) => {
    const tierCol = ['#ffcc4d', '#ffcc4d', '#d7dde6', '#d08a4f', '#d08a4f'][o.tier || 0];
    // 不透明＋雙面：杯子外壁與內壁的面朝向相反，單面材質會讓其中一面消失，看起來像缺口；
    // 透明材質也會讓同一個網格前後面排序錯亂。淡出改用縮小，不用透明度。
    const mat = stdMat(col(tierCol), { side: DS(), transparent: false, emissive: col(tierCol), emissiveIntensity: 0.38 });
    const baseMat = stdMat(col('#3b2f22'), { transparent: false, emissive: col('#1a120a'), emissiveIntensity: 0.3 });
    const cup = new THREE.Mesh(R.trophy(), mat);
    const hl = new THREE.Mesh(R.handle(), mat), hr = new THREE.Mesh(R.handle(), mat);
    hr.scale.x = -1;
    const plinth = new THREE.Mesh(R.plinth(), baseMat); plinth.position.y = -1.85;
    const c = W(L, o.x, o.y);
    const grp = new THREE.Group(); grp.add(cup, hl, hr, plinth); grp.position.set(c[0], c[1], 1); L.scene.add(grp);
    const cm = basicMat(0xfff1c0, { blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    // 光柱放在獎盃後面（z = -3.2），不疊在杯身上；光柱邊緣斜切過杯身時會像缺口
    const cone = new THREE.Mesh(R.cone(), cm); cone.position.set(c[0], c[1] + 3.6, -3.2); L.scene.add(cone);
    const sp = sparkles(L, c[0], c[1], 1.7, 70, tierCol);
    return {
      dur: 4.6, weight: 2,
      update(dt, t) {
        const k = U.ease.outBack(U.clamp(t / 0.8, 0, 1)), out = U.clamp((t - 3.9) / 0.7, 0, 1);
        grp.scale.setScalar(Math.max(0.001, 0.6 * k * (1 - U.ease.inCubic(out))));
        grp.rotation.set(0.18, t * 2.2, 0);
        cm.opacity = 0.2 * Math.min(1, t / 0.5) * (1 - out);
        sp.update(t, 1 - out);
      },
      dispose() { L.scene.remove(grp); L.scene.remove(cone); mat.dispose(); baseMat.dispose(); cm.dispose(); sp.dispose(); }
    };
  };

  /* 總分 B：立體煙火（1～3 發） */
  FX.fireworks = (L, zone, o) => {
    const shells = o.shells || 2, per = 240, N = shells * per, aspect = L.w / L.h;
    const pos = new Float32Array(N * 3), colr = new Float32Array(N * 3), vel = new Float32Array(N * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = pointsMat(0.3); const pts = new THREE.Points(geo, pm); L.scene.add(pts);
    const S = [];
    for (let s = 0; s < shells; s++) {
      const cc = col(PALETTE[(s * 2 + U.randInt(0, 6)) % PALETTE.length]);
      S.push({ t0: s * 0.55, x: U.rand(-0.55, 0.55) * L.hh * aspect, y: U.rand(0.15, 0.5) * L.hh, burst: false, cc });
      for (let i = 0; i < per; i++) { const j = (s * per + i) * 3; pos[j + 1] = -999; colr.set([cc.r, cc.g, cc.b], j); }
    }
    return {
      dur: 1.2 + shells * 0.55 + 1.6, weight: 2,
      update(dt, t) {
        for (let s = 0; s < shells; s++) {
          const sh = S[s], lt = t - sh.t0;
          if (lt < 0) continue;
          if (lt < 0.6) { // 升空：用一顆火光代表
            const j = s * per * 3, k = lt / 0.6;
            pos[j] = sh.x; pos[j + 1] = -L.hh + (sh.y + L.hh) * U.ease.outCubic(k); pos[j + 2] = 0;
            continue;
          }
          if (!sh.burst) {
            sh.burst = true;
            for (let i = 0; i < per; i++) {
              const j = (s * per + i) * 3, u = U.rand(-1, 1), a = U.rand(0, Math.PI * 2), r = Math.sqrt(1 - u * u), sp = U.rand(3.5, 5.5);
              pos[j] = sh.x; pos[j + 1] = sh.y; pos[j + 2] = 0;
              vel[j] = r * Math.cos(a) * sp; vel[j + 1] = u * sp; vel[j + 2] = r * Math.sin(a) * sp;
            }
          }
          for (let i = 0; i < per; i++) {
            const j = (s * per + i) * 3;
            vel[j] *= Math.exp(-1.4 * dt); vel[j + 1] = vel[j + 1] * Math.exp(-1.4 * dt) - 3 * dt; vel[j + 2] *= Math.exp(-1.4 * dt);
            pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
          }
        }
        geo.attributes.position.needsUpdate = true;
        pm.opacity = U.clamp((this.dur - t) / 0.8, 0, 1);
      },
      dispose() { L.scene.remove(pts); geo.dispose(); pm.dispose(); }
    };
  };

  /* ================= 水墨風格的 3D 特效 =================
     全部用「畫在畫布上的貼圖＋平面」組成（墨點、漣漪、花瓣、印章、毛筆字），一般混色（不用發光），在宣紙底上才看得清楚。 */
  const INK = '#221d18';
  /* 墨點貼圖：中心濃、邊緣不規則暈開，旁邊帶幾滴濺出的小墨點 */
  R.blots = {};
  R.blot = seed => R.blots[seed] || (R.blots[seed] = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    g.fillStyle = INK;
    // 不規則的主體：多個重疊的半透明圓
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, d = rnd() * 38, r = 26 + rnd() * 34;
      g.globalAlpha = 0.18 + rnd() * 0.22;
      g.beginPath(); g.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 0.85; g.beginPath(); g.arc(128, 128, 40, 0, Math.PI * 2); g.fill();
    // 濺出的小墨點
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2, d = 70 + rnd() * 48, r = 2 + rnd() * 7;
      g.globalAlpha = 0.5 + rnd() * 0.4;
      g.beginPath(); g.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, r, 0, Math.PI * 2); g.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  /* 漣漪：淡墨圓環 */
  R.ringTex = () => R._ringTex || (R._ringTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 80, 128, 128, 126);
    gr.addColorStop(0, 'rgba(34,29,24,0)'); gr.addColorStop(0.55, 'rgba(34,29,24,0.55)'); gr.addColorStop(0.75, 'rgba(34,29,24,0.25)'); gr.addColorStop(1, 'rgba(34,29,24,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  /* 梅花瓣 */
  R.petalTex = () => R._petalTex || (R._petalTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    g.translate(64, 64);
    const gr = g.createRadialGradient(-30, 0, 4, 0, 0, 60);
    gr.addColorStop(0, '#fff3f1'); gr.addColorStop(0.6, '#ffffff'); gr.addColorStop(1, '#f4c9cc');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(-56, 0); g.bezierCurveTo(-30, -48, 40, -50, 58, -6); g.quadraticCurveTo(62, 0, 58, 6); g.bezierCurveTo(40, 50, -30, 48, -56, 0); g.fill();
    g.strokeStyle = 'rgba(160, 40, 50, 0.35)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = 'rgba(160, 40, 50, 0.5)'; g.beginPath(); g.arc(-44, 0, 5, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  /* 朱砂印章：方形、白字、邊緣略殘 */
  R.seals = {};
  R.seal = text => R.seals[text] || (R.seals[text] = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#b8322a';
    g.beginPath(); g.moveTo(14, 18); g.lineTo(242, 12); g.lineTo(244, 240); g.lineTo(16, 244); g.closePath(); g.fill();
    g.strokeStyle = '#fff6e8'; g.lineWidth = 7; g.strokeRect(30, 30, 196, 196);
    g.fillStyle = '#fff6e8';
    g.font = `400 ${text.length > 1 ? 92 : 150}px "DFKai-SB", "BiauKai", "標楷體", "KaiTi", serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (text.length > 1) { g.fillText(text[0], 128, 82); g.fillText(text[1], 128, 178); } else g.fillText(text, 128, 136);
    // 印泥不均：隨機挖掉一些小點
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 90; i++) { g.globalAlpha = Math.random() * 0.6; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 3.5, 0, Math.PI * 2); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  /* 一筆毛筆橫畫（用來組成 ✕） */
  R.strokeTex = () => R._strokeTex || (R._strokeTex = (() => {
    // 畫布留足上下空間，淡墨暈染才不會被切成一個方框
    const c = document.createElement('canvas'); c.width = 512; c.height = 192;
    const g = c.getContext('2d');
    const pts = [];
    for (let i = 0; i <= 60; i++) pts.push([30 + i * 7.5, 96 + Math.sin(i * 0.18) * 3]);
    LG.brushStroke(g, pts, 46, '#7a1e16', 1);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })());
  /* 貼圖平面（一般混色） */
  function inkQuad(tex, color, o) {
    const m = new THREE.MeshBasicMaterial(Object.assign({ map: tex, color: color == null ? 0xffffff : color, transparent: true, depthWrite: false, side: DS() }, o || {}));
    return new THREE.Mesh(R.unit(), m);
  }

  /* 轉場 A：墨滴落在宣紙上暈開，泛起漣漪 */
  FX.inkDrop = (L, zone, o) => {
    const uc = col(U.UNIT_HEX[o.meta ? o.meta.unit : 1] || INK);
    const grp = new THREE.Group(); grp.position.set(0, L.hh * 0.42, -1); L.scene.add(grp);
    const blot = inkQuad(R.blot(2), 0xffffff); grp.add(blot);
    const rings = [0, 1, 2].map(i => { const r = inkQuad(R.ringTex(), uc); r.position.z = 0.1 + i * 0.01; grp.add(r); return r; });
    const drops = [];
    for (let i = 0; i < 9; i++) {
      const d = inkQuad(R.blot(3 + i % 3), 0xffffff); const a = i / 9 * Math.PI * 2 + U.rand(-0.2, 0.2);
      d.userData = { vx: Math.cos(a) * U.rand(2.5, 4.5), vy: Math.sin(a) * U.rand(2.5, 4.5), s: U.rand(0.35, 0.6) };
      grp.add(d); drops.push(d);
    }
    return {
      dur: 1.95, weight: 1,
      update(dt, t) {
        const k = U.ease.outCubic(U.clamp(t / 0.55, 0, 1)), out = U.clamp((t - 1.45) / 0.5, 0, 1);
        blot.scale.setScalar(0.4 + 3.6 * k); blot.material.opacity = 0.9 * (1 - out); blot.rotation.z = 0.3 * k;
        rings.forEach((r, i) => { const rt = U.clamp((t - 0.15 - i * 0.22) / 1.1, 0, 1); r.scale.setScalar(1 + 7 * U.ease.outCubic(rt)); r.material.opacity = (rt > 0 ? 0.7 * (1 - rt) : 0) * (1 - out); });
        drops.forEach(d => { const u = d.userData, dk = U.clamp(t / 0.5, 0, 1); d.position.set(u.vx * U.ease.outCubic(dk), u.vy * U.ease.outCubic(dk), 0.05); d.scale.setScalar(u.s * (0.4 + 0.6 * dk)); d.material.opacity = 0.85 * (1 - out); });
      },
      dispose() { L.scene.remove(grp); grp.traverse(m => { if (m.material) m.material.dispose(); }); }
    };
  };

  /* 答對 A：梅花瓣飄落 */
  FX.petals = (L, zone, o) => {
    // 不受光照（背面才不會變成深褐色）
    const n = 140, mat = new THREE.MeshBasicMaterial({ map: R.petalTex(), transparent: true, alphaTest: 0.25, side: DS() });
    const base = R._petalGeo || (R._petalGeo = new THREE.PlaneGeometry(0.42, 0.42).toNonIndexed());
    const B = Batch(base, n, mat);
    const c = W(L, o.x, o.y), aspect = L.w / L.h, P = [];
    const tints = ['#ffffff', '#ffd9dc', '#f7b8bf', '#ffe8e6'];
    for (let i = 0; i < n; i++) {
      const fromTop = i % 3 !== 0;
      P.push({ p: V3(fromTop ? U.rand(-1, 1) * L.hh * aspect : c[0] + U.rand(-0.5, 0.5), fromTop ? L.hh * U.rand(1, 1.6) : c[1], U.rand(-1.5, 1.5)),
        v: fromTop ? V3(U.rand(-0.6, 0.6), U.rand(-2.6, -1.4), 0) : V3(U.rand(-4, 4), U.rand(3, 8), U.rand(-2, 2)),
        ax: rndAxis(), ang: U.rand(0, 6), w: U.rand(2, 6), s: U.rand(0.7, 1.3), ph: U.rand(0, 6) });
      B.color(i, col(tints[i % tints.length]));
    }
    B.commitColor();
    L.scene.add(B.mesh);
    return {
      dur: 2.6, weight: 2,
      update(dt, t) {
        for (let i = 0; i < n; i++) {
          const p = P[i];
          p.v.y = Math.max(p.v.y - 7 * dt, -1.8); p.v.x *= Math.exp(-1.2 * dt);
          p.p.addScaledVector(p.v, dt); p.p.x += Math.sin(t * 2.2 + p.ph) * 0.9 * dt;
          p.ang += p.w * dt;
          B.set(i, p.p.x, p.p.y, p.p.z, p.ax.x, p.ax.y, p.ax.z, p.ang, p.s);
        }
        B.commit();
        mat.opacity = U.clamp((this.dur - t) / 0.6, 0, 1);
      },
      dispose() { L.scene.remove(B.mesh); B.dispose(); mat.dispose(); }
    };
  };

  /* 答對 B：朱砂印章「蓋」下去 */
  FX.seal = (L, zone, o) => {
    const word = U.pick(['答對', '妙', '善', '佳']);
    const c = W(L, o.x, o.y);
    const s = inkQuad(R.seal(word), 0xffffff); s.position.set(c[0], c[1], 1.5); L.scene.add(s);
    const specks = [];
    for (let i = 0; i < 8; i++) { const d = inkQuad(R.blot(6 + i % 3), 0xb8322a); d.userData = { a: i / 8 * Math.PI * 2, r: U.rand(1.3, 2.1), s: U.rand(0.18, 0.32) }; d.position.set(c[0], c[1], 1.4); L.scene.add(d); specks.push(d); }
    const rot = U.rand(-0.2, 0.2);
    return {
      dur: 1.9, weight: 1,
      update(dt, t) {
        const k = U.clamp(t / 0.22, 0, 1), out = U.clamp((t - 1.45) / 0.45, 0, 1);
        const sc = t < 0.22 ? 4.2 - 1.8 * U.ease.inCubic(k) : 2.4 + 0.12 * Math.exp(-(t - 0.22) * 12) * Math.sin((t - 0.22) * 40);
        s.scale.setScalar(sc); s.rotation.z = rot; s.material.opacity = Math.min(1, t / 0.12) * (1 - out);
        specks.forEach(d => { const u = d.userData, dk = U.clamp((t - 0.2) / 0.3, 0, 1); d.position.x = c[0] + Math.cos(u.a) * u.r * U.ease.outCubic(dk); d.position.y = c[1] + Math.sin(u.a) * u.r * U.ease.outCubic(dk); d.scale.setScalar(u.s * dk); d.material.opacity = (t > 0.2 ? 0.8 : 0) * (1 - out); });
      },
      dispose() { L.scene.remove(s); s.material.dispose(); specks.forEach(d => { L.scene.remove(d); d.material.dispose(); }); }
    };
  };

  /* 答錯 A：墨汁潑濺（搭配 CSS 傾斜晃動） */
  FX.splash = (L, zone, o) => {
    cssPulse(zone.stage, 'tilt3d', 700);
    const c = W(L, o.x, o.y), span = Math.abs(W(L, o.x + o.w / 2, o.y)[0] - c[0]) || 2;
    const blots = [];
    for (let i = 0; i < 6; i++) {
      const b = inkQuad(R.blot(10 + i), i % 3 === 0 ? 0xb8322a : 0xffffff);
      b.position.set(c[0] + U.rand(-1, 1) * span * 0.9, c[1] + U.rand(-0.8, 0.8) * span * 0.6, 1 + i * 0.01);
      b.rotation.z = U.rand(0, 6); b.userData = { s: U.rand(1.2, 2.4), d: i * 0.06 };
      L.scene.add(b); blots.push(b);
    }
    return {
      dur: 1.6, weight: 1,
      update(dt, t) {
        blots.forEach(b => { const u = b.userData, k = U.clamp((t - u.d) / 0.16, 0, 1); b.scale.setScalar(u.s * (k < 1 ? U.ease.outBack(k) : 1)); b.material.opacity = (t > u.d ? 0.85 : 0) * U.clamp((this.dur - t) / 0.6, 0, 1); });
      },
      dispose() { blots.forEach(b => { L.scene.remove(b); b.material.dispose(); }); }
    };
  };

  /* 答錯 B：毛筆畫一個大 ✕ */
  FX.brushX = (L, zone, o) => {
    const c = W(L, o.x, o.y), len = Math.min(L.hh * (L.w / L.h) * 1.5, 5.5);
    const geo = R._xGeo || (R._xGeo = (() => { const gg = new THREE.PlaneGeometry(1, 0.375); gg.translate(0.5, 0, 0); return gg; })());
    const strokes = [0, 1].map(i => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: R.strokeTex(), transparent: true, depthWrite: false, side: DS() }));
      const ang = i ? -Math.PI * 0.75 : -Math.PI * 0.25;
      m.rotation.z = ang; m.position.set(c[0] - Math.cos(ang) * len / 2, c[1] - Math.sin(ang) * len / 2, 1.2 + i * 0.01);
      L.scene.add(m); return m;
    });
    return {
      dur: 1.7, weight: 1,
      update(dt, t) {
        strokes.forEach((m, i) => { const k = U.ease.outCubic(U.clamp((t - i * 0.22) / 0.28, 0, 1)); m.scale.set(len * Math.max(0.001, k), len, 1); m.material.opacity = U.clamp((this.dur - t) / 0.5, 0, 1); });
      },
      dispose() { strokes.forEach(m => { L.scene.remove(m); m.material.dispose(); }); }
    };
  };

  /* 求救 A：提示像卷軸一樣展開，旁邊泛起漣漪 */
  FX.scroll = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'unroll', 750);
    const c = W(L, o.x, o.y);
    const rings = [0, 1].map(i => { const r = inkQuad(R.ringTex(), 0xb8860b); r.position.set(c[0], c[1], 0.5); L.scene.add(r); return r; });
    return {
      dur: 1.2, weight: 0.5,
      update(dt, t) { rings.forEach((r, i) => { const k = U.clamp((t - i * 0.25) / 0.9, 0, 1); r.scale.setScalar(1 + 5 * U.ease.outCubic(k)); r.material.opacity = k > 0 ? 0.6 * (1 - k) : 0; }); },
      dispose() { rings.forEach(r => { L.scene.remove(r); r.material.dispose(); }); }
    };
  };

  /* 求救 B：提示框旁點上一個朱砂「提」字印 */
  FX.hintSeal = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'rise3d', 750);
    const c = W(L, o.x, o.y), aspect = L.w / L.h;
    const s = inkQuad(R.seal('提'), 0xffffff); s.position.set(Math.min(c[0] + L.hh * aspect * 0.75, L.hh * aspect * 0.82), c[1] + 0.4, 1.2); L.scene.add(s);
    return {
      dur: 1.3, weight: 0.5,
      update(dt, t) { const k = U.clamp(t / 0.2, 0, 1); s.scale.setScalar(t < 0.2 ? 2.4 - 1.2 * k : 1.2); s.material.opacity = Math.min(1, t / 0.1) * U.clamp((this.dur - t) / 0.4, 0, 1); },
      dispose() { L.scene.remove(s); s.material.dispose(); }
    };
  };

  /* 總分 A：大印章蓋上稱號（狀元、榜眼…），四周梅花瓣 */
  FX.sealResult = (L, zone, o) => {
    const t0 = LG.theme.titles[o.tier || 0];
    // 印章連同四周花瓣約佔 ±2.4，往內收，避免被區域右緣切掉
    const c = W(L, o.x, o.y), edge = L.hh * (L.w / L.h) - 2.4;
    c[0] = Math.min(c[0], edge);
    const s = inkQuad(R.seal(t0[1].slice(0, 2)), 0xffffff); s.position.set(c[0], c[1], 1.5); L.scene.add(s);
    const pts = [];
    for (let i = 0; i < 18; i++) { const p = inkQuad(R.petalTex(), 0xffffff); const a = i / 18 * Math.PI * 2; p.userData = { a, r: U.rand(1.6, 2.6), w: U.rand(-3, 3) }; p.position.set(c[0], c[1], 1.4); L.scene.add(p); pts.push(p); }
    return {
      dur: 4.4, weight: 2,
      update(dt, t) {
        const k = U.clamp(t / 0.25, 0, 1), out = U.clamp((t - 3.7) / 0.7, 0, 1);
        s.scale.setScalar(t < 0.25 ? 4.5 - 2.4 * U.ease.inCubic(k) : 2.1 + 0.1 * Math.exp(-(t - 0.25) * 10) * Math.sin((t - 0.25) * 36));
        s.rotation.z = -0.08; s.material.opacity = Math.min(1, t / 0.15) * (1 - out);
        pts.forEach(p => { const u = p.userData, dk = U.ease.outCubic(U.clamp((t - 0.25) / 1.2, 0, 1)); p.position.x = c[0] + Math.cos(u.a + t * 0.3) * u.r * dk; p.position.y = c[1] + Math.sin(u.a + t * 0.3) * u.r * dk - t * 0.15; p.rotation.z = u.w * t; p.scale.setScalar(0.45 * dk); p.material.opacity = (1 - out) * (t > 0.25 ? 1 : 0); });
      },
      dispose() { L.scene.remove(s); s.material.dispose(); pts.forEach(p => { L.scene.remove(p); p.material.dispose(); }); }
    };
  };

  /* 總分 B：墨梅綻放（花瓣從幾個點炸開後飄落） */
  FX.plum = (L, zone, o) => {
    const shells = o.shells || 2, per = 160, N = shells * per, aspect = L.w / L.h;
    const pos = new Float32Array(N * 3), colr = new Float32Array(N * 3), vel = new Float32Array(N * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = new THREE.PointsMaterial({ size: 0.6, map: R.petalTex(), transparent: true, depthWrite: false, vertexColors: true, alphaTest: 0.2 });
    // 每片花瓣有自己的下落終速與飄動幅度，才不會排成整齊的橫線
    const term = new Float32Array(N), sway = new Float32Array(N);
    for (let i = 0; i < N; i++) { term[i] = U.rand(0.5, 1.8); sway[i] = U.rand(0.3, 1.4); }
    const ptsObj = new THREE.Points(geo, pm); ptsObj.frustumCulled = false; L.scene.add(ptsObj);
    const tints = ['#ffffff', '#ffd2d6', '#f2a6ae', '#d76a77'].map(col);
    const S = [];
    for (let s = 0; s < shells; s++) {
      S.push({ t0: s * 0.5, x: U.rand(-0.55, 0.55) * L.hh * aspect, y: U.rand(0.1, 0.5) * L.hh, burst: false });
      for (let i = 0; i < per; i++) { const j = (s * per + i) * 3, cc = tints[i % 4]; pos[j + 1] = -999; colr.set([cc.r, cc.g, cc.b], j); }
    }
    return {
      dur: 1 + shells * 0.5 + 2, weight: 2,
      update(dt, t) {
        for (let s = 0; s < shells; s++) {
          const sh = S[s], lt = t - sh.t0;
          if (lt < 0) continue;
          if (!sh.burst) {
            sh.burst = true;
            for (let i = 0; i < per; i++) { const j = (s * per + i) * 3, a = U.rand(0, Math.PI * 2), sp = U.rand(1.5, 4); pos[j] = sh.x; pos[j + 1] = sh.y; pos[j + 2] = 0; vel[j] = Math.cos(a) * sp; vel[j + 1] = Math.sin(a) * sp; vel[j + 2] = U.rand(-1, 1); }
          }
          for (let i = 0; i < per; i++) {
            const q = s * per + i, j = q * 3;
            vel[j] *= Math.exp(-2 * dt); vel[j + 1] = Math.max(vel[j + 1] * Math.exp(-2 * dt) - 2.2 * dt, -term[q]);
            pos[j] += vel[j] * dt + Math.sin(t * 1.7 + q * 0.37) * sway[q] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
          }
        }
        geo.attributes.position.needsUpdate = true;
        const a = U.clamp((this.dur - t) / 0.8, 0, 1);
        pm.opacity = a;
      },
      dispose() { L.scene.remove(ptsObj); geo.dispose(); pm.dispose(); }
    };
  };

  /* ================= 粉彩風格的 3D 特效 =================
     淺色底上加法發光會變成看不見的白色，所以一律用一般混色：糖果色的立體物件（星星、氣球、果凍）＋白色貼圖（泡泡、愛心、雲）。 */
  const CANDY = ['#ff9eb8', '#8fcbff', '#9be6c1', '#ffd66e', '#c7a8ff', '#ffb38a'];
  const texOf = c => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; };
  /* 胖胖的白色五角星（可用材質顏色或頂點顏色染色） */
  R.starTex = () => R._starTex || (R._starTex = (() => {
    const c = canvas(128), g = c.getContext('2d');
    g.translate(64, 66); g.beginPath();
    for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 24 : 52; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    g.closePath(); g.lineJoin = 'round'; g.lineWidth = 12;
    const gr = g.createRadialGradient(-12, -16, 4, 0, 0, 60); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e9e2f3');
    g.fillStyle = gr; g.strokeStyle = gr; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(-12, -14, 9, 5, -0.6, 0, Math.PI * 2); g.fill();
    return texOf(c);
  })());
  /* 白色愛心 */
  R.heartTex = () => R._heartTex || (R._heartTex = (() => {
    const c = canvas(128), g = c.getContext('2d');
    g.translate(64, 60); g.beginPath();
    g.moveTo(0, 46); g.bezierCurveTo(-60, 4, -44, -46, 0, -20); g.bezierCurveTo(44, -46, 60, 4, 0, 46); g.closePath();
    const gr = g.createRadialGradient(-16, -18, 4, 0, 0, 64); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#ece4f4');
    g.fillStyle = gr; g.fill();
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.ellipse(-20, -14, 9, 5, -0.7, 0, Math.PI * 2); g.fill();
    return texOf(c);
  })());
  /* 肥皂泡：透明中心、彩虹邊、亮點 */
  R.bubbleTex = () => R._bubbleTex || (R._bubbleTex = (() => {
    const c = canvas(256), g = c.getContext('2d');
    const rim = g.createRadialGradient(128, 128, 70, 128, 128, 124);
    rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(0.7, 'rgba(200,190,255,0.25)'); rim.addColorStop(0.92, 'rgba(160,200,255,0.75)'); rim.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rim; g.beginPath(); g.arc(128, 128, 124, 0, Math.PI * 2); g.fill();
    if (g.createConicGradient) {
      const cg = g.createConicGradient(0, 128, 128);
      ['rgba(255,150,190,0.55)', 'rgba(255,220,120,0.5)', 'rgba(140,230,190,0.5)', 'rgba(130,190,255,0.55)', 'rgba(200,160,255,0.55)', 'rgba(255,150,190,0.55)'].forEach((s, i, a) => cg.addColorStop(i / (a.length - 1), s));
      g.strokeStyle = cg; g.lineWidth = 7; g.beginPath(); g.arc(128, 128, 112, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.ellipse(88, 80, 22, 11, -0.7, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(70, 108, 6, 0, Math.PI * 2); g.fill();
    return texOf(c);
  })());
  /* 蓬蓬的雲（下緣帶一點紫灰） */
  R.cloudTex = () => R._cloudTex || (R._cloudTex = (() => {
    const c = canvas(512, 256), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 40, 0, 220); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#cfc4e6');
    g.fillStyle = gr;
    [[150, 150, 80], [240, 112, 100], [340, 140, 84], [410, 168, 56], [92, 176, 52], [256, 176, 80]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
    g.fillRect(92, 168, 320, 56);
    g.fillStyle = '#4a3f5c';   // 苦惱的表情
    g.beginPath(); g.arc(214, 160, 9, 0, Math.PI * 2); g.arc(298, 160, 9, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#4a3f5c'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.arc(256, 206, 22, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    return texOf(c);
  })());
  /* 雨滴 */
  R.dropTex = () => R._dropTex || (R._dropTex = (() => {
    const c = canvas(64), g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(32, 6); g.bezierCurveTo(44, 26, 50, 36, 50, 44); g.arc(32, 44, 18, 0, Math.PI); g.bezierCurveTo(14, 36, 20, 26, 32, 6); g.fill();
    return texOf(c);
  })());
  /* 總分徽章：花邊圓形＋兩條緞帶＋稱號圖示與文字 */
  R.medals = {};
  R.medal = (ti) => R.medals[ti] || (R.medals[ti] = (() => {
    const t0 = LG.theme.titles[ti] || LG.theme.titles[0];
    const tone = [['#ffc94d', '#ff8fb1'], ['#ff8fb1', '#c7a8ff'], ['#8fcbff', '#c7a8ff'], ['#9be6c1', '#8fcbff'], ['#ffd66e', '#9be6c1']][ti] || ['#ff8fb1', '#c7a8ff'];
    const c = canvas(512), g = c.getContext('2d');
    // 緞帶
    [[-1, tone[1]], [1, tone[0]]].forEach(([s, cl]) => {
      g.fillStyle = cl; g.beginPath();
      g.moveTo(256 + s * 30, 300); g.lineTo(256 + s * 120, 500); g.lineTo(256 + s * 92, 470); g.lineTo(256 + s * 66, 506); g.lineTo(256 - s * 30, 330); g.closePath(); g.fill();
    });
    // 花邊圓
    g.fillStyle = tone[0]; g.beginPath();
    for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2, r = 196 + 14 * Math.cos(a * 18); g.lineTo(256 + Math.cos(a) * r, 216 + Math.sin(a) * r); }
    g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(256, 216, 168, 0, Math.PI * 2); g.fill();
    g.strokeStyle = tone[1]; g.lineWidth = 8; g.setLineDash([16, 12]); g.beginPath(); g.arc(256, 216, 150, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '120px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'; g.fillText(t0[2], 256, 176);
    const name = t0[1];
    g.font = `900 ${name.length > 4 ? 50 : 60}px "Microsoft JhengHei", "微軟正黑體", sans-serif`; g.fillStyle = '#4a3f5c';
    g.fillText(name, 256, 290);
    return texOf(c);
  })());
  /* 立體胖星星（雙角錐，平面著色才有切面感） */
  R.star3d = () => R._star3d || (R._star3d = (() => {
    const ring = [];
    for (let j = 0; j < 10; j++) { const a = Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 0.13 : 0.3; ring.push([Math.cos(a) * r, Math.sin(a) * r]); }
    const v = [], h = 0.12;
    for (let j = 0; j < 10; j++) {
      const p = ring[j], q = ring[(j + 1) % 10];
      v.push(0, 0, h, p[0], p[1], 0, q[0], q[1], 0);
      v.push(0, 0, -h, q[0], q[1], 0, p[0], p[1], 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals();
    return g;
  })());
  /* 星點環繞（一般混色版） */
  function candySparkles(L, cx, cy, r, n, tex, colors) {
    const pos = new Float32Array(n * 3), colr = new Float32Array(n * 3), ph = [], cl = colors || CANDY;
    for (let i = 0; i < n; i++) { const cc = col(cl[i % cl.length]); colr.set([cc.r, cc.g, cc.b], i * 3); ph.push([U.rand(0, 6.28), U.rand(0.6, 1.2), U.rand(-0.6, 0.6)]); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = new THREE.PointsMaterial({ size: 0.42, map: tex || R.starTex(), transparent: true, depthWrite: false, vertexColors: true, alphaTest: 0.15 });
    const pts = new THREE.Points(geo, pm); L.scene.add(pts);
    return {
      update(t, alpha) {
        for (let i = 0; i < n; i++) {
          const [a0, rr, h] = ph[i], a = a0 + t * 2 * rr;
          pos[i * 3] = cx + Math.cos(a) * r * rr; pos[i * 3 + 1] = cy + h * r * 0.6 + Math.sin(t * 3 + a0) * 0.15; pos[i * 3 + 2] = Math.sin(a) * r * rr;
        }
        geo.attributes.position.needsUpdate = true; pm.opacity = alpha;
      },
      dispose() { L.scene.remove(pts); geo.dispose(); pm.dispose(); }
    };
  }

  /* 轉場 A：一串糖果色氣球飄上來，中間的大氣球寫著關卡數字 */
  FX.balloons = (L, zone, o) => {
    const uc = U.UNIT_HEX[o.meta ? o.meta.unit : 1] || '#ff8fb1', aspect = L.w / L.h;
    const sph = R._balloon || (R._balloon = new THREE.SphereGeometry(1, 22, 16));
    const cv = canvas(512, 256), g = cv.getContext('2d');
    g.fillStyle = uc; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#ffffff'; g.font = '800 150px "Barlow Condensed", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(o.num || 1), 128, 140);
    const numTex = texOf(cv);
    const items = [], mats = [];
    const strMat = new THREE.MeshBasicMaterial({ color: 0x9a8fb0, transparent: true });
    mats.push(strMat);
    for (let i = 0; i < 7; i++) {
      const big = i === 0, c = col(big ? '#ffffff' : CANDY[i % CANDY.length]);
      const m = new THREE.MeshLambertMaterial(big ? { map: numTex, color: 0xffffff, emissive: col(uc), emissiveIntensity: 0.12, transparent: true }
        : { color: c, emissive: c, emissiveIntensity: 0.18, transparent: true });
      mats.push(m);
      const b = new THREE.Mesh(sph, m); b.scale.set(0.82, 1, 0.82);
      const knot = new THREE.Mesh(sph, m); knot.scale.setScalar(0.12); knot.position.y = -1.02;
      const str = new THREE.Mesh(R.unit(), strMat); str.scale.set(0.03, 1.8, 1); str.position.y = -1.95;
      const grp = new THREE.Group(); grp.add(b, knot, str);
      const s = big ? 1.25 : U.rand(0.6, 0.85);
      grp.scale.setScalar(s);
      const x = big ? 0 : (i % 2 ? -1 : 1) * U.rand(0.25, 0.85) * L.hh * aspect;
      grp.userData = { x, ty: big ? L.hh * 0.3 : U.rand(-0.1, 0.7) * L.hh, z: big ? 0 : U.rand(-3, -0.5), d: big ? 0.05 : U.rand(0, 0.35), ph: U.rand(0, 6), big };
      grp.position.set(x, -L.hh - 3, grp.userData.z);
      L.scene.add(grp); items.push(grp);
    }
    return {
      dur: 1.95, weight: 2,
      update(dt, t) {
        const out = U.clamp((t - 1.45) / 0.5, 0, 1);
        for (const it of items) {
          const u = it.userData, k = U.ease.outBack(U.clamp((t - u.d) / 0.85, 0, 1));
          it.position.set(u.x + Math.sin(t * 2.2 + u.ph) * 0.25, -L.hh - 3 + (u.ty + L.hh + 3) * k + out * (L.hh + 4), u.z);
          it.rotation.set(0, u.big ? -0.3 + 0.25 * Math.sin(t * 1.5) : t * 0.6 + u.ph, Math.sin(t * 2 + u.ph) * 0.12);
        }
        mats.forEach(m => { m.opacity = 1 - out; });
      },
      dispose() { items.forEach(it => L.scene.remove(it)); mats.forEach(m => m.dispose()); numTex.dispose(); }
    };
  };

  /* 答對 A：立體糖果星星爆開飄落 */
  FX.stars = (L, zone, o) => {
    const n = 110, mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x6a5a7a, emissiveIntensity: 0.35, transparent: true });
    const B = Batch(R.star3d(), n, mat);
    const c = W(L, o.x, o.y), P = [];
    for (let i = 0; i < n; i++) {
      const a = U.rand(-Math.PI * 0.9, -Math.PI * 0.1), v = U.rand(5, 12);
      P.push({ p: V3(c[0] + U.rand(-0.5, 0.5), c[1], U.rand(-1, 1)), v: V3(Math.cos(a) * v * 0.75, -Math.sin(a) * v, U.rand(-3, 3)),
        ax: rndAxis(), ang: U.rand(0, 6), w: U.rand(3, 8), s: U.rand(0.7, 1.5) });
      B.color(i, col(CANDY[i % CANDY.length]));
    }
    B.commitColor();
    L.scene.add(B.mesh);
    return {
      dur: 2.4, weight: 2,
      update(dt, t) {
        const damp = Math.exp(-1.5 * dt);
        for (let i = 0; i < n; i++) {
          const p = P[i];
          p.v.y -= 10 * dt; p.v.multiplyScalar(damp); if (p.v.y < -3) p.v.y = -3;
          p.p.addScaledVector(p.v, dt); p.ang += p.w * dt;
          B.set(i, p.p.x, p.p.y, p.p.z, p.ax.x, p.ax.y, p.ax.z, p.ang, p.s);
        }
        B.commit();
        mat.opacity = U.clamp((this.dur - t) / 0.6, 0, 1);
      },
      dispose() { L.scene.remove(B.mesh); B.dispose(); mat.dispose(); }
    };
  };

  /* 答對 B：肥皂泡從題目區冒出、往上飄，最後啵一聲破掉 */
  FX.bubbles = (L, zone, o) => {
    const c = W(L, o.x, o.y), items = [];
    for (let i = 0; i < 22; i++) {
      const q = inkQuad(R.bubbleTex(), 0xffffff);
      q.userData = { x: c[0] + U.rand(-2.2, 2.2), y: c[1] + U.rand(-0.8, 0.4), vy: U.rand(1.4, 3), ph: U.rand(0, 6), s: U.rand(0.5, 1.2), pop: U.rand(1.0, 1.9), d: U.rand(0, 0.3) };
      q.position.set(q.userData.x, q.userData.y, 1 + i * 0.01); L.scene.add(q); items.push(q);
    }
    return {
      dur: 2.1, weight: 1,
      update(dt, t) {
        for (const q of items) {
          const u = q.userData, lt = t - u.d;
          if (lt < 0) { q.material.opacity = 0; continue; }
          q.position.x = u.x + Math.sin(lt * 3 + u.ph) * 0.3; q.position.y = u.y + u.vy * lt;
          const grow = Math.min(1, lt / 0.25), pk = U.clamp((t - u.pop) / 0.12, 0, 1);
          q.scale.setScalar(u.s * grow * (1 + 0.5 * pk) * (1 + 0.04 * Math.sin(lt * 9 + u.ph)));
          q.material.opacity = 0.95 * (1 - pk);
        }
      },
      dispose() { items.forEach(q => { L.scene.remove(q); q.material.dispose(); }); }
    };
  };

  /* 答錯 A：小雨雲飄過來下一陣雨（畫面像果凍晃一下） */
  FX.rainCloud = (L, zone, o) => {
    cssPulse(zone.stage, 'jelly', 700);
    const c = W(L, o.x, o.y), aspect = L.w / L.h, cy = Math.min(c[1] + 1.6, L.hh - 1.4);
    const cloud = inkQuad(R.cloudTex(), 0xffffff); cloud.scale.set(4.6, 2.3, 1); cloud.position.set(-L.hh * aspect - 3, cy, 1.2); L.scene.add(cloud);
    const N = 70, pos = new Float32Array(N * 3), vy = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3 + 1] = -999; vy[i] = U.rand(6, 9); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.38, map: R.dropTex(), color: 0x7fb4f0, transparent: true, depthWrite: false, alphaTest: 0.2 });
    // 雨滴一開始都放在畫面外，three.js 會依當時的位置算出包圍球而整組不畫，所以關掉視錐剔除
    const rain = new THREE.Points(geo, pm); rain.frustumCulled = false; L.scene.add(rain);
    let next = 0;
    return {
      dur: 1.7, weight: 1,
      update(dt, t) {
        const k = U.ease.outBack(U.clamp(t / 0.4, 0, 1));
        cloud.position.x = -L.hh * aspect - 3 + (c[0] + L.hh * aspect + 3) * k;
        cloud.position.y = cy + Math.sin(t * 5) * 0.08;
        cloud.scale.set(4.6 * (1 + 0.04 * Math.sin(t * 9)), 2.3 * (1 - 0.04 * Math.sin(t * 9)), 1);
        if (t > 0.35 && t < 1.3) {
          // 每格補幾滴新的雨
          for (let m = 0; m < 3; m++) {
            const i = next++ % N; pos[i * 3] = cloud.position.x + U.rand(-1.7, 1.7); pos[i * 3 + 1] = cy - 0.7; pos[i * 3 + 2] = 1.1;
          }
        }
        for (let i = 0; i < N; i++) if (pos[i * 3 + 1] > -900) pos[i * 3 + 1] -= vy[i] * dt;
        geo.attributes.position.needsUpdate = true;
        const a = U.clamp((this.dur - t) / 0.4, 0, 1); cloud.material.opacity = a; pm.opacity = a;
      },
      dispose() { L.scene.remove(cloud); cloud.material.dispose(); L.scene.remove(rain); geo.dispose(); pm.dispose(); }
    };
  };

  /* 答錯 B：粉紅色的果凍 ✕ 掉下來，Q 彈幾下 */
  FX.jellyX = (L, zone, o) => {
    const c = W(L, o.x, o.y);
    const bar = R._jbar || (R._jbar = new THREE.BoxGeometry(3, 0.6, 0.6));
    const mat = new THREE.MeshLambertMaterial({ color: col('#ff8fb1'), emissive: col('#ff8fb1'), emissiveIntensity: 0.25, transparent: true });
    const a = new THREE.Mesh(bar, mat), b = new THREE.Mesh(bar, mat);
    a.rotation.z = Math.PI / 4; b.rotation.z = -Math.PI / 4;
    const grp = new THREE.Group(); grp.add(a, b); grp.position.set(c[0], L.hh + 3, 1.5); L.scene.add(grp);
    const land = 0.42;
    return {
      dur: 1.75, weight: 1,
      update(dt, t) {
        if (t < land) { const k = U.ease.inCubic(t / land); grp.position.y = L.hh + 3 + (c[1] - L.hh - 3) * k; grp.scale.set(0.9, 1.15, 1); }
        else {
          const lt = t - land, sq = 0.32 * Math.exp(-lt * 5) * Math.cos(lt * 22);
          grp.position.y = c[1]; grp.scale.set(1 + sq, 1 - sq, 1 + sq * 0.5);
        }
        grp.rotation.y = 0.35 * Math.sin(t * 3);
        mat.opacity = U.clamp((this.dur - t) / 0.4, 0, 1);
      },
      dispose() { L.scene.remove(grp); mat.dispose(); }
    };
  };

  /* 求救 A：提示框 3D 翻面＋彩色星星環繞 */
  FX.twinkle = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'flip3d', 700);
    const c = W(L, o.x, o.y), sp = candySparkles(L, c[0], c[1], 1.6, 40);
    return { dur: 1.15, weight: 0.5, update(dt, t) { sp.update(t, U.clamp((this.dur - t) / 0.4, 0, 1)); }, dispose() { sp.dispose(); } };
  };

  /* 求救 B：提示框立起來，冒出小愛心 */
  FX.hearts = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'rise3d', 750);
    const c = W(L, o.x, o.y), items = [];
    for (let i = 0; i < 12; i++) {
      const q = inkQuad(R.heartTex(), col(CANDY[i % CANDY.length]));
      q.userData = { x: c[0] + U.rand(-2.4, 2.4), vy: U.rand(1.5, 2.6), ph: U.rand(0, 6), s: U.rand(0.35, 0.6), d: U.rand(0, 0.35) };
      q.position.set(q.userData.x, c[1], 1.2); L.scene.add(q); items.push(q);
    }
    return {
      dur: 1.4, weight: 0.5,
      update(dt, t) {
        for (const q of items) {
          const u = q.userData, lt = Math.max(0, t - u.d);
          q.position.set(u.x + Math.sin(lt * 4 + u.ph) * 0.25, c[1] + u.vy * lt, 1.2);
          q.scale.setScalar(u.s * Math.min(1, lt / 0.2)); q.rotation.z = Math.sin(lt * 5 + u.ph) * 0.3;
          q.material.opacity = (t > u.d ? 1 : 0) * U.clamp((this.dur - t) / 0.45, 0, 1);
        }
      },
      dispose() { items.forEach(q => { L.scene.remove(q); q.material.dispose(); }); }
    };
  };

  /* 總分 A：花邊徽章翻轉亮相（稱號＋圖示），彩色星星環繞 */
  FX.medal = (L, zone, o) => {
    const c = W(L, o.x, o.y), edge = L.hh * (L.w / L.h) - 2.3;
    c[0] = Math.min(c[0], edge);
    const m = inkQuad(R.medal(o.tier || 0), 0xffffff); m.position.set(c[0], c[1], 1.5); L.scene.add(m);
    const sp = candySparkles(L, c[0], c[1], 2.1, 46);
    return {
      dur: 4.4, weight: 2,
      update(dt, t) {
        const k = U.clamp(t / 0.9, 0, 1), out = U.clamp((t - 3.7) / 0.7, 0, 1);
        m.scale.setScalar(Math.max(0.001, 3.6 * U.ease.outBack(k) * (1 - U.ease.inCubic(out))));
        m.rotation.y = (1 - U.ease.outCubic(k)) * Math.PI * 4 + 0.18 * Math.sin(t * 1.6) * k;
        m.rotation.z = 0.05 * Math.sin(t * 2.1);
        sp.update(t, 1 - out);
      },
      dispose() { L.scene.remove(m); m.material.dispose(); sp.dispose(); }
    };
  };

  /* 總分 B：糖果煙火（星星與愛心炸開後慢慢飄落） */
  FX.candyWorks = (L, zone, o) => {
    const shells = o.shells || 2, per = 150, aspect = L.w / L.h, groups = [];
    for (let s = 0; s < shells; s++) {
      const pos = new Float32Array(per * 3), colr = new Float32Array(per * 3), vel = new Float32Array(per * 3), term = new Float32Array(per);
      for (let i = 0; i < per; i++) { const cc = col(CANDY[(i + s * 2) % CANDY.length]); colr.set([cc.r, cc.g, cc.b], i * 3); pos[i * 3 + 1] = -999; term[i] = U.rand(0.5, 1.9); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
      const pm = new THREE.PointsMaterial({ size: 0.5, map: s % 2 ? R.heartTex() : R.starTex(), transparent: true, depthWrite: false, vertexColors: true, alphaTest: 0.15 });
      const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; L.scene.add(pts);
      groups.push({ pos, vel, term, geo, pm, pts, t0: s * 0.5, x: U.rand(-0.55, 0.55) * L.hh * aspect, y: U.rand(0.15, 0.5) * L.hh, burst: false });
    }
    return {
      dur: 1.2 + shells * 0.5 + 1.7, weight: 2,
      update(dt, t) {
        for (const G of groups) {
          const lt = t - G.t0, pos = G.pos, vel = G.vel;
          if (lt < 0) continue;
          if (lt < 0.55) { const k = lt / 0.55; pos[0] = G.x; pos[1] = -L.hh + (G.y + L.hh) * U.ease.outCubic(k); pos[2] = 0; G.geo.attributes.position.needsUpdate = true; continue; }
          if (!G.burst) {
            G.burst = true;
            for (let i = 0; i < per; i++) {
              const j = i * 3, u = U.rand(-1, 1), a = U.rand(0, Math.PI * 2), r = Math.sqrt(1 - u * u), sp = U.rand(3, 5);
              pos[j] = G.x; pos[j + 1] = G.y; pos[j + 2] = 0; vel[j] = r * Math.cos(a) * sp; vel[j + 1] = u * sp; vel[j + 2] = r * Math.sin(a) * sp;
            }
          }
          for (let i = 0; i < per; i++) {
            const j = i * 3;
            vel[j] *= Math.exp(-1.8 * dt); vel[j + 1] = Math.max(vel[j + 1] * Math.exp(-1.8 * dt) - 2.6 * dt, -G.term[i]); vel[j + 2] *= Math.exp(-1.8 * dt);
            pos[j] += vel[j] * dt + Math.sin(t * 1.7 + i * 0.37) * 0.6 * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
          }
          G.geo.attributes.position.needsUpdate = true;
        }
        const a = U.clamp((this.dur - t) / 0.8, 0, 1); groups.forEach(G => { G.pm.opacity = a; });
      },
      dispose() { groups.forEach(G => { L.scene.remove(G.pts); G.geo.dispose(); G.pm.dispose(); }); }
    };
  };

  /* ================= 深海風格的 3D 特效 =================
     暗色底可以用加法發光，但亮度刻意壓低（不透明度約 0.5～0.8），學生站在大螢幕前才不刺眼。
     題材：魚群、水母、浮游生物的冷光、錨、氣泡、鮟鱇魚的小燈、寶箱。 */
  const SEA = ['#55c3c3', '#62cf98', '#dfc06c', '#ec8a7c', '#ad9bd6', '#80c8e6'];
  /* 小魚：壓扁的菱形身體＋三角尾鰭（不帶索引，給 Batch 用） */
  R.fish = () => R._fish || (R._fish = (() => {
    const N = [0.3, 0, 0], Bk = [-0.14, 0, 0], T = [0.02, 0.1, 0], Bo = [0.02, -0.1, 0], Lz = [0.02, 0, 0.05], Rz = [0.02, 0, -0.05];
    const tris = [[N, T, Lz], [N, Lz, Bo], [N, Bo, Rz], [N, Rz, T], [Bk, Lz, T], [Bk, Bo, Lz], [Bk, Rz, Bo], [Bk, T, Rz], [Bk, [-0.3, 0.11, 0], [-0.3, -0.11, 0]]];
    const v = []; tris.forEach(t => t.forEach(p => v.push(p[0], p[1], p[2])));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals();
    return g;
  })());
  /* 大氣泡裡寫著關卡數字 */
  function numBubble(num, color) {
    const c = canvas(256), g = c.getContext('2d');
    g.fillStyle = 'rgba(6, 34, 42, 0.6)'; g.beginPath(); g.arc(128, 128, 114, 0, Math.PI * 2); g.fill();
    g.drawImage(R.bubbleTex().image, 0, 0, 256, 256);
    g.fillStyle = color; g.font = '800 150px "Barlow Condensed", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(num), 128, 140);
    return texOf(c);
  }
  /* 錨（鏽紅色） */
  R.anchorTex = () => R._anchorTex || (R._anchorTex = (() => {
    const c = canvas(256), g = c.getContext('2d');
    const draw = (cl, w) => {
      g.strokeStyle = cl; g.fillStyle = cl; g.lineCap = 'round'; g.lineJoin = 'round';
      g.lineWidth = w; g.beginPath(); g.arc(128, 36, 18, 0, Math.PI * 2); g.stroke();
      g.lineWidth = w + 4; g.beginPath(); g.moveTo(128, 56); g.lineTo(128, 226); g.stroke();
      g.lineWidth = w; g.beginPath(); g.moveTo(84, 84); g.lineTo(172, 84); g.stroke();
      g.lineWidth = w + 2; g.beginPath(); g.arc(128, 150, 80, Math.PI * 0.12, Math.PI * 0.88); g.stroke();
      [[1, 198, 176], [-1, 58, 176]].forEach(([s, x, y]) => { g.beginPath(); g.moveTo(x + s * 4, y + 22); g.lineTo(x + s * 14, y - 16); g.lineTo(x - s * 22, y + 8); g.closePath(); g.fill(); });
    };
    draw('#3a1814', 24); draw('#b8584c', 14);
    g.strokeStyle = 'rgba(255, 210, 190, 0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(122, 70); g.lineTo(122, 200); g.stroke();
    return texOf(c);
  })());
  /* 總分：金幣徽章（稱號＋圖示） */
  R.badges = {};
  R.badge = ti => R.badges[ti] || (R.badges[ti] = (() => {
    const t0 = LG.THEMES.ocean.titles[ti] || LG.THEMES.ocean.titles[0];
    const c = canvas(512), g = c.getContext('2d');
    const gr = g.createRadialGradient(200, 160, 20, 256, 236, 220); gr.addColorStop(0, '#f2dc98'); gr.addColorStop(1, '#a87a28');
    g.fillStyle = gr; g.beginPath(); g.arc(256, 236, 214, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#7a5418'; g.lineWidth = 10; g.stroke();
    g.fillStyle = '#0b3440'; g.beginPath(); g.arc(256, 236, 178, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(223, 192, 108, 0.75)'; g.lineWidth = 6; g.setLineDash([14, 12]); g.beginPath(); g.arc(256, 236, 160, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '118px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'; g.fillText(t0[2], 256, 196);
    g.font = '900 ' + (t0[1].length > 4 ? 50 : 58) + 'px "Microsoft JhengHei", "微軟正黑體", sans-serif'; g.fillStyle = '#e9d59c';
    g.fillText(t0[1], 256, 306);
    return texOf(c);
  })());
  R.coin = () => R._coin || (R._coin = new THREE.CylinderGeometry(0.17, 0.17, 0.05, 14).toNonIndexed());

  /* 轉場 A：魚群繞著寫有關卡數字的大氣泡游一圈，再四散游走 */
  FX.fishSchool = (L, zone, o) => {
    const uc = U.UNIT_HEX[o.meta ? o.meta.unit : 1] || '#55c3c3';
    const n = 64, mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x0d3a40, emissiveIntensity: 0.6, transparent: true, side: DS() });
    const B = Batch(R.fish(), n, mat);
    const cy = L.hh * 0.3, P = [];
    for (let i = 0; i < n; i++) {
      P.push({ a: U.rand(0, Math.PI * 2), r: U.rand(2.3, 3.5), h: U.rand(-1, 1), w: U.rand(2.2, 3), s: U.rand(0.8, 1.3), ph: U.rand(0, 6) });
      B.color(i, col(i % 3 === 0 ? uc : SEA[i % SEA.length]));
    }
    B.commitColor(); L.scene.add(B.mesh);
    const tex = numBubble(o.num || 1, uc);
    const bub = inkQuad(tex, 0xffffff); bub.position.set(0, cy, 0); L.scene.add(bub);
    return {
      dur: 1.95, weight: 2,
      update(dt, t) {
        const inK = U.ease.outCubic(U.clamp(t / 0.7, 0, 1)), out = U.clamp((t - 1.4) / 0.55, 0, 1);
        for (let i = 0; i < n; i++) {
          const p = P[i], a = p.a + p.w * t, r = p.r + (1 - inK) * 8 + U.ease.inCubic(out) * 10;
          B.set(i, Math.cos(a) * r, cy + p.h + Math.sin(a) * 0.45 + Math.sin(t * 3 + p.ph) * 0.1, Math.sin(a) * r * 0.8,
            0, 1, 0, -(a + Math.PI / 2) + 0.18 * Math.sin(t * 14 + p.ph), p.s);
        }
        B.commit();
        mat.opacity = 1 - out;
        const bk = U.ease.outBack(U.clamp((t - 0.15) / 0.6, 0, 1));
        bub.scale.setScalar(Math.max(0.001, 3.3 * bk * (1 + 0.03 * Math.sin(t * 6))));
        bub.position.y = cy + U.ease.inCubic(out) * 2.5;
        bub.material.opacity = 1 - out;
      },
      dispose() { L.scene.remove(B.mesh); L.scene.remove(bub); B.dispose(); mat.dispose(); bub.material.dispose(); tex.dispose(); }
    };
  };

  /* 答對 A：發出冷光的水母一縮一放地往上游 */
  /* 水母貼圖：半透明的傘（邊緣較亮、下緣波浪）、裡面四個淡淡的圓、下方的口腕（白色，用材質顏色染色） */
  R.jellyTex = () => R._jellyTex || (R._jellyTex = (() => {
    const c = canvas(256), g = c.getContext('2d'), cx = 128, cy = 132, rx = 104, ry = 96;
    const gr = g.createRadialGradient(cx, cy, 10, cx, cy, rx);
    gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(0.75, 'rgba(255,255,255,0.32)'); gr.addColorStop(1, 'rgba(255,255,255,0.75)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
    for (let i = 0; i < 8; i++) { const x = cx + rx - i * rx / 4; g.quadraticCurveTo(x - rx / 8, cy + 14, x - rx / 4, cy); }
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, rx - 3, ry - 3, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.28)';
    [[-36, -20], [36, -20], [-14, -46], [14, -46]].forEach(([x, y]) => { g.beginPath(); g.ellipse(cx + x, cy + y, 16, 11, 0, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 7; g.lineCap = 'round';
    [-22, 0, 22].forEach((x, k) => { g.beginPath(); g.moveTo(cx + x, cy + 8); for (let y = 0; y <= 100; y += 10) g.lineTo(cx + x + Math.sin(y * 0.09 + k) * 9, cy + 8 + y); g.stroke(); });
    return texOf(c);
  })());
  FX.jellyfish = (L, zone, o) => {
    const c = W(L, o.x, o.y), aspect = L.w / L.h, NJ = 6, NT = 4, NP = 9, NPTS = NJ * NT * NP;
    const pos = new Float32Array(NPTS * 3), colr = new Float32Array(NPTS * 3), J = [];
    const spread = Math.min(3, L.hh * aspect * 0.7);
    for (let j = 0; j < NJ; j++) {
      const cc = col(SEA[j % SEA.length]);
      const bell = inkQuad(R.jellyTex(), cc, { blending: THREE.AdditiveBlending, opacity: 0 }), bm = bell.material;
      bell.scale.setScalar(2.2);
      const glow = glowQuad(cc); glow.scale.setScalar(2.4); glow.position.y = 0.25;
      const grp = new THREE.Group(); grp.add(glow, bell); L.scene.add(grp);
      J.push({ grp, bm, glow, x: c[0] + (j / (NJ - 1) - 0.5) * 2 * spread + U.rand(-0.3, 0.3), y: c[1] - U.rand(0.2, 1.4), s: U.rand(0.5, 0.75), ph: U.rand(0, 6), d: U.rand(0, 0.4), vy: U.rand(1.3, 1.9) });
      for (let k = 0; k < NT * NP; k++) colr.set([cc.r, cc.g, cc.b], (j * NT * NP + k) * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = pointsMat(0.12, { opacity: 0 }); const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; L.scene.add(pts);
    return {
      dur: 2.3, weight: 2,
      update(dt, t) {
        const fade = U.clamp((this.dur - t) / 0.55, 0, 1);
        J.forEach((q, j) => {
          const lt = Math.max(0, t - q.d), on = t > q.d ? Math.min(1, lt / 0.3) : 0;
          const k = 0.5 + 0.5 * Math.sin(lt * 7 + q.ph);               // 1＝收縮
          const gx = q.x + Math.sin(lt * 1.6 + q.ph) * 0.2, gy = q.y + lt * q.vy + 0.18 * Math.sin(lt * 7 + q.ph);
          q.grp.position.set(gx, gy, 1);
          q.grp.scale.set(q.s * (1.06 - 0.16 * k), q.s * (0.9 + 0.16 * k), q.s);
          q.grp.rotation.z = 0.15 * Math.sin(lt * 1.6 + q.ph);
          q.bm.opacity = 0.8 * on * fade; q.glow.material.opacity = 0.22 * on * fade;
          for (let a = 0; a < NT; a++) for (let b = 0; b < NP; b++) {
            const i = ((j * NT + a) * NP + b) * 3, bx = (a / (NT - 1) - 0.5) * 1.6 * q.s;
            pos[i] = gx + bx + Math.sin(lt * 6 - b * 0.6 + a) * 0.05 * b * q.s; pos[i + 1] = on ? gy - 0.15 * q.s - (b + 1) * 0.2 * q.s : -999; pos[i + 2] = 1;
          }
        });
        geo.attributes.position.needsUpdate = true; pm.opacity = 0.75 * fade;
      },
      dispose() { J.forEach(q => { L.scene.remove(q.grp); q.bm.dispose(); q.glow.material.dispose(); }); L.scene.remove(pts); geo.dispose(); pm.dispose(); }
    };
  };

  /* 答對 B：浮游生物的冷光爆開、打轉，再流進分數欄 */
  FX.plankton = (L, zone, o) => {
    const n = 220, c = W(L, o.x, o.y), tgt = W(L, o.tx, o.ty);
    const pos = new Float32Array(n * 3), colr = new Float32Array(n * 3), P = [];
    for (let i = 0; i < n; i++) {
      const v = rndAxis().multiplyScalar(U.rand(1.5, 4)), cc = col(SEA[i % 3]);
      pos.set([c[0], c[1], 0], i * 3); colr.set([cc.r, cc.g, cc.b], i * 3);
      P.push({ v, delay: U.rand(0, 0.35), mid: null, sp: U.rand(0, 6) });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = pointsMat(0.24); const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; L.scene.add(pts);
    const flash = glowQuad(col('#55c3c3')); flash.position.set(c[0], c[1], 0.5); L.scene.add(flash);
    const T = V3(tgt[0], tgt[1], 1), tmp = V3(0, 0, 0);
    return {
      dur: 1.9, weight: 1,
      update(dt, t) {
        const fs = U.clamp(1 - t / 0.4, 0, 1);
        flash.scale.setScalar(1.2 + 6 * (1 - fs)); flash.material.opacity = 0.45 * fs;
        const damp = Math.exp(-2.6 * dt);
        for (let i = 0; i < n; i++) {
          const p = P[i], j = i * 3;
          if (t < 0.7) {
            const dx = pos[j] - c[0], dy = pos[j + 1] - c[1];
            p.v.multiplyScalar(damp); p.v.x += -dy * 2.2 * dt; p.v.y += dx * 2.2 * dt;   // 打轉
            pos[j] += p.v.x * dt; pos[j + 1] += p.v.y * dt; pos[j + 2] += p.v.z * dt;
          } else {
            if (!p.mid) p.mid = V3(pos[j], pos[j + 1], pos[j + 2]);
            const u = U.clamp((t - 0.7 - p.delay) / 0.75, 0, 1), e = U.ease.inOutCubic(u), sw = Math.sin(u * Math.PI) * 0.6;
            tmp.lerpVectors(p.mid, T, e);
            pos[j] = tmp.x + Math.cos(u * 8 + p.sp) * sw; pos[j + 1] = tmp.y + Math.sin(u * 8 + p.sp) * sw; pos[j + 2] = tmp.z;
          }
        }
        geo.attributes.position.needsUpdate = true;
        pm.opacity = 0.85 * U.clamp((this.dur - t) / 0.25, 0, 1);
      },
      dispose() { L.scene.remove(pts); L.scene.remove(flash); geo.dispose(); pm.dispose(); flash.material.dispose(); }
    };
  };

  /* 答錯 A：錨沉下來「咚」一聲落地，揚起沙塵（畫面被水流推一下） */
  FX.anchor = (L, zone, o) => {
    const c = W(L, o.x, o.y), top = L.hh + 2.5, land = 0.45;
    const q = inkQuad(R.anchorTex(), 0xffffff); q.scale.setScalar(2.6); q.position.set(c[0], top, 1.2); L.scene.add(q);
    const rope = new THREE.Mesh(R.unit(), basicMat(col('#5f8a8f'), { depthWrite: false })); L.scene.add(rope);
    const N = 70, pos = new Float32Array(N * 3), vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) pos[i * 3 + 1] = -999;
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.PointsMaterial({ size: 0.34, map: R.glow(), color: col('#a8936a'), transparent: true, depthWrite: false, opacity: 0.7 });
    const sand = new THREE.Points(geo, pm); sand.frustumCulled = false; L.scene.add(sand);
    let landed = false;
    return {
      dur: 1.75, weight: 1,
      update(dt, t) {
        let y;
        if (t < land) { const k = U.ease.inCubic(t / land); y = top + (c[1] - top) * k; q.rotation.z = 0.3 * (1 - k); }
        else {
          const lt = t - land; y = c[1] + 0.3 * Math.exp(-lt * 6) * Math.abs(Math.sin(lt * 14)); q.rotation.z = 0.12 * Math.exp(-lt * 3) * Math.sin(lt * 9);
          if (!landed) {
            landed = true; cssPulse(zone.stage, 'sway', 800);
            for (let i = 0; i < N; i++) {
              const j = i * 3; pos[j] = c[0] + U.rand(-0.5, 0.5); pos[j + 1] = c[1] - 1.1; pos[j + 2] = 1.3;
              vel[j] = U.rand(-3.2, 3.2); vel[j + 1] = U.rand(0.4, 2.6); vel[j + 2] = U.rand(-0.5, 0.5);
            }
          }
          const damp = Math.exp(-2.2 * dt);
          for (let i = 0; i < N; i++) { const j = i * 3; vel[j] *= damp; vel[j + 1] = vel[j + 1] * damp - 1.2 * dt; pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt; }
          geo.attributes.position.needsUpdate = true;
        }
        q.position.y = y;
        const ry = y + 1.1, len = Math.max(0.01, top + 4 - ry);   // 錨上方的繩子
        rope.scale.set(0.07, len, 1); rope.position.set(c[0], ry + len / 2, 1.1);
        const a = U.clamp((this.dur - t) / 0.45, 0, 1); q.material.opacity = a; rope.material.opacity = a * 0.8; pm.opacity = 0.7 * a;
      },
      dispose() { L.scene.remove(q); L.scene.remove(rope); L.scene.remove(sand); q.material.dispose(); rope.material.dispose(); geo.dispose(); pm.dispose(); }
    };
  };

  /* 答錯 B：珊瑚紅的氣泡排成 ✕，抖一抖之後往上浮、破掉 */
  FX.bubbleX = (L, zone, o) => {
    cssPulse(zone.stage, 'sway', 800);
    const c = W(L, o.x, o.y), m = 9, items = [];
    for (let d = 0; d < 2; d++) for (let i = 0; i < m; i++) {
      const u = i / (m - 1) - 0.5, q = inkQuad(R.bubbleTex(), col('#ec8a7c'));
      q.userData = { x: c[0] + u * 2.8, y: c[1] + (d ? -u : u) * 2.8, d: (d * m + i) * 0.03, s: U.rand(0.6, 0.85), ph: U.rand(0, 6), pop: U.rand(1.15, 1.6) };
      q.position.set(q.userData.x, q.userData.y, 1.3 + items.length * 0.005); L.scene.add(q); items.push(q);
    }
    return {
      dur: 1.75, weight: 1,
      update(dt, t) {
        for (const q of items) {
          const u = q.userData, lt = t - u.d;
          if (lt < 0) { q.material.opacity = 0; continue; }
          const rise = Math.max(0, t - 0.9), pk = U.clamp((t - u.pop) / 0.12, 0, 1);
          q.position.set(u.x + Math.sin(t * 9 + u.ph) * 0.05 + Math.sin(rise * 4 + u.ph) * 0.2 * rise, u.y + rise * rise * 2.4, q.position.z);
          q.scale.setScalar(Math.max(0.001, u.s * U.ease.outBack(U.clamp(lt / 0.25, 0, 1)) * (1 + 0.5 * pk)));
          q.material.opacity = 0.95 * (1 - pk);
        }
      },
      dispose() { items.forEach(q => { L.scene.remove(q); q.material.dispose(); }); }
    };
  };

  /* 求救 A：鮟鱇魚的小燈從上方垂下來，照亮提示框 */
  FX.lure = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'rise3d', 750);
    const c = W(L, o.x, o.y), pts = [];
    for (let i = 0; i <= 24; i++) { const s = i / 24; pts.push([1.1 * s + 0.35 * Math.sin(s * Math.PI), -2.4 * s * s - 0.2 * s]); }
    const bx = pts[24][0], by = pts[24][1];
    const sg = tube(pts, 0.05, 8), sm = new THREE.MeshLambertMaterial({ color: col('#4a8a90'), emissive: col('#14363b'), transparent: true });
    const stalk = new THREE.Mesh(sg, sm);
    const bulb = glowQuad(col('#dfc06c')); bulb.position.set(bx, by, 0.1); bulb.scale.setScalar(1.7);
    const core = new THREE.Mesh(R._lureCore || (R._lureCore = new THREE.SphereGeometry(0.15, 12, 8)), basicMat(col('#f1e2a6')));
    core.position.set(bx, by, 0.12);
    const cm = basicMat(col('#a8e0d8'), { blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const cone = new THREE.Mesh(R.cone(), cm); cone.scale.set(0.9, 0.5, 0.9); cone.position.set(bx, by - 1.62, -0.5);
    const grp = new THREE.Group(); grp.add(cone, stalk, bulb, core); L.scene.add(grp);
    const gx = c[0] - bx, gy = c[1] + 1.7 - by;
    return {
      dur: 1.4, weight: 0.5,
      update(dt, t) {
        const k = U.ease.outBack(U.clamp(t / 0.45, 0, 1)), a = U.clamp((this.dur - t) / 0.4, 0, 1);
        grp.position.set(gx, gy + (1 - k) * 4, 1); grp.rotation.z = 0.1 * Math.sin(t * 3);
        bulb.material.opacity = (0.55 + 0.15 * Math.sin(t * 12)) * a; core.material.opacity = a; sm.opacity = a;
        cm.opacity = 0.1 * Math.min(1, t / 0.35) * a;
      },
      dispose() { L.scene.remove(grp); sg.dispose(); sm.dispose(); bulb.material.dispose(); core.material.dispose(); cm.dispose(); }
    };
  };

  /* 求救 B：提示框翻面，一圈小氣泡繞著轉 */
  FX.bubbleRing = (L, zone, o) => {
    cssPulse(zone.scr && zone.scr.hint, 'flip3d', 700);
    const c = W(L, o.x, o.y), sp = candySparkles(L, c[0], c[1], 1.7, 34, R.bubbleTex(), SEA);
    return { dur: 1.2, weight: 0.5, update(dt, t) { sp.update(t, U.clamp((this.dur - t) / 0.4, 0, 1)); }, dispose() { sp.dispose(); } };
  };

  /* 總分 A：寶箱打開，金幣噴出來，稱號金幣徽章升起 */
  FX.treasure = (L, zone, o) => {
    const c = W(L, o.x, o.y), edge = L.hh * (L.w / L.h) - 2.3;
    c[0] = Math.min(c[0], edge);
    const wood = new THREE.MeshLambertMaterial({ color: col('#7a4b2a'), emissive: col('#2a160a'), emissiveIntensity: 0.5 });
    const gold = new THREE.MeshLambertMaterial({ color: col('#dfc06c'), emissive: col('#5a4410'), emissiveIntensity: 0.5 });
    const box = R._chestBox || (R._chestBox = new THREE.BoxGeometry(2.4, 1.2, 1.5));
    const lidG = R._chestLid || (R._chestLid = new THREE.BoxGeometry(2.4, 0.5, 1.5));
    const band = R._chestBand || (R._chestBand = new THREE.BoxGeometry(0.22, 1.24, 1.54));
    const lidBand = R._chestLidBand || (R._chestLidBand = new THREE.BoxGeometry(0.22, 0.54, 1.54));
    const lock = R._chestLock || (R._chestLock = new THREE.BoxGeometry(0.34, 0.4, 0.12));
    const chest = new THREE.Group();
    chest.add(new THREE.Mesh(box, wood));
    [-0.8, 0.8].forEach(x => { const b = new THREE.Mesh(band, gold); b.position.x = x; chest.add(b); });
    const lk = new THREE.Mesh(lock, gold); lk.position.set(0, 0.32, 0.8); chest.add(lk);
    const hinge = new THREE.Group(); hinge.position.set(0, 0.6, -0.75); chest.add(hinge);
    const lid = new THREE.Mesh(lidG, wood); lid.position.set(0, 0.25, 0.75); hinge.add(lid);
    [-0.8, 0.8].forEach(x => { const b = new THREE.Mesh(lidBand, gold); b.position.set(x, 0.25, 0.75); hinge.add(b); });
    // 寶箱放在總分畫面下方的空白處（不蓋住分數），徽章從寶箱升到稱號附近
    const base = V3(c[0], Math.max(c[1] - 5.6, -L.hh + 1.7), 0.5);
    chest.position.copy(base); chest.rotation.set(0.28, -0.35, 0); L.scene.add(chest);
    const shine = glowQuad(col('#dfc06c')); shine.position.set(base.x, base.y + 0.9, 1.6); shine.material.opacity = 0; L.scene.add(shine);
    const n = 40, cmat = new THREE.MeshLambertMaterial({ color: col('#e3c46c'), emissive: col('#6a5014'), emissiveIntensity: 0.6, transparent: true });
    const B = Batch(R.coin(), n, cmat), P = [];
    for (let i = 0; i < n; i++) P.push({ p: V3(base.x, base.y + 0.7, 1), v: V3(U.rand(-2.4, 2.4), U.rand(4.5, 7.5), U.rand(-0.5, 1.5)), ax: rndAxis(), ang: 0, w: U.rand(5, 12), d: U.rand(0.7, 1.4) });
    L.scene.add(B.mesh);
    const badge = inkQuad(R.badge(o.tier || 0), 0xffffff); badge.position.set(c[0], base.y, 1.8); L.scene.add(badge);
    return {
      dur: 4.4, weight: 2,
      update(dt, t) {
        const k = U.ease.outBack(U.clamp(t / 0.6, 0, 1)), out = U.clamp((t - 3.7) / 0.7, 0, 1), shrink = 1 - U.ease.inCubic(out);
        chest.scale.setScalar(Math.max(0.001, 0.8 * k * shrink));
        hinge.rotation.x = -1.9 * U.ease.outBack(U.clamp((t - 0.6) / 0.4, 0, 1));
        shine.scale.setScalar(3.2 + 0.3 * Math.sin(t * 5)); shine.material.opacity = 0.45 * U.clamp((t - 0.7) / 0.3, 0, 1) * shrink;
        for (let i = 0; i < n; i++) {
          const p = P[i], lt = t - p.d;
          if (lt < 0) { B.set(i, p.p.x, p.p.y, p.p.z, 1, 0, 0, 0, 0.001); continue; }
          p.v.y -= 9 * dt; p.p.addScaledVector(p.v, dt); p.ang += p.w * dt;
          B.set(i, p.p.x, p.p.y, p.p.z, p.ax.x, p.ax.y, p.ax.z, p.ang, 1.4);
        }
        B.commit(); cmat.opacity = shrink;
        const bk = U.clamp((t - 0.95) / 0.85, 0, 1);
        badge.position.y = base.y + (c[1] - 0.4 - base.y) * U.ease.outCubic(bk);
        badge.scale.setScalar(Math.max(0.001, 3.4 * U.ease.outBack(bk) * shrink));
        badge.rotation.y = (1 - U.ease.outCubic(bk)) * Math.PI * 4 + 0.15 * Math.sin(t * 1.6) * bk;
      },
      dispose() { L.scene.remove(chest); L.scene.remove(shine); L.scene.remove(B.mesh); L.scene.remove(badge); wood.dispose(); gold.dispose(); shine.material.dispose(); B.dispose(); cmat.dispose(); badge.material.dispose(); }
    };
  };

  /* 總分 B：深海冷光煙火（光點升起、綻開，然後像浮游生物一樣慢慢往上飄） */
  FX.glowWorks = (L, zone, o) => {
    const shells = o.shells || 2, per = 200, N = shells * per, aspect = L.w / L.h;
    const pos = new Float32Array(N * 3), colr = new Float32Array(N * 3), vel = new Float32Array(N * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
    const pm = pointsMat(0.28); const pts = new THREE.Points(geo, pm); pts.frustumCulled = false; L.scene.add(pts);
    const S = [];
    for (let s = 0; s < shells; s++) {
      const c1 = col(SEA[(s * 2) % SEA.length]), c2 = col(SEA[(s * 2 + 1) % SEA.length]);
      S.push({ t0: s * 0.55, x: U.rand(-0.55, 0.55) * L.hh * aspect, y: U.rand(0.1, 0.45) * L.hh, burst: false });
      for (let i = 0; i < per; i++) { const j = (s * per + i) * 3, cc = i % 2 ? c1 : c2; pos[j + 1] = -999; colr.set([cc.r, cc.g, cc.b], j); }
    }
    return {
      dur: 1.2 + shells * 0.55 + 1.8, weight: 2,
      update(dt, t) {
        for (let s = 0; s < shells; s++) {
          const sh = S[s], lt = t - sh.t0;
          if (lt < 0) continue;
          if (lt < 0.6) { const j = s * per * 3, k = lt / 0.6; pos[j] = sh.x + Math.sin(lt * 10) * 0.1; pos[j + 1] = -L.hh + (sh.y + L.hh) * U.ease.outCubic(k); pos[j + 2] = 0; continue; }
          if (!sh.burst) {
            sh.burst = true;
            for (let i = 0; i < per; i++) {
              const j = (s * per + i) * 3, u = U.rand(-1, 1), a = U.rand(0, Math.PI * 2), r = Math.sqrt(1 - u * u), sp = U.rand(2.6, 4.2);
              pos[j] = sh.x; pos[j + 1] = sh.y; pos[j + 2] = 0; vel[j] = r * Math.cos(a) * sp; vel[j + 1] = u * sp; vel[j + 2] = r * Math.sin(a) * sp;
            }
          }
          for (let i = 0; i < per; i++) {
            const j = (s * per + i) * 3, damp = Math.exp(-2.2 * dt);
            vel[j] *= damp; vel[j + 1] = vel[j + 1] * damp + 0.7 * dt; vel[j + 2] *= damp;   // 浮力：慢慢往上飄
            pos[j] += vel[j] * dt + Math.sin(t * 2 + i) * 0.25 * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt;
          }
        }
        geo.attributes.position.needsUpdate = true;
        pm.opacity = 0.8 * U.clamp((this.dur - t) / 0.8, 0, 1);
      },
      dispose() { L.scene.remove(pts); geo.dispose(); pm.dispose(); }
    };
  };

  /* CSS 3D 小動畫（幾乎不耗效能） */
  function cssPulse(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }
  F.css = cssPulse;

  /* 每個時機的兩種特效（第一個較重、第二個較輕時，預算不足會改播第二個） */
  const EVENTS = {
    trans: ['cubes', 'tube'],
    correct: ['confetti', 'shards'],
    wrong: ['shatter', 'symbols'],
    help: ['helpFlip', 'helpSpot'],
    result: ['trophy', 'fireworks']
  };
  /* 水墨風格的兩種特效 */
  const EVENTS_INK = {
    trans: ['inkDrop', 'tube'],
    correct: ['petals', 'seal'],
    wrong: ['splash', 'brushX'],
    help: ['scroll', 'hintSeal'],
    result: ['sealResult', 'plum']
  };
  /* 粉彩風格的兩種特效 */
  const EVENTS_PASTEL = {
    trans: ['balloons', 'tube'],
    correct: ['stars', 'bubbles'],
    wrong: ['rainCloud', 'jellyX'],
    help: ['twinkle', 'hearts'],
    result: ['medal', 'candyWorks']
  };
  /* 深海風格的兩種特效 */
  const EVENTS_OCEAN = {
    trans: ['fishSchool', 'tube'],
    correct: ['jellyfish', 'plankton'],
    wrong: ['anchor', 'bubbleX'],
    help: ['lure', 'bubbleRing'],
    result: ['treasure', 'glowWorks']
  };
  const FXSETS = { tech: EVENTS, ink: EVENTS_INK, pastel: EVENTS_PASTEL, ocean: EVENTS_OCEAN };
  const WEIGHT = { cubes: 2, tube: 1, confetti: 2, shards: 2, shatter: 1, symbols: 1, helpFlip: 0.5, helpSpot: 0.5, trophy: 2, fireworks: 2,
    inkDrop: 1, petals: 2, seal: 1, splash: 1, brushX: 1, scroll: 0.5, hintSeal: 0.5, sealResult: 2, plum: 2,
    balloons: 2, stars: 2, bubbles: 1, rainCloud: 1, jellyX: 1, twinkle: 0.5, hearts: 0.5, medal: 2, candyWorks: 2,
    fishSchool: 2, jellyfish: 2, plankton: 1, anchor: 1, bubbleX: 1, lure: 0.5, bubbleRing: 0.5, treasure: 2, glowWorks: 2 };
  const load = () => F.active.reduce((s, e) => s + (e.weight || 1), 0);

  /* 依時機整理出位置資訊 */
  function anchor(zone, ev, o) {
    const s = zone.scr;
    if (ev === 'correct') {
      const c = zonePos(zone, s && s.main), sc = zonePos(zone, zone.hud && zone.hud.score);
      return Object.assign({ x: c.x, y: c.y, tx: sc.x, ty: sc.y }, o);
    }
    if (ev === 'wrong') { const c = zonePos(zone, s && s.main); return Object.assign({ x: c.x, y: c.y, w: c.w || zone.inner.clientWidth * 0.8 }, o); }
    if (ev === 'help') { const c = zonePos(zone, s && s.hint); return Object.assign({ x: c.x, y: c.y }, o); }
    if (ev === 'result') {
      const t = zone.screen && zone.screen.querySelector('.rs-title');
      const c = zonePos(zone, t);
      return Object.assign({ x: zone.inner.clientWidth * 0.82, y: c.y + zone.inner.clientHeight * 0.02 }, o);
    }
    return Object.assign({}, o);
  }

  /* 播放：回傳 true 表示由 3D 處理；false 表示呼叫端應改用一般（2D）特效 */
  F.play = (zone, ev, o, retry) => {
    if (!F.enabled() || !F.init() || F.lost) return false;
    const list = (FXSETS[LG.theme.id] || EVENTS)[ev];
    if (!list) return false;
    const key = zone.idx + ':' + ev;
    let vi = F.last[key] == null ? U.randInt(0, list.length - 1) : (F.last[key] + 1) % list.length;
    if (!F.stressing && load() + WEIGHT[list[vi]] > BUDGET) {
      const lighter = list.findIndex(n => load() + WEIGHT[n] <= BUDGET);
      if (lighter >= 0) vi = lighter;
      else if (!retry) { zone.after(0.3, () => F.play(zone, ev, o, true)); return true; }
      else return false;
    }
    F.last[key] = vi;
    const L = F.layers[zone.idx];
    syncLayer(L, zone);
    let e;
    try { e = FX[list[vi]](L, zone, anchor(zone, ev, o || {})); } catch (err) { console.error(err); return false; }
    e.zone = zone.idx; e.t = 0; e.name = list[vi]; e.weight = WEIGHT[list[vi]];
    F.active.push(e);
    return e.name;   // 回傳特效名稱（真值），讓呼叫端知道播了哪一種
  };

  F.clear = zone => {
    F.active = F.active.filter(e => {
      if (zone && e.zone !== zone.idx) return true;
      try { e.dispose(); } catch (err) { /* ignore */ }
      return false;
    });
  };

  function syncLayer(L, zone) {
    const w = zone.root.clientWidth, h = zone.root.clientHeight;
    if (w !== L.w || h !== L.h) { L.w = w || 1; L.h = h || 1; L.cam.aspect = L.w / L.h; L.cam.updateProjectionMatrix(); }
  }

  /* ---------- 每格畫面（main.js 呼叫） ---------- */
  F.frame = dt => {
    if (!F.ok) return;
    if (!F.active.length) {
      if (F.visible) { F.r.setScissorTest(false); F.r.clear(); F.cv.style.visibility = 'hidden'; F.visible = false; }
      return;
    }
    if (!F.visible) { F.cv.style.visibility = 'visible'; F.visible = true; F.resize(); }
    const zones = LG.game.zones, rc = F.rect;
    F.r.setScissorTest(false);
    F.r.clear();
    F.r.setScissorTest(true);
    let measuring = false;
    for (let i = 0; i < 3; i++) {
      const mine = F.active.filter(e => e.zone === i);
      if (!mine.length) continue;
      const L = F.layers[i], z = zones[i];
      syncLayer(L, z);
      for (const e of mine) {
        e.t += dt;
        if (e.t > 0.4) measuring = true;
        try { e.update(dt, e.t); } catch (err) { console.error(err); e.t = e.dur; }
      }
      const zr = z.root.getBoundingClientRect();
      const x = zr.left - rc.left, y = zr.top - rc.top;
      F.r.setViewport(x, rc.height - y - zr.height, zr.width, zr.height);
      F.r.setScissor(x, rc.height - y - zr.height, zr.width, zr.height);
      F.r.render(L.scene, L.cam);
    }
    F.r.setScissorTest(false);
    F.active = F.active.filter(e => {
      if (e.t < e.dur) return true;
      try { e.dispose(); } catch (err) { /* ignore */ }
      return false;
    });
    monitor(dt, measuring);
  };

  /* ---------- 流暢度偵測與自動降級 ---------- */
  function monitor(dt, measuring) {
    const m = F.mon;
    if (!measuring) return;
    m.frames++; m.time += dt;
    if (m.time >= 1) {
      F.fps = m.frames / m.time;
      if (F.stressing) F.stressLog.push(F.fps);
      m.low = F.fps < LOW_FPS ? m.low + 1 : 0;
      m.frames = 0; m.time = 0;
      if (m.low >= 2 && !F.stressing && LG.settings.data.fx === 'rich') {
        F.degraded = true;
        F.clear();
        LG.settings.set('fx', 'full');
        console.warn('華麗特效：畫面不夠流暢（約 ' + Math.round(F.fps) + ' fps），已自動改回完整特效');
      }
    }
  }

  /* ---------- 壓力測試：三區同時播放最重的特效，量測流暢度 ---------- */
  F.stress = (sec, onDone) => {
    if (!F.init() || F.stressing) return false;
    F.stressing = true; F.forceOn = true; F.stressLog = [];
    F.mon = { frames: 0, time: 0, low: 0 };
    const zones = LG.game.zones, heavy = ['trans', 'correct', 'result'];
    let k = 0;
    const tick = () => {
      if (!F.stressing) return;
      zones.forEach((z, i) => {
        const ev = heavy[(k + i) % heavy.length];
        F.play(z, ev, ev === 'trans' ? { meta: { unit: (k % 10) + 1, curve: ['sin', 'exp', 'poly', 'circle'][k % 4] }, num: k % 9 + 1 } : { tier: 0, shells: 3 });
      });
      k++;
    };
    tick();
    const iv = setInterval(tick, 1300);
    setTimeout(() => {
      clearInterval(iv);
      F.stressing = false; F.forceOn = false;
      F.clear();
      const log = F.stressLog.filter(Boolean);
      const avg = log.length ? log.reduce((a, b) => a + b, 0) / log.length : 0;
      const min = log.length ? Math.min(...log) : 0;
      if (onDone) onDone({ avg, min, ok: avg >= LOW_FPS && min >= 35 });
    }, sec * 1000);
    return true;
  };

  /* ---------- 除錯：網址加 ?fps=1 或 ?debug=1 顯示每秒畫面數 ---------- */
  if (/[?&](fps|debug)=1\b/.test(location.search)) {
    const el = document.createElement('div');
    el.className = 'fps-meter';
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));
    let fr = 0, t0 = performance.now();
    const loop = now => {
      fr++;
      if (now - t0 >= 500) { el.textContent = `${Math.round(fr * 1000 / (now - t0))} fps　3D 特效 ${F.active.length}`; fr = 0; t0 = now; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* 設定變更：特效切換時更新 CSS 3D 開關；離開華麗時清掉 3D */
  F.applySetting = () => {
    const rich = LG.settings.data.fx === 'rich';
    document.body.classList.toggle('fx-rich', rich);
    if (rich) { F.degraded = false; F.mon = { frames: 0, time: 0, low: 0 }; if (F.init()) F.prewarm(); } else if (F.ok) F.clear();
    if (F.ok) F.resize();
  };
})(window.LG);
