/* 參數調校（滑桿題）
   按 ◀ ▶ 調整參數，讓發光的圖形（函數或向量）和虛線目標完全重合，按「校準！」。
   題庫項目：
   { prompt, win: { xmin, xmax, ymin, ymax, xPi?, equal? },
     params: [{ n: 'a', vals: [...], tex?: [...] }], ans: [索引...], start?: [索引...],
     plot: P => 圖形陣列（P 為各參數目前的值），target?: 圖形陣列（省略時用 plot(正解)）,
     hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L7 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l7');
      m.innerHTML = `<div class="g-wrap"><canvas class="g-cv"></canvas><div class="g-tag tn-leg"><i class="t"></i>目標　<i class="m"></i>你的圖形</div></div><div class="tn-ctrls"></div>`;
      this.wrap = m.querySelector('.g-wrap');
      this.cv = m.querySelector('.g-cv');
      const box = m.querySelector('.tn-ctrls');
      // 起始值：避開正解
      this.idx = (q.start || q.params.map((p, i) => {
        const opts = p.vals.map((v, k) => k).filter(k => k !== q.ans[i]);
        return U.pick(opts);
      })).slice();
      if (this.idx.every((v, i) => v === q.ans[i])) this.idx[0] = (q.ans[0] + 1) % q.params[0].vals.length;
      this.ctrls = q.params.map((p, i) => {
        const el = U.el('div', 'tn-row', `<span class="tn-n">${U.tex(p.n + '=')}</span><div class="tn-b dn">◀</div><div class="tn-v"></div><div class="tn-b up">▶</div>`);
        box.appendChild(el);
        LG.input.onTap(el.querySelector('.dn'), () => this.bump(i, -1), { sound: false, enabled: () => this.playing });
        LG.input.onTap(el.querySelector('.up'), () => this.bump(i, 1), { sound: false, enabled: () => this.playing });
        return el;
      });
      this.graph = new LG.Graph2D(this.cv, Object.assign({}, q.win));
      this.state = 'live';
      this.touched = false;
      this.paintVals();
      this.setGo('校準！', () => this.go());
      this.setGoEnabled(false);
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
      if (!this.playing) return;
      const p = this.q.params[i], k = this.idx[i] + d;
      if (k < 0 || k >= p.vals.length) return;
      this.idx[i] = k;
      this.touched = true;
      LG.audio.play('dial');
      this.ctrls.forEach(c => c.classList.remove('bad'));
      this.paintVals();
      this.setGoEnabled(true);
    }

    layout() {
      const r = this.wrap.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.graph.resize(r.width, r.height, this.scale());
      this.cv.style.width = r.width + 'px';
      this.cv.style.height = r.height + 'px';
    }

    isRight() {
      if (this.q.ok) return this.q.ok(this.vals());
      return this.idx.every((v, i) => v === this.q.ans[i]);
    }

    go() {
      if (!this.touched) return;
      const res = this.submit(this.isRight());
      if (res === 'retry') this.ctrls.forEach(c => c.classList.add('bad'));
    }

    celebrate() {
      this.state = 'ok';
      this.ctrls.forEach(c => c.classList.add('ok'));
      const p = this.zone.fx.rel(this.wrap);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() {
      this.idx = this.q.ans.slice();
      this.paintVals();
      this.state = 'answer';
      this.ctrls.forEach(c => { c.classList.remove('bad'); c.classList.add('answer'); });
    }

    update() {
      const g = this.graph;
      if (!g.view) return;
      g.clear();
      const target = this.q.target || this.q.plot(this.vals(this.q.ans));
      g.shapes(target, { color: LG.TC('fg'), width: 3, dash: [10, 9], alpha: 0.75, glow: false });
      const col = this.state === 'ok' ? LG.TC('ok') : this.state === 'answer' ? LG.TC('warn') : (U.UNIT_HEX[this.zone.meta.unit] || '#fff');
      g.shapes(this.q.plot(this.vals()), { color: col, width: 4 });
    }
  }

  L7.meta = { id: 7, name: '參數調校', unit: 0, topic: '' };
  LG.bank.level('tune', L7);
})(window.LG);
