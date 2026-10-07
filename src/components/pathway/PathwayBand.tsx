import { SignLink } from "@/components/ui/Sign";
import { usaPathway } from "@/content/pathway";

const PLANE = "M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.1l-8-2.3v4.6l2.4 1.7v1.8L12 20.6l-3.9 1.1v-1.8l2.4-1.7v-4.6l-8 2.3v-2.1l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z";

/**
 * The 2 + 2 pathway as a route ticket: HYD to TUL, two years at each end, an aircraft flying the
 * line. Links to the full pathway page. Hidden while the pathway is unpublished.
 */
export const PathwayBand = ({ id = "pathway" }: { id?: string }) => {
  if (!usaPathway.published) return null;
  const { from, to } = usaPathway;
  return (
    <section id={id} data-fl="2 + 2 USA" className="relative isolate overflow-hidden py-24 md:py-32">
      <div className="container-deck grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[0.8125rem] font-semibold text-sky-300 shadow-[0_8px_20px_-14px_rgb(11_50_100/0.5)] ring-1 ring-line">
            <span aria-hidden className="size-1.5 rounded-full bg-sky-400" />
            New pathway, planned for 2027
          </p>
          <h2 className="heading fs-section mt-6 text-ink">Two years in India. Two years in the USA.</h2>
          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-mute">{usaPathway.summary}</p>
          <p className="mt-4 max-w-lg text-[0.875rem] leading-relaxed text-dim">{usaPathway.status}</p>
          <div className="mt-8">
            <SignLink href="/programs/usa-pathway">See the pathway</SignLink>
          </div>
        </div>

        {/* Route ticket */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_40px_90px_-50px_rgb(11_50_100/0.6)] ring-1 ring-line sm:p-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[0.75rem] tracking-[0.14em] text-dim uppercase">Years 1 and 2</p>
                <p className="display mt-1 text-[clamp(2.75rem,6vw,5rem)] leading-none text-ink">{from.code}</p>
                <p className="mt-2 text-[0.9375rem] text-mute">{from.place}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.75rem] tracking-[0.14em] text-dim uppercase">Years 3 and 4</p>
                <p className="display mt-1 text-[clamp(2.75rem,6vw,5rem)] leading-none text-sky-300">{to.code}</p>
                <p className="mt-2 text-[0.9375rem] text-mute">{to.place}</p>
              </div>
            </div>
            <div aria-hidden className="relative mt-10 h-12">
              <svg viewBox="0 0 600 48" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path d="M4 40 C 160 -8, 440 -8, 596 40" fill="none" stroke="var(--color-line-strong)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
              </svg>
              <span className="route-plane absolute top-0 left-0 grid size-8 place-items-center rounded-full bg-sky-400 text-white shadow-[0_6px_18px_-6px_rgb(35_145_238/0.8)]">
                <svg viewBox="0 0 24 24" className="size-4 rotate-90">
                  <path d={PLANE} fill="currentColor" />
                </svg>
              </span>
              <span className="absolute top-full left-0 mt-2 size-2.5 -translate-x-1/2 rounded-full bg-ink" />
              <span className="absolute top-full right-0 mt-2 size-2.5 translate-x-1/2 rounded-full bg-sky-400" />
            </div>
            <dl className="mt-10 grid gap-4 border-t border-dashed border-line-strong pt-6 sm:grid-cols-3">
              {usaPathway.stages.map((stage) => (
                <div key={stage.when}>
                  <dt className="text-[0.75rem] tracking-[0.12em] text-dim uppercase">{stage.when}</dt>
                  <dd className="mt-1 text-[0.9375rem] font-semibold text-ink">{stage.where}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};
