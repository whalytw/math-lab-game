/* 切切樂（用配對題的算式）
   4 個泡泡在畫面上輕輕飄動，每個泡泡寫著「算式＝值」。每關隨機是以下兩種之一：
   「切對的」：只有 1 個正確，把它切開；「切錯的」：只有 1 個錯誤，把它切開。
   用手指劃過泡泡就能切開；切到其他泡泡算答錯一次（和拆彈小組一樣）。
   題庫：直接用各單元的配對題（{ tex, v, h, p }），錯誤的泡泡把值換成同單元其他算式的值。
   這裡的「配對題工具」（LG.matchKit）也給翻牌記憶、打地鼠、數字賓果、天平平衡共用。 */
'use strict';
(function (LG) {
  const U = LG.util;

  /* 「它的斜率」→ 第二行寫「斜率 −2」；「它的值」「它的極限」等直接寫「＝ 值」 */
  const EQ = ['', '值', '極限', '極限值', '和', '弳度'];
  const labelOf = p => {
    const s = String(p || '').replace(/（.*）$/, '');
    if (/^與它相等/.test(s)) return '';
    const l = s.replace(/^它的/, '').replace(/^原點到它的距離$/, '到原點的距離');
    return EQ.includes(l) ? '' : l;
  };
  const ctxOf = p => { const m = String(p || '').match(/（(.*)）$/); return m ? m[1] : ''; };
  /* 簡單的數值（整數、分數、小數）轉成數字，用來判斷兩個值是否其實相等 */
  const num = v => {
    const s = String(v).trim();
    if (/^-?\d+(\.\d+)?$/.test(s)) return +s;
    const m = s.match(/^(-?\d+)\/(\d+)$/);
    return m ? +m[1] / +m[2] : null;
  };
  const same = (a, b) => {
    if (String(a) === String(b)) return true;
    const x = num(a), y = num(b);
    return x != null && y != null && Math.abs(x - y) < 1e-9;
  };
  const vt = v => U.fracTex(v).replace(/\\d?frac/g, '\\dfrac');   // 值用大分數，學生站遠也看得清楚
  const T = s => String(s).replace(/\\dfrac/g, '\\frac');
  /* 給某個算式找一個「錯誤的值」：同單元、同一種問法的其他值（不能剛好等於正確值） */
  const wrongValue = (it, items, pool) => {
    const lab = labelOf(it.p);
    const c = U.shuffle([...new Set(items.concat(pool || []).filter(o => labelOf(o.p) === lab).map(o => String(o.v)))]).filter(v => !same(v, it.v));
    return c.length ? c[0] : null;
  };
  /* 泡泡、卡片上的兩行字：算式＋「＝ 值」或「斜率 值」 */
  const cardHTML = (tex, v, lab) => `<div class="sl-ex">${U.tex(T(tex))}</div><div class="sl-v">${lab ? `<span class="sl-lab">${lab}</span> ${U.tex(vt(v))}` : U.tex('=' + vt(v))}</div>`;
  /* 一個算式的「正確敘述」TeX（解說用） */
  const factTex = it => { const lab = labelOf(it.p); return lab ? `$${T(it.tex)}$ 的${lab}是 $${vt(it.v)}$` : `$${T(it.tex)}=${vt(it.v)}$`; };
  LG.matchKit = { labelOf, ctxOf, num, same, vt, T, wrongValue, cardHTML, factTex };

  /* 題庫中樞給 4 個算式；第 1 個是要切的那一個 */
  function compose(chosen, ctx) {
    const pickRight = Math.random() < 0.5;          // true：切唯一正確的；false：切唯一錯誤的
    const items = U.shuffle(chosen.slice());
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i], lab = labelOf(it.p), truth = pickRight ? i === 0 : i !== 0;
      if (truth) { out.push({ tex: it.tex, v: it.v, p: it.p, show: it.v, ok: true, hit: i === 0, lab, h: it.h }); continue; }
      const w = wrongValue(it, items, ctx.pool);
      if (w == null) return null;
      out.push({ tex: it.tex, v: it.v, p: it.p, show: w, ok: false, hit: i === 0, lab, h: it.h });
    }
    const p0 = items.map(it => ctxOf(it.p)).find(Boolean) || '';
    const hints = [...new Set(out.map(o => o.h).filter(Boolean))].slice(0, 2);
    const tgt = out[0];
    return {
      key: out.map(o => o.tex).join('|'),
      items: U.shuffle(out),
      mode: pickRight ? 'right' : 'wrong',
      prompt: (pickRight ? '4 個泡泡中只有 1 個「正確」，把它切開！' : '4 個泡泡中只有 1 個「錯誤」，把它切開！') + (p0 ? `　${p0}` : ''),
      hint: hints.length ? hints.join('\n') : '逐一算算看，算式的值和泡泡上寫的一樣才是正確的',
      explain: pickRight ? `正確的是：${factTex(tgt)}` : `錯誤的是 $${T(tgt.tex)}$：它的${tgt.lab || '值'}應為 $${vt(tgt.v)}$`
    };
  }

  /* 切開的泡泡：沿著劃過的方向分成兩半（clip-path） */
  function halves(el, ang) {
    const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c, k = 160;
    const P = (x, y) => `${(50 + x).toFixed(1)}% ${(50 + y).toFixed(1)}%`;
    const poly = sg => `polygon(${P(c * k, s * k)}, ${P(-c * k, -s * k)}, ${P(-c * k + sg * nx * k, -s * k + sg * ny * k)}, ${P(c * k + sg * nx * k, s * k + sg * ny * k)})`;
    return [1, -1].map(sg => {
      const h = el.cloneNode(true);
      h.classList.add('half');
      h.style.clipPath = poly(sg);
      h.dataset.sg = sg;
      el.parentNode.appendChild(h);
      return h;
    });
  }

  class L9 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 2.3;
      this.setQuestion(U.rich(q.prompt));
      this.how = '手指快速劃過泡泡，就能把它切開';
      const m = scr.main;
      m.classList.add('l9');
      m.innerHTML = '<div class="sl-field"><canvas class="w-blade sl-blade"></canvas></div>';
      this.field = m.querySelector('.sl-field');
      this.blade = m.querySelector('.sl-blade');
      this.bctx = this.blade.getContext('2d');
      this.pills = q.items.map((it, i) => {
        const el = U.el('div', 'sl-pill', `<div class="sl-in">${cardHTML(it.tex, it.show, it.lab)}</div>`);
        this.field.appendChild(el);
        return { i, it, el, ph: U.rand(0, 6.28), sp: U.rand(0.7, 1.1), cut: false, x: 0, y: 0, w: 0, h: 0, acc: 0, rot: 0 };
      });
      this.cutN = 0;
      this.trail = [];
      this.t = 0;
      this.setGoLabel('<span class="sc">✂</span> 用手指劃過泡泡來切開');
      LG.input.onDrag(this.field, {
        down: (e, p) => {
          if (!this.playing) return false;
          this.stroke = { last: p, len: 0, done: false };
          this.pills.forEach(pl => { pl.acc = 0; });
          this.sid = (this.sid || 0) + 1;
          this.addTrail(p);
        },
        move: (e, p) => this.onMove(p),
        up: () => { this.stroke = null; },
        cancel: () => { this.stroke = null; }
      });
    }

    layout() {
      const r = this.field.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      this.W = r.width; this.H = r.height;
      const s = Math.min(this.scale(), 2);
      this.bs = s;
      this.blade.width = Math.round(r.width * s);
      this.blade.height = Math.round(r.height * s);
      const w = r.width * 0.47, h = Math.min(r.height * 0.38, w * 0.62);
      this.pills.forEach((pl, k) => {
        pl.w = w; pl.h = h;
        pl.bx = r.width * (k % 2 ? 0.745 : 0.255);
        pl.by = r.height * (k < 2 ? 0.25 : 0.73);
        pl.el.style.width = w + 'px'; pl.el.style.height = h + 'px';
        // 先依寬度縮字；算式太高（例如 Σ、分數）時再依泡泡高度縮小
        const inn = pl.el.querySelector('.sl-in');
        U.fit(inn, 0.5, true);
        let fs = parseFloat(getComputedStyle(inn).fontSize), g = 0;
        while (inn.scrollHeight > h * 0.94 && g++ < 20) { fs *= 0.94; inn.style.fontSize = fs.toFixed(2) + 'px'; }
      });
      this.place();
    }

    /* 泡泡輕輕飄動（幅度小，字仍然好讀） */
    place() {
      if (!this.W) return;
      const t = this.t;
      for (const pl of this.pills) {
        if (pl.cut) continue;
        pl.x = pl.bx + Math.sin(t * 0.9 * pl.sp + pl.ph) * this.W * 0.018;
        pl.y = pl.by + Math.sin(t * 1.3 * pl.sp + pl.ph * 1.7) * this.H * 0.022;
        pl.rot = Math.sin(t * 0.8 + pl.ph) * 2.2;
        pl.el.style.transform = `translate(${(pl.x - pl.w / 2).toFixed(1)}px, ${(pl.y - pl.h / 2).toFixed(1)}px) rotate(${pl.rot.toFixed(2)}deg)`;
      }
    }

    /* 點 p 在泡泡（膠囊形）裡面嗎？ */
    inside(pl, p) {
      const dx = Math.abs(p.x - pl.x), dy = Math.abs(p.y - pl.y), hw = pl.w / 2, hh = pl.h / 2;
      if (dx > hw || dy > hh) return false;
      if (dx <= hw - hh) return true;
      return Math.hypot(dx - (hw - hh), dy) <= hh;
    }

    addTrail(p) { this.trail.push({ x: p.x, y: p.y, age: 0, sid: this.sid }); }

    onMove(p) {
      this.addTrail(p);
      const st = this.stroke;
      if (!st || st.done || !this.playing) return;
      const a = st.last, seg = Math.hypot(p.x - a.x, p.y - a.y);
      st.last = p;
      if (seg < 0.5) return;
      // 這一段在泡泡裡走了多長（取 4 個點估計）；在同一個泡泡裡累積超過泡泡高度的 6 成就算切開
      for (const pl of this.pills) {
        if (pl.cut) continue;
        let n = 0;
        for (let k = 1; k <= 4; k++) { const t = k / 4; if (this.inside(pl, { x: a.x + (p.x - a.x) * t, y: a.y + (p.y - a.y) * t })) n++; }
        if (!n) continue;
        pl.acc += seg * n / 4;
        if (pl.acc >= pl.h * 0.6) { st.done = true; this.slice(pl, Math.atan2(p.y - a.y, p.x - a.x)); break; }
      }
    }

    slice(pl, ang) {
      pl.cut = true;
      LG.audio.play('cut');
      const o = this.zoff(this.field);
      const good = pl.it.hit;
      this.zone.fx.burst(o.x + pl.x, o.y + pl.y, { n: 20, colors: good ? [LG.TC('ok'), '#ffffff', LG.TC('warn')] : [LG.TC('bad'), '#ffd0d5'], speed: [120, 360], gravity: 600 });
      // 一分為二、往兩邊掉落
      pl.el.style.visibility = 'hidden';
      const hs = halves(pl.el, ang);
      hs.forEach(h => {
        h.classList.add(good ? 'good' : 'bad');
        h.style.visibility = 'visible';
        const sg = +h.dataset.sg, nx = -Math.sin(ang) * sg, ny = Math.cos(ang) * sg;
        requestAnimationFrame(() => {
          h.style.transform = `translate(${(pl.x - pl.w / 2 + nx * pl.w * 0.28).toFixed(1)}px, ${(pl.y - pl.h / 2 + ny * pl.h * 0.5 + this.H * 0.12).toFixed(1)}px) rotate(${(pl.rot + sg * 14).toFixed(1)}deg)`;
          h.style.opacity = '0';
        });
        setTimeout(() => h.remove(), 900);
      });
      if (good) { this.submit(true); return; }
      // 切錯：留下一個 ✗ 記號
      const mk = U.el('div', 'sl-mark bad', '✗');
      mk.style.left = pl.x + 'px'; mk.style.top = pl.y + 'px';
      this.field.appendChild(mk);
      this.submit(false);
    }

    celebrate() {
      // 其他泡泡淡出
      this.pills.forEach(pl => { if (!pl.cut) pl.el.classList.add('dim'); });
      const p = this.zone.fx.rel(this.field);
      this.zone.fx.confetti(p.x, p.y, { n: 36 });
    }

    reveal() {
      this.pills.forEach(pl => {
        if (pl.cut) return;
        pl.el.classList.add(pl.it.hit ? 'answer' : 'dim');
      });
    }

    update(dt) {
      this.t += dt;
      this.place();
      this.drawTrail(dt);
    }

    drawTrail(dt) {
      const g = this.bctx;
      if (!this.trail.length) {
        if (this.trailDirty) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.blade.width, this.blade.height); this.trailDirty = false; }
        return;
      }
      for (const p of this.trail) p.age += dt;
      while (this.trail.length && this.trail[0].age > 0.22) this.trail.shift();
      const s = this.bs || 1;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, this.blade.width, this.blade.height);
      g.setTransform(s, 0, 0, s, 0, 0);
      g.lineCap = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const a = this.trail[i - 1], b = this.trail[i];
        if (a.sid !== b.sid) continue;
        const k = 1 - b.age / 0.22;
        g.strokeStyle = `rgba(${LG.TC('trail')}, ${(0.9 * k).toFixed(3)})`;
        g.lineWidth = Math.max(2, this.W * 0.012 * k);
        g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
      }
      this.trailDirty = true;
    }
  }
  L9.compose = compose;
  L9.meta = { id: 9, name: '切切樂', unit: 0, topic: '' };
  LG.registerLevel(L9);
  LG.bank.level('slice', L9);
})(window.LG);
