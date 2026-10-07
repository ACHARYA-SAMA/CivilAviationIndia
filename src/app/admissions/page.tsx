import type { Metadata } from "next";
import Link from "next/link";
import { CalEmbed } from "@/components/admissions/CalEmbed";
import { Checklist } from "@/components/admissions/Checklist";
import { ContactBlock } from "@/components/admissions/ContactBlock";
import { Photo } from "@/components/media/Photo";
import { DocumentList } from "@/components/programs/DocumentList";
import { ProgramStrip } from "@/components/programs/ProgramStrip";
import { SignArray } from "@/components/ui/SignArray";
import { programs } from "@/content/programs";
import { admissions, calLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Admissions",
  description: admissions.intro,
};

const HERO = "fr-IszovutAaupnRLHIk5raIxfpVao";

/** Checklist challenges for the four published steps (the responses are the steps, verbatim). */
const CHALLENGES = ["Apply", "Scrutiny", "Preparation", "Classes"];

const AdmissionsPage = () => {
  const eligibility = programs.flatMap((program) => {
    const fact = program.facts.find((item) => item.label === "Eligibility");
    return fact ? [{ slug: program.slug, title: program.title, value: fact.value }] : [];
  });

  return (
    <>
      <header id="top" data-fl="Admissions" className="night grain field relative isolate mt-[var(--frame)] flex min-h-[calc(78svh-var(--frame))] flex-col justify-end">
        <div className="absolute inset-0 -z-20">
          <Photo id={HERO} alt="" mode="cover" priority sizes="100vw" position="50% 40%" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[#0a4fb3]/30 mix-blend-color" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(4_24_64/0.7),rgb(6_40_100/0.2)_34%,rgb(5_32_84/0.6)_68%,rgb(4_24_64/0.92))]" />
        <div className="container-deck relative z-[3] pt-[calc(var(--header-h)+4rem)] pb-14 md:pb-16">
          <h1 className="display text-[clamp(2.5rem,9vw,9.5rem)] text-ink">Admissions</h1>
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <p className="max-w-xl text-[1.1875rem] leading-[1.55] text-ink/90 lg:col-span-6">{admissions.intro}</p>
            <SignArray
              className="lg:col-span-6 lg:justify-self-end"
              destinations={[
                { label: "How to apply", href: "#apply" },
                { label: "Forms", href: "#forms" },
                ...(calLink ? [{ label: "Book a meeting", href: "#book" }] : []),
                { label: "Contact", href: "#contact" },
              ]}
            />
          </div>
        </div>
      </header>

      <section id="apply" data-fl="How to apply" className="py-24 md:py-32">
        <div className="container-deck grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="heading fs-section text-ink">Application procedure</h2>
            <p className="mt-4 text-[0.9375rem] text-mute">As published for the {admissions.source}.</p>

            <div className="mt-12">
              <Checklist
                title="Admission checklist"
                subtitle={admissions.source}
                items={admissions.procedure.map((step, index) => ({ challenge: CHALLENGES[index] ?? `Step ${index + 1}`, response: step }))}
              />
            </div>
          </div>

          <aside className="space-y-8 lg:col-span-4 lg:col-start-9">
            <div className="rounded-[3px] bg-panel p-6">
              <p className="text-[0.8125rem] text-dim">{admissions.eligibilityTitle}</p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink">{admissions.eligibility}</p>
            </div>
            <div className="rounded-[3px] bg-panel p-6">
              <p className="text-[0.8125rem] text-dim">Course outcomes</p>
              <ul className="mt-3 space-y-2">
                {admissions.outcomes.map((outcome) => (
                  <li key={outcome} className="text-[1.0625rem] text-ink">
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-12">
            <h3 className="mt-6 text-[1.0625rem] text-ink">Eligibility stated by programme</h3>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {eligibility.map((item) => (
                <li key={item.slug} className="grid gap-2 py-4 md:grid-cols-12 md:gap-8">
                  <Link href={`/programs/${item.slug}`} className="text-[1rem] text-ink transition-colors hover:text-amber-300 md:col-span-5">
                    {item.title}
                  </Link>
                  <p className="text-[1rem] text-sky-300 md:col-span-7">{item.value}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="forms" data-fl="Forms" className="py-24 md:py-32">
        <div className="container-deck">
          <h2 className="heading fs-section mb-12 text-ink">Registration and admission forms</h2>
          <DocumentList keys={["registration-form", "admission-form"]} />
        </div>
      </section>

      {calLink ? (
        <section id="book" data-fl="Book" className="py-24 md:py-32">
          <div className="container-deck">
            <h2 className="heading fs-section mb-12 text-ink">Book a 15-minute meeting</h2>
            <CalEmbed link={calLink} />
          </div>
        </section>
      ) : null}

      <section id="programmes" data-fl="Programmes" className="py-24 md:py-32">
        <div className="container-deck">
          <h2 className="heading fs-section mb-12 text-ink">Choose a programme</h2>
          <ul className="space-y-2">
            {programs.map((program) => (
              <li key={program.slug}>
                <ProgramStrip program={program} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="contact" data-fl="Contact" className="py-24 md:py-32">
        <div className="container-deck">
          <h2 className="heading fs-section mb-14 text-ink">Contact the admissions office</h2>
          <ContactBlock />
        </div>
      </section>

    </>
  );
};

export default AdmissionsPage;
