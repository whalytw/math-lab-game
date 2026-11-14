/* 數學實驗室 — 介面風格（主題）
   題庫、玩法都不變，只換外觀：顏色、字型、背景（CSS：css/theme-*.css）＋畫布與 3D 用的顏色、筆觸、特效（這裡）。
   各程式用 LG.TC('鍵名') 取顏色，用 LG.theme.brush 判斷是否用毛筆筆觸，
   用 LG.theme.light 判斷是否為淺色底（淺色底不用加法發光，否則光點會變成白色看不見）。
   新增風格：在 THEMES 加一組設定、寫一份 css/theme-xxx.css，設定頁就會多一個選項。 */
'use strict';
(function (LG) {
  const U = LG.util;
  const TECH_UNITS = Object.assign({}, U.UNIT_HEX);

  const THEMES = {
    tech: {
      id: 'tech', label: '科技', brush: false, blend: 'lighter',
      units: TECH_UNITS,
      titles: [[0.8, '數學大師', '🏆'], [0.6, '數學專家', '🥇'], [0.4, '數學研究員', '🔬'], [0.2, '數學學徒', '📘'], [0, '實驗室見習生', '🧪']],
      c: {
        fg: '#f2f6fb', ok: '#8cf06a', bad: '#ff5a6a', warn: '#ffd34d',
        panel: 'rgba(5, 18, 36, 0.62)', grid: 'rgba(160, 205, 255, 0.13)', axis: 'rgba(242, 246, 251, 0.78)',
        tick: 'rgba(200, 222, 245, 0.85)', axisName: 'rgba(242, 246, 251, 0.9)',
        trAxis: 'rgba(220, 236, 255, 0.9)', tip: '#ffffff',
        wires: ['#ff5d5d', '#4da3ff', '#ffd34d', '#5ee08a'], trail: '255, 246, 200',
        burst: null, confetti: ['#ffb547', '#ff8f73', '#4fe0b0', '#f2f6fb', '#8ec5ff', '#ffd34d'],
        fly: '#ffd34d', flyHead: '#fff6d0',
        portal: '#bfe3ff', portal2: '#d9eeff', ref: 'rgba(242,246,251,0.8)', halo: 'rgba(242,246,251,0.18)',
        touch: 'rgba(190, 222, 255, 0.35)'
      },
      dom: {
        bg: 0x0a1a33, fogNear: 16, fogFar: 52, hemiSky: 0xd2e4ff, hemiGround: 0x1a2440, hemi: 1.25,
        ground: '#0d2747', groundLine: 'rgba(130, 190, 255, 0.16)', groundLine2: 'rgba(130, 190, 255, 0.45)',
        stars: true, glass: 0x3a9c93, glassEm: 0x0b2b29, gold: 0xffd36b, edge: 0x0a1a33,
        dominos: [0xffb547, 0xff8f73, 0x4fe0b0, 0xf2f6fb], fireworks: [0xffd36b, 0x4fe0b0, 0xff8f73],
        sky2d: ['#081a33', '#14335c'], gold2d: '#ffd36b', glass2d: '#3a9c93', fw2d: ['#ffd36b', '#4fe0b0', '#ff8f73'],
        dominos2d: ['#ffb547', '#ff8f73', '#4fe0b0', '#f2f6fb'], line2d: 'rgba(130,190,255,.5)'
      }
    },
    ink: {
      id: 'ink', label: '水墨', brush: true, blend: 'source-over',
      // 傳統顏料色：朱砂、靛青、石綠、赭石、藤黃、胭脂、花青、墨、紫檀、松綠
      units: { 1: '#b8322a', 2: '#2c5282', 3: '#3d7a5a', 4: '#9a5a2e', 5: '#b8860b', 6: '#9c2f4d', 7: '#2f7a86', 8: '#3a3530', 9: '#6b3f5a', 10: '#4f7a3a' },
      titles: [[0.8, '狀元', '狀'], [0.6, '榜眼', '榜'], [0.4, '探花', '探'], [0.2, '進士', '進'], [0, '秀才', '秀']],
      c: {
        fg: '#221d18', ok: '#3d7a3a', bad: '#b8322a', warn: '#b8860b',
        panel: 'rgba(252, 247, 236, 0.72)', grid: 'rgba(70, 55, 40, 0.10)', axis: 'rgba(34, 29, 24, 0.82)',
        tick: 'rgba(60, 48, 36, 0.85)', axisName: 'rgba(34, 29, 24, 0.9)',
        trAxis: 'rgba(60, 48, 36, 0.55)', tip: '#221d18',
        wires: ['#b8322a', '#2c5282', '#b8860b', '#3d7a5a'], trail: '60, 45, 30',
        burst: ['#221d18', '#3a3530', '#b8322a', '#6b5d4c'], confetti: ['#e8a3a8', '#d76a77', '#f4d6d4', '#b8322a', '#fbeee8'],
        fly: '#b8322a', flyHead: '#221d18',
        portal: '#6b5d4c', portal2: '#3a3530', ref: 'rgba(34,29,24,0.7)', halo: 'rgba(34,29,24,0.12)',
        touch: 'rgba(60, 45, 30, 0.35)'
      },
      dom: {
        bg: 0xeee4cc, fogNear: 18, fogFar: 60, hemiSky: 0xfff8ea, hemiGround: 0x8a7a60, hemi: 1.6,
        ground: '#e6dbc2', groundLine: 'rgba(70, 55, 40, 0.10)', groundLine2: 'rgba(70, 55, 40, 0.30)',
        stars: false, glass: 0x3a3530, glassEm: 0x15110e, gold: 0xb8322a, edge: 0x3a3530,
        dominos: [0x2c2622, 0xb8322a, 0x5a4e44, 0xf4ecda], fireworks: [0xb8322a, 0xd76a77, 0x221d18],
        sky2d: ['#f3ead8', '#e6dbc2'], gold2d: '#b8322a', glass2d: '#3a3530', fw2d: ['#b8322a', '#d76a77', '#221d18'],
        dominos2d: ['#2c2622', '#b8322a', '#5a4e44', '#f4ecda'], line2d: 'rgba(70,55,40,.35)'
      }
    },
    pastel: {
      id: 'pastel', label: '粉彩', brush: false, light: true, blend: 'source-over', confetti: 'star',
      // 糖果色：在淺色底上仍要看得清楚，所以比一般粉彩略深
      units: { 1: '#ef6f8e', 2: '#5b9bd5', 3: '#3fae8f', 4: '#f08c4a', 5: '#e29a1e', 6: '#9b72d6', 7: '#2aa3b5', 8: '#d063ad', 9: '#6f86d9', 10: '#6fae3a' },
      titles: [[0.8, '數學小天才', '🌟'], [0.6, '數學達人', '🎀'], [0.4, '數學小幫手', '🍭'], [0.2, '數學新芽', '🌱'], [0, '數學小萌新', '🐣']],
      c: {
        fg: '#4a3f5c', ok: '#2fa36f', bad: '#ec5a7a', warn: '#e8a020',
        panel: 'rgba(255, 255, 255, 0.78)', grid: 'rgba(155, 114, 214, 0.12)', axis: 'rgba(74, 63, 92, 0.75)',
        tick: 'rgba(90, 78, 110, 0.85)', axisName: 'rgba(74, 63, 92, 0.9)',
        trAxis: 'rgba(120, 100, 150, 0.55)', tip: '#ffffff',
        wires: ['#ef6f8e', '#5b9bd5', '#e8a020', '#3fae8f'], trail: '239, 111, 142',
        burst: ['#ffb3c7', '#a8d8ff', '#b8f0d0', '#ffe28a', '#d7c2ff'], confetti: ['#ff9eb8', '#8fcbff', '#9be6c1', '#ffd66e', '#c7a8ff', '#ffb38a'],
        fly: '#ff8fb1', flyHead: '#ffffff',
        portal: '#c7a8ff', portal2: '#ffd1e3', ref: 'rgba(74,63,92,0.6)', halo: 'rgba(155,114,214,0.16)',
        touch: 'rgba(239, 111, 142, 0.3)'
      },
      dom: {
        bg: 0xfde9f1, fogNear: 18, fogFar: 60, hemiSky: 0xffffff, hemiGround: 0xc9b6e6, hemi: 1.7,
        ground: '#f7e1ee', groundLine: 'rgba(155, 114, 214, 0.12)', groundLine2: 'rgba(155, 114, 214, 0.32)',
        stars: false, glass: 0x8fcbe8, glassEm: 0x2a5a70, gold: 0xf28fb3, edge: 0x7a6a98,
        dominos: [0xff9eb8, 0x8fcbff, 0x9be6c1, 0xffd66e], fireworks: [0xff9eb8, 0x8fcbff, 0xffd66e],
        sky2d: ['#fde9f1', '#e8e0ff'], gold2d: '#f28fb3', glass2d: '#8fcbe8', fw2d: ['#ff9eb8', '#8fcbff', '#ffd66e'],
        dominos2d: ['#ff9eb8', '#8fcbff', '#9be6c1', '#ffd66e'], line2d: 'rgba(155,114,214,.35)'
      }
    }
  };
  THEMES.ink.light = true; THEMES.ink.confetti = 'petal'; THEMES.tech.confetti = 'rect';
  LG.THEMES = THEMES;
  LG.theme = THEMES.tech;
  LG.TC = k => LG.theme.c[k];

  /* 套用風格：換單元顏色、body 的 class；呼叫端負責重畫畫面 */
  LG.applyTheme = id => {
    const t = THEMES[id] || THEMES.tech;
    LG.theme = t;
    Object.keys(U.UNIT_HEX).forEach(k => delete U.UNIT_HEX[k]);
    Object.assign(U.UNIT_HEX, t.units);
    Object.keys(THEMES).forEach(k => document.body.classList.toggle('theme-' + k, k === t.id));
    // CSS 用的單元色（待機畫面插圖等）
    const app = document.getElementById('app');
    if (app) [5, 6, 7].forEach(u => app.style.setProperty('--u' + u, t.units[u]));
    return t;
  };

  /* 毛筆筆觸：沿著點列畫出「起筆粗、收筆細」並帶淡墨暈染的線（畫布座標） */
  LG.brushStroke = (g, pts, width, color, alpha) => {
    const n = pts.length;
    if (n < 2) return;
    g.save();
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = color;
    // 第一層：淡墨暈開（寬、淡）
    g.globalAlpha = (alpha == null ? 1 : alpha) * 0.16;
    g.lineWidth = width * 2.4;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
    // 第二層：主筆畫，依位置改變粗細（起筆重、中段略細、收筆尖）
    g.globalAlpha = (alpha == null ? 1 : alpha) * 0.92;
    const step = Math.max(1, Math.floor(n / 90));
    for (let i = step; i < n; i += step) {
      const t = i / (n - 1);
      const w = width * (t < 0.08 ? 0.75 + t * 4 : 1.15 - 0.55 * Math.pow(t, 2.2)) * (0.92 + 0.08 * Math.sin(i * 0.7));
      g.lineWidth = Math.max(0.6, w);
      g.beginPath(); g.moveTo(pts[i - step][0], pts[i - step][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
    }
    // 乾筆飛白：在主筆畫上疊幾條細的淡線
    g.globalAlpha = (alpha == null ? 1 : alpha) * 0.25;
    g.lineWidth = Math.max(0.5, width * 0.18);
    g.strokeStyle = 'rgba(255, 250, 240, 0.9)';
    g.beginPath();
    for (let i = 0; i < n; i += step * 2) { const p = pts[i]; if (i === 0) g.moveTo(p[0], p[1] - width * 0.18); else g.lineTo(p[0], p[1] - width * 0.18); }
    g.stroke();
    g.restore();
  };
})(window.LG);
