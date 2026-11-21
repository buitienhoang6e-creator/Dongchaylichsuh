import * as THREE from 'three';

/**
 * Điều khiển kiểu "đi bộ" trong cảnh 3D:
 *  - Phím W/A/S/D hoặc mũi tên: tiến, sang trái, lùi, sang phải
 *  - Giữ Shift: đi nhanh
 *  - Q/E: hạ/nâng tầm mắt (bay lên cao để nhìn toàn cảnh)
 *  - Kéo chuột (hoặc vuốt trên điện thoại): nhìn quanh
 *  - Lăn chuột / nút +/-: phóng to, thu nhỏ (thay đổi góc nhìn)
 * Có thể điều khiển thêm bằng các nút ảo trên màn hình (setVirtual).
 */
export class WalkControls {
  constructor(camera, dom, { heightAt, bounds = 300, eye = 1.7, minFov = 18, maxFov = 72 } = {}) {
    this.camera = camera;
    this.dom = dom;
    this.heightAt = heightAt || (() => 0);
    this.bounds = bounds;
    this.eye = eye;
    this.lift = 0; // độ cao bay thêm
    this.minFov = minFov;
    this.maxFov = maxFov;
    this.yaw = 0;
    this.pitch = 0;
    this.keys = new Set();
    this.virtual = { forward: 0, right: 0, up: 0 };
    this.speed = 6;
    this.enabled = true;
    this.velocity = new THREE.Vector3();
    this.flyTo = null;
    this.onInteract = null;

    this._onKeyDown = (e) => {
      if (!this.enabled || e.target.closest?.('input, textarea')) return;
      const k = e.code;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight'].includes(k)) {
        this.keys.add(k);
        this.flyTo = null;
        this.onInteract?.();
        if (k.startsWith('Arrow')) e.preventDefault();
      }
      if (k === 'Equal' || k === 'NumpadAdd') this.zoom(-6);
      if (k === 'Minus' || k === 'NumpadSubtract') this.zoom(6);
    };
    this._onKeyUp = (e) => this.keys.delete(e.code);
    this._onBlur = () => this.keys.clear();

    this._drag = null;
    this._onPointerDown = (e) => {
      if (!this.enabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this._drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      dom.setPointerCapture?.(e.pointerId);
      this.flyTo = null;
      this.onInteract?.();
    };
    this._onPointerMove = (e) => {
      const d = this._drag;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      const k = 0.0032 * (camera.fov / 60);
      this.yaw -= dx * k;
      this.pitch = THREE.MathUtils.clamp(this.pitch - dy * k, -1.35, 1.35);
    };
    this._onPointerUp = (e) => {
      if (this._drag?.id === e.pointerId) this._drag = null;
    };
    this._onWheel = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this.zoom(Math.sign(e.deltaY) * 3);
    };

