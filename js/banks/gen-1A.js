/* 一上（數學 1，翰林）隨機題型
   每個 G(() => ...) 是一個題型樣板：每次出題時重新抽數字，答案、選項、提示、解說都跟著算出來，學生背不了答案。
   格式和 1A.js 相同（N 數值題、C 單選題、M 配對題）；工具函式見 js/gen-kit.js。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('1A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, fr, frV, par, poly, term, xm, C, N, M } = K;
  const $ = s => `$${s}$`;

  /* ================= 1-1 數與數線 ================= */
  add(1, 'num', [
    G(() => { const a = ri(-12, -1), b = ri(2, 15), d = b - a;
      return N(`數線上 $A(${a})$、$B(${b})$ 兩點的距離是多少？`, d, '', `\\overline{AB}=|${b}-(${a})|`, `|${d}|=${d}`,
        '兩點距離 $=|b-a|$', `$|${b}-(${a})|=${d}$`); }),
    G(() => { const c = ri(2, 12), r = ri(1, 9);
      return N(`方程式 $|${xm(c)}|=${r}$ 的兩根之和是多少？`, 2 * c, '', `|${xm(c)}|=${r}`, `x=${c + r}\\ \\text{或}\\ ${c - r}`,
        `和 $${c}$ 的距離為 $${r}$`, `$x=${c + r}$ 或 $x=${c - r}$，和為 $${2 * c}$`); }),
    G(() => { const c = ri(-5, 8), r = ri(2, 9);
      return N(`不等式 $|${xm(c)}|\\le${r}$ 有幾個整數解？`, 2 * r + 1, '個', `|${xm(c)}|\\le${r}`, `${c - r}\\le x\\le${c + r}`,
        `和 $${c}$ 的距離不超過 $${r}$`, `$${c - r}\\le x\\le${c + r}$，共 $${2 * r + 1}$ 個整數`); }),
    G(() => { const a = ri(-8, 6), b = a + 2 * ri(2, 8), m = (a + b) / 2; if (m < 1) K.fail();
      return N(`數線上 $A(${a})$、$B(${b})$ 的中點坐標是多少？`, m, '', `\\frac{${a}+${par(b)}}{2}`, String(m),
        '中點是兩端坐標的平均', `$\\frac{${a}+${par(b)}}{2}=${m}$`); })
  ]);
  add(1, 'mc', [
    G(() => { const ab = ri(10, 98); if (ab % 11 === 0) K.fail();
      return C(`$0.\\overline{${ab}}$ 化成最簡分數是？`, $(fr(ab, 99)), [$(fr(ab, 100)), $(fr(ab, 90)), $(fr(ab + 1, 99)), $(fr(ab, 9))],
        '純循環小數：$0.\\overline{ab}=\\frac{ab}{99}$', `$\\frac{${ab}}{99}=${fr(ab, 99, false)}$`); }),
    G(() => { const c = nz(-5, 6), r = ri(2, 7);
      return C(`不等式 $|${xm(c)}|<${r}$ 的解是？`, $(`${c - r}<x<${c + r}`),
        [$(`x<${c + r}`), $(`${-c - r}<x<${-c + r}`), `$x<${c - r}$ 或 $x>${c + r}$`],
        `和 $${c}$ 的距離小於 $${r}$`, `$-${r}<${xm(c)}<${r}$，得 $${c - r}<x<${c + r}$`); }),
    G(() => { const a = ri(-6, 4), m = ri(1, 3), n = ri(1, 4), t = ri(2, 4); if (m === n) K.fail();
      const b = a + (m + n) * t, p = a + m * t;
      return C(`數線上 $A(${a})$、$B(${b})$，$P$ 在線段 $AB$ 上且 $\\overline{AP}:\\overline{PB}=${m}:${n}$，$P$ 的坐標是？`,
        $(p), [$(a + n * t), $(b - n * t + 1), $(a + m * t + t), $(b + m * t)],
        `分點公式：$P=\\frac{${n}\\times${par(a)}+${m}\\times${par(b)}}{${m}+${n}}$`, `$\\frac{${n * a}+${m * b}}{${m + n}}=${p}$`); })
  ]);
  add(1, 'match', [
    G(() => { const d = ri(1, 8); return M(`0.\\overline{${d}}`, frV(d, 9), '$0.\\overline{a}=\\frac{a}{9}$', '它的值'); }),
    G(() => { const a = nz(-9, 9), b = ri(-9, 9), c = ri(-9, 9);
      return M(`|${a}|+|${b}-${par(c)}|`, Math.abs(a) + Math.abs(b - c), '絕對值是到原點的距離，一定不是負數', '它的值'); }),
    G(() => { const a = ri(1, 9), b = ri(10, 20); return M(`|${a}-${b}|`, b - a, '絕對值內為負時，變號', '它的值'); })
  ]);

  /* ================= 1-2 式的運算 ================= */
  add(2, 'num', [
    G(() => { const s = ri(3, 9), p = ri(1, Math.floor(s * s / 4)), v = s * s - 2 * p; if (v < 1) K.fail();
      return N(`$a+b=${s}$、$ab=${p}$，求 $a^{2}+b^{2}$`, v, '', 'a^{2}+b^{2}', `(a+b)^{2}-2ab=${v}`,
        '$a^{2}+b^{2}=(a+b)^{2}-2ab$', `$${s * s}-${2 * p}=${v}$`); }),
    G(() => { const k = ri(3, 9), minus = K.chance(0.4), v = minus ? k * k + 2 : k * k - 2, op = minus ? '-' : '+';
      return N(`$x${op}\\dfrac1x=${k}$，求 $x^{2}+\\dfrac{1}{x^{2}}$`, v, '', `x${op}\\frac1x=${k}`, `\\left(x${op}\\frac1x\\right)^{2}${minus ? '+' : '-'}2=${v}`,
        `把 $x${op}\\frac1x$ 平方`, `$${k * k}${minus ? '+' : '-'}2=${v}$`); }),
    G(() => { const a = ri(1, 4), r = ri(2, 6), b = a * r * r, v = 2 * a * r;
      return N(`$x>0$ 時，$${a === 1 ? '' : a}x+\\dfrac{${b}}{x}$ 的最小值是多少？`, v, '', `${a === 1 ? '' : a}x+\\frac{${b}}{x}\\ge2\\sqrt{${a * b}}`, `=${v}`,
        `算幾不等式：$${a === 1 ? '' : a}x+\\frac{${b}}{x}\\ge2\\sqrt{${a === 1 ? '' : a}x\\cdot\\frac{${b}}{x}}$`, `最小值 $2\\sqrt{${a * b}}=${v}$（$x=${r}$ 時）`); }),
    G(() => { const k = ri(3, 15), P = 4 * k;
      return N(`周長 $${P}$ 的矩形，面積最大是多少？`, k * k, '', `x+y=${2 * k}`, `xy\\le\\left(\\frac{${2 * k}}{2}\\right)^{2}=${k * k}`,
        `長＋寬＝${2 * k}，用算幾不等式`, `正方形時面積最大：$${k}\\times${k}=${k * k}$`); })
  ]);
  add(2, 'mc', [
    G(() => { const a = nz(-4, 4);
      return C(`$(${xm(-a)})^{3}$ 展開後是？`, $(poly([1, 3 * a, 3 * a * a, a ** 3])),
        [$(poly([1, 0, 0, a ** 3])), $(poly([1, 3 * a, 3 * a, a ** 3])), $(poly([1, a, a * a, a ** 3])), $(poly([1, 3 * a, 3 * a * a, -(a ** 3)]))],
        '$(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}$', `$x^{3}+3\\cdot x^{2}\\cdot${par(a)}+3\\cdot x\\cdot${a * a}+${par(a ** 3)}$`); }),
    G(() => { const a = ri(2, 6), plus = K.chance(0.5), s = plus ? '+' : '-', t = plus ? '-' : '+';
      return C(`因式分解 $x^{3}${s}${a ** 3}$`, $(`(x${s}${a})(x^{2}${t}${a}x+${a * a})`),
        [$(`(x${s}${a})^{3}`), $(`(x${s}${a})(x^{2}${s}${a}x+${a * a})`), $(`(x${t}${a})(x^{2}${s}${a}x+${a * a})`)],
        plus ? '立方和公式：$a^{3}+b^{3}=(a+b)(a^{2}-ab+b^{2})$' : '立方差公式：$a^{3}-b^{3}=(a-b)(a^{2}+ab+b^{2})$',
        `$x^{3}${s}${a}^{3}=(x${s}${a})(x^{2}${t}${a}x+${a * a})$`); }),
    G(() => { const n = pick([2, 3, 5, 6, 7]), k = ri(1, 4), m = n + k; if (Number.isInteger(Math.sqrt(m))) K.fail();
      const sum = `\\sqrt{${m}}+\\sqrt{${n}}`, dif = `\\sqrt{${m}}-\\sqrt{${n}}`;
      const right = k === 1 ? sum : `\\dfrac{${sum}}{${k}}`;
      return C(`將 $\\dfrac{1}{${dif}}$ 有理化分母`, $(right), [$(dif), $(`\\dfrac{${dif}}{${k}}`), $(sum), $(`\\dfrac{${sum}}{${m + n}}`)],
        `分子分母同乘 $${sum}$`, `分母 $(\\sqrt{${m}})^{2}-(\\sqrt{${n}})^{2}=${k}$`); })
  ]);
  add(2, 'match', [
    G(() => { const n = pick([2, 3, 5, 6, 7]), m = n + ri(1, 6); if (Number.isInteger(Math.sqrt(m))) K.fail(); return M(`(\\sqrt{${m}}+\\sqrt{${n}})(\\sqrt{${m}}-\\sqrt{${n}})`, m - n, '平方差：$(a+b)(a-b)=a^{2}-b^{2}$', '它的值'); }),
    G(() => { const q = ri(20, 99), p = q + 2 * ri(1, 3); return M(`${p}^{2}-${q}^{2}`, (p + q) * (p - q), `平方差：$(${p}+${q})(${p}-${q})$`, '它的值'); }),
    G(() => { const k = pick([2, 3, 5, 6, 7]); return M(`(\\sqrt{${k}}+1)^{2}`, `${k + 1}+2\\sqrt{${k}}`, '和的平方：$a^{2}+2ab+b^{2}$', '它的值'); }),
    G(() => { const b = pick([2, 3, 5]), a = ri(2, 4); return M(`\\sqrt{${a * a * b}}-\\sqrt{${b}}`, a === 2 ? `\\sqrt{${b}}` : `${a - 1}\\sqrt{${b}}`, `$\\sqrt{${a * a * b}}=${a}\\sqrt{${b}}$`, '它的值'); })
  ]);

  /* ================= 2-1 指數 ================= */
  add(3, 'num', [
    G(() => { const q = pick([2, 3]), b = ri(2, q === 2 ? 9 : 5), p = ri(1, 4); if (K.gcd(p, q) !== 1) K.fail();
      const base = b ** q, v = b ** p;
      return N(`$${base}^{\\frac{${p}}{${q}}}=$？`, v, '', `${base}^{\\frac{${p}}{${q}}}`, `(${b}^{${q}})^{\\frac{${p}}{${q}}}=${b}^{${p}}=${v}`,
        `先把 $${base}$ 寫成 $${b}^{${q}}$`, `$${base}^{\\frac{${p}}{${q}}}=${b}^{${p}}=${v}$`); }),
    G(() => { const b = pick([2, 3, 5]), d = ri(1, b === 2 ? 9 : b === 3 ? 6 : 4), n = ri(1, 6), m = d + n, v = b ** d;
      return N(`$${b}^{${m}}\\times${b}^{-${n}}=$？`, v, '', `${b}^{${m}}\\times${b}^{-${n}}`, `${b}^{${m}-${n}}=${v}`,
        '同底數相乘，指數相加', `$${b}^{${m}+(-${n})}=${b}^{${d}}=${v}$`); }),
    G(() => { const b = pick([2, 3]), k = ri(2, 9), e = pick([2, 3]); const v = k ** e; if (v > 999) K.fail();
      return N(`$${b}^{a}=${k}$，求 $${b ** e}^{a}$`, v, '', `${b ** e}^{a}=(${b}^{a})^{${e}}`, `${k}^{${e}}=${v}`,
        `$${b ** e}=${b}^{${e}}$，所以 $${b ** e}^{a}=(${b}^{a})^{${e}}$`, `$(${b}^{a})^{${e}}=${k}^{${e}}=${v}$`); })
  ]);
  add(3, 'mc', [
    G(() => { const b = ri(2, 5), q = pick([2, 3]), p = ri(1, 3); if (K.gcd(p, q) !== 1 || b ** q > 999) K.fail();
      const v = b ** p;
      return C(`$\\left(\\dfrac{1}{${b ** q}}\\right)^{-\\frac{${p}}{${q}}}=$`, $(v), [$(fr(1, v)), $(b ** (p + 1)), $(-v), $(b ** q)],
        `負指數先把分數倒過來：$${b ** q}^{\\frac{${p}}{${q}}}$`, `$${b ** q}^{\\frac{${p}}{${q}}}=${b}^{${p}}=${v}$`); }),
    G(() => { const b = pick([2, 3, 5]), k = pick([1, 3, 5, 7]);
      return C(`$${b}^{x}=\\sqrt{${b ** k}}$，$x=$？`, $(fr(k, 2)), [$(k), $(fr(2, k)), $(fr(k, 3)), $(2 * k)],
        `$\\sqrt{${b ** k}}=${b}^{\\frac{${k}}{2}}$`, `$x=${fr(k, 2, false)}$`); })
  ]);
  add(3, 'match', [
    G(() => { const b = ri(2, 5), n = ri(1, 3); if (b ** n > 125) K.fail(); return M(`${b}^{-${n}}`, frV(1, b ** n), '$a^{-n}=\\frac{1}{a^{n}}$', '它的值'); }),
    G(() => { const b = ri(2, 6), q = pick([2, 3]); if (b ** q > 216) K.fail(); return M(`${b ** q}^{\\frac{1}{${q}}}`, b, `$a^{\\frac1${q}}$ 是 $a$ 的${q === 2 ? '平方根' : '立方根'}`, '它的值'); }),
    G(() => { const b = ri(2, 4), n = ri(2, 3); return M(`\\left(\\frac{1}{${b}}\\right)^{-${n}}`, b ** n, '負指數：把分數倒過來', '它的值'); })
  ]);

  /* ================= 2-2 常用對數 ================= */
  const LGA = { 2: 0.3010, 3: 0.4771, 4: 0.6020, 5: 0.6990, 6: 0.7781, 8: 0.9030, 9: 0.9542 };
  const LGHOW = { 2: '', 3: '', 4: '$\\log 4=2\\log 2$；', 5: '$\\log 5=1-\\log 2$；', 6: '$\\log 6=\\log 2+\\log 3$；', 8: '$\\log 8=3\\log 2$；', 9: '$\\log 9=2\\log 3$；' };
  add(4, 'num', [
    G(() => { const b = pick([2, 3, 5, 6]), n = ri(10, b === 2 ? 99 : 60), ap = n * LGA[b], ex = n * Math.log10(b);
      if (Math.floor(ap) !== Math.floor(ex) || ap - Math.floor(ap) < 0.01 || ap - Math.floor(ap) > 0.99) K.fail();
      const v = Math.floor(ex) + 1; if (v > 999) K.fail();
      return N(`$${b}^{${n}}$ 是幾位數？`, v, '位數', `${b}^{${n}}`, `\\log ${b}^{${n}}=${n}\\log ${b}\\approx${ap.toFixed(3)}`,
        `${LGHOW[b]}$${b}^{${n}}=10^{${n}\\log ${b}}$；若 $N=10^{k.\\cdots}$，則 $N$ 是 $k+1$ 位數`, `$${n}\\log ${b}\\approx${ap.toFixed(3)}$，是 $${v}$ 位數`, K.GIVEN); }),
    G(() => { const k = ri(1, 9), dd = ri(10, 99);
      return N(`若 $\\log x=${k}.${dd}$，$x$ 的整數部分是幾位數？`, k + 1, '位數', `\\log x=${k}.${dd}`, `10^{${k}}<x<10^{${k + 1}}`,
        `$x=10^{${k}.${dd}}$，介於 $10^{${k}}$ 與 $10^{${k + 1}}$ 之間`, `整數部分是 $${k + 1}$ 位數`); }),
    G(() => { const b = pick([2, 5]), n = ri(5, 40), lgv = b === 2 ? -LGA[2] : LGA[2] - 1, tx = b === 2 ? '0.5' : '0.2';
      const ap = n * lgv, ex = n * Math.log10(b === 2 ? 0.5 : 0.2); if (Math.floor(ap) !== Math.floor(ex) || Math.abs(ap - Math.round(ap)) < 0.01) K.fail();
      const v = -Math.floor(ex);
      return N(`把 $(${tx})^{${n}}$ 寫成小數，從小數點後第幾位開始出現不為 0 的數字？`, v, '位', `(${tx})^{${n}}`, `\\log(${tx})^{${n}}\\approx${ap.toFixed(3)}`,
        `${b === 2 ? '$\\log 0.5=-\\log 2$' : '$\\log 0.2=\\log 2-1$'}；$10^{-3.2}$ 從小數點後第 4 位開始`, `$${n}\\log ${tx}\\approx${ap.toFixed(3)}$，從第 $${v}$ 位開始`, K.GIVEN); })
  ]);
  add(4, 'mc', [
    G(() => { const k = ri(2, 6), s = '0.' + '0'.repeat(k - 1) + '1';
      return C(`$\\log${s}=$？`, $(-k), [$(k), $(-(k + 1)), $(-(k - 1)), $(fr(1, k))],
        `$${s}=10^{-${k}}$`, `$\\log10^{-${k}}=-${k}$`); }),
    G(() => { const d = pick([2, 3, 4, 5, 6, 8, 9]), k = ri(1, 5), f = LGA[d].toFixed(4).slice(1), o = LGA[pick([2, 3, 5].filter(x => x !== d))].toFixed(4).slice(1);
      return C(`${K.GIVEN}，$\\log ${d * 10 ** k}\\approx$？`, $(`${k}${f}`), [$(`${k + 1}${f}`), $(`${k - 1}${f}`), $(`${k}${o}`), $(`${k * d}${f}`)],
        `$${d * 10 ** k}=${d}\\times10^{${k}}$`, `${LGHOW[d]}$\\log ${d}+${k}\\approx${k}${f}$`); })
  ]);
  add(4, 'match', [
    G(() => { const k = ri(1, 4); return M(`\\log ${10 ** k}`, k, '$\\log10^{k}=k$', '它的值'); }),
    G(() => { const k = ri(1, 3); return M(`\\log 0.${'0'.repeat(k - 1)}1`, -k, '$0.\\cdots01=10^{-k}$', '它的值'); }),
    G(() => { const [a, b, k] = pick([[2, 50, 2], [4, 25, 2], [5, 20, 2], [8, 125, 3], [2, 500, 3], [4, 250, 3], [25, 40, 3], [20, 50, 3]]); return M(`\\log ${a}+\\log ${b}`, k, '$\\log a+\\log b=\\log ab$', '它的值'); }),
    G(() => { const k = pick([1, 3, 5]); return M(`\\log\\sqrt{${10 ** k}}`, frV(k, 2), '$\\sqrt{10^{k}}=10^{\\frac{k}{2}}$', '它的值'); })
  ]);

  /* ================= 3-1 多項式的運算與應用 ================= */
  add(5, 'num', [
    G(() => { const a = nz(-3, 3), c = [1, ri(-5, 5), ri(-6, 6), ri(-9, 9)], r = K.polyAt(c, a);
      return N(`$f(x)=${poly(c)}$ 除以 $${xm(a)}$ 的餘式是多少？`, r, '', `f(${a})`, `f(${a})=${r}`,
        `餘式定理：除以 $${xm(a)}$ 的餘式等於 $f(${a})$`, `$f(${a})=${r}$`); }),
    G(() => { const b = nz(-5, 5), c = nz(-5, 5), d = ri(1, 4), e = nz(-6, 6), v = e + b * d;
      return N(`$(${poly([1, b, c])})(${poly([d, e])})$ 展開後，$x^{2}$ 項的係數是多少？`, v, '', `x^{2}\\cdot${par(e)}+${b}x\\cdot${d}x`, `${e}+${b * d}=${v}`,
        '只要找出相乘後會得到 $x^{2}$ 的兩組', `$x^{2}\\times${par(e)}+(${b}x)\\times(${d}x)$，係數 $${e}+${par(b * d)}=${v}$`); }),
    G(() => { const n = ri(3, 9), a = 2;
      return N(`$x^{${n}}$ 除以 $x-${a}$ 的餘式是多少？`, a ** n, '', `f(${a})=${a}^{${n}}`, `${a ** n}`,
        '餘式定理：代 $x=2$', `$2^{${n}}=${a ** n}$`); })
  ]);
  add(5, 'mc', [
    G(() => { const r = nz(-3, 3), a = ri(-6, 6), b = -(r ** 3 + a * r); if (b === 0) K.fail();
      return C(`$x^{3}+ax${b > 0 ? '+' : ''}${b}$ 有因式 $${xm(r)}$，$a=$？`, $(a), [$(a + 1), $(a - 1), $(-a), $(a + 2)],
        `因式定理：$f(${r})=0$`, `$${par(r)}^{3}+${par(r)}a${b > 0 ? '+' : ''}${b}=0$，得 $a=${a}$`); }),
    G(() => { const a = nz(-3, 3), c = [1, 0, ri(-5, 5), ri(-9, 9)], r = K.polyAt(c, a), r2 = K.polyAt(c, -a);
      return C(`$f(x)=${poly(c)}$ 除以 $${xm(a)}$ 的餘式是？`, $(r), [$(r2), $(-r), $(r + 1), $(r - 2)],
        `餘式定理：代 $x=${a}$`, `$f(${a})=${r}$`); })
  ]);
  add(5, 'match', [
    G(() => { const a = nz(-3, 3), c = [ri(1, 2), ri(-4, 4), ri(-5, 5)], r = K.polyAt(c, a);
      return M(`(${poly(c)})\\div(${xm(a)})`, r, `餘式定理：代 $x=${a}$`, '它的餘式'); }),
    G(() => { const a = nz(-2, 2), c = [1, 0, ri(-3, 3), ri(-5, 5)], r = K.polyAt(c, a);
      return M(`(${poly(c)})\\div(${xm(a)})`, r, `餘式定理：代 $x=${a}$`, '它的餘式'); })
  ]);

  /* ================= 3-2 簡單多項式函數及其圖形 ================= */
  add(6, 'num', [
    G(() => { const h = nz(-5, 6), k = ri(1, 30);
      return N(`$y=${poly([-1, 2 * h, k - h * h])}$ 的最大值是多少？`, k, '', `y=-(${xm(h)})^{2}+${k}`, `\\text{最大值}=${k}`,
        '配方成 $y=-(x-h)^{2}+k$', `$y=-(${xm(h)})^{2}+${k}$，$x=${h}$ 時最大值 $${k}$`); }),
    G(() => { const h = ri(1, 9), a = ri(1, 3) * (K.chance(0.5) ? 1 : -1), c = ri(-9, 9);
      return N(`$y=${poly([a, -2 * a * h, c])}$ 的對稱軸是 $x=$？`, h, '', 'x=-\\frac{b}{2a}', `x=${h}`,
        '對稱軸 $x=-\\frac{b}{2a}$', `$x=-\\frac{${-2 * a * h}}{2\\times${par(a)}}=${h}$`); }),
    G(() => { const h = nz(-5, 5), m = ri(1, 15), k = m + h * h;
      return N(`$y=x^{2}${term(-2 * h, 'x', 1)}+k$ 的最小值為 $${m}$，$k=$？`, k, '', `y=(${xm(h)})^{2}+k-${h * h}`, `k-${h * h}=${m}`,
        '先配方找出最小值的式子', `$k-${h * h}=${m}$，$k=${k}$`); })
  ]);
  add(6, 'mc', [
    G(() => { const h = nz(-5, 5), c = ri(-5, 9), k = c - h * h;
      return C(`$y=${poly([1, -2 * h, c])}$ 的頂點是？`, $(`(${h},${k})`), [$(`(${-h},${k})`), $(`(${h},${c + h * h})`), $(`(${-h},${c + h * h})`)],
        '配方：$y=(x-h)^{2}+k$ 的頂點為 $(h,k)$', `$y=(${xm(h)})^{2}${k >= 0 ? '+' : ''}${k}$`); }),
    G(() => { const a = ri(1, 4), h = nz(-5, 5), k = nz(-6, 6); if (Math.abs(h) === Math.abs(k)) K.fail();
      return C(`$y=${a === 1 ? '' : a}(${xm(-h)})^{2}${k > 0 ? '+' : ''}${k}$ 的最小值是？`, $(k), [$(-k), $(h), $(-h), $(a + k)],
        '$a>0$ 時，$y=a(x-h)^{2}+k$ 的最小值是 $k$', `$x=${-h}$ 時，最小值 $${k}$`); })
  ]);

  /* ================= 3-3 多項式函數的圖形與多項式不等式 ================= */
  add(7, 'num', [
    G(() => { const a = ri(-5, 4), b = a + ri(2, 9), strict = K.chance(0.5), v = strict ? b - a - 1 : b - a + 1;
      const s = strict ? '<' : '\\le ';   // \le 後面要留空格，否則會和 x 黏成 \lex
      return N(`$${poly([1, -(a + b), a * b])}${s}0$ 有幾個整數解？`, v, '個', `(${xm(a)})(${xm(b)})${s}0`, `${a}${s}x${s}${b}`,
        '先因式分解，解在兩根之間', `$${a}${s}x${s}${b}$，共 $${v}$ 個整數`); })
  ]);
  add(7, 'mc', [
    G(() => { const a = ri(-5, 3), b = a + ri(2, 6); if (a + b === 0) K.fail();
      return C(`$${poly([1, -(a + b), a * b])}<0$ 的解是？`, $(`${a}<x<${b}`), [`$x<${a}$ 或 $x>${b}$`, $(`${-b}<x<${-a}`), $(`x>${b}`)],
        '先因式分解，小於 0 取兩根之間', `$(${xm(a)})(${xm(b)})<0$，$${a}<x<${b}$`); }),
    G(() => { const a = ri(-5, 3), b = a + ri(2, 6); if (a + b === 0) K.fail();
      return C(`$${poly([1, -(a + b), a * b])}\\ge0$ 的解是？`, `$x\\le${a}$ 或 $x\\ge${b}$`, [$(`${a}\\le x\\le${b}`), $(`x\\ge${b}`), `$x\\le${-b}$ 或 $x\\ge${-a}$`],
        '先因式分解，大於等於 0 取兩根之外', `$(${xm(a)})(${xm(b)})\\ge0$`); }),
    G(() => { const a = ri(-5, 0), b = a + ri(1, 3), c = b + ri(1, 4);
      return C(`$(${xm(a)})(${xm(b)})(${xm(c)})<0$ 的解是？`, `$x<${a}$ 或 $${b}<x<${c}$`, [`$${a}<x<${b}$ 或 $x>${c}$`, $(`x<${a}`), $(`${b}<x<${c}`)],
        '在數線上標出三根，最右邊區間為正，往左正負交替', `$x<${a}$ 或 $${b}<x<${c}$`); })
  ]);

  /* ================= 4-1 直線方程式及其圖形 ================= */
  add(8, 'num', [
    G(() => { const p = ri(1, 12), q = ri(1, 12); if ((p * q) % 2) K.fail(); const g = K.gcd(p, q), A = q / g, B = p / g, Cc = p * q / g;
      return N(`直線 $${A === 1 ? '' : A}x+${B === 1 ? '' : B}y=${Cc}$ 與兩坐標軸圍成的三角形面積是多少？`, p * q / 2, '', `x\\text{截距}=${p},\\ y\\text{截距}=${q}`, `\\frac12\\times${p}\\times${q}=${p * q / 2}`,
        '先求兩個截距', `截距 $${p}$、$${q}$，面積 $\\frac12\\times${p}\\times${q}=${p * q / 2}$`); }),
    G(() => { const x1 = ri(-3, 3), y1 = ri(-3, 5), d = ri(1, 4), m = nz(-3, 4), k = y1 + m * d; if (k < 1) K.fail();
      return N(`$(${x1},${y1})$、$(${x1 + d},k)$、$(${x1 + 2 * d},${y1 + 2 * m * d})$ 三點共線，$k=$？`, k, '', 'm_1=m_2', `k=${k}`,
        '任兩點的斜率相等', `斜率 $\\frac{${2 * m * d}}{${2 * d}}=${m}$，$k=${y1}+${par(m * d)}=${k}$`); }),
    G(() => { const m = ri(1, 5), t = ri(1, 9), b = m * t;
      return N(`直線 $ax+${b}y=1$ 與 $y=${m === 1 ? '' : m}x+5$ 垂直，$a=$？`, t, '', `m_1m_2=-1`, `-\\frac{a}{${b}}\\times${m}=-1`,
        '垂直時兩斜率相乘為 $-1$', `$-\\frac{a}{${b}}\\times${m}=-1$，$a=${t}$`); })
  ]);
  add(8, 'mc', [
    G(() => { const x1 = ri(-4, 4), y1 = ri(-4, 4), dx = nz(-5, 5), dy = nz(-6, 6); if (Math.abs(dx) === Math.abs(dy)) K.fail();
      return C(`通過 $(${x1},${y1})$、$(${x1 + dx},${y1 + dy})$ 的直線，斜率是？`, $(fr(dy, dx)), [$(fr(dx, dy)), $(fr(-dy, dx)), $(fr(-dx, dy))],
        '斜率 $=\\frac{y_2-y_1}{x_2-x_1}$', `$\\frac{${dy}}{${dx}}=${fr(dy, dx, false)}$`); }),
    G(() => { const x0 = nz(-4, 4), y0 = ri(-4, 6), m = nz(-3, 3), c = y0 - m * x0, c2 = y0 + m * x0; if (c === c2) K.fail();
      return C(`通過 $(${x0},${y0})$ 且斜率為 $${m}$ 的直線是？`, $(`y=${poly([m, c])}`), [$(`y=${poly([m, c2])}`), $(`y=${poly([-m, c2])}`), $(`y=${poly([m, -c])}`), $(`y=${poly([-m, c])}`)],
        '點斜式：$y-y_0=m(x-x_0)$', `$y-${par(y0)}=${m}(x-${par(x0)})$，$y=${poly([m, c])}$`); })
  ]);
  add(8, 'match', [
    G(() => { const a = nz(-5, 5), b = nz(-5, 5), c = ri(1, 9); return M(`${term(a, 'x', 1, true)}${term(b, 'y', 1)}=${c}`, frV(-a, b), '$ax+by=c$ 的斜率為 $-\\frac{a}{b}$', '它的斜率'); }),
    G(() => { const m = nz(-6, 6), b = nz(-9, 9); return M(`y=${poly([m, b])}`, m, '$y=mx+b$ 的斜率是 $m$', '它的斜率'); })
  ]);

  /* ================= 4-2 直線方程式的應用 ================= */
  const tri = () => { const [a, b, h] = pick(K.TRIPLES.slice(0, 5)); return K.chance(0.5) ? [a, b, h] : [b, a, h]; };
  const lineTex = (a, b, c) => `${term(a, 'x', 1, true)}${term(b, 'y', 1)}${c === 0 ? '' : (c > 0 ? '+' : '') + c}=0`;
  add(9, 'num', [
    G(() => { let [a, b, h] = tri(); if (K.chance(0.5)) b = -b; const d = ri(1, 9), c = (K.chance(0.5) ? 1 : -1) * d * h;
      return N(`原點到直線 $${lineTex(a, b, c)}$ 的距離是多少？`, d, '', `\\frac{|${c}|}{\\sqrt{${a}^{2}+${b}^{2}}}`, `\\frac{${Math.abs(c)}}{${h}}=${d}`,
        '點到直線距離 $\\frac{|ax_0+by_0+c|}{\\sqrt{a^{2}+b^{2}}}$', `$\\frac{${Math.abs(c)}}{${h}}=${d}$`); }),
    G(() => { let [a, b, h] = tri(); if (K.chance(0.5)) b = -b; const d = ri(1, 9), x0 = ri(-4, 4), y0 = ri(-4, 4), c = (K.chance(0.5) ? 1 : -1) * d * h - a * x0 - b * y0; if (c === 0) K.fail();
      return N(`點 $(${x0},${y0})$ 到直線 $${lineTex(a, b, c)}$ 的距離是多少？`, d, '', `\\frac{|${a}\\cdot${par(x0)}+${par(b)}\\cdot${par(y0)}+${par(c)}|}{${h}}`, `=${d}`,
        '點到直線距離 $\\frac{|ax_0+by_0+c|}{\\sqrt{a^{2}+b^{2}}}$', `$\\frac{|${a * x0 + b * y0 + c}|}{${h}}=${d}$`); }),
    G(() => { const [a, b, h] = tri(), c1 = ri(-10, 10), d = ri(1, 6), c2 = c1 + (K.chance(0.5) ? 1 : -1) * d * h;
      return N(`兩平行線 $${a}x+${b}y=${c1}$ 與 $${a}x+${b}y=${c2}$ 的距離是多少？`, d, '', `\\frac{|${c1}-(${c2})|}{${h}}`, `=${d}`,
        '平行線距離 $\\frac{|c_1-c_2|}{\\sqrt{a^{2}+b^{2}}}$', `$\\frac{${Math.abs(c1 - c2)}}{${h}}=${d}$`); })
  ]);
  add(9, 'mc', [
    G(() => { const [a, b, h] = tri(), x0 = ri(-3, 4), y0 = ri(-3, 4), c = nz(-9, 9), v = Math.abs(a * x0 + b * y0 + c); if (v % h === 0 || v === 0) K.fail();
      return C(`點 $(${x0},${y0})$ 到直線 $${lineTex(a, b, c)}$ 的距離是？`, $(fr(v, h)), [$(fr(v, h * h)), $(fr(v + 1, h)), $(fr(Math.abs(a * x0 + b * y0), h)), $(fr(v, a + b))],
        '點到直線距離 $\\frac{|ax_0+by_0+c|}{\\sqrt{a^{2}+b^{2}}}$', `$\\frac{${v}}{${h}}$`); })
  ]);
  add(9, 'match', [
    G(() => { const [a, b, h] = tri(), d = ri(1, 9); return M(`${a}x+${b}y=${d * h}`, d, '原點到 $ax+by=c$ 的距離為 $\\frac{|c|}{\\sqrt{a^{2}+b^{2}}}$', '原點到它的距離'); }),
    G(() => { const d = ri(1, 9), axis = K.chance(0.5) ? 'x' : 'y'; return M(`${axis}=${K.chance(0.5) ? d : -d}`, d, '鉛直線、水平線到原點的距離就是坐標的絕對值', '原點到它的距離'); })
  ]);

  /* ================= 4-3 圓與直線的關係 ================= */
  const circTex = (h, k, r) => { const F = h * h + k * k - r * r; return `x^{2}+y^{2}${term(-2 * h, 'x', 1)}${term(-2 * k, 'y', 1)}${F === 0 ? '' : (F > 0 ? '+' : '') + F}=0`; };
  add(10, 'num', [
    G(() => { const h = nz(-6, 6), k = nz(-6, 6), r = ri(1, 9);
      return N(`圓 $${circTex(h, k, r)}$ 的半徑是多少？`, r, '', `(${xm(h)})^{2}+(${xm(k, 'y')})^{2}=${r * r}`, `r=${r}`,
        '配方成標準式 $(x-h)^{2}+(y-k)^{2}=r^{2}$', `圓心 $(${h},${k})$，半徑 $${r}$`); }),
    G(() => { const [a, b, h] = pick(K.TRIPLES.slice(0, 6)), r = ri(1, h - 1);
      return N(`點 $(${a},${b})$ 到圓 $x^{2}+y^{2}=${r * r}$ 的最短距離是多少？`, h - r, '', `\\sqrt{${a}^{2}+${b}^{2}}-${r}`, `${h}-${r}=${h - r}`,
        '點到圓心的距離減去半徑', `點到圓心 $${h}$，減去半徑 $${r}$ 得 $${h - r}$`); }),
    G(() => { const [a, b, h] = pick(K.TRIPLES.slice(0, 6));
      return N(`直線 $y=${a}$ 截圓 $x^{2}+y^{2}=${h * h}$ 所得的弦長是多少？`, 2 * b, '', `2\\sqrt{${h}^{2}-${a}^{2}}`, `2\\times${b}=${2 * b}`,
        '弦心距 $d$、半徑 $r$，弦長 $2\\sqrt{r^{2}-d^{2}}$', `$2\\sqrt{${h * h}-${a * a}}=${2 * b}$`); }),
    G(() => { const [a, b, h] = pick(K.TRIPLES.slice(0, 4)), r = ri(1, 6);
      return N(`直線 $${a}x+${b}y=k$（$k>0$）與圓 $x^{2}+y^{2}=${r * r}$ 相切，$k=$？`, h * r, '', `\\frac{k}{${h}}=${r}`, `k=${h * r}`,
        '相切：圓心到直線的距離等於半徑', `$\\frac{k}{${h}}=${r}$，$k=${h * r}$`); })
  ]);
  add(10, 'mc', [
    G(() => { const h = nz(-5, 5), k = nz(-5, 5), r = ri(1, 7); if (Math.abs(h) === Math.abs(k)) K.fail();
      return C(`$${circTex(h, k, r)}$ 的圓心與半徑是？`, `圓心 $(${h},${k})$、半徑 $${r}$`,
        [`圓心 $(${-h},${-k})$、半徑 $${r}$`, `圓心 $(${h},${k})$、半徑 $${r * r}$`, `圓心 $(${k},${h})$、半徑 $${r}$`, `圓心 $(${-h},${-k})$、半徑 $${r * r}$`],
        '配方成 $(x-h)^{2}+(y-k)^{2}=r^{2}$', `$(${xm(h)})^{2}+(${xm(k, 'y')})^{2}=${r * r}$`); })
  ]);
  add(10, 'match', [
    G(() => { const h = ri(-4, 4), k = ri(-4, 4), r = ri(1, 9); return M(`(${xm(h)})^{2}+(${xm(k, 'y')})^{2}=${r * r}`, r, '標準式 $(x-h)^{2}+(y-k)^{2}=r^{2}$', '它的半徑'); }),
    G(() => { const h = nz(-4, 4), k = ri(-4, 4), r = ri(1, 9); return M(circTex(h, k, r), r, '配方成標準式', '它的半徑'); }),
    G(() => { const n = pick([2, 3, 5, 6, 7, 8, 12]); return M(`x^{2}+y^{2}=${n}`, K.sqrtTex(n).replace(/^\\sqrt/, '\\sqrt'), '$x^{2}+y^{2}=r^{2}$', '它的半徑'); })
  ]);
})(window.LG);
