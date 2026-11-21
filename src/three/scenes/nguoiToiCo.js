import * as THREE from 'three';
import { createNoise2D, fbm, mulberry32, smoothstep } from '../noise.js';
import { HeightField, createWater, distToPolyline, groundMaterial, sampleLoop, terrainMesh } from '../terrain.js';
import { bambooGroves, fire, grassField, groundMist } from '../builders.js';
import { farForest, inBox, inRing, plant, samplePoints } from '../scatter.js';
import {
  animateFigures,
  bakeFigure,
  bones,
  chopper,
  cobbleBank,
  diggingStick,
  earlyHuman,
  flakes,
  fruitPile,
  handAxe,
  hearth,
  hold,
  humanMaterials,
  karstHill,
  pebble,
  primitiveMaterials,
  quadruped,
  spear,
} from '../models/nguyenThuy.js';
import { bananaPlants, ledgePoints, sceneryMaterials, smoke, stalactites, taroPlants, vines } from '../models/canhVat.js';

/**
 * MÔ PHỎNG BẦY NGƯỜI TỐI CỔ BÊN HANG ĐÁ VÔI (khoảng 40 – 30 vạn năm trước)
 * Hang đá vôi như vùng Thẩm Khuyên, Thẩm Hai (Lạng Sơn); bãi ghè đá như di chỉ Núi Đọ (Thanh Hóa).
 */
export const meta = {
  title: 'Bầy Người tối cổ bên hang đá vôi',
  subtitle: 'Dấu tích Người tối cổ trên đất Việt Nam — khoảng 40 – 30 vạn năm trước',
  note: 'Mô phỏng minh họa tổng hợp: hang đá vôi như vùng Thẩm Khuyên, Thẩm Hai (Lạng Sơn) và bãi ghè đá như di chỉ Núi Đọ (Thanh Hóa) được đặt chung một cảnh. Hình dáng, cách che thân của Người tối cổ là hình dung dựa trên hiểu biết khoa học hiện nay.',
};

const WATER = -0.6;
const FLOOR = 2.2; // nền bãi đất trước hang và nền hang
const lerp = THREE.MathUtils.lerp;

