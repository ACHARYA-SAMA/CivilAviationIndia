import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdvisoryList } from "@/components/about/AdvisoryList";
import { HonourCard } from "@/components/about/HonourCard";
import { NeoUniverse } from "@/components/about/NeoUniverse";
import { PartnerGlobe } from "@/components/about/PartnerGlobe";
import { RouteTimeline, type RouteStop } from "@/components/about/RouteTimeline";
import { AdmitCta } from "@/components/home/AdmitCta";
import { Photo } from "@/components/media/Photo";
import { Drift } from "@/components/motion/ScrollFx";
import { TextReveal } from "@/components/motion/TextReveal";
import { DocumentList } from "@/components/programs/DocumentList";
import { SignArray } from "@/components/ui/SignArray";
import { SignLink } from "@/components/ui/Sign";
import { about, home_base, milestones, partners } from "@/content/about";
import { advisoryCommittee } from "@/content/advisory";
import { letters } from "@/content/letters";
import { site } from "@/content/site";
import { getMedia } from "@/lib/media";

export const metadata: Metadata = {
  title: "About",
  description: `${site.society} and the ${site.institute}: the President, milestones since ${site.established}, honours, global partners and the advisory committee.`,
};

const section = (id: string) => about.sections.find((item) => item.id === id);

const stops = (): RouteStop[] =>
  milestones.map((milestone) => ({
    ident: milestone.ident,
    when: milestone.when,
    title: milestone.title,
    body: milestone.body,
    photo: milestone.photo ? <Photo id={milestone.photo} alt={milestone.photoAlt ?? ""} sizes="(min-width: 768px) 28rem, 90vw" /> : undefined,
  }));

const stackOf = (ids: readonly string[], alt: string) => ids.map((id) => <Photo key={id} id={id} alt={alt} mode="cover" sizes="(min-width: 1024px) 22vw, 70vw" />);

const HERO_PHOTOS = [
  { id: "fr-0SBQ3X7fJr7hYoTlm71VqOK4ro", alt: "Guests with the institute's training aircraft", className: "top-[4%] right-[6%] w-[58%] rotate-[3deg]", drift: 6 },
  { id: "act-77-1", alt: "The institute's Republic Day tableau with rocket and satellite models", className: "top-[40%] left-0 w-[50%] -rotate-[4deg]", drift: 12 },
  { id: "fr-hF9lSsMQUISpNJoMrzegHoBCQA", alt: "An award presented at the Asia Education Summit 2015", className: "bottom-[2%] right-[10%] w-[46%] rotate-[2deg]", drift: 18 },
];

