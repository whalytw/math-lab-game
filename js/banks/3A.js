/* 數學 3A（龍騰）題庫
   單元 5～7 另有原本「指對數實驗室」的題庫，寫在 js/levels/ 各關卡檔案裡；這裡只補上它們的是非題。

   寫法（數學式用 $...$ 包起來，反斜線要寫兩個，例如 '$\\dfrac{\\pi}{6}$'）：
   T(敘述, 正確?, 理由)                                是非題（真偽閘門，每關抽 3 句）
   C(題目, [正解, 干擾1, 干擾2, 干擾3], 提示, 解說)     單選題（拆彈小組）／魔王題（骨牌魔王關）
   M(算式, 值, 提示)                                    配對題（電路接線，每關抽 3 組；值用 TeX，分數可寫 '1/2'）
   N(題目, 答案, 單位, 望遠鏡顯示, 揭曉算式, 提示, 解說)  數值題（巨數望遠鏡，答案為正整數）
   G({ prompt, win, opts: [正解圖, 干擾, 干擾], hint, explain })              圖形題（圖形偵探）
   K({ prompt, win, params, ans, plot, target?, hint, explain })            參數題（參數調校） */
'use strict';
(function (LG) {
  const add = LG.bank.add;
  const T = (s, a, e) => ({ s, a, e });
  const C = (prompt, opts, hint, explain) => ({ prompt, opts, hint, explain });
  const M = (tex, v, h, p) => ({ tex, v, h, p });
  const N = (prompt, answer, unit, lens, sci, hint, explain) => ({ prompt, answer, unit, prefix: '', lens, sci, given: '', hint, explain });
  const G = o => o;
  const K = o => o;
  const PI = Math.PI;
  const sin = Math.sin, cos = Math.cos;
  const TRIG = { xmin: -0.35, xmax: 2 * PI + 0.35, ymin: -1.7, ymax: 1.7, xPi: 6 };
  const V = s => `\\overrightarrow{${s}}`;
  const det = (a, b, c, d) => `\\begin{vmatrix}${a}&${b}\\\\${c}&${d}\\end{vmatrix}`;

  /* ================= 單元 1　弧度量 ================= */
  add(1, 'tf', [
    T('1 弳是「弧長等於半徑」時所對的圓心角，大小與半徑無關', true, '1 弳的定義與半徑大小無關'),
    T('$1$ 弳 $=1^{\\circ}$', false, '$1$ 弳 $=\\left(\\frac{180}{\\pi}\\right)^{\\circ}\\approx57.3^{\\circ}$'),
    T('扇形面積 $A=\\frac12r^{2}\\theta$ 中的 $\\theta$ 可以直接用「度」代入', false, '公式中的 $\\theta$ 必須以弳為單位'),
    T('$\\frac{2\\pi}{3}$ 與 $-\\frac{4\\pi}{3}$ 是同界角', true, '兩者相差 $2\\pi$'),
    T('$\\sin\\frac{\\pi}{6}=\\frac12$', true, '$\\frac{\\pi}{6}=30^{\\circ}$'),
    T('半圓所對的圓心角是 $\\pi$ 弳', true, '半圓弧長 $\\pi r$，所以圓心角 $\\frac{\\pi r}{r}=\\pi$'),
    T('半徑 $r$、圓心角 $\\theta$ 弳的扇形，弧長是 $r\\theta$', true, '$s=r\\theta$')
  ]);
  add(1, 'mc', [
    C('$150^{\\circ}$ 等於多少弳？', ['$\\dfrac{5\\pi}{6}$', '$\\dfrac{3\\pi}{4}$', '$\\dfrac{5\\pi}{3}$', '$\\dfrac{2\\pi}{3}$'],
      '$180^{\\circ}=\\pi$ 弳，所以 $1^{\\circ}=\\frac{\\pi}{180}$ 弳',
      '$150\\times\\frac{\\pi}{180}=\\frac{5\\pi}{6}$'),
    C('下列哪一個角度最接近 $3$ 弳？', ['$180^{\\circ}$', '$90^{\\circ}$', '$120^{\\circ}$', '$150^{\\circ}$'],
      '$1$ 弳 $\\approx57.3^{\\circ}$',
      '$3\\times57.3^{\\circ}\\approx171.9^{\\circ}$，最接近 $180^{\\circ}$'),
    C('下列何者與 $\\dfrac{\\pi}{3}$ 是同界角？', ['$\\dfrac{7\\pi}{3}$', '$\\dfrac{2\\pi}{3}$', '$-\\dfrac{\\pi}{3}$', '$\\dfrac{4\\pi}{3}$'],
      '同界角彼此相差 $2\\pi$ 的整數倍',
      '$\\frac{7\\pi}{3}-\\frac{\\pi}{3}=2\\pi$'),
    C('$\\sin\\dfrac{5\\pi}{6}=$？', ['$\\dfrac12$', '$-\\dfrac12$', '$\\dfrac{\\sqrt3}{2}$', '$-\\dfrac{\\sqrt3}{2}$'],
      '$\\frac{5\\pi}{6}=150^{\\circ}$，是第二象限角',
      '$\\sin150^{\\circ}=\\sin30^{\\circ}=\\frac12$'),
    C('$\\dfrac{3\\pi}{4}$ 弳等於多少度？', ['$135^{\\circ}$', '$120^{\\circ}$', '$145^{\\circ}$', '$270^{\\circ}$'],
      '$\\pi$ 弳 $=180^{\\circ}$',
      '$\\frac34\\times180^{\\circ}=135^{\\circ}$')
  ]);
  add(1, 'match', [
    M('30^{\\circ}', '\\frac{\\pi}{6}', '$180^{\\circ}=\\pi$ 弳', '它的弳度'),
    M('45^{\\circ}', '\\frac{\\pi}{4}', '$180^{\\circ}=\\pi$ 弳', '它的弳度'),
    M('60^{\\circ}', '\\frac{\\pi}{3}', '$180^{\\circ}=\\pi$ 弳', '它的弳度'),
    M('120^{\\circ}', '\\frac{2\\pi}{3}', '$180^{\\circ}=\\pi$ 弳', '它的弳度'),
    M('135^{\\circ}', '\\frac{3\\pi}{4}', '$180^{\\circ}=\\pi$ 弳', '它的弳度'),
    M('270^{\\circ}', '\\frac{3\\pi}{2}', '$180^{\\circ}=\\pi$ 弳', '它的弳度')
  ]);
  add(1, 'num', [
    N('半徑 $4$、圓心角 $\\dfrac32$ 弳的扇形，面積是多少？', 12, '', 'A=\\frac12r^{2}\\theta', 'A=\\frac12\\times4^{2}\\times\\frac32=12',
      '扇形面積 $A=\\frac12r^{2}\\theta$', '$\\frac12\\times16\\times\\frac32=12$'),
    N('半徑 $5$、弧長 $10$ 的扇形，圓心角是多少弳？', 2, '弳', 's=r\\theta', '\\theta=\\frac{s}{r}=\\frac{10}{5}=2',
      '弧長 $s=r\\theta$', '$\\theta=\\frac{10}{5}=2$ 弳'),
    N('扇形周長 $20$、半徑 $5$，面積是多少？', 25, '', 's+2r=20', 's=10,\\ A=\\frac12rs=25',
      '周長＝弧長＋兩個半徑；面積也可寫成 $A=\\frac12rs$', '弧長 $s=20-10=10$，$A=\\frac12\\times5\\times10=25$'),
    N('半徑 $3$、圓心角 $2$ 弳的扇形，周長是多少？', 12, '', 's=r\\theta', 's=6,\\ 6+3+3=12',
      '周長＝弧長＋兩個半徑', '弧長 $3\\times2=6$，周長 $6+3+3=12$')
  ]);
  add(1, 'boss', [
    C('地球半徑約 $6400$ 公里，$A$、$B$ 兩地對地心的圓心角為 $\\dfrac{1}{16}$ 弳，$A$、$B$ 間的弧長約多少？', ['$400$ 公里', '$100$ 公里', '$1600$ 公里', '$6400$ 公里'],
      '弧長 $s=r\\theta$', '$6400\\times\\frac{1}{16}=400$ 公里'),
    C('半徑 $2$ 的三個圓兩兩外切，三圓之間圍出的區域面積是多少？', ['$4\\sqrt3-2\\pi$', '$4\\sqrt3-\\pi$', '$8\\sqrt3-2\\pi$', '$2\\sqrt3-\\pi$'],
      '三個圓心連成邊長 $4$ 的正三角形，扣掉三個圓心角 $\\frac{\\pi}{3}$ 的扇形',
      '$\\frac{\\sqrt3}{4}\\times4^{2}-3\\times\\frac12\\times2^{2}\\times\\frac{\\pi}{3}=4\\sqrt3-2\\pi$')
  ]);

  /* ================= 單元 2　三角函數的圖形 ================= */
  add(2, 'tf', [
    T('$y=\\sin x$ 的週期為 $2\\pi$', true, ''),
    T('$y=\\sin x$ 的圖形向左平移 $\\frac{\\pi}{2}$，會得到 $y=\\cos x$ 的圖形', true, '$\\sin\\left(x+\\frac{\\pi}{2}\\right)=\\cos x$'),
    T('$y=\\tan x$ 的週期為 $2\\pi$', false, '$y=\\tan x$ 的週期是 $\\pi$'),
    T('$y=\\sin 2x$ 的週期為 $4\\pi$', false, '週期是 $\\frac{2\\pi}{2}=\\pi$'),
    T('$y=3\\sin x$ 的最大值 $3$、最小值 $-3$', true, '$-1\\le\\sin x\\le1$'),
    T('$y=\\cos x$ 的圖形對稱於 $y$ 軸', true, '$\\cos(-x)=\\cos x$'),
    T('$y=\\tan x$ 在 $x=\\frac{\\pi}{2}$ 有定義', false, '$x=\\frac{\\pi}{2}$ 是漸近線，$\\tan x$ 沒有定義')
  ]);
  add(2, 'mc', [
    C('$y=2\\sin 3x+1$ 的週期是多少？', ['$\\dfrac{2\\pi}{3}$', '$3\\pi$', '$6\\pi$', '$\\dfrac{\\pi}{3}$'],
      '$y=a\\sin bx+c$ 的週期是 $\\frac{2\\pi}{|b|}$', '$\\frac{2\\pi}{3}$'),
    C('$y=-2\\cos x+3$ 的最小值是多少？', ['$1$', '$-2$', '$3$', '$5$'],
      '$-1\\le\\cos x\\le1$，注意係數是負的', '$\\cos x=1$ 時 $y=-2+3=1$ 最小'),
    C('$y=\\sin\\left(x-\\dfrac{\\pi}{3}\\right)$ 的圖形可由 $y=\\sin x$ 怎麼得到？', ['向右平移 $\\dfrac{\\pi}{3}$', '向左平移 $\\dfrac{\\pi}{3}$', '向上平移 $\\dfrac{\\pi}{3}$', '向下平移 $\\dfrac{\\pi}{3}$'],
      '$x$ 換成 $x-h$，圖形向右平移 $h$', '$x$ 換成 $x-\\frac{\\pi}{3}$：向右平移 $\\frac{\\pi}{3}$'),
    C('比較 $\\sin1$、$\\sin2$、$\\sin3$ 的大小（單位：弳）', ['$\\sin2>\\sin1>\\sin3$', '$\\sin3>\\sin2>\\sin1$', '$\\sin1>\\sin2>\\sin3$', '$\\sin2>\\sin3>\\sin1$'],
      '$\\sin x$ 在 $x=\\frac{\\pi}{2}\\approx1.57$ 最大，越靠近 $\\frac{\\pi}{2}$ 越大',
      '與 $1.57$ 的距離：$2$ 最近、$1$ 次之、$3$ 最遠')
  ]);
  add(2, 'match', [
    M('y=\\sin 2x', '\\pi', '$\\sin bx$、$\\cos bx$ 週期 $\\frac{2\\pi}{|b|}$；$\\tan bx$ 週期 $\\frac{\\pi}{|b|}$', '它的週期'),
    M('y=\\tan 2x', '\\frac{\\pi}{2}', '$\\sin bx$、$\\cos bx$ 週期 $\\frac{2\\pi}{|b|}$；$\\tan bx$ 週期 $\\frac{\\pi}{|b|}$', '它的週期'),
    M('y=\\cos 3x', '\\frac{2\\pi}{3}', '$\\sin bx$、$\\cos bx$ 週期 $\\frac{2\\pi}{|b|}$；$\\tan bx$ 週期 $\\frac{\\pi}{|b|}$', '它的週期'),
    M('y=\\sin\\frac{x}{2}', '4\\pi', '$\\sin bx$、$\\cos bx$ 週期 $\\frac{2\\pi}{|b|}$；$\\tan bx$ 週期 $\\frac{\\pi}{|b|}$', '它的週期'),
    M('y=\\cos x', '2\\pi', '$\\sin bx$、$\\cos bx$ 週期 $\\frac{2\\pi}{|b|}$；$\\tan bx$ 週期 $\\frac{\\pi}{|b|}$', '它的週期'),
    M('y=\\tan\\frac{x}{3}', '3\\pi', '$\\sin bx$、$\\cos bx$ 週期 $\\frac{2\\pi}{|b|}$；$\\tan bx$ 週期 $\\frac{\\pi}{|b|}$', '它的週期')
  ]);
  add(2, 'num', [
    N('在 $0\\le x<2\\pi$ 的範圍內，方程式 $\\sin x=\\dfrac12$ 有幾個解？', 2, '個', '\\sin x=\\frac12', 'x=\\frac{\\pi}{6},\\ \\frac{5\\pi}{6}',
      '畫出 $y=\\sin x$ 與 $y=\\frac12$，數交點', '$x=\\frac{\\pi}{6}$ 或 $\\frac{5\\pi}{6}$，共 2 個'),
    N('$y=3\\sin 2x-1$ 的最大值是多少？', 2, '', 'y=3\\sin 2x-1', '3\\times1-1=2',
      '$\\sin 2x$ 最大是 $1$', '$3\\times1-1=2$'),
    N('$y=4\\cos(\\pi x)$ 的週期是多少？', 2, '', 'y=4\\cos(\\pi x)', '\\frac{2\\pi}{\\pi}=2',
      '週期 $\\frac{2\\pi}{|b|}$，這裡 $b=\\pi$', '$\\frac{2\\pi}{\\pi}=2$')
  ]);
  add(2, 'graph', [
    G({ prompt: '哪一張是 $y=\\sin\\left(x-\\dfrac{\\pi}{3}\\right)$ 的圖形？', win: TRIG,
      opts: [[{ fn: x => sin(x - PI / 3) }], [{ fn: x => sin(x + PI / 3) }], [{ fn: x => -sin(x - PI / 3) }]],
      hint: '$x=\\frac{\\pi}{3}$ 時 $y=\\sin0=0$，而且接著往上', explain: '由 $y=\\sin x$ 向右平移 $\\frac{\\pi}{3}$，過 $\\left(\\frac{\\pi}{3},0\\right)$ 往上' }),
    G({ prompt: '哪一張是 $y=2\\sin x$ 的圖形？', win: Object.assign({}, TRIG, { ymin: -2.6, ymax: 2.6 }),
      opts: [[{ fn: x => 2 * sin(x) }], [{ fn: x => sin(2 * x) }], [{ fn: x => sin(x) + 1 }]],
      hint: '振幅變 2 倍，週期不變', explain: '最大值 2、最小值 −2，週期仍是 $2\\pi$' }),
    G({ prompt: '哪一張是 $y=\\cos 2x$ 的圖形？', win: Object.assign({}, TRIG, { ymin: -2.6, ymax: 2.6 }),
      opts: [[{ fn: x => cos(2 * x) }], [{ fn: x => cos(x / 2) }], [{ fn: x => 2 * cos(x) }]],
      hint: '週期是 $\\frac{2\\pi}{2}=\\pi$，且 $x=0$ 時 $y=1$', explain: '週期 $\\pi$：在 $0$～$2\\pi$ 之間有兩個完整波形' })
  ]);
  add(2, 'tune', [
    K({ prompt: '調整 $a$、$b$，讓 $y=a\\sin bx$ 和虛線圖形完全重合', win: Object.assign({}, TRIG, { ymin: -3.4, ymax: 3.4 }),
      params: [{ n: 'a', vals: [1, 2, 3] }, { n: 'b', vals: [0.5, 1, 2, 3], tex: ['\\frac12', '1', '2', '3'] }], ans: [1, 2],
      plot: P => [{ fn: x => P[0] * sin(P[1] * x) }],
      hint: '$a$ 決定最高點的高度（振幅），$b$ 決定週期 $\\frac{2\\pi}{b}$', explain: '虛線最大值 2、週期 $\\pi$，所以 $a=2$、$b=2$' }),
    K({ prompt: '虛線是把 $y=\\sin x$ 向右平移 $\\dfrac{\\pi}{3}$ 的圖形。調整 $c$，讓 $y=\\sin(x+c)$ 和它重合', win: TRIG,
      params: [{ n: 'c', vals: [-PI / 2, -PI / 3, -PI / 6, 0, PI / 6, PI / 3, PI / 2], tex: ['-\\frac{\\pi}{2}', '-\\frac{\\pi}{3}', '-\\frac{\\pi}{6}', '0', '\\frac{\\pi}{6}', '\\frac{\\pi}{3}', '\\frac{\\pi}{2}'] }], ans: [1],
      plot: P => [{ fn: x => sin(x + P[0]) }],
      hint: '向右平移 $h$：把 $x$ 換成 $x-h$', explain: '$y=\\sin\\left(x-\\frac{\\pi}{3}\\right)$，所以 $c=-\\frac{\\pi}{3}$' })
  ]);
  add(2, 'boss', [
    C('在 $0\\le x\\le\\pi$ 的範圍內，$y=3\\sin 2x$ 與直線 $y=1$ 有幾個交點？', ['$2$ 個', '$1$ 個', '$3$ 個', '$4$ 個'],
      '$0\\le x\\le\\pi$ 時，$y=3\\sin2x$ 剛好走完一個週期', '$\\sin 2x=\\frac13$，$2x\\in[0,2\\pi]$ 中有 2 個解'),
    C('$f(x)=a\\sin bx+c$（$a,b>0$）的最大值 $5$、最小值 $-1$、週期 $\\pi$，求 $a+b+c$', ['$7$', '$6$', '$8$', '$5$'],
      '$a=\\frac{\\text{最大}-\\text{最小}}{2}$，$c=\\frac{\\text{最大}+\\text{最小}}{2}$', '$a=3$、$c=2$、$\\frac{2\\pi}{b}=\\pi\\Rightarrow b=2$，$a+b+c=7$')
  ]);

  /* ================= 單元 3　三角的和差角公式 ================= */
  add(3, 'tf', [
    T('$\\sin(\\alpha+\\beta)=\\sin\\alpha+\\sin\\beta$ 對所有 $\\alpha,\\beta$ 都成立', false, '例如 $\\alpha=\\beta=\\frac{\\pi}{2}$：左邊 $0$，右邊 $2$'),
    T('$\\cos(\\alpha-\\beta)=\\cos\\alpha\\cos\\beta+\\sin\\alpha\\sin\\beta$', true, '餘弦的差角公式'),
    T('$\\sin2\\theta=2\\sin\\theta\\cos\\theta$', true, '二倍角公式'),
    T('$\\cos2\\theta=1-2\\sin^{2}\\theta$', true, '$\\cos2\\theta=\\cos^{2}\\theta-\\sin^{2}\\theta=1-2\\sin^{2}\\theta$'),
    T('可以用 $\\tan(45^{\\circ}+45^{\\circ})$ 的和角公式求出 $\\tan90^{\\circ}$', false, '分母 $1-\\tan45^{\\circ}\\tan45^{\\circ}=0$，$\\tan90^{\\circ}$ 沒有定義'),
    T('$\\sin^{2}\\frac{\\theta}{2}=\\frac{1-\\cos\\theta}{2}$', true, '半角公式')
  ]);
  add(3, 'mc', [
    C('$\\sin75^{\\circ}=$？', ['$\\dfrac{\\sqrt6+\\sqrt2}{4}$', '$\\dfrac{\\sqrt6-\\sqrt2}{4}$', '$\\dfrac{\\sqrt3+1}{2}$', '$\\dfrac{\\sqrt3}{2}+\\dfrac12$'],
      '$75^{\\circ}=45^{\\circ}+30^{\\circ}$', '$\\sin45^{\\circ}\\cos30^{\\circ}+\\cos45^{\\circ}\\sin30^{\\circ}=\\frac{\\sqrt6+\\sqrt2}{4}$'),
    C('$\\sin\\theta=\\dfrac35$，$\\theta$ 為第一象限角，$\\sin2\\theta=$？', ['$\\dfrac{24}{25}$', '$\\dfrac65$', '$\\dfrac{7}{25}$', '$\\dfrac{12}{25}$'],
      '先求 $\\cos\\theta$，再用 $\\sin2\\theta=2\\sin\\theta\\cos\\theta$', '$\\cos\\theta=\\frac45$，$2\\times\\frac35\\times\\frac45=\\frac{24}{25}$'),
    C('$\\cos^{2}15^{\\circ}-\\sin^{2}15^{\\circ}=$？', ['$\\dfrac{\\sqrt3}{2}$', '$\\dfrac12$', '$1$', '$\\dfrac{\\sqrt2}{2}$'],
      '$\\cos^{2}\\theta-\\sin^{2}\\theta=\\cos2\\theta$', '$\\cos30^{\\circ}=\\frac{\\sqrt3}{2}$'),
    C('$\\tan15^{\\circ}=$？', ['$2-\\sqrt3$', '$2+\\sqrt3$', '$\\sqrt3-1$', '$\\dfrac{\\sqrt3}{3}$'],
      '$15^{\\circ}=45^{\\circ}-30^{\\circ}$', '$\\frac{1-\\frac{1}{\\sqrt3}}{1+\\frac{1}{\\sqrt3}}=\\frac{\\sqrt3-1}{\\sqrt3+1}=2-\\sqrt3$'),
    C('$\\cos\\theta=\\dfrac{7}{25}$，$0<\\theta<\\dfrac{\\pi}{2}$，$\\sin\\dfrac{\\theta}{2}=$？', ['$\\dfrac35$', '$\\dfrac45$', '$\\dfrac{9}{25}$', '$\\dfrac{3}{25}$'],
      '半角公式 $\\sin^{2}\\frac{\\theta}{2}=\\frac{1-\\cos\\theta}{2}$', '$\\sin^{2}\\frac{\\theta}{2}=\\frac{1-\\frac{7}{25}}{2}=\\frac{9}{25}$，取正值 $\\frac35$')
  ]);
  add(3, 'match', [
    M('\\cos75^{\\circ}\\cos15^{\\circ}-\\sin75^{\\circ}\\sin15^{\\circ}', '0', '和角公式反著用：$\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta=\\cos(\\alpha+\\beta)$'),
    M('\\sin20^{\\circ}\\cos10^{\\circ}+\\cos20^{\\circ}\\sin10^{\\circ}', '1/2', '$\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta=\\sin(\\alpha+\\beta)$'),
    M('\\cos^{2}22.5^{\\circ}-\\sin^{2}22.5^{\\circ}', '\\frac{\\sqrt2}{2}', '$\\cos^{2}\\theta-\\sin^{2}\\theta=\\cos2\\theta$'),
    M('\\frac{\\tan20^{\\circ}+\\tan25^{\\circ}}{1-\\tan20^{\\circ}\\tan25^{\\circ}}', '1', '正切和角公式：$\\tan(\\alpha+\\beta)$'),
    M('2\\sin15^{\\circ}\\cos15^{\\circ}', '1/2', '$2\\sin\\theta\\cos\\theta=\\sin2\\theta$'),
    M('1-2\\sin^{2}15^{\\circ}', '\\frac{\\sqrt3}{2}', '$1-2\\sin^{2}\\theta=\\cos2\\theta$')
  ]);
  add(3, 'num', [
    N('$\\tan\\alpha=2$、$\\tan\\beta=3$，$\\alpha$、$\\beta$ 都是銳角，$\\alpha+\\beta$ 是幾度？', 135, '度', '\\tan(\\alpha+\\beta)', '\\frac{2+3}{1-2\\times3}=-1\\Rightarrow135^{\\circ}',
      '先算 $\\tan(\\alpha+\\beta)=\\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}$', '$\\tan(\\alpha+\\beta)=-1$，且 $0^{\\circ}<\\alpha+\\beta<180^{\\circ}$，所以 $135^{\\circ}$'),
    N('$8\\sin15^{\\circ}\\cos15^{\\circ}=$？', 2, '', '8\\sin15^{\\circ}\\cos15^{\\circ}', '4\\sin30^{\\circ}=2',
      '$2\\sin\\theta\\cos\\theta=\\sin2\\theta$', '$4\\times2\\sin15^{\\circ}\\cos15^{\\circ}=4\\sin30^{\\circ}=2$'),
    N('$\\sin\\theta+\\cos\\theta=\\dfrac75$，求 $25\\sin2\\theta$', 24, '', '(\\sin\\theta+\\cos\\theta)^{2}', '1+\\sin2\\theta=\\frac{49}{25}',
      '兩邊平方：$(\\sin\\theta+\\cos\\theta)^{2}=1+\\sin2\\theta$', '$\\sin2\\theta=\\frac{49}{25}-1=\\frac{24}{25}$，所以 $25\\sin2\\theta=24$')
  ]);
  add(3, 'boss', [
    C('$\\tan\\alpha=\\dfrac12$、$\\tan\\beta=\\dfrac13$，$\\alpha$、$\\beta$ 都是銳角，$\\alpha+\\beta=$？', ['$\\dfrac{\\pi}{4}$', '$\\dfrac{\\pi}{3}$', '$\\dfrac{\\pi}{6}$', '$\\dfrac{3\\pi}{4}$'],
      '算 $\\tan(\\alpha+\\beta)$', '$\\frac{\\frac12+\\frac13}{1-\\frac16}=1$，且 $0<\\alpha+\\beta<\\pi$，所以 $\\frac{\\pi}{4}$'),
    C('$\\sin\\theta-\\cos\\theta=\\dfrac12$，$\\sin2\\theta=$？', ['$\\dfrac34$', '$-\\dfrac34$', '$\\dfrac14$', '$\\dfrac12$'],
      '兩邊平方：$1-\\sin2\\theta=\\frac14$', '$\\sin2\\theta=1-\\frac14=\\frac34$')
  ]);

  /* ================= 單元 4　正餘弦的疊合 ================= */
  add(4, 'tf', [
    T('$\\sin x+\\cos x$ 的最大值為 $2$', false, '$\\sin x+\\cos x=\\sqrt2\\sin\\left(x+\\frac{\\pi}{4}\\right)$，最大值 $\\sqrt2$'),
    T('$a\\sin x+b\\cos x$ 可化為 $r\\sin(x+\\theta)$，其中 $r=\\sqrt{a^{2}+b^{2}}$', true, '疊合'),
    T('$\\sqrt3\\sin x+\\cos x=2\\sin\\left(x+\\frac{\\pi}{6}\\right)$', true, '$2\\left(\\sin x\\cdot\\frac{\\sqrt3}{2}+\\cos x\\cdot\\frac12\\right)$'),
    T('$3\\sin x+4\\cos x$ 的最小值為 $-7$', false, '最小值是 $-\\sqrt{3^{2}+4^{2}}=-5$'),
    T('$y=\\sin x+\\cos x$ 與 $y=\\sqrt2\\sin\\left(x+\\frac{\\pi}{4}\\right)$ 的圖形完全相同', true, '兩式恆等'),
    T('$y=3\\sin x+4\\cos x$ 的週期是 $2\\pi$', true, '疊合成 $5\\sin(x+\\theta)$，週期不變')
  ]);
  add(4, 'mc', [
    C('$\\sin x-\\sqrt3\\cos x=$？', ['$2\\sin\\left(x-\\dfrac{\\pi}{3}\\right)$', '$2\\sin\\left(x+\\dfrac{\\pi}{3}\\right)$', '$2\\sin\\left(x-\\dfrac{\\pi}{6}\\right)$', '$\\sqrt2\\sin\\left(x-\\dfrac{\\pi}{3}\\right)$'],
      '$r=\\sqrt{1+3}=2$，提出 2 後看 $\\cos\\theta=\\frac12$、$\\sin\\theta=-\\frac{\\sqrt3}{2}$', '$2\\left(\\sin x\\cdot\\frac12-\\cos x\\cdot\\frac{\\sqrt3}{2}\\right)=2\\sin\\left(x-\\frac{\\pi}{3}\\right)$'),
    C('$0\\le x\\le\\dfrac{\\pi}{2}$ 時，$\\sqrt3\\sin x+\\cos x$ 的最小值是多少？', ['$1$', '$-2$', '$0$', '$\\sqrt3$'],
      '化成 $2\\sin\\left(x+\\frac{\\pi}{6}\\right)$，看 $x+\\frac{\\pi}{6}$ 的範圍', '$x+\\frac{\\pi}{6}\\in\\left[\\frac{\\pi}{6},\\frac{2\\pi}{3}\\right]$，$\\sin$ 最小 $\\frac12$，所以最小值 $1$'),
    C('$y=3\\sin x+4\\cos x$ 的值域是？', ['$-5\\le y\\le5$', '$-7\\le y\\le7$', '$-1\\le y\\le7$', '$-4\\le y\\le3$'],
      '疊合後振幅 $r=\\sqrt{3^{2}+4^{2}}$', '$y=5\\sin(x+\\theta)$，所以 $-5\\le y\\le5$'),
    C('$0\\le x<2\\pi$ 時，$\\sqrt3\\sin x+\\cos x=1$ 的解為？', ['$x=0$ 或 $\\dfrac{2\\pi}{3}$', '$x=\\dfrac{\\pi}{6}$ 或 $\\dfrac{5\\pi}{6}$', '$x=\\dfrac{\\pi}{3}$', '$x=0$ 或 $\\pi$'],
      '化成 $2\\sin\\left(x+\\frac{\\pi}{6}\\right)=1$', '$x+\\frac{\\pi}{6}=\\frac{\\pi}{6}$ 或 $\\frac{5\\pi}{6}$，得 $x=0$ 或 $\\frac{2\\pi}{3}$')
  ]);
  add(4, 'match', [
    M('\\sin x+\\cos x', '\\sqrt2', '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', '它的最大值'),
    M('6\\sin x+8\\cos x', '10', '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', '它的最大值'),
    M('\\sqrt3\\sin x-\\cos x', '2', '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', '它的最大值'),
    M('2\\sin x+2\\sqrt3\\cos x', '4', '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', '它的最大值'),
    M('5\\sin x-12\\cos x', '13', '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$', '它的最大值'),
    M('3\\sin x+4\\cos x+1', '6', '$a\\sin x+b\\cos x$ 的最大值是 $\\sqrt{a^{2}+b^{2}}$，再加常數', '它的最大值')
  ]);
  add(4, 'num', [
    N('$y=5\\sin x+12\\cos x$ 的最大值是多少？', 13, '', 'y=5\\sin x+12\\cos x', '\\sqrt{5^{2}+12^{2}}=13',
      '最大值 $\\sqrt{a^{2}+b^{2}}$', '$\\sqrt{25+144}=13$'),
    N('$y=3\\sin x-4\\cos x+1$ 的最大值是多少？', 6, '', 'y=3\\sin x-4\\cos x+1', '5+1=6',
      '$3\\sin x-4\\cos x$ 的最大值是 $\\sqrt{9+16}$', '$5+1=6$'),
    N('$y=(\\sin x+\\cos x)^{2}$ 的最大值是多少？', 2, '', 'y=(\\sin x+\\cos x)^{2}', '1+\\sin2x\\le2',
      '展開：$(\\sin x+\\cos x)^{2}=1+\\sin2x$', '$\\sin2x=1$ 時最大，$1+1=2$')
  ]);
  const R4 = { n: 'r', vals: [1, Math.SQRT2, 2, 3], tex: ['1', '\\sqrt2', '2', '3'] };
  add(4, 'tune', [
    K({ prompt: '調整 $r$、$\\theta$，讓 $y=r\\sin(x+\\theta)$ 和虛線 $y=\\sin x+\\sqrt3\\cos x$ 重合', win: Object.assign({}, TRIG, { ymin: -3.3, ymax: 3.3 }),
      params: [R4, { n: '\\theta', vals: [PI / 6, PI / 4, PI / 3, PI / 2], tex: ['\\frac{\\pi}{6}', '\\frac{\\pi}{4}', '\\frac{\\pi}{3}', '\\frac{\\pi}{2}'] }], ans: [2, 2],
      plot: P => [{ fn: x => P[0] * sin(x + P[1]) }], target: [{ fn: x => sin(x) + Math.sqrt(3) * cos(x) }],
      hint: '$r=\\sqrt{a^{2}+b^{2}}$；$\\cos\\theta=\\frac{a}{r}$、$\\sin\\theta=\\frac{b}{r}$', explain: '$r=2$，$\\cos\\theta=\\frac12$、$\\sin\\theta=\\frac{\\sqrt3}{2}$，$\\theta=\\frac{\\pi}{3}$' }),
    K({ prompt: '調整 $r$、$\\theta$，讓 $y=r\\sin(x+\\theta)$ 和虛線 $y=\\sin x-\\cos x$ 重合', win: Object.assign({}, TRIG, { ymin: -3.3, ymax: 3.3 }),
      params: [R4, { n: '\\theta', vals: [-PI / 2, -PI / 4, 0, PI / 4, PI / 2], tex: ['-\\frac{\\pi}{2}', '-\\frac{\\pi}{4}', '0', '\\frac{\\pi}{4}', '\\frac{\\pi}{2}'] }], ans: [1, 1],
      plot: P => [{ fn: x => P[0] * sin(x + P[1]) }], target: [{ fn: x => sin(x) - cos(x) }],
      hint: '$r=\\sqrt{1^{2}+(-1)^{2}}$；$\\cos\\theta=\\frac{1}{r}$、$\\sin\\theta=\\frac{-1}{r}$', explain: '$r=\\sqrt2$、$\\theta=-\\frac{\\pi}{4}$' })
  ]);
  add(4, 'boss', [
    C('$0\\le x\\le\\pi$ 時，$f(x)=\\sin x+\\sqrt3\\cos x$ 的最小值是多少？', ['$-\\sqrt3$', '$-2$', '$1$', '$0$'],
      '化成 $2\\sin\\left(x+\\frac{\\pi}{3}\\right)$，看 $x+\\frac{\\pi}{3}$ 的範圍', '$x+\\frac{\\pi}{3}\\in\\left[\\frac{\\pi}{3},\\frac{4\\pi}{3}\\right]$，$\\sin$ 最小 $-\\frac{\\sqrt3}{2}$，最小值 $-\\sqrt3$')
  ]);

  /* ================= 單元 5～7：補上是非題 ================= */
  add(5, 'tf', [
    T('$y=2^{x}$ 的圖形必通過點 $(0,1)$', true, '$2^{0}=1$'),
    T('$y=\\left(\\frac12\\right)^{x}$ 是嚴格遞增函數', false, '底數 $0<\\frac12<1$，是嚴格遞減'),
    T('$y=2^{x}$ 與 $y=\\left(\\frac12\\right)^{x}$ 的圖形對稱於 $y$ 軸', true, '$\\left(\\frac12\\right)^{x}=2^{-x}$'),
    T('指數函數 $y=a^{x}$（$a>0$，$a\\ne1$）的值域是全體實數', false, '值域是正實數 $y>0$'),
    T('若 $0.3^{a}>0.3^{b}$，則 $a>b$', false, '底數小於 1 時遞減，應為 $a<b$'),
    T('$y=3^{x}$ 的圖形和 $x$ 軸沒有交點', true, '$3^{x}>0$ 恆成立')
  ]);
  add(6, 'tf', [
    T('$\\log_{2}8=3$', true, '$2^{3}=8$'),
    T('$\\log(a+b)=\\log a+\\log b$', false, '應為 $\\log ab=\\log a+\\log b$'),
    T('$\\log_{a}1=0$（$a>0$，$a\\ne1$）', true, '$a^{0}=1$'),
    T('$2^{10}$ 是 4 位數', true, '$2^{10}=1024$'),
    T('$\\log_{2}3\\times\\log_{3}4=2$', true, '換底後約分：$\\log_{2}4=2$'),
    T('$\\log_{2}(-4)=-2$', false, '真數必須大於 0，$\\log_{2}(-4)$ 沒有意義')
  ]);
  add(7, 'tf', [
    T('$y=\\log_{2}x$ 的圖形必通過點 $(1,0)$', true, '$\\log_{2}1=0$'),
    T('$y=\\log_{2}x$ 與 $y=2^{x}$ 的圖形對稱於直線 $y=x$', true, '兩者互為反函數'),
    T('$y=\\log_{\\frac12}x$ 是嚴格遞增函數', false, '底數小於 1，是嚴格遞減'),
    T('$y=\\log x$ 的定義域是全體實數', false, '定義域是 $x>0$'),
    T('若 $\\log_{2}x<3$，則 $x<8$', false, '還要真數為正：$0<x<8$'),
    T('$y=\\log_{2}x$ 與 $y=\\log_{\\frac12}x$ 的圖形對稱於 $x$ 軸', true, '$\\log_{\\frac12}x=-\\log_{2}x$')
  ]);

  /* ================= 單元 8　平面向量 ================= */
  add(8, 'tf', [
    T('兩向量長度相等，則兩向量相等', false, '還要方向相同'),
    T(`$${V('AB')}+${V('BC')}=${V('AC')}$`, true, '向量加法的三角形法'),
    T(`$${V('AB')}-${V('AC')}=${V('CB')}$`, true, `$${V('AB')}-${V('AC')}=${V('AB')}+${V('CA')}=${V('CB')}$`),
    T('若 $\\vec a=(3,4)$，則 $|\\vec a|=5$', true, '$\\sqrt{3^{2}+4^{2}}=5$'),
    T('零向量沒有方向，所以不能和其他向量相加', false, '$\\vec a+\\vec 0=\\vec a$，零向量可以相加'),
    T('若 $\\vec a=t\\vec b$（$t<0$，$\\vec b\\ne\\vec 0$），則 $\\vec a$ 與 $\\vec b$ 方向相反', true, '係數積為負時方向相反'),
    T(`$${V('AB')}=-${V('BA')}$`, true, '長度相同、方向相反')
  ]);
  add(8, 'mc', [
    C('$A(1,2)$、$B(4,6)$，$' + V('AB') + '=$？', ['$(3,4)$', '$(5,8)$', '$(-3,-4)$', '$(4,3)$'],
      '終點坐標減起點坐標', '$(4-1,\\ 6-2)=(3,4)$'),
    C('平行四邊形 $ABCD$ 中，$A(0,0)$、$B(3,1)$、$C(5,4)$，$D$ 點坐標為？', ['$(2,3)$', '$(8,5)$', '$(-2,-3)$', '$(3,2)$'],
      `$${V('AD')}=${V('BC')}$`, `$${V('BC')}=(2,3)$，所以 $D=A+(2,3)=(2,3)$`),
    C('$A(1,2)$、$B(7,5)$，$P$ 在線段 $AB$ 上且 $\\overline{AP}:\\overline{PB}=2:1$，$P$ 點坐標為？', ['$(5,4)$', '$(3,3)$', '$(4,3.5)$', '$(13,8)$'],
      '分點公式：$P=\\frac{1\\cdot A+2\\cdot B}{3}$', '$\\left(\\frac{1+14}{3},\\frac{2+10}{3}\\right)=(5,4)$'),
    C(`$G$ 為 $\\triangle ABC$ 的重心，$${V('AG')}=$？`, [`$\\dfrac13(${V('AB')}+${V('AC')})$`, `$\\dfrac12(${V('AB')}+${V('AC')})$`, `$\\dfrac23(${V('AB')}+${V('AC')})$`, `$${V('AB')}+${V('AC')}$`],
      `$${V('AG')}=\\frac23\\times$ 中線向量`, `中線向量 $\\frac12(${V('AB')}+${V('AC')})$，乘以 $\\frac23$ 得 $\\frac13(${V('AB')}+${V('AC')})$`)
  ]);
  const P8 = '與它相等的向量（$ABCD$ 為平行四邊形，$O$ 為對角線交點）';
  add(8, 'match', [
    M(`${V("AB")}+${V("AD")}`, V("AC"), '平行四邊形法：從同一點出發的兩邊相加是對角線', P8),
    M(`${V("AD")}-${V("AB")}`, V("BD"), '$\\overrightarrow{PQ}=\\overrightarrow{AQ}-\\overrightarrow{AP}$', P8),
    M(`\\frac12${V('AB')}+\\frac12${V('AD')}`, V('AO'), '$O$ 是對角線 $AC$ 的中點', P8),
    M(`${V("AB")}-${V("AD")}`, V("DB"), '$\\overrightarrow{PQ}=\\overrightarrow{AQ}-\\overrightarrow{AP}$', P8),
    M(`-${V("AB")}-${V("AD")}`, V("CA"), `$${V('CA')}=-${V('AC')}$`, P8),
    M(`\\frac12${V('AD')}-\\frac12${V('AB')}`, V('BO'), '$O$ 是對角線 $BD$ 的中點', P8)
  ]);
  add(8, 'num', [
    N('$\\vec a=(1,1)$、$\\vec b=(1,2)$，$|2\\vec a+\\vec b|=$？', 5, '', '|2\\vec a+\\vec b|', '2\\vec a+\\vec b=(3,4),\\ |(3,4)|=5',
      '先算 $2\\vec a+\\vec b$ 的坐標', '$(2+1,\\ 2+2)=(3,4)$，長度 $5$'),
    N('$A(1,1)$、$B(4,5)$，$|' + V('AB') + '|=$？', 5, '', '|' + V('AB') + '|', V('AB') + '=(3,4),\\ 5',
      '$' + V('AB') + '$ 的坐標是 $B-A$', '$(3,4)$，長度 $\\sqrt{9+16}=5$'),
    N('$(x,6)$ 與 $(2,3)$ 平行，$x=$？', 4, '', '(x,6)\\parallel(2,3)', '\\frac{x}{2}=\\frac{6}{3}\\Rightarrow x=4',
      '平行：坐標成比例', '$\\frac{x}{2}=\\frac63=2$，$x=4$')
  ]);
  const VWIN = { xmin: -2, xmax: 5, ymin: -1.5, ymax: 5.5, equal: true };
  const combo = (a, b) => P => {
    const p = [P[0] * a[0], P[0] * a[1]], q = [p[0] + P[1] * b[0], p[1] + P[1] * b[1]];
    return [
      { vec: [0, 0, p[0], p[1]], color: '#6fc3ff', label: P[0] + 'a', style: { width: 3 } },
      { vec: [p[0], p[1], q[0], q[1]], color: '#ffb547', label: P[1] + 'b', style: { width: 3 } },
      { vec: [0, 0, q[0], q[1]] }
    ];
  };
  add(8, 'tune', [
    K({ prompt: '調整 $x$、$y$，讓 $x\\vec a+y\\vec b$（白色箭頭）和虛線箭頭 $\\vec c=(3,1)$ 重合；$\\vec a=(1,1)$、$\\vec b=(1,-1)$', win: VWIN,
      params: [{ n: 'x', vals: [-1, 0, 1, 2, 3] }, { n: 'y', vals: [-1, 0, 1, 2, 3] }], ans: [3, 2],
      plot: combo([1, 1], [1, -1]), target: [{ vec: [0, 0, 3, 1] }],
      hint: '$x(1,1)+y(1,-1)=(x+y,\\ x-y)=(3,1)$', explain: '$x+y=3$、$x-y=1$，得 $x=2$、$y=1$' }),
    K({ prompt: '調整 $x$、$y$，讓 $x\\vec a+y\\vec b$（白色箭頭）和虛線箭頭 $\\vec c=(4,5)$ 重合；$\\vec a=(2,1)$、$\\vec b=(0,1)$', win: VWIN,
      params: [{ n: 'x', vals: [-1, 0, 1, 2, 3] }, { n: 'y', vals: [-1, 0, 1, 2, 3, 4] }], ans: [3, 4],
      plot: combo([2, 1], [0, 1]), target: [{ vec: [0, 0, 4, 5] }],
      hint: '$x(2,1)+y(0,1)=(2x,\\ x+y)=(4,5)$', explain: '$2x=4$ 得 $x=2$，$x+y=5$ 得 $y=3$' })
  ]);
  add(8, 'boss', [
    C('$A(0,0)$、$B(6,0)$、$C(0,6)$，$\\triangle ABC$ 的重心 $G$ 坐標為？', ['$(2,2)$', '$(3,3)$', '$(2,3)$', '$(6,6)$'],
      '重心坐標是三頂點坐標的平均', '$\\left(\\frac{0+6+0}{3},\\frac{0+0+6}{3}\\right)=(2,2)$'),
    C(`$P$ 在線段 $AB$ 上且 $\\overline{AP}:\\overline{PB}=1:2$，$O$ 為任一點，$${V('OP')}=$？`,
      [`$\\dfrac23${V('OA')}+\\dfrac13${V('OB')}$`, `$\\dfrac13${V('OA')}+\\dfrac23${V('OB')}$`, `$\\dfrac12${V('OA')}+\\dfrac12${V('OB')}$`, `$${V('OA')}+\\dfrac13${V('OB')}$`],
      '分點公式：$P$ 靠近 $A$，所以 $\\overrightarrow{OA}$ 的係數較大', `$${V('OP')}=\\frac{2}{3}${V('OA')}+\\frac{1}{3}${V('OB')}$`)
  ]);

  /* ================= 單元 9　平面向量的運算 ================= */
  add(9, 'tf', [
    T('$\\vec a$、$\\vec b$ 為非零向量，若 $\\vec a\\cdot\\vec b=0$，則 $\\vec a\\perp\\vec b$', true, '$\\cos\\theta=0$，夾角 $90^{\\circ}$'),
    T('$\\vec a\\cdot\\vec a=|\\vec a|^{2}$', true, '自己和自己的夾角是 $0$'),
    T('內積 $\\vec a\\cdot\\vec b$ 的結果是一個向量', false, '內積的結果是一個數（純量）'),
    T('兩非零向量的夾角為鈍角時，內積為負', true, '$\\cos\\theta<0$'),
    T('$|\\vec a+\\vec b|\\le|\\vec a|+|\\vec b|$ 恆成立', true, '三角不等式'),
    T('柯西不等式 $(a^{2}+b^{2})(x^{2}+y^{2})\\ge(ax+by)^{2}$ 等號成立的條件是 $a=b$', false, '等號成立的條件是 $(a,b)$ 與 $(x,y)$ 平行'),
    T('$\\vec a\\cdot\\vec b=\\vec b\\cdot\\vec a$', true, '內積有交換律')
  ]);
  add(9, 'mc', [
    C('$\\vec a=(3,4)$ 在 $\\vec b=(1,0)$ 上的正射影為？', ['$(3,0)$', '$(0,4)$', '$\\left(\\dfrac35,\\dfrac45\\right)$', '$\\left(\\dfrac95,\\dfrac{12}{5}\\right)$'],
      '正射影 $=\\frac{\\vec a\\cdot\\vec b}{|\\vec b|^{2}}\\vec b$', '$\\frac{3}{1}(1,0)=(3,0)$'),
    C('$|\\vec a|=1$、$|\\vec b|=2$、$\\vec a\\cdot\\vec b=1$，$\\vec a$ 與 $\\vec b$ 的夾角為？', ['$60^{\\circ}$', '$30^{\\circ}$', '$45^{\\circ}$', '$120^{\\circ}$'],
      '$\\cos\\theta=\\frac{\\vec a\\cdot\\vec b}{|\\vec a||\\vec b|}$', '$\\cos\\theta=\\frac{1}{2}$，$\\theta=60^{\\circ}$'),
    C('$(1,k)$ 與 $(2,-4)$ 垂直，$k=$？', ['$\\dfrac12$', '$2$', '$-\\dfrac12$', '$-2$'],
      '垂直 $\\iff$ 內積為 0', '$2-4k=0\\Rightarrow k=\\frac12$')
  ]);
  add(9, 'match', [
    M('(1,2)\\cdot(3,1)', '5', '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'),
    M('(2,-1)\\cdot(1,2)', '0', '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'),
    M('(3,4)\\cdot(4,3)', '24', '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'),
    M('(1,1)\\cdot(-2,3)', '1', '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'),
    M('(-1,2)\\cdot(3,1)', '-1', '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值'),
    M('(2,2)\\cdot(1,3)', '8', '$(a,b)\\cdot(c,d)=ac+bd$', '它的內積值')
  ]);
  add(9, 'num', [
    N('$|\\vec a|=2$、$|\\vec b|=3$，夾角 $60^{\\circ}$，$\\vec a\\cdot\\vec b=$？', 3, '', '\\vec a\\cdot\\vec b', '2\\times3\\times\\cos60^{\\circ}=3',
      '$\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta$', '$2\\times3\\times\\frac12=3$'),
    N('直線 $2x-y=0$ 與 $x-3y=0$ 的夾角（銳角）是幾度？', 45, '度', '\\cos\\theta=\\frac{|\\vec n_1\\cdot\\vec n_2|}{|\\vec n_1||\\vec n_2|}', '\\frac{5}{\\sqrt5\\sqrt{10}}=\\frac{1}{\\sqrt2}\\Rightarrow45^{\\circ}',
      '用法向量 $(2,-1)$、$(1,-3)$ 的夾角', '$\\cos\\theta=\\frac{5}{\\sqrt{50}}=\\frac{1}{\\sqrt2}$，$45^{\\circ}$'),
    N('實數 $x$、$y$ 滿足 $x^{2}+y^{2}=5$，$x+2y$ 的最大值是多少？', 5, '', '(1^{2}+2^{2})(x^{2}+y^{2})', '\\ge(x+2y)^{2}\\Rightarrow x+2y\\le5',
      '柯西不等式', '$(1+4)\\times5=25\\ge(x+2y)^{2}$，最大值 $5$'),
    N('$|\\vec a|=3$、$|\\vec b|=4$、$\\vec a\\perp\\vec b$，$|\\vec a+\\vec b|=$？', 5, '', '|\\vec a+\\vec b|^{2}', '9+16+0=25',
      '$|\\vec a+\\vec b|^{2}=|\\vec a|^{2}+2\\vec a\\cdot\\vec b+|\\vec b|^{2}$', '$9+0+16=25$，所以 $5$'),
    N('$|\\vec a|=2$、$|\\vec b|=1$、$\\vec a\\cdot\\vec b=1$，$|\\vec a-\\vec b|^{2}=$？', 3, '', '|\\vec a-\\vec b|^{2}', '4-2+1=3',
      '$|\\vec a-\\vec b|^{2}=|\\vec a|^{2}-2\\vec a\\cdot\\vec b+|\\vec b|^{2}$', '$4-2+1=3$')
  ]);
  add(9, 'boss', [
    C('實數 $x$、$y$ 滿足 $2x+3y=13$，$x^{2}+y^{2}$ 的最小值是多少？', ['$13$', '$\\sqrt{13}$', '$169$', '$1$'],
      '柯西：$(2^{2}+3^{2})(x^{2}+y^{2})\\ge(2x+3y)^{2}$', '$13(x^{2}+y^{2})\\ge169$，最小值 $13$'),
    C('$\\vec a=(1,2)$、$\\vec b=(3,-1)$，$\\vec a$ 在 $\\vec b$ 上的正射影長為？', ['$\\dfrac{1}{\\sqrt{10}}$', '$\\dfrac{1}{\\sqrt5}$', '$1$', '$\\sqrt{10}$'],
      '正射影長 $=\\frac{|\\vec a\\cdot\\vec b|}{|\\vec b|}$', '$\\frac{|3-2|}{\\sqrt{10}}=\\frac{1}{\\sqrt{10}}$')
  ]);

  /* ================= 單元 10　二元一次聯立方程式 ================= */
  add(10, 'tf', [
    T('兩直線平行（不重合）時，聯立方程式無解', true, '沒有交點'),
    T('克拉瑪公式中若 $\\Delta=0$，方程組必定無解', false, '也可能有無限多組解（兩直線重合）'),
    T('二階行列式的兩列互換，值會變號', true, '行列式的性質'),
    T(`$${det('a', 'b', 'c', 'd')}=ad+bc$`, false, '應為 $ad-bc$'),
    T('向量 $(a,b)$、$(c,d)$ 所張平行四邊形的面積為 $|ad-bc|$', true, '二階行列式的絕對值'),
    T('兩直線恰交於一點時，聯立方程式恰有一組解', true, '交點就是唯一解')
  ]);
  add(10, 'mc', [
    C('解聯立方程式 $x+y=5$、$x-y=1$', ['$(3,2)$', '$(2,3)$', '$(4,1)$', '$(3,-2)$'],
      '兩式相加消去 $y$', '$2x=6$，$x=3$，$y=2$'),
    C('$x+ky=1$、$2x+4y=3$ 無解，$k=$？', ['$2$', '$-2$', '$4$', '$\\dfrac12$'],
      '無解：$\\Delta=0$ 但 $\\Delta_x\\ne0$', '$\\Delta=4-2k=0$，$k=2$；此時 $\\Delta_x=4-3k=-2\\ne0$，無解'),
    C('用克拉瑪公式解 $2x+y=5$、$x-y=1$，$\\Delta=$？', ['$-3$', '$3$', '$-1$', '$1$'],
      `$\\Delta=${det(2, 1, 1, -1)}$`, '$2\\times(-1)-1\\times1=-3$'),
    C(`已知 $${det('a', 'b', 'c', 'd')}=5$，則 $${det('2a', '2b', 'c', 'd')}=$？`, ['$10$', '$20$', '$5$', '$\\dfrac52$'],
      '某一列乘以 $k$，行列式的值也乘以 $k$', '第一列乘以 2，值變為 $2\\times5=10$')
  ]);
  add(10, 'match', [
    M(det(1, 2, 3, 4), '-2', `$${det('a', 'b', 'c', 'd')}=ad-bc$`, '它的值'),
    M(det(2, 1, 1, 2), '3', `$${det('a', 'b', 'c', 'd')}=ad-bc$`, '它的值'),
    M(det(5, 0, 7, 1), '5', `$${det('a', 'b', 'c', 'd')}=ad-bc$`, '它的值'),
    M(det(2, 4, 1, 2), '0', `$${det('a', 'b', 'c', 'd')}=ad-bc$`, '它的值'),
    M(det(3, 1, 2, 1), '1', `$${det('a', 'b', 'c', 'd')}=ad-bc$`, '它的值'),
    M(det(0, 2, 3, 1), '-6', `$${det('a', 'b', 'c', 'd')}=ad-bc$`, '它的值')
  ]);
  add(10, 'num', [
    N(`$${det(3, 2, 1, 4)}=$？`, 10, "", "ad-bc", '3\\times4-2\\times1=10',
      '$ad-bc$', '$12-2=10$'),
    N('$O(0,0)$、$A(4,1)$、$B(2,5)$，$\\triangle OAB$ 的面積是多少？', 9, '', '\\triangle OAB', '\\frac12|4\\times5-1\\times2|=9',
      '面積 $=\\frac12|ad-bc|$', '$\\frac12\\times18=9$'),
    N('向量 $(3,1)$ 與 $(1,2)$ 所張平行四邊形的面積是多少？', 5, '', '(3,1),\\ (1,2)', '|3\\times2-1\\times1|=5',
      '面積 $=|ad-bc|$', '$|6-1|=5$'),
    N('$x+2y=7$、$3x-y=7$ 的解為 $(x,y)$，$x+y=$？', 5, '', 'x+2y=7,\\ 3x-y=7', 'x=3,\\ y=2',
      '第二式乘 2 再與第一式相加', '$7x=21$，$x=3$，$y=2$，$x+y=5$')
  ]);
  const LWIN = { xmin: -1.5, xmax: 5.5, ymin: -1.5, ymax: 4.5, equal: true };
  const L1c = '#6fc3ff', L2c = '#ffb547';
  const lines = (l1, l2, extra) => [{ line: l1, color: L1c }, { line: l2, color: L2c, style: { dash: [10, 8] } }].concat(extra || []);
  add(10, 'graph', [
    G({ prompt: '聯立方程式 $x+2y=4$、$2x+4y=8$ 的兩直線圖形是哪一張？', win: LWIN,
      opts: [lines([1, 2, 4], [1, 2, 4]), lines([1, 2, 4], [1, 2, 1.5]), lines([1, 2, 4], [2, -1, 3])],
      hint: '第二式除以 2 看看', explain: '$2x+4y=8$ 就是 $x+2y=4$：兩直線重合，有無限多組解' }),
    G({ prompt: '聯立方程式 $x-y=1$、$2x-2y=5$ 的兩直線圖形是哪一張？', win: LWIN,
      opts: [lines([1, -1, 1], [1, -1, 2.5]), lines([1, -1, 1], [1, -1, 1]), lines([1, -1, 1], [1, 1, 3])],
      hint: '比較兩式的係數比與常數比', explain: '$x-y=1$ 與 $x-y=2.5$ 斜率相同、不重合：平行，無解' }),
    G({ prompt: '聯立方程式 $x+y=3$、$x-y=1$ 的兩直線圖形是哪一張？', win: LWIN,
      opts: [lines([1, 1, 3], [1, -1, 1], [{ pt: [2, 1], color: '#fff', label: '(2,1)' }]), lines([1, 1, 3], [1, -1, -1], [{ pt: [1, 2], color: '#fff', label: '(1,2)' }]), lines([1, 1, 3], [1, 1, 1])],
      hint: '先解出交點', explain: '解得 $x=2$、$y=1$：兩直線交於 $(2,1)$' })
  ]);
  add(10, 'boss', [
    C('$kx+y=1$、$x+ky=1$ 有無限多組解，$k=$？', ['$k=1$', '$k=-1$', '$k=\\pm1$', '$k=0$'],
      '$\\Delta=k^{2}-1=0$，再分別檢查 $k=1$、$k=-1$', '$k=1$ 時兩式都是 $x+y=1$（重合）；$k=-1$ 時兩直線平行無解'),
    C('$A(1,1)$、$B(4,2)$、$C(2,5)$，$\\triangle ABC$ 的面積是多少？', ['$\\dfrac{11}{2}$', '$11$', '$\\dfrac{13}{2}$', '$13$'],
      `$${V('AB')}=(3,1)$、$${V('AC')}=(1,4)$，面積 $=\\frac12|ad-bc|$`, `$\\frac12|3\\times4-1\\times1|=\\frac{11}{2}$`)
  ]);
})(window.LG);
