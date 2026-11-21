import * as THREE from 'three';
import { mulberry32 } from '../noise.js';

/**
 * VÂN VẼ BẰNG CANVAS cho cảnh thời nguyên thủy (da người, lông, tóc, da thú, vải vỏ cây,
 * lá cây có viền trong suốt, khói). Không cần tải ảnh ngoài.
 */

function make(w, h, draw, { srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

const cache = new Map();
const once = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
};

/** Da người: lốm đốm rất nhẹ, nhân với màu da của vật liệu. */
export const skinTex = () =>
  once('skin', () =>
    make(256, 256, (ctx, w, h) => {
      const r = mulberry32(3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        const v = 200 + r() * 55;
        ctx.fillStyle = `rgba(${v},${v * 0.86},${v * 0.8},${0.05 + r() * 0.08})`;
        const s = 1 + r() * 4;
        ctx.fillRect(r() * w, r() * h, s, s);
      }
    }),
  );

/** Lông thưa trên người tối cổ: nhiều nét ngắn sẫm màu. */
export const hairyTex = () =>
  once('hairy', () =>
    make(256, 256, (ctx, w, h) => {
      const r = mulberry32(5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3200; i++) {
        const x = r() * w;
        const y = r() * h;
        const a = Math.PI / 2 + (r() - 0.5) * 0.9;
        const l = 3 + r() * 7;
        ctx.strokeStyle = `rgba(40,24,14,${0.18 + r() * 0.3})`;
        ctx.lineWidth = 0.6 + r() * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
    }),
  );

/** Sợi tóc chạy dọc. */
export const hairTex = () =>
  once('hair', () =>
    make(256, 256, (ctx, w, h) => {
      const r = mulberry32(7);
      ctx.fillStyle = '#9a9a9a';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        const x = r() * w;
        const v = r() < 0.5 ? 40 + r() * 40 : 170 + r() * 80;
        ctx.strokeStyle = `rgba(${v},${v},${v},0.55)`;
        ctx.lineWidth = 0.5 + r();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + (r() - 0.5) * 12, h * 0.33, x + (r() - 0.5) * 12, h * 0.66, x + (r() - 0.5) * 8, h);
        ctx.stroke();
      }
    }),
  );

