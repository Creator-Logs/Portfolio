#!/usr/bin/env bash
# QA gate: render reference vs shipped GLB in the real three.js pipeline and pixel-diff them.
#   scripts/models/qa.sh <slug> [lod]     (dev server must be running on :3000)
# The reference is always the uncompressed *detail* build. For lod=mat the renders are made at mat
# display size (560x420), so the diff answers "is the mat LOD indistinguishable where it is shown?"
set -euo pipefail
cd "$(dirname "$0")/../.."
slug="$1"
lod="${2:-detail}"
name="$slug"; size="1200,900"
if [ "$lod" != detail ]; then name="$slug-$lod"; size="560,420"; fi
out="docs/portfolio/reference/models"
mkdir -p "$out" public/models-qa
cp "assets-src/trinkets/processed/$slug.glb" "public/models-qa/$slug.glb"
py=".venv-models/Scripts/python"; [ -x "$py" ] || py=".venv-models/bin/python"
for v in 0 1 2; do
  for kind in ref ship; do
    src="/models/$slug/$name.glb"
    [ "$kind" = ref ] && src="/models-qa/$slug.glb"
    npx -y playwright@1.56.1 screenshot --channel chrome --viewport-size "$size" \
      --wait-for-selector "body[data-qa-ready]" --wait-for-timeout 1200 \
      "http://localhost:3000/dev/models?src=$src&view=$v" "$out/$name-v$v-$kind.png" >/dev/null
  done
done
"$py" scripts/models/qa_diff.py "$out" "$name"
rm -f "$out/$name"-v?-ref.png "$out/$name"-v?-ship.png
