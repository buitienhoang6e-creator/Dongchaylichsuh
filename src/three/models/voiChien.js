import * as THREE from 'three';
import { bannerPole, crossbow } from '../builders.js';
import { bannerTexture } from '../textures.js';

export { instanceTemplate } from '../builders.js';

/**
 * VOI CHIẾN, HAI BÀ TRƯNG, QUẢN TƯỢNG, NGHĨA BINH, TRỐNG ĐỒNG TRÊN GIÁ
 * ------------------------------------------------------------
 * Chuyển từ file mô hình 3D “Hai Bà Trưng & Bà Triệu cưỡi voi chiến” (three.js r128)
 * do nhóm thực hiện cung cấp, sửa cho bản three.js của trang và cho cảnh Hát Môn:
 * - Voi đứng yên trước đàn thề: tai phe phẩy, vòi đung đưa, thân thở nhẹ (không bước tại chỗ).
 * - Cờ dùng mẫu cờ Đông Sơn của trang (không ghi chữ Quốc ngữ — năm 40 chưa có chữ này).
 * - Binh lính đứng hàng được gộp thành InstancedMesh cho nhẹ máy.
 * Đơn vị: mét (voi cao khoảng 3,2 m tới vai, người khoảng 1,7 m).
 */

/* ---------------- Vật liệu ---------------- */
function drumFaceTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  const cx = 256;
  const cy = 256;
  const grad = ctx.createRadialGradient(cx, cy, 12, cx, cy, 256);
  grad.addColorStop(0, '#c89c46');
  grad.addColorStop(0.45, '#8f6928');
  grad.addColorStop(0.85, '#62481c');
  grad.addColorStop(1, '#3e2d11');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#e8c468';
  [52, 95, 138, 185, 224, 244].forEach((r, i) => {
    ctx.lineWidth = i % 2 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  // Mặt trời 12 tia ở giữa
  ctx.fillStyle = '#f5d77f';
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a - 0.14) * 24, cy + Math.sin(a - 0.14) * 24);
    ctx.lineTo(cx + Math.cos(a) * 86, cy + Math.sin(a) * 86);
    ctx.lineTo(cx + Math.cos(a + 0.14) * 24, cy + Math.sin(a + 0.14) * 24);
    ctx.closePath();
    ctx.fill();
  }
  // Chim Lạc quanh vành
  ctx.strokeStyle = '#f0cc6e';
  ctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * 162, cy + Math.sin(a) * 162);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(0, -10, 12, 0);
    ctx.quadraticCurveTo(0, 5, -12, 0);
    ctx.stroke();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function voiChienMaterials() {
  const m = (color, roughness, metalness, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    skinHero: m(0xe6b992, 0.62, 0.04),
    skinSoldier: m(0xc9926a, 0.68, 0.04),
    hairDark: m(0x1a1412, 0.72, 0.05),
    gold: m(0xd9ac3c, 0.3, 0.78),
    bronze: m(0x9c7332, 0.38, 0.68),
    darkBronze: m(0x5c4522, 0.5, 0.55),
    steel: m(0xc9ccc8, 0.3, 0.8),
    crimson: m(0xa11f1b, 0.65, 0.08),
    deepRed: m(0x6e1312, 0.72, 0.06),
    tealArmor: m(0x1e5c59, 0.5, 0.22),
    indigoTunic: m(0x2b3648, 0.78, 0.04),
    earthTunic: m(0x6e4a2e, 0.82, 0.03),
    wood: m(0x5a3921, 0.8, 0.04),
    woodLight: m(0x875c36, 0.75, 0.04),
    ivory: m(0xf0e6d0, 0.3, 0.06),
    leather: m(0x3f2616, 0.82, 0.05),
    elephantGrey: m(0x4f4b46, 0.88, 0.02),
    elephantGreyDark: m(0x3d3a36, 0.9, 0.02),
    elephantWhite: m(0xdad4c8, 0.74, 0.04),
    elephantWhiteShade: m(0xbcb5a8, 0.8, 0.03),
    eyeDark: m(0x110e0c, 0.12, 0.2),
    feather: m(0xe8d9b5, 0.75, 0.02),
    drumTop: m(0xffffff, 0.38, 0.64, { map: drumFaceTexture() }),
  };
}

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(geo, mat);
  o.position.set(x, y, z);
  return o;
};
const shadows = (obj) => {
  obj.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
  return obj;
};

