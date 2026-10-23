"""Ansys Mechanical result (file.rst + ds.dat) -> web GLB with real per-vertex results (3D_GUIDE §1.6).

    python -I scripts/fea/build_fea.py <MECH dir> <out.glb> <out-summary.json>
    e.g. python -I scripts/fea/build_fea.py "C:/Users/anshg/Desktop/IEM/SW-FEA_files/dp0/SYS/MECH" \
             public/models/steering-wheel/fea.glb content/fea/steering-wheel.json

Needs a venv with `ansys-mapdl-reader` (reads MAPDL result files without an Ansys licence).

Each body becomes one mesh (its outer FE surface, linear triangles, normals split at 30°) carrying:
  _VM    von Mises stress, nodal-averaged per body (psi) — what Mechanical shows by default
  _DISP  displacement vector in model space (metres, true scale)
The model is rotated so the steering column axis is +Z (driver side faces the camera, like the CAD GLB),
centred on the load pilot node, and scaled inch -> metre.

Why the hand decoder: Mechanical 2023 R2 writes the nodal solution (NSL) record *sparse* (flag bit 3), which
ansys-mapdl-reader 0.56 reads as garbage. Layout found by inspection and checked against the solve:
  [n_total][2][3][3][n_runs] then n_runs × ([±start][count][count doubles]), zero elsewhere; trailing
  constant-fill entries mark DOFs that don't exist (2^100) and are ignored. Values are node-major UX,UY,UZ for
  every node (rotations live past nnod*3). Check: exactly the 2,326 fixed-support nodes (+ the pilot) are zero.
"""

import json
import re
import struct
import sys
import warnings
from pathlib import Path

import numpy as np
import pyvista as pv
from ansys.mapdl.reader import read_binary

warnings.filterwarnings("ignore")
mech, out_glb, out_json = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
IN = 0.0254
PSI_PER_MPA = 145.0377

r = read_binary(str(mech / "file.rst"))
deck = (mech / "ds.dat").read_text(errors="ignore")
g = r.grid
mesh = r.mesh


# ---------- results ----------
def nodal_displacement():
    ptr = r._resultheader["rpointers"][0] + r._result_solution_header(0)["ptrNSL"]
    with open(mech / "file.rst", "rb") as f:
        f.seek(ptr * 4)
        n = np.frombuffer(f.read(4), "<i4")[0]
        f.seek(ptr * 4)
        w = np.frombuffer(f.read(4 * (n + 3)), "<i4")
    flags = w[1].tobytes()[3]
    total, n_runs = w[2], w[6]
    vec = np.zeros(total)
    if not flags & 8:  # dense record: the library reads it fine
        return r.nodal_displacement(0)
    i = 7
    for _ in range(n_runs):
        start, count = abs(w[i]), w[i + 1]
        vec[start : start + count] = np.frombuffer(w[i + 2 : i + 2 + 2 * count].tobytes(), "<f8")
        i += 2 + 2 * count
    u = vec[: mesh.n_node * 3].reshape(-1, 3).take(r._sidx, 0)
    return r._neqv[r._sidx], u


dn, disp = nodal_displacement()
sn, ps = r.principal_nodal_stress(0)
gn = g.point_data["ansys_node_num"]
U = np.zeros((g.n_points, 3))
U[np.searchsorted(dn, gn)] = disp
VM = np.zeros(g.n_points)
VM[np.searchsorted(sn, gn)] = np.nan_to_num(ps[:, 4])
assert np.all(np.diff(dn) > 0) and np.all(np.diff(sn) > 0)
zero = (np.abs(U).sum(1) == 0).sum()


# ---------- model summary from the deck ----------
bodies = {}  # matid -> (name, material)
for name, material, mid in re.findall(r"^!(.+?),\t(.+?),\tmatid,\t(\d+)$", deck, re.M):
    bodies[int(mid)] = (name.strip(), material.strip())

matml = (mech / "MatML.xml").read_text(errors="ignore")
strength = {}
for block in re.findall(r"<Material>(.*?)</Material>", matml, re.S):
    nm = re.search(r"<Name>([^<]+)</Name>", block).group(1)
    vals = {}
    for prop in ("Tensile Yield Strength", "Tensile Ultimate Strength"):
        m = re.search(prop + r"</Qualifier>\s*<ParameterValue[^>]*>\s*<Data>([^<]+)</Data>", block)
        if m:
            vals[prop] = float(m.group(1).split(",")[0]) / 1e6 * PSI_PER_MPA  # Pa -> psi
    if vals:
        strength.setdefault(nm, vals)

moment = np.array([float(x) for x in re.findall(r"^f,all,m[xyz],(\S+)", deck, re.M)])
rf, rnum, rdof = r.nodal_reaction_forces(0)
reaction = np.array([rf[rdof == k].sum() for k in (1, 2, 3)])
force = -reaction  # applied load = minus the support reaction
pilot_id = int(re.search(r"\*set,_npilot,(\d+)", deck).group(1))
pilot = mesh.nodes[np.searchsorted(mesh.nnum, pilot_id)]


# ---------- frame: column axis -> +Z (driver side), wheel width -> X ----------
axis = force / np.linalg.norm(force)  # push/pull acts along the column, away from the driver
z = -axis
x = np.array([0.0, 1.0, 0.0])
x -= z * (x @ z)
x /= np.linalg.norm(x)
y = np.cross(z, x)
R = np.stack([x, y, z])  # rows: new basis


