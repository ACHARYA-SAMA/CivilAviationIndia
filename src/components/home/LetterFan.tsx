"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { SignButton, SignLink } from "@/components/ui/Sign";
import type { ViewerItem } from "@/components/viewer/LetterViewer";

const LetterViewer = dynamic(() => import("@/components/viewer/LetterViewer").then((mod) => mod.LetterViewer), { ssr: false });

export type FanLetter = ViewerItem & { from: string; office: string; date: string };

/**
 * A hand of letters on the desk: stacked when the section arrives, fanned out as it scrolls into place.
 * Hovering a letter lifts it and puts its sender in the caption; clicking opens the zoom viewer.
 */
export const LetterFan = ({ letters, all, total, heading, intro }: { letters: readonly FanLetter[]; all: readonly ViewerItem[]; total: number; heading: string; intro: string }) => {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "center center"] });
  const fanned = useTransform(scrollYProgress, (value) => (reduced ? 1 : Math.min(1, Math.max(0, value * 1.15))));
  const [hover, setHover] = useState(() => Math.floor((letters.length - 1) / 2));
  const [open, setOpenState] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const setOpen = (index: number | null) => {
    if (index !== null) setLoaded(true);
    setOpenState(index);
  };
  const mid = (letters.length - 1) / 2;
  const current = letters[hover];

  return (
    <>
      <div className="grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="heading fs-section text-ink">{heading}</h2>
          <p className="mt-5 max-w-md text-mute">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SignLink href="/about/appreciation-letters">All {total} letters</SignLink>
            <SignButton tone="plain" size="md" onClick={() => setOpen(all.findIndex((item) => item.id === letters[hover]?.id))}>
              Read this letter
            </SignButton>
          </div>
          <div aria-live="polite" className="mt-10 min-h-28 border-l-[3px] border-sky-400 pl-5">
            {current ? (
              <>
                <p className="heading text-[1.5rem] text-ink">{current.from}</p>
                <p className="mt-1 text-[0.9375rem] leading-snug text-mute">{current.office}</p>
                <p className="readout mt-2 text-[0.8125rem] text-sky-300">{current.date}</p>
              </>
            ) : null}
          </div>
        </div>

        <motion.div
          ref={stage}
          className="relative max-sm:[scrollbar-width:none] max-sm:-mx-[var(--gutter)] max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:gap-4 max-sm:overflow-x-auto max-sm:px-[var(--gutter)] max-sm:pb-4 sm:h-[34rem] sm:[--spread:5.2rem] sm:[perspective:1600px] lg:col-span-8 lg:h-[40rem] lg:[--spread:6.4rem]"
          style={{ "--f": fanned } as unknown as React.CSSProperties}
        >
          {letters.map((letter, index) => {
            const offset = index - mid;
            return (
              <div
                key={letter.id}
                className="w-[62%] shrink-0 snap-center sm:absolute sm:top-[46%] sm:left-1/2 sm:w-[38%] sm:max-w-[18rem] sm:origin-[50%_150%] sm:[transform:translate(-50%,-50%)_translateX(calc(var(--o)*var(--spread)*0.55*var(--f)))_rotate(calc(var(--o)*9deg*var(--f)))_rotateY(calc(var(--o)*-5deg*var(--f)))]"
                style={{ "--o": offset, "--a": Math.abs(offset), zIndex: hover === index ? 30 : 20 - Math.round(Math.abs(offset) * 2) } as React.CSSProperties}
              >
                <button
                  type="button"
                  onPointerEnter={() => setHover(index)}
                  onFocus={() => setHover(index)}
                  onClick={() => setOpen(all.findIndex((item) => item.id === letter.id))}
                  data-cursor="Read"
                  aria-label={`Open the letter from ${letter.from}, ${letter.date}`}
                  className="block w-full origin-bottom overflow-hidden rounded-[2px] bg-white shadow-[0_30px_60px_-20px_rgb(4_30_80/0.5)] transition-transform duration-500 ease-flight hover:-translate-y-10 hover:scale-[1.04] focus-visible:-translate-y-10"
                >
                  <Image src={letter.src} alt="" width={letter.width} height={letter.height} sizes="(min-width: 1024px) 18rem, 38vw" placeholder="blur" blurDataURL={letter.blur} className="h-auto w-full" />
                </button>
              </div>
            );
          })}
        </motion.div>
      </div>

      {loaded ? <LetterViewer items={all} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </>
  );
};
