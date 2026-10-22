/** WCAG 2.x relative luminance and contrast helpers. */
export function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(r: number, g: number, b: number): number {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(l1: number, l2: number): number {
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export const WHITE_LUM = 1;
/** Luminance of the dark text colour used on light backgrounds (#14302d). */
export const DARK_LUM = luminance(0x14, 0x30, 0x2d);

export function parseRgba(css: string): { r: number; g: number; b: number; a: number } | null {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = '1'] = m[1].split(/[,\s/]+/).filter(Boolean);
  return { r: +r, g: +g, b: +b, a: +a };
}
