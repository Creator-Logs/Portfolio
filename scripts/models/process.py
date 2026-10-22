"""
Blender (headless) model pipeline step - docs/portfolio/3D_GUIDE.md section 1.
Run:  blender -b --factory-startup -P scripts/models/process.py -- <config.json> <raw.glb> <out.glb>

1. import the cascadio tessellation (exact BRep normals are kept as custom normals),
2. re-orient STEP Z-up to glTF Y-up and centre the model on its base,
3. remove only parts that are invisible from every direction (ID-render visibility test),
4. assign preset-named materials ("preset#hex") from the config,
5. join meshes per material (draw calls ~ number of materials) - geometry is never simplified,
   then bake Cycles ambient occlusion into a per-vertex "_AO" attribute,
6. export an uncompressed GLB (compression happens next, in optimize.mjs).
"""
import json
import math
import os
import re
import sys

import bpy
import mathutils
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1 :]
cfg_path, raw_path, out_path = argv[:3]
cfg = json.load(open(cfg_path))


def log(*a):
    print("[process]", *a, flush=True)


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def bounds(objs):
    lo = mathutils.Vector((math.inf,) * 3)
    hi = mathutils.Vector((-math.inf,) * 3)
    for o in objs:
        for v in o.data.vertices:
            p = o.matrix_world @ v.co
            lo = mathutils.Vector(map(min, lo, p))
            hi = mathutils.Vector(map(max, hi, p))
    return lo, hi


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=raw_path, merge_vertices=False)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
log(f"imported {len(meshes)} mesh objects, {sum(len(o.data.polygons) for o in meshes):,} polys")

# -- 1a. excluded parts ("exclude": [regex], full part names) - stray CAD instances only -------
for pattern in cfg.get("exclude", []):
    rx = re.compile(pattern, re.I)
    for o in [o for o in meshes if rx.search(o.name)]:
        log(f"exclude {pattern!r}: {o.name}")
        bpy.data.objects.remove(o)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]

# -- 1b. exploded parts ("explode": [[regex, [dx, dy, dz]]], mm in STEP coordinates) -----
# Applied before culling, so whatever a moved part uncovers is kept. glTF import maps
# STEP (x, y, z) -> Blender (x, -z, y).
for pattern, (dx, dy, dz) in cfg.get("explode", []):
    rx = re.compile(pattern, re.I)
    moved = [o for o in meshes if rx.search(o.name)]
    for o in moved:
        o.matrix_world = mathutils.Matrix.Translation(mathutils.Vector((dx, -dz, dy)) / 1000) @ o.matrix_world
    log(f"explode {pattern!r}: moved {len(moved)} parts by {(dx, dy, dz)} mm")

# -- 2. orientation + centring ---------------------------------------------------
# cascadio writes STEP coordinates as-is; after glTF import, STEP +Z sits on Blender -Y.
root = bpy.data.objects.new("root", None)
bpy.context.scene.collection.objects.link(root)
for o in list(bpy.context.scene.objects):
    if o.parent is None and o is not root:
        o.parent = root
rot = [0.0, 0.0, 0.0]
if cfg.get("up", "z") == "z":
    rot[0] = -90.0
for i, deg in enumerate(cfg.get("rotate_deg", [0, 0, 0])):  # optional resting-pose tweak, Blender axes
    rot[i] += deg
root.rotation_euler = mathutils.Euler([math.radians(d) for d in rot])
bpy.context.view_layer.update()
for o in meshes:
    mw = o.matrix_world.copy()
    o.parent = None
    o.matrix_world = mw
for o in [o for o in bpy.context.scene.objects if o.type != "MESH"]:
    bpy.data.objects.remove(o)
bpy.ops.object.select_all(action="SELECT")
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

lo, hi = bounds(meshes)
shift = mathutils.Matrix.Translation((-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z))  # centred, resting on z=0
for o in meshes:
    o.data.transform(shift)
lo, hi = bounds(meshes)
log("extents (mm):", [round(v * 1000, 1) for v in (hi - lo)])


# -- 2b. exact duplicates (same part exported twice in the same place -> z-fighting) --
def signature(o):
    co = np.empty(len(o.data.vertices) * 3, dtype=np.float64)
    o.data.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    return (len(o.data.polygons), *np.round(co.min(axis=0), 5), *np.round(co.max(axis=0), 5),
            *np.round(co.sum(axis=0) / max(len(co), 1), 5))


