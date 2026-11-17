/* 估算飛鏢
   在數線上把飛鏢標記移到「估計的位置」，按「射出飛鏢！」；和真正的值相差在 ±tol 以內就算對。
   題庫項目：{ prompt, tex（要估計的數）, v（真正的值）, lo, hi（數線範圍）, tol, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  /* 數線刻度：約 8～12 格的「好看」間距 */
  const niceStep = span => { const raw = span / 10, p = Math.pow(10, Math.floor(Math.log10(raw))); return [1, 2, 5, 10].map(k => k * p).find(s => s >= raw) || p * 10; };
  const fmt = (x, st) => { const d = Math.max(0, -Math.floor(Math.log10(st) + 1e-9)) + (st < 1 && String(st).includes('5') ? 1 : 0); return (+x.toFixed(d)).toString().replace('-', '−'); };

  class L18 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.setQuestion(U.rich(q.prompt) + `<span class="l3-prog">誤差在 ±${q.tol} 以內就算對</span>${q.tex.length > 1 ? `<div class="es-big">${U.tex(q.tex)}</div>` : ''}`);
      this.how = '點數線（可拖曳）移動飛鏢，再按「射出」';
      const m = scr.main;
      m.classList.add('l18');
      m.innerHTML = '<div class="es-wrap"><canvas class="es-cv"></canvas><div class="es-read"></div></div>';
      this.wrap = m.querySelector('.es-wrap');
      this.cv = m.querySelector('.es-cv');
      this.read = m.querySelector('.es-read');
      this.step = niceStep(q.hi - q.lo);
      this.x = null;
      this.misses = [];
      LG.input.onDrag(this.cv, {
        down: (e, p) => { if (!this.playing) return false; this.put(p); },
        move: (e, p) => this.put(p),
        up: () => {}
      });
      this.setGo('射出飛鏢！', () => this.go());
      this.setGoEnabled(false);
    }

    X(v) { return this.pad + (v - this.q.lo) / (this.q.hi - this.q.lo) * (this.W - 2 * this.pad); }

    put(p) {
      if (!this.playing || !this.W) return;
      const q = this.q, raw = q.lo + (p.x - this.pad) / (this.W - 2 * this.pad) * (q.hi - q.lo);
      const fine = this.step / 10;
      this.x = U.clamp(Math.round(raw / fine) * fine, q.lo, q.hi);
      this.setGoEnabled(true);
      this.draw();
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const s = this.scale();
      this.W = r.width; this.H = r.height; this.s = s; this.pad = r.width * 0.06;
      this.cv.width = Math.round(r.width * s); this.cv.height = Math.round(r.height * s);
      this.cv.style.width = r.width + 'px'; this.cv.style.height = r.height + 'px';
      this.draw();
    }

    go() {
      if (this.x == null) return;
      const ok = Math.abs(this.x - this.q.v) <= this.q.tol + 1e-9;
      this.last = this.x;
      const r = this.submit(ok);
      if (r === 'retry') {
        this.misses.push(this.x);
        this.read.innerHTML = `<b>${this.x < this.q.v ? '太小了，再往右' : '太大了，再往左'}</b>`;
        this.read.className = 'es-read show bad';
      }
    }

    celebrate() { this.state = 'ok'; this.draw(); const p = this.zone.fx.rel(this.wrap); this.zone.fx.confetti(p.x, p.y, { n: 34 }); }
    reveal(reason) { if (reason !== 'timeout' && this.last != null && !this.misses.includes(this.last)) this.misses.push(this.last); this.state = 'answer'; this.draw(); }

    draw() {
      if (!this.W) return;
      const g = this.cv.getContext('2d'), s = this.s, q = this.q, st = this.step, y = this.H * 0.62;
      g.setTransform(s, 0, 0, s, 0, 0);
      g.clearRect(0, 0, this.W, this.H);
      const uc = U.UNIT_HEX[this.zone.meta.unit] || LG.TC('fg');
      // 數線
      g.strokeStyle = LG.TC('axis'); g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(this.pad * 0.5, y); g.lineTo(this.W - this.pad * 0.5, y); g.stroke();
      const fs = Math.max(12, Math.min(this.W * 0.045, this.H * 0.12));
      g.font = `600 ${fs}px "Barlow Condensed", "Arial Narrow", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'top';
      for (let v = Math.ceil(q.lo / st - 1e-9) * st; v <= q.hi + 1e-9; v += st) {
        const X = this.X(v);
        g.strokeStyle = LG.TC('axis'); g.lineWidth = 2.5; g.beginPath(); g.moveTo(X, y - 10); g.lineTo(X, y + 10); g.stroke();
        g.fillStyle = LG.TC('tick'); g.fillText(fmt(v, st), X, y + 16);
        // 細刻度
        for (let k = 1; k < 10; k++) { const xv = v + st * k / 10; if (xv > q.hi) break; const X2 = this.X(xv); g.strokeStyle = LG.TC('grid'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X2, y - (k === 5 ? 7 : 4)); g.lineTo(X2, y + (k === 5 ? 7 : 4)); g.stroke(); }
      }
      // 射偏的飛鏢
      for (const mx of this.misses) { const X = this.X(mx); g.strokeStyle = LG.TC('bad'); g.lineWidth = 3; g.beginPath(); g.moveTo(X - 8, y - 38); g.lineTo(X + 8, y - 22); g.moveTo(X + 8, y - 38); g.lineTo(X - 8, y - 22); g.stroke(); }
      // 正解範圍與位置
      if (this.state) {
        const a = this.X(q.v - q.tol), b = this.X(q.v + q.tol);
        g.fillStyle = LG.TC('ok'); g.globalAlpha = 0.25; g.fillRect(a, y - 14, b - a, 28); g.globalAlpha = 1;
        g.fillStyle = LG.TC('ok'); g.beginPath(); g.arc(this.X(q.v), y, 7, 0, Math.PI * 2); g.fill();
      }
      // 飛鏢標記
      if (this.x != null && this.state !== 'answer') {
        const X = this.X(this.x), col = this.state === 'ok' ? LG.TC('ok') : uc;
        g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 3;
        g.beginPath(); g.moveTo(X, y - 4); g.lineTo(X - 11, y - 30); g.lineTo(X + 11, y - 30); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(X, y - 30); g.lineTo(X, y - 58); g.stroke();
        this.read.className = 'es-read show';
        this.read.style.left = U.clamp(X, 50, this.W - 50) + 'px';
        this.read.style.top = (y - 84) + 'px';
        this.read.textContent = fmt(this.x, st / 10);
      } else if (this.state === 'answer') {
        this.read.className = 'es-read show ok';
        this.read.style.left = U.clamp(this.X(q.v), 60, this.W - 60) + 'px';
        this.read.style.top = (y - 84) + 'px';
        this.read.innerHTML = U.tex(q.tex.replace(/\\dfrac/g, '\\frac') + '\\approx' + (+q.v.toFixed(3)));
      }
    }
  }

  L18.meta = { id: 18, name: '估算飛鏢', unit: 0, topic: '' };
  LG.registerLevel(L18);
  LG.bank.level('estimate', L18);
})(window.LG);
