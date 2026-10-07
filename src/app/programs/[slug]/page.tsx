import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdmitCta } from "@/components/home/AdmitCta";
import { Photo } from "@/components/media/Photo";
import { CourseTable } from "@/components/programs/CourseTable";
import { DocumentList } from "@/components/programs/DocumentList";
import { GalleryReel } from "@/components/programs/GalleryReel";
import { CATEGORY_LABEL, HOLDER, ProgramStrip } from "@/components/programs/ProgramStrip";
import { SignLink } from "@/components/ui/Sign";
import type { ViewerItem } from "@/components/viewer/LetterViewer";
import { fleet, maintenanceCourses, otherCourses, pilotCourses, type CourseRow } from "@/content/fees";
import { getProgram, programs, type Program } from "@/content/programs";
import { cn } from "@/lib/cn";
import { previewOf } from "@/lib/media";

type Params = { slug: string };

export const generateStaticParams = (): Params[] => programs.map((program) => ({ slug: program.slug }));

export const generateMetadata = async ({ params }: { params: Promise<Params> }): Promise<Metadata> => {
  const program = getProgram((await params).slug);
  return program ? { title: program.title, description: program.overview.split(". ")[0] } : {};
};

/** Which rows of the society's fee schedule belong on each programme page, and which are its own. */
const FEE_ROWS: Record<string, { caption: string; rows: readonly CourseRow[]; own: readonly string[] }> = {
  "btech-aerospace-engineering": { caption: "Degree courses in the fee schedule", rows: otherCourses.filter((r) => ["BAS 608", "BAN 609"].includes(r.code)), own: ["BAS 608"] },
  "commercial-pilot-license": { caption: "Pilot training in the fee schedule", rows: pilotCourses, own: ["CPL 202", "CPLH 203"] },
  "multi-engine-rating": { caption: "Pilot training in the fee schedule", rows: pilotCourses, own: ["CPL 202", "ST 204"] },
  "aircraft-maintenance-engineering": { caption: "Aircraft Maintenance Engineering in the fee schedule", rows: maintenanceCourses, own: ["AME 101", "AME 102", "AME 103"] },
  "bba-aviation-management": { caption: "Management degree in the fee schedule", rows: otherCourses.filter((r) => r.code === "MBA 610"), own: ["MBA 610"] },
  "aviation-disaster-management": { caption: "Degree in the fee schedule", rows: otherCourses.filter((r) => r.code === "BAD 605"), own: ["BAD 605"] },
  "air-traffic-control": { caption: "Degree in the fee schedule", rows: otherCourses.filter((r) => r.code === "BATC 603"), own: ["BATC 603"] },
  "cabin-crew-ground-handling": { caption: "Cabin crew and ground handling in the fee schedule", rows: otherCourses.filter((r) => ["CAB801", "GH901"].includes(r.code)), own: ["CAB801", "GH901"] },
};

const leadOf = (text: string): { lead: string; rest: string } => {
  const cut = text.search(/(?<=\.)\s/);
  return cut === -1 ? { lead: text, rest: "" } : { lead: text.slice(0, cut), rest: text.slice(cut + 1) };
};

/** Client field -> partner chips: "A, B, and C" -> ["A", "B", "C"]. */
const partnersOf = (program: Program): readonly string[] => {
  if (program.partners) return program.partners;
  // Split on commas and a final "and", but never inside parentheses ("(e.g., Air France)").
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of program.client.replace(/\.$/, "")) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else current += char;
  }
  parts.push(current);
  return parts.map((part) => part.trim().replace(/^and\s+/, "")).filter(Boolean);
};

const Section = ({ id, fl, title, children, className }: { id: string; fl: string; title?: string; children: React.ReactNode; className?: string }) => (
  <section id={id} data-fl={fl} className={cn(" py-20 md:py-28", className)}>
    <div className="container-deck">
      {title ? <h2 className="heading fs-section mb-12 max-w-4xl text-ink">{title}</h2> : null}
      {children}
    </div>
  </section>
);