    // Chụm hai ngón để phóng to trên điện thoại
    this._touches = new Map();
    this._pinch = null;
    this._onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        this._pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        this._drag = null;
      }
    };
    this._onTouchMove = (e) => {
      if (e.touches.length === 2 && this._pinch) {
        const [a, b] = e.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        this.zoom((this._pinch - dist) * 0.08);
        this._pinch = dist;
        e.preventDefault();
      }
    };
    this._onTouchEnd = (e) => {
      if (e.touches.length < 2) this._pinch = null;
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    dom.addEventListener('pointerdown', this._onPointerDown);
    dom.addEventListener('pointermove', this._onPointerMove);
    dom.addEventListener('pointerup', this._onPointerUp);
    dom.addEventListener('pointercancel', this._onPointerUp);
    dom.addEventListener('wheel', this._onWheel, { passive: false });
    dom.addEventListener('touchstart', this._onTouchStart, { passive: true });
    dom.addEventListener('touchmove', this._onTouchMove, { passive: false });
    dom.addEventListener('touchend', this._onTouchEnd, { passive: true });
  }

  zoom(delta) {
    const cam = this.camera;
    cam.fov = THREE.MathUtils.clamp(cam.fov + delta, this.minFov, this.maxFov);
    cam.updateProjectionMatrix();
  }

  setFov(fov) {
    this.camera.fov = THREE.MathUtils.clamp(fov, this.minFov, this.maxFov);
    this.camera.updateProjectionMatrix();
  }

  setVirtual(axis, value) {
    this.virtual[axis] = value;
    if (value) {
      this.flyTo = null;
      this.onInteract?.();
    }
  }

  /** Đặt vị trí đứng (x, z) và hướng nhìn về điểm target. */
  place(x, z, target, lift = 0) {
    this.camera.position.x = x;
    this.camera.position.z = z;
    this.lift = lift;
    this.camera.position.y = this.heightAt(x, z) + this.eye + lift;
    if (target) this.lookAt(target);
  }

  lookAt(target) {
    const p = this.camera.position;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const dz = target.z - p.z;
    this.yaw = Math.atan2(-dx, -dz);
    this.pitch = Math.atan2(dy, Math.hypot(dx, dz));
  }

  /** Bay mượt tới một góc nhìn (dùng khi bấm vào điểm chú thích). */
  travel({ x, z, lift = 2, target, fov }) {
    const start = this.camera.position.clone();
    const startYaw = this.yaw;
    const startPitch = this.pitch;
    const startLift = this.lift;
    const startFov = this.camera.fov;
    const endY = this.heightAt(x, z) + this.eye + lift;
    const dx = target.x - x;
    const dy = target.y - endY;
    const dz = target.z - z;
    let endYaw = Math.atan2(-dx, -dz);
    while (endYaw - startYaw > Math.PI) endYaw -= Math.PI * 2;
    while (endYaw - startYaw < -Math.PI) endYaw += Math.PI * 2;
    const endPitch = Math.atan2(dy, Math.hypot(dx, dz));
    const dist = start.distanceTo(new THREE.Vector3(x, endY, z));
    this.flyTo = {
      t: 0,
      dur: THREE.MathUtils.clamp(dist / 45, 1.1, 3.2),
      from: { x: start.x, z: start.z, lift: startLift, yaw: startYaw, pitch: startPitch, fov: startFov },
      to: { x, z, lift, yaw: endYaw, pitch: endPitch, fov: fov ?? startFov },
    };
  }

  update(dt) {
    const cam = this.camera;
    if (this.flyTo) {
      const f = this.flyTo;
      f.t = Math.min(1, f.t + dt / f.dur);
      const e = f.t < 0.5 ? 4 * f.t ** 3 : 1 - (-2 * f.t + 2) ** 3 / 2;
      const L = THREE.MathUtils.lerp;
      cam.position.x = L(f.from.x, f.to.x, e);
      cam.position.z = L(f.from.z, f.to.z, e);
      // vòng cung nhẹ lên cao khi bay xa
      const arc = Math.sin(e * Math.PI) * Math.min(25, Math.hypot(f.to.x - f.from.x, f.to.z - f.from.z) * 0.15);
      this.lift = L(f.from.lift, f.to.lift, e) + arc;
      this.yaw = L(f.from.yaw, f.to.yaw, e);
      this.pitch = L(f.from.pitch, f.to.pitch, e);
      cam.fov = L(f.from.fov, f.to.fov, e);
      cam.updateProjectionMatrix();
      if (f.t >= 1) {
        this.flyTo = null;
        this.lift = f.to.lift;
      }
    } else if (this.enabled) {
      const k = this.keys;
      const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) + this.virtual.forward;
      const right = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) + this.virtual.right;
      const up = (k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') ? 1 : 0) + this.virtual.up;
      const run = k.has('ShiftLeft') || k.has('ShiftRight') ? 2.6 : 1;
      // càng bay cao càng đi nhanh, để quan sát toàn cảnh dễ hơn
      const speed = this.speed * run * (1 + this.lift / 12);
      const sin = Math.sin(this.yaw);
      const cos = Math.cos(this.yaw);
      const target = new THREE.Vector3(
        (-sin * fwd + cos * right) * speed,
        0,
        (-cos * fwd - sin * right) * speed,
      );
      this.velocity.lerp(target, 1 - Math.exp(-dt * 10));
      cam.position.x += this.velocity.x * dt;
      cam.position.z += this.velocity.z * dt;
      this.lift = THREE.MathUtils.clamp(this.lift + up * dt * (8 + this.lift * 0.6), 0, 140);
      const b = this.bounds;
      cam.position.x = THREE.MathUtils.clamp(cam.position.x, -b, b);
      cam.position.z = THREE.MathUtils.clamp(cam.position.z, -b, b);
    }
    const ground = this.heightAt(cam.position.x, cam.position.z);
    const targetY = ground + this.eye + this.lift;
    cam.position.y = this.flyTo ? targetY : THREE.MathUtils.lerp(cam.position.y, targetY, 1 - Math.exp(-dt * 12));
    cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    const d = this.dom;
    d.removeEventListener('pointerdown', this._onPointerDown);
    d.removeEventListener('pointermove', this._onPointerMove);
    d.removeEventListener('pointerup', this._onPointerUp);
    d.removeEventListener('pointercancel', this._onPointerUp);
    d.removeEventListener('wheel', this._onWheel);
    d.removeEventListener('touchstart', this._onTouchStart);
    d.removeEventListener('touchmove', this._onTouchMove);
    d.removeEventListener('touchend', this._onTouchEnd);
  }
}

