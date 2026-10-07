"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import type { ViewerItem } from "@/components/viewer/LetterViewer";

const LetterViewer = dynamic(() => import("@/components/viewer/LetterViewer").then((mod) => mod.LetterViewer), { ssr: false });

/**
 * A film strip of the programme's real photos at their own aspect ratios (nothing cropped to a
 * uniform card). Drag or scroll sideways; click opens the zoomable viewer.
 */
export const GalleryReel = ({ items }: { items: readonly ViewerItem[] }) => {
  const [open, setOpenState] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const reel = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, x: 0, left: 0 });

  const setOpen = (index: number | null) => {
    if (index !== null) setLoaded(true);
    setOpenState(index);
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !reel.current) return;
    drag.current = { down: true, moved: false, x: event.clientX, left: reel.current.scrollLeft };
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state.down || !reel.current) return;
    const delta = event.clientX - state.x;
    if (Math.abs(delta) > 5) state.moved = true;
    reel.current.scrollLeft = state.left - delta;
  };
  const onUp = () => {
    drag.current.down = false;
  };

  return (
    <>
      <div
        ref={reel}
        data-cursor="Drag"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className="scrollbar-none -mx-[var(--gutter)] flex gap-3 overflow-x-auto px-[var(--gutter)] pb-2"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            data-cursor="View"
            onClick={() => setOpen(index)}
            aria-label={`Open photo ${index + 1} of ${items.length}`}
            className="group relative h-64 shrink-0 overflow-hidden rounded-[3px] bg-panel md:h-[24rem]"
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
          >
            <Image
              src={item.src}
              alt={item.title ?? ""}
              fill
              sizes="(min-width: 768px) 40vw, 80vw"
              placeholder="blur"
              blurDataURL={item.blur}
              draggable={false}
              className="object-cover transition-transform duration-700 ease-flight group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>
      {loaded ? <LetterViewer items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} noun="Photo" /> : null}
    </>
  );
};
