import * as THREE from 'three';
import { createNoise2D, fbm, mulberry32, smoothstep } from '../noise.js';
import { HeightField, createWater, distToPolyline, groundMaterial, sampleLoop, terrainMesh } from '../terrain.js';
import { bambooGroves, fire, grassField } from '../builders.js';
import { farForest, inBox, inRing, plant, samplePoints } from '../scatter.js';
import {
  animateFigures,
  bakeFigure,
  burial,
  chopper,
  cobbleBank,
  diggingStick,
  earlyHuman,
  flakes,
  fruitPile,
  gardenPlot,
  grindingStone,
  hearth,
  hideRug,
  hold,
  humanMaterials,
  karstHill,
  pebble,
  polishedAxe,
  pot,
  primitiveMaterials,
  quadruped,
  shellMidden,
  spear,
} from '../models/nguyenThuy.js';
import { bananaPlants, fishRack, fishSpear, leafHut, openFiring, sceneryMaterials, smoke, taroPlants } from '../models/canhVat.js';

/**
 * MÔ PHỎNG LÀNG VEN SÔNG CỦA NGƯỜI TINH KHÔN (khoảng 20.000 – 6.000 TCN)
 * Khác hẳn cảnh hang tối của Người tối cổ: vùng trung du đồi gò thoáng đãng, dòng sông rộng,
 * một xóm lều lá trên thềm sông, ruộng rau củ, nơi làm gốm, mài rìu, đánh cá, chó nhà;
 * phía sau vẫn còn mái đá — nơi ở và chôn cất của cư dân Hòa Bình, Bắc Sơn.
 */
export const meta = {
  title: 'Làng ven sông của Người tinh khôn',
  subtitle: 'Văn hóa Sơn Vi, Hòa Bình, Bắc Sơn — khoảng 20.000 – 6.000 TCN',
  note: 'Mô phỏng minh họa tổng hợp. Người Sơn Vi cư trú cả ngoài trời trên các đồi gò, thềm sông; người Hòa Bình, Bắc Sơn sống trong hang, mái đá và làm việc quanh đó. Cảnh đặt chung các hoạt động tiêu biểu của ba nền văn hóa (ghè cuội, mài rìu, làm gốm, trồng trọt sơ khai, chăn nuôi, đánh cá, săn bắt) dù thực tế chúng nối tiếp nhau trong hàng nghìn năm. Lều lá, trang phục, hoa văn là hình dung minh họa.',
};

const WATER = -0.6;
const TER = 3.4; // mặt thềm sông nơi dựng làng
const lerp = THREE.MathUtils.lerp;

