import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { mulberry32 } from './noise.js';
import {
  bambooLeafTexture,
  bambooStalkTexture,
  bannerTexture,
  drumBodyTexture,
  drumFaceTexture,
  flameTexture,
  grassBladeTexture,
  mistTexture,
} from './textures.js';

const V3 = THREE.Vector3;

/** Lá, cỏ hai mặt: giữ pháp tuyến hướng lên ở cả mặt sau để không bị tối đen. */
export function noBackfaceDarkening(shader) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <normal_fragment_begin>',
    THREE.ShaderChunk.normal_fragment_begin.replace('float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;', 'float faceDirection = 1.0;'),
  );
}
const shadow = (o, cast = true, receive = true) => {
  o.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = cast;
      c.receiveShadow = receive;
    }
  });
  return o;
};

/** Vật liệu dùng chung cho mọi cảnh. */
export function commonMaterials(engine) {
  const bronze = new THREE.MeshStandardMaterial({ color: 0x9a7444, metalness: 0.8, roughness: 0.42 });
  return {
    bark: engine.pbr('bark_brown_02', [1, 3]),
    post: engine.pbr('bark_brown_02', [1, 1]),
    planks: engine.pbr('weathered_brown_planks', [1, 1]),
    thatch: engine.pbr('thatch_roof_angled', [1, 1], { side: THREE.DoubleSide }),
    bambooWall: engine.pbr('bamboo_wall', [1, 1]),
    earth: engine.pbr('brown_mud_dry', [5, 5], { color: 0x9a8160 }),
    path: engine.pbr('forrest_ground_01', [6, 6]),
    bronze,
    bronzeTip: new THREE.MeshStandardMaterial({ color: 0xb08a4c, metalness: 0.9, roughness: 0.35 }),
    rope: new THREE.MeshStandardMaterial({ color: 0x8a7350, roughness: 0.9 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0x8c6a46, roughness: 0.95 }),
  };
}

/** Nhân bản một mô hình glTF theo nhiều vị trí bằng InstancedMesh (nhẹ cho GPU). */
export function instanceGltf(gltf, transforms, { castShadow = true, receiveShadow = true } = {}) {
  const group = new THREE.Group();
  gltf.scene.updateMatrixWorld(true);
  const dummy = new THREE.Object3D();
  gltf.scene.traverse((node) => {
    if (!node.isMesh) return;
    const im = new THREE.InstancedMesh(node.geometry, node.material, transforms.length);
    transforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
      dummy.scale.setScalar(t.s || 1);
      dummy.updateMatrix();
      const m = new THREE.Matrix4().multiplyMatrices(dummy.matrix, node.matrixWorld);
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = castShadow;
    im.receiveShadow = receiveShadow;
    im.frustumCulled = false;
    if (node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m) => {
        if (m.transparent && m.alphaTest === 0) {
          m.alphaTest = 0.5;
          m.transparent = false;
        }
        if (m.alphaTest > 0 && !m.userData.leafFix) {
          m.side = THREE.DoubleSide;
          m.userData.leafFix = true;
          m.onBeforeCompile = noBackfaceDarkening;
          m.needsUpdate = true;
        }
      });
    }
    group.add(im);
  });
  return group;
}

/**
 * Đặt mô hình tải ngoài (ví dụ từ Sketchfab): tự co giãn về đúng chiều cao thật,
 * đặt chân sát mặt đất, xoay theo hướng yaw. Giữ được xương và hoạt ảnh nếu có.
 */
export function placeModel(gltf, { height, x, y, z, yaw = 0 }) {
  const obj = cloneSkinned(gltf.scene);
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new V3());
  obj.scale.multiplyScalar(height / (size.y || 1));
  obj.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(obj);
  const c = b2.getCenter(new V3());
  obj.position.x -= c.x;
  obj.position.z -= c.z;
  obj.position.y -= b2.min.y;
  const wrap = new THREE.Group();
  wrap.add(obj);
  wrap.position.set(x, y, z);
  wrap.rotation.y = yaw;
  return shadow(wrap);
}

/**
 * Gộp một hình mẫu (không chuyển động) thành vài InstancedMesh, mỗi vật liệu một khối,
 * rồi nhân bản tới các vị trí `placements` [{x, y, z, ry, s}]. Dùng cho hàng quân, xóm nhà đông.
 */
