"""Chroma-key the generated POV hero layers and export web-ready WebP files.
Usage: python3 -I scripts/cut-hero-layers.py <source_dir> <out_dir>

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
HORIZON = 0.55  # waterline in the POV image


def load(name):
    return Image.open(f"{src}/{name}.png").convert("RGB")


def up(im):
    h = round(im.height * W / im.width)
    return im.resize((W, h), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))


def key(im, erode=3):
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    t = np.clip((g - np.maximum(r, b) - 60) / 60, 0, 1) * np.clip((g - 120) / 60, 0, 1)
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


# Boundary between the tall island (plane 3) and the big right cliff (plane 1), read from the image.
CLIFF_EDGE = [(0.965, 0.0), (0.87, 0.09), (0.84, 0.18), (0.795, 0.30), (0.778, 0.34), (0.775, 0.585)]


def mul_alpha(im, mask):
    a = np.asarray(im).copy()
    a[..., 3] = (a[..., 3] * mask).astype(np.uint8)
    return Image.fromarray(a, "RGBA")


def save(im, name, q=84):
    im.save(f"{out}/{name}.webp", "WEBP", quality=q, method=6)


save(up(load("pc_l1_sky")).convert("RGB"), "sky", 80)

water = up(load("pc_l2_water")).convert("RGBA")
water = water.crop((0, int(water.height * HORIZON), water.width, water.height))
wa = np.asarray(water).copy()
fade = np.ones(water.height, np.float32)
fade[:40] = np.linspace(0, 1, 40)
wa[..., 3] = (fade[:, None] * 255).astype(np.uint8)
save(Image.fromarray(wa, "RGBA"), "water", 80)

# plane 4: faint hills between the left cluster and the island (softened into haze)
l3 = key(up(load("pc_l3_hills")), erode=3).filter(ImageFilter.GaussianBlur(1.4))
save(mul_alpha(l3, box_mask(np.asarray(l3).shape, 0.53, 0.76, 0.40, 0.56, feather=6) * 0.75), "p4")

# plane 3: tall pointed island (right of the sun), cut from the all-land cut-out; it runs a
# little under the cliff (plane 1) so no gap opens during parallax.
l4 = key(up(load("pc_l4_land")), erode=5)
shift = [(x + 0.03, y) for x, y in CLIFF_EDGE]
island = [(0.575, 0.0), (0.575, 0.585)] + shift[::-1] + [(0.995, 0.0)]
save(mul_alpha(l4, poly_mask(np.asarray(l4).shape, island, 2)), "p3")

# plane 2: left karst cluster
save(key(up(load("pc_l5_cluster")), erode=5), "p2")

# plane 1: nearest framing cliffs (far right + far left edge). The source cut-out also holds
# the tall island (plane 3) and the boat, so keep only the right cliff (polygon) and left edge.
l6 = key(up(load("pc_l6_cliffs")), erode=5)
sh = np.asarray(l6).shape
right = poly_mask(sh, CLIFF_EDGE + [(1.0, 0.585), (1.0, 0.0)], 2)
m = np.maximum(box_mask(sh, 0.0, 0.12, 0.0, 0.585, 3), right)
save(mul_alpha(l6, m), "p1")

save(key(up(load("pc_l7_boat")), erode=3), "boat")
print("done; horizon ratio", HORIZON)
