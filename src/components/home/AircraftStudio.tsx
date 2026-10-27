"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AircraftSystem, SystemId } from "@/content/anatomy";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { TAKEOFF_PROGRESS } from "./Preloader";
import type { Studio } from "./studio/scene";

const SPECS = [
  { label: "Length", value: "37.6 m" },
  { label: "Wingspan", value: "35.8 m" },
  { label: "Engines", value: "2 × turbofan" },
] as const;

/**
 * The anatomy studio: the society's aircraft in a softbox studio on the sky field (three.js, built
 * when the section comes near). Drag to turn it; hotspots and the system list fly the camera to a
 * system and say which programme trains people for it. Without WebGL the list and card still work.
 */
export const AircraftStudio = ({ systems, heading, intro }: { systems: readonly AircraftSystem[]; heading: string; intro: string }) => {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const studio = useRef<Studio | null>(null);
  const dots = useRef<Partial<Record<SystemId, HTMLButtonElement | null>>>({});
  const [active, setActive] = useState<SystemId | null>(null);
  const [live, setLive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion();
  const current = systems.find((system) => system.id === active) ?? null;

  useEffect(() => {
    const node = section.current;
    const surface = canvas.current;
    if (!node || !surface) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
    let raf = 0;
    let visible = false;
    let disposed = false;
    let started = false;

    const loop = (now: number) => {
      if (!studio.current) return;
      studio.current.render(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      if (studio.current && visible) raf = requestAnimationFrame(loop);
    };
    const start = async () => {
      if (started) return;
      started = true;
      try {
        const [{ createStudio }, emblem] = await Promise.all([
          import("./studio/scene"),
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = "/media/brand/assi-emblem.png";
          }),
        ]);
        const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mona").trim() || "sans-serif";
        await document.fonts.load(`640 48px ${family}`).catch(() => undefined);
        if (disposed) return;
        const created = await createStudio(surface, {
          emblem,
          font: family,
          small,
          reduced: prefersReduced,
          onFirstFrame: () => setLive(true),
          onFrame: (points) => {
            for (const [id, p] of Object.entries(points) as [SystemId, { x: number; y: number; visible: boolean }][]) {
              const dot = dots.current[id];
              if (!dot) continue;
              dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
              dot.dataset.hidden = p.visible ? "false" : "true";
            }
          },
        });
        if (disposed) {
          created.dispose();
          return;
        }
        studio.current = created;
        kick();
      } catch (error) {
        if (process.env.NODE_ENV !== "production") console.warn("Studio unavailable", error);
      }
    };

    // Built ahead of time, in small steps, once the take-off is ready (or after a few seconds), so it is
    // finished long before anyone scrolls here; coming close starts it at the latest.
    const idle = (fn: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
    const onTakeoff = (event: Event) => {
      if (Number((event as CustomEvent<number>).detail) >= 1) idle(() => void start());
    };
    window.addEventListener(TAKEOFF_PROGRESS, onTakeoff);
    const fallback = window.setTimeout(() => idle(() => void start()), 6000);
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void start();
      },
      { rootMargin: "200% 0px" },
    );
    near.observe(node);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      kick();
    });
    io.observe(surface);
    const ro = new ResizeObserver(() => studio.current?.resize());
    ro.observe(surface);
    const onVisibility = () => kick();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener(TAKEOFF_PROGRESS, onTakeoff);
      window.clearTimeout(fallback);
      near.disconnect();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      studio.current?.dispose();
      studio.current = null;
    };
  }, []);

  useEffect(() => {
    studio.current?.focus(active);
  }, [active, live]);

  // Drag to turn: horizontal drags rotate, vertical ones still scroll the page on touch screens.
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    let last: { x: number; y: number } | null = null;
    let moved = 0;
    const down = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("button, a")) return;
      last = { x: event.clientX, y: event.clientY };
      moved = 0;
      node.setPointerCapture(event.pointerId);
      setDragging(true);
    };
    const move = (event: PointerEvent) => {
      if (!last) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      last = { x: event.clientX, y: event.clientY };
      moved += Math.abs(dx) + Math.abs(dy);
      studio.current?.drag(dx, event.pointerType === "mouse" ? dy : 0);
      if (moved > 6) setActive((value) => (value === null ? value : null));
    };
    const up = () => {
      last = null;
      setDragging(false);
    };
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section ref={section} id="anatomy" data-fl="Anatomy" className="relative py-24 md:py-32">
      <div className="container-deck grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label tracking-[0.18em] text-sky-300 uppercase">Inside the aircraft</p>
          <h2 className="heading fs-section mt-5 max-w-[14ch] text-ink">{heading}</h2>
        </div>
        <p className="max-w-md text-[1.0625rem] leading-relaxed text-mute lg:col-span-4 lg:col-start-9">{intro}</p>
      </div>

      <div
        ref={stage}
        className={cn(
          "field relative mt-12 h-[min(86svh,820px)] min-h-[560px] touch-pan-y select-none md:mt-16",
          "bg-[radial-gradient(120%_90%_at_50%_42%,#f4f9ff_0%,#cfe5fb_38%,#8fc6f4_72%,#5aaef0_100%)]",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        {/* Studio horizon: a soft floor line and glow under the aircraft. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[62%] h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-[10%] top-[50%] h-[30%] rounded-[50%] bg-white/50 blur-3xl" />
        <canvas ref={canvas} aria-hidden className={cn("absolute inset-0 h-full w-full transition-opacity duration-[1400ms] ease-flight", live ? "opacity-100" : "opacity-0")} />

        {/* Hotspots, positioned every frame by the scene. */}
        <div className="pointer-events-none absolute inset-0">
          {systems.map((system) => {
            const on = system.id === active;
            return (
              <button
                key={system.id}
                ref={(el) => {
                  dots.current[system.id] = el;
                }}
                type="button"
                data-hidden="true"
                aria-label={`Show the ${system.label.toLowerCase()}`}
                aria-pressed={on}
                onClick={() => setActive(on ? null : system.id)}
                className={cn(
                  "group/dot pointer-events-auto absolute top-0 left-0 -mt-5 -ml-5 grid size-10 place-items-center transition-opacity duration-300 data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0",
                  !live && "hidden",
                  active && !on && "opacity-40",
                )}
              >
                <span aria-hidden className={cn("absolute inset-1.5 rounded-full bg-white/40 ring-1 ring-white/70 backdrop-blur-sm", !reduced && "animate-ping [animation-duration:2.4s]")} />
                <span aria-hidden className={cn("relative size-3 rounded-full ring-[3px] transition-transform duration-300 ease-flight group-hover/dot:scale-125", on ? "bg-sky-300 ring-white" : "bg-white ring-sky-300")} />
                <span
                  aria-hidden
                  className="sign-type pointer-events-none absolute top-1/2 left-full ml-1 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1.5 text-[0.8125rem] whitespace-nowrap text-ink opacity-0 shadow-[0_10px_24px_-14px_rgb(6_24_47/0.5)] transition-opacity duration-200 group-hover/dot:opacity-100 group-focus-visible/dot:opacity-100"
                >
                  {system.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Caption and specification, top left. */}
        <div className="pointer-events-none absolute top-6 left-6 md:top-8 md:left-8">
          <p className="readout text-[0.75rem] tracking-[0.16em] text-ink/70 uppercase">Civil Aviation India livery · twin-jet airliner</p>
          <dl className="mt-3 hidden gap-2 sm:flex">
            {SPECS.map((spec) => (
              <div key={spec.label} className="rounded-[12px] bg-white/55 px-3 py-2 ring-1 ring-white/70 backdrop-blur-md">
                <dt className="text-[0.6875rem] tracking-[0.12em] text-ink/60 uppercase">{spec.label}</dt>
                <dd className="readout text-[0.9375rem] text-ink">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p aria-hidden className={cn("readout pointer-events-none absolute top-7 right-7 hidden items-center gap-2 text-[0.75rem] tracking-[0.16em] text-ink/60 uppercase transition-opacity duration-500 md:flex", active && "opacity-0")}>
          <svg viewBox="0 0 24 24" className="size-4">
            <path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Drag to turn
        </p>

        {/* System card. */}
        <div className="absolute inset-x-4 bottom-[5.5rem] md:inset-x-auto md:right-8 md:bottom-8 md:w-[24rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current?.id ?? "overview"}
              initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: DUR.fast, ease: EASE }}
              className="rounded-[22px] bg-white/72 p-5 shadow-[0_30px_70px_-40px_rgb(6_40_90/0.7)] ring-1 ring-white/80 backdrop-blur-xl md:p-6"
            >
              {current ? (
                <>
                  <p className="readout text-[0.75rem] tracking-[0.16em] text-sky-300 uppercase">
                    {String(systems.indexOf(current) + 1).padStart(2, "0")} / {String(systems.length).padStart(2, "0")} · {current.label}
                  </p>
                  <h3 className="heading mt-3 text-[1.625rem] text-ink">{current.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-mute">{current.body}</p>
                  <Link
                    href={`/programs/${current.program}`}
                    className="group/link mt-5 flex items-center justify-between gap-4 rounded-[14px] bg-white px-4 py-3 ring-1 ring-line transition-shadow duration-200 hover:shadow-[0_12px_28px_-18px_rgb(6_40_90/0.6)]"
                  >
                    <span>
                      <span className="block text-[0.6875rem] tracking-[0.14em] text-dim uppercase">Trained in</span>
                      <span className="block text-[0.9375rem] font-semibold text-ink">{current.trainedAs}</span>
                    </span>
                    <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-sky-300 transition-transform duration-300 ease-flight group-hover/link:translate-x-0.5">
                      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </>
              ) : (
                <>
                  <p className="readout text-[0.75rem] tracking-[0.16em] text-sky-300 uppercase">Six systems · one aircraft</p>
                  <p className="heading mt-3 text-[1.5rem] text-ink">Every part of the aircraft has a specialist behind it.</p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-mute">Select a system to fly in close and see which programme trains you for it.</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* System list. */}
        <div className="absolute inset-x-4 bottom-4 md:inset-x-auto md:bottom-8 md:left-8">
          <div role="group" aria-label="Aircraft systems" className="scrollbar-none flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/60 p-1 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7)] backdrop-blur-md">
            {systems.map((system) => {
              const on = system.id === active;
              return (
                <button
                  key={system.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(on ? null : system.id)}
                  className={cn(
                    "sign-type relative isolate inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-[0.9375rem] whitespace-nowrap transition-colors duration-200 ease-flight",
                    on ? "text-white" : "text-ink/75 hover:text-ink",
                  )}
                >
                  {on ? (
                    <motion.span
                      layoutId="studio-thumb"
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-full bg-ink shadow-[0_6px_16px_-8px_rgb(6_24_47/0.6)]"
                      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 38 }}
                    />
                  ) : null}
                  {system.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
