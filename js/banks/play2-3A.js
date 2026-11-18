/* 二上A版（數學 3A）第 2 批新玩法題目：估算飛鏢、數線塗色、分類收納、找錯偵探、計算接力、投籃瞄準、圖形對對碰、拖點作圖
   必須在 3B.js 之前載入（B版用 copy() 沿用）。標籤：單元 2 含餘弦、正切的標 'cos'、'tan'；單元 8 的分點題標 '分點'。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('3A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, sample, chance, fail, fr, par, poly, term, xm, rad, sqrtTex, E, Sfrom, B, F, CH, SH, GM, BD } = K;
  const sg = n => (n < 0 ? String(n) : '+' + n);
  const fac = (a, v) => (a ? `(${xm(a, v)})` : (v || 'x'));
  const $ = s => `$${s}$`;
  const D2R = Math.PI / 180;
  const pickBins = (cands, nb, n) => {
    const uniq = [...new Map(cands.map(c => [c[0], c])).values()];
    for (let t = 0; t < 30; t++) { const s = sample(uniq, n || 4); if ([...Array(nb).keys()].every(b => s.some(c => c[1] === b))) return s; }
    return fail();
  };
  const opts3 = (right, wrongs) => { const w = [...new Set(wrongs.map(String))].filter(x => x !== String(right)); if (w.length < 2) fail(); return [String(right), w[0], w[1]]; };
  const lineTex = (a, b, c) => `${term(a, 'x', 1, true)}${term(b, 'y', 1, !a)}=${c}`;
  const WIN = [-6.5, 6.5, -6.5, 6.5];
  const lb = (b, x) => Math.log(x) / Math.log(b);

  /* ================= 單元 1 弧度量 ================= */
  add(1, 'estimate', [
    G(() => { const d = pick([20, 40, 50, 70, 100, 130, 160, 200, 250, 300, 340]);
      return E(`$${d}^{\\circ}$ 是幾弳？把飛鏢射到數線上`, `${d}^{\\circ}`, d * D2R, 0, 7, 0.12, '$1$ 弳 $\\approx57.3^{\\circ}$，$\\pi\\approx3.14$ 弳 $=180^{\\circ}$', `$${d}^{\\circ}=${d}\\times\\frac{\\pi}{180}\\approx${(d * D2R).toFixed(2)}$ 弳`); })
  ]);
  add(1, 'bins', [
    G(() => { const c = [];
      [0.5, 1, 1.2, 1.5].forEach(r => c.push([String(r), 0]));
      [2, 2.5, 3].forEach(r => c.push([String(r), 1]));
      [['\\dfrac{\\pi}{3}', 0], ['\\dfrac{\\pi}{5}', 0], ['\\dfrac{2\\pi}{3}', 1], ['\\dfrac{3\\pi}{4}', 1], ['80^{\\circ}', 0], ['100^{\\circ}', 1], ['\\dfrac{5\\pi}{12}', 0], ['\\dfrac{7\\pi}{12}', 1]].forEach(x => c.push(x));
      return B('這個角是銳角還是鈍角？（沒有寫度的是弳）', ['銳角', '鈍角'], pickBins(c, 2), '直角 $=\\frac{\\pi}{2}\\approx1.57$ 弳', '小於 $\\frac{\\pi}{2}\\approx1.57$ 是銳角，介於 $\\frac{\\pi}{2}$ 和 $\\pi$ 之間是鈍角'); })
  ]);
  add(1, 'chain', [
    G(() => { const r = ri(2, 6), t = pick([1, 2, 3]), A = r * t, Bv = 2 * r + A, C = r * r * t / 2;
      if (!Number.isInteger(C)) fail();
      return CH(`半徑 $${r}$、圓心角 $${t}$ 弳的扇形。3 道鎖：`, [
        [`弧長 $s=$？`, ...opts3(A, [r + t, A * 2, r * r * t]).map($)],
        ['周長（兩條半徑＋弧長）$=$？', ...opts3(Bv, [r + A, Bv + r, 2 * A]).map($)],
        ['面積 $=\\frac12rs=$？', ...opts3(C, [r * A, C * 2, A / 2]).map($)]
      ], '$s=r\\theta$，$A=\\frac12r^{2}\\theta=\\frac12rs$', `$s=${A}$、周長 $${Bv}$、面積 $${C}$`); })
  ]);

  /* ================= 單元 2 三角函數的圖形 ================= */
  const trigE = (n, f, tag) => G(() => { const x = pick([1, 2, 3, 4, 5, 6, 0.5, 2.5]);
    return E(`把飛鏢射到 $\\${n} ${x}$ 的位置（角度單位是弳）`, `\\${n} ${x}`, f(x), -1.2, 1.2, 0.1, `$1$ 弳 $\\approx57.3^{\\circ}$；想想 $y=\\${n} x$ 的圖形`); }, tag);
  add(2, 'estimate', [trigE('sin', Math.sin, ''), trigE('cos', Math.cos, 'cos')]);
  add(2, 'bins', [
    G(() => { const c = [];
      [1, 2, 3, 4, 5, 6].forEach(x => c.push([`\\sin ${x}`, Math.sin(x) > 0 ? 0 : 1]));
      [100, 200, 300, 160, 250, 20].forEach(d => c.push([`\\sin ${d}^{\\circ}`, Math.sin(d * D2R) > 0 ? 0 : 1]));
      return B('這個值是正的還是負的？（沒有寫度的是弳）', ['大於 0', '小於 0'], pickBins(c, 2), '$\\sin\\theta>0$：終邊在第一、二象限（$0<\\theta<\\pi$）', '$0<\\theta<\\pi$ 時 $\\sin\\theta>0$，$\\pi<\\theta<2\\pi$ 時 $\\sin\\theta<0$'); })
  ]);
  add(2, 'gmatch', [
    G(() => { const all = [[1, 1], [2, 1], [1, 2], [3, 1], [2, 2], [1, 0.5], [0.5, 1]];
      const vs = sample(all, 3), tx = ([a, b]) => `y=${a === 1 ? '' : a === 0.5 ? '\\frac12' : a}\\sin ${b === 1 ? '' : b === 0.5 ? '\\frac12' : b}x`;
      return GM('把方程式配到它的圖形', { xmin: -0.4, xmax: 2 * Math.PI + 0.4, ymin: -3.4, ymax: 3.4, xPi: 2 }, vs.map(v => [tx(v), [{ fn: x => v[0] * Math.sin(v[1] * x) }]]),
        '振幅看最高點的高度；週期 $=\\frac{2\\pi}{b}$，看多久重複一次', vs.map(v => `$${tx(v)}$：振幅 $${v[0]}$、週期 $${rad(360 / v[1])}$`).join('；')); })
  ]);

  /* ================= 單元 3 和差角公式 ================= */
  const TR = { 30: ['\\frac12', '\\frac{\\sqrt3}{2}'], 45: ['\\frac{\\sqrt2}{2}', '\\frac{\\sqrt2}{2}'], 60: ['\\frac{\\sqrt3}{2}', '\\frac12'] };
  add(3, 'spot', [
    G(() => { const [a, b] = pick([[45, 30], [60, 45], [45, 60], [30, 45]]), plus = chance(0.5), d = plus ? a + b : a - b;
      if (d <= 0) fail();
      const [sa, ca] = TR[a], [sb, cb] = TR[b];
      return K.Fpick(`計算 $\\sin ${d}^{\\circ}$`, [`$\\sin ${d}^{\\circ}=\\sin(${a}^{\\circ}${plus ? '+' : '-'}${b}^{\\circ})$`,
        `$=\\sin${a}^{\\circ}\\cos${b}^{\\circ}${plus ? '+' : '-'}\\cos${a}^{\\circ}\\sin${b}^{\\circ}$`, `$=${sa}\\cdot${cb}${plus ? '+' : '-'}${ca}\\cdot${sb}$`],
        [null, `$=\\sin${a}^{\\circ}\\sin${b}^{\\circ}${plus ? '+' : '-'}\\cos${a}^{\\circ}\\cos${b}^{\\circ}$`, `$=${sa}\\cdot${sb}${plus ? '+' : '-'}${ca}\\cdot${cb}$`],
        '$\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta$'); }),
    G(() => { const [a, b] = pick([[45, 30], [60, 45]]), plus = chance(0.5), d = plus ? a + b : a - b;
      const [sa, ca] = TR[a], [sb, cb] = TR[b];
      return K.Fpick(`計算 $\\cos ${d}^{\\circ}$`, [`$\\cos ${d}^{\\circ}=\\cos(${a}^{\\circ}${plus ? '+' : '-'}${b}^{\\circ})$`,
        `$=\\cos${a}^{\\circ}\\cos${b}^{\\circ}${plus ? '-' : '+'}\\sin${a}^{\\circ}\\sin${b}^{\\circ}$`, `$=${ca}\\cdot${cb}${plus ? '-' : '+'}${sa}\\cdot${sb}$`],
        [null, `$=\\cos${a}^{\\circ}\\cos${b}^{\\circ}${plus ? '+' : '-'}\\sin${a}^{\\circ}\\sin${b}^{\\circ}$`, `$=${ca}\\cdot${sb}${plus ? '-' : '+'}${sa}\\cdot${cb}$`],
        '$\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta$（正負號相反）'); })
  ]);
  add(3, 'chain', [
    G(() => { const [p, q, h] = pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17]]);
      return CH(`$\\theta$ 是銳角，$\\sin\\theta=\\frac{${p}}{${h}}$。3 道鎖：`, [
        ['$\\cos\\theta=$？', $(`\\frac{${q}}{${h}}`), $(`\\frac{${p}}{${q}}`), $(`\\frac{${h}}{${q}}`)],
        ['$\\sin2\\theta=2\\sin\\theta\\cos\\theta=$？', $(fr(2 * p * q, h * h, false)), $(fr(p * q, h * h, false)), $(fr(2 * p, h, false))],
        ['$\\cos2\\theta=\\cos^{2}\\theta-\\sin^{2}\\theta=$？', $(fr(q * q - p * p, h * h, false)), $(fr(p * p - q * q, h * h, false)), $(fr(q - p, h, false))]
      ], '$\\sin^{2}\\theta+\\cos^{2}\\theta=1$', `$\\cos\\theta=\\frac{${q}}{${h}}$、$\\sin2\\theta=${fr(2 * p * q, h * h, false)}$、$\\cos2\\theta=${fr(q * q - p * p, h * h, false)}$`); })
  ]);

  /* ================= 單元 4 正餘弦的疊合 ================= */
  add(4, 'estimate', [
    G(() => { const a = nz(1, 5), b = nz(-5, 5), r = Math.hypot(a, b); if (Number.isInteger(r) && chance(0.6)) fail();
      return E(`把飛鏢射到 $${a === 1 ? '' : a}\\sin x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\cos x$ 的最大值的位置`, `\\sqrt{${a * a + b * b}}`, r, 0, 8, 0.15, '最大值 $=\\sqrt{a^{2}+b^{2}}$', `最大值 $\\sqrt{${a * a}+${b * b}}\\approx${r.toFixed(2)}$`); })
  ]);
  add(4, 'spot', [
    G(() => { const [a, b, r] = pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10]]);
      return F(`求 $${a}\\sin x+${b}\\cos x$ 的最大值與最小值`, [`疊合：$r=\\sqrt{${a}^{2}+${b}^{2}}$`, `$r=${a + b}$`, `最大值 $${a + b}$、最小值 $${-(a + b)}$`], 1, `$r=\\sqrt{${a * a + b * b}}=${r}$`, '$r=\\sqrt{a^{2}+b^{2}}$，不是 $a+b$'); })
  ]);

  /* ================= 單元 5 指數函數 ================= */
  const BASES = [['2', 2], ['3', 3], ['\\frac12', 0.5], ['\\frac13', 1 / 3], ['\\frac32', 1.5], ['\\frac23', 2 / 3], ['0.8', 0.8], ['1.2', 1.2], ['\\sqrt2', Math.SQRT2], ['\\frac{\\sqrt2}{2}', Math.SQRT1_2]];
  add(5, 'bins', [
    G(() => B('這個函數是遞增還是遞減？', ['遞增', '遞減'], pickBins(BASES.map(([t, v]) => [`y=\\left(${t}\\right)^{x}`, v > 1 ? 0 : 1]), 2), '$y=a^{x}$：$a>1$ 遞增，$0<a<1$ 遞減', '看底數比 $1$ 大還是小'))
  ]);
  add(5, 'gmatch', [
    G(() => { const all = [['y=2^{x}', x => 2 ** x], ['y=\\left(\\frac12\\right)^{x}', x => 0.5 ** x], ['y=2^{x}-2', x => 2 ** x - 2], ['y=2^{x-2}', x => 2 ** (x - 2)], ['y=3^{x}', x => 3 ** x], ['y=-2^{x}', x => -(2 ** x)], ['y=2^{x}+1', x => 2 ** x + 1]];
      const vs = sample(all, 3);
      return GM('把方程式配到它的圖形', [-4.5, 4.5, -4.5, 6.5], vs.map(([t, f]) => [t, [{ fn: f }]]), '看 $y$ 截距（$x=0$ 時的值）、遞增或遞減、上下左右平移', vs.map(v => `$${v[0]}$`).join('、')); })
  ]);
  add(5, 'build', [
    G(() => { const h = ri(-3, 3), k = ri(-3, 2);
      return BD(`拖動圓點（圖形一定通過的那一點），畫出 $y=2^{${h ? `x${sg(-h)}` : 'x'}}${k ? sg(k) : ''}$`, WIN, [[3, -4, '']], P => [{ fn: x => 2 ** (x - P[0][0]) + P[0][1] - 1 }], P => P[0][0] === h && P[0][1] === k + 1, [[h, k + 1]],
        '$x=h$ 時指數為 $0$，$2^{0}=1$', `圖形通過 $(${h},${k + 1})$`); })
  ]);
  add(5, 'shade', [
    G(() => { const b = pick([2, 3]), n = ri(-1, 3), op = pick(['>', '<', '\\ge', '\\le']), inv = chance(0.4);
      const t = x => { const v = inv ? -x : x, m = inv ? -n : n; return op === '>' ? v > m : op === '<' ? v < m : op === '\\ge' ? v >= m - 1e-9 : v <= m + 1e-9; };
      const base = inv ? `\\left(\\frac1{${b}}\\right)^{x}` : `${b}^{x}`, rhs = inv ? (n >= 0 ? `\\frac1{${b ** n}}` : String(b ** -n)) : (n >= 0 ? String(b ** n) : `\\frac1{${b ** -n}}`);
      return Sfrom(`在數線上塗出 $${base}${op} ${rhs}$ 的解`, [n], t, inv ? '底數小於 1：函數遞減，不等號要反過來' : '底數大於 1：函數遞增，不等號方向不變', `化成同底數比較指數，分界點 $x=${n}$`); })
  ]);

  /* ================= 單元 6 對數與對數律 ================= */
  add(6, 'estimate', [
    G(() => { const b = pick([2, 3, 5]), x = ri(2, 120); if (lb(b, x) > 6.8) fail();
      return E('把飛鏢射到這個數在數線上的位置', `\\log_{${b}}${x}`, lb(b, x), 0, 7, 0.15, `用 $${b}$ 的次方夾住 $${x}$`); })
  ]);
  add(6, 'bins', [
    G(() => { const c = [];
      [[2, 3], [3, 2], [5, 30], [4, 3], [2, 5], [6, 5], [3, 10], [7, 6], [10, 30], [10, 8], [5, 4], [2, 1.5]].forEach(([b, x]) => c.push([`\\log_{${b}}${x}`, lb(b, x) > 1 ? 0 : 1]));
      return B('這個對數值比 1 大還是比 1 小？', ['大於 1', '小於 1'], pickBins(c, 2), '$\\log_a a=1$：真數比底數大，值就大於 1（$a>1$ 時）', '和底數比較：$\\log_a x>1\\iff x>a$（$a>1$）'); })
  ]);
  add(6, 'spot', [
    G(() => { const [b, x, y, k] = pick([[2, 4, 8, 5], [2, 2, 16, 5], [3, 3, 27, 4], [2, 8, 4, 5], [6, 4, 9, 2], [10, 4, 25, 2], [10, 2, 50, 2]]);
      return K.Fpick(`計算 $\\log_{${b}}${x}+\\log_{${b}}${y}$`, ['原式', `$=\\log_{${b}}(${x}\\times${y})$`, `$=\\log_{${b}}${x * y}$`, `$=${k}$`],
        [null, `$=\\log_{${b}}(${x}+${y})$`, `$=\\log_{${b}}${x + y}$`, `$=${k + 1}$`], '$\\log_a M+\\log_a N=\\log_a MN$'); }),
    G(() => { const [b, n] = pick([[2, 3], [3, 2], [2, 5], [5, 2], [3, 4]]), m = ri(2, 3);
      return K.Fpick(`計算 $\\log_{${b}}${b ** n}^{${m}}$`, ['原式', `$=${m}\\log_{${b}}${b ** n}$`, `$=${m}\\times${n}$`, `$=${m * n}$`],
        [null, `$=(\\log_{${b}}${b ** n})^{${m}}$`, `$=${m}+${n}$`, `$=${m * n + 1}$`], '$\\log_a M^{p}=p\\log_a M$'); })
  ]);
  add(6, 'chain', [
    G(() => { const n = ri(2, 6), b = pick([2, 3]), A = n, Bv = A * 2, C = b ** 2;
      return CH('3 道鎖：下一題會用到上一題的答案', [
        [`$A=\\log_{${b}}${b ** n}=$？`, ...opts3(A, [b ** n / b, A + 1, b * n]).map($)],
        [`$B=\\log_{${b}}(${b}^{A})^{2}=$？`, ...opts3(Bv, [A * A, Bv + 1, A + 2]).map($)],
        [`$${b}^{\\frac{B}{A}}=$？`, ...opts3(C, [b * 2, C + 1, b]).map($)]
      ], '$\\log_a a^{n}=n$，$\\log_a M^{p}=p\\log_a M$', `$A=${A}$、$B=${Bv}$、$${b}^{2}=${C}$`); })
  ]);

  /* ================= 單元 7 對數函數 ================= */
  add(7, 'shade', [
    G(() => { const a = ri(-3, 2), k = ri(1, 3), M = a + 2 ** k, less = chance(0.5);
      const t = x => x > a + 1e-9 && (less ? Math.log2(x - a) < k - 1e-9 : Math.log2(x - a) > k + 1e-9);
      return Sfrom(`在數線上塗出 $\\log_{2}(${xm(a)})${less ? '<' : '>'}${k}$ 的解`, [a, M], t, `先注意定義域：真數 $${xm(a)}>0$；再化成 $${xm(a)}${less ? '<' : '>'}2^{${k}}$`,
        less ? `$${a}<x<${M}$` : `$x>${M}$`); }),
    G(() => { const a = ri(-4, 4), less = chance(0.5), inner = less ? `${a ? a : ''}-x` : xm(a);
      return Sfrom(`在數線上塗出函數 $y=\\log(${inner})$ 的定義域`, [a], x => (less ? x < a - 1e-9 : x > a + 1e-9), '真數必須大於 0',
        less ? `$${inner}>0$，$x<${a}$` : `$${inner}>0$，$x>${a}$`); })
  ]);
  add(7, 'gmatch', [
    G(() => { const all = [['y=\\log_{2}x', x => Math.log2(x)], ['y=\\log_{\\frac12}x', x => -Math.log2(x)], ['y=\\log_{2}(x-1)', x => Math.log2(x - 1)], ['y=\\log_{2}x+2', x => Math.log2(x) + 2], ['y=\\log_{2}(x+2)', x => Math.log2(x + 2)], ['y=-\\log_{2}x+1', x => 1 - Math.log2(x)]];
      const vs = sample(all, 3);
      return GM('把方程式配到它的圖形', [-3.5, 6.5, -4.5, 4.5], vs.map(([t, f]) => [t, [{ fn: f }]]), '看和 $x$ 軸的交點（真數 $=1$ 時）、漸近線的位置、遞增或遞減', vs.map(v => `$${v[0]}$`).join('、')); })
  ]);
  add(7, 'build', [
    G(() => { const h = ri(-3, 2), k = ri(-3, 3);
      return BD(`拖動圓點（圖形一定通過的那一點），畫出 $y=\\log_{2}(${xm(h)})${k ? sg(k) : ''}$`, WIN, [[4, 4, '']], P => [{ fn: x => Math.log2(x - P[0][0] + 1) + P[0][1] }], P => P[0][0] === h + 1 && P[0][1] === k, [[h + 1, k]],
        '真數等於 1 時，$\\log_{2}1=0$', `$x=${h + 1}$ 時真數為 1，通過 $(${h + 1},${k})$`); })
  ]);
  add(7, 'bins', [
    G(() => B('這個函數是遞增還是遞減？', ['遞增', '遞減'], pickBins(BASES.map(([t, v]) => [`y=\\log_{${t}}x`, v > 1 ? 0 : 1]), 2), '$y=\\log_a x$：$a>1$ 遞增，$0<a<1$ 遞減', '看底數比 $1$ 大還是小'))
  ]);

  /* ================= 單元 8 平面向量 ================= */
  add(8, 'build', [
    G(() => { const A = [ri(-4, 1), ri(-4, 1)], v = [nz(-4, 4), nz(-4, 4)], Bp = [A[0] + v[0], A[1] + v[1]];
      if (Math.abs(Bp[0]) > 6 || Math.abs(Bp[1]) > 6) fail();
      return BD(`$A(${A[0]},${A[1]})$。拖動 $B$，使 $\\overrightarrow{AB}=(${v[0]},${v[1]})$`, WIN, [[A[0], A[1] + (A[1] < 5 ? 1 : -1), 'B']], P => [{ pt: A, label: 'A' }, { vec: [A[0], A[1], P[0][0], P[0][1]] }],
        P => P[0][0] === Bp[0] && P[0][1] === Bp[1], [Bp], '$B=A+\\overrightarrow{AB}$', `$B(${Bp[0]},${Bp[1]})$`); })
  ]);
  add(8, 'estimate', [
    G(() => { const a = nz(-6, 6), b = nz(-6, 6), r = Math.hypot(a, b); if (Number.isInteger(r) && chance(0.7)) fail();
      return E(`把飛鏢射到 $|(${a},${b})|$ 的位置`, `|(${a},${b})|`, r, 0, 10, 0.2, '$|(a,b)|=\\sqrt{a^{2}+b^{2}}$', `$\\sqrt{${a * a + b * b}}\\approx${r.toFixed(2)}$`); })
  ]);
  add(8, 'bins', [
    G(() => { const u = pick([[1, 2], [2, -1], [3, 1], [1, -3], [2, 3]]), c = [];
      [2, -1, 3, -2, 0.5].forEach(k => c.push([`(${u[0] * k},${u[1] * k})`, 0]));
      [[u[1], u[0]], [u[0] + 1, u[1]], [-u[1], u[0]], [u[0], u[1] + 2], [u[0] * 2, u[1] * 3]].forEach(([a, b]) => c.push([`(${a},${b})`, 1]));
      return B(`和 $\\vec u=(${u[0]},${u[1]})$ 平行嗎？`, ['平行', '不平行'], pickBins(c, 2), '平行 $\\iff$ 是 $\\vec u$ 的實數倍（分量成比例）', `$(a,b)\\parallel(${u[0]},${u[1]})\\iff a:b=${u[0]}:${u[1]}$`); })
  ]);

  /* ================= 單元 9 平面向量的運算 ================= */
  add(9, 'bins', [
    G(() => { const u = pick([[1, 2], [2, -1], [3, 1], [2, 3], [1, -2]]), c = [];
      [1, 2, -1, 3].forEach(k => c.push([`(${-u[1] * k},${u[0] * k})`, 0]));
      [[u[0], u[1]], [u[1], u[0]], [1, 1], [u[0] + 1, u[1]], [-u[1] + 1, u[0]]].forEach(([a, b]) => { if (a * u[0] + b * u[1] !== 0) c.push([`(${a},${b})`, 1]); });
      return B(`和 $\\vec u=(${u[0]},${u[1]})$ 垂直嗎？`, ['垂直', '不垂直'], pickBins(c, 2), '垂直 $\\iff$ 內積為 $0$', `$(a,b)\\cdot(${u[0]},${u[1]})=${u[0]}a${sg(u[1])}b$，等於 0 就垂直`); })
  ]);
  add(9, 'build', [
    G(() => { const A = [ri(-3, 0), ri(-3, 0)], u = [nz(-2, 2), ri(-1, 2)], v = [ri(-1, 2), nz(-2, 2)], s = nz(-2, 2), t = nz(-2, 2);
      const Pp = [A[0] + s * u[0] + t * v[0], A[1] + s * u[1] + t * v[1]];
      if (Math.abs(Pp[0]) > 6 || Math.abs(Pp[1]) > 6 || u[0] * v[1] === u[1] * v[0]) fail();
      const cf = (k, nm, first) => `${k < 0 ? '-' : first ? '' : '+'}${Math.abs(k) === 1 ? '' : Math.abs(k)}${nm}`;
      return BD(`$A(${A[0]},${A[1]})$、$\\vec u=(${u[0]},${u[1]})$、$\\vec v=(${v[0]},${v[1]})$。拖動 $P$，使 $\\overrightarrow{AP}=${cf(s, '\\vec u', true)}${cf(t, '\\vec v')}$`, WIN, [[A[0] + 1, A[1] - 1 < -6 ? A[1] + 1 : A[1] - 1, 'P']],
        P => [{ pt: A, label: 'A' }, { vec: [A[0], A[1], P[0][0], P[0][1]] }], P => P[0][0] === Pp[0] && P[0][1] === Pp[1], [Pp], '先算出 $\\overrightarrow{AP}$ 的坐標', `$\\overrightarrow{AP}=(${Pp[0] - A[0]},${Pp[1] - A[1]})$，$P(${Pp[0]},${Pp[1]})$`); })
  ]);
  add(9, 'spot', [
    G(() => { const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), d = nz(-5, 5), v = a * c + b * d;
      return K.Fpick(`計算 $(${a},${b})\\cdot(${c},${d})$`, ['原式', `$=${par(a)}\\times${par(c)}+${par(b)}\\times${par(d)}$`, `$=${a * c}${sg(b * d)}$`, `$=${v}$`],
        [null, `$=${par(a)}\\times${par(d)}+${par(b)}\\times${par(c)}$`, `$=${a * c}${sg(-b * d)}$`, `$=${v + 2}$`], '$(a,b)\\cdot(c,d)=ac+bd$'); })
  ]);
  add(9, 'chain', [
    G(() => { const a = [nz(-3, 3), nz(-3, 3)], b = [nz(-3, 3), nz(-3, 3)], A = a[0] * b[0] + a[1] * b[1], Bv = a[0] * a[0] + a[1] * a[1], C = Bv + 2 * A;
      return CH(`$\\vec a=(${a[0]},${a[1]})$、$\\vec b=(${b[0]},${b[1]})$。3 道鎖：`, [
        ['$A=\\vec a\\cdot\\vec b=$？', ...opts3(A, [a[0] * b[1] + a[1] * b[0], A + 1, -A]).map($)],
        ['$B=|\\vec a|^{2}=$？', ...opts3(Bv, [Math.abs(a[0]) + Math.abs(a[1]), Bv + 1, 2 * Bv]).map($)],
        ['$\\vec a\\cdot(\\vec a+2\\vec b)=B+2A=$？', ...opts3(C, [Bv + A, C + 2, 2 * Bv + A]).map($)]
      ], '$(a,b)\\cdot(c,d)=ac+bd$，$|\\vec a|^{2}=\\vec a\\cdot\\vec a$', `$A=${A}$、$B=${Bv}$、$B+2A=${C}$`); })
  ]);

  /* ================= 單元 10 二元一次聯立方程式 ================= */
  const det = (a, b, c, d) => `\\begin{vmatrix}${a}&${b}\\\\${c}&${d}\\end{vmatrix}`;
  add(10, 'bins', [
    G(() => { const c = [];
      for (let k = 0; k < 4; k++) { const a = ri(1, 3), b = nz(-3, 3), d = nz(-3, 3), e = nz(-3, 3); if (a * e !== b * d) c.push([`\\begin{cases}${lineTex(a, b, ri(-5, 5))}\\\\${lineTex(d, e, ri(-5, 5))}\\end{cases}`, 0]); }
      for (let k = 0; k < 3; k++) { const a = ri(1, 3), b = nz(-3, 3), m = pick([2, 3, -1]), c0 = ri(-4, 4); c.push([`\\begin{cases}${lineTex(a, b, c0)}\\\\${lineTex(a * m, b * m, c0 * m + nz(-3, 3))}\\end{cases}`, 1]); }
      for (let k = 0; k < 3; k++) { const a = ri(1, 3), b = nz(-3, 3), m = pick([2, 3, -1]), c0 = ri(-4, 4); c.push([`\\begin{cases}${lineTex(a, b, c0)}\\\\${lineTex(a * m, b * m, c0 * m)}\\end{cases}`, 2]); }
      return B('這組聯立方程式的解是？', ['恰有一組解', '無解', '無限多組解'], pickBins(c, 3, 4), '$\\Delta\\ne0$：恰一解；兩式係數成比例：常數也成比例是無限多解，否則無解', '看係數是否成比例'); })
  ]);
  add(10, 'chain', [
    G(() => { const x0 = ri(-4, 4), y0 = ri(-4, 4), a = ri(1, 4), b = nz(-3, 3), c = nz(-3, 3), d = ri(1, 4), D = a * d - b * c;
      if (!D) fail();
      const e = a * x0 + b * y0, f = c * x0 + d * y0, Dx = e * d - b * f;
      return CH(`解 $\\begin{cases}${lineTex(a, b, e)}\\\\${lineTex(c, d, f)}\\end{cases}$。3 道鎖：`, [
        [`$\\Delta=${det(a, b, c, d)}=$？`, ...opts3(D, [a * d + b * c, -D, a * c - b * d]).map($)],
        [`$\\Delta_x=${det(e, b, f, d)}=$？`, ...opts3(Dx, [e * d + b * f, -Dx, e * b - d * f]).map($)],
        ['$x=\\dfrac{\\Delta_x}{\\Delta}=$？', ...opts3(x0, [-x0, x0 + 1, y0]).map($)]
      ], '克拉瑪公式：$x=\\frac{\\Delta_x}{\\Delta}$', `$\\Delta=${D}$、$\\Delta_x=${Dx}$、$x=${x0}$`); })
  ]);
  add(10, 'spot', [
    G(() => { const a = nz(-5, 5), b = nz(-5, 5), c = nz(-5, 5), d = nz(-5, 5), v = a * d - b * c;
      return K.Fpick(`計算 $${det(a, b, c, d)}$`, ['原式', `$=${par(a)}\\times${par(d)}-${par(b)}\\times${par(c)}$`, `$=${a * d}${sg(-b * c)}$`, `$=${v}$`],
        [null, `$=${par(a)}\\times${par(c)}-${par(b)}\\times${par(d)}$`, `$=${a * d}${sg(b * c)}$`, `$=${v + 1}$`], '$\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix}=ad-bc$'); })
  ]);
})(window.LG);
