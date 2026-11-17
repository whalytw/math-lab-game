/* 數字賓果（用配對題的算式）
   3×3 的答案格。依序出 3 題（算式），在格子裡點出它的值；3 個答案剛好連成一條線就賓果過關。
   點錯格子算答錯一次。其他 6 格是同單元其他算式的值或相近的數。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  function compose(chosen, ctx) {
    const MK = LG.matchKit;
    const items = chosen.slice(0, 3);
    const used = items.map(it => String(it.v));
    // 干擾值：同單元其他算式的值；不夠時用整數答案附近的數補
    let dist = U.shuffle([...new Set(ctx.pool.map(o => String(o.v)))].filter(v => !used.some(u => MK.same(u, v))));
    const near = [];
    items.forEach(it => { const n = MK.num(it.v); if (n != null && Number.isInteger(n)) [n + 1, n - 1, n + 2, -n, n * 2].forEach(x => near.push(String(x))); });
    [0, 1, -1, 2, 3, 4, 5, 6, -2, 10].forEach(x => near.push(String(x)));
    for (const v of near) { if (dist.length >= 6) break; if (!dist.concat(used).some(u => MK.same(u, v))) dist.push(v); }
    if (dist.length < 6) return null;
    dist = dist.slice(0, 6);
    const line = U.pick(LINES), cells = new Array(9);
    const order = U.shuffle([0, 1, 2]);
    line.forEach((c, k) => { cells[c] = { v: items[order[k]].v, q: order[k] }; });
    let d = 0;
    for (let c = 0; c < 9; c++) if (!cells[c]) cells[c] = { v: dist[d++], q: -1 };
    const p0 = items.map(it => MK.ctxOf(it.p)).find(Boolean) || '';
    return {
      key: items.map(o => o.tex).join('|'),
      qs: items.map(it => ({ tex: it.tex, lab: MK.labelOf(it.p), v: it.v })),
      cells, line,
      prompt: '依序算出 3 題的答案，在格子裡點出來；連成一條線就賓果！' + (p0 ? `　${p0}` : ''),
      hint: [...new Set(items.map(o => o.h).filter(Boolean))].slice(0, 2).join('\n') || '先算出這一題的值，再到格子裡找',
      explain: items.map(MK.factTex).join('；')
    };
  }

  class L16 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.4;
      this.setQuestion(U.rich(q.prompt));
      this.how = '算出這一題，在格子裡點出答案';
      const MK = LG.matchKit;
      const m = scr.main;
      m.classList.add('l16');
      m.innerHTML = '<div class="bg-q"><span class="bg-n"></span><div class="bg-tx"></div></div><div class="bg-grid"></div>';
      this.qEl = m.querySelector('.bg-tx');
      this.nEl = m.querySelector('.bg-n');
      const grid = m.querySelector('.bg-grid');
      this.cells = q.cells.map((c, k) => {
        const el = U.el('div', 'bg-cell', `<div class="bg-v">${U.tex(MK.vt(c.v))}</div>`);
        grid.appendChild(el);
        const cell = Object.assign({ el, k, done: false }, c);
        LG.input.onTap(el, () => this.pick(cell), { sound: false, enabled: () => this.playing });
        return cell;
      });
      this.i = 0;
      this.showQ();
      this.setGoLabel('點格子作答');
    }

    showQ() {
      const MK = LG.matchKit, s = this.q.qs[this.i];
      this.nEl.textContent = `第 ${this.i + 1}／3 題`;
      this.qEl.innerHTML = U.tex(MK.T(s.tex)) + `<span class="bg-ask">${s.lab ? `的${s.lab}` : '＝'}？</span>`;
      requestAnimationFrame(() => U.fit(this.qEl, 0.5, true));
    }

    layout() { this.cells.forEach(c => U.fit(c.el.querySelector('.bg-v'), 0.5, true)); U.fit(this.qEl, 0.5, true); }

    pick(c) {
      if (!this.playing || c.done || this.i >= 3) return;
      if (c.q === this.i) {
        c.done = true; c.el.classList.add('done');
        LG.audio.play('coin');
        this.i++;
        if (this.i >= 3) { this.line(); this.submit(true); return; }
        this.showQ();
        return;
      }
      c.el.classList.remove('bad'); void c.el.offsetWidth; c.el.classList.add('bad');
      this.submit(false);
    }

    line() { this.q.line.forEach(k => this.cells[k].el.classList.add('bingo')); }

    celebrate() {
      const p = this.zone.fx.rel(this.scr.main);
      this.zone.fx.confetti(p.x, p.y, { n: 40 });
    }

    reveal() {
      this.cells.forEach(c => { if (c.q >= 0) c.el.classList.add(c.done ? 'done' : 'answer'); });
      this.line();
    }
  }

  L16.compose = compose;
  L16.meta = { id: 16, name: '數字賓果', unit: 0, topic: '' };
  LG.registerLevel(L16);
  LG.bank.level('bingo', L16);
})(window.LG);
