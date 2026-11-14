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
    graph: { need: 1, label: '圖形判讀' }
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

  /* 某冊某單元某玩法、某難度可用的題目；指定難度的題目不夠時改用全部難度 */
  B.pool = (book, unit, mech, diff) => {
    const all = B.items.filter(it => it.book === book && it.unit === unit && it.mech === mech);
    const fit = all.filter(it => !it.d || it.d === diff);
    return fit.length >= MECH[mech].need ? fit : all;
  };

  /* 設定頁用：各單元題數（是非、配對以「題」計，即敘述數、算式數） */
  B.count = (book, unit) => {
    const out = { total: 0, by: {} };
    B.items.forEach(it => {
      if (it.book !== book || it.unit !== unit) return;
      out.total++;
      out.by[it.mech] = (out.by[it.mech] || 0) + 1;
    });
    return out;
  };

  /* 跨三區、跨同學的最近出題紀錄：避免後面同學看前面的人玩就知道答案 */
  const recent = {};
  function remember(bucket, keys, poolSize, need) {
    const r = recent[bucket] || (recent[bucket] = []);
    keys.forEach(k => r.push(k));
    const mem = Math.max(0, Math.min(8, poolSize - need));
    while (r.length > mem) r.shift();
  }
  function freshOrder(bucket, list) {
    const r = recent[bucket] || [];
    const sh = U.shuffle(list);
    return sh.filter(it => !r.includes(it.key)).concat(sh.filter(it => r.includes(it.key)));
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
    let chosen;
    if (mech === 'match') {
      // 3 個算式的值要互不相同
      chosen = [];
      for (const it of order) {
        if (chosen.some(c => c.data.v === it.data.v)) continue;
        chosen.push(it);
        if (chosen.length === 3) break;
      }
      if (chosen.length < 3) return null;
    } else chosen = order.slice(0, need);
    chosen.forEach(c => used.add(c.key));
    remember(bucket, chosen.map(c => c.key), pool.length, need);
    const datas = chosen.map(c => c.data);
    if (L.compose) return L.compose(datas, { unit, diff, pool: full.map(it => it.data) });
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
    let prev = null;
    seq.forEach((unit0, i) => {
      // 這個單元的題目用完時，改由其他勾選的單元出題
      const tryUnits = [unit0].concat(U.shuffle(units.filter(u => u !== unit0)));
      for (const unit of tryUnits) {
        if (pickRound(unit, i)) return;
      }
    });
    function pickRound(unit, i) {
      const avail = Object.keys(MECH).filter(m => B.levels[m] &&
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