export async function build(engine, { onStatus } = {}) {
  const q = engine.q;
  const scene = engine.scene;
  onStatus?.('Đang dựng bầu trời buổi sớm…');
  // ánh sáng môi trường yếu để trong hang tối hẳn, chỉ còn ánh lửa
  await engine.sky('/3d/hdri/qwantani_dawn_puresky_2k.hdr', { intensity: 0.5, bgIntensity: 1, sunIntensity: 3.4, sunColor: 0xffc890 });
  // Không khí hoang sơ, âm u: sương dày, màu trầm, tối góc ảnh; lửa trong hang tỏa sáng
  engine.renderer.toneMappingExposure = 0.95;
  scene.fog = new THREE.FogExp2(0xbdb6a6, 0.0023);
  scene.add(new THREE.HemisphereLight(0xd8cdb8, 0x3a3326, 0.24));
  engine.post({ bloom: { strength: 0.6, radius: 0.55, threshold: 0.82 }, grade: { sat: 0.86, contrast: 1.1, warm: 0.03, vignette: 0.45, lift: -0.012 } });

  /* ---------------- Núi đá vôi ---------------- */
  onStatus?.('Đang dựng núi đá vôi và hang động…');
  const noise = createNoise2D(71);
  const noiseB = createNoise2D(73);
  const base = (x, z) => 1.8 + fbm(noise, x * 0.008, z * 0.008, 4) * 2.4 + fbm(noise, x * 0.04, z * 0.04, 2) * 0.3;
  const HILLS = [
    { x: 0, z: -52, R: 34, H: 54, seed: 3, cave: { dir: Math.PI / 2, halfAng: 0.36, h: 12, depth: 16 } },
    { x: -64, z: -40, R: 24, H: 62, seed: 5 },
    { x: 60, z: -62, R: 28, H: 70, seed: 7 },
    { x: -92, z: 34, R: 20, H: 46, seed: 9 },
    { x: 90, z: 16, R: 22, H: 52, seed: 11 },
    { x: 22, z: -124, R: 34, H: 84, seed: 13 },
    { x: -46, z: -120, R: 30, H: 66, seed: 15 },
  ].map((h, i) => ({ ...h, kh: karstHill(engine, h), level: i === 0 ? FLOOR : base(h.x, h.z) }));
  const main = HILLS[0];
  const M = main.z + main.kh.Rth(Math.PI / 2) * 0.96; // mép cửa hang
  const CAVE_IN = M - 6; // giữa hang, nơi đốt lửa

  const SIZE = 400;
  const hf = new HeightField(SIZE, q.terrainStep);
  hf.fill(base);
  const n = hf.n;
  const blocked = new Uint8Array(n * n);
  const cellX = (k) => hf.xAt(k % n);
  const cellZ = (k) => hf.xAt(Math.floor(k / n));

  const CLEAR = { x: 2, z: M + 16, rx: 34, rz: 26 };
  for (let k = 0; k < n * n; k++) {
    const x = cellX(k);
    const z = cellZ(k);
    let h = hf.h[k];
    const c = 1 - smoothstep(0.6, 1, Math.hypot((x - CLEAR.x) / CLEAR.rx, (z - CLEAR.z) / CLEAR.rz));
    h = lerp(h, FLOOR + fbm(noiseB, x * 0.05, z * 0.05, 2) * 0.18, c);
    for (const hl of HILLS) {
      const f = 1 - smoothstep(hl.R * 0.85, hl.R + 9, Math.hypot(x - hl.x, z - hl.z));
      h = lerp(h, hl.level, f);
      if (f > 0.5) blocked[k] = 1;
    }
    hf.h[k] = h;
    const patch = fbm(noiseB, x * 0.03, z * 0.03, 3);
    hf.dirt[k] = Math.max(c * (0.45 + fbm(noiseB, x * 0.12, z * 0.12, 2) * 0.4), patch > 0.3 ? (patch - 0.3) * 1.4 : 0);
  }
  // Chân núi chính và nền hang là đất đá
  hf.alongLine(sampleLoop([[-14, M - 2], [0, M - 4], [14, M - 2]], 20, false), 16, (k, d) => {
    hf.dirt[k] = Math.max(hf.dirt[k], 0.9 * (1 - smoothstep(6, 16, d)));
  });
  // Suối chảy ngang phía trước
  const stream = sampleLoop([[-260, 70], [-150, 62], [-70, 74], [-10, 64], [60, 76], [140, 64], [260, 80]], 300, false);
  hf.alongLine(stream, 16, (k, d) => {
    hf.h[k] = lerp(hf.h[k], WATER - 1.4, 1 - smoothstep(4, 12, d));
    hf.dirt[k] = Math.max(hf.dirt[k], 1 - smoothstep(6, 14, d));
    if (d < 9) blocked[k] = 1;
  });
  // Lối mòn từ hang xuống suối
  const trail = sampleLoop([[0, M + 2], [4, M + 20], [9, M + 40], [12, 60]], 80, false);
  hf.alongLine(trail, 3, (k, d) => {
    hf.dirt[k] = Math.max(hf.dirt[k], 0.9 * (1 - smoothstep(1, 3, d)));
  });

  const groundAt = (x, z) => (Math.abs(x) < SIZE / 2 && Math.abs(z) < SIZE / 2 ? Math.max(hf.get(x, z), WATER - 0.4) : farHeight(x, z));
  const heightAt = (x, z) => {
    let g = groundAt(x, z);
    for (const hl of HILLS) {
      const y = hl.kh.heightAt(x - hl.x, z - hl.z);
      if (y > -Infinity) g = Math.max(g, hl.level - 0.6 + y);
    }
    return g;
  };
  const isBlocked = (x, z) => {
    const i = Math.round((x + hf.half) / hf.step);
    const j = Math.round((z + hf.half) / hf.step);
    if (i < 0 || j < 0 || i >= n || j >= n) return false;
    return blocked[j * n + i] === 1;
  };

  scene.add(terrainMesh(hf, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'forrest_ground_01', repeat: SIZE / 6 }), { tintSeed: 17 }));
  function farHeight(x, z) {
    const r = Math.hypot(x, z);
    const ds = distToPolyline(stream, x, z);
    return base(x, z) + smoothstep(260, 1200, r) * (20 + 60 * Math.max(0, fbm(noiseB, x * 0.002, z * 0.002, 4) + 0.3)) - 3.4 * (1 - smoothstep(4, 12, ds));
  }
  const far = new HeightField(3200, 20);
  far.fill((x, z) => {
    const e = Math.max(Math.abs(x), Math.abs(z));
    if (e < SIZE / 2 - 16) return farHeight(x, z) - 14;
    if (e < SIZE / 2 + 12) return farHeight(x, z) - 0.4;
    return farHeight(x, z);
  });
  far.dirt.fill(0.1);
  const farMesh = terrainMesh(far, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'forrest_ground_01', repeat: 3200 / 9 }), { tintSeed: 5 });
  farMesh.receiveShadow = false;
  scene.add(farMesh);
  scene.add(createWater(engine, { size: 3200, level: WATER, color: 0x3a4a3a, distortion: 1.4 }));

  for (const hl of HILLS) {
    hl.kh.mesh.position.set(hl.x, hl.level - 0.6, hl.z);
    scene.add(hl.kh.mesh);
  }
  // Bóng tối phủ nền hang (càng vào sâu càng tối)
  {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 40, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.85)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const shade = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: true }));
    shade.rotation.x = -Math.PI / 2;
    const w = main.kh.Rth(Math.PI / 2) * main.cave.halfAng * 2.6;
    shade.scale.set(w, main.cave.depth * 1.9, 1);
    shade.position.set(main.x, FLOOR + 0.06, M - main.cave.depth * 0.55);
    shade.renderOrder = 1;
    scene.add(shade);
  }
  // Nhũ đá ở vòm cửa hang, dây leo buông từ vách, cây bụi bám trên gờ đá
  const SM = sceneryMaterials();
  scene.add(stalactites(main.kh, { hx: main.x, hy: main.level - 0.6, hz: main.z, count: 34 }));
  const vineAnchors = [];
  const vr = mulberry32(31);
  for (let i = 0; i < 18; i++) {
    const u = (vr() * 2 - 1) * 1.3;
    const a = Math.PI / 2 + u * main.cave.halfAng;
    const rr = main.kh.Rth(a) * 0.98;
    vineAnchors.push({ x: main.x + Math.cos(a) * rr, y: main.level + main.cave.h * (0.9 + vr() * 0.9), z: main.z + Math.sin(a) * rr + 0.6, len: 3 + vr() * 7 });
  }
  for (const hl of HILLS.slice(1, 5)) {
    for (let i = 0; i < 5; i++) {
      const a = Math.atan2(-hl.z, -hl.x) + (vr() - 0.5) * 1.6;
      const rr = hl.kh.Rth(a) * 0.97;
      vineAnchors.push({ x: hl.x + Math.cos(a) * rr, y: hl.level + 8 + vr() * hl.H * 0.4, z: hl.z + Math.sin(a) * rr, len: 4 + vr() * 9 });
    }
  }
  scene.add(vines(SM, vineAnchors));
  const ledge = [];
  HILLS.slice(0, 5).forEach((hl, i) => ledge.push(...ledgePoints(hl.kh, { hx: hl.x, hy: hl.level - 0.6, hz: hl.z, count: i === 0 ? 70 : 40, seed: 50 + i })));
  const ledgeY = new Map(ledge.map((p) => [`${p.x}|${p.z}`, p.y]));
  const onLedge = (x, z) => ledgeY.get(`${x}|${z}`);
  const halfL = Math.floor(ledge.length / 2);
  scene.add(await plant(engine, '/3d/models/shrub_02.glb', ledge.slice(0, halfL), onLedge, { scale: [1.4, 2.6], sink: 0.3 }));
  scene.add(await plant(engine, '/3d/models/fern_02.glb', ledge.slice(halfL), onLedge, { scale: [1.6, 2.8], sink: 0.2, cast: false }));
  // Rừng tháp đá vôi ở xa
  const rnd = mulberry32(5);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + rnd() * 0.18;
    const d = 230 + rnd() * 300;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const R = 20 + rnd() * 30;
    const kh = karstHill(engine, { R, H: R * (1.6 + rnd() * 1.3), seed: 100 + i, NA: 40, NY: 22 });
    kh.mesh.position.set(x, farHeight(x, z) - 3, z);
    kh.mesh.castShadow = false;
    scene.add(kh.mesh);
  }

  /* ---------------- Bầy người tối cổ ---------------- */
  onStatus?.('Đang đưa bầy người tối cổ về hang…');
  const PM = primitiveMaterials();
  const HM = humanMaterials();
  const anim = [];
  const put = (obj, x, z, ry = 0, dy = 0) => {
    // gộp lưới của người/thú theo từng khớp cho nhẹ máy (khớp vẫn cử động được)
    if ((obj.userData.J || obj.userData.animal) && !obj.userData.baked) {
      bakeFigure(obj, false);
      obj.userData.baked = true;
    }
    obj.position.set(x, heightAt(x, z) + dy, z);
    obj.rotation.y = ry;
    scene.add(obj);
    return obj;
  };
  const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  const human = (opts, x, z, ry) => put(earlyHuman(HM, { kind: 'erectus', ...opts }), x, z, ry);

  // Bếp lửa giữa cửa hang, người ngồi sưởi quây quanh
  const F = { x: 0, z: CAVE_IN };
  put(hearth(PM, { r: 0.7 }), F.x, F.z);
  scene.add(fire(engine, { x: F.x, y: heightAt(F.x, F.z) + 0.1, z: F.z, size: 0.95 }));
  scene.add(smoke(engine, { x: F.x, y: heightAt(F.x, F.z) + 1.2, z: F.z, count: 16, rise: 0.7, size: 1.1, opacity: 0.3, height: 9 }));
  put(bones(PM, { count: 7, spread: 1.2 }), F.x + 1.6, F.z + 1.4);
  put(fruitPile(PM), F.x - 1.7, F.z + 1.5);
  [
    [Math.PI * 1.1, 'm', 1],
    [Math.PI * 1.45, 'f', 2],
    [Math.PI * 1.85, 'm', 3],
    [Math.PI * 0.2, 'f', 4],
  ].forEach(([a, sex, seed]) => {
    const x = F.x + Math.cos(a) * 1.75;
    const z = F.z + Math.sin(a) * 1.75;
    const p = human({ sex, pose: 'sit', seed }, x, z, face(x, z, F.x, F.z));
    anim.push({ fig: p, act: 'idle', phase: seed });
  });
  human({ sex: 'm', pose: 'child', scale: 0.62, seed: 5 }, F.x + 2.4, F.z - 1.4, face(F.x + 2.4, F.z - 1.4, F.x, F.z));
  // Người canh ở cửa hang cầm gậy nhọn
  const guard = earlyHuman(HM, { kind: 'erectus', sex: 'm', pose: 'spear', seed: 6 });
  hold(guard, 'R', spear(PM, { L: 2.1 }), { upright: true, offset: [0, -0.04, 0.02] });
  const G = { x: -6.5, z: M - 0.8 };
  put(guard, G.x, G.z, face(G.x, G.z, G.x + 1, G.z + 6));

  // Bãi ghè đá: hai người ngồi xổm ghè cuội, mảnh tước và công cụ rải quanh
  const KN = { x: 14, z: M + 9 };
  const k1 = earlyHuman(HM, { kind: 'erectus', sex: 'm', pose: 'knap', seed: 7 });
  hold(k1, 'R', pebble(PM, { r: 0.05, seed: 8 }));
  hold(k1, 'L', chopper(PM, { seed: 2 }), { offset: [0, -0.07, 0.03] });
  put(k1, KN.x, KN.z, face(KN.x, KN.z, KN.x - 2, KN.z + 0.6));
  anim.push({ fig: k1, act: 'knap' });
  const k2 = earlyHuman(HM, { kind: 'erectus', sex: 'f', pose: 'knap', seed: 9 });
  hold(k2, 'R', pebble(PM, { r: 0.05, seed: 10 }));
  hold(k2, 'L', handAxe(PM, { seed: 4 }), { offset: [0, -0.07, 0.03] });
  put(k2, KN.x - 2.6, KN.z + 0.9, face(KN.x - 2.6, KN.z + 0.9, KN.x, KN.z));
  anim.push({ fig: k2, act: 'knap', phase: 1.7 });
  const fk = flakes(PM, { count: 70, spread: 1.6 });
  fk.position.set(KN.x - 1.3, heightAt(KN.x - 1.3, KN.z + 0.4), KN.z + 0.4);
  scene.add(fk);
  // Phiến đá phẳng bày rìu tay, công cụ chặt đã làm xong
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.28, 0.75), PM.basalt);
  slab.castShadow = slab.receiveShadow = true;
  const SL = { x: KN.x + 1.8, z: KN.z - 1.6 };
  put(slab, SL.x, SL.z, 0.4, 0.12);
  const top = heightAt(SL.x, SL.z) + 0.27;
  for (let i = 0; i < 4; i++) {
    const t = i % 2 ? chopper(PM, { seed: 20 + i }) : handAxe(PM, { seed: 30 + i });
    t.rotation.set(i % 2 ? 0 : Math.PI / 2, i * 0.8, 0);
    t.position.set(SL.x - 0.35 + i * 0.24, top + 0.03, SL.z + (i % 2) * 0.12);
    scene.add(t);
  }
  const cobblePts = samplePoints({ count: 160, seed: 41, area: inRing(KN.x - 1, KN.z, 0.8, 7), accept: () => true }).map((p) => ({ ...p, y: heightAt(p.x, p.z) }));
  scene.add(cobbleBank(PM, cobblePts));

  // Hái lượm: một người với hái quả trên cây, một người đào củ
  const TREE = { x: -20, z: M + 12 };
  scene.add(await plant(engine, '/3d/models/island_tree_02.glb', [{ x: TREE.x, z: TREE.z, r: 0.4 }], heightAt, { scale: [0.75, 0.75], sink: 0.2 }));
  const g1 = earlyHuman(HM, { kind: 'erectus', sex: 'f', pose: 'reach', seed: 11 });
  hold(g1, 'L', pebble(PM, { r: 0.045, seed: 12 }));
  put(g1, TREE.x + 1.4, TREE.z + 1.2, face(TREE.x + 1.4, TREE.z + 1.2, TREE.x, TREE.z));
  const g2 = earlyHuman(HM, { kind: 'erectus', sex: 'f', pose: 'dig', seed: 13 });
  hold(g2, 'R', diggingStick(PM), { upright: true, offset: [0, -0.05, 0.02] });
  put(g2, TREE.x + 4.5, TREE.z + 4.2, 0.6);
  put(fruitPile(PM, { count: 7, seed: 14 }), TREE.x + 2.8, TREE.z + 2.6);

  // Thợ săn từ phía suối trở về hang
  const HU = { x: 8, z: M + 30 };
  const h1 = earlyHuman(HM, { kind: 'erectus', sex: 'm', pose: 'walk', seed: 15 });
  hold(h1, 'R', spear(PM, { L: 2.2 }), { upright: true, offset: [0, -0.04, 0.02], tilt: 0.25 });
  put(h1, HU.x, HU.z, Math.PI + 0.12);
  const h2 = earlyHuman(HM, { kind: 'erectus', sex: 'm', pose: 'carry', seed: 16 });
  hold(h2, 'R', spear(PM, { L: 2 }), { offset: [0, -0.02, 0.05] });
  hold(h2, 'L', handAxe(PM, { seed: 17 }));
  put(h2, HU.x + 2.4, HU.z + 2.2, Math.PI - 0.1);
  animateFigures(engine, anim);

  // Con hươu rừng cúi uống nước bên suối — con mồi của thợ săn
  const DEER = { x: -34, z: 58 };
  put(quadruped(HM, { kind: 'deer', pose: 'drink' }), DEER.x, DEER.z, face(DEER.x, DEER.z, -33, 70));

  /* ---------------- Cây cối ---------------- */
  onStatus?.('Đang trồng rừng và tre…');
  const corridor = (x, z) => x > -14 && x < 24 && z > M - 4 && z < M + 64;
  const flat = (x, z, minH = WATER + 0.9) => !isBlocked(x, z) && heightAt(x, z) > minH && hf.slope(x, z) < 0.3;
  const free = (x, z) => flat(x, z) && !corridor(x, z) && Math.hypot((x - CLEAR.x) / CLEAR.rx, (z - CLEAR.z) / CLEAR.rz) > 0.85;
  const trees = samplePoints({ count: Math.round(60 * q.trees), seed: 7, area: inBox(-190, -190, 190, 190), accept: free, minDist: 9 });
  scene.add(await plant(engine, '/3d/models/island_tree_02.glb', trees, heightAt, { scale: [0.7, 1.25], sink: 0.2 }));
  const shrubs = samplePoints({ count: Math.round(110 * q.trees), seed: 9, area: inBox(-190, -190, 190, 190), accept: (x, z) => free(x, z) || (flat(x, z) && Math.abs(x) > 26), minDist: 3 });
  const half = Math.floor(shrubs.length / 2);
  scene.add(await plant(engine, '/3d/models/shrub_02.glb', shrubs.slice(0, half), heightAt, { scale: [1.2, 2.4] }));
  scene.add(await plant(engine, '/3d/models/shrub_04.glb', shrubs.slice(half), heightAt, { scale: [1.2, 2.4] }));
  const ferns = samplePoints({ count: Math.round(140 * q.trees), seed: 15, area: inBox(-180, -180, 180, 180), accept: (x, z) => flat(x, z, WATER + 0.3) && !corridor(x, z) });
  scene.add(await plant(engine, '/3d/models/fern_02.glb', ferns, heightAt, { scale: [1.4, 2.6], cast: false }));
  // Đá lăn dưới chân núi
  const boulders = [];
  for (const hl of HILLS.slice(1)) {
    for (let i = 0; i < 4; i++) {
      const a = rnd() * Math.PI * 2;
      const x = hl.x + Math.cos(a) * (hl.R + 4 + rnd() * 5);
      const z = hl.z + Math.sin(a) * (hl.R + 4 + rnd() * 5);
      if (!corridor(x, z)) boulders.push({ x, z, r: rnd() });
    }
  }
  scene.add(await plant(engine, '/3d/models/boulder_01.glb', boulders, heightAt, { scale: [1.2, 2.6], sink: 0.4 }));
  // Rừng rậm nhiệt đới: chuối rừng, ráy lá to, thân cây đổ
  const jungle = (count, seed, minD = 3) =>
    samplePoints({ count, seed, area: inBox(-120, M - 40, 120, M + 80), accept: (x, z) => free(x, z) && Math.abs(x) > 18, minDist: minD }).map((p) => ({ ...p, y: heightAt(p.x, p.z) }));
  scene.add(bananaPlants(SM, jungle(Math.round(70 * q.trees), 61, 4)));
  scene.add(taroPlants(SM, jungle(Math.round(140 * q.trees), 62, 1.6), { size: 1.25 }));
  const logs = samplePoints({ count: 8, seed: 63, area: inBox(-60, M - 10, 60, M + 50), accept: (x, z) => free(x, z) }).map((p) => ({ ...p }));
  scene.add(await plant(engine, '/3d/models/dead_tree_trunk.glb', logs, heightAt, { scale: [0.8, 1.2], sink: 0.15 }));
  // Bụi tre ven suối
  const groves = samplePoints({ count: 26, seed: 19, area: inBox(-180, 30, 180, 110), accept: (x, z) => flat(x, z) && distToPolyline(stream, x, z) > 10 && distToPolyline(stream, x, z) < 30 && !corridor(x, z), minDist: 14 }).map((p) => ({ x: p.x, z: p.z, count: 16, r: 1.5 }));
  scene.add(bambooGroves(engine, groves, { heightAt, seed: 23 }));
  scene.add(
    grassField(engine, {
      count: Math.round(42000 * q.grass),
      pick: (r) => {
        const x = (r() - 0.5) * 300;
        const z = M + 10 + (r() - 0.5) * 220;
        const i = Math.round((x + hf.half) / hf.step);
        const j = Math.round((z + hf.half) / hf.step);
        if (i < 0 || j < 0 || i >= n || j >= n) return null;
        if (hf.dirt[j * n + i] > 0.42 || blocked[j * n + i]) return null;
        const y = hf.get(x, z);
        return y < WATER + 0.5 ? null : { x, y, z };
      },
      seed: 29,
    }),
  );
  const farPts = samplePoints({ count: q.trees > 0.5 ? 800 : 380, seed: 27, area: inRing(0, 0, 220, 1100), accept: (x, z) => farHeight(x, z) > WATER + 1 });
  scene.add(farForest(engine, farPts, (x, z) => farHeight(x, z)));
  scene.add(groundMist(engine, { count: q.trees > 0.5 ? 40 : 18, area: 320, y: 1.4, heightAt, opacity: 0.28 }));

  /* ---------------- Điểm chú thích ---------------- */
  const hp = (id, title, text, x, z, dy, view) => ({ id, title, text, x, y: heightAt(x, z) + dy, z, view });
  const v = (x, z, lift, tx, tz, ty, fov) => ({ x, z, lift, target: { x: tx, y: heightAt(tx, tz) + ty, z: tz }, fov });
  const H3 = HILLS[2];
  const hotspots = [
    hp('nui-da-voi', 'Núi đá vôi', 'Vùng núi đá vôi ở Lạng Sơn, Thanh Hóa, Hòa Bình… có nhiều hang động khô ráo, gần nguồn nước và rừng cây — nơi trú ẩn lý tưởng của người nguyên thủy.', H3.x, H3.z, 4, v(30, -8, 18, H3.x, H3.z, 30)),
    hp('hang-dong', 'Hang động', 'Người tối cổ sống thành từng bầy trong các hang động, mái đá. Ở hang Thẩm Khuyên, Thẩm Hai (Bình Gia, Lạng Sơn), các nhà khảo cổ đã tìm thấy răng hóa thạch của Người tối cổ, niên đại khoảng 40 – 30 vạn năm.', 0, M - 2, 10, v(6, M + 26, 3, 0, M - 4, 7)),
    hp('rang-hoa-thach', 'Răng hóa thạch', 'Răng hóa thạch là dấu tích quan trọng cho biết Người tối cổ từng sống ở Việt Nam. Cùng lớp đất trong hang còn có răng, xương của nhiều loài thú cổ.', 1.5, M - 13, 0.8, v(3, M - 3, 0.4, 1, M - 13, 0.5, 50)),
    hp('bay-nguoi', 'Bầy người nguyên thủy', 'Người tối cổ sống thành bầy, gồm vài gia đình, có người đứng đầu, có sự phân công lao động giữa nam và nữ, cùng chăm sóc con cái. Hang động và mái đá là nơi trú ẩn.', F.x, F.z, 2.4, v(4, M + 5, 1, F.x, F.z, 0.8, 52)),
    hp('dac-diem', 'Đặc điểm Người tối cổ', 'Người tối cổ đã đi đứng bằng hai chân, đôi tay được giải phóng để cầm nắm, chế tác công cụ. Trán thấp và bợt ra phía sau, u mày nổi cao, xương hàm nhô ra phía trước, trên người còn phủ một lớp lông; hộp sọ nhỏ hơn người ngày nay.', G.x, G.z, 2.3, v(G.x + 1.2, G.z + 3, 0, G.x, G.z, 1.25, 40)),
    hp('ghe-deo', 'Ghè đẽo đá', 'Người tối cổ dùng một hòn đá cứng (hòn ghè) đập vào hòn cuội hay mảnh đá, ghè đi vài mảnh để tạo cạnh sắc. Ở Núi Đọ (Thanh Hóa), các nhà khảo cổ tìm thấy hàng nghìn công cụ và mảnh tước như vậy, phát hiện năm 1960.', KN.x - 1.3, KN.z + 0.4, 1.8, v(KN.x - 4, KN.z + 5, 0.4, KN.x - 1.3, KN.z + 0.4, 0.4, 48)),
    hp('riu-tay', 'Rìu tay', 'Rìu tay được ghè đẽo thô sơ ở một hoặc hai mặt, chưa được mài. Người tối cổ dùng để chặt cây, đập quả cứng, đào củ và xẻ thịt thú săn được.', SL.x, SL.z, 1, v(SL.x + 0.6, SL.z + 1.8, 0, SL.x, SL.z, 0.3, 34)),
    hp('lua', 'Lửa', 'Ở nhiều nơi trên thế giới, các nhà khảo cổ tìm thấy dấu vết cho thấy Người tối cổ đã biết dùng lửa để sưởi ấm, nướng chín thức ăn và xua đuổi thú dữ.', F.x, F.z + 0.4, 1.6, v(F.x - 2.5, F.z + 4, 0.2, F.x, F.z, 0.5, 45)),
    hp('hai-luom', 'Hái lượm', 'Hái quả, hạt, rau rừng và đào củ là nguồn thức ăn thường xuyên của bầy người. Thức ăn kiếm được bấp bênh, phụ thuộc hoàn toàn vào thiên nhiên.', TREE.x + 2, TREE.z + 2, 3, v(TREE.x + 8, TREE.z + 10, 1.5, TREE.x + 2, TREE.z + 2, 1.5)),
    hp('san-bat', 'Săn bắt', 'Săn thú rừng bằng gậy gỗ vót nhọn, hòn đá và rìu tay đòi hỏi nhiều người cùng phối hợp. Thịt thú săn được chia cho cả bầy.', HU.x + 1.2, HU.z + 1, 2.6, v(HU.x - 5, HU.z - 6, 0.6, HU.x + 1.2, HU.z + 1, 1.2, 50)),
    hp('suoi', 'Suối', 'Bầy người thường chọn hang gần suối để có nước uống, bắt cá, ốc và nhặt những hòn cuội làm công cụ.', 0, 64, 2, v(-16, 46, 3, 0, 64, 0)),
  ];
  const start = { x: 10, z: M + 58, lift: 2, target: { x: 0, y: FLOOR + 9, z: M - 4 } };
  const credits = [
    'Bầu trời HDRI, vân bề mặt và mô hình cây, bụi, dương xỉ, đá tảng: Poly Haven (CC0).',
    'Ảnh pháp tuyến mặt nước: dự án three.js (giấy phép MIT).',
    'Núi đá vôi, hang động, Người tối cổ, công cụ đá, bếp lửa, tre và cỏ: dựng bằng mã nguồn.',
  ];
  return { heightAt, hotspots, start, credits, bounds: 190 };
}
