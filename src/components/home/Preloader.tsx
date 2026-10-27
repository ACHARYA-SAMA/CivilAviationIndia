"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const STEPS = [
  { at: 0, text: "Pre-flight checks" },
  { at: 0.3, text: "Engines stable" },
  { at: 0.62, text: "Lined up, runway 27" },
  { at: 0.92, text: "Cleared for take-off" },
] as const;

const PLANE = "M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.1l-8-2.3v4.6l2.4 1.7v1.8L12 20.6l-3.9 1.1v-1.8l2.4-1.7v-4.6l-8 2.3v-2.1l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z";

/** Fired by the take-off scene as it builds (0–1). */
export const TAKEOFF_PROGRESS = "takeoff:progress";

/**
 * First visit of the session on Home: a navy curtain with a runway for a progress bar and a large
 * counter, driven by the take-off scene's real build progress, then lifted to reveal the hero.
 * An inline script in the layout sets `data-intro` before first paint, so the curtain is up from the
 * first frame; without JavaScript, with reduced motion, or on a return visit it never shows.
 */
export const Preloader = () => {
  // Updated straight in the DOM every frame (no React renders while the scene is building).
  const ui = useRef<{ count: HTMLSpanElement | null; bar: HTMLDivElement | null; plane: SVGSVGElement | null; step: HTMLParagraphElement | null; lights: HTMLDivElement | null }>({
    count: null,
    bar: null,
    plane: null,
    step: null,
    lights: null,
  });

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== "on") return;
    const started = performance.now();
    let scene = 0;
    let value = 0;
    let raf = 0;
    let leaving = false;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    window.scrollTo(0, 0);

    const onProgress = (event: Event) => {
      scene = Math.max(scene, Number((event as CustomEvent<number>).detail) || 0);
    };
    window.addEventListener(TAKEOFF_PROGRESS, onProgress);

    const leave = () => {
      if (leaving) return;
      leaving = true;
      html.dataset.intro = "out";
      try {
        sessionStorage.setItem("assi-intro", "1");
      } catch {
        // Private mode: the intro may show again next time.
      }
      window.setTimeout(() => {
        delete html.dataset.intro;
        (window as unknown as { __lenis?: { start: () => void } }).__lenis?.start();
      }, 1150);
    };

    let lit = -1;
    const paint = (v: number) => {
      const r = ui.current;
      if (r.count) r.count.textContent = String(Math.round(v * 100)).padStart(3, "0");
      if (r.bar) r.bar.style.width = `${v * 100}%`;
      if (r.plane) r.plane.style.left = `${v * 100}%`;
      if (r.step) r.step.textContent = ([...STEPS].reverse().find((entry) => v >= entry.at) ?? STEPS[0]).text;
      const on = Math.floor(v * 23 + 1e-6);
      if (on !== lit && r.lights) {
        lit = on;
        r.lights.querySelectorAll<HTMLElement>("[data-light]").forEach((el) => (el.dataset.on = Number(el.dataset.light) <= on ? "true" : "false"));
      }
    };
    const tick = (now: number) => {
      const elapsed = (now - started) / 1000;
      // Time carries the bar to 70%; the scene's own progress, or the 5 s ceiling, takes it home.
      const timed = Math.min(0.7, elapsed / 1.6);
      const target = elapsed > 5 ? 1 : Math.max(timed, Math.min(scene, elapsed / 1.9));
      value += (target - value) * 0.09;
      if (target >= 1 && value > 0.995) value = 1;
      paint(value);
      if (value >= 1) {
        window.setTimeout(leave, 260);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(TAKEOFF_PROGRESS, onProgress);
    };
  }, []);

  return (
    <div aria-hidden className="intro night pointer-events-auto fixed inset-0 z-[95] flex-col justify-between overflow-hidden bg-[radial-gradient(120%_80%_at_70%_20%,#0d3470_0%,#08214a_45%,#041228_100%)] text-white">
      <div className="intro-inner container-deck flex items-center justify-between pt-7">
        <span className="flex items-center gap-3">
          <Image src="/media/brand/assi-emblem.png" alt="" width={37} height={38} className="h-9 w-auto" priority />
          <span className="heading text-[1.1875rem]">Civil Aviation India</span>
        </span>
        <span className="readout hidden text-[0.75rem] tracking-[0.2em] text-white/65 uppercase sm:block">IIASTM · Kompally · Est. 1994</span>
      </div>

      {/* The runway: centreline dashes, edge lights that come on as the bar passes them, the aircraft rolling. */}
      <div className="intro-inner container-deck">
        <div ref={(el) => void (ui.current.lights = el)} className="relative h-16">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.35)_0_28px,transparent_28px_48px)]" />
          <div ref={(el) => void (ui.current.bar = el)} className="absolute top-1/2 left-0 h-[2px] w-0 -translate-y-1/2 bg-white shadow-[0_0_18px_rgb(160_210_255/0.9)]" />
          <div className="absolute inset-x-0 top-0 flex justify-between">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} data-light={i} data-on={i === 0 ? "true" : "false"} className="size-1 rounded-full bg-white/18 transition-[background-color,box-shadow] duration-300 data-[on=true]:bg-[#fff4d6] data-[on=true]:shadow-[0_0_10px_#ffd27a]" />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-between">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} data-light={i} data-on={i === 0 ? "true" : "false"} className="size-1 rounded-full bg-white/18 transition-[background-color,box-shadow] duration-300 data-[on=true]:bg-[#fff4d6] data-[on=true]:shadow-[0_0_10px_#ffd27a]" />
            ))}
          </div>
          <svg ref={(el) => void (ui.current.plane = el)} viewBox="0 0 24 24" className="absolute top-1/2 left-0 size-7 -translate-x-1/2 -translate-y-1/2 rotate-90 text-white drop-shadow-[0_0_12px_rgb(160_210_255/0.9)]">
            <path d={PLANE} fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="intro-inner container-deck flex items-end justify-between gap-6 pb-8 md:pb-10">
        <p className="display tabular-nums leading-[0.8] text-[clamp(6rem,19vw,17rem)]">
          <span ref={(el) => void (ui.current.count = el)}>000</span>
          <span className="align-top text-[0.25em] text-white/50">%</span>
        </p>
        <div className="mb-[1.2vw] text-right">
          <p ref={(el) => void (ui.current.step = el)} className="readout text-[0.8125rem] tracking-[0.18em] text-sky-300 uppercase">
            {STEPS[0].text}
          </p>
          <p className="readout mt-2 text-[0.75rem] tracking-[0.16em] text-white/55">17°32′N 78°29′E</p>
        </div>
      </div>
    </div>
  );
};
