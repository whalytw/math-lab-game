/* 計算接力
   3 道鎖，一次開一道：每道鎖是一個小題（三選一），下一題會用到上一題的答案。
   選錯算答錯一次（同一道鎖再選）；3 道鎖全開就過關。
   題庫項目：{ prompt, steps: [{ q, opts: [正解, 錯, 錯] }]（3 個）, hint, explain } */
'use strict';
(function (LG) {
  const U = LG.util;

  class L22 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      this.how = '選出答案開鎖，下一題會用到這個答案';
      const m = scr.main;
      m.classList.add('l22');
      m.innerHTML = '<div class="ch-locks"><i>🔒</i><i>🔒</i><i>🔒</i></div><div class="ch-q"></div><div class="ch-opts"></div>';
      this.locks = [...m.querySelectorAll('.ch-locks i')];
      this.qEl = m.querySelector('.ch-q');
      this.optsEl = m.querySelector('.ch-opts');
      this.i = 0;
      this.show();
      this.setGoLabel('點選答案開鎖');
    }

    show() {
      const st = this.q.steps[this.i];
      this.locks.forEach((l, k) => l.classList.toggle('cur', k === this.i));
      this.qEl.innerHTML = `<span class="ch-n">第 ${this.i + 1} 道鎖</span>${U.rich(st.q)}`;
      this.optsEl.innerHTML = '';
      this.opts = U.shuffle(st.opts.map((o, k) => ({ o, ok: k === 0 }))).map(x => {
        const el = U.el('div', 'opt ch-opt', `<span class="ox">${U.rich(x.o)}</span>`);
        this.optsEl.appendChild(el);
        LG.input.onTap(el, () => this.choose(x, el), { sound: false, enabled: () => this.playing });
        return Object.assign(x, { el });
      });
      requestAnimationFrame(() => this.layout());
    }

    layout() { U.fit(this.qEl, 0.5); (this.opts || []).forEach(x => U.fit(x.el.querySelector('.ox'), 0.5, true)); }

    choose(x, el) {
      if (!this.playing || el.classList.contains('bad')) return;
      if (x.ok) {
        el.classList.add('ok');
        this.locks[this.i].textContent = '🔓'; this.locks[this.i].classList.add('open');
        LG.audio.play('select');
        this.i++;
        if (this.i >= 3) { this.submit(true); return; }
        this.zone.after(0.45, () => { if (this.playing) this.show(); });
        return;
      }
      el.classList.add('bad');
      this.submit(false);
    }

    celebrate() { const p = this.zone.fx.rel(this.scr.main); this.zone.fx.confetti(p.x, p.y, { n: 34 }); }

    reveal() { (this.opts || []).forEach(x => { if (x.ok) x.el.classList.add('answer'); }); }
  }

  L22.meta = { id: 22, name: '計算接力', unit: 0, topic: '' };
  LG.registerLevel(L22);
  LG.bank.level('chain', L22);
})(window.LG);