export function instanceTemplate(template, placements) {
  const group = new THREE.Group();
  if (!placements.length) return group;
  template.updateMatrixWorld(true);
  const byMat = new Map();
  template.traverse((o) => {
    if (!o.isMesh) return;
    const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
    if (!byMat.has(o.material)) byMat.set(o.material, []);
    byMat.get(o.material).push(g);
  });
  const dummy = new THREE.Object3D();
  byMat.forEach((geos, mat) => {
    const list = geos.some((g) => !g.index) ? geos.map((g) => (g.index ? g.toNonIndexed() : g)) : geos;
    list.forEach((g) => {
      // chỉ giữ các thuộc tính chung để gộp được
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    });
    const merged = mergeGeometries(list);
    list.forEach((g) => g.dispose());
    const im = new THREE.InstancedMesh(merged, mat, placements.length);
    placements.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0, p.ry || 0, 0);
      dummy.scale.setScalar(p.s || 1);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    im.computeBoundingSphere();
    group.add(im);
  });
  template.traverse((o) => o.isMesh && o.geometry.dispose());
  return group;
}

/* ------------------------------------------------------------------ */
/* Nhà sàn mái tròn (mái vòm hình mai rùa, theo hình khắc trên trống   */
/* đồng Ngọc Lũ) — dùng làm mẫu để nhân bản thành xóm                  */
/* ------------------------------------------------------------------ */
export function roundHut(engine, mats, { r = 2.6, stilt = 0.8, wallH = 1.3, roofH = 3.4, overhang = 0.8 } = {}) {
  const g = new THREE.Group();
  const postGeo = new THREE.CylinderGeometry(0.1, 0.12, stilt + 0.4, 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.Mesh(postGeo, mats.post);
    p.position.set(Math.cos(a) * r * 0.75, (stilt + 0.4) / 2 - 0.4, Math.sin(a) * r * 0.75);
    g.add(p);
  }
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.15, r + 0.15, 0.16, 18), mats.planks);
  floor.position.y = stilt;
  g.add(floor);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, wallH, 20, 1, true), mats.bambooWall);
  wall.position.y = stilt + wallH / 2;
  g.add(wall);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.25, 0.1), mats.post);
  door.position.set(0, stilt + 0.65, r + 0.02);
  g.add(door);
  // mái vòm lợp tranh, xòe rộng che kín vách như đống rơm
  const R = r + overhang;
  const prof = [new THREE.Vector2(0.001, roofH)];
  for (let i = 11; i >= 0; i--) {
    const t = i / 12;
    prof.push(new THREE.Vector2(R * Math.pow(1 - t * t, 0.62), t * roofH));
  }
  prof.push(new THREE.Vector2(R + 0.12, -0.18));
  const roofGeo = new THREE.LatheGeometry(prof, 22);
  const uv = roofGeo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 5, uv.getY(i) * 2.2);
  const roof = new THREE.Mesh(roofGeo, mats.thatch);
  roof.position.y = stilt + wallH - 0.35;
  g.add(roof);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 6), mats.post);
  knot.position.y = stilt + wallH - 0.35 + roofH + 0.15;
  g.add(knot);
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Cọc rào dọc mặt thành                                               */
/* ------------------------------------------------------------------ */
export function palisade(engine, mats, points, { heightAt, spacing = 0.42, height = 2.6, offset = 0, seed = 3, skip } = {}) {
  const rnd = mulberry32(seed);
  const shaft = new THREE.CylinderGeometry(0.09, 0.11, 1, 7, 1, true);
  shaft.translate(0, 0.5, 0);
  const tip = new THREE.ConeGeometry(0.09, 0.22, 7);
  tip.translate(0, 1.11, 0);
  const geo = mergeGeometries([shaft, tip]);
  const list = [];
  // nội suy dọc đường gấp khúc theo khoảng cách đều
  let acc = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = a.distanceTo(b);
    const dir = new V3().subVectors(b, a).normalize();
    const nrm = new V3(-dir.z, 0, dir.x);
    let d = acc;
    while (d < len) {
      const p = new V3().copy(a).addScaledVector(dir, d).addScaledVector(nrm, offset);
      if (!skip || !skip(p.x, p.z)) {
        list.push({ p, h: height * (0.85 + rnd() * 0.3), tilt: (rnd() - 0.5) * 0.08, yaw: rnd() * 6 });
      }
      d += spacing;
    }
    acc = d - len;
  }
  const im = new THREE.InstancedMesh(geo, mats.bark, list.length);
  const m = new THREE.Object3D();
  list.forEach((s, i) => {
    m.position.set(s.p.x, heightAt(s.p.x, s.p.z) - 0.4, s.p.z);
    m.rotation.set(s.tilt, s.yaw, s.tilt * 0.5);
    m.scale.set(1, s.h, 1);
    m.updateMatrix();
    im.setMatrixAt(i, m.matrix);
  });
  im.castShadow = true;
  im.receiveShadow = true;
  // thanh ngang buộc cọc
  return im;
}

