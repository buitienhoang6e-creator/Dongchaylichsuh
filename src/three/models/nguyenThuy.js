import * as THREE from 'three';
import { createNoise2D, fbm, mulberry32 } from '../noise.js';

/**
 * MÔ HÌNH THỜI NGUYÊN THỦY (dựng bằng mã nguồn)
 * ------------------------------------------------------------
 * - Núi đá vôi có hang / mái đá (karst), vân đá vôi vẽ bằng canvas.
 * - Người tối cổ (Homo erectus) và Người tinh khôn (Homo sapiens): khung xương có khớp,
 *   đặt được nhiều tư thế (đứng, ngồi xổm ghè đá, ngồi sưởi, quỳ mài rìu, với hái quả…).
 * - Công cụ và đồ dùng: rìu tay, hòn ghè, cuội, rìu mài lưỡi, bàn mài, nồi gốm, vỏ ốc…
 * Đơn vị: mét.
 */

const V3 = THREE.Vector3;

/* ================================================================== */
/* Vật liệu                                                            */
/* ================================================================== */
function limestoneTexture(seed = 5) {
  const N = 512;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(N, N);
  const nA = createNoise2D(seed);
  const nB = createNoise2D(seed + 7);
  // ghép 4 mẫu để vân lặp lại không thấy đường nối
  const tile = (fn, u, v) => fn(u, v) * (1 - u) * (1 - v) + fn(u - 1, v) * u * (1 - v) + fn(u, v - 1) * (1 - u) * v + fn(u - 1, v - 1) * u * v;
  const mottle = (u, v) => fbm(nA, u * 6, v * 6, 3);
  const streak = (u, v) => fbm(nB, u * 10, v * 1.2, 2);
  const pits = (u, v) => nA(u * 70 + 13, v * 70);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const u = x / N;
      const v = y / N;
      let g = 0.56 + tile(mottle, u, v) * 0.16;
      const s = tile(streak, u, v);
      if (s > 0.18) g -= (s - 0.18) * 0.55; // vệt nước chảy dọc vách đá
      if (tile(pits, u, v) > 0.55) g -= 0.12;
      g = Math.max(0.18, Math.min(0.92, g));
      const k = (y * N + x) * 4;
      img.data[k] = g * 255;
      img.data[k + 1] = g * 248;
      img.data[k + 2] = g * 236;
      img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Vật liệu đá vôi xám có vệt nước, gồ ghề (dùng chung cho mọi núi trong cảnh). */
export function limestoneMaterial(engine, seed = 5) {
  if (engine.__limestone) return engine.__limestone;
  const canvas = limestoneTexture(seed);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = engine.maxAniso;
  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: 3, roughness: 0.93, metalness: 0, vertexColors: true });
  engine.__limestone = mat;
  return mat;
}

export function primitiveMaterials() {
  const m = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });
  return {
    skinErectus: m(0x553522, 0.82),
    skinSapiens: m(0x7e5236, 0.72),
    hairErectus: m(0x2a1c13, 0.95),
    hairSapiens: m(0x15100c, 0.9),
    eye: m(0x0d0a08, 0.3),
    hide: m(0x8a6644, 0.92),
    hideDark: m(0x5e4128, 0.92),
    bark: m(0x9c8158, 0.95),
    flint: m(0x6a6259, 0.55, { flatShading: true }),
    basalt: m(0x45423e, 0.6, { flatShading: true }),
    pebble: m(0x8a8378, 0.7),
    polished: m(0x4d544e, 0.32),
    sandstone: m(0xa48d6c, 0.95),
    pottery: m(0x8c5a3a, 0.95),
    potteryDark: m(0x4a3226, 0.95),
    shell: m(0xe6dbc4, 0.6),
    wood: m(0x6b4a2e, 0.9),
    woodBurnt: m(0x2c2119, 0.95),
    bone: m(0xe0d4b8, 0.7),
    ash: m(0x4a4540, 1),
    leaf: m(0x3e6a2c, 0.8, { side: THREE.DoubleSide }),
    leafDark: m(0x2d5223, 0.8, { side: THREE.DoubleSide }),
    gourd: m(0x9bab4a, 0.6),
    fruit: m(0xc9682c, 0.55),
    soil: m(0x4f3a28, 1),
  };
}

