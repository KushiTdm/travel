import { luminance } from '@/lib/contrast';

const ROWS = 36;
const COLS = 64;
// Same placement as Hero.tsx (top / height as a share of the scene).
const LAYERS: Array<{ src: string; top: number; height: number }> = [
  { src: '/hero/sky.webp', top: -0.03, height: 0.57 },
  { src: '/hero/p4.webp', top: 0, height: 1 },
  { src: '/hero/water.webp', top: 0.55, height: 0.45 },
  { src: '/hero/p3.webp', top: 0, height: 1 },
  { src: '/hero/p2.webp', top: 0, height: 1 },
  { src: '/hero/p1.webp', top: 0, height: 1 },
  { src: '/hero/boat.webp', top: 0, height: 1 },
];

let profile: Float32Array | null = null;
let loading: Promise<Float32Array> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Average relative luminance of each horizontal band of the composited hero scene
 * (index 0 = top). Measured from the real pixels so the navbar can pick a text
 * colour by contrast instead of guessing.
 */
export function loadHeroProfile(): Promise<Float32Array> {
  if (profile) return Promise.resolve(profile);
  loading ??= Promise.all(LAYERS.map((l) => loadImage(l.src))).then((imgs) => {
    const canvas = document.createElement('canvas');
    canvas.width = COLS;
    canvas.height = ROWS;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    imgs.forEach((img, i) => {
      ctx.drawImage(img, 0, ROWS * LAYERS[i].top, COLS, ROWS * LAYERS[i].height);
    });
    const data = ctx.getImageData(0, 0, COLS, ROWS).data;
    const out = new Float32Array(ROWS);
    for (let y = 0; y < ROWS; y++) {
      let sum = 0;
      for (let x = 0; x < COLS; x++) {
        const o = (y * COLS + x) * 4;
        sum += luminance(data[o], data[o + 1], data[o + 2]);
      }
      out[y] = sum / COLS;
    }
    profile = out;
    return out;
  });
  return loading;
}

export function heroLuminanceAt(fraction: number): number | null {
  if (!profile) return null;
  const i = Math.min(ROWS - 1, Math.max(0, Math.floor(fraction * ROWS)));
  return profile[i];
}
