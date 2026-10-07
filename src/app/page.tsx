import type { Metadata } from "next";
import { AdmitCta } from "@/components/home/AdmitCta";
import { FieldRecord } from "@/components/home/FieldRecord";
import { Hero } from "@/components/home/Hero";
import { LandingFinale } from "@/components/home/LandingFinale";
import { LetterFan, type FanLetter } from "@/components/home/LetterFan";
import { Mission } from "@/components/home/Mission";
import { PassDeck, type DeckItem } from "@/components/home/PassDeck";
import { ResearchList } from "@/components/home/ResearchList";
import { TrackStory, type Track } from "@/components/home/TrackStory";
import { WindowReveal } from "@/components/home/WindowReveal";
import { Photo } from "@/components/media/Photo";
import { PathwayBand } from "@/components/pathway/PathwayBand";
import type { ViewerItem } from "@/components/viewer/LetterViewer";
import { letterTitle, letters } from "@/content/letters";
import { programs, requireProgram } from "@/content/programs";
import { articlesByDate } from "@/content/research";
import { home, site } from "@/content/site";
import { getMedia, previewOf } from "@/lib/media";
import { HoverPreview, type PreviewImage } from "@/components/ui/HoverPreview";

// Rebuilt at most once a day: keeps the "years since 1994" figure current without a redeploy.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.society}` },
  description: site.description,
};

const firstSentence = (text: string): string => text.split(/(?<=\.)\s/)[0] ?? text;

const buildTracks = (): Track[] =>
  home.tracks.map((track) => {
    const program = requireProgram(track.program);
    return {
      id: track.id,
      label: track.label,
      summary: firstSentence(program.overview),
      tagline: program.tagline,
      partners: program.client,
      project: track.image ? undefined : program.project,
      href: `/programs/${program.slug}`,
      photo: track.image ? (
        <Photo id={track.image} alt={`${track.label}: ${program.title}`} mode="cover" sizes="(min-width: 1024px) 58vw, 100vw" />
      ) : null,
      // Curriculum items quoted from the programme's own text (Degree in Aviation Disaster Management).
      points: track.id === "disaster" ? ["Airport Emergency Plans", "Safety Management Systems", "Disaster Risk Reduction"] : undefined,
    };
  });

const buildDeck = (): DeckItem[] =>
  programs.map((program) => ({
    program: { slug: program.slug, category: program.category, code: "code" in program ? program.code : undefined, title: program.title, short: program.short, strip: program.strip },
    photo: program.image ? <Photo id={program.image} alt="" mode="cover" sizes="(min-width: 640px) 200px, 1px" /> : null,
  }));

const researchPreviews = (): Record<string, PreviewImage> =>
  Object.fromEntries(
    articlesByDate().flatMap((article) => {
      const preview = article.image ? previewOf(article.image) : undefined;
      return preview ? [[article.slug, preview]] : [];
    }),
  );

const buildViewerItems = (): ViewerItem[] =>
  letters.flatMap((letter) => {
    const media = getMedia(letter.id);
    if (!media?.download) return [];
    return [{ id: letter.id, src: media.src, width: media.width, height: media.height, blur: media.blur, download: media.download, title: letterTitle(letter), summary: letter.summary }];
  });

/** The hand of letters on Home: the President in the middle, the Chief Minister and the PMO beside him. */
const FAN = ["letter-09", "letter-15", "letter-13", "letter-02", "letter-07", "letter-24", "letter-11"];

const buildFan = (items: readonly ViewerItem[]): FanLetter[] =>
  FAN.flatMap((id) => {
    const item = items.find((entry) => entry.id === id);
    const letter = letters.find((entry) => entry.id === id);
    return item && letter ? [{ ...item, from: letter.from, office: letter.office, date: letter.date }] : [];
  });

const HomePage = () => {
  const viewerItems = buildViewerItems();

  return (
    <>
      <Hero />

      <WindowReveal
        photo={<Photo id={home.heroImage} alt="Propellers of a large turboprop aircraft seen against a glazed roof and blue sky" mode="cover" sizes="100vw" position="50% 45%" />}
        side={<Photo id={home.heroImage} alt="" mode="cover" sizes="100vw" />}
      >
        <div className="container-deck pb-14 md:pb-20">
          <p className="display fs-xxl max-w-[16ch] text-ink">{site.motto}.</p>
        </div>
      </WindowReveal>

      <Mission />

      <section id="training" data-fl="Training" className="relative">
        <TrackStory tracks={buildTracks()} />
      </section>

      <PassDeck items={buildDeck()} heading="Choose your departure" intro={home.trainingIntro} />

      <PathwayBand />

      <section id="letters" data-fl="Letters" className="relative isolate overflow-hidden py-24 md:py-36">
        <div className="container-deck">
          <LetterFan
            letters={buildFan(viewerItems)}
            all={viewerItems}
            total={viewerItems.length}
            heading="Appreciation letters"
            intro="Messages from the President of India, the Prime Minister’s Office and Union ministers, kept in the institute’s records. Hover a letter to see who wrote it; open it to read it in full."
          />
        </div>
      </section>

      <section id="field" data-fl="Field record" className="relative py-24 md:py-36">
        <div className="container-deck">
          <h2 className="heading fs-section mb-16 text-ink">From the gallery</h2>
          <FieldRecord />
        </div>
      </section>

      <section id="research" data-fl="Research" className="relative isolate py-24 md:py-36">
        <div className="container-deck">
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <h2 className="heading fs-section text-ink lg:col-span-7">Research &amp; Media</h2>
            <p className="max-w-md text-mute lg:col-span-4 lg:col-start-9 lg:self-end">{home.researchIntro}</p>
          </div>
          <HoverPreview previews={researchPreviews()}>
            <ResearchList articles={articlesByDate()} />
          </HoverPreview>
        </div>
      </section>

      {/* Climb to cruise, then the night-fall landing at Hyderabad closes the page. */}
      <AdmitCta />

      <LandingFinale />
    </>
  );
};

export default HomePage;
