import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { createNoise2D, fbm } from './noise.js';

/**
 * Lưới độ cao vuông, tâm tại gốc tọa độ. Lưu cả độ cao lẫn "độ đất" (0 = cỏ, 1 = đất trống).
 */
export class HeightField {
  constructor(size, step) {
    this.size = size;
    this.n = Math.round(size / step) + 1;
    this.step = size / (this.n - 1);
    this.half = size / 2;
    this.h = new Float32Array(this.n * this.n);
    this.dirt = new Float32Array(this.n * this.n);
  }

  xAt(i) {
    return -this.half + i * this.step;
  }

  fill(fn) {
    const { n } = this;
    for (let j = 0; j < n; j++) {
      const z = this.xAt(j);
      for (let i = 0; i < n; i++) this.h[j * n + i] = fn(this.xAt(i), z);
    }
  }

  get(x, z) {
    const { n, step, half } = this;
    const gx = THREE.MathUtils.clamp((x + half) / step, 0, n - 1.001);
    const gz = THREE.MathUtils.clamp((z + half) / step, 0, n - 1.001);
    const i = Math.floor(gx);
    const j = Math.floor(gz);
    const fx = gx - i;
    const fz = gz - j;
    const a = this.h[j * n + i];
    const b = this.h[j * n + i + 1];
    const c = this.h[(j + 1) * n + i];
    const d = this.h[(j + 1) * n + i + 1];
    return a * (1 - fx) * (1 - fz) + b * fx * (1 - fz) + c * (1 - fx) * fz + d * fx * fz;
  }

  slope(x, z) {
    const e = this.step;
    const dx = this.get(x + e, z) - this.get(x - e, z);
    const dz = this.get(x, z + e) - this.get(x, z - e);
    return Math.hypot(dx, dz) / (2 * e);
  }

  /**
   * Tính khoảng cách từ mỗi ô lưới tới một đường gấp khúc (chỉ trong bán kính radius),
   * rồi gọi apply(index, distance, t) — t là vị trí dọc đường (0..1).
   */
  alongLine(points, radius, apply, { closed = false, skip } = {}) {
    const { n, step, half } = this;
    const dist = new Float32Array(n * n).fill(Infinity);
    const tpos = new Float32Array(n * n);
    const segs = closed ? points.length : points.length - 1;
    for (let s = 0; s < segs; s++) {
      const a = points[s];
      const b = points[(s + 1) % points.length];
      if (skip && skip((a.x + b.x) / 2, (a.z + b.z) / 2)) continue;
      const minX = Math.min(a.x, b.x) - radius;
      const maxX = Math.max(a.x, b.x) + radius;
      const minZ = Math.min(a.z, b.z) - radius;
      const maxZ = Math.max(a.z, b.z) + radius;
      const i0 = Math.max(0, Math.floor((minX + half) / step));
      const i1 = Math.min(n - 1, Math.ceil((maxX + half) / step));
      const j0 = Math.max(0, Math.floor((minZ + half) / step));
      const j1 = Math.min(n - 1, Math.ceil((maxZ + half) / step));
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const len2 = abx * abx + abz * abz || 1;
      for (let j = j0; j <= j1; j++) {
        const z = -half + j * step;
        for (let i = i0; i <= i1; i++) {
          const x = -half + i * step;
          let u = ((x - a.x) * abx + (z - a.z) * abz) / len2;
          u = u < 0 ? 0 : u > 1 ? 1 : u;
          const dx = x - (a.x + abx * u);
          const dz = z - (a.z + abz * u);
          const d = Math.sqrt(dx * dx + dz * dz);
          const k = j * n + i;
          if (d < dist[k]) {
            dist[k] = d;
            tpos[k] = (s + u) / segs;
          }
        }
      }
    }
    for (let k = 0; k < n * n; k++) if (dist[k] < radius) apply(k, dist[k], tpos[k]);
  }
}

