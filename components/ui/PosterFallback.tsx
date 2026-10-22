import Image from "next/image";

// Still image shown before a 3D block loads, and instead of it when there's no WebGL,
// reduced motion, a lost context, or a render error.
// fit "height": scale to the block's height and centre horizontally (wider blocks show more at the sides, narrower
// ones crop them) - what a fixed vertical-FOV camera does, so the still lines up with the live frame at any aspect.
type Fit = "contain" | "cover" | "height";
type Props = { src?: string; alt: string; visible: boolean; priority?: boolean; fit?: Fit };

const FIT: Record<Fit, string> = {
  contain: "object-contain",
  cover: "object-cover",
  // overrides next/image's inline fill box (inset 0, width 100%); feathered sides blend into the page
  // background on blocks wider than the poster (md+ only: a phone-width block is never much wider than its poster)
  height:
    "w-auto! max-w-none! left-1/2! right-auto! -translate-x-1/2 md:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
};

export function PosterFallback({ src, alt, visible, priority, fit = "contain" }: Props) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      // posters are captured at their display size and encoded once (scripts/posters.sh): re-encoding through
      // the optimizer only stacked a second round of WebP artefacts on the dark gradients
      unoptimized
      sizes={fit === "contain" ? "(max-width: 767px) 100vw, 60vw" : "100vw"}
      // faded posters also become visibility:hidden (after the fade) so Chrome stops compositing a full-size
      // layer over the live canvas every frame (measured: p95 frame 8 -> 25 ms with opacity-0 posters)
      className={`${FIT[fit]} transition-[opacity,visibility] duration-500 ${
        visible ? "visible opacity-100" : "invisible opacity-0"
      }`}
    />
  );
}
