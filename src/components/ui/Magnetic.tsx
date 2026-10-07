"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type MagneticProps = { children: ReactNode; strength?: number; className?: string };

/**
 * Pulls its child a few pixels toward a mouse pointer. Plain DOM writes plus a CSS transition
 * (no animation library), inert for touch and reduced motion.
 */
export const Magnetic = ({ children, strength = 0.3, className }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  // Box measured on enter, before any pull is applied, so the maths never feeds back on itself.
  const box = useRef<DOMRect | null>(null);

  const onEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    box.current = ref.current?.getBoundingClientRect() ?? null;
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = box.current;
    if (!rect || !ref.current) return;
    const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
    const y = (event.clientY - (rect.top + rect.height / 2)) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    box.current = null;
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("inline-block transition-transform duration-300 ease-flight", className)}
    >
      {children}
    </div>
  );
};