const shadows = (obj, cast = true) => {
  obj.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = cast;
      c.receiveShadow = true;
    }
  });
  return obj;
};
const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(geo, mat);
  o.position.set(x, y, z);
  return o;
};

/* ================================================================== */
/* Núi đá vôi (có thể có hang / mái đá)                                */
/* ================================================================== */
const angDiff = (a, b) => {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

/**
 * Núi đá vôi vách dựng, đỉnh tròn. `cave` = { dir (góc, rad), halfAng, h, depth } khoét một
 * cửa hang / mái đá ở chân núi. Trả về { mesh, heightAt(xLocal, zLocal), caveFloor(xLocal, zLocal) }.
 */
export function karstHill(engine, { R = 40, H = 60, k = 3, seed = 1, cave, NA = 72, NY = 40 } = {}) {
  const noise = createNoise2D(seed);
  const Rth = (th) => R * (1 + 0.2 * fbm(noise, Math.cos(th) * 1.3 + 5, Math.sin(th) * 1.3 + 5, 3));
  const prof = (t) => Math.pow(Math.max(0, 1 - Math.pow(Math.min(1, t), k)), 1 / k);
  const carve = (th, y) => {
    if (!cave || y > cave.h) return 0;
    const d = Math.abs(angDiff(th, cave.dir));
    if (d > cave.halfAng) return 0;
    const ga = Math.pow(Math.cos((d / cave.halfAng) * (Math.PI / 2)), 0.6);
    const gy = Math.sqrt(Math.max(0, 1 - (Math.max(0, y) / cave.h) ** 2));
    return ga * gy;
  };
  const pos = [];
  const col = [];
  const uv = [];
  const Y0 = -4;
  for (let j = 0; j <= NY; j++) {
    const y = Y0 + (j / NY) * (H - Y0);
    for (let i = 0; i <= NA; i++) {
      const th = (i / NA) * Math.PI * 2;
      // mọi nhiễu đều tính theo (cos, sin) để mép nối 0 = 2π khớp nhau
      const cx = Math.cos(th);
      const sz = Math.sin(th);
      let r = Rth(th) * prof(Math.max(0, y) / H);
      r += fbm(noise, cx * 3 + y * 0.05, sz * 3 + y * 0.05, 3) * R * 0.07;
      r += fbm(noise, cx * 9 + y * 0.35, sz * 9 - y * 0.2, 2) * R * 0.018;
      r *= 1 + 0.035 * Math.sin(y * 0.8 + fbm(noise, cx * 1.5 + 20, sz * 1.5 + y * 0.1, 2) * 4); // gờ đá nằm ngang
      const c = carve(th, y);
      if (c > 0) r = Math.max(r * 0.2, r - cave.depth * c);
      r = Math.max(0, r);
      pos.push(Math.cos(th) * r, y, Math.sin(th) * r);
      uv.push((th * R) / 7, y / 7);
      // màu đỉnh: tối trong hang, rêu xanh ở chân núi, sáng dần lên cao
      let tone = 0.68 + fbm(noise, cx * 4 + 40, sz * 4 + y * 0.08, 2) * 0.2 + Math.min(0.08, (y / H) * 0.1);
      tone *= 1 - 0.82 * c;
      const moss = Math.max(0, 1 - y / 6) * 0.35 + Math.max(0, fbm(noise, cx * 3 + 60, sz * 3 + y * 0.06, 2)) * 0.25;
      col.push(tone * (1 - moss * 0.35), tone * (1 - moss * 0.12), tone * (1 - moss * 0.45), c);
    }
  }
  const idx = [];
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NA; i++) {
      const a = j * (NA + 1) + i;
      const b = a + 1;
      const c2 = a + NA + 1;
      const d = c2 + 1;
      idx.push(a, c2, b, b, c2, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  // Cây bụi bám trên gờ đá và đỉnh núi (nơi mặt đá thoải), vách dựng để lộ đá xám
  const nor = geo.attributes.normal;
  const rgb = new Float32Array((col.length / 4) * 3);
  for (let i = 0; i < col.length / 4; i++) {
    const y = pos[i * 3 + 1];
    const th = Math.atan2(pos[i * 3 + 2], pos[i * 3]);
    const patchy = 0.55 + fbm(noise, Math.cos(th) * 5 + y * 0.12, Math.sin(th) * 5 - y * 0.1, 2) * 0.9;
    let veg = THREE.MathUtils.smoothstep(nor.getY(i), 0.3, 0.68) * patchy + THREE.MathUtils.smoothstep(y / H, 0.72, 0.95) * 0.5;
    veg = Math.min(1, Math.max(0, veg)) * (1 - col[i * 4 + 3]);
    const sh = 0.75 + patchy * 0.25;
    rgb[i * 3] = THREE.MathUtils.lerp(col[i * 4], 0.3 * sh, veg);
    rgb[i * 3 + 1] = THREE.MathUtils.lerp(col[i * 4 + 1], 0.48 * sh, veg);
    rgb[i * 3 + 2] = THREE.MathUtils.lerp(col[i * 4 + 2], 0.2 * sh, veg);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(rgb, 3));
  const m = new THREE.Mesh(geo, limestoneMaterial(engine));
  m.castShadow = true;
  m.receiveShadow = true;
  // Độ cao mặt núi gần đúng (để người xem không đi xuyên vào núi); trong hang trả về -Infinity
  const heightAt = (x, z) => {
    const d = Math.hypot(x, z);
    const th = Math.atan2(z, x);
    const rr = Rth(th);
    if (d >= rr) return -Infinity;
    if (cave) {
      const ad = Math.abs(angDiff(th, cave.dir));
      if (ad < cave.halfAng * 0.85 && d > rr - cave.depth * Math.pow(Math.cos((ad / cave.halfAng) * (Math.PI / 2)), 0.6) * 0.9) return -Infinity;
    }
    return H * Math.pow(1 - Math.pow(d / rr, k), 1 / k);
  };
  return { mesh: m, heightAt, Rth, R, H, cave };
}

/* Người, con vật: xem nguoiCo.js (giữ tên cũ để các cảnh dùng chung) */
export { animateFigures, bakeFigure, earlyHuman, hold, humanMaterials, POSES, quadruped } from './nguoiCo.js';

/* ================================================================== */
/* Công cụ, đồ dùng                                                    */
/* ================================================================== */
function jitter(geo, amt, seed) {
  const rnd = mulberry32(seed);
  const p = geo.attributes.position;
  const seen = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    if (!seen.has(key)) seen.set(key, [(rnd() - 0.5) * amt, (rnd() - 0.5) * amt, (rnd() - 0.5) * amt]);
    const [a, b, c] = seen.get(key);
    p.setXYZ(i, p.getX(i) + a, p.getY(i) + b, p.getZ(i) + c);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Rìu tay: hòn đá ghè đẽo hai mặt, hình giọt nước, còn rõ các vết ghè. */
export function handAxe(PM, { seed = 1, size = 1 } = {}) {
  const g = jitter(new THREE.IcosahedronGeometry(0.06, 1), 0.012, seed);
  g.scale(0.78 * size, 1.4 * size, 0.42 * size);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setX(i, p.getX(i) * (1 - p.getY(i) * 4));
  g.computeVertexNormals();
  return shadows(mesh(g, PM.flint));
}

/** Công cụ chặt (chopper): hòn cuội ghè vài nhát ở một đầu tạo lưỡi. */
export function chopper(PM, { seed = 1, size = 1, mat } = {}) {
  const g = new THREE.IcosahedronGeometry(0.07, 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getX(i) > 0.015) p.setX(i, 0.015 + (p.getX(i) - 0.015) * 0.25);
  jitter(g, 0.01, seed);
  g.scale(size, 0.72 * size, 0.88 * size);
  return shadows(mesh(g, mat || PM.basalt));
}

/** Hòn cuội trơn ven suối. */
export function pebble(PM, { r = 0.06, seed = 1 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.SphereGeometry(r, 10, 8);
  g.scale(1, 0.55 + rnd() * 0.25, 0.75 + rnd() * 0.25);
  return shadows(mesh(g, PM.pebble));
}

/** Rìu mài lưỡi (văn hóa Bắc Sơn): đá mài nhẵn ở phần lưỡi. */
export function polishedAxe(PM) {
  const g = new THREE.BoxGeometry(0.065, 0.13, 0.028, 2, 4, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    p.setX(i, p.getX(i) * (y > 0 ? 0.72 : 1));
    if (y < -0.04) p.setZ(i, p.getZ(i) * 0.25); // lưỡi mài mỏng, sắc
  }
  g.computeVertexNormals();
  return shadows(mesh(g, PM.polished));
}

/** Bàn mài bằng đá cát, mặt lõm do mài lâu ngày. */
export function grindingStone(PM) {
  const g = new THREE.BoxGeometry(0.75, 0.2, 0.46, 10, 1, 6);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    if (p.getY(i) > 0) p.setY(i, p.getY(i) - 0.045 * Math.cos((p.getX(i) / 0.75) * Math.PI) * Math.cos((p.getZ(i) / 0.46) * Math.PI));
  }
  jitter(g, 0.02, 4);
  return shadows(mesh(g, PM.sandstone));
}

/** Nồi gốm thô đáy tròn, miệng loe (văn hóa Bắc Sơn). */
export function pot(PM, { r = 0.15, h = 0.2, seed = 1, dark = false } = {}) {
  const rnd = mulberry32(seed);
  const w = 1 + (rnd() - 0.5) * 0.15;
  const pts = [
    [0.001, 0],
    [r * 0.55, h * 0.03],
    [r * 0.92, h * 0.22],
    [r * w, h * 0.48],
    [r * 0.86, h * 0.76],
    [r * 0.7, h * 0.86],
    [r * 0.78, h * 0.97],
    [r * 0.82, h],
    [r * 0.74, h * 0.98],
    [r * 0.64, h * 0.86],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, 20);
  jitter(g, 0.006, seed);
  const mat = dark ? PM.potteryDark : PM.pottery;
  const m = mesh(g, mat);
  m.material = mat.clone();
  m.material.side = THREE.DoubleSide;
  return shadows(m);
}

/** Đống vỏ ốc núi, ốc suối (dấu tích bữa ăn trong hang văn hóa Hòa Bình). */
export function shellMidden(PM, { r = 1.1, h = 0.45, count = 260, seed = 3 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.ConeGeometry(0.022, 0.05, 7);
  g.translate(0, 0.02, 0);
  const im = new THREE.InstancedMesh(g, PM.shell, count);
  const o = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r;
    o.position.set(Math.cos(a) * d, h * (1 - (d / r) ** 2) * (0.85 + rnd() * 0.2), Math.sin(a) * d);
    o.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    o.scale.setScalar(0.8 + rnd() * 0.7);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    im.setColorAt(i, c.setHSL(0.09 + rnd() * 0.05, 0.25 + rnd() * 0.2, 0.55 + rnd() * 0.3));
  }
  const grp = new THREE.Group();
  const mound = mesh(new THREE.SphereGeometry(r * 0.95, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), PM.ash);
  mound.scale.y = (h * 0.85) / r;
  grp.add(mound, im);
  return shadows(grp);
}

/** Bếp lửa: vòng đá quây, tro than, vài khúc củi. */
export function hearth(PM, { r = 0.65, seed = 2 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const ash = mesh(new THREE.CircleGeometry(r, 20), PM.ash, 0, 0.02, 0);
  ash.rotation.x = -Math.PI / 2;
  g.add(ash);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const s = pebble(PM, { r: 0.1 + rnd() * 0.05, seed: seed * 10 + i });
    s.position.set(Math.cos(a) * r, 0.04, Math.sin(a) * r);
    s.rotation.y = rnd() * 3;
    g.add(s);
  }
  for (let i = 0; i < 4; i++) {
    const log = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 7), PM.woodBurnt);
    log.rotation.z = Math.PI / 2 - 0.25;
    log.rotation.y = (i / 4) * Math.PI * 2 + 0.3;
    log.position.y = 0.12;
    g.add(log);
  }
  return shadows(g);
}

/** Vài khúc xương thú quanh bếp (dấu tích săn bắt). */
export function bones(PM, { count = 6, spread = 0.8, seed = 9 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const b = new THREE.Group();
    const len = 0.18 + rnd() * 0.22;
    b.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, len, 6), PM.bone));
    b.add(mesh(new THREE.SphereGeometry(0.03, 6, 5), PM.bone, 0, len / 2, 0));
    b.add(mesh(new THREE.SphereGeometry(0.03, 6, 5), PM.bone, 0, -len / 2, 0));
    b.rotation.set(Math.PI / 2, rnd() * 6, 0);
    b.position.set((rnd() - 0.5) * spread * 2, 0.03, (rnd() - 0.5) * spread * 2);
    g.add(b);
  }
  return shadows(g);
}

