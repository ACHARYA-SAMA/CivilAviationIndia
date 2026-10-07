"use client";

import { useEffect, useRef } from "react";

/**
 * A night approach to a lit runway, rendered on a 2D canvas with a perspective camera (no WebGL, no
 * models: ~5,000 projected light sprites). Scrolling the hero flies the glide path down to touchdown;
 * the pointer banks the aircraft a little. The lighting follows real airfield layouts: approach
 * lights with a sequenced-flasher "rabbit", green threshold bar, white edge lights turning yellow in
 * the last 600 m, red/white centreline coding, touchdown-zone barrettes, PAPI that reads two white /
 * two red on the 3° path, a taxiway in blue and green, a rotating beacon, and the city underneath.
 */

type Kind = 0 | 1 | 2 | 3 | 4 | 5; // steady, rabbit, papi, city (twinkles), beacon, strobe
type Light = { x: number; y: number; z: number; c: number; s: number; k: Kind; n: number; ph: number };

// white, green, red, yellow, blue, sodium, cool white
const COLORS = [
  [255, 244, 224],
  [93, 255, 156],
  [255, 69, 54],
  [255, 191, 77],
  [92, 140, 255],
  [255, 160, 74],
  [212, 230, 255],
] as const;
const HUD = "114,245,163";

const RUNWAY_END = 3200;
const PAPI_Z = 300;
const PAPI_SETTINGS = [3.5, 3.17, 2.83, 2.5]; // inner (nearest the runway) to outer, degrees
const DEG = Math.PI / 180;