firsts = {}
dupes = []
for o in meshes:
    sig = signature(o)
    if sig in firsts:
        dupes.append((o, firsts[sig]))
    else:
        firsts[sig] = o
for o, keep in dupes:
    log(f"   duplicate: {o.name} == {keep.name} -> removed")
    bpy.data.objects.remove(o)
if dupes:
    log(f"duplicates: removed {len(dupes)} exact copies")
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]


# -- 2c. z-fighting: different parts with coplanar overlapping faces (CAD interference,
#        flush stickers/labels). The smaller part wins: planar fights -> nudge it out along the
#        shared normal; multi-plane fights -> grow it about its centre. eps = detail tolerance.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zfight import _planes, _tris, find_zfights  # noqa: E402

eps = cfg.get("zfight_eps_mm", 0.02) / 1000
fixed = set()
for a, b, area in sorted(find_zfights(meshes), key=lambda f: -f[2]):
    area_a = _planes(_tris(a), 0)[3].sum()
    area_b = _planes(_tris(b), 0)[3].sum()
    win, lose = (a, b) if area_a <= area_b else (b, a)
    if win.name in fixed:
        continue
    tri, nrm, d, _ = _planes(_tris(win), 1e-8)
    tri_l, nrm_l, d_l, _ = _planes(_tris(lose), 1e-8)
    keys_l = {(tuple(np.round(n * 1e3).astype(int)), round(x / 2e-5)) for n, x in zip(nrm_l, d_l)}
    shared = [n for n, x in zip(nrm, d) if (tuple(np.round(n * 1e3).astype(int)), round(x / 2e-5)) in keys_l]
    normals = {tuple(np.round(n, 3)) for n in shared}
    if len(normals) == 1:
        offset = mathutils.Vector(next(iter(normals))) * eps
        win.data.transform(mathutils.Matrix.Translation(offset))
        how = f"nudged {eps * 1000:.3f} mm along {tuple(round(c, 2) for c in next(iter(normals)))}"
    else:
        co = np.empty(len(win.data.vertices) * 3)
        win.data.vertices.foreach_get("co", co)
        co = co.reshape(-1, 3)
        centre = mathutils.Vector((co.min(0) + co.max(0)) / 2)
        size = float((co.max(0) - co.min(0)).min()) or 1.0
        s = 1 + 2 * eps / size
        win.data.transform(mathutils.Matrix.Translation(centre) @ mathutils.Matrix.Scale(s, 4)
                           @ mathutils.Matrix.Translation(-centre))
        how = f"grown {eps * 1000:.3f} mm"
    win.data.update()
    fixed.add(win.name)
    log(f"   z-fight {area * 1e6:9.1f} mm2: {win.name} over {lose.name} -> {how}")
if fixed:
    log(f"z-fighting: resolved {len(fixed)} parts")


# -- 3. visibility culling (lossless: only parts no camera direction can see) -------
def id_rgb8(i):
    # well-separated 8-bit codes (6 bits/channel, step 4) -> robust to rounding
    return [((i >> s) & 63) * 4 + 2 for s in (12, 6, 0)]


