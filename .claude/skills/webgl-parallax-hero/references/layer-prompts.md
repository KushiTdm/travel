# Layer generation prompts (image-gen with a reference image)

All prompts: English, one call per layer, `reference_images` = the cleaned master image.
Prefix every prompt with "Ultra-realistic photograph." Names below match `scripts/cut-hero-layers.py`.

## 0. Master image
> First-person point of view from inside a <local boat>, seen from behind a <person> who sits at the front. The bow is centred and points toward the horizon. <setting, light, sky>. Symmetrical centred composition, wide 16:9, no text, no watermark.

Then a **clean** pass, so nothing unwanted ends up in any layer:
> Edit this image: remove ALL <houses, pontoons, small boats, rowers>. Replace them with <calm water / natural rock shoreline>. Keep absolutely everything else identical (subject, boat, sky, sun, islands, lighting, colours, composition).

## 1. Full-frame backgrounds (no chroma key)
- **Sky**: "output ONLY the sunset sky filling the ENTIRE 16:9 frame down to the bottom edge ... NO land, NO islands, NO water, NO boat, NO people."
- **Water**: "output ONLY the calm water surface filling the ENTIRE 16:9 frame ... same colours and reflections, seen at a shallow angle. NO boat, NO people, NO islands, NO sky."

## 2. Element layers (chroma key)
Template: "isolate ONLY <element(s)>, in the SAME position and scale as the reference, cut cleanly at the waterline. Everything else (<list what to exclude>) must be a perfectly flat solid pure chroma-key green background (#00FF00). Crisp edges, no shadows on the background, no text."

Ask for **groups of contiguous elements** and separate them afterwards with masks:
- far hazy hills at the horizon (soft haze edges);
- ALL the land (every island and cliff), no subject: split it into planes with box/polygon masks;
- the left cluster of peaks only;
- the nearest framing cliffs (they usually come back fused with neighbouring islands: cut by polygon);
- the foreground boat + person + oar, extending to the bottom edge.

## Known failure modes
- A layer comes back as the whole scene instead of the requested plane: re-run or crop it geometrically.
- Far hills come back tiny and dull: soften and use as haze (opacity ~0.6-0.75).
- The image-gen browser can time out on the reference upload: ask the user to relaunch the MCP, then retry; do not loop.
- Sources are 1024 px wide: upscale to 1920 in the cut script and flag it as a limit.