/* ------------------------------------------------------------------ */
/* Mái nhà hình yên ngựa, hai đầu cong vút như thuyền (nhà sàn Đông Sơn) */
/* ------------------------------------------------------------------ */
function saddleRoofGeometry({ L, W, ridgeY, eaveY, overhang = 1.1, curlRidge = 1.6, curlEave = 0.9, sag = 0.25, segU = 32, segV = 10 }) {
  const pos = [];
  const uv = [];
  const idx = [];
  const sides = [-1, 1];
  for (const side of sides) {
    const base = pos.length / 3;
    for (let iv = 0; iv <= segV; iv++) {
      const v = iv / segV;
      for (let iu = 0; iu <= segU; iu++) {
        const u = (iu / segU) * 2 - 1;
        const u4 = u ** 4;
        const rx = u * (L / 2 + overhang + 0.6);
        const ry = ridgeY + curlRidge * u4;
        const ex = u * (L / 2 + overhang);
        const ey = eaveY + curlEave * u4;
        const ez = side * (W / 2 + 0.7 - 0.35 * u4);
        const x = THREE.MathUtils.lerp(rx, ex, v);
        const y = THREE.MathUtils.lerp(ry, ey, v) - Math.sin(v * Math.PI) * sag;
        const z = THREE.MathUtils.lerp(0, ez, v);
        pos.push(x, y, z);
        uv.push((u * (L / 2 + overhang)) / 2.2, (v * (W / 2 + 0.7)) / 2.2);
      }
    }
    for (let iv = 0; iv < segV; iv++) {
      for (let iu = 0; iu < segU; iu++) {
        const a = base + iv * (segU + 1) + iu;
        const b = a + 1;
        const c = a + segU + 1;
        const d = c + 1;
        if (side > 0) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Nhà sàn mái cong theo hình khắc trên trống đồng Đông Sơn. */
export function stiltHouse(engine, mats, { L = 9, W = 5, floorH = 2.1, wallH = 1.2, ridge = 4.4, ladder } = {}) {
  const g = new THREE.Group();
  // cột
  const postGeo = new THREE.CylinderGeometry(0.12, 0.14, floorH + 0.6, 8);
  for (let ix = 0; ix < 4; ix++) {
    for (let iz = 0; iz < 3; iz++) {
      const p = new THREE.Mesh(postGeo, mats.post);
      p.position.set(-L / 2 + 0.4 + (ix * (L - 0.8)) / 3, (floorH + 0.6) / 2 - 0.6, -W / 2 + 0.4 + (iz * (W - 0.8)) / 2);
      g.add(p);
    }
  }
  // sàn
  const floor = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, W), mats.planks);
  floor.position.y = floorH;
  g.add(floor);
  // vách tre
  const wallMat = mats.bambooWall;
  const wallLong = new THREE.BoxGeometry(L - 0.4, wallH, 0.08);
  const wallShort = new THREE.BoxGeometry(0.08, wallH, W - 0.4);
  [-1, 1].forEach((s) => {
    const w1 = new THREE.Mesh(wallLong, wallMat);
    w1.position.set(0, floorH + wallH / 2, s * (W / 2 - 0.2));
    g.add(w1);
  });
  // vách hồi (có cửa ở mặt trước)
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-W / 2 + 0.2, 0);
  gableShape.lineTo(W / 2 - 0.2, 0);
  gableShape.lineTo(W / 2 - 0.2, wallH);
  gableShape.lineTo(0, ridge - floorH - 0.2);
  gableShape.lineTo(-W / 2 + 0.2, wallH);
  gableShape.closePath();
  const door = new THREE.Path();
  door.moveTo(-0.5, 0);
  door.lineTo(0.5, 0);
  door.lineTo(0.5, 1.65);
  door.lineTo(-0.5, 1.65);
  door.closePath();
  const gableFront = gableShape.clone();
  gableFront.holes.push(door);
  [
    [-1, gableShape],
    [1, gableFront],
  ].forEach(([s, shape]) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
    const uvs = geo.attributes.uv;
    for (let i = 0; i < uvs.count; i++) uvs.setXY(i, uvs.getX(i) * 0.4, uvs.getY(i) * 0.4);
    const m = new THREE.Mesh(geo, wallMat);
    m.rotation.y = Math.PI / 2;
    m.position.set(s * (L / 2 - 0.2), floorH, 0);
    g.add(m);
  });
  // mái
  const roof = new THREE.Mesh(
    saddleRoofGeometry({ L, W, ridgeY: ridge, eaveY: floorH + wallH - 0.05 }),
    mats.thatch,
  );
  g.add(roof);
  // nóc mái, hai đầu đắp hình đầu chim
  [-1, 1].forEach((s) => {
    const curve = new THREE.CatmullRomCurve3([
      new V3(s * (L / 2 + 1.5), ridge + 1.45, 0),
      new V3(s * (L / 2 + 2.1), ridge + 2.0, 0),
      new V3(s * (L / 2 + 2.3), ridge + 2.55, 0),
      new V3(s * (L / 2 + 2.0), ridge + 2.75, 0),
    ]);
    const horn = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.08, 6), mats.post);
    g.add(horn);
  });
  const ridgeBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, L + 2.6, 8), mats.post);
  ridgeBeam.rotation.z = Math.PI / 2;
  ridgeBeam.position.y = ridge + 0.05;
  g.add(ridgeBeam);
  if (ladder) {
    const l = ladder.clone();
    l.position.set(L / 2 + 0.75, 0, 0);
    l.rotation.y = Math.PI / 2;
    l.rotation.x = -0.32;
    g.add(l);
  }
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Vọng lâu (chòi canh) và cổng thành                                 */
/* ------------------------------------------------------------------ */
export function watchtower(engine, mats, { h = 6.5, w = 3.2 } = {}) {
  const g = new THREE.Group();
  const post = new THREE.CylinderGeometry(0.14, 0.17, h + 1.5, 8);
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const p = new THREE.Mesh(post, mats.post);
    p.position.set((x * w) / 2, (h + 1.5) / 2 - 0.5, (z * w) / 2);
    p.rotation.set(-z * 0.03, 0, x * 0.03);
    g.add(p);
  }
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.18, w + 0.6), mats.planks);
  deck.position.y = h - 1.2;
  g.add(deck);
  // lan can
  const rail = new THREE.BoxGeometry(w + 0.6, 0.1, 0.1);
  [-1, 1].forEach((s) => {
    const r1 = new THREE.Mesh(rail, mats.post);
    r1.position.set(0, h - 0.25, (s * (w + 0.6)) / 2);
    const r2 = r1.clone();
    r2.rotation.y = Math.PI / 2;
    r2.position.set((s * (w + 0.6)) / 2, h - 0.25, 0);
    g.add(r1, r2);
  });
  // giằng chéo
  const brace = new THREE.CylinderGeometry(0.06, 0.06, Math.hypot(w, h - 1.4), 6);
  [-1, 1].forEach((s) => {
    const b = new THREE.Mesh(brace, mats.post);
    b.position.set(0, (h - 1.4) / 2, (s * w) / 2);
    b.rotation.z = Math.atan2(w, h - 1.4) * s;
    g.add(b);
  });
  // mái chóp lợp tranh
  const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.95, 2.1, 4, 1, true), mats.thatch);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = h + 1.05;
  g.add(roof);
  return shadow(g);
}

