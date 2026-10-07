"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { setLenis } from "@/lib/lenis";

/** One Lenis instance for the whole site. Skipped entirely for reduced-motion users. */
export const SmoothScroll = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, anchors: { offset: -72 } });
    setLenis(lenis);
    // Exposed for automated visual checks (scripts scroll through Lenis instead of fighting it).
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
