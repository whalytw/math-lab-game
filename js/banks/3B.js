/* 數學 3B（龍騰）高二上 題庫
   B 版的單元內容大多與 A 版相同，相同的部分直接沿用 A 版題庫（同一份題目，不另外複製），
   排除 B 版課本沒有教的題目，再補上 B 版自己的題目。
   本檔必須放在 3A.js、3A-u05-07.js 之後載入。

   對照：B1 弧度量 ← A1（不含以弳為單位的三角比）
         B2 週期性數學模型：只教正弦函數 ← A2 的正弦題目＋本檔新增
         B3 指數函數 ← A5　B4 對數 ← A6　B5 對數函數 ← A7
         B6 平面向量 ← A8（不含分點公式、重心）
         B7 平面向量的運算 ← A9（不含柯西不等式、三角不等式） */
'use strict';
(function (LG) {
  LG.bank.book('3B', {
    label: '二上B版', name: '數學 3B（龍騰）', order: 3, unitWord: '單元',
    units: [
      { id: 1, no: '1', tag: '單元 1', name: '弧度量', curve: 'sin' },
      { id: 2, no: '2', tag: '單元 2', name: '週期性數學模型', curve: 'sin' },
      { id: 3, no: '3', tag: '單元 3', name: '指數函數', curve: 'exp' },
      { id: 4, no: '4', tag: '單元 4', name: '對數', curve: 'log' },
      { id: 5, no: '5', tag: '單元 5', name: '對數函數', curve: 'mirror' },
      { id: 6, no: '6', tag: '單元 6', name: '平面向量', curve: 'vec' },
      { id: 7, no: '7', tag: '單元 7', name: '平面向量的運算', curve: 'vec' }
    ],
    groups: [['三角 1～2', [1, 2]], ['指對數 3～5', [3, 4, 5]], ['向量 6～7', [6, 7]]]
  });
  const { add, copy } = LG.bank.forBook('3B');
  const T = (s, a, e) => ({ s, a, e });
  const C = (prompt, opts, hint, explain) => ({ prompt, opts, hint, explain });
  const M = (tex, v, h, p) => ({ tex, v, h, p });
  const N = (prompt, answer, unit, lens, sci, hint, explain) => ({ prompt, answer, unit, prefix: '', lens, sci, given: '', hint, explain });
  const text = d => JSON.stringify(d);
  const without = (...words) => d => !words.some(w => text(d).includes(w));

  /* ---------- 沿用 A 版 ---------- */
  copy('3A', 1, 1, without('\\\\sin'));                                   // 不含弳的三角比
  copy('3A', 2, 2, without('cos', 'tan'));                                 // 只留正弦函數
  copy('3A', 5, 3);
  copy('3A', 6, 4);
  copy('3A', 7, 5);
  copy('3A', 8, 6, without('重心', '分點', '\\\\overline{AP}'));
  copy('3A', 9, 7, without('柯西', '三角不等式'));

  /* ---------- 單元 2 週期性數學模型：B 版補充 ---------- */
  add(2, 'tf', [
    T('$y=\\sin x$ 的振幅是 1', true, '最大值 1、最小值 $-1$'),
    T('$y=\\sin\\left(x-\\frac{\\pi}{2}\\right)$ 的圖形是由 $y=\\sin x$ 向左平移 $\\frac{\\pi}{2}$ 得到', false, '$x$ 換成 $x-\\frac{\\pi}{2}$ 是向右平移'),
    T('$y=3\\sin x$ 的週期是 $6\\pi$', false, '振幅變 3 倍，週期仍是 $2\\pi$'),
    T('$y=\\sin x+1$ 的最大值是 2', true, '圖形向上平移 1'),
    T('$y=\\sin x$ 的圖形對稱於原點', true, '$\\sin(-x)=-\\sin x$')
  ]);
  add(2, 'mc', [
    C('$y=\\sin\\left(x+\\dfrac{3\\pi}{4}\\right)$ 的圖形可由 $y=\\sin x$ 如何平移得到？', ['往左平移 $\\dfrac{3\\pi}{4}$', '往右平移 $\\dfrac{3\\pi}{4}$', '往左平移 $\\dfrac{5\\pi}{4}$', '往上平移 $\\dfrac{3\\pi}{4}$'],
      '$x$ 換成 $x+h$：向左平移 $h$', '向左平移 $\\frac{3\\pi}{4}$（也等於向右平移 $\\frac{5\\pi}{4}$）'),
    C('$y=4\\sin\\dfrac{x}{3}$ 的週期與最大值分別是？', ['$6\\pi$、$4$', '$\\dfrac{2\\pi}{3}$、$4$', '$6\\pi$、$3$', '$3\\pi$、$4$'],
      '週期 $\\frac{2\\pi}{b}$，振幅 $a$', '週期 $\\frac{2\\pi}{\\frac13}=6\\pi$，最大值 4'),
    C('摩天輪上車廂離地高度 $y=20\\sin\\left(bx-\\dfrac{\\pi}{2}\\right)+22$（公尺），車廂離地最高是幾公尺？', ['$42$', '$22$', '$20$', '$2$'],
      '$\\sin$ 的最大值是 1', '$20\\times1+22=42$')
  ]);
  add(2, 'match', [
    M('y=\\sin3x', '\\frac{2\\pi}{3}', '$y=a\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期'),
    M('y=3\\sin x', '2\\pi', '振幅不影響週期', '它的週期'),
    M('y=\\sin\\frac{x}{3}', '6\\pi', '$y=a\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期'),
    M('y=\\sin(\\pi x)', '2', '$y=a\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期'),
    M('y=\\sin4x', '\\frac{\\pi}{2}', '$y=a\\sin bx$ 的週期是 $\\frac{2\\pi}{|b|}$', '它的週期')
  ]);
  add(2, 'num', [
    N('$y=40\\sin\\left(\\dfrac{\\pi}{2}x+\\dfrac{\\pi}{2}\\right)+67$ 的最大值是多少？', 107, '', 'y=40\\sin(\\cdots)+67', '40+67=107',
      '$\\sin$ 的最大值是 1', '$40+67=107$'),
    N('風力發電機葉片高度 $y=40\\sin\\left(\\dfrac{\\pi}{2}x+\\dfrac{\\pi}{2}\\right)+67$，葉片轉一圈要幾秒？', 4, '秒', '\\frac{2\\pi}{\\frac{\\pi}{2}}', '4',
      '轉一圈就是一個週期 $\\frac{2\\pi}{b}$', '$2\\pi\\div\\frac{\\pi}{2}=4$ 秒'),
    N('$y=\\sin bx$（$b>0$）的週期是 $3\\pi$，求 $3b$', 2, '', '\\frac{2\\pi}{b}=3\\pi', 'b=\\frac23', '週期 $\\frac{2\\pi}{b}$', '$b=\\frac23$，$3b=2$')
  ]);

  /* ---------- 單元 6 平面向量：B 版補充（向量的平行、線性組合） ---------- */
  const V = s => `\\overrightarrow{${s}}`;
  add(6, 'tf', [
    T('$\\vec a=(1,2)$、$\\vec b=(2,4)$，則 $\\vec a\\parallel\\vec b$', true, '$\\vec b=2\\vec a$'),
    T('對任意實數 $r$，$|r\\vec a|=r|\\vec a|$', false, '應為 $|r||\\vec a|$；$r<0$ 時長度不會是負的')
  ]);
  add(6, 'mc', [
    C('$\\vec a=(1,2)$、$\\vec b=(2,3)$、$\\vec c=(3,4)$，且 $(\\vec a+t\\vec b)\\parallel\\vec c$，$t=$？', ['$-2$', '$2$', '$-\\dfrac12$', '$1$'],
      '$\\vec a+t\\vec b=(1+2t,\\ 2+3t)$，平行時坐標成比例', '$\\frac{1+2t}{3}=\\frac{2+3t}{4}$，得 $t=-2$'),
    C('將 $\\vec c=(4,5)$ 表成 $\\vec a=(1,2)$ 與 $\\vec b=(2,1)$ 的線性組合', ['$\\vec c=2\\vec a+\\vec b$', '$\\vec c=\\vec a+2\\vec b$', '$\\vec c=3\\vec a-\\vec b$', '$\\vec c=2\\vec a-\\vec b$'],
      '設 $\\vec c=x\\vec a+y\\vec b$，比較坐標', '$x+2y=4$、$2x+y=5$，$x=2$、$y=1$')
  ]);
  add(6, 'num', [
    N('$\\vec a=(2,-3)$、$\\vec b=(2,3)$，$|\\vec a+3\\vec b|=$？', 10, '', '|\\vec a+3\\vec b|', '(8,6),\\ 10',
      '先算 $\\vec a+3\\vec b$ 的坐標', '$(2+6,\\ -3+9)=(8,6)$，長度 10'),
    N('$\\vec a=(-1,1)$、$\\vec b=(2,-1)$，$|2\\vec a-\\vec b|=$？', 5, '', '|2\\vec a-\\vec b|', '(-4,3),\\ 5',
      '先算 $2\\vec a-\\vec b$ 的坐標', '$(-2-2,\\ 2+1)=(-4,3)$，長度 5')
  ]);
  add(6, 'boss', [
    C(`$\\triangle ABC$ 中，$D$、$E$ 分別為 $\\overline{AB}$、$\\overline{AC}$ 的中點，$${V('DE')}=r${V('BC')}$，$r=$？`, ['$\\dfrac12$', '$2$', '$1$', '$-\\dfrac12$'],
      `$${V('DE')}=${V('AE')}-${V('AD')}=\\frac12${V('AC')}-\\frac12${V('AB')}$`, `$=\\frac12${V('BC')}$（三角形兩邊中點連線定理）`)
  ]);

  /* ---------- 單元 7 平面向量的運算：B 版補充（內積、垂直、正射影） ---------- */
  add(7, 'tf', [
    T('兩非零向量互相垂直，若且唯若它們的內積為 0', true, '$\\cos90^{\\circ}=0$'),
    T('$\\vec a$ 在 $\\vec b$ 上的正射影一定與 $\\vec b$ 平行', true, '正射影 $=\\frac{\\vec a\\cdot\\vec b}{|\\vec b|^{2}}\\vec b$')
  ]);
  add(7, 'mc', [
    C('$\\vec a=(k,2)$ 與 $\\vec b=(-4,3k-1)$ 垂直，$k=$？', ['$1$', '$-1$', '$2$', '$\\dfrac12$'],
      '垂直 $\\iff$ 內積為 0', '$-4k+2(3k-1)=0$，$2k=2$，$k=1$'),
    C('$\\vec a=(7,4)$ 在 $\\vec b=(1,2)$ 上的正射影為？', ['$(3,6)$', '$(7,4)$', '$(15,30)$', '$\\left(\\dfrac35,\\dfrac65\\right)$'],
      '正射影 $=\\frac{\\vec a\\cdot\\vec b}{|\\vec b|^{2}}\\vec b$', '$\\frac{7+8}{5}(1,2)=3(1,2)=(3,6)$')
  ]);
  add(7, 'num', [
    N('$\\vec a=(7,1)$、$\\vec b=(3,4)$，$\\vec a\\cdot\\vec b=$？', 25, '', '\\vec a\\cdot\\vec b', '7\\times3+1\\times4=25',
      '$(a_1,a_2)\\cdot(b_1,b_2)=a_1b_1+a_2b_2$', '$21+4=25$'),
    N('$|\\vec a|=4$、$|\\vec b|=5$，夾角 $60^{\\circ}$，$\\vec a\\cdot\\vec b=$？', 10, '', '|\\vec a||\\vec b|\\cos60^{\\circ}', '4\\times5\\times\\frac12=10',
      '$\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta$', '$4\\times5\\times\\frac12=10$')
  ]);
  add(7, 'boss', [
    C('$\\vec a=(7,1)$、$\\vec b=(3,4)$，兩向量的夾角是？', ['$45^{\\circ}$', '$30^{\\circ}$', '$60^{\\circ}$', '$135^{\\circ}$'],
      '$\\cos\\theta=\\frac{\\vec a\\cdot\\vec b}{|\\vec a||\\vec b|}$', '$\\frac{25}{5\\sqrt2\\times5}=\\frac{1}{\\sqrt2}$，$\\theta=45^{\\circ}$')
  ]);
})(window.LG);