/** Giáo gỗ vót nhọn (có thể gắn mũi đá). */
export function spear(PM, { L = 2, stoneTip = false } = {}) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.018, 0.022, L, 6), PM.wood, 0, 0, 0));
  if (stoneTip) {
    const tip = handAxe(PM, { seed: 7, size: 0.55 });
    tip.position.y = L / 2 + 0.05;
    g.add(tip);
  } else {
    g.add(mesh(new THREE.ConeGeometry(0.018, 0.16, 6), PM.woodBurnt, 0, L / 2 + 0.08, 0));
  }
  return shadows(g);
}

/** Gậy chọc lỗ, đào củ. */
export function diggingStick(PM) {
  const g = mesh(new THREE.CylinderGeometry(0.014, 0.02, 1.1, 6), PM.wood);
  return shadows(g);
}

/** Tấm da thú trải dưới đất. */
export function hideRug(PM, { w = 1.4, d = 1, seed = 4 } = {}) {
  const rnd = mulberry32(seed);
  const shape = new THREE.Shape();
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 0.8 + rnd() * 0.3;
    const x = (Math.cos(a) * w * k) / 2;
    const y = (Math.sin(a) * d * k) / 2;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const g = new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  const m = mesh(g, PM.hide, 0, 0.025, 0);
  m.receiveShadow = true;
  return m;
}

