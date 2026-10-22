import Lenis from 'lenis';
import gsap from 'gsap';

gsap.config({ force3D: true }); // avoids GSAP toggling 2D/3D transforms, which re-rasterises layers

let lenis: Lenis | null = null;

/** One animation loop: Lenis is driven by the GSAP ticker so scroll and parallax never fight. */
export function startSmoothScroll(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
