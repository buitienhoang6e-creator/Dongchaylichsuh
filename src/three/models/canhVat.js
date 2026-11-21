import * as THREE from 'three';
import { mulberry32 } from '../noise.js';
import { bananaLeafTex, dryLeafTex, heartLeafTex, leafTex, smokeTex } from './primitiveTex.js';

/**
 * CẢNH VẬT THỜI NGUYÊN THỦY: lều lá, chuối rừng, khoai môn, giàn phơi cá, khói bếp,
 * nhũ đá, dây leo, cây mọc trên gờ núi đá vôi.
 */

const V3 = THREE.Vector3;
const leafMat = (map, extra = {}) =>
  new THREE.MeshStandardMaterial({ map, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75, ...extra });

export function sceneryMaterials() {
  return {
    leaf: leafMat(leafTex()),
    dryLeaf: leafMat(dryLeafTex(), { roughness: 0.9 }),
    banana: leafMat(bananaLeafTex()),
    heart: leafMat(heartLeafTex()),
    stem: new THREE.MeshStandardMaterial({ color: 0x5e7a3a, roughness: 0.8 }),
    bananaStem: new THREE.MeshStandardMaterial({ color: 0x7a8a4a, roughness: 0.85 }),
    pole: new THREE.MeshStandardMaterial({ color: 0x6b4e32, roughness: 0.9 }),
    vine: new THREE.MeshStandardMaterial({ color: 0x3c4a28, roughness: 0.9 }),
    fish: new THREE.MeshStandardMaterial({ color: 0x8a8578, roughness: 0.4, metalness: 0.2 }),
    rope: new THREE.MeshStandardMaterial({ color: 0x8a7350, roughness: 0.9 }),
  };
}

const shadows = (o, cast = true) => {
  o.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = cast;
      c.receiveShadow = true;
    }
  });
  return o;
};

/** Lá treo: mép trên ở gốc tọa độ, lá rủ xuống theo -y. */
function hangingLeafGeo(w, len, bend = 0.15) {
  const g = new THREE.PlaneGeometry(w, len, 1, 6);
  g.translate(0, -len / 2, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = -p.getY(i) / len;
    p.setZ(i, bend * t * t * len);
  }
  g.computeVertexNormals();
  return g;
}

/** Lều tròn dựng bằng cành cây, lợp nhiều lớp lá khô chồng lên nhau, chừa cửa ra vào. */
export function leafHut(SM, { r = 2.3, h = 3.2, door = 0, seed = 1 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const apex = new V3(0, h, 0);
  // khung cột
  const pole = new THREE.CylinderGeometry(0.04, 0.05, 1, 6);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const base = new V3(Math.cos(a) * r, 0, Math.sin(a) * r);
    const dir = new V3().subVectors(apex, base);
    const m = new THREE.Mesh(pole, SM.pole);
    m.scale.y = dir.length() + 0.4;
    m.position.copy(base).addScaledVector(dir, 0.5 + 0.2 / dir.length());
    m.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
    g.add(m);
  }
  // lá lợp thành từng vòng từ dưới lên
  const geo = hangingLeafGeo(0.32, 1.05, 0.12);
  const list = [];
  const rings = 8;
  for (let j = 0; j < rings; j++) {
    const t = j / rings;
    const y = 0.95 + t * (h - 1.0);
    const rr = r * (1 - (y - 0.15) / h) + 0.1;
    const n = Math.max(6, Math.ceil((Math.PI * 2 * rr) / 0.22));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (j % 2) * (Math.PI / n) + (rnd() - 0.5) * 0.05;
      let da = Math.abs(((a - (door + Math.PI / 2) + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (da < 0.42 && y < 2.1) continue; // cửa ra vào
      list.push({ a, y, rr });
    }
  }
  const im = new THREE.InstancedMesh(geo, SM.dryLeaf, list.length);
  const o = new THREE.Object3D();
  const slope = Math.atan2(r, h);
  const c = new THREE.Color();
  list.forEach(({ a, y, rr }, i) => {
    o.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
    o.rotation.set(0, 0, 0);
    o.rotateY(-a + Math.PI / 2); // mặt lá quay ra ngoài
    o.rotateX(-slope + (rnd() - 0.5) * 0.15);
    o.rotateZ((rnd() - 0.5) * 0.25);
    o.scale.setScalar(0.85 + rnd() * 0.35);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    const v = 0.8 + rnd() * 0.35;
    im.setColorAt(i, c.setRGB(v, v * (0.95 + rnd() * 0.1), v * 0.9));
  });
  im.castShadow = true;
  im.receiveShadow = true;
  g.add(im);
  // bó chóp
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 7), SM.dryLeaf);
  top.position.y = h + 0.05;
  g.add(top);
  // bên trong tối
  const inner = new THREE.Mesh(new THREE.ConeGeometry(r * 0.92, h * 0.95, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a2018, side: THREE.BackSide, roughness: 1 }));
  inner.position.y = (h * 0.95) / 2;
  g.add(inner);
  return shadows(g);
}

