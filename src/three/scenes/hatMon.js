import * as THREE from 'three';
import { createNoise2D, fbm, mulberry32, smoothstep } from '../noise.js';
import { HeightField, createWater, distToPolyline, groundMaterial, sampleLoop, terrainMesh } from '../terrain.js';
import {
  altarMound,
  bambooGroves,
  bannerPole,
  bronzeDrum,
  commonMaterials,
  fire,
  grassField,
  groundMist,
  placeModel,
  stiltHouse,
  warBoat,
} from '../builders.js';
import { farForest, inBox, inRing, optionalModel, plant, samplePoints } from '../scatter.js';
import {
  createDrumStand,
  createHeroine,
  createSoldier,
  createWarElephant,
  flagTextures,
  idleAnimator,
  instanceTemplate,
  voiChienMaterials,
} from '../models/voiChien.js';

/**
 * MÔ PHỎNG HỘI THỀ HÁT MÔN (mùa xuân năm 40)
 * Hai Bà Trưng tập hợp hào kiệt, làm lễ tế cờ và đọc lời thề bên sông Hát
 * trước khi tiến đánh Mê Linh, Cổ Loa, Luy Lâu.
 */
export const meta = {
  title: 'Hội thề Hát Môn — mùa xuân năm 40',
  subtitle: 'Khởi nghĩa Hai Bà Trưng',
  note: 'Mô phỏng minh họa. Hình dáng đàn thề, nhà cửa, cờ hiệu, voi chiến, trang phục của Hai Bà và nghĩa quân được dựng lại theo phong cách văn hóa Đông Sơn; sử liệu không mô tả chi tiết những điều này.',
};

const WATER = -0.5;

