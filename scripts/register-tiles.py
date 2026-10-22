"""Register the AI-regenerated hi-detail tiles (design/hero-source/tiles/kh_hi_*.png) onto the 1024x576 input
tiles they were made from: the model keeps the look but reframes slightly, so find scale + shift by matching
the non-green silhouettes, then write the aligned tiles (tiles/*_aligned.png).
Usage: python3 -I scripts/register-tiles.py design/hero-source/tiles
"""
import sys
import numpy as np
from PIL import Image

d = sys.argv[1]
W, H = 1024, 576
SW, SH = 256, 144


def sil(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    t = np.clip((g - np.maximum(r, b) - 60) / 60, 0, 1) * np.clip((g - 120) / 60, 0, 1)
    return 1 - t


def score(ref, mov):
    # best circular shift by FFT cross-correlation; returns (score, dy, dx)
    f = np.fft.rfft2(ref - ref.mean()) * np.conj(np.fft.rfft2(mov - mov.mean()))
    c = np.fft.irfft2(f, s=ref.shape)
    i = np.unravel_index(np.argmax(c), c.shape)
    dy = i[0] if i[0] < SH // 2 else i[0] - SH
    dx = i[1] if i[1] < SW // 2 else i[1] - SW
    return c[i] / (np.linalg.norm(ref - ref.mean()) * np.linalg.norm(mov - mov.mean()) + 1e-6), dy, dx


for name in ["left", "mid", "right", "lahill"]:
    ref_im = Image.open(f"{d}/tile_{name}_in.png").convert("RGB")
    hi = Image.open(f"{d}/kh_hi_{name}.png").convert("RGB").resize((W, H), Image.LANCZOS)
    ref = np.asarray(Image.fromarray((sil(ref_im) * 255).astype(np.uint8)).resize((SW, SH), Image.BILINEAR)).astype(np.float32) / 255
    best = (-1, 1, 0, 0)
    for s in np.arange(0.80, 1.40, 0.01):
        # scale the hi-res silhouette about the tile centre, in small-image space
        m = Image.fromarray((sil(hi) * 255).astype(np.uint8)).resize((SW, SH), Image.BILINEAR)
        w, h = int(SW * s), int(SH * s)
        big = m.resize((w, h), Image.BILINEAR)
        canvas = Image.new("L", (SW, SH), 0)
        canvas.paste(big, ((SW - w) // 2, (SH - h) // 2))
        sc, dy, dx = score(ref, np.asarray(canvas).astype(np.float32) / 255)
        if sc > best[0]:
            best = (sc, s, dy, dx)
    sc, s, dy, dx = best
    # apply at full resolution: scale about centre then shift
    w, h = int(W * s), int(H * s)
    big = hi.resize((w, h), Image.LANCZOS)
    canvas = Image.new("RGB", (W, H), (0, 255, 0))
    canvas.paste(big, ((W - w) // 2 + dx * (W // SW), (H - h) // 2 + dy * (H // SH)))
    canvas.save(f"{d}/tile_{name}_aligned.png")
    print(name, "corr %.3f scale %.2f dx %d dy %d" % (sc, s, dx * 4, dy * 4))