/** Cây chuối rừng (bẹ thân + tàu lá rách). points: [{x, y, z}] */
export function bananaPlants(SM, points, { seed = 3 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  if (!points.length) return g;
  const stemGeo = new THREE.CylinderGeometry(0.07, 0.12, 1, 8);
  stemGeo.translate(0, 0.5, 0);
  const leafGeo = new THREE.PlaneGeometry(0.55, 2.1, 1, 10);
  leafGeo.translate(0, 1.05, 0);
  const p = leafGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / 2.1;
    p.setZ(i, -0.9 * t * t); // tàu lá cong rủ xuống
    p.setX(i, p.getX(i) * (1 - 0.15 * t));
  }
  leafGeo.computeVertexNormals();
  const perPlant = 7;
  const stems = new THREE.InstancedMesh(stemGeo, SM.bananaStem, points.length);
  const leaves = new THREE.InstancedMesh(leafGeo, SM.banana, points.length * perPlant);
  const o = new THREE.Object3D();
  let k = 0;
  points.forEach((pt, i) => {
    const h = 1.4 + rnd() * 1.2;
    o.position.set(pt.x, pt.y - 0.05, pt.z);
    o.rotation.set((rnd() - 0.5) * 0.08, rnd() * 6, (rnd() - 0.5) * 0.08);
    o.scale.set(1, h, 1);
    o.updateMatrix();
    stems.setMatrixAt(i, o.matrix);
    for (let l = 0; l < perPlant; l++) {
      o.position.set(pt.x, pt.y + h - 0.1, pt.z);
      o.rotation.set(0, (l / perPlant) * Math.PI * 2 + rnd() * 0.6, 0);
      o.rotateX(-(0.25 + rnd() * 0.75));
      const s = 0.75 + rnd() * 0.45;
      o.scale.set(s, s, s);
      o.updateMatrix();
      leaves.setMatrixAt(k++, o.matrix);
    }
  });
  stems.castShadow = leaves.castShadow = true;
  stems.receiveShadow = leaves.receiveShadow = true;
  g.add(stems, leaves);
  return g;
}

