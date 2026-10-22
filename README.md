# Beyond the Mekong — demo site

Portfolio demo built by [NeuraWeb](https://neuraweb.fr): a bilingual (FR/EN) website for a fictional boutique tour operator running small-group journeys through Vietnam, Cambodia and Laos.

## Run

```bash
npm install --legacy-peer-deps   # only if your npm complains about peer deps
npm run dev                      # http://localhost:5173
npm run build                    # production build
npm run typecheck && npm run lint
```

## Routes

| Route | Purpose |
| --- | --- |
| `/:lang` (`fr` / `en`) | Home |
| `/:lang/tours`, `/:lang/tours/:slug` | Catalogue, tour page (itinerary accordion, departures with status badges, live weather) |
| `/:lang/book/:slug` | 3-step enquiry form (react-hook-form + zod) and confirmation with WhatsApp link |
| `/:lang/contact`, `/:lang/faq`, `/:lang/about` | Contact form (saved as an inquiry, source `form`), 6 FAQ per language, about |
| `/admin` | Demo back-office: `demo@beyondthemekong.test` / `demo` (prefilled) |

## What is mocked

Everything. There is no database, no email (Brevo or other), no payment and no real booking.

- **Inquiries and admin session**: a Zustand store persisted in `localStorage` (key `btm-demo-store`). Open `/admin` in one tab and submit an inquiry in another: it appears instantly with a "New" badge (browser `storage` event).
- **Departures**: `src/data/departures.ts`. Dates are generated relative to today; status is computed (`few left` at 20% remaining or less, `full` at 0).
- **WhatsApp**: `wa.me` link prefilled with the reference, pointing to a fictional number (`src/config.ts`).
- **Reset demo**: the banner button clears the store and reloads.

What is real: tour itineraries are based on real routes published by regional operators and tourism boards, and the weather widget calls the free [Open-Meteo](https://open-meteo.com) API (no key). Prices are indicative. There are no invented reviews, testimonials or legal numbers.

## Going to production

All data access goes through [`src/lib/tourRepository.ts`](src/lib/tourRepository.ts). Replace its bodies (tours, departures) with real API/CMS calls; the pages and hooks do not change. Inquiries would move from the Zustand store to a backend endpoint plus email/CRM notification.

See [`docs/STRATEGY.md`](docs/STRATEGY.md) for the operator analysis, personas and site architecture.

## Immersive hero

`src/components/Hero.tsx`: a first-person view from a Vietnamese boat, in 7 layers (`public/hero/*.webp`). Plane 1 = boat, water, sky and the nearest cliffs; plane 2 = left karst cluster; plane 3 = tall pointed island; plane 4 = haze hills. No intro animation: all layers show at once and the 3D feel comes from mouse (and scroll) parallax. The only boat on the water is the foreground one: no houses or pontoons.

- **Rendering:** the whole scene is one WebGL canvas (`src/components/HeroScene.tsx`, no library). Water and sky use fragment shaders; every other layer is a textured quad. Do not rebuild it with stacked DOM layers: a dozen large, scaled, translated layers made Chromium drop compositor tiles while scrolling (flashing orange rectangles, fully documented in `docs/HERO_PARALLAX_STRATEGY.md`, section 9).
- **Parallax:** a pinhole-camera model (`src/lib/parallaxModel.ts`): each layer has a depth in metres; mouse = head sway with convergence, scroll = forward dolly from the vanishing point, water = ground plane resolved per pixel. Lenis smooth scroll runs on the GSAP ticker (`src/lib/smoothScroll.ts`).
- **Navbar:** glass from the start. Its text colour is chosen by measured WCAG contrast against the pixels behind it (`src/lib/heroLuminance.ts`, `src/lib/contrast.ts`); the ratio is exposed as `data-contrast` on the header.
- **Quality:** static grain and vignette overlay. Generated layers are 1024 px wide upscaled to 1920: replace them with higher-resolution renders before production.

Layers were generated from the base image and chroma-keyed: sources in `design/hero-source/`, script `scripts/cut-hero-layers.py` (`python3 -I scripts/cut-hero-layers.py design/hero-source public/hero`).

## Images

All visuals are generated, then prepared by `scripts/prepare-site-images.py` (`python3 -I scripts/prepare-site-images.py design/site-source public`):

- `public/images/tours/*.webp`, `destinations/*.webp`, `about.webp`: photographic covers (1600 px). Destination banners reuse the matching tour cover.
- `public/images/icons/*.webp` (travel styles, "why us") and `scenes/*.webp` ("who is it for"): flat illustrations, generated several to a sheet and cut apart with a flood-fill background removal.
- `public/og.jpg`: social preview, built from the hero image.

Covers are 1024 px sources upscaled to 1600 px: replace them with real photography before production.