/* ================================================================
   ĐIỀU KHIỂN KIỂU BẢN ĐỒ (giống Google Maps / Google Earth)
   Máy tính:
     - Kéo chuột trái: di chuyển (nắm mặt đất kéo đi)
     - Kéo chuột phải, hoặc giữ Ctrl / Shift rồi kéo: xoay (ngang) và nghiêng (dọc)
     - Lăn chuột: phóng to, thu nhỏ về phía con trỏ; nhấp đúp: phóng to vào chỗ đó
     - Phím mũi tên / W A S D: di chuyển; Q / E: xoay; R / F: nghiêng; + / -: phóng to, thu nhỏ
   Điện thoại:
     - Một ngón: di chuyển
     - Hai ngón: chụm để phóng to, xoay hai ngón để xoay, vuốt hai ngón lên/xuống để nghiêng
   Trạng thái máy quay: điểm nhìn (x, z) trên mặt đất, khoảng cách dist, hướng heading, độ nghiêng tilt
   (tilt = 0: nhìn thẳng từ trên xuống; càng lớn càng nhìn ngang về phía chân trời).
   ================================================================ */
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const PAN_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE', 'KeyR', 'KeyF'];

export class MapNavControls {
  constructor(camera, dom, { heightAt, bounds = 300, minDist = 4, maxDist, maxTilt = 1.4, fov = 50 } = {}) {
    this.mode = 'map';
    this.camera = camera;
    this.dom = dom;
    this.heightAt = heightAt || (() => 0);
    this.bounds = bounds;
    this.minDist = minDist;
    this.maxDist = maxDist ?? bounds * 2.2;
    this.maxTilt = maxTilt;
    this.fov = fov;
    this.enabled = true;
    this.onInteract = null;
    // cur: đang hiển thị; goal: nơi cần tới (cur đuổi theo goal cho chuyển động mượt)
    this.cur = { x: 0, z: 0, lift: 0, dist: 60, heading: 0, tilt: 0.9 };
    this.goal = { ...this.cur };
    this.anim = null;
    this.fling = new THREE.Vector2();
    this.keys = new Set();
    this._ty = 0;
    this.focus = new THREE.Vector3();
    this._cam = new THREE.PerspectiveCamera();
    this._ray = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._pointers = new Map();
    this._drag = null; // { kind: 'pan' | 'rotate' | 'two', ... }

    this._onKeyDown = (e) => {
      if (!this.enabled || e.target.closest?.('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.code;
      if (PAN_KEYS.includes(k)) {
        this.keys.add(k);
        this._interrupt();
        if (k.startsWith('Arrow')) e.preventDefault();
      }
      if (k === 'Equal' || k === 'NumpadAdd') this.zoom(-6);
      if (k === 'Minus' || k === 'NumpadSubtract') this.zoom(6);
    };
    this._onKeyUp = (e) => this.keys.delete(e.code);
    this._onBlur = () => this.keys.clear();

    this._onPointerDown = (e) => {
      if (!this.enabled) return;
      try {
        dom.setPointerCapture?.(e.pointerId);
      } catch {
        /* một số trình duyệt từ chối giữ con trỏ: vẫn kéo được bình thường */
      }
      this._interrupt();
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
      this._startGesture(e);
    };
    this._onPointerMove = (e) => {
      const p = this._pointers.get(e.pointerId);
      if (!p || !this._drag) return;
      const px = p.x;
      const py = p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      const d = this._drag;
      if (d.kind === 'pan') this._pan(px, py, p.x, p.y, e.timeStamp);
      else if (d.kind === 'rotate') this._rotate(p.x - px, p.y - py);
      else if (d.kind === 'two') this._twoFinger();
    };
    this._onPointerUp = (e) => {
      if (!this._pointers.has(e.pointerId)) return;
      this._pointers.delete(e.pointerId);
      const d = this._drag;
      // thả tay khi đang kéo nhanh: bản đồ trôi thêm một đoạn rồi dừng (giống Google Maps)
      if (d?.kind === 'pan' && d.vel && e.timeStamp - d.lastT < 80) {
        const max = this.goal.dist * 3;
        this.fling.copy(d.vel);
        if (this.fling.length() > max) this.fling.setLength(max);
      }
      this._drag = null;
      // còn lại một ngón: tiếp tục kéo di chuyển, không bị giật
      if (this._pointers.size === 1) {
        const [id, rest] = [...this._pointers.entries()][0];
        this._startGesture({ pointerId: id, pointerType: 'touch', button: 0, clientX: rest.x, clientY: rest.y });
      }
    };
    this._onWheel = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      this._interrupt();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 33;
      else if (e.deltaMode === 2) dy *= 400;
      this.zoomAt(e.clientX, e.clientY, Math.exp(clamp(dy, -240, 240) * 0.0016));
    };
    this._onDblClick = (e) => {
      if (!this.enabled) return;
      this._interrupt();
      this.zoomAt(e.clientX, e.clientY, 0.5);
    };
    this._onContext = (e) => e.preventDefault();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);
    dom.addEventListener('pointerdown', this._onPointerDown);
    dom.addEventListener('pointermove', this._onPointerMove);
    dom.addEventListener('pointerup', this._onPointerUp);
    dom.addEventListener('pointercancel', this._onPointerUp);
    dom.addEventListener('wheel', this._onWheel, { passive: false });
    dom.addEventListener('dblclick', this._onDblClick);
    dom.addEventListener('contextmenu', this._onContext);
  }

