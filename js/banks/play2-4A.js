/* 三上選修甲（數學 4A）第 2 批新玩法題目：估算飛鏢、數線塗色、分類收納、找錯偵探、計算接力、投籃瞄準、圖形對對碰、拖點作圖
   必須在 4B.js 之前載入（選修乙用 copy() 沿用）。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('4A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, sample, chance, fail, fr, par, poly, term, xm, E, Sfrom, B, F, CH, SH, GM, BD } = K;
  const sg = n => (n < 0 ? String(n) : '+' + n);
  const fac = (a, v) => (a ? `(${xm(a, v)})` : (v || 'x'));
  const $ = s => `$${s}$`;
  const pickBins = (cands, nb, n) => {
    const uniq = [...new Map(cands.map(c => [c[0], c])).values()];
    for (let t = 0; t < 30; t++) { const s = sample(uniq, n || 6); if ([...Array(nb).keys()].every(b => s.some(c => c[1] === b))) return s; }
    return fail();
  };
  const opts3 = (right, wrongs) => { const w = [...new Set(wrongs.map(String))].filter(x => x !== String(right)); if (w.length < 2) fail(); return [String(right), w[0], w[1]]; };
  const LIM = '\\lim_{n\\to\\infty}';
  const WIN = [-6.5, 6.5, -6.5, 6.5];
  const deriv = c => c.slice(0, -1).map((a, i) => a * (c.length - 1 - i));
  const RS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3], [-2, 3], [1, 5]];

  /* ================= 單元 1 數列及其極限 ================= */
  add(1, 'bins', [
    G(() => { const c = [[`${LIM}\\left(\\frac{1}{2}\\right)^{n}`, 0], [`${LIM}\\left(\\frac{3}{2}\\right)^{n}`, 1], [`${LIM}(-1)^{n}`, 1], [`${LIM}\\frac{1}{n}`, 0], [`${LIM}\\frac{n^{2}}{n+1}`, 1],
      [`${LIM}\\frac{2n+1}{n+3}`, 0], [`${LIM}\\left(-\\frac{2}{3}\\right)^{n}`, 0], [`${LIM}\\sqrt{n}`, 1], [`${LIM}\\frac{3^{n}}{2^{n}}`, 1], [`${LIM}\\frac{n}{2^{n}}`, 0], [`${LIM}\\left(1+\\frac1n\\right)`, 0], [`${LIM}(2n-n^{2})`, 1]];
      return B('這個數列收斂還是發散？', ['收斂', '發散'], pickBins(c, 2), '$\\langle r^{n}\\rangle$ 收斂 $\\iff -1<r\\le1$；分式看最高次', '收斂：極限是一個實數'); })
  ]);
  add(1, 'spot', [
    G(() => { const a = nz(-6, 6), b = ri(-5, 5), c = ri(1, 4), d = ri(1, 5);
      if (fr(b || 1, d) === fr(a, c)) fail();
      return K.Fpick(`求 $${LIM}\\dfrac{${poly([a, b], 'n')}}{${poly([c, d], 'n')}}$`, ['分子、分母同除以 $n$', `$=${LIM}\\dfrac{${a}${b ? `${sg(b)}\\cdot\\frac1n` : ''}}{${c}${sg(d)}\\cdot\\frac1n}$`, `$=${fr(a, c)}$`],
        [null, `$=${LIM}\\dfrac{${a}n${sg(b)}}{${c}${sg(d)}}$`, `$=${fr(b || 1, d)}$`], '分子、分母同除以 $n$，$\\frac1n\\to0$'); })
  ]);
  add(1, 'chain', [
    G(() => { const A = nz(-3, 3), c = ri(1, 3), a = A * c;
      const r = pick([2, 3]), Bv = A * r, C = Bv / (r - 1);
      if (!Number.isInteger(C)) fail();
      return CH('3 道鎖：下一題會用到上一題的答案', [
        [`$A=${LIM}\\dfrac{${a}n+1}{${c}n-2}=$？`, ...opts3(A, [A + 1, -A, a * c]).map($)],
        [`$B=${LIM}\\dfrac{A\\cdot${r}^{n}+1}{${r}^{n}}=$？`, ...opts3(Bv, [A, Bv + 1, r]).map($)],
        [`$${LIM}\\dfrac{B\\,n}{${r - 1}n+5}=$？`, ...opts3(C, [Bv, C + 1, Bv * (r - 1)]).map($)]
      ], '分子、分母同除以最高次', `$A=${A}$、$B=${Bv}$、第 3 題 $${C}$`); })
  ]);

  /* ================= 單元 2 無窮等比級數 ================= */
  add(2, 'estimate', [
    G(() => { const a = ri(1, 6), [p, q] = pick(RS), S = a / (1 - p / q); if (S > 9.8 || S <= 0) fail();
      return E(`把飛鏢射到級數和的位置：$${a}+${a}\\cdot${p < 0 ? `\\left(${fr(p, q, false)}\\right)` : fr(p, q, false)}+${a}\\cdot\\left(${fr(p, q, false)}\\right)^{2}+\\cdots$`, `S`, S, 0, 10, 0.2,
        '$S=\\frac{a}{1-r}$', `$S=\\frac{${a}}{1-${p < 0 ? `(${fr(p, q, false)})` : fr(p, q, false)}}=${fr(a * q, q - p, false)}$`); })
  ]);
  add(2, 'bins', [
    G(() => { const c = [];
      [['\\frac12', 0], ['-\\frac23', 0], ['\\frac32', 1], ['-1', 1], ['0.9', 0], ['\\frac54', 1], ['-\\frac13', 0], ['2', 1], ['1', 1], ['\\frac{\\sqrt2}{2}', 0], ['-1.1', 1], ['\\frac{1}{\\pi}', 0]].forEach(([r, b]) => c.push([`\\sum_{n=1}^{\\infty}\\left(${r}\\right)^{n}`, b]));
      return B('這個無窮等比級數收斂還是發散？', ['收斂', '發散'], pickBins(c, 2), '無窮等比級數收斂 $\\iff$ 公比 $|r|<1$', '$|r|<1$ 收斂，否則發散'); })
  ]);
  add(2, 'spot', [
    G(() => { const a = nz(-9, 9), [p, q] = pick(RS);
      return K.Fpick(`求 $\\sum_{n=1}^{\\infty}${a}\\left(${fr(p, q, false)}\\right)^{n-1}$`, [`首項 $a=${a}$、公比 $r=${fr(p, q, false)}$`, `$|r|<1$，所以收斂`, `和 $=\\dfrac{a}{1-r}=\\dfrac{${a}}{1-${p < 0 ? `(${fr(p, q, false)})` : fr(p, q, false)}}$`, `$=${fr(a * q, q - p)}$`],
        [`首項 $a=${a}$、公比 $r=${fr(q, p, false)}$`, null, `和 $=\\dfrac{a}{1+r}=\\dfrac{${a}}{1+${p < 0 ? `(${fr(p, q, false)})` : fr(p, q, false)}}$`, `$=${fr(a * q, q + p)}$`], '和 $=\\frac{a}{1-r}$（$|r|<1$）'); })
  ]);

  /* ================= 單元 3 函數 ================= */
  add(3, 'chain', [
    G(() => { const f = x => x * x + 1, g = x => 2 * x - 3, k = ri(-1, 3), A = g(k), Bv = f(A), C = g(Bv);
      return CH('$f(x)=x^{2}+1$、$g(x)=2x-3$。3 道鎖：', [
        [`$A=g(${k})=$？`, ...opts3(A, [f(k), A + 2, 2 * k]).map($)],
        ['$B=f(A)=$？', ...opts3(Bv, [A * A, Bv + 2, g(A)]).map($)],
        ['$g(B)=$？', ...opts3(C, [f(Bv), C + 3, 2 * Bv]).map($)]
      ], '把數字代進函數；合成函數由內往外算', `$A=${A}$、$B=${Bv}$、$g(B)=${C}$`); })
  ]);
  add(3, 'build', [
    G(() => { const a = ri(-3, 3), b = ri(-3, 3), h = nz(-2, 2), k = nz(-2, 2);
      return BD(`$y=f(x)$ 的圖形通過 $(${a},${b})$。拖動圓點到 $y=f(${xm(h)})${sg(k)}$ 的圖形一定通過的點`, WIN, [[a, b, '']], P => [{ pt: [a, b], style: { r: 4, alpha: 0.6 } }], P => P[0][0] === a + h && P[0][1] === b + k, [[a + h, b + k]],
        '$f(x-h)+k$：圖形向右 $h$、向上 $k$', `$(${a + h},${b + k})$`); }),
    G(() => { const a = ri(-4, 4), b = ri(-4, 4); if (a === b) fail();
      return BD(`$y=f(x)$ 的圖形通過 $(${a},${b})$。拖動圓點到 $y=f^{-1}(x)$ 的圖形一定通過的點`, WIN, [[a, b, '']], P => [{ pt: [a, b], style: { r: 4, alpha: 0.6 } }, { fn: x => x, style: { dash: [6, 6], alpha: 0.4, glow: false } }],
        P => P[0][0] === b && P[0][1] === a, [[b, a]], '反函數的圖形和原函數對稱於 $y=x$', `$(${b},${a})$`); })
  ]);
  add(3, 'gmatch', [
    G(() => { const base = x => x * x, all = [['y=x^{2}', 0, 0], ['y=(x-2)^{2}', 2, 0], ['y=x^{2}-3', 0, -3], ['y=(x+2)^{2}+1', -2, 1], ['y=(x-1)^{2}-2', 1, -2], ['y=x^{2}+2', 0, 2]];
      const vs = sample(all, 3);
      return GM('$y=x^{2}$ 平移後的圖形：把方程式配到它的圖形', WIN, vs.map(([t, h, k]) => [t, [{ fn: x => base(x - h) + k }]]), '$f(x-h)+k$：向右 $h$、向上 $k$', vs.map(v => `$${v[0]}$：頂點 $(${v[1]},${v[2]})$`).join('、')); })
  ]);

  /* ================= 單元 4 函數的極限 ================= */
  add(4, 'spot', [
    G(() => { const a = nz(-5, 5);
      return K.Fpick(`求 $\\lim_{x\\to${a}}\\dfrac{x^{2}-${a * a}}{${xm(a)}}$`, [`代入得 $\\frac00$ 型，先因式分解`, `$=\\lim_{x\\to${a}}\\dfrac{(${xm(a)})(${K.xm(-a)})}{${xm(a)}}$`, `$=\\lim_{x\\to${a}}(${K.xm(-a)})$`, `$=${2 * a}$`],
        [`代入得 $\\frac00$，所以極限不存在`, `$=\\lim_{x\\to${a}}\\dfrac{(${xm(a)})(${xm(a)})}{${xm(a)}}$`, null, `$=${a}$`], '$\\frac00$ 型要先化簡，不代表極限不存在'); })
  ]);
  add(4, 'chain', [
    G(() => { const a = nz(-3, 3), A = 2 * a, Bv = A * A, C = 3 * a * a;
      return CH('3 道鎖：', [
        [`$A=\\lim_{x\\to${a}}\\dfrac{x^{2}-${a * a}}{${xm(a)}}=$？`, ...opts3(A, [a, 0, a * a]).map($)],
        [`$B=\\lim_{x\\to A}x^{2}=$？`, ...opts3(Bv, [2 * A, A, Bv + 1]).map($)],
        [`$\\lim_{x\\to${a}}\\dfrac{x^{3}${a < 0 ? '+' : '-'}${Math.abs(a ** 3)}}{${xm(a)}}=$？`, ...opts3(C, [a * a, 3 * a, C + 1]).map($)]
      ], '$\\frac00$ 型：因式分解約掉 $x-a$', `$A=${A}$、$B=${Bv}$、第 3 題 $${C}$`); })
  ]);
  add(4, 'estimate', [
    G(() => { const k = pick([1, 2, 3]), v = 1 / (2 * k);
      return E(`把飛鏢射到極限值的位置：$\\lim_{x\\to0}\\dfrac{\\sqrt{x+${k * k}}-${k}}{x}$`, 'L', v, 0, 1, 0.04, '分子有理化', `$\\frac{1}{\\sqrt{x+${k * k}}+${k}}\\to\\frac{1}{${2 * k}}$`); })
  ]);

  /* ================= 單元 5 微分的概念與性質 ================= */
  add(5, 'spot', [
    G(() => { const c = [ri(1, 3) * pick([1, -1]), ri(-5, 5), ri(-6, 6), ri(-9, 9)], d = deriv(c);
      return F(`求 $f(x)=${poly(c)}$ 的導函數`, [`$(x^{n})'=nx^{n-1}$，常數微分為 $0$`, `$f'(x)=${poly([c[0] * 3, c[1] * 2, c[2], c[3]])}$`, `$f'(x)=${poly([c[0] * 3, c[1] * 2, c[2]])}$`], 1, `$f'(x)=${poly(d)}$（常數項微分為 $0$）`, '常數的導數是 $0$'); }),
    G(() => { const n = ri(2, 5), k = ri(2, 6);
      return F(`求 $f(x)=${k}x^{${n}}$ 在 $x=1$ 的導數`, [`$f'(x)=${k}\\cdot x^{${n - 1}}$`, `$f'(1)=${k}$`], 0, `$f'(x)=${k * n}x^{${n - 1}}$，$f'(1)=${k * n}$`, '$(x^{n})\'=nx^{n-1}$，次方要乘到前面'); })
  ]);
  add(5, 'chain', [
    G(() => { const c = [1, ri(-3, 3), ri(-4, 4), ri(-5, 5)], d = deriv(c), A = K.polyAt(d, 1), Bv = K.polyAt(d, 0), C = A - Bv;
      return CH(`$f(x)=${poly(c)}$。3 道鎖：`, [
        ["$A=f'(1)=$？", ...opts3(A, [K.polyAt(c, 1), A + 1, K.polyAt(d, -1)]).map($)],
        ["$B=f'(0)=$？", ...opts3(Bv, [c[3], Bv + 1, 0]).map($)],
        ['$A-B=$？', ...opts3(C, [A + Bv, C + 1, Bv - A]).map($)]
      ], "$f'(x)=" + poly(d) + '$', `$A=${A}$、$B=${Bv}$、$A-B=${C}$`); })
  ]);
  add(5, 'shoot', [
    G(() => { const b = ri(-3, 3), c = ri(-3, 2), x0 = ri(-2, 1), y0 = x0 * x0 + b * x0 + c, m = 2 * x0 + b, d = 3, hy = y0 + m * d;
      const M = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
      if (!M.includes(m) || Math.abs(y0) > 6 || Math.abs(hy) > 6) fail();
      return Object.assign(SH(`球放在拋物線 $y=${poly([1, b, c])}$ 上的點 $(${x0},${y0})$，沿著這點的「切線」飛出。調整斜率 $m$，讓球通過籃框`, WIN, [x0, y0], [x0 + d, hy],
        [{ n: 'm', vals: M }], [M.indexOf(m)], P => (x => y0 + P[0] * (x - x0)), "切線斜率 $=f'(x_0)$", `$f'(x)=2x${sg(b)}$，$f'(${x0})=${m}$`), { bg: [{ fn: x => x * x + b * x + c }] }); })
  ]);

  /* ================= 單元 6 微分的應用 ================= */
  const cubic = () => {
    const k = pick([1, -1]), p = ri(-3, 1), q = p + pick([2, 4]);
    const c2 = -3 * k * (p + q) / 2, c1 = 3 * k * p * q;
    if (!Number.isInteger(c2)) fail();
    const base = x => k * x ** 3 + c2 * x * x + c1 * x, C = -Math.round((base(p) + base(q)) / 2);
    return { k, p, q, c: [k, c2, c1, C], f: x => base(x) + C };
  };
  add(6, 'shade', [
    G(() => { const { k, p, q, c } = cubic(), inc = chance(0.5);
      return Sfrom(`$f(x)=${poly(c)}$。在數線上塗出 $f(x)$ ${inc ? '遞增' : '遞減'}（$f'(x)${inc ? '>' : '<'}0$）的範圍`, [p, q], x => (inc ? 1 : -1) * 3 * k * (x - p) * (x - q) > 1e-9,
        "先求 $f'(x)=0$ 的兩根，再判斷每一段的正負", `$f'(x)=${k < 0 ? '-' : ''}3${fac(p)}${fac(q)}$`); })
  ]);
  add(6, 'bins', [
    G(() => { const { k, p, q, c } = cubic(), xs = sample([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].filter(x => x !== p && x !== q), 6);
      return B(`$f(x)=${poly(c)}$。$f(x)$ 在下列各點附近是遞增還是遞減？`, ['遞增', '遞減'], xs.map(x => [`x=${x}`, 3 * k * (x - p) * (x - q) > 0 ? 0 : 1]), "看 $f'(x)$ 的正負", `$f'(x)=${k < 0 ? '-' : ''}3${fac(p)}${fac(q)}$`); })
  ]);
  add(6, 'gmatch', [
    G(() => { const all = [['y=x^{3}', x => x ** 3], ['y=-x^{3}', x => -(x ** 3)], ['y=x^{3}-3x', x => x ** 3 - 3 * x], ['y=-x^{3}+3x', x => -(x ** 3) + 3 * x], ['y=x^{3}+2', x => x ** 3 + 2], ['y=(x-1)^{3}', x => (x - 1) ** 3]];
      const vs = sample(all, 3);
      return GM('把方程式配到它的圖形', [-3.5, 3.5, -5, 5], vs.map(([t, f]) => [t, [{ fn: f }]]), "看右端往上或往下（領導係數的正負）、有沒有極值（$f'(x)=0$ 有沒有兩個根）", vs.map(v => `$${v[0]}$`).join('、')); })
  ]);
  add(6, 'chain', [
    G(() => { const { k, p, q, c, f } = cubic(), A = p, Bv = f(p), C = f(q);
      return CH(`$f(x)=${poly(c)}$。3 道鎖：`, [
        ["$f'(x)=0$ 的較小根 $A=$？", ...opts3(A, [q, -p, p - 1]).map($)],
        ['$B=f(A)=$？', ...opts3(Bv, [Bv + 2, -Bv, C]).map($)],
        ['另一個極值（$f$ 在較大根的值）$=$？', ...opts3(C, [C + 2, -C, Bv]).map($)]
      ], "$f'(x)=0$ 的根就是極值發生的位置", `兩根 $${p}$、$${q}$；$f(${p})=${Bv}$、$f(${q})=${C}$`); })
  ]);

  /* ================= 單元 7 積分的概念與性質 ================= */
  const intVal = (c, a, b) => { const n = c.length - 1; let s = 0; c.forEach((k, i) => { const p = n - i + 1; s += k * (b ** p - a ** p) / p; }); return s; };
  add(7, 'estimate', [
    G(() => { const a = ri(-1, 1), b = a + ri(1, 3), c = [ri(-1, 2), ri(-2, 2), ri(0, 3)], v = intVal(c, a, b); if (v <= 0.3 || v >= 9.7) fail();
      return E(`把飛鏢射到 $\\int_{${a}}^{${b}}(${poly(c)})\\,dx$ 的位置`, 'I', v, 0, 10, 0.2, '先找反導函數 $F$，再算 $F(b)-F(a)$', `$=${fr(Math.round(v * 6), 6)}$`); })
  ]);
  add(7, 'spot', [
    G(() => { const n = ri(1, 3), k = ri(1, 6), v = k * n ** 3 / 3;
      return K.Fpick(`計算 $\\int_{0}^{${n}}${k === 1 ? '' : k}x^{2}\\,dx$`, [`反導函數 $F(x)=\\dfrac{${k}x^{3}}{3}$`, `$=F(${n})-F(0)$`, `$=\\dfrac{${k}\\times${n ** 3}}{3}-0$`, `$=${fr(k * n ** 3, 3)}$`],
        [`反導函數 $F(x)=${k}x^{3}$`, `$=F(0)-F(${n})$`, `$=\\dfrac{${k}\\times${n * 3}}{3}-0$`, null], '$\\int x^{2}dx=\\frac{x^{3}}{3}+C$；上限代入減下限代入'); })
  ]);
  add(7, 'chain', [
    G(() => { const a = ri(1, 3), A = a * a * 2 / 2, Bv = A ** 3, C = Bv / A;
      return CH('3 道鎖：', [
        [`$A=\\int_{0}^{${a}}2x\\,dx=$？`, ...opts3(A, [2 * a, a, A + 1]).map($)],
        ['$B=\\int_{0}^{A}3x^{2}\\,dx=$？', ...opts3(Bv, [3 * A * A, A ** 2, Bv + 1]).map($)],
        ['$\\dfrac{B}{A}=$？', ...opts3(C, [Bv - A, C + 1, A]).map($)]
      ], '$\\int_0^a kx^{m}dx=\\frac{k\\,a^{m+1}}{m+1}$', `$A=${A}$、$B=${Bv}$、$\\frac BA=${C}$`); })
  ]);
  add(7, 'bins', [
    G(() => { const c = [];
      for (let k = 0; k < 10; k++) { const a = ri(-2, 1), b = a + ri(1, 3), co = [ri(-2, 2), ri(-3, 3), ri(-3, 3)], v = intVal(co, a, b); if (Math.abs(v) > 0.2) c.push([`\\int_{${a}}^{${b}}(${poly(co)})\\,dx`, v > 0 ? 0 : 1]); }
      return B('這個定積分的值是正的還是負的？', ['大於 0', '小於 0'], pickBins(c, 2, 5), '算出 $F(b)-F(a)$；或想想圖形在 $x$ 軸上方、下方的面積', '依計算結果判斷'); })
  ]);

  /* ================= 單元 8 積分的應用 ================= */
  add(8, 'estimate', [
    G(() => { const k = pick([1, 2, 3]), n = pick([1, 2, 3]), v = k * n ** 3 / 3; if (v > 9.7) fail();
      return E(`把飛鏢射到「$y=${k === 1 ? '' : k}x^{2}$ 與 $x$ 軸在 $0\\le x\\le${n}$ 之間的面積」的位置`, 'A', v, 0, 10, 0.2, '面積 $=\\int_0^n kx^{2}dx$', `$A=\\frac{${k}\\times${n ** 3}}{3}=${fr(k * n ** 3, 3, false)}$`); })
  ]);
  add(8, 'chain', [
    G(() => { const [u, l, a, b, n, d] = pick([['x', 'x^{2}', 0, 1, 1, 6], ['2x', 'x^{2}', 0, 2, 4, 3], ['4', 'x^{2}', -2, 2, 32, 3], ['3x', 'x^{2}', 0, 3, 9, 2]]);
      return CH(`$y=${u}$ 與 $y=${l}$ 所圍的區域。3 道鎖：`, [
        ['兩圖形交點的 $x$ 坐標是？', $(`${a},${b}`), $(`${a},${b + 1}`), $(`${-b},${b}`)],
        [`在 $${a}<x<${b}$ 時，哪一個函數比較大？`, $(`y=${u}`), $(`y=${l}`), '一樣大'],
        ['所圍面積是？', $(fr(n, d, false)), $(fr(n, d + 1, false)), $(fr(d, n, false))]
      ], '面積 $=\\int_a^b(\\text{上}-\\text{下})dx$', `交點 $x=${a},${b}$；面積 $${fr(n, d, false)}$`); })
  ]);
})(window.LG);
