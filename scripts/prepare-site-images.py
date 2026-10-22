"""Turn the generated site images into web assets.
Usage: python3 -I scripts/prepare-site-images.py <source_dir> <public_dir>
Covers -> 1600 px WebP; icon/scene sheets are cut into separate transparent WebP files.
"""
import sys
import numpy as np
from collections import deque
from PIL import Image, ImageFilter, ImageDraw, ImageFont

src, pub = sys.argv[1], sys.argv[2]

COVERS = {
    "site_cover_delta": ["tours/mekong-delta-3-days", "destinations/vietnam"],
    "site_cover_angkor": ["tours/angkor-siem-reap-3-days", "destinations/cambodia"],
    "site_cover_luang": ["tours/luang-prabang-4-days", "destinations/laos"],
    "site_cover_phnompenh": ["tours/delta-to-phnom-penh-5-days"],
    "site_cover_cruise": ["tours/mekong-river-cruise-7-days"],
    "site_about": ["about"],
}
for name, outs in COVERS.items():
    im = Image.open(f"{src}/{name}.png").convert("RGB")
    im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 50, 2))
    for o in outs:
        im.save(f"{pub}/images/{o}.webp", "WEBP", quality=80, method=6)


def white_to_alpha(im, tol=14):
    """Make the white background transparent by flood fill from the borders."""
    rgb = np.asarray(im.convert("RGB")).astype(int)
    h, w = rgb.shape[:2]
    near = (rgb.min(-1) >= 255 - tol)
    bg = np.zeros((h, w), bool)
    q = deque([(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)])
    while q:
        y, x = q.popleft()
        if 0 <= y < h and 0 <= x < w and near[y, x] and not bg[y, x]:
            bg[y, x] = True
            q.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])
    alpha = Image.fromarray(((~bg) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def cut_sheet(name, items):
    im = Image.open(f"{src}/{name}.png").convert("RGB")
    W, H = im.size
    for i, (label, size, folder) in enumerate(items):
        c, r = i % 3, i // 3
        cell = im.crop((int(W * c / 3), int(H * r / 2), int(W * (c + 1) / 3), int(H * (r + 1) / 2)))
        a = np.asarray(cell).astype(int)
        ys, xs = np.where(a.min(-1) < 235)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        pad = 6
        crop = cell.crop((max(0, x0 - pad), max(0, y0 - pad), min(cell.width, x1 + pad), min(cell.height, y1 + pad)))
        s = max(crop.size)
        sq = Image.new("RGB", (s, s), (255, 255, 255))
        sq.paste(crop, ((s - crop.width) // 2, (s - crop.height) // 2))
        out = white_to_alpha(sq.resize((size, size), Image.LANCZOS))
        out.save(f"{pub}/images/{folder}/{label}.webp", "WEBP", quality=90, method=6)


cut_sheet("site_sheet_styles", [(n, 256, "icons") for n in ["culture", "nature", "river", "food", "family", "slow"]])
# second sheet: icons on the top row, scenes on the bottom row
cut_sheet(
    "site_sheet_why",
    [(n, 256, "icons") for n in ["small-groups", "local-guides", "human-reply"]]
    + [(n, 384, "scenes") for n in ["couples", "families", "independent"]],
)