def to_model(p):
    return (p - pilot) @ R.T * IN


# ---------- per-body surfaces ----------
g.point_data["vm"] = VM
g.point_data["disp"] = U
mats = g.cell_data["ansys_material_type"]
meshes, summary_bodies = [], []
for mid, (name, material) in sorted(bodies.items()):
    sub = g.extract_cells(np.where(mats == mid)[0])
    surf = sub.extract_surface(nonlinear_subdivision=0).triangulate().clean()
    surf.points = to_model(np.asarray(surf.points))
    surf.point_data["disp"] = np.asarray(surf.point_data["disp"]) @ R.T * IN
    surf = surf.compute_normals(split_vertices=True, feature_angle=30, auto_orient_normals=True)
    vm_body = np.asarray(sub.point_data["vm"])
    peak = float(vm_body.max())
    ip = int(np.argmax(np.asarray(surf.point_data["vm"])))
    y_ = strength.get(material, {}).get("Tensile Yield Strength")
    meshes.append(dict(
        name=name,
        pos=np.asarray(surf.points, np.float32),
        nrm=np.asarray(surf.point_data["Normals"], np.float32),
        vm=np.asarray(surf.point_data["vm"], np.float32),
        disp=np.asarray(surf.point_data["disp"], np.float32),
        idx=np.asarray(surf.faces.reshape(-1, 4)[:, 1:], np.uint32).ravel(),
    ))
    summary_bodies.append(dict(
        name=name, material=material, peakPsi=round(peak, 1),
        peakAt=[round(float(v), 5) for v in surf.points[ip]],
        yieldPsi=round(y_, 0) if y_ else None,
        fosYield=round(y_ / peak, 2) if y_ else None,
        maxDispIn=round(float(np.linalg.norm(np.asarray(sub.point_data["disp"]), axis=1).max()), 5),
    ))
    print(f"{name:12s} {material:20s} verts {len(surf.points):6d} peak {peak:8.0f} psi")

all_vm = np.concatenate([m["vm"] for m in meshes])
summary = dict(
    source="Ansys Mechanical 2023 R2, static structural (SW-FEA.wbpj)",
    units="psi / in (model: metres)",
    nodes=int(mesh.n_node), elements=int((mats <= max(bodies)).sum()),
    loads=dict(
        forceLbf=round(float(np.linalg.norm(force)), 1),
        momentLbfIn=round(float(np.linalg.norm(moment)), 1),
        appliedTo=bodies[1][0], fixed=bodies[max(bodies)][0],
        pilot=[0, 0, 0], axis=[0, 0, -1],
    ),
    zeroDisplacementNodes=int(zero),
    vmMinPsi=round(float(all_vm.min()), 1), vmMaxPsi=round(float(all_vm.max()), 1),
    maxDispIn=round(float(np.linalg.norm(U, axis=1).max()), 5),
    bodies=summary_bodies,
)


# ---------- GLB writer (custom attributes need a leading underscore) ----------
buf, views, accessors, gl_meshes, nodes = bytearray(), [], [], [], []


def add(arr, kind, target):
    while len(buf) % 4:
        buf.append(0)
    off = len(buf)
    buf.extend(arr.tobytes())
    views.append(dict(buffer=0, byteOffset=off, byteLength=arr.nbytes, target=target))
    comp = 5125 if arr.dtype == np.uint32 else 5126
    n = len(arr) if arr.ndim == 1 or kind == "SCALAR" else arr.shape[0]
    acc = dict(bufferView=len(views) - 1, componentType=comp, count=int(n), type=kind)
    if kind == "VEC3" and target == 34962:
        acc["min"] = arr.min(0).tolist()
        acc["max"] = arr.max(0).tolist()
    accessors.append(acc)
    return len(accessors) - 1


for i, m in enumerate(meshes):
    attrs = dict(
        POSITION=add(m["pos"], "VEC3", 34962),
        NORMAL=add(m["nrm"], "VEC3", 34962),
        _VM=add(m["vm"], "SCALAR", 34962),
        _DISP=add(m["disp"], "VEC3", 34962),
    )
    gl_meshes.append(dict(name=m["name"], primitives=[dict(attributes=attrs, indices=add(m["idx"], "SCALAR", 34963))]))
    nodes.append(dict(name=m["name"], mesh=i))

gltf = dict(
    asset=dict(version="2.0", generator="scripts/fea/build_fea.py"),
    scene=0, scenes=[dict(nodes=list(range(len(nodes))))], nodes=nodes, meshes=gl_meshes,
    accessors=accessors, bufferViews=views, buffers=[dict(byteLength=len(buf))],
)
js = json.dumps(gltf, separators=(",", ":")).encode()
js += b" " * (-len(js) % 4)
while len(buf) % 4:
    buf.append(0)
out_glb.parent.mkdir(parents=True, exist_ok=True)
with open(out_glb, "wb") as f:
    f.write(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf)))
    f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
    f.write(struct.pack("<II", len(buf), 0x004E4942) + bytes(buf))
out_json.parent.mkdir(parents=True, exist_ok=True)
out_json.write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps({k: v for k, v in summary.items() if k != "bodies"}, indent=1))
print("glb", out_glb, f"{out_glb.stat().st_size / 1e6:.2f} MB")
