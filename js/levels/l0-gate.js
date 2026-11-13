/* 真偽閘門（觀念題：是非）
   一關 3 句敘述，每句按 ○（正確）或 ✕（錯誤），3 句全對閘門才會打開。
   答錯時不會標出是哪一句錯，只告訴你錯了幾句；求救卡會揭曉其中一句的答案與理由。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const NUM = ['①', '②', '③'];

  // 題庫項目：{ s: 敘述, a: true/false, e: 理由 }
  function compose(items) {
    return {
      key: items.map(it => it.s).join('|'),
      items,
      hint: '',
      explain: items.map((it, i) => `${NUM[i]} ${it.a ? '○' : '✕'}${it.e ? '　' + it.e : ''}`).join('\n')
    };
  }

  class L0 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich('判斷下列敘述：正確按 ○，錯誤按 ✕。3 句全對，閘門才會打開！') + '<span class="tf-msg"></span>');
      const m = scr.main;
      m.classList.add('l0');
      this.rows = q.items.map((it, i) => {
        const el = U.el('div', 'tf-row', `
          <span class="tf-n">${NUM[i]}</span>
          <div class="tf-s"><div class="tf-t">${U.rich(it.s)}</div></div>
          <div class="tf-b o" aria-label="正確">○</div>
          <div class="tf-b x" aria-label="錯誤">✕</div>`);
        m.appendChild(el);
        const row = { el, it, pick: null, locked: false };
        LG.input.onTap(el.querySelector('.o'), () => this.choose(row, true), { sound: false, enabled: () => this.playing });
        LG.input.onTap(el.querySelector('.x'), () => this.choose(row, false), { sound: false, enabled: () => this.playing });
        return row;
      });
      this.msg = scr.q.querySelector('.tf-msg');
      this.setGo('通過閘門！', () => this.go());
      this.setGoEnabled(false);
    }

    layout() { this.rows.forEach(r => U.fit(r.el.querySelector('.tf-s'), 0.55)); }

    choose(row, v) {
      if (!this.playing || row.locked) return;
      row.pick = v;
      LG.audio.play('select');
      this.paint(row);
      this.msg.textContent = '';
      this.setGoEnabled(this.rows.every(r => r.pick !== null));
    }

    paint(row) {
      row.el.querySelector('.o').classList.toggle('on', row.pick === true);
      row.el.querySelector('.x').classList.toggle('on', row.pick === false);
    }

    go() {
      if (!this.rows.every(r => r.pick !== null)) return;
      const wrong = this.rows.filter(r => r.pick !== r.it.a);
      const res = this.submit(wrong.length === 0);
      if (res === 'retry') {
        this.msg.textContent = `有 ${wrong.length} 句判斷錯了，再檢查一次`;
        this.zone.after(0.05, () => U.fit(this.scr.q));
        this.rows.forEach(r => { r.el.classList.remove('shake'); void r.el.offsetWidth; r.el.classList.add('shake'); });
      }
    }

    /* 求救卡：揭曉一句（優先揭曉目前判斷錯的那一句） */
    hintHTML() {
      if (this.hintCache) return this.hintCache;
      const open = this.rows.filter(r => !r.locked);
      const wrong = open.filter(r => r.pick !== null && r.pick !== r.it.a);
      const r = wrong.length ? U.pick(wrong) : U.pick(open);
      if (!r) return '';
      const i = this.rows.indexOf(r);
      r.pick = r.it.a; r.locked = true;
      r.el.classList.add('hinted');
      this.paint(r);
      this.setGoEnabled(this.rows.every(x => x.pick !== null));
      this.hintCache = `第 ${NUM[i]} 句是「${r.it.a ? '正確 ○' : '錯誤 ✕'}」${r.it.e ? '：' + U.rich(r.it.e) : ''}`;
      return this.hintCache;
    }

    celebrate() {
      this.rows.forEach((r, i) => this.zone.after(0.12 * i, () => r.el.classList.add('ok')));
      LG.audio.play('zap');
      const p = this.zone.fx.rel(this.scr.main);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() {
      this.rows.forEach(r => {
        r.el.classList.add(r.pick === r.it.a ? 'right' : 'wrong');
        r.el.querySelector(r.it.a ? '.o' : '.x').classList.add('answer');
      });
    }
  }

  L0.meta = { id: 0, name: '真偽閘門', unit: 0, topic: '觀念是非' };
  L0.compose = compose;
  LG.bank.level('tf', L0);
})(window.LG);
