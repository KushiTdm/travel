import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { useCurrentLang } from '@/lib/useCurrentLang';
import { heroFlag } from '@/lib/heroFlags';
import { setHeroScene } from '@/lib/heroLuminance';
import { SCENE_ORDER, type SceneId } from '@/lib/heroScenes';
import HeroScene from '@/components/HeroScene';

function Hero() {
  const { t } = useTranslation();
  const lang = useCurrentLang();
  const root = useRef<HTMLElement>(null);
  const [scene, setScene] = useState<SceneId>('halong');
  // The button only enables once every scene is on the GPU, so a switch can never show a loading state.
  const [scenesReady, setScenesReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const nextScene = SCENE_ORDER[(SCENE_ORDER.indexOf(scene) + 1) % SCENE_ORDER.length];
  const nextLabel = t(`hero.next.${nextScene}`);

  const switchScene = () => {
    if (!scenesReady || busy) return;
    setScene(nextScene);
    setHeroScene(nextScene);
    setBusy(true);
    window.setTimeout(() => setBusy(false), 750);
  };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      // Atmosphere only: the scene itself (layers, water, sky) is drawn by <HeroScene>.
      gsap.to(q('[data-mist]'), { xPercent: 8, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 3 });
      gsap.fromTo(q('[data-bird]'), { xPercent: -20 }, { xPercent: 130, duration: 26, ease: 'none', repeat: -1, stagger: 5 });
      gsap.to(q('[data-bird]'), { y: -8, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3 });

      // Copy drifts up and fades while the hero scrolls away.
      const copy = q('[data-copy-wrap]')[0] as HTMLElement;
      const tick = () => {
        const h = el.offsetHeight;
        const sy = window.scrollY;
        if (sy > h * 1.1) return;
        copy.style.transform = `translate3d(0, ${(-sy * 0.25).toFixed(1)}px, 0)`;
        copy.style.opacity = String(Math.max(0, 1 - sy / (h * 0.6)));
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    }, el);

    return () => ctx.revert();
  }, []);

  const mistBase = 'pointer-events-none absolute left-[-10%] w-[120%]';

  return (
    <section
      ref={root}
      data-hero
      aria-label={t(`hero.alt.${scene}`)}
      className={`relative left-1/2 -ml-[50vw] h-[100svh] min-h-[600px] w-screen overflow-hidden bg-[#1c1840] ${
        heroFlag('nocontain') ? '' : '[contain:layout_paint]'
      }`}
    >
      <HeroScene className="absolute inset-0 h-full w-full" scene={scene} onAllReady={() => setScenesReady(true)} />

      {/* Atmosphere: soft gradients (no live blur filter) and birds. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div data-mist className={`${mistBase} top-[46%] h-[14%] bg-[radial-gradient(ellipse_at_center,rgba(255,214,170,0.2),transparent_68%)]`} />
        <div data-mist className={`${mistBase} top-[53%] h-[10%] bg-[radial-gradient(ellipse_at_center,rgba(255,190,150,0.14),transparent_68%)]`} />
        {[12, 18, 9].map((top, i) => (
          <svg key={i} data-bird viewBox="0 0 24 10" className="absolute h-3 w-7 text-[#2a1c3d]/70" style={{ top: `${top + i * 3}%`, left: `${10 + i * 8}%` }} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1 7 C 6 1, 10 1, 12 6 C 14 1, 18 1, 23 7" />
          </svg>
        ))}
      </div>

      {/* Contrast scrim, vignette and grain */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,6,30,0.4)_100%)]" aria-hidden="true" />
      {/* Plain (non-blended) grain tile: mix-blend-mode over animated layers is a known Chromium flicker trigger. */}
      {!heroFlag('nograin') && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'url(/hero/grain.png)', backgroundSize: '256px' }} aria-hidden="true" />
      )}

      <button
        type="button"
        onClick={switchScene}
        disabled={!scenesReady}
        aria-label={nextLabel}
        className="group absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center gap-2 rounded-full bg-black/35 py-2 pl-4 pr-2 text-sm font-medium text-white transition hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40 sm:right-6"
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRight className="h-6 w-6 transition group-hover:translate-x-0.5" />
      </button>

      <div data-copy-wrap className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-16 sm:pb-20">
        {/* One short line per country; keyed so the copy re-enters when the scene changes. */}
        <div key={scene} className="hero-copy">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/80">{t(`hero.scene.${scene}.eyebrow`)}</p>
          <h1 className="mt-3 max-w-[26rem] text-4xl font-semibold leading-tight text-white drop-shadow-md sm:text-5xl">{t(`hero.scene.${scene}.title`)}</h1>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={`/${lang}/plan`} className="rounded-lg bg-white px-6 py-3 font-medium text-primary-800 hover:bg-surface-100">{t('home.ctaContact')}</Link>
          <Link to={`/${lang}/tours`} className="rounded-lg border border-white/70 px-6 py-3 font-medium text-white hover:bg-white/10">{t('home.ctaTours')}</Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
