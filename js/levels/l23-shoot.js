/* 投籃瞄準
   球放在起點，籃框在另一個點；按 ◀ ▶ 調整參數（斜率、係數…），算好之後按「投籃！」，
   球會沿著這個參數的圖形飛出去，通過籃框就進球。投偏算答錯一次（會留下一條淡淡的軌跡）。
   題庫項目：{ prompt, win, start: [x, y], hoop: [x, y], params: [{ n, vals, tex? }], ans: [索引…],
             path: P => (x => y)（球的軌跡）, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L23 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.4;
      this.setQuestion(U.rich(q.prompt));
      this.how = '按 ◀ ▶ 調整參數，再按「投籃！」';
      const m = scr.main;
      m.classList.add('l7', 'l23');
      m.innerHTML = '<div class="g-wrap"><canvas class="g-cv"></canvas></div><div class="tn-ctrls"></div>';
      this.wrap = m.querySelector('.g-wrap');
      this.cv = m.querySelector('.g-cv');
      const box = m.querySelector('.tn-ctrls');
      this.idx = q.params.map((p, i) => U.pick(p.vals.map((v, k) => k).filter(k => k !== q.ans[i])));
      this.ctrls = q.params.map((p, i) => {
        const el = U.el('div', 'tn-row', `<span class="tn-n">${U.tex(p.n + '=')}</span><div class="tn-b dn">◀</div><div class="tn-v"></div><div class="tn-b up">▶</div>`);
        box.appendChild(el);
        LG.input.onTap(el.querySelector('.dn'), () => this.bump(i, -1), { sound: false, enabled: () => this.playing && !this.flying });
        LG.input.onTap(el.querySelector('.up'), () => this.bump(i, 1), { sound: false, enabled: () => this.playing && !this.flying });
        return el;
      });
      this.g = new LG.Graph2D(this.cv, Object.assign({ equal: true }, q.win));
      this.trails = [];
      this.paintVals();
      this.setGo('投籃！', () => this.go());
    }

    vals(idx) { return this.q.params.map((p, i) => p.vals[(idx || this.idx)[i]]); }

    paintVals() {
      this.ctrls.forEach((el, i) => {
        const p = this.q.params[i], k = this.idx[i];
        el.querySelector('.tn-v').innerHTML = U.tex(p.tex ? p.tex[k] : String(p.vals[k]));
        el.querySelector('.dn').classList.toggle('disabled', k <= 0);
        el.querySelector('.up').classList.toggle('disabled', k >= p.vals.length - 1);
      });
    }

    bump(i, d) {
      const p = this.q.params[i], k = this.idx[i] + d;
      if (k < 0 || k >= p.vals.length) return;
      this.idx[i] = k; LG.audio.play('dial'); this.paintVals();
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.g.resize(r.width, r.height, this.scale());
      this.cv.style.width = r.width + 'px'; this.cv.style.height = r.height + 'px';
    }

    /* 球的飛行：從起點的 x 走到籃框之後一點點 */
    go() {
      if (this.flying) return;
      const f = this.q.path(this.vals()), [sx] = this.q.start, [hx, hy] = this.q.hoop;
      const ok = this.idx.every((v, i) => v === this.q.ans[i]) || Math.abs(f(hx) - hy) < 1e-6;
      const end = hx + (hx - sx) * 0.25;
      this.flying = { f, t: 0, sx, end, ok };
      LG.audio.play('select');
    }

    update(dt) {
      const fl = this.flying;
      if (fl) {
        fl.t += dt / 0.9;
        if (fl.t >= 1) {
          this.flying = null;
          this.trails.push({ f: fl.f, sx: fl.sx, end: fl.end, ok: fl.ok });
          if (this.playing) this.submit(fl.ok);
        }
      }
      this.draw();
    }

    celebrate() { this.state = 'ok'; const p = this.zone.fx.rel(this.wrap); this.zone.fx.confetti(p.x, p.y, { n: 36 }); }
    reveal() { this.idx = this.q.ans.slice(); this.paintVals(); this.state = 'answer'; this.trails.push({ f: this.q.path(this.vals()), sx: this.q.start[0], end: this.q.hoop[0], ok: true, ans: true }); }

    draw() {
      const g = this.g;
      if (!g.view) return;
      g.clear();
      const uc = U.UNIT_HEX[this.zone.meta.unit] || LG.TC('fg');
      if (this.q.bg) g.shapes(this.q.bg, { color: LG.TC('fg'), width: 2.4, alpha: 0.55, glow: false });   // 背景圖形（例如切線題的拋物線）
      const seg = (f, a, b) => { const pts = []; for (let i = 0; i <= 120; i++) { const x = a + (b - a) * i / 120; pts.push([x, f(x)]); } return pts; };
      for (const tr of this.trails) g.polyline(seg(tr.f, tr.sx, tr.end), { color: tr.ok ? LG.TC('ok') : LG.TC('bad'), width: 2.4, dash: tr.ans ? null : [8, 7], alpha: 0.7, glow: false });
      // 籃框
      const [hx, hy] = this.q.hoop, c = g.ctx, s = g.s, X = g.X(hx), Y = g.Y(hy), rw = Math.max(16, g.view.kx * 0.42);
      c.save(); c.strokeStyle = LG.TC('bad'); c.lineWidth = 4 * s; c.beginPath(); c.ellipse(X, Y, rw, rw * 0.32, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = LG.TC('fg'); c.globalAlpha = 0.5; c.lineWidth = 1.5 * s;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(X + k * rw * 0.4, Y + rw * 0.25); c.lineTo(X + k * rw * 0.25, Y + rw * 1.1); c.stroke(); }
      c.restore();
      // 球
      let bx = this.q.start[0], by = this.q.start[1];
      if (this.flying) { const fl = this.flying; bx = fl.sx + (fl.end - fl.sx) * fl.t; by = fl.f(bx); g.polyline(seg(fl.f, fl.sx, bx), { color: uc, width: 2.6, alpha: 0.8, glow: false }); }
      g.dot(bx, by, { r: 11, color: '#f08a3c', ring: LG.TC('fg') });
      g.dot(this.q.start[0], this.q.start[1], { r: 4, color: LG.TC('fg'), alpha: 0.6 });
      if (this.state === 'answer' || this.state === 'ok') g.text('進球！', hx, hy, { color: LG.TC('ok'), dy: -24, align: 'center' });
    }
  }

  L23.meta = { id: 23, name: '投籃瞄準', unit: 0, topic: '' };
  LG.registerLevel(L23);
  LG.bank.level('shoot', L23);
})(window.LG);
