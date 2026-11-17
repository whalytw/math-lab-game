/* 數學實驗室 — 隨機題型工具（LG.genKit）
   給 js/banks/gen-*.js 的題型樣板用：隨機整數、約分、多項式排版、組四選一的選項等。
   樣板產生的題目若不合條件（例如答案不是 1～999 的整數、選項重複），題庫中樞會自動重抽。 */
'use strict';
(function (LG) {
  const K = {};
  /* ---------- 隨機 ---------- */
  K.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));            // a～b 的整數
  K.nz = (a, b) => { let x = 0; while (x === 0) x = K.ri(a, b); return x; }  // 不為 0 的整數
  K.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  K.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  K.sample = (arr, n) => K.shuffle(arr).slice(0, n);
  K.chance = p => Math.random() < p;
  K.fail = msg => { throw new Error(msg || 'retry'); };                    // 這組數字不好，重抽

  /* ---------- 數字排版 ---------- */
  K.gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  K.red = (n, d) => { if (d === 0) K.fail('分母為 0'); if (d < 0) { n = -n; d = -d; } const g = K.gcd(n, d); return [n / g, d / g]; };
  /* 分數 TeX：整數直接寫；big=false 用 \frac（小字） */
  K.fr = (n, d, big) => {
    const [a, b] = K.red(n, d === undefined ? 1 : d);
    if (b === 1) return String(a);
    const f = big === false ? '\\frac' : '\\dfrac';
    return (a < 0 ? '-' : '') + `${f}{${Math.abs(a)}}{${b}}`;
  };
  /* 配對題用的值字串：'3/2'、'-1/2'、'4' */
  K.frV = (n, d) => { const [a, b] = K.red(n, d === undefined ? 1 : d); return b === 1 ? String(a) : `${a}/${b}`; };
  K.par = x => (x < 0 ? `(${x})` : String(x));                              // 負數加括號
  /* 根號化簡：√n → [係數, 根號內] */
  K.sqrtParts = n => { let a = 1, b = n; for (let k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k; } return [a, b]; };
  K.sqrtTex = n => { const [a, b] = K.sqrtParts(n); return b === 1 ? String(a) : `${a === 1 ? '' : a}\\sqrt{${b}}`; };

  /* 單項：coef·v^p；first=true 時正號不寫 */
  K.term = (c, v, p, first) => {
    if (c === 0) return '';
    const sign = c < 0 ? '-' : first ? '' : '+';
    const a = Math.abs(c);
    const vv = !v || p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`;
    const coef = vv && a === 1 ? '' : String(a);
    return sign + coef + vv;
  };
  /* 多項式：coefs 由最高次排到常數項，例如 [1,-3,0,2] → x^{3}-3x^{2}+2 */
  K.poly = (coefs, v) => {
    v = v || 'x';
    const n = coefs.length - 1;
    let s = '';
    coefs.forEach((c, i) => { if (c !== 0) s += K.term(c, v, n - i, s === ''); });
    return s || '0';
  };
  K.polyAt = (coefs, x) => coefs.reduce((s, c) => s * x + c, 0);
  /* 一次式 ax+b 的 TeX（例如 (x-3)、(2x+1)） */
  K.lin = (a, b, v) => K.poly([a, b], v);
  /* x-a 的 TeX：a 為負時寫成 x+|a| */
  K.xm = (a, v) => K.poly([1, -a], v);

  /* 角度 → 弳度 TeX（例如 120 → \frac{2\pi}{3}） */
  K.rad = (deg, big) => {
    const [a, b] = K.red(deg, 180);
    const f = big === false ? '\\frac' : '\\dfrac';
    const num = a === 1 ? '\\pi' : a === -1 ? '-\\pi' : `${a}\\pi`;
    if (b === 1) return num;
    return (a < 0 ? '-' : '') + `${f}{${Math.abs(a) === 1 ? '' : Math.abs(a)}\\pi}{${b}}`;
  };

  /* 常用畢氏三元數 */
  K.TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29]];

  /* ---------- 題目格式（和題庫檔相同） ---------- */
  K.M = (tex, v, h, p) => ({ tex, v: String(v), h, p });
  K.N = (prompt, answer, unit, lens, sci, hint, explain, given) => ({ prompt, answer, unit: unit || '', prefix: '', lens, sci, given: given || '', hint, explain });
  /* 四選一：right 為正解，wrongs 為候選的錯誤選項（會去掉重複、和正解相同者，取前 3 個） */
  K.C = (prompt, right, wrongs, hint, explain) => {
    const w = [];
    for (const x of wrongs) { if (x !== right && !w.includes(x)) w.push(x); if (w.length === 3) break; }
    if (w.length < 3) K.fail('選項不足');
    return { prompt, opts: [right].concat(w), hint, explain };
  };
  /* ---------- 新玩法的題目格式 ---------- */
  /* 約略值：整數直接寫，其他取到小數第 2 位（給排序題答對後顯示） */
  K.ap = v => (Math.abs(v - Math.round(v)) < 1e-9 ? '=' + Math.round(v) : (+v.toFixed(Math.abs(v) < 0.1 ? 3 : 2)).toString());
  /* 排序：items = [[TeX, 數值], …]；desc = true 時由大到小。解說自動寫出正確順序 */
  K.O = (prompt, items, hint, extra, desc) => {
    if (items.length > 3) items = K.sample(items, 3);   // 每題 3 張卡（題型樣板可以多給幾個，隨機取 3 個）
    const it = items.map(([tex, v, ap]) => ({ tex, v, ap: ap == null ? K.ap(v) : ap }));
    const s = it.slice().sort((a, b) => (desc ? b.v - a.v : a.v - b.v)).map(a => a.tex.replace(/\\dfrac/g, '\\frac'));
    return { prompt, items: it, desc: !!desc, hint, explain: `$${s.join(desc ? '>' : '<')}$` + (extra ? '；' + extra : '') };
  };
  /* 座標尋寶：win = [xmin, xmax, ymin, ymax]（或物件）、shapes 為 graph2d 圖形、ans = [x, y] */
  K.P = (prompt, win, shapes, ans, hint, explain, ansTex) => {
    const w = Array.isArray(win) ? { xmin: win[0], xmax: win[1], ymin: win[2], ymax: win[3] } : win;
    return { prompt, win: w, shapes: shapes || [], ans, ansTex: ansTex || `(${ans[0]},${ans[1]})`, hint, explain };
  };
  /* 數線上的點（座標尋寶的一維版） */
  K.P1 = (prompt, x0, x1, shapes, ans, hint, explain) =>
    ({ prompt, win: { xmin: x0, xmax: x1, ymin: -0.9, ymax: 0.9 }, line1d: true, shapes: shapes || [], ans: [ans, 0], ansTex: String(ans), hint, explain });
  /* 公式拼圖：tpl 用 @ 表示空格（@ 不能放在大括號裡） */
  K.T = (prompt, tpl, ans, extra, hint, explain, alt) => ({ prompt, tpl, ans, extra: [...new Set(extra || [])].filter(x => !ans.includes(x)).slice(0, 4), alt: alt || [], hint, explain });
  /* 可交換的空格：groups 內的空格可以互換順序（例如 a²+2ab+b² 三項），回傳所有其他也正確的填法 */
  K.perm = (ans, groups) => {
    let out = [ans.slice()];
    const permsOf = a => (a.length <= 1 ? [a] : a.flatMap((x, i) => permsOf(a.slice(0, i).concat(a.slice(i + 1))).map(p => [x].concat(p))));
    for (const g of groups) {
      const next = [];
      for (const base of out) for (const p of permsOf(g)) { const b = base.slice(); g.forEach((slot, k) => { b[slot] = base[p[k]]; }); next.push(b); }
      out = next;
    }
    const key = a => a.join('0001');
    const seen = new Set([key(ans)]);
    return out.filter(a => { const k = key(a); if (seen.has(k)) return false; seen.add(k); return true; });
  };
  /* ---------- 第 2 批新玩法的題目格式 ---------- */
  /* 估算飛鏢：在數線 [lo, hi] 上估出 tex 的位置，誤差 ±tol 內算對 */
  K.E = (prompt, tex, v, lo, hi, tol, hint, explain) => ({ prompt, tex, v, lo, hi, tol, hint, explain: explain || `$${tex}\\approx${K.ap(v).replace('=', '')}$` });
  /* 數線塗色：pts 為由小到大的分界點（ptsTex 為標示文字，可省略）；segs[i] = 第 i 段（含兩端射線）是否塗色；dots[i] = 分界點是否包含 */
  K.S = (prompt, pts, segs, dots, hint, explain, ptsTex) => ({ prompt, pts, ptsTex: ptsTex || pts.map(String), segs, dots, hint, explain });
  /* 由不等式的「哪些區間成立」產生 segs、dots：sign(x) 回傳在 x 處是否成立 */
  K.Sfrom = (prompt, pts, test, hint, explain, ptsTex) => {
    const segs = [], dots = pts.map(p => !!test(p));
    for (let i = 0; i <= pts.length; i++) {
      const a = i === 0 ? pts[0] - 1 : pts[i - 1], b = i === pts.length ? pts[pts.length - 1] + 1 : pts[i];
      segs.push(!!test((a + b) / 2));
    }
    return K.S(prompt, pts, segs, dots, hint, explain, ptsTex);
  };
  /* 分類收納：bins = 籃子名稱；items = [[TeX, 籃子編號], …] */
  K.B = (prompt, bins, items, hint, explain) => ({ prompt, bins, items: items.map(([tex, b]) => ({ tex, b })), hint, explain });
  /* 找錯偵探：steps = 解題步驟（可含中文，數學式用 $…$）；bad = 錯的那一步；fix = 正確的寫法 */
  K.F = (prompt, steps, bad, fix, hint) => ({ prompt, steps, bad, fix, hint, explain: `第 ${bad + 1} 步錯了，應該是：${fix}` });
  /* 把一串正確的步驟其中一步換成錯誤版本（wrongs[i] 為第 i 步的錯誤寫法，沒有就 null） */
  K.Fpick = (prompt, steps, wrongs, hint) => {
    const cand = wrongs.map((w, i) => (w ? i : -1)).filter(i => i >= 0);
    const bad = K.pick(cand), s = steps.slice();
    s[bad] = wrongs[bad];
    return K.F(prompt, s, bad, steps[bad], hint);
  };
  /* 計算接力：steps = [[題目, 正解, 錯1, 錯2], …]（3 道鎖） */
  K.CH = (prompt, steps, hint, explain) => ({ prompt, steps: steps.map(([q, ...o]) => ({ q, opts: o.map(String) })), hint, explain });
  /* 投籃瞄準：start = 起點、hoop = 籃框；params 與參數調校相同；path(P) 回傳球的軌跡函數 y = f(x)，球從 start 的 x 飛到 hoop 的 x 之後 */
  K.SH = (prompt, win, start, hoop, params, ans, path, hint, explain) =>
    ({ prompt, win: Array.isArray(win) ? { xmin: win[0], xmax: win[1], ymin: win[2], ymax: win[3] } : win, start, hoop, params, ans, path, hint, explain });
  /* 圖形對對碰：items = [[方程式 TeX, 圖形陣列], …]（3 個） */
  K.GM = (prompt, win, items, hint, explain) =>
    ({ prompt, win: Array.isArray(win) ? { xmin: win[0], xmax: win[1], ymin: win[2], ymax: win[3] } : win, items: items.map(([tex, shapes]) => ({ tex, shapes })), hint, explain });
  /* 拖點作圖：handles = [[x, y, 標籤], …] 起始位置；draw(P) 依目前各點畫圖；check(P) 判斷是否正確；answer = 一組正解 */
  K.BD = (prompt, win, handles, draw, check, answer, hint, explain) =>
    ({ prompt, win: Array.isArray(win) ? { xmin: win[0], xmax: win[1], ymin: win[2], ymax: win[3] } : win, handles: handles.map(([x, y, label]) => ({ p: [x, y], label: label || '' })), draw, check, answer, hint, explain });
  K.$ = s => `$${s}$`;
  K.GIVEN = '已知 $\\log 2\\approx0.3010$，$\\log 3\\approx0.4771$';

  LG.genKit = K;
})(window.LG);