  /* ---------- cử chỉ ---------- */

  _startGesture(e) {
    if (this._pointers.size >= 2) {
      const [a, b] = [...this._pointers.values()];
      for (const p of [a, b]) {
        p.sx = p.x;
        p.sy = p.y;
      }
      this._drag = { kind: 'two', mode: null, prev: this._pair(a, b) };
      return;
    }
    const rotate = e.pointerType === 'mouse' && (e.button === 2 || e.button === 1 || e.ctrlKey || e.shiftKey || e.metaKey || e.altKey);
    this._drag = { kind: rotate ? 'rotate' : 'pan', vel: null, lastT: 0 };
    if (!rotate) this.goal.lift = 0;
  }

  _pair(a, b) {
    return {
      cx: (a.x + b.x) / 2,
      cy: (a.y + b.y) / 2,
      d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      a: Math.atan2(b.y - a.y, b.x - a.x),
    };
  }

  _pan(x0, y0, x1, y1, time) {
    const g = this.goal;
    const a = this.hit(x0, y0, g);
    const b = this.hit(x1, y1, g);
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    g.x += dx;
    g.z += dz;
    const d = this._drag;
    if (d) {
      const dt = Math.max(8, time - (d.lastT || time - 16)) / 1000;
      const v = new THREE.Vector2(dx / dt, dz / dt);
      d.vel = d.vel ? d.vel.lerp(v, 0.5) : v;
      d.lastT = time;
    }
  }

  _rotate(dx, dy) {
    const h = this.dom.clientHeight || 600;
    const g = this.goal;
    g.heading -= ((TAU * dx) / h) * 0.6;
    g.tilt = clamp(g.tilt - ((TAU * dy) / h) * 0.45, 0, this.maxTilt);
  }

