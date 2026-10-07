"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type GlobePartner = { id: string; name: string; relation: string; place: string; lat: number; lon: number };

const DEG = Math.PI / 180;
const toVec = (lat: number, lon: number): [number, number, number] => [Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lon * DEG)];

/** Points along the great circle from a to b, lifted off the surface in the middle like a flight track. */
const arcPoints = (a: [number, number, number], b: [number, number, number], steps = 64) => {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const s = Math.sin(omega) || 1;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const k1 = Math.sin((1 - t) * omega) / s;
    const k2 = Math.sin(t * omega) / s;
    const lift = 1 + Math.sin(Math.PI * t) * (0.06 + omega * 0.07);
    return [(a[0] * k1 + b[0] * k2) * lift, (a[1] * k1 + b[1] * k2) * lift, (a[2] * k1 + b[2] * k2) * lift] as [number, number, number];
  });
};

/**
 * A dotted Earth (Natural Earth land, sampled at build time) with flight tracks from the campus to
 * each destination. It turns slowly, can be dragged, and turns to face the active destination.
 */
export const GlobeCanvas = ({
  home,
  destinations,
  active,
  homeCode,
  className,
}: {
  home: { lat: number; lon: number };
  destinations: readonly { id: string; lat: number; lon: number; code?: string }[];
  active: string | null;
  homeCode?: string;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef<string | null>(active);
  activeRef.current = active;
  const routesKey = destinations.map((d) => `${d.id}:${d.lat}:${d.lon}`).join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dots: [number, number, number][] = [];
    let cancelled = false;
    fetch("/data/globe.json")
      .then((r) => r.json() as Promise<[number, number][]>)
      .then((list) => {
        if (!cancelled) dots = list.map(([lat, lon]) => toVec(lat, lon));
      })
      .catch(() => undefined);

    const homeVec = toVec(home.lat, home.lon);
    const routes = destinations.map((p) => ({ id: p.id, code: p.code, vec: toVec(p.lat, p.lon), arc: arcPoints(homeVec, toVec(p.lat, p.lon)) }));

    // View rotation: yaw around the polar axis, then tilt.
    let yaw = -home.lon * DEG + 0.5;
    let tilt = 0.32;
    let targetYaw: number | null = null;
    let size = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.getBoundingClientRect().width * dpr;
      canvas.width = canvas.height = Math.max(1, Math.round(size));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drag = { on: false, x: 0, y: 0 };
    const down = (e: PointerEvent) => {
      drag.on = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      targetYaw = null;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.on) return;
      yaw += (e.clientX - drag.x) * 0.008;
      tilt = Math.max(-0.9, Math.min(0.9, tilt + (e.clientY - drag.y) * 0.006));
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const up = () => (drag.on = false);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const project = (v: [number, number, number]) => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const x1 = v[0] * cy + v[2] * sy;
      const z1 = -v[0] * sy + v[2] * cy;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const y2 = v[1] * ct - z1 * st;
      const z2 = v[1] * st + z1 * ct;
      return { x: x1, y: y2, z: z2 };
    };

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.max(0, (now - start) / 1000);
      const focus = activeRef.current ? routes.find((r) => r.id === activeRef.current) : null;
      if (focus && !drag.on) {
        // Face the midpoint between campus and partner.
        targetYaw = -Math.atan2(homeVec[0] + focus.vec[0], homeVec[2] + focus.vec[2]);
      }
      if (targetYaw !== null) {
        let delta = targetYaw - yaw;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        yaw += delta * 0.06;
      } else if (!drag.on && !reduced) yaw += 0.0016;

      const R = size * 0.42;
      const c = size / 2;
      ctx.clearRect(0, 0, size, size);

      // Atmosphere and disc.
      const halo = ctx.createRadialGradient(c, c, R * 0.92, c, c, R * 1.22);
      halo.addColorStop(0, "rgba(142,209,255,0.18)");
      halo.addColorStop(1, "rgba(142,209,255,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, size, size);
      const disc = ctx.createRadialGradient(c - R * 0.3, c - R * 0.35, R * 0.1, c, c, R);
      disc.addColorStop(0, "#1f6ccc");
      disc.addColorStop(1, "#072a66");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fill();

      // Land dots, darker toward the limb.
      const dot = Math.max(1.5, 2.3 * dpr);
      ctx.fillStyle = "#dcefff";
      for (const v of dots) {
        const p = project(v);
        if (p.z <= 0) continue;
        ctx.globalAlpha = 0.28 + p.z * 0.62;
        ctx.fillRect(c + p.x * R - dot / 2, c - p.y * R - dot / 2, dot, dot);
      }
      ctx.globalAlpha = 1;

      // Flight tracks: the full track faint, a bright aircraft travelling along it.
      routes.forEach((route, index) => {
        const on = !activeRef.current || activeRef.current === route.id;
        ctx.lineWidth = (on && activeRef.current ? 2.2 : 1.4) * dpr;
        ctx.strokeStyle = on ? "rgba(255,208,90,0.95)" : "rgba(255,208,90,0.3)";
        ctx.beginPath();
        let pen = false;
        for (const v of route.arc) {
          const p = project(v);
          const behind = p.z < 0 && Math.hypot(p.x, p.y) < 1;
          if (behind) {
            pen = false;
            continue;
          }
          if (!pen) ctx.moveTo(c + p.x * R, c - p.y * R);
          else ctx.lineTo(c + p.x * R, c - p.y * R);
          pen = true;
        }
        ctx.stroke();
        if (!on || reduced) return;
        // rAF timestamps can precede the effect's start time, so keep the phase in [0, 1).
        const phase = ((((t * 0.22 + index * 0.17) % 1) + 1) % 1) * (route.arc.length - 1);
        const v = route.arc[Math.floor(phase)]!;
        const p = project(v);
        if (p.z < 0 && Math.hypot(p.x, p.y) < 1) return;
        const g = ctx.createRadialGradient(c + p.x * R, c - p.y * R, 0, c + p.x * R, c - p.y * R, 7 * dpr);
        g.addColorStop(0, "rgba(255,240,210,1)");
        g.addColorStop(1, "rgba(255,208,90,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c + p.x * R, c - p.y * R, 7 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Markers: campus (amber, pulsing) and partners (sky).
      const mark = (v: [number, number, number], color: string, r: number, pulse: boolean) => {
        const p = project(v);
        if (p.z <= 0) return;
        const x = c + p.x * R;
        const y = c - p.y * R;
        if (pulse && !reduced) {
          const k = (t % 1.8) / 1.8;
          ctx.strokeStyle = `rgba(255,208,90,${(1 - k) * 0.8})`;
          ctx.lineWidth = 1.5 * dpr;
          ctx.beginPath();
          ctx.arc(x, y, (r + k * 16) * dpr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r * dpr, 0, Math.PI * 2);
        ctx.fill();
      };
      routes.forEach((route) => mark(route.vec, activeRef.current === route.id ? "#ffffff" : "#8ed1ff", 3.2, false));
      mark(homeVec, "#ffd05a", 4, true);
      // Airport-style codes beside the end points, when given.
      ctx.font = `700 ${Math.round(12 * dpr)}px ${getComputedStyle(canvas).getPropertyValue("--font-b612") || "monospace"}`;
      ctx.fillStyle = "#eaf0f8";
      const label = (v: [number, number, number], text: string) => {
        const p = project(v);
        if (p.z <= 0.05) return;
        ctx.fillText(text, c + p.x * R + 9 * dpr, c - p.y * R - 7 * dpr);
      };
      if (homeCode) label(homeVec, homeCode);
      routes.forEach((route) => route.code && label(route.vec, route.code));

      if (visible) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [home, routesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} aria-hidden data-cursor="Drag" className={cn("aspect-square w-full cursor-grab touch-none active:cursor-grabbing", className)} />;
};

/** The globe with the partner list beside it: selecting a partner turns the globe to face its track. */
export const PartnerGlobe = ({ home, partners }: { home: { name: string; lat: number; lon: number }; partners: readonly GlobePartner[] }) => {
  const [active, setActive] = useState<string | null>(null);



  return (
    <div className="grid items-center gap-12 lg:grid-cols-12">
      <div className="relative mx-auto w-full max-w-[40rem] lg:col-span-7">
        <GlobeCanvas home={home} destinations={partners} active={active} />
        <p className="readout absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.6875rem] tracking-[0.18em] text-dim">DRAG TO TURN</p>
      </div>
      <ul className="space-y-2 lg:col-span-5">
        <li className="mb-6 flex items-center gap-3 text-[0.9375rem] text-ink">
          <span aria-hidden className="size-2.5 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgb(42_141_233/0.25)]" />
          {home.name}, Hyderabad
        </li>
        {partners.map((partner) => (
          <li key={partner.id}>
            <button
              type="button"
              aria-pressed={active === partner.id}
              onPointerEnter={() => setActive(partner.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(partner.id)}
              onBlur={() => setActive(null)}
              onClick={() => setActive((current) => (current === partner.id ? null : partner.id))}
              className={cn(
                "group w-full rounded-[4px] px-5 py-4 text-left transition-colors duration-300",
                active === partner.id ? "bg-panel" : "hover:bg-panel/60",
              )}
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="heading text-[1.375rem] text-ink">{partner.name}</span>
                <span className="readout shrink-0 text-[0.75rem] text-sky-300">{partner.place}</span>
              </span>
              <span className="mt-1 block text-[0.9375rem] leading-snug text-mute">{partner.relation}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
