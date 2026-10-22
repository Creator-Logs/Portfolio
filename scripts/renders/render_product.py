"""
Product stills for the landing's Selected Works tiles (light studio sweep) - Blender Cycles, headless.
Run:  scripts/renders/render.sh <slug>          (wraps the call below + WebP encode)
      blender -b --factory-startup -P scripts/renders/render_product.py -- <config.json> <in.glb> <out.png>

Input is the pipeline's *uncompressed* processed GLB (assets-src/trinkets/processed/<slug>.glb), whose
material names carry the presets ("preset#hex", scripts/models/process.py). Each preset is rebuilt here
as a Principled BSDF mirroring components/three/materials.ts, with the same procedural detail
(carbon twill, SLS grain, FDM layer lines, brushed aluminium) - real path tracing does the rest:
soft shadows, contact occlusion, bounce light.
"""
import json
import math
import sys

import bpy
import mathutils

argv = sys.argv[sys.argv.index("--") + 1:]
cfg = json.load(open(argv[0]))
glb, out = argv[1], argv[2]


def log(*a):
    print("[render]", *a, flush=True)


def lin(hexc):
    c = int(hexc.lstrip("#"), 16)
    rgb = [((c >> s) & 255) / 255 for s in (16, 8, 0)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in rgb] + [1]


# preset -> (base colour, metallic, roughness, extras); mirrors components/three/materials.ts
PRESETS = {
    "pla_matte": ("#333333", 0, 0.6, {"detail": "layers"}),
    "pla_silk": ("#8a8a8a", 0, 0.35, {"detail": "layers", "coat": 0.3}),
    "sls_nylon": ("#2a2a2a", 0, 0.7, {"detail": "sls"}),
    "plastic_black": ("#121212", 0, 0.55, {"detail": "sls"}),
    "pei_black": ("#161616", 0, 0.82, {"detail": "sls"}),
    "alu_extrusion_black": ("#151515", 1, 0.4, {"detail": "brushed"}),
    "alu_machined": ("#c8c8c8", 1, 0.25, {"detail": "brushed"}),
    "alu_anodized_gold": ("#c9a04c", 1, 0.3, {"detail": "brushed"}),
    "steel_polished": ("#d6d6d6", 1, 0.15, {}),
    "steel_stainless": ("#b9bbbc", 1, 0.22, {}),
    "steel_black_oxide": ("#2b2b2d", 1, 0.38, {}),
    "steel_zinc": ("#c4c6c2", 1, 0.3, {}),
    "brass": ("#c9a14a", 1, 0.25, {}),
    "carbon_fiber": ("#111111", 0, 0.35, {"detail": "carbon", "coat": 1.0, "coat_rough": 0.05}),
    "rubber_silicone": ("#141414", 0, 0.7, {}),
    "pcb_soldermask": ("#0d3b1e", 0, 0.35, {"coat": 0.6}),
    "pcb_gold": ("#d4a64a", 1, 0.25, {}),
    "polycarbonate_clear": ("#dfe7ea", 0, 0.04, {"glass": True}),
    "acrylic_clear": ("#ffffff", 0, 0.05, {"glass": True}),
    "screen_glass": ("#000000", 0, 0.05, {"coat": 1.0}),
}


# -- scene --------------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
model = [o for o in bpy.context.scene.objects if o.type == "MESH"]
root = bpy.data.objects.new("product", None)
bpy.context.scene.collection.objects.link(root)
for o in model:
    if o.parent is None:
        o.parent = root
root.rotation_euler = (0, 0, math.radians(cfg.get("yaw_deg", 0)))
bpy.context.view_layer.update()


def bounds(objs):
    pts = [o.matrix_world @ mathutils.Vector(c) for o in objs for c in o.bound_box]
    lo = mathutils.Vector([min(p[i] for p in pts) for i in range(3)])
    hi = mathutils.Vector([max(p[i] for p in pts) for i in range(3)])
    return lo, hi


lo, hi = bounds(model)
centre = (lo + hi) / 2
size = (hi - lo).length
root.location.z -= lo.z  # rest on the floor
bpy.context.view_layer.update()
lo, hi = bounds(model)
centre = (lo + hi) / 2
log("size (mm):", [round(v * 1000) for v in (hi - lo)])


# -- materials ----------------------------------------------------------------------------
def obj_coords(nt):
    tc = nt.nodes.new("ShaderNodeTexCoord")
    return tc.outputs["Object"]


def math_node(nt, op, a, b=None):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            nt.links.new(v, n.inputs[i])
    return n.outputs[0]


