/* 天平平衡（用配對題的算式）
   左邊秤盤放著一個算式，右邊要放砝碼；點砝碼放上右邊秤盤（再點一次拿下來），
   讓兩邊一樣重（砝碼的和＝算式的值）後按「秤重！」。秤錯算答錯一次（天平會傾斜）。
   從同單元配對題中挑值是 2～30 的整數的算式；砝碼裡至少有一組加起來剛好等於它。 */
'use strict';
(function (LG) {
  const U = LG.util;

  function compose(chosen) {
    const MK = LG.matchKit;
    const it = chosen.find(c => { const n = MK.num(c.v); return n != null && Number.isInteger(n) && n >= 2 && n <= 30 && !MK.labelOf(c.p); });
    if (!it) return null;
    const T = MK.num(it.v);
    // 正解：2～3 個砝碼加起來等於 T；再加 2～3 個干擾砝碼（不能和正解的砝碼湊出別的組合也剛好等於 T 以外沒關係，只看和）
    let parts;
    for (let k = 0; k < 30; k++) {
      const n = T >= 6 && Math.random() < 0.6 ? 3 : 2;
      parts = [];
      let rest = T;
      for (let j = 0; j < n - 1; j++) { const a = U.randInt(1, Math.max(1, rest - (n - 1 - j))); parts.push(a); rest -= a; }
      parts.push(rest);
      if (parts.every(x => x >= 1) && new Set(parts).size === parts.length) break;
      parts = null;
    }
    if (!parts) return null;
    const extra = [];
    for (let k = 0; k < 20 && extra.length < 3; k++) { const x = U.randInt(1, Math.max(4, T)); if (!parts.includes(x) && !extra.includes(x)) extra.push(x); }
    return {
      key: it.tex,
      left: it.tex, target: T,
      weights: U.shuffle(parts.concat(extra)),
      prompt: '讓天平平衡：右邊放上的砝碼加起來，要等於左邊算式的值' + (MK.ctxOf(it.p) ? `　${MK.ctxOf(it.p)}` : ''),
      hint: it.h || '先算出左邊算式的值',
      explain: `${MK.factTex(it)}，例如放 $${parts.join('+')}=${T}$`
    };
  }

  class L26 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      this.how = '點砝碼放上秤盤，兩邊一樣重就按「秤重！」';
      const m = scr.main;
      m.classList.add('l26');
      m.innerHTML = `<div class="bl-scale"><div class="bl-beam"><div class="bl-pan l"><div class="bl-ex">${U.tex(LG.matchKit.T(q.left))}</div></div><div class="bl-pan r"><div class="bl-on"></div></div></div><i class="bl-post"></i></div><div class="bl-tray"></div>`;
      this.beam = m.querySelector('.bl-beam');
      this.on = m.querySelector('.bl-on');
      const tray = m.querySelector('.bl-tray');
      this.ws = q.weights.map(v => {
        const el = U.el('div', 'bl-w', `<b>${v}</b>`);
        tray.appendChild(el);
        const w = { v, el, used: false, home: tray };
        LG.input.onTap(el, () => this.toggle(w), { sound: false, enabled: () => this.playing });
        return w;
      });
      this.setGo('秤重！', () => this.go());
      this.setGoEnabled(false);
    }

    layout() { U.fit(this.scr.main.querySelector('.bl-ex'), 0.45, true); }

    toggle(w) {
      w.used = !w.used;
      (w.used ? this.on : w.home).appendChild(w.el);
      w.el.classList.toggle('on', w.used);
      LG.audio.play('tap');
      this.beam.className = 'bl-beam';
      this.setGoEnabled(this.ws.some(x => x.used));
    }

    go() {
      const sum = this.ws.filter(w => w.used).reduce((s, w) => s + w.v, 0), T = this.q.target;
      this.beam.className = 'bl-beam ' + (sum === T ? 'eq' : sum > T ? 'right' : 'left');
      LG.audio.play(sum === T ? 'select' : 'tap');
      this.submit(sum === T);
    }

    celebrate() { const p = this.zone.fx.rel(this.beam); this.zone.fx.confetti(p.x, p.y, { n: 34 }); }

    reveal() {
      // 換成一組正確的砝碼
      const T = this.q.target, ws = this.ws;
      let best = null;
      const n = ws.length;
      for (let mask = 1; mask < 1 << n && !best; mask++) { let s = 0; for (let i = 0; i < n; i++) if (mask & (1 << i)) s += ws[i].v; if (s === T) best = mask; }
      ws.forEach((w, i) => { const u = !!(best & (1 << i)); if (u !== w.used) this.toggle(w); w.el.classList.toggle('answer', u); });
      this.beam.className = 'bl-beam eq';
    }
  }

  L26.compose = compose;
  L26.meta = { id: 26, name: '天平平衡', unit: 0, topic: '' };
  LG.registerLevel(L26);
  LG.bank.level('balance', L26);
})(window.LG);
