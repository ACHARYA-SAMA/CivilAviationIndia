"use client";

import { useEffect, useRef } from "react";

/**
 * Giant type that drifts sideways and speeds up, then eases back, with the visitor's scroll speed;
 * alternate words are outlined. Two rows run in opposite directions. Static for reduced motion.
 */
export const VelocityMarquee = ({ rows }: { rows: readonly (readonly string[])[] }) => {
  const tracks = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let boost = 0;
    const offsets = rows.map(() => 0);
    // Half of each track's width (one copy of the words), measured on resize, never per frame.
    const halves = rows.map(() => 1);
    const measure = () => tracks.current.forEach((track, i) => track && (halves[i] = track.scrollWidth / 2));
    measure();
    const ro = new ResizeObserver(measure);
    tracks.current.forEach((track) => track && ro.observe(track));
    let visible = false;
    const node = tracks.current[0]?.parentElement?.parentElement;
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) {
        lastT = performance.now();
        raf = requestAnimationFrame(tick);
      } else cancelAnimationFrame(raf);
    });
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const y = window.scrollY;
      const v = (y - lastY) / Math.max(dt, 1 / 240);
      lastY = y;
      boost += (Math.min(4000, Math.abs(v)) / 400 - boost) * Math.min(1, dt * 6);
      tracks.current.forEach((track, i) => {
        if (!track) return;
        const dir = i % 2 ? 1 : -1;
        const half = halves[i]!;
        offsets[i] = (offsets[i]! + dir * (28 + boost * 120) * dt) % half;
        track.style.transform = `translate3d(${dir > 0 ? offsets[i]! - half : offsets[i]}px, 0, 0) skewX(${(-dir * Math.min(boost, 6)) * 0.8}deg)`;
      });
      if (visible) raf = requestAnimationFrame(tick);
    };
    if (node) io.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [rows]);

  return (
    <div aria-hidden className="relative overflow-hidden py-10 select-none md:py-16">
      {rows.map((words, i) => (
        <div key={i} className="overflow-hidden">
          <div
            ref={(el) => {
              tracks.current[i] = el;
            }}
            className="flex w-max will-change-transform"
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {words.map((word, j) => (
                  <span key={`${copy}-${j}`} className="flex items-center">
                    <span
                      className={
                        (i + j) % 2
                          ? "display px-[0.18em] text-[clamp(3.5rem,11vw,10.5rem)] text-transparent [-webkit-text-stroke:1.5px_var(--color-sky-300)]"
                          : "display px-[0.18em] text-[clamp(3.5rem,11vw,10.5rem)] text-ink"
                      }
                    >
                      {word}
                    </span>
                    <svg viewBox="0 0 24 24" className="mx-[0.2em] size-[clamp(1.5rem,4vw,3.5rem)] shrink-0 rotate-90 text-sky-400">
                      <path d="M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.1l-8-2.3v4.6l2.4 1.7v1.8L12 20.6l-3.9 1.1v-1.8l2.4-1.7v-4.6l-8 2.3v-2.1l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z" fill="currentColor" />
                    </svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
