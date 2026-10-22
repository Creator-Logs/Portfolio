#!/usr/bin/env bash
# STEP -> web GLB, fidelity first (docs/portfolio/3D_GUIDE.md §1).
#   scripts/models/build.sh <slug> [lod]     e.g. scripts/models/build.sh steering-wheel mat
# LODs are exact CAD tessellations at different max surface errors (never decimation):
#   detail (default): 0.02 mm / 20 deg -> public/models/<slug>/<slug>.glb      (project pages, close-ups)
#   mat:              0.1 mm / 30 deg  -> public/models/<slug>/<slug>-mat.glb  (landing mat: < 0.2 px error)
# A config may override with "lods": {"mat": {"linear_mm": .., "angular_deg": ..}}.
# Needs: .venv-models (python -m venv .venv-models && .venv-models/Scripts/pip install cascadio trimesh),
#        Blender 5.2 (override with BLENDER=...), and the per-model config scripts/models/<slug>.json.
set -euo pipefail
cd "$(dirname "$0")/../.."

slug="$1"
lod="${2:-detail}"
cfg="scripts/models/$slug.json"
defaults='{"detail":{"linear_mm":0.02,"angular_deg":20},"mat":{"linear_mm":0.1,"angular_deg":30}}'
read -r lin ang < <(node -e "const c=require('./$cfg'),d=$defaults,l=Object.assign({},d['$lod'],(c.lods||{})['$lod']);if(!l.linear_mm)throw new Error('unknown lod $lod');console.log(l.linear_mm,l.angular_deg)")
name="$slug"; [ "$lod" = detail ] || name="$slug-$lod"
step=$(node -p "require('./$cfg').source")
blender="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
py=".venv-models/Scripts/python"
[ -x "$py" ] || py=".venv-models/bin/python"
work="assets-src/trinkets"
mkdir -p "$work/raw" "$work/processed" "public/models/$slug"

echo "== 1/3 tessellate [$lod] (max surface error $lin mm, $ang deg)"
"$py" -c "import cascadio, math, sys; cascadio.step_to_glb(sys.argv[1], sys.argv[2], tol_linear=float(sys.argv[3]), tol_angular=math.radians(float(sys.argv[4])))" \
  "$step" "$work/raw/$name.glb" "$lin" "$ang" 2>&1 | grep -v "^RWGltf_CafWriter skipped" || true

echo "== 2/3 Blender: orient, cull never-visible parts, materials, join per material, bake AO"
"$blender" -b --factory-startup -P scripts/models/process.py -- "$cfg" "$work/raw/$name.glb" "$work/processed/$name.glb" \
  2>&1 | grep -E "^\[process\]|Error|Traceback"

echo "== 3/3 lossless-ish compression (no simplify): dedup, weld, prune, 16-bit positions + normals, meshopt"
t="$work/processed/$name"
npx gltf-transform dedup "$t.glb" "$t.a.glb" --materials false  # material names carry the presets
npx gltf-transform weld "$t.a.glb" "$t.b.glb"
npx gltf-transform prune "$t.b.glb" "$t.c.glb"
# meshopt quantizes internally (defaults 14-bit pos / 10-bit normals) — set precision here, not in a separate step.
npx gltf-transform meshopt "$t.c.glb" "public/models/$slug/$name.glb" --level medium --quantize-position 16 --quantize-normal 16
rm -f "$t.a.glb" "$t.b.glb" "$t.c.glb"
npx gltf-transform inspect "public/models/$slug/$name.glb" --format md | grep -E "renderVertexCount|^\| 0 " | head -4
ls -la "public/models/$slug/"