/* ---------------- Nữ tướng (Trưng Trắc, Trưng Nhị) ---------------- */
export function createHeroine(MAT, cfg) {
  const hero = new THREE.Group();
  hero.name = cfg.name;
  const armor = cfg.armorMat;
  const trim = cfg.trimMat || MAT.gold;

  const skirt = mesh(new THREE.CylinderGeometry(0.22, 0.34, 0.72, 12), cfg.skirtMat || armor, 0, 0.36);
  hero.add(skirt);
  const hem = mesh(new THREE.TorusGeometry(0.33, 0.025, 6, 16), trim, 0, 0.03);
  hem.rotation.x = Math.PI / 2;
  hero.add(hem);
  if (cfg.ivoryClogs) {
    for (const fx of [-0.1, 0.1]) hero.add(mesh(new THREE.BoxGeometry(0.1, 0.08, 0.22), MAT.ivory, fx, 0.04, 0.08));
  }
  hero.add(mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.56, 10), armor, 0, 0.96));
  const breast = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), trim, 0, 1.04, 0.21);
  breast.rotation.x = Math.PI / 2;
  hero.add(breast);
  hero.add(mesh(new THREE.CylinderGeometry(0.215, 0.225, 0.1, 12), trim, 0, 0.72));
  for (const sx of [-0.27, 0.27]) {
    const p = mesh(new THREE.SphereGeometry(0.13, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65), trim, sx, 1.18, 0);
    p.rotation.z = sx > 0 ? -0.35 : 0.35;
    hero.add(p);
  }
  hero.add(mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 8), MAT.skinHero, 0, 1.28));
  const head = mesh(new THREE.SphereGeometry(0.165, 14, 12), MAT.skinHero, 0, 1.46);
  head.scale.set(0.95, 1.08, 0.98);
  hero.add(head);
  // Tóc búi, vành khăn và trâm
  hero.add(mesh(new THREE.SphereGeometry(0.172, 12, 10), MAT.hairDark, 0, 1.49, -0.045));
  hero.add(mesh(new THREE.SphereGeometry(0.11, 10, 10), MAT.hairDark, 0, 1.66, -0.06));
  const band = mesh(new THREE.TorusGeometry(0.155, 0.024, 8, 18), trim, 0, 1.54, 0.01);
  band.rotation.x = Math.PI / 2 - 0.15;
  hero.add(band);
  for (const dir of [-1, 1]) {
    const pin = mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.34, 6), MAT.gold, dir * 0.09, 1.69, -0.05);
    pin.rotation.z = dir * 0.72;
    hero.add(pin);
    hero.add(mesh(new THREE.SphereGeometry(0.025, 6, 6), MAT.gold, dir * 0.2, 1.79, -0.05));
  }
  // Áo choàng bay
  const capeGeo = new THREE.PlaneGeometry(0.62, 1.05, 6, 8);
  capeGeo.translate(0, -0.52, 0);
  const cape = mesh(capeGeo, new THREE.MeshStandardMaterial({ color: (cfg.capeMat || MAT.crimson).color, side: THREE.DoubleSide, roughness: 0.62 }), 0, 1.22, -0.2);
  cape.rotation.x = 0.22;
  hero.add(cape);

  // Tay phải cầm binh khí
  const armR = new THREE.Group();
  armR.position.set(0.28, 1.15, 0.02);
  armR.add(mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.36, 8), armor, 0, 0.15));
  const fore = mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.34, 8), MAT.skinHero, 0.04, 0.44, 0.08);
  fore.rotation.x = 0.35;
  armR.add(fore);
  const bracer = mesh(new THREE.CylinderGeometry(0.062, 0.056, 0.16, 8), trim, 0.03, 0.38, 0.06);
  bracer.rotation.x = 0.35;
  armR.add(bracer);
  const weapon = new THREE.Group();
  if (cfg.weapon === 'sword') {
    weapon.position.set(0.06, 0.58, 0.14);
    weapon.rotation.x = 0.25;
    weapon.add(mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.24, 6), MAT.gold));
    weapon.add(mesh(new THREE.BoxGeometry(0.22, 0.045, 0.06), MAT.gold, 0, 0.12));
    weapon.add(mesh(new THREE.BoxGeometry(0.075, 1.05, 0.022), MAT.steel, 0, 0.66));
    const tip = mesh(new THREE.ConeGeometry(0.048, 0.18, 4), MAT.steel, 0, 1.26);
    tip.rotation.y = Math.PI / 4;
    weapon.add(tip);
  } else if (cfg.weapon === 'glaive') {
    weapon.position.set(0.06, 0.45, 0.12);
    weapon.rotation.x = 0.18;
    weapon.add(mesh(new THREE.CylinderGeometry(0.028, 0.032, 2.25, 8), MAT.wood, 0, 0.25));
    weapon.add(mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.14, 8), MAT.gold, 0, 1.38));
    weapon.add(mesh(new THREE.BoxGeometry(0.025, 0.58, 0.14), MAT.steel, 0, 1.72, 0.03));
    const tassel = mesh(new THREE.ConeGeometry(0.08, 0.24, 6), MAT.crimson, 0, 1.24, 0.08);
    tassel.rotation.x = Math.PI;
    weapon.add(tassel);
  } else {
    // Giáo đồng
    weapon.position.set(0.06, 0.48, 0.12);
    weapon.rotation.x = 0.22;
    weapon.add(mesh(new THREE.CylinderGeometry(0.026, 0.03, 2.35, 8), MAT.wood, 0, 0.35));
    weapon.add(mesh(new THREE.ConeGeometry(0.07, 0.44, 6), MAT.gold, 0, 1.68));
  }
  armR.add(weapon);
  armR.rotation.z = -0.25;
  hero.add(armR);

  // Tay trái (cầm khiên nếu có)
  const armL = new THREE.Group();
  armL.position.set(-0.28, 1.12, 0.05);
  armL.add(mesh(new THREE.CylinderGeometry(0.062, 0.052, 0.36, 8), armor, 0, -0.14));
  const lFore = mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.32, 8), MAT.skinHero, 0, -0.34, 0.14);
  lFore.rotation.x = -0.85;
  armL.add(lFore);
  if (cfg.shield) {
    const shield = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.045, 16), MAT.bronze, -0.14, -0.32, 0.24);
    shield.rotation.z = Math.PI / 2;
    armL.add(shield);
    armL.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), MAT.gold, -0.17, -0.32, 0.24));
  }
  hero.add(armL);

  hero.userData.armR = armR;
  hero.userData.cape = { mesh: cape, base: capeGeo.attributes.position.array.slice(), phase: cfg.phase || 0 };
  return hero;
}

