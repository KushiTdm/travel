import { DEPTH, HORIZON_Y } from '@/lib/parallaxModel';

/**
 * Hero scenes. Each scene is a back-to-front stack of layers; the boat is shared and always drawn last,
 * so changing scene only swaps the scenery around the same boat. Every scene must put its waterline on
 * HORIZON_Y: scenes whose source image has another horizon are scaled about it through `rect`.
 */
export type SceneId = 'halong' | 'cambodia' | 'laos';
export type LayerKind = 'sky' | 'image' | 'water';

export interface HeroLayer {
  id: string;
  src: string;
  kind: LayerKind;
  /** Depth in metres (see parallaxModel.ts). */
  z: number;
  /** Placement in the scene: left, top, width, height as shares. */
  rect: [number, number, number, number];
}

/** Scene height / width, from the 1920x1072 layers. */
export const SCENE_RATIO = 1072 / 1920;

export const BOAT: HeroLayer = { id: 'boat', src: '/hero/boat.webp', kind: 'image', z: DEPTH.boat, rect: [0, 0, 1, 1] };

const FULL: HeroLayer['rect'] = [0, 0, 1, 1];
/** Cambodia source: waterline at 50 %, scaled 1.1x about it so it lands on HORIZON_Y and still covers the top edge. */
const KH: HeroLayer['rect'] = [-0.05, 0, 1.1, 1.1];

/** Laos source: waterline at 49.5 %, same 1.1x scale about it. */
const LA: HeroLayer['rect'] = [-0.05, 0.0055, 1.1, 1.1];

export const SCENES: Record<SceneId, HeroLayer[]> = {
  halong: [
    { id: 'sky', src: '/hero/sky.webp', kind: 'sky', z: DEPTH.sky, rect: [0, -0.03, 1, 0.57] },
    { id: 'p4', src: '/hero/p4.webp', kind: 'image', z: DEPTH.p4, rect: FULL },
    { id: 'water', src: '/hero/water.webp', kind: 'water', z: 0, rect: [0, HORIZON_Y, 1, 1 - HORIZON_Y] },
    { id: 'p3', src: '/hero/p3.webp', kind: 'image', z: DEPTH.p3, rect: FULL },
    { id: 'p2', src: '/hero/p2.webp', kind: 'image', z: DEPTH.p2, rect: FULL },
    { id: 'p1', src: '/hero/p1.webp', kind: 'image', z: DEPTH.p1, rect: FULL },
  ],
  cambodia: [
    // The sun sits at 74 % of the sky plate: placed so it ends up beside the temple, above the horizon.
    { id: 'sky', src: '/hero/kh/sky.webp', kind: 'sky', z: DEPTH.sky, rect: [-0.023, -0.296, 1.3, 0.846] },
    { id: 'water', src: '/hero/kh/water.webp', kind: 'water', z: 0, rect: [0, HORIZON_Y, 1, 1 - HORIZON_Y] },
    { id: 'p3', src: '/hero/kh/p3.webp', kind: 'image', z: DEPTH.p3, rect: KH },
    { id: 'p2', src: '/hero/kh/p2.webp', kind: 'image', z: DEPTH.p2, rect: KH },
    { id: 'p1', src: '/hero/kh/p1.webp', kind: 'image', z: DEPTH.p1, rect: KH },
  ],
  laos: [
    // The sun sits at 50 % of the sky plate, whose top edge is extended in the file (cut-hero-layers-laos.py).
    { id: 'sky', src: '/hero/la/sky.webp', kind: 'sky', z: DEPTH.sky, rect: [-0.041, -0.05, 1.1, 0.6] },
    { id: 'p4', src: '/hero/la/p4.webp', kind: 'image', z: DEPTH.p4, rect: LA },
    { id: 'water', src: '/hero/la/water.webp', kind: 'water', z: 0, rect: [0, HORIZON_Y, 1, 1 - HORIZON_Y] },
    { id: 'p3', src: '/hero/la/p3.webp', kind: 'image', z: DEPTH.p3, rect: LA },
    // The framing trees on the right bank are shared with the Cambodia scene.
    { id: 'p1', src: '/hero/kh/p1.webp', kind: 'image', z: DEPTH.p1, rect: KH },
  ],
};

export const SCENE_ORDER: SceneId[] = ['halong', 'cambodia', 'laos'];

export function sceneSources(id: SceneId): string[] {
  return SCENES[id].map((l) => l.src);
}

/** Decoded images, shared by the renderer and the navbar luminance probe. */
const images = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = images.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    }).then(async (img) => {
      // Decode now, off the render path, so the later texture upload cannot hitch a frame.
      await img.decode?.().catch(() => undefined);
      return img;
    });
    images.set(src, p);
  }
  return p;
}