const mulberry = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buildLights = (cityCount: number): Light[] => {
  const L: Light[] = [];
  const add = (x: number, y: number, z: number, c: number, s: number, k: Kind = 0, n = 0, ph = 0) => L.push({ x, y, z, c, s, k, n, ph });

  // Approach lighting: centreline barrettes every 30 m, crossbar at 300 m, red side rows in the last 300 m.
  for (let z = -900; z <= -30; z += 30) for (const x of [-3, -1.5, 0, 1.5, 3]) add(x, 1.2, z, 0, 1.15);
  for (let x = -15; x <= 15; x += 1.5) if (Math.abs(x) > 3.1) add(x, 1.2, -300, 0, 1.15);
  for (let z = -270; z <= -30; z += 30) for (const side of [-1, 1]) for (const dx of [10.5, 12, 13.5]) add(side * dx, 1, z, 2, 1.05);
  // Sequenced flashers ("the rabbit"), far to near.
  for (let i = 0, z = -900; z <= -330; z += 30, i++) add(0, 1.6, z, 0, 2.2, 1, i);

  // Threshold bar and wing bars (green).
  for (let x = -24; x <= 24; x += 1.5) add(x, 0.3, 0, 1, 1.05);
  for (const side of [-1, 1]) for (let dx = 26; dx <= 36; dx += 2) add(side * dx, 0.3, 0, 1, 1.05);

  // Edge lights every 60 m; the last 600 m are yellow (caution zone).
  for (let z = 60; z < RUNWAY_END; z += 60) for (const side of [-1, 1]) add(side * 23, 0.4, z, z > RUNWAY_END - 600 ? 3 : 0, 1.0);
  // Centreline every 15 m: white, then alternating red/white, then red for the last 300 m.
  for (let i = 0, z = 15; z < RUNWAY_END; z += 15, i++) {
    const tail = RUNWAY_END - z;
    add(0, 0.05, z, tail < 300 ? 2 : tail < 900 && i % 2 === 0 ? 2 : 0, 0.6);
  }
  // Touchdown zone barrettes, first 900 m.
  for (let z = 60; z <= 900; z += 30) for (const side of [-1, 1]) for (const dx of [10.5, 12, 13.5]) add(side * dx, 0.05, z, 0, 0.55);
  // Runway end (red).
  for (let x = -24; x <= 24; x += 3) add(x, 0.4, RUNWAY_END, 2, 1.1);

  // PAPI, left side abeam the aiming point; colour decided per frame from the camera's elevation.
  PAPI_SETTINGS.forEach((_, i) => add(-(38 + i * 9), 0.8, PAPI_Z, 0, 2.6, 2, i));

  // Parallel taxiway: blue edges, green centreline, three rapid exits.
  const TX = 210;
  for (let z = -200; z < RUNWAY_END + 200; z += 60) for (const side of [-1, 1]) add(TX + side * 12, 0.3, z, 4, 1.2);
  for (let z = -200; z < RUNWAY_END + 200; z += 30) add(TX, 0.05, z, 1, 0.8);
  for (const z0 of [1250, 1950, 2550]) for (let t = 0; t <= 1; t += 0.06) add(t * TX, 0.05, z0 + t * 260, 1, 0.8);

  // Aircraft holding short of the runway: nav lights, strobes, beacon.
  add(TX - 17, 3, -130, 2, 1.4);
  add(TX + 17, 3, -130, 1, 1.4);
  add(TX - 17, 3, -130, 0, 3, 5, 0, 0);
  add(TX + 17, 3, -130, 0, 3, 5, 0, 0.09);
  add(TX, 6, -128, 2, 2.2, 5, 1, 0.5);

  // Terminal, apron floodlights and tower with rotating beacon (alternating white / green).
  const rnd = mulberry(7);
  for (let i = 0; i < 70; i++) add(430 + rnd() * 520, 8 + rnd() * 10, 1250 + rnd() * 900, 5, 4.5);
  for (let i = 0; i < 140; i++) add(460 + rnd() * 460, 4 + rnd() * 7, 1300 + rnd() * 800, 6, 1.8);
  add(390, 46, 1540, 0, 5, 4, 0);
  add(390, 46, 1540, 1, 5, 4, 1);
  for (let y = 4; y < 44; y += 7) add(390, y, 1540, 6, 1.2);

  // The city: towns, arterial roads and scattered lights, kept off the airfield.
  const crand = mulberry(1994);
  const offField = (x: number, z: number) => !(Math.abs(x) < 900 && z > -1100 && z < RUNWAY_END + 500) && !(x > 300 && x < 1100 && z > 1100 && z < 2300);
  const towns = Array.from({ length: 26 }, () => ({ x: (crand() - 0.5) * 24000, z: -5000 + crand() * 26000, r: 500 + crand() * 2200 }));
  let placed = 0;
  let guard = 0;
  while (placed < cityCount && guard++ < cityCount * 6) {
    const roll = crand();
    let x: number;
    let z: number;
    if (roll < 0.62) {
      const town = towns[Math.floor(crand() * towns.length)]!;
      const a = crand() * Math.PI * 2;
      const r = town.r * Math.sqrt(-2 * Math.log(crand() + 1e-6)) * 0.55;
      x = town.x + Math.cos(a) * r;
      z = town.z + Math.sin(a) * r;
    } else if (roll < 0.86) {
      // Roads: straight lines between towns, lit every ~45 m.
      const a = towns[Math.floor(crand() * towns.length)]!;
      const b = towns[Math.floor(crand() * towns.length)]!;
      const t = crand();
      x = a.x + (b.x - a.x) * t + (crand() - 0.5) * 12;
      z = a.z + (b.z - a.z) * t + (crand() - 0.5) * 12;
    } else {
      x = (crand() - 0.5) * 30000;
      z = -6000 + crand() * 30000;
    }
    if (!offField(x, z)) continue;
    add(x, 0, z, crand() < 0.7 ? 5 : 6, 2 + crand() * 2.6, 3, 0, crand() * Math.PI * 2);
    placed++;
  }
  return L;
};

