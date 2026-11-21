import * as THREE from 'three';
import { createNoise2D, fbm, smoothstep } from '../noise.js';
import { HeightField, createWater, distToPolyline, groundMaterial, sampleLoop, terrainMesh } from '../terrain.js';
import {
  arrowBundle,
  bambooGroves,
  bannerPole,
  bronzeDrum,
  commonMaterials,
  crossbowRack,
  fire,
  gateHouse,
  grassField,
  instanceTemplate,
  palisade,
  placeModel,
  roundHut,
  stiltHouse,
  warBoat,
  watchtower,
} from '../builders.js';
import { bannerTexture } from '../textures.js';
import { farForest, inBox, inRing, optionalModel, plant, samplePoints } from '../scatter.js';
import { createSoldier, voiChienMaterials } from '../models/voiChien.js';

/**
 * MÔ PHỎNG THÀNH CỔ LOA (thế kỷ III – II TCN) — DẠNG SA BÀN
 * Ba vòng thành dựng thành ba bậc nền cao dần vào trong; mép mỗi bậc có hàng rào gỗ,
 * quân giữ thành đứng sau rào, chân mỗi bậc có hào nước. Giữa các vòng là xóm nhà sàn mái tròn.
 * Ngoài thành là đồng ruộng, sông Hoàng Giang và đạo quân Triệu Đà đang vây thành.
 */
export const meta = {
  title: 'Thành Cổ Loa — kinh đô nước Âu Lạc',
  subtitle: 'Kháng chiến chống Tần và chống Triệu, thế kỷ III – II TCN',
  note: 'Mô phỏng minh họa dạng sa bàn. Để dễ quan sát, ba vòng thành được dựng thành ba bậc nền cao dần vào trong, mép mỗi bậc có hàng rào gỗ, ngoài mỗi vòng có hào nước; thực tế Cổ Loa là ba vòng lũy đất đắp, chu vi khoảng 8 km, 6,5 km và 1,6 km. Nhà mái tròn, hàng rào gỗ và đội hình quân lính là hình dung minh họa.',
};

const V3 = THREE.Vector3;
const lerp = THREE.MathUtils.lerp;
const WATER = -0.6;
const PLAIN = 1.9; // độ cao đồng bằng quanh thành
const TIER = 4.5; // mỗi vòng thành cao thêm một bậc

