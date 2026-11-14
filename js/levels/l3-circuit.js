/* 第 3 關｜電路接線（單元 6：對數的定義、對數律、換底公式）
   左邊 3 個算式、右邊 4 個數值（1 個用不到），把算式拖線接到它的值。 */
'use strict';
(function (LG) {
  const U = LG.util;
  // 干擾選項（用不到的值）
  const DIST = {
    easy: ['-3', '-1', '0', '1', '2', '3', '4', '5', '-2'],
    normal: ['-3', '-2', '-1', '0', '1', '2', '3', '4', '1/2', '3/2', '1/3', '2/3', '-1/2'],
    hard: ['-2', '-1', '0', '1', '2', '3', '6', '9', '1/6', '1/2', '3/2', '-1/2', '-3/2', '5/2', '1/3']
  };
  const TYPE_HINT = {
    def: '定義：$\\log_a b=x \\iff a^{x}=b$',
    law: '對數律：$\\log r+\\log s=\\log rs$，$\\log r-\\log s=\\log\\frac{r}{s}$，$t\\log r=\\log r^{t}$',
    chg: '換底：$\\log_a b=\\frac{\\log b}{\\log a}$，連乘時可以約分',
    pow: '$a^{\\log_a b}=b$'
  };

  /* 題庫中樞給 3 個值互不相同的算式；干擾值優先從同單元其他算式的值挑，不夠時用預設清單 */
  function compose(chosen, ctx) {
    const used = chosen.map(c => c.v);
    let dpool = [...new Set(ctx.pool.map(it => it.v))].filter(v => !used.includes(v));
    if (!dpool.length) dpool = (DIST[ctx.diff] || DIST.normal).filter(v => !used.includes(v));
    const dist = U.pick(dpool);
    const hints = [...new Set(chosen.map(c => c.h || TYPE_HINT[c.t]).filter(Boolean))];
    const ask = chosen[0].p && chosen.every(c => c.p === chosen[0].p) ? chosen[0].p : '';
    return {
      key: chosen.map(c => c.tex).join('|'),
      items: chosen,
      values: U.shuffle(used.concat([dist])),
      dist,
      prompt: ask ? `把左邊每一項拖線接到${ask}（右邊有一個用不到）` : '',
      hint: hints.join('\n'),
      explain: chosen.map(c => `$${c.tex.replace(/\\dfrac/g, '\\frac')}=${U.fracTex(c.v, false)}$`).join('；')
    };
  }

  class L3 extends LG.LevelBase {

    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt || '把左邊每個算式拖線接到它的值（右邊有一個值用不到）') +
        '<span class="l3-prog">已接通 <b>0</b>／3</span>');
      const m = scr.main;
      m.classList.add('l3');
      m.innerHTML = `<div class="board"><svg class="c-svg"></svg><div class="col col-l"></div><div class="col col-r"></div></div>`;
      this.board = m.querySelector('.board');
      this.svg = m.querySelector('.c-svg');
      const colL = m.querySelector('.col-l'), colR = m.querySelector('.col-r');
      this.left = q.items.map((it, i) => {
        const el = U.el('div', 'sock sock-l', `<div class="sx">${U.tex(it.tex)}</div><i class="plug"></i>`);
        colL.appendChild(el);
        return { side: 'l', i, el, v: it.v, done: false };
      });
      this.right = q.values.map((v, j) => {
        const el = U.el('div', 'sock sock-r', `<i class="plug"></i><div class="sx">${U.tex(U.fracTex(v))}</div><i class="bulb"></i>`);
        colR.appendChild(el);
        return { side: 'r', i: j, el, v, done: false };
      });
      this.links = [];
      this.drag = null;
      this.count = 0;
      this.setGoLabel('拖曳連線來作答');
      LG.input.onDrag(this.board, {
        down: (e, p) => this.onDown(p),
        move: (e, p) => this.onMove(p),
        up: () => this.onUp(),
        cancel: () => this.retract()
      });
    }

    layout() {
      const b = this.board.getBoundingClientRect();
      if (b.width < 4) return;
      this.bw = b.width; this.bh = b.height;
      this.svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
      const geo = s => {
        const r = s.el.getBoundingClientRect();
        s.rect = { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
        s.plug = s.side === 'l' ? { x: s.rect.x + s.rect.w, y: s.rect.y + s.rect.h / 2 } : { x: s.rect.x, y: s.rect.y + s.rect.h / 2 };
      };
      this.left.forEach(geo);
      this.right.forEach(geo);
      this.left.concat(this.right).forEach(s => U.fit(s.el.querySelector('.sx'), 0.5, true));
      this.render();
    }

    hit(list, p) {
      const k = LG.settings.hitScale();
      for (const s of list) {
        const r = s.rect;
        if (!r) continue;
        const ex = r.w * (k - 1) / 2 + 4, ey = r.h * (k - 1) / 2 + 4;
        if (p.x >= r.x - ex && p.x <= r.x + r.w + ex && p.y >= r.y - ey && p.y <= r.y + r.h + ey) return s;
      }
      return null;
    }

    onDown(p) {
      if (!this.playing) return false;
      const s = this.hit(this.left, p) || this.hit(this.right, p);
      if (!s || s.done) return false;
      this.drag = { from: s, x: p.x, y: p.y, hover: null };
      s.el.classList.add('active');
      LG.audio.play('plug');
      this.render();
    }

    onMove(p) {
      const d = this.drag;
      if (!d) return;
      d.x = p.x; d.y = p.y;
      const other = d.from.side === 'l' ? this.right : this.left;
      const h = this.hit(other, p);
      const hv = h && !h.done ? h : null;
      if (hv !== d.hover) {
        if (d.hover) d.hover.el.classList.remove('hover');
        if (hv) hv.el.classList.add('hover');
        d.hover = hv;
      }
      this.render();
    }

    onUp() {
      const d = this.drag;
      if (!d) return;
      if (d.hover && this.playing) {
        const a = d.from.side === 'l' ? d.from : d.hover;
        const b = d.from.side === 'l' ? d.hover : d.from;
        this.clearDrag();
        this.connect(a, b);
      } else this.retract();
    }

    clearDrag() {
      const d = this.drag;
      if (!d) return;
      d.from.el.classList.remove('active');
      if (d.hover) d.hover.el.classList.remove('hover');
      this.drag = null;
    }

    retract() {
      const d = this.drag;
      if (!d) return;
      this.retractAnim = { from: d.from, x: d.x, y: d.y, t: 0 };
      this.clearDrag();
    }

    connect(a, b) {
      const ok = a.v === b.v;
      if (ok) {
        a.done = b.done = true;
        a.el.classList.add('done'); b.el.classList.add('done');
        this.links.push({ a, b, state: 'ok' });
        this.count++;
        LG.audio.play('plug');
        this.scr.q.querySelector('.l3-prog b').textContent = String(this.count);
        const o = this.zoff(this.board);
        this.zone.fx.burst(o.x + b.plug.x, o.y + b.plug.y, { n: 16, colors: [U.UNIT_HEX[this.zone.meta.unit] || '#fff', '#fff6c0'], speed: [80, 300], gravity: 200 });
        if (this.count === 3) this.submit(true);
        this.render();
        return;
      }
      this.flash = { a, b, t: 0 };
      this.lastWrong = { a, b };
      const r = this.submit(false);
      if (r === 'retry') {
        a.el.classList.add('bad'); b.el.classList.add('bad');
        setTimeout(() => { a.el.classList.remove('bad'); b.el.classList.remove('bad'); }, 650);
      }
      this.render();
    }

    celebrate() {
      this.links.forEach(l => { l.state = 'flow'; });
      this.right.forEach(s => { if (s.done) s.el.classList.add('lit'); });
      LG.audio.play('zap');
      const p = this.zone.fx.rel(this.board);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
      this.render();
    }

    reveal() {
      this.clearDrag();
      for (const a of this.left) {
        if (a.done) continue;
        const b = this.right.find(s => s.v === a.v);
        this.links.push({ a, b, state: 'answer' });
        b.el.classList.add('answer');
        a.el.classList.add('answer');
      }
      this.render();
    }

    path(ax, ay, bx, by) {
      const dx = Math.max(30, Math.abs(bx - ax) * 0.45);
      const sgn = bx >= ax ? 1 : -1;
      return `M${ax.toFixed(1)} ${ay.toFixed(1)}C${(ax + dx * sgn).toFixed(1)} ${ay.toFixed(1)} ${(bx - dx * sgn).toFixed(1)} ${by.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    }

    render() {
      if (!this.bw) return;
      const sw = Math.max(3, this.bw * 0.011);
      let h = '';
      const wire = (d, cls) => {
        h += `<path d="${d}" class="cw-shadow" stroke-width="${(sw * 2).toFixed(1)}"/>`;
        h += `<path d="${d}" class="cw ${cls}" stroke-width="${sw.toFixed(1)}"/>`;
      };
      for (const l of this.links) wire(this.path(l.a.plug.x, l.a.plug.y, l.b.plug.x, l.b.plug.y), l.state);
      if (this.flash) {
        const f = this.flash;
        wire(this.path(f.a.plug.x, f.a.plug.y, f.b.plug.x, f.b.plug.y), 'bad');
      }
      if (this.drag) {
        const d = this.drag, s = d.from.plug;
        const tx = d.hover ? d.hover.plug.x : d.x, ty = d.hover ? d.hover.plug.y : d.y;
        wire(d.from.side === 'l' ? this.path(s.x, s.y, tx, ty) : this.path(tx, ty, s.x, s.y), 'live');
        h += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(sw * 1.6).toFixed(1)}" class="cw-tip"/>`;
      }
      if (this.retractAnim) {
        const r = this.retractAnim, s = r.from.plug, k = U.ease.outCubic(U.clamp(r.t / 0.2, 0, 1));
        const tx = U.lerp(r.x, s.x, k), ty = U.lerp(r.y, s.y, k);
        wire(r.from.side === 'l' ? this.path(s.x, s.y, tx, ty) : this.path(tx, ty, s.x, s.y), 'live');
      }
      this.svg.innerHTML = h;
    }

    update(dt) {
      let dirty = false;
      if (this.flash) {
        this.flash.t += dt;
        if (this.flash.t > 0.65) { this.flash = null; }
        dirty = true;
      }
      if (this.retractAnim) {
        this.retractAnim.t += dt;
        if (this.retractAnim.t > 0.2) this.retractAnim = null;
        dirty = true;
      }
      if (dirty) this.render();
    }
  }

  L3.meta = { id: 3, name: '電路接線', unit: 6, topic: '對數定義與對數律' };
  L3.DIST = DIST;
  L3.compose = compose;
  LG.registerLevel(L3);
  LG.bank.level('match', L3);
})(window.LG);
