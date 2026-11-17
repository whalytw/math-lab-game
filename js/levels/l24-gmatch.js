/* 圖形對對碰
   左邊 3 張小圖、下方 3 張方程式卡；把方程式拖到對應圖形旁的框裡（或先點方程式、再點框），全部放好後按「確認」。
   放錯的會標紅並退回（算答錯一次）。
   題庫項目：{ prompt, win, items: [{ tex, shapes }]（3 個）, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;
  const LETTER = ['A', 'B', 'C'];

  class L24 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      this.how = '把方程式拖到對應圖形旁的框裡';
      const m = scr.main;
      m.classList.add('l24');
      m.innerHTML = '<div class="gm-rows"></div><div class="gm-tray"></div>';
      const rows = m.querySelector('.gm-rows');
      this.tray = m.querySelector('.gm-tray');
      // 圖形打亂順序
      this.slots = U.shuffle(q.items.map((it, i) => i)).map((k, s) => {
        const el = U.el('div', 'gm-row', `<div class="gm-g"><canvas class="g-cv"></canvas><span class="gc-l">${LETTER[s]}</span></div><div class="gm-slot tl-slot"></div>`);
        rows.appendChild(el);
        const slot = { k, el: el.querySelector('.gm-slot'), g: el.querySelector('.gm-g'), cv: el.querySelector('canvas'), card: null };
        slot.graph = new LG.Graph2D(slot.cv, Object.assign({ pad: 0.06 }, q.win));
        LG.input.onTap(slot.el, () => { if (slot.card && !this.pick) this.unplace(slot.card); else if (this.pick) this.place(this.pick, slot); }, { sound: false, enabled: () => this.playing });
        return slot;
      });
      this.cards = U.shuffle(q.items.map((it, i) => ({ i, it }))).map(c => {
        c.el = U.el('div', 'tl-tile gm-card', U.tex(c.it.tex));
        c.slot = null;
        this.tray.appendChild(c.el);
        LG.dragPlace(this, c, () => this.slots, t => { if (t) this.place(c, t); else if (c.slot) this.unplace(c); }, () => this.tapCard(c));
        return c;
      });
      this.pick = null;
      this.setGo('確認', () => this.go());
      this.setGoEnabled(false);
    }

    layout() {
      for (const s of this.slots) {
        const r = s.g.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        s.graph.resize(r.width, r.height, this.scale());
        s.cv.style.width = r.width + 'px'; s.cv.style.height = r.height + 'px';
      }
      this.cards.forEach(c => U.fit(c.el, 0.5, true));
      this.draw();
    }

    tapCard(c) {
      if (c.slot) { this.unplace(c); return; }
      this.pick = this.pick === c ? null : c;
      this.cards.forEach(x => x.el.classList.toggle('on', x === this.pick));
      LG.audio.play('select');
    }

    place(c, s) {
      if (s.card && s.card !== c) this.unplace(s.card, true);
      if (c.slot) c.slot.card = null;
      c.slot = s; s.card = c; s.el.appendChild(c.el); s.el.classList.add('filled'); s.el.classList.remove('bad');
      this.pick = null; this.cards.forEach(x => x.el.classList.remove('on'));
      LG.audio.play('tap');
      this.refresh();
    }

    unplace(c, quiet) {
      if (!c.slot) return;
      c.slot.card = null; c.slot.el.classList.remove('filled'); c.slot = null;
      this.tray.appendChild(c.el);
      if (!quiet) LG.audio.play('tap');
      this.refresh();
    }

    refresh() { this.setGoEnabled(this.cards.every(c => c.slot)); requestAnimationFrame(() => this.cards.forEach(c => U.fit(c.el, 0.5, true))); }

    go() {
      if (!this.cards.every(c => c.slot)) return;
      const wrong = this.slots.filter(s => s.card.i !== s.k);
      const r = this.submit(!wrong.length);
      if (r === 'retry') wrong.forEach(s => { s.el.classList.add('bad'); this.unplace(s.card, true); });
    }

    celebrate() { this.state = 'ok'; this.slots.forEach(s => s.el.classList.add('ok')); this.draw(); const p = this.zone.fx.rel(this.scr.main); this.zone.fx.confetti(p.x, p.y, { n: 34 }); }

    reveal() {
      this.slots.forEach(s => {
        if (s.card && s.card.i === s.k) { s.el.classList.add('ok'); return; }
        if (s.card) this.unplace(s.card, true);
      });
      this.slots.forEach(s => { if (!s.card) { const c = this.cards.find(x => x.i === s.k); if (c.slot) this.unplace(c, true); c.slot = s; s.card = c; s.el.appendChild(c.el); s.el.classList.add('filled', 'answer'); } });
    }

    draw() {
      const col = U.UNIT_HEX[this.zone.meta.unit] || LG.TC('fg');
      for (const s of this.slots) {
        if (!s.graph.view) continue;
        s.graph.clear();
        s.graph.shapes(this.q.items[s.k].shapes, { color: this.state === 'ok' ? LG.TC('ok') : col, width: 3.2 });
      }
    }
  }

  L24.meta = { id: 24, name: '圖形對對碰', unit: 0, topic: '' };
  LG.registerLevel(L24);
  LG.bank.level('gmatch', L24);
})(window.LG);
