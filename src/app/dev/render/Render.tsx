"use client";

import { useEffect, useRef } from "react";
import { createTakeoffScene, type PaletteName } from "@/components/home/takeoff/scene";

/** Reads the frame from the query string (palette, plane x/y/z/pitch/yaw/roll/gear, camera, look, focal, flare). */
export const Render = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const n = (key: string, fallback: number) => (q.has(key) ? Number(q.get(key)) : fallback);
    let raf = 0;
    let dispose = () => {};
    const img = new Image();
    img.src = "/media/brand/assi-emblem.png";
    img.onload = async () => {
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mona").trim() || "sans-serif";
      await document.fonts.load(`640 48px ${family}`);
      const scene = await createTakeoffScene(canvas.current!, {
        emblem: img,
        font: family,
        small: false,
        reduced: true,
        palette: (q.get("palette") as PaletteName) ?? "bluehour",
        still: {
          plane: { x: n("px", 0), y: n("py", 64), z: n("pz", 700), pitch: n("pitch", 3), yaw: n("yaw", 0), roll: n("roll", 0), gear: n("gear", 1) },
          camera: [n("cx", 95), n("cy", 18), n("cz", 640)],
          look: [n("lx", 0), n("ly", 60), n("lz", 700)],
          focal: n("focal", 50),
          flare: q.get("flare") === "1",
        },
        onFirstFrame: () => document.documentElement.setAttribute("data-rendered", "1"),
      });
      const loop = (now: number) => {
        scene.render(now);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      dispose = scene.dispose;
    };
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);
  return <canvas ref={canvas} className="fixed inset-0 z-[200] h-screen w-screen" />;
};
