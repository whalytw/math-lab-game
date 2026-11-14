/* 圖形偵探（圖形判讀）
   三張座標圖卡片，選出符合題目的那一張，按「鎖定！」。
   題庫項目：{ prompt, win: { xmin, xmax, ymin, ymax, xPi?, equal? },
             opts: [正解圖形陣列, 干擾, 干擾], hint, explain }
   （圖形陣列的格式見 graph2d.js 的 shapes） */
'use strict';
(function (LG) {
  const U = LG.util;
  const LETTER = ['A', 'B', 'C'];

  class L8 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l8');
      this.order = U.shuffle(q.opts.map((o, i) => i));
      this.cards = this.order.map((oi, s) => {
        const el = U.el('div', 'opt gcard', `<canvas class="g-cv"></canvas><span class="gc-l">${LETTER[s]}</span>`);
        m.appendChild(el);
        LG.input.onTap(el, () => this.select(s), { sound: false, enabled: () => this.playing });
        const cv = el.querySelector('canvas');
        return { el, cv, oi, g: new LG.Graph2D(cv, Object.assign({ pad: 0.06 }, q.win)), state: '' };
      });
      this.sel = -1;
      this.setGo('鎖定！', () => this.go());
      this.setGoEnabled(false);
    }

    select(s) {
      if (!this.playing || this.cards[s].el.classList.contains('bad')) return;
      this.sel = s;
      LG.audio.play('select');
      this.cards.forEach((c, i) => c.el.classList.toggle('on', i === s));
      this.setGoEnabled(true);
    }

    layout() {
      for (const c of this.cards) {
        const r = c.el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const w = r.width * 0.97, h = r.height * 0.94;
        c.g.resize(w, h, this.scale());
        c.cv.style.width = w + 'px';
        c.cv.style.height = h + 'px';
      }
      this.draw();
    }

    go() {
      if (this.sel < 0) return;
      const c = this.cards[this.sel];
      this.lastPick = this.sel;
      const r = this.submit(c.oi === 0);
      if (r === 'retry') {
        c.el.classList.remove('on');
        c.el.classList.add('bad');
        this.sel = -1;
        this.setGoEnabled(false);
      }
    }

    celebrate() {
      const c = this.cards.find(x => x.oi === 0);
      c.el.classList.add('ok'); c.state = 'ok';
      const p = this.zone.fx.rel(c.el);
      this.zone.fx.confetti(p.x, p.y, { n: 34 });
      this.draw();
    }

    reveal(reason) {
      if (reason !== 'timeout' && this.lastPick != null) {
        const w = this.cards[this.lastPick];
        if (w.oi !== 0) { w.el.classList.remove('on'); w.el.classList.add('bad'); }
      }
      const c = this.cards.find(x => x.oi === 0);
      c.el.classList.add('answer'); c.state = 'answer';
      this.draw();
    }

    draw() {
      const col = U.UNIT_HEX[this.zone.meta.unit] || '#fff';
      for (const c of this.cards) {
        if (!c.g.view) continue;
        c.g.clear();
        const color = c.state === 'ok' ? LG.TC('ok') : c.state === 'answer' ? LG.TC('warn') : col;
        c.g.shapes(this.q.opts[c.oi], { color, width: 3.4 });
      }
    }
  }

  L8.meta = { id: 8, name: '圖形偵探', unit: 0, topic: '' };
  LG.bank.level('graph', L8);
})(window.LG);
