/* 三上選修甲（數學 4A）新玩法題目：排序輸送帶（order）、座標尋寶（point）、公式拼圖（tiles）
   必須在 4B.js 之前載入：選修乙用 copy() 沿用選修甲題目時，這些題目也會一起沿用。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('4A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, sample, chance, fail, fr, par, poly, term, xm, O, P, T, perm } = K;
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
  const LIMn = '\\lim_{n\\to\\infty}';
  const apF = (n, d) => '=' + fr(n, d, false);
  const deriv = c => c.slice(0, -1).map((a, i) => a * (c.length - 1 - i));   // 係數由高次到常數

  /* ================= 單元 1 數列及其極限 ================= */
  add(1, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) {
        const a = nz(-6, 6), c = ri(1, 4), b = ri(-5, 5), d = ri(1, 5);
        it.push([`${LIMn}\\dfrac{${poly([a, b], 'n')}}{${poly([c, d], 'n')}}`, a / c, apF(a, c)]);
      }
      return O('依極限值由小到大排好', spread(it, 0.05), '分子、分母同除以 $n$：$\\lim\\frac{an+b}{cn+d}=\\frac{a}{c}$', '');
    })
  ]);
  add(1, 'tiles', [
    T('等比數列 $\\langle r^{n}\\rangle$ 的極限', '|r|<1\\Rightarrow\\lim_{n\\to\\infty}r^{n}=@,\\quad r=1\\Rightarrow\\lim_{n\\to\\infty}r^{n}=@', ['0', '1'], ['\\infty', '-1', 'r'],
      '$|r|<1$ 時 $r^{n}$ 越乘越小', '$|r|<1$ 時極限為 $0$；$r=1$ 時極限為 $1$；其他情形發散'),
    G(() => {
      const p = nz(-6, 6), q = ri(-5, 5), r = ri(1, 5), s = ri(-5, 5);
      return T('求數列的極限', `${LIMn}\\dfrac{${poly([p, q, 0], 'n')}}{${poly([r, 0, s], 'n')}}=@`, [fr(p, r)], [fr(r, p), fr(q, r) === fr(p, r) ? '1' : fr(q, r), '0', '\\infty'],
        '分子、分母同除以 $n^{2}$', `最高次係數比 $\\frac{${p}}{${r}}=${fr(p, r, false)}$`);
    })
  ]);

  /* ================= 單元 2 無窮等比級數 ================= */
  const RS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3], [-2, 3], [1, 5]];
  add(2, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) {
        const a = nz(-8, 9), [p, q] = pick(RS), S = a / (1 - p / q);
        it.push([`${a}+${par(a)}\\cdot${p < 0 ? `\\left(${fr(p, q)}\\right)` : fr(p, q)}+${par(a)}\\cdot\\left(${fr(p, q)}\\right)^{2}+\\cdots`, S, apF(a * q, q - p)]);
      }
      return O('依級數的和由小到大排好', spread(it, 0.08), '$a+ar+ar^{2}+\\cdots=\\frac{a}{1-r}$（$|r|<1$）', '');
    })
  ]);
  add(2, 'tiles', [
    T('完成無窮等比級數的和', 'a+ar+ar^{2}+\\cdots=@\\quad(@<r<@)', ['\\dfrac{a}{1-r}', '-1', '1'], ['\\dfrac{a}{1+r}', '\\dfrac{ar}{1-r}', '0'],
      '公比的絕對值小於 $1$ 才收斂', '$\\frac{a}{1-r}$，條件 $-1<r<1$'),
    G(() => {
      const a = nz(-9, 9), [p, q] = pick(RS);
      return T('求無窮等比級數的和', `\\sum_{n=1}^{\\infty}${a}\\left(${fr(p, q)}\\right)^{n-1}=@`, [fr(a * q, q - p)], [fr(a * q, q + p), fr(a * p, q - p), String(a), fr(a, q - p)],
        '首項 $a$、公比 $r$：和 $=\\frac{a}{1-r}$', `$\\frac{${a}}{1-${p < 0 ? `(${fr(p, q, false)})` : fr(p, q, false)}}=${fr(a * q, q - p, false)}$`);
    })
  ]);

  /* ================= 單元 3 函數 ================= */
  add(3, 'point', [
    G(() => {
      const a = ri(-5, 5), b = ri(-5, 5); if (a === b) fail();
      return P(`$y=f(x)$ 的圖形通過點 $(${a},${b})$。點出 $y=f^{-1}(x)$ 的圖形一定通過的點`, box([[a, b], [b, a]], 1.5),
        [{ pt: [a, b], label: '' }, { fn: x => x, style: { dash: [6, 6], alpha: 0.45, glow: false } }], [b, a],
        '函數與反函數的圖形對稱於直線 $y=x$', `$(${a},${b})$ 對 $y=x$ 的對稱點是 $(${b},${a})$`);
    }),
    G(() => {
      const a = ri(-3, 3), b = ri(-3, 3), h = nz(-3, 3), k = nz(-3, 3);
      return P(`$y=f(x)$ 的圖形通過點 $(${a},${b})$。點出 $y=f(${xm(h)})${sg(k)}$ 的圖形一定通過的點`, box([[a, b], [a + h, b + k]], 1.5), [{ pt: [a, b] }], [a + h, b + k],
        '$f(x-h)+k$：圖形向右平移 $h$、向上平移 $k$', `$(${a}${sg(h)},${b}${sg(k)})=(${a + h},${b + k})$`);
    })
  ]);
  add(3, 'order', [
    G(() => {
      const f = x => x * x + 1, g = x => 2 * x - 3, k = ri(-2, 3);
      const it = [[`f(g(${k}))`, f(g(k))], [`g(f(${k}))`, g(f(k))], [`f(f(${k}))`, f(f(k))], [`g(g(${k}))`, g(g(k))]];
      return O(`已知 $f(x)=x^{2}+1$、$g(x)=2x-3$，把下列的值由小到大排好`, spread(it, 0.5), '由內往外算：先算括號裡的函數值', '');
    })
  ]);
  add(3, 'tiles', [
    T('合成函數', '(f\\circ g)(x)=@,\\quad (g\\circ f)(x)=@', ['f(g(x))', 'g(f(x))'], ['f(x)g(x)', 'f(x)+g(x)'], '$f\\circ g$：先做 $g$，再做 $f$', '$(f\\circ g)(x)=f(g(x))$、$(g\\circ f)(x)=g(f(x))$'),
    G(() => {
      const c = nz(-5, 5), a = nz(-3, 3), b = nz(-5, 5);
      const A = `${a === 1 ? '' : a === -1 ? '-' : a}x${sg(b)}`;
      return T(`已知 $f(x)=x^{2}${sg(c)}$、$g(x)=${A}$，寫出合成函數`, '(f\\circ g)(x)=@,\\quad (g\\circ f)(x)=@', [`(${A})^{2}${sg(c)}`, `${a === 1 ? '' : a === -1 ? '-' : a}(x^{2}${sg(c)})${sg(b)}`],
        [`(${A})^{2}`, `x^{2}${sg(c)}${sg(b)}`, `${a === 1 ? '' : a === -1 ? '-' : a}x^{2}${sg(b)}`],
        '把裡面的函數整個代入外面函數的 $x$', `$f(g(x))=(${A})^{2}${sg(c)}$`);
    })
  ]);

  /* ================= 單元 4 函數的極限 ================= */
  add(4, 'order', [
    G(() => {
      const it = [], used = new Set();
      for (let k = 0; k < 8 && it.length < 4; k++) {
        const t = ri(0, 2), a = nz(-4, 4);
        let tex, v;
        if (t === 0) { tex = `\\lim_{x\\to${a}}\\dfrac{x^{2}-${a * a}}{${xm(a)}}`; v = 2 * a; }
        else if (t === 1) { const b = nz(-3, 3), c = ri(-5, 5); tex = `\\lim_{x\\to${a}}(${poly([b, c])})`; v = b * a + c; }
        else { tex = `\\lim_{x\\to${a}}\\dfrac{x^{3}${a < 0 ? '+' : '-'}${Math.abs(a * a * a)}}{${xm(a)}}`; v = 3 * a * a; }
        if (used.has(v)) continue; used.add(v); it.push([tex, v]);
      }
      if (it.length < 4) fail();
      return O('依極限值由小到大排好', it, '$\\frac{0}{0}$ 型：先因式分解約掉 $x-a$，再代入', '');
    })
  ]);
  add(4, 'tiles', [
    G(() => {
      const a = nz(-6, 6);
      return T('化簡後求極限', `\\lim_{x\\to${a}}\\dfrac{x^{2}-${a * a}}{${xm(a)}}=\\lim_{x\\to${a}}(@)=@`, [K.xm(-a), String(2 * a)], [xm(a), String(a), String(a * a), '0'],
        '$x^{2}-a^{2}=(x-a)(x+a)$', `$\\lim_{x\\to${a}}(${K.xm(-a)})=${2 * a}$`);
    }),
    T('極限的運算性質（兩極限都存在）', '\\lim_{x\\to a}[f(x)g(x)]=@\\cdot@', ['\\lim_{x\\to a}f(x)', '\\lim_{x\\to a}g(x)'], ['f(a)', '\\lim_{x\\to a}f(x)g(x)'],
      '乘積的極限等於極限的乘積', '$\\lim[f(x)g(x)]=\\lim f(x)\\cdot\\lim g(x)$', perm(['\\lim_{x\\to a}f(x)', '\\lim_{x\\to a}g(x)'], [[0, 1]]))
  ]);

  /* ================= 單元 5 微分的概念與性質 ================= */
  add(5, 'tiles', [
    T('完成導數的定義', "f'(a)=\\lim_{h\\to0}@", ['\\dfrac{f(a+h)-f(a)}{h}'], ['\\dfrac{f(a+h)-f(a)}{a}', '\\dfrac{f(h)-f(a)}{h}', 'f(a+h)-f(a)'],
      '割線斜率的極限', "$f'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}$"),
    T('完成微分公式', "(x^{n})'=@,\\quad [cf(x)]'=@", ['nx^{n-1}', "cf'(x)"], ['x^{n-1}', 'nx^{n}', "f'(x)"], '次方移到前面、次方減 1', "$(x^{n})'=nx^{n-1}$、$[cf(x)]'=cf'(x)$"),
    T('完成乘法的微分公式', "[f(x)g(x)]'=@+@", ["f'(x)g(x)", "f(x)g'(x)"], ["f'(x)g'(x)", "f(x)g(x)"], '輪流微分：前微後不微 + 前不微後微', "$[fg]'=f'g+fg'$", perm(["f'(x)g(x)", "f(x)g'(x)"], [[0, 1]])),
    G(() => {
      const c = [ri(1, 3) * pick([1, -1]), ri(-5, 5), ri(-6, 6), ri(-9, 9)], d = deriv(c);
      return T('求導函數', `f(x)=${poly(c)}\\Rightarrow f'(x)=@`, [poly(d)], [poly(deriv(c).map((x, i) => (i === 0 ? c[0] : x))), poly([c[0] * 3, c[1], c[2]]), poly(d.concat([0]).slice(0, 3).map((x, i) => (i === 2 ? c[2] + 1 : x)))],
        "$(x^{n})'=nx^{n-1}$，常數微分為 $0$", `$f'(x)=${poly(d)}$`);
    })
  ]);
  add(5, 'order', [
    G(() => {
      const c = [pick([1, -1]), ri(-3, 3), ri(-6, 6), ri(-5, 5)], d = deriv(c), xs = sample([-3, -2, -1, 0, 1, 2, 3], 4);
      return O(`已知 $f(x)=${poly(c)}$，把下列導數值由小到大排好`, spread(xs.map(x => [`f'(${x})`, K.polyAt(d, x)]), 0.5), `$f'(x)=${poly(d)}$`, '');
    })
  ]);
  add(5, 'point', [
    G(() => {
      const b = ri(-4, 4), c = ri(-3, 3), m = ri(-4, 4), x0 = (m - b) / 2;
      if (!Number.isInteger(x0)) fail();
      const y0 = x0 * x0 + b * x0 + c;
      if (Math.abs(y0) > 7 || Math.abs(x0) > 6) fail();
      return PA(`點出拋物線 $y=${poly([1, b, c])}$ 上，切線斜率為 $${m}$ 的切點`, box([[x0, y0]], 1.5), [{ fn: x => x * x + b * x + c }],
        [{ fn: x => m * (x - x0) + y0, style: { dash: [8, 6] } }], [x0, y0], "切線斜率 $=f'(x)$", `$f'(x)=2x${sg(b)}=${m}$，$x=${x0}$、$y=${y0}$`);
    })
  ]);

  /* ================= 單元 6 微分的應用 ================= */
  /* f'(x) = 3k(x-p)(x-q) 的三次函數：f(x) = k x^3 - (3k(p+q)/2) x^2 + 3kpq x + C */
  const cubic = () => {
    const k = pick([1, -1]), p = ri(-3, 1), q = p + pick([2, 4]);
    const c2 = -3 * k * (p + q) / 2, c1 = 3 * k * p * q;
    if (!Number.isInteger(c2)) fail();
    const base = x => k * x * x * x + c2 * x * x + c1 * x;
    const C = -Math.round((base(p) + base(q)) / 2);
    const f = x => base(x) + C;
    if (Math.abs(f(p)) > 7 || Math.abs(f(q)) > 7) fail();
    return { k, p, q, c: [k, c2, c1, C], f };
  };
  add(6, 'point', [
    G(() => {
      const { k, p, q, c, f } = cubic(), mx = chance(0.5);
      const ans = (mx === (k > 0)) ? [p, f(p)] : [q, f(q)];
      return PA(`點出 $y=${poly(c)}$ 圖形上的極${mx ? '大' : '小'}點`, box([[p, f(p)], [q, f(q)]], 1.5), [], [{ fn: f }], ans,
        "解 $f'(x)=0$，再看 $f'$ 的正負變化：由正變負是極大、由負變正是極小",
        `$f'(x)=${poly(deriv(c))}=${k < 0 ? '-' : ''}3(${xm(p)})(${xm(q)})$，極${mx ? '大' : '小'}點 $(${ans[0]},${ans[1]})$`);
    }),
    G(() => {
      const h = ri(-3, 3), kk = ri(-3, 3), a = pick([1, -1]), m = pick([-3, 0, 3]);
      const f = x => a * Math.pow(x - h, 3) + m * (x - h) + kk;
      const c = [a, -3 * a * h, 3 * a * h * h + m, -a * h * h * h - m * h + kk];
      return PA(`點出 $y=${poly(c)}$ 圖形的反曲點`, box([[h, kk]], 2), [], [{ fn: f }], [h, kk],
        "反曲點：$f''(x)=0$ 且 $f''$ 的正負改變；三次函數 $ax^{3}+bx^{2}+\\cdots$ 的反曲點 $x=-\\frac{b}{3a}$", `$x=${h}$、$y=f(${h})=${kk}$`);
    })
  ]);
  add(6, 'order', [
    G(() => {
      const { c, f } = cubic(), xs = sample([-4, -3, -2, -1, 0, 1, 2, 3], 4);
      return O(`已知 $f(x)=${poly(c)}$，把下列的值由小到大排好`, spread(xs.map(x => [`f(${x})`, f(x)]), 0.5), '直接代入計算，或先找出遞增、遞減的區間', '');
    })
  ]);
  add(6, 'tiles', [
    T("用導函數判斷遞增、遞減", "f'(x)>0\\Rightarrow f(x)\\ \\text{遞}@,\\quad f'(x)<0\\Rightarrow f(x)\\ \\text{遞}@", ['\\text{增}', '\\text{減}'], ['\\text{等}'],
      '切線斜率為正，圖形往上', "$f'>0$ 遞增、$f'<0$ 遞減"),
    T("二階導數判別法", "f'(a)=0,\\ f''(a)<0\\Rightarrow f(a)\\ \\text{為極}@\\text{值；}\\ f''(a)>0\\Rightarrow\\text{極}@\\text{值}", ['\\text{大}', '\\text{小}'], ['\\text{零}'],
      '$f\'\'<0$ 圖形凹口向下', "$f''(a)<0$ 極大、$f''(a)>0$ 極小")
  ]);

  /* ================= 單元 7 積分的概念與性質 ================= */
  const intVal = (c, a, b) => { const n = c.length - 1; let s = 0; c.forEach((k, i) => { const p = n - i + 1; s += k * (Math.pow(b, p) - Math.pow(a, p)) / p; }); return s; };
  add(7, 'tiles', [
    T('微積分基本定理（$F\'=f$）', '\\int_{a}^{b}f(x)\\,dx=@-@', ['F(b)', 'F(a)'], ['F(a)+F(b)', 'f(b)', 'f(a)'], '上限代入減下限代入', '$\\int_a^b f(x)dx=F(b)-F(a)$'),
    T('完成積分公式', '\\int_{a}^{b}x^{n}\\,dx=\\Big[@\\Big]_{a}^{b}', ['\\dfrac{x^{n+1}}{n+1}'], ['nx^{n-1}', '\\dfrac{x^{n}}{n}', 'x^{n+1}'], '次方加 1，再除以新的次方', '$\\int x^{n}dx=\\frac{x^{n+1}}{n+1}+C$'),
    T('定積分的性質', '\\int_{a}^{b}[f(x)+g(x)]\\,dx=@+@', ['\\int_{a}^{b}f(x)\\,dx', '\\int_{a}^{b}g(x)\\,dx'], ['\\int_{b}^{a}f(x)\\,dx', 'f(b)-f(a)'],
      '和的積分等於積分的和', '$\\int_a^b(f+g)=\\int_a^b f+\\int_a^b g$', perm(['\\int_{a}^{b}f(x)\\,dx', '\\int_{a}^{b}g(x)\\,dx'], [[0, 1]])),
    G(() => {
      const n = ri(1, 4), k = ri(1, 6), sq = chance(0.5);
      const v = sq ? [k * n * n * n, 3] : [k * n * n, 2];
      return T('計算定積分', `\\int_{0}^{${n}}${k === 1 ? '' : k}x${sq ? '^{2}' : ''}\\,dx=@`, [fr(v[0], v[1])], [fr(v[0], v[1] + 1), fr(k * n, 1), fr(v[0] * 2, v[1]), fr(k * Math.pow(n, sq ? 2 : 1), 1)],
        '$\\int_0^n kx^{m}dx=\\frac{k\\,n^{m+1}}{m+1}$', `$\\left[\\frac{${k}x^{${sq ? 3 : 2}}}{${sq ? 3 : 2}}\\right]_0^{${n}}=${fr(v[0], v[1], false)}$`);
    })
  ]);
  add(7, 'order', [
    G(() => {
      const it = [];
      for (let q = 0; q < 4; q++) {
        const a = ri(-2, 1), b = a + ri(1, 3), c = [ri(-2, 2), ri(-3, 3), ri(-4, 4)];
        it.push([`\\int_{${a}}^{${b}}(${poly(c)})\\,dx`, intVal(c, a, b)]);
      }
      return O('依定積分的值由小到大排好', spread(it, 0.2), '先找反導函數，再算 $F(b)-F(a)$', '');
    })
  ]);

  /* ================= 單元 8 積分的應用 ================= */
  const AREA = [['x', 'x^{2}', 0, 1, 1, 6], ['2x', 'x^{2}', 0, 2, 4, 3], ['x+2', 'x^{2}', -1, 2, 9, 2], ['4', 'x^{2}', -2, 2, 32, 3], ['x', 'x^{3}', 0, 1, 1, 4], ['1', 'x^{2}', -1, 1, 4, 3], ['3x', 'x^{2}', 0, 3, 9, 2]];
  add(8, 'tiles', [
    G(() => {
      const [u, l, a, b, n, d] = pick(AREA);
      return T(`寫出 $y=${u}$ 與 $y=${l}$ 所圍區域的面積（兩圖形交於 $x=${a}$、$x=${b}$）`, `A=\\int_{${a}}^{${b}}(@-@)\\,dx=@`, [u, l, fr(n, d)], [fr(n, d + 1), fr(d, n), 'x^{3}', '2x^{2}'],
        '上面的函數減下面的函數，再積分', `在 $${a}<x<${b}$ 時 $${u}\\ge ${l}$，$A=${fr(n, d, false)}$`);
    })
  ]);
  add(8, 'order', [
    G(() => {
      const it = [];
      for (let q = 0; q < 4; q++) { const k = ri(1, 4), n = ri(1, 3); it.push([`y=${k === 1 ? '' : k}x^{2},\\ 0\\le x\\le${n}`, k * n * n * n / 3, apF(k * n * n * n, 3)]); }
      return O('依「圖形與 $x$ 軸之間的面積」由小到大排好', spread(it, 0.1), '面積 $=\\int_0^n kx^{2}dx=\\frac{kn^{3}}{3}$', '');
    })
  ]);
})(window.LG);
