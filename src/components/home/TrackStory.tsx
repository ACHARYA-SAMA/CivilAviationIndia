"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { SignLink } from "@/components/ui/Sign";
import { cn } from "@/lib/cn";
import { scrollToY } from "@/lib/lenis";
import { DUR, EASE } from "@/lib/motion";

export type Track = {
  id: string;
  label: string;
  summary: string;
  tagline: string;
  partners: string;
  href: string;
  /** Server-rendered photograph, or null when the owner supplied none (then `points` fills the panel). */
  photo: ReactNode | null;
  points?: readonly string[];
  /** Flagship practical, shown on the typographic panel. */
  project?: string;
};

/**
 * Scroll story: the section pins and each track takes a quarter of the scroll. The scroll position
 * (not a timer) chooses the active track, and tapping a track jumps there.
 */
export const TrackStory = ({ tracks }: { tracks: readonly Track[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(tracks.length - 1, Math.max(0, Math.floor(value * tracks.length)));
    setActive((current) => (current === next ? current : next));
  });

  const jumpTo = (index: number) => {
    const node = ref.current;
    if (!node) return;
    const sectionTop = node.getBoundingClientRect().top + window.scrollY;
    scrollToY(sectionTop + ((node.offsetHeight - innerHeight) * (index + 0.5)) / tracks.length);
  };

  const current = tracks[active] ?? tracks[0];
  if (!current) return null;

  return (
    <div ref={ref} style={{ height: `${tracks.length * 100 + 40}svh` }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col pt-[calc(var(--header-h)+1rem)] pb-6 lg:pb-10">
        <div className="container-deck grid min-h-0 flex-1 gap-6 lg:grid-cols-12 lg:gap-12">
          {/* Track list + detail */}
          <div className="flex min-h-0 flex-col gap-10 lg:col-span-5 lg:pt-4">
            <ol className="relative border-l border-line pl-5">
              <span
                aria-hidden
                className="absolute top-0 -left-[1.5px] w-[3px] rounded-full bg-sky-500 transition-[height,transform] duration-500 ease-flight"
                style={{ height: `${100 / tracks.length}%`, transform: `translateY(${active * 100}%)` }}
              />
              {tracks.map((track, index) => (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(index)}
                    aria-current={index === active ? "true" : undefined}
                    className={cn(
                      "display block py-1.5 text-left text-[clamp(1.5rem,3.4vw,3.25rem)] transition-colors duration-300 ease-flight",
                      index === active ? "text-ink" : "text-ink/55 hover:text-ink/80",
                    )}
                  >
                    {track.label}
                  </button>
                </li>
              ))}
            </ol>

            <div className="hidden min-h-0 lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: DUR.base, ease: EASE }}
                >
                  <Detail track={current} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Image / panel */}
          <div className="relative min-h-0 lg:col-span-7">
            <div className="night grain absolute inset-0 overflow-hidden rounded-[22px] bg-deck-800 shadow-[0_40px_80px_-40px_rgb(4_30_80/0.6)]">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  aria-hidden={index !== active}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ clipPath: index === active ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: index === active ? 1 : 1.06 }}
                  transition={{ duration: reduced ? 0 : DUR.slow, ease: EASE }}
                  style={{ zIndex: index === active ? 2 : 1 }}
                >
                  {track.photo ?? <PointsPanel track={track} />}
                </motion.div>
              ))}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/3 bg-gradient-to-t from-deck-950/80 to-transparent" />
              <p className="label absolute bottom-4 left-4 z-[4] text-ink/90">
                {String(active + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        {/* Small screens: detail sits under the picture */}
        <div className="container-deck mt-5 lg:hidden">
          <Detail track={current} compact />
        </div>
      </div>
    </div>
  );
};

const Detail = ({ track, compact = false }: { track: Track; compact?: boolean }) => (
  <div>
    <p className={cn("text-ink", compact ? "text-base" : "text-xl leading-snug")}>{track.summary}</p>
    <p className={cn("mt-3 text-mute", compact ? "text-sm" : "text-[0.9375rem]")}>
      {track.tagline} <span className="text-dim">{compact ? "" : `Partners and regulators: ${track.partners}`}</span>
    </p>
    <SignLink href={track.href} tone="plain" size="sm" className="mt-5">
      Programme details
    </SignLink>
  </div>
);

const PointsPanel = ({ track }: { track: Track }) => (
  <div className="flex h-full flex-col justify-end bg-deck-800 p-6 md:p-10">
    {track.project ? <p className="mb-auto max-w-md text-[0.9375rem] text-mute">{track.project}</p> : null}
    <ul className="divide-y divide-line border-y border-line">
      {track.points?.map((point) => (
        <li key={point} className="display-wide py-2.5 text-[clamp(1.125rem,2.6vw,2.5rem)] text-ink md:py-4">
          {point}
        </li>
      ))}
    </ul>
  </div>
);
