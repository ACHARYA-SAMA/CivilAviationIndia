"use client";

import { SplitFlap } from "@/components/ui/SplitFlap";
import { useInView, useIstClock } from "@/lib/hooks";

export type BoardRow = { value: string; label: string; remark: string };

/**
 * The institute's figures on a split-flap board. Every value is from the owner's documents; the
 * remark column says where. The header clock is live campus time (IST).
 */
export const FactsBoard = ({ rows, place }: { rows: readonly BoardRow[]; place: string }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -20% 0px" });
  const clock = useIstClock();

  return (
    <div ref={ref} className="night overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#0b2e66,#08214a)] p-3 shadow-[0_50px_100px_-50px_rgb(4_30_80/0.85),inset_0_0_0_1px_rgb(255_255_255/0.08)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-1 pb-4 text-[clamp(0.8rem,1.6vw,1.05rem)] text-amber-300">
        <SplitFlap text={place} run={inView} />
        <span className="flex items-center gap-2">
          <SplitFlap text={clock ?? "--:--"} length={5} run={inView && clock !== null} delay={400} />
          <span className="readout text-[0.75rem] text-mute">IST</span>
        </span>
      </div>

      <dl className="divide-y divide-white/[0.08]">
        {rows.map((row, index) => (
          <div key={row.label} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-1 py-3.5 sm:gap-x-7 md:grid-cols-[auto_auto_minmax(0,1fr)]">
            <dt className="order-2 text-[clamp(0.72rem,1.3vw,1.05rem)] text-sky-300">
              <SplitFlap text={row.label} length={14} run={inView} delay={300 + index * 160} />
            </dt>
            <dd className="order-1 text-[clamp(1.6rem,3.6vw,3rem)] text-white">
              <SplitFlap text={row.value} length={4} align="right" run={inView} delay={200 + index * 160} />
            </dd>
            <dd className="order-3 col-span-2 text-[0.875rem] leading-snug text-mute md:col-span-1 md:pl-4">{row.remark}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
