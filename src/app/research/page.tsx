import type { Metadata } from "next";
import Link from "next/link";
import { AdmitCta } from "@/components/home/AdmitCta";
import { ResearchList } from "@/components/home/ResearchList";
import { FilmGallery } from "@/components/media/FilmGallery";
import { Photo } from "@/components/media/Photo";
import { Unveil } from "@/components/motion/ScrollFx";
import { DocumentList } from "@/components/programs/DocumentList";
import { Annunciator } from "@/components/research/Annunciator";
import { HoverPreview, type PreviewImage } from "@/components/ui/HoverPreview";
import { SignArray } from "@/components/ui/SignArray";
import { films } from "@/content/films";
import { articlesByDate, formatPublished, readingMinutes, researchCentre } from "@/content/research";
import { home } from "@/content/site";
import { filmItems, previewOf } from "@/lib/media";

export const metadata: Metadata = {
  title: "Research & Media",
  description: "Papers from the Aero Space Society of India, the planned Research and Development Centre, and television reports and films about the institute.",
};

const ResearchPage = () => {
  const [lead, ...rest] = articlesByDate();
  const previews = Object.fromEntries(
    articlesByDate().flatMap((article) => {
      const preview = article.image ? previewOf(article.image) : undefined;
      return preview ? [[article.slug, preview]] : [];
    }),
  ) as Record<string, PreviewImage>;

  return (
    <>
      {/* Hero: the newest paper as the cover story */}
      <section id="top" data-fl="Research" className="relative isolate pt-[calc(var(--header-h)+3rem)] pb-20 md:pb-28">
        <div className="container-deck">
          <h1 className="display text-[clamp(2.75rem,7vw,7.5rem)] text-ink">
            {["Research", "& Media"].map((line, index) => (
              <span key={line} className="block overflow-hidden pb-[0.05em]">
                <span className="block animate-line-rise" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl text-[1.1875rem] leading-[1.6] text-ink/90">{home.researchIntro}.</p>
            <SignArray
              destinations={[
                { label: "Papers", href: "#papers" },
                { label: "R&D Centre", href: "#centre" },
                { label: "Films", href: "#films" },
              ]}
            />
          </div>

          {lead ? (
            <Link href={`/research/${lead.slug}`} data-cursor="Read" className="group mt-16 grid overflow-hidden rounded-[8px] bg-panel md:mt-20 lg:grid-cols-12">
              <div className="relative aspect-[16/10] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[30rem]">
                {lead.image ? (
                  <Unveil className="absolute inset-0">
                    <div className="absolute inset-0 transition-transform duration-1000 ease-flight group-hover:scale-[1.04]">
                      <Photo id={lead.image} alt="" mode="cover" sizes="(min-width: 1024px) 58vw, 100vw" priority />
                    </div>
                  </Unveil>
                ) : null}
              </div>
              <div className="flex flex-col justify-between gap-10 p-8 md:p-10 lg:col-span-5">
                <p className="readout flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-sky-300">
                  <time dateTime={lead.published}>{formatPublished(lead.published)}</time>
                  <span>{readingMinutes(lead)} min read</span>
                </p>
                <div>
                  <h2 className="heading text-[clamp(1.875rem,3vw,2.75rem)] text-ink transition-colors duration-300 group-hover:text-amber-300">{lead.title}</h2>
                  <p className="mt-4 line-clamp-4 text-[1rem] leading-relaxed text-mute">{lead.paragraphs[0]}</p>
                </div>
                <p className="text-[0.9375rem] text-ink/80">{lead.author}</p>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      {/* Papers */}
      <section id="papers" data-fl="Papers" className="relative py-24 md:py-32">
        <div className="container-deck">
          <h2 className="heading fs-section mb-14 text-ink">More papers</h2>
          <HoverPreview previews={previews}>
            <ResearchList articles={rest} />
          </HoverPreview>
          <div className="mt-14 max-w-3xl">
            <DocumentList keys={["disaster-paper"]} />
          </div>
        </div>
      </section>

      {/* Research and Development Centre */}
      <section id="centre" data-fl="R&D Centre" className="relative py-24 md:py-32">
        <div className="container-deck">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="heading fs-section text-ink">Research and Development Centre</h2>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-mute">{researchCentre.intro}</p>
            </div>
            <dl className="grid gap-4 self-end sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {researchCentre.units.map((unit) => (
                <div key={unit.name} className="rounded-[6px] bg-panel p-6">
                  <dt className="heading text-[1.375rem] text-ink">{unit.name}</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-mute">{unit.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-20">
            <h3 className="heading text-[clamp(1.5rem,2.4vw,2.25rem)] text-ink">What earns central support</h3>
            <p className="mt-3 max-w-2xl text-mute">Six tests from the centre’s guidelines for Organized Research Units. Each lights up as the panel comes into view.</p>
            <div className="mt-10">
              <Annunciator items={researchCentre.criteria} />
            </div>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="heading text-[clamp(1.5rem,2.4vw,2.25rem)] text-ink">Proposing a new unit</h3>
              <p className="mt-3 text-mute">{researchCentre.review}</p>
            </div>
            <ol className="space-y-px overflow-hidden rounded-[6px] lg:col-span-6 lg:col-start-7">
              {researchCentre.proposal.map((item, index) => (
                <li key={item} className="flex items-baseline gap-5 bg-panel px-5 py-4">
                  <span className="readout text-[0.8125rem] text-sky-300">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[1rem] text-ink">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16 max-w-3xl">
            <DocumentList keys={["research-centre"]} />
          </div>
        </div>
      </section>

      {/* Films */}
      <section id="films" data-fl="Films" className="relative py-24 md:py-32">
        <div className="container-deck">
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <h2 className="heading fs-section text-ink lg:col-span-6">On screen</h2>
            <p className="max-w-md text-mute lg:col-span-5 lg:col-start-8 lg:self-end">
              The society’s own film, two television reports from ETV on the 2015 exhibition, and the institute’s slideshow.
            </p>
          </div>
          <FilmGallery films={filmItems(films)} />
        </div>
      </section>

      <AdmitCta />
    </>
  );
};

export default ResearchPage;
