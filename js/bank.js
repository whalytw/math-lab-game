/* 數學實驗室 — 題庫中樞
   題目（依課本、單元、玩法登記）和玩法（關卡畫面）分開：
   老師在設定頁選冊數、勾選單元、設定總題數，開始挑戰時由這裡排出每一關要用的「玩法＋題目」。
   課本與單元清單由各題庫檔用 LG.bank.book() 登記（見 js/banks/）。 */
'use strict';
(function (LG) {
  const U = LG.util;

  /* 玩法：need = 一關要用幾個題庫項目 */
  const MECH = {
    tf: { need: 3, label: '是非' },
    grow: { need: 1, label: '滑桿（指數）' },
    mc: { need: 1, label: '單選' },
    match: { need: 3, label: '配對' },
    num: { need: 1, label: '數值' },
    mirror: { need: 1, label: '圖形（鏡射）' },
    boss: { need: 1, label: '魔王' },
    tune: { need: 1, label: '參數調整' },
    graph: { need: 1, label: '圖形判讀' },
    // 新玩法（2026-11）：切切樂直接用配對題的算式（from），不需要另外出題
    slice: { need: 6, label: '切切樂', from: 'match' },
    order: { need: 1, label: '排序' },
    point: { need: 1, label: '座標尋寶' },
    tiles: { need: 1, label: '公式拼圖' }
  };
  LG.MECH = MECH;

  const B = { items: [], levels: {} };
  LG.bank = B;
  LG.BOOKS = {};

  /* 關卡類別登記自己負責的玩法 */
  B.level = (mech, L) => { B.levels[mech] = L; };

  /* 登記一冊課本：
     { label: '二上A版', name: '數學 3A（龍騰）', order,
       units: [{ id, no: '5', tag: '單元 5', name: '指數函數', curve }],
       groups: [['指對數 5～7', [5, 6, 7]], ...] } */
  B.book = (id, meta) => {
    const bk = Object.assign({ id, groups: [] }, meta);
    bk.unitMap = {};
    bk.units.forEach((u, i) => { u.idx = i + 1; bk.unitMap[u.id] = u; });
    bk.unitIds = bk.units.map(u => u.id);
    LG.BOOKS[id] = bk;
    return bk;
  };
  B.books = () => Object.values(LG.BOOKS).sort((a, b) => (a.order || 0) - (b.order || 0));

  /* 目前設定頁選的課本（找不到時用第一冊） */
  LG.curBook = () => LG.BOOKS[LG.settings.data.book] || B.books()[0];
  /* 目前課本中勾選的單元 */
  LG.curUnits = () => {
    const bk = LG.curBook();
    const sel = (LG.settings.data.units[bk.id] || []).filter(u => bk.unitMap[u]);
    return sel.length ? sel : bk.unitIds.slice();
  };

  /* 題庫檔用：const { add, copy } = LG.bank.forBook('3A') */
  B.forBook = book => ({
    /* 登記題目：list 為陣列（不分難度）或 { easy, normal, hard } */
    add(unit, mech, list) {
      const put = (arr, d) => arr.forEach((it, i) => {
        B.items.push({ book, unit, mech, d, key: `${book}|${unit}|${mech}|${d || 'a'}|${i}`, data: it });
      });
      if (Array.isArray(list)) put(list, null);
      else Object.keys(list).forEach(d => put(list[d], d));
    },
    /* 沿用其他冊的題目（同一份資料，不另外複製）；keep(題目資料, 玩法) 回傳 false 的題目不沿用 */
    copy(fromBook, fromUnit, toUnit, keep) {
      B.items.filter(it => it.book === fromBook && it.unit === fromUnit).forEach(it => {
        if (keep && !keep(it.data, it.mech)) return;
        B.items.push({ book, unit: toUnit, mech: it.mech, d: it.d, key: `${book}|${toUnit}|${it.key}`, data: it.data });
      });
    }
  });

  /* ---------- 隨機題型 ----------
     題庫檔用 LG.bank.gen(產生函式, 標籤) 登記一個「題型樣板」：每次出題時呼叫產生函式，
     用隨機數字組出一題（格式和固定題目相同），所以同一個樣板每次出現的數字都不同，學生背不了答案。
     標籤是給 3B／4B 沿用題目時篩選用的文字（例如 'cos'），不影響出題。 */
  B.gen = (fn, tag) => ({ gen: fn, tag: tag || '' });
  B.isGen = d => !!(d && typeof d.gen === 'function');
  const okData = (mech, q) => {
    if (!q) return false;
    if (mech === 'num' && q.answer != null) return Number.isInteger(q.answer) && q.answer >= 1 && q.answer <= 999;
    if (mech === 'mc' || mech === 'boss') return Array.isArray(q.opts) && q.opts.length === 4 && new Set(q.opts).size === 4;
    if (mech === 'match' || mech === 'slice') return q.tex != null && q.v != null;
    if (mech === 'order') return Array.isArray(q.items) && q.items.length >= 3 && q.items.every(it => Number.isFinite(it.v)) &&
      q.items.every((a, i) => q.items.every((b, j) => i === j || Math.abs(a.v - b.v) > 1e-6 * Math.max(1, Math.abs(a.v))));
    if (mech === 'point') return Array.isArray(q.ans) && q.ans.every(Number.isInteger) && q.win &&
      q.ans[0] > q.win.xmin && q.ans[0] < q.win.xmax && q.ans[1] > q.win.ymin && q.ans[1] < q.win.ymax;
    if (mech === 'tiles') return typeof q.tpl === 'string' && Array.isArray(q.ans) && q.ans.length === q.tpl.split('@').length - 1;
    return true;
  };
  /* 把題庫項目變成一題：固定題目原樣回傳；樣板就產生一題（數字不合條件時重抽，最多 40 次） */
  B.make = (d, mech) => {
    if (!B.isGen(d)) return d;
    for (let i = 0; i < 40; i++) {
      let q = null;
      try { q = d.gen(LG.genKit); } catch (e) { q = null; }
      if (okData(mech, q)) return q;
    }
    console.error('隨機題型產生失敗', mech, d.tag);
    return null;
  };

  /* 某冊某單元某玩法、某難度可用的題目；指定難度的題目不夠時改用全部難度 */
  B.pool = (book, unit, mech, diff) => {
    const src = (MECH[mech] && MECH[mech].from) || mech;   // 切切樂用配對題的題庫
    const all = B.items.filter(it => it.book === book && it.unit === unit && it.mech === src);
    const fit = all.filter(it => !it.d || it.d === diff);
    return fit.length >= MECH[mech].need ? fit : all;
  };

  /* 設定頁用：各單元題數（是非、配對以「題」計，即敘述數、算式數） */
  B.count = (book, unit) => {
    const out = { total: 0, by: {}, gen: 0 };
    B.items.forEach(it => {
      if (it.book !== book || it.unit !== unit) return;
      if (B.isGen(it.data)) { out.gen++; return; }   // 隨機題型另外計（每次數字不同）
      out.total++;
      out.by[it.mech] = (out.by[it.mech] || 0) + 1;
    });
    return out;
  };

  /* 跨三區、跨同學的最近出題紀錄：避免後面同學看前面的人玩就知道答案。
     存在這台電腦的瀏覽器裡，重新整理網頁或下一節課再開，也會接著輪替，不會從頭再出同幾題。 */
  const RKEY = 'mathLab.recent.v1';
  let recent = {};
  try { recent = JSON.parse(localStorage.getItem(RKEY) || '{}') || {}; } catch (e) { recent = {}; }
  function saveRecent() { try { localStorage.setItem(RKEY, JSON.stringify(recent)); } catch (e) { /* 無法儲存時只在本次有效 */ } }
  /* fixed：這個題庫桶裡固定題目的數量；hasGen：有沒有隨機題型可以補位 */
  function remember(bucket, keys, fixed, need, hasGen) {
    if (!keys.length) return;
    const r = recent[bucket] || (recent[bucket] = []);
    keys.forEach(k => { const i = r.indexOf(k); if (i >= 0) r.splice(i, 1); r.push(k); });
    // 有隨機題型補位時，固定題目可以全部記住（輪完一輪才會再出）；沒有時至少留 need 題可以出
    const mem = Math.max(0, Math.min(hasGen ? 12 : 8, hasGen ? fixed : fixed - need));
    while (r.length > mem) r.shift();
    saveRecent();
  }
  /* 出題順序：沒出過的固定題目與隨機題型在前（隨機題型較常被選到），最近出過的固定題目排最後 */
  function freshOrder(bucket, list) {
    const r = recent[bucket] || [];
    return list.map(it => ({ it, k: B.isGen(it.data) ? Math.random() * 0.6 : r.includes(it.key) ? 1 + r.indexOf(it.key) / 100 + Math.random() * 0.001 : Math.random() }))
      .sort((a, b) => a.k - b.k).map(o => o.it);
  }

  /* 依玩法組出一關的題目 */
  function compose(book, unit, mech, diff, used) {
    const L = B.levels[mech];
    if (!L) return null;
    const need = MECH[mech].need;
    const full = B.pool(book, unit, mech, diff);
    const pool = full.filter(it => !used.has(it.key));
    if (pool.length < need) return null;
    const bucket = `${book}|${unit}|${mech}|${diff}`;
    const order = freshOrder(bucket, pool);
    // 依序取題；隨機題型在這裡產生數字。配對題的 3 個算式，值要互不相同
    const chosen = [];
    for (const it of order) {
      const data = B.make(it.data, mech);
      if (!data) continue;
      if (mech === 'match' && chosen.some(c => String(c.data.v) === String(data.v) || c.data.tex === data.tex)) continue;
      if (mech === 'slice' && chosen.some(c => c.data.tex === data.tex)) continue;
      chosen.push({ key: it.key, gen: B.isGen(it.data), data });
      if (chosen.length === need) break;
    }
    if (chosen.length < need) return null;
    chosen.forEach(c => used.add(c.key));
    const fixedN = full.filter(it => !B.isGen(it.data)).length;
    remember(bucket, chosen.filter(c => !c.gen).map(c => c.key), fixedN, need, fixedN < full.length);
    const datas = chosen.map(c => c.data);
    if (L.compose) return L.compose(datas, { unit, diff, pool: full.filter(it => !B.isGen(it.data)).map(it => it.data) });
    return L.prep ? L.prep(datas[0]) : datas[0];
  }

  /* 關卡標題資訊 */
  B.meta = (L, book, unit) => {
    const u = LG.BOOKS[book].unitMap[unit];
    return { id: L.meta.id, name: L.meta.name, book, unit: u.idx, no: u.no, tag: u.tag, topic: u.name, curve: u.curve };
  };

  /* 一位同學的整場挑戰：回傳 [{ mech, unit, L, q, meta }] */
  B.plan = (book, units, count, diff) => {
    const bk = LG.BOOKS[book];
    if (!bk) return [];
    units = units.filter(u => bk.unitMap[u]);
    if (!units.length) units = bk.unitIds.slice();
    // 1. 每關的單元：平均分配後打亂，盡量不連續同一單元
    let seq = [];
    const base = U.shuffle(units);
    for (let i = 0; i < count; i++) seq.push(base[i % base.length]);
    const adj = s => s.reduce((n, u, i) => n + (i && u === s[i - 1] ? 1 : 0), 0);
    let best = U.shuffle(seq);
    for (let t = 0; t < 60 && adj(best); t++) {
      const s = U.shuffle(seq);
      if (adj(s) < adj(best)) best = s;
    }
    seq = best;
    // 最後一關盡量排「有魔王題」的單元
    const hasBoss = u => B.pool(book, u, 'boss', diff).length > 0;
    if (seq.length > 1 && !hasBoss(seq[seq.length - 1])) {
      const j = seq.map((u, k) => k).reverse().find(k => k < seq.length - 1 && hasBoss(seq[k]));
      if (j != null) [seq[j], seq[seq.length - 1]] = [seq[seq.length - 1], seq[j]];
    }
    // 2. 每關的玩法：第 1 關是非暖身、最後一關魔王，其餘輪流使用較少用過的玩法
    const used = new Set(), mechUse = {}, rounds = [];
    // 老師在設定頁關掉的玩法；勾選的單元用剩下的玩法排不出關卡時，才用關掉的玩法補上（關數不會變少）
    const off = new Set((LG.settings && LG.settings.data.mechOff) || []);
    let prev = null;
    seq.forEach((unit0, i) => {
      // 這個單元的題目用完時，改由其他勾選的單元出題
      const tryUnits = [unit0].concat(U.shuffle(units.filter(u => u !== unit0)));
      for (const strict of [true, false]) {
        if (!strict && !off.size) break;
        for (const unit of tryUnits) {
          if (pickRound(unit, i, strict)) return;
        }
      }
    });
    function pickRound(unit, i, strict) {
      const avail = Object.keys(MECH).filter(m => B.levels[m] && !(strict && off.has(m)) &&
        B.pool(book, unit, m, diff).filter(it => !used.has(it.key)).length >= MECH[m].need);
      let order;
      // 是非題（觀念題）在中間也會輪到，但每人最多約 1/4 的關數
      const tfOk = (mechUse.tf || 0) < Math.ceil(count / 4);
      const rest = U.shuffle(avail.filter(m => m !== 'boss' && (m !== 'tf' || (tfOk && i > 0))));
      rest.sort((a, b) => (mechUse[a] || 0) - (mechUse[b] || 0) || (a === prev) - (b === prev));
      if (i === 0) order = ['tf'].concat(rest, ['boss']);
      else if (i === seq.length - 1 && count > 1) order = ['boss'].concat(rest, ['tf']);
      else order = rest.concat(['boss', 'tf']);
      order = order.filter(m => avail.includes(m));
      let r = null;
      for (const mech of order) {
        const q = compose(book, unit, mech, diff, used);
        if (q) { r = { mech, unit, q }; break; }
      }
      if (!r) return false;
      mechUse[r.mech] = (mechUse[r.mech] || 0) + 1;
      prev = r.mech;
      r.L = B.levels[r.mech];
      r.meta = B.meta(r.L, book, r.unit);
      rounds.push(r);
      return true;
    }
    return rounds;
  };
})(window.LG);
