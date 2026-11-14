/* 第 6 關｜骨牌魔王關（單元 7：對數方程式、不等式與應用）
   3D 骨牌排向臺北 101：答對後骨牌一路倒下、101 放煙火；答錯骨牌搖晃停住。 */
'use strict';
(function (LG) {
  const U = LG.util;

  class L6 extends LG.LevelBase {
    constructor(zone, q, scr) {
      super(zone, q, scr);
      this.celebrateTime = 3.7;
      this.setQuestion(U.rich(q.prompt));
      const m = scr.main;
      m.classList.add('l6');
      m.innerHTML = `<div class="v3d"><canvas class="v3d-cv"></canvas><div class="v3d-tag">目標：超越臺北 101</div></div><div class="cards4"></div>`;
      this.v3d = m.querySelector('.v3d');
      this.cv = m.querySelector('.v3d-cv');
      this.ctx2d = this.cv.getContext('2d', { alpha: false });
      this.order = U.shuffle([0, 1, 2, 3]);
      const box = m.querySelector('.cards4');
      this.cards = this.order.map((oi, s) => {
        const el = U.el('div', 'opt', `<div class="ox">${U.rich(q.opts[oi])}</div>`);
        box.appendChild(el);
        LG.input.onTap(el, () => this.select(s), { sound: false, enabled: () => this.playing });
        return el;
      });
      this.sel = -1;
      if (LG.Shared3D.init()) {
        this.scene = new LG.DominoScene();
        this.view = { scene: this.scene.scene, camera: this.scene.camera, ctx: this.ctx2d, w: 0, h: 0 };
        LG.Shared3D.add(this.view);
      } else {
        this.scene = new LG.Domino2D(this.ctx2d);
        this.is2d = true;
      }
      this.setGo('推倒骨牌！', () => this.go());
      this.setGoEnabled(false);
    }

    select(s) {
      if (!this.playing || this.cards[s].classList.contains('bad')) return;
      this.sel = s;
      LG.audio.play('select');
      this.cards.forEach((c, i) => c.classList.toggle('on', i === s));
      this.setGoEnabled(true);
    }

    layout() {
      const r = this.v3d.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const s = Math.min(this.scale(), 1.5);
      const w = Math.round(r.width * s), h = Math.round(r.height * s);
      if (this.cv.width !== w) this.cv.width = w;
      if (this.cv.height !== h) this.cv.height = h;
      if (this.view) { this.view.w = w; this.view.h = h; }
      this.scene.resize(w, h);
      this.cards.forEach(c => U.fit(c, 0.55));
    }

    go() {
      if (this.sel < 0) return;
      const oi = this.order[this.sel];
      this.lastPick = oi;
      const r = this.submit(oi === 0);
      if (r === 'retry') {
        const c = this.cards[this.sel];
        c.classList.remove('on');
        c.classList.add('bad');
        this.sel = -1;
        this.setGoEnabled(false);
        this.scene.wobble();
      }
    }

    celebrate() {
      this.cards[this.sel >= 0 ? this.sel : this.order.indexOf(0)].classList.add('ok');
      this.scene.topple();
      this.zone.after(2.3, () => {
        const p = this.zone.fx.rel(this.v3d);
        this.zone.fx.confetti(p.x, p.y, { n: 40 });
      });
    }

    reveal(reason) {
      if (reason !== 'timeout' && this.lastPick != null && this.lastPick !== 0) {
        const s = this.order.indexOf(this.lastPick);
        this.cards[s].classList.remove('on');
        this.cards[s].classList.add('bad');
        this.scene.wobble();
      }
      this.cards[this.order.indexOf(0)].classList.add('answer');
    }

    update(dt) {
      this.scene.update(dt);
      if (this.is2d) this.scene.render();
    }

    destroy() {
      super.destroy();
      if (this.view) LG.Shared3D.remove(this.view);
      try { this.scene.dispose(); } catch (e) { /* ignore */ }
    }
  }

  L6.meta = { id: 6, name: '骨牌魔王關', unit: 7, topic: '對數方程式與不等式' };
  LG.registerLevel(L6);
  LG.bank.level('boss', L6);
})(window.LG);