/** Khoai môn, ráy: cuống dài, lá to hình tim. */
export function taroPlants(SM, points, { seed = 5, size = 1 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  if (!points.length) return g;
  const stalkGeo = new THREE.CylinderGeometry(0.012, 0.02, 1, 5);
  stalkGeo.translate(0, 0.5, 0);
  const leafGeo = new THREE.PlaneGeometry(0.55, 0.6, 2, 2);
  leafGeo.translate(0, -0.22, 0);
  leafGeo.rotateX(-Math.PI / 2 + 0.35);
  const per = 5;
  const stalks = new THREE.InstancedMesh(stalkGeo, SM.stem, points.length * per);
  const leaves = new THREE.InstancedMesh(leafGeo, SM.heart, points.length * per);
  const o = new THREE.Object3D();
  let k = 0;
  points.forEach((pt) => {
    for (let l = 0; l < per; l++) {
      const a = (l / per) * Math.PI * 2 + rnd();
      const tilt = 0.2 + rnd() * 0.35;
      const len = (0.6 + rnd() * 0.5) * size;
      o.position.set(pt.x, pt.y, pt.z);
      o.rotation.set(0, a, 0);
      o.rotateX(tilt);
      o.scale.set(1, len, 1);
      o.updateMatrix();
      stalks.setMatrixAt(k, o.matrix);
      const tip = new V3(0, len, 0).applyEuler(new THREE.Euler(tilt, a, 0, 'YXZ'));
      o.position.set(pt.x + tip.x, pt.y + tip.y, pt.z + tip.z);
      o.rotation.set(0, a, 0);
      o.scale.setScalar((0.8 + rnd() * 0.5) * size);
      o.updateMatrix();
      leaves.setMatrixAt(k++, o.matrix);
    }
  });
  stalks.castShadow = leaves.castShadow = true;
  leaves.receiveShadow = true;
  g.add(stalks, leaves);
  return g;
}

/** Giàn phơi cá: hai cột chạc, đòn ngang, cá xâu treo. */
export function fishRack(SM, { w = 2.4, count = 9, seed = 7 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.8, 6), SM.pole);
    post.position.set((s * w) / 2, 0.9, 0);
    g.add(post);
    for (const k of [-1, 1]) {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.3, 5), SM.pole);
      fork.position.set((s * w) / 2 + k * 0.06, 1.88, 0);
      fork.rotation.z = -k * 0.45;
      g.add(fork);
    }
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, w + 0.3, 6), SM.pole);
  bar.rotation.z = Math.PI / 2;
  bar.position.y = 1.86;
  g.add(bar);
  for (let i = 0; i < count; i++) {
    const x = -w / 2 + 0.2 + (i / (count - 1)) * (w - 0.4);
    const len = 0.22 + rnd() * 0.12;
    const fish = new THREE.Group();
    const bodyM = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), SM.fish);
    bodyM.scale.set(0.035, len / 2, 0.012);
    bodyM.position.y = -len / 2 - 0.06;
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), SM.fish);
    tail.scale.z = 0.25;
    tail.position.y = -0.04;
    tail.rotation.z = Math.PI;
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 3), SM.rope);
    string.position.y = -0.02;
    fish.add(bodyM, tail, string);
    fish.position.set(x, 1.84, 0);
    fish.rotation.y = rnd() * 0.8;
    g.add(fish);
  }
  return shadows(g);
}

/** Xiên đâm cá ba ngạnh. */
export function fishSpear(SM, L = 2.2) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, L, 6), SM.pole));
  for (const x of [-0.035, 0, 0.035]) {
    const prong = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.22, 4), SM.pole);
    prong.position.set(x, L / 2 + 0.1, 0);
    g.add(prong);
  }
  return shadows(g);
}

/** Khói bốc lên từ bếp lửa (các đốm khói trôi lên, nở ra rồi tan). */
export function smoke(engine, { x, y, z, count = 14, rise = 0.6, spread = 0.4, size = 1.2, opacity = 0.35, color = 0xcfc8c0, height = 6 } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const tex = smokeTex();
  const parts = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(m);
    g.add(s);
    parts.push({ s, off: i / count, sx: (Math.random() - 0.5) * spread, sz: (Math.random() - 0.5) * spread, rot: Math.random() * 6 });
  }
  engine.updaters.push((dt, t) => {
    for (const p of parts) {
      const life = (t * (rise / height) + p.off) % 1;
      const y2 = life * height;
      const drift = life * life * 1.4;
      p.s.position.set(p.sx + drift * 0.6 + Math.sin(t * 0.5 + p.rot) * 0.15 * life, y2, p.sz + drift * 0.3);
      const sc = size * (0.5 + life * 2.2);
      p.s.scale.set(sc, sc, 1);
      p.s.material.rotation = p.rot + life * 0.8;
      p.s.material.opacity = opacity * Math.sin(Math.PI * Math.min(1, life * 1.15)) * (1 - life * 0.3);
    }
  });
  return g;
}