def visible_ids(objs, res, dirs):
    scene = bpy.context.scene
    saved = [list(o.data.materials) for o in objs]
    for i, o in enumerate(objs, start=1):
        m = bpy.data.materials.new(f"__id{i}")
        m.diffuse_color = (*[srgb_to_linear(c / 255) for c in id_rgb8(i)], 1)
        o.data.materials.clear()
        o.data.materials.append(m)
    scene.render.engine = "BLENDER_WORKBENCH"
    sh = scene.display.shading
    sh.light, sh.color_type = "FLAT", "MATERIAL"
    sh.show_object_outline = sh.show_cavity = sh.show_shadows = sh.show_specular_highlight = False
    scene.display.render_aa = "OFF"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.render.resolution_x = scene.render.resolution_y = res
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.world = scene.world or bpy.data.worlds.new("w")
    scene.world.color = (0, 0, 0)
    cam_data = bpy.data.cameras.new("idcam")
    cam_data.type = "ORTHO"
    cam = bpy.data.objects.new("idcam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    lo, hi = bounds(objs)
    centre, radius = (lo + hi) / 2, (hi - lo).length / 2
    cam_data.ortho_scale = radius * 2.05
    cam_data.clip_start, cam_data.clip_end = 0.0005, radius * 6
    tmp = os.path.join(os.environ.get("TEMP", "."), "__idpass.png")
    seen = set()
    for d in dirs:
        d = mathutils.Vector(d).normalized()
        cam.location = centre + d * radius * 3
        cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = tmp
        bpy.ops.render.render(write_still=True)
        img = bpy.data.images.load(tmp, check_existing=False)
        px = np.empty(len(img.pixels), dtype=np.float32)
        img.pixels.foreach_get(px)
        bpy.data.images.remove(img)
        rgb = np.rint(px.reshape(-1, 4)[:, :3] * 255).astype(np.int32)
        rgb = rgb[rgb.any(axis=1)]  # drop background
        q = rgb // 4  # codes are 4*k+2
        seen.update(np.unique((q[:, 0] << 12) | (q[:, 1] << 6) | q[:, 2]).tolist())
    bpy.data.objects.remove(cam)
    for o, mats in zip(objs, saved):
        o.data.materials.clear()
        for m in mats:
            o.data.materials.append(m)
    for m in [m for m in bpy.data.materials if m.name.startswith("__id")]:
        bpy.data.materials.remove(m)
    return seen


if cfg.get("cull_hidden", True):
    # See-through parts (windows) must not occlude: hide them during the ID pass and always keep them.
    see_through = re.compile(cfg["transparent"], re.I) if cfg.get("transparent") else None
    clear = [o for o in meshes if see_through and see_through.search(o.name)]
    for o in clear:
        o.hide_render = True
    # 162 directions over the full sphere (icosphere subdiv 3 vertices) so undersides count too.
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=1)
    ico = bpy.context.active_object
    dirs = [tuple(v.co) for v in ico.data.vertices]
    bpy.data.objects.remove(ico)
    seen = visible_ids(meshes, cfg.get("cull_resolution", 1024), dirs)
    for o in clear:
        o.hide_render = False
    hidden = [o for i, o in enumerate(meshes, start=1) if i not in seen and o not in clear]
    log(f"visibility: {len(hidden)} of {len(meshes)} parts never visible "
        f"({sum(len(o.data.polygons) for o in hidden):,} polys) -> removed")
    for o in hidden:
        log("   hidden:", o.name)
        bpy.data.objects.remove(o)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]

# -- 4. materials ----------------------------------------------------------------
rules = []
for rule in cfg["materials"]:
    pattern, preset = rule[0], rule[1]
    rules.append((re.compile(pattern, re.I), preset, rule[2].lstrip("#").lower() if len(rule) > 2 else ""))
mats, groups = {}, {}
for o in meshes:
    name = re.sub(r"\.\d+$", "", o.name)
    preset, hexc = next((p, h) for rx, p, h in rules if rx.search(name))
    key = f"{preset}#{hexc}" if hexc else preset
    if key not in mats:
        m = bpy.data.materials.new(key)
        if hexc:
            m.diffuse_color = (*[srgb_to_linear(int(hexc[i:i + 2], 16) / 255) for i in (0, 2, 4)], 1)
            m.use_nodes = True
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            if bsdf:
                bsdf.inputs["Base Color"].default_value = m.diffuse_color
        mats[key] = m
    o.data.materials.clear()
    o.data.materials.append(mats[key])
    groups.setdefault(key, []).append(o)

# -- 5. join per material ----------------------------------------------------------
for key, objs in groups.items():
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1:
        bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = joined.data.name = key
final = [o for o in bpy.context.scene.objects if o.type == "MESH"]
log(f"output: {len(final)} meshes (one per material), {sum(len(o.data.polygons) for o in final):,} polys")
for o in final:
    log(f"   {o.name:28s} {len(o.data.polygons):>9,} polys")


# -- 5b. ambient occlusion -> per-vertex "_AO" attribute ----------------------------------
# Cycles AO bake (every part occludes every other) into a point colour attribute, copied to a
# single-channel float attribute that the glTF exporter writes as the custom "_AO" vertex attribute;
# materials.ts applies it to indirect light (+ a little direct) with specular occlusion.
# CAD tessellations are sparse: flat faces are fans of long triangles from hole rims to the border,
# so per-vertex AO would smear rim darkness across whole faces. Edges longer than the AO resolution
# are split first. New vertices lie *on* existing edges and faces are re-triangulated in their own
# plane, so the shape is exactly unchanged (nothing is simplified; 3D_GUIDE §1.0 fidelity rules).
import bmesh  # noqa: E402


