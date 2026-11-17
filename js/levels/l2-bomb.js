/* 第 2 關｜拆彈小組（單元 5：指數方程式、不等式與應用）
   四條電線各掛一個答案，用手指「劃過」電線把正確那條剪斷。 */
'use strict';
(function (LG) {
  const U = LG.util;


  const WIRE = () => LG.TC('wires');

  const BOMB = `<svg class="bomb-svg" viewBox="0 0 320 128" aria-hidden="true">
    <g class="sticks"><rect x="18" y="16" width="284" height="28" rx="13"/><rect x="18" y="50" width="284" height="28" rx="13"/><rect x="18" y="84" width="284" height="28" rx="13"/></g>
    <rect class="strap" x="50" y="10" width="13" height="108" rx="3"/><rect class="strap" x="257" y="10" width="13" height="108" rx="3"/>
    <rect class="box" x="92" y="18" width="136" height="92" rx="10"/>
    <rect class="screen" x="104" y="31" width="112" height="52" rx="6"/>
    <text class="bt" x="160" y="69" text-anchor="middle">00:45</text>
    <circle class="led" cx="211" cy="97" r="5"/>
    <rect class="grill" x="110" y="92" width="70" height="4" rx="2"/><rect class="grill" x="110" y="99" width="52" height="4" rx="2"/>
  </svg>`;

  const bez = (a, b, c, d, t) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };

  class L2 extends LG.LevelBase {

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l2');
      m.innerHTML = `<div class="bomb">${BOMB}</div>
        <div class="wires"><svg class="w-svg"></svg><canvas class="w-blade"></canvas><div class="w-tags"></div></div>`;
      this.bombEl = m.querySelector('.bomb');
      this.timeTxt = m.querySelector('.bomb .bt');
      this.wiresEl = m.querySelector('.wires');
      this.svg = m.querySelector('.w-svg');
      this.blade = m.querySelector('.w-blade');
      this.bctx = this.blade.getContext('2d');
      this.tagsEl = m.querySelector('.w-tags');
      const order = U.shuffle([0, 1, 2, 3]);
      this.wires = order.map((oi, s) => ({ s, oi, color: WIRE()[s], cut: false, cutX: 0, cutT: 0, droop: 0, state: '' }));
      this.tags = this.wires.map(w => {
        const t = U.el('div', 'w-tag', U.rich(q.opts[w.oi]));
        t.style.setProperty('--wc', w.color);
        this.tagsEl.appendChild(t);
        return t;
      });
      this.bombState = 'live';
      this.trail = [];
      this.how = '手指劃過電線就能剪斷，剪正確的那條';
      this.setGoLabel('<span class="sc">✂</span> 用手指劃過電線來剪斷');
      LG.input.onDrag(this.wiresEl, {
        down: (e, p) => {
          if (!this.playing) return false;
          this.stroke = { flags: this.wires.map(() => ({ a: false, b: false })), done: false };
          this.sid = (this.sid || 0) + 1;
          this.addTrail(p);
        },
        move: (e, p) => this.onMove(p),
        up: () => { this.stroke = null; },
        cancel: () => { this.stroke = null; }
      });
    }

    layout() {
      const r = this.wiresEl.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.W = r.width; this.H = r.height;
      this.svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      const s = Math.min(this.scale(), 2);
      this.bs = s;
      this.blade.width = Math.round(r.width * s);
      this.blade.height = Math.round(r.height * s);
      const xL = r.width * 0.035, xR = r.width * 0.965, sag = r.height * 0.045;
      this.wires.forEach((w, i) => {
        const y = r.height * (0.125 + i * 0.25);
        Object.assign(w, { y, xL, xR, sag });
        w.pts = [];
        for (let k = 0; k <= 48; k++) {
          const t = k / 48;
          w.pts.push([bez(xL, xL + (xR - xL) * 0.3, xR - (xR - xL) * 0.3, xR, t), bez(y, y + sag, y + sag, y, t)]);
        }
        const tag = this.tags[i];
        tag.style.left = (r.width / 2) + 'px';
        tag.style.top = (y + sag * 0.75) + 'px';
      });
      this.renderWires();
      this.tags.forEach(t => U.fit(t, 0.6, true));
    }

    yAt(w, x) {
      const p = w.pts;
      for (let i = 1; i < p.length; i++) {
        if (p[i][0] >= x) {
          const a = p[i - 1], b = p[i], t = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
          return a[1] + (b[1] - a[1]) * t;
        }
      }
      return p[p.length - 1][1];
    }

    cutPieces(w) {
      const gap = this.W * 0.018, d = w.droop, left = [], right = [];
      for (const p of w.pts) {
        if (p[0] < w.cutX - gap) {
          const k = (p[0] - w.xL) / Math.max(1, w.cutX - gap - w.xL);
          left.push([p[0], p[1] + d * k * k]);
        } else if (p[0] > w.cutX + gap) {
          const k = (w.xR - p[0]) / Math.max(1, w.xR - w.cutX - gap);
          right.push([p[0], p[1] + d * k * k]);
        }
      }
      return [left, right].filter(a => a.length > 1);
    }

    renderWires() {
      if (!this.W) return;
      const sw = Math.max(4, this.W * 0.016);
      let html = '';
      for (const w of this.wires) {
        if (!w.pts) continue;
        const pieces = w.cut ? this.cutPieces(w) : [w.pts];
        for (const pc of pieces) {
          const d = 'M' + pc.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
          html += `<path d="${d}" class="w-shadow" stroke-width="${(sw * 1.9).toFixed(1)}"/>`;
          html += `<path d="${d}" class="w-line ${w.state}" stroke="${w.color}" stroke-width="${sw.toFixed(1)}"/>`;
        }
        const th = sw * 2.6;
        html += `<rect class="w-term" x="${(w.xL - th * 0.6).toFixed(1)}" y="${(w.y - th / 2).toFixed(1)}" width="${(th * 0.9).toFixed(1)}" height="${th.toFixed(1)}" rx="3"/>`;
        html += `<rect class="w-term" x="${(w.xR - th * 0.3).toFixed(1)}" y="${(w.y - th / 2).toFixed(1)}" width="${(th * 0.9).toFixed(1)}" height="${th.toFixed(1)}" rx="3"/>`;
      }
      this.svg.innerHTML = html;
    }

    addTrail(p) { this.trail.push({ x: p.x, y: p.y, age: 0, sid: this.sid }); }

    onMove(p) {
      this.addTrail(p);
      const st = this.stroke;
      if (!st || st.done || !this.playing) return;
      const d = Math.max(5, LG.settings.dragPx(this.zone.inner.clientWidth) * 0.8);
      for (let i = 0; i < this.wires.length; i++) {
        const w = this.wires[i];
        if (w.cut || !w.pts || p.x < w.xL || p.x > w.xR) continue;
        const wy = this.yAt(w, p.x), f = st.flags[i];
        if (p.y < wy - d) f.a = true;
        if (p.y > wy + d) f.b = true;
        if (f.a && f.b) { st.done = true; this.cut(w, p.x); break; }
      }
    }

    cut(w, x) {
      w.cut = true; w.cutX = x; w.cutT = 0;
      LG.audio.play('cut');
      const o = this.zoff(this.wiresEl);
      this.zone.fx.burst(o.x + x, o.y + this.yAt(w, x), { n: 22, colors: ['#fff6c0', '#ffd34d', w.color], speed: [120, 380], gravity: 700 });
      this.lastCut = w;
      const r = this.submit(w.oi === 0);
      if (r === 'retry') {
        w.state = 'bad';
        this.tags[w.s].classList.add('bad');
        this.bombEl.classList.remove('angry'); void this.bombEl.offsetWidth; this.bombEl.classList.add('angry');
      }
      this.renderWires();
    }

    setBomb(state) {
      this.bombState = state;
      this.bombEl.classList.add(state);
      this.timeTxt.textContent = state === 'safe' ? 'SAFE' : 'BOOM';
    }

    celebrate() {
      if (!this.lastCut) { const w0 = this.wires.find(x => x.oi === 0); w0.cut = true; w0.cutX = (w0.xL + w0.xR) / 2 || 0; this.lastCut = w0; }
      const w = this.lastCut;
      w.state = 'ok';
      this.tags[w.s].classList.add('ok');
      this.tags.forEach((t, i) => { if (i !== w.s) t.classList.add('dim'); });
      this.setBomb('safe');
      const p = this.zone.fx.rel(this.bombEl);
      this.zone.fx.confetti(p.x, p.y, { n: 40 });
      this.renderWires();
    }

    reveal() {
      if (this.lastCut && this.lastCut.oi !== 0 && this.lastCut.state !== 'bad') {
        this.lastCut.state = 'bad';
        this.tags[this.lastCut.s].classList.add('bad');
      }
      this.setBomb('boom');
      LG.audio.play('boom');
      const right = this.wires.find(w => w.oi === 0);
      right.state = 'answer';
      this.tags[right.s].classList.add('answer');
      const p = this.zone.fx.rel(this.bombEl);
      this.zone.fx.burst(p.x, p.y, { n: 36, colors: ['#ff8f73', '#ffd34d', '#ffffff'], speed: [200, 560], gravity: 300, size: [4, 10] });
      this.renderWires();
    }

    update(dt) {
      if (this.bombState === 'live') {
        const t = Math.max(0, Math.ceil(this.zone.timeLeft - 1e-6));
        if (t !== this.lastT) {
          this.lastT = t;
          this.timeTxt.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
          this.bombEl.classList.toggle('hurry', t <= 10 && this.playing);
        }
      }
      let anim = false;
      for (const w of this.wires) {
        if (w.cut && w.cutT < 1) {
          w.cutT = Math.min(1, w.cutT + dt / 0.55);
          w.droop = this.H * 0.17 * U.ease.outBack(w.cutT);
          anim = true;
        }
      }
      if (anim) this.renderWires();
      this.drawTrail(dt);
    }

    drawTrail(dt) {
      const g = this.bctx;
      if (!this.trail.length) {
        if (this.trailDirty) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.blade.width, this.blade.height); this.trailDirty = false; }
        return;
      }
      for (const p of this.trail) p.age += dt;
      while (this.trail.length && this.trail[0].age > 0.22) this.trail.shift();
      const s = this.bs || 1;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, this.blade.width, this.blade.height);
      g.setTransform(s, 0, 0, s, 0, 0);
      g.lineCap = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1], b = this.trail[i];
        if (a.sid !== b.sid) continue;
        const k = 1 - b.age / 0.22;
        g.strokeStyle = `rgba(${LG.TC('trail')}, ${(0.9 * k).toFixed(3)})`;
        g.lineWidth = Math.max(2, this.W * 0.012 * k);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      this.trailDirty = true;
    }
  }

  L2.meta = { id: 2, name: '拆彈小組', unit: 5, topic: '指數方程式與不等式' };
  LG.registerLevel(L2);
  LG.bank.level('mc', L2);
})(window.LG);
