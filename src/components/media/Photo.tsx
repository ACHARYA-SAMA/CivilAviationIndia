import Image from "next/image";
import { cn } from "@/lib/cn";
import { getMedia } from "@/lib/media";

type PhotoProps = {
  id: string;
  /** Required: describe what is in the photo, or pass "" only for purely decorative use. */
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /**
   * natural: drawn at the file's own aspect ratio, never cropped or stretched.
   * cover: fills a positioned parent that sets the box; crops, never stretches.
   */
  mode?: "natural" | "cover";
  /** object-position for cover mode, e.g. "50% 30%". */
  position?: string;
};

/** The only way photographs reach the page: real files from the manifest, sized from their true pixel dimensions. */
export const Photo = ({ id, alt, sizes, priority = false, className, imgClassName, mode = "natural", position }: PhotoProps) => {
  const media = getMedia(id);

  if (!media) {
    // A missing id is a content bug: loud in dev, an empty dark panel in production.
    if (process.env.NODE_ENV === "development") console.warn(`[Photo] unknown media id "${id}"`);
    return <div role="img" aria-label={alt} data-missing-media={id} className={cn("bg-deck-800", mode === "cover" ? "absolute inset-0" : "aspect-[4/3] w-full", className)} />;
  }

  const common = { src: media.src, alt, sizes, priority, placeholder: media.blur ? ("blur" as const) : ("empty" as const), blurDataURL: media.blur || undefined };

  if (mode === "cover") {
    return (
      <Image
        {...common}
        fill
        className={cn("object-cover", imgClassName, className)}
        style={position ? { objectPosition: position } : undefined}
      />
    );
  }

  return <Image {...common} width={media.width} height={media.height} className={cn("h-auto w-full", imgClassName, className)} />;
};
