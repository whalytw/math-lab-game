/* 數學實驗室 — 共用工具 */
'use strict';
window.LG = window.LG || {};

(function (LG) {
  const U = {};

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  U.ease = {
    inQuad: t => t * t,
    outQuad: t => 1 - (1 - t) * (1 - t),
    inCubic: t => t * t * t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: t => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
  };

  U.el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  U.esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* KaTeX 排版（失敗時退回純文字） */
  U.tex = (s, display) => {
    try {
      return window.katex.renderToString(s, { throwOnError: false, displayMode: !!display, strict: 'ignore', output: 'html' });
    } catch (e) {
      return U.esc(s);
    }
  };

  /* 文字中以 $...$ 包住的部分排成數學式，\n 換行 */
  U.rich = s => {
    let out = '', i = 0;
    s = String(s);
    while (i < s.length) {
      if (s[i] === '$') {
        const j = s.indexOf('$', i + 1);
        if (j < 0) { out += U.esc(s.slice(i)); break; }
        out += U.tex(s.slice(i + 1, j), false);
        i = j + 1;
        continue;
      }
      let j = i;
      while (j < s.length && s[j] !== '$') j++;
      out += U.esc(s.slice(i, j)).replace(/\n/g, '<br>');
      i = j;
    }
    return out;
  };

  /* 內容太多時逐步縮小字級，確保不需要捲動 */
  U.fit = (el, min, widthOnly) => {
    if (!el || !el.parentElement) return;
    min = min || 0.62;
    el.style.fontSize = '';
    const over = () => el.scrollWidth > el.clientWidth + 1 || (!widthOnly && el.scrollHeight > el.clientHeight + 1);
    if (!over()) return;
    const pf = parseFloat(getComputedStyle(el.parentElement).fontSize) || 16;
    const f = (parseFloat(getComputedStyle(el).fontSize) || pf) / pf;
    let s = 1, guard = 0;
    while (over() && s > min && guard++ < 24) {
      s -= 0.04;
      el.style.fontSize = (f * s).toFixed(3) + 'em';
    }
  };

  /* 題目抽選：避開最近幾次（跨三區）出現過的題目 */
  const recent = {};
  U.pickFresh = (bucket, list, keyFn, memory) => {
    const r = recent[bucket] || (recent[bucket] = []);
    const mem = Math.min(memory == null ? 4 : memory, Math.max(0, list.length - 1));
    let cands = list.filter(q => !r.includes(keyFn(q)));
    if (!cands.length) cands = list;
    const q = U.pick(cands);
    r.push(keyFn(q));
    while (r.length > mem) r.shift();
    return q;
  };

  /* 分數字串 → TeX：'3/2' → \dfrac{3}{2} */
  U.fracTex = (v, d) => {
    v = String(v);
    const neg = v[0] === '-';
    const body = neg ? v.slice(1) : v;
    if (body.includes('/')) {
      const [n, m] = body.split('/');
      return (neg ? '-' : '') + (d === false ? `\\frac{${n}}{${m}}` : `\\dfrac{${n}}{${m}}`);
    }
    return v;
  };

  /* 版本號：設定頁會顯示，用來確認電腦上跑的是不是最新檔案 */
  LG.VERSION = '2026-11-14h';

  U.UNIT_HEX = {
    1: '#6fc3ff', 2: '#a58bff', 3: '#ff7eb8', 4: '#c9e45c', 5: '#ffb547',
    6: '#ff8f73', 7: '#4fe0b0', 8: '#46d9e6', 9: '#e79bff', 10: '#f0e68c'
  };

  /* π 的倍數刻度（三角函數圖形用）：k 為 π/den 的倍數 */
  U.piLabel = (k, den) => {
    let n = k, d = den;
    const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
    const c = g(n, d) || 1; n /= c; d /= c;
    if (n === 0) return '0';
    const sg = n < 0 ? '−' : '', an = Math.abs(n);
    const num = an === 1 ? 'π' : an + 'π';
    return sg + (d === 1 ? num : num + '/' + d);
  };

  LG.util = U;
})(window.LG);