/** Quả rừng hái về để trên lá. */
export function fruitPile(PM, { count = 9, seed = 6 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const leaf = mesh(new THREE.CircleGeometry(0.32, 10), PM.leaf, 0, 0.02, 0);
  leaf.rotation.x = -Math.PI / 2;
  leaf.scale.set(1, 1.5, 1);
  g.add(leaf);
  for (let i = 0; i < count; i++) {
    const a = rnd() * 6.28;
    const d = Math.sqrt(rnd()) * 0.2;
    g.add(mesh(new THREE.SphereGeometry(0.04 + rnd() * 0.02, 8, 6), PM.fruit, Math.cos(a) * d, 0.06 + rnd() * 0.04, Math.sin(a) * d));
  }
  return shadows(g);
}

/** Mảnh tước, mảnh vỡ rải quanh chỗ ghè đá. */
export function flakes(PM, { count = 40, spread = 0.7, seed = 11, mat } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.TetrahedronGeometry(0.025, 0);
  g.scale(1, 0.35, 1.4);
  const im = new THREE.InstancedMesh(g, mat || PM.basalt, count);
  const o = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = rnd() * 6.28;
    const d = Math.sqrt(rnd()) * spread;
    o.position.set(Math.cos(a) * d, 0.01, Math.sin(a) * d);
    o.rotation.set((rnd() - 0.5) * 0.6, rnd() * 6, (rnd() - 0.5) * 0.6);
    o.scale.setScalar(0.6 + rnd() * 1.2);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  }
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

/** Bãi cuội ven suối (InstancedMesh). */
export function cobbleBank(PM, points, { seed = 13 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.SphereGeometry(1, 9, 7);
  const im = new THREE.InstancedMesh(g, PM.pebble, points.length);
  const o = new THREE.Object3D();
  const c = new THREE.Color();
  points.forEach((p, i) => {
    const r = 0.05 + rnd() * 0.14;
    o.position.set(p.x, p.y + r * 0.3, p.z);
    o.rotation.set(rnd(), rnd() * 6, rnd());
    o.scale.set(r, r * (0.5 + rnd() * 0.3), r * (0.7 + rnd() * 0.3));
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    const v = 0.75 + rnd() * 0.4;
    im.setColorAt(i, c.setRGB(v, v * 0.97, v * 0.92));
  });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

/** Vạt đất trồng trọt sơ khai: luống rau, củ, giàn bầu bí leo cọc tre. */
export function gardenPlot(PM, { w = 9, d = 6, seed = 21 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const soil = mesh(new THREE.PlaneGeometry(w, d, 1, 1), PM.soil, 0, 0.03, 0);
  soil.rotation.x = -Math.PI / 2;
  soil.receiveShadow = true;
  g.add(soil);
  // luống cây thấp: mỗi khóm vài lá
  const leafGeo = new THREE.PlaneGeometry(0.18, 0.32);
  leafGeo.translate(0, 0.16, 0);
  const rows = Math.floor(d / 0.9);
  const per = Math.floor(w / 0.55);
  const count = rows * per * 5;
  const im = new THREE.InstancedMesh(leafGeo, PM.leaf, count);
  const o = new THREE.Object3D();
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < per; c++) {
      const x = -w / 2 + 0.3 + c * 0.55 + (rnd() - 0.5) * 0.1;
      const z = -d / 2 + 0.45 + r * 0.9;
      for (let l = 0; l < 5; l++) {
        o.position.set(x, 0.03, z);
        o.rotation.set(-0.5 - rnd() * 0.4, (l / 5) * Math.PI * 2 + rnd(), 0, 'YXZ');
        o.scale.setScalar(0.7 + rnd() * 0.6);
        o.updateMatrix();
        im.setMatrixAt(k++, o.matrix);
      }
    }
  }
  im.castShadow = true;
  g.add(im);
  // giàn bầu bí ở một đầu ruộng
  const stakeGeo = new THREE.CylinderGeometry(0.025, 0.03, 1.6, 5);
  for (let i = 0; i < 6; i++) {
    const x = -w / 2 + 0.6 + i * ((w - 1.2) / 5);
    g.add(mesh(stakeGeo, PM.wood, x, 0.8, d / 2 + 0.4));
    const vine = mesh(new THREE.SphereGeometry(0.35, 8, 6), PM.leafDark, x, 1.35, d / 2 + 0.4);
    vine.scale.set(1.3, 0.6, 0.8);
    g.add(vine);
    const gourd = new THREE.LatheGeometry(
      [[0.001, 0], [0.09, 0.03], [0.12, 0.12], [0.07, 0.24], [0.05, 0.3], [0.06, 0.36], [0.03, 0.42], [0.001, 0.43]].map(([a, b]) => new THREE.Vector2(a, b)),
      12,
    );
    const gm = mesh(gourd, PM.gourd, x + 0.12, 0.5 + rnd() * 0.4, d / 2 + 0.45);
    gm.rotation.z = Math.PI;
    g.add(gm);
  }
  // vài quả bầu đã hái
  for (let i = 0; i < 3; i++) {
    const s = mesh(new THREE.SphereGeometry(0.12, 10, 8), PM.gourd, w / 2 - 0.4 - i * 0.3, 0.1, -d / 2 - 0.4);
    s.scale.set(1, 0.8, 1.3);
    g.add(s);
  }
  return shadows(g);
}

/** Mộ táng: hố chôn đắp đất thấp, quây đá, đặt công cụ và đồ gốm theo người chết. */
export function burial(PM, { seed = 31 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const mound = mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), PM.soil);
  mound.scale.set(1.1, 0.22, 0.7);
  g.add(mound);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const s = pebble(PM, { r: 0.1 + rnd() * 0.06, seed: 300 + i });
    s.position.set(Math.cos(a) * 1.25, 0.04, Math.sin(a) * 0.85);
    g.add(s);
  }
  const ax = polishedAxe(PM);
  ax.rotation.set(Math.PI / 2, 0, 0.4);
  ax.position.set(0.25, 0.24, 0.05);
  g.add(ax);
  const p = pot(PM, { r: 0.09, h: 0.12, seed: 5 });
  p.position.set(-0.35, 0.18, 0);
  g.add(p);
  return shadows(g);
}
