"""Cambodia scene (Angkor Wat at sunrise): chroma-key the generated layers, export WebP.
Usage: python3 -I scripts/cut-hero-layers-cambodia.py <source_dir> <out_dir>

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
HORIZON = 0.50  # waterline in the Cambodia source image (the renderer maps it onto the shared 0.55 horizon)


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


save(up(load("kh_l1_sky")).convert("RGB"), "sky", 80)

# Water: the generated plate is a full frame whose far edge sits near the top; fade that edge into the sky.
water = up(load("kh_l2_water")).convert("RGBA")
water = water.crop((0, int(water.height * 0.03), water.width, water.height))
wa = np.asarray(water).copy()
fade = np.ones(water.height, np.float32)
fade[:40] = np.linspace(0, 1, 40)
wa[..., 3] = (fade[:, None] * 255).astype(np.uint8)
save(Image.fromarray(wa, "RGBA"), "water", 80)

# The background layers come from AI-regenerated hi-detail tiles (see register-tiles.py): each tile covers
# 576x324 source pixels at 1024x576, i.e. ~1.05x instead of ~1.9x upscaling when placed on the 1920 canvas.
def tile_plate(name, x0):
    t = Image.open(f"{src}/tiles/tile_{name}_aligned.png").convert("RGB")
    scale = W / 1024
    t = t.resize((round(576 * scale), round(324 * scale)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0, 40, 2))
    plate = Image.new("RGB", (W, round(572 * scale)), (0, 255, 0))
    plate.paste(t, (round(x0 * scale), 0))
    return plate


def layer(old, tile, x0, erode, lo=60):
    """Hi-detail tile over the plain upscale of the full plate: the tile gives the sharpness, the plate
    fills what the tile does not reach (its right edge and bottom)."""
    base = key(up(load(old)), erode=erode + 2, lo=lo)
    top = key(tile_plate(tile, x0), erode=erode, lo=lo)
    return Image.alpha_composite(base, top)


# p3: Angkor Wat + hazy mid treeline. The plate also holds the water: keep only the band above the waterline.
l3 = layer("kh_l3_temple_2", "mid", 224, 3)
save(mul_alpha(l3, box_mask(np.asarray(l3).shape, 0.25, 0.82, 0.0, HORIZON + 0.004, feather=3)), "p3")

# p2: left sugar palms and treeline
l4 = layer("kh_l4_left_2", "left", 0, 3, lo=25)
save(mul_alpha(l4, box_mask(np.asarray(l4).shape, 0.0, 0.36, 0.0, HORIZON + 0.004, feather=3)), "p2")

# p1: right framing trees and bank
l5 = layer("kh_l5_right_2", "right", 448, 3, lo=35)
save(mul_alpha(l5, box_mask(np.asarray(l5).shape, 0.70, 1.0, 0.0, 0.60, feather=3)), "p1")
print("done; horizon ratio", HORIZON)
