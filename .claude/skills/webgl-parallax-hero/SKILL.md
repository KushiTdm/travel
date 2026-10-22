---
name: webgl-parallax-hero
description: Build an immersive full-screen hero from one AI-generated image cut into depth layers (sky, water, island planes, foreground) and rendered in a single WebGL canvas, with physically based mouse and scroll parallax. Use this whenever the user asks for a "hero immersif", layered or 3D-looking parallax, an "effet 3D à la souris", an animated GSAP/WebGL hero, a scene cut from a generated image into layers, a Ken-Burns-but-better landing hero, or a living water/sky effect, even if they never say "WebGL". Also use it when an existing layered parallax hero flickers, blinks, or shows flashing rectangles, lost tiles or halos while scrolling.
---

# WebGL parallax hero from a generated image

One master image becomes 5-8 transparent depth layers, drawn in **one WebGL canvas** and moved by a pinhole-camera model (mouse = head sway, scroll = forward dolly). The result reads as real depth instead of a flat image sliding around. It shipped on Beyond the Mekong; the working code is bundled here.

## Why a single canvas (read this before choosing an approach)

The natural first build is a stack of absolutely positioned layers with GSAP transforms. It looks fine, then flashes **solid rectangles of the colour behind** while scrolling in Chromium (seen in Brave on macOS): the browser splits every big layer into tiles, and when the GPU is short of memory a tile of a layer that is moved *and scaled every frame* is not ready, so whatever is behind shows through. Hours were lost on `backdrop-filter`, `mix-blend-mode`, `will-change`, rounding and rotation before the real cause was found. Drawing everything in one canvas removes the tiles, so there is nothing to lose. Details and the timeline: `references/incident-and-architecture.md`.

## Before starting

Ask only what is missing: the scene and place being sold, the languages of the page, whether an opening animation is wanted (the reference project chose none: everything appears at once and depth comes from mouse and scroll), and whether the page must also work on touch (parallax is pointer-only).

A looping video is the wrong tool here (heavy, no interactive depth, hard to keep text legible). Do not offer it.

## Workflow

1. **Master image.** Generate a photoreal 16:9 point-of-view image, then a **cleaned** pass that removes everything that must not exist (extra boats, houses, people). Each layer is cut from this image, so anything left in it ends up in some layer. Prompts: `references/layer-prompts.md`.
2. **Plan the layers**, back to front, one depth Z in metres each: sky (~5000), far hills (~450), water (ground plane, no Z), far island (~150), mid island (~80), framing cliffs (~30), foreground (4-10, bolted to the camera). Five to eight layers: fewer looks flat, more costs memory without adding depth.
3. **Generate one layer per call**, with the cleaned image as reference: sky only and water only at full frame, each element layer on pure green `#00FF00`. Ask for groups of contiguous elements and split them afterwards by geometry, because the model isolates a single named element badly.
4. **Cut.** Adapt `scripts/cut-hero-layers.py`: chroma key with despill on edge pixels only (so natural foliage keeps its green), erosion, upscale to 1920 px, WebP with alpha, `box_mask` / `poly_mask` to separate fused planes. Let each rear layer overlap the one in front by about 3 % so no gap opens during parallax. Keep the PNG sources in the repo.
5. **Depth model.** Copy `assets/parallaxModel.ts` and set the depth table and constants. Keep one global gain for the sway (foreground ~20 px, far layers 5-8 px at the screen edge): per-layer tuning breaks the physical consistency that makes the effect convincing.
6. **Renderer.** Copy `assets/HeroScene.tsx` and edit the table below. It covers the canvas with a 10 % overscan, hides the canvas until every texture is loaded, caps `devicePixelRatio` at 1.5 (1 on 4 cores or fewer), pauses off-screen, falls back to static images without WebGL and shows one still frame under `prefers-reduced-motion`.
7. **HTML around the canvas.** Mist as radial gradients (never a live `blur`), birds in SVG, a dark gradient scrim under the copy, a vignette, a **plain** grain PNG, and left-aligned copy that stays off the subject. These are cheap and not scaled, so they are safe in the DOM.
8. **Optional extras.** Lenis smooth scroll driven by the GSAP ticker (`lagSmoothing(0)`, `force3D: true`). An adaptive navbar: `assets/heroLuminance.ts` + `assets/contrast.ts` measure the luminance of the composed scene and pick white or dark text by WCAG contrast (hysteresis 0.6); over the hero use a dark translucent fill with no `backdrop-filter`.

### What to edit in the templates

| File | Change |
| --- | --- |
| `assets/HeroScene.tsx` | `LAYERS` (src, kind, depth, `rect` placement), `SCENE_RATIO`, `WATER` / `SKY` shader params |
| `assets/parallaxModel.ts` | `DEPTH`, `HORIZON_Y`, `VANISH_X`, `SWAY_X/Y`, `DOLLY_MAX`, `FIXATION_Z`, `CAMERA_HEIGHT` |
| `assets/heroLuminance.ts` | layer list and placements, to match `HeroScene.tsx` |
| `scripts/cut-hero-layers.py` | source file names, `HORIZON`, masks and polygon points read from the actual image |

If the sun sits too low in the generated sky, squeeze the sky layer vertically (`rect` height ~0.57) so it clears the horizon.

## The physics (apply it to every layer alike)

| Camera motion | Rule |
| --- | --- |
| Lateral sway `dx`, converging on `Zf` | `u = f·dx·(1/Zf − 1/Z)`: layers nearer than `Zf` slide one way, farther ones the other, and far ones barely move |
| Rotation | same shift at every depth: no parallax |
| Forward dolly `dz` | scale `s = Z/(Z − dz)` about the vanishing point, so shifts depend on position |
| Water (ground plane) | `1/Z` linear in distance below the horizon: horizon static, bottom moves most |
| Sky | `1/Z → 0`: almost no shift |

Scale about a vanishing point **on the horizon**, so land bases stay attached to the waterline. A realistic head sway moves distant layers very little; the global gain is the honest art-direction knob.

## Verify before saying it works

1. Typecheck, lint and build.
2. In the browser, hover the right edge and read the real offsets: the foreground and the far island must move in **opposite** directions with very different amplitudes. Scroll fully and check the dolly scales (near plane ~1.5, far ~1.02).
3. Zero console errors; screenshots at rest and mid-scroll.
4. Slow trackpad scroll in Chrome, Edge and Brave. If something flickers, ask for a **screen recording** and extract frames with `ffmpeg`: the exact shape of the artefact points to the cause (solid rectangles = lost tiles). Keep `assets/heroFlags.ts` (`?hero=noblur,nograin,nocontain,noscale`) to bisect regressions.

## Pitfalls already paid for

- Stacked DOM layers with per-frame scale: flashing rectangles. Use the canvas.
- `backdrop-filter` header or `mix-blend-mode` grain over animated content: known Chromium flicker triggers.
- Rotating large alpha layers by a changing fraction of a degree: thin edges shimmer. No roll.
- `loseContext()` on unmount under React StrictMode: the remounted canvas cannot recreate its context.
- Generated layers are 1024 px wide: say so and plan higher-resolution renders before production. Check the source scene really is the place being sold (the reference scene was Ha Long Bay, not the Mekong).

## Deliverables

Layers in `public/<hero>/*.webp` + `grain.png`; the cut script and PNG sources; `parallaxModel.ts`; `HeroScene.tsx` and the hero section; and a short doc recording depths, constants and any incident (adapt `references/incident-and-architecture.md`).