  _twoFinger() {
    const d = this._drag;
    const [a, b] = [...this._pointers.values()];
    if (!a || !b) return;
    const now = this._pair(a, b);
    const prev = d.prev;
    if (!d.mode) {
      // đoán ý người dùng sau vài điểm ảnh đầu tiên: chụm/xoay hay vuốt nghiêng
      const dyA = a.y - a.sy;
      const dyB = b.y - b.sy;
      const start = this._pair({ x: a.sx, y: a.sy }, { x: b.sx, y: b.sy });
      let da = now.a - start.a;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(now.d - start.d) > 22 || Math.abs(da) > 0.16) d.mode = 'pinch';
      else if (Math.abs(dyA) > 16 && Math.abs(dyB) > 16 && Math.sign(dyA) === Math.sign(dyB)) d.mode = 'tilt';
      else return;
    }
    const g = this.goal;
    if (d.mode === 'tilt') {
      const h = this.dom.clientHeight || 600;
      g.tilt = clamp(g.tilt - ((TAU * (now.cy - prev.cy)) / h) * 0.45, 0, this.maxTilt);
    } else {
      this._pan(prev.cx, prev.cy, now.cx, now.cy, performance.now());
      this.zoomAt(now.cx, now.cy, prev.d / now.d);
      let da = now.a - prev.a;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      g.heading += da;
    }
    d.prev = now;
  }

  _interrupt() {
    if (this.anim) {
      this.anim = null;
      Object.assign(this.goal, this.cur);
    }
    this.fling.set(0, 0);
    this.onInteract?.();
  }

  /* ---------- hình học ---------- */

  /** Đặt máy quay theo một trạng thái (vị trí trên quỹ đạo quanh điểm nhìn). */
  _pose(s, cam, ty) {
    const st = Math.sin(s.tilt);
    cam.position.set(s.x + Math.sin(s.heading) * st * s.dist, ty + Math.cos(s.tilt) * s.dist, s.z + Math.cos(s.heading) * st * s.dist);
    cam.rotation.set(s.tilt - Math.PI / 2, s.heading, 0, 'YXZ');
  }

  /** Điểm trên mặt đất (mặt phẳng ngang qua điểm nhìn) nằm dưới con trỏ. */
  hit(clientX, clientY, s = this.goal) {
    const r = this.dom.getBoundingClientRect();
    this._ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    const c = this._cam;
    c.fov = this.camera.fov;
    c.aspect = this.camera.aspect;
    c.near = 0.1;
    c.far = 20000;
    c.updateProjectionMatrix();
    const ty = this.heightAt(s.x, s.z) + s.lift;
    this._pose(s, c, ty);
    c.updateMatrixWorld(true);
    this._ray.setFromCamera(this._ndc, c);
    const { origin: o, direction: d } = this._ray.ray;
    // nhìn gần ngang chân trời: giới hạn xa để kéo không bị văng
    const maxT = s.dist * 3;
    let t = d.y < -1e-4 ? (ty - o.y) / d.y : maxT;
    if (!(t > 0) || t > maxT) t = maxT;
    return new THREE.Vector3(o.x + d.x * t, ty, o.z + d.z * t);
  }

  /** Trạng thái máy quay khi đứng ở camPos và nhìn vào điểm tgt. */
  _stateFrom(camPos, tgt, clampTilt = true) {
    const ground = this.heightAt(tgt.x, tgt.z);
    const lift = clamp((tgt.y ?? ground) - ground, 0, 30);
    const ty = ground + lift;
    const ox = camPos.x - tgt.x;
    const oy = camPos.y - ty;
    const oz = camPos.z - tgt.z;
    const dist = Math.max(0.5, Math.hypot(ox, oy, oz));
    let tilt = Math.acos(clamp(oy / dist, -1, 1));
    if (clampTilt) tilt = Math.min(tilt, this.maxTilt);
    let heading = Math.atan2(ox, oz);
    // đi đường ngắn nhất khi xoay
    const ref = this.cur.heading;
    while (heading - ref > Math.PI) heading -= TAU;
    while (heading - ref < -Math.PI) heading += TAU;
    return { x: tgt.x, z: tgt.z, lift, dist: clamp(dist, this.minDist, this.maxDist), heading, tilt };
  }

  /* ---------- lệnh từ nút bấm / chương trình ---------- */

  zoomAt(clientX, clientY, factor) {
    const g = this.goal;
    const nd = clamp(g.dist * factor, this.minDist, this.maxDist);
    const k = 1 - nd / g.dist;
    if (clientX != null && k !== 0) {
      const p = this.hit(clientX, clientY, g);
      g.x += (p.x - g.x) * k;
      g.z += (p.z - g.z) * k;
    }
    g.dist = nd;
  }

  /** Tương thích với nút +/- cũ: delta âm là phóng to. */
  zoom(delta) {
    this._interrupt();
    this.zoomAt(null, null, Math.exp(delta * 0.06));
  }

  setVirtual() {}

  setTilt(t) {
    this._interrupt();
    this.goal.tilt = clamp(t, 0, this.maxTilt);
  }

  /** Xoay về hướng Bắc (giống bấm la bàn trên Google Maps). */
  resetNorth() {
    this._interrupt();
    this.goal.heading = Math.round(this.cur.heading / TAU) * TAU;
  }

  get heading() {
    return this.cur.heading;
  }

  get tilt() {
    return this.cur.tilt;
  }

  place(x, z, target, lift = 0) {
    const camPos = new THREE.Vector3(x, this.heightAt(x, z) + 1.7 + lift, z);
    const s = this._stateFrom(camPos, target);
    // mở cảnh bằng góc nhìn chéo từ trên cao như bản đồ 3D (không sát mặt đất)
    s.tilt = Math.min(s.tilt, 1.15);
    Object.assign(this.cur, s);
    Object.assign(this.goal, s);
    this._ty = this.heightAt(s.x, s.z) + s.lift;
    this.anim = null;
  }

  /** Lấy trạng thái từ máy quay hiện tại (khi chuyển từ chế độ đi bộ sang). */
  fromCamera(cam) {
    const dir = cam.getWorldDirection(new THREE.Vector3());
    const p = cam.position;
    let tgt = null;
    for (let t = 2; t < 420; t += 2) {
      const x = p.x + dir.x * t;
      const y = p.y + dir.y * t;
      const z = p.z + dir.z * t;
      if (y <= this.heightAt(x, z)) {
        tgt = new THREE.Vector3(x, y, z);
        break;
      }
    }
    if (!tgt) {
      const x = p.x + dir.x * 40;
      const z = p.z + dir.z * 40;
      tgt = new THREE.Vector3(x, this.heightAt(x, z), z);
    }
    // điểm nhìn quá xa: kéo lại gần cho dễ điều khiển
    const far = Math.hypot(tgt.x - p.x, tgt.z - p.z);
    if (far > 90) {
      const k = 90 / far;
      tgt.set(p.x + (tgt.x - p.x) * k, 0, p.z + (tgt.z - p.z) * k);
      tgt.y = this.heightAt(tgt.x, tgt.z);
    }
    const exact = this._stateFrom(p, tgt, false);
    Object.assign(this.cur, exact);
    this._ty = this.heightAt(exact.x, exact.z) + exact.lift;
    // bay vút lên thành góc nhìn chéo như bản đồ 3D
    const to = this._stateFrom(p, tgt, true);
    to.tilt = Math.min(to.tilt, 1.1);
    to.dist = Math.max(to.dist, 32);
    this.travelTo(to, 1.1);
  }

  travelTo(to, dur = 1.4) {
    const from = { ...this.cur };
    const t = { ...to };
    while (t.heading - from.heading > Math.PI) t.heading -= TAU;
    while (t.heading - from.heading < -Math.PI) t.heading += TAU;
    this.anim = { t: 0, dur, from, to: t };
    Object.assign(this.goal, t);
    this.fling.set(0, 0);
  }

  /** Bay tới góc nhìn của một điểm chú thích. */
  travel({ x, z, lift = 2, target }) {
    const camPos = new THREE.Vector3(x, this.heightAt(x, z) + 1.7 + lift, z);
    const to = this._stateFrom(camPos, target);
    const span = Math.hypot(to.x - this.cur.x, to.z - this.cur.z);
    this.travelTo(to, clamp(0.9 + span / 70, 1.1, 3));
  }

  /** Nhìn toàn cảnh: lùi ra xa, nghiêng chéo, bao trọn mọi điểm chú thích. */
  overview(all) {
    // bỏ các điểm ở rất xa (núi phía chân trời…) để khung nhìn tập trung vào khu vực chính
    const points = all?.filter((p) => Math.abs(p.x) <= this.bounds && Math.abs(p.z) <= this.bounds);
    if (!points?.length) return;
    const box = new THREE.Box3().setFromPoints(points);
    const c = box.getCenter(new THREE.Vector3());
    let r = 0;
    for (const p of points) r = Math.max(r, Math.hypot(p.x - c.x, p.z - c.z));
    r = Math.max(r, 20) * 1.12;
    const vfov = THREE.MathUtils.degToRad(this.fov);
    const half = Math.min(vfov / 2, Math.atan(Math.tan(vfov / 2) * this.camera.aspect));
    const dist = clamp(r / Math.sin(half), this.minDist, this.maxDist);
    this.onInteract?.();
    this.travelTo({ x: c.x, z: c.z, lift: 0, dist, heading: this.cur.heading, tilt: 0.78 }, 1.8);
  }

  /* ---------- mỗi khung hình ---------- */

  update(dt) {
    const g = this.goal;
    const c = this.cur;
    const cam = this.camera;

    if (this.enabled && this.keys.size) {
      const k = this.keys;
      const fwd = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
      const right = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
      const rot = (k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') ? 1 : 0);
      const tl = (k.has('KeyR') ? 1 : 0) - (k.has('KeyF') ? 1 : 0);
      const sp = g.dist * 1.1 * dt;
      const h = g.heading;
      g.x += (-Math.sin(h) * fwd + Math.cos(h) * right) * sp;
      g.z += (-Math.cos(h) * fwd - Math.sin(h) * right) * sp;
      g.heading += rot * 1.4 * dt;
      g.tilt = clamp(g.tilt + tl * 0.9 * dt, 0, this.maxTilt);
    }
    if (this.fling.lengthSq() > 0.01) {
      g.x += this.fling.x * dt;
      g.z += this.fling.y * dt;
      this.fling.multiplyScalar(Math.exp(-dt * 4));
    }
    const b = this.bounds;
    g.x = clamp(g.x, -b, b);
    g.z = clamp(g.z, -b, b);
    g.dist = clamp(g.dist, this.minDist, this.maxDist);

    if (this.anim) {
      const a = this.anim;
      a.t = Math.min(1, a.t + dt / a.dur);
      const e = ease(a.t);
      const L = THREE.MathUtils.lerp;
      for (const key of ['x', 'z', 'lift', 'dist', 'heading', 'tilt']) c[key] = L(a.from[key], a.to[key], e);
      // bay xa thì vồng lên cao một chút như trên Google Earth
      const span = Math.hypot(a.to.x - a.from.x, a.to.z - a.from.z);
      c.dist += Math.sin(e * Math.PI) * Math.min(span * 0.55, 160);
      if (a.t >= 1) this.anim = null;
    } else {
      const k = 1 - Math.exp(-dt * 12);
      for (const key of ['x', 'z', 'lift', 'dist', 'heading', 'tilt']) c[key] += (g[key] - c[key]) * k;
    }

    const ty = this.heightAt(c.x, c.z) + c.lift;
    this._ty += (ty - this._ty) * (1 - Math.exp(-dt * 10));
    this.focus.set(c.x, this._ty, c.z);
    this._pose(c, cam, this._ty);
    // không cho máy quay chui xuống đất / vào sườn đồi
    const floor = this.heightAt(cam.position.x, cam.position.z) + 1.2;
    if (cam.position.y < floor) {
      cam.position.y = floor;
      cam.lookAt(this.focus);
    }
    if (Math.abs(cam.fov - this.fov) > 0.05) {
      cam.fov += (this.fov - cam.fov) * (1 - Math.exp(-dt * 6));
      cam.updateProjectionMatrix();
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
    const d = this.dom;
    d.removeEventListener('pointerdown', this._onPointerDown);
    d.removeEventListener('pointermove', this._onPointerMove);
    d.removeEventListener('pointerup', this._onPointerUp);
    d.removeEventListener('pointercancel', this._onPointerUp);
    d.removeEventListener('wheel', this._onWheel);
    d.removeEventListener('dblclick', this._onDblClick);
    d.removeEventListener('contextmenu', this._onContext);
  }
}
