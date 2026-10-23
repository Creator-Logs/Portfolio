"""
Steering-wheel page media (docs/portfolio/projects/fsae-steering-wheel.md, build step 2).
Run:  .venv-models/Scripts/python -I scripts/media/steering-wheel.py      (needs ffmpeg on PATH, pillow-heif)

Sources: assets-src/steering-wheel/media/ (copied from Ansh's "Steering Wheel Assets"; gitignored).
Output:  public/project_media/steering-wheel/
- Photos -> one WebP each (EXIF-rotated, Display-P3 -> sRGB via the embedded ICC profile, long edge
  <= 2560; next/image makes the responsive sizes).
- 4K MOV -> muted 1440x1080 loops, H.264 (.mp4, faststart) + VP9 (.webm), <= 3 MB each. The last
  LOOP_FADE s crossfade into the first frames so the handheld clips loop without a jump; the poster
  (.webp) is the loop's first frame so poster -> video is seamless.
"""
import io
import subprocess
import sys
from pathlib import Path

import pillow_heif
from PIL import Image, ImageCms, ImageOps

pillow_heif.register_heif_opener()

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets-src/steering-wheel/media"
OUT = ROOT / "public/project_media/steering-wheel"
LOOP_FADE = 0.5
MAX_MB = 3.0

PHOTOS = {  # output name: (source, max long edge, webp quality, rotate deg CCW, crop fractions after rotating)
    "standoff-stack": ("F7CA10FC-0C15-4084-A65A-49079A4D95CF.jpg", 2560, 85, 0, None),
    # turned so the plate sits as on the car (horns up, grips left/right) - Ansh: show the whole wheel; shoes cropped
    "plate-grips": ("IMG_9298.HEIC", 2560, 85, 90, (0.06, 0.0, 0.98, 0.92)),
    "on-car": ("IMG_9606.JPG", 2560, 85, 0, None),
    "pcb-sandwich": ("16CBD5D0-B947-48A8-9768-85224D86AF05.jpg", 2560, 85, 0, None),
    "lug-calcs": ("Screenshot 2026-10-22 200924.png", 2560, 92, 0, None),  # handwriting: keep it crisp
}

# output name: (source, crop as fractions (x0, y0, x1, y1) of the 4:3 frame, H.264 CRF, VP9 CRF, trim (start, s) or None)
VIDEOS = {
    "scan-rig": ("A001_01311736_C022.MOV", (0.25, 0.05, 1.0, 0.80), 26, 38, None),  # structured-light scan, turntable
    # scan alignment (Ansh 2026-10-22: this one, not C035); first 14 s = one full sweep; sidebar + taskbar cut
    "scan-mesh": ("A001_01311739_C026.MOV", (0.1, 0.0, 0.9, 0.8), 29, 40, (0.0, 14.0)),
    "cnc-standoff": ("A001_02251424_C043.MOV", (0.0, 0.0, 1.0, 1.0), 27, 40, None),  # tri-standoff on the mill
}

# stills pulled from a clip: output name: (source, time s, crop)
STILLS = {
    "clay-grip": ("A001_01311736_C022.MOV", 4.6, (0.58, 0.18, 0.98, 0.58)),  # projector off: the bare clay grip
}

SRGB = ImageCms.createProfile("sRGB")


def to_srgb(im):
    icc = im.info.get("icc_profile")
    im = im.convert("RGB")
    if icc:
        im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(icc)), SRGB, outputMode="RGB")
    return im


def save_webp(im, path, quality):
    im.save(path, "WEBP", quality=quality, method=6)
    print(f"  {path.name:28s} {im.width}x{im.height}  {path.stat().st_size / 1e3:7.0f} kB")


def photos():
    for name, (src, edge, q, rot, crop) in PHOTOS.items():
        im = to_srgb(ImageOps.exif_transpose(Image.open(SRC / src)))
        if rot:
            im = im.rotate(rot, expand=True)
        if crop:
            im = im.crop(tuple(round(f * d) for f, d in zip(crop, (im.width, im.height) * 2)))
        im.thumbnail((edge, edge), Image.LANCZOS)
        save_webp(im, OUT / f"{name}.webp", q)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def probe(src, entry):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", entry,
                        "-of", "csv=p=0", str(src)], check=True, capture_output=True, text=True)
    return r.stdout.strip().split("\n")[0].rstrip(",")


def crop_filter(src, crop):
    w, h = (int(v) for v in probe(src, "stream=width,height").split(","))
    x0, y0, x1, y1 = crop
    cw, ch = round((x1 - x0) * w / 2) * 2, round((y1 - y0) * h / 2) * 2
    return f"crop={cw}:{ch}:{round(x0 * w)}:{round(y0 * h)}"


def videos():
    for name, (src, crop, crf264, crf_vp9, trim) in VIDEOS.items():
        src = SRC / src
        dur = float(probe(src, "format=duration"))
        cut = []
        if trim:
            cut = ["-ss", str(trim[0]), "-t", str(trim[1])]
            dur = min(trim[1], dur - trim[0])
        # body = [fade, end]; its last `fade` s dissolve into the head [0, fade] = the body's first frames
        graph = (f"[0:v]{crop_filter(src, crop)},scale=1440:1080:flags=lanczos,setsar=1,format=yuv420p,split[a][b];"
                 f"[a]trim=0:{LOOP_FADE},setpts=PTS-STARTPTS[head];"
                 f"[b]trim={LOOP_FADE},setpts=PTS-STARTPTS[body];"
                 f"[body][head]xfade=transition=fade:duration={LOOP_FADE}:offset={dur - 2 * LOOP_FADE:.3f}[v]")
        mp4, webm = OUT / f"{name}.mp4", OUT / f"{name}.webm"
        ffmpeg(*cut, "-i", str(src), "-filter_complex", graph, "-map", "[v]", "-an", "-c:v", "libx264",
               "-preset", "veryslow", "-crf", str(crf264), "-profile:v", "high", "-pix_fmt", "yuv420p",
               "-movflags", "+faststart", str(mp4))
        ffmpeg(*cut, "-i", str(src), "-filter_complex", graph, "-map", "[v]", "-an", "-c:v", "libvpx-vp9",
               "-crf", str(crf_vp9), "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
               str(webm))
        ffmpeg("-i", str(mp4), "-frames:v", "1", str(OUT / f"{name}.png"))
        poster = Image.open(OUT / f"{name}.png").convert("RGB")
        (OUT / f"{name}.png").unlink()
        save_webp(poster, OUT / f"{name}.webp", 85)
        for f in (mp4, webm):
            mb = f.stat().st_size / 1e6
            print(f"  {f.name:28s} {dur - LOOP_FADE:5.2f} s  {mb:5.2f} MB" + ("  OVER BUDGET" if mb > MAX_MB else ""))


def stills():
    for name, (src, t, crop) in STILLS.items():
        src = SRC / src
        png = OUT / f"{name}.png"
        ffmpeg("-ss", str(t), "-i", str(src), "-frames:v", "1", "-vf", crop_filter(src, crop), str(png))
        im = Image.open(png).convert("RGB")
        png.unlink()
        save_webp(im, OUT / f"{name}.webp", 85)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])  # optional: photos / videos / stills
    for step in (photos, stills, videos):
        if not only or step.__name__ in only:
            print(step.__name__)
            step()
