/* 一上（數學 1A）第 2 批新玩法題目：估算飛鏢、數線塗色、分類收納、找錯偵探、計算接力、投籃瞄準、圖形對對碰、拖點作圖
   （翻牌記憶、打地鼠、快問快答、數字賓果、迷宮岔路、天平平衡直接用配對題、是非題，不在這裡）
   幾乎都是隨機題型（G）：每次出題重新抽數字。格式見 js/gen-kit.js。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('1A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, sample, shuffle, chance, fail, gcd, fr, par, poly, term, xm, sqrtTex, E, Sfrom, B, F, CH, SH, GM, BD } = K;
  const sg = n => (n < 0 ? String(n) : '+' + n);
  const fac = (a, v) => (a ? `(${xm(a, v)})` : (v || 'x'));
  const $ = s => `$${s}$`;
  /* 分類：從候選中挑 n 張，每個籃子至少一張 */
  const pickBins = (cands, nb, n) => {
    const uniq = [...new Map(cands.map(c => [c[0], c])).values()];
    for (let t = 0; t < 30; t++) { const s = sample(uniq, n || 6); if ([...Array(nb).keys()].every(b => s.some(c => c[1] === b))) return s; }
    return fail();
  };
  /* 三選一的錯誤選項：去掉和正解相同的、重複的 */
  const opts3 = (right, wrongs) => { const w = [...new Set(wrongs.map(String))].filter(x => x !== String(right)); if (w.length < 2) fail(); return [String(right), w[0], w[1]]; };
  const lineTex = (a, b, c) => `${term(a, 'x', 1, true)}${term(b, 'y', 1, !a)}=${c}`;
  const slopeTex = (m, b) => `y=${m === 1 ? '' : m === -1 ? '-' : m}x${b ? sg(b) : ''}`;
  const WIN = [-6.5, 6.5, -6.5, 6.5];

  /* ================= 單元 1 數與數線 ================= */
  add(1, 'estimate', [
    G(() => { let n; do { n = ri(2, 95); } while (Number.isInteger(Math.sqrt(n)));
      return E('把飛鏢射到這個數在數線上的位置', `\\sqrt{${n}}`, Math.sqrt(n), 0, 10, 0.2, `找兩個平方數夾住 $${n}$：$${Math.floor(Math.sqrt(n)) ** 2}<${n}<${Math.ceil(Math.sqrt(n)) ** 2}$`); }),
    G(() => { const [p, q] = pick([[1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [2, 5], [7, 4], [5, 3], [7, 3], [5, 2]]), v = p / q * Math.PI;
      if (v >= 10) fail();
      return E('把飛鏢射到這個數在數線上的位置', `\\frac{${p === 1 ? '' : p}\\pi}{${q}}`, v, 0, 10, 0.2, '$\\pi\\approx3.14$'); })
  ]);
  add(1, 'shade', [
    G(() => { const a = ri(-4, 4), r = ri(1, 4), op = pick(['<', '\\le', '>', '\\ge']);
      const t = x => { const d = Math.abs(x - a); return op === '<' ? d < r : op === '\\le' ? d <= r + 1e-9 : op === '>' ? d > r : d >= r - 1e-9; };
      const inner = op === '<' || op === '\\le';
      return Sfrom(`在數線上塗出 $|${xm(a)}|${op} ${r}$ 的解`, [a - r, a + r], t, `和 $${a}$ 的距離${inner ? '小於' : '大於'} $${r}$`,
        inner ? `$${a - r}${op === '<' ? '<' : '\\le '}x${op === '<' ? '<' : '\\le '}${a + r}$` : `$x${op === '>' ? '<' : '\\le '}${a - r}$ 或 $x${op === '>' ? '>' : '\\ge '}${a + r}$`); })
  ]);
  add(1, 'bins', [
    G(() => {
      const c = [];
      for (let k = 0; k < 3; k++) { let n; do { n = ri(2, 50); } while (Number.isInteger(Math.sqrt(n))); c.push([`\\sqrt{${n}}`, 1]); }
      c.push([`\\sqrt{${pick([4, 9, 16, 25, 36, 49])}}`, 0], ['\\pi', 1], [`0.\\overline{${ri(1, 9)}}`, 0], [fr(ri(1, 6), 7), 0],
        [`${ri(1, 4)}+\\sqrt{${pick([2, 3, 5, 7])}}`, 1], [`${ri(1, 3)}.${ri(10, 99)}`, 0], ['\\dfrac{\\sqrt{8}}{\\sqrt{2}}', 0], ['\\sqrt{2}\\times\\sqrt{3}', 1]);
      return B('把每個數放進「有理數」或「無理數」', ['有理數', '無理數'], pickBins(c, 2), '有理數可以寫成 $\\frac{a}{b}$；循環小數也是有理數', '$\\sqrt{\\text{平方數}}$、循環小數、有限小數、分數是有理數；$\\pi$、$\\sqrt{2}$ 這類是無理數');
    })
  ]);
  add(1, 'spot', [
    G(() => { const a = ri(2, 3), r = ri(2, 6), b = a * ri(-2, 3) + (chance(0.5) ? r % a : 0), lo = b - r, hi = b + r;
      if ((lo % a) || (hi % a)) fail();
      return K.Fpick(`解不等式 $|${a}x${sg(-b)}|<${r}$`,
        [`原式：$|${a}x${sg(-b)}|<${r}$`, `$-${r}<${a}x${sg(-b)}<${r}$`, `$${lo}<${a}x<${hi}$`, `$${lo / a}<x<${hi / a}$`],
        [null, `$${a}x${sg(-b)}<-${r}$ 或 $${a}x${sg(-b)}>${r}$`, `$${-r - b}<${a}x<${r - b}$`, `$${lo}<x<${hi}$`], '$|X|<r\\iff -r<X<r$'); })
  ]);
  add(1, 'chain', [
    G(() => { const p = ri(-9, -1), q = ri(1, 9), A = Math.abs(p) + Math.abs(q), c = ri(-6, 6), Bv = Math.abs(A - c), C = (A + c) / 2;
      if (!Number.isInteger(C) || A === c) fail();
      return CH('3 道鎖：下一題會用到上一題的答案', [
        [`$A=|${p}|+|${q}|=$？`, ...opts3(A, [Math.abs(p + q), A + 1, p + q])],
        [`數線上 $P(A)$ 與 $Q(${c})$ 的距離是？`, ...opts3(Bv, [A + c, Bv + 2, Math.abs(A + c)])],
        [`$\\overline{PQ}$ 中點的坐標是？`, ...opts3(C, [Bv / 2, C + 1, A - c])]
      ].map(x => [x[0], ...x.slice(1).map(v => $(v))]), '絕對值是到原點的距離；兩點距離 $=|b-a|$', `$A=${A}$、距離 $${Bv}$、中點 $${C}$`); })
  ]);

  /* ================= 單元 2 式的運算 ================= */
  add(2, 'estimate', [
    G(() => { const a = ri(2, 4), b = pick([2, 3, 5, 6, 7]); if (a * Math.sqrt(b) > 10) fail();
      return E('把飛鏢射到這個數在數線上的位置', `${a}\\sqrt{${b}}`, a * Math.sqrt(b), 0, 10, 0.2, `$${a}\\sqrt{${b}}=\\sqrt{${a * a * b}}$`); }),
    G(() => { const p = pick([2, 3, 5]), q = pick([3, 5, 6, 7]); if (p === q) fail();
      return E('把飛鏢射到這個數在數線上的位置', `\\sqrt{${p}}+\\sqrt{${q}}`, Math.sqrt(p) + Math.sqrt(q), 0, 6, 0.15, '$\\sqrt2\\approx1.41$、$\\sqrt3\\approx1.73$、$\\sqrt5\\approx2.24$'); })
  ]);
  add(2, 'bins', [
    G(() => {
      const m = pick([2, 3, 5, 7]), n = pick([2, 3, 5]);
      const c = [[`(\\sqrt{${m}}+1)(\\sqrt{${m}}-1)`, 0], [`(\\sqrt{${n}})^{3}`, 1], [`\\dfrac{\\sqrt{${4 * m}}}{\\sqrt{${m}}}`, 0], [`\\sqrt{${4 * m}}-\\sqrt{${m}}`, 1],
        [`(\\sqrt{${m}})^{2}`, 0], [`\\sqrt{${m}}+\\sqrt{${m}}`, 1], [`\\dfrac{1}{\\sqrt{${n}}}`, 1], [`(1+\\sqrt{${n}})^{2}-2\\sqrt{${n}}`, 0]];
      return B('化簡後是「有理數」還是「無理數」？', ['有理數', '無理數'], pickBins(c, 2), '先化簡再判斷，例如 $(\\sqrt a+1)(\\sqrt a-1)=a-1$', '$(\\sqrt m)^{2}=m$、$\\frac{\\sqrt{4m}}{\\sqrt m}=2$ 等是有理數');
    })
  ]);
  add(2, 'spot', [
    G(() => { const p = nz(-6, 6);
      return K.Fpick(`展開 $(x${sg(p)})^{2}$`, [`原式：$(x${sg(p)})^{2}$`, `$=(x${sg(p)})(x${sg(p)})$`, `$=x^{2}${sg(p)}x${sg(p)}x${sg(p * p)}$`, `$=${poly([1, 2 * p, p * p])}$`],
        [null, `$=x^{2}${sg(p * p)}$`, `$=x^{2}${sg(p)}x${sg(p * p)}$`, `$=${poly([1, p, p * p])}$`], '$(a+b)^{2}=a^{2}+2ab+b^{2}$'); }),
    G(() => { const a = ri(2, 4), m = pick([2, 3, 5]), c = ri(1, 5);
      return K.Fpick(`計算 $(${a}\\sqrt{${m}}+${c})(${a}\\sqrt{${m}}-${c})$`, [`原式`, `$=(${a}\\sqrt{${m}})^{2}-${c}^{2}$`, `$=${a * a}\\times${m}-${c * c}$`, `$=${a * a * m - c * c}$`],
        [null, `$=${a}\\sqrt{${m}}^{2}-${c}^{2}$`, `$=${a}\\times${m}-${c * c}$`, `$=${a * a * m + c * c}$`], '$(a+b)(a-b)=a^{2}-b^{2}$，$(k\\sqrt m)^{2}=k^{2}m$'); })
  ]);
  add(2, 'chain', [
    G(() => { const m = ri(5, 12), n = ri(1, m - 1), A = m - n, Bv = (A + 1) * (A + 1), C = A + 1 + 2;
      if (Number.isInteger(Math.sqrt(m)) || Number.isInteger(Math.sqrt(n))) fail();
      return CH('3 道鎖：下一題會用到上一題的答案', [
        [`$A=(\\sqrt{${m}}+\\sqrt{${n}})(\\sqrt{${m}}-\\sqrt{${n}})=$？`, $(A), $(m + n), $(A + 1)],
        [`$B=(A+1)^{2}=$？`, $(Bv), $(A * A + 1), $(2 * (A + 1))],
        [`$\\sqrt{B}+2=$？`, $(C), $(Bv + 2), $(C + 1)]
      ], '平方差公式 $(a+b)(a-b)=a^{2}-b^{2}$', `$A=${A}$、$B=${Bv}$、$\\sqrt B+2=${C}$`); })
  ]);

  /* ================= 單元 3 指數 ================= */
  add(3, 'estimate', [
    G(() => { const [b, e, et] = pick([[2, 1.5, '\\frac32'], [2, 2.5, '\\frac52'], [3, 0.5, '\\frac12'], [3, 1.5, '\\frac32'], [10, 0.5, '\\frac12'], [2, 3.2, '3.2'], [4, 0.75, '\\frac34'], [8, 1 / 3, '\\frac13'], [5, 1.2, '1.2']]);
      const v = Math.pow(b, e); if (v >= 10) fail();
      return E('把飛鏢射到這個數在數線上的位置', `${b}^{${et}}`, v, 0, 10, 0.2, '$a^{\\frac{m}{n}}=\\sqrt[n]{a^{m}}$；先找兩個整數次方夾住它'); })
  ]);
  add(3, 'bins', [
    G(() => {
      const c = [['2^{-3}', 0], ['\\left(\\dfrac12\\right)^{-2}', 1], ['3^{\\frac12}', 1], ['0.5^{3}', 0], ['4^{-\\frac12}', 0], ['\\left(\\dfrac23\\right)^{-1}', 1],
        ['10^{0.1}', 1], ['5^{-2}', 0], ['\\left(\\dfrac13\\right)^{\\frac12}', 0], ['1.1^{2}', 1], ['9^{-\\frac12}', 0], ['2^{\\frac13}', 1]];
      return B('這個數比 1 大還是比 1 小？', ['大於 1', '小於 1'], pickBins(c, 2), '底數大於 1 時，指數為正就大於 1；底數小於 1 時相反', '$a^{-n}=\\frac{1}{a^{n}}$，先化成底數大於 1 再判斷');
    })
  ]);
  add(3, 'spot', [
    G(() => { const a = ri(2, 5), b = ri(1, 3), c = ri(1, 3), e = a + 2 * b - 3 * c;
      return K.Fpick(`化簡 $\\dfrac{2^{${a}}\\times4^{${b}}}{8^{${c}}}$`, ['原式', `$=\\dfrac{2^{${a}}\\times2^{${2 * b}}}{2^{${3 * c}}}$`, `$=2^{${a}+${2 * b}-${3 * c}}$`, `$=2^{${e}}$`],
        [null, `$=\\dfrac{2^{${a}}\\times2^{${b + 2}}}{2^{${c + 3}}}$`, `$=2^{${a}\\times${2 * b}-${3 * c}}$`, `$=2^{${e + 2}}$`], '$4=2^{2}$、$8=2^{3}$，$(a^{m})^{n}=a^{mn}$'); })
  ]);
  add(3, 'chain', [
    G(() => { const p = ri(4, 8), q = ri(1, p - 2), A = Math.pow(2, p - q), Bv = Math.sqrt(A), C = A * Bv;
      if (!Number.isInteger(Bv)) fail();
      return CH('3 道鎖：下一題會用到上一題的答案', [
        [`$A=2^{${p}}\\div2^{${q}}=$？`, $(A), $(Math.pow(2, p) - Math.pow(2, q)), $(2 * (p - q))],
        [`$B=A^{\\frac12}=$？`, $(Bv), $(A / 2), $(Bv + 1)],
        [`$A\\times B=$？`, $(C), $(A + Bv), $(C * 2)]
      ], '同底數相除，指數相減', `$A=${A}$、$B=${Bv}$、$AB=${C}$`); })
  ]);

  /* ================= 單元 4 常用對數 ================= */
  add(4, 'estimate', [
    G(() => { const n = pick([2, 3, 5, 7, 20, 30, 50, 70, 200, 300, 500]);
      return E('把飛鏢射到這個數在數線上的位置', `\\log ${n}`, Math.log10(n), 0, 3, 0.06, '$\\log2\\approx0.301$、$\\log3\\approx0.477$；$\\log(a\\times10^{n})=n+\\log a$'); })
  ]);
  add(4, 'bins', [
    G(() => {
      const c = [['\\log 0.3', 1], ['\\log 2', 0], ['\\log 0.05', 1], ['\\log 1.5', 0], ['\\log\\dfrac12', 1], ['\\log 20', 0], ['\\log 0.99', 1], ['\\log 1.01', 0], ['\\log\\dfrac{3}{2}', 0], ['\\log\\dfrac{2}{3}', 1]];
      return B('這個對數值是正的還是負的？', ['大於 0', '小於 0'], pickBins(c, 2), '真數大於 1，對數為正；真數介於 0 和 1 之間，對數為負', '$\\log x>0\\iff x>1$');
    })
  ]);
  add(4, 'spot', [
    G(() => { const [a, b] = pick([[2, 50], [4, 25], [5, 20], [8, 125], [25, 40]]), k = Math.round(Math.log10(a * b));
      return K.Fpick(`計算 $\\log ${a}+\\log ${b}$`, ['原式', `$=\\log(${a}\\times${b})$`, `$=\\log ${a * b}$`, `$=${k}$`],
        [null, `$=\\log(${a}+${b})$`, `$=\\log ${a * b + 10}$`, `$=${k + 1}$`], '$\\log M+\\log N=\\log MN$'); })
  ]);
  add(4, 'chain', [
    G(() => { const k = ri(2, 4), A = k, Bv = Math.pow(10, A - 1), C = A + 2;
      return CH('3 道鎖：下一題會用到上一題的答案', [
        [`$A=\\log ${Math.pow(10, k)}=$？`, $(A), $(Math.pow(10, k - 1)), $(k + 1)],
        [`$B=10^{A-1}=$？`, $(Bv), $(Bv * 10), $(A - 1)],
        [`$\\log(B\\times1000)=$？`, $(A + 2), $(Bv + 3), $(A + 3)]
      ], '$\\log10^{n}=n$', `$A=${A}$、$B=${Bv}$、$\\log(${Bv}\\times1000)=${C}$`); })
  ]);

  /* ================= 單元 5 多項式的運算與應用 ================= */
  add(5, 'bins', [
    G(() => { const rs = sample([-3, -2, -1, 1, 2, 3, 4], 3), c = rs.reduce((p, r) => { const n = p.concat([0]); for (let i = n.length - 1; i > 0; i--) n[i] -= r * n[i - 1]; return n; }, [1]);
      const others = sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5].filter(x => !rs.includes(x)), 3);
      const items = rs.map(r => [fac(r), 0]).concat(others.map(r => [fac(r), 1]));
      return B(`$f(x)=${poly(c)}$。下列哪些是 $f(x)$ 的因式？`, ['是因式', '不是因式'], items, '因式定理：$x-a$ 是因式 $\\iff f(a)=0$', `$f(x)=${rs.map(r => fac(r)).join('')}$`);
    })
  ]);
  add(5, 'spot', [
    G(() => { const c = [1, ri(-4, 4), ri(-5, 5), ri(-6, 6)], a = nz(-3, 3), R = K.polyAt(c, a), Rw = K.polyAt(c, -a);
      if (R === Rw) fail();
      return F(`求 $f(x)=${poly(c)}$ 除以 $${xm(a)}$ 的餘式`, ['由餘式定理，餘式是 $f(a)$', `$x${sg(-a)}=0$，所以 $a=${-a}$`, `餘式 $=f(${-a})=${Rw}$`],
        1, `$x${sg(-a)}=0$，所以 $a=${a}$；餘式 $=f(${a})=${R}$`, '$x-a=0$ 時 $x=a$，注意正負號'); })
  ]);
  add(5, 'chain', [
    G(() => { const c = [1, ri(-3, 3), ri(-3, 3)], A = K.polyAt(c, 1), Bv = K.polyAt(c, A), C = Bv - A;
      if (Math.abs(Bv) > 40) fail();
      return CH(`$f(x)=${poly(c)}$。3 道鎖：下一題會用到上一題的答案`, [
        [`$A=f(1)=$？`, ...opts3(A, [A + 1, K.polyAt(c, -1), A - 2]).map($)],
        [`$f(x)$ 除以 $x-A$ 的餘式 $B=$？`, ...opts3(Bv, [K.polyAt(c, -A), Bv + 1, Bv - 2]).map($)],
        [`$B-A=$？`, ...opts3(C, [Bv + A, C + 1, A - Bv]).map($)]
      ], '餘式定理：$f(x)$ 除以 $x-a$ 的餘式是 $f(a)$', `$A=${A}$、$B=f(${A})=${Bv}$、$B-A=${C}$`); })
  ]);

  /* ================= 單元 6 簡單多項式函數及其圖形 ================= */
  const vtx = (a, h, k) => `${a === 1 ? '' : a === -1 ? '-' : a}${h ? `${fac(h)}^{2}` : 'x^{2}'}${k ? sg(k) : ''}`;
  add(6, 'gmatch', [
    G(() => { const vs = sample([[1, 0, 2], [1, 2, 0], [-1, 0, 3], [1, -2, -1], [-1, 2, 1], [2, 0, -3], [1, 1, -3], [-1, -1, 2], [0.5, 0, -1]], 3);
      return GM('把方程式配到它的圖形', WIN, vs.map(([a, h, k]) => [`y=${vtx(a === 0.5 ? 1 : a, h, k).replace(/^/, a === 0.5 ? '\\frac12' : '')}`, [{ fn: x => a * (x - h) * (x - h) + k }]]),
        '看頂點 $(h,k)$ 與開口方向（$a>0$ 向上）', vs.map(([a, h, k]) => `頂點 $(${h},${k})$`).join('、')); })
  ]);
  add(6, 'build', [
    G(() => { const a = pick([1, -1, 2]), h = nz(-3, 3), k = nz(-3, 3), c = [a, -2 * a * h, a * h * h + k];
      return BD(`拖動頂點，畫出 $y=${poly(c)}$ 的圖形`, WIN, [[0, 0, '頂點']], P => [{ fn: x => a * (x - P[0][0]) ** 2 + P[0][1] }], P => P[0][0] === h && P[0][1] === k, [[h, k]],
        '配方成 $y=a(x-h)^{2}+k$，頂點是 $(h,k)$', `$y=${vtx(a, h, k)}$，頂點 $(${h},${k})$`); })
  ]);
  add(6, 'shoot', [
    G(() => { const h = ri(-4, -1), k = ri(-3, 0), d = pick([2, 3]), A = [-2, -1, -0.5, 0.5, 1, 2], ai = ri(0, 5), a = A[ai], hy = k + a * d * d;
      if (Math.abs(hy) > 6) fail();
      return SH(`球從頂點 $(${h},${k})$ 沿著拋物線 $y=a${fac(h)}^{2}${k ? sg(k) : ''}$ 飛出。調整 $a$，讓球通過籃框 $(${h + d},${hy})$`, WIN, [h, k], [h + d, hy],
        [{ n: 'a', vals: A, tex: ['-2', '-1', '-\\frac12', '\\frac12', '1', '2'] }], [ai], P => (x => P[0] * (x - h) * (x - h) + k),
        '把籃框的坐標代進方程式解 $a$', `$${hy}=a(${h + d}${sg(-h)})^{2}${k ? sg(k) : ''}$，$a=${fr(hy - k, d * d)}$`); })
  ]);

  /* ================= 單元 7 多項式函數的圖形與多項式不等式 ================= */
  add(7, 'shade', [
    G(() => { const rs = sample([-4, -3, -2, -1, 0, 1, 2, 3, 4], pick([2, 3])).sort((a, b) => a - b), op = pick(['>', '<', '\\ge', '\\le']);
      const f = x => rs.reduce((p, r) => p * (x - r), 1), t = x => { const v = f(x); return op === '>' ? v > 1e-9 : op === '<' ? v < -1e-9 : op === '\\ge' ? v >= -1e-9 : v <= 1e-9; };
      return Sfrom(`在數線上塗出 $${rs.map(r => fac(r)).join('')}${op} 0$ 的解`, rs, t, '先標出根，再判斷每一段的正負（最右邊一段為正，往左每過一個根變號）', '依各段的正負決定；有等號時，根也要包含（實心）'); })
  ]);
  add(7, 'gmatch', [
    G(() => { const all = [[[1, -1, 2], 1], [[2, 2, -1], 1], [[0, 0, 3], 1], [[-2, -2, 1], 1], [[1, 1, -2], 1], [[-1, 2, 2], 1], [[1, 1, 1], -1], [[-1, 0, 2], -1]];
      const vs = sample(all, 3), tx = ([[a, b, c], s]) => `y=${s < 0 ? '-' : ''}${fac(a)}${fac(b)}${fac(c)}`.replace(/\(x-1\)\(x-1\)/, '(x-1)^{2}');
      const T = vs.map(v => { const [rs, s] = v; const cnt = {}; rs.forEach(r => { cnt[r] = (cnt[r] || 0) + 1; }); return `y=${s < 0 ? '-' : ''}${Object.keys(cnt).map(Number).sort((a, b) => a - b).map(r => fac(r) + (cnt[r] > 1 ? `^{${cnt[r]}}` : '')).join('')}`; });
      if (new Set(T).size < 3) fail();
      return GM('把方程式配到它的圖形', [-4.5, 4.5, -6, 6], vs.map(([rs, s], i) => [T[i], [{ fn: x => s * 0.4 * rs.reduce((p, r) => p * (x - r), 1) }]]),
        '看圖形和 $x$ 軸的交點；平方的因式在那裡相切；最高次項係數的正負決定右端往上或往下', '依和 $x$ 軸的交點、切點判斷'); })
  ]);
  add(7, 'spot', [
    G(() => { const a = ri(-4, 2), b = a + ri(1, 5), lt = chance(0.5);
      return F(`解不等式 $${poly([1, -(a + b), a * b])}${lt ? '<' : '>'}0$`, [`因式分解：$${fac(a)}${fac(b)}${lt ? '<' : '>'}0$`, `兩根為 $${a}$、$${b}$`,
        lt ? `解為 $x<${a}$ 或 $x>${b}$` : `解為 $${a}<x<${b}$`], 2, lt ? `解為 $${a}<x<${b}$` : `解為 $x<${a}$ 或 $x>${b}$`, lt ? '小於 0：解在兩根之間' : '大於 0：解在兩根的外側'); })
  ]);

  /* ================= 單元 8 直線方程式及其圖形 ================= */
  add(8, 'gmatch', [
    G(() => { const ls = sample([[1, 0], [2, 1], [-1, 2], [-2, -1], [0.5, -2], [-0.5, 1], [1, -3], [3, 0], [0, 2]], 3);
      const tx = ([m, b]) => (m === 0 ? `y=${b}` : `y=${m === 0.5 ? '\\frac12' : m === -0.5 ? '-\\frac12' : m === 1 ? '' : m === -1 ? '-' : m}x${b ? sg(b) : ''}`);
      return GM('把方程式配到它的圖形', WIN, ls.map(([m, b]) => [tx([m, b]), [{ fn: x => m * x + b }]]), '看 $y$ 截距（和 $y$ 軸的交點）與斜率（往右上或右下）', ls.map(l => `$${tx(l)}$`).join('、'));
    })
  ]);
  add(8, 'build', [
    G(() => { const m = pick([1, 2, -1, -2, 3, -3]), b = ri(-3, 3);
      return BD(`拖動兩個點，畫出直線 $${slopeTex(m, b)}$`, WIN, [[-4, -5, 'P'], [4, -5, 'Q']], P => (P[0][0] === P[1][0] && P[0][1] === P[1][1] ? [] : [{ line: [P[1][1] - P[0][1], P[0][0] - P[1][0], (P[1][1] - P[0][1]) * P[0][0] + (P[0][0] - P[1][0]) * P[0][1]] }]),
        P => (P[0][0] !== P[1][0] || P[0][1] !== P[1][1]) && P.every(p => p[1] === m * p[0] + b), [[0, b], [1, m + b]],
        `先找 $y$ 截距 $(0,${b})$，再往右 1 格、往${m > 0 ? '上' : '下'} $${Math.abs(m)}$ 格`, `例如 $(0,${b})$ 和 $(1,${m + b})$`); })
  ]);
  add(8, 'shoot', [
    G(() => { const x0 = ri(-5, -2), y0 = ri(-4, 1), d = ri(3, 6), M = [-2, -1, -0.5, 0.5, 1, 2], mi = ri(0, 5), m = M[mi], hy = y0 + m * d;
      if (Math.abs(hy) > 6) fail();
      return SH(`球從 $(${x0},${y0})$ 沿直線飛出。調整斜率 $m$，讓球通過籃框 $(${x0 + d},${hy})$`, WIN, [x0, y0], [x0 + d, hy],
        [{ n: 'm', vals: M, tex: ['-2', '-1', '-\\frac12', '\\frac12', '1', '2'] }], [mi], P => (x => y0 + P[0] * (x - x0)),
        '斜率 $=\\dfrac{y_2-y_1}{x_2-x_1}$', `$m=\\frac{${hy}-${par(y0)}}{${x0 + d}-${par(x0)}}=${fr(hy - y0, d)}$`); })
  ]);
  add(8, 'bins', [
    G(() => { const c = [];
      for (let k = 0; k < 8; k++) { const a = nz(-4, 4), b = nz(-4, 4); c.push([lineTex(a, b, ri(-6, 6)), -a / b > 0 ? 0 : 1]); }
      return B('直線往哪個方向傾斜？', ['斜率 > 0（左下到右上）', '斜率 < 0（左上到右下）'], pickBins(c, 2), '$ax+by=c$ 的斜率是 $-\\frac{a}{b}$', '斜率 $=-\\frac{a}{b}$'); })
  ]);
  add(8, 'spot', [
    G(() => { const x1 = ri(-4, 2), y1 = ri(-4, 4), dx = nz(-4, 4), dy = nz(-5, 5), x2 = x1 + dx, y2 = y1 + dy;
      return K.Fpick(`求通過 $A(${x1},${y1})$、$B(${x2},${y2})$ 的直線斜率`, [`斜率 $m=\\dfrac{y_2-y_1}{x_2-x_1}$`, `$=\\dfrac{${y2}-${par(y1)}}{${x2}-${par(x1)}}$`, `$=\\dfrac{${dy}}{${dx}}$`, `$=${fr(dy, dx)}$`],
        [`斜率 $m=\\dfrac{x_2-x_1}{y_2-y_1}$`, `$=\\dfrac{${x2}-${par(x1)}}{${y2}-${par(y1)}}$`, `$=\\dfrac{${y2 + y1}}{${x2 + x1}}$`, null], '斜率是 $y$ 的變化量除以 $x$ 的變化量'); })
  ]);

  /* ================= 單元 9 直線方程式的應用 ================= */
  add(9, 'bins', [
    G(() => { const [a, b] = pick([[1, 2], [2, -1], [3, 1], [1, -3], [2, 3]]), c = [];
      for (let k = 1; k <= 3; k++) c.push([lineTex(a * k, b * k, ri(-9, 9)), 0], [lineTex(-b * k, a * k, ri(-9, 9)), 1]);
      c.push([lineTex(a + 1, b, 3), 2], [lineTex(b, a, -2), 2], [lineTex(a, b + 2, 1), 2]);
      return B(`和直線 $L:${lineTex(a, b, 0)}$ 的關係是？`, ['平行（或重合）', '垂直', '都不是'], pickBins(c, 3), '$ax+by=c$ 的斜率是 $-\\frac{a}{b}$；平行：斜率相等；垂直：斜率相乘 $=-1$', `$L$ 的斜率是 $${fr(-a, b)}$`); })
  ]);
  add(9, 'spot', [
    G(() => { const [a, b, h] = pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10]]), x0 = ri(-3, 3), y0 = ri(-3, 3), c = ri(-12, 12), num = a * x0 + b * y0 - c;
      if (!num) fail();
      return K.Fpick(`求 $P(${x0},${y0})$ 到直線 $${lineTex(a, b, c)}$ 的距離`, [`化成 $${a}x${sg(b)}y${sg(-c)}=0$`, `$d=\\dfrac{|${a}\\times${par(x0)}${sg(b)}\\times${par(y0)}${sg(-c)}|}{\\sqrt{${a}^{2}+${b}^{2}}}$`, `$=\\dfrac{${Math.abs(num)}}{${h}}$`, `$=${fr(Math.abs(num), h)}$`],
        [`化成 $${a}x${sg(b)}y${sg(c)}=0$`, `$d=\\dfrac{|${a}\\times${par(x0)}${sg(b)}\\times${par(y0)}${sg(-c)}|}{${a}^{2}+${b}^{2}}$`, `$=\\dfrac{${Math.abs(num)}}{${h * h}}$`, null], '$d=\\dfrac{|ax_0+by_0+c|}{\\sqrt{a^{2}+b^{2}}}$'); })
  ]);

  /* ================= 單元 10 圓與直線的關係 ================= */
  const circTex = (h, k, F0) => `x^{2}+y^{2}${term(-2 * h, 'x', 1)}${term(-2 * k, 'y', 1)}${F0 ? sg(F0) : ''}=0`;
  add(10, 'gmatch', [
    G(() => { const cs = sample([[0, 0, 2], [1, 1, 2], [-2, 0, 1], [0, -2, 3], [2, -1, 2], [-1, 2, 1.5], [0, 0, 4], [2, 2, 1]], 3);
      return GM('把方程式配到它的圖形', WIN, cs.map(([h, k, r]) => [`${fac(h)}^{2}+${fac(k, 'y')}^{2}=${r === 1.5 ? '\\frac94' : r * r}`, [{ circle: [h, k, r] }, { pt: [h, k], style: { r: 3 } }]]), '看圓心 $(h,k)$ 與半徑 $r$', cs.map(([h, k, r]) => `圓心 $(${h},${k})$、半徑 $${r}$`).join('；')); })
  ]);
  add(10, 'build', [
    G(() => { const h = nz(-3, 3), k = nz(-3, 3), r = ri(1, 3), F0 = h * h + k * k - r * r;
      return BD(`拖動圓心，畫出圓 $${circTex(h, k, F0)}$（半徑已經是 $${r}$）`, WIN, [[0, 0, '圓心']], P => [{ circle: [P[0][0], P[0][1], r] }], P => P[0][0] === h && P[0][1] === k, [[h, k]],
        '配方成 $(x-h)^{2}+(y-k)^{2}=r^{2}$', `$${fac(h)}^{2}+${fac(k, 'y')}^{2}=${r * r}$，圓心 $(${h},${k})$`); })
  ]);
  add(10, 'bins', [
    G(() => { const h = ri(-2, 2), k = ri(-2, 2), r = 5, c = [];
      [[3, 4], [4, -3], [-5, 0], [0, 5], [-3, -4]].forEach(([dx, dy]) => c.push([`(${h + dx},${k + dy})`, 1]));
      [[1, 2], [-2, 1], [3, -1], [0, -3], [2, 2]].forEach(([dx, dy]) => c.push([`(${h + dx},${k + dy})`, 0]));
      [[4, 4], [-6, 0], [0, -6], [5, 2], [-4, -4]].forEach(([dx, dy]) => c.push([`(${h + dx},${k + dy})`, 2]));
      return B(`點和圓 $${fac(h)}^{2}+${fac(k, 'y')}^{2}=25$ 的位置關係`, ['圓內', '圓上', '圓外'], pickBins(c, 3), '算點到圓心的距離，和半徑 $5$ 比較', `圓心 $(${h},${k})$、半徑 $5$`); })
  ]);
})(window.LG);
