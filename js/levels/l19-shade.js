/* 數線塗色
   數線上標好了分界點；點區段可以塗色或取消，點分界點可以切換「實心（包含）／空心（不包含）」，
   塗出不等式（或定義域、遞增區間…）的解，按「完成！」。分界點之間等距畫出，旁邊標上真正的值。
   題庫項目：{ prompt, pts, ptsTex, segs（每一段是否塗色，含兩端射線，共 pts.length + 1 段）, dots（每個分界點是否包含）, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L19 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.setQuestion(U.rich(q.prompt));
      this.how = '點區段塗色；點分界點切換實心／空心';
      const m = scr.main;
      m.classList.add('l19');
      m.innerHTML = '<div class="sh-wrap"><canvas class="sh-cv"></canvas><div class="sh-labels"></div></div><div class="sh-leg"><span><i class="f"></i>實心：包含</span><span><i class="h"></i>空心：不包含</span></div>';
      this.wrap = m.querySelector('.sh-wrap');
      this.cv = m.querySelector('.sh-cv');
      this.labels = m.querySelector('.sh-labels');
      this.n = q.pts.length;
      this.segs = new Array(this.n + 1).fill(false);
      this.dots = new Array(this.n).fill(false);
      this.labelEls = q.ptsTex.map(t => { const el = U.el('div', 'sh-lab', U.tex(t)); this.labels.appendChild(el); return el; });
      LG.input.onDrag(this.cv, { down: (e, p) => { if (!this.playing) return false; this.tap(p); }, move: () => {}, up: () => {} });
      this.setGo('完成！', () => this.go());
    }

    /* 第 i 個分界點的 x 位置（等距） */
    PX(i) { return this.W * (0.5 + (i - (this.n - 1) / 2) * Math.min(0.26, 0.78 / Math.max(1, this.n))); }

    tap(p) {
      if (!this.W) return;
      const y = this.H * 0.45, r = Math.max(22, this.W * 0.05);
      for (let i = 0; i < this.n; i++) {
        if (Math.hypot(p.x - this.PX(i), p.y - y) <= r) { this.dots[i] = !this.dots[i]; LG.audio.play('tap'); this.draw(); return; }
      }
      // 哪一段
      let k = 0;
      while (k < this.n && p.x > this.PX(k)) k++;
      this.segs[k] = !this.segs[k];
      LG.audio.play('select');
      this.draw();
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const s = this.scale();
      this.W = r.width; this.H = r.height; this.s = s;
      this.cv.width = Math.round(r.width * s); this.cv.height = Math.round(r.height * s);
      this.cv.style.width = r.width + 'px'; this.cv.style.height = r.height + 'px';
      this.labelEls.forEach((el, i) => { el.style.left = this.PX(i) + 'px'; el.style.top = (this.H * 0.45 + Math.max(30, this.H * 0.16)) + 'px'; });
      this.draw();
    }

    go() {
      const ok = this.segs.every((v, i) => v === this.q.segs[i]) && this.dots.every((v, i) => v === this.q.dots[i]);
      const r = this.submit(ok);
      if (r === 'retry') { this.wrap.classList.remove('nope'); void this.wrap.offsetWidth; this.wrap.classList.add('nope'); }
    }

    celebrate() { this.state = 'ok'; this.draw(); const p = this.zone.fx.rel(this.wrap); this.zone.fx.confetti(p.x, p.y, { n: 34 }); }
    reveal() { this.segs = this.q.segs.slice(); this.dots = this.q.dots.slice(); this.state = 'answer'; this.draw(); }

    draw() {
      if (!this.W) return;
      const g = this.cv.getContext('2d'), s = this.s, y = this.H * 0.45, W = this.W;
      g.setTransform(s, 0, 0, s, 0, 0);
      g.clearRect(0, 0, W, this.H);
      const col = this.state === 'ok' || this.state === 'answer' ? LG.TC('ok') : (U.UNIT_HEX[this.zone.meta.unit] || LG.TC('warn'));
      const x0 = W * 0.04, x1 = W * 0.96, bw = Math.max(10, this.H * 0.07);
      // 可以點的區段：淡淡的底色提示
      for (let k = 0; k <= this.n; k++) {
        const a = k === 0 ? x0 : this.PX(k - 1), b = k === this.n ? x1 : this.PX(k);
        g.fillStyle = LG.TC('grid'); g.fillRect(a + 4, y - bw * 1.6, b - a - 8, bw * 3.2);
        if (this.segs[k]) {
          g.fillStyle = col; g.globalAlpha = 0.9;
          g.fillRect(a, y - bw / 2, b - a, bw);
          g.globalAlpha = 1;
          // 射線的箭頭
          if (k === 0 || k === this.n) {
            const tip = k === 0 ? x0 - bw * 0.9 : x1 + bw * 0.9, base = k === 0 ? x0 : x1;
            g.beginPath(); g.moveTo(tip, y); g.lineTo(base, y - bw); g.lineTo(base, y + bw); g.closePath(); g.fill();
          }
        }
      }
      // 數線
      g.strokeStyle = LG.TC('axis'); g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(x0 - bw, y); g.lineTo(x1 + bw, y); g.stroke();
      // 分界點
      const r = Math.max(9, Math.min(16, W * 0.03));
      for (let i = 0; i < this.n; i++) {
        const X = this.PX(i);
        g.lineWidth = 3.5; g.strokeStyle = this.dots[i] ? col : LG.TC('fg');
        g.fillStyle = this.dots[i] ? col : LG.TC('panel');
        g.beginPath(); g.arc(X, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
      }
    }
  }

  L19.meta = { id: 19, name: '數線塗色', unit: 0, topic: '' };
  LG.registerLevel(L19);
  LG.bank.level('shade', L19);
})(window.LG);