def add_detail(nt, bsdf, kind):
    """Height -> Bump node into the BSDF normal; roughness variation where it matters."""
    links = nt.links
    co = obj_coords(nt)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    links.new(co, sep.inputs[0])
    bump = nt.nodes.new("ShaderNodeBump")
    if kind == "sls":
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 2800  # ~0.35 mm grains (object space = metres)
        noise.inputs["Detail"].default_value = 3
        links.new(co, noise.inputs["Vector"])
        links.new(noise.outputs["Fac"], bump.inputs["Height"])
        bump.inputs["Distance"].default_value = 0.00003
        bump.inputs["Strength"].default_value = 0.6
    elif kind == "layers":
        wave = nt.nodes.new("ShaderNodeTexWave")
        wave.wave_type = "BANDS"
        wave.bands_direction = "Z"
        wave.inputs["Scale"].default_value = 2 * math.pi / (10 * 0.0002)  # bands period 2pi/(10*scale): 0.2 mm layers
        wave.inputs["Distortion"].default_value = 0
        links.new(co, wave.inputs["Vector"])
        links.new(wave.outputs["Fac"], bump.inputs["Height"])
        bump.inputs["Distance"].default_value = 0.00001
        bump.inputs["Strength"].default_value = 0.25
    elif kind == "brushed":
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.inputs["Scale"].default_value = (7000, 7000, 60)  # streaks along Z (vertical)
        links.new(co, mapping.inputs["Vector"])
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 1
        noise.inputs["Detail"].default_value = 4
        links.new(mapping.outputs[0], noise.inputs["Vector"])
        links.new(noise.outputs["Fac"], bump.inputs["Height"])
        bump.inputs["Distance"].default_value = 0.000008
        bump.inputs["Strength"].default_value = 0.4
        rough = math_node(nt, "MULTIPLY_ADD", noise.outputs["Fac"], 0.16)
        rough.node.inputs[2].default_value = bsdf.inputs["Roughness"].default_value - 0.08
        links.new(rough, bsdf.inputs["Roughness"])
    elif kind == "carbon":
        # 2x2 twill on the plate plane (Blender XZ = the wheel face), 2.5 mm tows
        tow = 0.0025
        u = math_node(nt, "DIVIDE", sep.outputs["X"], tow)
        v = math_node(nt, "DIVIDE", sep.outputs["Z"], tow)
        cell = math_node(nt, "ADD", math_node(nt, "FLOOR", u), math_node(nt, "FLOOR", v))
        warp = math_node(nt, "LESS_THAN", math_node(nt, "FLOORED_MODULO", cell, 4), 1.5)
        across_u = math_node(nt, "SINE", math_node(nt, "MULTIPLY", math_node(nt, "FRACT", u), math.pi))
        across_v = math_node(nt, "SINE", math_node(nt, "MULTIPLY", math_node(nt, "FRACT", v), math.pi))
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "FLOAT"
        links.new(warp, mix.inputs["Factor"])
        links.new(across_u, mix.inputs[2])  # weft: bulges across u
        links.new(across_v, mix.inputs[3])  # warp: bulges across v
        links.new(mix.outputs[0], bump.inputs["Height"])
        bump.inputs["Distance"].default_value = 0.00006
        bump.inputs["Strength"].default_value = 0.7
        rough = nt.nodes.new("ShaderNodeMix")
        rough.data_type = "FLOAT"
        links.new(warp, rough.inputs["Factor"])
        rough.inputs[2].default_value = 0.5
        rough.inputs[3].default_value = 0.22
        links.new(rough.outputs[0], bsdf.inputs["Roughness"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])


for m in bpy.data.materials:
    preset, _, hexc = m.name.partition("#")
    preset = preset.split(".")[0]
    if preset not in PRESETS:
        continue
    base, metal, rough, extra = PRESETS[preset]
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    outn = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs[0], outn.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = lin("#" + hexc if hexc else base)
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    if extra.get("coat"):
        bsdf.inputs["Coat Weight"].default_value = extra["coat"]
        bsdf.inputs["Coat Roughness"].default_value = extra.get("coat_rough", 0.1)
    if extra.get("glass"):
        bsdf.inputs["Transmission Weight"].default_value = 1
        bsdf.inputs["IOR"].default_value = 1.58
    if extra.get("detail"):
        add_detail(nt, bsdf, extra["detail"])
    log("material", m.name)


