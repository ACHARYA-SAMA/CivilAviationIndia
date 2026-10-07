"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HoverPreview, type PreviewImage } from "@/components/ui/HoverPreview";
import { Segmented } from "@/components/ui/Segmented";
import { SplitFlap } from "@/components/ui/SplitFlap";
import type { ProgramCategory } from "@/content/programs";
import { useInView, useIstClock } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { HOLDER } from "./streams";

export type BoardProgram = {
  slug: string;
  category: ProgramCategory;
  flight: string;
  destination: string;
  duration: string;
  seats: string;
  stream: string;
};

const STREAMS: { id: ProgramCategory | "all"; label: string }[] = [
  { id: "all", label: "All departures" },
  { id: "pilot", label: "Pilot" },
  { id: "engineering", label: "Engineering" },
  { id: "management", label: "Management" },
  { id: "cabin", label: "Cabin crew and ground" },
];

const COLS = { flight: 8, destination: 26, duration: 9, seats: 3, stream: 11 } as const;

/**
 * The programmes on a split-flap departures board, captioned in Hindi and English as in Indian
 * terminals. Choosing a stream re-flips the board to that stream's departures; each row opens the
 * programme, and its photograph follows the pointer.
 */
export const DepartureBoard = ({ programs, previews }: { programs: readonly BoardProgram[]; previews: Record<string, PreviewImage> }) => {
  const [stream, setStream] = useState<ProgramCategory | "all">("all");
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -15% 0px" });
  const clock = useIstClock();
  const router = useRouter();
  const shown = programs.filter((program) => stream === "all" || program.category === stream);
  const rows = Array.from({ length: programs.length }, (_, index) => shown[index] ?? null);

  return (
    <div>
      <Segmented
        label="Show one stream"
        className="mb-8"
        value={stream}
        onChange={setStream}
        options={STREAMS.map((item) => ({ id: item.id, label: item.label, marker: item.id === "all" ? undefined : HOLDER[item.id] }))}
      />

      <div ref={ref} className="night overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#0b2e66,#08214a)] shadow-[0_60px_120px_-60px_rgb(4_30_80/0.9),inset_0_0_0_1px_rgb(255_255_255/0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <p className="flex items-baseline gap-4">
            <span lang="hi" className="text-[clamp(1.25rem,2.4vw,1.75rem)] font-semibold text-amber-300">
              प्रस्थान
            </span>
            <span className="sign-type text-[clamp(1.25rem,2.4vw,1.75rem)] text-amber-300">Departures</span>
          </p>
          <p className="flex items-center gap-2 text-[clamp(0.85rem,1.4vw,1.05rem)] text-white">
            <SplitFlap text={clock ?? "--:--"} length={5} run={inView && clock !== null} />
            <span className="readout text-[0.75rem] text-mute">IST</span>
          </p>
        </div>

        <HoverPreview previews={previews} className="scrollbar-none overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left">
            <caption className="sr-only">Programmes, with code, duration, seats per intake and stream</caption>
            <thead>
              <tr className="readout text-[0.6875rem] tracking-[0.16em] text-mute">
                <th scope="col" className="px-4 pt-4 pb-2 font-normal sm:pl-6">FLIGHT</th>
                <th scope="col" className="px-4 pt-4 pb-2 font-normal">DESTINATION</th>
                <th scope="col" className="hidden px-4 pt-4 pb-2 font-normal md:table-cell">DURATION</th>
                <th scope="col" className="hidden px-4 pt-4 pb-2 font-normal md:table-cell">SEATS</th>
                <th scope="col" className="hidden px-4 pt-4 pb-2 font-normal lg:table-cell sm:pr-6">STREAM</th>
              </tr>
            </thead>
              <tbody className="text-[clamp(0.62rem,1.55vw,1.05rem)]">
                {rows.map((program, index) => {
                  const delay = 120 + index * 110;
                  const cells = program ?? { flight: "", destination: "", duration: "", seats: "", stream: "" };
                  return (
                    <tr
                      key={index}
                      data-preview={program?.slug}
                      // The whole row is clickable; clicks on the row's own link are left to the link.
                      onClick={(event) => program && !(event.target as Element).closest("a") && router.push(`/programs/${program.slug}`)}
                      className={cn("group/row border-t border-white/[0.07] transition-colors duration-300", program && "cursor-pointer hover:bg-white/[0.07]")}
                    >
                      <td className="px-4 py-2.5 text-amber-300 sm:pl-6">
                        <span className="flex items-center gap-3">
                          <span aria-hidden className={cn("h-5 w-1 rounded-full", program ? HOLDER[program.category] : "bg-transparent")} />
                          <SplitFlap text={cells.flight} length={COLS.flight} run={inView} spins={2} delay={delay} />
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-white">
                        {program ? (
                          <Link href={`/programs/${program.slug}`} data-cursor="Board" className="block">
                            <SplitFlap text={cells.destination} length={COLS.destination} run={inView} spins={2} delay={delay + 60} />
                          </Link>
                        ) : (
                          <SplitFlap text="" length={COLS.destination} run={inView} spins={2} delay={delay + 60} />
                        )}
                      </td>
                      <td className="hidden px-4 py-2.5 text-white md:table-cell">
                        <SplitFlap text={cells.duration} length={COLS.duration} run={inView} spins={2} delay={delay + 120} />
                      </td>
                      <td className="hidden px-4 py-2.5 text-sky-300 md:table-cell">
                        <SplitFlap text={cells.seats} length={COLS.seats} align="right" run={inView} spins={2} delay={delay + 160} />
                      </td>
                      <td className="hidden px-4 py-2.5 text-white/80 lg:table-cell sm:pr-6">
                        <SplitFlap text={cells.stream} length={COLS.stream} run={inView} spins={2} delay={delay + 200} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          </table>
        </HoverPreview>
      </div>
    </div>
  );
};
