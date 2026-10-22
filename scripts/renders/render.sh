#!/usr/bin/env bash
# Selected Works product still (light studio sweep, Cycles) -> public/project_media/<slug>/render.webp
#   scripts/renders/render.sh <slug>        (needs the processed detail GLB from scripts/models/build.sh)
set -euo pipefail
cd "$(dirname "$0")/../.."
slug="$1"
blender="${BLENDER:-/c/Program Files/Blender Foundation/Blender 5.2/blender.exe}"
py=".venv-models/Scripts/python"; [ -x "$py" ] || py=".venv-models/bin/python"
png="assets-src/renders/$slug.png"
mkdir -p assets-src/renders "public/project_media/$slug"
"$blender" -b --factory-startup -P scripts/renders/render_product.py -- \
  "scripts/renders/$slug.json" "assets-src/trinkets/processed/$slug.glb" "$(pwd)/$png" 2>&1 | grep -E "^\[render\]|Error|Traceback"
"$py" -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], 'WEBP', quality=90, method=6)" \
  "$png" "public/project_media/$slug/render.webp"
ls -la "public/project_media/$slug/render.webp"
rm -rf .next/cache/images .next/dev/cache/images  # the image optimizer caches by URL for 4 h (dev: .next/dev); same-name stills would stay stale
