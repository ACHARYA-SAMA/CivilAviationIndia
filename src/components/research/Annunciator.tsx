"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/**
 * A cockpit annunciator panel: one backlit tile per criterion. The tiles light one after another
 * when the panel scrolls into view (a "press to test"), and each tile's full text sits beneath it.
 */
export const Annunciator = ({ items }: { items: readonly { short: string; text: string }[] }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -25% 0px" });
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(items.length);
      return;
    }
    const timers = items.map((_, index) => window.setTimeout(() => setLit(index + 1), 260 + index * 220));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, items]);

  return (
    <div ref={ref} className="night rounded-[24px] bg-[linear-gradient(180deg,#0b2e66,#08214a)] p-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05),0_40px_100px_-40px_rgb(4_30_80/0.5)] sm:p-4">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const on = index < lit;
          return (
            <li key={item.short} className="flex flex-col gap-4 rounded-[12px] bg-white/[0.05] p-3 ring-1 ring-white/[0.06]">
              <span
                aria-hidden
                className={cn(
                  "readout grid min-h-20 place-items-center rounded-[8px] px-3 text-center text-[0.9375rem] font-bold tracking-[0.14em] uppercase transition-[background-color,color,box-shadow] duration-300",
                  on
                    ? "bg-[#123f7d] text-white shadow-[inset_0_0_26px_rgb(120_200_255/0.45),0_0_26px_-4px_rgb(120_200_255/0.55)] [text-shadow:0_0_14px_rgb(160_220_255/0.9)]"
                    : "bg-[#082658] text-dim shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]",
                )}
              >
                {item.short}
              </span>
              <p className="px-1 pb-1 text-[0.9375rem] leading-snug text-mute">{item.text}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