/* ---------------- Quản tượng ngồi trên cổ voi ---------------- */
function createMahout(MAT) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.46, 8), MAT.earthTunic, 0, 0.25));
  g.add(mesh(new THREE.SphereGeometry(0.135, 10, 10), MAT.skinSoldier, 0, 0.6));
  const band = mesh(new THREE.TorusGeometry(0.135, 0.025, 6, 14), MAT.crimson, 0, 0.65);
  band.rotation.x = Math.PI / 2;
  g.add(band);
  for (const lx of [-0.18, 0.18]) {
    const leg = mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.44, 7), MAT.indigoTunic, lx, -0.05, 0.08);
    leg.rotation.z = lx > 0 ? -0.35 : 0.35;
    g.add(leg);
  }
  const arm = mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.38, 7), MAT.skinSoldier, 0.22, 0.34, 0.14);
  arm.rotation.x = -0.8;
  g.add(arm);
  // gậy móc điều khiển voi
  const stick = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6), MAT.wood, 0.24, 0.56, 0.36);
  stick.rotation.x = 0.45;
  g.add(stick);
  g.add(mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 10, Math.PI * 1.2), MAT.bronze, 0.24, 0.92, 0.52));
  return g;
}

/* ---------------- Voi chiến có bành, quản tượng, cờ và người cưỡi ---------------- */
export function createWarElephant(engine, MAT, mats, opts = {}) {
  const el = new THREE.Group();
  el.name = opts.name || 'VoiChien';
  const skin = opts.isWhite ? MAT.elephantWhite : MAT.elephantGrey;
  const shade = opts.isWhite ? MAT.elephantWhiteShade : MAT.elephantGreyDark;

  const body = new THREE.Group();
  body.position.y = 2.05;
  el.add(body);
  const torso = mesh(new THREE.SphereGeometry(1.38, 18, 14), skin);
  torso.scale.set(0.92, 0.94, 1.48);
  body.add(torso);
  const shoulder = mesh(new THREE.SphereGeometry(1.18, 14, 12), skin, 0, 0.22, 0.95);
  shoulder.scale.set(0.95, 0.98, 0.92);
  body.add(shoulder);
  const rump = mesh(new THREE.SphereGeometry(1.12, 14, 12), skin, 0, 0.06, -1.05);
  rump.scale.set(0.92, 0.92, 0.95);
  body.add(rump);
  const neck = mesh(new THREE.CylinderGeometry(0.76, 0.98, 0.95, 12), skin, 0, 0.38, 1.72);
  neck.rotation.x = Math.PI / 2.6;
  body.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 0.58, 2.22);
  body.add(head);
  const cranium = mesh(new THREE.SphereGeometry(0.82, 16, 14), skin);
  cranium.scale.set(0.92, 1.06, 0.96);
  head.add(cranium);
  for (const dx of [-0.28, 0.28]) head.add(mesh(new THREE.SphereGeometry(0.36, 10, 10), skin, dx, 0.58, -0.05));
  const jaw = mesh(new THREE.SphereGeometry(0.46, 10, 8), shade, 0, -0.45, 0.15);
  jaw.scale.set(0.85, 0.72, 1.15);
  head.add(jaw);
  for (const ex of [-0.64, 0.64]) head.add(mesh(new THREE.SphereGeometry(0.085, 8, 8), MAT.eyeDark, ex, 0.08, 0.45));
  // Giáp trán bằng đồng
  const plate = mesh(new THREE.BoxGeometry(0.86, 0.92, 0.12), MAT.bronze, 0, 0.28, 0.72);
  plate.rotation.x = -0.22;
  head.add(plate);
  const disc = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 14), MAT.gold, 0, 0.3, 0.79);
  disc.rotation.x = Math.PI / 2 - 0.22;
  head.add(disc);

  const ears = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.72, 0.16, -0.1);
    const ear = mesh(new THREE.SphereGeometry(0.68, 12, 10), skin, side * 0.22, -0.12, -0.18);
    ear.scale.set(0.18, 1.08, 0.85);
    pivot.add(ear);
    pivot.rotation.y = side * -0.42;
    head.add(pivot);
    ears.push({ pivot, side });
  }

  // Vòi nhiều đốt
  const trunkPivot = new THREE.Group();
  trunkPivot.position.set(0, -0.18, 0.65);
  head.add(trunkPivot);
  const trunk = [];
  const radii = [0.32, 0.26, 0.21, 0.17, 0.14, 0.11];
  const lens = [0.46, 0.44, 0.42, 0.38, 0.34, 0.28];
  const curves = [0.22, 0.16, -0.12, -0.35, -0.42, -0.35];
  let parent = trunkPivot;
  for (let i = 0; i < radii.length; i++) {
    const seg = new THREE.Group();
    if (i > 0) seg.position.set(0, -lens[i - 1] * 0.88, 0.04);
    seg.rotation.x = curves[i];
    seg.add(mesh(new THREE.CylinderGeometry(radii[i], radii[i] * 0.84, lens[i], 10), skin, 0, -lens[i] / 2, 0));
    parent.add(seg);
    trunk.push({ seg, base: curves[i] });
    parent = seg;
  }

  // Ngà (voi của Hai Bà có hai ngà)
  for (const side of opts.singleTusk ? [1] : [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.34, -0.34, 0.48),
      new THREE.Vector3(side * 0.44, -0.56, 1.05),
      new THREE.Vector3(side * 0.42, -0.42, 1.65),
      new THREE.Vector3(side * 0.34, -0.02, 2.08),
    ]);
    const geo = new THREE.TubeGeometry(curve, 16, opts.singleTusk ? 0.105 : 0.09, 10, false);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = THREE.MathUtils.clamp((p.getZ(i) - 0.48) / 1.6, 0, 1);
      const c = curve.getPoint(t);
      const s = 1 - t * 0.72;
      p.setXYZ(i, c.x + (p.getX(i) - c.x) * s, c.y + (p.getY(i) - c.y) * s, c.z + (p.getZ(i) - c.z) * s);
    }
    geo.computeVertexNormals();
    head.add(mesh(geo, MAT.ivory));
    const ring = mesh(new THREE.TorusGeometry(0.085, 0.022, 6, 12), MAT.gold);
    ring.position.copy(curve.getPoint(0.58));
    ring.rotation.y = Math.PI / 2;
    head.add(ring);
  }

  // Đuôi
  const tail = new THREE.Group();
  tail.position.set(0, -0.05, -2.05);
  const tailShaft = mesh(new THREE.CylinderGeometry(0.06, 0.035, 1.1, 6), shade, 0, -0.55, 0);
  tailShaft.rotation.x = 0.18;
  tail.add(tailShaft);
  tail.add(mesh(new THREE.ConeGeometry(0.09, 0.28, 6), MAT.hairDark, 0, -1.12, -0.12));
  body.add(tail);

  // Bốn chân
  for (const [x, z] of [[-0.78, 1.02], [0.78, 1.02], [-0.76, -1.06], [0.76, -1.06]]) {
    const leg = new THREE.Group();
    leg.position.set(x, 1.85, z);
    leg.add(mesh(new THREE.CylinderGeometry(0.38, 0.31, 1.05, 10), skin, 0, -0.52, 0));
    leg.add(mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.85, 10), shade, 0, -1.38, 0));
    const band = mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 14), MAT.gold, 0, -1.52, 0);
    band.rotation.x = Math.PI / 2;
    leg.add(band);
    for (let n = -1; n <= 1; n++) leg.add(mesh(new THREE.SphereGeometry(0.075, 6, 6), MAT.ivory, n * 0.14, -1.78, 0.28));
    el.add(leg);
  }

  // Thảm lưng, đai da
  body.add(mesh(new THREE.BoxGeometry(2.62, 1.28, 2.38), opts.blanketMat || MAT.crimson, 0, 0.36, -0.02));
  body.add(mesh(new THREE.BoxGeometry(2.68, 0.14, 2.44), MAT.gold, 0, -0.22, -0.02));
  for (const sz of [-0.65, 0.65]) body.add(mesh(new THREE.TorusGeometry(1.36, 0.055, 6, 24), MAT.leather, 0, 0.02, sz));

  // Bành voi bằng gỗ thếp vàng
  const howdah = new THREE.Group();
  howdah.position.set(0, 1.18, -0.06);
  body.add(howdah);
  howdah.add(mesh(new THREE.BoxGeometry(1.62, 0.18, 1.82), MAT.wood));
  howdah.add(mesh(new THREE.BoxGeometry(0.12, 0.62, 1.78), MAT.wood, -0.76, 0.36, 0));
  howdah.add(mesh(new THREE.BoxGeometry(0.12, 0.62, 1.78), MAT.wood, 0.76, 0.36, 0));
  howdah.add(mesh(new THREE.BoxGeometry(1.64, 0.82, 0.14), MAT.wood, 0, 0.46, -0.84));
  howdah.add(mesh(new THREE.BoxGeometry(1.58, 0.46, 0.12), MAT.wood, 0, 0.28, 0.84));
  howdah.add(mesh(new THREE.BoxGeometry(0.16, 0.08, 1.86), MAT.gold, -0.76, 0.68, 0));
  howdah.add(mesh(new THREE.BoxGeometry(0.16, 0.08, 1.86), MAT.gold, 0.76, 0.68, 0));
  howdah.add(mesh(new THREE.BoxGeometry(1.7, 0.1, 0.18), MAT.gold, 0, 0.88, -0.84));
  for (const [px, pz] of [[-0.76, 0.84], [0.76, 0.84], [-0.76, -0.84], [0.76, -0.84]]) {
    howdah.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 8), MAT.gold, px, 0.48, pz));
    howdah.add(mesh(new THREE.SphereGeometry(0.095, 8, 8), MAT.gold, px, 0.98, pz));
  }
  if (opts.banner) {
    const flag = bannerPole(engine, mats, { h: 4.2, w: 1.3, bh: 1.9, phase: opts.phase || 0, texture: opts.banner });
    flag.position.set(-0.62, 0.1, -0.88);
    flag.rotation.y = -Math.PI / 2 + 0.18;
    howdah.add(flag);
  }
  const mahout = createMahout(MAT);
  mahout.position.set(0, 0.86, 1.48);
  body.add(mahout);
  if (opts.rider) {
    opts.rider.position.set(0, 0.1, 0.05);
    opts.rider.scale.setScalar(1.16);
    howdah.add(opts.rider);
  }

  shadows(el);
  el.userData.anim = { body, head, ears, trunk, tail, rider: opts.rider, phase: opts.phase || 0 };
  return el;
}

