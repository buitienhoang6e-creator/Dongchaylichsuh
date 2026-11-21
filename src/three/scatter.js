import * as THREE from 'three';
import { mulberry32 } from './noise.js';
import { instanceGltf } from './builders.js';

/** Lấy mẫu ngẫu nhiên có điều kiện: trả về tối đa `count` điểm thỏa accept(x, z). */
export function samplePoints({ count, seed = 1, area, accept, minDist = 0, maxTries = count * 30 }) {
  const rnd = mulberry32(seed);
  const pts = [];
  let tries = 0;
  while (pts.length < count && tries < maxTries) {
    tries++;
    const p = area(rnd);
    if (!accept(p.x, p.z, rnd)) continue;
    if (minDist && pts.some((q) => (q.x - p.x) ** 2 + (q.z - p.z) ** 2 < minDist * minDist)) continue;
    pts.push({ ...p, r: rnd() });
  }
  return pts;
}

export const inRing = (cx, cz, r0, r1) => (rnd) => {
  const a = rnd() * Math.PI * 2;
  const r = Math.sqrt(r0 * r0 + rnd() * (r1 * r1 - r0 * r0));
  return { x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r };
};

export const inBox = (x0, z0, x1, z1) => (rnd) => ({ x: x0 + rnd() * (x1 - x0), z: z0 + rnd() * (z1 - z0) });

/** Trồng mô hình glTF (cây, bụi, đá…) tại các điểm, tự đặt độ cao theo mặt đất. */
export async function plant(engine, url, points, heightAt, { scale = [0.8, 1.2], sink = 0.1, cast = true } = {}) {
  if (!points.length) return new THREE.Group();
  const gltf = await engine.gltf(url);
  const transforms = points.map((p) => ({
    x: p.x,
    y: heightAt(p.x, p.z) - sink,
    z: p.z,
    ry: p.r * Math.PI * 2,
    s: scale[0] + (scale[1] - scale[0]) * ((p.r * 7.31) % 1),
  }));
  return instanceGltf(gltf, transforms, { castShadow: cast });
}

/** Rừng ở xa: cây đa giác thấp (sương mù sẽ che chi tiết), rất nhẹ. */
export function farForest(engine, points, heightAt, { seed = 9 } = {}) {
  const rnd = mulberry32(seed);
  const canopyGeo = new THREE.IcosahedronGeometry(1, 2);
  const p = canopyGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const k = 0.82 + rnd() * 0.36;
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.85, p.getZ(i) * k);
  }
  canopyGeo.computeVertexNormals();
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1, 6);
  trunkGeo.translate(0, 0.5, 0);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x3c5427, roughness: 0.95, flatShading: false });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 });
  const canopy = new THREE.InstancedMesh(canopyGeo, canopyMat, points.length * 2);
  const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, points.length);
  const m = new THREE.Object3D();
  const color = new THREE.Color();
  let ci = 0;
  points.forEach((pt, i) => {
    const y = heightAt(pt.x, pt.z);
    const h = 6 + rnd() * 9;
    m.position.set(pt.x, y - 0.3, pt.z);
    m.rotation.set(0, 0, 0);
    m.scale.set(1, h * 0.5, 1);
    m.updateMatrix();
    trunk.setMatrixAt(i, m.matrix);
    for (let k = 0; k < 2; k++) {
      const s = (h * (0.42 - k * 0.1)) * (0.8 + rnd() * 0.4);
      m.position.set(pt.x + (rnd() - 0.5) * 2, y + h * (0.55 + k * 0.28), pt.z + (rnd() - 0.5) * 2);
      m.rotation.set(0, rnd() * 6, 0);
      m.scale.set(s, s, s);
      m.updateMatrix();
      canopy.setMatrixAt(ci, m.matrix);
      color.setHSL(0.22 + rnd() * 0.07, 0.38 + rnd() * 0.15, 0.2 + rnd() * 0.1);
      canopy.setColorAt(ci, color);
      ci++;
    }
  });
  canopy.castShadow = false;
  canopy.receiveShadow = true;
  const g = new THREE.Group();
  g.add(trunk, canopy);
  return g;
}

/**
 * Mô hình tùy chọn do người dùng tải về (ví dụ từ Sketchfab) đặt trong /3d/sketchfab/.
 * Nếu file chưa có, hàm trả về null và cảnh vẫn chạy bình thường.
 */
export async function optionalModel(engine, file) {
  return engine.optionalGltf(`/3d/sketchfab/${file}`);
}
