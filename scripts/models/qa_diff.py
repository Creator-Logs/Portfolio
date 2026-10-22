"""Pixel-diff QA renders: reference (uncompressed) vs shipped GLB.  python qa_diff.py <dir> <slug>
Writes <slug>-v<N>-compare.png (reference | shipped | diff x8) and prints per-view stats."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

out, slug = Path(sys.argv[1]), sys.argv[2]
worst = 0.0
for v in range(3):
    a = np.asarray(Image.open(out / f"{slug}-v{v}-ref.png").convert("RGB")).astype(np.int16)
    b = np.asarray(Image.open(out / f"{slug}-v{v}-ship.png").convert("RGB")).astype(np.int16)
    d = np.abs(a - b).max(axis=2)
    changed = (d > 8).mean() * 100  # % of pixels differing by more than 8/255 in any channel
    worst = max(worst, changed)
    print(f"view {v}: mean abs diff {d.mean():.3f}/255, max {d.max()}/255, pixels >8/255: {changed:.3f}%")
    heat = np.clip(d * 8, 0, 255).astype(np.uint8)
    strip = np.concatenate([a.astype(np.uint8), b.astype(np.uint8), np.stack([heat] * 3, axis=2)], axis=1)
    Image.fromarray(strip).save(out / f"{slug}-v{v}-compare.png")
print("PASS" if worst < 0.1 else "CHECK", f"(worst view: {worst:.3f}% of pixels changed)")