# -- studio: warm cyclorama sweep, big soft key, fill, rim --------------------------------
SWEEP = lin(cfg.get("sweep", "#E6E0D7"))
R = size * 6
bpy.ops.mesh.primitive_plane_add(size=1)
sweep = bpy.context.active_object
sweep.name = "sweep"
me = sweep.data
import bmesh  # noqa: E402

bm = bmesh.new()
# profile in (z, y): floor from the front edge to just behind the product, a cove, then the back wall
cove = [(R * 0.25 * (1 - math.cos(t)), R * 0.6 + R * 0.25 * math.sin(t)) for t in [i / 16 * math.pi / 2 for i in range(17)]]
pts = [(0.0, -R)] + cove + [(R * 1.5, R * 0.85)]
rows = []
for z, y in pts:
    rows.append([bm.verts.new((x, y, z)) for x in (-R * 2, R * 2)])
for a, b in zip(rows, rows[1:]):
    bm.faces.new((a[0], a[1], b[1], b[0]))
me.clear_geometry()
bm.to_mesh(me)
bm.free()
for p in me.polygons:
    p.use_smooth = True
sweep.location = (0, 0, 0)
sweep.rotation_euler = (0, 0, math.radians(cfg.get("sweep_yaw_deg", 0)))
smat = bpy.data.materials.new("sweep")
smat.use_nodes = True
sb = smat.node_tree.nodes["Principled BSDF"]
sb.inputs["Base Color"].default_value = SWEEP
sb.inputs["Roughness"].default_value = 0.9
me.materials.append(smat)


def area_light(name, loc, energy, size_xy, color="#FFFFFF", target=None):
    data = bpy.data.lights.new(name, "AREA")
    data.shape = "RECTANGLE"
    data.size, data.size_y = size_xy
    data.energy = energy
    data.color = lin(color)[:3]
    ob = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = centre + mathutils.Vector(loc) * size
    d = (target or centre) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


s2 = size * size
k = cfg.get("light", 1.0)
area_light("key", (-0.9, -0.6, 1.6), 90 * s2 * k, (size * 1.6, size * 1.2), "#FFF4E8")
area_light("fill", (1.4, -1.0, 0.5), 14 * s2 * k, (size * 1.5, size * 1.5), "#FFF8F0")
area_light("rim", (0.9, 1.2, 1.0), 70 * s2 * k, (size * 0.25, size * 1.4), "#FFFFFF")
area_light("top", (0, 0, 2.2), 25 * s2 * k, (size * 2.5, size * 2.5), "#FFFFFF")
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = SWEEP
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.25
bpy.context.scene.world = world

# -- camera -------------------------------------------------------------------------------
cam_d = bpy.data.cameras.new("cam")
cam_d.lens = cfg.get("lens", 85)
cam = bpy.data.objects.new("cam", cam_d)
bpy.context.scene.collection.objects.link(cam)
bpy.context.scene.camera = cam
d = mathutils.Vector(cfg.get("view", [-0.55, -1, 0.45])).normalized()
aim = centre + mathutils.Vector(cfg.get("aim_offset", [0, 0, 0])) * size
sensor_half = math.atan(cam_d.sensor_width / 2 / cam_d.lens)  # horizontal
w, h = cfg.get("resolution", [2560, 1920])
vert_half = math.atan(math.tan(sensor_half) * h / w)
dist = (size / 2) / math.sin(min(sensor_half, vert_half)) / cfg.get("fill", 0.8)
cam.location = aim + d * dist
cam.rotation_euler = (aim - cam.location).to_track_quat("-Z", "Y").to_euler()
cam_d.clip_start, cam_d.clip_end = dist / 100, dist * 20
cam_d.dof.use_dof = True
cam_d.dof.focus_distance = (aim - cam.location).length
cam_d.dof.aperture_fstop = cfg.get("fstop", 11)

# -- render -------------------------------------------------------------------------------
sc = bpy.context.scene
sc.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
for backend in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
    try:
        prefs.compute_device_type = backend
        prefs.get_devices()
        if any(dv.type != "CPU" for dv in prefs.devices):
            for dv in prefs.devices:
                dv.use = True
            sc.cycles.device = "GPU"
            log("device", backend)
            break
    except TypeError:
        continue
sc.cycles.samples = cfg.get("samples", 384)
sc.cycles.use_denoising = True
sc.cycles.max_bounces = 8
sc.render.resolution_x, sc.render.resolution_y = w, h
sc.render.film_transparent = False
sc.view_settings.view_transform = "AgX"
try:
    sc.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass
sc.view_settings.exposure = cfg.get("exposure", 0)
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_depth = "16"
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
log("wrote", out)
