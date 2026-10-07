import { FactsBoard, type BoardRow } from "@/components/home/FactsBoard";
import { TextReveal } from "@/components/motion/TextReveal";
import { fleet } from "@/content/fees";
import { letters } from "@/content/letters";
import { home, site } from "@/content/site";
import { trainingPrograms } from "@/content/training";

/** Every figure comes from the owner's own documents. "Years" is recomputed by the page's daily revalidation. */
const rows = (): BoardRow[] => [
  { value: String(site.established), label: "Established", remark: `${site.society} founded.` },
  { value: String(new Date().getFullYear() - site.established), label: "Years training", remark: "Pilots, engineers and aviation managers, Hyderabad." },
  { value: String(trainingPrograms.length), label: "Programmes", remark: "On the society’s published training list." },
  { value: "60", label: "Cadets / batch", remark: "The intake stated for every programme." },
  { value: String(fleet.length), label: "Aircraft types", remark: "Aircraft families with type training in the fee schedule." },
  { value: String(letters.length), label: "Letters", remark: "From the President, the Prime Minister’s Office and Union ministers." },
];

export const Mission = () => (
  <section id="mission" data-fl="Mission" className="relative isolate py-24 md:py-36">
    <div className="container-deck grid gap-16 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <TextReveal text={home.statement} className="display-wide text-[clamp(1.875rem,3.2vw,3rem)] text-ink" />
        <p className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-dim">
          {site.registration}. {site.iso}.
        </p>
      </div>
      <div className="lg:col-span-7">
        <FactsBoard rows={rows()} place={`${site.societyShort} / ${site.instituteShort} Kompally`} />
      </div>
    </div>
  </section>
);
