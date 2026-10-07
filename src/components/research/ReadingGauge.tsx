"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

/**
 * A reading gauge pinned beside the article: a vertical tape with a pointer that descends as you read,
 * and the minutes left as a readout, like the altitude tape on a primary flight display.
 */
export const ReadingGauge = ({ minutes }: { minutes: number }) => {
  const self = useRef<HTMLDivElement>(null);
  const article = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    article.current = self.current?.closest("article") ?? null;
  }, []);
  const { scrollYProgress } = useScroll({ target: article, offset: ["start 30%", "end 70%"] });
  const top = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [left, setLeft] = useState(minutes);
  useMotionValueEvent(scrollYProgress, "change", (value) => setLeft(Math.max(0, Math.ceil(minutes * (1 - value)))));

  return (
    <div ref={self} aria-hidden className="sticky top-[calc(var(--header-h)+3rem)] flex gap-4">
      <div className="relative h-72 w-8">
        <div className="absolute inset-y-0 left-3 w-px bg-line-strong" />
        {Array.from({ length: 13 }, (_, i) => (
          <span key={i} className="absolute left-3 h-px bg-line-strong" style={{ top: `${(i / 12) * 100}%`, width: i % 3 === 0 ? 14 : 7 }} />
        ))}
        <motion.span style={{ top }} className="absolute -left-0.5 -translate-y-1/2 text-sky-400">
          <svg viewBox="0 0 16 16" className="size-4">
            <path d="M0 8l9-6v12z" fill="currentColor" transform="rotate(180 8 8)" />
          </svg>
        </motion.span>
      </div>
      <div className="readout pt-1 text-sky-300">
        <p className="text-[0.6875rem] tracking-[0.16em] text-dim">MIN LEFT</p>
        <p className="mt-1 text-[1.75rem] leading-none">{left}</p>
      </div>
    </div>
  );
};
