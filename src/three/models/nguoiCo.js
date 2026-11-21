import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../noise.js';
import { barkClothTex, furTex, hairTex, hairyTex, hideTex, skinTex } from './primitiveTex.js';

/**
 * NGƯỜI NGUYÊN THỦY VÀ CON VẬT (dựng bằng mã nguồn, có khớp để đặt tư thế)
 * - Thân, tay chân tiện tròn theo bắp cơ (LatheGeometry) nên liền mạch, không còn dáng búp bê khớp.
 * - Mặt có mắt (lòng trắng, con ngươi), mũi, môi, gò má, tai; tóc và lông có vân sợi.
 * - Người tối cổ: trán thấp, u mày, hàm nhô, lông trên người; Người tinh khôn: trán cao, mặt phẳng,
 *   váy da, váy vỏ cây có hoa văn son, vòng cổ vỏ ốc, vòng tay.
 */

const V2 = THREE.Vector2;
const lerp = THREE.MathUtils.lerp;

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

/* ---------------- Vật liệu người, thú ---------------- */
export function humanMaterials() {
  const skin = (hex, hairy = false) =>
    new THREE.MeshStandardMaterial({
      color: hex,
      map: hairy ? hairyTex() : skinTex(),
      bumpMap: hairy ? hairyTex() : skinTex(),
      bumpScale: hairy ? 1.2 : 0.4,
      roughness: hairy ? 0.85 : 0.62,
    });
  const tex = (map, color, roughness = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, map, bumpMap: map, bumpScale: 0.8, roughness, ...extra });
  return {
    skinE: [skin(0x6a4430, true), skin(0x5a3a28, true)],
    skinS: [skin(0x8c5c3c), skin(0x7a4e33), skin(0x9a6a46)],
    lip: new THREE.MeshStandardMaterial({ color: 0x6e3a2c, roughness: 0.5 }),
    eyeWhite: new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.25 }),
    eyeWhiteE: new THREE.MeshStandardMaterial({ color: 0x9a8a78, roughness: 0.3 }),
    iris: new THREE.MeshStandardMaterial({ color: 0x1a110b, roughness: 0.15 }),
    hairE: tex(hairTex(), 0x2a1c14, 0.95),
    hairS: tex(hairTex(), 0x16100c, 0.7),
    hide: tex(hideTex(), 0xb08a64, 0.92, { side: THREE.DoubleSide }),
    hideDark: tex(hideTex(), 0x7a5a3c, 0.92, { side: THREE.DoubleSide }),
    bark: tex(barkClothTex(false), 0xe0cda8, 0.95, { side: THREE.DoubleSide }),
    barkOchre: tex(barkClothTex(true), 0xd8c09a, 0.95, { side: THREE.DoubleSide }),
    shell: new THREE.MeshStandardMaterial({ color: 0xece2cc, roughness: 0.45 }),
    ochre: new THREE.MeshStandardMaterial({ color: 0x9a3a22, roughness: 0.8 }),
    feather: new THREE.MeshStandardMaterial({ color: 0x2e3a3c, roughness: 0.6, side: THREE.DoubleSide }),
    dog: tex(furTex(), 0xb48a52, 0.9),
    dogLight: tex(furTex(), 0xe8d6b4, 0.9),
    deer: tex(furTex(), 0x7c5434, 0.9),
    deerLight: tex(furTex(), 0xd8c4a4, 0.9),
    hoof: new THREE.MeshStandardMaterial({ color: 0x241a14, roughness: 0.5 }),
    antler: new THREE.MeshStandardMaterial({ color: 0xa08c6c, roughness: 0.7 }),
    nose: new THREE.MeshStandardMaterial({ color: 0x15100d, roughness: 0.3 }),
  };
}

/** Khối tiện tròn dọc trục y (từ y = -L lên y = 0), có phình bắp cơ. */
function limbGeo(rTop, rBot, L, bulge = 0.12, at = 0.3, seg = 14) {
  const pts = [new V2(0.0001, -L - rBot * 0.35)];
  const N = 12;
  for (let i = N; i >= 0; i--) {
    const s = i / N; // 1 = đáy, 0 = đỉnh
    let r = lerp(rTop, rBot, s);
    r *= 1 + bulge * Math.exp(-((s - at) ** 2) / 0.025);
    pts.push(new V2(r, -s * L));
  }
  pts.push(new V2(rTop * 0.6, rTop * 0.35), new V2(0.0001, rTop * 0.5));
  return new THREE.LatheGeometry(pts, seg);
}
/** Thân tiện theo bảng bán kính [[r, y], …] (y tăng dần). */
function profileGeo(rows, seg = 20) {
  return new THREE.LatheGeometry(rows.map(([r, y]) => new V2(Math.max(0.0001, r), y)), seg);
}

