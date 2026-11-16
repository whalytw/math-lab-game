/* 排序輸送帶
   4～5 張數字卡上下排成一列，用手指拖曳卡片調整順序，由小到大（或由大到小）排好後按「送出」。
   題庫項目：{ prompt, items: [{ tex, v（數值）, ap（約略值，答對後顯示） }], desc（true＝由大到小）, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L10 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l10');
      const lo = q.desc ? '大' : '小', hi = q.desc ? '小' : '大';
      m.innerHTML = `<div class="or-rail"><span class="or-end">最${lo}</span><i class="or-arrow"></i><span class="or-end">最${hi}</span></div><div class="or-list"></div>`;
      this.list = m.querySelector('.or-list');
      // 打亂順序（不可以剛好已經排好）
      const n = q.items.length, goal = this.goal();
      let ord;
      for (let t = 0; t < 30; t++) { ord = U.shuffle(q.items.map((_, i) => i)); if (ord.some((k, i) => k !== goal[i])) break; }
      this.cards = ord.map(k => {
        const it = q.items[k];
        const el = U.el('div', 'or-card', `<i class="or-grip"></i><div class="or-tx">${U.tex(it.tex)}</div><div class="or-ap"></div>`);
        this.list.appendChild(el);
        return { k, it, el, slot: 0, y: 0 };
      });
      this.order = this.cards.slice();   // 目前由上到下的順序
      this.drag = null;
      this.cards.forEach(c => this.bindDrag(c));
      this.setGo('送出順序', () => this.go());
    }

    /* 正確的順序（題目卡片索引，由上到下） */
    goal() {
      const idx = this.q.items.map((_, i) => i);
      return idx.sort((a, b) => (this.q.desc ? -1 : 1) * (this.q.items[a].v - this.q.items[b].v));
    }

    layout() {
      const r = this.list.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const n = this.cards.length, gap = r.height * 0.035;
      this.ch = (r.height - gap * (n - 1)) / n;
      this.step = this.ch + gap;
      this.cards.forEach(c => { c.el.style.height = this.ch + 'px'; U.fit(c.el.querySelector('.or-tx'), 0.5, true); });
      this.place(true);
    }

    place(instant) {
      this.order.forEach((c, i) => {
        c.slot = i;
        if (this.drag && this.drag.c === c) return;
        c.el.classList.toggle('instant', !!instant);
        c.el.style.transform = `translateY(${(i * this.step).toFixed(1)}px)`;
      });
    }

    bindDrag(c) {
      LG.input.onDrag(c.el, {
        down: (e, p) => {
          if (!this.playing || this.drag) return false;
          const r = this.list.getBoundingClientRect(), cr = c.el.getBoundingClientRect();
          this.drag = { c, off: e.clientY - cr.top, top: r.top };
          c.el.classList.add('lift');
          LG.audio.play('tap');
        },
        move: (e) => {
          const d = this.drag;
          if (!d || d.c !== c) return;
          const n = this.order.length;
          const y = U.clamp(e.clientY - d.top - d.off, -this.step * 0.3, (n - 1) * this.step + this.step * 0.3);
          c.el.style.transform = `translateY(${y.toFixed(1)}px) scale(1.04)`;
          const to = U.clamp(Math.round(y / this.step), 0, n - 1), from = this.order.indexOf(c);
          if (to !== from) {
            this.order.splice(from, 1); this.order.splice(to, 0, c);
            LG.audio.play('select');
            this.place();
          }
        },
        up: () => this.drop(c),
        cancel: () => this.drop(c)
      }, { threshold: 0 });
    }

    drop(c) {
      if (!this.drag || this.drag.c !== c) return;
      this.drag = null;
      c.el.classList.remove('lift');
      this.place();
    }

    go() {
      if (this.drag) return;
      const goal = this.goal(), ok = this.order.every((c, i) => c.k === goal[i]);
      const r = this.submit(ok);
      if (r === 'retry') {
        this.list.classList.remove('nope'); void this.list.offsetWidth; this.list.classList.add('nope');
      }
    }

    showValues() {
      // ap 以「=」開頭時照寫（例如 =2^{9}），其他寫成「≈ 約略值」
      this.cards.forEach(c => { const a = c.el.querySelector('.or-ap'), s = String(c.it.ap || ''); a.innerHTML = s ? U.tex(s.includes('=') ? s : '\\approx' + s) : ''; });
    }

    celebrate() {
      this.showValues();
      this.cards.forEach((c, i) => setTimeout(() => c.el.classList.add('ok'), i * 120));
      const p = this.zone.fx.rel(this.list);
      this.zone.fx.confetti(p.x, p.y, { n: 34 });
    }

    reveal() {
      // 把卡片移到正確的位置，標出正解
      const goal = this.goal();
      this.order = goal.map(k => this.cards.find(c => c.k === k));
      this.drag = null;
      this.cards.forEach(c => c.el.classList.remove('lift'));
      this.place();
      this.showValues();
      this.cards.forEach(c => c.el.classList.add('answer'));
    }
  }

  L10.meta = { id: 10, name: '排序輸送帶', unit: 0, topic: '' };
  LG.registerLevel(L10);
  LG.bank.level('order', L10);
})(window.LG);
