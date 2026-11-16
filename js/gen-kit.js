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
  K.$ = s => `$${s}$`;
  K.GIVEN = '已知 $\\log 2\\approx0.3010$，$\\log 3\\approx0.4771$';

  LG.genKit = K;
})(window.LG);