const BODY = {
  m: [[0.0001, -0.02], [0.122, 0], [0.118, 0.08], [0.122, 0.16], [0.138, 0.26], [0.152, 0.34], [0.158, 0.42], [0.15, 0.47], [0.12, 0.52], [0.07, 0.56], [0.05, 0.585], [0.0001, 0.59]],
  f: [[0.0001, -0.02], [0.118, 0], [0.106, 0.1], [0.112, 0.18], [0.13, 0.27], [0.138, 0.34], [0.14, 0.42], [0.13, 0.47], [0.105, 0.52], [0.065, 0.56], [0.045, 0.585], [0.0001, 0.59]],
  e: [[0.0001, -0.02], [0.134, 0], [0.136, 0.1], [0.148, 0.2], [0.162, 0.3], [0.168, 0.4], [0.158, 0.47], [0.125, 0.52], [0.075, 0.56], [0.058, 0.585], [0.0001, 0.59]],
};
const PELVIS = [[0.0001, -0.15], [0.09, -0.14], [0.135, -0.08], [0.148, 0], [0.138, 0.06], [0.124, 0.1], [0.0001, 0.11]];

/**
 * Dựng một người. kind: 'erectus' (Người tối cổ) | 'sapiens' (Người tinh khôn); sex: 'm' | 'f'.
 * pose: tên trong POSES. Trả về Group có userData.J (các khớp).
 */
export function earlyHuman(HM, { kind = 'sapiens', sex = 'm', pose = 'stand', scale = 1, seed = 1, clothes } = {}) {
  const erect = kind === 'erectus';
  const fem = sex === 'f';
  const rnd = mulberry32(seed * 7 + 3);
  const skin = erect ? HM.skinE[seed % HM.skinE.length] : HM.skinS[seed % HM.skinS.length];
  const hairM = erect ? HM.hairE : HM.hairS;
  const k = erect ? 1.12 : fem ? 0.92 : 1; // độ to của bắp tay chân
  const L = erect ? { thigh: 0.4, shin: 0.4, upper: 0.3, fore: 0.27, sh: 0.2 } : { thigh: 0.43, shin: 0.43, upper: 0.29, fore: 0.25, sh: fem ? 0.172 : 0.185 };
  const root = new THREE.Group();
  const J = {};
  const hips = new THREE.Group();
  root.add(hips);
  J.hips = hips;

  const pelvis = mesh(profileGeo(PELVIS, 18), skin);
  pelvis.scale.set(fem ? 1.28 : 1.16, 1, 0.84);
  hips.add(pelvis);
  for (const s of [-1, 1]) {
    const glute = mesh(new THREE.SphereGeometry(0.078, 12, 10), skin, s * 0.06, -0.05, -0.065);
    glute.scale.set(1, 1, 0.85);
    hips.add(glute);
  }

  // Chân
  for (const s of [-1, 1]) {
    const tag = s < 0 ? 'L' : 'R';
    const thigh = new THREE.Group();
    thigh.position.set(s * 0.088, -0.02, 0);
    hips.add(thigh);
    thigh.add(mesh(limbGeo(0.088 * k, 0.056 * k, L.thigh, 0.1, 0.25), skin));
    const knee = new THREE.Group();
    knee.position.y = -L.thigh;
    thigh.add(knee);
    knee.add(mesh(new THREE.SphereGeometry(0.058 * k, 12, 10), skin));
    knee.add(mesh(limbGeo(0.056 * k, 0.034 * k, L.shin, 0.22, 0.22), skin));
    const ankle = new THREE.Group();
    ankle.position.y = -L.shin;
    knee.add(ankle);
    const foot = mesh(new THREE.SphereGeometry(1, 14, 10), skin, 0, -0.035, 0.045);
    foot.scale.set(0.046 * k, 0.034, 0.118);
    ankle.add(foot);
    const heel = mesh(new THREE.SphereGeometry(0.036, 10, 8), skin, 0, -0.035, -0.035);
    ankle.add(heel);
    J['thigh' + tag] = thigh;
    J['knee' + tag] = knee;
    J['ankle' + tag] = ankle;
  }

  // Thân
  const spine = new THREE.Group();
  spine.position.y = 0.05;
  hips.add(spine);
  J.spine = spine;
  const torso = mesh(profileGeo(erect ? BODY.e : fem ? BODY.f : BODY.m), skin);
  torso.scale.set(erect ? 1.24 : fem ? 1.1 : 1.2, 1, erect ? 0.86 : 0.74);
  spine.add(torso);
  if (fem && !erect) {
    for (const s of [-1, 1]) {
      const b = mesh(new THREE.SphereGeometry(0.058, 12, 10), skin, s * 0.068, 0.35, 0.078);
      b.scale.set(1, 0.95, 0.85);
      spine.add(b);
    }
  } else if (!erect) {
    for (const s of [-1, 1]) {
      const p = mesh(new THREE.SphereGeometry(0.07, 12, 8), skin, s * 0.068, 0.39, 0.072);
      p.scale.set(1.25, 0.7, 0.45);
      spine.add(p);
    }
  }
  // xương đòn, vai
  for (const s of [-1, 1]) {
    const del = mesh(new THREE.SphereGeometry(0.066 * k, 12, 10), skin, s * L.sh, 0.445, 0);
    del.scale.set(1, 0.95, 0.95);
    spine.add(del);
  }

  // Cổ, đầu
  const neck = new THREE.Group();
  neck.position.y = 0.5;
  spine.add(neck);
  J.neck = neck;
  const neckM = mesh(limbGeo(0.05, erect ? 0.064 : 0.058, 0.13, 0.04, 0.5), skin, 0, 0.13, erect ? 0.012 : 0);
  neck.add(neckM);
  const head = new THREE.Group();
  head.position.set(0, 0.12, erect ? 0.03 : 0.004);
  neck.add(head);
  J.head = head;
  buildHead(HM, head, { erect, fem, skin, hairM, rnd });

  // Tay
  for (const s of [-1, 1]) {
    const tag = s < 0 ? 'L' : 'R';
    const sh = new THREE.Group();
    sh.position.set(s * L.sh, 0.44, 0);
    spine.add(sh);
    sh.add(mesh(limbGeo(0.056 * k, 0.042 * k, L.upper, 0.13, 0.38), skin));
    const el = new THREE.Group();
    el.position.y = -L.upper;
    sh.add(el);
    el.add(mesh(new THREE.SphereGeometry(0.043 * k, 10, 8), skin));
    el.add(mesh(limbGeo(0.046 * k, 0.031 * k, L.fore, 0.16, 0.25), skin));
    const hand = new THREE.Group();
    hand.position.y = -L.fore - 0.005;
    el.add(hand);
    const palm = mesh(new THREE.SphereGeometry(0.04, 12, 10), skin, 0, -0.035, 0);
    palm.scale.set(0.82 * k, 1.1, 0.5);
    hand.add(palm);
    const fingers = mesh(new THREE.CapsuleGeometry(0.028 * k, 0.03, 4, 8), skin, 0, -0.08, 0.008);
    fingers.scale.set(1.05, 1, 0.5);
    fingers.rotation.x = -0.35;
    hand.add(fingers);
    const thumb = mesh(new THREE.CapsuleGeometry(0.011 * k, 0.03, 4, 6), skin, -s * 0.026, -0.035, 0.02);
    thumb.rotation.set(-0.6, 0, s * 0.5);
    hand.add(thumb);
    J['sh' + tag] = sh;
    J['el' + tag] = el;
    J['hand' + tag] = hand;
  }

  dress(HM, { hips, spine, neck, J }, { erect, fem, clothes, rnd });

  root.userData.J = J;
  root.userData.erect = erect;
  shadows(root);
  POSES[pose]?.(J, erect);
  settle(root);
  root.scale.setScalar(scale * (erect ? 0.95 : fem ? 0.9 : 0.94));
  return root;
}

