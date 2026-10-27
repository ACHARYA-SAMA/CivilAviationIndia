"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Telemetry, TakeoffScene } from "./takeoff/scene";
import { TAKEOFF_PROGRESS } from "./Preloader";
import { cn } from "@/lib/cn";

/**
 * Pinned hero with the 3D sunset take-off (three.js, built on the visitor's first input). Until then, and
 * without WebGL, the poster frame stands in. The headline fades as the aircraft rotates; callouts follow the real sequence.
 */
export const TakeoffHero = ({ children, poster }: { children: ReactNode; poster?: string }) => {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  // Instruments are written straight to the DOM: they change every frame, React never re-renders for them.
  const readout = useRef<{ mode: HTMLSpanElement | null; kt: HTMLSpanElement | null; ft: HTMLSpanElement | null; callout: HTMLParagraphElement | null }>({ mode: null, kt: null, ft: null, callout: null });

  useEffect(() => {
    const node = section.current;
    const surface = canvas.current;
    if (!node || !surface) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches;
    let scene: TakeoffScene | null = null;
    let raf = 0;
    let visible = true;
    let disposed = false;
    let lastProgress = "";

    // Section metrics are measured on resize only; per frame, progress is plain arithmetic on scrollY,
    // so it never forces a layout.
    let top = 0;
    let travel = 1;
    const measure = () => {
      top = node.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, node.offsetHeight - window.innerHeight);
    };
    measure();
    const progress = () => Math.min(1, Math.max(0, (window.scrollY - top) / travel));
    const loop = (now: number) => {
      if (!scene) return;
      const p = reduced ? 0 : progress();
      const text = p.toFixed(3);
      if (text !== lastProgress) node.style.setProperty("--takeoff", (lastProgress = text));
      const phase = p > 0.38 ? "late" : "early";
      if (node.dataset.phase !== phase) node.dataset.phase = phase;
      scene.setProgress(p);
      scene.render(now);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      if (scene && visible) raf = requestAnimationFrame(loop);
    };

    const report = (fraction: number) => window.dispatchEvent(new CustomEvent(TAKEOFF_PROGRESS, { detail: fraction }));
    let starting = false;
    const start = async () => {
      if (disposed || scene || starting) return;
      starting = true;
      try {
        const [{ createTakeoffScene }, emblem] = await Promise.all([
          import("./takeoff/scene"),
          new Promise<HTMLImageElement | null>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = "/media/brand/assi-emblem.png";
          }),
        ]);
        const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mona").trim() || "sans-serif";
        await document.fonts.load(`800 48px ${family}`).catch(() => undefined);
        if (disposed) return;
        scene = await createTakeoffScene(surface, {
          emblem,
          font: family,
          small,
          reduced,
          onTelemetry: (t: Telemetry) => {
            const r = readout.current;
            if (r.mode) r.mode.textContent = t.mode;
            if (r.kt) r.kt.textContent = String(t.kt).padStart(3, "0");
            if (r.ft) r.ft.textContent = t.ft.toLocaleString("en-IN");
            if (r.callout) {
              if (t.callout) r.callout.textContent = t.callout;
              r.callout.style.opacity = t.callout ? "1" : "0";
            }
          },
          onFirstFrame: () => setLive(true),
          onProgress: report,
        });
        kick();
      } catch (error) {
        // No WebGL: the poster stays, and the intro curtain is released.
        report(1);
        if (process.env.NODE_ENV !== "production") console.warn("Take-off scene unavailable", error);
      }
    };

    // Under the intro curtain, and on desktops, the scene is built straight away. On phones without the
    // curtain it waits for the visitor's first move (pointer, touch, wheel, key or scroll): the build costs
    // a second of main-thread work, and the poster frame looks the same until then.
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
    const onFirstInput = () => {
      events.forEach((e) => window.removeEventListener(e, onFirstInput));
      void start();
    };
    events.forEach((e) => window.addEventListener(e, onFirstInput, { passive: true }));
    const eager = document.documentElement.dataset.intro === "on" || !small;
    const idle = eager ? window.setTimeout(() => void start(), document.documentElement.dataset.intro === "on" ? 0 : 900) : 0;

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      kick();
    });
    io.observe(node);
    const ro = new ResizeObserver(() => {
      measure();
      scene?.resize();
    });
    ro.observe(surface);
    window.addEventListener("resize", measure, { passive: true });
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduced) return;
      scene?.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => kick();
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      events.forEach((e) => window.removeEventListener(e, onFirstInput));
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      scene?.dispose();
    };
  }, []);

  return (
    <section ref={section} id="top" data-fl="Take-off" className="group relative mb-[var(--frame)] h-[260svh] motion-reduce:h-svh" style={{ "--takeoff": 0 } as React.CSSProperties}>
      <div className="sticky top-[var(--frame)] mx-[var(--frame)] h-[calc(100svh-2*var(--frame))] overflow-hidden rounded-[var(--field-radius)] bg-[linear-gradient(#173f88,#3f78c6_44%,#ffab6b_58%,#3a3d40_59%,#2b2d2f)]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- a full-bleed poster frame under the canvas
          <img src={poster} alt="" aria-hidden fetchPriority="low" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <canvas ref={canvas} aria-hidden className={cn("absolute inset-0 h-full w-full transition-opacity duration-1000 ease-flight", live ? "opacity-100" : "opacity-0")} />
        {/* Legibility: a soft wash under the headline and the paragraph. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(8_28_70/0.62),rgb(12_40_95/0.18)_34%,transparent_50%,transparent_60%,rgb(4_12_30/0.7))]" />

        {/* Flight instruments: glass chips in the corner, callouts above the aircraft. */}
        <div aria-hidden className="night readout pointer-events-none absolute inset-0">
          <div className="absolute top-[calc(var(--header-h)+1.25rem)] right-[var(--gutter)] hidden flex-col items-end gap-2 lg:flex">
            <span ref={(el) => void (readout.current.mode = el)} className="rounded-full bg-[#0a2456]/50 px-3 py-1 text-[0.75rem] tracking-[0.2em] text-white ring-1 ring-white/20 backdrop-blur-md">
              TOGA
            </span>
            <span className="flex gap-2">
              <span className="rounded-[14px] bg-[#0a2456]/50 px-3.5 py-2.5 text-white ring-1 ring-white/20 backdrop-blur-md">
                <span className="block text-[0.625rem] tracking-[0.18em] text-white/85">SPEED KT</span>
                <span ref={(el) => void (readout.current.kt = el)} className="block text-[1.5rem] leading-none tabular-nums">
                  000
                </span>
              </span>
              <span className="rounded-[14px] bg-[#0a2456]/50 px-3.5 py-2.5 text-white ring-1 ring-white/20 backdrop-blur-md">
                <span className="block text-[0.625rem] tracking-[0.18em] text-white/85">ALT FT</span>
                <span ref={(el) => void (readout.current.ft = el)} className="block text-[1.5rem] leading-none tabular-nums">
                  0
                </span>
              </span>
            </span>
          </div>
          <p
            ref={(el) => void (readout.current.callout = el)}
            className="absolute top-[30%] left-1/2 -translate-x-1/2 text-[clamp(1.5rem,3.6vw,3rem)] tracking-[0.16em] text-white opacity-0 transition-opacity duration-300 [text-shadow:0_2px_24px_rgb(0_20_50/0.6)]"
          />
          <p className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[0.75rem] tracking-[0.3em] text-white/85 opacity-[calc(1_-_var(--takeoff)*8)] [will-change:opacity] lg:block">
            SCROLL FOR TAKE-OFF
          </p>
        </div>

        {/* Its own compositor layer: the fade and drift then never repaint the large text shadows. */}
        <div className="night relative z-10 h-full [will-change:opacity,transform] group-data-[phase=late]:pointer-events-none [opacity:calc(1_-_var(--takeoff)*2.4)] [transform:translate3d(0,calc(var(--takeoff)*-8vh),0)]">{children}</div>
      </div>
    </section>
  );
};