export function gateHouse(engine, mats, { span = 7 } = {}) {
  const g = new THREE.Group();
  const left = watchtower(engine, mats, { h: 7, w: 3 });
  left.position.x = -span / 2 - 1.6;
  const right = left.clone();
  right.position.x = span / 2 + 1.6;
  g.add(left, right);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 6.4, 0.45, 0.5), mats.post);
  beam.position.y = 5.6;
  g.add(beam);
  const roof = new THREE.Mesh(saddleRoofGeometry({ L: span, W: 2.4, ridgeY: 7.6, eaveY: 6.2, overhang: 0.6, curlRidge: 0.8, curlEave: 0.4 }), mats.thatch);
  g.add(roof);
  // hai cánh cổng gỗ mở vào trong, quay quanh bản lề ở hai bên
  const w = span / 2;
  const leaf = new THREE.BoxGeometry(w, 4.6, 0.18);
  const theta = 1.1;
  [-1, 1].forEach((s) => {
    const d = new THREE.Mesh(leaf, mats.planks);
    const hingeX = s * w;
    d.position.set(hingeX - s * Math.cos(theta) * (w / 2), 2.3, -Math.sin(theta) * (w / 2));
    d.rotation.y = s < 0 ? theta : -theta;
    g.add(d);
  });
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Trống đồng Đông Sơn (tỉ lệ trống Ngọc Lũ: cao 0,63 m, mặt 0,79 m)    */
/* ------------------------------------------------------------------ */
export function bronzeDrum(engine, { scale = 1 } = {}) {
  const g = new THREE.Group();
  const profile = [
    [0.372, 0],
    [0.384, 0.012],
    [0.37, 0.06],
    [0.352, 0.2],
    [0.338, 0.33],
    [0.348, 0.4],
    [0.385, 0.48],
    [0.418, 0.54],
    [0.43, 0.585],
    [0.414, 0.615],
    [0.4, 0.628],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const bodyMat = new THREE.MeshStandardMaterial({
    map: drumBodyTexture(),
    metalness: 0.72,
    roughness: 0.5,
    side: THREE.DoubleSide,
  });
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), bodyMat);
  g.add(body);
  const faceMat = new THREE.MeshStandardMaterial({ map: drumFaceTexture(1024), metalness: 0.7, roughness: 0.45 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.405, 72), faceMat);
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.629;
  g.add(face);
  // bốn quai trống
  const handle = new THREE.TorusGeometry(0.055, 0.014, 6, 12, Math.PI);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x8c6a3c, metalness: 0.8, roughness: 0.45 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const h = new THREE.Mesh(handle, handleMat);
    h.position.set(Math.cos(a) * 0.4, 0.5, Math.sin(a) * 0.4);
    h.rotation.set(0, -a + Math.PI / 2, Math.PI / 2);
    g.add(h);
  }
  g.scale.setScalar(scale);
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Nỏ, giá nỏ, bó mũi tên đồng                                         */
/* ------------------------------------------------------------------ */
export function crossbow(mats) {
  const g = new THREE.Group();
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.07), mats.post);
  g.add(stock);
  const arc = new THREE.QuadraticBezierCurve3(new V3(0.42, 0, -0.62), new V3(0.62, 0, 0), new V3(0.42, 0, 0.62));
  const bow = new THREE.Mesh(new THREE.TubeGeometry(arc, 16, 0.022, 6), mats.post);
  g.add(bow);
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1.24, 4), mats.rope);
  string.rotation.x = Math.PI / 2;
  string.position.x = 0.42;
  g.add(string);
  // lẫy nỏ bằng đồng
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.06), mats.bronze);
  lock.position.set(-0.1, 0.05, 0);
  g.add(lock);
  return shadow(g);
}

