import { TakeoffHero } from "@/components/home/TakeoffHero";
import { SignLink } from "@/components/ui/Sign";
import { contact, home, site } from "@/content/site";

const LINES = ["Civil Aviation", "India."] as const;

/**
 * Home hero: a daytime take-off of the society's aircraft (three.js, see takeoff/scene.ts) under the headline.
 * The headline, mission paragraph and signs are server-rendered and paint before any script runs;
 * the paragraph is the LCP element, so it is never animated in.
 */
export const Hero = () => (
  <TakeoffHero poster="/media/hero/takeoff-poster.webp">
    <div className="container-deck flex h-full flex-col justify-between pt-[calc(var(--header-h)+2.5rem)] pb-10 md:pb-14">
      <div>
        <h1 className="display fs-hero max-w-[12ch] text-white [text-shadow:0_2px_40px_rgb(0_20_60/0.35)]">
          <span className="sr-only">{site.name}</span>
          {LINES.map((line, index) => (
            <span key={line} aria-hidden className="block overflow-hidden pb-[0.05em]">
              <span className="block animate-line-rise" style={{ animationDelay: `${0.12 + index * 0.14}s` }}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className="mt-6 flex animate-fade-rise flex-wrap items-baseline gap-x-6 gap-y-1 text-[0.9375rem] text-white/90" style={{ animationDelay: "0.5s" }}>
          <span className="readout text-[0.8125rem] text-white">{contact.coordinates}</span>
          <span>{site.society}</span>
          <span>Est. {site.established}</span>
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        {/* Not animated: this paragraph is the page's LCP element. */}
        <p className="max-w-[27rem] text-[1.125rem] leading-[1.55] text-white [text-shadow:0_1px_18px_rgb(0_20_45/0.7)]">{home.mission}</p>
        <div className="flex animate-fade-rise flex-wrap gap-3" style={{ animationDelay: "0.65s" }}>
          <SignLink href="/admissions" size="lg">
            Start your admission
          </SignLink>
          <SignLink href="/programs" tone="plain" size="lg" magnetic>
            Explore programs
          </SignLink>
        </div>
      </div>
    </div>
  </TakeoffHero>
);
