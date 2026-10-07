"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/** True once the element has entered the viewport (never resets unless `once` is false). */
export const useInView = <T extends Element>(options: { once?: boolean; margin?: string; threshold?: number } = {}): [RefObject<T | null>, boolean] => {
  const { once = true, margin = "0px 0px -10% 0px", threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin: margin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, margin, threshold]);

  return [ref, inView];
};

const query = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

/** Mouse/trackpad users without a reduced-motion preference: the audience for hover-driven 3D effects. */
export const useFinePointer = (): boolean => {
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(query("(pointer: fine)") && !query("(prefers-reduced-motion: reduce)")), []);
  return fine;
};

export const useReducedMotionPref = (): boolean => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduced;
};

/** Indian Standard Time, ticking once a minute (the campus clock on boards and the footer). */
export const useIstClock = (): string | null => {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
};
