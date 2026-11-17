/* 打地鼠（用配對題的算式）
   6 個洞，地鼠頂著「算式＝值」的牌子輪流冒出來；只敲「正確」的地鼠，敲到 2 隻就過關。
   敲到錯誤的地鼠算答錯一次。4 個算式中 2 個正確、2 個錯誤（錯誤的把值換成同單元其他算式的值）。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const NEED = 2, HOLES = 6;

  function compose(chosen, ctx) {
    const MK = LG.matchKit;
    const items = U.shuffle(chosen.slice(0, 4)), out = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i], lab = MK.labelOf(it.p);
      if (i < 2) { out.push({ tex: it.tex, v: it.v, p: it.p, show: it.v, ok: true, lab }); continue; }
      const w = MK.wrongValue(it, items, ctx.pool);
      if (w == null) return null;
      out.push({ tex: it.tex, v: it.v, p: it.p, show: w, ok: false, lab });
    }
    const p0 = items.map(it => MK.ctxOf(it.p)).find(Boolean) || '';
    const hints = [...new Set(items.map(o => o.h).filter(Boolean))].slice(0, 2);
    return {
      key: out.map(o => o.tex).join('|'),
      items: out,
      prompt: `敲「正確」的地鼠！敲到 ${NEED} 隻就過關` + (p0 ? `　${p0}` : ''),
      hint: hints.length ? hints.join('\n') : '牌子上的算式算一算，值對了才敲',
      explain: '正確的：' + out.filter(o => o.ok).map(MK.factTex).join('；') + '。錯誤的：' +
        out.filter(o => !o.ok).map(o => `$${MK.T(o.tex)}$ 的${o.lab || '值'}應為 $${MK.vt(o.v)}$`).join('；')
    };
  }

  class L14 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt) + `<span class="l3-prog">已敲到 <b>0</b>／${NEED}</span>`);
      this.how = '地鼠冒出來時，點牌子正確的那一隻';
      const MK = LG.matchKit;
      const m = scr.main;
      m.classList.add('l14');
      this.holes = [];
      for (let i = 0; i < HOLES; i++) {
        const el = U.el('div', 'ml-hole', '<div class="ml-mole"><div class="ml-sign"><div class="sl-in"></div></div><i class="ml-face"></i></div><i class="ml-pit"></i>');
        m.appendChild(el);
        const h = { el, mole: el.querySelector('.ml-mole'), sign: el.querySelector('.sl-in'), item: null, t: 0, life: 0 };
        LG.input.onTap(h.mole, () => this.bonk(h), { sound: false, enabled: () => this.playing });
        this.holes.push(h);
      }
      this.pool = q.items.map(it => Object.assign({ gone: false }, it));
      this.pool.forEach(it => { it.html = MK.cardHTML(it.tex, it.show, it.lab); });
      this.hits = 0;
      this.next = 0.4;
      this.setGoLabel('點正確的地鼠');
    }

    layout() {
      this.holes.forEach(h => { if (h.item) U.fit(h.sign, 0.45, true); });
    }

    /* 讓一隻地鼠從空洞冒出來（不和已經冒出來的重複） */
    pop() {
      const empty = this.holes.filter(h => !h.item);
      const up = this.holes.filter(h => h.item).map(h => h.item);
      const cand = this.pool.filter(it => !it.gone && !up.includes(it));
      if (!empty.length || !cand.length) return;
      // 正確的地鼠至少佔一半的出場機會
      const goodC = cand.filter(it => it.ok), it = goodC.length && Math.random() < 0.55 ? U.pick(goodC) : U.pick(cand);
      const h = U.pick(empty);
      h.item = it; h.t = 0; h.life = U.rand(2.4, 3.1);
      h.sign.innerHTML = it.html;
      h.el.classList.remove('hit', 'bad');
      h.el.classList.add('up');
      requestAnimationFrame(() => U.fit(h.sign, 0.45, true));
    }

    hide(h) { h.item = null; h.el.classList.remove('up'); }

    bonk(h) {
      if (!this.playing || !h.item || h.done) return;
      const it = h.item;
      if (it.ok) {
        it.gone = true;
        h.el.classList.add('hit');
        LG.audio.play('coin');
        this.hits++;
        this.scr.q.querySelector('.l3-prog b').textContent = this.hits;
        const o = this.zone.fx.rel(h.el);
        this.zone.fx.burst(o.x, o.y, { n: 16, colors: [LG.TC('ok'), '#ffffff'], speed: [100, 300], gravity: 500 });
        this.zone.after(0.35, () => this.hide(h));
        if (this.hits >= NEED) this.submit(true);
        return;
      }
      it.gone = true;
      h.el.classList.add('bad');
      this.zone.after(0.6, () => this.hide(h));
      this.submit(false);
    }

    update(dt) {
      if (!this.playing) return;
      this.next -= dt;
      for (const h of this.holes) {
        if (!h.item || h.el.classList.contains('hit') || h.el.classList.contains('bad')) continue;
        h.t += dt;
        if (h.t > h.life) this.hide(h);
      }
      const up = this.holes.filter(h => h.item).length;
      if (this.next <= 0 && up < 2) { this.pop(); this.next = U.rand(0.5, 0.9); }
    }

    celebrate() {
      const p = this.zone.fx.rel(this.scr.main);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() {
      // 把剩下的正確地鼠都叫出來，標成正解
      this.holes.forEach(h => this.hide(h));
      const good = this.pool.filter(it => it.ok && !it.gone);
      good.forEach((it, k) => {
        const h = this.holes[k * 2 + 1] || this.holes[k];
        h.item = it; h.sign.innerHTML = it.html; h.el.classList.add('up', 'answer');
        requestAnimationFrame(() => U.fit(h.sign, 0.45, true));
      });
    }
  }

  L14.compose = compose;
  L14.meta = { id: 14, name: '打地鼠', unit: 0, topic: '' };
  LG.registerLevel(L14);
  LG.bank.level('mole', L14);
})(window.LG);
