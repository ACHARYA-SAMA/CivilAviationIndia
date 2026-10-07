"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { signClass } from "@/components/ui/Sign";

export type ViewerItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  blur: string;
  /** Original file for the Download button (letters); photos omit it. */
  download?: string;
  title: string | null;
  summary: string | null;
};

type ViewerProps = {
  items: readonly ViewerItem[];
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
  /** What one item is called in the controls ("Letter", "Photo"). */
  noun?: string;
};

const MIN = 1;
const MAX = 6;
const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

/**
 * Full-screen image viewer for letters and photographs: wheel / pinch / double-click zoom, drag to pan,
 * ← → between items, + − 0 for zoom, Esc to close, and (for letters) a download of the original scan.
 */
export const LetterViewer = ({ items, index, onIndex, onClose, noun = "Letter" }: ViewerProps) => {
  const lower = noun.toLowerCase();
  const reduced = useReducedMotion();
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const panning = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const item = index === null ? undefined : items[index];
  const isOpen = index !== null;

  // Focus goes back to whatever opened the viewer. The opener is remembered while the viewer is
  // closed, because by the time an "opened" effect runs the Close button has already taken focus.
  // Seeded during the first render: the viewer is lazy-loaded and can mount already open,
  // and at that moment focus is still on the button that opened it.
  const opener = useRef<HTMLElement | null>(
    typeof document !== "undefined" && document.activeElement instanceof HTMLElement ? document.activeElement : null,
  );
  useEffect(() => {
    if (isOpen) return () => opener.current?.focus();
    const remember = (event: FocusEvent) => {
      // Ignore the dialog's own autofocus, which lands before this listener is removed.
      if (event.target instanceof HTMLElement && !event.target.closest("[role='dialog']")) opener.current = event.target;
    };
    document.addEventListener("focusin", remember);
    return () => document.removeEventListener("focusin", remember);
  }, [isOpen]);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomTo = useCallback((next: number, origin?: { x: number; y: number }) => {
    const box = stage.current?.getBoundingClientRect();
    setScale((current) => {
      const target = clamp(next, MIN, MAX);
      if (target === MIN) setOffset({ x: 0, y: 0 });
      else if (box && origin) {
        // Keep the point under the cursor fixed while the scale changes.
        const px = origin.x - (box.left + box.width / 2);
        const py = origin.y - (box.top + box.height / 2);
        const ratio = target / current;
        setOffset((o) => ({ x: px - (px - o.x) * ratio, y: py - (py - o.y) * ratio }));
      }
      return target;
    });
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      reset();
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex, reset],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Tab" && dialog.current) {
        // Keep keyboard focus inside the dialog.
        const focusable = [...dialog.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
        return;
      }
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "+" || event.key === "=") zoomTo(scale * 1.4);
      else if (event.key === "-") zoomTo(scale / 1.4);
      else if (event.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [index, go, onClose, reset, scale, zoomTo]);

  const onWheel = (event: WheelEvent) => zoomTo(scale * Math.exp(-event.deltaY * 0.0025), { x: event.clientX, y: event.clientY });

  const onPointerDown = (event: PointerEvent) => {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (a && b) pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale };
      panning.current = null;
    } else if (scale > 1) {
      panning.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      if (a && b) zoomTo((pinch.current.scale * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.distance, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    } else if (panning.current) {
      setOffset({ x: panning.current.ox + event.clientX - panning.current.x, y: panning.current.oy + event.clientY - panning.current.y });
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) panning.current = null;
  };

  const onDoubleClick = (event: React.MouseEvent) => (scale > 1 ? reset() : zoomTo(2.6, { x: event.clientX, y: event.clientY }));

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={item.title ?? `${noun} ${(index ?? 0) + 1} of ${items.length}`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className="night fixed inset-0 z-[80] flex flex-col bg-deck-950/97 backdrop-blur-md"
          data-lenis-prevent
        >
          <div className="flex items-center justify-between gap-4 px-[var(--gutter)] py-3">
            <p className="label text-mute">
              {noun} <span className="text-ink">{(index ?? 0) + 1}</span> of {items.length}
            </p>
            <div className="flex items-center gap-1.5">
              <ToolButton label="Zoom out" onClick={() => zoomTo(scale / 1.4)}>−</ToolButton>
              <span className="label w-12 text-center text-mute">{Math.round(scale * 100)}%</span>
              <ToolButton label="Zoom in" onClick={() => zoomTo(scale * 1.4)}>+</ToolButton>
              <ToolButton label="Reset zoom" onClick={reset}>1:1</ToolButton>
              {item.download ? (
                <a href={item.download} download className={cn(signClass({ tone: "plain", size: "sm" }), "ml-2")}>
                  Download
                </a>
              ) : null}
              <button type="button" autoFocus onClick={onClose} className={cn(signClass({ tone: "location", size: "sm" }), "ml-1")}>
                Close
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-stretch">
            <NavButton side="left" label={`Previous ${lower}`} onClick={() => go(-1)} />
            <div
              ref={stage}
              onWheel={onWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={onDoubleClick}
              className={cn("relative flex-1 touch-none overflow-hidden", scale > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
            >
              <div
                className="absolute inset-0 flex items-center justify-center p-3"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transition: pointers.current.size ? "none" : `transform ${reduced ? 0 : 0.25}s cubic-bezier(0.22,1,0.36,1)` }}
              >
                {/* Plain <img>: the viewer needs the full-resolution scan, not a resized variant. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={item.id}
                  src={item.src}
                  alt={item.title ?? `${noun} ${(index ?? 0) + 1}`}
                  width={item.width}
                  height={item.height}
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain shadow-[0_30px_80px_-20px_rgb(4_30_80/0.5)]"
                />
              </div>
            </div>
            <NavButton side="right" label={`Next ${lower}`} onClick={() => go(1)} />
          </div>

          <div className="px-[var(--gutter)] pt-3 pb-4">
            <p className="text-center text-[0.9375rem] text-ink">{item.title ?? `${noun} ${(index ?? 0) + 1}`}</p>
            {item.summary ? <p className="mx-auto mt-1 max-w-3xl text-center text-sm text-mute">{item.summary}</p> : null}
            <ul className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={`All ${lower}s`}>
              {items.map((thumb, i) => (
                <li key={thumb.id} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`Open ${lower} ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => {
                      reset();
                      onIndex(i);
                    }}
                    className={cn("block overflow-hidden rounded-sm border transition-colors", i === index ? "border-sky-300" : "border-line opacity-60 hover:opacity-100")}
                  >
                    <Image src={thumb.src} alt="" width={44} height={Math.round((44 * thumb.height) / thumb.width)} sizes="44px" placeholder={thumb.blur ? "blur" : "empty"} blurDataURL={thumb.blur || undefined} className="h-14 w-auto object-cover object-top" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const ToolButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" aria-label={label} onClick={onClick} className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-sky-300 hover:text-sky-300">
    {children}
  </button>
);

const NavButton = ({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cn("absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-deck-800/90 text-xl text-ink transition-colors hover:bg-deck-700", side === "left" ? "left-2 md:left-5" : "right-2 md:right-5")}
  >
    <span aria-hidden>{side === "left" ? "←" : "→"}</span>
  </button>
);
