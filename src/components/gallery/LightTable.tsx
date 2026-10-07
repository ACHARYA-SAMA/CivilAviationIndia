"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

export type TablePhoto = { id: string; src: string; width: number; height: number; blur: string };

const COLS = 8;
const ROWS = 5;
const CELL_W = 260;
const CELL_H = 320;
const GAP = 30;
const TILE_W = COLS * (CELL_W + GAP);
const TILE_H = ROWS * (CELL_H + GAP);
const mod = (a: number, n: number) => ((a % n) + n) % n;
// Prints (1–2, 0–1) of the first tile start under the middle of the screen; the same offset is
// rendered on the server, so the first paint already shows the four high-priority prints.
const START = { x: -1.5 * (CELL_W + GAP), y: -(CELL_H + GAP) };
const START_TRANSFORM = `translate3d(${mod(START.x, TILE_W) - TILE_W}px, ${mod(START.y, TILE_H) - TILE_H}px, 0)`;

/**
 * A light table of prints, seen at an angle: an endless plane of photographs that drifts on its own,
 * can be dragged in any direction with inertia, and opens a print in the viewer on click. The plane
 * is one tile repeated 2 × 2 and wrapped, so it never ends. Mouse drags in both axes; on touch only
 * sideways drags are taken, so the page still scrolls.
 */
export const LightTable = ({ photos, onOpen, children }: { photos: readonly TablePhoto[]; onOpen: (id: string) => void; children?: ReactNode }) => {
  const plane = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const tile = photos.slice(0, COLS * ROWS);

  useEffect(() => {
    const node = plane.current;
    const box = area.current;
    if (!node || !box) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { ...START };
    const vel = { x: 0, y: 0 };
    const drag = { on: false, moved: 0, lastX: 0, lastY: 0, pointer: "mouse", axis: "" as "" | "x" | "y" };
    let raf = 0;
    let visible = true;

    const render = () => {
      node.style.transform = `translate3d(${mod(pos.x, TILE_W) - TILE_W}px, ${mod(pos.y, TILE_H) - TILE_H}px, 0)`;
    };
    const frame = () => {
      if (!drag.on) {
        pos.x += vel.x;
        pos.y += vel.y;
        vel.x *= 0.94;
        vel.y *= 0.94;
        if (!reduced && Math.abs(vel.x) < 0.35 && Math.abs(vel.y) < 0.35) {
          pos.x -= 0.35;
          pos.y -= 0.12;
        }
      }
      render();
      if (visible) raf = requestAnimationFrame(frame);
    };

    const down = (e: PointerEvent) => {
      drag.on = true;
      drag.moved = 0;
      drag.axis = "";
      drag.pointer = e.pointerType;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      vel.x = vel.y = 0;
    };
    const move = (e: PointerEvent) => {
      if (!drag.on) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      if (drag.pointer !== "mouse" && !drag.axis) drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis === "y") return; // let the page scroll
      const useY = drag.pointer === "mouse";
      pos.x += dx * 1.2;
      if (useY) pos.y += dy * 1.2;
      vel.x = dx * 1.2;
      vel.y = useY ? dy * 1.2 : 0;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      if (drag.moved > 6) box.setPointerCapture?.(e.pointerId);
    };
    const up = () => {
      drag.on = false;
    };
    // A drag must not open the print under the pointer.
    const click = (e: MouseEvent) => {
      if (drag.moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    box.addEventListener("pointerdown", down);
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    box.addEventListener("click", click, true);
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(box);
    render();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      box.removeEventListener("pointerdown", down);
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerup", up);
      box.removeEventListener("pointercancel", up);
      box.removeEventListener("click", click, true);
    };
  }, []);

  return (
    <div ref={area} data-cursor="Drag" className="relative h-full w-full cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing">
      {/* The table, tilted away from the viewer. */}
      <div className="absolute inset-[-30%] [perspective:1600px]">
        <div className="absolute inset-0 origin-center [transform:rotateX(24deg)_rotateZ(-6deg)_scale(1.05)] [transform-style:preserve-3d]">
          <div ref={plane} aria-hidden className="absolute top-1/2 left-1/2 will-change-transform" style={{ width: TILE_W * 2, height: TILE_H * 2, transform: START_TRANSFORM }}>
            {[0, 1, 2, 3].map((copy) => (
              <div key={copy} className="absolute" style={{ left: (copy % 2) * TILE_W, top: Math.floor(copy / 2) * TILE_H, width: TILE_W, height: TILE_H }}>
                {tile.map((photo, index) => {
                  const col = index % COLS;
                  const row = Math.floor(index / COLS);
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      tabIndex={-1}
                      onClick={() => onOpen(photo.id)}
                      className="group/print absolute overflow-hidden rounded-[2px] bg-[#ffffff] p-2 [&_img]:bg-deck-800 shadow-[0_30px_50px_-20px_rgb(4_30_80/0.5)] transition-transform duration-500 ease-flight hover:z-10 hover:scale-[1.08]"
                      style={{ left: col * (CELL_W + GAP), top: row * (CELL_H + GAP) + (col % 2) * (CELL_H / 2), width: CELL_W, height: CELL_H }}
                    >
                      <span className="relative block h-full w-full overflow-hidden">
                        <Image
                          src={photo.src}
                          alt=""
                          fill
                          sizes={`${CELL_W}px`}
                          priority={copy === 0 && row <= 1 && (col === 1 || col === 2)}
                          className="object-cover"
                          draggable={false}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
