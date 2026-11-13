/* 數學實驗室 — 2D 座標平面繪圖（Canvas） */
'use strict';
(function (LG) {
  const U = LG.util;

  class Graph2D {
    constructor(canvas, opts) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.opts = Object.assign({
        xmin: -3, xmax: 3, ymin: -1, ymax: 9,
        equal: false, pad: 0.07, xLabelStep: 1, yLabelStep: 1, gridStep: 1
      }, opts || {});
      this.bg = document.createElement('canvas');
      this.w = 0; this.h = 0; this.s = 1;
      this.view = null;
    }

    setWindow(o) { Object.assign(this.opts, o); if (this.w) this.layout(); }

    /* w,h：CSS 尺寸；s：解析度倍率 */
    resize(w, h, s) {
      this.w = w; this.h = h; this.s = s;
      const W = Math.max(2, Math.round(w * s)), H = Math.max(2, Math.round(h * s));
      if (this.c.width !== W) this.c.width = W;
      if (this.c.height !== H) this.c.height = H;
      this.bg.width = W; this.bg.height = H;
      this.layout();
    }

    layout() {
      const o = this.opts, W = this.c.width, H = this.c.height;
      const pad = Math.min(W, H) * o.pad;
      let x0 = o.xmin, x1 = o.xmax, y0 = o.ymin, y1 = o.ymax;
      const aw = W - 2 * pad, ah = H - 2 * pad;
      if (o.equal) {
        const sx = aw / (x1 - x0), sy = ah / (y1 - y0);
        if (sx > sy) { const cx = (x0 + x1) / 2, half = aw / sy / 2; x0 = cx - half; x1 = cx + half; }
        else { const cy = (y0 + y1) / 2, half = ah / sx / 2; y0 = cy - half; y1 = cy + half; }
      }
      this.view = { x0, x1, y0, y1, pad, kx: aw / (x1 - x0), ky: ah / (y1 - y0) };
      this.drawBackground();
    }

    X(x) { const v = this.view; return v.pad + (x - v.x0) * v.kx; }
    Y(y) { const v = this.view; return this.c.height - v.pad - (y - v.y0) * v.ky; }
    /* CSS px（相對於 canvas 左上角） */
    cssX(x) { return this.X(x) / this.s; }
    cssY(y) { return this.Y(y) / this.s; }

    fontPx(k) { return Math.max(10 * this.s, Math.min(this.c.width, this.c.height) * (k || 0.05)); }

    drawBackground() {
      const g = this.bg.getContext('2d'), v = this.view, o = this.opts;
      const W = this.bg.width, H = this.bg.height, s = this.s;
      g.clearRect(0, 0, W, H);
      // 面板
      g.fillStyle = 'rgba(5, 18, 36, 0.62)';
      const r = Math.min(W, H) * 0.035;
      g.beginPath();
      if (g.roundRect) g.roundRect(0, 0, W, H, r); else g.rect(0, 0, W, H);
      g.fill();
      g.save();
      g.beginPath(); g.rect(v.pad, v.pad, W - 2 * v.pad, H - 2 * v.pad); g.clip();
      // 格線
      g.lineWidth = Math.max(1, s);
      g.strokeStyle = 'rgba(160, 205, 255, 0.13)';
      g.beginPath();
      if (o.xPi) {
        const st = Math.PI / o.xPi;
        for (let k = Math.ceil(v.x0 / st); k * st <= v.x1; k++) { const X = Math.round(this.X(k * st)) + 0.5; g.moveTo(X, 0); g.lineTo(X, H); }
      } else for (let x = Math.ceil(v.x0); x <= v.x1; x += o.gridStep) { const X = Math.round(this.X(x)) + 0.5; g.moveTo(X, 0); g.lineTo(X, H); }
      for (let y = Math.ceil(v.y0); y <= v.y1; y += o.gridStep) { const Y = Math.round(this.Y(y)) + 0.5; g.moveTo(0, Y); g.lineTo(W, Y); }
      g.stroke();
      g.restore();
      // 座標軸
      g.strokeStyle = 'rgba(242, 246, 251, 0.78)';
      g.fillStyle = 'rgba(242, 246, 251, 0.78)';
      g.lineWidth = 2 * s;
      const ax = this.X(0), ay = this.Y(0);
      const ah = 9 * s;
      if (ay >= v.pad && ay <= H - v.pad) {
        g.beginPath(); g.moveTo(v.pad, ay); g.lineTo(W - v.pad, ay); g.stroke();
        g.beginPath(); g.moveTo(W - v.pad + 2 * s, ay); g.lineTo(W - v.pad - ah, ay - ah * 0.55); g.lineTo(W - v.pad - ah, ay + ah * 0.55); g.closePath(); g.fill();
      }
      if (ax >= v.pad && ax <= W - v.pad) {
        g.beginPath(); g.moveTo(ax, H - v.pad); g.lineTo(ax, v.pad); g.stroke();
        g.beginPath(); g.moveTo(ax, v.pad - 2 * s); g.lineTo(ax - ah * 0.55, v.pad + ah); g.lineTo(ax + ah * 0.55, v.pad + ah); g.closePath(); g.fill();
      }
      // 刻度數字
      const fs = this.fontPx(0.048);
      g.font = `600 ${fs}px "Barlow Condensed", "Arial Narrow", sans-serif`;
      g.fillStyle = 'rgba(200, 222, 245, 0.85)';
      g.textAlign = 'center'; g.textBaseline = 'top';
      if (o.xPi && ay >= v.pad && ay <= H - v.pad) {
        // π 刻度：只標 π/2 的倍數（π/4 等細格只畫格線）
        const st = Math.PI / o.xPi, every = Math.max(1, o.xPi / 2);
        for (let k = Math.ceil(v.x0 / st); k * st <= v.x1; k++) {
          if (k === 0 || k % every) continue;
          const X = this.X(k * st);
          if (X < v.pad + fs * 0.5 || X > W - v.pad - fs) continue;
          g.fillText(U.piLabel(k, o.xPi), X, ay + 4 * s);
        }
      } else if (ay >= v.pad && ay <= H - v.pad) {
        for (let x = Math.ceil(v.x0); x <= Math.floor(v.x1); x += o.xLabelStep) {
          if (x === 0) continue;
          const X = this.X(x);
          if (X < v.pad + fs * 0.5 || X > W - v.pad - fs) continue;
          g.fillText(String(x).replace('-', '−'), X, ay + 4 * s);
        }
      }
      g.textAlign = 'right'; g.textBaseline = 'middle';
      if (ax >= v.pad && ax <= W - v.pad) {
        for (let y = Math.ceil(v.y0); y <= Math.floor(v.y1); y += o.yLabelStep) {
          if (y === 0) continue;
          const Y = this.Y(y);
          if (Y < v.pad + fs || Y > H - v.pad - fs * 0.5) continue;
          g.fillText(String(y).replace('-', '−'), ax - 6 * s, Y);
        }
        g.textAlign = 'right'; g.textBaseline = 'top';
        g.fillText('O', ax - 5 * s, ay + 4 * s);
      }
      g.font = `italic 600 ${fs * 1.15}px "Times New Roman", serif`;
      g.fillStyle = 'rgba(242, 246, 251, 0.9)';
      if (ay >= v.pad && ay <= H - v.pad) { g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText('x', W - v.pad, ay - 5 * s); }
      if (ax >= v.pad && ax <= W - v.pad) { g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('y', ax + 8 * s, v.pad); }
    }

    clear() {
      const g = this.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, this.c.width, this.c.height);
      g.drawImage(this.bg, 0, 0);
    }

    clipPlot(g) {
      const v = this.view;
      g.beginPath(); g.rect(v.pad, v.pad, this.c.width - 2 * v.pad, this.c.height - 2 * v.pad); g.clip();
    }

    /* 畫折線；pts 為資料座標 [[x,y],...]，from/to 可為小數（用來做「長出來」的動畫） */
    polyline(pts, o) {
      o = o || {};
      if (!pts || pts.length < 2) return;
      const g = this.ctx, s = this.s;
      const lim = Math.max(this.view.y1 - this.view.y0, this.view.x1 - this.view.x0) * 4;
      const from = U.clamp(o.from == null ? 0 : o.from, 0, pts.length - 1);
      const to = U.clamp(o.to == null ? pts.length - 1 : o.to, 0, pts.length - 1);
      if (to <= from) return;
      const cy = (this.view.y0 + this.view.y1) / 2, cx = (this.view.x0 + this.view.x1) / 2;
      const P = (x, y) => [this.X(U.clamp(x, cx - lim, cx + lim)), this.Y(U.clamp(y, cy - lim, cy + lim))];
      const interp = f => {
        const i = Math.floor(f), t = f - i;
        const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
        if (!a || !b) return a || b;
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      };
      const path = () => {
        g.beginPath();
        let started = false;
        const first = interp(from);
        if (first) { const q = P(first[0], first[1]); g.moveTo(q[0], q[1]); started = true; }
        for (let i = Math.ceil(from); i <= Math.floor(to); i++) {
          const p = pts[i];
          if (!p) { started = false; continue; }
          const q = P(p[0], p[1]);
          if (!started) { g.moveTo(q[0], q[1]); started = true; } else g.lineTo(q[0], q[1]);
        }
        const last = interp(to);
        if (last && started) { const q = P(last[0], last[1]); g.lineTo(q[0], q[1]); }
      };
      g.save();
      this.clipPlot(g);
      g.lineJoin = 'round'; g.lineCap = 'round';
      g.setLineDash(o.dash ? o.dash.map(d => d * s) : []);
      const alpha = o.alpha == null ? 1 : o.alpha;
      const width = (o.width || 3.2) * s;
      if (o.glow !== false) {
        g.globalAlpha = alpha * 0.22;
        g.strokeStyle = o.color || '#fff';
        g.lineWidth = width * 3.4;
        path(); g.stroke();
      }
      g.globalAlpha = alpha;
      g.strokeStyle = o.color || '#fff';
      g.lineWidth = width;
      path(); g.stroke();
      g.restore();
    }

    line(x1, y1, x2, y2, o) { this.polyline([[x1, y1], [x2, y2]], o); }

    dot(x, y, o) {
      o = o || {};
      const g = this.ctx, s = this.s;
      const r = (o.r || 6) * s;
      g.save();
      g.globalAlpha = o.alpha == null ? 1 : o.alpha;
      if (o.halo) {
        g.fillStyle = o.halo;
        g.beginPath(); g.arc(this.X(x), this.Y(y), r * 2.4, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = o.color || '#fff';
      g.beginPath(); g.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2); g.fill();
      if (o.ring) {
        g.strokeStyle = o.ring; g.lineWidth = 2 * s;
        g.beginPath(); g.arc(this.X(x), this.Y(y), r + 3 * s, 0, Math.PI * 2); g.stroke();
      }
      g.restore();
    }

    text(str, x, y, o) {
      o = o || {};
      const g = this.ctx;
      g.save();
      g.font = o.font || `600 ${this.fontPx(0.055)}px "Barlow Condensed", sans-serif`;
      g.fillStyle = o.color || '#fff';
      g.textAlign = o.align || 'left';
      g.textBaseline = o.baseline || 'middle';
      g.globalAlpha = o.alpha == null ? 1 : o.alpha;
      g.fillText(str, this.X(x) + (o.dx || 0) * this.s, this.Y(y) + (o.dy || 0) * this.s);
      g.restore();
    }
  }

  /* 畫一組圖形：
     { fn: x => y }            函數圖形
     { line: [a, b, c] }       直線 ax + by = c
     { vec: [x0, y0, x1, y1] } 向量（箭頭）
     { pt: [x, y] }            點
     { label: 'A', at: [x, y] } 文字
     每個圖形可帶 color / width / dash；style 為整組的預設值 */
  Graph2D.prototype.shapes = function (list, style) {
    const v = this.view;
    if (!v || !list) return;
    for (const sh of list) {
      const o = Object.assign({}, style || {}, sh.style || {});
      if (sh.color) o.color = sh.color;
      if (sh.fn) {
        const f = sh.fn, x0 = v.x0 - 0.5, x1 = v.x1 + 0.5;
        this.polyline(Graph2D.sample(f, x0, x1, 600), o);
      } else if (sh.line) {
        const [a, b, c] = sh.line;
        if (Math.abs(b) > 1e-9) this.line(v.x0 - 1, (c - a * (v.x0 - 1)) / b, v.x1 + 1, (c - a * (v.x1 + 1)) / b, o);
        else this.line(c / a, v.y0 - 1, c / a, v.y1 + 1, o);
      } else if (sh.vec) {
        const [x0, y0, x1, y1] = sh.vec;
        this.line(x0, y0, x1, y1, o);
        const g = this.ctx, s = this.s;
        const X1 = this.X(x1), Y1 = this.Y(y1), ang = Math.atan2(Y1 - this.Y(y0), X1 - this.X(x0));
        const len = Math.hypot(X1 - this.X(x0), Y1 - this.Y(y0));
        if (len > 2) {
          const hl = Math.min(len * 0.45, (o.head || 15) * s);
          g.save();
          g.globalAlpha = o.alpha == null ? 1 : o.alpha;
          g.fillStyle = o.color || '#fff';
          g.beginPath();
          g.moveTo(X1, Y1);
          g.lineTo(X1 - hl * Math.cos(ang - 0.42), Y1 - hl * Math.sin(ang - 0.42));
          g.lineTo(X1 - hl * Math.cos(ang + 0.42), Y1 - hl * Math.sin(ang + 0.42));
          g.closePath(); g.fill();
          g.restore();
        }
      } else if (sh.pt) {
        this.dot(sh.pt[0], sh.pt[1], { r: o.r || 6, color: o.color, alpha: o.alpha, halo: o.halo });
      }
      if (sh.label) {
        const at = sh.at || (sh.vec ? [sh.vec[2], sh.vec[3]] : sh.pt);
        if (at) this.text(sh.label, at[0], at[1], { color: o.labelColor || o.color || '#fff', dx: sh.dx == null ? 8 : sh.dx, dy: sh.dy == null ? -12 : sh.dy, alpha: o.alpha,
          font: `italic 700 ${this.fontPx(0.06)}px "Times New Roman", serif` });
      }
    }
  };

  /* 取樣：y = f(x) 均勻取點 */
  Graph2D.sample = (f, x0, x1, n) => {
    n = n || 480;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n;
      const y = f(x);
      pts.push(Number.isFinite(y) ? [x, y] : null);
    }
    return pts;
  };

  /* 對數型曲線：x 以等比方式取點，靠近 y 軸的漸近部分也會平滑 */
  Graph2D.sampleLog = (f, x1, n) => {
    n = n || 600;
    const pts = [];
    const u0 = -7, u1 = Math.log10(Math.max(x1, 1e-3));
    for (let i = 0; i <= n; i++) {
      const x = Math.pow(10, u0 + (u1 - u0) * i / n);
      const y = f(x);
      pts.push(Number.isFinite(y) ? [x, y] : null);
    }
    return pts;
  };

  LG.Graph2D = Graph2D;
})(window.LG);