/** Khoảng cách từ điểm (x, z) tới đường gấp khúc (dùng cho địa hình vùng xa). */
export function distToPolyline(points, x, z) {
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    let u = ((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz || 1);
    u = u < 0 ? 0 : u > 1 ? 1 : u;
    const dx = x - (a.x + abx * u);
    const dz = z - (a.z + abz * u);
    const d = dx * dx + dz * dz;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** Mẫu điểm dọc một đường cong khép kín đi qua các điểm điều khiển (x, z). */
export function sampleLoop(ctrl, count, closed = true) {
  const curve = new THREE.CatmullRomCurve3(ctrl.map(([x, z]) => new THREE.Vector3(x, 0, z)), closed, 'centripetal');
  return curve.getSpacedPoints(count).slice(0, closed ? count : count + 1);
}

/** Vật liệu mặt đất: trộn cỏ và đất theo thuộc tính aDirt, cộng màu biến thiên chống lặp vân. */
export function groundMaterial(engine, { grass = 'leafy_grass', dirt = 'brown_mud_dry', repeat = 80 } = {}) {
  const mat = engine.pbr(grass, [repeat, repeat], { vertexColors: true });
  const dirtMap = engine.texture(`/3d/tex/${dirt}/diff.jpg`, { repeat: [repeat, repeat] });
  const dirtNor = engine.texture(`/3d/tex/${dirt}/nor.jpg`, { srgb: false, repeat: [repeat, repeat] });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.dirtMap = { value: dirtMap };
    shader.uniforms.dirtNor = { value: dirtNor };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aDirt;\nvarying float vDirt;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDirt = aDirt;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D dirtMap;\nuniform sampler2D dirtNor;\nvarying float vDirt;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          vec2 duv = vMapUv * 0.61 + vec2(0.37, 0.11);
          vec4 gA = texture2D( map, vMapUv );
          vec4 gB = texture2D( map, vMapUv * 0.27 + 0.5 );
          vec4 grassCol = mix( gA, gB, 0.35 );
          // nhuộm xanh: giữ độ sáng tối của vân, đổi sắc sang cỏ non đồng bằng
          float lum = dot( grassCol.rgb, vec3( 0.299, 0.587, 0.114 ) );
          vec3 lush = lum * vec3( 0.5, 0.9, 0.28 ) * 1.18;
          grassCol.rgb = mix( grassCol.rgb, lush, 0.7 );
          vec4 dirtCol = texture2D( dirtMap, duv );
          dirtCol.rgb *= vec3( 0.86, 0.72, 0.6 );
          float b = smoothstep( 0.15, 0.85, vDirt );
          diffuseColor *= mix( grassCol, dirtCol, b );
        #endif`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#ifdef USE_NORMALMAP_TANGENTSPACE
          vec3 nG = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
          vec3 nD = texture2D( dirtNor, vNormalMapUv * 0.61 + vec2(0.37, 0.11) ).xyz * 2.0 - 1.0;
          vec3 mapN = normalize( mix( nG, nD, smoothstep(0.15, 0.85, vDirt) ) );
          mapN.xy *= normalScale;
          normal = normalize( tbn * mapN );
        #else
          #include <normal_fragment_maps>
        #endif`,
      );
  };
  mat.customProgramCacheKey = () => `ground-${grass}-${dirt}`;
  return mat;
}

/** Dựng lưới tam giác từ HeightField. */
export function terrainMesh(hf, material, { tintSeed = 7, sink } = {}) {
  const { n, size } = hf;
  const geo = new THREE.PlaneGeometry(size, size, n - 1, n - 1);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const dirt = new Float32Array(n * n);
  const colors = new Float32Array(n * n * 3);
  const noise = createNoise2D(tintSeed);
  for (let k = 0; k < n * n; k++) {
    const x = pos.getX(k);
    const z = pos.getZ(k);
    // PlaneGeometry xếp đỉnh theo hàng từ -z tới +z
    const i = k % n;
    const j = Math.floor(k / n);
    const idx = j * n + i;
    let y = hf.h[idx];
    if (sink && sink(x, z)) y -= 6;
    pos.setY(k, y);
    dirt[k] = hf.dirt[idx];
    const v = fbm(noise, x * 0.012, z * 0.012, 3);
    const w = fbm(noise, x * 0.05 + 40, z * 0.05, 2);
    const tone = 0.86 + v * 0.16 + w * 0.05;
    colors[k * 3] = tone * (1 + v * 0.05);
    colors[k * 3 + 1] = tone;
    colors[k * 3 + 2] = tone * (0.95 - v * 0.04);
  }
  geo.setAttribute('aDirt', new THREE.BufferAttribute(dirt, 1));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}

/** Mặt nước sông, hào: phản chiếu bầu trời, gợn sóng theo thời gian. */
export function createWater(engine, { size = 3000, level = -0.6, color = 0x2c3a2b, distortion = 2.4 } = {}) {
  const normals = engine.texture('/3d/water/waternormals.jpg', { srgb: false });
  if (engine.qualityName === 'low') {
    // Máy yếu: không phản chiếu thời gian thực, chỉ dùng ánh sáng môi trường
    normals.repeat.set(size / 40, size / 40);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.08, metalness: 0.1, normalMap: normals, normalScale: new THREE.Vector2(0.4, 0.4) });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = level;
    engine.updaters.push((dt, t) => normals.offset.set(t * 0.01, t * 0.006));
    return plane;
  }
  const water = new Water(new THREE.PlaneGeometry(size, size), {
    textureWidth: engine.q.water,
    textureHeight: engine.q.water,
    waterNormals: normals,
    sunDirection: (engine.sunDir || new THREE.Vector3(0.4, 0.8, 0.2)).clone(),
    sunColor: 0xfff3e0,
    waterColor: color,
    distortionScale: distortion,
    fog: true,
    alpha: 1,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = level;
  water.material.uniforms.size.value = 6;
  engine.updaters.push((dt) => {
    water.material.uniforms.time.value += dt * 0.35;
  });
  return water;
}
