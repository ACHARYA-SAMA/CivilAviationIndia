"use client";

import { SplitFlap } from "@/components/ui/SplitFlap";
import { useInView, useIstClock } from "@/lib/hooks";

/** Campus local time on flaps, as on a terminal clock. */
export const FooterClock = () => {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const time = useIstClock();
  return (
    <span ref={ref} className="inline-flex items-center gap-2 text-[1.25rem] text-white">
      <SplitFlap text={time ?? "--:--"} length={5} run={inView && time !== null} />
      <span className="readout text-[0.75rem] text-mute">IST, Kompally</span>
    </span>
  );
};
