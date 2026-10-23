"""
Waterjet cut file -> SVG path data for the steering-wheel page's toolpath animation (chapter 04).
Run:  .venv-models/Scripts/python -I scripts/media/dxf_to_svg.py <in.dxf> <out.json>
      (source: assets-src/steering-wheel/iem/Steering Wheel Waterjet DXF.dxf -> content/steering/waterjet.json)

Every DXF entity (lines, arcs, circles, splines) is flattened to a polyline (0.05 mm max deviation) and written
as an SVG path in millimetres, turned 180° in the plane so the plate reads as on the car / in the CAD
(horns up; the drawing has them down). Ordered like a waterjet run: closed holes first
(smallest first — the pilot holes), then the remaining cut edges chained head-to-tail from the first one.
"""
import json
import math
import sys

import ezdxf
from ezdxf import path as ezpath

src, out = sys.argv[1:3]
doc = ezdxf.readfile(src)
msp = doc.modelspace()

items = []
for e in msp:
    try:
        p = ezpath.make_path(e)
    except (TypeError, ValueError):
        continue
    pts = [(v.x, v.y) for v in p.flattening(0.05)]
    if len(pts) < 2:
        continue
    closed = math.dist(pts[0], pts[-1]) < 1e-3
    length = sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))
    items.append({"type": e.dxftype(), "pts": pts, "closed": closed, "len": length})

xs = [x for it in items for x, _ in it["pts"]]
ys = [y for it in items for _, y in it["pts"]]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)

holes = sorted([it for it in items if it["closed"]], key=lambda it: it["len"])
edges = [it for it in items if not it["closed"]]
# chain open edges head-to-tail (reversing where needed) so the "jet" travels along the contour
chain = []
while edges:
    if not chain:
        cur = edges.pop(0)
    else:
        end = chain[-1]["pts"][-1]
        k, rev = min(((k, r) for k in range(len(edges)) for r in (False, True)),
                     key=lambda kr: math.dist(end, edges[kr[0]]["pts"][-1 if kr[1] else 0]))
        cur = edges.pop(k)
        if rev:
            cur["pts"] = cur["pts"][::-1]
    chain.append(cur)


def d(pts):
    return "M" + "L".join(f"{x1 - x:.2f},{y - y0:.2f}" for x, y in pts) + ("Z" if math.dist(pts[0], pts[-1]) < 1e-3 else "")


paths = [{"d": d(it["pts"]), "kind": "hole", "len": round(it["len"], 1)} for it in holes]
paths += [{"d": d(it["pts"]), "kind": "cut", "len": round(it["len"], 1)} for it in chain]
json.dump({"source": src.replace("\\", "/").split("/")[-1], "units": "mm", "width": round(x1 - x0, 2),
           "height": round(y1 - y0, 2), "paths": paths}, open(out, "w"), indent=1)
print(f"{len(holes)} holes, {len(chain)} edges, {x1 - x0:.1f} x {y1 - y0:.1f} mm -> {out}")
