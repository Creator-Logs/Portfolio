import Image from "next/image";

// Still image shown before a 3D block loads, and instead of it when there's no WebGL,
// reduced motion, a lost context, or a render error.
type Props = { src?: string; alt: string; visible: boolean; priority?: boolean };

export function PosterFallback({ src, alt, visible, priority }: Props) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 767px) 100vw, 60vw"
      className={`object-contain transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}
