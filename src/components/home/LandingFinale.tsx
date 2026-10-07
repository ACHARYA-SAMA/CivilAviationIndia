import { ApproachHero } from "@/components/home/ApproachHero";
import { SignLink } from "@/components/ui/Sign";
import { contact, site } from "@/content/site";

/** The page ends where every flight does: an approach at blue hour and touchdown at Hyderabad. */
export const LandingFinale = () => (
  <ApproachHero variant="finale" id="arrival" label="Arrival">
    <div className="container-deck flex h-full flex-col justify-end pb-16 md:pb-24">
      <p className="readout text-[0.8125rem] tracking-[0.2em] text-hud">TOUCHDOWN</p>
      <h2 className="display mt-4 text-[clamp(2.75rem,7.6vw,8rem)] text-white">Welcome to Hyderabad.</h2>
      <p className="mt-5 max-w-xl text-[1.125rem] leading-relaxed text-white/85">
        {site.institute}, Kompally. <span className="readout text-[0.875rem]">{contact.coordinates}</span>
      </p>
      <div className="mt-8">
        <SignLink href="/admissions">Start your admission</SignLink>
      </div>
    </div>
  </ApproachHero>
);
