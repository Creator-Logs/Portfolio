"""
Find z-fighting in a processed-pipeline input: pairs of *different* parts with coplanar, same-facing,
overlapping faces (CAD interference). Run inside Blender after import, or standalone:
  blender -b --factory-startup -P scripts/models/zfight.py -- <raw.glb>
Also imported by process.py (find_zfights) to fix them.
"""
import sys

import numpy as np


def _tris(o):
    me = o.data
    me.calc_loop_triangles()
    n = len(me.loop_triangles)
    idx = np.empty(n * 3, dtype=np.int32)
    me.loop_triangles.foreach_get("vertices", idx)
    co = np.empty(len(me.vertices) * 3, dtype=np.float64)
    me.vertices.foreach_get("co", co)
    mw = np.array(o.matrix_world)
    co = co.reshape(-1, 3) @ mw[:3, :3].T + mw[:3, 3]
    return co[idx.reshape(-1, 3)]  # (n, 3, 3)


def _planes(tri, area_min):
    e1, e2 = tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]
    nrm = np.cross(e1, e2)
    area = np.linalg.norm(nrm, axis=1) / 2
    keep = area > area_min
    nrm = nrm[keep] / (2 * area[keep])[:, None]
    d = np.einsum("ij,ij->i", nrm, tri[keep, 0])
    return tri[keep], nrm, d, area[keep]


def _inside(pts, tris):
    """For each point, is it inside any of the (coplanar) triangles?"""
    a, b, c = tris[:, 0], tris[:, 1], tris[:, 2]
    v0, v1 = b - a, c - a
    d00, d01, d11 = (v0 * v0).sum(1), (v0 * v1).sum(1), (v1 * v1).sum(1)
    den = d00 * d11 - d01 * d01
    out = np.zeros(len(pts), dtype=bool)
    for i in range(0, len(pts), 256):
        p = pts[i:i + 256, None, :] - a[None]
        d20, d21 = (p * v0).sum(2), (p * v1).sum(2)
        with np.errstate(divide="ignore", invalid="ignore"):
            v = (d11 * d20 - d01 * d21) / den
            w = (d00 * d21 - d01 * d20) / den
        hit = (v > 1e-4) & (w > 1e-4) & (v + w < 1 - 1e-4)
        out[i:i + 256] = hit.any(1)
    return out


def find_zfights(objs, plane_tol=2e-5, area_min=1e-8):
    """Return [(objA, objB, overlapping_area_m2)] for coplanar same-facing overlaps."""
    data = []
    for o in objs:
        tri, nrm, d, area = _planes(_tris(o), area_min)
        lo, hi = tri.reshape(-1, 3).min(0), tri.reshape(-1, 3).max(0)
        data.append((o, tri, nrm, d, area, lo, hi))
    fights = []
    for i in range(len(data)):
        oa, ta, na, da, aa, loa, hia = data[i]
        for j in range(i + 1, len(data)):
            ob, tb, nb, db, ab, lob, hib = data[j]
            if (hia < lob - plane_tol).any() or (hib < loa - plane_tol).any():
                continue
            # candidate face pairs: same normal direction and same plane offset
            ka = np.round(np.c_[na * 1e3, da / plane_tol]).astype(np.int64)
            kb = np.round(np.c_[nb * 1e3, db / plane_tol]).astype(np.int64)
            keys_b = {tuple(k) for k in kb}
            sel = np.array([tuple(k) in keys_b for k in ka])
            if not sel.any():
                continue
            area = 0.0
            for key in {tuple(k) for k in ka[sel]}:
                ma = (ka == key).all(1)
                mb = (kb == key).all(1)
                cen = ta[ma].mean(1)
                hit = _inside(cen, tb[mb])
                area += aa[ma][hit].sum()
            if area > 0:
                fights.append((oa, ob, area))
    return fights


if __name__ == "__main__" and "--" in sys.argv:
    import bpy

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=sys.argv[sys.argv.index("--") + 1])
    objs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    fights = find_zfights(objs)
    for a, b, area in sorted(fights, key=lambda f: -f[2]):
        print(f"[zfight] {area * 1e6:9.2f} mm2  {a.name}  <->  {b.name}", flush=True)
    print(f"[zfight] {len(fights)} overlapping coplanar pairs", flush=True)
