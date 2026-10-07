"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

type WordProps = { word: string; range: [number, number]; progress: MotionValue<number> };

const Word = ({ word, range, progress }: WordProps) => {
  // 0.55 keeps "unlit" words above 3:1 (large text) on the light ground, so the effect never hides the sentence.
  const opacity = useTransform(progress, range, [0.55, 1]);
  return (
    <span className="mr-[0.24em] inline-block">
      <motion.span style={{ opacity }} className="inline-block">
        {word}
      </motion.span>
    </span>
  );
};

/** Scroll-linked word-by-word "lighting up" of a statement. The whole sentence is always in the DOM. */
export const TextReveal = ({ text, className }: { text: string; className?: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 82%", "end 48%"] });
  const words = text.split(" ");

  if (reduced) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex flex-wrap">
        {words.map((word, index) => {
          const start = index / words.length;
          return <Word key={`${word}-${index}`} word={word} range={[start, Math.min(start + 1.6 / words.length, 1)]} progress={scrollYProgress} />;
        })}
      </span>
    </p>
  );
};