export function crossbowRack(engine, mats, { count = 6 } = {}) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), mats.post);
  [-1, 1].forEach((s) => {
    const f = frame.clone();
    f.position.set(0, 0.7, (s * (count * 0.45)) / 2);
    g.add(f);
  });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, count * 0.45 + 0.2), mats.post);
  bar.position.y = 1.25;
  g.add(bar);
  for (let i = 0; i < count; i++) {
    const c = crossbow(mats);
    c.rotation.z = Math.PI / 2 - 0.18;
    c.rotation.y = Math.PI / 2;
    c.position.set(0.18, 0.58, -((count - 1) * 0.45) / 2 + i * 0.45);
    c.scale.setScalar(0.8);
    g.add(c);
  }
  return shadow(g);
}

export function arrowBundle(mats, { count = 40, seed = 5 } = {}) {
  const rnd = mulberry32(seed);
  const shaft = new THREE.CylinderGeometry(0.006, 0.006, 0.75, 4);
  const tip = new THREE.ConeGeometry(0.012, 0.05, 4);
  tip.translate(0, 0.4, 0);
  const shaftIM = new THREE.InstancedMesh(shaft, mats.post, count);
  const tipIM = new THREE.InstancedMesh(tip, mats.bronzeTip, count);
  const m = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 0.07;
    m.position.set(Math.cos(a) * r, 0.38, Math.sin(a) * r);
    m.rotation.set((rnd() - 0.5) * 0.08, 0, (rnd() - 0.5) * 0.08);
    m.updateMatrix();
    shaftIM.setMatrixAt(i, m.matrix);
    tipIM.setMatrixAt(i, m.matrix);
  }
  const g = new THREE.Group();
  g.add(shaftIM, tipIM);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), mats.rope);
  tie.rotation.x = Math.PI / 2;
  tie.position.y = 0.3;
  g.add(tie);
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Thuyền chiến mũi cong (theo hình thuyền trên trống đồng)            */
/* ------------------------------------------------------------------ */
export function warBoat(engine, mats, { L = 13, W = 1.7, D = 0.85, rise = 2.1 } = {}) {
  const segS = 40;
  const segT = 12;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let is = 0; is <= segS; is++) {
    const s = is / segS;
    const x = (s - 0.5) * L;
    const e = Math.abs(2 * s - 1);
    const half = (W / 2) * Math.pow(Math.max(0, 1 - e ** 2.2), 0.55);
    const depth = D * Math.pow(Math.max(0.05, 1 - e ** 2), 0.5);
    const keel = rise * e ** 3.2;
    for (let it = 0; it <= segT; it++) {
      const t = (it / segT) * 2 - 1;
      const a = (t * Math.PI) / 2;
      const z = half * Math.sin(a);
      const y = keel + depth * (1 - Math.cos(a)) + keel * 0.15 * Math.abs(t);
      pos.push(x, y, z);
      uv.push(x / 2, t);
    }
  }
  for (let is = 0; is < segS; is++) {
    for (let it = 0; it < segT; it++) {
      const a = is * (segT + 1) + it;
      const b = a + 1;
      const c = a + segT + 1;
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const hullMat = mats.planks.clone();
  hullMat.side = THREE.DoubleSide;
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, hullMat));
  // đầu chim ở mũi và lái
  [-1, 1].forEach((sgn) => {
    const tipX = (sgn * L) / 2;
    const curve = new THREE.CatmullRomCurve3([
      new V3(tipX, rise + D * 0.9, 0),
      new V3(tipX + sgn * 0.5, rise + D + 0.6, 0),
      new V3(tipX + sgn * 0.3, rise + D + 1.2, 0),
      new V3(tipX + sgn * 0.85, rise + D + 1.35, 0),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.09, 6), mats.post));
  });
  // mái che giữa thuyền
  const canopy = new THREE.Mesh(
    saddleRoofGeometry({ L: 2.4, W: 1.2, ridgeY: D + 1.7, eaveY: D + 0.9, overhang: 0.2, curlRidge: 0.35, curlEave: 0.15, segU: 12, segV: 4 }),
    mats.thatch,
  );
  g.add(canopy);
  // mái chèo
  const oar = new THREE.CylinderGeometry(0.03, 0.03, 2.6, 5);
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    [-1, 1].forEach((sgn) => {
      const o = new THREE.Mesh(oar, mats.post);
      o.position.set(i * 1.2, D * 0.9, sgn * (W / 2 + 0.6));
      o.rotation.x = sgn * 1.05;
      g.add(o);
    });
  }
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Cờ bay theo gió                                                     */
/* ------------------------------------------------------------------ */
export function bannerPole(engine, mats, { h = 9, w = 2.2, bh = 3.2, phase = 0, texture } = {}) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, h, 8), mats.bambooStalk || mats.post);
  pole.position.y = h / 2;
  g.add(pole);
  const geo = new THREE.PlaneGeometry(w, bh, 24, 16);
  geo.translate(w / 2, 0, 0);
  const mat = new THREE.MeshStandardMaterial({ map: texture || bannerTexture(), side: THREE.DoubleSide, roughness: 0.85 });
  const uniforms = { uTime: { value: 0 }, uPhase: { value: phase } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uPhase;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float k = position.x / ${w.toFixed(2)};
        transformed.z += sin(position.x * 2.4 - uTime * 4.0 + uPhase) * 0.28 * k + sin(position.y * 1.7 + uTime * 2.3 + uPhase) * 0.08 * k;
        transformed.y -= k * k * 0.25;`,
      );
  };
  const flag = new THREE.Mesh(geo, mat);
  flag.position.y = h - bh / 2 - 0.15;
  flag.castShadow = true;
  g.add(flag);
  engine.updaters.push((dt, t) => {
    uniforms.uTime.value = t;
  });
  return shadow(g, true, true);
}

/* ------------------------------------------------------------------ */
/* Bụi tre làng                                                        */
/* ------------------------------------------------------------------ */
export function bambooGroves(engine, groves, { heightAt, seed = 11 } = {}) {
  const rnd = mulberry32(seed);
  const stalkTex = bambooStalkTexture();
  stalkTex.repeat.set(1, 14);
  const stalkMat = new THREE.MeshStandardMaterial({ map: stalkTex, roughness: 0.55 });
  const leafMat = new THREE.MeshStandardMaterial({
    map: bambooLeafTexture(),
    alphaTest: 0.45,
    side: THREE.DoubleSide,
    roughness: 0.75,
  });
  const sway = { value: 0 };
  leafMat.onBeforeCompile = (shader) => {
    noBackfaceDarkening(shader);
    shader.uniforms.uTime = sway;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float ph = instanceMatrix[3].x * 0.21 + instanceMatrix[3].z * 0.17;
          transformed.x += sin(uTime * 1.6 + ph) * 0.12 * (position.y + 1.0);
          transformed.z += cos(uTime * 1.3 + ph) * 0.08 * (position.y + 1.0);
        #endif`,
      );
  };
  engine.updaters.push((dt, t) => {
    sway.value = t;
  });

  const stalks = [];
  const leaves = [];
  for (const gv of groves) {
    const n = gv.count || 18;
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * (gv.r || 1.4);
      const x = gv.x + Math.cos(a) * r;
      const z = gv.z + Math.sin(a) * r;
      const h = 7 + rnd() * 6;
      const lean = 0.05 + rnd() * 0.18;
      stalks.push({ x, y: heightAt(x, z) - 0.2, z, h, a, lean });
      const leafCount = 7 + Math.floor(rnd() * 6);
      for (let k = 0; k < leafCount; k++) {
        const f = 0.45 + rnd() * 0.6;
        leaves.push({
          x: x + Math.cos(a) * Math.sin(lean) * h * f + (rnd() - 0.5) * 1.2,
          y: heightAt(x, z) + h * f * Math.cos(lean),
          z: z + Math.sin(a) * Math.sin(lean) * h * f + (rnd() - 0.5) * 1.2,
          s: 1.6 + rnd() * 1.6,
          ry: rnd() * Math.PI,
          rz: (rnd() - 0.5) * 0.9,
        });
      }
    }
  }
  const stalkGeo = new THREE.CylinderGeometry(0.045, 0.06, 1, 6, 1, true);
  stalkGeo.translate(0, 0.5, 0);
  const stalkIM = new THREE.InstancedMesh(stalkGeo, stalkMat, stalks.length);
  const m = new THREE.Object3D();
  stalks.forEach((s, i) => {
    m.position.set(s.x, s.y, s.z);
    m.rotation.set(0, 0, 0);
    m.rotateY(-s.a);
    m.rotateZ(-s.lean);
    m.scale.set(1, s.h, 1);
    m.updateMatrix();
    stalkIM.setMatrixAt(i, m.matrix);
  });
  stalkIM.castShadow = true;
  stalkIM.receiveShadow = true;

  const a = new THREE.PlaneGeometry(1, 1);
  const b = new THREE.PlaneGeometry(1, 1);
  b.rotateY(Math.PI / 2);
  const leafGeo = mergeGeometries([a, b]);
  const leafIM = new THREE.InstancedMesh(leafGeo, leafMat, leaves.length);
  leaves.forEach((l, i) => {
    m.position.set(l.x, l.y, l.z);
    m.rotation.set(0, l.ry, l.rz);
    m.scale.setScalar(l.s);
    m.updateMatrix();
    leafIM.setMatrixAt(i, m.matrix);
  });
  leafIM.castShadow = true;
  leafIM.receiveShadow = true;
  const g = new THREE.Group();
  g.add(stalkIM, leafIM);
  return g;
}

