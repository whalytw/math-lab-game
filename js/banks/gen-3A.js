/* 二上A版（數學 3A，龍騰）隨機題型
   必須在 3B.js 之前載入：二上B版用 copy() 沿用A版題目時，這些樣板也會一起沿用。
   標籤（G 的第二個參數）給B版篩選用，例如B版單元 2 只教正弦，不沿用標籤含 cos、tan 的樣板。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('3A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, fr, frV, par, poly, term, xm, rad, C, N, M } = K;
  const $ = s => `$${s}$`;
  const tri = () => { const [a, b, h] = pick(K.TRIPLES.slice(0, 6)); return K.chance(0.5) ? [a, b, h] : [b, a, h]; };

  /* ================= 單元 1 弧度量 ================= */
  const TH = [[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [2, 3], [4, 3], [5, 2]];
  add(1, 'num', [
    G(() => { const r = ri(2, 12), [p, q] = pick(TH), A = r * r * p / (2 * q); if (!Number.isInteger(A) || A > 999) K.fail();
      return N(`半徑 $${r}$、圓心角 $${fr(p, q)}$ 弳的扇形，面積是多少？`, A, '', `\\frac12r^{2}\\theta`, `\\frac12\\times${r * r}\\times${fr(p, q, false)}=${A}`,
        '扇形面積 $=\\frac12r^{2}\\theta$（$\\theta$ 用弳）', `$\\frac12\\times${r}^{2}\\times${fr(p, q, false)}=${A}$`); }),
    G(() => { const r = ri(2, 10), t = ri(1, 4), s = r * t;
      return N(`半徑 $${r}$、弧長 $${s}$ 的扇形，圓心角是多少弳？`, t, '弳', `\\theta=\\frac{s}{r}`, `\\frac{${s}}{${r}}=${t}`,
        '弧長 $s=r\\theta$', `$\\theta=\\frac{${s}}{${r}}=${t}$`); }),
    G(() => { const r = ri(2, 12), t = ri(1, 4), P = 2 * r + r * t;
      return N(`半徑 $${r}$、圓心角 $${t}$ 弳的扇形，周長是多少？`, P, '', `2r+r\\theta`, `${2 * r}+${r * t}=${P}`,
        '周長 = 兩條半徑 + 弧長', `$2\\times${r}+${r}\\times${t}=${P}$`); })
  ]);
  const DEG = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 210, 225, 240, 270, 300, 315, 330];
  add(1, 'mc', [
    G(() => { const d = pick(DEG);
      return C(`$${d}^{\\circ}$ 等於多少弳？`, $(rad(d)), [$(rad(180 - d)), $(rad(d + 30)), $(rad(d / 3 * 2 % 360 || 60)), $(rad(360 - d))],
        '$180^{\\circ}=\\pi$ 弳', `$${d}\\times\\frac{\\pi}{180}=${rad(d, false)}$`); }),
    G(() => { const d = pick(DEG);
      return C(`$${rad(d)}$ 弳等於多少度？`, $(`${d}^{\\circ}`), [$(`${180 - d}^{\\circ}`), $(`${d + 30}^{\\circ}`), $(`${2 * d}^{\\circ}`), $(`${360 - d}^{\\circ}`)],
        '$\\pi$ 弳 $=180^{\\circ}$', `$${rad(d, false)}\\times\\frac{180^{\\circ}}{\\pi}=${d}^{\\circ}$`); })
  ]);
  add(1, 'match', [
    G(() => { const d = pick(DEG); return M(`${d}^{\\circ}`, rad(d, false), '$180^{\\circ}=\\pi$ 弳', '它的弳度'); }),
    G(() => { const d = pick(DEG); return M(`${d}^{\\circ}`, rad(d, false), '度數乘以 $\\frac{\\pi}{180}$', '它的弳度'); })
  ]);

  /* ================= 單元 2 三角函數的圖形 ================= */
  add(2, 'num', [
    G(() => { const A = nz(-6, 6), B = ri(1, 5), Cc = ri(-3, 8), v = Math.abs(A) + Cc; if (v < 1) K.fail();
      return N(`$y=${A === 1 ? '' : A === -1 ? '-' : A}\\sin ${B === 1 ? '' : B}x${Cc === 0 ? '' : (Cc > 0 ? '+' : '') + Cc}$ 的最大值是多少？`, v, '', `|${A}|+${par(Cc)}`, `=${v}`,
        '$\\sin$ 的值在 $-1$ 到 $1$ 之間', `最大值 $|${A}|+${par(Cc)}=${v}$`); }, 'sin'),
    G(() => { const A = ri(2, 6), k = ri(2, 9);
      return N(`$y=${A}\\sin\\dfrac{\\pi x}{${k}}$ 的週期是多少？`, 2 * k, '', `\\frac{2\\pi}{\\frac{\\pi}{${k}}}`, `=${2 * k}`,
        '$y=\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', `$2\\pi\\div\\frac{\\pi}{${k}}=${2 * k}$`); }, 'sin'),
    G(() => { const A = ri(2, 6), k = ri(2, 9);
      return N(`$y=${A}\\cos\\dfrac{\\pi x}{${k}}$ 的週期是多少？`, 2 * k, '', `\\frac{2\\pi}{\\frac{\\pi}{${k}}}`, `=${2 * k}`,
        '$y=\\cos bx$ 的週期是 $\\frac{2\\pi}{|b|}$', `$2\\pi\\div\\frac{\\pi}{${k}}=${2 * k}$`); }, 'cos'),
    G(() => { const k = ri(1, 4), c = pick(['\\dfrac12', '\\dfrac{\\sqrt3}{2}', '\\dfrac{\\sqrt2}{2}']);
      return N(`在 $0\\le x<2\\pi$ 的範圍內，方程式 $\\sin ${k === 1 ? '' : k}x=${c}$ 有幾個解？`, 2 * k, '個', `\\sin ${k === 1 ? '' : k}x=${c}`, `${2 * k}`,
        `$${k === 1 ? '' : k}x$ 的範圍是 $0\\le ${k === 1 ? '' : k}x<${2 * k === 2 ? '' : 2 * k}\\pi$，每一個週期有 2 個解`, `共 ${k} 個週期，$2\\times${k}=${2 * k}$ 個解`); }, 'sin')
  ]);
  add(2, 'mc', [
    G(() => { const A = ri(2, 5), B = pick([2, 3, 4, 5, 6]), Cc = ri(-3, 4);
      return C(`$y=${A}\\sin ${B}x${Cc === 0 ? '' : (Cc > 0 ? '+' : '') + Cc}$ 的週期是多少？`, $(rad(360 / B)), [$(rad(180 / B)), $(rad(720 / B)), $(rad(360 * B % 720 || 720)), $(`${A}\\pi`)],
        '$y=a\\sin bx+c$ 的週期是 $\\frac{2\\pi}{|b|}$', `$\\frac{2\\pi}{${B}}=${rad(360 / B, false)}$`); }, 'sin'),
    G(() => { const A = nz(-5, 5), Cc = ri(-2, 6), v = Cc - Math.abs(A);
      return C(`$y=${A === 1 ? '' : A === -1 ? '-' : A}\\cos x${Cc === 0 ? '' : (Cc > 0 ? '+' : '') + Cc}$ 的最小值是多少？`, $(v), [$(Cc + Math.abs(A)), $(Cc), $(-Math.abs(A)), $(v - 1)],
        '$\\cos x$ 的值在 $-1$ 到 $1$ 之間', `最小值 $${Cc}-${Math.abs(A)}=${v}$`); }, 'cos'),
    G(() => { const A = nz(-5, 5), Cc = ri(-2, 6), v = Cc - Math.abs(A);
      return C(`$y=${A === 1 ? '' : A === -1 ? '-' : A}\\sin x${Cc === 0 ? '' : (Cc > 0 ? '+' : '') + Cc}$ 的最小值是多少？`, $(v), [$(Cc + Math.abs(A)), $(Cc), $(-Math.abs(A)), $(v - 1)],
        '$\\sin x$ 的值在 $-1$ 到 $1$ 之間', `最小值 $${Cc}-${Math.abs(A)}=${v}$`); }, 'sin')
  ]);
  add(2, 'match', [
    G(() => { const B = pick([2, 3, 4, 5, 6]); return M(`y=\\sin ${B}x`, rad(360 / B, false), '$y=\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期'); }, 'sin'),
    G(() => { const B = pick([2, 3, 4]); return M(`y=\\sin\\frac{x}{${B}}`, rad(360 * B, false), '$y=\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期'); }, 'sin'),
    G(() => { const B = pick([2, 3, 4, 5, 6]); return M(`y=\\cos ${B}x`, rad(360 / B, false), '$y=\\cos bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期'); }, 'cos'),
    G(() => { const B = pick([2, 3, 4, 5, 6]); return M(`y=\\tan ${B}x`, rad(180 / B, false), '$y=\\tan bx$ 的週期是 $\\frac{\\pi}{|b|}$', '它的週期'); }, 'tan')
  ]);

  /* ================= 單元 3 三角的和差角公式 ================= */
  const PT = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [28, 45, 53]];   // 畢氏三元數（a<b）
  const SIN = { 30: '1/2', 45: '\\frac{\\sqrt2}{2}', 60: '\\frac{\\sqrt3}{2}', 90: '1', 120: '\\frac{\\sqrt3}{2}', 135: '\\frac{\\sqrt2}{2}', 150: '1/2', 180: '0' };
  const COS = { 30: '\\frac{\\sqrt3}{2}', 45: '\\frac{\\sqrt2}{2}', 60: '1/2', 90: '0', 120: '-1/2', 135: '-\\frac{\\sqrt2}{2}', 150: '-\\frac{\\sqrt3}{2}', 180: '-1' };
  add(3, 'num', [
    G(() => { const [a, b, c] = pick(PT), v = 2 * a * b;
      return N(`$\\sin\\theta=\\dfrac{${a}}{${c}}$，$\\theta$ 為第一象限角，求 $${c * c}\\sin2\\theta$`, v, '', `\\sin2\\theta=2\\sin\\theta\\cos\\theta`, `${c * c}\\times\\frac{${v}}{${c * c}}=${v}`,
        `先求 $\\cos\\theta=\\frac{${b}}{${c}}$，再用二倍角公式`, `$${c * c}\\times2\\times\\frac{${a}}{${c}}\\times\\frac{${b}}{${c}}=${v}$`); }),
    G(() => { const [a, b, c] = pick(PT), v = b * b - a * a;
      return N(`$\\cos\\theta=\\dfrac{${b}}{${c}}$，求 $${c * c}\\cos2\\theta$`, v, '', `\\cos2\\theta=2\\cos^{2}\\theta-1`, `${2 * b * b}-${c * c}=${v}`,
        '二倍角公式 $\\cos2\\theta=2\\cos^{2}\\theta-1$', `$${c * c}\\left(2\\times\\frac{${b * b}}{${c * c}}-1\\right)=${v}$`); })
  ]);
  add(3, 'mc', [
    G(() => { const [a, b, c] = K.chance(0.5) ? pick(PT) : (([x, y, z]) => [y, x, z])(pick(PT));
      return C(`$\\sin\\theta=\\dfrac{${a}}{${c}}$，$\\theta$ 為第一象限角，$\\cos2\\theta=$？`, $(fr(b * b - a * a, c * c)), [$(fr(2 * a * b, c * c)), $(fr(a * a - b * b, c * c)), $(fr(2 * a, c)), $(fr(b - a, c))],
        '$\\cos2\\theta=1-2\\sin^{2}\\theta$', `$1-2\\times\\frac{${a * a}}{${c * c}}=${fr(b * b - a * a, c * c, false)}$`); }),
    G(() => { const S = pick([30, 45, 60, 90, 120, 135, 150]), A = 5 * ri(1, S / 5 - 1), B = S - A;
      const vals = [...new Set(Object.values(SIN).concat(Object.values(COS)))].map(v => $(LG.util.fracTex(v)));
      return C(`$\\sin${A}^{\\circ}\\cos${B}^{\\circ}+\\cos${A}^{\\circ}\\sin${B}^{\\circ}=$？`, $(LG.util.fracTex(SIN[S])), K.shuffle(vals),
        '和角公式：$\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta$', `$\\sin${S}^{\\circ}=${LG.util.fracTex(SIN[S], false)}$`); })
  ]);
  add(3, 'match', [
    G(() => { const S = pick([30, 45, 60, 90, 120, 135, 150]), A = 5 * ri(1, S / 5 - 1), B = S - A;
      return M(`\\sin${A}^{\\circ}\\cos${B}^{\\circ}+\\cos${A}^{\\circ}\\sin${B}^{\\circ}`, SIN[S], '$\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta$'); }),
    G(() => { const S = pick([30, 45, 60, 90, 120, 135, 150, 180]), A = 5 * ri(1, S / 5 - 1), B = S - A;
      return M(`\\cos${A}^{\\circ}\\cos${B}^{\\circ}-\\sin${A}^{\\circ}\\sin${B}^{\\circ}`, COS[S], '$\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta$'); }),
    G(() => { const A = pick([15, 30, 45, 60, 75]);
      return M(`2\\sin${A}^{\\circ}\\cos${A}^{\\circ}`, SIN[2 * A], '二倍角：$2\\sin\\theta\\cos\\theta=\\sin2\\theta$'); })
  ]);

  /* ================= 單元 4 正餘弦的疊合 ================= */
  const sc = (a, b) => `${a === 1 ? '' : a === -1 ? '-' : a}\\sin x${term(b, '\\cos x', 1)}`;
  add(4, 'num', [
    G(() => { let [a, b, c] = tri(); if (K.chance(0.5)) b = -b; const k = ri(-3, 8), v = c + k; if (v < 1) K.fail();
      return N(`$y=${sc(a, b)}${k === 0 ? '' : (k > 0 ? '+' : '') + k}$ 的最大值是多少？`, v, '', `\\sqrt{${a}^{2}+${par(b)}^{2}}${k === 0 ? '' : (k > 0 ? '+' : '') + k}`, `${c}${k === 0 ? '' : (k > 0 ? '+' : '') + k}=${v}`,
        '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', `$\\sqrt{${a * a}+${b * b}}=${c}$，最大值 $${v}$`); }),
    G(() => { let [a, b, c] = tri(); if (K.chance(0.5)) a = -a; const k = c + ri(1, 9), v = k - c;
      return N(`$y=${sc(a, b)}+${k}$ 的最小值是多少？`, v, '', `${k}-\\sqrt{${a}^{2}+${b}^{2}}`, `${k}-${c}=${v}`,
        '$a\\sin x+b\\cos x$ 的最小值是 $-\\sqrt{a^{2}+b^{2}}$', `$${k}-${c}=${v}$`); })
  ]);
  add(4, 'mc', [
    G(() => { let [a, b, c] = tri(); if (K.chance(0.5)) b = -b;
      return C(`$y=${sc(a, b)}$ 的值域是？`, $(`-${c}\\le y\\le${c}`), [$(`-${Math.abs(a) + Math.abs(b)}\\le y\\le${Math.abs(a) + Math.abs(b)}`), $(`0\\le y\\le${c}`), $(`-${c * c}\\le y\\le${c * c}`), $(`-1\\le y\\le1`)],
        '疊合成 $r\\sin(x+\\theta)$，$r=\\sqrt{a^{2}+b^{2}}$', `$r=\\sqrt{${a * a}+${b * b}}=${c}$`); })
  ]);
  add(4, 'match', [
    G(() => { let [a, b, c] = tri(); if (K.chance(0.5)) b = -b; return M(sc(a, b), c, '最大值 $\\sqrt{a^{2}+b^{2}}$', '它的最大值'); }),
    G(() => { const [a, b, c] = tri(), k = ri(1, 5); return M(`${sc(a, b)}+${k}`, c + k, '最大值 $\\sqrt{a^{2}+b^{2}}$ 再加常數', '它的最大值'); })
  ]);

  /* ================= 單元 5 指數函數（拆彈小組，分難度） ================= */
  const Q = (key, prompt, right, wrongs, hint, explain) => Object.assign(C(prompt, right, wrongs, hint, explain), { key });
  add(5, 'mc', {
    easy: [
      G(() => { const b = ri(2, 5), n = ri(2, b === 2 ? 8 : 4), k = nz(-3, 3), v = b ** n;
        return Q('g1', `解方程式 $${b}^{${poly([1, k])}}=${v}$`, $(`x=${n - k}`), [$(`x=${n + k}`), $(`x=${n}`), $(`x=${-n + k}`), $(`x=${n - 2 * k}`)],
          `把 $${v}$ 寫成 $${b}^{${n}}$，再比較指數`, `$${poly([1, k])}=${n}\\Rightarrow x=${n - k}$`); }),
      G(() => { const b = ri(2, 5), n = ri(2, b === 2 ? 6 : 3), v = b ** n;
        return Q('g2', `解方程式 $\\left(\\dfrac1{${b}}\\right)^{x}=${v}$`, $(`x=-${n}`), [$(`x=${n}`), $(`x=-${fr(1, n)}`), $(`x=-${n + 1}`), $(`x=${fr(1, n)}`)],
          `$${v}=${b}^{${n}}=\\left(\\frac1{${b}}\\right)^{-${n}}$`, `$x=-${n}$`); }),
      G(() => { const b = ri(2, 5), n = ri(2, b === 2 ? 6 : 3), v = b ** n, up = K.chance(0.5);
        return Q('g3', `解不等式 $${b}^{x}${up ? '>' : '<'}${v}$`, $(`x${up ? '>' : '<'}${n}`), [$(`x${up ? '<' : '>'}${n}`), $(`x${up ? '>' : '<'}${v}`), $(`x${up ? '>' : '<'}-${n}`)],
          `$${v}=${b}^{${n}}$，底數大於 1，不等號方向不變`, `$x${up ? '>' : '<'}${n}$`); }),
      G(() => { const h = pick([2, 3, 5, 8, 10, 30]), k = ri(2, 6);
        return Q('g4', `某物質的半衰期是 ${h} 天。經過 ${h * k} 天後，剩下原來的幾分之幾？`, $(fr(1, 2 ** k)), [$(fr(1, 2 * k)), $(fr(1, 2 ** (k + 1))), $(fr(1, 2 ** (k - 1))), $(fr(1, k))],
          `${h * k} 天是 ${k} 個半衰期`, `$\\left(\\frac12\\right)^{${k}}=${fr(1, 2 ** k, false)}$`); })
    ],
    normal: [
      G(() => { const b = pick([2, 3]), p = ri(2, 3), q = ri(1, 5); if (K.gcd(p, q) !== 1 || b ** p > 30 || b ** q > 250) K.fail();
        return Q('g5', `解方程式 $${b ** p}^{x}=${b ** q}$`, $(`x=${fr(q, p)}`), [$(`x=${fr(p, q)}`), $(`x=${q}`), $(`x=${fr(q, p + 1)}`), $(`x=${q - p}`)],
          `兩邊都寫成以 $${b}$ 為底`, `$${b}^{${p}x}=${b}^{${q}}\\Rightarrow x=${fr(q, p, false)}$`); }),
      G(() => { const b = pick([2, 3]), n = ri(1, 4), up = K.chance(0.5);
        return Q('g6', `解不等式 $\\left(\\dfrac1{${b}}\\right)^{x}${up ? '>' : '<'}${b ** n}$`, $(`x${up ? '<' : '>'}-${n}`), [$(`x${up ? '>' : '<'}-${n}`), $(`x${up ? '<' : '>'}${n}`), $(`x${up ? '>' : '<'}${n}`)],
          '底數小於 1，不等號要變向', `$\\left(\\frac1{${b}}\\right)^{x}${up ? '>' : '<'}\\left(\\frac1{${b}}\\right)^{-${n}}\\Rightarrow x${up ? '<' : '>'}-${n}$`); })
    ],
    hard: [
      G(() => { const p = ri(0, 3), q = ri(p + 1, 4), s = 2 ** p + 2 ** q, t = 2 ** (p + q);
        return Q('g7', `解方程式 $4^{x}-${s}\\cdot2^{x}+${t}=0$`, `$x=${p}$ 或 $x=${q}$`, [`$x=${2 ** p}$ 或 $x=${2 ** q}$`, $(`x=${q}`), `$x=${-p}$ 或 $x=${-q}$`, $(`x=${p + q}`)],
          `設 $t=2^{x}$，得 $t^{2}-${s}t+${t}=0$`, `$(t-${2 ** p})(t-${2 ** q})=0$，$2^{x}=${2 ** p}$ 或 $${2 ** q}$`); })
    ]
  });

  /* ================= 單元 6 對數與對數律 ================= */
  const lg = Math.log10, L = (a, b) => Math.log(b) / Math.log(a);
  const E = (tex, v, t, f) => ({ tex, v: String(v), t, f });
  add(6, 'match', {
    easy: [
      G(() => { const b = ri(2, 7), k = ri(0, b === 2 ? 6 : 3); return E(`\\log_{${b}}${b ** k}`, k, 'def', () => L(b, b ** k)); }),
      G(() => { const b = ri(2, 5), k = ri(1, 3); return E(`\\log_{${b}}\\dfrac{1}{${b ** k}}`, -k, 'def', () => L(b, 1 / b ** k)); }),
      G(() => { const k = ri(-3, 4); return E(`\\log ${k >= 0 ? 10 ** k : '0.' + '0'.repeat(-k - 1) + '1'}`, k, 'def', () => k); })
    ],
    normal: [
      G(() => { const b = ri(2, 3), k = pick([1, 3, 5]); return E(`\\log_{${b * b}}${b ** k}`, frV(k, 2), 'def', () => L(b * b, b ** k)); }),
      G(() => { const [a, c, k] = pick([[2, 50, 2], [4, 25, 2], [5, 20, 2], [8, 125, 3], [2, 500, 3], [25, 40, 3]]); return E(`\\log ${a}+\\log ${c}`, k, 'law', () => lg(a) + lg(c)); }),
      G(() => { const b = ri(2, 3), m = ri(2, 5), k = ri(1, 3); return E(`\\log_{${b}}${m * b ** k}-\\log_{${b}}${m}`, k, 'law', () => L(b, m * b ** k) - L(b, m)); })
    ],
    hard: [
      G(() => { const b = ri(2, 3), m = pick([5, 7]), k = ri(2, 3); return E(`\\log_{${b}}${m}\\times\\log_{${m}}${b ** k}`, k, 'chg', () => L(b, m) * L(m, b ** k)); }),
      G(() => { const b = pick([2, 3]), k = ri(1, 3); return E(`${b * b}^{\\log_{${b}}${k + 1}}`, (k + 1) ** 2, 'pow', () => Math.pow(b * b, L(b, k + 1))); })
    ]
  });
  /* 巨數望遠鏡：產生 { t:'dig'|'dec'|'lg'|'tsu', ... }，由關卡算答案（L4.prep） */
  const LGA = { 2: 0.3010, 3: 0.4771, 4: 0.6020, 5: 0.6990, 6: 0.7781, 12: 1.0791 };
  const DECA = { '0.5': -0.3010, '0.3': 0.4771 - 1, '0.2': 0.3010 - 1, '0.4': 0.6020 - 1, '1/3': -0.4771 };
  const DECV = { '0.5': 0.5, '0.3': 0.3, '0.2': 0.2, '0.4': 0.4, '1/3': 1 / 3 };
  const safe = (ap, ex) => Math.floor(ap) === Math.floor(ex) && Math.abs(ap - Math.round(ap)) > 0.01;
  const dig = (bs, n0, n1) => G(() => { const b = pick(bs), n = ri(n0, n1); if (!safe(n * LGA[b], n * lg(b)) || Math.floor(n * lg(b)) + 1 > 999) K.fail(); return { t: 'dig', b, n }; });
  const dec = (bs, n0, n1) => G(() => { const b = pick(bs), n = ri(n0, n1); if (!safe(n * DECA[b], n * lg(DECV[b]))) K.fail(); return { t: 'dec', b, n }; });
  add(6, 'num', {
    easy: [dig([2, 3], 10, 40), dec(['0.5'], 5, 30), G(() => ({ t: 'lg', L: `${ri(1, 9)}.${ri(1, 9)}${ri(1, 9)}` })), G(() => { const a = ri(1, 4); return { t: 'tsu', a, b: a + ri(1, 3) }; })],
    normal: [dig([2, 3, 6], 20, 100), dec(['0.5', '1/3'], 10, 100), G(() => { const a = ri(1, 4); return { t: 'tsu', a, b: a + ri(2, 4) }; })],
    hard: [dig([4, 5, 12], 10, 60), dec(['0.3', '0.2', '0.4'], 5, 60)]
  });

  /* ================= 單元 8 平面向量 ================= */
  add(8, 'num', [
    G(() => { const [a, b, h] = tri(), x1 = ri(-5, 5), y1 = ri(-5, 5), sx = K.chance(0.5) ? 1 : -1, sy = K.chance(0.5) ? 1 : -1;
      return N(`$A(${x1},${y1})$、$B(${x1 + sx * a},${y1 + sy * b})$，$|\\overrightarrow{AB}|=$？`, h, '', `\\sqrt{${par(sx * a)}^{2}+${par(sy * b)}^{2}}`, `=${h}`,
        '$\\overrightarrow{AB}=(x_2-x_1,y_2-y_1)$，再求長度', `$\\overrightarrow{AB}=(${sx * a},${sy * b})$，長度 $${h}$`); }),
    G(() => { const a = nz(-6, 6), b = nz(-5, 5), t = nz(-4, 4), m = b * t, x = a * t; if (x < 1) K.fail();
      return N(`$(x,${m})$ 與 $(${a},${b})$ 平行，$x=$？`, x, '', `\\frac{x}{${a}}=\\frac{${m}}{${b}}`, `x=${x}`,
        '平行：兩向量成比例', `$(x,${m})=${t}(${a},${b})$，$x=${x}$`); }),
    G(() => { const a1 = nz(-3, 3), a2 = ri(-3, 3), b1 = ri(-3, 3), b2 = nz(-3, 3), p = ri(1, 3), q = nz(-2, 3), s1 = p * a1 + q * b1, s2 = p * a2 + q * b2, v = s1 * s1 + s2 * s2; if (v < 1) K.fail();
      const comb = `${p === 1 ? '' : p}\\vec a${q === 1 ? '+' : q === -1 ? '-' : (q > 0 ? '+' : '') + q}\\vec b`;
      return N(`$\\vec a=(${a1},${a2})$、$\\vec b=(${b1},${b2})$，$|${comb}|^{2}=$？`, v, '', `${comb}=(${s1},${s2})`, `${par(s1)}^{2}+${par(s2)}^{2}=${v}`,
        '先算出向量的分量，再求長度的平方', `$${comb}=(${s1},${s2})$，$${s1 * s1}+${s2 * s2}=${v}$`); })
  ]);
  add(8, 'mc', [
    G(() => { const x1 = ri(-5, 5), y1 = ri(-5, 5), x2 = ri(-5, 5), y2 = ri(-5, 5), dx = x2 - x1, dy = y2 - y1; if (!dx || !dy || dx === dy) K.fail();
      return C(`$A(${x1},${y1})$、$B(${x2},${y2})$，$\\overrightarrow{AB}=$`, $(`(${dx},${dy})`), [$(`(${-dx},${-dy})`), $(`(${x1 + x2},${y1 + y2})`), $(`(${dy},${dx})`)],
        '終點減起點', `$(${x2}-${par(x1)},${y2}-${par(y1)})=(${dx},${dy})$`); }),
    G(() => { const m = ri(1, 3), n = ri(1, 3), t = ri(1, 2), x1 = ri(-4, 3), y1 = ri(-4, 3), dx = (m + n) * t * K.nz(-1, 1), dy = (m + n) * K.nz(-2, 2);
      const x2 = x1 + dx, y2 = y1 + dy, px = x1 + dx * m / (m + n), py = y1 + dy * m / (m + n); if (m === n) K.fail();
      const qx = x1 + dx * n / (m + n), qy = y1 + dy * n / (m + n);
      return C(`$A(${x1},${y1})$、$B(${x2},${y2})$，$P$ 在線段 $AB$ 上且 $AP:PB=${m}:${n}$，$P$ 的坐標是？`, $(`(${px},${py})`), [$(`(${qx},${qy})`), $(`(${(x1 + x2) / 2},${(y1 + y2) / 2})`), $(`(${px + 1},${py})`), $(`(${x2 - px},${y2 - py})`)],
        `分點公式：$P=\\frac{${n}A+${m}B}{${m + n}}$`, `$P=(${px},${py})$`); }, '分點')
  ]);

  /* ================= 單元 9 平面向量的運算 ================= */
  add(9, 'num', [
    G(() => { const p = ri(1, 9), q = ri(1, 9); if ((p * q) % 2) K.fail();
      return N(`$|\\vec a|=${p}$、$|\\vec b|=${q}$，夾角 $60^{\\circ}$，$\\vec a\\cdot\\vec b=$？`, p * q / 2, '', `${p}\\times${q}\\times\\cos60^{\\circ}`, `=${p * q / 2}`,
        '$\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta$', `$${p}\\times${q}\\times\\frac12=${p * q / 2}$`); }),
    G(() => { const [a, b, h] = tri();
      return N(`$|\\vec a|=${a}$、$|\\vec b|=${b}$、$\\vec a\\perp\\vec b$，$|\\vec a+\\vec b|=$？`, h, '', `|\\vec a+\\vec b|^{2}=${a * a}+${b * b}`, `|\\vec a+\\vec b|=${h}`,
        '垂直時內積為 0，把 $|\\vec a+\\vec b|$ 平方展開', `$${a * a}+0+${b * b}=${h * h}$，長度 $${h}$`); }),
    G(() => { const p = ri(1, 6), q = ri(1, 6), d = ri(-p * q + 1, p * q), v = p * p + 2 * d + q * q; if (v < 1) K.fail();
      return N(`$|\\vec a|=${p}$、$|\\vec b|=${q}$、$\\vec a\\cdot\\vec b=${d}$，$|\\vec a+\\vec b|^{2}=$？`, v, '', `|\\vec a|^{2}+2\\vec a\\cdot\\vec b+|\\vec b|^{2}`, `${p * p}+${par(2 * d)}+${q * q}=${v}`,
        '$|\\vec a+\\vec b|^{2}=|\\vec a|^{2}+2\\vec a\\cdot\\vec b+|\\vec b|^{2}$', `$${p * p}+${par(2 * d)}+${q * q}=${v}$`); })
  ]);
  add(9, 'mc', [
    G(() => { const a = nz(-5, 5), b = nz(-5, 5); if (Math.abs(a) === Math.abs(b)) K.fail();
      return C(`$(1,k)$ 與 $(${a},${b})$ 垂直，$k=$？`, $(fr(-a, b)), [$(fr(a, b)), $(fr(b, a)), $(fr(-b, a))],
        '垂直：內積為 0', `$${a}+${par(b)}k=0$，$k=${fr(-a, b, false)}$`); })
  ]);
  add(9, 'match', [
    G(() => { const a = ri(-3, 4), b = ri(-3, 4), c = ri(-3, 4), d = ri(-3, 4); return M(`(${a},${b})\\cdot(${c},${d})`, a * c + b * d, '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'); }),
    G(() => { const a = ri(1, 4), b = ri(1, 4); return M(`(${a},${b})\\cdot(${b},${a})`, 2 * a * b, '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'); })
  ]);

  /* ================= 單元 10 二元一次聯立方程式 ================= */
  const det = (a, b, c, d) => `\\begin{vmatrix}${a}&${b}\\\\${c}&${d}\\end{vmatrix}`;
  add(10, 'num', [
    G(() => { const a = ri(-5, 9), b = ri(-5, 9), c = ri(-5, 9), d = ri(-5, 9), v = a * d - b * c; if (v < 1) K.fail();
      return N(`$${det(a, b, c, d)}=$？`, v, '', `${a}\\times${par(d)}-${par(b)}\\times${par(c)}`, `=${v}`,
        '二階行列式 $=ad-bc$', `$${a * d}-${par(b * c)}=${v}$`); }),
    G(() => { const a = ri(1, 8), b = ri(-3, 6), c = ri(-3, 6), d = ri(1, 8), v = Math.abs(a * d - b * c); if (v % 2 || !v) K.fail();
      return N(`$O(0,0)$、$A(${a},${b})$、$B(${c},${d})$，$\\triangle OAB$ 的面積是多少？`, v / 2, '', `\\frac12\\left|${det(a, b, c, d)}\\right|`, `\\frac12\\times${v}=${v / 2}`,
        '三角形面積 $=\\frac12|ad-bc|$', `$\\frac12|${a * d}-${par(b * c)}|=${v / 2}$`); }),
    G(() => { const x = ri(1, 9), y = ri(1, 9), a = nz(-3, 4), b = nz(-3, 4), c = nz(-3, 4), d = nz(-3, 4); if (a * d - b * c === 0) K.fail();
      return N(`$${term(a, 'x', 1, true)}${term(b, 'y', 1)}=${a * x + b * y}$、$${term(c, 'x', 1, true)}${term(d, 'y', 1)}=${c * x + d * y}$ 的解為 $(x,y)$，$x+y=$？`, x + y, '', `(x,y)=(${x},${y})`, `x+y=${x + y}`,
        '用加減消去法或克拉瑪公式', `$x=${x}$、$y=${y}$，$x+y=${x + y}$`); })
  ]);
  add(10, 'mc', [
    G(() => { const x = ri(-5, 9), y = ri(-5, 9); if (x === y || x === -y) K.fail();
      return C(`解聯立方程式 $x+y=${x + y}$、$x-y=${x - y}$`, `$x=${x}$、$y=${y}$`, [`$x=${y}$、$y=${x}$`, `$x=${-x}$、$y=${-y}$`, `$x=${x + y}$、$y=${x - y}$`],
        '兩式相加消去 $y$', `$2x=${2 * x}$，$x=${x}$、$y=${y}$`); }),
    G(() => { const a = ri(2, 4), k = nz(-4, 5), b = a * k, c = ri(1, 9); if (c === a) K.fail();
      return C(`$x+ky=1$、$${a}x${b > 0 ? '+' : ''}${b}y=${c}$ 無解，$k=$？`, $(k), [$(-k), $(k + 1), $(fr(1, k)), $(b)],
        '無解：兩直線平行（係數成比例，常數不成比例）', `$\\frac{1}{${a}}=\\frac{k}{${b}}$，$k=${k}$`); })
  ]);
  add(10, 'match', [
    G(() => { const a = ri(-3, 6), b = ri(-3, 6), c = ri(-3, 6), d = ri(-3, 6); return M(det(a, b, c, d), a * d - b * c, '二階行列式 $=ad-bc$', '它的值'); }),
    G(() => { const a = ri(1, 5), b = ri(1, 5), t = ri(1, 3); return M(det(a, b, a * t, b * t), 0, '兩列成比例，行列式為 0', '它的值'); })
  ]);
})(window.LG);