const makeSprite = ([r, g, b]: readonly [number, number, number]) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.1, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.28, `rgba(${r},${g},${b},0.42)`);
  grad.addColorStop(0.6, `rgba(${r},${g},${b},0.08)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return canvas;
};

/** Runway paint as ground rectangles [x0, z0, x1, z1]: threshold bars, aiming point, touchdown zone, centreline. */
const MARKINGS: readonly (readonly [number, number, number, number])[] = (() => {
  const m: [number, number, number, number][] = [];
  for (let k = 0; k < 8; k++) for (const side of [-1, 1]) m.push([side * (3 + k * 2.4), 6, side * (3 + k * 2.4 + 1.8), 36]);
  for (const side of [-1, 1]) m.push([side * 9, 300, side * 18, 348]);
  for (const z of [150, 450, 600, 750, 900]) for (const side of [-1, 1]) for (const dx of [9.5, 13]) m.push([side * dx, z, side * (dx + 1.8), z + 22]);
  for (let z = 60; z < RUNWAY_END - 60; z += 50) m.push([-0.45, z, 0.45, z + 30]);
  return m;
})();

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type HudRefs = {
  ra: HTMLElement | null;
  speed: HTMLElement | null;
  dist: HTMLElement | null;
  callout: HTMLElement | null;
  mode: HTMLElement | null;
};

type SceneProps = {
  /** The tall section whose scroll drives the approach. */
  trackRef: React.RefObject<HTMLElement | null>;
  hud: React.RefObject<HudRefs>;
};

const CALLOUTS = [1000, 500, 100, 50, 40, 30, 20, 10];

export const ApproachScene = ({ trackRef, hud }: SceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Built when the browser is idle, after the headline and paragraph have painted: the scene is
    // ambience, so it must never delay the page's first render on a slow phone.
    let stop: (() => void) | undefined;
    let cancelled = false;
    const idle = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const boot = () => {
      if (!cancelled) stop = init();
    };
    const handle = idle.requestIdleCallback ? idle.requestIdleCallback(boot, { timeout: 2000 }) : window.setTimeout(boot, 900);
    return () => {
      cancelled = true;
      if (idle.cancelIdleCallback) idle.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      stop?.();
    };
  }, [trackRef, hud]); // eslint-disable-line react-hooks/exhaustive-deps

  const init = (): (() => void) | undefined => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const lights = buildLights(small ? 1400 : 7000);
    const sprites = COLORS.map(makeSprite);
    const stars = (() => {
      const r = mulberry(42);
      return Array.from({ length: small ? 120 : 260 }, () => ({ x: r(), y: r(), a: 0.15 + r() * 0.5 }));
    })();

    let W = 0;
    let H = 0;
    let dpr = 1;
    let trackTop = 0;
    let trackSpan = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.75);
      const box = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(box.width * dpr));
      H = Math.max(1, Math.round(box.height * dpr));
      canvas.width = W;
      canvas.height = H;
      const rect = track.getBoundingClientRect();
      trackTop = rect.top + window.scrollY;
      trackSpan = Math.max(1, rect.height - window.innerHeight);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer banks and side-steps the aircraft; touch devices get a slow automatic sway.
    const pointer = { x: 0, y: 0, active: false };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      pointer.active = true;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let progress = 0;
    let lastProgress = "";
    let lateral = 0;
    let lateralV = 0;
    let roll = 0;
    let lastCallout = Number.NaN; // no callout on the first frame
    let calloutUntil = 0;
    let touchedDown = false;
    let lastRa = "";
    let lastSpd = "";
    let lastDist = "";
    let lastMode = "";
    let running = true;
    let visible = true;
    let raf = 0;
    const start = performance.now();

    const setText = (el: HTMLElement | null | undefined, value: string, cache: string) => {
      if (el && value !== cache) el.textContent = value;
      return value;
    };

    let lastDraw = 0;
    const frame = (now: number) => {
      // Phones draw at 30 fps: the scene is slow-moving, and the battery matters more.
      if (small && !reduced && now - lastDraw < 31) {
        if (running && visible) raf = requestAnimationFrame(frame);
        return;
      }
      lastDraw = now;
      const t = Math.max(0, (now - start) / 1000);
      const target = reduced ? 0.12 : clamp((window.scrollY - trackTop) / trackSpan, 0, 1);
      progress += (target - progress) * (reduced ? 1 : 0.09);
      const p = progress;
      const pText = p.toFixed(3);
      if (pText !== lastProgress) track.style.setProperty("--approach", (lastProgress = pText));
      const phase = p > 0.85 ? "landed" : p > 0.38 ? "late" : "early";
      if (track.dataset.phase !== phase) track.dataset.phase = phase;

      // Glide path: slightly high early (PAPI three white), established on 3° by the last mile, flare, roll-out.
      const D = 4200 - smooth(p) * 4650; // metres before the threshold (negative = over the runway)
      const gs = (3 + 0.5 * (1 - p) ** 2) * DEG;
      const hRaw = (D + PAPI_Z) * Math.tan(gs);
      const h = 2.6 + 3 * Math.log1p(Math.exp((hRaw - 2.6) / 3)); // soft floor: the flare
      const camZ = -D;

      const wantX = reduced ? 0 : pointer.active ? pointer.x * 14 : Math.sin(t * 0.23) * 6;
      lateralV += (wantX - lateral) * 0.02;
      lateralV *= 0.86;
      lateral += lateralV;
      const wantRoll = (reduced ? 0 : -lateralV * 1.4 + (pointer.active ? -pointer.x * 2.2 : Math.sin(t * 0.23 + 1) * 1.2)) * DEG;
      roll += (wantRoll - roll) * 0.06;
      const yaw = -lateral * 0.0009;
      const pitch = (4.2 - 2.4 * p + (pointer.active ? pointer.y * 0.8 : 0)) * DEG; // looking down

      const fov = (W / H < 1 ? 64 : 46) * DEG;
      const f = H / 2 / Math.tan(fov / 2);
      const cx = W / 2;
      const cy = H / 2;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);

      // Sky and ground, rotated with the bank.
      const horizonY = -f * Math.tan(pitch);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0a1d40";
      ctx.fillRect(0, 0, W, H);
      ctx.setTransform(cosR, sinR, -sinR, cosR, cx, cy);
      const big = Math.hypot(W, H);
      const sky = ctx.createLinearGradient(0, horizonY - H * 0.9, 0, horizonY);
      // Blue hour: the last light on the horizon, deep blue overhead.
      sky.addColorStop(0, "#0a2558");
      sky.addColorStop(0.55, "#1a4a92");
      sky.addColorStop(0.9, "#3f74ba");
      sky.addColorStop(1, "#6f93c4");
      ctx.fillStyle = sky;
      ctx.fillRect(-big, horizonY - big, big * 2, big);
      const glow = ctx.createLinearGradient(0, horizonY - H * 0.12, 0, horizonY + 2);
      glow.addColorStop(0, "rgba(255,170,120,0)");
      glow.addColorStop(1, "rgba(255,170,120,0.3)");
      ctx.fillStyle = glow;
      ctx.fillRect(-big, horizonY - H * 0.12, big * 2, H * 0.12 + 2);
      ctx.fillStyle = "#0a1a3a";
      ctx.fillRect(-big, horizonY, big * 2, big);
      // Stars above the horizon.
      ctx.fillStyle = "#c9d8ff";
      for (const s of stars) {
        const sx = (s.x - 0.5) * big;
        const sy = horizonY - 6 - s.y * big * 0.5;
        ctx.globalAlpha = s.a * (0.75 + 0.25 * Math.sin(t * 1.3 + s.x * 40)) * Math.min(1, s.y * 3);
        ctx.fillRect(sx, sy, dpr, dpr);
      }
      ctx.globalAlpha = 1;

      // Runway surface: a faint quad so the lights read as a strip of tarmac.
      const proj = (x: number, y: number, z: number): [number, number, number] | null => {
        const dx = x - lateral;
        const dy = y - h;
        const dz = z - camZ;
        const x1 = dx * cosY - dz * sinY;
        const z1 = dx * sinY + dz * cosY;
        const y2 = dy * cosP + z1 * sinP;
        const z2 = -dy * sinP + z1 * cosP;
        if (z2 < 1) return null;
        return [(f * x1) / z2, (-f * y2) / z2, z2];
      };
      const corners = [proj(-23, 0, Math.max(0, camZ + 2)), proj(23, 0, Math.max(0, camZ + 2)), proj(23, 0, RUNWAY_END), proj(-23, 0, RUNWAY_END)];
      if (corners.every(Boolean)) {
        ctx.beginPath();
        corners.forEach((c, i) => (i === 0 ? ctx.moveTo(c![0], c![1]) : ctx.lineTo(c![0], c![1])));
        ctx.closePath();
        ctx.fillStyle = "rgba(30,36,48,0.16)";
        ctx.fill();
      }

      // Painted markings, visible only where the landing lights reach them.
      const pool = clamp((150 - h) / 120, 0, 1);
      const poolZ = camZ + 150 + h * 1.5;
      for (const [x0, z0, x1, z1] of MARKINGS) {
        const zMid = (z0 + z1) / 2;
        const lit = pool * Math.exp(-(((zMid - poolZ) / 280) ** 2));
        const a = 0.025 + lit * 0.3;
        if (z1 < camZ + 6 || (a < 0.03 && zMid - camZ > 2500)) continue;
        const q = [proj(x0, 0, z0), proj(x1, 0, z0), proj(x1, 0, z1), proj(x0, 0, z1)];
        if (!q.every(Boolean)) continue;
        ctx.beginPath();
        q.forEach((c, i) => (i === 0 ? ctx.moveTo(c![0], c![1]) : ctx.lineTo(c![0], c![1])));
        ctx.closePath();
        ctx.fillStyle = `rgba(226,230,238,${a.toFixed(3)})`;
        ctx.fill();
      }
      // The aircraft's landing lights on the tarmac.
      if (pool > 0) {
        const c = proj(lateral * 0.6, 0, poolZ);
        const near = proj(lateral * 0.6, 0, camZ + 60);
        const far = proj(lateral * 0.6, 0, poolZ + 380);
        if (c && near && far) {
          const rx = (60 * f) / c[2];
          const ry = Math.max(4, Math.abs(near[1] - far[1]) / 2);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.translate(c[0], c[1]);
          ctx.scale(1, ry / rx);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
          g.addColorStop(0, `rgba(255,238,210,${(0.2 * pool).toFixed(3)})`);
          g.addColorStop(1, "rgba(255,238,210,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, rx, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Lights (additive).
      ctx.globalCompositeOperation = "lighter";
      const papiAngle = Math.atan2(h, PAPI_Z - camZ) / DEG;
      const rabbitPhase = (t % 0.5) / 0.5;
      const beaconPhase = t % 2.4;
      for (const l of lights) {
        let color = l.c;
        let size = l.s;
        let alpha = 1;
        if (l.k === 1) {
          if (reduced) continue;
          const lit = rabbitPhase * 20 - l.n;
          if (lit < 0 || lit > 1.4) continue;
          size *= 2.6;
          alpha = 1 - lit / 1.4;
        } else if (l.k === 2) {
          color = papiAngle > (PAPI_SETTINGS[l.n] ?? 3) ? 0 : 2;
        } else if (l.k === 4) {
          const on = l.n === 0 ? beaconPhase < 0.16 : beaconPhase > 1.2 && beaconPhase < 1.36;
          if (!on) continue;
        } else if (l.k === 5) {
          const ph = (t + l.ph) % 1.2;
          if (l.n === 0 ? !(ph < 0.05 || (ph > 0.12 && ph < 0.17)) : !(ph < 0.5)) continue;
        }
        const dx = l.x - lateral;
        const dy = l.y - h;
        const dz = l.z - camZ;
        const x1 = dx * cosY - dz * sinY;
        const z1 = dx * sinY + dz * cosY;
        const z2 = -dy * sinP + z1 * cosP;
        if (z2 < 2) continue;
        const y2 = dy * cosP + z1 * sinP;
        const sx = (f * x1) / z2;
        const sy = (-f * y2) / z2;
        if (sx < -W || sx > W || sy < -H || sy > H) continue;
        let r = (size * f) / z2;
        if (l.k === 3) {
          alpha = clamp(1.3 - z2 / 22000, 0.25, 0.95) * (0.8 + 0.2 * Math.sin(t * 2.1 + l.ph));
          r = clamp(r, 1.15 * dpr, 4.5 * dpr);
        } else {
          alpha *= clamp(1.4 - z2 / 9000, 0.35, 1);
          r = clamp(r, 1.9 * dpr, 34 * dpr);
        }
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[color]!, sx - r, sy - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // HUD symbology: horizon line, the -3° reference and the flight path marker.
      const unit = dpr;
      ctx.strokeStyle = `rgba(${HUD},0.85)`;
      ctx.fillStyle = `rgba(${HUD},0.85)`;
      ctx.lineWidth = 1.4 * unit;
      ctx.shadowColor = `rgba(${HUD},0.6)`;
      ctx.shadowBlur = 6 * unit;
      const span = Math.min(W * 0.34, 520 * unit);
      ctx.beginPath();
      ctx.moveTo(-span, horizonY);
      ctx.lineTo(-60 * unit, horizonY);
      ctx.moveTo(60 * unit, horizonY);
      ctx.lineTo(span, horizonY);
      ctx.stroke();
      const gsY = horizonY + f * Math.tan(3 * DEG);
      ctx.setLineDash([10 * unit, 8 * unit]);
      ctx.beginPath();
      ctx.moveTo(-span * 0.45, gsY);
      ctx.lineTo(-40 * unit, gsY);
      ctx.moveTo(40 * unit, gsY);
      ctx.lineTo(span * 0.45, gsY);
      ctx.stroke();
      ctx.setLineDash([]);
      const fpvX = lateralV * 22 * unit;
      const fpvY = horizonY + f * Math.tan(h < 4 ? 0 : gs);
      ctx.beginPath();
      ctx.arc(fpvX, fpvY, 8 * unit, 0, Math.PI * 2);
      ctx.moveTo(fpvX - 8 * unit, fpvY);
      ctx.lineTo(fpvX - 22 * unit, fpvY);
      ctx.moveTo(fpvX + 8 * unit, fpvY);
      ctx.lineTo(fpvX + 22 * unit, fpvY);
      ctx.moveTo(fpvX, fpvY - 8 * unit);
      ctx.lineTo(fpvX, fpvY - 16 * unit);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Readouts (DOM): radio altitude, speed, distance, mode, callouts.
      const refs = hud.current;
      const raFt = Math.max(0, (h - 2.6) * 3.281);
      lastRa = setText(refs?.ra, raFt > 1000 ? String(Math.round(raFt / 10) * 10) : String(Math.round(raFt)), lastRa);
      const kt = D > 0 ? 142 - 8 * (1 - D / 4200) : Math.max(60, 134 + (D / 450) * 74);
      lastSpd = setText(refs?.speed, String(Math.round(kt)), lastSpd);
      lastDist = setText(refs?.dist, D > 0 ? `${(D / 1852).toFixed(1)} NM` : "RWY", lastDist);
      lastMode = setText(refs?.mode, hRaw < 2.6 ? "ROLLOUT" : raFt < 50 ? "FLARE" : "LOC  G/S", lastMode);
      if (refs?.callout) {
        const passed = CALLOUTS.find((c) => raFt <= c && lastCallout > c);
        if (passed !== undefined) {
          refs.callout.textContent = String(passed);
          calloutUntil = t + 1.1;
        }
        if (hRaw < 2.6 && !touchedDown) {
          refs.callout.textContent = "RETARD";
          calloutUntil = t + 1.6;
        }
        touchedDown = hRaw < 2.6;
        refs.callout.style.opacity = t < calloutUntil ? "1" : "0";
        lastCallout = raFt;
      }

      if (running && visible && !reduced) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) kick();
    });
    io.observe(canvas);
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) kick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    // Reduced motion: one still frame, redrawn only on resize.
    const onResize = () => reduced && kick();
    window.addEventListener("resize", onResize);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  };

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
};