/* ------------------------------------------------------------------ */
/* Thảm cỏ lay theo gió                                                */
/* ------------------------------------------------------------------ */
export function grassField(engine, { count, pick, seed = 21 }) {
  const rnd = mulberry32(seed);
  const a = new THREE.PlaneGeometry(1, 0.7);
  a.translate(0, 0.35, 0);
  const b = a.clone().rotateY(Math.PI / 2);
  const c = a.clone().rotateY(Math.PI / 4);
  const geo = mergeGeometries([a, b, c]);
  // pháp tuyến hướng lên trời để cỏ sáng đều
  const nrm = geo.attributes.normal;
  for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
  const mat = new THREE.MeshStandardMaterial({
    map: grassBladeTexture(),
    alphaTest: 0.42,
    side: THREE.DoubleSide,
    roughness: 0.9,
  });
  const time = { value: 0 };
  mat.onBeforeCompile = (shader) => {
    noBackfaceDarkening(shader);
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float ph = instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.27;
          float w = sin(uTime * 1.9 + ph) * 0.5 + sin(uTime * 3.1 + ph * 1.7) * 0.2;
          transformed.x += w * 0.16 * uv.y;
          transformed.z += w * 0.09 * uv.y;
        #endif`,
      );
  };
  engine.updaters.push((dt, t) => {
    time.value = t;
  });
  const im = new THREE.InstancedMesh(geo, mat, count);
  const m = new THREE.Object3D();
  const color = new THREE.Color();
  let placed = 0;
  let tries = 0;
  while (placed < count && tries < count * 6) {
    tries++;
    const p = pick(rnd);
    if (!p) continue;
    m.position.set(p.x, p.y - 0.05, p.z);
    m.rotation.set(0, rnd() * Math.PI, 0);
    const s = 0.7 + rnd() * 0.9;
    m.scale.set(s, s * (0.8 + rnd() * 0.6), s);
    m.updateMatrix();
    im.setMatrixAt(placed, m.matrix);
    color.setHSL(0.2 + rnd() * 0.06, 0.25, 0.78 + rnd() * 0.2);
    im.setColorAt(placed, color);
    placed++;
  }
  im.count = placed;
  im.receiveShadow = true;
  im.castShadow = false;
  return im;
}

