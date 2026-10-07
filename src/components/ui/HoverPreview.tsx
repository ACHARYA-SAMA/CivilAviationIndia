"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";

export type PreviewImage = { src: string; width: number; height: number; blur: string };

type HoverPreviewProps = {
  /** Keyed by the `data-preview` attribute placed on rows inside `children`. */
  previews: Record<string, PreviewImage>;
  children: ReactNode;
  className?: string;
  /** Width of the floating photo in px. */
  width?: number;
};

const SPRING = { stiffness: 260, damping: 28, mass: 0.5 } as const;

/**
 * Wraps a list whose rows carry `data-preview="key"`. On mouse devices the row's real photo floats
 * beside the cursor while it is hovered, so the list stays dense but every row shows what it is.
 * Touch and reduced-motion users get the plain list (rows show their own thumbnail on small screens).
 */
export const HoverPreview = ({ previews, children, className, width = 320 }: HoverPreviewProps) => {
  const area = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  useEffect(() => {
    const fine = matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine);
    if (!fine) return;
    // Wheel-scrolling moves rows under a still pointer; hide until the pointer moves again.
    const hide = () => setActive(null);
    addEventListener("scroll", hide, { passive: true });
    return () => removeEventListener("scroll", hide);
  }, []);

  const onMove = (event: React.PointerEvent) => {
    if (!enabled || event.pointerType !== "mouse") return;
    const row = (event.target as Element).closest<HTMLElement>("[data-preview]");
    const key = row?.dataset.preview ?? null;
    setActive((current) => (current === key ? current : key));
    // Sit above-right of the pointer so the row being read stays visible; flip at viewport edges.
    const image = key ? previews[key] : undefined;
    const tall = image ? Math.round((width * image.height) / image.width) : 200;
    const flipX = event.clientX + 48 + width > innerWidth - 16;
    const flipY = event.clientY - tall - 28 < 16;
    x.set(flipX ? event.clientX - 48 - width : event.clientX + 48);
    y.set(flipY ? event.clientY + 32 : event.clientY - tall - 28);
  };

  const image = active ? previews[active] : undefined;
  const height = image ? Math.round((width * image.height) / image.width) : 0;

  return (
    <div ref={area} className={className} onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      {children}
      {enabled ? (
        <motion.div aria-hidden style={{ x, y }} className="pointer-events-none fixed top-0 left-0 z-[60]">
          <AnimatePresence mode="popLayout">
            {image && active ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.92, clipPath: "inset(0 0 100% 0)" }}
                animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: DUR.base, ease: EASE }}
                className="overflow-hidden rounded-[3px] shadow-[0_24px_60px_-20px_rgb(4_30_80/0.5)]"
                style={{ width, height }}
              >
                <Image src={image.src} alt="" width={width} height={height} sizes={`${width}px`} placeholder="blur" blurDataURL={image.blur} className="h-full w-full object-cover" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </div>
  );
};
