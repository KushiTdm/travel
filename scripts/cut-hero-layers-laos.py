"""Laos scene (Luang Prabang, Mekong at sunrise): chroma-key the generated layers, export WebP.
Usage: python3 -I scripts/cut-hero-layers-laos.py <source_dir> <out_dir>

Planes, near to far: p1 (framing cliffs, appears with boat/water/sky), p2 (left karst
cluster), p3 (tall pointed island), p4 (haze hills). Only the foreground boat exists on
the water: no other boats or houses.
Sky is squeezed vertically in CSS so the sun sits above the horizon (see Hero.tsx).
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
W = 1920
HORIZON = 0.495  # waterline in the Laos source image (the renderer maps it onto the shared 0.55 horizon)


def load(name):
    return Image.open(f"{src}/{name}.png").convert("RGB")


def up(im):
    h = round(im.height * W / im.width)
    return im.resize((W, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))


def key(im, erode=3, lo=60):
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    t = np.clip((g - np.maximum(r, b) - lo) / 60, 0, 1) * np.clip((g - 120) / 60, 0, 1)
    m = Image.fromarray(((1 - t) * 255).astype(np.uint8))
    m = m.filter(ImageFilter.MinFilter(erode)).filter(ImageFilter.GaussianBlur(0.8))
    al = np.asarray(m).astype(np.float32) / 255
    edge = (t > 0.02) | (al < 0.98)
    g2 = np.where(edge, np.minimum(g, np.maximum(r, b) * 0.95), g)  # despill on edges only
    rgba = np.dstack([np.stack([r, g2, b], -1).astype(np.uint8), (al * 255).astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA")


def box_mask(shape, x0, x1, y0, y1, feather=10):
    h, w = shape[:2]
    m = np.zeros((h, w), np.float32)
    m[int(h * y0) : int(h * y1), int(w * x0) : int(w * x1)] = 1
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(feather))
    return np.asarray(im).astype(np.float32) / 255


def poly_mask(shape, pts, feather=2):
    from PIL import ImageDraw

    h, w = shape[:2]
    im = Image.new("L", (w, h), 0)
    ImageDraw.Draw(im).polygon([(x * w, y * h) for x, y in pts], fill=255)
    im = im.filter(ImageFilter.GaussianBlur(feather))
    return np.asarray(im).astype(np.float32) / 255



def mul_alpha(im, mask):
    a = np.asarray(im).copy()
    a[..., 3] = (a[..., 3] * mask).astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def save(im, name, q=84):
    im.save(f"{out}/{name}.webp", "WEBP", quality=q, method=6)



# Sky: the sun sits at 50 % of the plate, so the plate is placed at 16-55 % of the scene (see heroScenes.ts) and
# its top edge is extended upward with a blurred copy of its first rows to cover the rest.
sky = up(load("la_l1_sky")).convert("RGB")
pad = round(sky.height * 0.21 / 0.39)
top = sky.crop((0, 0, sky.width, 6)).resize((sky.width, pad), Image.BILINEAR).filter(ImageFilter.GaussianBlur(30))
ext = Image.new("RGB", (sky.width, sky.height + pad))
ext.paste(top, (0, 0))
ext.paste(sky, (0, pad))
save(ext, "sky", 80)

water = up(load("la_l2_water")).convert("RGBA")
water = water.crop((0, int(water.height * 0.03), water.width, water.height))
wa = np.asarray(water).copy()
fade = np.ones(water.height, np.float32)
fade[:40] = np.linspace(0, 1, 40)
wa[..., 3] = (fade[:, None] * 255).astype(np.uint8)
save(Image.fromarray(wa, "RGBA"), "water", 80)

# p4: misty mountains and the hazy bank in front of them. The generated plate came back reframed, so this
# layer is cut from the clean master instead: everything above the waterline that is not warm sky.
clean = up(load("la_clean"))
a = np.asarray(clean).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
alpha = np.clip((75 - (r - b)) / 40, 0, 1)
alpha[(r > 235) & (g > 225)] = 0  # the sun disc
alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32) / 255
alpha *= box_mask(a.shape, 0.30, 0.86, 0.0, HORIZON + 0.004, feather=3)
save(Image.fromarray(np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)]), "RGBA"), "p4", 82)

# p3: wooded hill with the golden stupa and temple roofs (hi-detail tile over the plain upscale of the plate)
def tile_plate(name, x0):
    t = Image.open(f"{src}/tiles/tile_{name}_aligned.png").convert("RGB")
    scale = W / 1024
    t = t.resize((round(576 * scale), round(324 * scale)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0, 40, 2))
    plate = Image.new("RGB", (W, round(572 * scale)), (0, 255, 0))
    plate.paste(t, (round(x0 * scale), 0))
    return plate


base = key(up(load("la_l3_hill")), erode=5)
hill = Image.alpha_composite(base, key(tile_plate("lahill", 0), erode=3))
save(mul_alpha(hill, box_mask(np.asarray(hill).shape, 0.0, 0.60, 0.0, HORIZON + 0.004, feather=3)), "p3")
print("done; horizon ratio", HORIZON)
