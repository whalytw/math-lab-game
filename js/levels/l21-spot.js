/* 找錯偵探
   一份 4～5 步的解題過程，其中有一步錯了；點出「錯的那一步」，按「就是這一步！」。
   題庫項目：{ prompt, steps: [每一步（數學式用 $…$）], bad（錯的那一步）, fix（正確寫法）, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L21 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt) + '<span class="l3-prog">下面的解題過程有一步錯了，找出來！</span>');
      this.how = '點出錯的那一步，再按「就是這一步！」';
      const m = scr.main;
      m.classList.add('l21');
      this.rows = q.steps.map((s, i) => {
        const el = U.el('div', 'opt sp-row', `<span class="sp-n">${i + 1}</span><div class="sp-t">${U.rich(s.replace(/\\dfrac/g, '\\frac'))}</div>`);
        m.appendChild(el);
        const row = { el, i };
        LG.input.onTap(el, () => this.select(row), { sound: false, enabled: () => this.playing });
        return row;
      });
      this.sel = null;
      this.setGo('就是這一步！', () => this.go());
      this.setGoEnabled(false);
    }

    layout() { this.rows.forEach(r => { const t = r.el.querySelector('.sp-t'); U.fit(t, 0.5, true); U.fitH(t, t.clientHeight); }); }

    select(r) {
      if (!this.playing || r.el.classList.contains('bad')) return;
      this.sel = r;
      LG.audio.play('select');
      this.rows.forEach(x => x.el.classList.toggle('on', x === r));
      this.setGoEnabled(true);
    }

    go() {
      if (!this.sel) return;
      const r = this.sel, res = this.submit(r.i === this.q.bad);
      this.last = r;
      if (res === 'retry') { r.el.classList.remove('on'); r.el.classList.add('bad'); this.sel = null; this.setGoEnabled(false); }
    }

    showFix() {
      const r = this.rows[this.q.bad];
      r.el.querySelector('.sp-t').innerHTML = `<s>${U.rich(this.q.steps[this.q.bad])}</s><div class="sp-fix">${U.rich(this.q.fix)}</div>`;
      U.fit(r.el.querySelector('.sp-t'), 0.45);
    }

    celebrate() {
      this.rows[this.q.bad].el.classList.add('ok');
      this.showFix();
      const p = this.zone.fx.rel(this.rows[this.q.bad].el);
      this.zone.fx.confetti(p.x, p.y, { n: 34 });
    }

    reveal() {
      if (this.last && this.last.i !== this.q.bad) { this.last.el.classList.remove('on'); this.last.el.classList.add('bad'); }
      this.rows[this.q.bad].el.classList.add('answer');
      this.showFix();
    }
  }

  L21.meta = { id: 21, name: '找錯偵探', unit: 0, topic: '' };
  LG.registerLevel(L21);
  LG.bank.level('spot', L21);
})(window.LG);
