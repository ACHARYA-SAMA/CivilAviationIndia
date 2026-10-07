"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/hooks";
import { cn } from "@/lib/cn";

export type ChecklistItem = { challenge: string; response: string };

/**
 * The application procedure as a laminated cockpit checklist: challenge, dotted leader, response.
 * Items are ticked one after another when the card comes into view, and the card reports
 * "Checklist complete" at the end, as a crew would.
 */
export const Checklist = ({ title, subtitle, items }: { title: string; subtitle: string; items: readonly ChecklistItem[] }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -30% 0px" });
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(items.length);
      return;
    }
    const timers = items.map((_, index) => window.setTimeout(() => setDone(index + 1), 500 + index * 650));
    return () => timers.forEach(window.clearTimeout);
  }, [inView, items]);

  const complete = done >= items.length;

  return (
    <div ref={ref} className="relative overflow-hidden rounded-[14px] bg-[#f7fbff] text-[#06264f] shadow-[0_40px_100px_-40px_rgb(4_30_80/0.5)]">
      {/* Lamination sheen */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.5)_50%,transparent_60%)]" />
      <div className="flex items-center justify-between gap-4 border-b-2 border-[#06264f] bg-[#06264f] px-6 py-4 text-[#f7fbff] sm:px-8">
        <p className="sign-type text-[1.125rem]">{title}</p>
        <p className="text-[0.8125rem] opacity-80">{subtitle}</p>
      </div>
      <ol className="divide-y divide-dashed divide-[#06264f]/20 px-6 sm:px-8">
        {items.map((item, index) => {
          const ticked = index < done;
          return (
            <li key={item.challenge} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 sm:grid-cols-[auto_auto_minmax(2rem,1fr)_minmax(0,1.6fr)] sm:items-baseline">
              <span aria-hidden className="row-span-2 grid size-7 place-items-center self-start rounded-[4px] border-2 border-[#06264f] sm:row-span-1 sm:self-center">
                <svg viewBox="0 0 24 24" className="size-5">
                  <path
                    d="M4 12.5l5 5L20 6.5"
                    fill="none"
                    stroke="#0b5fc0"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="28"
                    strokeDashoffset={ticked ? 0 : 28}
                    className="transition-[stroke-dashoffset] duration-500 ease-flight"
                  />
                </svg>
              </span>
              <span className="sign-type text-[1rem] whitespace-nowrap">{item.challenge}</span>
              <span aria-hidden className="hidden h-px self-center border-b-2 border-dotted border-[#06264f]/40 sm:block" />
              <span className={cn("text-[1.0625rem] leading-snug transition-colors duration-500", ticked ? "text-[#06264f]" : "text-[#06264f]/70")}>{item.response}</span>
              <span className="sr-only">{ticked ? "(checked)" : ""}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center gap-3 border-t-2 border-[#06264f] px-6 py-4 sm:px-8" aria-live="polite">
        <span aria-hidden className={cn("size-2.5 rounded-full transition-colors duration-500", complete ? "bg-[#0b5fc0] shadow-[0_0_0_4px_rgb(11_95_192/0.2)]" : "bg-[#06264f]/25")} />
        <p className="sign-type text-[0.9375rem]">{complete ? "Checklist complete" : `${items.length - done} items to go`}</p>
      </div>
    </div>
  );
};
