import Image from "next/image";
import { LoopVideo } from "./LoopVideo";

// DESIGN.md §5 Figure: a photo or loop with a mono caption below; rounded 12px, never text over the image.
type Media = { src: string; w: number; h: number } | { video: string };
type Props = Media & { caption: string; sizes?: string; className?: string };

export function Figure({ caption, sizes = "(max-width: 767px) 100vw, 50vw", className = "", ...media }: Props) {
  return (
    <figure className={className}>
      {"video" in media ? (
        <LoopVideo src={media.video} label={caption} />
      ) : (
        <Image src={media.src} alt={caption} width={media.w} height={media.h} sizes={sizes} className="h-auto w-full rounded-xl" />
      )}
      <figcaption className="type-label mt-3 text-grey-brown">{caption}</figcaption>
    </figure>
  );
}