/* ------------------------------------------------------------------ */
/* Lửa đuốc, đống lửa                                                  */
/* ------------------------------------------------------------------ */
export function fire(engine, { x, y, z, size = 1, light = true }) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const tex = engine.__flameTex || (engine.__flameTex = flameTexture());
  const sprites = [];
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.scale.set(0.7 * size, 1.4 * size, 1);
    s.position.set((i - 1) * 0.12 * size, 0.6 * size, 0);
    g.add(s);
    sprites.push(s);
  }
  let pl = null;
  if (light) {
    pl = new THREE.PointLight(0xff9a45, 6 * size, 16 * size, 2);
    pl.position.y = 0.9 * size;
    g.add(pl);
  }
  const seed = Math.random() * 10;
  engine.updaters.push((dt, t) => {
    sprites.forEach((s, i) => {
      const f = 1 + Math.sin(t * (9 + i * 3) + seed + i) * 0.12 + Math.sin(t * 23 + i) * 0.06;
      s.scale.set(0.7 * size * (2 - f), 1.4 * size * f, 1);
    });
    if (pl) pl.intensity = 6 * size * (0.85 + Math.sin(t * 13 + seed) * 0.1 + Math.sin(t * 29) * 0.05);
  });
  return g;
}

/* ------------------------------------------------------------------ */
/* Đàn thề: nền đất đắp nhiều cấp, có bậc lên                          */
/* ------------------------------------------------------------------ */
export function altarMound(engine, mats, { base = 22, tiers = 3, tierH = 1.1 } = {}) {
  const g = new THREE.Group();
  let y = 0;
  let size = base;
  for (let i = 0; i < tiers; i++) {
    const top = size - 4;
    const geo = new THREE.CylinderGeometry((top / 2) * Math.SQRT2, (size / 2) * Math.SQRT2, tierH, 4, 1);
    geo.rotateY(Math.PI / 4);
    const uvs = geo.attributes.uv;
    for (let k = 0; k < uvs.count; k++) uvs.setXY(k, uvs.getX(k) * 6, uvs.getY(k) * 1.2);
    const tier = new THREE.Mesh(geo, mats.earth);
    tier.position.y = y + tierH / 2 - 0.15;
    g.add(tier);
    // bậc lên phía nam
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.2, tierH / 4, 0.6), mats.planks);
      step.position.set(0, y + (s + 0.5) * (tierH / 4) - 0.1, size / 2 - 0.4 - s * 0.55);
      g.add(step);
    }
    y += tierH;
    size = top;
  }
  const platform = new THREE.Mesh(new THREE.BoxGeometry(size, 0.12, size), mats.planks);
  platform.position.y = y - 0.08;
  g.add(platform);
  g.userData.topY = y;
  g.userData.topSize = size;
  return shadow(g);
}

/* ------------------------------------------------------------------ */
/* Sương mù sát mặt đất                                                */
/* ------------------------------------------------------------------ */
export function groundMist(engine, { count = 40, area = 200, y = 1.5, heightAt, opacity = 0.35, seed = 4 } = {}) {
  const rnd = mulberry32(seed);
  const tex = mistTexture();
  const g = new THREE.Group();
  const items = [];
  for (let i = 0; i < count; i++) {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: opacity * (0.5 + rnd() * 0.5), fog: true });
    const s = new THREE.Sprite(mat);
    const x = (rnd() - 0.5) * area;
    const z = (rnd() - 0.5) * area;
    const sc = 18 + rnd() * 26;
    s.scale.set(sc, sc * 0.35, 1);
    s.position.set(x, (heightAt ? heightAt(x, z) : 0) + y + rnd() * 2, z);
    g.add(s);
    items.push({ s, vx: (rnd() - 0.5) * 0.4, x0: x });
  }
  engine.updaters.push((dt) => {
    for (const it of items) {
      it.s.position.x += it.vx * dt;
      if (Math.abs(it.s.position.x - it.x0) > 30) it.vx *= -1;
    }
  });
  return g;
}
