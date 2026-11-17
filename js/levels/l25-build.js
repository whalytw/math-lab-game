/* 拖點作圖
   座標圖上有 1～2 個可以拖曳的圓點（會吸附到格子點），圖形會跟著圓點改變；
   把圓點拖到正確位置、畫出題目要的圖形，按「完成！」。
   題庫項目：{ prompt, win, handles: [{ p: [x, y], label }], draw: P => 圖形陣列, check: P => true/false, answer: [[x, y]…], hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L25 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      this.how = '按住圓點拖曳，畫出題目要的圖形';
      const m = scr.main;
      m.classList.add('l25');
      m.innerHTML = '<div class="pt-wrap"><canvas class="pt-cv"></canvas></div>';
      this.wrap = m.querySelector('.pt-wrap');
      this.cv = m.querySelector('.pt-cv');
      this.g = new LG.Graph2D(this.cv, Object.assign({ pad: 0.07, equal: true }, q.win));
      this.P = q.handles.map(h => h.p.slice());
      this.drag = -1;
      LG.input.onDrag(this.cv, {
        down: (e, p) => {
          if (!this.playing || !this.g.view) return false;
          // 選最近的圓點（容許手指偏一點）
          let best = -1, bd = Infinity;
          this.P.forEach((pt, i) => { const d = Math.hypot(this.g.cssX(pt[0]) - p.x, this.g.cssY(pt[1]) - p.y); if (d < bd) { bd = d; best = i; } });
          const lim = Math.max(40, this.g.view.kx / this.g.s * 1.2);
          if (bd > lim) { if (this.P.length === 1) best = 0; else return false; }
          this.drag = best; this.move(p);
        },
        move: (e, p) => this.move(p),
        up: () => { this.drag = -1; this.draw(); }
      });
      this.setGo('完成！', () => this.go());
    }

    move(p) {
      if (this.drag < 0 || !this.playing) return;
      const v = this.g.view, s = this.g.s;
      const x = U.clamp(Math.round(v.x0 + (p.x * s - v.pad) / v.kx), Math.ceil(v.x0), Math.floor(v.x1));
      const y = U.clamp(Math.round(v.y0 + (this.cv.height - v.pad - p.y * s) / v.ky), Math.ceil(v.y0), Math.floor(v.y1));
      const cur = this.P[this.drag];
      if (cur[0] === x && cur[1] === y) return;
      cur[0] = x; cur[1] = y;
      LG.audio.play('tap');
      this.draw();
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.g.resize(r.width, r.height, this.scale());
      this.cv.style.width = r.width + 'px'; this.cv.style.height = r.height + 'px';
      this.draw();
    }

    go() {
      let ok = false;
      try { ok = !!this.q.check(this.P.map(p => p.slice())); } catch (e) { ok = false; }
      const r = this.submit(ok);
      if (r === 'retry') { this.wrap.classList.remove('nope'); void this.wrap.offsetWidth; this.wrap.classList.add('nope'); }
    }

    celebrate() { this.state = 'ok'; this.draw(); const p = this.zone.fx.rel(this.wrap); this.zone.fx.confetti(p.x, p.y, { n: 34 }); }
    reveal() { this.P = this.q.answer.map(p => p.slice()); this.state = 'answer'; this.draw(); }

    draw() {
      const g = this.g;
      if (!g.view) return;
      g.clear();
      const col = this.state ? LG.TC('ok') : (U.UNIT_HEX[this.zone.meta.unit] || LG.TC('fg'));
      let shapes = [];
      try { shapes = this.q.draw(this.P.map(p => p.slice())) || []; } catch (e) { shapes = []; }
      g.shapes(shapes, { color: col, width: 3.4 });
      this.P.forEach((pt, i) => {
        g.dot(pt[0], pt[1], { r: i === this.drag ? 13 : 11, color: LG.TC('warn'), halo: LG.TC('halo'), ring: LG.TC('fg') });
        const lab = this.q.handles[i].label;
        g.text(`${lab ? lab : ''}(${pt[0]},${pt[1]})`.replace(/-/g, '−'), pt[0], pt[1], { color: LG.TC('fg'), dx: 14, dy: -18 });
      });
    }
  }

  L25.meta = { id: 25, name: '拖點作圖', unit: 0, topic: '' };
  LG.registerLevel(L25);
  LG.bank.level('build', L25);
})(window.LG);