/** Nhũ đá rủ xuống từ vòm cửa hang. kh: karstHill; (hx, hy, hz): vị trí núi. */
export function stalactites(kh, { hx, hy, hz, count = 26, seed = 9 } = {}) {
  const rnd = mulberry32(seed);
  const cave = kh.cave;
  const g = new THREE.Group();
  const mat = kh.mesh.material;
  const geo = new THREE.ConeGeometry(1, 1, 7);
  geo.rotateX(Math.PI); // đỉnh nhọn chúc xuống
  geo.translate(0, -0.5, 0); // chân nhũ đá ở gốc tọa độ (bám trần hang)
  const col = new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(0.55), 3);
  geo.setAttribute('color', col);
  for (let i = 0; i < count; i++) {
    const u = (rnd() * 2 - 1) * 0.85;
    const a = cave.dir + u * cave.halfAng;
    const ga = Math.pow(Math.cos(u * (Math.PI / 2)), 0.6);
    const depthIn = rnd() * 0.75;
    const yTop = cave.h * Math.sqrt(Math.max(0, 1 - depthIn * depthIn * 0.4)) * (0.55 + ga * 0.4);
    const r = kh.Rth(a) - cave.depth * ga * (0.15 + depthIn * 0.7);
    const len = 0.4 + rnd() * 2.2;
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(0.12 + rnd() * 0.25, len, 0.12 + rnd() * 0.25);
    m.position.set(hx + Math.cos(a) * r, hy + yTop + 0.3, hz + Math.sin(a) * r);
    m.rotation.y = rnd() * 6;
    m.castShadow = true;
    g.add(m);
  }
  return g;
}

/** Dây leo buông từ gờ đá. anchors: [{x, y, z, len}] */
export function vines(SM, anchors, { seed = 11 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const leafGeo = new THREE.PlaneGeometry(0.16, 0.24);
  const leafPositions = [];
  for (const a of anchors) {
    const pts = [];
    const segs = 6;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      pts.push(new V3(a.x + Math.sin(t * 3 + rnd()) * 0.25 * t, a.y - t * a.len, a.z + Math.cos(t * 2 + rnd()) * 0.2 * t + t * 0.3));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.025 + rnd() * 0.02, 5), SM.vine);
    tube.castShadow = true;
    g.add(tube);
    const nl = Math.round(a.len * 5);
    for (let i = 0; i < nl; i++) leafPositions.push({ p: curve.getPoint(i / nl), r: rnd() });
  }
  const im = new THREE.InstancedMesh(leafGeo, SM.leaf, leafPositions.length);
  const o = new THREE.Object3D();
  leafPositions.forEach(({ p, r }, i) => {
    o.position.copy(p);
    o.rotation.set((r - 0.5) * 1.2, r * 12, (r - 0.3) * 1.5);
    o.scale.setScalar(0.7 + r * 0.8);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = true;
  g.add(im);
  return g;
}

/**
 * Các điểm trên gờ, đỉnh núi đá vôi (mặt thoải) để trồng cây bụi bám đá.
 * Trả về tọa độ thế giới [{x, y, z}].
 */
export function ledgePoints(kh, { hx, hy, hz, count = 40, minNy = 0.55, yMin = 3, seed = 13 } = {}) {
  const rnd = mulberry32(seed);
  const pos = kh.mesh.geometry.attributes.position;
  const nor = kh.mesh.geometry.attributes.normal;
  const cand = [];
  for (let i = 0; i < pos.count; i++) {
    if (nor.getY(i) > minNy && pos.getY(i) > yMin) cand.push(i);
  }
  const out = [];
  for (let n = 0; n < count && cand.length; n++) {
    const i = cand[Math.floor(rnd() * cand.length)];
    out.push({ x: hx + pos.getX(i), y: hy + pos.getY(i), z: hz + pos.getZ(i), r: rnd() });
  }
  return out;
}

/** Bãi nung gốm lộ thiên: nồi úp trên nền đất, phủ củi rơm thành đống. */
export function openFiring(SM, potFn, { r = 1.1, seed = 15 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const p = potFn(i);
    p.rotation.x = Math.PI;
    p.position.set(Math.cos(a) * r * 0.45, 0.24, Math.sin(a) * r * 0.45);
    g.add(p);
  }
  const stick = new THREE.CylinderGeometry(0.025, 0.035, 1.6, 5);
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2;
    const m = new THREE.Mesh(stick, SM.pole);
    m.position.set(Math.cos(a) * r * 0.6, 0.45, Math.sin(a) * r * 0.6);
    m.rotation.set(0, -a, 0);
    m.rotateZ(Math.PI / 2 - 0.55 - rnd() * 0.3);
    g.add(m);
  }
  const straw = new THREE.Mesh(new THREE.ConeGeometry(r, 0.9, 16, 1, true), SM.dryLeaf);
  straw.position.y = 0.45;
  g.add(straw);
  return shadows(g);
}
