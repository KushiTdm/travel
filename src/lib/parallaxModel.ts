/**
 * Pinhole-camera model behind the hero parallax. Every layer sits at a depth Z (metres) in
 * front of a virtual camera on a small boat; the camera sways a few centimetres with the
 * mouse and glides forward with the scroll. All shifts below are the exact projection of
 * that motion, in units of scene width (multiply by the scene's pixel width).
 *
 * Camera pose: dx right, dy up, dz forward (metres). Image x grows right, y grows down.
 */

/** Horizontal field of view. */
export const FOV_DEG = 68;
/** Focal length in scene widths: f / W = 1 / (2 tan(FOV / 2)). */
export const K = 1 / (2 * Math.tan((FOV_DEG * Math.PI) / 360));

/** Eye height above the water. */
export const CAMERA_HEIGHT = 1.4;
/** Depth the eyes converge on while swaying (the camera toes in toward it). */
export const FIXATION_Z = 35;
/** Horizon row and vanishing point, as shares of the scene. */
export const HORIZON_Y = 0.55;
export const VANISH_X = 0.5;

/** Head sway reached at the screen edge, in metres. Art-directed: the far layers travel 5-8 px and the boat about 20 px. */
export const SWAY_X = 0.25;
export const SWAY_Y = 0.12;
/** Forward travel at the end of the hero scroll, in metres. */
export const DOLLY_MAX = 10;

/** Depth of each layer, in metres. The sky is effectively at infinity. */
export const DEPTH = {
  sky: 5000,
  p4: 450, // haze hills
  p3: 150, // tall pointed island
  p2: 80, // left karst cluster
  p1: 30, // nearest framing cliffs
  boat: 10, // the deck, attached to the camera rig: art-directed deeper than its true ~4 m so it sways gently
} as const;

export type LayerId = keyof typeof DEPTH;

/**
 * Lateral shift of a point at depth z for a camera sway dx while converging on FIXATION_Z:
 * du = f * dx * (1/Zf - 1/Z). Layers nearer than Zf slide one way, farther ones the other.
 */
export function lateralShift(dx: number, z: number): number {
  return K * dx * (1 / FIXATION_Z - 1 / z);
}

/** Same law for the vertical sway (positive dy = camera up, image y grows down). */
export function verticalShift(dy: number, z: number): number {
  return K * dy * (1 / z - 1 / FIXATION_Z);
}

/**
 * Forward travel dz expands the image radially from the vanishing point: s = Z / (Z - dz).
 * A point's displacement is (x - vp) * (s - 1): the farther from the vanishing point, the more it moves.
 */
export function dollyScale(z: number, dz: number): number {
  return z / Math.max(z - dz, 0.5);
}

/**
 * The boat rocks: the camera is bolted to it, so the world seems to pitch slightly.
 * Pitch shifts every depth equally (a rotation has no parallax); heave shifts by f * dh / Z.
 * Roll is left out on purpose: turning large alpha layers by a changing fraction of a degree
 * every frame makes thin edges shimmer.
 */
export function rockingShift(t: number, z: number): number {
  const pitch = 0.0016 * Math.sin((2 * Math.PI * t) / 6.2);
  const heave = 0.03 * Math.sin((2 * Math.PI * t) / 4.6 + 1);
  return K * (pitch + (Number.isFinite(z) ? heave / z : 0));
}
