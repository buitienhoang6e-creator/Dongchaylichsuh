import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/** Chỉnh màu sau cùng: độ bão hòa, tương phản, ấm/lạnh, tối góc ảnh. */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uSat: { value: 1 },
    uContrast: { value: 1 },
    uWarm: { value: 0 },
    uVignette: { value: 0.25 },
    uLift: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uSat, uContrast, uWarm, uVignette, uLift; varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, uSat);
      col = (col - 0.5) * uContrast + 0.5 + uLift;
      col *= vec3(1.0 + uWarm, 1.0 + uWarm * 0.25, 1.0 - uWarm);
      float d = distance(vUv, vec2(0.5));
      col *= 1.0 - uVignette * smoothstep(0.3, 0.85, d);
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), c.a);
    }`,
};
import { MapNavControls, WalkControls } from './controls.js';

/** Đoán cấu hình máy để chọn mức chất lượng phù hợp. */
export function detectQuality() {
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (mobile) return 'low';
  if (cores <= 4) return 'medium';
  return 'high';
}

export const QUALITY = {
  low: { pixelRatio: 1.25, shadows: false, shadowSize: 1024, terrainStep: 2, grass: 0.25, trees: 0.45, water: 256 },
  medium: { pixelRatio: 1.25, shadows: true, shadowSize: 2048, terrainStep: 1.5, grass: 0.6, trees: 0.75, water: 512 },
  high: { pixelRatio: 1.75, shadows: true, shadowSize: 4096, terrainStep: 1.15, grass: 1, trees: 1, water: 512 },
};

/**
 * Bộ máy dựng cảnh dùng chung cho mọi mô phỏng.
 */
export class Engine {
  constructor(container, { quality = detectQuality(), onProgress } = {}) {
    this.container = container;
    this.qualityName = quality;
    this.q = QUALITY[quality];
    this.clock = new THREE.Clock();
    this.updaters = [];
    this.disposables = [];
    this.hotspots = [];
    this.onFrame = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.q.pixelRatio));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = this.q.shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    renderer.domElement.classList.add('sim-canvas');
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 6000);

    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, loaded, total) => onProgress?.(loaded / Math.max(1, total));
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.gltfLoader = new GLTFLoader(this.manager);
    this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    this.rgbeLoader = new RGBELoader(this.manager);
    this.texCache = new Map();
    this.gltfCache = new Map();
    this.maxAniso = renderer.capabilities.getMaxAnisotropy();

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this._ro = new ResizeObserver(this._onResize);
    this._ro.observe(container);
  }

  /** mode: 'map' (kéo như Google Maps, mặc định) hoặc 'walk' (đi bộ góc nhìn người). */
  createControls(opts, mode = 'map') {
    this._ctlOpts = opts;
    this.controlMode = mode;
    const dom = this.renderer.domElement;
    this.controls = mode === 'walk' ? new WalkControls(this.camera, dom, opts) : new MapNavControls(this.camera, dom, opts);
    return this.controls;
  }

  /** Đổi chế độ điều khiển, giữ nguyên chỗ đang nhìn. */
  setControlMode(mode) {
    const old = this.controls;
    if (!old || mode === this.controlMode) return old;
    const dom = this.renderer.domElement;
    let next;
    if (mode === 'walk') {
      const focus = old.focus.clone();
      const h = old.heading;
      const back = THREE.MathUtils.clamp(old.cur.dist * 0.35, 14, 36);
      old.dispose();
      next = new WalkControls(this.camera, dom, this._ctlOpts);
      const cam = this.camera.position;
      next.lift = Math.max(0, cam.y - next.heightAt(cam.x, cam.z) - next.eye);
      next.lookAt(focus);
      // "thả người" xuống mặt đất, lùi lại một đoạn so với chỗ đang nhìn để vẫn thấy rõ nó
      const sx = focus.x + Math.sin(h) * back;
      const sz = focus.z + Math.cos(h) * back;
      next.travel({ x: sx, z: sz, lift: 0, target: { x: focus.x, y: focus.y + 2, z: focus.z }, fov: 58 });
    } else {
      old.dispose();
      next = new MapNavControls(this.camera, dom, this._ctlOpts);
      next.fromCamera(this.camera);
    }
    next.onInteract = old.onInteract;
    this.controls = next;
    this.controlMode = mode;
    return next;
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Hậu kỳ (chỉ bật ở máy trung bình/mạnh): tỏa sáng quanh lửa, mặt trời và chỉnh màu theo không khí cảnh.
   * bloom: { strength, radius, threshold }; grade: { sat, contrast, warm, vignette, lift }.
   */
  post({ bloom, grade } = {}) {
    if (this.qualityName === 'low') return;
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    const target = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(this.renderer, target);
    composer.setPixelRatio(this.renderer.getPixelRatio());
    composer.setSize(w, h);
    composer.addPass(new RenderPass(this.scene, this.camera));
    if (bloom) composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), bloom.strength ?? 0.35, bloom.radius ?? 0.6, bloom.threshold ?? 0.9));
    composer.addPass(new OutputPass());
    if (grade) {
      const g = new ShaderPass(GradeShader);
      g.uniforms.uSat.value = grade.sat ?? 1;
      g.uniforms.uContrast.value = grade.contrast ?? 1;
      g.uniforms.uWarm.value = grade.warm ?? 0;
      g.uniforms.uVignette.value = grade.vignette ?? 0.25;
      g.uniforms.uLift.value = grade.lift ?? 0;
      composer.addPass(g);
    }
    this.composer = composer;
    this.disposables.push(composer, target);
  }

  /** Nạp ảnh vân, có lặp lại (repeat) và lọc bất đẳng hướng cho sắc nét. */
  texture(url, { srgb = true, repeat = [1, 1] } = {}) {
    const key = `${url}|${srgb}|${repeat}`;
    if (this.texCache.has(key)) return this.texCache.get(key);
    const t = this.textureLoader.load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = this.maxAniso;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    this.texCache.set(key, t);
    return t;
  }

  /** Bộ vân PBR của Poly Haven: diff + nor + rough (hoặc arm). */
  pbr(name, repeat = [1, 1], extra = {}) {
    const base = `/3d/tex/${name}`;
    return new THREE.MeshStandardMaterial({
      map: this.texture(`${base}/diff.jpg`, { repeat }),
      normalMap: this.texture(`${base}/nor.jpg`, { srgb: false, repeat }),
      roughnessMap: this.texture(`${base}/rough.jpg`, { srgb: false, repeat }),
      roughness: 1,
      metalness: 0,
      ...extra,
    });
  }

  async gltf(url) {
    if (!this.gltfCache.has(url)) this.gltfCache.set(url, this.gltfLoader.loadAsync(url));
    return this.gltfCache.get(url);
  }

  /** Nạp mô hình có thể không tồn tại (ví dụ mô hình tải từ Sketchfab) — trả về null nếu thiếu. */
  async optionalGltf(url) {
    try {
      const head = await fetch(url, { method: 'HEAD' });
      const type = head.headers.get('content-type') || '';
      if (!head.ok || type.includes('text/html')) return null;
      return await this.gltf(url);
    } catch {
      return null;
    }
  }

  /**
   * Bầu trời HDR: làm nền và nguồn sáng môi trường.
   * Tự tìm hướng mặt trời trong ảnh để đặt nguồn sáng trùng khớp.
   */
  async sky(url, { intensity = 1, bgIntensity = 1, sunIntensity = 3, sunColor = 0xfff1dc } = {}) {
    // Dùng số thực nửa độ chính xác (HalfFloat): điện thoại (đặc biệt iPhone) thường không lọc mượt được
    // ảnh số thực 32-bit, khiến bầu trời và ánh sáng môi trường bị đen.
    this.rgbeLoader.setDataType(THREE.HalfFloatType);
    const hdr = await this.rgbeLoader.loadAsync(url);
    hdr.mapping = THREE.EquirectangularReflectionMapping;

    // tìm điểm sáng nhất = mặt trời
    const { data, width, height } = hdr.image;
    const val = data instanceof Uint16Array ? (k) => THREE.DataUtils.fromHalfFloat(data[k]) : (k) => data[k];
    let best = 0;
    let bx = 0;
    let by = 0;
    for (let y = 0; y < height / 2; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const l = val(i) * 0.2126 + val(i + 1) * 0.7152 + val(i + 2) * 0.0722;
        if (l > best) {
          best = l;
          bx = x;
          by = y;
        }
      }
    }
    const u = bx / width;
    const v = by / height;
    const phi = u * Math.PI * 2;
    const theta = v * Math.PI;
    // quy ước equirect của three.js: u = atan2(z, x)/2π + 0.5 ; dòng ảnh trên cùng = hướng lên trời
    this.sunDir = new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), -Math.sin(phi) * Math.sin(theta)).normalize();
    if (this.sunDir.y < 0.15) this.sunDir.y = 0.15;
    this.sunDir.normalize();

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromEquirectangular(hdr).texture;
    pmrem.dispose();
    this.scene.environment = env;
    this.scene.background = hdr;
    this.scene.environmentIntensity = intensity;
    this.scene.backgroundIntensity = bgIntensity;
    this.disposables.push(hdr, env);

    const sun = new THREE.DirectionalLight(sunColor, sunIntensity);
    sun.castShadow = this.q.shadows;
    sun.shadow.mapSize.set(this.q.shadowSize, this.q.shadowSize);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.6;
    const s = 130;
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 900 });
    this.scene.add(sun, sun.target);
    this.sun = sun;
    this.updaters.push(() => {
      // bóng đổ đi theo chỗ đang nhìn (bản đồ) hoặc người xem (đi bộ) để luôn sắc nét ở gần
      const c = this.controls?.focus || this.camera.position;
      const snap = 8;
      const cx = Math.round(c.x / snap) * snap;
      const cz = Math.round(c.z / snap) * snap;
      sun.target.position.set(cx, 0, cz);
      sun.position.set(cx + this.sunDir.x * 400, this.sunDir.y * 400, cz + this.sunDir.z * 400);
    });
    return { sun, sunDir: this.sunDir };
  }

  addHotspot(h) {
    this.hotspots.push({ ...h, pos: new THREE.Vector3(h.x, h.y, h.z) });
  }

  /** Tính vị trí trên màn hình của các điểm chú thích (để vẽ nút HTML đè lên). */
  projectHotspots() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const v = new THREE.Vector3();
    const camPos = this.camera.position;
    return this.hotspots.map((s) => {
      v.copy(s.pos).project(this.camera);
      const dist = camPos.distanceTo(s.pos);
      const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1 && dist < (s.maxDist || 700);
      return { id: s.id, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible, dist };
    });
  }

  start() {
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, this.clock.getDelta());
      const t = this.clock.elapsedTime;
      this.controls?.update(dt);
      this._thinFogAloft();
      for (const u of this.updaters) u(dt, t);
      if (this.composer) this.composer.render(dt);
      else this.renderer.render(this.scene, this.camera);
      this.onFrame?.(dt, t);
    };
    loop();
  }

  /** Lên cao nhìn toàn cảnh thì sương mỏng đi, để thấy rõ cả khu vực như ảnh vệ tinh. */
  _thinFogAloft() {
    const fog = this.scene.fog;
    if (!fog?.isFogExp2) return;
    if (this._fog0 == null) this._fog0 = fog.density;
    const c = this.camera.position;
    const ground = this.controls?.heightAt ? this.controls.heightAt(c.x, c.z) : 0;
    const h = c.y - ground;
    fog.density = this._fog0 * THREE.MathUtils.clamp(40 / Math.max(40, h), 0.3, 1);
  }

  screenshot() {
    if (this.composer) this.composer.render(0);
    else this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/jpeg', 0.9);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    this._ro.disconnect();
    this.controls?.dispose();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          for (const k of Object.keys(m)) if (m[k]?.isTexture) m[k].dispose();
          m.dispose();
        }
      }
    });
    for (const d of this.disposables) d.dispose?.();
    this.texCache.forEach((t) => t.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    this.renderer.domElement.remove();
  }
}
