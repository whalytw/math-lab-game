/* 二上A版（數學 3A）新玩法題目：排序輸送帶（order）、座標尋寶（point）、公式拼圖（tiles）
   必須在 3B.js 之前載入：二上B版用 copy() 沿用A版題目時，這些題目也會一起沿用。
   隨機題型的標籤給B版篩選用：單元 1 含正弦的標 '\sin'，單元 2 含餘弦、正切的標 'cos'、'tan'，單元 8 的分點題標 '分點'。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('3A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, sample, chance, fail, fr, par, poly, term, xm, rad, O, P, T, perm } = K;
  const sg = n => (n < 0 ? String(n) : '+' + n);
  const PA = (prompt, win, shapes, after, ans, hint, explain) => Object.assign(P(prompt, win, shapes, ans, hint, explain), { after });
  const spread = (items, d) => {
    const v = items.map(i => i[1]).sort((a, b) => a - b);
    for (let i = 1; i < v.length; i++) if (v[i] - v[i - 1] < d) fail();
    if (new Set(items.map(i => i[0])).size < items.length) fail();
    return items;
  };
  const box = (pts, m) => {
    m = m == null ? 2 : m;
    const xs = pts.map(p => p[0]).concat([0]), ys = pts.map(p => p[1]).concat([0]);
    const x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m, y0 = Math.min(...ys) - m, y1 = Math.max(...ys) + m;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = Math.max(4.5, (x1 - x0) / 2), hh = Math.max(4.5, (y1 - y0) / 2);
    return [cx - hw, cx + hw, cy - hh, cy + hh];
  };
  const lineTex = (a, b, c) => `${term(a, 'x', 1, true)}${term(b, 'y', 1, !a)}=${c}`;
  const D2R = Math.PI / 180;
  /* 兩個乘積相加：每個乘積可交換、兩項也可交換（例如 sinα cosβ + cosα sinβ） */
  const sumAlt = (a, b, c, d, swapTerms) => {
    const out = [];
    for (const p of [[a, b], [b, a]]) for (const q of [[c, d], [d, c]]) { out.push(p.concat(q)); if (swapTerms) out.push(q.concat(p)); }
    return out.filter(x => x.join() !== [a, b, c, d].join());
  };

  /* ================= 單元 1 弧度量 ================= */
  add(1, 'order', [
    G(() => {
      const pool = [];
      sample([20, 40, 50, 70, 100, 130, 160, 200], 2).forEach(d => pool.push([`${d}^{\\circ}`, d * D2R]));
      sample([0.5, 1, 1.5, 2, 2.5, 3], 2).forEach(r => pool.push([String(r), r]));
      sample([30, 45, 60, 90, 120, 135, 150, 180], 2).forEach(d => pool.push([rad(d), d * D2R]));
      return O('把這些角由小到大排好（沒有寫度的是弳）', spread(sample(pool, 4), 0.06).map(x => [x[0], x[1], `${(x[1] / D2R).toFixed(0)}^{\\circ}`]),
        '$1$ 弳 $\\approx57.3^{\\circ}$，$\\pi$ 弳 $=180^{\\circ}$', '');
    })
  ]);
  add(1, 'tiles', [
    T('完成扇形的公式（半徑 $r$、圓心角 $\\theta$ 弳）', '\\text{弧長}\\ s=@,\\quad \\text{面積}\\ A=@', ['r\\theta', '\\dfrac12r^{2}\\theta'], ['\\dfrac12r\\theta', 'r^{2}\\theta', '2\\pi r'],
      '$\\theta$ 要用弳', '$s=r\\theta$、$A=\\frac12r^{2}\\theta=\\frac12rs$'),
    G(() => {
      const [d1, d2] = sample([30, 45, 60, 120, 135, 150, 210, 240, 270, 300, 330], 2);
      return T('角度與弳度互換', `${d1}^{\\circ}=@,\\quad ${rad(d2)}=@`, [rad(d1), `${d2}^{\\circ}`], [rad(180 - d1), rad(d1 + 30), `${(d2 + 30) % 360}^{\\circ}`, `${360 - d2}^{\\circ}`],
        '$180^{\\circ}=\\pi$ 弳', `$${d1}\\times\\frac{\\pi}{180}=${rad(d1, false)}$；$${rad(d2, false)}\\times\\frac{180^{\\circ}}{\\pi}=${d2}^{\\circ}$`);
    })
  ]);

  /* ================= 單元 2 三角函數的圖形 ================= */
  const trigOrder = (fn, name, tag) => G(() => {
    const xs = sample([1, 2, 3, 4, 5, 6], 4), it = xs.map(x => [`\\${name} ${x}`, fn(x)]);
    return O(`把這些值由小到大排好（角度單位是弳）`, spread(it, 0.06), `$1$ 弳 $\\approx57.3^{\\circ}$；想想單位圓上的位置，或 $y=\\${name} x$ 的圖形`, '');
  }, tag);
  add(2, 'order', [trigOrder(Math.sin, 'sin', ''), trigOrder(Math.cos, 'cos', 'cos')]);
  add(2, 'tiles', [
    T('寫出振幅與週期', 'y=a\\sin(bx+c)+d\\ \\text{的振幅}=@,\\ \\text{週期}=@', ['|a|', '\\dfrac{2\\pi}{|b|}'], ['a', '\\dfrac{\\pi}{|b|}', '2\\pi|b|', '|d|'],
      '振幅看 $\\sin$ 前面的係數，週期看 $x$ 的係數', '振幅 $|a|$、週期 $\\frac{2\\pi}{|b|}$'),
    G(() => {
      const A = ri(2, 5), B = pick([1, 2, 3, 4, 6]);
      return T(`寫出 $y=${A}\\sin ${B === 1 ? '' : B}x$ 的振幅與週期`, `\\text{振幅}=@,\\quad \\text{週期}=@`, [String(A), rad(360 / B)], [String(2 * A), rad(180 / B), String(B), rad(360 * B)],
        '週期 $=\\frac{2\\pi}{b}$', `振幅 $${A}$、週期 $\\frac{2\\pi}{${B}}=${rad(360 / B, false)}$`);
    }),
    G(() => {
      const B = pick([1, 2, 3, 4]);
      return T(`寫出 $y=\\tan ${B === 1 ? '' : B}x$ 的週期`, '\\text{週期}=@', [rad(180 / B)], [rad(360 / B), `\\dfrac{\\pi}{${2 * B}}`, String(B)],
        '$y=\\tan bx$ 的週期是 $\\frac{\\pi}{|b|}$', `$\\frac{\\pi}{${B}}=${rad(180 / B, false)}$`);
    }, 'tan')
  ]);

  /* ================= 單元 3 和差角公式 ================= */
  const sa = '\\sin\\alpha', ca = '\\cos\\alpha', sb = '\\sin\\beta', cb = '\\cos\\beta';
  add(3, 'tiles', [
    T('完成和角公式', '\\sin(\\alpha+\\beta)=@@+@@', [sa, cb, ca, sb], ['\\tan\\alpha', '\\tan\\beta'], '正弦：「正餘 + 餘正」', '$\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta$', sumAlt(sa, cb, ca, sb, true)),
    T('完成差角公式', '\\sin(\\alpha-\\beta)=@@-@@', [sa, cb, ca, sb], ['\\tan\\alpha', '\\tan\\beta'], '正弦：「正餘 − 餘正」', '$\\sin(\\alpha-\\beta)=\\sin\\alpha\\cos\\beta-\\cos\\alpha\\sin\\beta$', sumAlt(sa, cb, ca, sb, false)),
    T('完成和角公式', '\\cos(\\alpha+\\beta)=@@-@@', [ca, cb, sa, sb], ['\\tan\\alpha', '\\tan\\beta'], '餘弦：「餘餘 − 正正」（和角變減號）', '$\\cos(\\alpha+\\beta)=\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta$', sumAlt(ca, cb, sa, sb, false)),
    T('完成差角公式', '\\cos(\\alpha-\\beta)=@@+@@', [ca, cb, sa, sb], ['\\tan\\alpha', '\\tan\\beta'], '餘弦：「餘餘 + 正正」（差角變加號）', '$\\cos(\\alpha-\\beta)=\\cos\\alpha\\cos\\beta+\\sin\\alpha\\sin\\beta$', sumAlt(ca, cb, sa, sb, true)),
    T('完成正切的和角公式', '\\tan(\\alpha+\\beta)=@', ['\\dfrac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}'],
      ['\\dfrac{\\tan\\alpha+\\tan\\beta}{1+\\tan\\alpha\\tan\\beta}', '\\dfrac{\\tan\\alpha-\\tan\\beta}{1+\\tan\\alpha\\tan\\beta}', '\\tan\\alpha+\\tan\\beta'],
      '分子是和、分母是 $1$ 減乘積', '$\\tan(\\alpha+\\beta)=\\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}$'),
    T('完成二倍角公式', '\\sin2\\theta=@,\\quad \\cos2\\theta=@-@', ['2\\sin\\theta\\cos\\theta', '\\cos^{2}\\theta', '\\sin^{2}\\theta'], ['\\sin^{2}\\theta\\cos^{2}\\theta', '2\\sin\\theta', '1'],
      '用和角公式，令 $\\alpha=\\beta=\\theta$', '$\\sin2\\theta=2\\sin\\theta\\cos\\theta$、$\\cos2\\theta=\\cos^{2}\\theta-\\sin^{2}\\theta$'),
    T('完成二倍角公式的另外兩種寫法', '\\cos2\\theta=@-1=1-@', ['2\\cos^{2}\\theta', '2\\sin^{2}\\theta'], ['\\cos^{2}\\theta', '\\sin^{2}\\theta', '2\\sin\\theta\\cos\\theta'],
      '利用 $\\sin^{2}\\theta+\\cos^{2}\\theta=1$', '$\\cos2\\theta=2\\cos^{2}\\theta-1=1-2\\sin^{2}\\theta$')
  ]);
  add(3, 'order', [
    G(() => {
      const fs = [['sin', Math.sin], ['cos', Math.cos], ['tan', Math.tan]], it = [];
      for (let k = 0; k < 6; k++) { const [n, f] = pick(fs), d = pick([15, 75, 105, 165, 195, 255, 285]); it.push([`\\${n} ${d}^{\\circ}`, f(d * D2R)]); }
      return O('把這些值由小到大排好', spread(sample(it, 4), 0.08), '$15^{\\circ}=45^{\\circ}-30^{\\circ}$、$75^{\\circ}=45^{\\circ}+30^{\\circ}$；也可以先判斷正負與象限', '');
    })
  ]);

  /* ================= 單元 4 正餘弦的疊合 ================= */
  const AB = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [1, 1, null], [2, 2, null]];
  const lin = (a, b) => `${a === 1 ? '' : a}\\sin x${b < 0 ? '-' : '+'}${Math.abs(b) === 1 ? '' : Math.abs(b)}\\cos x`;
  add(4, 'tiles', [
    T('完成疊合公式', 'a\\sin x+b\\cos x=@\\sin(x+\\theta)', ['\\sqrt{a^{2}+b^{2}}'], ['a+b', 'a^{2}+b^{2}', '\\sqrt{a+b}'],
      '$r=\\sqrt{a^{2}+b^{2}}$，$\\cos\\theta=\\frac{a}{r}$、$\\sin\\theta=\\frac{b}{r}$', '$a\\sin x+b\\cos x=\\sqrt{a^{2}+b^{2}}\\sin(x+\\theta)$'),
    G(() => {
      const [a, b0, r] = pick(AB.filter(x => x[2])), b = b0 * pick([1, -1]);
      return T('寫出最大值與最小值', `${lin(a, b)}\\ \\text{的最大值}=@,\\ \\text{最小值}=@`, [String(r), String(-r)], [String(a + Math.abs(b)), String(-(a + Math.abs(b))), String(r * r), '0'],
        '疊合成 $r\\sin(x+\\theta)$，$-r\\le r\\sin(x+\\theta)\\le r$', `$r=\\sqrt{${a * a}+${b * b}}=${r}$，最大 $${r}$、最小 $${-r}$`);
    })
  ]);
  add(4, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) { const a = nz(1, 6), b = nz(-6, 6); it.push([lin(a, b), Math.hypot(a, b), `r=${K.sqrtTex(a * a + b * b)}`]); }
      return O('依「最大值」由小到大排好', spread(it, 0.05), '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', '');
    })
  ]);

  /* ================= 單元 5 指數函數 ================= */
  add(5, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 6; k++) {
        const b = pick([2, 3, 5]), e = pick([-2, -1, -0.5, 0.5, 1.5, 2, 2.5, 3]), inv = chance(0.3);
        const tex = inv ? `\\left(\\dfrac1{${b}}\\right)^{${String(-e)}}` : `${b}^{${String(e)}}`;
        it.push([tex, Math.pow(b, e)]);
      }
      return O('把這些數由小到大排好', spread(sample(it, 4), 0.08), '化成同底比指數；或先和 $1$ 比較：底數大於 $1$ 時，指數為正的大於 $1$', '');
    })
  ]);
  add(5, 'point', [
    G(() => {
      const h = ri(-3, 3), k = ri(-3, 2);
      const e = h ? `x${sg(-h)}` : 'x';
      return PA(`不論 $a$ 是多少（$a>0$、$a\\ne1$），$y=a^{${e}}${k ? sg(k) : ''}$ 的圖形都會通過同一點。點出這個點`, box([[h, k + 1]]), [],
        [{ fn: x => Math.pow(2, x - h) + k }, { fn: x => Math.pow(3, x - h) + k, style: { dash: [8, 6] } }], [h, k + 1],
        '$a^{0}=1$：讓指數等於 $0$', `$x=${h}$ 時 $y=a^{0}${k ? sg(k) : ''}=${k + 1}$，通過 $(${h},${k + 1})$`);
    })
  ]);
  add(5, 'tiles', [
    G(() => {
      const [b, m, n] = pick([[2, 2, 3], [2, 2, 5], [2, 3, 2], [2, 3, 4], [3, 2, 3], [2, 2, -3], [3, 2, 1], [5, 2, 3], [2, 3, 5]]);
      const B1 = Math.pow(b, m), B2 = n > 0 ? String(Math.pow(b, n)) : `\\dfrac1{${Math.pow(b, -n)}}`;
      return T('化成同底數，解指數方程式', `${B1}^{x}=${B2}\\iff @=@\\iff x=@`, [`${b}^{${m}x}`, `${b}^{${n}}`, fr(n, m)], [`${b}^{${n}x}`, fr(m, n), `${b}^{${m}}`, fr(-n, m)],
        `$${B1}=${b}^{${m}}$`, `$${b}^{${m}x}=${b}^{${n}}$，$${m}x=${n}$，$x=${fr(n, m, false)}$`);
    })
  ]);

  /* ================= 單元 6 對數與對數律 ================= */
  const lb = (b, x) => Math.log(x) / Math.log(b);
  add(6, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 6; k++) { const b = pick([2, 3, 5]), x = ri(2, 60); it.push([`\\log_{${b}}${x}`, lb(b, x)]); }
      const d = pick([1.5, 2.5, 3.5]); it.push([String(d), d]);
      return O('把這些數由小到大排好', spread(sample(it, 4), 0.08), '用 $2^{n}$、$3^{n}$、$5^{n}$ 夾：例如 $2^{2}<5<2^{3}$，所以 $2<\\log_{2}5<3$', '');
    })
  ]);
  add(6, 'tiles', [
    T('完成對數律（$a>0$、$a\\ne1$，$M,N>0$）', '\\log_a MN=@+@,\\quad \\log_a M^{p}=@', ['\\log_a M', '\\log_a N', 'p\\log_a M'], ['\\log_a M\\cdot\\log_a N', '(\\log_a M)^{p}', '\\log_a p'],
      '相乘變相加；次方移到前面', '$\\log_a MN=\\log_a M+\\log_a N$、$\\log_a M^{p}=p\\log_a M$', perm(['\\log_a M', '\\log_a N', 'p\\log_a M'], [[0, 1]])),
    T('完成換底公式', '\\log_a b=@,\\quad \\log_a b\\cdot\\log_b c=@', ['\\dfrac{\\log b}{\\log a}', '\\log_a c'], ['\\dfrac{\\log a}{\\log b}', '\\log b-\\log a', '\\log_c a', '\\log_a bc'],
      '換成常用對數相除；連乘時可以約分', '$\\log_a b=\\frac{\\log b}{\\log a}$、$\\log_a b\\cdot\\log_b c=\\log_a c$'),
    G(() => {
      const b = pick([2, 3]), k = ri(3, 6), N = Math.pow(b, k), x = pick([2, 3, 4, 6, 8, 9, 12].filter(d => N % d === 0 && d !== N && N / d !== 1));
      if (!x) fail();
      const y = N / x;
      return T('利用對數律計算', `\\log_{${b}}${x}+\\log_{${b}}${y}=\\log_{${b}}@=@`, [String(N), String(k)], [String(x + y), String(k + 1), String(k - 1), String(N * b)],
        '$\\log_a M+\\log_a N=\\log_a MN$', `$\\log_{${b}}(${x}\\times${y})=\\log_{${b}}${N}=${k}$`);
    })
  ]);

  /* ================= 單元 7 對數函數 ================= */
  add(7, 'point', [
    G(() => {
      const h = ri(-4, 2), k = ri(-3, 3);
      return PA(`不論 $a$ 是多少（$a>0$、$a\\ne1$），$y=\\log_a(${xm(h)})${k ? sg(k) : ''}$ 的圖形都會通過同一點。點出這個點`, box([[h + 1, k]]), [],
        [{ fn: x => Math.log2(x - h) + k }, { fn: x => Math.log(x - h) / Math.log(3) + k, style: { dash: [8, 6] } }], [h + 1, k],
        '$\\log_a 1=0$：讓真數等於 $1$', `$x=${h + 1}$ 時 $y=\\log_a 1${k ? sg(k) : ''}=${k}$，通過 $(${h + 1},${k})$`);
    }),
    G(() => {
      const k = ri(0, 3), x = Math.pow(2, k);
      return P(`圖形是 $y=\\log_{2}x$。點出方程式 $\\log_{2}x=${k}$ 的解在圖形上對應的點`, [-1.5, 9.5, -3.5, 4.5], [{ fn: t => Math.log2(t) }], [x, k],
        '$\\log_{2}x=k\\iff x=2^{k}$', `$x=2^{${k}}=${x}$，點 $(${x},${k})$`);
    })
  ]);
  add(7, 'order', [
    G(() => {
      const b = pick([2, 3, 0.5]), xs = sample([0.25, 0.5, 2, 3, 5, 7, 10, 20], 4);
      const bt = b === 0.5 ? '\\frac12' : String(b);
      return O(`把這些數由小到大排好`, spread(xs.map(x => [`\\log_{${bt}}${x === 0.25 ? '\\frac14' : x === 0.5 ? '\\frac12' : x}`, lb(b, x)]), 0.05),
        b < 1 ? '底數小於 $1$：$y=\\log_a x$ 遞減，真數越大值越小' : '底數大於 $1$：$y=\\log_a x$ 遞增，真數越大值越大', '');
    })
  ]);
  add(7, 'tiles', [
    T('指數函數與對數函數', 'y=a^{x}\\ \\text{與}\\ y=\\log_a x\\ \\text{的圖形對稱於直線}\\ @', ['y=x'], ['y=-x', 'x=0', 'y=0'], '兩者互為反函數', '對稱於直線 $y=x$'),
    G(() => {
      const b = pick([2, 3, 5, 10]);
      return T('寫出反函數', `y=${b}^{x}\\ \\text{的反函數是}\\ y=@`, [`\\log_{${b}}x`], [`\\log_{x}${b}`, `${b}^{-x}`, `x^{${b}}`, `\\dfrac{x}{${b}}`],
        '$y=a^{x}\\iff x=\\log_a y$，再把 $x$、$y$ 交換', `$y=\\log_{${b}}x$`);
    })
  ]);

  /* ================= 單元 8 平面向量 ================= */
  add(8, 'point', [
    G(() => {
      const A = [ri(-4, 3), ri(-4, 3)], v = [nz(-5, 5), nz(-5, 5)], B = [A[0] + v[0], A[1] + v[1]];
      if (Math.abs(B[0]) > 7 || Math.abs(B[1]) > 7) fail();
      return P(`已知 $A(${A[0]},${A[1]})$、$\\overrightarrow{AB}=(${v[0]},${v[1]})$，點出 $B$`, box([A, B], 1.5), [{ pt: A, label: 'A' }], B,
        '$B$ 的坐標 $=A$ 的坐標 $+\\overrightarrow{AB}$', `$B=(${A[0]}${sg(v[0])},${A[1]}${sg(v[1])})=(${B[0]},${B[1]})$`);
    }),
    G(() => {
      const A = [ri(-5, 0), ri(-5, 5)], m = ri(1, 3), n = ri(1, 3), t = ri(1, 2);
      if (m === n) fail();
      const B = [A[0] + (m + n) * t, A[1] + (m + n) * ri(-1, 1)];
      const Pp = [(n * A[0] + m * B[0]) / (m + n), (n * A[1] + m * B[1]) / (m + n)];
      if (!Pp.every(Number.isInteger) || Math.abs(B[0]) > 7 || Math.abs(B[1]) > 7) fail();
      return P(`點出 $\\overline{AB}$ 上的點 $P$，使 $\\overline{AP}:\\overline{PB}=${m}:${n}$`, box([A, B], 1.5), [{ pt: A, label: 'A' }, { pt: B, label: 'B' }, { vec: [A[0], A[1], B[0], B[1]], style: { alpha: 0.35, glow: false } }], Pp,
        '$\\overrightarrow{OP}=\\frac{n}{m+n}\\overrightarrow{OA}+\\frac{m}{m+n}\\overrightarrow{OB}$', `$P=\\left(\\frac{${n}\\times${par(A[0])}+${m}\\times${par(B[0])}}{${m + n}},\\frac{${n}\\times${par(A[1])}+${m}\\times${par(B[1])}}{${m + n}}\\right)=(${Pp[0]},${Pp[1]})$`);
    }, '分點'),
    G(() => {
      const A = [ri(-5, 0), ri(-4, 0)], B = [A[0] + ri(2, 5), A[1] + ri(-1, 2)], C = [B[0] + ri(-2, 1), B[1] + ri(2, 5)], D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]];
      if ([B, C, D].some(p => Math.abs(p[0]) > 7 || Math.abs(p[1]) > 7)) fail();
      return P(`$ABCD$ 是平行四邊形，點出第四個頂點 $D$`, box([A, B, C, D], 1.5),
        [{ pt: A, label: 'A' }, { pt: B, label: 'B' }, { pt: C, label: 'C' }, { vec: [A[0], A[1], B[0], B[1]], style: { alpha: 0.4, glow: false, head: 0.01 } }, { vec: [B[0], B[1], C[0], C[1]], style: { alpha: 0.4, glow: false, head: 0.01 } }], D,
        '平行四邊形：$\\overrightarrow{AD}=\\overrightarrow{BC}$', `$D=A+\\overrightarrow{BC}=(${D[0]},${D[1]})$`);
    })
  ]);
  add(8, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) { const a = ri(-6, 6), b = ri(-6, 6); if (!a && !b) fail(); it.push([`(${a},${b})`, Math.hypot(a, b), '=' + K.sqrtTex(a * a + b * b)]); }
      return O('依向量的長度由小到大排好', spread(it, 0.05), '$|(a,b)|=\\sqrt{a^{2}+b^{2}}$', '');
    })
  ]);
  add(8, 'tiles', [
    T('用位置向量表示', '\\overrightarrow{AB}=@-@', ['\\overrightarrow{OB}', '\\overrightarrow{OA}'], ['\\overrightarrow{BA}', '\\overrightarrow{AO}', '\\overrightarrow{OB}+\\overrightarrow{OA}'],
      '終點減起點', '$\\overrightarrow{AB}=\\overrightarrow{OB}-\\overrightarrow{OA}$'),
    G(() => {
      const a = ri(-5, 5), b = ri(-5, 5), c = nz(-5, 5), d = nz(-5, 5), k = nz(-3, 3);
      return T('計算向量的坐標', `(${a},${b})${k < 0 ? '-' : '+'}${Math.abs(k) === 1 ? '' : Math.abs(k)}(${c},${d})=(@,@)`, [String(a + k * c), String(b + k * d)], [String(a + c), String(b + d), String(k * a + c), String(k * b + d), String(a - k * c), String(b - k * d), String(a + k * c + 1), String(b + k * d - 1)],
        '先做係數積，再對應分量相加', `$(${a}${sg(k * c)},${b}${sg(k * d)})=(${a + k * c},${b + k * d})$`);
    })
  ]);

  /* ================= 單元 9 平面向量的運算 ================= */
  add(9, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) { const a = ri(-4, 4), b = ri(-4, 4), c = ri(-4, 4), d = ri(-4, 4); it.push([`(${a},${b})\\cdot(${c},${d})`, a * c + b * d]); }
      return O('依內積的值由小到大排好', spread(it, 0.5), '$(a,b)\\cdot(c,d)=ac+bd$', '');
    })
  ]);
  add(9, 'point', [
    G(() => {
      const A = [ri(-3, 1), ri(-3, 1)], u = [nz(-2, 2), ri(-2, 2)], v = [ri(-2, 2), nz(-2, 2)], s = nz(-2, 2), t = nz(-2, 2);
      const Pp = [A[0] + s * u[0] + t * v[0], A[1] + s * u[1] + t * v[1]];
      if (Math.abs(Pp[0]) > 7 || Math.abs(Pp[1]) > 7 || u[0] * v[1] === u[1] * v[0]) fail();
      const cf = (k, nm, first) => `${k < 0 ? '-' : first ? '' : '+'}${Math.abs(k) === 1 ? '' : Math.abs(k)}${nm}`;
      return P(`已知 $A(${A[0]},${A[1]})$、$\\vec u=(${u[0]},${u[1]})$、$\\vec v=(${v[0]},${v[1]})$。點出 $P$，使 $\\overrightarrow{AP}=${cf(s, '\\vec u', true)}${cf(t, '\\vec v')}$`, box([A, Pp], 1.5),
        [{ pt: A, label: 'A' }], Pp, '先算出 $\\overrightarrow{AP}$ 的坐標，再加到 $A$ 上', `$\\overrightarrow{AP}=(${Pp[0] - A[0]},${Pp[1] - A[1]})$，$P=(${Pp[0]},${Pp[1]})$`);
    })
  ]);
  add(9, 'tiles', [
    T('完成內積公式', '\\vec a\\cdot\\vec b=@@\\cos\\theta,\\quad (a_1,a_2)\\cdot(b_1,b_2)=@+@', ['|\\vec a|', '|\\vec b|', 'a_1b_1', 'a_2b_2'], ['a_1b_2', 'a_2b_1', '\\vec a\\vec b'],
      '長度乘長度乘夾角餘弦；坐標是對應分量相乘再相加', '$\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta=a_1b_1+a_2b_2$',
      perm(['|\\vec a|', '|\\vec b|', 'a_1b_1', 'a_2b_2'], [[0, 1], [2, 3]])),
    T('垂直的條件', '\\vec a\\perp\\vec b\\iff\\vec a\\cdot\\vec b=@,\\quad |\\vec a|^{2}=@', ['0', '\\vec a\\cdot\\vec a'], ['1', '-1', '2\\vec a', '|\\vec a|'],
      '$\\cos90^{\\circ}=0$', '$\\vec a\\perp\\vec b\\iff\\vec a\\cdot\\vec b=0$、$|\\vec a|^{2}=\\vec a\\cdot\\vec a$'),
    G(() => {
      const a = ri(-5, 5), b = ri(-5, 5), c = ri(-5, 5), d = ri(-5, 5), v = a * c + b * d;
      return T('計算內積', `(${a},${b})\\cdot(${c},${d})=@`, [String(v)], [String(a * d + b * c), String(a * c - b * d), String(-v), String(a + b + c + d), String(v + 1), String(v - 2)],
        '$(a,b)\\cdot(c,d)=ac+bd$', `$${par(a)}\\times${par(c)}+${par(b)}\\times${par(d)}=${v}$`);
    })
  ]);

  /* ================= 單元 10 二元一次聯立方程式 ================= */
  const det = (a, b, c, d) => `\\begin{vmatrix}${a}&${b}\\\\${c}&${d}\\end{vmatrix}`;
  add(10, 'point', [
    G(() => {
      const x0 = ri(-5, 5), y0 = ri(-5, 5), a1 = ri(1, 3), b1 = nz(-3, 3), a2 = ri(1, 3), b2 = nz(-3, 3);
      if (a1 * b2 === a2 * b1) fail();
      const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
      return PA(`點出聯立方程式 $\\begin{cases}${lineTex(a1, b1, c1)}\\\\${lineTex(a2, b2, c2)}\\end{cases}$ 的解 $(x,y)$`, box([[x0, y0]]), [],
        [{ line: [a1, b1, c1] }, { line: [a2, b2, c2] }], [x0, y0], '解就是兩條直線的交點', `$x=${x0}$、$y=${y0}$`);
    })
  ]);
  add(10, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) { const a = ri(-5, 5), b = ri(-5, 5), c = ri(-5, 5), d = ri(-5, 5); it.push([det(a, b, c, d), a * d - b * c]); }
      return O('依行列式的值由小到大排好', spread(it, 0.5), '$\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix}=ad-bc$', '');
    })
  ]);
  add(10, 'tiles', [
    T('完成二階行列式', '\\begin{vmatrix}a&b\\\\c&d\\end{vmatrix}=@-@', ['ad', 'bc'], ['ac', 'bd', 'ab'], '主對角線乘積減副對角線乘積', '$ad-bc$'),
    T('完成克拉瑪公式（$\\Delta\\ne0$）', 'x=@,\\quad y=@', ['\\dfrac{\\Delta_x}{\\Delta}', '\\dfrac{\\Delta_y}{\\Delta}'], ['\\dfrac{\\Delta}{\\Delta_x}', '\\dfrac{\\Delta_x}{\\Delta_y}', '\\Delta_x\\Delta'],
      '分母都是係數行列式 $\\Delta$', '$x=\\frac{\\Delta_x}{\\Delta}$、$y=\\frac{\\Delta_y}{\\Delta}$'),
    G(() => {
      const a = ri(-6, 6), b = ri(-6, 6), c = ri(-6, 6), d = ri(-6, 6), v = a * d - b * c;
      return T('計算行列式', `${det(a, b, c, d)}=@`, [String(v)], [String(a * d + b * c), String(a * c - b * d), String(-v), String(a * b - c * d), String(v + 1), String(v - 1)],
        '$ad-bc$', `$${par(a)}\\times${par(d)}-${par(b)}\\times${par(c)}=${v}$`);
    })
  ]);
})(window.LG);
