"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TiltProps = {
  children: ReactNode;
  /** Maximum rotation in degrees. */
  max?: number;
  className?: string;
  /** Light sheen that follows the pointer. */
  glare?: boolean;
};

/**
 * Pointer-driven 3D tilt for cards: rotation and the sheen position are CSS variables written once per
 * frame, never React state. Mouse/trackpad only, and off for reduced motion.
 */
export const Tilt = ({ children, max = 8, className, glare = true }: TiltProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  const write = (rx: number, ry: number, gx: number, gy: number, on: boolean) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--gx", `${gx.toFixed(1)}%`);
      el.style.setProperty("--gy", `${gy.toFixed(1)}%`);
      el.dataset.tilt = on ? "on" : "off";
    });
  };

  return (
    <div
      ref={ref}
      data-tilt="off"
      onPointerMove={(event) => {
        if (!enabled || event.pointerType !== "mouse" || !ref.current) return;
        const box = ref.current.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        write((0.5 - py) * max * 2, (px - 0.5) * max * 2, px * 100, py * 100, true);
      }}
      onPointerLeave={() => enabled && write(0, 0, 50, 50, false)}
      className={cn(
        "group/tilt relative [transform:perspective(1100px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-500 ease-flight transform-3d data-[tilt=on]:duration-150",
        className,
      )}
    >
      {children}
      {glare ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgb(255_255_255/0.22),transparent_55%)] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-data-[tilt=on]/tilt:opacity-100"
        />
      ) : null}
    </div>
  );
};
