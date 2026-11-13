/* 數學實驗室 — 題庫中樞
   題目（依單元、玩法登記）和玩法（關卡畫面）分開：
   老師在設定頁勾選單元、設定總題數，開始挑戰時由這裡排出每一關要用的「玩法＋題目」。 */
'use strict';
(function (LG) {
  const U = LG.util;

  /* 課本：3A（龍騰）高二上 */
  LG.BOOK = { id: '3A', name: '數學 3A（龍騰）' };
  LG.UNITS = {
    1: { name: '弧度量', short: '弧度量' },
    2: { name: '三角函數的圖形', short: '三角函數圖形' },
    3: { name: '三角的和差角公式', short: '和差角公式' },
    4: { name: '正餘弦的疊合', short: '疊合' },
    5: { name: '指數函數', short: '指數函數' },
    6: { name: '對數與對數律', short: '對數律' },
    7: { name: '對數函數', short: '對數函數' },
    8: { name: '平面向量', short: '平面向量' },
    9: { name: '平面向量的運算', short: '向量運算' },
    10: { name: '二元一次聯立方程式', short: '聯立方程式' }
  };
  LG.UNIT_IDS = Object.keys(LG.UNITS).map(Number);

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

  /* 關卡類別登記自己負責的玩法 */
  B.level = (mech, L) => { B.levels[mech] = L; };

  /* 登記題目：list 為陣列（不分難度）或 { easy, normal, hard } */
  B.add = (unit, mech, list) => {
    const put = (arr, d) => arr.forEach((it, i) => {
      B.items.push({ unit, mech, d, key: `${unit}|${mech}|${d || 'a'}|${i}`, data: it });
    });
    if (Array.isArray(list)) put(list, null);
    else Object.keys(list).forEach(d => put(list[d], d));
  };

  /* 某單元某玩法、某難度可用的題目；指定難度的題目不夠時改用全部難度 */
  B.pool = (unit, mech, diff) => {
    const all = B.items.filter(it => it.unit === unit && it.mech === mech);
    const fit = all.filter(it => !it.d || it.d === diff);
    return fit.length >= MECH[mech].need ? fit : all;
  };

  /* 設定頁用：各單元題數（是非、配對以「題」計，即敘述數、算式數） */
  B.count = unit => {
    const out = { total: 0, by: {} };
    B.items.forEach(it => {
      if (it.unit !== unit) return;
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
  function compose(unit, mech, diff, used) {
    const L = B.levels[mech];
    if (!L) return null;
    const need = MECH[mech].need;
    const pool = B.pool(unit, mech, diff).filter(it => !used.has(it.key));
    if (pool.length < need) return null;
    const bucket = `${unit}|${mech}|${diff}`;
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
    let q;
    if (L.compose) q = L.compose(datas, { unit, diff, pool: B.pool(unit, mech, diff).map(it => it.data) });
    else q = L.prep ? L.prep(datas[0]) : datas[0];
    return q;
  }

  /* 一位同學的整場挑戰：回傳 [{ mech, unit, L, q, meta }] */
  B.plan = (units, count, diff) => {
    units = units.filter(u => LG.UNITS[u]);
    if (!units.length) units = LG.UNIT_IDS.slice();
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
    const hasBoss = u => B.pool(u, 'boss', diff).length > 0;
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
        B.pool(unit, m, diff).filter(it => !used.has(it.key)).length >= MECH[m].need);
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
        const q = compose(unit, mech, diff, used);
        if (q) { r = { mech, unit, q }; break; }
      }
      if (!r) return false;
      mechUse[r.mech] = (mechUse[r.mech] || 0) + 1;
      prev = r.mech;
      const L = B.levels[r.mech];
      r.L = L;
      r.meta = { id: L.meta.id, name: L.meta.name, unit: r.unit, topic: LG.UNITS[r.unit].name };
      rounds.push(r);
      return true;
    }
    return rounds;
  };
})(window.LG);