export async function build(engine, { onStatus } = {}) {
  const q = engine.q;
  const scene = engine.scene;
  onStatus?.('Đang dựng bầu trời…');
  await engine.sky('/3d/hdri/kloofendal_48d_partly_cloudy_puresky_2k.hdr', { intensity: 1.05, bgIntensity: 1.05, sunIntensity: 3.6, sunColor: 0xfff2dc });
  // Không khí trong lành, sáng sủa, màu tươi — tương phản với hang tối của Người tối cổ
  engine.renderer.toneMappingExposure = 1.1;
  scene.fog = new THREE.FogExp2(0xc9d6de, 0.0011);
  scene.add(new THREE.HemisphereLight(0xdce8f2, 0x5f6a3a, 0.45));
  engine.post({ bloom: { strength: 0.3, radius: 0.5, threshold: 0.92 }, grade: { sat: 1.16, contrast: 1.05, warm: 0.045, vignette: 0.18, lift: 0.008 } });

  /* ---------------- Vùng trung du: đồi gò, sông, thềm sông ---------------- */
  onStatus?.('Đang dựng đồi gò và dòng sông…');
  const noise = createNoise2D(91);
  const noiseB = createNoise2D(93);
  const BUMPS = [
    [-120, -95, 13, 60], [-40, -150, 18, 72], [70, -125, 12, 58], [150, -60, 10, 50], [-175, 0, 9, 46],
    [175, 10, 8, 42], [-95, 130, 11, 56], [115, 135, 12, 60], [5, 175, 9, 50], [-210, -120, 16, 70], [210, -110, 14, 64],
  ];
  const base = (x, z) => {
    let h = 2.2 + fbm(noise, x * 0.006, z * 0.006, 4) * 2.2 + fbm(noise, x * 0.03, z * 0.03, 2) * 0.3;
    for (const [bx, bz, bh, br] of BUMPS) h += bh * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (br * br));
    return h;
  };
  const SH = { x: 0, z: -92, R: 22, H: 34, seed: 41, cave: { dir: Math.PI / 2, halfAng: 0.62, h: 8, depth: 8 } };
  SH.kh = karstHill(engine, SH);
  SH.level = TER + 0.8;
  const SHM = SH.z + SH.kh.Rth(Math.PI / 2) * 0.95; // mép mái đá

  const SIZE = 460;
  const hf = new HeightField(SIZE, q.terrainStep);
  hf.fill(base);
  const n = hf.n;
  const blocked = new Uint8Array(n * n);
  const cellX = (k) => hf.xAt(k % n);
  const cellZ = (k) => hf.xAt(Math.floor(k / n));
  const VIL = { x: 0, z: -14, rx: 62, rz: 40 };
  const PLAZA = { x: 0, z: -12 };
  const FIELDS = [
    { x: -40, z: -18, w: 12, d: 7, ry: 0.2 },
    { x: -42, z: -32, w: 11, d: 6, ry: 0.25 },
  ];
  const paths = [
    sampleLoop([[PLAZA.x, PLAZA.z], [4, 0], [6, 12]], 40, false),
    sampleLoop([[PLAZA.x, PLAZA.z], [-14, -16], [-30, -22]], 40, false),
    sampleLoop([[PLAZA.x, PLAZA.z], [2, -30], [0, -50], [0, SHM + 2]], 60, false),
    sampleLoop([[PLAZA.x, PLAZA.z], [20, -10], [40, -24], [70, -50]], 50, false),
  ];
  for (let k = 0; k < n * n; k++) {
    const x = cellX(k);
    const z = cellZ(k);
    let h = hf.h[k];
    const v = 1 - smoothstep(0.65, 1, Math.hypot((x - VIL.x) / VIL.rx, (z - VIL.z) / VIL.rz));
    h = lerp(h, TER + fbm(noiseB, x * 0.05, z * 0.05, 2) * 0.12, v);
    const f = 1 - smoothstep(SH.R * 0.85, SH.R + 12, Math.hypot(x - SH.x, z - SH.z));
    h = lerp(h, SH.level, f);
    const foot = 1 - smoothstep(10, 20, Math.hypot(x - SH.x, z - (SHM + 6)));
    h = lerp(h, SH.level, foot);
    if (f > 0.5) blocked[k] = 1;
    hf.h[k] = h;
    const patch = fbm(noiseB, x * 0.03, z * 0.03, 3);
    hf.dirt[k] = patch > 0.42 ? (patch - 0.42) * 1.2 : 0;
    // sân làng đất nện
    const plaza = 1 - smoothstep(9, 16, Math.hypot(x - PLAZA.x, z - PLAZA.z));
    hf.dirt[k] = Math.max(hf.dirt[k], plaza * (0.75 + fbm(noiseB, x * 0.15, z * 0.15, 2) * 0.25), foot * 0.7);
    for (const fd of FIELDS) {
      const dx = x - fd.x;
      const dz = z - fd.z;
      const u = dx * Math.cos(fd.ry) - dz * Math.sin(fd.ry);
      const w = dx * Math.sin(fd.ry) + dz * Math.cos(fd.ry);
      if (Math.abs(u) < fd.w / 2 + 1 && Math.abs(w) < fd.d / 2 + 1) {
        hf.dirt[k] = Math.max(hf.dirt[k], 0.95);
        blocked[k] = 1;
      }
    }
  }
  for (const p of paths) {
    hf.alongLine(p, 2.4, (k, d) => {
      hf.dirt[k] = Math.max(hf.dirt[k], 0.9 * (1 - smoothstep(0.9, 2.4, d)));
    });
  }
  // Sông rộng chảy ngang trước làng, bãi cuội ven bờ
  const river = sampleLoop([[-320, 40], [-180, 30], [-70, 44], [20, 36], [100, 52], [210, 40], [320, 52]], 360, false);
  hf.alongLine(river, 30, (k, d) => {
    hf.h[k] = lerp(hf.h[k], WATER - 2.6, 1 - smoothstep(13, 24, d));
    hf.dirt[k] = Math.max(hf.dirt[k], 0.85 * (1 - smoothstep(18, 30, d)));
    if (d < 17) blocked[k] = 1;
  });

  const groundAt = (x, z) => (Math.abs(x) < SIZE / 2 && Math.abs(z) < SIZE / 2 ? Math.max(hf.get(x, z), WATER - 0.4) : farHeight(x, z));
  const heightAt = (x, z) => {
    const g = groundAt(x, z);
    const y = SH.kh.heightAt(x - SH.x, z - SH.z);
    return y > -Infinity ? Math.max(g, SH.level - 0.6 + y) : g;
  };
  const isBlocked = (x, z) => {
    const i = Math.round((x + hf.half) / hf.step);
    const j = Math.round((z + hf.half) / hf.step);
    if (i < 0 || j < 0 || i >= n || j >= n) return false;
    return blocked[j * n + i] === 1;
  };

  scene.add(terrainMesh(hf, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'brown_mud_dry', repeat: SIZE / 6 }), { tintSeed: 23 }));
  function farHeight(x, z) {
    const r = Math.hypot(x, z);
    const dr = distToPolyline(river, x, z);
    return base(x, z) + smoothstep(300, 1300, r) * (25 + 70 * Math.max(0, fbm(noiseB, x * 0.0018, z * 0.0018, 4) + 0.25)) - 5 * (1 - smoothstep(13, 24, dr));
  }
  const far = new HeightField(3400, 20);
  far.fill((x, z) => {
    const e = Math.max(Math.abs(x), Math.abs(z));
    if (e < SIZE / 2 - 16) return farHeight(x, z) - 14;
    if (e < SIZE / 2 + 12) return farHeight(x, z) - 0.4;
    return farHeight(x, z);
  });
  far.dirt.fill(0.08);
  const farMesh = terrainMesh(far, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'brown_mud_dry', repeat: 3400 / 9 }), { tintSeed: 7 });
  farMesh.receiveShadow = false;
  scene.add(farMesh);
  scene.add(createWater(engine, { size: 3400, level: WATER, color: 0x2f6a62, distortion: 1.8 }));

  // Mái đá nhỏ phía sau làng (vùng trung du chủ yếu là đồi gò, không có rừng tháp đá vôi như cảnh hang Người tối cổ)
  SH.kh.mesh.position.set(SH.x, SH.level - 0.6, SH.z);
  scene.add(SH.kh.mesh);

  /* ---------------- Xóm lều lá ---------------- */
  onStatus?.('Đang dựng xóm lều lá và ruộng vườn…');
  const PM = primitiveMaterials();
  const HM = humanMaterials();
  const SM = sceneryMaterials();
  const anim = [];
  const put = (obj, x, z, ry = 0, dy = 0) => {
    obj.position.set(x, heightAt(x, z) + dy, z);
    obj.rotation.y = ry;
    scene.add(obj);
    return obj;
  };
  const face = (x, z, tx, tz) => Math.atan2(tx - x, tz - z);
  /** Tạo một người; props(fig) để cầm đồ vật; act: chuyển động (nếu có). */
  const person = (opts, x, z, ry, { act, phase = 0, props } = {}) => {
    const fig = earlyHuman(HM, { kind: 'sapiens', ...opts });
    props?.(fig);
    bakeFigure(fig, !act);
    put(fig, x, z, ry);
    if (act) anim.push({ fig, act, phase });
    return fig;
  };
  const animal = (opts, x, z, ry) => put(bakeFigure(quadruped(HM, opts), true), x, z, ry);

  const HUTS = [
    [-17, -22, 2.4, 3.3], [-8, -30, 2.2, 3.1], [8, -31, 2.5, 3.4], [19, -23, 2.2, 3.1], [-22, -6, 2.0, 2.9], [23, -6, 2.3, 3.2], [-4, -44, 2.6, 3.6],
  ];
  HUTS.forEach(([x, z, r, h], i) => {
    put(leafHut(SM, { r, h, seed: 10 + i }), x, z, face(x, z, PLAZA.x, PLAZA.z));
  });
  // Bếp chung giữa làng: nồi gốm đang đun, khói bốc lên
  const F = PLAZA;
  put(hearth(PM, { r: 0.8, seed: 4 }), F.x, F.z);
  scene.add(fire(engine, { x: F.x, y: heightAt(F.x, F.z) + 0.1, z: F.z, size: 0.8, light: false }));
  scene.add(smoke(engine, { x: F.x, y: heightAt(F.x, F.z) + 1, z: F.z, count: 14, rise: 0.8, size: 1, opacity: 0.25, height: 10 }));
  for (const [dx, dz, r] of [[0.5, 0.15, 0.16], [-0.4, -0.35, 0.13]]) put(pot(PM, { r, h: r * 1.35, seed: Math.round(r * 100), dark: true }), F.x + dx, F.z + dz, 0, 0.12);
  put(hideRug(PM, { w: 2, d: 1.3, seed: 2 }), F.x - 2.6, F.z + 0.8, 0.4);
  put(hideRug(PM, { w: 1.7, d: 1.2, seed: 5 }), F.x + 2.6, F.z - 0.6, -0.3);
  // Người mẹ lớn tuổi (đứng đầu thị tộc) ngồi kể chuyện, mọi người quây quanh
  const ELDER = { x: F.x - 2.3, z: F.z - 1.4 };
  person({ sex: 'f', pose: 'sit', seed: 1 }, ELDER.x, ELDER.z, face(ELDER.x, ELDER.z, F.x, F.z), { act: 'talk' });
  const SIT = [];
  [[Math.PI * 0.15, 'm', 2], [Math.PI * 0.55, 'f', 3], [Math.PI * 1.65, 'm', 6], [Math.PI * 1.9, 'f', 8]].forEach(([a, sex, seed]) => {
    const x = F.x + Math.cos(a) * 2.2;
    const z = F.z + Math.sin(a) * 2.2;
    person({ sex, pose: 'sit', seed }, x, z, face(x, z, F.x, F.z), { act: 'idle', phase: seed });
    SIT.push({ x, z });
  });
  animal({ kind: 'dog', pose: 'lie' }, F.x + 3.4, F.z + 1.8, 2.2);
  // Trẻ con chạy chơi với chó
  person({ sex: 'm', pose: 'play', seed: 9, scale: 0.62 }, 6.5, -2, face(6.5, -2, 12, 3));
  person({ sex: 'f', pose: 'play', seed: 10, scale: 0.58 }, 9.5, -0.5, face(9.5, -0.5, 4, -4));
  animal({ kind: 'dog', pose: 'stand' }, 8.2, 1.2, face(8.2, 1.2, 12, 4));
  // Đống vỏ ốc sau xóm
  const MID = { x: 14, z: -38 };
  put(shellMidden(PM, { r: 1.8, h: 0.6, count: 420 }), MID.x, MID.z);

  // Làm gốm: người nặn, nồi phơi, bãi nung lộ thiên
  const PO = { x: 20, z: 2 };
  person({ sex: 'f', pose: 'kneel', seed: 11 }, PO.x, PO.z, face(PO.x, PO.z, PO.x + 0.3, PO.z + 2), { act: 'pot' });
  put(pot(PM, { r: 0.14, h: 0.19, seed: 61 }), PO.x + 0.1, PO.z + 0.62, 0, 0.02);
  put(hideRug(PM, { w: 2.2, d: 1.1, seed: 9 }), PO.x + 2.3, PO.z + 0.6, 0.1);
  for (let i = 0; i < 6; i++) {
    const r = 0.1 + (i % 3) * 0.035;
    put(pot(PM, { r, h: r * 1.35, seed: 70 + i }), PO.x + 1.3 + i * 0.42, PO.z + 0.5 + (i % 2) * 0.28, i, 0.03);
  }
  const KILN = { x: 28, z: 4 };
  put(openFiring(SM, (i) => pot(PM, { r: 0.13 + (i % 3) * 0.02, h: 0.2, seed: 80 + i })), KILN.x, KILN.z);
  scene.add(fire(engine, { x: KILN.x, y: heightAt(KILN.x, KILN.z) + 0.3, z: KILN.z, size: 1.1 }));
  scene.add(smoke(engine, { x: KILN.x, y: heightAt(KILN.x, KILN.z) + 1.2, z: KILN.z, count: 16, rise: 1, size: 1.4, opacity: 0.3, height: 14, color: 0xb8b2aa }));
  person({ sex: 'm', pose: 'stand', seed: 12 }, KILN.x - 2.2, KILN.z + 1.6, face(KILN.x - 2.2, KILN.z + 1.6, KILN.x, KILN.z));

  // Ven sông: mài rìu (Bắc Sơn), ghè cuội (Sơn Vi), đâm cá, giàn phơi cá
  const GR = { x: 12, z: 15 };
  for (const [dx, seed] of [[0, 13], [2.6, 14]]) {
    put(grindingStone(PM), GR.x + dx, GR.z + 0.75, 0.1, 0.05);
    person({ sex: 'm', pose: 'kneel', seed }, GR.x + dx, GR.z, 0.1, { act: 'grind', phase: dx, props: (f) => hold(f, 'R', polishedAxe(PM), { offset: [0, -0.06, 0.03] }) });
  }
  for (let i = 0; i < 4; i++) {
    const a = polishedAxe(PM);
    a.rotation.set(Math.PI / 2, 0, i * 0.7);
    put(a, GR.x + 4.4 + i * 0.16, GR.z + 0.2, 0, 0.03);
  }
  const KN = { x: -16, z: 17 };
  person({ sex: 'm', pose: 'knap', seed: 15 }, KN.x, KN.z, face(KN.x, KN.z, KN.x + 1, KN.z + 1), {
    act: 'knap',
    props: (f) => {
      hold(f, 'R', pebble(PM, { r: 0.05, seed: 16 }));
      hold(f, 'L', chopper(PM, { seed: 17, mat: PM.pebble }), { offset: [0, -0.07, 0.03] });
    },
  });
  const fk = flakes(PM, { count: 60, spread: 1.3, mat: PM.pebble });
  fk.position.set(KN.x + 0.4, heightAt(KN.x + 0.4, KN.z + 0.5), KN.z + 0.5);
  scene.add(fk);
  const bank = samplePoints({ count: 1400, seed: 43, area: inBox(-80, 8, 80, 40), accept: (x, z) => {
    const d = distToPolyline(river, x, z);
    return d > 12 && d < 20 && groundAt(x, z) > WATER - 0.35;
  } }).map((p) => ({ x: p.x, y: groundAt(p.x, p.z), z: p.z }));
  scene.add(cobbleBank(PM, bank));
  const FISH = { x: -4, z: 21 }; // lội nước ngang đầu gối
  person({ sex: 'm', pose: 'stab', seed: 18 }, FISH.x, FISH.z, face(FISH.x, FISH.z, FISH.x - 0.5, FISH.z + 3), {
    props: (f) => hold(f, 'R', fishSpear(SM), { upright: true, offset: [0, -0.04, 0.02], tilt: -0.5 }),
  });
  const RACK = { x: -11, z: 6 };
  put(fishRack(SM), RACK.x, RACK.z, 0.3);
  put(fishRack(SM, { seed: 9 }), RACK.x - 3.4, RACK.z - 1.2, 0.5);

  // Ruộng rau củ, bầu bí, chuối, khoai môn; người tra hạt, người hái bầu mang về
  for (const fd of FIELDS) put(gardenPlot(PM, { w: fd.w, d: fd.d, seed: Math.round(fd.x) }), fd.x, fd.z, fd.ry);
  const F0 = FIELDS[0];
  person({ sex: 'f', pose: 'dig', seed: 19 }, F0.x + 3, F0.z + F0.d / 2 + 1, Math.PI + 0.2, { props: (f) => hold(f, 'R', diggingStick(PM), { upright: true }) });
  person({ sex: 'f', pose: 'dig', seed: 20 }, F0.x - 3.5, F0.z + F0.d / 2 + 0.9, Math.PI - 0.3, { props: (f) => hold(f, 'R', diggingStick(PM), { upright: true }) });
  const gourd = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), PM.gourd);
  gourd.scale.set(1, 0.8, 1.3);
  const CARRY = { x: -26, z: -10 };
  person({ sex: 'f', pose: 'walk', seed: 21 }, CARRY.x, CARRY.z, face(CARRY.x, CARRY.z, F.x, F.z), { props: (f) => hold(f, 'L', gourd, { offset: [0, -0.1, 0.06] }) });
  const bananaPts = samplePoints({ count: 30, seed: 51, area: inBox(-60, -46, -26, 0), accept: (x, z) => !isBlocked(x, z) && distToPolyline(paths[1], x, z) > 3 && HUTS.every(([hx, hz]) => Math.hypot(x - hx, z - hz) > 4.5), minDist: 3 }).map((p) => ({ ...p, y: heightAt(p.x, p.z) }));
  scene.add(bananaPlants(SM, bananaPts));
  const taroPts = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) taroPts.push({ x: -41 + c * 1.1, y: 0, z: -3 + r * 1.2 });
  taroPts.forEach((p) => (p.y = heightAt(p.x, p.z)));
  scene.add(taroPlants(SM, taroPts, { size: 1.1 }));

  // Thợ săn khiêng con hươu trên đòn trở về, chó chạy theo
  const HU = { x: -36, z: -52 };
  const huYaw = face(HU.x, HU.z, F.x, F.z);
  const carry = new THREE.Group();
  const POLE_Y = 1.36;
  const poleM = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 3.2, 6), SM.pole);
  poleM.rotation.x = Math.PI / 2;
  poleM.position.set(0.16, POLE_Y, 0);
  poleM.castShadow = true;
  carry.add(poleM);
  const deer = bakeFigure(quadruped(HM, { kind: 'deer', pose: 'carried' }), true);
  deer.position.set(0.16, POLE_Y, 0);
  carry.add(deer);
  for (const [dz, seed] of [[1.25, 22], [-1.25, 23]]) {
    const h = earlyHuman(HM, { kind: 'sapiens', sex: 'm', pose: 'pole', seed });
    bakeFigure(h, true);
    h.position.set(0, 0, dz);
    carry.add(h);
  }
  put(carry, HU.x, HU.z, huYaw);
  person({ sex: 'm', pose: 'walk', seed: 24 }, HU.x + 2.2, HU.z + 3.2, huYaw, { props: (f) => hold(f, 'R', spear(PM, { L: 2.2, stoneTip: true }), { upright: true, tilt: 0.2 }) });
  animal({ kind: 'dog', pose: 'stand' }, HU.x + 0.8, HU.z + 5.2, huYaw);

  // Hái quả bên gốc cây
  const TREE = { x: 34, z: -20 };
  scene.add(await plant(engine, '/3d/models/island_tree_02.glb', [{ x: TREE.x, z: TREE.z, r: 0.6 }], heightAt, { scale: [0.8, 0.8], sink: 0.2 }));
  person({ sex: 'f', pose: 'reach', seed: 25 }, TREE.x - 1.3, TREE.z + 1.1, face(TREE.x - 1.3, TREE.z + 1.1, TREE.x, TREE.z));
  put(fruitPile(PM, { count: 10, seed: 20 }), TREE.x - 2.6, TREE.z + 2);

  // Mái đá phía sau: bếp nhỏ, mộ táng, người ngồi nghỉ
  const SF = { x: 2, z: SHM - 4 };
  put(hearth(PM, { r: 0.6, seed: 8 }), SF.x, SF.z);
  scene.add(fire(engine, { x: SF.x, y: heightAt(SF.x, SF.z) + 0.1, z: SF.z, size: 0.6 }));
  const GRAVE = { x: -6, z: SHM - 5 };
  put(burial(PM), GRAVE.x, GRAVE.z, 0.3);
  person({ sex: 'm', pose: 'sit', seed: 26 }, SF.x + 1.6, SF.z + 0.6, face(SF.x + 1.6, SF.z + 0.6, SF.x, SF.z));
  animateFigures(engine, anim);

  /* ---------------- Cây cối ---------------- */
  onStatus?.('Đang trồng cây, tre và cỏ…');
  const flat = (x, z, minH = WATER + 0.9) => !isBlocked(x, z) && heightAt(x, z) > minH && hf.slope(x, z) < 0.35;
  const inVillage = (x, z) => Math.hypot((x - VIL.x) / VIL.rx, (z - VIL.z) / VIL.rz) < 1;
  const view = (x, z) => x > -40 && x < 50 && z > -10 && z < 90; // giữ tầm nhìn từ bờ bên kia sang làng
  const trees = samplePoints({ count: Math.round(70 * q.trees), seed: 7, area: inBox(-220, -220, 220, 220), accept: (x, z) => flat(x, z) && !inVillage(x, z) && !view(x, z), minDist: 10 });
  scene.add(await plant(engine, '/3d/models/island_tree_02.glb', trees, heightAt, { scale: [0.75, 1.3], sink: 0.2 }));
  const shrubs = samplePoints({ count: Math.round(120 * q.trees), seed: 9, area: inBox(-220, -220, 220, 220), accept: (x, z) => flat(x, z) && !inVillage(x, z) && !view(x, z), minDist: 3 });
  const half = Math.floor(shrubs.length / 2);
  scene.add(await plant(engine, '/3d/models/shrub_02.glb', shrubs.slice(0, half), heightAt, { scale: [1.2, 2.4] }));
  scene.add(await plant(engine, '/3d/models/shrub_04.glb', shrubs.slice(half), heightAt, { scale: [1.2, 2.4] }));
  const ferns = samplePoints({ count: Math.round(80 * q.trees), seed: 15, area: inBox(-200, -200, 200, 200), accept: (x, z) => flat(x, z) && !inVillage(x, z) && !view(x, z) });
  scene.add(await plant(engine, '/3d/models/fern_02.glb', ferns, heightAt, { scale: [1.4, 2.4], cast: false }));
  const wildBanana = samplePoints({ count: Math.round(40 * q.trees), seed: 55, area: inBox(-200, -200, 200, 100), accept: (x, z) => flat(x, z) && !inVillage(x, z) && !view(x, z), minDist: 4 }).map((p) => ({ ...p, y: heightAt(p.x, p.z) }));
  scene.add(bananaPlants(SM, wildBanana, { seed: 7 }));
  const groves = samplePoints({ count: 34, seed: 19, area: inBox(-220, -60, 220, 120), accept: (x, z) => flat(x, z) && distToPolyline(river, x, z) > 20 && distToPolyline(river, x, z) < 46 && !inVillage(x, z) && !(x > -30 && x < 40 && z > 30), minDist: 14 }).map((p) => ({ x: p.x, z: p.z, count: 18, r: 1.6 }));
  scene.add(bambooGroves(engine, groves, { heightAt, seed: 29 }));
  scene.add(
    grassField(engine, {
      count: Math.round(70000 * q.grass),
      pick: (r) => {
        const x = (r() - 0.5) * 340;
        const z = -10 + (r() - 0.5) * 300;
        const i = Math.round((x + hf.half) / hf.step);
        const j = Math.round((z + hf.half) / hf.step);
        if (i < 0 || j < 0 || i >= n || j >= n) return null;
        if (hf.dirt[j * n + i] > 0.4 || blocked[j * n + i]) return null;
        const y = hf.get(x, z);
        return y < WATER + 0.5 ? null : { x, y, z };
      },
      seed: 31,
    }),
  );
  const farPts = samplePoints({ count: q.trees > 0.5 ? 900 : 420, seed: 37, area: inRing(0, 0, 240, 1200), accept: (x, z) => farHeight(x, z) > WATER + 1 });
  scene.add(farForest(engine, farPts, (x, z) => farHeight(x, z)));

  /* ---------------- Điểm chú thích ---------------- */
  const hp = (id, title, text, x, z, dy, vw) => ({ id, title, text, x, y: heightAt(x, z) + dy, z, view: vw });
  const v = (x, z, lift, tx, tz, ty, fov) => ({ x, z, lift, target: { x: tx, y: heightAt(tx, tz) + ty, z: tz }, fov });
  const S0 = SIT[1];
  const hotspots = [
    hp('lang', 'Làng ven sông', 'Từ khoảng 2 vạn năm trước, Người tinh khôn sinh sống ở vùng trung du, miền núi phía Bắc. Người Sơn Vi cư trú cả ngoài trời trên các đồi gò, thềm sông gần nguồn nước. Công cụ và cách sống của họ đã tiến bộ hơn nhiều so với bầy Người tối cổ.', PLAZA.x, PLAZA.z - 8, 9, v(30, 62, 14, 0, -16, 3)),
    hp('leu', 'Lều lá', 'Mô phỏng hình dung những chiếc lều dựng bằng cành cây, lợp nhiều lớp lá — nơi trú tạm ở các bãi cư trú ngoài trời. Dấu vết nhà ở ngoài trời thời này rất khó còn lại đến nay, nên hình dáng lều chỉ là minh họa.', HUTS[2][0], HUTS[2][1], 4.4, v(HUTS[2][0] + 5, HUTS[2][1] + 9, 1.4, HUTS[2][0], HUTS[2][1], 1.6)),
    hp('thi-toc', 'Thị tộc mẫu hệ', 'Người tinh khôn sống theo thị tộc: những người cùng huyết thống sống chung, cùng làm, cùng hưởng. Người mẹ lớn tuổi thường được tôn làm người đứng đầu (thị tộc mẫu hệ).', ELDER.x, ELDER.z, 2.4, v(F.x + 3, F.z + 8, 1.2, F.x, F.z, 0.8, 52)),
    hp('nguoi-tinh-khon', 'Người tinh khôn', 'Người tinh khôn có cấu tạo cơ thể giống người ngày nay: trán cao, mặt phẳng, hộp sọ lớn, không còn lớp lông trên người, đi đứng thẳng. Trong mô phỏng, họ mặc váy da, váy vỏ cây có hoa văn màu son.', KILN.x - 2.2, KILN.z + 1.6, 2.3, v(KILN.x - 2.8, KILN.z + 4.8, 0, KILN.x - 2.2, KILN.z + 1.6, 1.3, 40)),
    hp('trang-suc', 'Đồ trang sức', 'Người tinh khôn đã biết làm đồ trang sức: vòng cổ bằng vỏ ốc xuyên lỗ, vòng tay, hạt đá… cho thấy đời sống tinh thần đã phong phú hơn.', S0.x, S0.z, 1.5, v(S0.x + 1.4, S0.z + 1.6, 0, S0.x, S0.z, 0.7, 36)),
    hp('chan-nuoi', 'Chó nhà', 'Chó là con vật được con người thuần dưỡng sớm nhất, giúp canh giữ nơi ở và đi săn. Thời kỳ này cư dân bắt đầu trồng trọt và chăn nuôi.', 8.2, 1.2, 1.4, v(5, 7, 0, 8.2, 1.2, 0.4, 45)),
    hp('do-gom', 'Làm đồ gốm', 'Người Bắc Sơn đã biết làm đồ gốm: nặn đất sét thành nồi đáy tròn, phơi khô rồi nung trong đống lửa. Nồi gốm dùng để đun nấu, chứa đựng thức ăn, nước uống.', KILN.x, KILN.z, 2.4, v(PO.x - 2, PO.z + 7, 1, (PO.x + KILN.x) / 2, (PO.z + KILN.z) / 2, 0.6, 50)),
    hp('riu-mai-luoi', 'Rìu mài lưỡi', 'Người Bắc Sơn mài lưỡi rìu trên những bàn mài bằng đá cát, có nước sông làm trơn. Rìu mài lưỡi sắc hơn, bền hơn rìu ghè đẽo — bước tiến lớn trong kỹ thuật chế tác đá.', GR.x + 1.3, GR.z, 1.8, v(GR.x + 1.3, GR.z + 5, 0.4, GR.x + 1.3, GR.z + 0.4, 0.4, 46)),
    hp('cuoi-son-vi', 'Công cụ cuội Sơn Vi', 'Người Sơn Vi nhặt những hòn cuội ven sông suối, ghè đẽo ở rìa để làm công cụ chặt, nạo. Văn hóa được đặt tên theo xã Sơn Vi (Lâm Thao, Phú Thọ).', KN.x, KN.z, 1.7, v(KN.x + 3, KN.z + 4, 0.3, KN.x, KN.z, 0.4, 46)),
    hp('danh-ca', 'Đánh cá', 'Sông suối cho cư dân nhiều cá, ốc, trai. Họ đâm cá bằng xiên, phơi cá trên giàn để dành ăn dần.', FISH.x, FISH.z, 2.6, v(FISH.x - 6, FISH.z - 7, 0.8, FISH.x, FISH.z, 0.8, 50)),
    hp('trong-trot', 'Trồng trọt sơ khai', 'Cư dân văn hóa Hòa Bình đã biết trồng trọt sơ khai các loại rau, củ, bầu bí, cây ăn quả quanh nơi ở, bên cạnh săn bắt và hái lượm — bước đầu chuyển sang kinh tế sản xuất.', F0.x, F0.z, 2.6, v(F0.x + 9, F0.z + 9, 3, F0.x, F0.z, 0.5)),
    hp('san-bat', 'Săn bắt', 'Bên cạnh trồng trọt, săn thú rừng vẫn là nguồn thức ăn quan trọng. Thú săn được khiêng về làng chia cho cả thị tộc.', HU.x, HU.z, 3, v(HU.x + 7, HU.z + 9, 1, HU.x, HU.z, 1)),
    hp('vo-oc', 'Đống vỏ ốc', 'Ở các di chỉ văn hóa Hòa Bình, các nhà khảo cổ tìm thấy những lớp vỏ ốc núi, ốc suối dày — dấu tích bữa ăn của cư dân thời đó.', MID.x, MID.z, 1.8, v(MID.x + 3, MID.z + 6, 0.4, MID.x, MID.z, 0.4, 46)),
    hp('mai-da', 'Mái đá', 'Cư dân văn hóa Hòa Bình, Bắc Sơn vẫn sống trong hang động, mái đá ở vùng núi đá vôi. Lớp đất trong các mái đá còn giữ lại bếp lửa, công cụ, vỏ ốc và mộ táng của họ.', 0, SHM - 2, 9, v(8, SHM + 22, 3, 0, SHM - 3, 4)),
    hp('mo-tang', 'Mộ táng', 'Người chết được chôn ngay trong hang, mái đá nơi người sống cư trú, kèm theo công cụ lao động và đồ dùng — thể hiện tình cảm và quan niệm về thế giới bên kia.', GRAVE.x, GRAVE.z, 1.4, v(GRAVE.x + 2, GRAVE.z + 6, 0.4, GRAVE.x, GRAVE.z, 0.2, 46)),
  ];
  // Góc nhìn đầu: từ bờ sông bên kia nhìn sang làng, đồi gò và mái đá phía sau
  const start = { x: 16, z: 56, lift: 5.5, target: { x: 0, y: TER + 2.5, z: -16 } };
  const credits = [
    'Bầu trời HDRI, vân bề mặt và mô hình cây, bụi, dương xỉ: Poly Haven (CC0).',
    'Ảnh pháp tuyến mặt nước: dự án three.js (giấy phép MIT).',
    'Đồi gò, mái đá, lều lá, Người tinh khôn, chó, hươu, công cụ đá, đồ gốm, ruộng rau, chuối, khoai môn, tre và cỏ: dựng bằng mã nguồn.',
  ];
  return { heightAt, hotspots, start, credits, bounds: 220 };
}