/* ---------------- Nghĩa binh Lạc Việt ---------------- */
export function createSoldier(engine, MAT, mats, role, tunic, { banner } = {}) {
  const s = new THREE.Group();
  const legL = new THREE.Group();
  legL.position.set(-0.11, 0.52, 0);
  legL.add(mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.54, 7), MAT.skinSoldier, 0, -0.27, 0));
  s.add(legL);
  const legR = new THREE.Group();
  legR.position.set(0.11, 0.52, 0);
  legR.add(mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.54, 7), MAT.skinSoldier, 0, -0.27, 0));
  s.add(legR);
  s.add(mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.34, 8), tunic, 0, 0.58));
  s.add(mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.48, 8), tunic, 0, 0.96));
  s.add(mesh(new THREE.BoxGeometry(0.3, 0.26, 0.08), MAT.bronze, 0, 1.0, 0.17));
  s.add(mesh(new THREE.SphereGeometry(0.145, 10, 10), MAT.skinSoldier, 0, 1.36));
  if (role === 'spearman' || role === 'banner') {
    s.add(mesh(new THREE.ConeGeometry(0.21, 0.22, 10), MAT.darkBronze, 0, 1.5));
    const plume = mesh(new THREE.ConeGeometry(0.035, 0.26, 5), MAT.feather, 0, 1.66, -0.02);
    plume.rotation.x = -0.2;
    s.add(plume);
  } else {
    // khăn đỏ cài lông chim
    const band = mesh(new THREE.TorusGeometry(0.145, 0.026, 6, 14), MAT.crimson, 0, 1.42);
    band.rotation.x = Math.PI / 2;
    s.add(band);
    const feather = mesh(new THREE.ConeGeometry(0.03, 0.24, 5), MAT.feather, 0.12, 1.54, -0.04);
    feather.rotation.z = -0.35;
    s.add(feather);
  }
  const armR = new THREE.Group();
  armR.position.set(0.24, 1.12, 0.02);
  armR.add(mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.44, 7), MAT.skinSoldier, 0, -0.18, 0));
  s.add(armR);
  const armL = new THREE.Group();
  armL.position.set(-0.24, 1.12, 0.02);
  armL.add(mesh(new THREE.CylinderGeometry(0.052, 0.046, 0.44, 7), MAT.skinSoldier, 0, -0.18, 0));
  s.add(armL);

  if (role === 'spearman') {
    armR.rotation.x = -0.65;
    const spear = mesh(new THREE.CylinderGeometry(0.022, 0.026, 2.55, 6), MAT.wood, 0.02, 0.25, 0.22);
    spear.rotation.x = 0.55;
    armR.add(spear);
    const tip = mesh(new THREE.ConeGeometry(0.055, 0.34, 6), MAT.bronze, 0.02, 1.38, 0.92);
    tip.rotation.x = 0.55;
    armR.add(tip);
    armL.rotation.x = -0.45;
    const shield = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.045, 14), MAT.woodLight, -0.1, -0.22, 0.22);
    shield.rotation.z = Math.PI / 2;
    shield.rotation.y = 0.35;
    armL.add(shield);
    armL.add(mesh(new THREE.SphereGeometry(0.09, 8, 8), MAT.bronze, -0.13, -0.22, 0.24));
  } else if (role === 'archer') {
    armL.rotation.x = -1.25;
    armR.rotation.x = -0.95;
    const bow = mesh(new THREE.TorusGeometry(0.42, 0.024, 6, 14, Math.PI), MAT.woodLight, 0, -0.36, 0.14);
    bow.rotation.z = -Math.PI / 2;
    armL.add(bow);
    const arrow = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.72, 5), MAT.wood, 0.05, -0.34, 0.12);
    arrow.rotation.x = Math.PI / 2;
    armL.add(arrow);
    const quiver = mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.52, 8), MAT.leather, 0.08, 1.02, -0.22);
    quiver.rotation.z = 0.28;
    s.add(quiver);
  } else if (role === 'crossbow') {
    // Lính nỏ Âu Lạc: hai tay đưa ra trước, nỏ đặt ngang ngực, hướng về phía trước
    armR.rotation.x = -1.25;
    armL.rotation.x = -1.35;
    const cb = crossbow(mats);
    cb.rotation.set(0, -Math.PI / 2, 0);
    cb.position.set(0.02, 1.08, 0.12);
    s.add(cb);
    const quiver = mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.52, 8), MAT.leather, 0.08, 1.02, -0.22);
    quiver.rotation.z = 0.28;
    s.add(quiver);
  } else if (role === 'banner') {
    armR.rotation.x = -0.5;
    const flag = bannerPole(engine, mats, { h: 3.4, w: 0.95, bh: 1.4, phase: Math.random() * 6, texture: banner });
    flag.position.set(0.06, -0.35, 0.25);
    flag.rotation.y = -Math.PI / 2 + 0.15;
    armR.add(flag);
  } else if (role === 'drummer') {
    armR.rotation.x = -1.0;
    armL.rotation.x = -1.0;
    const stick = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 6), MAT.woodLight, 0, -0.35, 0.14);
    stick.rotation.x = 0.6;
    armR.add(stick);
    armL.add(stick.clone());
  }
  s.userData.parts = { legL, legR, armL, armR };
  return shadows(s);
}