export async function build(engine, { onStatus } = {}) {
  const q = engine.q;
  const scene = engine.scene;
  onStatus?.('Đang dựng bầu trời…');
  await engine.sky('/3d/hdri/kloofendal_48d_partly_cloudy_puresky_2k.hdr', {
    intensity: 0.9,
    sunIntensity: 3.2,
    sunColor: 0xfff0d8,
  });
  scene.fog = new THREE.FogExp2(0xbcc6cc, 0.0011);
  scene.add(new THREE.HemisphereLight(0xd6e2ee, 0x5c5135, 0.35));

  /* ---------------- Ba vòng thành ---------------- */
  onStatus?.('Đang đắp ba bậc thành đất…');
  const noise = createNoise2D(12);
  const noiseB = createNoise2D(31);
  const base = (x, z) => 1.6 + fbm(noise, x * 0.006, z * 0.006, 4) * 1.2 + fbm(noise, x * 0.03, z * 0.03, 2) * 0.25;

  const SIZE = 560;
  const hf = new HeightField(SIZE, q.terrainStep);
  hf.fill(base);
  const n = hf.n;
  const blocked = new Uint8Array(n * n);
  const cellX = (k) => hf.xAt(k % n);
  const cellZ = (k) => hf.xAt(Math.floor(k / n));

  const ringPts = (cx, cz, rx, rz, count, wob, seed) => {
    const ctrl = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const w = 1 + wob * Math.sin(a * 3 + seed) + wob * 0.6 * Math.sin(a * 5 + seed * 2);
      ctrl.push([cx + Math.cos(a) * rx * w, cz + Math.sin(a) * rz * w]);
    }
    return ctrl;
  };
  // Thành Nội gần hình chữ nhật; thành Trung, thành Ngoại uốn theo địa hình
  const inner = sampleLoop([[-54, -30], [-46, -40], [46, -40], [54, -30], [54, 30], [46, 40], [-46, 40], [-54, 30]], 300);
  const middle = sampleLoop(ringPts(6, 2, 118, 100, 12, 0.07, 1.3), 480);
  const outer = sampleLoop(ringPts(-4, 8, 186, 162, 14, 0.06, 2.1), 640);

  // Điểm trên đường thành theo góc (nhìn từ gốc tọa độ), kèm hướng chỉ ra ngoài thành
  const pointAt = (pts, ang) => {
    let bi = 0;
    let bd = Infinity;
    pts.forEach((p, i) => {
      let d = Math.abs(Math.atan2(p.z, p.x) - ang);
      if (d > Math.PI) d = 2 * Math.PI - d;
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    const a = pts[(bi - 1 + pts.length) % pts.length];
    const b = pts[(bi + 1) % pts.length];
    const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    return { x: pts[bi].x, z: pts[bi].z, out: { x: (b.z - a.z) / L, z: -(b.x - a.x) / L } };
  };
  // Cổng ba vòng so le nhau: muốn vào thành Nội phải đi vòng như xoáy trôn ốc
  const TIERS = [
    { pts: outer, gate: pointAt(outer, Math.PI * 0.06) },
    { pts: middle, gate: pointAt(middle, Math.PI * 0.32) },
    { pts: inner, gate: pointAt(inner, Math.PI * 0.5) },
  ];
  const GATES = TIERS.map((t) => t.gate);
  const nearGate = (x, z, r) => GATES.some((g) => (x - g.x) ** 2 + (z - g.z) ** 2 < r * r);

  // Ô lưới nằm trong đa giác (quét theo từng hàng)
  const insideMask = (pts) => {
    const m = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) {
      const z = hf.xAt(j);
      const xs = [];
      for (let s = 0; s < pts.length; s++) {
        const a = pts[s];
        const b = pts[(s + 1) % pts.length];
        if ((a.z <= z && b.z > z) || (b.z <= z && a.z > z)) xs.push(a.x + ((z - a.z) / (b.z - a.z)) * (b.x - a.x));
      }
      xs.sort((p, r) => p - r);
      for (let t = 0; t + 1 < xs.length; t += 2) {
        const i0 = Math.max(0, Math.ceil((xs[t] + hf.half) / hf.step));
        const i1 = Math.min(n - 1, Math.floor((xs[t + 1] + hf.half) / hf.step));
        for (let i = i0; i <= i1; i++) m[j * n + i] = 1;
      }
    }
    return m;
  };

  // Mỗi vòng thành nâng phần bên trong lên một bậc; sườn dốc, riêng lối lên cổng thì thoải
  const raise = new Float32Array(n * n);
  const bank = new Float32Array(n * n);
  for (const T of TIERS) {
    const inside = insideMask(T.pts);
    const frac = Float32Array.from(inside);
    const g = T.gate;
    hf.alongLine(
      T.pts,
      12,
      (k, d) => {
        const ramp = 1 - smoothstep(6, 12, Math.hypot(cellX(k) - g.x, cellZ(k) - g.z));
        const a = lerp(2, 10, ramp);
        frac[k] = smoothstep(-a, a, inside[k] ? d : -d);
        bank[k] = Math.max(bank[k], (1 - smoothstep(a * 0.5, a * 1.3, d)) * (1 - ramp));
      },
      { closed: true },
    );
    for (let k = 0; k < n * n; k++) raise[k] += frac[k];
  }

  // Xóm nhà mái tròn giữa các vòng thành
  const between = (outPts, inPts, ang, t) => {
    const a = pointAt(inPts, ang);
    const b = pointAt(outPts, ang);
    return { x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t) };
  };
  const HAMLETS = [
    ...[0.55, 0.92, 1.28, 1.62].map((f) => ({ ...between(outer, middle, Math.PI * f, 0.55), count: 7, r: 16 })),
    ...[0.78, 1.15, 1.5, 1.85].map((f) => ({ ...between(middle, inner, Math.PI * f, 0.5), count: 6, r: 14 })),
    { x: -40, z: -28, count: 2, r: 6 },
    { x: 40, z: -28, count: 2, r: 6 },
  ];
  // Đồng ruộng và nơi đóng quân của quân Triệu Đà ở ngoài thành
  const offOuter = (f, dist) => {
    const p = pointAt(outer, Math.PI * f);
    return { x: p.x + p.out.x * dist, z: p.z + p.out.z * dist, out: p.out };
  };
  const FIELDS = [-0.25, -0.45, -0.65, 1.05, 1.22].map((f) => ({ ...offOuter(f, 44), w: 38, h: 24 }));
  const ENEMY = [0.66, 0.76, 0.86].map((f) => offOuter(f, 48));

  for (let k = 0; k < n * n; k++) {
    const x = cellX(k);
    const z = cellZ(k);
    const top = Math.min(1, raise[k]);
    hf.h[k] = lerp(hf.h[k], PLAIN + fbm(noiseB, x * 0.04, z * 0.04, 2) * 0.12, top * 0.85) + raise[k] * TIER;
    if (bank[k] > 0.05) {
      hf.dirt[k] = Math.max(hf.dirt[k], 0.75 * bank[k]);
      if (bank[k] > 0.4) blocked[k] = 1;
    }
    const patch = fbm(noiseB, x * 0.02, z * 0.02, 3);
    if (patch > 0.38) hf.dirt[k] = Math.max(hf.dirt[k], (patch - 0.38) * 1.5);
    // sân cung điện
    const yard = 1 - smoothstep(0.7, 1, Math.max(Math.abs(x) / 44, Math.abs(z + 2) / 30));
    if (yard > 0) hf.dirt[k] = Math.max(hf.dirt[k], yard * (0.55 + fbm(noiseB, x * 0.08, z * 0.08, 2) * 0.35));
    // sân đất giữa các xóm
    for (const hm of HAMLETS) {
      const y = 1 - smoothstep(hm.r * 0.7, hm.r * 1.25, Math.hypot(x - hm.x, z - hm.z));
      if (y > 0) hf.dirt[k] = Math.max(hf.dirt[k], y * (0.5 + fbm(noiseB, x * 0.1, z * 0.1, 2) * 0.4));
    }
    // ruộng: luống đất chạy song song
    for (const fd of FIELDS) {
      const dx = x - fd.x;
      const dz = z - fd.z;
      const u = dx * fd.out.z - dz * fd.out.x;
      const v = dx * fd.out.x + dz * fd.out.z;
      if (Math.abs(u) < fd.w / 2 && Math.abs(v) < fd.h / 2) {
        hf.dirt[k] = Math.max(hf.dirt[k], Math.sin(v * 1.5) > 0.2 ? 0.78 : 0.42);
        blocked[k] = 1;
      }
    }
    for (const e of ENEMY) {
      const d = Math.hypot(x - e.x, z - e.z);
      if (d < 16) {
        hf.dirt[k] = Math.max(hf.dirt[k], 0.45 * (1 - smoothstep(9, 16, d)));
        blocked[k] = 1;
      }
    }
  }

  // Hào nước ngoài mỗi vòng thành; hào trên các bậc có mặt nước riêng
  const centroid = (pts) => pts.reduce((c, p) => c.add(p), new V3()).multiplyScalar(1 / pts.length);
  const moats = TIERS.map((T, ri) => {
    const c = centroid(T.pts);
    const avg = T.pts.reduce((s, p) => s + Math.hypot(p.x - c.x, p.z - c.z), 0) / T.pts.length;
    const kk = 1 + [13, 11, 10][ri] / avg;
    const mp = T.pts.map((p) => new V3(c.x + (p.x - c.x) * kk, 0, c.z + (p.z - c.z) * kk));
    const gp = { x: c.x + (T.gate.x - c.x) * kk, z: c.z + (T.gate.z - c.z) * kk };
    const level = ri === 0 ? WATER : PLAIN + ri * TIER - 1.0;
    const bottom = ri === 0 ? WATER - 1.3 : level - 1.4;
    hf.alongLine(
      mp,
      8,
      (i, d) => {
        hf.h[i] = lerp(hf.h[i], bottom, 1 - smoothstep(3.6, 6.8, d));
        hf.dirt[i] = Math.max(hf.dirt[i], 1 - smoothstep(5, 8, d));
        if (d < 6.8) blocked[i] = 1;
      },
      { closed: true, skip: (x, z) => Math.hypot(x - gp.x, z - gp.z) < 7 },
    );
    return { mp, gp, level };
  });

  // Sông Hoàng Giang ở phía đông, có kênh nối với hào ngoài
  const river = sampleLoop(
    [[285, -1700], [268, -950], [252, -430], [248, -160], [255, 0], [246, 150], [256, 430], [284, 950], [318, 1700]],
    520,
    false,
  );
  hf.alongLine(river, 22, (k, d) => {
    hf.h[k] = lerp(hf.h[k], WATER - 2.6, 1 - smoothstep(9, 19, d));
    hf.dirt[k] = Math.max(hf.dirt[k], 1 - smoothstep(12, 22, d));
    blocked[k] = 1;
  });
  const east = pointAt(moats[0].mp, 0);
  const channel = [new V3(east.x - 4, 0, east.z + 30), new V3(255, 0, east.z + 34)];
  hf.alongLine(channel, 9, (k, d) => {
    hf.h[k] = lerp(hf.h[k], WATER - 1.8, 1 - smoothstep(3, 7.5, d));
    hf.dirt[k] = Math.max(hf.dirt[k], 1 - smoothstep(5, 9, d));
    blocked[k] = 1;
  });

  // Đường đất xoáy vào trong qua ba cổng
  const [gO, gM, gI] = GATES;
  const road = sampleLoop(
    [
      [gI.x, gI.z - 14],
      [gI.x, gI.z + 12],
      [gI.x + 30, gI.z + 30],
      [gM.x - gM.out.x * 14, gM.z - gM.out.z * 14],
      [gM.x + gM.out.x * 16, gM.z + gM.out.z * 16],
      [(gM.x + gO.x) / 2 + 10, (gM.z + gO.z) / 2 + 12],
      [gO.x - gO.out.x * 14, gO.z - gO.out.z * 14],
      [gO.x + gO.out.x * 18, gO.z + gO.out.z * 18],
      [238, gO.z + 6],
    ],
    220,
    false,
  );
  hf.alongLine(road, 4, (k, d) => {
    hf.dirt[k] = Math.max(hf.dirt[k], 0.95 * (1 - smoothstep(1.6, 4, d)));
  });

  const heightAt = (x, z) => {
    const inside = Math.abs(x) < SIZE / 2 && Math.abs(z) < SIZE / 2;
    return inside ? Math.max(hf.get(x, z), WATER - 0.4) : farHeight(x, z);
  };
  const isBlocked = (x, z) => {
    const i = Math.round((x + hf.half) / hf.step);
    const j = Math.round((z + hf.half) / hf.step);
    if (i < 0 || j < 0 || i >= n || j >= n) return false;
    return blocked[j * n + i] === 1;
  };

  onStatus?.('Đang phủ cỏ và đất…');
  scene.add(terrainMesh(hf, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'brown_mud_dry', repeat: SIZE / 6 })));

  // Địa hình xa: đồng ruộng và dãy núi (Tam Đảo ở phía bắc)
  function farHeight(x, z) {
    const r = Math.hypot(x, z);
    const north = smoothstep(0, -1, z / (r || 1));
    const dr = distToPolyline(river, x, z);
    const m = smoothstep(420, 1400, r) * smoothstep(40, 260, dr) * (30 + 170 * Math.max(0, fbm(noiseB, x * 0.0016, z * 0.0016, 5) + 0.35) * (0.6 + north * 0.8));
    return base(x, z) + m - 4.2 * (1 - smoothstep(9, 19, dr));
  }
  const far = new HeightField(3400, 17);
  far.fill((x, z) => {
    const e = Math.max(Math.abs(x), Math.abs(z));
    if (e < SIZE / 2 - 16) return farHeight(x, z) - 14;
    if (e < SIZE / 2 + 12) return farHeight(x, z) - 0.4;
    return farHeight(x, z);
  });
  far.dirt.fill(0.15);
  const farMesh = terrainMesh(far, groundMaterial(engine, { grass: 'leafy_grass', dirt: 'brown_mud_dry', repeat: 3400 / 9 }), { tintSeed: 3 });
  farMesh.receiveShadow = false;
  scene.add(farMesh);
  scene.add(createWater(engine, { size: 3400, level: WATER, color: 0x34432f, distortion: 2.2 }));

  // Mặt nước hào trên bậc thành Ngoại và thành Trung (dải nước chạy theo hào)
  const moatNormals = engine.texture('/3d/water/waternormals.jpg', { srgb: false });
  const moatMat = new THREE.MeshStandardMaterial({
    color: 0x3a4a36,
    roughness: 0.06,
    metalness: 0.2,
    normalMap: moatNormals,
    normalScale: new THREE.Vector2(0.35, 0.35),
    side: THREE.DoubleSide,
  });
  engine.updaters.push((dt, t) => moatNormals.offset.set(t * 0.01, t * 0.006));
  for (const m of moats.slice(1)) {
    const N = m.mp.length;
    const pos = [];
    const uv = [];
    const idx = [];
    for (let i = 0; i < N; i++) {
      const a = m.mp[(i - 1 + N) % N];
      const b = m.mp[(i + 1) % N];
      const L = Math.hypot(b.x - a.x, b.z - a.z) || 1;
      const nx = -(b.z - a.z) / L;
      const nz = (b.x - a.x) / L;
      const p = m.mp[i];
      for (const s of [1, -1]) {
        const x = p.x + nx * 5.6 * s;
        const z = p.z + nz * 5.6 * s;
        pos.push(x, m.level, z);
        uv.push(x / 14, z / 14);
      }
    }
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      if (Math.hypot((m.mp[i].x + m.mp[j].x) / 2 - m.gp.x, (m.mp[i].z + m.mp[j].z) / 2 - m.gp.z) < 7.5) continue;
      idx.push(i * 2, j * 2, i * 2 + 1, i * 2 + 1, j * 2, j * 2 + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    geo.setIndex(idx);
    const water = new THREE.Mesh(geo, moatMat);
    water.receiveShadow = true;
    scene.add(water);
  }

  /* ---------------- Cung điện trong thành Nội ---------------- */
  onStatus?.('Đang dựng cung điện, cổng thành và vọng lâu…');
  const mats = commonMaterials(engine);
  const ladder = (await engine.gltf('/3d/models/wooden_ladder.glb')).scene.clone();
  ladder.scale.setScalar(1.1);
  const put = (obj, x, z, ry = 0, dy = 0) => {
    obj.position.set(x, heightAt(x, z) + dy, z);
    obj.rotation.y = ry;
    scene.add(obj);
    return obj;
  };
  const yawOut = (o) => Math.atan2(o.x, o.z);

  put(stiltHouse(engine, mats, { L: 15, W: 7.5, floorH: 2.5, wallH: 1.4, ridge: 6.6, ladder }), 0, -12, 0);
  put(stiltHouse(engine, mats, { L: 9, W: 5, ladder }), -28, -14, Math.PI / 2);
  put(stiltHouse(engine, mats, { L: 9, W: 5, ladder }), 28, -14, -Math.PI / 2);
  put(stiltHouse(engine, mats, { L: 8, W: 4.6, ladder }), -24, 14, 0.2);
  put(stiltHouse(engine, mats, { L: 8, W: 4.6, ladder }), 24, 14, -0.2);

  // Đình trống đồng
  const pavilion = new THREE.Group();
  const pPost = new THREE.CylinderGeometry(0.12, 0.14, 3.4, 8);
  for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) {
    const p = new THREE.Mesh(pPost, mats.post);
    p.position.set(x, 1.7, z);
    p.castShadow = true;
    pavilion.add(p);
  }
  const pRoof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.8, 4, 1, true), mats.thatch);
  pRoof.position.y = 4.2;
  pRoof.rotation.y = Math.PI / 4;
  pRoof.castShadow = true;
  pavilion.add(pRoof);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.55, 12), mats.planks);
  stand.position.y = 0.28;
  pavilion.add(stand);
  const drum = bronzeDrum(engine, { scale: 1.25 });
  drum.position.y = 0.55;
  pavilion.add(drum);
  const userDrum = await optionalModel(engine, 'trong-dong.glb');
  if (userDrum) {
    drum.visible = false;
    pavilion.add(placeModel(userDrum, { height: 0.63 * 1.25, x: 0, y: 0.55, z: 0 }));
  }
  put(pavilion, 0, 12, 0);

  // Giá nỏ gần cổng thành Nội, kho mũi tên đồng, chum vại
  for (let i = -1; i <= 1; i++) put(crossbowRack(engine, mats, { count: 6 }), -14 + i * 4.5, 30, Math.PI / 2);
  const basket = (await engine.gltf('/3d/models/wicker_basket_01.glb')).scene;
  for (let i = 0; i < 7; i++) {
    const x = 32 + (i % 4) * 1.6;
    const z = 26 + Math.floor(i / 4) * 1.8;
    const b = basket.clone();
    b.scale.setScalar(1.6);
    put(b, x, z, i);
    put(arrowBundle(mats, { count: 46, seed: i + 3 }), x, z, i, 0.05);
  }
  const pot = (await engine.gltf('/3d/models/planter_pot_clay.glb')).scene;
  for (let i = 0; i < 6; i++) {
    const p = pot.clone();
    p.scale.setScalar(1.4 + (i % 3) * 0.2);
    put(p, -36 + (i % 3) * 1.4, 26 + Math.floor(i / 3) * 1.5, i);
  }
  for (const i of [-2, -1, 1, 2]) put(bannerPole(engine, mats, { h: 9, phase: i }), i * 7, 2, -Math.PI / 2);

  /* ---------------- Hàng rào gỗ, cổng, vọng lâu ---------------- */
  for (const T of TIERS) scene.add(palisade(engine, mats, T.pts, { heightAt, offset: 2.2, height: 1.8, skip: (x, z) => nearGate(x, z, 8) }));
  for (const g of GATES) put(gateHouse(engine, mats, { span: 8 }), g.x, g.z, yawOut(g.out));
  const towers = [
    [inner, [-0.8, -0.2, 0.2, 0.8]],
    [middle, [0, 0.62, 1, 1.38, 1.72]],
    [outer, [0.4, 0.8, 1.2, 1.5, 1.8]],
  ];
  for (const [pts, list] of towers) {
    for (const f of list) {
      const p = pointAt(pts, Math.PI * f);
      put(watchtower(engine, mats), p.x - p.out.x * 5, p.z - p.out.z * 5, yawOut(p.out));
    }
  }
  // Cờ ở góc thành Nội
  for (const f of [-0.75, -0.25, 0.25, 0.75]) {
    const p = pointAt(inner, Math.PI * f);
    put(bannerPole(engine, mats, { h: 8, phase: f * 4 }), p.x - p.out.x * 9, p.z - p.out.z * 9, -Math.PI / 2);
  }

  /* ---------------- Xóm nhà sàn mái tròn ---------------- */
  onStatus?.('Đang dựng xóm nhà mái tròn…');
  const ringClear = (x, z, r) => TIERS.every((T) => distToPolyline(T.pts, x, z) > r);
  const hutOK = (x, z) => !isBlocked(x, z) && hf.slope(x, z) < 0.12 && distToPolyline(road, x, z) > 6 && ringClear(x, z, 8.5);
  const hutLists = [[], []];
  HAMLETS.forEach((hm, hi) => {
    samplePoints({
      count: hm.count,
      seed: 40 + hi,
      area: inRing(hm.x, hm.z, 0, hm.r),
      accept: (x, z) => hutOK(x, z) && Math.hypot(x - hm.x, z - hm.z) > 4.5,
      minDist: 8.5,
    }).forEach((p, i) => {
      hutLists[i % 3 === 0 ? 0 : 1].push({ x: p.x, y: heightAt(p.x, p.z), z: p.z, ry: p.r * Math.PI * 2, s: 0.92 + p.r * 0.16 });
    });
  });
  // mái tranh vàng rơm cho xóm nhà
  const hutMats = { ...mats, thatch: mats.thatch.clone() };
  hutMats.thatch.color.set(0xf0c47c);
  scene.add(instanceTemplate(roundHut(engine, hutMats, { r: 3, roofH: 3.8 }), hutLists[0]));
  scene.add(instanceTemplate(roundHut(engine, hutMats, { r: 2.2, roofH: 3, wallH: 1.15 }), hutLists[1]));
  // Bếp lửa giữa xóm
  const firePit = (await engine.gltf('/3d/models/stone_fire_pit.glb')).scene;
  for (const hm of HAMLETS.slice(0, 8).filter((_, i) => i % 2 === 0)) {
    const fp = firePit.clone();
    fp.scale.setScalar(1.2);
    put(fp, hm.x, hm.z);
    scene.add(fire(engine, { x: hm.x, y: heightAt(hm.x, hm.z) + 0.15, z: hm.z, size: 0.8, light: false }));
  }

  /* ---------------- Quân giữ thành và quân Triệu Đà ---------------- */
  onStatus?.('Đang đưa quân lên mặt thành…');
  const VM = voiChienMaterials();
  const TUNICS = [VM.earthTunic, VM.indigoTunic, VM.crimson];
  const walk = (pts, spacing, inset) => {
    const res = [];
    let acc = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const dx = (b.x - a.x) / len;
      const dz = (b.z - a.z) / len;
      let d = acc;
      while (d < len) {
        res.push({ x: a.x + dx * d - dz * inset, z: a.z + dz * d + dx * inset, out: { x: dz, z: -dx } });
        d += spacing;
      }
      acc = d - len;
    }
    return res;
  };
  const troops = new Map();
  const enlist = (role, tunic, x, z, ry) => {
    const key = `${role}|${tunic}`;
    if (!troops.has(key)) troops.set(key, []);
    troops.get(key).push({ x, y: heightAt(x, z), z, ry });
  };
  const thin = q.trees < 0.5 ? 1.7 : 1;
  [
    [inner, 3.6],
    [middle, 6],
    [outer, 9],
  ].forEach(([pts, sp], ri) =>
    walk(pts, sp * thin, 3.4).forEach((p, i) => {
      if (nearGate(p.x, p.z, 10)) return;
      enlist(i % 2 ? 'spearman' : 'crossbow', (i + ri) % 3, p.x, p.z, yawOut(p.out));
    }),
  );
  // lính gác ngay sau mỗi cổng
  for (const g of GATES) {
    for (const s of [-1, 1]) {
      for (const d of [7, 9]) {
        enlist('spearman', d === 7 ? 2 : 0, g.x - g.out.x * d - g.out.z * s * 2.6, g.z - g.out.z * d + g.out.x * s * 2.6, yawOut(g.out));
      }
    }
  }
  // Quân Triệu Đà dàn trận ngoài thành Ngoại, mặt hướng vào thành
  const ENEMY_TUNIC = [
    new THREE.MeshStandardMaterial({ color: 0x2a2623, roughness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x5a1e16, roughness: 0.85 }),
  ];
  const enemyFlag = bannerTexture({ base: '#1d1b19', trim: '#b8452c' });
  const enemies = new Map();
  ENEMY.forEach((e) => {
    const fx = -e.out.x;
    const fz = -e.out.z;
    const yaw = Math.atan2(fx, fz);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 6; c++) {
        const back = (r - 2) * 1.7;
        const side = (c - 2.5) * 1.6;
        const x = e.x - fx * back - fz * side;
        const z = e.z - fz * back + fx * side;
        const key = r < 3 ? 'spearman|0' : 'archer|1';
        if (!enemies.has(key)) enemies.set(key, []);
        enemies.get(key).push({ x, y: heightAt(x, z), z, ry: yaw });
      }
    }
    const bx = e.x + fx * 5 + fz * 5.4;
    const bz = e.z + fz * 5 - fx * 5.4;
    put(createSoldier(engine, VM, mats, 'banner', ENEMY_TUNIC[0], { banner: enemyFlag }), bx, bz, yaw);
  });
  troops.forEach((list, key) => {
    const [role, t] = key.split('|');
    scene.add(instanceTemplate(createSoldier(engine, VM, mats, role, TUNICS[+t]), list));
  });
  enemies.forEach((list, key) => {
    const [role, t] = key.split('|');
    scene.add(instanceTemplate(createSoldier(engine, VM, mats, role, ENEMY_TUNIC[+t]), list));
  });

  /* ---------------- Thuyền chiến trên hào và sông ---------------- */
  const boatOn = (m, frac, L = 12) => {
    const i = Math.floor(m.mp.length * frac);
    const a = m.mp[i];
    const b = m.mp[(i + 1) % m.mp.length];
    const bt = warBoat(engine, mats, { L });
    bt.position.set(a.x, m.level - 0.45, a.z);
    bt.rotation.y = Math.atan2(-(b.z - a.z), b.x - a.x);
    scene.add(bt);
    return a;
  };
  const boatOuter = boatOn(moats[0], 0.36, 13);
  boatOn(moats[0], 0.62);
  boatOn(moats[1], 0.08, 11);
  boatOn(moats[1], 0.7, 10);
  boatOn(moats[2], 0.85, 9);
  for (const [x, z, ry, L] of [[250, -60, Math.PI / 2 - 0.05, 15], [253, 40, Math.PI / 2 + 0.08, 13], [249, 120, Math.PI / 2, 12]]) {
    const b = warBoat(engine, mats, { L });
    b.position.set(x, WATER - 0.45, z);
    b.rotation.y = ry;
    scene.add(b);
  }

  /* ---------------- Cây cối ---------------- */
  onStatus?.('Đang trồng cây và tre…');
  const flat = (x, z, minH = WATER + 0.9) => !isBlocked(x, z) && heightAt(x, z) > minH && hf.slope(x, z) < 0.2;
  const awayFromLife = (x, z) =>
    !(Math.abs(x) < 60 && Math.abs(z) < 46) && HAMLETS.every((hm) => Math.hypot(x - hm.x, z - hm.z) > hm.r + 8) && distToPolyline(road, x, z) > 5 && ringClear(x, z, 7);

  const trees = samplePoints({ count: Math.round(40 * q.trees), seed: 5, area: inBox(-270, -270, 270, 270), accept: (x, z) => flat(x, z) && awayFromLife(x, z), minDist: 14 });
  scene.add(await plant(engine, '/3d/models/island_tree_02.glb', trees, heightAt, { scale: [0.75, 1.15], sink: 0.2 }));
  const shrubs = samplePoints({ count: Math.round(80 * q.trees), seed: 8, area: inBox(-270, -270, 270, 270), accept: (x, z) => flat(x, z, WATER + 0.5) && awayFromLife(x, z), minDist: 4 });
  const half = Math.floor(shrubs.length / 2);
  scene.add(await plant(engine, '/3d/models/shrub_02.glb', shrubs.slice(0, half), heightAt, { scale: [1.2, 2.2] }));
  scene.add(await plant(engine, '/3d/models/shrub_04.glb', shrubs.slice(half), heightAt, { scale: [1.2, 2.2] }));
  const ferns = samplePoints({ count: Math.round(90 * q.trees), seed: 13, area: inBox(-260, -260, 260, 260), accept: (x, z) => flat(x, z, WATER + 0.3) && awayFromLife(x, z) });
  scene.add(await plant(engine, '/3d/models/fern_02.glb', ferns, heightAt, { scale: [1.4, 2.4], cast: false }));

  // Lũy tre quanh xóm và rải rác ngoài đồng
  const groves = [];
  HAMLETS.slice(0, 8).forEach((hm, i) => {
    for (let k = 0; k < 3; k++) {
      const a = i * 2.1 + k * 2.2;
      const gx = hm.x + Math.cos(a) * (hm.r + 5);
      const gz = hm.z + Math.sin(a) * (hm.r + 5);
      if (flat(gx, gz) && ringClear(gx, gz, 7) && distToPolyline(road, gx, gz) > 5) groves.push({ x: gx, z: gz, count: 14, r: 1.4 });
    }
  });
  samplePoints({ count: 22, seed: 19, area: inRing(0, 0, 200, 270), accept: (x, z) => flat(x, z) && awayFromLife(x, z), minDist: 18 }).forEach((p) =>
    groves.push({ x: p.x, z: p.z, count: 14, r: 1.3 }),
  );
  scene.add(bambooGroves(engine, groves, { heightAt }));

  scene.add(
    grassField(engine, {
      count: Math.round(52000 * q.grass),
      pick: (rnd) => {
        const a = rnd() * Math.PI * 2;
        const r = 20 + Math.sqrt(rnd()) * 240;
        const x = Math.cos(a) * r;
        const z = 10 + Math.sin(a) * r;
        const i = Math.round((x + hf.half) / hf.step);
        const j = Math.round((z + hf.half) / hf.step);
        if (i < 0 || j < 0 || i >= n || j >= n) return null;
        if (hf.dirt[j * n + i] > 0.4 || blocked[j * n + i]) return null;
        const y = hf.get(x, z);
        if (y < WATER + 0.5) return null;
        return { x, y, z };
      },
    }),
  );
  const farPts = samplePoints({ count: q.trees > 0.5 ? 900 : 450, seed: 23, area: inRing(0, 0, 330, 1100), accept: (x, z) => farHeight(x, z) > WATER + 1 && farHeight(x, z) < 120 });
  scene.add(farForest(engine, farPts, (x, z) => farHeight(x, z)));

  /* ---------------- Mô hình tùy chọn (Sketchfab) ---------------- */
  const soldier = await optionalModel(engine, 'chien-binh.glb');
  if (soldier) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        const x = -6 + c * 2.2;
        const z = 20 + r * 2.4;
        scene.add(placeModel(soldier, { height: 1.65, x, y: heightAt(x, z), z, yaw: Math.PI }));
      }
    }
  }

  /* ---------------- Điểm chú thích ---------------- */
  const hp = (id, title, text, x, z, dy, view) => ({ id, title, text, x, y: heightAt(x, z) + dy, z, view });
  const v = (x, z, lift, tx, tz, ty = 2, fov) => ({ x, z, lift, target: { x: tx, y: heightAt(tx, tz) + ty, z: tz }, fov });
  const look = (p, dist, lift, ty = 2, fov) => v(p.x + p.out.x * dist, p.z + p.out.z * dist, lift, p.x, p.z, ty, fov);
  const midP = pointAt(middle, Math.PI * 1.25);
  const outP = pointAt(outer, -Math.PI * 0.4);
  const towerP = pointAt(inner, -Math.PI * 0.2);
  const wallP = pointAt(inner, Math.PI * 0.32);
  const hamlet = HAMLETS[1];
  const enemyMid = ENEMY[1];
  const hotspots = [
    hp('thanh-noi', 'Thành Nội', 'Vòng thành trong cùng, gần hình chữ nhật, là nơi ở của vua An Dương Vương và triều đình. Trên thực tế, thành Nội có chu vi khoảng 1,6 km, tường thành đắp bằng đất cao khoảng 5 m.', 0, -12, 10, v(55, 110, 42, 0, -6, 3)),
    hp('thanh-trung', 'Thành Trung', 'Vòng thành ở giữa có hình dạng không đều, bám theo địa thế gò đồi và sông nước. Chu vi thực tế khoảng 6,5 km.', midP.x, midP.z, 6, look(midP, 60, 24, 3)),
    hp('thanh-ngoai', 'Thành Ngoại', 'Vòng thành ngoài cùng dài khoảng 8 km. Ba vòng thành lồng vào nhau, mỗi vòng có hào nước bao quanh, nên người xưa ví thành Cổ Loa như hình xoáy trôn ốc.', outP.x, outP.z, 6, look(outP, 70, 30, 3)),
    hp('cong-thanh', 'Cổng thành so le', 'Cổng của ba vòng thành không thẳng hàng. Muốn vào tới thành Nội, kẻ địch phải vượt hào, leo dốc rồi đi vòng quanh từng vòng thành dưới làn tên của quân giữ thành, như lạc vào mê cung.', gM.x, gM.z, 9, look(gM, 34, 10, 3)),
    hp('hao-nuoc', 'Hào nước', 'Bên ngoài mỗi vòng thành là hào nước thông với sông Hoàng Giang. Hào vừa là vật cản quân địch, vừa là đường cho thuyền chiến đi lại, giúp phòng thủ cả trên bộ lẫn dưới nước.', boatOuter.x, boatOuter.z, 3, v(boatOuter.x + 26, boatOuter.z + 24, 6, boatOuter.x, boatOuter.z, 0)),
    hp('linh-giu-thanh', 'Quân giữ thành', 'Quân giữ thành đứng sau hàng rào gỗ trên mặt thành. Lính nỏ bắn tên đồng từ trên cao xuống, lính cầm giáo và khiên chặn kẻ địch leo lên. Thành cao, hào sâu cùng với nỏ mạnh giúp Âu Lạc nhiều lần đánh lui quân Triệu Đà.', wallP.x, wallP.z, 4, look(wallP, 26, 11, 1.2, 50)),
    hp('vong-lau', 'Vọng lâu trên thành', 'Trên mặt thành có các ụ đất nhô ra và chòi canh. Từ đây quân lính có thể quan sát xa và bắn tên chéo cánh vào quân địch đang áp sát chân thành.', towerP.x - towerP.out.x * 5, towerP.z - towerP.out.z * 5, 9, look(towerP, 26, 6, 5)),
    hp('no-than', 'Nỏ Liên Châu', 'Theo truyền thuyết, tướng Cao Lỗ chế tạo được loại nỏ bắn một lần nhiều mũi tên, gọi là nỏ Liên Châu (dân gian gọi là “nỏ thần”). Nỏ là vũ khí lợi hại giúp quân Âu Lạc nhiều lần đánh lui quân Triệu Đà.', -14, 30, 2.4, v(-14, 22, 0, -14, 30, 0.6, 50)),
    hp('kho-ten', 'Kho mũi tên đồng', 'Năm 1959, các nhà khảo cổ phát hiện hàng vạn mũi tên đồng tại khu Cầu Vực, gần thành Cổ Loa. Đây là bằng chứng cho thấy kỹ thuật đúc đồng và tổ chức quân sự của nước Âu Lạc.', 34, 27, 2.2, v(34, 20, 0.2, 34, 27, 0.3, 48)),
    hp('trong-dong', 'Trống đồng Đông Sơn', 'Trống đồng là biểu tượng của văn hóa Đông Sơn, dùng trong lễ hội và làm hiệu lệnh. Mặt trống có ngôi sao nhiều cánh ở giữa, xung quanh là các vành hoa văn, cảnh sinh hoạt và đàn chim Lạc bay.', 0, 12, 2.2, v(0, 13.75, 1.1, 0, 12, 1.25, 42)),
    hp('cung-dien', 'Nhà sàn mái cong', 'Kiến trúc nhà sàn mái cong hình thuyền được khắc trên trống đồng Đông Sơn. Nhà làm bằng gỗ, tre, mái lợp tranh hoặc lá, sàn cao để tránh ẩm thấp và thú dữ.', 0, -12, 7, v(14, 14, 1, 0, -12, 4)),
    hp('nha-mai-tron', 'Xóm nhà mái tròn', 'Người Việt cổ ở nhà sàn mái cong hình thuyền hoặc mái tròn, làm bằng tre, gỗ, lợp tranh lá. Mô phỏng dựng những xóm nhà sàn mái tròn giữa các vòng thành — nơi ở của dân và quân đồn trú.', hamlet.x, hamlet.z, 7, v(hamlet.x + 24, hamlet.z + 22, 7, hamlet.x, hamlet.z, 2)),
    hp('quan-trieu', 'Quân Triệu Đà', 'Triệu Đà, vua nước Nam Việt, nhiều lần đem quân đánh Âu Lạc nhưng đều thất bại trước thành Cổ Loa và nỏ Liên Châu. Năm 179 TCN, sau khi dùng kế giảng hòa, cho con trai là Trọng Thủy sang ở rể để dò xét, Triệu Đà bất ngờ tấn công, Âu Lạc thất thủ.', enemyMid.x, enemyMid.z, 4, v(enemyMid.x + enemyMid.out.x * 26, enemyMid.z + enemyMid.out.z * 26, 6, enemyMid.x, enemyMid.z, 1)),
    hp('thuyen', 'Thuyền chiến', 'Hình thuyền mũi cong, có người chèo và chiến binh cầm vũ khí được khắc trên trống đồng. Thủy quân giữ vai trò quan trọng vì Cổ Loa nằm giữa vùng sông nước.', 250, -60, 3, v(226, -24, 4, 250, -60, 1)),
    hp('song', 'Sông Hoàng Giang', 'Thành Cổ Loa dựa vào sông Hoàng Giang ở phía đông. Hệ thống hào thông với sông, nên thuyền có thể ra vào thành và tỏa đi khắp vùng đồng bằng Bắc Bộ.', 252, 20, 5, v(200, 80, 18, 252, 0, 0)),
  ];

  // Góc nhìn ban đầu: nhìn chéo từ trên cao xuống toàn bộ sa bàn
  const start = { x: 70, z: 205, lift: 95, target: { x: 0, y: 6, z: 12 } };
  const credits = [
    'Bầu trời HDRI, vân bề mặt và mô hình cây, bụi, đá, giỏ, chum, thang: Poly Haven (CC0).',
    'Ảnh pháp tuyến mặt nước: dự án three.js (giấy phép MIT).',
    'Nhà sàn, nhà mái tròn, trống đồng, nỏ, thuyền, vọng lâu, hàng rào, cờ, tre và cỏ: dựng bằng mã nguồn theo tư liệu khảo cổ Đông Sơn.',
    'Quân lính: mô hình dựng bằng mã nguồn do nhóm thực hiện cung cấp (dùng chung với cảnh Hội thề Hát Môn).',
  ];
  if (userDrum) credits.push('Mô hình “Trống đồng Đông Sơn – Việt Nam” của ndnguyen3d, Sketchfab (CC BY 4.0).');
  if (soldier) credits.push('Mô hình “Tribal Man” của Çağhan Büyükavcı, Sketchfab (CC BY 4.0).');
  return { heightAt, hotspots, start, credits, bounds: 300 };
}
