/* 公式拼圖
   公式（或算式）中間有幾個空格，下面有一排拼圖塊（含幾塊用不到的），
   把拼圖塊拖進空格（也可以先點拼圖塊、再點空格），填滿後按「完成！」。點已填的空格可以把拼圖塊拿回來。
   題庫項目：{ prompt, tpl: 'TeX 字串，用 @ 表示空格', ans: [每個空格的正解], extra: [用不到的拼圖塊],
             alt: [[另一組也正確的答案], …]（可省略）, hint, explain }
   注意：@ 不能放在大括號裡（例如 \frac{@}{2}），因為公式會在空格處切開分段排版。 */
'use strict';
(function (LG) {
  const U = LG.util;

  class L12 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l12');
      const segs = q.tpl.split('@');
      let html = '<div class="tl-eq"><div class="tl-row">';
      segs.forEach((s, i) => {
        if (s.trim()) html += `<span class="tl-seg">${U.tex(s)}</span>`;
        if (i < segs.length - 1) html += `<span class="tl-slot" data-i="${i}"></span>`;
      });
      html += '</div></div><div class="tl-tray"></div>';
      m.innerHTML = html;
      this.eq = m.querySelector('.tl-eq');
      this.row = m.querySelector('.tl-row');
      this.tray = m.querySelector('.tl-tray');
      this.slots = [...m.querySelectorAll('.tl-slot')].map((el, i) => ({ i, el, tile: null }));
      const all = U.shuffle(q.ans.map(t => ({ tex: t })).concat((q.extra || []).map(t => ({ tex: t }))));
      this.tiles = all.map((t, k) => {
        const el = U.el('div', 'tl-tile', U.tex(t.tex));
        this.tray.appendChild(el);
        const tile = { k, tex: t.tex, el, slot: null };
        this.bindTile(tile);
        return tile;
      });
      this.slots.forEach(s => LG.input.onTap(s.el, () => this.tapSlot(s), { sound: false, enabled: () => this.playing }));
      this.pick = null;
      this.setGo('完成！', () => this.go());
      this.setGoEnabled(false);
    }

    layout() {
      U.fit(this.row, 0.45, true);
    }

    bindTile(t) {
      let ghost = null, moved = false, sx = 0, sy = 0;
      LG.input.onDrag(t.el, {
        down: (e) => {
          if (!this.playing) return false;
          moved = false; sx = e.clientX; sy = e.clientY;
        },
        move: (e) => {
          if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
          if (!moved) {
            moved = true;
            ghost = t.el.cloneNode(true);
            ghost.classList.add('tl-ghost');
            this.zone.inner.appendChild(ghost);
            t.el.classList.add('lifting');
          }
          const z = this.zone.inner.getBoundingClientRect();
          ghost.style.left = (e.clientX - z.left) + 'px';
          ghost.style.top = (e.clientY - z.top) + 'px';
          this.slots.forEach(s => s.el.classList.toggle('hover', this.hit(s, e)));
        },
        up: (e) => {
          t.el.classList.remove('lifting');
          if (ghost) { ghost.remove(); ghost = null; }
          this.slots.forEach(s => s.el.classList.remove('hover'));
          if (!this.playing) return;
          if (!moved) { this.tapTile(t); return; }
          const s = this.slots.find(x => this.hit(x, e));
          if (s) this.place(t, s);
          else if (t.slot) this.unplace(t);
        },
        cancel: () => { t.el.classList.remove('lifting'); if (ghost) { ghost.remove(); ghost = null; } this.slots.forEach(s => s.el.classList.remove('hover')); }
      });
    }

    hit(s, e) {
      const r = s.el.getBoundingClientRect(), pad = Math.max(10, r.height * 0.35);
      return e.clientX >= r.left - pad && e.clientX <= r.right + pad && e.clientY >= r.top - pad && e.clientY <= r.bottom + pad;
    }

    /* 點拼圖塊：選起來（再點空格放進去）；點已放進空格的拼圖塊：拿回來 */
    tapTile(t) {
      if (t.slot) { this.unplace(t); return; }
      this.pick = this.pick === t ? null : t;
      this.tiles.forEach(x => x.el.classList.toggle('on', x === this.pick));
      LG.audio.play('select');
      // 只剩一個空格時，直接放進去
      const empty = this.slots.filter(s => !s.tile);
      if (this.pick && empty.length === 1) this.place(this.pick, empty[0]);
    }

    tapSlot(s) {
      if (s.tile) { this.unplace(s.tile); return; }
      if (this.pick) this.place(this.pick, s);
    }

    place(t, s) {
      if (t.slot === s) return;
      if (t.slot) { t.slot.tile = null; t.slot.el.classList.remove('filled'); }
      if (s.tile) this.unplace(s.tile, true);
      s.tile = t; t.slot = s;
      s.el.appendChild(t.el);
      s.el.classList.add('filled');
      s.el.classList.remove('bad');
      t.el.classList.remove('on');
      this.pick = null;
      this.tiles.forEach(x => x.el.classList.remove('on'));
      LG.audio.play('tap');
      this.refresh();
    }

    unplace(t, quiet) {
      if (!t.slot) return;
      t.slot.tile = null; t.slot.el.classList.remove('filled');
      t.slot = null;
      this.tray.appendChild(t.el);
      if (!quiet) LG.audio.play('tap');
      this.refresh();
    }

    refresh() {
      this.setGoEnabled(this.slots.every(s => s.tile));
      requestAnimationFrame(() => this.layout());
    }

    answers() { return [this.q.ans].concat(this.q.alt || []); }

    go() {
      if (!this.slots.every(s => s.tile)) return;
      const got = this.slots.map(s => s.tile.tex);
      const ok = this.answers().some(a => a.every((x, i) => x === got[i]));
      const r = this.submit(ok);
      if (r === 'retry') {
        // 和最接近的一組正解比較，錯的空格標紅並把拼圖塊放回去
        const best = this.answers().map(a => a.filter((x, i) => x === got[i]).length);
        const a = this.answers()[best.indexOf(Math.max(...best))];
        this.slots.forEach((s, i) => {
          if (a[i] !== got[i]) { s.el.classList.add('bad'); this.unplace(s.tile, true); }
        });
      }
    }

    celebrate() {
      this.slots.forEach((s, i) => setTimeout(() => s.el.classList.add('ok'), i * 110));
      this.tiles.forEach(t => { if (!t.slot) t.el.classList.add('dim'); });
      const p = this.zone.fx.rel(this.eq);
      this.zone.fx.confetti(p.x, p.y, { n: 34 });
    }

    reveal() {
      // 把正解填進空格
      const a = this.q.ans;
      this.slots.forEach((s, i) => {
        if (s.tile && s.tile.tex === a[i]) { s.el.classList.add('ok'); return; }
        if (s.tile) this.unplace(s.tile, true);
        const t = this.tiles.find(x => !x.slot && x.tex === a[i]);
        if (t) { s.tile = t; t.slot = s; s.el.appendChild(t.el); s.el.classList.add('filled', 'answer'); }
      });
      this.tiles.forEach(t => { if (!t.slot) t.el.classList.add('dim'); });
      this.layout();
    }
  }

  L12.meta = { id: 12, name: '公式拼圖', unit: 0, topic: '' };
  LG.registerLevel(L12);
  LG.bank.level('tiles', L12);
})(window.LG);
