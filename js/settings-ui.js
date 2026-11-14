/* 數學實驗室 — 教師設定頁、密碼鍵盤、觸控測試 */
'use strict';
(function (LG) {
  const U = LG.util, S = LG.settings, I = LG.input;
  const UI = {};
  let root, segs = [], keypad, touchTest, levelBtns = [], estEl, pinEl, flashEl, classEl, unitSumEl, bookSel, unitRow, fxRow, fxNote;

  /* 華麗特效壓力測試：關閉設定頁，三區同時播放最重的特效 30 秒，結束後顯示結果 */
  function runStress() {
    if (!LG.fx3d.init()) { flash('這台電腦不支援 3D，無法使用華麗特效'); return; }
    if (LG.game.zones.some(z => z.state !== 'idle' && z.state !== 'result')) { flash('請等三區都在開始畫面或總分畫面時再測試'); return; }
    UI.close();
    const box = U.el('div', 'stress-box', '<b>華麗特效測試中…</b><span>三區同時播放最重的 3D 特效，約 30 秒</span>');
    document.getElementById('overlays').appendChild(box);
    LG.fx3d.stress(30, r => {
      const verdict = r.ok ? '順暢，可以使用「華麗」' : r.avg >= 35 ? '略有卡頓，建議把「畫面解析度」調成 75% 再測一次，或使用「完整」' : '不夠順暢，建議使用「完整」';
      box.classList.add(r.ok ? 'ok' : 'bad');
      box.innerHTML = `<b>測試結果：平均 ${Math.round(r.avg)} fps、最低 ${Math.round(r.min)} fps</b><span>${verdict}</span><div class="st-btn primary sb-close">關閉</div>`;
      I.onTap(box.querySelector('.sb-close'), () => box.remove());
    });
  }

  /* ---------- 設定頁 ---------- */
  function seg(label, key, opts, note) {
    const row = U.el('div', 'st-row');
    row.innerHTML = `<div class="st-label">${label}${note ? `<small>${note}</small>` : ''}</div><div class="seg"></div>`;
    const box = row.querySelector('.seg');
    opts.forEach(o => {
      const b = U.el('div', 'seg-b', o.t);
      b.dataset.v = String(o.v);
      I.onTap(b, () => {
        S.set(key, o.v);
        if (key === 'volume') { LG.audio.setVolume(o.v); LG.audio.play('select'); }
        render();
      });
      box.appendChild(b);
    });
    segs.push({ row, key });
    return row;
  }

  function button(label, fn, cls) {
    const b = U.el('div', 'st-btn ' + (cls || ''), label);
    I.onTap(b, fn);
    return b;
  }

  function flash(msg) {
    flashEl.textContent = msg;
    flashEl.classList.remove('show'); void flashEl.offsetWidth; flashEl.classList.add('show');
  }

  function estimate() {
    const d = S.data;
    const n = d.count;
    const per = n * d.time + n * 5 + 8;                 // 每關作答 + 轉場與解答 + 總分畫面
    const perZone = Math.ceil(d.classSize / 3);
    const total = perZone * per + (perZone - 1) * 20;   // 換人約 20 秒
    return { n, per, perZone, total };
  }

  function build() {
    root.innerHTML = `
      <div class="st-panel">
        <div class="st-head">
          <div class="st-title">教師設定</div>
          <div class="st-note">設定自動儲存在這台電腦的瀏覽器。遊戲參數從每一區的下一位同學開始生效。</div>
          <div class="st-close-wrap"></div>
        </div>
        <div class="st-cols">
          <section class="st-col c-units"><h3>出題範圍</h3></section>
          <section class="st-col c-game"><h3>遊戲</h3></section>
          <section class="st-col c-touch"><h3>觸控與顯示</h3></section>
          <section class="st-col c-admin"><h3>課堂管理</h3></section>
        </div>
        <div class="st-flash"></div>
      </div>`;
    flashEl = root.querySelector('.st-flash');
    root.querySelector('.st-close-wrap').appendChild(button('關閉並繼續遊戲', () => UI.close(), 'primary'));

    const cg = root.querySelector('.c-game');
    cg.append(
      seg('每關秒數', 'time', [30, 35, 40, 45, 50, 55, 60].map(v => ({ v, t: String(v) }))),
      seg('難度', 'difficulty', [{ v: 'easy', t: '簡單' }, { v: 'normal', t: '標準' }, { v: 'hard', t: '挑戰' }]),
      seg('求救卡扣秒', 'penalty', [5, 10, 15].map(v => ({ v, t: v + ' 秒' }))),
      seg('答對基本分', 'base', [10, 15, 20].map(v => ({ v, t: v + ' 分' })))
    );
    // ---- 出題範圍：冊數（下拉選單）＋總題數＋勾選單元 ----
    const cu = root.querySelector('.c-units');
    const bkRow = U.el('div', 'st-row');
    bkRow.innerHTML = `<div class="st-label">冊數<small>換冊後，下方單元清單會跟著換</small></div>
      <select class="bk-sel">${LG.bank.books().map(b => `<option value="${b.id}">${b.label}（${b.name}）</option>`).join('')}</select>`;
    bookSel = bkRow.querySelector('.bk-sel');
    bookSel.addEventListener('change', () => {
      S.set('book', bookSel.value);
      buildUnits();
      render();
      flash(`已切換為${LG.curBook().label}`);
    });
    cu.appendChild(bkRow);
    cu.appendChild(seg('每位同學總題數', 'count', [3, 4, 5, 6, 7, 8, 9, 10, 12].map(v => ({ v, t: String(v) })), '勾選的單元混合出題，每人只做這麼多關'));
    unitRow = U.el('div', 'st-row');
    cu.appendChild(unitRow);
    buildUnits();

    const ct = root.querySelector('.c-touch');
    ct.append(
      seg('拖曳啟動距離', 'dragDist', [{ v: 'small', t: '短' }, { v: 'mid', t: '中' }, { v: 'large', t: '長' }], '越長越不容易誤觸拖曳'),
      seg('點擊容錯範圍', 'tapTol', [{ v: 'small', t: '小' }, { v: 'mid', t: '中' }, { v: 'large', t: '大' }], '手指稍微滑出按鈕仍算點到'),
      seg('手掌誤觸過濾', 'palm', [{ v: 'off', t: '關閉' }, { v: 'normal', t: '標準' }, { v: 'strict', t: '嚴格' }], '忽略接觸面積太大的觸控'),
      seg('畫面解析度', 'renderScale', [{ v: 1, t: '100%' }, { v: 0.75, t: '75%' }, { v: 0.5, t: '50%' }], '動畫卡頓時調低'),
      (fxRow = seg('特效', 'fx', [{ v: 'rich', t: '華麗' }, { v: 'full', t: '完整' }, { v: 'lite', t: '精簡' }], '華麗：加上 3D 特效；不順時會自動改回完整')),
      seg('音效', 'volume', [{ v: 0, t: '關' }, { v: 0.35, t: '小' }, { v: 0.7, t: '中' }, { v: 1, t: '大' }])
    );
    fxNote = U.el('div', 'fx-note');
    fxRow.appendChild(fxNote);
    const tt = U.el('div', 'st-row');
    tt.innerHTML = '<div class="st-label">觸控與效能測試<small>觸控：三位同學同時在各區拖曳。華麗特效：三區同時播放最重的特效 30 秒，量測流暢度</small></div><div class="seg tt-row"></div>';
    const ttRow = tt.querySelector('.tt-row');
    ttRow.appendChild(button('觸控測試', () => touchTest.open()));
    ttRow.appendChild(button('華麗特效測試', () => runStress()));
    // 觸控與效能測試放在「課堂管理」欄（該欄空間較多，小螢幕也看得到）

    const ca = root.querySelector('.c-admin');
    const est = U.el('div', 'st-row');
    est.innerHTML = `<div class="st-label">時間預估</div>
      <div class="cls"><span>全班</span><div class="st-btn sm minus">−</div><b class="cls-n"></b><div class="st-btn sm plus">＋</div><span>人</span></div>
      <div class="est"></div>`;
    classEl = est.querySelector('.cls-n');
    estEl = est.querySelector('.est');
    I.onTap(est.querySelector('.minus'), () => { S.set('classSize', Math.max(3, S.data.classSize - 1)); render(); });
    I.onTap(est.querySelector('.plus'), () => { S.set('classSize', Math.min(60, S.data.classSize + 1)); render(); });
    ca.appendChild(est);

    const rs = U.el('div', 'st-row');
    rs.innerHTML = '<div class="st-label">重新開始<small>同學中途離開時，把該區回到開始畫面</small></div><div class="seg rs"></div>';
    const rbox = rs.querySelector('.rs');
    ['左區', '中區', '右區'].forEach((nm, i) => rbox.appendChild(button(nm, () => { LG.game.zones[i].reset(); flash(`${nm}已回到開始畫面`); }, 'seg-like')));
    rbox.appendChild(button('全部', () => { LG.game.zones.forEach(z => z.reset()); flash('三區都已回到開始畫面'); }, 'seg-like'));
    ca.appendChild(rs);
    ca.appendChild(tt);

    const pn = U.el('div', 'st-row');
    pn.innerHTML = '<div class="st-label">設定頁密碼<small>長按設定鈕後還要輸入 4 位數密碼</small></div><div class="pin-row"><span class="pin-st"></span></div>';
    pinEl = pn.querySelector('.pin-st');
    const prow = pn.querySelector('.pin-row');
    prow.appendChild(button('設定密碼', () => keypad.open('set', code => { S.set('pin', code); render(); flash('密碼已設定'); })));
    prow.appendChild(button('清除密碼', () => { S.set('pin', ''); render(); flash('已取消密碼'); }));
    ca.appendChild(pn);

    const df = U.el('div', 'st-row');
    df.appendChild(button('全部恢復預設值', () => { S.resetDefaults(); LG.audio.setVolume(S.data.volume); render(); flash('已恢復預設值（密碼不變）'); }, 'warn'));
    ca.appendChild(df);
  }

  /* 依目前的冊數建立單元勾選清單 */
  function setUnits(list) {
    const bk = LG.curBook();
    const next = Object.assign({}, S.data.units);
    next[bk.id] = bk.unitIds.filter(u => list.includes(u));
    S.set('units', next);
  }

  function buildUnits() {
    const bk = LG.curBook();
    unitRow.innerHTML = `<div class="st-label">出題單元<small>${bk.label}（${bk.name}），可複選，至少保留一個</small></div>
      <div class="seg u-quick"></div><div class="lv-grid u-grid"></div><div class="u-sum"></div>`;
    const quick = unitRow.querySelector('.u-quick');
    [['全選', bk.unitIds]].concat(bk.groups || []).forEach(([t, us]) => {
      quick.appendChild(button(t, () => { setUnits(us); render(); }, 'seg-like'));
    });
    const grid = unitRow.querySelector('.u-grid');
    unitSumEl = unitRow.querySelector('.u-sum');
    levelBtns = bk.units.map(un => {
      const c = LG.bank.count(bk.id, un.id);
      const b = U.el('div', 'lv-tg', `<b style="color:${U.UNIT_HEX[un.idx]}">${un.no}</b><span>${un.name}</span><small>題庫 ${c.total} 題・是非 ${c.by.tf || 0}</small>`);
      b.dataset.u = String(un.id);
      I.onTap(b, () => {
        const cur = LG.curUnits();
        const next = cur.includes(un.id) ? cur.filter(x => x !== un.id) : cur.concat([un.id]);
        if (!next.length) { flash('至少要保留一個單元'); return; }
        setUnits(next);
        render();
      });
      grid.appendChild(b);
      return b;
    });
  }

  function render() {
    segs.forEach(({ row, key }) => {
      row.querySelectorAll('.seg-b').forEach(b => b.classList.toggle('on', b.dataset.v === String(S.data[key])));
    });
    const bk = LG.curBook();
    if (bookSel.value !== bk.id) { bookSel.value = bk.id; buildUnits(); }
    const us = LG.curUnits();
    levelBtns.forEach(b => b.classList.toggle('on', us.includes(Number(b.dataset.u))));
    const tot = us.reduce((s, u) => s + LG.bank.count(bk.id, u).total, 0);
    unitSumEl.innerHTML = `已選 <b>${us.length}</b> 個單元（${us.map(u => bk.unitMap[u].no).join('、')}），題庫共 <b>${tot}</b> 題；每位同學從中混合抽 <b>${S.data.count}</b> 關`;
    classEl.textContent = String(S.data.classSize);
    const e = estimate();
    const mmss = s => `${Math.floor(s / 60)} 分 ${String(Math.round(s % 60)).padStart(2, '0')} 秒`;
    const over = e.total > 50 * 60;
    estEl.innerHTML = `
      <div>每區 <b>${e.perZone}</b> 人，${e.n} 關</div>
      <div>每位同學最長約 <b>${mmss(e.per)}</b></div>
      <div class="${over ? 'over' : 'ok'}">每區合計最長約 <b>${Math.ceil(e.total / 60)}</b> 分鐘${over ? '，超過 50 分鐘，建議減少總題數或調低每關秒數' : ''}</div>
      <small>「最長」是每關都用完時間的情況，多數同學會提早完成。</small>`;
    pinEl.textContent = S.data.pin ? '目前：已設定' : '目前：未設定';
    fxNote.textContent = LG.fx3d.failed ? '這台電腦不支援 3D，「華麗」會以「完整」顯示'
      : LG.fx3d.degraded ? `剛才畫面不夠順暢（約 ${Math.round(LG.fx3d.fps)} fps），已自動改回「完整」` : '';
  }

  UI.init = () => {
    root = U.el('div', 'ov ov-settings hidden');
    document.getElementById('overlays').appendChild(root);
    keypad = new Keypad();
    touchTest = new TouchTest();
    build();
    render();
  };

  UI.isOpen = () => !root.classList.contains('hidden');

  /* 長按設定鈕後呼叫 */
  UI.request = () => {
    if (UI.isOpen() || keypad.isOpen()) return;
    if (S.data.pin) {
      LG.game.pause();
      keypad.open('enter', code => {
        if (code === S.data.pin) { UI.open(); return true; }
        return false;
      }, () => LG.game.resume());
    } else UI.open();
  };

  UI.open = () => {
    LG.game.pause();
    render();
    root.classList.remove('hidden');
  };

  UI.close = () => {
    root.classList.add('hidden');
    LG.game.zones.forEach(z => z.onSettingsChanged());
    LG.teacherBar.refresh();
    LG.game.resume();
  };

  /* ---------- 4 位數密碼鍵盤 ---------- */
  class Keypad {
    constructor() {
      this.el = U.el('div', 'ov ov-keypad hidden');
      this.el.innerHTML = `
        <div class="kp">
          <div class="kp-title"></div>
          <div class="kp-dots"><i></i><i></i><i></i><i></i></div>
          <div class="kp-keys"></div>
        </div>`;
      document.getElementById('overlays').appendChild(this.el);
      const keys = this.el.querySelector('.kp-keys');
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '取消', '0', '⌫'].forEach(k => {
        const b = U.el('div', 'kp-k' + (k.length > 1 ? ' fn' : ''), k);
        I.onTap(b, () => this.key(k));
        keys.appendChild(b);
      });
      this.code = '';
    }
    isOpen() { return !this.el.classList.contains('hidden'); }
    open(mode, onDone, onCancel) {
      this.mode = mode; this.onDone = onDone; this.onCancel = onCancel; this.code = '';
      this.el.querySelector('.kp-title').textContent = mode === 'set' ? '設定新的 4 位數密碼' : '請輸入設定頁密碼';
      this.paint();
      this.el.classList.remove('hidden');
    }
    close(cancelled) {
      this.el.classList.add('hidden');
      if (cancelled && this.onCancel) this.onCancel();
    }
    paint() {
      this.el.querySelectorAll('.kp-dots i').forEach((d, i) => d.classList.toggle('on', i < this.code.length));
    }
    key(k) {
      if (k === '取消') { this.close(true); return; }
      if (k === '⌫') { this.code = this.code.slice(0, -1); this.paint(); return; }
      if (this.code.length >= 4) return;
      this.code += k;
      this.paint();
      if (this.code.length === 4) {
        const code = this.code;
        setTimeout(() => {
          if (this.mode === 'set') { this.close(false); this.onDone(code); return; }
          const ok = this.onDone(code);
          if (ok) this.close(false);
          else {
            const box = this.el.querySelector('.kp');
            box.classList.remove('err'); void box.offsetWidth; box.classList.add('err');
            LG.audio.play('wrong');
            this.code = ''; this.paint();
          }
        }, 120);
      }
    }
  }

  /* ---------- 觸控測試 ---------- */
  class TouchTest {
    constructor() {
      this.el = U.el('div', 'ov ov-touch hidden');
      this.el.innerHTML = `
        <canvas class="tt-cv"></canvas>
        <div class="tt-bar">
          <div class="tt-info">觸控測試：請三位同學同時在左、中、右區拖曳手指。<span class="tt-n"></span></div>
          <div class="st-btn primary tt-close">結束測試</div>
        </div>`;
      document.getElementById('overlays').appendChild(this.el);
      this.cv = this.el.querySelector('.tt-cv');
      this.ctx = this.cv.getContext('2d');
      this.nEl = this.el.querySelector('.tt-n');
      this.pts = new Map();
      this.max = 0;
      I.onTap(this.el.querySelector('.tt-close'), () => this.close());
      const cv = this.cv;
      cv.addEventListener('pointerdown', e => {
        try { cv.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY, w: e.width || 0, h: e.height || 0, trail: [[e.clientX, e.clientY]], hue: (e.pointerId * 67) % 360, type: e.pointerType });
        this.max = Math.max(this.max, this.pts.size);
      });
      cv.addEventListener('pointermove', e => {
        const p = this.pts.get(e.pointerId);
        if (!p) return;
        p.x = e.clientX; p.y = e.clientY; p.w = e.width || 0; p.h = e.height || 0;
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 60) p.trail.shift();
      });
      const up = e => { this.pts.delete(e.pointerId); };
      cv.addEventListener('pointerup', up);
      cv.addEventListener('pointercancel', up);
    }
    open() {
      this.pts.clear(); this.max = 0;
      this.el.classList.remove('hidden');
      this.running = true;
      const loop = () => { if (!this.running) return; this.draw(); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    close() { this.running = false; this.el.classList.add('hidden'); }
    draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      if (this.cv.width !== Math.round(W * dpr)) { this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr); }
      const g = this.ctx;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(190, 222, 255, 0.35)';
      g.lineWidth = 2;
      g.setLineDash([10, 10]);
      g.beginPath(); g.moveTo(W / 3, 0); g.lineTo(W / 3, H); g.moveTo(2 * W / 3, 0); g.lineTo(2 * W / 3, H); g.stroke();
      g.setLineDash([]);
      g.font = `700 ${Math.round(H * 0.05)}px "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
      g.fillStyle = 'rgba(190, 222, 255, 0.25)';
      g.textAlign = 'center';
      ['左區', '中區', '右區'].forEach((t, i) => g.fillText(t, W * (i + 0.5) / 3, H * 0.92));
      for (const [id, p] of this.pts) {
        const col = `hsl(${p.hue}, 90%, 62%)`;
        g.strokeStyle = col; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); p.trail.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
        const r = Math.max(34, Math.max(p.w, p.h) / 2 + 12);
        g.fillStyle = col; g.globalAlpha = 0.25;
        g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1;
        g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.stroke();
        g.font = `600 ${Math.round(H * 0.022)}px "Barlow Condensed", sans-serif`;
        g.fillStyle = '#fff';
        g.fillText(`#${id}${p.w ? `  ${Math.round(p.w)}×${Math.round(p.h)}` : ''}`, p.x, p.y - r - 10);
      }
      this.nEl.textContent = `　目前觸控點：${this.pts.size}　（最多同時：${this.max}）`;
    }
  }

  LG.settingsUI = UI;
})(window.LG);
