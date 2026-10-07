import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Checklist } from "@/components/admissions/Checklist";
import { GlobeCanvas } from "@/components/about/PartnerGlobe";
import { AdmitCta } from "@/components/home/AdmitCta";
import { SignAnchor, SignLink } from "@/components/ui/Sign";
import { SignArray } from "@/components/ui/SignArray";
import { usaPathway } from "@/content/pathway";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "2 + 2 pathway to the USA",
  description: usaPathway.summary,
};

const PLANE = "M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.1l-8-2.3v4.6l2.4 1.7v1.8L12 20.6l-3.9 1.1v-1.8l2.4-1.7v-4.6l-8 2.3v-2.1l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z";

const PathwayPage = () => {
  if (!usaPathway.published) notFound();
  const { from, to } = usaPathway;
  const requirements = [
    { challenge: "School", response: usaPathway.admission.requirements[0] },
    { challenge: "IIASTM", response: usaPathway.admission.requirements[1] },
    { challenge: "Assessment", response: usaPathway.admission.requirements[2] },
    { challenge: "English", response: "Met by completing Years 1 and 2 at IIASTM, which teaches in English" },
  ];

  return (
    <>
      <section id="top" data-fl="2 + 2 USA" className="relative isolate overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-20 md:pb-28">
        <div className="container-deck grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-mute">
              <Link href="/programs" className="transition-colors hover:text-sky-300">
                Programs
              </Link>
              <span aria-hidden className="mx-2 text-dim">/</span>
              <span className="text-ink/80">2 + 2 pathway</span>
            </nav>
            <h1 className="display mt-6 text-[clamp(2.5rem,5.6vw,5.75rem)] text-ink">
              {["Two years India.", "Two years USA."].map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.05em]">
                  <span className="block animate-line-rise" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-xl text-[1.1875rem] leading-[1.6] text-ink/90">{usaPathway.summary}</p>
            <p className="mt-6 flex max-w-xl gap-3 rounded-[14px] bg-white/80 p-4 text-[0.9375rem] leading-relaxed text-ink shadow-[0_14px_34px_-24px_rgb(4_30_80/0.6)] ring-1 ring-white backdrop-blur">
              <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-sky-500">
                <path d="M10 2 1.5 17h17zM10 8v4M10 14.5v.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {usaPathway.status}
            </p>
            <SignArray
              className="mt-8"
              destinations={[
                { label: "Route", href: "#route" },
                { label: "Admission", href: "#admission" },
                { label: "Costs", href: "#costs" },
                { label: "Questions", href: "#questions" },
              ]}
            />
          </div>
          <div className="relative lg:col-span-6">
            <div className="night relative mx-auto max-w-[36rem] rounded-full bg-[radial-gradient(circle_at_40%_35%,#13305a,#050b16_70%)] p-4 shadow-[0_60px_120px_-50px_rgb(11_50_100/0.8)]">
              <GlobeCanvas home={from} homeCode={from.code} destinations={[{ id: "tul", lat: to.lat, lon: to.lon, code: to.code }]} active="tul" />
            </div>
            <p className="readout mt-4 text-center text-[0.75rem] tracking-[0.18em] text-dim">
              {from.code} 17°32′N 78°29′E  /  {to.code} 36°09′N 95°52′W
            </p>
          </div>
        </div>
      </section>

      {/* The route, in three legs */}
      <section id="route" data-fl="Route" className="relative py-24 md:py-32">
        <div className="container-deck">
          <h2 className="heading fs-section max-w-3xl text-ink">How the four years run</h2>
          <ol className="relative mt-16 grid gap-6 lg:grid-cols-3">
            <span aria-hidden className="absolute top-9 right-[16%] left-[16%] hidden border-t-2 border-dashed border-line-strong lg:block" />
            {usaPathway.stages.map((stage, index) => (
              <li key={stage.when} className="sd-rise relative rounded-[22px] bg-panel p-7 shadow-[0_24px_60px_-40px_rgb(11_50_100/0.5)] ring-1 ring-line">
                <span className="relative z-10 grid size-[4.5rem] place-items-center rounded-full bg-[linear-gradient(140deg,#2391ee,#0d6dc6)] text-white shadow-[0_12px_30px_-12px_rgb(35_145_238/0.9)]">
                  {index === 2 ? (
                    <svg aria-hidden viewBox="0 0 24 24" className="size-7 -rotate-90">
                      <path d={PLANE} fill="currentColor" />
                    </svg>
                  ) : (
                    <span className="display text-[1.5rem]">{index === 0 ? from.code : to.code}</span>
                  )}
                </span>
                <p className="mt-6 text-[0.8125rem] tracking-[0.12em] text-dim uppercase">{stage.when}</p>
                <h3 className="heading mt-1 text-[1.5rem] text-ink">{stage.where}</h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-mute">{stage.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Admission to Spartan College */}
      <section id="admission" data-fl="Admission" className="relative py-24 md:py-32">
        <div className="container-deck grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="heading fs-section text-ink">Admission to Spartan College</h2>
            <p className="mt-6 rounded-[14px] bg-panel p-5 text-[1.0625rem] leading-relaxed font-semibold text-ink ring-1 ring-line">{usaPathway.admission.rule}</p>
            <p className="mt-6 text-[1.0625rem] leading-relaxed text-mute">{usaPathway.admission.process}</p>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-mute">{usaPathway.visa}</p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Checklist title="Spartan admission checklist" subtitle="Years 3 and 4" items={requirements} />
          </div>
        </div>
      </section>

      {/* Costs */}
      <section id="costs" data-fl="Costs" className="relative py-24 md:py-32">
        <div className="container-deck grid gap-14 lg:grid-cols-12">
          <h2 className="heading fs-section text-ink lg:col-span-4">Who you pay, and for what</h2>
          <dl className="divide-y divide-line overflow-hidden rounded-[22px] bg-panel ring-1 ring-line lg:col-span-7 lg:col-start-6">
            {usaPathway.money.map((row) => (
              <div key={row.item} className="grid gap-2 p-6 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-8">
                <dt className="font-semibold text-ink">{row.item}</dt>
                <dd className="text-[1rem] leading-relaxed text-mute">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Questions */}
      <section id="questions" data-fl="Questions" className="relative py-24 md:py-32">
        <div className="container-deck grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="heading fs-section text-ink">Questions</h2>
            <p className="mt-5 text-mute">Spartan College’s own admissions staff are the authority on Years 3 and 4.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignAnchor href={`mailto:${contact.email}?subject=${encodeURIComponent("2 + 2 USA pathway")}`} tone="direction" size="md" arrow="none">
                Register your interest
              </SignAnchor>
              <SignLink href="/admissions" tone="plain" size="md">
                Admissions
              </SignLink>
            </div>
          </div>
          <div className="space-y-3 lg:col-span-7 lg:col-start-6">
            {usaPathway.faqs.map((faq) => (
              <details key={faq.q} className="group/faq rounded-[18px] bg-panel ring-1 ring-line transition-shadow open:shadow-[0_24px_60px_-40px_rgb(11_50_100/0.5)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 text-[1.125rem] font-semibold text-ink">
                  {faq.q}
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-deck-900 text-sky-300 transition-transform duration-300 group-open/faq:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[1rem] leading-relaxed text-mute">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <AdmitCta />
    </>
  );
};

export default PathwayPage;
