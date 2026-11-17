/* 快問快答（用是非題）
   是非句一張一張出現：往右滑（或按 ○）表示正確、往左滑（或按 ✕）表示錯誤，連續判斷 4 張。
   判斷錯一張算答錯一次（卡片會翻面顯示正確答案與理由，再換下一張）。 */
'use strict';
(function (LG) {
  const U = LG.util;

  function compose(items) {
    return {
      key: items.map(it => it.s).join('|'),
      items: items.slice(0, 4),
      hint: '',
      explain: items.slice(0, 4).map((it, i) => `${i + 1}. ${it.a ? '○' : '✕'}${it.e ? '　' + it.e : ''}`).join('\n')
    };
  }

  class L15 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.2;
      this.n = q.items.length;
      this.setQuestion(U.rich(`判斷每一張卡片的敘述是否正確（共 ${this.n} 張）`) + `<span class="l3-prog">第 <b>1</b>／${this.n} 張</span>`);
      this.how = '右滑（或按 ○）＝正確，左滑（或按 ✕）＝錯誤';
      const m = scr.main;
      m.classList.add('l15');
      m.innerHTML = `<div class="sw-deck"></div><div class="sw-btns"><div class="btn sw-b x">✕ 錯誤</div><div class="btn sw-b o">○ 正確</div></div>`;
      this.deck = m.querySelector('.sw-deck');
      this.cards = q.items.map((it, i) => {
        const el = U.el('div', 'sw-card', `<div class="sw-n">${i + 1}／${this.n}</div><div class="sw-s">${U.rich(it.s)}</div><div class="sw-res"></div>`);
        el.style.zIndex = String(10 - i);
        this.deck.appendChild(el);
        return { el, it };
      });
      this.i = 0;
      this.lock = false;
      LG.input.onTap(m.querySelector('.sw-b.x'), () => this.judge(false), { sound: false, enabled: () => this.playing });
      LG.input.onTap(m.querySelector('.sw-b.o'), () => this.judge(true), { sound: false, enabled: () => this.playing });
      LG.input.onDrag(this.deck, {
        down: (e, p) => { if (!this.playing || this.lock || this.i >= this.n) return false; this.drag = { x0: p.x, dx: 0 }; },
        move: (e, p) => {
          if (!this.drag) return;
          this.drag.dx = p.x - this.drag.x0;
          const c = this.cards[this.i].el;
          c.classList.add('dragging');
          c.style.transform = `translateX(${this.drag.dx}px) rotate(${this.drag.dx / 25}deg)`;
          c.classList.toggle('lean-o', this.drag.dx > 30); c.classList.toggle('lean-x', this.drag.dx < -30);
        },
        up: () => {
          const d = this.drag; this.drag = null;
          if (!d) return;
          const c = this.cards[this.i] && this.cards[this.i].el;
          if (c) { c.classList.remove('dragging', 'lean-o', 'lean-x'); c.style.transform = ''; }
          const W = this.deck.clientWidth;
          if (Math.abs(d.dx) > W * 0.22) this.judge(d.dx > 0);
        },
        cancel: () => { this.drag = null; const c = this.cards[this.i] && this.cards[this.i].el; if (c) { c.classList.remove('dragging', 'lean-o', 'lean-x'); c.style.transform = ''; } }
      });
      this.setGoLabel('右滑 ○ 正確　左滑 ✕ 錯誤');
    }

    layout() { this.cards.forEach(c => U.fit(c.el.querySelector('.sw-s'), 0.5)); }

    hintHTML() {
      const c = this.cards[Math.min(this.i, this.n - 1)];
      return c.it.e ? `第 ${Math.min(this.i, this.n - 1) + 1} 張的提示：想想看是否「一定」成立，或找一個反例` : '注意「一定」「所有」「若且唯若」這些關鍵字';
    }

    judge(v) {
      if (!this.playing || this.lock || this.i >= this.n) return;
      const c = this.cards[this.i], right = v === c.it.a;
      c.el.classList.add(v ? 'out-o' : 'out-x');
      LG.audio.play(right ? 'select' : 'tap');
      if (right) { this.advance(0.35); return; }
      // 判斷錯：翻面顯示正解與理由
      this.lock = true;
      c.el.classList.remove('out-o', 'out-x');
      c.el.classList.add('wrong');
      c.el.querySelector('.sw-res').innerHTML = `${c.it.a ? '○ 正確' : '✕ 錯誤'}${c.it.e ? '：' + U.rich(c.it.e) : ''}`;
      U.fit(c.el.querySelector('.sw-res'), 0.5);
      const r = this.submit(false);
      if (r === 'retry') this.zone.after(2.2, () => { this.lock = false; c.el.classList.add(c.it.a ? 'out-o' : 'out-x'); this.advance(0.35); });
    }

    advance(delay) {
      this.i++;
      const b = this.scr.q.querySelector('.l3-prog b');
      if (this.i >= this.n) { this.zone.after(delay, () => { if (this.playing) this.submit(true); }); return; }
      if (b) b.textContent = this.i + 1;
    }

    celebrate() {
      const p = this.zone.fx.rel(this.scr.main);
      this.zone.fx.confetti(p.x, p.y, { n: 34 });
    }

    reveal() {
      // 把還沒判斷的卡片依序攤開顯示答案
      this.deck.classList.add('spread');
      this.cards.forEach((c, k) => {
        c.el.classList.remove('out-o', 'out-x', 'dragging');
        c.el.style.transform = '';
        c.el.querySelector('.sw-res').innerHTML = c.it.a ? '○ 正確' : '✕ 錯誤';
        c.el.classList.add(c.it.a ? 'ans-o' : 'ans-x');
      });
      this.zone.after(0.05, () => this.cards.forEach(c => U.fit(c.el.querySelector('.sw-s'), 0.4)));
    }
  }

  L15.compose = compose;
  L15.meta = { id: 15, name: '快問快答', unit: 0, topic: '' };
  LG.registerLevel(L15);
  LG.bank.level('swipe', L15);
})(window.LG);
