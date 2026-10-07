import { neoUniverse, type NeoZoneKind } from "@/content/neoUniverse";

/** Line icons for the park's zones (24 × 24, stroked). */
const ICON: Record<NeoZoneKind, string> = {
  aircraft: "M12 2.5c.8 0 1.3.9 1.3 2v5l7.2 4.2v1.9l-7.2-2.1v4.2l2.2 1.6v1.6L12 19.9l-3.5 1v-1.6l2.2-1.6v-4.2l-7.2 2.1v-1.9l7.2-4.2v-5c0-1.1.5-2 1.3-2z",
  helicopter: "M3 5h18M12 5v3M6 13a6 4 0 0 0 12 0 6 4 0 0 0-12 0zM18 13h3M9 17l-1 3h8l-1-3",
  hangar: "M2 20h20M4 20v-8a8 8 0 0 1 16 0v8M8 20v-5h8v5",
  astronaut: "M12 3a6 6 0 0 1 6 6v3a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6zM8 9h8v3H8zM6 21v-2a6 6 0 0 1 12 0v2",
  simulator: "M3 5h18v10H3zM8 19h8M12 15v4M7 9l3 2-3 2",
  museum: "M3 9l9-5 9 5M5 9v9M9 9v9M15 9v9M19 9v9M3 20h18",
  gallery: "M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15 8.5a1.5 1.5 0 1 0 0 .01",
  rocket: "M12 2c3 2.5 4 6 4 10l-2 4h-4l-2-4c0-4 1-7.5 4-10zM12 9a1.5 1.5 0 1 0 0 .01M8 13l-3 4 4-1M16 13l3 4-4-1M11 18l1 4 1-4",
  drone: "M5 5h4M15 5h4M7 5v3M17 5v3M8 10h8v4H8zM10 14l-2 3M14 14l2 3M7 8l3 2M17 8l-3 2",
};

/**
 * The society's planned aerospace theme park: a panel of "bays", each zone with its name from
 * the brochure, set in deep sky. Labelled as a plan throughout.
 */
export const NeoUniverse = () => (
  <section id="neo-universe" data-fl="Neo Universe" className="night field relative isolate my-[var(--frame)] py-24 md:py-32">
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_0%,#1a5fb4,#072a66_55%,#041a45)]" />
      <div className="neo-stars absolute inset-0 opacity-70" />
      <div className="absolute -top-[30%] -right-[20%] aspect-square w-[70vw] rounded-full border border-white/8 [box-shadow:inset_0_0_120px_rgb(91_188_255/0.08)]" />
    </div>
    <div className="container-deck">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-ink ring-1 ring-white/15">
            <span aria-hidden className="size-1.5 rounded-full bg-[#ffd05a]" />
            Planned project
          </p>
          <h2 className="display mt-6 text-[clamp(3rem,8vw,8rem)] text-ink">{neoUniverse.name}</h2>
          <p className="heading mt-3 text-[clamp(1.375rem,2.4vw,2rem)] text-sky-300">{neoUniverse.title}</p>
        </div>
        <div className="lg:col-span-5">
          <p className="text-[1.0625rem] leading-relaxed text-mute">{neoUniverse.intro}</p>
          <p className="mt-4 text-[0.9375rem] text-dim">Project designed by {neoUniverse.designer}.</p>
        </div>
      </div>

      <ul className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {neoUniverse.zones.map((zone) => (
          <li
            key={zone.name}
            className="group relative overflow-hidden rounded-[20px] bg-white/[0.04] p-6 ring-1 ring-white/10 transition-[background-color,transform,box-shadow] duration-500 ease-flight hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-[0_30px_60px_-30px_rgb(91_188_255/0.45)]"
          >
            <span aria-hidden className="absolute -top-16 -right-16 size-40 rounded-full bg-sky-400/0 blur-2xl transition-colors duration-500 group-hover:bg-sky-400/25" />
            <svg aria-hidden viewBox="0 0 24 24" className="size-9 text-sky-300">
              <path d={ICON[zone.kind]} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="readout mt-6 text-[0.6875rem] tracking-[0.16em] text-dim uppercase">{zone.bay}</p>
            <h3 className="heading mt-1 text-[1.25rem] text-ink">{zone.name}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-mute">{zone.body}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
