#!/usr/bin/env bash
# Landing poster stills (LCP, reduced motion, no-WebGL, context loss), captured from the live scenes so the
# poster -> 3D crossfade is seamless (3D_GUIDE §1.4). The site must be running (BASE, default :3000);
# ?poster[=showcase] renders at the screenshot's full DPR with the page DOM hidden (SceneRoot / globals.css).
#   scripts/posters.sh            -> public/project_media/landing/{hero,hero-mobile,showcase}.webp
set -euo pipefail
cd "$(dirname "$0")/.."
base="${BASE:-http://localhost:3000}"
py=".venv-models/Scripts/python"; [ -x "$py" ] || py=".venv-models/bin/python"
out="public/project_media/landing"
tmp="$(mktemp -d)"
shot() { # name device viewport query
  npx -y playwright@1.56.1 screenshot --channel chrome --device "$2" --viewport-size "$3" \
    --wait-for-selector "body[data-poster-ready]" --wait-for-timeout 1500 --timeout 120000 \
    "$base/?$4" "$tmp/$1.png" >/dev/null
  "$py" -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], 'WEBP', quality=94, method=6)" \
    "$tmp/$1.png" "$out/$1.webp"
  "$py" -I -c "import sys; from PIL import Image; print(sys.argv[1], Image.open(sys.argv[1]).size)" "$out/$1.webp"
}
shot hero "Desktop Chrome HiDPI" "1440,900" "poster=hero"          # 2880 x 1800
shot hero-mobile "Galaxy S8" "390,844" "poster=hero"               # 1170 x 2532 (a DPR-3 Chromium phone)
shot showcase "Desktop Chrome HiDPI" "1440,900" "poster=showcase"  # 2880 x 1800
rm -rf "$tmp"
rm -rf .next/cache/images .next/dev/cache/images  # the image optimizer caches by URL for 4 h (dev: .next/dev); same-name posters would stay stale
