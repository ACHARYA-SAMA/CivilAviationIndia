import "server-only";
import manifest from "@/content/media.generated.json";

export type MediaEntry = {
  src: string;
  width: number;
  height: number;
  /** ~20px JPEG as a data URL, used as the next/image blur placeholder. */
  blur: string;
  kind: "photo" | "letter" | "brand" | "video";
  /** Videos: still frame used as poster. */
  poster?: string;
  /** Untouched original for download buttons (letters). */
  download?: string;
  page?: number;
  note?: string;
};

const entries = manifest as Record<string, MediaEntry | undefined>;

export const getMedia = (id: string): MediaEntry | undefined => entries[id];

/** Every id referenced from content must exist; used by `npm run check:content`. */
export const allMediaIds = (): string[] => Object.keys(entries);

/** Films with their poster frames, ready for the client film gallery. */
export const filmItems = <T extends { id: string }>(films: readonly T[]) =>
  films.flatMap((film) => {
    const media = entries[film.id];
    return media?.poster ? [{ ...film, src: media.src, poster: media.poster, width: media.width, height: media.height, blur: media.blur }] : [];
  });

/** Serializable photo data for client components (hover previews, viewers). */
export const previewOf = (id: string): { src: string; width: number; height: number; blur: string } | undefined => {
  const media = entries[id];
  return media ? { src: media.src, width: media.width, height: media.height, blur: media.blur } : undefined;
};
