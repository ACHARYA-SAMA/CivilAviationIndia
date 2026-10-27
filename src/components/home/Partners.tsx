import Link from "next/link";
import { alliances, home_base, standards, type Alliance } from "@/content/about";
import { LocalTime } from "./LocalTime";

/** Great-circle distance in kilometres. */
const distanceKm = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

const Row = ({ alliance, index }: { alliance: Alliance; index: number }) => {
  const km = Math.round(distanceKm(home_base, alliance) / 10) * 10;
  const body = (
    <>
      {/* The sky field sweeps in from the left on hover. */}
      <span aria-hidden className="field-sky absolute inset-0 -z-10 origin-left scale-x-0 rounded-[20px] transition-transform duration-700 ease-flight group-hover/row:scale-x-100 group-focus-visible/row:scale-x-100" />
      <span className="readout pt-2 text-[0.8125rem] text-dim transition-colors group-hover/row:text-ink lg:col-span-1">{String(index + 1).padStart(2, "0")}</span>
      <span className="lg:col-span-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[0.75rem] font-semibold text-sky-300 ring-1 ring-line">
          <span aria-hidden className="size-1.5 rounded-full bg-sky-400" />
          {alliance.role}
        </span>
        <span className="heading mt-4 block text-[clamp(1.75rem,3.2vw,3rem)] text-ink">{alliance.name}</span>
        <span className="mt-3 block max-w-xl text-[1rem] leading-relaxed text-mute transition-colors group-hover/row:text-ink">{alliance.detail}</span>
      </span>
      <span className="text-[0.9375rem] text-ink lg:col-span-3 lg:pt-2">
        {alliance.place}
        <span className="readout mt-1 block text-[0.8125rem] text-dim transition-colors group-hover/row:text-ink/80">{km.toLocaleString("en-IN")} km from Kompally</span>
      </span>
      <span className="flex items-start justify-between gap-4 lg:col-span-2 lg:pt-2">
        <span>
          <LocalTime timeZone={alliance.timeZone} className="readout block text-[1.25rem] text-ink" />
          <span className="readout text-[0.75rem] text-dim transition-colors group-hover/row:text-ink/80">local time</span>
        </span>
        {alliance.href ? (
          <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform duration-500 ease-flight group-hover/row:rotate-[-45deg]">
            <svg viewBox="0 0 20 20" className="size-5">
              <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : null}
      </span>
    </>
  );
  const className = "group/row relative isolate grid gap-5 border-t border-line px-4 py-9 sm:px-6 lg:grid-cols-12 lg:gap-6";
  return alliance.href ? (
    <Link href={alliance.href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
};

/**
 * Home: the institute's partner institutions as an editorial list (distance and live local time from
 * Kompally), and the regulators the curriculum is aligned with.
 */
export const Partners = () => (
  <section id="partners" data-fl="Partners" className="relative py-24 md:py-36">
    <div className="container-deck">
      <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="label tracking-[0.18em] text-sky-300 uppercase">Partners</p>
          <h2 className="heading fs-section mt-5 max-w-[13ch] text-ink">Trained with the world.</h2>
        </div>
        <p className="max-w-md text-[1.0625rem] leading-relaxed text-mute lg:col-span-4 lg:col-start-9">
          From Kompally to Tulsa, San Carlos and the Free State: partner institutions that take the institute’s cadets, and its training, across borders.
        </p>
      </div>
      <div className="border-b border-line">
        {alliances.map((alliance, index) => (
          <Row key={alliance.id} alliance={alliance} index={index} />
        ))}
      </div>
      <div className="mt-12 flex flex-wrap items-baseline gap-x-10 gap-y-4">
        <p className="readout text-[0.8125rem] tracking-[0.14em] text-dim uppercase">Curriculum aligned with</p>
        {standards.map((name) => (
          <span key={name} className="display text-[clamp(2.5rem,6vw,5.5rem)] text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)] transition-colors duration-500 ease-flight hover:text-ink">
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);