/* ---------------- Trống đồng Đông Sơn đặt trên giá gỗ ---------------- */
export function createDrumStand(MAT) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.76, 0.84, 0.14, 12), MAT.wood, 0, 0.07));
  g.add(mesh(new THREE.CylinderGeometry(0.46, 0.64, 0.42, 20), MAT.bronze, 0, 0.35));
  g.add(mesh(new THREE.CylinderGeometry(0.54, 0.46, 0.36, 20), MAT.darkBronze, 0, 0.72));
  g.add(mesh(new THREE.CylinderGeometry(0.74, 0.56, 0.24, 24), MAT.bronze, 0, 1.0));
  g.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.03, 28), MAT.drumTop, 0, 1.13));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const h = mesh(new THREE.TorusGeometry(0.085, 0.022, 6, 10), MAT.gold, Math.cos(a) * 0.58, 0.85, Math.sin(a) * 0.58);
    h.rotation.y = -a;
    g.add(h);
  }
  return shadows(g);
}

/** Hàm cập nhật chuyển động đứng yên tại chỗ cho voi, áo choàng, tay người cưỡi và người đánh trống. */
export function idleAnimator({ elephants = [], drummers = [] }) {
  const capes = elephants.map((e) => e.userData.anim.rider?.userData.cape).filter(Boolean);
  return (dt, t) => {
    for (const e of elephants) {
      const a = e.userData.anim;
      const p = a.phase;
      a.body.position.y = 2.05 + Math.sin(t * 1.1 + p) * 0.025;
      a.head.rotation.x = Math.sin(t * 0.7 + p) * 0.05;
      for (const ear of a.ears) ear.pivot.rotation.y = ear.side * (-0.42 + Math.sin(t * 2.4 + p) * 0.14);
      a.trunk.forEach((s, i) => {
        s.seg.rotation.x = s.base + Math.sin(t * 1.3 + p - i * 0.45) * 0.08;
      });
      a.tail.rotation.z = Math.sin(t * 1.7 + p) * 0.2;
      if (a.rider) a.rider.userData.armR.rotation.x = Math.sin(t * 1.2 + p) * 0.1;
    }
    for (const c of capes) {
      const attr = c.mesh.geometry.attributes.position;
      const arr = attr.array;
      for (let i = 0; i < attr.count; i++) {
        const by = c.base[i * 3 + 1];
        arr[i * 3 + 2] = c.base[i * 3 + 2] + Math.sin(by * 4.2 + t * 3.2 + c.phase) * 0.1 * Math.min(1, Math.abs(by) / 1.05);
      }
      attr.needsUpdate = true;
    }
    for (const d of drummers) {
      const beat = t * 5.6 + d.userData.phase;
      d.userData.parts.armR.rotation.x = -1.0 + Math.sin(beat) * 0.32;
      d.userData.parts.armL.rotation.x = -1.0 - Math.sin(beat) * 0.32;
    }
  };
}

/** Cờ Đông Sơn (không chữ) cho voi và người cầm cờ. */
export const flagTextures = () => ({
  trung: bannerTexture({ base: '#9e1b18', trim: '#f2c94c' }),
  lac: bannerTexture({ base: '#7d1c19', trim: '#e5b949' }),
});