export async function build(engine, { onStatus } = {}) {
  const q = engine.q;
  const scene = engine.scene;
  onStatus?.('Đang dựng bầu trời buổi sớm…');
  await engine.sky('/3d/hdri/qwantani_dawn_puresky_2k.hdr', {
    intensity: 0.85,
    bgIntensity: 1,
    sunIntensity: 3.6,
    sunColor: 0xffc890,
  });
  engine.renderer.toneMappingExposure = 1.05;
  scene.fog = new THREE.FogExp2(0xd8c6ad, 0.0024);
  scene.add(new THREE.HemisphereLight(0xe6d6c0, 0x4f4630, 0.32));

  onStatus?.('Đang đắp đàn thề bên sông Hát…');
  const noise = createNoise2D(41);
  const noiseB = createNoise2D(57);
  const base = (x, z) => 1.4 + fbm(noise, x * 0.007, z * 0.007, 4) * 1.2 + fbm(noise, x * 0.04, z * 0.04, 2) * 0.25;
  const SIZE = 600;
  const hf = new HeightField(SIZE, q.terrainStep);
  hf.fill(base);
  const n = hf.n;
  const blocked = new Uint8Array(n * n);

  // Sông Hát uốn khúc ở phía bắc
  const river = sampleLoop(
    [[-1900, -300], [-950, -170], [-280, -40], [-160, -78], [-60, -66], [40, -92], [140, -70], [280, -110], [950, -190], [1900, -150]],
    600,
    false,
  );
  hf.alongLine(river, 34, (k, d) => {
    hf.h[k] = THREE.MathUtils.lerp(hf.h[k], WATER - 2.8, 1 - smoothstep(16, 30, d));
    hf.dirt[k] = Math.max(hf.dirt[k], 1 - smoothstep(20, 34, d));
    blocked[k] = 1;
  });
  // Bãi đất tụ nghĩa: san phẳng quanh đàn thề
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = hf.xAt(i);
      const z = hf.xAt(j);
      const k = j * n + i;
      const field = 1 - smoothstep(38, 62, Math.hypot(x, z - 18));
      if (field > 0) {
        hf.h[k] = THREE.MathUtils.lerp(hf.h[k], 1.6, field);
        hf.dirt[k] = Math.max(hf.dirt[k], field * (0.45 + fbm(noiseB, x * 0.07, z * 0.07, 2) * 0.4));
      }
      const patch = fbm(noiseB, x * 0.025, z * 0.025, 3);
      if (patch > 0.4) hf.dirt[k] = Math.max(hf.dirt[k], (patch - 0.4) * 1.5);
    }
  }
  // Lối đi từ làng ra đàn thề và ra bến sông
  const paths = [
    sampleLoop([[-140, 70], [-90, 52], [-40, 30], [0, 14]], 80, false),
    sampleLoop([[0, -6], [10, -30], [24, -52]], 40, false),
    sampleLoop([[0, 30], [20, 90], [70, 160], [140, 220]], 80, false),
  ];
  paths.forEach((p) =>
    hf.alongLine(p, 3.6, (k, d) => {
      hf.dirt[k] = Math.max(hf.dirt[k], 0.95 * (1 - smoothstep(1.4, 3.6, d)));
    }),
  );

  // Độ cao mặt đất, có tính cả các bậc của đàn thề (để có thể đi bộ lên đàn)
  let altarInfo = null;
  const groundAt = (x, z) => {
    const inside = Math.abs(x) < SIZE / 2 && Math.abs(z) < SIZE / 2;
    return inside ? Math.max(hf.get(x, z), WATER - 0.4) : farHeight(x, z);
  };
  const heightAt = (x, z) => {
    const g = groundAt(x, z);
    if (!altarInfo) return g;
    const e = Math.max(Math.abs(x), Math.abs(z));
    let tiers = 0;
    for (let i = 0; i < altarInfo.tiers; i++) if (e < (altarInfo.base - 4 * i) / 2 - 1) tiers = i + 1;
    return tiers ? Math.max(g, altarInfo.y0 + tiers * altarInfo.tierH) : g;
  };
  const isBlocked = (x, z) => {
    const i = Math.round((x + hf.half) / hf.step);
    const j = Math.round((z + hf.half) / hf.step);
    if (i < 0 || j < 0 || i >= n || j >= n) return false;
    return blocked[j * n + i] === 1;
  };

  scene.add(terrainMesh(hf, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'brown_mud_leaves_01', repeat: SIZE / 6 }), { tintSeed: 11 }));

  // Núi Ba Vì (ba đỉnh) ở phía tây, đồi thấp xung quanh
  function farHeight(x, z) {
    const r = Math.hypot(x, z);
    const dr = distToPolyline(river, x, z);
    let h = base(x, z) + smoothstep(420, 1200, r) * smoothstep(40, 240, dr) * (20 + 90 * Math.max(0, fbm(noiseB, x * 0.002, z * 0.002, 5) + 0.3));
    h -= 4.5 * (1 - smoothstep(16, 30, dr));
    const peaks = [
      [-1500, 380, 360, 620],
      [-1380, 650, 300, 540],
      [-1640, 120, 280, 520],
    ];
    for (const [px, pz, ph, pr] of peaks) {
      const d = Math.hypot(x - px, z - pz);
      h += ph * Math.exp(-((d / pr) ** 2) * 2.2) * (0.85 + fbm(noise, x * 0.004, z * 0.004, 4) * 0.25);
    }
    return h;
  }
  const far = new HeightField(4200, 21);
  far.fill((x, z) => {
    const e = Math.max(Math.abs(x), Math.abs(z));
    if (e < SIZE / 2 - 18) return farHeight(x, z) - 14;
    if (e < SIZE / 2 + 14) return farHeight(x, z) - 0.4;
    return farHeight(x, z);
  });
  far.dirt.fill(0.12);
  const farMesh = terrainMesh(far, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'brown_mud_leaves_01', repeat: 4200 / 9 }), { tintSeed: 5 });
  farMesh.receiveShadow = false;
  scene.add(farMesh);
  scene.add(createWater(engine, { size: 4200, level: WATER, color: 0x3d4a39, distortion: 1.6 }));

  /* ---------------- Đàn thề ---------------- */
  onStatus?.('Đang dựng đàn thề, cờ và trống đồng…');
  const mats = commonMaterials(engine);
  const put = (obj, x, z, ry = 0, dy = 0) => {
    obj.position.set(x, heightAt(x, z) + dy, z);
    obj.rotation.y = ry;
    scene.add(obj);
    return obj;
  };
  const altar = altarMound(engine, mats, { base: 24, tiers: 3, tierH: 1.15 });
  put(altar, 0, 0, 0, -0.1);
  const topY = groundAt(0, 0) - 0.1 + altar.userData.topY;
  altarInfo = { base: 24, tiers: 3, tierH: 1.15, y0: groundAt(0, 0) - 0.1 };
  const top = new THREE.Group();
  top.position.set(0, topY, 0);
  scene.add(top);
  // bàn thờ
  const table = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.4), mats.planks);
  table.position.set(0, 0.45, -2.6);
  table.castShadow = true;
  top.add(table);
  const pot = (await engine.gltf('/3d/models/ceramic_pot.glb')).scene;
  for (let i = -1; i <= 1; i++) {
    const p = pot.clone();
    p.scale.setScalar(0.9);
    p.position.set(i * 1.1, 0.9, -2.6);
    top.add(p);
  }
  const basketM = (await engine.gltf('/3d/models/wicker_basket_01.glb')).scene;
  for (const x of [-2.6, 2.6]) {
    const b = basketM.clone();
    b.scale.setScalar(1.3);
    b.position.set(x, 0, -2.4);
    top.add(b);
  }
  // trống đồng trên đàn
  const drum = bronzeDrum(engine, { scale: 1.3 });
  drum.position.set(2.8, 0, 1.6);
  top.add(drum);
  const userDrum = await optionalModel(engine, 'trong-dong.glb');
  if (userDrum) {
    drum.visible = false;
    top.add(placeModel(userDrum, { height: 0.63 * 1.3, x: 2.8, y: 0, z: 1.6 }));
  }
  // lửa ở bốn góc đàn
  const firePit = (await engine.gltf('/3d/models/stone_fire_pit.glb')).scene;
  const s = altar.userData.topSize / 2 - 1;
  for (const [x, z] of [[-s, -s], [s, -s], [-s, s], [s, s]]) {
    const fp = firePit.clone();
    fp.scale.setScalar(0.9);
    fp.position.set(x, 0, z);
    top.add(fp);
    top.add(fire(engine, { x, y: 0.15, z, size: 0.8 }));
  }

  // Cờ khởi nghĩa xếp hình vòng cung
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * (0.12 + (i / 13) * 0.76);
    const r = 26;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.9 + 6;
    put(bannerPole(engine, mats, { h: 10 + (i % 3), w: 2.4, bh: 3.6, phase: i * 0.7 }), x, z, -Math.PI / 2 + 0.4);
  }
  // Cờ lớn trên đàn
  const bigFlag = bannerPole(engine, mats, { h: 14, w: 3.6, bh: 5.2, phase: 0.3 });
  bigFlag.position.set(-3.2, topY, -3.4);
  bigFlag.rotation.y = -Math.PI / 2 + 0.3;
  scene.add(bigFlag);

  /* ---------------- Làng Mê Linh và bến sông ---------------- */
  const ladderGltf = await engine.gltf('/3d/models/wooden_ladder.glb');
  const ladder = ladderGltf.scene.clone();
  ladder.scale.setScalar(1.1);
  const village = [
    [-150, 80], [-170, 58], [-130, 104], [-182, 100], [-118, 62],
    [-160, 130], [-200, 74], [-140, 36],
  ];
  village.forEach(([x, z], i) => {
    if (isBlocked(x, z)) return;
    put(stiltHouse(engine, mats, { L: 7 + (i % 3) * 1.2, W: 4.4, ladder }), x, z, 0.4 + i * 0.6);
  });
  const pier = (await engine.gltf('/3d/models/modular_wooden_pier.glb')).scene;
  const pierP = pier.clone();
  pierP.scale.setScalar(1.4);
  pierP.position.set(26, WATER + 0.3, -50);
  pierP.rotation.y = 0.3;
  scene.add(pierP);
  const boat = (x, z, ry, L = 12) => {
    const b = warBoat(engine, mats, { L });
    b.position.set(x, WATER - 0.45, z);
    b.rotation.y = ry;
    scene.add(b);
  };
  boat(40, -62, 0.25);
  boat(10, -70, -0.1, 10);
  boat(-60, -70, 0.15, 14);

  /* ---------------- Cây cối ---------------- */
  onStatus?.('Đang trồng tre làng và cây cối…');
  const flat = (x, z, minH = WATER + 0.9) => !isBlocked(x, z) && heightAt(x, z) > minH && hf.slope(x, z) < 0.25;
  const awayAltar = (x, z) => Math.hypot(x, z - 10) > 64;

  const trees = samplePoints({
    count: Math.round(30 * q.trees),
    seed: 7,
    area: inBox(-250, -250, 250, 250),
    accept: (x, z) => flat(x, z) && awayAltar(x, z),
    minDist: 15,
  });
  scene.add(await plant(engine, '/3d/models/island_tree_02.glb', trees, heightAt, { scale: [0.75, 1.2], sink: 0.2 }));
  const shrubs = samplePoints({ count: Math.round(70 * q.trees), seed: 9, area: inBox(-240, -240, 240, 240), accept: (x, z) => flat(x, z, WATER + 0.4) && awayAltar(x, z), minDist: 4 });
  const half = Math.floor(shrubs.length / 2);
  scene.add(await plant(engine, '/3d/models/shrub_02.glb', shrubs.slice(0, half), heightAt, { scale: [1.2, 2.2] }));
  scene.add(await plant(engine, '/3d/models/shrub_04.glb', shrubs.slice(half), heightAt, { scale: [1.2, 2.2] }));
  const ferns = samplePoints({ count: Math.round(90 * q.trees), seed: 15, area: inBox(-230, -230, 230, 230), accept: (x, z) => flat(x, z, WATER + 0.2) && awayAltar(x, z) });
  scene.add(await plant(engine, '/3d/models/fern_02.glb', ferns, heightAt, { scale: [1.4, 2.6], cast: false }));
  const stumps = samplePoints({ count: 10, seed: 3, area: inBox(-200, -200, 200, 200), accept: (x, z) => flat(x, z) && awayAltar(x, z) });
  scene.add(await plant(engine, '/3d/models/tree_stump_01.glb', stumps, heightAt, { scale: [1, 1.6] }));

  // Lũy tre bao quanh làng, bụi tre ven sông
  const groves = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const x = -155 + Math.cos(a) * 62;
    const z = 82 + Math.sin(a) * 58;
    if (!isBlocked(x, z)) groves.push({ x, z, count: 18, r: 1.8 });
  }
  samplePoints({ count: 22, seed: 21, area: inBox(-240, -60, 240, 240), accept: (x, z) => flat(x, z) && awayAltar(x, z), minDist: 20 }).forEach((p) => groves.push({ x: p.x, z: p.z, count: 14, r: 1.4 }));
  scene.add(bambooGroves(engine, groves, { heightAt, seed: 29 }));

  scene.add(
    grassField(engine, {
      count: Math.round(50000 * q.grass),
      pick: (rnd) => {
        const a = rnd() * Math.PI * 2;
        const r = 20 + Math.sqrt(rnd()) * 200;
        const x = -20 + Math.cos(a) * r;
        const z = 40 + Math.sin(a) * r;
        const i = Math.round((x + hf.half) / hf.step);
        const j = Math.round((z + hf.half) / hf.step);
        if (i < 0 || j < 0 || i >= n || j >= n) return null;
        if (hf.dirt[j * n + i] > 0.42) return null;
        const y = hf.get(x, z);
        if (y < WATER + 0.5) return null;
        return { x, y, z };
      },
      seed: 33,
    }),
  );
  const farPts = samplePoints({ count: q.trees > 0.5 ? 900 : 420, seed: 27, area: inRing(0, 0, 320, 1200), accept: (x, z) => farHeight(x, z) > WATER + 1 && farHeight(x, z) < 90 });
  scene.add(farForest(engine, farPts, (x, z) => farHeight(x, z)));

  // Sương sớm sát mặt sông và cánh đồng
  scene.add(groundMist(engine, { count: q.trees > 0.5 ? 46 : 22, area: 420, y: 1.2, heightAt, opacity: 0.32 }));

  /* ---------------- Hai Bà Trưng trên voi chiến, nghĩa quân và trống trận ---------------- */
  onStatus?.('Đang đưa voi chiến và nghĩa quân về trước đàn thề…');
  const VM = voiChienMaterials();
  const flags = flagTextures();
  const trungTrac = createHeroine(VM, { name: 'TrungTrac', armorMat: VM.crimson, skirtMat: VM.deepRed, capeMat: VM.crimson, weapon: 'sword', shield: true, phase: 0 });
  const trungNhi = createHeroine(VM, { name: 'TrungNhi', armorMat: VM.tealArmor, skirtMat: VM.deepRed, capeMat: VM.crimson, weapon: 'spear', phase: 1.8 });
  // Hai voi đứng trước đàn thề, quay mặt về phía nghĩa quân
  const ELE = { trac: { x: -5.5, z: 19 }, nhi: { x: 5.5, z: 19 } };
  const warElephants = [
    { ...ELE.trac, yaw: 0.1, rider: trungTrac, blanketMat: VM.crimson, banner: flags.trung, phase: 0 },
    { ...ELE.nhi, yaw: -0.1, rider: trungNhi, blanketMat: VM.deepRed, banner: flags.lac, phase: 1.8 },
  ].map((c) => {
    const e = createWarElephant(engine, VM, mats, c);
    e.scale.setScalar(0.92);
    return put(e, c.x, c.z, c.yaw);
  });

  // Nghĩa quân đứng hàng, chừa lối giữa; gộp thành InstancedMesh cho nhẹ máy
  const rndArmy = mulberry32(17);
  const tunics = [VM.earthTunic, VM.indigoTunic, VM.crimson];
  const ranks = [{ z: 34, role: 'spearman' }, { z: 36.4, role: 'spearman' }, { z: 38.8, role: 'archer' }];
  const cols = [-10.5, -8.3, -6.1, -3.9, -1.7, 1.7, 3.9, 6.1, 8.3, 10.5];
  const troops = new Map();
  ranks.forEach((r, ri) =>
    cols.forEach((cx, ci) => {
      const key = `${r.role}|${(ri + ci) % 3}`;
      const x = cx + (rndArmy() - 0.5) * 0.3;
      const z = r.z + (rndArmy() - 0.5) * 0.3;
      if (!troops.has(key)) troops.set(key, []);
      troops.get(key).push({ x, y: heightAt(x, z), z, ry: Math.PI + (rndArmy() - 0.5) * 0.12 });
    }),
  );
  troops.forEach((list, key) => {
    const [role, t] = key.split('|');
    scene.add(instanceTemplate(createSoldier(engine, VM, mats, role, tunics[+t]), list));
  });
  // Người cầm cờ ở bốn góc đội hình
  for (const [x, z] of [[-12.7, 34], [12.7, 34], [-12.7, 38.8], [12.7, 38.8]]) {
    put(createSoldier(engine, VM, mats, 'banner', VM.crimson, { banner: flags.lac }), x, z, Math.PI);
  }
  // Trống trận đặt trên giá ở đầu lối giữa, hai người đánh trống
  const DRUM = { x: 0, z: 31.2 };
  put(createDrumStand(VM), DRUM.x, DRUM.z);
  const drummers = [
    [-1.05, Math.PI / 2, 0, VM.crimson],
    [1.05, -Math.PI / 2, Math.PI, VM.earthTunic],
  ].map(([dx, ry, phase, tunic]) => {
    const d = createSoldier(engine, VM, mats, 'drummer', tunic);
    d.userData.phase = phase;
    return put(d, DRUM.x + dx, DRUM.z, ry);
  });
  engine.updaters.push(idleAnimator({ elephants: warElephants, drummers }));

  /* ---------------- Mô hình tùy chọn (Sketchfab) ---------------- */
  // Nếu có file voi.glb / chien-binh.glb, chúng đứng phía sau đội hình nghĩa quân.
  const elephant = await optionalModel(engine, 'voi.glb');
  const mixers = [];
  if (elephant) {
    for (const [x, z, yaw] of [[-6, 46, Math.PI], [6, 46, Math.PI]]) {
      const e = placeModel(elephant, { height: 3.0, x, y: heightAt(x, z), z, yaw });
      scene.add(e);
      if (elephant.animations?.length) {
        const mixer = new THREE.AnimationMixer(e);
        mixer.clipAction(elephant.animations[0]).play();
        mixers.push(mixer);
      }
    }
  }
  const soldier = await optionalModel(engine, 'chien-binh.glb');
  if (soldier) {
    for (let r = 0; r < 4; r++) {
      for (let c = -5; c <= 5; c++) {
        const x = c * 2.3;
        const z = 51 + r * 2.6;
        scene.add(placeModel(soldier, { height: 1.65, x, y: heightAt(x, z), z, yaw: Math.PI }));
      }
    }
  }
  if (mixers.length) engine.updaters.push((dt) => mixers.forEach((m) => m.update(dt)));

  /* ---------------- Điểm chú thích ---------------- */
  const hp = (id, title, text, x, y, z, view) => ({ id, title, text, x, y, z, view });
  const v = (x, z, lift, tx, ty, tz, fov) => ({ x, z, lift, target: { x: tx, y: ty, z: tz }, fov });
  const hotspots = [
    hp('dan-the', 'Đàn thề Hát Môn', 'Mùa xuân năm 40, Hai Bà Trưng tập hợp các Lạc tướng và hào kiệt, làm lễ tế cờ và đọc lời thề tại Hát Môn (nay thuộc Hà Nội) trước khi phát động khởi nghĩa chống ách đô hộ của nhà Hán.', 0, topY + 3, 0, v(0, 48, 9, 0, topY, 0)),
    hp('loi-the', 'Lời thề', 'Theo sách “Thiên Nam ngữ lục”, lời thề của Trưng Trắc gồm bốn câu: “Một xin rửa sạch nước thù / Hai xin đem lại nghiệp xưa họ Hùng / Ba kẻo oan ức lòng chồng / Bốn xin vẻn vẹn sở công lênh này.”', 0, topY + 1.6, -2.6, v(0, 4.5, 0, 0, topY + 1, -2.6, 48)),
    hp('co', 'Cờ khởi nghĩa', 'Hào kiệt khắp nơi kéo về tụ nghĩa dưới cờ của Hai Bà. Chỉ trong thời gian ngắn, nghĩa quân làm chủ Mê Linh, rồi tiến đánh Cổ Loa và Luy Lâu, buộc thái thú Tô Định bỏ trốn về nước.', 18, heightAt(18, 24) + 9, 24, v(40, 64, 6, 0, 6, 10)),
    hp('trong-dong', 'Trống đồng', 'Tiếng trống đồng là hiệu lệnh tập hợp, thúc quân. Trống đồng Đông Sơn tiếp tục được người Việt sử dụng suốt thời kỳ Bắc thuộc như biểu tượng của cộng đồng.', 2.8, topY + 1.4, 1.6, v(2.8, 3.4, 1.1, 2.8, topY + 0.85, 1.6, 42)),
    hp('song-hat', 'Sông Hát', 'Sông Hát (Hát Giang) là một đoạn sông Đáy chảy qua Hát Môn. Theo truyền thuyết, năm 43 khi cuộc kháng chiến thất bại, Hai Bà Trưng đã gieo mình xuống dòng sông này để giữ trọn khí tiết.', 24, 2, -62, v(10, -20, 5, 30, 0, -70)),
    hp('lang', 'Làng Mê Linh', 'Hai Bà là con gái Lạc tướng huyện Mê Linh, vùng đất từ chân núi Ba Vì tới Tam Đảo. Người Lạc Việt sống trong những ngôi nhà sàn, quanh làng là lũy tre xanh.', -150, heightAt(-150, 80) + 8, 80, v(-95, 60, 12, -150, 4, 82)),
    hp('voi', 'Voi chiến', 'Trong tranh dân gian và truyền thuyết, Hai Bà Trưng cưỡi voi ra trận. Voi là con vật quen thuộc của cư dân Lạc Việt, được dùng trong chiến đấu và vận chuyển. Người ngồi trên cổ voi là quản tượng; Hai Bà đứng trong bành voi bằng gỗ.', 0, heightAt(0, 19) + 4.2, 19, v(0, 44, 3.2, 0, heightAt(0, 19) + 4, 19)),
    hp('trung-trac', 'Trưng Trắc', 'Trưng Trắc là con gái Lạc tướng huyện Mê Linh, người đứng đầu cuộc khởi nghĩa. Khởi nghĩa thắng lợi, 65 thành trì được giải phóng; Bà lên ngôi vua (Trưng Vương), đóng đô ở Mê Linh.', ELE.trac.x, heightAt(ELE.trac.x, ELE.trac.z) + 5.6, ELE.trac.z, v(-4.4, 27.4, 2.4, ELE.trac.x, heightAt(ELE.trac.x, ELE.trac.z) + 3, ELE.trac.z, 50)),
    hp('trung-nhi', 'Trưng Nhị', 'Trưng Nhị, em gái Trưng Trắc, cùng chị phất cờ khởi nghĩa và chỉ huy nghĩa quân. Khi nhà Hán sai Mã Viện sang đàn áp, Hai Bà chỉ huy chiến đấu quyết liệt ở Lãng Bạc rồi lui về Cấm Khê.', ELE.nhi.x, heightAt(ELE.nhi.x, ELE.nhi.z) + 5.6, ELE.nhi.z, v(4.4, 27.4, 2.4, ELE.nhi.x, heightAt(ELE.nhi.x, ELE.nhi.z) + 3, ELE.nhi.z, 50)),
    hp('nghia-quan', 'Nghĩa quân', 'Hưởng ứng lời kêu gọi của Hai Bà, hào kiệt và nhân dân khắp nơi, cả các quận Cửu Chân, Nhật Nam, Hợp Phố, kéo về tụ nghĩa. Nghĩa quân mang giáo đồng, khiên, cung và cờ hiệu; tiếng trống đồng giữ nhịp tập hợp, thúc quân.', 0, heightAt(0, 36.4) + 3.2, 36.4, v(0, 27.4, 1.4, 0, heightAt(0, 36) + 0.8, 36, 60)),
    hp('ba-vi', 'Núi Ba Vì', 'Dãy núi thiêng ở phía tây, gắn với truyền thuyết Sơn Tinh. Vùng đất Mê Linh – Hát Môn nằm giữa núi Ba Vì và sông Hồng.', -600, 120, 230, v(-60, 90, 30, -1500, 200, 380)),
  ];
  const start = { x: 0, z: 62, lift: 1.5, target: { x: 0, y: topY + 2, z: 0 } };
  const credits = [
    'Bầu trời HDRI, vân bề mặt và mô hình cây, bụi, chum, giỏ, bến gỗ, thang, đá: Poly Haven (CC0).',
    'Ảnh pháp tuyến mặt nước: dự án three.js (giấy phép MIT).',
    'Đàn thề, nhà sàn, trống đồng, thuyền, cờ, tre và cỏ: dựng bằng mã nguồn theo phong cách văn hóa Đông Sơn.',
    'Voi chiến, Hai Bà Trưng, quản tượng, nghĩa binh và trống đồng trên giá: mô hình dựng bằng mã nguồn do nhóm thực hiện cung cấp.',
  ];
  if (userDrum) credits.push('Mô hình “Trống đồng Đông Sơn – Việt Nam” của ndnguyen3d, Sketchfab (CC BY 4.0).');
  if (elephant) credits.push('Mô hình “Elephant – Realistic” của MONKEY D. LUFFY, Sketchfab (CC BY 4.0).');
  if (soldier) credits.push('Mô hình “Tribal Man” của Çağhan Büyükavcı, Sketchfab (CC BY 4.0).');
  return { heightAt, hotspots, start, credits, bounds: 250 };
}
