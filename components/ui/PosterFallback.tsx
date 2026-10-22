import Image from "next/image";

// Still image shown before a 3D block loads, and instead of it when there's no WebGL,
// reduced motion, a lost context, or a render error.
type Props = { src?: string; alt: string; visible: boolean; priority?: boolean; fit?: "contain" | "cover" };

export function PosterFallback({ src, alt, visible, priority, fit = "contain" }: Props) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={fit === "cover" ? "100vw" : "(max-width: 767px) 100vw, 60vw"}
      // faded posters also become visibility:hidden (after the fade) so Chrome stops compositing a full-size
      // layer over the live canvas every frame (measured: p95 frame 8 -> 25 ms with opacity-0 posters)
      className={`${fit === "cover" ? "object-cover" : "object-contain"} transition-[opacity,visibility] duration-500 ${
        visible ? "visible opacity-100" : "invisible opacity-0"
      }`}
    />
  );
}
