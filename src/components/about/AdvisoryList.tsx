"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AdvisoryMember } from "@/content/advisory";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";

/**
 * The advisory committee as a crew list. On large screens, hovering or focusing a name shows that
 * member's qualifications and honours in the panel beside the list; on small screens each name opens
 * in place.
 */
export const AdvisoryList = ({ members }: { members: readonly AdvisoryMember[] }) => {
  const [active, setActive] = useState(0);
  const member = members[active];

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <ol className="lg:col-span-6">
        {members.map((item, index) => (
          <li key={item.name} className="border-b border-line first:border-t">
            {/* Desktop: hover/focus selects. */}
            <button
              type="button"
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              className="group hidden w-full items-baseline justify-between gap-6 py-5 text-left lg:flex"
            >
              <span
                className={cn(
                  "heading text-[clamp(1.5rem,2.4vw,2.25rem)] transition-[color,transform] duration-300 ease-flight",
                  active === index ? "translate-x-3 text-amber-300" : "text-ink/75 group-hover:text-ink",
                )}
              >
                {item.name}
              </span>
              {item.honours ? <span className="readout shrink-0 text-[0.75rem] text-sky-300">{item.honours.length} honours</span> : null}
            </button>
            {/* Mobile: disclosure. */}
            <details className="group/d lg:hidden">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-5">
                <span className="heading text-[1.5rem] text-ink">{item.name}</span>
                <span aria-hidden className="readout text-sky-300 transition-transform group-open/d:rotate-45">+</span>
              </summary>
              <MemberDetail member={item} />
            </details>
          </li>
        ))}
      </ol>

      <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
        <div className="sticky top-[calc(var(--header-h)+2rem)] min-h-[22rem] rounded-[6px] bg-panel p-8">
          <AnimatePresence mode="wait">
            {member ? (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: DUR.fast * 1.5, ease: EASE }}
                aria-live="polite"
              >
                <p className="heading text-[2rem] text-ink">{member.name}</p>
                <MemberDetail member={member} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const MemberDetail = ({ member }: { member: AdvisoryMember }) => (
  <div className="pb-6 lg:pb-0">
    <p className="mt-3 text-[1rem] leading-relaxed text-mute">{member.qualifications}</p>
    {member.honours ? (
      <ul className="mt-6 space-y-3 border-t border-line pt-6">
        {member.honours.map((honour) => (
          <li key={honour} className="flex gap-3 text-[0.9375rem] leading-snug text-ink/90">
            <svg aria-hidden viewBox="0 0 20 20" className="mt-1 size-3 shrink-0 text-sky-400">
              <path d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6z" fill="currentColor" />
            </svg>
            {honour}
          </li>
        ))}
      </ul>
    ) : null}
  </div>
);
