import type { Metadata } from "next";
import Image from "next/image";
import { AdmitCta } from "@/components/home/AdmitCta";
import { AmbientVideo } from "@/components/media/AmbientVideo";
import { ChecksTable } from "@/components/programs/ChecksTable";
import { CourseTable } from "@/components/programs/CourseTable";
import { DocumentList } from "@/components/programs/DocumentList";
import { FleetTable } from "@/components/programs/FleetTable";
import { DepartureBoard, type BoardProgram } from "@/components/programs/DepartureBoard";
import { CATEGORY_LABEL } from "@/components/programs/streams";
import { SignArray } from "@/components/ui/SignArray";
import { PathwayBand } from "@/components/pathway/PathwayBand";
import type { PreviewImage } from "@/components/ui/HoverPreview";
import { fleet, fleetMakers, maintenanceChecks, maintenanceCourses, otherCourses, pilotCourses } from "@/content/fees";
import { programs, type Program } from "@/content/programs";
import { home } from "@/content/site";
import { campusPrograms, campusProgramsIntro, trainingPrograms } from "@/content/training";
import { getMedia, previewOf } from "@/lib/media";

export const metadata: Metadata = {
  title: "Programs",
  description: home.trainingIntro,
};

const HERO_VIDEO = "video-YIkwSRUPD9Ev5TqSA3odyqTNNQ";

/** Board fields: the code's first part as the flight number, the duration's first two words, the seats per intake. */
const toBoard = (program: Program): BoardProgram => {
  const code = "code" in program && program.code ? program.code.split(" / ")[0]!.replace(/–\d+$/, "") : program.short.split(" ")[0]!.replace("Multi-Engine", "MER");
  return {
    slug: program.slug,
    category: program.category,
    flight: code,
    destination: program.short,
    duration: program.strip.duration.split(",")[0]!,
    seats: program.strip.intake.split(" ")[0]!,
    stream: CATEGORY_LABEL[program.category].split(" ")[0]!,
  };
};

const SectionHead = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mb-12 grid gap-6 lg:grid-cols-12">
    <h2 className="heading fs-section text-ink lg:col-span-6">{title}</h2>
    {children ? <div className="max-w-xl text-[1.0625rem] leading-relaxed text-mute lg:col-span-5 lg:col-start-8 lg:self-end">{children}</div> : null}
  </div>
);

const ProgramsPage = () => {
  const video = getMedia(HERO_VIDEO);
  const previews = Object.fromEntries(
    programs.flatMap((program) => {
      const preview = program.image ? previewOf(program.image) : undefined;
      return preview ? [[program.slug, preview]] : [];
    }),
  ) as Record<string, PreviewImage>;

  return (
    <>
      <header id="top" data-fl="Programs" className="night grain field relative isolate mt-[var(--frame)] flex min-h-[calc(86svh-var(--frame))] flex-col justify-end">
        <div className="absolute inset-0 -z-20">
          {video?.poster ? (
            <AmbientVideo
              src={video.src}
              poster={<Image src={video.poster} alt="" fill priority sizes="100vw" placeholder="blur" blurDataURL={video.blur} className="object-cover" />}
            />
          ) : null}
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[#0a4fb3]/30 mix-blend-color" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(4_24_64/0.7),rgb(6_40_100/0.2)_34%,rgb(5_32_84/0.6)_68%,rgb(4_24_64/0.92))]" />

        <div className="container-deck relative z-[3] pt-[calc(var(--header-h)+4rem)] pb-14 md:pb-16">
          <p className="text-[0.9375rem] text-ink/80">Student opportunities</p>
          <h1 className="display mt-3 text-[clamp(3rem,11vw,11rem)] text-ink">Programs</h1>
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
            <p className="max-w-xl text-[1.1875rem] leading-[1.55] text-ink/90 lg:col-span-6">{home.trainingIntro}</p>
            <SignArray
              className="lg:col-span-6 lg:justify-self-end"
              destinations={[
                { label: "Streams", href: "#board" },
                { label: "Fees", href: "#fees" },
                { label: "Fleet", href: "#fleet" },
                { label: "Check costs", href: "#checks" },
              ]}
            />
          </div>
        </div>
      </header>

      <section id="board" data-fl="Board" className="py-24 md:py-32">
        <div className="container-deck">
          <SectionHead title="Choose a stream">
            Eight programmes on one departures board. Pick a stream and the board flips to its programmes; open a row for the full programme.
          </SectionHead>
          <DepartureBoard programs={programs.map(toBoard)} previews={previews} />
        </div>
      </section>

      <PathwayBand id="usa" />

      <section id="fees" data-fl="Fees" className="py-24 md:py-32">
        <div className="container-deck">
          <SectionHead title="Course fees and intake">
            From the Aero Space Society of India fee schedule. Fees are per head; intake is the number of seats in each batch.
          </SectionHead>
          <div className="space-y-16">
            <CourseTable caption="Aircraft Maintenance Engineering" rows={maintenanceCourses} />
            <CourseTable caption="Pilot training" rows={pilotCourses} />
            <CourseTable caption="Cabin crew, aviation medicine, degrees and ground handling" rows={otherCourses} />
            <DocumentList keys={["fee-schedule"]} />
          </div>
        </div>
      </section>

      <section id="fleet" data-fl="Fleet" className="py-24 md:py-32">
        <div className="container-deck">
          <SectionHead title="Fleet">
            Type training for {fleet.length} aircraft families. Each row pairs the engineer type course with the pilot type rating for the same aircraft, as listed in the fee schedule.
          </SectionHead>
          <FleetTable rows={fleet} makers={fleetMakers} />
        </div>
      </section>

      <section id="checks" data-fl="Check costs" className="py-24 md:py-32">
        <div className="container-deck">
          <SectionHead title="Maintenance check costs">
            Cost of A, B, C and D checks by aircraft type, as published by the society. A &amp; B check costs are not listed in the source document.
          </SectionHead>
          <ChecksTable rows={maintenanceChecks} />
          <div className="mt-10">
            <DocumentList keys={["check-costs"]} />
          </div>
        </div>
      </section>

      <section id="lists" data-fl="Published lists" className="py-24 md:py-32">
        <div className="container-deck">
          <SectionHead title="Programme lists as published" />
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h3 className="text-[1.0625rem] text-ink">Aviation training programmes</h3>
              <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
                {trainingPrograms.map((item) => (
                  <li key={item.name} className="border-b border-line py-3 text-[0.9375rem] text-mute">
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <h3 className="text-[1.0625rem] text-ink">Programmes on this campus</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-mute">{campusProgramsIntro}</p>
              <ol className="mt-6">
                {campusPrograms.map((item, index) => (
                  <li key={item} className="flex gap-4 border-b border-line py-3 text-[0.9375rem] text-mute">
                    <span className="w-6 shrink-0 font-mono text-[0.8125rem] text-dim tabular-nums">{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="mt-16">
            <DocumentList keys={["programme-list", "diploma-syllabus"]} />
          </div>
        </div>
      </section>

      <AdmitCta />
    </>
  );
};

export default ProgramsPage;
