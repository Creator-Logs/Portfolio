#!/usr/bin/env bash
# Steering-wheel page posters -> public/project_media/steering-wheel/poster-*.webp (site running on BASE, default :3000).
# Uses the Playwright that `npx playwright@1.56.1` caches (same version as scripts/posters.sh).
set -euo pipefail
cd "$(dirname "$0")/.."
npx -y playwright@1.56.1 --version >/dev/null
PW="$(ls -d "$(npm config get cache)"/_npx/*/node_modules/playwright 2>/dev/null | head -1)"
py=".venv-models/Scripts/python"; [ -x "$py" ] || py=".venv-models/bin/python"
out="public/project_media/steering-wheel"
tmp="$(mktemp -d)"
PW="$PW" node scripts/posters-steering-wheel.cjs "$tmp"
for f in "$tmp"/*.png; do
  n="$(basename "$f" .png)"
  "$py" -I -c "import sys; from PIL import Image; im = Image.open(sys.argv[1]).convert('RGB'); im.save(sys.argv[2], 'WEBP', quality=94, method=6); print(sys.argv[2], im.size)" \
    "$f" "$out/poster-$n.webp"
done
rm -rf "$tmp" .next/cache/images .next/dev/cache/images