/** Da thú thuộc: loang lổ, có vết nhăn. */
export const hideTex = () =>
  once('hide', () =>
    make(256, 256, (ctx, w, h) => {
      const r = mulberry32(9);
      ctx.fillStyle = '#c9ab86';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        const x = r() * w;
        const y = r() * h;
        const rad = 10 + r() * 40;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `rgba(90,60,35,${0.15 + r() * 0.2})`);
        g.addColorStop(1, 'rgba(90,60,35,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 90; i++) {
        ctx.strokeStyle = `rgba(70,45,25,${0.1 + r() * 0.15})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const x = r() * w;
        const y = r() * h;
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 30, x + (r() - 0.5) * 40, y + (r() - 0.5) * 40);
        ctx.stroke();
      }
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = `rgba(60,40,20,${r() * 0.08})`;
        ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
    }),
  );

/** Vải vỏ cây đập mỏng: thớ ngang; `ochre` thêm dải hoa văn màu son (thổ hoàng). */
export const barkClothTex = (ochre = false) =>
  once(`bark${ochre}`, () =>
    make(256, 256, (ctx, w, h) => {
      const r = mulberry32(ochre ? 13 : 11);
      ctx.fillStyle = '#d2b98e';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const y = r() * h;
        const v = r() < 0.5 ? 'rgba(120,90,55,' : 'rgba(240,225,195,';
        ctx.strokeStyle = `${v}${0.12 + r() * 0.25})`;
        ctx.lineWidth = 0.6 + r() * 1.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(w * 0.33, y + (r() - 0.5) * 6, w * 0.66, y + (r() - 0.5) * 6, w, y + (r() - 0.5) * 4);
        ctx.stroke();
      }
      if (ochre) {
        // dải răng cưa và chấm màu son gần mép váy (phía dưới vân)
        ctx.fillStyle = 'rgba(150,52,30,0.85)';
        ctx.fillRect(0, h * 0.06, w, h * 0.05);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 16) {
          ctx.lineTo(x, h * 0.13);
          ctx.lineTo(x + 8, h * 0.21);
        }
        ctx.lineTo(w, h * 0.13);
        ctx.strokeStyle = 'rgba(150,52,30,0.85)';
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let x = 8; x < w; x += 16) {
          ctx.beginPath();
          ctx.arc(x, h * 0.27, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }),
  );

/** Lông thú (chó, hươu): nét lông ngắn. */
export const furTex = () =>
  once('fur', () =>
    make(256, 256, (ctx, w, h) => {
      const r = mulberry32(17);
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 4500; i++) {
        const x = r() * w;
        const y = r() * h;
        const v = r() < 0.5 ? 90 + r() * 60 : 220 + r() * 35;
        ctx.strokeStyle = `rgba(${v},${v},${v},0.45)`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 2, y + 4 + r() * 5);
        ctx.stroke();
      }
    }),
  );

function leafShape(ctx, w, h, { base, edge, midrib, veins = 9, torn = 0, heart = false, r }) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  if (heart) {
    // lá hình tim (khoai môn, ráy)
    ctx.moveTo(w / 2, h * 0.98);
    ctx.bezierCurveTo(w * 0.05, h * 0.7, w * 0.0, h * 0.2, w * 0.3, h * 0.08);
    ctx.bezierCurveTo(w * 0.42, h * 0.02, w * 0.48, h * 0.12, w / 2, h * 0.22);
    ctx.bezierCurveTo(w * 0.52, h * 0.12, w * 0.58, h * 0.02, w * 0.7, h * 0.08);
    ctx.bezierCurveTo(w, h * 0.2, w * 0.95, h * 0.7, w / 2, h * 0.98);
  } else {
    ctx.moveTo(w / 2, h * 0.01);
    ctx.bezierCurveTo(w * 0.98, h * 0.2, w * 0.98, h * 0.75, w / 2, h * 0.99);
    ctx.bezierCurveTo(w * 0.02, h * 0.75, w * 0.02, h * 0.2, w / 2, h * 0.01);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, edge);
  g.addColorStop(0.5, base);
  g.addColorStop(1, edge);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = midrib;
  ctx.lineWidth = Math.max(2, w * 0.03);
  ctx.beginPath();
  ctx.moveTo(w / 2, heart ? h * 0.22 : 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, w * 0.01);
  for (let i = 1; i <= veins; i++) {
    const y = (i / (veins + 1)) * h;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(w / 2, y);
      ctx.quadraticCurveTo(w / 2 + s * w * 0.25, y - h * 0.03, w / 2 + s * w * 0.5, y - h * 0.08);
      ctx.stroke();
    }
  }
  // vết rách (lá chuối)
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < torn; i++) {
    const y = r() * h * 0.9 + h * 0.05;
    const s = r() < 0.5 ? -1 : 1;
    ctx.lineWidth = 1.5 + r() * 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 + s * w * (0.06 + r() * 0.1), y);
    ctx.lineTo(w / 2 + s * w * 0.55, y - h * 0.06);
    ctx.stroke();
  }
  ctx.restore();
}

/** Lá xanh dài (lá cây rừng, lá chuối non…). */
export const leafTex = () => once('leaf', () => make(128, 384, (ctx, w, h) => leafShape(ctx, w, h, { base: '#5d8a3a', edge: '#35592a', midrib: 'rgba(200,220,150,0.6)', r: mulberry32(1) })));
/** Lá khô vàng nâu dùng lợp lều. */
export const dryLeafTex = () => once('dry', () => make(128, 384, (ctx, w, h) => leafShape(ctx, w, h, { base: '#b39258', edge: '#7d6238', midrib: 'rgba(240,220,170,0.5)', r: mulberry32(2) })));
/** Lá chuối có vết rách. */
export const bananaLeafTex = () => once('banana', () => make(128, 512, (ctx, w, h) => leafShape(ctx, w, h, { base: '#6c9a3c', edge: '#3f6a2a', midrib: 'rgba(220,235,160,0.8)', veins: 18, torn: 14, r: mulberry32(4) })));
/** Lá hình tim (khoai môn, ráy). */
export const heartLeafTex = () => once('heart', () => make(256, 256, (ctx, w, h) => leafShape(ctx, w, h, { base: '#4f7f34', edge: '#2f5222', midrib: 'rgba(200,225,160,0.6)', veins: 6, heart: true, r: mulberry32(6) })));

/** Đốm khói mềm. */
export const smokeTex = () =>
  once('smoke', () =>
    make(
      128,
      128,
      (ctx, w, h) => {
        const r = mulberry32(21);
        for (let i = 0; i < 14; i++) {
          const x = w / 2 + (r() - 0.5) * w * 0.35;
          const y = h / 2 + (r() - 0.5) * h * 0.35;
          const rad = w * (0.18 + r() * 0.2);
          const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
          g.addColorStop(0, 'rgba(255,255,255,0.22)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }
      },
      { srgb: true },
    ),
  );