function buildHead(HM, head, { erect, fem, skin, hairM, rnd }) {
  const s3 = (o, x, y, z) => (o.scale.set(x, y, z), o);
  if (erect) {
    // sọ thấp, dài, trán bợt ra sau; u mày nổi; hàm nhô, không có cằm
    head.add(s3(mesh(new THREE.SphereGeometry(0.104, 20, 16), skin, 0, 0.075, -0.025), 0.98, 0.82, 1.2));
    head.add(s3(mesh(new THREE.SphereGeometry(0.085, 16, 12), skin, 0, 0.035, 0.04), 0.95, 0.98, 0.85));
    head.add(s3(mesh(new THREE.SphereGeometry(0.066, 14, 10), skin, 0, -0.01, 0.066), 1.1, 0.78, 1.12));
    const brow = mesh(new THREE.CapsuleGeometry(0.027, 0.105, 4, 10), skin, 0, 0.088, 0.086);
    brow.rotation.z = Math.PI / 2;
    head.add(brow);
    head.add(s3(mesh(new THREE.SphereGeometry(0.026, 10, 8), skin, 0, 0.046, 0.108), 1.45, 0.8, 0.9));
    for (const s of [-1, 1]) {
      head.add(mesh(new THREE.SphereGeometry(0.013, 10, 8), HM.eyeWhiteE, s * 0.034, 0.066, 0.079));
      head.add(mesh(new THREE.SphereGeometry(0.0085, 8, 6), HM.iris, s * 0.034, 0.066, 0.089));
      head.add(s3(mesh(new THREE.SphereGeometry(0.025, 8, 6), skin, s * 0.098, 0.05, -0.005), 0.45, 1, 0.75));
      head.add(mesh(new THREE.SphereGeometry(0.028, 10, 8), skin, s * 0.05, 0.035, 0.075));
    }
    const lip = mesh(new THREE.CapsuleGeometry(0.01, 0.045, 4, 6), HM.lip, 0, 0.005, 0.118);
    lip.rotation.z = Math.PI / 2;
    head.add(lip);
    // tóc rậm, bù xù
    const hairGeo = new THREE.IcosahedronGeometry(0.116, 2);
    const p = hairGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const f = 1 + (rnd() - 0.4) * 0.12;
      p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f);
    }
    hairGeo.computeVertexNormals();
    const hair = s3(mesh(hairGeo, hairM, 0, 0.088, -0.04), 1.0, 0.82, 1.15);
    head.add(hair);
    if (!fem) {
      const beard = s3(mesh(new THREE.IcosahedronGeometry(0.06, 1), hairM, 0, -0.03, 0.075), 1.25, 0.95, 0.75);
      head.add(beard);
    }
    return;
  }
  // Người tinh khôn: trán cao, sọ tròn, mặt phẳng, cằm rõ
  head.add(s3(mesh(new THREE.SphereGeometry(0.1, 20, 16), skin, 0, 0.088, -0.012), 0.92, 1.06, 1.05));
  head.add(s3(mesh(new THREE.SphereGeometry(0.083, 16, 12), skin, 0, 0.04, 0.03), 0.86, 1.08, 0.8));
  head.add(s3(mesh(new THREE.SphereGeometry(0.05, 14, 10), skin, 0, -0.018, 0.048), fem ? 0.9 : 1.02, 0.75, 0.9));
  const nose = mesh(new THREE.ConeGeometry(0.017, 0.05, 8), skin, 0, 0.05, 0.095);
  nose.rotation.x = 0.25;
  head.add(nose);
  head.add(s3(mesh(new THREE.SphereGeometry(0.014, 8, 6), skin, 0, 0.032, 0.106), 1.4, 0.9, 1));
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.SphereGeometry(0.0135, 10, 8), HM.eyeWhite, s * 0.032, 0.07, 0.083));
    head.add(mesh(new THREE.SphereGeometry(0.0082, 8, 6), HM.iris, s * 0.032, 0.07, 0.094));
    const lid = s3(mesh(new THREE.SphereGeometry(0.0148, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.42), skin, s * 0.032, 0.071, 0.083), 1, 1, 1);
    lid.rotation.x = 0.35;
    head.add(lid);
    const brow = mesh(new THREE.CapsuleGeometry(0.0055, 0.03, 4, 6), HM.hairS, s * 0.034, 0.092, 0.092);
    brow.rotation.z = Math.PI / 2 + s * 0.12;
    head.add(brow);
    head.add(s3(mesh(new THREE.SphereGeometry(0.025, 8, 6), skin, s * 0.093, 0.06, 0), 0.45, 1, 0.75));
    head.add(mesh(new THREE.SphereGeometry(0.024, 10, 8), skin, s * 0.048, 0.048, 0.07));
  }
  const upper = mesh(new THREE.CapsuleGeometry(0.0085, 0.03, 4, 6), HM.lip, 0, 0.014, 0.098);
  upper.rotation.z = Math.PI / 2;
  const lower = mesh(new THREE.CapsuleGeometry(0.0095, 0.026, 4, 6), HM.lip, 0, 0.002, 0.095);
  lower.rotation.z = Math.PI / 2;
  head.add(upper, lower);
  // tóc
  const cap = s3(mesh(new THREE.SphereGeometry(0.106, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), hairM, 0, 0.092, -0.018), 0.93, 1.06, 1.06);
  cap.rotation.x = -0.32;
  head.add(cap);
  const band = mesh(new THREE.TorusGeometry(0.1, 0.008, 6, 24), HM.ochre, 0, 0.11, -0.005);
  band.rotation.x = Math.PI / 2 - 0.25;
  band.scale.set(0.93, 1.06, 1);
  head.add(band);
  if (fem) {
    // tóc dài xõa sau lưng (nửa vòng tiện phía sau đầu)
    const longGeo = new THREE.LatheGeometry(
      [[0.085, -0.3], [0.098, -0.18], [0.106, -0.05], [0.104, 0.06], [0.07, 0.15], [0.0001, 0.17]].map(([r, y]) => new V2(r, y)),
      16,
      Math.PI / 2,
      Math.PI,
    );
    const long = mesh(longGeo, hairM, 0, 0.07, -0.02);
    long.material = hairM.clone();
    long.material.side = THREE.DoubleSide;
    long.scale.set(0.95, 1, 1.02);
    head.add(long);
  } else {
    head.add(mesh(new THREE.SphereGeometry(0.045, 12, 10), hairM, 0, 0.17, -0.06)); // búi tóc
    const f = mesh(new THREE.PlaneGeometry(0.035, 0.16), HM.feather, 0.02, 0.22, -0.06);
    f.rotation.set(-0.4, 0.3, -0.25);
    head.add(f);
  }
}

