import { luminance } from '@/lib/contrast';

import { BOAT, SCENES, loadImage, type SceneId } from '@/lib/heroScenes';

const ROWS = 36;
const COLS = 64;

const profiles = new Map<SceneId, Float32Array>();
const loading = new Map<SceneId, Promise<Float32Array>>();
let current: SceneId = 'halong';

/**
 * Average relative luminance of each horizontal band of the composited hero scene
 * (index 0 = top). Measured from the real pixels so the navbar can pick a text
 * colour by contrast instead of guessing.
 */
function measure(scene: SceneId): Promise<Float32Array> {
  const cached = profiles.get(scene);
  if (cached) return Promise.resolve(cached);
  let p = loading.get(scene);
  if (!p) {
    const layers = [...SCENES[scene], BOAT];
    p = Promise.all(layers.map((l) => loadImage(l.src))).then((imgs) => {
      const canvas = document.createElement('canvas');
      canvas.width = COLS;
      canvas.height = ROWS;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      imgs.forEach((img, i) => {
        const [x, y, w, h] = layers[i].rect;
        ctx.drawImage(img, COLS * x, ROWS * y, COLS * w, ROWS * h);
      });
      const data = ctx.getImageData(0, 0, COLS, ROWS).data;
      const out = new Float32Array(ROWS);
      for (let r = 0; r < ROWS; r++) {
        let sum = 0;
        for (let c = 0; c < COLS; c++) {
          const o = (r * COLS + c) * 4;
          sum += luminance(data[o], data[o + 1], data[o + 2]);
        }
        out[r] = sum / COLS;
      }
      profiles.set(scene, out);
      return out;
    });
    loading.set(scene, p);
  }
  return p;
}

export function loadHeroProfile(): Promise<Float32Array> {
  return measure(current);
}

/** Switch the profile the navbar reads; the old one stays active until the new one is measured. */
export function setHeroScene(scene: SceneId): void {
  void measure(scene).then(() => {
    current = scene;
  });
}

export function heroLuminanceAt(fraction: number): number | null {
  const profile = profiles.get(current);
  if (!profile) return null;
  const i = Math.min(ROWS - 1, Math.max(0, Math.floor(fraction * ROWS)));
  return profile[i];
}
