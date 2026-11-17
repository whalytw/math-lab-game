/* 分類收納
   上方有 6 張卡片、下方有 2～3 個籃子；把每張卡片拖進正確的籃子（或先點卡片、再點籃子），全部放好後按「完成分類」。
   放錯的卡片會標紅並退回上方（算答錯一次）。點籃子裡的卡片可以拿回來。
   題庫項目：{ prompt, bins: [籃子名稱…], items: [{ tex, b（正確籃子編號） }], hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  /* 卡片拖放＋點選放置（分類收納、圖形對對碰共用）
     cards：[{ el }]；targets：[{ el, drop(card) }]；tray：卡片放回的容器 */
  LG.dragPlace = (lv, card, getTargets, onDrop, onTap) => {
    let ghost = null, moved = false, sx = 0, sy = 0;
    const clear = () => { card.el.classList.remove('lifting'); if (ghost) { ghost.remove(); ghost = null; } getTargets().forEach(t => t.el.classList.remove('hover')); };
    const hit = (t, e) => { const r = t.el.getBoundingClientRect(), p = 8; return e.clientX >= r.left - p && e.clientX <= r.right + p && e.clientY >= r.top - p && e.clientY <= r.bottom + p; };
    LG.input.onDrag(card.el, {
      down: e => { if (!lv.playing) return false; moved = false; sx = e.clientX; sy = e.clientY; },
      move: e => {
        if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
        if (!moved) { moved = true; ghost = card.el.cloneNode(true); ghost.classList.add('tl-ghost'); lv.zone.inner.appendChild(ghost); card.el.classList.add('lifting'); }
        const z = lv.zone.inner.getBoundingClientRect();
        ghost.style.left = (e.clientX - z.left) + 'px'; ghost.style.top = (e.clientY - z.top) + 'px';
        getTargets().forEach(t => t.el.classList.toggle('hover', hit(t, e)));
      },
      up: e => {
        const was = moved; clear();
        if (!lv.playing) return;
        if (!was) { onTap(); return; }
        const t = getTargets().find(x => hit(x, e));
        onDrop(t || null);
      },
      cancel: clear
    });
  };

  class L20 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      this.how = '把卡片拖進籃子（或點卡片再點籃子）';
      const m = scr.main;
      m.classList.add('l20');
      m.innerHTML = `<div class="bn-tray"></div><div class="bn-bins" style="--n:${q.bins.length}"></div>`;
      this.tray = m.querySelector('.bn-tray');
      const binsEl = m.querySelector('.bn-bins');
      this.bins = q.bins.map((label, i) => {
        const el = U.el('div', 'bn-bin', `<div class="bn-lab">${U.rich(label)}</div><div class="bn-in"></div>`);
        binsEl.appendChild(el);
        const b = { i, el, inner: el.querySelector('.bn-in') };
        LG.input.onTap(el, () => { if (this.pick) this.place(this.pick, b); }, { sound: false, enabled: () => this.playing });
        return b;
      });
      this.cards = U.shuffle(q.items.map(it => ({ it }))).map(c => {
        c.el = U.el('div', 'bn-card', U.tex(c.it.tex));
        c.bin = null;
        this.tray.appendChild(c.el);
        LG.dragPlace(this, c, () => this.bins, t => { if (t) this.place(c, t); else if (c.bin) this.unplace(c); }, () => this.tapCard(c));
        return c;
      });
      this.pick = null;
      this.setGo('完成分類', () => this.go());
      this.setGoEnabled(false);
    }

    layout() {
      this.cards.forEach(c => { c.el.style.fontSize = ''; U.fit(c.el, 0.5, true); });
      this.bins.forEach(b => U.fit(b.el.querySelector('.bn-lab'), 0.5, true));
      // 卡片太高（例如聯立方程組）時，整區一起縮小到放得下
      this.tray.style.fontSize = ''; this.bins.forEach(b => { b.inner.style.fontSize = ''; });
      U.fitH(this.tray, this.tray.clientHeight); this.bins.forEach(b => U.fitH(b.inner, b.inner.clientHeight));
    }

    tapCard(c) {
      if (c.bin) { this.unplace(c); return; }
      this.pick = this.pick === c ? null : c;
      this.cards.forEach(x => x.el.classList.toggle('on', x === this.pick));
      LG.audio.play('select');
    }

    place(c, b) {
      c.bin = b; b.inner.appendChild(c.el);
      c.el.classList.remove('on', 'bad');
      this.pick = null;
      this.cards.forEach(x => x.el.classList.remove('on'));
      LG.audio.play('tap');
      this.refresh();
    }

    unplace(c) { c.bin = null; this.tray.appendChild(c.el); LG.audio.play('tap'); this.refresh(); }

    refresh() { this.setGoEnabled(this.cards.every(c => c.bin)); requestAnimationFrame(() => this.layout()); }

    go() {
      if (!this.cards.every(c => c.bin)) return;
      const wrong = this.cards.filter(c => c.bin.i !== c.it.b);
      const r = this.submit(!wrong.length);
      if (r === 'retry') wrong.forEach(c => { this.unplace(c); c.el.classList.add('bad'); });
    }

    celebrate() {
      this.cards.forEach(c => c.el.classList.add('ok'));
      const p = this.zone.fx.rel(this.scr.main);
      this.zone.fx.confetti(p.x, p.y, { n: 34 });
    }

    reveal() {
      this.cards.forEach(c => {
        const right = this.bins[c.it.b];
        if (c.bin !== right) { c.bin = right; right.inner.appendChild(c.el); c.el.classList.add('answer'); } else c.el.classList.add('ok');
      });
      this.layout();
    }
  }

  L20.meta = { id: 20, name: '分類收納', unit: 0, topic: '' };
  LG.registerLevel(L20);
  LG.bank.level('bins', L20);
})(window.LG);