/** Che thân và đồ trang sức. */
function dress(HM, { hips, spine, neck, J }, { erect, fem, clothes, rnd }) {
  const fringe = (parent, r, y, mat, count = 30, len = 0.07) => {
    const g = new THREE.BoxGeometry(0.014, len, 0.004);
    g.translate(0, -len / 2, 0);
    const im = new THREE.InstancedMesh(g, mat, count);
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      o.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
      o.rotation.set(0, a, 0);
      o.rotateX(0.12 + rnd() * 0.15);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    im.castShadow = true;
    parent.add(im);
  };
  if (erect) {
    const belt = mesh(new THREE.CylinderGeometry(0.15, 0.165, 0.09, 14, 1, true), HM.hideDark, 0, -0.03, 0);
    belt.scale.set(1.16, 1, 0.86);
    hips.add(belt);
    for (const z of [1, -1]) {
      const flap = mesh(new THREE.PlaneGeometry(0.17, 0.22), HM.hideDark, 0, -0.15, z * 0.135);
      flap.rotation.x = z * 0.12;
      hips.add(flap);
    }
    return;
  }
  const kind = clothes || (fem ? 'skirt' : 'loin');
  if (kind === 'skirt') {
    const skirt = mesh(new THREE.CylinderGeometry(0.155, 0.24, 0.42, 20, 1, true), HM.barkOchre, 0, -0.18, 0);
    skirt.scale.set(1.2, 1, 0.92);
    skirt.material = HM.barkOchre;
    hips.add(skirt);
    fringe(hips, 0.25, -0.39, HM.bark, 34, 0.06);
    const top = mesh(new THREE.CylinderGeometry(0.15, 0.142, 0.12, 20, 1, true), HM.hide, 0, 0.34, 0.004);
    top.scale.set(1.12, 1, 0.82);
    spine.add(top);
  } else {
    const skirt = mesh(new THREE.CylinderGeometry(0.152, 0.2, 0.24, 18, 1, true), HM.hide, 0, -0.08, 0);
    skirt.scale.set(1.18, 1, 0.9);
    hips.add(skirt);
    fringe(hips, 0.205, -0.2, HM.hide, 30, 0.07);
    const belt = mesh(new THREE.TorusGeometry(0.152, 0.012, 6, 24), HM.hideDark, 0, 0.03, 0);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1.18, 0.9, 1);
    hips.add(belt);
    const pouch = mesh(new THREE.SphereGeometry(0.045, 10, 8), HM.hideDark, 0.17, -0.02, 0.04);
    pouch.scale.set(0.7, 1, 0.6);
    hips.add(pouch);
    const strap = mesh(new THREE.BoxGeometry(0.045, 0.52, 0.02), HM.hide, 0.02, 0.3, 0.0);
    strap.rotation.z = 0.58;
    strap.scale.set(1, 1, 1);
    const strapF = strap.clone();
    strap.position.z = -0.115;
    strapF.position.z = 0.11;
    spine.add(strap, strapF);
  }
  // vòng cổ vỏ ốc xuyên lỗ
  for (let i = 0; i < 13; i++) {
    const a = Math.PI * (0.12 + (i / 12) * 0.76);
    const sh = mesh(new THREE.ConeGeometry(0.011, 0.026, 6), HM.shell, Math.cos(a) * 0.078, -0.015 - Math.sin(a) * 0.035, Math.sin(a) * 0.07);
    sh.rotation.x = Math.PI;
    neck.add(sh);
  }
  // vòng tay
  for (const t of ['L', 'R']) {
    const b = mesh(new THREE.TorusGeometry(0.036, 0.008, 6, 14), HM.shell, 0, 0.02, 0);
    b.rotation.x = Math.PI / 2;
    J['hand' + t].add(b);
  }
}