const AboutPage = () => {
  const awards = section("awards");
  const achievements = section("achievements");
  const global = section("global-partners");
  const letterThumbs = ["letter-02", "letter-13", "letter-07", "letter-15", "letter-24"].flatMap((id) => {
    const media = getMedia(id);
    return media ? [{ id, ...media }] : [];
  });

  return (
    <>
      {/* Hero */}
      <section id="top" data-fl="About" className="relative isolate overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-20 md:pb-28">
        <div className="container-deck grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h1 className="display text-[clamp(2.75rem,6.2vw,6.25rem)] text-ink">
              {["Aero Space", "Society", "of India"].map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.05em]">
                  <span className="block animate-line-rise" style={{ animationDelay: `${0.1 + index * 0.12}s` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>
            <p className="mt-8 max-w-xl text-[1.1875rem] leading-[1.6] text-ink/90">
              The society behind the {site.institute}, Kompally, Secunderabad, since {site.established}. {site.accreditation}.
            </p>
            <SignArray
              className="mt-10"
              destinations={[
                { label: "President", href: "#president" },
                { label: "Milestones", href: "#route" },
                { label: "Honours", href: "#honours" },
                { label: "Partners", href: "#partners" },
                { label: "Neo Universe", href: "#neo-universe" },
                { label: "Advisory committee", href: "#advisory" },
              ]}
            />
          </div>
          <div className="relative h-[28rem] sm:h-[34rem] lg:col-span-6 lg:h-[38rem]">
            {HERO_PHOTOS.map((photo) => (
              <Drift key={photo.id} distance={photo.drift} className={`absolute ${photo.className}`}>
                <div className="overflow-hidden rounded-[3px] shadow-[0_40px_80px_-30px_rgb(4_30_80/0.5)] ring-[6px] ring-[#ffffff]">
                  <Photo id={photo.id} alt={photo.alt} sizes="(min-width: 1024px) 26vw, 55vw" priority />
                </div>
              </Drift>
            ))}
          </div>
        </div>
      </section>

      {/* President */}
      <section id="president" data-fl="President" className="relative py-24 md:py-36">
        <div className="container-deck grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="heading text-[1.75rem] text-ink">{about.president.name}</p>
            <p className="mt-1 text-mute">President</p>
          </div>
          <div className="lg:col-span-9">
            <TextReveal text={about.president.body} className="display-wide text-[clamp(1.5rem,2.6vw,2.4rem)] text-ink" />
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section id="route" data-fl="Milestones" className="relative overflow-hidden py-24 md:py-36">
        <div className="container-deck">
          <div className="mb-20 max-w-3xl">
            <h2 className="heading fs-section text-ink">From {site.established} to today</h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-mute">
              The route so far, from the society’s own records: dated photographs, the Andhra Pradesh certificate and the letters it received.
            </p>
          </div>
          <RouteTimeline stops={stops()} />
        </div>
      </section>

      {/* Honours */}
      <section id="honours" data-fl="Honours" className="relative isolate py-24 md:py-36">
        <div className="container-deck">
          <div className="grid gap-12 lg:grid-cols-12">
            <h2 className="heading fs-section text-ink lg:col-span-5">Awards and achievements</h2>
            <div className="space-y-5 text-[1.0625rem] leading-relaxed text-mute lg:col-span-6 lg:col-start-7">
              {[...(awards?.paragraphs ?? []), ...(achievements?.paragraphs ?? [])].map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="mt-20 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <HonourCard
              when="2015"
              title="Asia Education Summit"
              text="Dr. Satyanarayana’s contributions to aerospace education honoured on a national platform."
              photos={stackOf(about.photos.summit, "Asia Education Summit 2015")}
            />
            <HonourCard
              when="26 January 2012"
              title="State Level Ceremonial Parade"
              text="A Republic Day tableau of space-craft, radar and satellite models, certified by the Government of Andhra Pradesh."
              photos={stackOf(about.photos.parade, "Republic Day 2012 tableau and certificate")}
            />
            <HonourCard
              when="November 2015"
              title="National Aerospace Museum Exhibit"
              text="Full-size shuttle and aircraft models, engines and cockpits, opened to schools in Hyderabad."
              photos={stackOf(about.photos.museumExhibit, "National Aerospace Museum Exhibit")}
            />
            <HonourCard
              when="South Africa"
              title="Skill Africa"
              text="A Memorandum of Understanding with the Maluti-A-Phofung Local Municipality."
              photos={stackOf(about.photos.skillAfrica, "Skill Africa initiative in South Africa")}
            />
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" data-fl="Partners" className="relative overflow-hidden py-24 md:py-36">
        <div className="container-deck">
          <div className="mb-16 grid gap-10 lg:grid-cols-12">
            <h2 className="heading fs-section text-ink lg:col-span-5">Global partners</h2>
            <div className="space-y-5 text-[1.0625rem] leading-relaxed text-mute lg:col-span-6 lg:col-start-7">
              {(global?.paragraphs ?? []).map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <PartnerGlobe home={home_base} partners={partners} />
        </div>
      </section>

      <NeoUniverse />

      {/* Advisory committee */}
      <section id="advisory" data-fl="Advisory" className="relative isolate py-24 md:py-36">
        <div className="container-deck">
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <h2 className="heading fs-section text-ink lg:col-span-7">Advisory committee</h2>
            <p className="max-w-md text-mute lg:col-span-4 lg:col-start-9 lg:self-end">
              Scientists, engineers and officers who advise the society, among them the leader of India’s Agni missile programme.
            </p>
          </div>
          <AdvisoryList members={advisoryCommittee} />
          <div className="mt-16 max-w-3xl">
            <DocumentList keys={["advisory-committee"]} />
          </div>
        </div>
      </section>

      {/* Letters */}
      <section id="letters" data-fl="Letters" className="relative overflow-hidden py-24 md:py-36">
        <div className="container-deck grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="heading fs-section text-ink">Appreciation letters</h2>
            <p className="mt-5 max-w-md text-mute">
              {letters.length} letters, from the President of India and the Prime Minister’s Office to Union ministers and the Indian Air Force, each one readable in full.
            </p>
            <div className="mt-8">
              <SignLink href="/about/appreciation-letters">Read the letters</SignLink>
            </div>
          </div>
          <Link href="/about/appreciation-letters" aria-label="Open the appreciation letters" className="group relative block h-[22rem] sm:h-[26rem] lg:col-span-7">
            {letterThumbs.map((thumb, index) => (
              <span
                key={thumb.id}
                className="absolute top-1/2 left-1/2 w-[34%] max-w-[13rem] overflow-hidden rounded-[2px] bg-white shadow-[0_24px_50px_-20px_rgb(4_30_80/0.5)] transition-transform duration-700 ease-flight"
                style={{
                  transform: `translate(-50%, -50%) translateX(${(index - 2) * 22}%) rotate(${(index - 2) * 4}deg)`,
                  zIndex: 10 - Math.abs(index - 2),
                }}
              >
                <Image src={thumb.src} alt="" width={thumb.width} height={thumb.height} sizes="13rem" placeholder="blur" blurDataURL={thumb.blur} className="h-auto w-full transition-transform duration-700 ease-flight group-hover:scale-[1.03]" />
              </span>
            ))}
          </Link>
        </div>
      </section>

      <AdmitCta />
    </>
  );
};

export default AboutPage;
