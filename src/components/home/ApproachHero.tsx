"use client";

import { useRef, type ReactNode } from "react";
import { ApproachScene, type HudRefs } from "./ApproachScene";

/**
 * Pinned hero: the page scroll flies the approach (ApproachScene) while the headline holds, then
 * fades as the aircraft crosses the threshold. The scene writes `--approach` (0 → 1) on the section.
 */
/**
 * "hero": the headline holds, then fades as the aircraft crosses the threshold.
 * "finale": the page's closing night landing; the text arrives at touchdown instead.
 */
export const ApproachHero = ({ children, variant = "hero", id = "top", label = "Approach" }: { children: ReactNode; variant?: "hero" | "finale"; id?: string; label?: string }) => {
  const track = useRef<HTMLElement>(null);
  const hud = useRef<HudRefs>({ ra: null, speed: null, dist: null, callout: null, mode: null });

  return (
    <section
      ref={track}
      id={id}
      data-fl={label}
      className="night group relative mb-[var(--frame)] h-[240svh] motion-reduce:h-svh"
      style={{ "--approach": 0 } as React.CSSProperties}
    >
      <div className="sticky top-[var(--frame)] mx-[var(--frame)] h-[calc(100svh-2*var(--frame))] overflow-hidden rounded-[var(--field-radius)] bg-[linear-gradient(#0a2558,#1a4a92_30%,#3f74ba_44%,#6f93c4_47%,#0a1a3a_47.2%)]">
        <ApproachScene trackRef={track} hud={hud} />

        {/* Instrument readouts, in the HUD's own colour and the cockpit display typeface. */}
        <div aria-hidden className="readout pointer-events-none absolute inset-0 text-hud [text-shadow:0_0_10px_rgb(114_245_163/0.55)]">
          <div className="absolute top-[calc(var(--header-h)+1.25rem)] left-1/2 hidden -translate-x-1/2 text-[0.8125rem] tracking-[0.2em] lg:block">
            <span ref={(el) => void (hud.current.mode = el)}>LOC  G/S</span>
          </div>
          <div className="absolute top-1/2 left-[var(--gutter)] hidden -translate-y-1/2 flex-col gap-1 border border-hud/70 bg-[#061c46]/40 px-3 py-2 backdrop-blur-[2px] lg:flex">
            <span className="text-[0.6875rem] tracking-[0.18em] opacity-80">SPD KT</span>
            <span ref={(el) => void (hud.current.speed = el)} className="text-[1.75rem] leading-none">
              142
            </span>
          </div>
          <div className="absolute top-1/2 right-[var(--gutter)] hidden -translate-y-1/2 flex-col items-end gap-1 border border-hud/70 bg-[#061c46]/40 px-3 py-2 backdrop-blur-[2px] lg:flex">
            <span className="text-[0.6875rem] tracking-[0.18em] opacity-80">RA FT</span>
            <span ref={(el) => void (hud.current.ra = el)} className="text-[1.75rem] leading-none">
              900
            </span>
            <span ref={(el) => void (hud.current.dist = el)} className="text-[0.75rem] opacity-80">
              2.3 NM
            </span>
          </div>
          <div
            ref={(el) => void (hud.current.callout = el)}
            className="absolute top-[24%] left-1/2 -translate-x-1/2 text-[clamp(2rem,5vw,4.5rem)] tracking-[0.12em] opacity-0 transition-opacity duration-200"
          />
          <p className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-[0.75rem] tracking-[0.3em] opacity-[calc(0.85_-_var(--approach)*6)] lg:block">
            SCROLL TO LAND
          </p>
        </div>

        {variant === "hero" ? (
          <div className="relative z-10 h-full [opacity:calc(1_-_var(--approach)*2.6)] group-data-[phase=landed]:pointer-events-none group-data-[phase=late]:pointer-events-none [transform:translate3d(0,calc(var(--approach)*-9vh),0)]">
            {children}
          </div>
        ) : (
          <div className="pointer-events-none relative z-10 h-full [opacity:calc((var(--approach)_-_0.8)*5)] group-data-[phase=landed]:pointer-events-auto">{children}</div>
        )}
      </div>
    </section>
  );
};