/** Hạ người xuống sát đất: điểm thấp nhất của cơ thể chạm mặt đất. */
function settle(root) {
  root.userData.J.hips.position.y = 0;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  root.traverse((o) => {
    if (o.isMesh && !o.isInstancedMesh) {
      o.geometry.computeBoundingBox();
      box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));
    }
  });
  root.userData.J.hips.position.y = -box.min.y;
  root.updateMatrixWorld(true);
}

const flatFeet = (J) => {
  for (const t of ['L', 'R']) J['ankle' + t].rotation.x = -(J['thigh' + t].rotation.x + J['knee' + t].rotation.x);
};

/** Các tư thế. Quy ước: rotation.x âm = đưa tay/chân về phía trước. */
export const POSES = {
  stand(J, erect) {
    J.shL.rotation.set(-0.05, 0, 0.1);
    J.shR.rotation.set(-0.05, 0, -0.1);
    J.elL.rotation.x = -0.25;
    J.elR.rotation.x = -0.25;
    if (erect) {
      J.spine.rotation.x = 0.16;
      J.neck.rotation.x = -0.12;
      for (const t of ['L', 'R']) {
        J['thigh' + t].rotation.x = -0.12;
        J['knee' + t].rotation.x = 0.2;
      }
    }
    flatFeet(J);
  },
  spear(J, erect) {
    POSES.stand(J, erect);
    J.shR.rotation.set(-0.25, 0, -0.3);
    J.elR.rotation.set(-0.95, 0, 0.2);
  },
  walk(J, erect) {
    POSES.stand(J, erect);
    J.thighL.rotation.x = -0.38;
    J.kneeL.rotation.x = 0.18;
    J.thighR.rotation.x = 0.3;
    J.kneeR.rotation.x = 0.4;
    J.shL.rotation.x = 0.3;
    J.shR.rotation.x = -0.3;
    flatFeet(J);
  },
  carry(J, erect) {
    POSES.walk(J, erect);
    J.shR.rotation.set(-2.75, 0, -0.25);
    J.elR.rotation.x = -1.7;
  },
  pole(J, erect) {
    // khiêng đòn trên vai phải
    POSES.walk(J, erect);
    J.shR.rotation.set(-2.9, 0, -0.1);
    J.elR.rotation.x = -2.2;
    J.shL.rotation.set(-0.4, 0, 0.1);
  },
  throw(J, erect) {
    POSES.walk(J, erect);
    J.shR.rotation.set(-2.6, 0, -0.3);
    J.elR.rotation.x = -0.7;
    J.shL.rotation.set(-1.2, 0, 0.2);
    J.spine.rotation.x = 0.05;
  },
  stab(J, erect) {
    // đứng dưới nước, giơ xiên đâm cá
    POSES.stand(J, erect);
    J.thighL.rotation.x = -0.3;
    J.kneeL.rotation.x = 0.45;
    J.thighR.rotation.x = 0.15;
    J.kneeR.rotation.x = 0.3;
    J.spine.rotation.x = 0.35;
    J.neck.rotation.x = -0.1;
    J.shR.rotation.set(-1.9, 0, -0.15);
    J.elR.rotation.x = -0.9;
    J.shL.rotation.set(-1.4, 0, 0.25);
    J.elL.rotation.x = -0.5;
    flatFeet(J);
  },
  reach(J, erect) {
    POSES.stand(J, erect);
    J.shR.rotation.set(-2.85, 0, -0.18);
    J.elR.rotation.x = -0.25;
    J.shL.rotation.set(-0.5, 0, 0.1);
    J.elL.rotation.x = -1.3;
    J.neck.rotation.x = -0.45;
  },
  knap(J) {
    J.spine.rotation.x = 0.55;
    J.neck.rotation.x = -0.25;
    for (const [t, s] of [['L', 1], ['R', -1]]) {
      J['thigh' + t].rotation.set(-1.75, 0, s * 0.28);
      J['knee' + t].rotation.x = 2.3;
    }
    J.shL.rotation.set(-0.95, 0, 0.18);
    J.elL.rotation.x = -0.75;
    J.shR.rotation.set(-1.1, 0, -0.18);
    J.elR.rotation.x = -1.1;
    flatFeet(J);
  },
  sit(J) {
    J.spine.rotation.x = 0.22;
    J.neck.rotation.x = -0.12;
    for (const [t, s] of [['L', 1], ['R', -1]]) {
      J['thigh' + t].rotation.set(-1.45, 0, s * 0.38);
      J['knee' + t].rotation.x = 1.25;
    }
    J.shL.rotation.set(-0.75, 0, 0.15);
    J.shR.rotation.set(-0.75, 0, -0.15);
    J.elL.rotation.x = -0.7;
    J.elR.rotation.x = -0.7;
    flatFeet(J);
  },
  kneel(J) {
    J.spine.rotation.x = 0.62;
    J.neck.rotation.x = -0.35;
    for (const t of ['L', 'R']) {
      J['thigh' + t].rotation.x = -0.3;
      J['knee' + t].rotation.x = 1.75;
      J['ankle' + t].rotation.x = -0.9;
    }
    J.shL.rotation.set(-1.0, 0, 0.12);
    J.shR.rotation.set(-1.0, 0, -0.12);
    J.elL.rotation.x = -0.45;
    J.elR.rotation.x = -0.45;
  },
  dig(J, erect) {
    POSES.knap(J, erect);
    J.shR.rotation.set(-1.45, 0, -0.1);
    J.elR.rotation.x = -0.35;
  },
  child(J, erect) {
    POSES.stand(J, erect);
    J.shR.rotation.set(-0.6, 0, -0.2);
    J.elR.rotation.x = -0.9;
  },
  play(J, erect) {
    // trẻ con chạy, dang tay
    POSES.walk(J, erect);
    J.thighL.rotation.x = -0.7;
    J.kneeL.rotation.x = 0.6;
    J.thighR.rotation.x = 0.5;
    J.kneeR.rotation.x = 0.8;
    J.shL.rotation.set(-0.6, 0, 0.7);
    J.shR.rotation.set(-0.6, 0, -0.7);
    flatFeet(J);
  },
};

