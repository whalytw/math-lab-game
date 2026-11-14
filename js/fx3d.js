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
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x203048, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 2.2);
    dl.position.set(4, 6, 10);
    scene.add(dl);
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
    const pos = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const a = i / segs * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      for (const [r, y] of pts) pos.push(r * c, y, r * s);
    }
    const n = pts.length;
    for (let i = 0; i < segs; i++) for (let j = 0; j < n - 1; j++) {
      const a = i * n + j, b = (i + 1) * n + j;
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
    const mat = stdMat(uc, { emissive: uc, emissiveIntensity: 0.65, roughness: 0.3, metalness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    const grp = new THREE.Group(); grp.add(mesh);
    const head = glowQuad(0xffffff);
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
    const mat = stdMat(col(tierCol), { side: DS(), transparent: false, emissive: col(tierCol), emissiveIntensity: 0.22 });
    const baseMat = stdMat(col('#3b2f22'), { transparent: false, emissive: col('#1a120a'), emissiveIntensity: 0.3 });
    const cup = new THREE.Mesh(R.trophy(), mat);
    const hl = new THREE.Mesh(R.handle(), mat), hr = new THREE.Mesh(R.handle(), mat);
    hr.scale.x = -1;
    const plinth = new THREE.Mesh(R.plinth(), baseMat); plinth.position.y = -1.85;
    const c = W(L, o.x, o.y);
    const grp = new THREE.Group(); grp.add(cup, hl, hr, plinth); grp.position.set(c[0], c[1], 1); L.scene.add(grp);
    const cm = basicMat(0xfff1c0, { blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const cone = new THREE.Mesh(R.cone(), cm); cone.position.set(c[0], c[1] + 3.6, 0); L.scene.add(cone);
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
  const WEIGHT = { cubes: 2, tube: 1, confetti: 2, shards: 2, shatter: 1, symbols: 1, helpFlip: 0.5, helpSpot: 0.5, trophy: 2, fireworks: 2 };
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
    const list = EVENTS[ev];
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
