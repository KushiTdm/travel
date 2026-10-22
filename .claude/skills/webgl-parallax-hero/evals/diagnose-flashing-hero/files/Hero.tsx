import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LAYERS = [
  { id: 'sky', src: '/hero/sky.webp', speed: 0.3 },
  { id: 'far', src: '/hero/far.webp', speed: 0.2 },
  { id: 'water', src: '/hero/water.webp', speed: 0.09 },
  { id: 'islands', src: '/hero/islands.webp', speed: 0.12 },
  { id: 'cliffs', src: '/hero/cliffs.webp', speed: 0.09 },
  { id: 'boat', src: '/hero/boat.webp', speed: -0.04 },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      LAYERS.forEach((l) => {
        gsap.to(`[data-layer="${l.id}"]`, {
          yPercent: l.speed * 100,
          scale: l.id === 'cliffs' ? 1.5 : 1.05,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-screen w-screen overflow-hidden bg-[#1c1840]">
      {LAYERS.map((l) => (
        <img
          key={l.id}
          data-layer={l.id}
          src={l.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
      ))}
      <div className="absolute inset-0 bg-black/20" />
      <h1 className="relative z-10 text-5xl text-white">Follow the river</h1>
    </section>
  );
}