/** Cho người cầm đồ vật. `upright`: giữ vật thẳng đứng (giáo, gậy). */
export function hold(fig, side, obj, { upright = false, offset = [0, -0.06, 0.02], tilt = 0 } = {}) {
  const hand = fig.userData.J['hand' + side];
  fig.updateMatrixWorld(true);
  obj.position.set(...offset);
  if (upright) {
    const q = hand.getWorldQuaternion(new THREE.Quaternion());
    const rootQ = fig.getWorldQuaternion(new THREE.Quaternion());
    obj.quaternion.copy(q.invert().multiply(rootQ));
    obj.rotateX(tilt);
  }
  hand.add(obj);
  shadows(obj);
  return obj;
}

/**
 * Gộp các mảnh lưới của một người/con vật để vẽ nhanh hơn (ít lệnh vẽ).
 * full = true: gộp toàn bộ vào gốc (người đứng yên). full = false: chỉ gộp trong từng khớp,
 * nên các khớp vẫn cử động được (người đang ghè đá, mài rìu…). Gọi sau khi đã cầm đồ vật.
 */
export function bakeFigure(fig, full = false) {
  fig.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(fig.matrixWorld).invert();
  const groups = [];
  fig.traverse((o) => {
    if (!o.isMesh) groups.push(o);
  });
  const bake = (parent, meshes, toLocal) => {
    const byMat = new Map();
    for (const m of meshes) {
      const g = m.geometry.clone().applyMatrix4(toLocal(m));
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      if (!byMat.has(m.material)) byMat.set(m.material, []);
      byMat.get(m.material).push(g);
      m.parent.remove(m);
      m.geometry.dispose();
    }
    byMat.forEach((geos, mat) => {
      const list = geos.some((g) => !g.index) ? geos.map((g) => (g.index ? g.toNonIndexed() : g)) : geos;
      const merged = mergeGeometries(list);
      list.forEach((g) => g.dispose());
      if (!merged) return;
      const mm = new THREE.Mesh(merged, mat);
      mm.castShadow = true;
      mm.receiveShadow = true;
      parent.add(mm);
    });
  };
  if (full) {
    const meshes = [];
    fig.traverse((o) => {
      if (o.isMesh && !o.isInstancedMesh) meshes.push(o);
    });
    bake(fig, meshes, (m) => new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
  } else {
    for (const g of groups) {
      const meshes = g.children.filter((c) => c.isMesh && !c.isInstancedMesh);
      if (meshes.length > 1) bake(g, meshes, (m) => m.matrix.clone());
    }
  }
  return fig;
}

/** Chuyển động nhẹ lặp lại: ghè đá, mài rìu, nặn gốm, thở. */
export function animateFigures(engine, list) {
  engine.updaters.push((dt, t) => {
    for (const { fig, act, phase = 0 } of list) {
      const J = fig.userData.J;
      if (!J.__base) J.__base = { elR: J.elR.rotation.x, shR: J.shR.rotation.x, shL: J.shL.rotation.x, spine: J.spine.rotation.x, neck: J.neck.rotation.y };
      const b = J.__base;
      const p = t + phase;
      if (act === 'knap') {
        J.elR.rotation.x = b.elR + Math.max(0, Math.sin(p * 5.5)) * 0.55;
        J.shR.rotation.x = b.shR - Math.max(0, Math.sin(p * 5.5)) * 0.25;
      } else if (act === 'grind') {
        J.shR.rotation.x = b.shR + Math.sin(p * 2.4) * 0.22;
        J.shL.rotation.x = b.shL + Math.sin(p * 2.4) * 0.22;
        J.spine.rotation.x = b.spine + Math.sin(p * 2.4) * 0.06;
      } else if (act === 'pot') {
        J.elR.rotation.x = b.elR + Math.sin(p * 1.6) * 0.12;
        J.shL.rotation.x = b.shL + Math.sin(p * 1.6 + 1.5) * 0.1;
      } else if (act === 'talk') {
        J.neck.rotation.y = b.neck + Math.sin(p * 0.7) * 0.25;
        J.elR.rotation.x = b.elR + Math.sin(p * 2.1) * 0.15;
      } else {
        J.spine.rotation.x = b.spine + Math.sin(p * 1.3) * 0.015;
        J.neck.rotation.y = b.neck + Math.sin(p * 0.4) * 0.12;
      }
    }
  });
}

/* ================================================================== */
/* Con vật: chó nhà, hươu nai                                           */
/* ================================================================== */
/**
 * kind: 'dog' | 'deer'; pose: 'stand' | 'drink' | 'lie' | 'carried' (bị trói chân, khiêng trên đòn).
 * Đầu quay về +z. Gốc tọa độ ở mặt đất (trừ 'carried': gốc ở đòn khiêng).
 */
export function quadruped(HM, { kind = 'dog', pose = 'stand', antlers = true } = {}) {
  const deer = kind === 'deer';
  const S = deer ? { len: 0.8, r: 0.2, leg: 0.62, neck: 0.42, head: 0.1, w: 0.12 } : { len: 0.42, r: 0.12, leg: 0.3, neck: 0.16, head: 0.075, w: 0.075 };
  const coat = deer ? HM.deer : HM.dog;
  const light = deer ? HM.deerLight : HM.dogLight;
  const g = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = S.leg + S.r * 0.9;
  g.add(body);
  const torso = mesh(new THREE.CapsuleGeometry(S.r, S.len, 6, 14), coat);
  torso.rotation.x = Math.PI / 2;
  torso.scale.set(0.85, 1, 1);
  body.add(torso);
  const chest = mesh(new THREE.SphereGeometry(S.r * 1.05, 14, 10), coat, 0, 0.02, S.len * 0.38);
  body.add(chest);
  const belly = mesh(new THREE.CapsuleGeometry(S.r * 0.75, S.len * 0.7, 4, 10), light, 0, -S.r * 0.35, 0);
  belly.rotation.x = Math.PI / 2;
  body.add(belly);
  // cổ, đầu
  const neck = new THREE.Group();
  neck.position.set(0, S.r * 0.4, S.len * 0.5);
  body.add(neck);
  neck.rotation.x = pose === 'drink' ? 1.5 : deer ? -0.75 : -0.45;
  const nk = mesh(new THREE.CapsuleGeometry(S.r * 0.5, S.neck, 4, 10), coat, 0, S.neck / 2, 0);
  neck.add(nk);
  const head = new THREE.Group();
  head.position.y = S.neck + S.r * 0.3;
  head.rotation.x = deer ? 1.0 : 0.6;
  neck.add(head);
  const skull = mesh(new THREE.SphereGeometry(S.head, 14, 10), coat);
  skull.scale.set(0.9, 0.95, 1.05);
  head.add(skull);
  const snout = mesh(new THREE.CapsuleGeometry(S.head * 0.55, S.head * (deer ? 1.3 : 0.9), 4, 10), coat, 0, -S.head * 0.15, S.head * (deer ? 1.1 : 0.95));
  snout.rotation.x = Math.PI / 2 + 0.15;
  head.add(snout);
  head.add(mesh(new THREE.SphereGeometry(S.head * 0.28, 8, 6), HM.nose, 0, -S.head * 0.12, S.head * (deer ? 1.95 : 1.65)));
  for (const s of [-1, 1]) {
    head.add(mesh(new THREE.SphereGeometry(S.head * 0.16, 8, 6), HM.iris, s * S.head * 0.6, S.head * 0.25, S.head * 0.6));
    const ear = mesh(new THREE.ConeGeometry(S.head * (deer ? 0.35 : 0.32), S.head * (deer ? 1.2 : 0.9), 6), coat, s * S.head * 0.6, S.head * 0.85, -S.head * 0.2);
    ear.rotation.z = -s * (deer ? 1.0 : 0.25);
    ear.scale.z = 0.4;
    head.add(ear);
  }
  if (deer && antlers) {
    for (const s of [-1, 1]) {
      const mk = (pts, r) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(s * x, y, z))), 10, r, 6), HM.antler);
      head.add(mk([[0.04, 0.08, -0.02], [0.1, 0.25, -0.06], [0.13, 0.42, -0.02], [0.1, 0.55, 0.05]], 0.012));
      head.add(mk([[0.1, 0.25, -0.06], [0.05, 0.33, 0.08]], 0.009));
      head.add(mk([[0.13, 0.42, -0.02], [0.2, 0.5, -0.06]], 0.008));
    }
  }
  // chân
  const legs = [];
  for (const [x, z] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const leg = new THREE.Group();
    leg.position.set(x * S.w, -S.r * 0.3, z * S.len * 0.42);
    body.add(leg);
    leg.add(mesh(limbGeo(S.r * 0.42, S.r * 0.2, S.leg * 0.5, 0.25, 0.25, 10), coat));
    const low = new THREE.Group();
    low.position.y = -S.leg * 0.5;
    leg.add(low);
    low.add(mesh(limbGeo(S.r * 0.2, S.r * 0.14, S.leg * 0.5, 0.05, 0.5, 8), deer ? coat : light));
    low.add(mesh(new THREE.SphereGeometry(S.r * 0.17, 8, 6), deer ? HM.hoof : light, 0, -S.leg * 0.5, S.r * 0.05));
    legs.push({ leg, low, front: z > 0 });
  }
  // đuôi
  const tail = deer
    ? mesh(new THREE.SphereGeometry(S.r * 0.3, 8, 6), HM.deerLight, 0, S.r * 0.3, -S.len * 0.62)
    : mesh(new THREE.TorusGeometry(S.r * 0.6, S.r * 0.15, 6, 10, Math.PI * 1.2), coat, 0, S.r * 0.75, -S.len * 0.6);
  if (!deer) tail.rotation.y = Math.PI / 2;
  body.add(tail);

  if (pose === 'lie') {
    body.position.y = S.r * 0.95;
    for (const l of legs) {
      l.leg.rotation.x = l.front ? -1.4 : 1.4;
      l.low.rotation.x = l.front ? 0.2 : -0.3;
    }
    neck.rotation.x = -0.2;
  } else if (pose === 'carried') {
    // treo ngửa dưới đòn: lật ngược con vật, chân trói chụm lên đòn (gốc tọa độ)
    for (const l of legs) {
      l.leg.rotation.x = l.front ? -0.25 : 0.25;
    }
    body.position.y = S.leg + S.r * 0.3;
    g.rotation.z = Math.PI;
    neck.rotation.x = 0.6;
    head.rotation.x = 0.2;
  } else if (pose === 'drink') {
    for (const l of legs) if (l.front) l.leg.rotation.x = -0.2;
  }
  g.userData.animal = true;
  return shadows(g);
}
