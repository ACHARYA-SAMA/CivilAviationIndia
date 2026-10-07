"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { HOLDER_GALLERY } from "./groups";
import { LightTable } from "./LightTable";
import { Segmented } from "@/components/ui/Segmented";
import type { ViewerItem } from "@/components/viewer/LetterViewer";
import type { GalleryGroup } from "@/content/gallery";
import { cn } from "@/lib/cn";

const LetterViewer = dynamic(() => import("@/components/viewer/LetterViewer").then((mod) => mod.LetterViewer), { ssr: false });

export type GalleryPhoto = ViewerItem & { group: GalleryGroup };

type Filter = GalleryGroup | "all";

/**
 * The gallery: an endless light table to wander (hero), then the full archive as a masonry wall with
 * filters. Both open the same zoom viewer.
 */
export const GalleryExplorer = ({ photos, groups, total }: { photos: readonly GalleryPhoto[]; groups: Record<GalleryGroup, string>; total: number }) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [viewerItems, setViewerItems] = useState<readonly GalleryPhoto[]>(photos);
  const [open, setOpenState] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const visible = useMemo(() => photos.filter((photo) => filter === "all" || photo.group === filter), [photos, filter]);

  // The light table mixes every group: interleave them so neighbouring prints differ.
  const tablePhotos = useMemo(() => {
    const byGroup = Object.keys(groups).map((key) => photos.filter((photo) => photo.group === key && photo.group !== "press"));
    const mixed: GalleryPhoto[] = [];
    for (let i = 0; mixed.length < 40 && i < 60; i++) for (const list of byGroup) if (list[i] && mixed.length < 40) mixed.push(list[i]!);
    return mixed;
  }, [photos, groups]);

  const openIn = (list: readonly GalleryPhoto[], id: string) => {
    setViewerItems(list);
    setLoaded(true);
    setOpenState(list.findIndex((photo) => photo.id === id));
  };

  return (
    <>
      <section id="top" data-fl="Gallery" className="night field relative mt-[var(--frame)] h-[calc(100svh-var(--frame))] min-h-[38rem] bg-[linear-gradient(180deg,#0b3d8f,#072a66)]">
        <LightTable photos={tablePhotos} onOpen={(id) => openIn(photos, id)}>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_80%,rgb(5_32_86/0.92),rgb(6_40_100/0.4)_55%,transparent_80%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <div className="container-deck pb-12 md:pb-16">
              <h1 className="display text-[clamp(3rem,10vw,10rem)] text-ink">
                <span className="block overflow-hidden pb-[0.05em]">
                  <span className="block animate-line-rise">Gallery</span>
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-[1.125rem] leading-relaxed text-ink/90">
                {total} photographs from the society’s records: the campus and its aircraft, the 2015 exhibition, Skill Africa, ceremonies and the press.
              </p>
              <p className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white/12 px-4 py-2 text-[0.875rem] text-ink ring-1 ring-white/20 backdrop-blur-md">
                <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-hud" />
                Drag the table, or open a print
              </p>
            </div>
          </div>
        </LightTable>
      </section>

      <section id="archive" data-fl="Archive" className="relative py-20 md:py-28">
        <div className="container-deck">
          <Segmented
            label="Filter photographs"
            className="mb-12"
            value={filter}
            onChange={setFilter}
            options={(["all", ...(Object.keys(groups) as GalleryGroup[])] as Filter[]).map((id) => ({
              id,
              marker: id === "all" ? undefined : HOLDER_GALLERY[id],
              label: (
                <>
                  {id === "all" ? "All" : groups[id]}
                  <span className="text-[0.8em] tabular-nums opacity-60">{id === "all" ? photos.length : photos.filter((photo) => photo.group === id).length}</span>
                </>
              ),
            }))}
          />

          <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 2xl:columns-4">
            {visible.map((photo) => (
              <li key={photo.id} className="mb-5 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => openIn(visible, photo.id)}
                  data-cursor="View"
                  aria-label={`Open photograph: ${photo.title ?? groups[photo.group]}`}
                  className="group/photo relative block w-full overflow-hidden rounded-[14px] bg-deck-900"
                >
                  <Image
                    src={photo.src}
                    alt=""
                    width={photo.width}
                    height={photo.height}
                    sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                    placeholder={photo.blur ? "blur" : "empty"}
                    blurDataURL={photo.blur || undefined}
                    className="h-auto w-full transition-[transform,filter] duration-700 ease-flight group-hover/photo:scale-[1.04] group-hover/photo:brightness-110"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-end bg-gradient-to-t from-deck-950/95 to-transparent p-4 pt-12 text-left transition-transform duration-500 ease-flight group-hover/photo:translate-y-0 group-focus-visible/photo:translate-y-0">
                    <span>
                      <span className="flex items-center gap-2 text-[0.75rem] text-mute">
                        <span aria-hidden className={cn("inline-block h-2.5 w-1", HOLDER_GALLERY[photo.group])} />
                        {groups[photo.group]}
                      </span>
                      {photo.title ? <span className="mt-1 block text-[0.9375rem] leading-snug text-ink">{photo.title}</span> : null}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {loaded ? <LetterViewer items={viewerItems} index={open} onIndex={setOpenState} onClose={() => setOpenState(null)} noun="Photo" /> : null}
    </>
  );
};
