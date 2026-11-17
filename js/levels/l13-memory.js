/* 翻牌記憶（用配對題的算式）
   8 張蓋著的牌：4 張算式、4 張值。一次翻兩張，算式和它的值是一對就留下來，4 對全部配完就過關。
   只有「兩張都已經看過、卻還配錯」才算答錯一次（代表算錯，不是記錯）。 */
'use strict';
(function (LG) {
  const U = LG.util;

  function compose(chosen, ctx) {
    const MK = LG.matchKit;
    const items = chosen.slice(0, 4);
    const cards = [];
    items.forEach((it, i) => {
      const lab = MK.labelOf(it.p);
      cards.push({ pair: i, kind: 'ex', html: U.tex(MK.T(it.tex)) });
      cards.push({ pair: i, kind: 'v', html: lab ? `<span class="sl-lab">${lab}</span> ${U.tex(MK.vt(it.v))}` : U.tex(MK.vt(it.v)) });
    });
    const p0 = items.map(it => MK.ctxOf(it.p)).find(Boolean) || '';
    const hints = [...new Set(items.map(o => o.h).filter(Boolean))].slice(0, 2);
    return {
      key: items.map(o => o.tex).join('|'),
      cards: U.shuffle(cards).map((c, k) => Object.assign(c, { id: k })),
      prompt: '翻牌配對：把每個算式和它的值配成一對（共 4 對）' + (p0 ? `　${p0}` : ''),
      hint: hints.length ? hints.join('\n') : '先把翻過的算式算出來，記住每張值牌的位置',
      explain: items.map(MK.factTex).join('；')
    };
  }

  class L13 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt) + '<span class="l3-prog">已配對 <b>0</b>／4</span>');
      this.how = '一次翻兩張，算式和它的值配成一對';
      const m = scr.main;
      m.classList.add('l13');
      this.cards = q.cards.map(c => {
        const el = U.el('div', 'mm-card', `<div class="mm-in"><div class="mm-back"><i>?</i></div><div class="mm-face ${c.kind}"><div class="mm-tx">${c.html}</div></div></div>`);
        m.appendChild(el);
        const card = Object.assign({ el, open: false, done: false }, c);
        LG.input.onTap(el, () => this.flip(card), { sound: false, enabled: () => this.playing });
        return card;
      });
      this.open = [];
      this.seen = new Set();
      this.got = 0;
      this.busy = false;
      this.setGoLabel('點牌翻開來配對');
    }

    layout() { this.cards.forEach(c => U.fit(c.el.querySelector('.mm-tx'), 0.45, true)); }

    flip(c) {
      if (!this.playing || this.busy || c.done || c.open) return;
      c.open = true; c.el.classList.add('open');
      LG.audio.play('tap');
      this.open.push(c);
      if (this.open.length < 2) return;
      const [a, b] = this.open;
      this.open = [];
      if (a.pair === b.pair) {
        [a, b].forEach(x => { x.done = true; x.el.classList.add('done'); });
        this.got++;
        this.scr.q.querySelector('.l3-prog b').textContent = this.got;
        LG.audio.play('select');
        if (this.got === 4) this.submit(true);
        return;
      }
      const known = this.seen.has(a.id) && this.seen.has(b.id);
      this.seen.add(a.id); this.seen.add(b.id);
      this.busy = true;
      [a, b].forEach(x => x.el.classList.add('miss'));
      this.zone.after(0.9, () => {
        [a, b].forEach(x => { x.open = false; x.el.classList.remove('open', 'miss'); });
        this.busy = false;
      });
      if (known) this.submit(false);
    }

    celebrate() {
      const p = this.zone.fx.rel(this.scr.main);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() {
      // 全部翻開，同一對標上相同的編號
      this.cards.forEach(c => {
        c.el.classList.add('open', c.done ? 'done' : 'answer');
        const t = U.el('span', 'mm-tag', String(c.pair + 1));
        c.el.querySelector('.mm-face').appendChild(t);
      });
    }
  }

  L13.compose = compose;
  L13.meta = { id: 13, name: '翻牌記憶', unit: 0, topic: '' };
  LG.registerLevel(L13);
  LG.bank.level('memory', L13);
})(window.LG);
