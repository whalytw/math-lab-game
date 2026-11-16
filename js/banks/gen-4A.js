/* 三上選修甲（選修數學甲(上)，南一）隨機題型
   必須在 4B.js 之前載入：選修乙用 copy() 沿用選修甲題目時，這些樣板也會一起沿用（都不是只有甲才教的內容）。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('4A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, fr, frV, par, poly, term, xm, C, N, M } = K;
  const $ = s => `$${s}$`;
  const LIM = '\\lim\\limits_{n\\to\\infty}';
  const LX = a => `\\lim\\limits_{x\\to ${a}}`;
  const cx = s => (s === '1' ? '' : s === '-1' ? '-' : s);   // 係數 1、-1 不寫數字

  /* ================= 1-1 數列及其極限 ================= */
  add(1, 'num', [
    G(() => { const d = ri(1, 5), t = ri(1, 9), a = d * t, b = ri(-6, 6), c = ri(-6, 6), e = nz(-6, 6);
      return N(`$${LIM}\\dfrac{${poly([a, b, c], 'n')}}{${poly([d, 0, e], 'n')}}=$？`, t, '', `\\frac{${a}}{${d}}`, `=${t}`,
        '分子分母同除以 $n^{2}$', `最高次項係數比 $\\frac{${a}}{${d}}=${t}$`); }),
    G(() => { const r = ri(2, 5), k = ri(1, 5), c = ri(1, 9), e = ri(1, 9);
      return N(`$${LIM}\\dfrac{${k === 1 ? '' : k}\\cdot${r}^{n+1}+${c}}{${r}^{n}+${e}}=$？`, k * r, '', `\\frac{${k}\\cdot${r}\\cdot${r}^{n}}{${r}^{n}}`, `=${k * r}`,
        `分子分母同除以 $${r}^{n}$`, `$\\frac{${k * r}+\\frac{${c}}{${r}^{n}}}{1+\\frac{${e}}{${r}^{n}}}\\to${k * r}$`); }),
    G(() => { const a = ri(1, 9);
      return N(`$${LIM}\\left(\\sqrt{n^{2}+${2 * a}n}-n\\right)=$？`, a, '', `\\frac{${2 * a}n}{\\sqrt{n^{2}+${2 * a}n}+n}`, `\\to\\frac{${2 * a}}{2}=${a}`,
        '分子有理化', `$\\frac{${2 * a}n}{\\sqrt{n^{2}+${2 * a}n}+n}\\to\\frac{${2 * a}}{2}=${a}$`); })
  ]);
  add(1, 'mc', [
    G(() => { const a = ri(1, 9), d = ri(2, 7); if (a % d === 0) K.fail(); const b = ri(-5, 5), e = ri(-5, 5);
      return C(`$${LIM}\\dfrac{${poly([a, b, 1], 'n')}}{${poly([d, e, 0], 'n')}}=$？`, $(fr(a, d)), [$(fr(d, a)), $(a), $('0'), $(fr(a + b, d + e || 1))],
        '分子分母同除以 $n^{2}$', `最高次項係數比 $${fr(a, d, false)}$`); }),
    G(() => { const p = pick([1, 3, 5, 7, 9, 11, 13, 15, 17, 19]);
      const pn = p === 1 ? 'n' : `${p}n`;
      return C(`$${LIM}\\left(\\sqrt{n^{2}+${pn}}-n\\right)=$？`, $(fr(p, 2)), [$(p), $('0'), $(fr(p, 4)), $('\\infty')],
        '分子有理化', `$\\frac{${pn}}{\\sqrt{n^{2}+${pn}}+n}\\to${fr(p, 2, false)}$`); })
  ]);
  add(1, 'match', [
    G(() => { const p = ri(1, 9), r = ri(1, 5), q = ri(-5, 5), s = ri(1, 6); return M(`${LIM}\\dfrac{${poly([p, q], 'n')}}{${poly([r, s], 'n')}}`, frV(p, r), '分子分母同除以 $n$', '它的極限'); }),
    G(() => { const c = ri(1, 9), k = ri(1, 3); return M(`${LIM}\\dfrac{${c}}{n${k === 1 ? '' : `^{${k}}`}}`, 0, '分母趨近無限大', '它的極限'); }),
    G(() => { const r = ri(2, 6), c = ri(1, 9); return M(`${LIM}\\dfrac{${r}^{n}+${c}}{${r}^{n}}`, 1, `分子分母同除以 $${r}^{n}$`, '它的極限'); })
  ]);

  /* ================= 1-2 無窮等比級數 ================= */
  add(2, 'num', [
    G(() => { const n = ri(5, 40); return N(`$\\sum\\limits_{k=1}^{${n}}k=$？`, n * (n + 1) / 2, '', `\\frac{${n}\\times${n + 1}}{2}`, `=${n * (n + 1) / 2}`,
      '$\\sum_{k=1}^{n}k=\\frac{n(n+1)}{2}$', `$\\frac{${n}\\times${n + 1}}{2}=${n * (n + 1) / 2}$`); }),
    G(() => { const n = ri(3, 31); return N(`$\\sum\\limits_{k=1}^{${n}}(2k-1)=$？`, n * n, '', `1+3+\\cdots+${2 * n - 1}`, `=${n}^{2}=${n * n}`,
      '前 $n$ 個奇數的和是 $n^{2}$', `$${n}^{2}=${n * n}$`); }),
    G(() => { const m = ri(2, 5), t = ri(1, 30), a = (m - 1) * t;
      return N(`$${a}+\\dfrac{${a}}{${m}}+\\dfrac{${a}}{${m * m}}+\\cdots=$？`, m * t, '', `\\frac{${a}}{1-\\frac{1}{${m}}}`, `=${m * t}`,
        '無窮等比級數 $\\frac{a}{1-r}$（$|r|<1$）', `$\\frac{${a}}{1-\\frac1{${m}}}=${m * t}$`); }),
    G(() => { const m = ri(2, 4), t = ri(1, 9), h = (m - 1) * t, v = h * (m + 1) / (m - 1);
      return N(`球從 ${h} 公尺高落下，每次反彈高度是前一次的 $\\dfrac1{${m}}$，到靜止共移動幾公尺？`, v, '公尺', `${h}+2\\times\\frac{\\frac{${h}}{${m}}}{1-\\frac1{${m}}}`, `=${v}`,
        '落下 + 每次反彈都上下各一次', `$${h}+2\\times${fr(h, m - 1, false)}=${v}$`); })
  ]);
  add(2, 'mc', [
    G(() => { const ab = ri(10, 98); if (ab % 11 === 0) K.fail();
      return C(`$0.\\overline{${ab}}$ 化成分數是？`, $(fr(ab, 99)), [$(fr(ab, 100)), $(fr(ab, 90)), $(fr(ab + 1, 99))],
        `$0.\\overline{${ab}}=\\frac{${ab}}{100}+\\frac{${ab}}{100^{2}}+\\cdots$`, `$\\frac{${ab}}{99}=${fr(ab, 99, false)}$`); }),
    G(() => { const a = ri(1, 9), m = ri(2, 5), s = K.chance(0.5) ? 1 : -1;
      return C(`$${a}${s > 0 ? '+' : '-'}\\dfrac{${a}}{${m}}+\\dfrac{${a}}{${m * m}}${s > 0 ? '+' : '-'}\\cdots=$？`, $(fr(a * m, m - s)), [$(fr(a * m, m + s)), $(fr(a, m - 1)), $(a * m), $(fr(a, m))],
        `公比 $r=${s > 0 ? '' : '-'}\\frac1{${m}}$，和 $=\\frac{a}{1-r}$`, `$\\frac{${a}}{1-(${s > 0 ? '' : '-'}\\frac1{${m}})}=${fr(a * m, m - s, false)}$`); })
  ]);
  add(2, 'match', [
    G(() => { const n = ri(3, 12); return M(`\\sum\\limits_{k=1}^{${n}}k`, n * (n + 1) / 2, '$\\frac{n(n+1)}{2}$', '它的和'); }),
    G(() => { const m = ri(2, 9); return M(`\\sum\\limits_{n=1}^{\\infty}\\left(\\frac1{${m}}\\right)^{n}`, frV(1, m - 1), '$\\frac{r}{1-r}$', '它的和'); }),
    G(() => { const n = ri(2, 6); return M(`\\sum\\limits_{k=1}^{${n}}2^{k}`, 2 ** (n + 1) - 2, '等比級數和 $\\frac{a(r^{n}-1)}{r-1}$', '它的和'); })
  ]);

  /* ================= 1-3 函數（配對題固定用 f(x)=x²+1、g(x)=2x-3，和題目說明一致） ================= */
  const f = x => x * x + 1, g = x => 2 * x - 3;
  add(3, 'match', [
    G(() => { const a = ri(-4, 5); return M(`f(${a})`, f(a), '$f(x)=x^{2}+1$', '它的值（$f(x)=x^{2}+1$、$g(x)=2x-3$）'); }),
    G(() => { const a = ri(-4, 8); return M(`g(${a})`, g(a), '$g(x)=2x-3$', '它的值（$f(x)=x^{2}+1$、$g(x)=2x-3$）'); }),
    G(() => { const a = ri(-1, 4); return M(`(f\\circ g)(${a})`, f(g(a)), '先算 $g$，再代入 $f$', '它的值（$f(x)=x^{2}+1$、$g(x)=2x-3$）'); }),
    G(() => { const a = ri(-3, 3); return M(`(g\\circ f)(${a})`, g(f(a)), '先算 $f$，再代入 $g$', '它的值（$f(x)=x^{2}+1$、$g(x)=2x-3$）'); })
  ]);
  add(3, 'num', [
    G(() => { const a = nz(-4, 5), b = ri(-9, 9), t = nz(-4, 4), v = a * t * t + b; if (v < 1) K.fail();
      return N(`$f(x)=${poly([a, b])}$、$g(x)=x^{2}$，$(f\\circ g)(${t})=$？`, v, '', `f(g(${t}))=f(${t * t})`, `=${v}`,
        '先算 $g$，再代入 $f$', `$g(${t})=${t * t}$，$f(${t * t})=${v}$`); }),
    G(() => { const a = ri(2, 6), x = ri(1, 9), b = ri(1, 9), c = a * x - b;
      return N(`$f(x)=${a}x-${b}$，$f^{-1}(${c})=$？`, x, '', `f(x)=${c}`, `x=${x}`,
        '$f^{-1}(c)$ 就是使 $f(x)=c$ 的 $x$', `$${a}x-${b}=${c}$，$x=${x}$`); }),
    G(() => { const h = nz(-5, 5), m = ri(1, 30), c = m + h * h;
      return N(`$f(x)=${poly([1, -2 * h, c])}$ 的最小值是多少？`, m, '', `(${xm(h)})^{2}+${m}`, `=${m}`,
        '配方', `$(${xm(h)})^{2}+${m}$，最小值 $${m}$`); })
  ]);
  add(3, 'mc', [
    G(() => { const a = ri(2, 6), b = nz(-9, 9);
      return C(`$f(x)=${poly([a, b])}$ 的反函數是？`, $(`f^{-1}(x)=\\dfrac{${poly([1, -b])}}{${a}}`), [$(`f^{-1}(x)=\\dfrac{${poly([1, b])}}{${a}}`), $(`f^{-1}(x)=${poly([a, -b])}`), $(`f^{-1}(x)=\\dfrac{1}{${poly([a, b])}}`)],
        '令 $y=f(x)$，解出 $x$ 再把 $x$、$y$ 對調', `$y=${poly([a, b])}\\Rightarrow x=\\frac{${poly([1, -b], 'y')}}{${a}}$`); }),
    G(() => { const h = nz(-5, 5), c = ri(-5, 9), m = c - h * h;
      return C(`$f(x)=${poly([1, -2 * h, c])}$ 的值域是？`, $(`y\\ge${m}`), [$(`y\\le${m}`), $(`y\\ge${c}`), $(`y\\ge${c + h * h}`), $('\\text{全體實數}')],
        '配方找最小值', `$(${xm(h)})^{2}${m >= 0 ? '+' : ''}${m}\\ge${m}$`); })
  ]);

  /* ================= 1-4 函數的極限 ================= */
  add(4, 'num', [
    G(() => { const a = ri(1, 9), cube = K.chance(0.5), v = cube ? 3 * a * a : 2 * a;
      return N(`$${LX(a)}\\dfrac{x^{${cube ? 3 : 2}}-${a ** (cube ? 3 : 2)}}{x-${a}}=$？`, v, '', cube ? `x^{2}+${a}x+${a * a}` : `x+${a}`, `\\to${v}`,
        '分子因式分解，約去 $x-a$', `約分後代 $x=${a}$，得 $${v}$`); }),
    G(() => { const a = ri(1, 9);
      return N(`$\\lim\\limits_{x\\to\\infty}\\left(\\sqrt{x^{2}+${2 * a}x}-x\\right)=$？`, a, '', `\\frac{${2 * a}x}{\\sqrt{x^{2}+${2 * a}x}+x}`, `\\to${a}`,
        '分子有理化', `$\\frac{${2 * a}}{2}=${a}$`); })
  ]);
  add(4, 'mc', [
    G(() => { const p = ri(1, 9), q = ri(2, 7); if (p % q === 0) K.fail(); const b = ri(-5, 5);
      return C(`$\\lim\\limits_{x\\to\\infty}\\dfrac{${poly([p, b, 1])}}{${poly([q, 0, -3])}}=$？`, $(fr(p, q)), [$(fr(q, p)), $(p), $('0'), $('\\infty')],
        '分子分母同除以 $x^{2}$', `$${fr(p, q, false)}$`); }),
    G(() => { const r = ri(1, 12), a = r * r;
      return C(`$${LX(a)}\\dfrac{\\sqrt x-${r}}{x-${a}}=$？`, $(fr(1, 2 * r)), [$(fr(1, r)), $(2 * r), $('0'), $(fr(1, a))],
        `$x-${a}=(\\sqrt x-${r})(\\sqrt x+${r})$`, `$\\frac{1}{\\sqrt x+${r}}\\to${fr(1, 2 * r, false)}$`); })
  ]);
  add(4, 'match', [
    G(() => { const a = ri(-3, 4), m = nz(-4, 5), b = ri(-5, 5); return M(`${LX(a)}(${poly([m, b])})`, m * a + b, '多項式函數直接代入', '它的極限值'); }),
    G(() => { const a = nz(-4, 5); return M(`${LX(a)}\\dfrac{x^{2}-${a * a}}{${xm(a)}}`, 2 * a, '約去 $x-a$ 後代入', '它的極限值'); }),
    G(() => { const p = ri(1, 9), q = ri(1, 9); return M(`\\lim\\limits_{x\\to\\infty}\\dfrac{${p}x}{x+${q}}`, p, '分子分母同除以 $x$', '它的極限值'); })
  ]);

  /* ================= 2-1 微分的概念與性質 ================= */
  add(5, 'num', [
    G(() => { const a = nz(-4, 5), b = ri(-9, 9), c = ri(-9, 9), t = ri(-4, 5), v = 2 * a * t + b; if (v < 1) K.fail();
      return N(`$f(x)=${poly([a, b, c])}$，$f'(${t})=$？`, v, '', `f'(x)=${poly([2 * a, b])}`, `f'(${t})=${v}`,
        '$(ax^{2}+bx+c)\'=2ax+b$', `$f'(${t})=${2 * a}\\times${par(t)}+${par(b)}=${v}$`); }),
    G(() => { const p = ri(-9, 9), t = nz(-5, 5), v = 3 * t * t + p; if (v < 1) K.fail();
      return N(`$f(x)=x^{3}${term(p, 'x', 1)}$，$f'(${t})=$？`, v, '', `f'(x)=3x^{2}${p ? (p > 0 ? '+' : '') + p : ''}`, `=${v}`,
        '$(x^{n})\'=nx^{n-1}$', `$3\\times${t * t}+${par(p)}=${v}$`); }),
    G(() => { const b = ri(-6, 6), t = ri(-3, 6), v = 2 * t + b; if (v < 1) K.fail();
      return N(`$f(x)=x^{2}${term(b, 'x', 1)}$，$\\lim\\limits_{h\\to0}\\dfrac{f(${t}+h)-f(${t})}{h}=$？`, v, '', `f'(${t})`, `=${v}`,
        '這個極限就是導數 $f\'(' + t + ')$', `$f'(x)=${poly([2, b])}$，$f'(${t})=${v}$`); }),
    G(() => { const x0 = ri(1, 5), p = ri(-9, 9), s = 3 * x0 * x0 + p; if (s < 1) K.fail();
      return N(`$y=x^{3}${term(p, 'x', 1)}$ 上切線斜率為 $${s}$ 的點，$x$ 坐標（正數）是多少？`, x0, '', `3x^{2}${p ? (p > 0 ? '+' : '') + p : ''}=${s}`, `x=${x0}`,
        '切線斜率 = 導數', `$3x^{2}=${s - p}$，$x=${x0}$`); })
  ]);
  add(5, 'mc', [
    G(() => { const p = ri(-4, 4), q = ri(-6, 6), t = nz(-3, 3), v = 3 * t * t + 2 * p * t + q;
      return C(`$f(x)=x^{3}${term(p, 'x', 2)}${term(q, 'x', 1)}$，$f'(${t})=$？`, $(v), [$(t ** 3 + p * t * t + q * t), $(3 * t + 2 * p + q), $(v + 1), $(3 * t * t + p * t + q)],
        '逐項微分', `$f'(x)=3x^{2}${term(2 * p, 'x', 1)}${q ? (q > 0 ? '+' : '') + q : ''}$，$f'(${t})=${v}$`); }),
    G(() => { const t = nz(-4, 4);
      return C(`$y=x^{2}$ 在點 $(${t},${t * t})$ 的切線方程式是？`, $(`y=${poly([2 * t, -t * t])}`), [$(`y=${poly([2 * t, t * t])}`), $(`y=${poly([t, -t * t])}`), $(`y=${poly([2 * t, -2 * t * t])}`), $(`y=${poly([t, 0])}`)],
        `切線斜率 $=2\\times${par(t)}$`, `$y-${t * t}=${2 * t}(x-${par(t)})$，$y=${poly([2 * t, -t * t])}$`); })
  ]);
  add(5, 'match', [
    G(() => { const a = nz(-5, 5), n = ri(2, 4); return M(poly([a].concat(Array(n).fill(0))), poly([a * n].concat(Array(n - 1).fill(0))), '$(ax^{n})\'=anx^{n-1}$', '它的導函數'); }),
    G(() => { const a = nz(-4, 4), b = nz(-6, 6), c = ri(-9, 9); return M(poly([a, b, c]), poly([2 * a, b]), '逐項微分，常數的導數是 0', '它的導函數'); })
  ]);

  /* ================= 2-2 微分的應用 ================= */
  add(6, 'num', [
    G(() => { const a = ri(1, 4), c = ri(-10, 20), v = 2 * a ** 3 + c; if (v < 1) K.fail();
      return N(`$f(x)=x^{3}-${3 * a * a}x${c === 0 ? '' : (c > 0 ? '+' : '') + c}$ 的極大值是多少？`, v, '', `f'(x)=3x^{2}-${3 * a * a}=0`, `f(${-a})=${v}`,
        '$f\'(x)=0$ 找臨界點，再判斷增減', `$x=${-a}$ 時有極大值 $f(${-a})=${v}$`); }),
    G(() => { const k = ri(2, 20), L = 4 * k;
      return N(`用 ${L} 公尺籬笆靠牆圍一個矩形（靠牆那邊不用籬笆），面積最大是多少平方公尺？`, 2 * k * k, '平方公尺', `x(${L}-2x)`, `x=${k}\\ \\text{時}\\ ${2 * k * k}`,
        `設垂直牆的邊長為 $x$，面積 $x(${L}-2x)$`, `$x=${k}$ 時，面積 $${k}\\times${2 * k}=${2 * k * k}$`); })
  ]);
  add(6, 'mc', [
    G(() => { const p = ri(-4, 3), q = p + ri(1, 4), c = ri(-5, 9);
      // f'(x)=6(x-p)(x-q)，在 p、q 之間遞減
      return C(`$f(x)=${poly([2, -3 * (p + q), 6 * p * q, c])}$ 的遞減區間是？`, $(`${p}\\le x\\le${q}`), [`$x\\le${p}$ 或 $x\\ge${q}$`, $(`x\\ge${q}`), $(`${-q}\\le x\\le${-p}`), $(`x\\le${p}`)],
        '$f\'(x)\\le0$ 的範圍', `$f'(x)=6(${xm(p)})(${xm(q)})\\le0\\Rightarrow${p}\\le x\\le${q}$`); }),
    G(() => { const h = nz(-3, 3), c = ri(-5, 9), y = -2 * h ** 3 + c;
      return C(`$y=x^{3}${term(-3 * h, 'x', 2)}${c === 0 ? '' : (c > 0 ? '+' : '') + c}$ 的反曲點是？`, $(`(${h},${y})`), [$(`(${-h},${y})`), $(`(${h},${c})`), $(`(${2 * h},${c})`), $(`(0,${c})`)],
        '$y\'\'=0$ 且兩側凹向改變', `$y''=6x${term(-6 * h, '', 0)}=0$，$x=${h}$，$y=${y}$`); })
  ]);

  /* ================= 3-1 積分的概念與性質 ================= */
  add(7, 'num', [
    G(() => { const k = ri(1, 6), n = ri(1, 9), v = k * n ** 3 / 3; if (!Number.isInteger(v) || v > 999) K.fail();
      return N(`$\\int_0^{${n}} ${k === 1 ? '' : k}x^{2}\\,dx=$？`, v, '', `\\left[${k === 3 ? '' : `\\frac{${k}}{3}`}x^{3}\\right]_0^{${n}}`, `=${v}`,
        '$\\int x^{2}dx=\\frac{x^{3}}{3}+C$', `$\\frac{${k}\\times${n}^{3}}{3}=${v}$`); }),
    G(() => { const a = ri(0, 3), b = a + ri(1, 4), c = ri(-3, 6), v = b * b - a * a + c * (b - a); if (v < 1) K.fail();
      return N(`$\\int_{${a}}^{${b}}(${poly([2, c])})\\,dx=$？`, v, '', `\\left[x^{2}${term(c, 'x', 1)}\\right]_{${a}}^{${b}}`, `=${v}`,
        '先找反導函數，再代上下限相減', `$(${b * b + c * b})-(${a * a + c * a})=${v}$`); }),
    G(() => { const p = ri(-5, 9), t = ri(1, 5), v = 3 * t * t + p; if (v < 1) K.fail();
      return N(`$\\int_0^{x} f(t)\\,dt=x^{3}${term(p, 'x', 1)}$，求 $f(${t})$`, v, '', `f(x)=\\frac{d}{dx}(x^{3}${term(p, 'x', 1)})`, `f(${t})=${v}`,
        '微積分基本定理：兩邊微分', `$f(x)=3x^{2}${p ? (p > 0 ? '+' : '') + p : ''}$，$f(${t})=${v}$`); })
  ]);
  add(7, 'mc', [
    G(() => { const k = ri(1, 5), n = ri(1, 5); if ((k * n ** 3) % 3 === 0) K.fail();
      return C(`$\\int_0^{${n}} ${k === 1 ? '' : k}x^{2}\\,dx=$？`, $(fr(k * n ** 3, 3)), [$(k * n ** 3), $(fr(k * n ** 3, 2)), $(k * n * n), $(fr(k * n * n, 3))],
        '$\\int x^{2}dx=\\frac{x^{3}}{3}+C$', `$${k === 1 ? '' : k}\\times\\frac{${n ** 3}}{3}=${fr(k * n ** 3, 3, false)}$`); }),
    G(() => { const a = nz(-6, 6), b = nz(-9, 9), h = cx(fr(a, 2));
      return C(`$\\int(${poly([a, b])})\\,dx=$？`, $(`${h}x^{2}${term(b, 'x', 1)}+C`), [$(`${cx(String(a))}x^{2}${term(b, 'x', 1)}+C`), $(`${h}x^{2}+C`), $(`${a}+C`), $(`${h}x^{2}${term(b, '', 0)}+C`)],
        '$\\int x^{n}dx=\\frac{x^{n+1}}{n+1}+C$', `$${h}x^{2}${term(b, 'x', 1)}+C$`); })
  ]);
  add(7, 'match', [
    G(() => { const n = ri(1, 6); return M(`\\int_0^{${n}} x\\,dx`, frV(n * n, 2), '$\\left[\\frac{x^{2}}{2}\\right]$', '它的值'); }),
    G(() => { const c = ri(1, 5), n = ri(1, 4); return M(`\\int_0^{${n}} ${c}\\,dx`, c * n, '常數函數的積分 = 長方形面積', '它的值'); }),
    G(() => { const n = ri(1, 3); return M(`\\int_0^{${n}} 3x^{2}\\,dx`, n ** 3, '$\\left[x^{3}\\right]$', '它的值'); }),
    G(() => { const n = ri(1, 5), k = pick([1, 3]); return M(`\\int_{-${n}}^{${n}} x${k === 1 ? '' : '^{3}'}\\,dx`, 0, '奇函數在對稱區間的積分為 0', '它的值'); })
  ]);

  /* ================= 3-2 積分的應用 ================= */
  add(8, 'num', [
    G(() => { const k = ri(1, 6), n = ri(1, 9), v = k * n ** 3 / 3; if (!Number.isInteger(v) || v > 999) K.fail();
      return N(`$y=${k === 1 ? '' : k}x^{2}$ 與 $x$ 軸、直線 $x=${n}$ 所圍區域的面積是多少？`, v, '', `\\int_0^{${n}}${k === 1 ? '' : k}x^{2}\\,dx`, `=${v}`,
        `面積 $=\\int_0^{${n}}${k === 1 ? '' : k}x^{2}dx$`, `$\\frac{${k}\\times${n}^{3}}{3}=${v}$`); }),
    G(() => { const a = ri(1, 6), b = ri(0, 9), T = ri(1, 8), v = a * T * T / 2 + b * T; if (!Number.isInteger(v)) K.fail();
      return N(`速度 $v(t)=${poly([a, b], 't')}$（公尺／秒），前 ${T} 秒的位移是多少公尺？`, v, '公尺', `\\int_0^{${T}}(${poly([a, b], 't')})\\,dt`, `=${v}`,
        '位移 = 速度的積分', `$\\left[${cx(fr(a, 2, false))}t^{2}${term(b, 't', 1)}\\right]_0^{${T}}=${v}$`); }),
    G(() => { const n = ri(1, 9), c = ri(0, 9);
      return N(`$f(x)=2x${c ? '+' + c : ''}$ 在 $[0,${n}]$ 上的平均值是多少？`, n + c, '', `\\frac{1}{${n}}\\int_0^{${n}}f(x)\\,dx`, `=${n + c}`,
        '平均值 $=\\frac{1}{b-a}\\int_a^b f(x)dx$', `$\\frac{1}{${n}}(${n * n}+${c * n})=${n + c}$`); })
  ]);
  add(8, 'mc', [
    G(() => { const k = ri(1, 5); return C(`$y=x^{2}$ 與 $y=${k === 1 ? '' : k}x$ 所圍區域的面積是？`, $(fr(k ** 3, 6)), [$(fr(k ** 3, 3)), $(fr(k ** 3, 2)), $(fr(k * k, 6)), $(fr(k ** 3, 12))],
      `交點 $x=0$、$x=${k}$`, `$\\int_0^{${k}}(${k === 1 ? '' : k}x-x^{2})dx=${fr(k ** 3, 6, false)}$`); }),
    G(() => { const n = ri(1, 8), k = ri(1, 5); if ((k * n * n) % 3 === 0) K.fail(); return C(`$f(x)=${k === 1 ? '' : k}x^{2}$ 在 $[0,${n}]$ 上的平均值是？`, $(fr(k * n * n, 3)), [$(fr(k * n ** 3, 3)), $(fr(k * n * n, 2)), $(k * n * n), $(fr(k * n, 3))],
      '平均值 $=\\frac{1}{b-a}\\int_a^b f(x)dx$', `$\\frac1{${n}}\\times\\frac{${k * n ** 3}}{3}=${fr(k * n * n, 3, false)}$`); })
  ]);
})(window.LG);
