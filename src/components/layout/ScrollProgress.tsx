"use client";

import { useEffect, useRef } from "react";

/**
 * Page progress: a 3px azure line at the top edge. Driven by a CSS scroll timeline (`.sd-progress`);
 * browsers without scroll timelines get a tiny rAF-throttled fallback instead.
 */
export const ScrollProgress = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll()")) return;
    const bar = ref.current;
    if (!bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} aria-hidden className="sd-progress pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] bg-[linear-gradient(90deg,#2a8de9,#0b5fc0)]" />;
};
