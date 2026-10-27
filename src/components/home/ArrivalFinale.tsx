import { SignLink } from "@/components/ui/Sign";
import { contact, site } from "@/content/site";

/**
 * The page ends where every flight does: the society's aircraft on short final at blue hour, landing
 * lights on, gear down. The frame is rendered by the site's own take-off engine (scene.ts "bluehour"
 * palette, still mode), so the aircraft matches the one that took off at the top of the page.
 */
export const ArrivalFinale = () => (
  <section id="arrival" data-fl="Arrival" className="field night relative isolate my-[var(--frame)] h-[100svh] min-h-[640px] bg-[#0b1f4f]">
    <picture>
      <source media="(max-width: 767px)" srcSet="/media/hero/arrival-portrait.webp" />
      {/* eslint-disable-next-line @next/next/no-img-element -- a full-bleed rendered frame with an art-directed portrait crop */}
      <img
        src="/media/hero/arrival.webp"
        alt="The Civil Aviation India aircraft on final approach at blue hour, landing lights on and gear down"
        loading="lazy"
        decoding="async"
        className="arrival-drift absolute inset-0 -z-10 h-full w-full object-cover object-[50%_30%]"
      />
    </picture>
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(3_10_28/0.88),rgb(6_20_52/0.35)_40%,transparent_62%)]" />

    {/* Approach instruments, as on the take-off: glass chips with the frame's real values. */}
    <div aria-hidden className="readout pointer-events-none absolute top-[calc(var(--header-h)+1.25rem)] right-[var(--gutter)] hidden flex-col items-end gap-2 text-white lg:flex">
      <span className="rounded-full bg-[#0a2456]/75 px-3 py-1 text-[0.75rem] tracking-[0.2em] ring-1 ring-white/20 backdrop-blur-md">LAND · GEAR DN</span>
      <span className="flex gap-2">
        <span className="rounded-[14px] bg-[#0a2456]/75 px-3.5 py-2.5 ring-1 ring-white/20 backdrop-blur-md">
          <span className="block text-[0.625rem] tracking-[0.18em] text-white/80">SPEED KT</span>
          <span className="block text-[1.5rem] leading-none tabular-nums">138</span>
        </span>
        <span className="rounded-[14px] bg-[#0a2456]/75 px-3.5 py-2.5 ring-1 ring-white/20 backdrop-blur-md">
          <span className="block text-[0.625rem] tracking-[0.18em] text-white/80">RA FT</span>
          <span className="block text-[1.5rem] leading-none tabular-nums">196</span>
        </span>
      </span>
    </div>

    <div className="container-deck flex h-full flex-col justify-end pb-14 md:pb-20">
      <p className="readout flex items-center gap-3 text-[0.8125rem] tracking-[0.2em] text-hud">
        <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-hud shadow-[0_0_12px_var(--color-hud)]" />
        ON FINAL · RUNWAY 27
      </p>
      <h2 className="display mt-4 text-[clamp(2.75rem,7.6vw,8rem)] text-white">
        <span className="block overflow-hidden pb-[0.06em]">
          <span className="sd-line block">Welcome to</span>
        </span>
        <span className="block overflow-hidden pb-[0.06em]">
          <span className="sd-line block">Hyderabad.</span>
        </span>
      </h2>
      <div className="mt-7 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xl text-[1.125rem] leading-relaxed text-white/85">
          {site.institute}, Kompally. <span className="readout text-[0.875rem]">{contact.coordinates}</span>
        </p>
        <SignLink href="/admissions" size="lg">
          Start your admission
        </SignLink>
      </div>
    </div>
  </section>
);