const ProgramPage = async ({ params }: { params: Promise<Params> }) => {
  const program = getProgram((await params).slug);
  if (!program) notFound();

  const fees = FEE_ROWS[program.slug];
  const photos: ViewerItem[] = [program.image, ...program.gallery].flatMap((id) => {
    const preview = id ? previewOf(id) : undefined;
    return id && preview ? [{ id, ...preview, title: null, summary: null }] : [];
  });
  const related = program.related.flatMap((slug) => {
    const item = getProgram(slug);
    return item ? [item] : [];
  });

  return (
    <>
      <ProgramHero program={program} />

      <Section id="overview" fl="Overview">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {program.overviewLabel ? <p className="mb-4 text-[0.9375rem] text-mute">{program.overviewLabel}</p> : null}
            {/* Lead sentence large, the rest as body: the paragraph is too long to set entirely in display type. */}
            <p className="display-wide text-[clamp(1.5rem,2.6vw,2.25rem)] text-ink">{leadOf(program.overview).lead}</p>
            {leadOf(program.overview).rest ? <p className="mt-6 max-w-2xl text-[1.125rem] leading-[1.75] text-mute">{leadOf(program.overview).rest}</p> : null}
          </div>
          <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
            <div className="rounded-[3px] bg-panel p-6">
              <p className="text-[0.8125rem] text-dim">Flagship project</p>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink">{program.project}</p>
            </div>
            <div>
              <p className="text-[0.8125rem] text-dim">Partners and regulators</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {partnersOf(program).map((partner) => (
                  <li key={partner} className="rounded-[3px] px-3 py-2 text-[0.875rem] text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                    {partner}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      <Section id="details" fl="Details">
        {program.essay ? (
          <p className="mb-20 max-w-4xl text-[1.1875rem] leading-[1.7] text-ink/90">{program.essay}</p>
        ) : null}
        <div className="divide-y divide-line border-y border-line">
          {program.sections.map((section) => (
            <div key={section.heading} className="grid gap-6 py-10 lg:grid-cols-12 lg:gap-12">
              <h2 className="heading text-[clamp(1.75rem,2.6vw,2.5rem)] text-ink lg:col-span-4">{section.heading}</h2>
              <p className="max-w-2xl text-[1.0625rem] leading-[1.75] text-mute lg:col-span-7 lg:col-start-6">{section.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {fees ? (
        <Section id="fees" fl="Fees" title="Fees and intake">
          <CourseTable caption={fees.caption} rows={fees.rows} highlight={fees.own} />
          <p className="mt-6 text-[0.9375rem] text-mute">
            Highlighted rows belong to this programme. The complete schedule, including type training on {fleet.length} aircraft families, is on the{" "}
            <Link href="/programs#fleet" className="text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:decoration-sky-300">
              Programs page
            </Link>
            .
          </p>
        </Section>
      ) : null}

      {photos.length > 1 ? (
        <Section id="photos" fl="Photos" title="On the programme">
          <GalleryReel items={photos} />
        </Section>
      ) : null}

      {program.downloads.length > 0 ? (
        <Section id="documents" fl="Documents" title="Syllabus and documents">
          <DocumentList keys={program.downloads} />
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section id="related" fl="Related" title="Other programmes">
          <ul className="space-y-2">
            {related.map((item) => (
              <li key={item.slug}>
                <ProgramStrip program={item} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <AdmitCta />
    </>
  );
};

const ProgramHero = ({ program }: { program: Program }) => (
  <header id="top" data-fl={program.short} className="night grain field relative isolate mt-[var(--frame)] flex min-h-[calc(92svh-var(--frame))] flex-col justify-end">
    {program.image ? (
      <div className="absolute inset-0 -z-20">
        <Photo id={program.image} alt="" mode="cover" priority sizes="100vw" />
      </div>
    ) : null}
    <div aria-hidden className="absolute inset-0 -z-10 bg-[#0a4fb3]/30 mix-blend-color" />
    <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(4_24_64/0.7),rgb(6_40_100/0.2)_34%,rgb(5_32_84/0.6)_68%,rgb(4_24_64/0.92))]" />

    <div className="container-deck relative z-[3] pt-[calc(var(--header-h)+4rem)] pb-12 md:pb-14">
      <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-ink/80">
        <Link href="/programs" className="transition-colors hover:text-amber-300">
          Programs
        </Link>
        <span aria-hidden className="mx-2 text-dim">/</span>
        <span>{CATEGORY_LABEL[program.category]}</span>
      </nav>
      <h1 className="display mt-4 max-w-6xl text-[clamp(2rem,6.6vw,7rem)] text-ink">{program.title}</h1>
      <p className="mt-5 max-w-2xl text-[1.1875rem] text-ink/90">{program.tagline}</p>

      {/* The programme's flight strip */}
      <div className="mt-12 flex overflow-hidden rounded-[14px] bg-panel/85 shadow-[0_24px_60px_-30px_rgb(0_10_40/0.8)] ring-1 ring-white/10 backdrop-blur-md">
        <span aria-hidden className={cn("w-1.5 shrink-0", HOLDER[program.category])} />
        <dl className="grid flex-1 grid-cols-2 md:grid-cols-[minmax(0,0.8fr)_repeat(3,minmax(0,1fr))]">
          <div className="px-5 py-4">
            <dt className="text-[0.75rem] text-dim">{program.code ? "Code" : "Stream"}</dt>
            <dd className={cn("mt-1.5 text-[1rem]", program.code ? "font-mono text-sky-300" : "text-ink")}>{program.code ?? CATEGORY_LABEL[program.category]}</dd>
          </div>
          <div className="border-l border-line px-5 py-4">
            <dt className="text-[0.75rem] text-dim">Duration</dt>
            <dd className="mt-1.5 text-[1rem] text-ink">{program.strip.duration}</dd>
          </div>
          <div className="border-line px-5 py-4 max-md:border-t md:border-l">
            <dt className="text-[0.75rem] text-dim">Intake</dt>
            <dd className="mt-1.5 text-[1rem] text-ink">{program.strip.intake}</dd>
          </div>
          <div className="border-l border-line px-5 py-4 max-md:border-t">
            <dt className="text-[0.75rem] text-dim">Fee</dt>
            <dd className="mt-1.5 text-[1rem] text-ink">{program.strip.fee}</dd>
          </div>
        </dl>
        <div className="hidden items-center border-l border-line px-4 md:flex">
          <SignLink href="/admissions" size="sm">
            Apply
          </SignLink>
        </div>
      </div>
      <div className="mt-4 md:hidden">
        <SignLink href="/admissions" size="sm">
          Apply
        </SignLink>
      </div>
    </div>
  </header>
);

export default ProgramPage;
