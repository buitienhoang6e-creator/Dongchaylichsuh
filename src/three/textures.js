import * as THREE from 'three';

/** Các ảnh vân vẽ bằng canvas (trống đồng, lá tre, cỏ, cờ, ngọn lửa…). */

function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c, { srgb = true, repeat = false } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Chim Lạc bay (giản lược theo hoa văn trống đồng): mỏ dài, mào, đuôi xòe. */
function lacBird(ctx, x, y, s, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(-4, -5, 6, -2); // lưng
  ctx.lineTo(22, -3); // mỏ dài
  ctx.lineTo(7, 1.5);
  ctx.quadraticCurveTo(-2, 5, -14, 3);
  ctx.closePath();
  ctx.fill();
  // cánh
  ctx.beginPath();
  ctx.moveTo(-4, -2);
  ctx.quadraticCurveTo(0, -14, 8, -15);
  ctx.quadraticCurveTo(3, -7, 3, -1);
  ctx.fill();
  // mào
  ctx.beginPath();
  ctx.moveTo(4, -3);
  ctx.quadraticCurveTo(2, -9, -3, -10);
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // đuôi
  ctx.beginPath();
  ctx.moveTo(-14, 1);
  ctx.lineTo(-22, -5);
  ctx.lineTo(-20, 1);
  ctx.lineTo(-23, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Mặt trống đồng: ngôi sao 14 cánh ở giữa, các vành hoa văn và đàn chim Lạc. */
export function drumFaceTexture(size = 1024) {
  const [c, ctx] = canvas(size);
  const cx = size / 2;
  const R = size / 2;
  // nền đồng
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, R);
  g.addColorStop(0, '#b48f55');
  g.addColorStop(0.7, '#8d6a3c');
  g.addColorStop(1, '#5d4526');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(40,25,10,0.75)';
  ctx.fillStyle = 'rgba(40,25,10,0.75)';

  const ring = (r, w = 2) => {
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  // ngôi sao 14 cánh
  const rays = 14;
  ctx.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const a = (i / (rays * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? R * 0.17 : R * 0.055;
    ctx.lineTo(cx + Math.cos(a) * r, cx + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(214,176,108,0.95)';
  ctx.fill();
  ctx.fillStyle = 'rgba(40,25,10,0.75)';
  for (let i = 0; i < rays; i++) {
    const a = ((i + 0.5) / rays) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * R * 0.07, cx + Math.sin(a) * R * 0.07);
    ctx.lineTo(cx + Math.cos(a - 0.08) * R * 0.15, cx + Math.sin(a - 0.08) * R * 0.15);
    ctx.lineTo(cx + Math.cos(a + 0.08) * R * 0.15, cx + Math.sin(a + 0.08) * R * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  // các vành hoa văn
  const bands = [0.19, 0.24, 0.28, 0.36, 0.4, 0.62, 0.66, 0.72, 0.78, 0.94, 0.98];
  bands.forEach((b) => ring(R * b, 2.2));
  // vòng tròn tiếp tuyến có chấm giữa
  const dots = (r0, r1, count) => {
    const rr = (r1 - r0) / 2.2;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const x = cx + Math.cos(a) * (r0 + r1) / 2;
      const y = cx + Math.sin(a) * (r0 + r1) / 2;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, rr * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  dots(R * 0.24, R * 0.28, 40);
  dots(R * 0.62, R * 0.66, 96);
  dots(R * 0.94, R * 0.98, 150);
  // vạch răng lược
  const comb = (r0, r1, count) => {
    ctx.lineWidth = 1.4;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cx + Math.sin(a) * r1);
      ctx.stroke();
    }
  };
  comb(R * 0.36, R * 0.4, 120);
  comb(R * 0.72, R * 0.78, 160);

  // vành cảnh sinh hoạt: nhà sàn, người múa (giản lược)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * R * 0.51, cx + Math.sin(a) * R * 0.51);
    ctx.rotate(a + Math.PI / 2);
    if (i % 2 === 0) {
      // nhà sàn mái cong
      ctx.beginPath();
      ctx.moveTo(-34, -6);
      ctx.quadraticCurveTo(0, -30, 34, -6);
      ctx.lineTo(28, -2);
      ctx.lineTo(-28, -2);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-20, -2, 40, 5);
      for (let k = -16; k <= 16; k += 8) ctx.fillRect(k, 3, 2.5, 12);
    } else {
      // người hóa trang lông chim đang múa
      for (let p = -2; p <= 2; p++) {
        ctx.save();
        ctx.translate(p * 13, 0);
        ctx.beginPath();
        ctx.arc(0, -10, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-1.5, -7, 3, 12);
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-6, -24);
        ctx.lineTo(3, -14);
        ctx.fill();
        ctx.fillRect(-5, -3, 10, 2);
        ctx.fillRect(-4, 5, 2, 8);
        ctx.fillRect(2, 5, 2, 8);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // đàn chim Lạc bay ngược chiều kim đồng hồ
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    lacBird(ctx, cx + Math.cos(a) * R * 0.86, cx + Math.sin(a) * R * 0.86, 1.45, a + Math.PI);
  }

  // gỉ đồng xanh, vết mòn
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * R;
    ctx.fillStyle = `rgba(${70 + Math.random() * 30},${110 + Math.random() * 40},${90 + Math.random() * 30},${0.05 + Math.random() * 0.12})`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r, cx + Math.sin(a) * r, 4 + Math.random() * 22, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c);
}

/** Thân trống: các băng hoa văn ngang và thuyền chở chiến binh (giản lược). */
export function drumBodyTexture(w = 1024, h = 512) {
  const [c, ctx] = canvas(w, h);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#9b7744');
  g.addColorStop(1, '#6a4f2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(40,25,10,0.7)';
  ctx.fillStyle = 'rgba(40,25,10,0.7)';
  ctx.lineWidth = 2;
  [0.08, 0.12, 0.42, 0.46, 0.62, 0.66].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(0, y * h);
    ctx.lineTo(w, y * h);
    ctx.stroke();
  });
  // thuyền
  for (let i = 0; i < 6; i++) {
    const x = (i + 0.5) * (w / 6);
    const y = h * 0.3;
    ctx.beginPath();
    ctx.moveTo(x - 70, y - 16);
    ctx.quadraticCurveTo(x - 60, y + 14, x, y + 12);
    ctx.quadraticCurveTo(x + 60, y + 14, x + 70, y - 22);
    ctx.lineTo(x + 60, y - 4);
    ctx.lineTo(x - 60, y - 2);
    ctx.closePath();
    ctx.fill();
    for (let p = -3; p <= 3; p++) {
      ctx.fillRect(x + p * 14 - 1, y - 24, 3, 22);
      ctx.beginPath();
      ctx.arc(x + p * 14, y - 26, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + p * 14, y - 28);
      ctx.lineTo(x + p * 14 - 6, y - 40);
      ctx.lineTo(x + p * 14 + 2, y - 30);
      ctx.fill();
    }
  }
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(${70 + Math.random() * 30},${115 + Math.random() * 40},${92 + Math.random() * 30},${0.04 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, 3 + Math.random() * 18, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = toTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** Thân tre: xanh ngả vàng, có đốt. Dùng lặp theo chiều dọc. */
export function bambooStalkTexture() {
  const [c, ctx] = canvas(128, 512);
  const g = ctx.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, '#5f7a2e');
  g.addColorStop(0.5, '#8aa04a');
  g.addColorStop(1, '#55702a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(${150 + Math.random() * 60},${150 + Math.random() * 40},60,${Math.random() * 0.12})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 512, 2 + Math.random() * 6, 20 + Math.random() * 80);
  }
  // đốt tre
  ctx.fillStyle = 'rgba(70,60,25,0.85)';
  ctx.fillRect(0, 0, 128, 7);
  ctx.fillStyle = 'rgba(220,210,150,0.5)';
  ctx.fillRect(0, 7, 128, 3);
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Cụm lá tre (có kênh trong suốt). */
export function bambooLeafTexture() {
  const [c, ctx] = canvas(512);
  ctx.clearRect(0, 0, 512, 512);
  const rnd = (a, b) => a + Math.random() * (b - a);
  for (let i = 0; i < 70; i++) {
    const x = rnd(40, 472);
    const y = rnd(40, 472);
    const a = rnd(-Math.PI, Math.PI);
    const len = rnd(70, 120);
    const wid = rnd(9, 15);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    const g = ctx.createLinearGradient(0, -wid, 0, wid);
    const hue = rnd(70, 95);
    g.addColorStop(0, `hsl(${hue}, 45%, ${rnd(22, 30)}%)`);
    g.addColorStop(0.5, `hsl(${hue}, 50%, ${rnd(32, 42)}%)`);
    g.addColorStop(1, `hsl(${hue}, 45%, ${rnd(20, 28)}%)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.4, -wid, len, 0);
    ctx.quadraticCurveTo(len * 0.4, wid, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,50,10,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len * 0.95, 0);
    ctx.stroke();
    ctx.restore();
  }
  return toTexture(c);
}

/** Ngọn cỏ cho thảm cỏ (có kênh trong suốt). */
export function grassBladeTexture() {
  const [c, ctx] = canvas(256);
  ctx.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 46; i++) {
    const x = 20 + Math.random() * 216;
    const h = 120 + Math.random() * 130;
    const bend = (Math.random() - 0.5) * 50;
    const w = 3 + Math.random() * 4;
    const hue = 72 + Math.random() * 28;
    const light = 34 + Math.random() * 18;
    const g = ctx.createLinearGradient(0, 256, 0, 256 - h);
    g.addColorStop(0, `hsl(${hue}, 40%, ${light * 0.6}%)`);
    g.addColorStop(1, `hsl(${hue + 6}, 45%, ${light + 12}%)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w, 256);
    ctx.quadraticCurveTo(x + bend * 0.5, 256 - h * 0.6, x + bend, 256 - h);
    ctx.quadraticCurveTo(x + bend * 0.5 + w * 0.3, 256 - h * 0.6, x + w, 256);
    ctx.closePath();
    ctx.fill();
  }
  return toTexture(c);
}

/** Lá cờ khởi nghĩa: nền đỏ, viền vàng, hình mặt trời Đông Sơn. */
export function bannerTexture({ base = '#9e1b17', trim = '#d9a73e' } = {}) {
  const [c, ctx] = canvas(512, 768);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 768);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 768, 1, 3 + Math.random() * 6);
  }
  ctx.strokeStyle = trim;
  ctx.lineWidth = 22;
  ctx.strokeRect(22, 22, 468, 724);
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, 416, 672);
  // mặt trời 14 tia
  ctx.fillStyle = trim;
  const cx = 256;
  const cy = 330;
  ctx.beginPath();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = i % 2 === 0 ? 120 : 46;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fill();
  // tua cờ
  ctx.fillStyle = trim;
  for (let x = 40; x < 480; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 740);
    ctx.lineTo(x + 14, 768);
    ctx.lineTo(x + 28, 740);
    ctx.fill();
  }
  return toTexture(c);
}

/** Ngọn lửa (dùng với sprite cộng sáng). */
export function flameTexture() {
  const [c, ctx] = canvas(128, 256);
  const g = ctx.createRadialGradient(64, 190, 4, 64, 160, 110);
  g.addColorStop(0, 'rgba(255,250,220,1)');
  g.addColorStop(0.25, 'rgba(255,200,90,0.95)');
  g.addColorStop(0.55, 'rgba(240,110,30,0.6)');
  g.addColorStop(1, 'rgba(120,30,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(64, 10);
  ctx.bezierCurveTo(100, 90, 120, 150, 110, 200);
  ctx.bezierCurveTo(100, 250, 28, 250, 18, 200);
  ctx.bezierCurveTo(8, 150, 28, 90, 64, 10);
  ctx.fill();
  return toTexture(c);
}

/** Đốm sương mù mềm (dùng cho các mảng sương sát mặt đất). */
export function mistTexture() {
  const [c, ctx] = canvas(256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(c);
}
