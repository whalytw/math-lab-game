/* 座標尋寶
   座標平面上畫著題目的圖形，點一下（或拖曳）放下標記，標記會吸附到最近的格子點，按「標記！」確認。
   題庫項目：{ prompt, win: { xmin, xmax, ymin, ymax }, shapes（graph2d 的圖形陣列，可省略）,
             ans: [x, y]（整數）, ansTex: '(2,-3)', after（答完才畫的圖形，可省略）, hint, explain }
   一維數線題：win 的 ymin、ymax 設成 -1、1，加上 line1d: true（只能點在 x 軸上）。 */
'use strict';
(function (LG) {
  const U = LG.util;

  class L11 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l11');
      m.innerHTML = '<div class="pt-wrap"><canvas class="pt-cv"></canvas><div class="pt-tag"></div></div>';
      this.wrap = m.querySelector('.pt-wrap');
      this.cv = m.querySelector('.pt-cv');
      this.tag = m.querySelector('.pt-tag');
      this.g = new LG.Graph2D(this.cv, Object.assign({ pad: 0.07, equal: !q.line1d }, q.win));
      this.mark = null;      // 目前的標記 [x, y]
      this.misses = [];      // 答錯過的點
      this.state = '';
      LG.input.onDrag(this.cv, {
        down: (e, p) => { if (!this.playing) return false; this.put(p); },
        move: (e, p) => this.put(p),
        up: () => {}
      });
      this.setGo('標記！', () => this.go());
      this.setGoEnabled(false);
    }

    /* 觸控位置（canvas CSS px）→ 最近的格子點 */
    put(p) {
      if (!this.playing || !this.g.view) return;
      const v = this.g.view, s = this.g.s;
      let x = Math.round(v.x0 + (p.x * s - v.pad) / v.kx);
      let y = this.q.line1d ? 0 : Math.round(v.y0 + (this.cv.height - v.pad - p.y * s) / v.ky);
      x = U.clamp(x, Math.ceil(v.x0), Math.floor(v.x1));
      y = U.clamp(y, Math.ceil(v.y0), Math.floor(v.y1));
      if (this.mark && this.mark[0] === x && this.mark[1] === y) return;
      this.mark = [x, y];
      LG.audio.play('tap');
      this.setGoEnabled(true);
      this.draw();
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.g.resize(r.width, r.height, this.scale());
      this.cv.style.width = r.width + 'px';
      this.cv.style.height = r.height + 'px';
      this.draw();
    }

    fmt(p) { return this.q.line1d ? String(p[0]).replace('-', '−') : `(${p[0]}, ${p[1]})`.replace(/-/g, '−'); }

    go() {
      if (!this.mark) return;
      const ok = this.mark[0] === this.q.ans[0] && this.mark[1] === this.q.ans[1];
      this.last = this.mark;
      const r = this.submit(ok);
      if (r === 'retry') {
        this.misses.push(this.mark);
        this.mark = null;
        this.setGoEnabled(false);
        this.draw();
      }
    }

    celebrate() {
      this.state = 'ok';
      this.draw();
      const p = this.zone.fx.rel(this.wrap), r = this.wrap.getBoundingClientRect(), z = this.zone.inner.getBoundingClientRect();
      const x = r.left - z.left + this.g.cssX(this.q.ans[0]), y = r.top - z.top + this.g.cssY(this.q.ans[1]);
      this.zone.fx.confetti(x || p.x, y || p.y, { n: 34 });
    }

    reveal(reason) {
      if (reason !== 'timeout' && this.last) this.misses.push(this.last);
      this.state = 'answer';
      this.mark = null;
      this.draw();
    }

    update(dt) {
      // 正解的點閃爍
      if (this.state === 'answer') { this.blink = (this.blink || 0) + dt; this.draw(); }
    }

    draw() {
      const g = this.g;
      if (!g.view) return;
      g.clear();
      const uc = U.UNIT_HEX[this.zone.meta.unit] || LG.TC('fg');
      g.shapes(this.q.shapes || [], { color: uc, width: 3.2 });
      // after：答對或公布答案後才畫出的圖形（例如題目只給方程式，答完再畫出圖形對照）
      if ((this.state === 'ok' || this.state === 'answer') && this.q.after) g.shapes(this.q.after, { color: uc, width: 3, alpha: 0.85 });
      for (const m of this.misses) {
        const X = g.X(m[0]), Y = g.Y(m[1]), k = 9 * g.s, c = g.ctx;
        c.save(); c.strokeStyle = LG.TC('bad'); c.lineWidth = 3.5 * g.s; c.lineCap = 'round';
        c.beginPath(); c.moveTo(X - k, Y - k); c.lineTo(X + k, Y + k); c.moveTo(X + k, Y - k); c.lineTo(X - k, Y + k); c.stroke(); c.restore();
      }
      let at = null, col = LG.TC('warn');
      if (this.state === 'ok') { at = this.q.ans; col = LG.TC('ok'); }
      else if (this.state === 'answer') { at = this.q.ans; col = LG.TC('ok'); }
      else if (this.mark) at = this.mark;
      if (at) {
        const pulse = this.state === 'answer' ? 0.6 + 0.4 * Math.sin((this.blink || 0) * 8) : 1;
        // 十字準線
        g.line(at[0], g.view.y0, at[0], g.view.y1, { color: col, width: 1.4, alpha: 0.45, dash: [6, 6], glow: false });
        if (!this.q.line1d) g.line(g.view.x0, at[1], g.view.x1, at[1], { color: col, width: 1.4, alpha: 0.45, dash: [6, 6], glow: false });
        g.dot(at[0], at[1], { r: 9, color: col, halo: LG.TC('halo'), ring: LG.TC('fg'), alpha: pulse });
        this.tag.innerHTML = this.state === 'answer' || this.state === 'ok' ? U.tex(this.q.ansTex || this.fmt(at)) : this.fmt(at);
        this.tag.className = 'pt-tag show ' + this.state;
        const tx = g.cssX(at[0]), ty = g.cssY(at[1]), W = this.wrap.clientWidth;
        this.tag.style.left = U.clamp(tx, 40, W - 40) + 'px';
        this.tag.style.top = (ty < 46 ? ty + 30 : ty - 30) + 'px';
      } else {
        this.tag.className = 'pt-tag';
      }
    }
  }

  L11.meta = { id: 11, name: '座標尋寶', unit: 0, topic: '' };
  LG.registerLevel(L11);
  LG.bank.level('point', L11);
})(window.LG);
