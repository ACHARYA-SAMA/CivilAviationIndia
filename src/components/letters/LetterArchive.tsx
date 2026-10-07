"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { SignButton } from "@/components/ui/Sign";
import { Tilt } from "@/components/ui/Tilt";
import type { ViewerItem } from "@/components/viewer/LetterViewer";
import type { LetterGroup } from "@/content/letters";
import { cn } from "@/lib/cn";

const LetterViewer = dynamic(() => import("@/components/viewer/LetterViewer").then((mod) => mod.LetterViewer), { ssr: false });

export type ArchiveLetter = ViewerItem & { from: string; office: string; date: string; iso: string; group: LetterGroup; language?: string };

type Filter = LetterGroup | "all";

/**
 * Every letter, filed by year. The year stays pinned beside its letters while you scroll; filters
 * narrow the archive by who wrote; any letter opens in the zoom viewer, and the original scan downloads.
 */
export const LetterArchive = ({ letters, groups }: { letters: readonly ArchiveLetter[]; groups: Record<LetterGroup, string> }) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpenState] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Chronological, so the viewer's previous / next follow the same order as the page.
  const visible = useMemo(
    () => letters.filter((letter) => filter === "all" || letter.group === filter).sort((a, b) => a.iso.localeCompare(b.iso)),
    [letters, filter],
  );
  const years = useMemo(() => {
    const map = new Map<string, ArchiveLetter[]>();
    for (const letter of visible) {
      const year = letter.iso.slice(0, 4);
      map.set(year, [...(map.get(year) ?? []), letter]);
    }
    return [...map.entries()];
  }, [visible]);

  const setOpen = (index: number | null) => {
    if (index !== null) setLoaded(true);
    setOpenState(index);
  };
  const openLetter = (id: string) => setOpen(visible.findIndex((item) => item.id === id));
  const count = (group: Filter) => (group === "all" ? letters.length : letters.filter((letter) => letter.group === group).length);

  return (
    <>
      <div role="group" aria-label="Filter letters by sender" className="mb-16 flex flex-wrap gap-2">
        {(["all", ...(Object.keys(groups) as LetterGroup[])] as Filter[]).map((id) => (
          <SignButton key={id} aria-pressed={filter === id} tone={filter === id ? "location" : "plain"} onClick={() => setFilter(id)}>
            {id === "all" ? "All letters" : groups[id]}
            <span className="readout ml-2 text-[0.75em]">{count(id)}</span>
          </SignButton>
        ))}
      </div>

      <div className="space-y-24">
        {years.map(([year, items]) => (
          <section key={year} aria-labelledby={`year-${year}`} className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <div className="sticky top-[calc(var(--header-h)+1.5rem)]">
                <h2 id={`year-${year}`} className="display text-[clamp(4rem,9vw,8rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-line-strong)]">
                  {year}
                </h2>
                <p className="readout mt-3 text-[0.8125rem] text-sky-300">
                  {items.length} {items.length === 1 ? "letter" : "letters"}
                </p>
              </div>
            </div>
            <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
              {items.map((letter) => (
                <li key={letter.id} className="sd-rise">
                  <Tilt max={6} className="rounded-[2px]">
                    <button
                      type="button"
                      onClick={() => openLetter(letter.id)}
                      data-cursor="Read"
                      aria-label={`Open and zoom the letter from ${letter.from}, ${letter.date}`}
                      className="group/letter relative block w-full overflow-hidden rounded-[2px] bg-white shadow-[0_30px_60px_-28px_rgb(4_30_80/0.5)]"
                    >
                      <Image
                        src={letter.src}
                        alt=""
                        width={letter.width}
                        height={letter.height}
                        sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
                        placeholder="blur"
                        blurDataURL={letter.blur}
                        className="h-auto w-full transition-transform duration-700 ease-flight group-hover/letter:scale-[1.02]"
                      />
                      {/* Light sweep across the paper on hover. */}
                      <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/0.5)_50%,transparent_70%)] transition-transform duration-1000 ease-flight group-hover/letter:translate-x-full" />
                    </button>
                  </Tilt>
                  <div className="mt-5">
                    <p className="heading text-[1.25rem] text-ink">{letter.from}</p>
                    <p className="mt-1 text-[0.875rem] leading-snug text-mute">{letter.office}</p>
                    <p className="readout mt-2 text-[0.75rem] text-sky-300">
                      {letter.date}
                      {letter.language ? <span className="ml-3 text-dim">In {letter.language}</span> : null}
                    </p>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/80">{letter.summary}</p>
                    {letter.download ? (
                      <a
                        href={letter.download}
                        download
                        className={cn("mt-3 inline-flex items-center gap-2 text-[0.875rem] text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:decoration-sky-300")}
                      >
                        Download the original scan
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {loaded ? <LetterViewer items={visible} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </>
  );
};
