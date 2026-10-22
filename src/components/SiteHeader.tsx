import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { RotateCcw } from 'lucide-react';
import { languages, type Language } from '@/i18n';
import { BRAND } from '@/config';
import { resetDemo } from '@/store/useDemoStore';
import { DARK_LUM, WHITE_LUM, contrastRatio, luminance, parseRgba } from '@/lib/contrast';
import { heroLuminanceAt, loadHeroProfile } from '@/lib/heroLuminance';
import { heroFlag } from '@/lib/heroFlags';

const navItems = [
  { key: 'home', to: '' },
  { key: 'destinations', to: 'destinations' },
  { key: 'tours', to: 'tours' },
  { key: 'about', to: 'about' },
  { key: 'faq', to: 'faq' },
  { key: 'contact', to: 'contact' },
  { key: 'admin', to: 'admin' },
] as const;

type Tone = 'light' | 'dark'; // text colour: light text on dark backgrounds and vice versa

/** Background luminance (0-1) under a point, ignoring the header itself, and whether it is the hero. */
function backgroundLuminanceAt(x: number, y: number, fixedStack: HTMLElement): { lum: number; hero: boolean } {
  for (const node of document.elementsFromPoint(x, y)) {
    if (fixedStack.contains(node)) continue;
    const hero = (node as HTMLElement).closest?.('[data-hero]') as HTMLElement | null;
    if (hero) {
      const r = hero.getBoundingClientRect();
      const lum = heroLuminanceAt((y - r.top) / r.height);
      if (lum != null) return { lum: lum * 0.8, hero: true }; // the hero has a dark scrim at the top
    }
    let cur: HTMLElement | null = node as HTMLElement;
    while (cur) {
      const c = parseRgba(getComputedStyle(cur).backgroundColor);
      if (c && c.a > 0.6) return { lum: luminance(c.r, c.g, c.b), hero: false };
      cur = cur.parentElement;
    }
  }
  return { lum: 1, hero: false };
}

interface Props {
  lang: Language;
  isHome: boolean;
  onLangChange: (l: Language) => void;
}

function SiteHeader({ lang, isHome, onLangChange }: Props) {
  const { t } = useTranslation();
  const nav = useRef<HTMLElement>(null);
  const [tone, setTone] = useState<Tone>(isHome ? 'light' : 'dark');
  const [ratio, setRatio] = useState(0);
  const [overHero, setOverHero] = useState(isHome);
  // At the very top of the home page the navbar is an invisible glass: no fill, no border, only a soft
  // dark gradient behind the items so the white text keeps its contrast over any sky. It gains its glass on scroll.
  const [scrolled, setScrolled] = useState(() => window.scrollY > 40);
  const atTop = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Measure the background under the navbar and pick the text colour with the better contrast.
  useEffect(() => {
    const header = nav.current;
    if (!header) return;
    let alive = true;
    let last = 0;
    let current: Tone = tone;

    const measure = () => {
      const r = header.getBoundingClientRect();
      const y = r.bottom - 4;
      const xs = [0.2, 0.5, 0.8].map((f) => window.innerWidth * f);
      const samples = xs.map((x) => backgroundLuminanceAt(x, y, header.parentElement ?? header));
      const bg = samples.reduce((a, p) => a + p.lum, 0) / samples.length;
      setOverHero(samples.some((p) => p.hero));
      const white = contrastRatio(bg, WHITE_LUM);
      const dark = contrastRatio(bg, DARK_LUM);
      // small hysteresis so the navbar does not flicker around the crossover
      const next: Tone = current === 'light' ? (dark > white + 0.6 ? 'dark' : 'light') : white > dark + 0.6 ? 'light' : 'dark';
      current = next;
      setTone(next);
      setRatio(Math.round(Math.max(next === 'light' ? white : dark, 0) * 10) / 10);
    };
    const tick = (time: number) => {
      if (!alive || time - last < 0.12) return;
      last = time;
      measure();
    };

    (isHome ? loadHeroProfile() : Promise.resolve()).then(() => {
      if (!alive) return;
      measure();
      gsap.ticker.add(tick);
    });
    return () => {
      alive = false;
      gsap.ticker.remove(tick);
    };
    // tone is read through `current`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome, lang]);

  const light = atTop || tone === 'light';

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="flex h-9 flex-wrap items-center justify-center gap-x-4 gap-y-1 overflow-hidden bg-primary-900 px-4 text-sm text-white">
        <span className="truncate">{t('banner')}</span>
        <button onClick={resetDemo} className="inline-flex shrink-0 items-center gap-1 rounded bg-white/15 px-2 py-0.5 font-medium hover:bg-white/25">
          <RotateCcw className="h-3.5 w-3.5" />
          {t('resetDemo')}
        </button>
      </div>

      <header
        ref={nav}
        data-tone={tone}
        data-contrast={ratio}
        className={`border-b transition-[background-color,border-color,color] duration-700 ease-out ${
          // backdrop-filter over the animated hero is a known Chromium flicker trigger: fake the glass there
          overHero || heroFlag('noblur') ? '' : 'backdrop-blur-md'
        } ${
          atTop ? '[text-shadow:0_1px_10px_rgba(0,0,0,0.5)]' : ''
        } ${atTop ? 'border-transparent [background-clip:padding-box] bg-gradient-to-b from-black/55 via-black/25 to-transparent text-white' : light ? (overHero ? 'border-white/15 bg-[#120c2a]/30 text-white' : 'border-white/15 bg-[#120c2a]/40 text-white') : 'border-surface-200 bg-white/85 text-[#14302d]'}`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <NavLink to={`/${lang}`} className="nav-in text-xl font-bold">
            {BRAND}
          </NavLink>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <nav className="flex flex-wrap gap-x-5 gap-y-1">
              {navItems.map((item, i) => (
                <NavLink
                  key={item.key}
                  style={{ animationDelay: `${0.25 + i * 0.07}s` }}
                  to={`/${lang}${item.to ? '/' + item.to : ''}`}
                  end={item.to === ''}
                  className={({ isActive }) =>
                    `nav-in border-b-2 text-sm font-medium transition-opacity hover:opacity-100 ${
                      isActive ? 'border-current opacity-100' : 'border-transparent opacity-80'
                    }`
                  }
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
            </nav>
            <NavLink
              to={`/${lang}/plan`}
              style={{ animationDelay: '0.85s' }}
              className={`nav-in rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                atTop
                  ? 'border border-white/60 bg-white/10 text-white hover:bg-white/20'
                  : light
                    ? 'bg-white text-primary-800 hover:bg-surface-100'
                    : 'bg-accent-600 text-white hover:bg-accent-700'
              }`}
            >
              {t('nav.plan')}
            </NavLink>
            <div className="nav-in flex gap-1 text-sm" style={{ animationDelay: '0.95s' }}>
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`rounded px-2 py-1 font-medium uppercase ${lang === l ? (light ? 'bg-white/20' : 'bg-accent-50 text-accent-700') : 'opacity-70 hover:opacity-100'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default SiteHeader;
