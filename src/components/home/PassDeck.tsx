"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BoardingPass, type PassProgram } from "@/components/programs/BoardingPass";
import { HOLDER } from "@/components/programs/streams";
import { Livery } from "@/components/ui/Livery";
import { Segmented } from "@/components/ui/Segmented";
import { Tilt } from "@/components/ui/Tilt";
import { cn } from "@/lib/cn";

export type DeckItem = { program: PassProgram; photo: ReactNode };

const TABS = [
  { id: "all", label: "All programs" },
  { id: "pilot", label: "Pilot" },
  { id: "engineering", label: "Engineering" },
  { id: "management", label: "Management" },
  { id: "cabin", label: "Cabin Crew" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/**
 * The programmes as boarding passes. On large screens the section pins and vertical scrolling slides
 * the passes sideways (a horizontal "gate" walk); on touch screens the row scrolls natively.
 */
export const PassDeck = ({ items, heading, intro }: { items: readonly DeckItem[]; heading: string; intro: string }) => {
  const [tab, setTab] = useState<Tab>("all");
  const visible = useMemo(() => items.filter((item) => tab === "all" || item.program.category === tab), [items, tab]);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const measure = () => {
      const wide = window.innerWidth >= 1024 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setPinned(wide);
      const node = track.current;
      // The field is inset from the viewport, so the visible width is the section's, not the window's.
      if (node) setDistance(Math.max(0, node.scrollWidth - (section.current?.clientWidth ?? window.innerWidth)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visible]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={section}
      id="programs"
      data-fl="Programs"
      className="field field-sky relative my-[var(--frame)]"
      style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined}
    >
      <div className={cn("relative isolate flex flex-col justify-center overflow-hidden pt-28 pb-20", pinned && "sticky top-0 h-svh py-0 pt-[var(--header-h)]")}>
        <Livery className="-z-10" />
        <div className="container-deck mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <h2 className="heading fs-section text-ink">{heading}</h2>
            <p className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-mute">{intro}</p>
          </div>
          <Segmented
            label="Filter programs by field"
            className="lg:col-span-6 lg:justify-self-end"
            value={tab}
            onChange={setTab}
            options={TABS.map((item) => ({ id: item.id, label: item.label, marker: item.id === "all" ? undefined : HOLDER[item.id] }))}
          />
        </div>

        <div className={cn(!pinned && "scrollbar-none snap-x snap-mandatory overflow-x-auto [scroll-padding-inline:var(--gutter)]")}>
          <motion.div ref={track} style={pinned ? { x } : undefined} className="flex w-max gap-6 px-[var(--gutter)] py-6">
            {visible.map((item) => (
              <div key={item.program.slug} className="h-[19rem] w-[min(86vw,22rem)] shrink-0 snap-start sm:h-[17rem] sm:w-[36rem]">
                <Tilt max={7} className="h-full rounded-[16px]">
                  <BoardingPass program={item.program} photo={item.photo} />
                </Tilt>
              </div>
            ))}
          </motion.div>
        </div>

        {pinned ? (
          <div aria-hidden className="container-deck mt-8">
            <div className="relative h-px bg-line-strong">
              <motion.span className="absolute inset-y-[-1px] left-0 w-full origin-left bg-ink" style={{ scaleX: bar }} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};
