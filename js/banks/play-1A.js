/* 一上（數學 1A）新玩法題目：排序輸送帶（order）、座標尋寶（point）、公式拼圖（tiles）
   大多是隨機題型（G）：每次出題重新抽數字。切切樂直接用各單元的配對題，不在這裡。
   格式見 js/gen-kit.js 的 K.O、K.P、K.P1、K.T。 */
'use strict';
(function (LG) {
  const { add } = LG.bank.forBook('1A');
  const G = LG.bank.gen;
  const K = LG.genKit;
  const { ri, nz, pick, sample, chance, fail, gcd, fr, par, poly, term, xm, sqrtTex, O, P, P1, T, perm } = K;
  const sg = n => (n < 0 ? String(n) : '+' + n);                         // 帶正負號的拼圖塊：+3、-2
  const fac = (a, v) => (a ? `(${xm(a, v)})` : (v || 'x'));   // (x-a)；a = 0 時只寫 x（不加括號）
  const PA = (prompt, win, shapes, after, ans, hint, explain) => Object.assign(P(prompt, win, shapes, ans, hint, explain), { after });
  /* 排序題：任兩個值至少差 d（太接近的話學生無法判斷） */
  const spread = (items, d) => {
    const v = items.map(i => i[1]).sort((a, b) => a - b);
    for (let i = 1; i < v.length; i++) if (v[i] - v[i - 1] < d) fail();
    if (new Set(items.map(i => i[0])).size < items.length) fail();
    return items;
  };
  /* 座標尋寶的視窗：包含所有點與原點，四周留 2 格，至少 9 格寬 */
  const box = (pts, m) => {
    m = m == null ? 2 : m;
    const xs = pts.map(p => p[0]).concat([0]), ys = pts.map(p => p[1]).concat([0]);
    const x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m, y0 = Math.min(...ys) - m, y1 = Math.max(...ys) + m;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = Math.max(4.5, (x1 - x0) / 2), hh = Math.max(4.5, (y1 - y0) / 2);
    return [cx - hw, cx + hw, cy - hh, cy + hh];
  };
  const lineTex = (a, b, c) => `${term(a, 'x', 1, true)}${term(b, 'y', 1, !a)}=${c}`;
  const desc = () => chance(0.3);
  const ORD = d => (d ? '由大到小' : '由小到大');

  /* ================= 單元 1 數與數線 ================= */
  add(1, 'order', [
    G(() => {
      let n; do { n = ri(2, 40); } while (Number.isInteger(Math.sqrt(n)));
      const q = ri(2, 9), p = ri(q + 1, 6 * q); if (gcd(p, q) !== 1) fail();
      const a = ri(1, 6), b = ri(1, 8), d = ri(11, 69) / 10;
      const pool = [[`\\sqrt{${n}}`, Math.sqrt(n)], [fr(p, q), p / q], [`${a}.\\overline{${b}}`, a + b / 9], [String(d), d],
        pick([['\\pi', Math.PI], ['\\dfrac{\\pi}{2}', Math.PI / 2], ['2\\pi', 2 * Math.PI]])];
      const ds = desc();
      return O(`把這些數${ORD(ds)}排好`, spread(sample(pool, 4), 0.06), '先估計大小：$\\sqrt{n}$ 夾在哪兩個整數之間？$a.\\overline{b}=a+\\frac{b}{9}$，$\\pi\\approx3.14$', '', ds);
    }),
    G(() => {
      const pool = [];
      for (let k = 0; k < 6; k++) { const v = ri(-9, 9) / pick([1, 2, 3, 4]); pool.push([fr(Math.round(v * 12), 12), v]); }
      const x = ri(-6, 6); pool.push([`|${x}|`, Math.abs(x)], [`-|${x}|`, -Math.abs(x)]);
      return O('把這些數由小到大排好（數線上越右邊越大）', spread(sample(pool, 4), 0.08), '負數越「負得多」越小；$|x|$ 一定不是負數', '');
    })
  ]);
  add(1, 'point', [
    G(() => {
      const a = ri(-8, 2), m = ri(1, 3), n = ri(1, 3), L = ri(1, 3) * (m + n), b = a + L, x = (n * a + m * b) / (m + n);
      if (m === n || b > 9 || !Number.isInteger(x)) fail();
      return P1(`數線上 $A(${a})$、$B(${b})$。點出 $\\overline{AB}$ 上的點 $P$，使 $\\overline{AP}:\\overline{PB}=${m}:${n}$`, -10, 10,
        [{ pt: [a, 0], label: 'A' }, { pt: [b, 0], label: 'B' }], x,
        '$P=\\dfrac{n\\cdot a+m\\cdot b}{m+n}$（$\\overline{AP}:\\overline{PB}=m:n$）', `$\\dfrac{${n}\\times${par(a)}+${m}\\times${par(b)}}{${m + n}}=${x}$`);
    }),
    G(() => {
      const a = ri(-4, 4), d = ri(2, 5), big = chance(0.5), x = big ? a + d : a - d;
      return P1(`點出方程式 $|${xm(a)}|=${d}$ ${big ? '較大' : '較小'}的那個根`, -10, 10, [], x,
        `$|x-a|=d$：和 $a$ 的距離是 $d$`, `$x=${a}\\pm${d}$，${big ? '較大' : '較小'}的根是 $${x}$`);
    })
  ]);
  add(1, 'tiles', [
    G(() => {
      const a = ri(-5, 5), r = ri(1, 6), L = a - r, R = a + r;
      return T(`填入數字，寫出不等式 $|${xm(a)}|<${r}$ 的解`, '@<x<@', [String(L), String(R)], [String(-a - r), String(r - a), String(a), String(-r), String(r)],
        '$|x-a|<r$：和 $a$ 的距離小於 $r$', `$${a}-${r}<x<${a}+${r}$，即 $${L}<x<${R}$`);
    }),
    G(() => {
      const a = ri(0, 9), b = ri(1, 9); if (a === b) fail();
      const n = 10 * a + b;
      return T('把循環小數化成最簡分數', `0.\\overline{${a}${b}}=@`, [fr(n, 99)], [fr(n, 90), fr(n, 100), fr(n, 9), fr(a, 9), fr(n, 999)],
        '$0.\\overline{ab}=\\frac{ab}{99}$', `$0.\\overline{${a}${b}}=\\frac{${n}}{99}=${fr(n, 99, false)}$`);
    })
  ]);

  /* ================= 單元 2 式的運算 ================= */
  add(2, 'order', [
    G(() => {
      const ns = [2, 3, 5, 6, 7], pool = [];
      for (let k = 0; k < 2; k++) { const a = ri(2, 4), b = pick(ns); pool.push([`${a}\\sqrt{${b}}`, a * Math.sqrt(b)]); }
      let n; do { n = ri(8, 40); } while (Number.isInteger(Math.sqrt(n))); pool.push([`\\sqrt{${n}}`, Math.sqrt(n)]);
      const c = ri(1, 3), d = pick(ns); pool.push([`${c}+\\sqrt{${d}}`, c + Math.sqrt(d)]);
      const p = pick([2, 3, 5]), q = pick([5, 6, 7]); if (p !== q) pool.push([`\\sqrt{${p}}+\\sqrt{${q}}`, Math.sqrt(p) + Math.sqrt(q)]);
      return O('把這些數由小到大排好', spread(sample(pool, 4), 0.05), '平方後再比：$a\\sqrt{b}=\\sqrt{a^{2}b}$，例如 $2\\sqrt3=\\sqrt{12}$', '');
    })
  ]);
  add(2, 'tiles', [
    T('完成乘法公式', '(a+b)^{2}=@+@+@', ['a^{2}', '2ab', 'b^{2}'], ['ab', 'a^{2}b^{2}', '2a^{2}'], '把 $(a+b)(a+b)$ 展開', '$(a+b)^{2}=a^{2}+2ab+b^{2}$', perm(['a^{2}', '2ab', 'b^{2}'], [[0, 1, 2]])),
    T('完成乘法公式', '(a-b)^{2}=@-@+@', ['a^{2}', '2ab', 'b^{2}'], ['ab', '-b^{2}', '2a^{2}'], '把 $(a-b)(a-b)$ 展開', '$(a-b)^{2}=a^{2}-2ab+b^{2}$', perm(['a^{2}', '2ab', 'b^{2}'], [[0, 2]])),
    T('完成乘法公式', '(a+b)(a-b)=@-@', ['a^{2}', 'b^{2}'], ['2ab', 'ab', '(a-b)^{2}'], '平方差公式', '$(a+b)(a-b)=a^{2}-b^{2}$'),
    T('完成乘法公式', '(a+b)^{3}=a^{3}+@+@+b^{3}', ['3a^{2}b', '3ab^{2}'], ['3ab', 'a^{2}b', '6ab', 'ab^{2}'], '係數是 $1,3,3,1$', '$(a+b)^{3}=a^{3}+3a^{2}b+3ab^{2}+b^{3}$', perm(['3a^{2}b', '3ab^{2}'], [[0, 1]])),
    T('完成立方和公式', 'a^{3}+b^{3}=(a+b)(@-@+@)', ['a^{2}', 'ab', 'b^{2}'], ['2ab', 'a^{3}', '-ab'], '$(a+b)(a^{2}-ab+b^{2})$ 展開後中間項消掉', '$a^{3}+b^{3}=(a+b)(a^{2}-ab+b^{2})$', perm(['a^{2}', 'ab', 'b^{2}'], [[0, 2]])),
    T('完成立方差公式', 'a^{3}-b^{3}=(a-b)(@+@+@)', ['a^{2}', 'ab', 'b^{2}'], ['2ab', '-ab', 'a^{3}'], '$(a-b)(a^{2}+ab+b^{2})$ 展開後中間項消掉', '$a^{3}-b^{3}=(a-b)(a^{2}+ab+b^{2})$', perm(['a^{2}', 'ab', 'b^{2}'], [[0, 1, 2]])),
    G(() => {
      const m = ri(2, 9), n = ri(1, m - 1), plus = chance(0.5);
      if (Number.isInteger(Math.sqrt(m * n))) fail();
      const A = sqrtTex(m), B = sqrtTex(n);
      return T('把雙重根號化簡（填入兩個數）', `\\sqrt{${m + n}${plus ? '+' : '-'}2\\sqrt{${m * n}}}=@${plus ? '+' : '-'}@`, [A, B], [sqrtTex(m + n), sqrtTex(m * n), sqrtTex(m + 1), sqrtTex(n + 1)],
        '找兩數 $a>b$：$a+b$ 等於外面的數、$ab$ 等於根號裡的數', `$${m}+${n}=${m + n}$、$${m}\\times${n}=${m * n}$，所以是 $${A}${plus ? '+' : '-'}${B}$`,
        plus ? perm([A, B], [[0, 1]]) : []);
    })
  ]);

  /* ================= 單元 3 指數 ================= */
  add(3, 'order', [
    G(() => {
      const ks = sample([-6, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8, 9, 10], 4);
      const forms = [k => `2^{${fr(k, 2, false)}}`, k => `4^{${fr(k, 4, false)}}`, k => `8^{${fr(k, 6, false)}}`, k => `\\left(\\dfrac12\\right)^{${fr(-k, 2, false)}}`, k => `\\sqrt{2}^{\\,${k}}`];
      const fs = sample(forms, 4);
      const it = ks.map((k, i) => [fs[i](k), k / 2, `=2^{${fr(k, 2, false)}}`]);
      const ds = desc();
      return O(`把這些數${ORD(ds)}排好`, it, '全部化成以 $2$ 為底：$4=2^{2}$、$8=2^{3}$、$\\frac12=2^{-1}$、$\\sqrt2=2^{\\frac12}$；底數大於 1 時，指數越大數越大', '', ds);
    })
  ]);
  add(3, 'tiles', [
    T('完成指數律', 'a^{m}\\cdot a^{n}=@,\\quad (a^{m})^{n}=@,\\quad (ab)^{n}=@', ['a^{m+n}', 'a^{mn}', 'a^{n}b^{n}'], ['a^{m-n}', 'ab^{n}', 'a^{m^{n}}'],
      '同底數相乘，指數相加；次方的次方，指數相乘', '$a^{m}a^{n}=a^{m+n}$、$(a^{m})^{n}=a^{mn}$、$(ab)^{n}=a^{n}b^{n}$'),
    T('完成指數的定義', 'a^{0}=@,\\quad a^{-n}=@,\\quad \\sqrt[n]{a^{m}}=@', ['1', '\\dfrac{1}{a^{n}}', 'a^{\\frac{m}{n}}'], ['0', '-a^{n}', 'a^{\\frac{n}{m}}'],
      '$a^{-n}$ 是倒數；根號的次數放在分母', '$a^{0}=1$、$a^{-n}=\\frac{1}{a^{n}}$、$\\sqrt[n]{a^{m}}=a^{\\frac{m}{n}}$（$a>0$）'),
    G(() => {
      const a = ri(2, 5), b = ri(2, 4), base = pick([2, 3]); if (a + b === a * b) fail();
      return T('化成同一個底數', `${base}^{${a}}\\times${base}^{${b}}=@,\\quad (${base}^{${a}})^{${b}}=@`, [`${base}^{${a + b}}`, `${base}^{${a * b}}`],
        [`${base * base}^{${a + b}}`, `${base}^{${a - b}}`, `${base * base}^{${a * b}}`, `${base}^{${a + b + 1}}`],
        '相乘指數相加；次方的次方指數相乘', `$${base}^{${a}+${b}}=${base}^{${a + b}}$、$${base}^{${a}\\times${b}}=${base}^{${a * b}}$`);
    })
  ]);

  /* ================= 單元 4 常用對數 ================= */
  add(4, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) { const m = ri(11, 98) / 10, e = ri(-4, 7); it.push([`${m}\\times10^{${e}}`, Math.log10(m) + e, '']); }
      return O('把這些數由小到大排好', spread(it, 0.02), '先比 $10$ 的次方，次方一樣再比前面的數', '');
    }),
    G(() => {
      const ns = sample([2, 3, 5, 7, 20, 30, 50, 0.2, 0.5, 300, 4000], 3);
      const it = ns.map(n => [`\\log ${n}`, Math.log10(n)]);
      const d = pick([0.5, 1.5, 2.5, -0.5]); it.push([String(d), d]);
      return O('把這些數由小到大排好', spread(it, 0.04), '$\\log 2\\approx0.301$、$\\log 3\\approx0.477$；$\\log(a\\times10^{n})=n+\\log a$', '');
    })
  ]);
  add(4, 'tiles', [
    G(() => {
      const m10 = ri(11, 99); if (m10 % 10 === 0) fail();
      const e = nz(-6, 7), m = m10 / 10;
      let s;
      if (e - 1 >= 0) s = String(m10) + '0'.repeat(e - 1);
      else s = '0.' + '0'.repeat(-e - 1) + String(m10);
      if (s.length > 10) fail();
      return T('寫成科學記號', `${s}=@\\times@`, [String(m), `10^{${e}}`], [String(m10), `10^{${e - 1}}`, `10^{${e + 1}}`, `10^{${-e}}`],
        '科學記號 $a\\times10^{n}$，$1\\le a<10$', `$${s}=${m}\\times10^{${e}}$`);
    }),
    T('完成對數律', '\\log MN=@+@,\\quad \\log\\dfrac{M}{N}=@-@', ['\\log M', '\\log N', '\\log M', '\\log N'], ['\\log M\\cdot\\log N', '\\dfrac{\\log M}{\\log N}'],
      '相乘變相加、相除變相減', '$\\log MN=\\log M+\\log N$、$\\log\\frac{M}{N}=\\log M-\\log N$', perm(['\\log M', '\\log N', '\\log M', '\\log N'], [[0, 1]])),
    G(() => {
      const d = pick([2, 3, 5, 7]), k = nz(-4, 5), n = d * Math.pow(10, k);
      const s = k >= 0 ? String(n) : n.toFixed(-k);
      return T('利用 $\\log(a\\times10^{n})=n+\\log a$ 拆開', `\\log ${s}=@+@`, [String(k), `\\log ${d}`], [String(k + 1), String(-k), `\\log ${d * 10}`, `\\log ${d + 1}`],
        `$${s}=${d}\\times10^{${k}}$`, `$\\log ${s}=${k}+\\log ${d}$`, perm([String(k), `\\log ${d}`], [[0, 1]]));
    })
  ]);

  /* ================= 單元 5 多項式的運算與應用 ================= */
  add(5, 'tiles', [
    G(() => {
      const p = nz(-6, 6), q = nz(-6, 6); if (p === q || p === -q) fail();
      return T('因式分解', `${poly([1, -(p + q), p * q])}=(@)(@)`, [xm(p), xm(q)], [xm(-p), xm(-q), xm(p * q), xm(p + q)],
        `找兩數，相乘為 $${p * q}$、相加為 $${-(p + q)}$`, `$${fac(p)}${fac(q)}$`, perm([xm(p), xm(q)], [[0, 1]]));
    }),
    G(() => {
      const c = [ri(1, 2), ri(-4, 4), ri(-5, 5), ri(-6, 6)], a = nz(-3, 3), f = x => K.polyAt(c, x);
      const R = f(a);
      return T(`利用餘式定理：求 $f(x)=${poly(c)}$ 除以 $${xm(a)}$ 的餘式 $R$`, 'R=@', [String(R)], [String(f(-a)), String(f(0)), String(R + 2), String(-R), String(a)],
        `$f(x)$ 除以 $x-a$ 的餘式是 $f(a)$`, `$f(${a})=${R}$`);
    }),
    G(() => {
      const a = ri(1, 4), plus = chance(0.5), a3 = a * a * a;
      return T('利用立方和（差）公式因式分解', `x^{3}${plus ? '+' : '-'}${a3}=(@)(@)`, plus ? [K.xm(-a), poly([1, -a, a * a])] : [xm(a), poly([1, a, a * a])],
        plus ? [xm(a), poly([1, a, a * a]), poly([1, -a, -a * a])] : [K.xm(-a), poly([1, -a, a * a]), poly([1, a, -a * a])],
        `$${a3}=${a}^{3}$，套用 $a^{3}\\pm b^{3}=(a\\pm b)(a^{2}\\mp ab+b^{2})$`, plus ? `$(x+${a})(${poly([1, -a, a * a])})$` : `$(x-${a})(${poly([1, a, a * a])})$`);
    })
  ]);

  /* ================= 單元 6 簡單多項式函數及其圖形 ================= */
  const vtx = (a, h, k) => `${a === 1 ? '' : a === -1 ? '-' : a}${h ? `${fac(h)}^{2}` : 'x^{2}'}${k ? (k > 0 ? '+' + k : k) : ''}`;
  add(6, 'point', [
    G(() => {
      const a = pick([1, -1, 2, -2]), h = ri(-4, 4), k = ri(-5, 5), c = [a, -2 * a * h, a * h * h + k];
      const f = x => a * (x - h) * (x - h) + k;
      return PA(`點出二次函數 $y=${poly(c)}$ 圖形的頂點`, box([[h, k]]), [], [{ fn: f }], [h, k],
        '配方成 $y=a(x-h)^{2}+k$，頂點是 $(h,k)$', `$y=${vtx(a, h, k)}$，頂點 $(${h},${k})$`);
    }),
    G(() => {
      const a = pick([1, -1, 2]), h = ri(-3, 3), k = ri(-3, 3), p = nz(-3, 3), q = nz(-3, 3), H = h + p, Kk = k + q;
      return PA(`把 $y=${vtx(a, h, k)}$ 的圖形向${p > 0 ? '右' : '左'}平移 $${Math.abs(p)}$、向${q > 0 ? '上' : '下'}平移 $${Math.abs(q)}$，點出新圖形的頂點`,
        box([[h, k], [H, Kk]]), [{ fn: x => a * (x - h) * (x - h) + k, style: { dash: [8, 6], alpha: 0.6 } }], [{ fn: x => a * (x - H) * (x - H) + Kk }], [H, Kk],
        '頂點跟著一起移動：右加左減、上加下減', `$(${h}${sg(p)},${k}${sg(q)})=(${H},${Kk})$`);
    })
  ]);
  add(6, 'order', [
    G(() => {
      const a = pick([1, 2, -1]), h = ri(-2, 2), k = ri(-3, 3), f = x => a * (x - h) * (x - h) + k;
      const xs = sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5], 4).map(x => x);
      const ds = new Set(xs.map(x => Math.abs(x - h))); if (ds.size < 4) fail();
      return O(`已知 $f(x)=${vtx(a, h, k)}$，把下列的值由小到大排好`, xs.map(x => [`f(${x})`, f(x)]),
        `對稱軸 $x=${h}$；${a > 0 ? '開口向上，離對稱軸越遠值越大' : '開口向下，離對稱軸越遠值越小'}`, '');
    })
  ]);
  add(6, 'tiles', [
    G(() => {
      const b = 2 * nz(-5, 5), c = ri(-9, 9), k = c - b * b / 4; if (!k) fail();
      return T('配方', `${poly([1, b, c])}=(x@)^{2}@`, [sg(b / 2), sg(k)], [sg(-b / 2), sg(b), sg(c), sg(c + b * b / 4)],
        '一次項係數的一半，平方後補上再扣掉', `$(x${sg(b / 2)})^{2}-${b * b / 4}${sg(c)}=(x${sg(b / 2)})^{2}${sg(k)}$`);
    }),
    G(() => {
      const a = pick([1, -1, 2, -2, 3]), h = nz(-5, 5), k = nz(-5, 5);
      return T(`寫出 $y=${vtx(a, h, k)}$ 的頂點坐標`, '(h,k)=(@,@)', [String(h), String(k)], [String(-h), String(-k), String(a), String(h + k)],
        '$y=a(x-h)^{2}+k$ 的頂點是 $(h,k)$，注意 $x-h$ 的正負號', `頂點 $(${h},${k})$`);
    })
  ]);

  /* ================= 單元 7 多項式函數的圖形與多項式不等式 ================= */
  add(7, 'point', [
    G(() => {
      const p = ri(-3, 3), q = ri(-4, 4), s = pick([1, -1]); if (Math.abs(p - q) < 2) fail();
      const f = x => s * 0.5 * (x - p) * (x - p) * (x - q), touch = chance(0.5);
      return P(`圖形是 $y=${s < 0 ? '-' : ''}\\frac12${fac(p)}^{2}${fac(q)}$。點出圖形和 $x$ 軸${touch ? '相切' : '相交（穿過）'}的點`, box([[p, 0], [q, 0]]),
        [{ fn: f }], touch ? [p, 0] : [q, 0], '平方的因式（重根）在那裡和 $x$ 軸相切；一次的因式在那裡穿過 $x$ 軸',
        touch ? `$${fac(p)}^{2}$ 是二重因式，圖形在 $(${p},0)$ 和 $x$ 軸相切` : `$${fac(q)}$ 是一次因式，圖形在 $(${q},0)$ 穿過 $x$ 軸`);
    }),
    G(() => {
      const a = ri(-6, 2), b = a + ri(2, 7), big = chance(0.5), le = chance(0.5);
      const ans = le ? (big ? b : a) : (big ? b - 1 : a + 1);
      return P1(`不等式 $${fac(a)}${fac(b)}${le ? '\\le ' : '<'}0$ 的${big ? '最大' : '最小'}整數解是多少？點在數線上`, -10, 10, [], ans,
        '小於 0：解在兩根之間', `解是 $${a}${le ? '\\le ' : '<'}x${le ? '\\le ' : '<'}${b}$，${big ? '最大' : '最小'}整數解 $${ans}$`);
    })
  ]);
  add(7, 'tiles', [
    G(() => {
      const a = ri(-6, 4), b = a + ri(1, 6), lt = chance(0.5);
      const ex = [String(-a), String(-b), String(a - 1), String(b + 1), String(a * b)];
      return lt
        ? T(`填入數字，寫出不等式 $${fac(a)}${fac(b)}<0$ 的解`, '@<x<@', [String(a), String(b)], ex, '小於 0：解在兩根之間', `$${a}<x<${b}$`)
        : T(`填入數字，寫出不等式 $${fac(a)}${fac(b)}\\ge0$ 的解`, 'x\\le@\\ \\text{或}\\ x\\ge@', [String(a), String(b)], ex, '大於等於 0：解在兩根的外側（含兩根）', `$x\\le${a}$ 或 $x\\ge${b}$`);
    })
  ]);

  /* ================= 單元 8 直線方程式及其圖形 ================= */
  add(8, 'point', [
    G(() => {
      const x0 = ri(-5, 5), y0 = ri(-5, 5), a1 = ri(1, 3), b1 = nz(-3, 3), a2 = ri(1, 3), b2 = nz(-3, 3);
      if (a1 * b2 === a2 * b1) fail();
      const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
      return PA(`點出兩直線 $${lineTex(a1, b1, c1)}$ 與 $${lineTex(a2, b2, c2)}$ 的交點`, box([[x0, y0]]), [],
        [{ line: [a1, b1, c1] }, { line: [a2, b2, c2] }], [x0, y0], '解聯立方程式（加減消去法或代入消去法）', `$x=${x0}$、$y=${y0}$，交點 $(${x0},${y0})$`);
    }),
    G(() => {
      const xi = chance(0.5), a = nz(-4, 4), b = nz(-4, 4), t = nz(-5, 5), c = xi ? a * t : b * t;
      const ans = xi ? [t, 0] : [0, t];
      return PA(`點出直線 $${lineTex(a, b, c)}$ 的${xi ? ' $x$ ' : ' $y$ '}截距所在的點`, box([ans]), [], [{ line: [a, b, c] }], ans,
        xi ? '$x$ 截距：令 $y=0$' : '$y$ 截距：令 $x=0$', xi ? `令 $y=0$，$${a}x=${c}$，$x=${t}$` : `令 $x=0$，$${b}y=${c}$，$y=${t}$`);
    })
  ]);
  add(8, 'order', [
    G(() => {
      const it = [];
      for (let k = 0; k < 4; k++) { const a = ri(0, 4), b = nz(1, 4) * pick([1, -1]), c = ri(-6, 6); it.push([lineTex(a, b, c), -a / b, `m=${fr(-a, b, false)}`]); }
      return O('依斜率由小到大排好', spread(it, 0.05), '$ax+by=c$ 的斜率是 $-\\frac{a}{b}$', '');
    })
  ]);
  add(8, 'tiles', [
    G(() => {
      const m = nz(-4, 4), x0 = nz(-5, 5), y0 = nz(-5, 5);
      return T(`寫出過點 $(${x0},${y0})$、斜率 $${m}$ 的直線（點斜式）`, 'y=@(x@)@', [String(m), sg(-x0), sg(y0)], [String(-m), sg(x0), sg(-y0), sg(y0 + 1), String(m + 1)],
        '點斜式：$y=m(x-x_0)+y_0$', `$y=${m}(x${sg(-x0)})${sg(y0)}$`);
    }),
    T('完成兩點的斜率公式', 'm=@', ['\\dfrac{y_2-y_1}{x_2-x_1}'], ['\\dfrac{x_2-x_1}{y_2-y_1}', '\\dfrac{y_2+y_1}{x_2+x_1}', 'y_2x_2-y_1x_1'], '斜率 = $y$ 的變化量 ÷ $x$ 的變化量', '$m=\\frac{y_2-y_1}{x_2-x_1}$')
  ]);

  /* ================= 單元 9 直線方程式的應用 ================= */
  add(9, 'point', [
    G(() => {
      const kind = ri(0, 3), x0 = ri(-5, 5), y0 = ri(-5, 5), c = ri(-3, 3);
      let line, tex, Q;
      if (kind === 0) { line = [1, 0, c]; tex = `x=${c}`; Q = [2 * c - x0, y0]; }
      else if (kind === 1) { line = [0, 1, c]; tex = `y=${c}`; Q = [x0, 2 * c - y0]; }
      else if (kind === 2) { line = [-1, 1, c]; tex = c ? `y=x${sg(c)}` : 'y=x'; Q = [y0 - c, x0 + c]; }
      else { line = [1, 1, c]; tex = c ? `y=-x${sg(c)}` : 'y=-x'; Q = [c - y0, c - x0]; }
      if (Q[0] === x0 && Q[1] === y0) fail();
      if (Math.abs(Q[0]) > 7 || Math.abs(Q[1]) > 7) fail();
      return P(`點出 $P(${x0},${y0})$ 對直線 $L: ${tex}$ 的對稱點 $Q$`, box([[x0, y0], Q], 1.5), [{ line }, { pt: [x0, y0], label: 'P' }], Q,
        '對稱點：$\\overline{PQ}$ 和直線垂直，而且中點在直線上', `$Q(${Q[0]},${Q[1]})$`);
    }, '對稱')
  ]);
  add(9, 'order', [
    G(() => {
      const x0 = ri(-3, 3), y0 = ri(-3, 3), it = [];
      for (let k = 0; k < 4; k++) {
        const [a, b] = pick([[3, 4], [4, 3], [5, 12], [1, 1], [1, 2], [2, 1], [0, 1], [1, 0]]), c = ri(-12, 12);
        const d = Math.abs(a * x0 + b * y0 - c) / Math.hypot(a, b); it.push([lineTex(a, b, c), d]);
      }
      return O(`依「點 $P(${x0},${y0})$ 到直線的距離」由小到大排好`, spread(it, 0.06), '$d=\\dfrac{|ax_0+by_0-c|}{\\sqrt{a^{2}+b^{2}}}$', '');
    })
  ]);
  add(9, 'tiles', [
    T('完成點到直線的距離公式', 'd\\big(P(x_0,y_0),\\ ax+by+c=0\\big)=@', ['\\dfrac{|ax_0+by_0+c|}{\\sqrt{a^{2}+b^{2}}}'],
      ['\\dfrac{ax_0+by_0+c}{a^{2}+b^{2}}', '\\dfrac{|ax_0+by_0+c|}{a^{2}+b^{2}}', '\\sqrt{(x_0-a)^{2}+(y_0-b)^{2}}'], '分子有絕對值，分母是 $\\sqrt{a^{2}+b^{2}}$', '$d=\\frac{|ax_0+by_0+c|}{\\sqrt{a^{2}+b^{2}}}$'),
    G(() => {
      const [a, b, h] = pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10]]), c1 = ri(-15, 15), c2 = ri(-15, 15), D = Math.abs(c1 - c2);
      if (!D) fail();
      return T('求兩平行線的距離', `${lineTex(a, b, c1)},\\ ${lineTex(a, b, c2)}\\ \\Rightarrow\\ d=@`, [fr(D, h)], [fr(Math.abs(c1 + c2) || 1, h), fr(D, a + b), String(D), fr(D, h * h)],
        '平行線 $ax+by=c_1$、$ax+by=c_2$ 的距離 $=\\dfrac{|c_1-c_2|}{\\sqrt{a^{2}+b^{2}}}$', `$\\frac{|${c1}-${par(c2)}|}{${h}}=${fr(D, h, false)}$`);
    })
  ]);

  /* ================= 單元 10 圓與直線的關係 ================= */
  const circTex = (h, k, F) => `x^{2}+y^{2}${term(-2 * h, 'x', 1)}${term(-2 * k, 'y', 1)}${F ? (F > 0 ? '+' + F : F) : ''}=0`;
  add(10, 'point', [
    G(() => {
      const h = ri(-4, 4), k = ri(-4, 4), r = ri(1, 4), F = h * h + k * k - r * r;
      if (!h && !k) fail();
      return PA(`點出圓 $${circTex(h, k, F)}$ 的圓心`, box([[h + r, k + r], [h - r, k - r]], 1), [], [{ circle: [h, k, r] }], [h, k],
        '配方成 $(x-h)^{2}+(y-k)^{2}=r^{2}$，圓心 $(h,k)$', `$${fac(h)}^{2}+${fac(k, 'y')}^{2}=${r * r}$，圓心 $(${h},${k})$`);
    }),
    G(() => {
      const h = ri(-4, 4), k = ri(-4, 4), r = ri(1, 4), w = ri(0, 3);
      const nm = ['最高點', '最低點', '最右邊的點', '最左邊的點'][w], ans = [[h, k + r], [h, k - r], [h + r, k], [h - r, k]][w];
      return PA(`點出圓 $${fac(h)}^{2}+${fac(k, 'y')}^{2}=${r * r}$ 上的${nm}`, box([[h + r, k + r], [h - r, k - r]], 1), [], [{ circle: [h, k, r] }], ans,
        '從圓心往上下左右走一個半徑', `圓心 $(${h},${k})$、半徑 $${r}$，${nm}是 $(${ans[0]},${ans[1]})$`);
    })
  ]);
  add(10, 'order', [
    G(() => {
      const it = [];
      for (let q = 0; q < 4; q++) { const h = ri(-3, 3), k = ri(-3, 3), r2 = ri(2, 30), F = h * h + k * k - r2; it.push([circTex(h, k, F), Math.sqrt(r2), `r=${sqrtTex(r2)}`]); }
      return O('依圓的半徑由小到大排好', spread(it, 0.05), '配方：半徑 $r=\\sqrt{h^{2}+k^{2}-F}$', '');
    })
  ]);
  add(10, 'tiles', [
    G(() => {
      const h = nz(-5, 5), k = nz(-5, 5), r = ri(1, 6), F = h * h + k * k - r * r;
      return T('配方，寫成圓的標準式', `${circTex(h, k, F)}\\iff(x@)^{2}+(y@)^{2}=@`, [sg(-h), sg(-k), String(r * r)], [sg(h), sg(k), String(r), String(h * h + k * k)],
        '$x^{2}-2hx=(x-h)^{2}-h^{2}$', `$${fac(h)}^{2}+${fac(k, 'y')}^{2}=${r * r}$`);
    })
  ]);
})(window.LG);
