/* 迷宮岔路（用是非題）
   迷宮有 3 個岔路，每個岔路寫著一句敘述：正確走「○」門、錯誤走「✕」門。
   走錯門會碰到死路（算答錯一次），回到同一個岔路重新選；3 個岔路都走對就走出迷宮。 */
'use strict';
(function (LG) {
  const U = LG.util;

  function compose(items) {
    const it = items.slice(0, 3);
    return {
      key: it.map(x => x.s).join('|'),
      items: it,
      hint: '',
      explain: it.map((x, i) => `岔路 ${i + 1}：${x.a ? '○' : '✕'}${x.e ? '　' + x.e : ''}`).join('\n')
    };
  }

  class L17 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich('走出迷宮！每個岔路判斷敘述：正確走「○」門，錯誤走「✕」門'));
      this.how = '在亮著的岔路選「○ 門」或「✕ 門」';
      const m = scr.main;
      m.classList.add('l17');
      this.forks = q.items.map((it, i) => {
        // 正確的門隨機放左邊或右邊
        const oLeft = Math.random() < 0.5;
        const el = U.el('div', 'mz-fork', `
          <div class="mz-s"><span class="mz-n">${i + 1}</span><div class="mz-t">${U.rich(it.s)}</div></div>
          <div class="mz-doors">
            <div class="mz-door ${oLeft ? 'o' : 'x'}">${oLeft ? '○' : '✕'}<small>${oLeft ? '正確' : '錯誤'}</small></div>
            <i class="mz-path"></i>
            <div class="mz-door ${oLeft ? 'x' : 'o'}">${oLeft ? '✕' : '○'}<small>${oLeft ? '錯誤' : '正確'}</small></div>
          </div>`);
        m.appendChild(el);
        const f = { el, it, done: false };
        el.querySelectorAll('.mz-door').forEach(d => LG.input.onTap(d, () => this.choose(f, d.classList.contains('o'), d), { sound: false, enabled: () => this.playing }));
        return f;
      });
      m.appendChild(U.el('div', 'mz-exit', '🚪 出口'));
      this.i = 0;
      this.mark();
      this.setGoLabel('點門選擇路線');
    }

    mark() { this.forks.forEach((f, k) => { f.el.classList.toggle('cur', k === this.i); f.el.classList.toggle('later', k > this.i); }); }

    layout() { this.forks.forEach(f => U.fit(f.el.querySelector('.mz-t'), 0.5)); }

    choose(f, v, door) {
      if (!this.playing || f !== this.forks[this.i] || door.classList.contains('dead')) return;
      if (v === f.it.a) {
        f.done = true; door.classList.add('go'); f.el.classList.add('done');
        LG.audio.play('select');
        this.i++;
        this.mark();
        if (this.i >= this.forks.length) { this.scr.main.querySelector('.mz-exit').classList.add('open'); this.submit(true); }
        return;
      }
      door.classList.add('dead');
      door.innerHTML = '🧱<small>死路</small>';
      this.submit(false);
    }

    celebrate() {
      const p = this.zone.fx.rel(this.scr.main.querySelector('.mz-exit'));
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() {
      this.forks.forEach(f => {
        f.el.classList.remove('later');
        f.el.querySelector('.mz-door.' + (f.it.a ? 'o' : 'x')).classList.add(f.done ? 'go' : 'answer');
      });
    }
  }

  L17.compose = compose;
  L17.meta = { id: 17, name: '迷宮岔路', unit: 0, topic: '' };
  LG.registerLevel(L17);
  LG.bank.level('maze', L17);
})(window.LG);
