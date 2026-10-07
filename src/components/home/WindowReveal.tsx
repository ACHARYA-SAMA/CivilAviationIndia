"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

const WINDOW = "inset(calc((50svh - var(--w0) * 0.72 - var(--rim)) * (1 - var(--p))) calc((50vw - var(--w0) * 0.5 - var(--rim)) * (1 - var(--p))) round calc((var(--w0) * 0.42 + var(--rim)) * (1 - var(--p))))";

/**
 * A cabin window: the photograph starts framed by an aircraft window in a row of three and opens out
 * to full bleed as the section scrolls (clip-path driven by one CSS variable, --p). The closing line
 * arrives once the view is fully open.
 */
export const WindowReveal = ({ photo, side, children }: { photo: ReactNode; side: ReactNode; children: ReactNode }) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const open = useTransform(scrollYProgress, [0.04, 0.7], [0, 1], { clamp: true });
  const p = useTransform(open, (value) => (reduced ? 1 : value));
  const late = useTransform(scrollYProgress, (value) => (reduced ? 1 : Math.min(1, Math.max(0, (value - 0.66) / 0.2))));
  const sideX = useTransform(p, [0, 0.45], [0, 1], { clamp: true });
  const leftX = useTransform(sideX, (v) => `calc(-50% - ${135 + v * 125}%)`);
  const rightX = useTransform(sideX, (v) => `calc(-50% + ${135 + v * 125}%)`);
  const sideOpacity = useTransform(sideX, [0, 1], [0.85, 0]);
  const bezelOpacity = useTransform(p, [0, 0.5], [1, 0]);
  const zoom = useTransform(p, [0, 1], [1.28, 1]);
  const textY = useTransform(late, [0, 1], [40, 0]);

  return (
    <section ref={ref} id="window" data-fl="Window" className="relative h-[230svh] bg-[#dcebf8] motion-reduce:h-svh">
      <motion.div className="sticky top-0 h-svh overflow-hidden [--w0:62vw] md:[--w0:24vw]" style={{ "--p": p } as unknown as React.CSSProperties}>
        {/* Cabin wall, lit from the strip above the windows. */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_75%_at_50%_0%,#ffffff,#dbe9f6_62%,#c6d9ec)]" />

        {/* Neighbouring windows slide away as the main one opens. */}
        {[leftX, rightX].map((x, index) => (
          <motion.div
            key={index}
            aria-hidden
            className="absolute top-1/2 left-1/2 hidden h-[calc(var(--w0)*1.44)] w-[var(--w0)] overflow-hidden rounded-[calc(var(--w0)*0.42)] md:block"
            style={{ x, y: "-50%", opacity: sideOpacity }}
          >
            <div className="absolute inset-0 scale-125 opacity-70">{side}</div>
            <div className="absolute inset-0 bg-white/10 shadow-[inset_0_0_0_12px_#d3dce7,inset_0_0_36px_12px_rgb(30_50_80/0.35)]" />
          </motion.div>
        ))}

        {/* Window bezel (the plastic surround), fading as the view opens. */}
        <motion.div aria-hidden className="absolute inset-0 bg-[#c9d4e1] [--rim:14px]" style={{ opacity: bezelOpacity, clipPath: WINDOW }} />

        {/* The view */}
        <div className="absolute inset-0 [--rim:0px]" style={{ clipPath: WINDOW }}>
          <motion.div className="absolute inset-0" style={{ scale: zoom }}>
            {photo}
          </motion.div>
          <motion.div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#06245c]/85 via-[#0a3a8a]/10 to-[#06245c]/30" style={{ opacity: late }} />
        </div>

        <motion.div className="night absolute inset-x-0 bottom-0 z-10" style={{ opacity: late, y: textY }}>
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
};
