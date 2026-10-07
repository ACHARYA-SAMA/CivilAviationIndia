"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = { id: T; label: ReactNode; /** Colour class for a small stream marker. */ marker?: string };

/**
 * A filter as one frosted bar of options; the selected option's pill slides to it. Each option is a
 * toggle button (aria-pressed). Scrolls sideways on phones rather than wrapping.
 */
export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}) => {
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("scrollbar-none flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/55 p-1 shadow-[inset_0_0_0_1px_var(--color-line)] backdrop-blur-md", className)}
    >
      {options.map((option) => {
        const on = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option.id)}
            className={cn(
              "sign-type relative isolate inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[0.9375rem] whitespace-nowrap transition-colors duration-200 ease-flight",
              on ? "text-on-ink" : "text-ink/75 hover:text-ink",
            )}
          >
            {on ? (
              <motion.span
                layoutId={`${id}-thumb`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-on shadow-[0_6px_16px_-8px_rgb(6_24_47/0.6)]"
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 38 }}
              />
            ) : null}
            {option.marker ? <span aria-hidden className={cn("size-2 rounded-full", option.marker)} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