def densify(o, max_len):
    mesh = o.data
    cn = np.empty(len(mesh.loops) * 3, dtype=np.float32)
    mesh.corner_normals.foreach_get("vector", cn)  # the exact CAD normals (stored encoded otherwise)
    attr = mesh.attributes.new("cn_tmp", "FLOAT_VECTOR", "CORNER")
    attr.data.foreach_set("vector", cn)
    before = len(mesh.vertices)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    for _ in range(4):  # re-triangulation can leave new long diagonals: repeat until none
        long = {}
        for e in bm.edges:
            n = math.ceil(e.calc_length() / max_len) - 1
            if n > 0:
                long.setdefault(min(n, 64), []).append(e)
        if not long:
            break
        for cuts, edges in long.items():  # same length -> same cuts on both copies of a seam edge: no cracks
            bmesh.ops.subdivide_edges(bm, edges=edges, cuts=cuts, use_grid_fill=False)
        bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 3])
    bm.to_mesh(mesh)
    bm.free()
    cn = np.empty(len(mesh.loops) * 3, dtype=np.float32)
    mesh.attributes["cn_tmp"].data.foreach_get("vector", cn)
    cn = cn.reshape(-1, 3)
    cn /= np.maximum(np.linalg.norm(cn, axis=1, keepdims=True), 1e-12)
    mesh.attributes.remove(mesh.attributes["cn_tmp"])
    mesh.normals_split_custom_set(cn.tolist())
    return before, len(mesh.vertices)


def bake_ao(objs, samples, distance):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = False
    scene.world = scene.world or bpy.data.worlds.new("w")
    scene.world.light_settings.distance = distance
    scene.render.bake.target = "VERTEX_COLORS"
    see_through = re.compile(cfg["transparent"], re.I) if cfg.get("transparent") else None
    targets = []
    for o in objs:
        if see_through and any(see_through.search(m.name) for m in o.data.materials if m):
            o.visible_diffuse = o.visible_glossy = o.visible_shadow = False  # windows don't occlude
            continue
        attr = o.data.color_attributes.new("ao_bake", "BYTE_COLOR", "POINT")
        o.data.color_attributes.active_color = attr
        targets.append(o)
    bpy.ops.object.select_all(action="DESELECT")
    for o in targets:
        o.select_set(True)
    bpy.context.view_layer.objects.active = targets[0]
    bpy.ops.object.bake(type="AO", target="VERTEX_COLORS", use_clear=True)
    for o in targets:
        src = o.data.color_attributes["ao_bake"]
        rgba = np.empty(len(src.data) * 4, dtype=np.float32)
        src.data.foreach_get("color", rgba)  # linear
        ao = rgba.reshape(-1, 4)[:, 0].copy()
        o.data.color_attributes.remove(src)
        o.data.attributes.new("_AO", "FLOAT", "POINT").data.foreach_set("value", ao)
        log(f"   AO {o.name:28s} mean {ao.mean():.3f}")


if cfg.get("ao", True):
    lo, hi = bounds(final)
    diag_mm = (hi - lo).length * 1000
    res = cfg.get("ao_resolution_mm", diag_mm * 0.012) / 1000
    dist = cfg.get("ao_distance_mm", diag_mm * 0.08) / 1000
    for o in final:
        a, b = densify(o, res)
        if b > a:
            log(f"   split edges > {res * 1000:.1f} mm: {o.name:28s} {a:,} -> {b:,} verts")
    log(f"baking AO: {cfg.get('ao_samples', 128)} samples, distance {dist * 1000:.1f} mm")
    bake_ao(final, cfg.get("ao_samples", 128), dist)

# -- 6. export -------------------------------------------------------------------
os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format="GLB",
    export_apply=True,
    export_normals=True,
    export_texcoords=False,
    export_materials="EXPORT",
    export_attributes=True,  # "_AO"
    export_vertex_color="NONE",
    export_yup=True,
    export_cameras=False,
    export_lights=False,
)
log("wrote", out_path)
