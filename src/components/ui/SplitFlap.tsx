"use client";

import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const STEP_MS = 75;

const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)] ?? "A";

type TileProps = { target: string; run: boolean; delay: number; spins: number };

/**
 * One Solari tile. Each change folds the old top half down over the new one: a few random
 * characters, then the target. It renders once; flips write text and start compositor-only
 * animations directly (no React re-render per flip), so a board of hundreds of tiles stays smooth.
 */
const Tile = memo(({ target, run, delay, spins }: TileProps) => {
  const top = useRef<HTMLSpanElement>(null);
  const bottom = useRef<HTMLSpanElement>(null);
  const foldTop = useRef<HTMLSpanElement>(null);
  const foldBottom = useRef<HTMLSpanElement>(null);
  const shown = useRef(" ");
  const anims = useRef<Animation[]>([]);

  useEffect(() => {
    if (!run || target === shown.current) return;
    const t = top.current;
    const b = bottom.current;
    const ft = foldTop.current;
    const fb = foldBottom.current;
    if (!t || !b || !ft || !fb) return;
    const text = (el: HTMLSpanElement) => el.firstElementChild as HTMLSpanElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const flip = (next: string) => {
      const prev = shown.current;
      shown.current = next;
      anims.current.forEach((a) => a.cancel());
      text(t).textContent = next;
      text(b).textContent = prev;
      text(ft).textContent = prev;
      text(fb).textContent = next;
      if (reduced || !ft.animate) {
        text(b).textContent = next;
        ft.style.transform = "scaleY(0)";
        return;
      }
      anims.current = [
        ft.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: STEP_MS * 0.5, easing: "ease-in", fill: "forwards" }),
        fb.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: STEP_MS * 0.5, delay: STEP_MS * 0.5, easing: "ease-out", fill: "forwards" }),
      ];
    };

    if (reduced) {
      flip(target);
      return;
    }
    const sequence = target === " " ? [" "] : [...Array.from({ length: spins }, randomChar), target];
    const timers = sequence.map((char, index) => window.setTimeout(() => flip(char), delay + index * STEP_MS));
    return () => timers.forEach(window.clearTimeout);
  }, [run, target, delay, spins]);

  return (
    <span aria-hidden className="flap">
      <span ref={top} className="flap-half flap-top">
        <span> </span>
      </span>
      <span ref={bottom} className="flap-half flap-bottom">
        <span> </span>
      </span>
      <span ref={foldTop} className="flap-half flap-top flap-fold">
        <span> </span>
      </span>
      <span ref={foldBottom} className="flap-half flap-bottom flap-fold [transform:scaleY(0)]">
        <span> </span>
      </span>
    </span>
  );
});
Tile.displayName = "Tile";

type SplitFlapProps = {
  text: string;
  /** Pad or cut to a fixed number of tiles, so columns line up on a board. */
  length?: number;
  /** Starts flipping when true (typically when the board scrolls into view). */
  run?: boolean;
  /** ms before the first tile starts. */
  delay?: number;
  className?: string;
  align?: "left" | "right";
  /** Random characters before each tile settles (fewer on large boards). */
  spins?: number;
};

export const SplitFlap = ({ text, length, run = true, delay = 0, className, align = "left", spins = 4 }: SplitFlapProps) => {
  const upper = text.toUpperCase();
  const fitted = length ? (align === "right" ? upper.padStart(length) : upper.padEnd(length)).slice(0, length) : upper;
  return (
    <span className={cn("inline-flex gap-[0.06em] whitespace-pre", className)}>
      <span className="sr-only">{text}</span>
      {Array.from(fitted).map((char, index) => (
        <Tile key={index} target={char} run={run} delay={delay + index * 30} spins={Math.max(1, spins - 1 + ((index * 7 + char.charCodeAt(0)) % 3))} />
      ))}
    </span>
  );
};
