import { Photo } from "@/components/media/Photo";
import { SignLink } from "@/components/ui/Sign";
import { Drift } from "@/components/motion/ScrollFx";
import { cn } from "@/lib/cn";

/**
 * Captions state only what is visible on the photograph itself (banner, flag, certificate) or
 * what the institute's own About text and certificate say about the event.
 */
const FRAMES = [
  {
    id: "act-14-1",
    alt: "Three men holding signed documents in front of a Maluti-A-Phofung Local Municipality banner",
    caption: "Skill Africa: Memorandum of Understanding signed with the Maluti-A-Phofung Local Municipality, South Africa.",
    tile: "sm:col-span-2 lg:col-span-7 lg:row-span-2",
    depth: 4,
  },
  {
    id: "act-66-0",
    alt: "A plaque being presented on stage at the Asia Education Summit 2015",
    caption: "Asia Education Summit 2015, where Dr. Satyanarayana’s contribution to aerospace education was honoured.",
    tile: "lg:col-span-5",
    depth: 7,
  },
  {
    id: "act-34-0",
    alt: "Visitors at the National Aerospace Museum Exhibit entrance banner",
    caption: "National Aerospace Museum Exhibit.",
    tile: "lg:col-span-5",
    depth: 6,
  },
  {
    id: "act-77-1",
    alt: "A decorated truck carrying demonstration models of spacecraft and a rocket on the parade ground",
    caption:
      "State Level Ceremonial Parade, Republic Day, 26 January 2012: the Institute’s tableau of demonstration models of space crafts, radar and satellites, certified by the Government of Andhra Pradesh.",
    tile: "sm:col-span-2 lg:col-span-12",
    depth: 5,
  },
] as const;

/** A bento of four field photographs: one large, two stacked beside it, one wide below. */
export const FieldRecord = () => (
  <div>
    <div className="grid auto-rows-[17rem] gap-3 sm:grid-cols-2 lg:auto-rows-[18rem] lg:grid-cols-12">
      {FRAMES.map((frame) => (
        <figure key={frame.id} className={cn("group/tile relative isolate overflow-hidden rounded-[22px] bg-deck-800", frame.tile)}>
          {/* Oversized by the drift distance on each side, so the moving photo never exposes an edge. */}
          <Drift distance={frame.depth} className="absolute inset-x-0 -inset-y-[10%] -z-10">
            <div className="relative h-full w-full transition-transform duration-[1.2s] ease-flight group-hover/tile:scale-[1.04]">
              <Photo id={frame.id} alt={frame.alt} mode="cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </Drift>
          <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(4_18_44/0.88),rgb(4_18_44/0.5)_60%,transparent)] px-5 pt-16 pb-5 text-[0.9375rem] leading-snug text-white">
            <span className="line-clamp-2 max-w-xl group-hover/tile:line-clamp-none">{frame.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
    <div className="mt-10">
      <SignLink href="/gallery" tone="plain">
        Open the full gallery
      </SignLink>
    </div>
  </div>
);
