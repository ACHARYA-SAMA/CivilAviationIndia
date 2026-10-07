import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdmitCta } from "@/components/home/AdmitCta";
import { LetterArchive, type ArchiveLetter } from "@/components/letters/LetterArchive";
import { Tilt } from "@/components/ui/Tilt";
import { LETTER_GROUPS, letterTitle, letters } from "@/content/letters";
import { getMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "Appreciation letters",
  description:
    "Letters to the Indian Institute of Aero Space Technology and Management from the President of India, the Prime Minister’s Office, Union ministers and the Indian Air Force, readable in full.",
};

const archive = (): ArchiveLetter[] =>
  letters.flatMap((letter) => {
    const media = getMedia(letter.id);
    if (!media) return [];
    return [
      {
        id: letter.id,
        src: media.src,
        width: media.width,
        height: media.height,
        blur: media.blur,
        download: media.download,
        title: letterTitle(letter),
        summary: letter.summary,
        from: letter.from,
        office: letter.office,
        date: letter.date,
        iso: letter.iso,
        group: letter.group,
        language: letter.language,
      },
    ];
  });

/** The three letters on the desk in the hero: the President on top. */
const DESK = [
  { id: "letter-13", className: "left-[2%] top-[10%] w-[52%] -rotate-[7deg]" },
  { id: "letter-07", className: "right-[0%] top-[4%] w-[50%] rotate-[6deg]" },
  { id: "letter-02", className: "left-1/2 top-[16%] w-[56%] -translate-x-1/2 rotate-[-1deg]" },
];

const LettersPage = () => {
  const items = archive();
  const president = letters.find((letter) => letter.id === "letter-02");

  return (
    <>
      <section id="top" data-fl="Letters" className="relative isolate overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-20">
        <div className="container-deck grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-mute">
              <Link href="/about" className="transition-colors hover:text-amber-300">
                About
              </Link>
              <span aria-hidden className="mx-2 text-dim">/</span>
              <span className="text-ink/80">Appreciation letters</span>
            </nav>
            <h1 className="display mt-6 text-[clamp(2rem,4.4vw,4.75rem)] text-ink">
              {["Appreciation", "letters"].map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.05em]">
                  <span className="block animate-line-rise" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p className="mt-8 max-w-xl text-[1.1875rem] leading-[1.6] text-ink/90">
              {letters.length} letters kept in the institute’s records: the President of India, the Prime Minister’s Office, a Chief Minister, twenty Union ministers and the
              Indian Air Force. Every scan opens to read and zoom, and the original file downloads.
            </p>
            {president ? (
              <figure className="mt-10 max-w-xl border-l-[3px] border-sky-400 pl-6">
                <blockquote className="text-[1.0625rem] leading-relaxed text-ink">{president.summary}</blockquote>
                <figcaption className="readout mt-3 text-[0.8125rem] text-sky-300">
                  {president.from}, {president.office}, {president.date}
                </figcaption>
              </figure>
            ) : null}
          </div>
          <div className="relative h-[30rem] sm:h-[36rem] lg:col-span-6 lg:h-[42rem]">
            {DESK.map((sheet, index) => {
              const media = getMedia(sheet.id);
              if (!media) return null;
              return (
                <div key={sheet.id} className={`absolute ${sheet.className}`} style={{ zIndex: index }}>
                  <Tilt max={4} className="rounded-[2px]">
                    <div className="overflow-hidden rounded-[2px] bg-white shadow-[0_50px_90px_-30px_rgb(4_30_80/0.5)]">
                      <Image src={media.src} alt="" width={media.width} height={media.height} sizes="(min-width: 1024px) 26vw, 50vw" priority={index === 2} placeholder="blur" blurDataURL={media.blur} className="h-auto w-full" />
                    </div>
                  </Tilt>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="archive" data-fl="Archive" className="relative py-24 md:py-32">
        <div className="container-deck">
          <LetterArchive letters={items} groups={LETTER_GROUPS} />
        </div>
      </section>

      <AdmitCta />
    </>
  );
};

export default LettersPage;
