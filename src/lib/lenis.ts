import type Lenis from "lenis";

/** The single Lenis instance, so programmatic scrolls go through it instead of fighting its smoothing. */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null): void => {
  instance = lenis;
};

/** Scroll to an absolute Y position: smoothed by Lenis when active, native otherwise (e.g. reduced motion). */
export const scrollToY = (top: number): void => {
  if (instance) instance.scrollTo(top);
  else window.scrollTo({ top });
};
