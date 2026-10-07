"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Stop = { id: string; label: string };

/** Scroll depth maps to a flight level: the page's full length is a climb to FL 400. */
const CEILING_FL = 400;
const toLevel = (progress: number): string => String(Math.round((progress * CEILING_FL) / 10) * 10).padStart(3, "0");

/**
 * Sticky section index. Any element with `id` and `data-fl="<label>"` becomes a stop.
 * The readout is a live altimeter driven by scroll; the stop under the viewport centre is lit.
 * It lives entirely inside the left gutter, so it never overlaps content.
 */
export const AltitudeRail = () => {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const readout = useRef<HTMLSpanElement>(null);
  const compact = useRef<HTMLSpanElement>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [active, setActive] = useState<string | null>(null);
  // Small screens: the readout is only shown while moving, so it never parks on top of content.
  const [moving, setMoving] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const level = toLevel(Math.min(Math.max(value, 0), 1));
    if (readout.current) readout.current.textContent = level;
    if (compact.current) compact.current.textContent = level;
    setMoving(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setMoving(false), 1200);
  });

  useEffect(() => () => {
    if (idle.current) clearTimeout(idle.current);
  }, []);

  useEffect(() => {
    // Only sections with an id can be stops (they are also the jump targets).
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-fl][id]")];
    const found = nodes.map((node) => ({ id: node.id, label: node.dataset.fl ?? "" }));
    setStops(found);
    setActive(found[0]?.id ?? null);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  if (stops.length === 0) return null;
  const current = stops.find((stop) => stop.id === active);

  return (
    <>
      {/* xl and up: vertical altimeter + ticks in the left gutter */}
      <nav aria-label="Page sections" className="fixed top-1/2 left-3 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 xl:flex">
        <p className="label text-mute [writing-mode:vertical-rl] rotate-180">
          FL <span ref={readout} className="text-sky-300">000</span>
          {current ? <span className="ms-3 text-ink">{current.label}</span> : null}
        </p>
        <ol className="flex flex-col items-center gap-2.5">
          {stops.map((stop) => (
            <li key={stop.id} className="group relative">
              <a
                href={`#${stop.id}`}
                aria-current={stop.id === active ? "true" : undefined}
                className="flex h-4 w-8 items-center justify-center"
              >
                <span className="sr-only">{stop.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "h-px transition-[width,background-color] duration-500 ease-flight",
                    stop.id === active ? "w-5 bg-sky-500" : "w-2 bg-line-strong group-hover:w-4 group-hover:bg-mute",
                  )}
                />
              </a>
              <span
                aria-hidden
                className="label pointer-events-none absolute top-1/2 left-full ml-1 -translate-y-1/2 whitespace-nowrap rounded-[6px] bg-white px-2 py-1 text-ink shadow-[0_8px_20px_-12px_rgb(4_30_80/0.5)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                {stop.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Below xl: one-line readout */}
      <p
        aria-hidden
        className={cn(
          "label pointer-events-none fixed bottom-4 left-4 z-40 rounded-full bg-white/80 px-3 py-1.5 text-mute shadow-[0_8px_20px_-12px_rgb(4_30_80/0.5)] backdrop-blur transition-opacity duration-500 ease-flight xl:hidden",
          moving ? "opacity-100" : "opacity-0",
        )}
      >
        FL <span ref={compact} className="text-sky-300">000</span>
        {current ? <span className="ml-2 text-ink">{current.label}</span> : null}
      </p>
    </>
  );
};
