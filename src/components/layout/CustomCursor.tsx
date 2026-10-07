"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Mode = { kind: "idle" } | { kind: "link" } | { kind: "label"; text: string } | { kind: "text" };

const INTERACTIVE = "a, button, [role='button'], summary, label[for]";

/**
 * Desktop-only cursor: a small dot plus a trailing ring that grows on interactive targets and
 * can carry a word ("Drag", "View") via `data-cursor="…"`. Disabled for touch and reduced motion.
 */
export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [hidden, setHidden] = useState(true);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.35 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setHidden(false);
    };
    const same = (a: Mode, b: Mode) => a.kind === b.kind && (a.kind !== "label" || (b.kind === "label" && a.text === b.text));
    const update = (next: Mode) => setMode((current) => (same(current, next) ? current : next));
    const over = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled?.dataset.cursor) return update({ kind: "label", text: labelled.dataset.cursor });
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return update({ kind: "text" });
      update(target?.closest(INTERACTIVE) ? { kind: "link" } : { kind: "idle" });
    };
    const leave = () => setHidden(true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const labelled = mode.kind === "label";

  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200", hidden || mode.kind === "text" ? "opacity-0" : "opacity-100")}>
      <motion.span style={{ x, y }} className="absolute top-0 left-0 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-sky-500" />
      <motion.span
        style={{ x: ringX, y: ringY }}
        className={cn(
          "absolute top-0 left-0 grid place-items-center rounded-full border transition-[width,height,margin,background-color,border-color] duration-300 ease-flight",
          labelled
            ? "-mt-10 -ml-10 size-20 border-sky-400 bg-sky-400 text-white"
            : mode.kind === "link"
              ? "-mt-[22px] -ml-[22px] size-11 border-sky-300"
              : "-mt-4 -ml-4 size-8 border-line-strong",
        )}
      >
        {labelled ? <span className="label font-medium">{mode.text}</span> : null}
      </motion.span>
    </div>
  );
};
