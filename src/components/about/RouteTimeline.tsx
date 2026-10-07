"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type RouteStop = { ident: string; when: string; title: string; body: string; photo?: ReactNode };

/** Top view of an airliner, nose up. */
const PLANE = "M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.1l-8-2.3v4.6l2.4 1.7v1.8L12 20.6l-3.9 1.1v-1.8l2.4-1.7v-4.6l-8 2.3v-2.1l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z";

/**
 * The institute's history as a flight route: a dashed planned track through waypoints, the flown
 * part drawn in amber as you scroll, and an aircraft that follows the track. Waypoints light up as
 * the aircraft passes them.
 */
export const RouteTimeline = ({ stops }: { stops: readonly RouteStop[] }) => {
  const box = useRef<HTMLDivElement>(null);
  const planned = useRef<SVGPathElement>(null);
  const flown = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);
  const [geometry, setGeometry] = useState<{ w: number; h: number; d: string; marks: number[] }>({ w: 1, h: 1, d: "", marks: [] });
  const [passed, setPassed] = useState(-1);
  const { scrollYProgress } = useScroll({ target: box, offset: ["start 65%", "end 65%"] });

  // Build the route through the waypoint markers, measured from the laid-out page.
  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const build = () => {
      const rect = node.getBoundingClientRect();
      const points = [...node.querySelectorAll<HTMLElement>("[data-waypoint]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top };
      });
      if (!points.length) return;
      const first = points[0]!;
      const last = points[points.length - 1]!;
      let d = `M ${first.x} 0 L ${first.x} ${first.y}`;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]!;
        const b = points[i]!;
        const mid = (a.y + b.y) / 2;
        d += ` C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
      }
      d += ` L ${last.x} ${rect.height}`;
      setGeometry({ w: rect.width, h: rect.height, d, marks: points.map((p) => p.y) });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const place = (p: number) => {
    const path = planned.current;
    const line = flown.current;
    const glyph = plane.current;
    if (!path || !line || !glyph || !geometry.d) return;
    const length = path.getTotalLength();
    const at = Math.max(0.001, Math.min(1, p)) * length;
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length - at}`;
    const point = path.getPointAtLength(at);
    const ahead = path.getPointAtLength(Math.min(length, at + 2));
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI + 90;
    glyph.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle}) translate(-12 -12)`);
    let index = -1;
    geometry.marks.forEach((y, i) => {
      if (point.y >= y - 4) index = i;
    });
    setPassed(index);
  };

  useMotionValueEvent(scrollYProgress, "change", place);
  useEffect(() => place(scrollYProgress.get()), [geometry]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className="relative">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${geometry.w} ${geometry.h}`} preserveAspectRatio="none">
        <path ref={planned} d={geometry.d} fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" strokeDasharray="2 7" />
        <path ref={flown} d={geometry.d} fill="none" stroke="var(--color-sky-400)" strokeWidth="2" />
        <g ref={plane} className="text-ink drop-shadow-[0_4px_8px_rgb(11_34_64/0.35)]">
          <path d={PLANE} fill="currentColor" />
        </g>
      </svg>

      <ol className="relative space-y-24 md:space-y-32">
        {stops.map((stop, index) => {
          const right = index % 2 === 1;
          return (
            <li key={stop.ident} className="relative grid pl-12 md:grid-cols-2 md:gap-x-28 md:pl-0">
              {/* Waypoint: a four-point star on the chart, filled once the aircraft has passed. */}
              <span
                data-waypoint
                aria-hidden
                className={cn(
                  "absolute top-2 left-[0.6rem] grid size-5 place-items-center md:left-1/2 md:-translate-x-1/2",
                  right ? "md:ml-6" : "md:-ml-6",
                )}
              >
                <svg viewBox="0 0 20 20" className={cn("size-5 transition-colors duration-500", index <= passed ? "text-sky-400" : "text-line-strong")}>
                  <path d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6z" fill="currentColor" />
                </svg>
              </span>

              <div className={cn("sd-rise max-w-xl", right ? "md:col-start-2" : "md:col-start-1 md:justify-self-end md:text-right")}>
                <p className={cn("readout flex items-center gap-3 text-[0.75rem] text-sky-300", !right && "md:justify-end")}>
                  <span aria-hidden className="tracking-[0.2em]">{stop.ident}</span>
                  <span aria-hidden className="h-px w-8 bg-line-strong" />
                  <span>{stop.when}</span>
                </p>
                <h3 className="heading mt-3 text-[clamp(1.75rem,2.8vw,2.5rem)] text-ink">{stop.title}</h3>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-mute">{stop.body}</p>
                {stop.photo ? <div className={cn("mt-6 max-w-md overflow-hidden rounded-[4px]", !right && "md:ml-auto")}>{stop.photo}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
