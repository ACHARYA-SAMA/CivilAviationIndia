import * as THREE from "three";
import { FUSELAGE_LENGTH, angleAt, section } from "./airframe";

/**
 * The institute's livery and the aircraft's surface detail, painted on canvases: colour, roughness,
 * panel-line bump and the cabin-window glow. White body; a deep-sky belly that sweeps up the tail cone
 * into the fin, edged with the navy livery line; "Civil Aviation India" titles; the emblem on the
 * nose, the fin and the engines. Nothing is downloaded.
 */

export const PAINT = {
  white: "#f3f5f7",
  navy: "#06182f",
  deep: "#0a5bc4",
  sky: "#2f97ee",
  wing: "#c3c9d0",
} as const;

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { c, ctx };
};

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const texture = (c: HTMLCanvasElement, anisotropy: number, srgb = true) => {
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
};

/**
 * Painted canvases are kept for the page's lifetime, so the take-off and the anatomy studio share one
 * painting (each WebGL context still gets its own textures). Painting is the expensive part.
 */
const painted = new Map<string, Record<string, HTMLCanvasElement>>();
const memo = <T extends Record<string, THREE.Texture | undefined>>(key: string, anisotropy: number, paint: () => T): T => {
  const cached = painted.get(key);
  if (cached) return Object.fromEntries(Object.entries(cached).map(([name, c]) => [name, texture(c, anisotropy, name === "map" || name === "emissiveMap")])) as unknown as T;
  const maps = paint();
  painted.set(key, Object.fromEntries(Object.entries(maps).map(([name, tex]) => [name, (tex as THREE.Texture).image as HTMLCanvasElement])));
  return maps;
};
const liveryKey = ({ emblem, font, hi }: LiveryOptions) => `${hi}|${font}|${emblem ? emblem.src : "-"}`;

export type SurfaceMaps = {
  map: THREE.Texture;
  roughnessMap: THREE.Texture;
  bumpMap: THREE.Texture;
  emissiveMap?: THREE.Texture;
};

type LiveryOptions = { emblem: HTMLImageElement | null; font: string; anisotropy: number; hi: boolean };

/** Fuselage radius at the window line (the texture's angular scale). */
const R = 2.04;

/**
 * Fuselage maps. Canvas x = distance from the nose (nose at the left), canvas y = angle round the body
 * from the crown (0) through the right side (¼), the belly (½) and the left side (¾).
 * On the right side the canvas reads mirrored left-right, on the left side upside down; text and the
 * emblem are drawn with the matching flip so they read correctly on the aircraft.
 */
const paintFuselage = ({ emblem, font, anisotropy, hi }: LiveryOptions): SurfaceMaps => {
  const W = hi ? 3072 : 2048;
  const H = hi ? 1536 : 1024;
  const L = FUSELAGE_LENGTH;
  const X = (d: number) => (d / L) * W;
  const Y = (deg: number) => (deg / 360) * H;
  const mx = (m: number) => (m / L) * W; // metres along -> px
  const my = (m: number) => (m / (2 * Math.PI * R)) * H; // metres round -> px

  const color = canvas(W, H);
  const rough = canvas(W, H / 2);
  const bump = canvas(W, H);
  const glow = canvas(W / 2, H / 2);
  const ctx = color.ctx;

  // Base paint, the radome a shade greyer.
  ctx.fillStyle = PAINT.white;
  ctx.fillRect(0, 0, W, H);
  const radome = ctx.createLinearGradient(0, 0, X(1.9), 0);
  radome.addColorStop(0, "#e2e6ea");
  radome.addColorStop(0.92, "#e6e9ed");
  radome.addColorStop(1, PAINT.white);
  ctx.fillStyle = radome;
  ctx.fillRect(0, 0, X(1.9), H);

  // Belly boundary angle (degrees from the crown, right side) along the body: a swoosh that starts
  // under the cockpit, runs below the windows and climbs the tail cone into the fin.
  const boundary = (d: number) => {
    if (d < 2.2) return 181;
    if (d < 10) return 181 - 63 * Math.sin(((d - 2.2) / 7.8) * (Math.PI / 2)) ** 1.4;
    if (d < 21.5) return 118;
    const t = Math.min(1, (d - 21.5) / (L - 21.5));
    return 118 - 104 * t ** 1.35;
  };
  const bellyPath = (offset: number) => {
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const d = (i / 240) * L;
      ctx.lineTo(X(d), Y(Math.min(180, boundary(d) - offset)));
    }
    for (let i = 240; i >= 0; i--) {
      const d = (i / 240) * L;
      ctx.lineTo(X(d), Y(360 - Math.min(180, boundary(d) - offset)));
    }
    ctx.closePath();
  };
  // Navy livery line, a white gap, then the deep-sky belly.
  ctx.fillStyle = PAINT.navy;
  bellyPath(4.2);
  ctx.fill();
  ctx.fillStyle = PAINT.white;
  bellyPath(2.9);
  ctx.fill();
  const belly = ctx.createLinearGradient(0, Y(100), 0, Y(180));
  belly.addColorStop(0, PAINT.sky);
  belly.addColorStop(0.55, "#1672d6");
  belly.addColorStop(1, PAINT.deep);
  ctx.save();
  bellyPath(0);
  ctx.clip();
  ctx.fillStyle = belly;
  ctx.fillRect(0, 0, W, Y(180));
  const belly2 = ctx.createLinearGradient(0, Y(260), 0, Y(180));
  belly2.addColorStop(0, PAINT.sky);
  belly2.addColorStop(0.55, "#1672d6");
  belly2.addColorStop(1, PAINT.deep);
  ctx.fillStyle = belly2;
  ctx.fillRect(0, Y(180), W, H - Y(180));
  ctx.restore();

  // Exhaust soot on the tail cone round the APU outlet, and road grime under the belly.
  const soot = ctx.createLinearGradient(X(L - 2.4), 0, X(L), 0);
  soot.addColorStop(0, "rgba(20,24,30,0)");
  soot.addColorStop(1, "rgba(20,24,30,0.55)");
  ctx.fillStyle = soot;
  ctx.fillRect(X(L - 2.4), 0, X(2.4), H);
  const r = rand(320);
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = "#0a1220";
    ctx.fillRect(X(14 + r() * 20), Y(160 + r() * 40), mx(1 + r() * 4), my(0.02 + r() * 0.03));
  }
  ctx.globalAlpha = 1;

  // Panel seams and doors (bump + a whisper of colour), windows (colour, gloss, glow).
  const b = bump.ctx;
  b.fillStyle = "#808080";
  b.fillRect(0, 0, W, H);
  b.strokeStyle = "#5c5c5c";
  b.lineWidth = hi ? 2 : 1.2;
  // Circumferential splices every ~2.6 m; longitudinal lap joints.
  for (let d = 3.4; d < L - 1; d += 2.62) {
    b.beginPath();
    b.moveTo(X(d), 0);
    b.lineTo(X(d), H);
    b.stroke();
  }
  for (const deg of [38, 128, 232, 322]) {
    b.beginPath();
    b.moveTo(X(2.2), Y(deg));
    b.lineTo(X(L - 1.5), Y(deg));
    b.stroke();
  }
  // Rivet rows: fine dotted lines beside the splices.
  b.fillStyle = "#6e6e6e";
  for (let d = 3.4; d < L - 1; d += 2.62) {
    for (let y = 0; y < H; y += hi ? 9 : 6) b.fillRect(X(d) + (hi ? 5 : 3), y, hi ? 2 : 1, hi ? 2 : 1);
  }

  const doorAt = (d: number, deg: number, w: number, h: number, radius: number) => {
    for (const side of [deg, 360 - deg]) {
      const x = X(d) - mx(w) / 2;
      const y = Y(side) - my(h) / 2;
      b.beginPath();
      b.roundRect(x, y, mx(w), my(h), my(radius));
      b.stroke();
      ctx.strokeStyle = "rgba(70,86,108,0.55)";
      ctx.lineWidth = hi ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, mx(w), my(h), my(radius));
      ctx.stroke();
    }
  };
  // Passenger doors (with their small window), over-wing exits, cargo doors.
  doorAt(5.55, 86, 0.82, 1.86, 0.18);
  doorAt(31.25, 86, 0.82, 1.86, 0.18);
  doorAt(15.62, 80, 0.52, 1.02, 0.12);
  doorAt(16.35, 80, 0.52, 1.02, 0.12);
  doorAt(9.6, 128, 1.8, 1.25, 0.1);
  doorAt(26.8, 128, 1.8, 1.25, 0.1);

  // Windows: dark glass in a grey gasket, glossy; the cabin is lit inside.
  const rc = rough.ctx;
  rc.fillStyle = "rgb(0,92,0)"; // roughness lives in G: painted surfaces ~0.36
  rc.fillRect(0, 0, W, H / 2);
  const radomeRough = rc.createLinearGradient(0, 0, X(1.9), 0);
  radomeRough.addColorStop(0, "rgb(0,128,0)");
  radomeRough.addColorStop(1, "rgb(0,92,0)");
  rc.fillStyle = radomeRough;
  rc.fillRect(0, 0, X(1.9), H / 2);
  const g = glow.ctx;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W / 2, H / 2);

  const pane = (d: number, deg: number, w: number, h: number) => {
    for (const side of [deg, 360 - deg]) {
      const x = X(d) - mx(w) / 2;
      const y = Y(side) - my(h) / 2;
      const rad = Math.min(mx(w), my(h)) * 0.46;
      ctx.fillStyle = "#a9b2bc";
      ctx.beginPath();
      ctx.roundRect(x - mx(0.018), y - my(0.018), mx(w + 0.036), my(h + 0.036), rad * 1.05);
      ctx.fill();
      const glass = ctx.createLinearGradient(0, y, 0, y + my(h));
      glass.addColorStop(0, "#22303f");
      glass.addColorStop(1, "#0d151e");
      ctx.fillStyle = glass;
      ctx.beginPath();
      ctx.roundRect(x, y, mx(w), my(h), rad);
      ctx.fill();
      rc.fillStyle = "rgb(0,14,0)";
      rc.beginPath();
      rc.roundRect(x, y / 2, mx(w), my(h) / 2, rad / 2);
      rc.fill();
      // Some blinds are down; the rest glow unevenly.
      const lit = r();
      g.fillStyle = lit < 0.22 ? "rgb(0,0,0)" : `rgb(${Math.round(150 + lit * 105)},${Math.round(118 + lit * 86)},${Math.round(80 + lit * 60)})`;
      g.beginPath();
      g.roundRect(x / 2, y / 2, mx(w) / 2, my(h) / 2, rad / 2);
      g.fill();
      b.fillStyle = "#6a6a6a";
      b.beginPath();
      b.roundRect(x, y, mx(w), my(h), rad);
      b.fill();
    }
  };
  const skip = [[5.0, 6.15], [15.25, 16.75], [30.7, 31.85]];
  for (let d = 6.9; d < 30.4; d += 0.533) {
    if (skip.some(([a, z]) => d > a! && d < z!)) continue;
    pane(d, 77, 0.24, 0.34);
  }
  // Door windows.
  pane(5.55, 79, 0.2, 0.26);
  pane(31.25, 79, 0.2, 0.26);
  pane(15.62, 77, 0.2, 0.28);
  pane(16.35, 77, 0.2, 0.28);

  // Cockpit glazing at its true heights on the curved nose: windshields either side of the centre post,
  // sliding windows, rear side windows. Corners are (d, height y) or (d, half-width x) for the centre post.
  type Corner = { d: number; y?: number; x?: number };
  const cornerDeg = (c: Corner) => (c.x !== undefined ? (Math.asin(Math.min(1, c.x / section(c.d).half)) * 180) / Math.PI : angleAt(c.d, c.y!));
  const outline = (corners: Corner[]) => {
    const pts: [number, number][] = [];
    corners.forEach((from, i) => {
      const to = corners[(i + 1) % corners.length]!;
      const steps = from.y !== undefined && to.y !== undefined ? 10 : 1;
      for (let k = 0; k < steps; k++) {
        const t = k / steps;
        const d = from.d + (to.d - from.d) * t;
        pts.push([d, steps > 1 ? angleAt(d, from.y! + (to.y! - from.y!) * t) : cornerDeg(from)]);
      }
    });
    return pts;
  };
  const cockpit = (corners: Corner[]) => {
    const pts = outline(corners);
    for (const mirror of [false, true]) {
      const deg = (v: number) => (mirror ? 360 - v : v);
      ctx.beginPath();
      pts.forEach(([d, v], i) => (i ? ctx.lineTo(X(d), Y(deg(v))) : ctx.moveTo(X(d), Y(deg(v)))));
      ctx.closePath();
      const glass = ctx.createLinearGradient(X(2.2), 0, X(4.7), 0);
      glass.addColorStop(0, "#0b1118");
      glass.addColorStop(1, "#18222d");
      ctx.fillStyle = glass;
      ctx.fill();
      ctx.strokeStyle = "#3a4450";
      ctx.lineWidth = hi ? 4 : 2.5;
      ctx.stroke();
      rc.fillStyle = "rgb(0,8,0)";
      rc.beginPath();
      pts.forEach(([d, v], i) => (i ? rc.lineTo(X(d), Y(deg(v)) / 2) : rc.moveTo(X(d), Y(deg(v)) / 2)));
      rc.closePath();
      rc.fill();
      b.fillStyle = "#666";
      b.beginPath();
      pts.forEach(([d, v], i) => (i ? b.lineTo(X(d), Y(deg(v))) : b.moveTo(X(d), Y(deg(v)))));
      b.closePath();
      b.fill();
    }
  };
  cockpit([{ d: 2.22, x: 0.05 }, { d: 2.62, y: 0.5 }, { d: 3.05, y: 1.02 }, { d: 2.8, x: 0.05 }]);
  cockpit([{ d: 3.15, y: 0.44 }, { d: 3.92, y: 0.44 }, { d: 3.92, y: 1.1 }, { d: 3.2, y: 1.06 }]);
  cockpit([{ d: 4.04, y: 0.5 }, { d: 4.6, y: 0.56 }, { d: 4.6, y: 1.02 }, { d: 4.04, y: 1.08 }]);

  // Titles above the windows, the emblem ahead of them, the society line by the rear door.
  const title = "Civil Aviation India";
  const cap = my(0.5);
  ctx.font = `620 ${Math.round(cap * 1.38)}px ${font}`;
  ctx.fillStyle = PAINT.navy;
  ctx.textBaseline = "alphabetic";
  const titleWidth = ctx.measureText(title).width;
  const titleStart = X(8.9);
  const sides = [
    // Right side: canvas mirrored left-right, so draw mirrored; text reads tail → nose.
    { deg: 58, flipX: true },
    // Left side: canvas upside down; text reads nose → tail.
    { deg: 302, flipX: false },
  ];
  for (const { deg, flipX } of sides) {
    ctx.save();
    if (flipX) {
      ctx.translate(titleStart + titleWidth, Y(deg));
      ctx.scale(-1, 1);
      ctx.fillText(title, 0, cap / 2);
    } else {
      ctx.translate(titleStart, Y(deg));
      ctx.scale(1, -1);
      ctx.fillText(title, 0, cap / 2);
    }
    ctx.restore();
  }
  const small = "Aero Space Society of India";
  ctx.font = `560 ${Math.round(my(0.17) * 1.38)}px ${font}`;
  const smallWidth = ctx.measureText(small).width;
  for (const { deg, flipX } of sides) {
    ctx.save();
    ctx.fillStyle = PAINT.navy;
    const x0 = X(27.6);
    if (flipX) {
      ctx.translate(x0 + smallWidth, Y(deg + 3));
      ctx.scale(-1, 1);
    } else {
      ctx.translate(x0, Y(deg - 3));
      ctx.scale(1, -1);
    }
    ctx.fillText(small, 0, my(0.06));
    ctx.restore();
  }
  if (emblem) {
    const s = my(1.06);
    for (const { deg, flipX } of sides) {
      ctx.save();
      ctx.translate(X(7.55), Y(deg));
      ctx.scale(flipX ? -1 : 1, flipX ? 1 : -1);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.53, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(emblem, -s / 2, -s / 2, s, s);
      ctx.restore();
    }
  }

  return {
    map: texture(color.c, anisotropy),
    roughnessMap: texture(rough.c, anisotropy, false),
    bumpMap: texture(bump.c, anisotropy, false),
    emissiveMap: texture(glow.c, anisotropy),
  };
};

/**
 * Wing maps (upper and lower). Canvas x = chord fraction (LE at the left), canvas y = span from the tip
 * (top) to the root (bottom). Light grey paint, bare-metal slats, the panel lines of slats, spoilers,
 * flaps and ailerons, walkway lines near the root, the sharklet in deep sky blue.
 */
const paintWing = ({ anisotropy, hi }: { anisotropy: number; hi: boolean }, sharkletFrom: number, upper: boolean): SurfaceMaps => {
  const W = hi ? 1024 : 512;
  const H = hi ? 2048 : 1024;
  const color = canvas(W, H);
  const rough = canvas(W / 2, H / 2);
  const bump = canvas(W, H);
  const ctx = color.ctx;
  const Yv = (v: number) => (1 - v) * H;
  const tipY = Yv(sharkletFrom);

  ctx.fillStyle = upper ? PAINT.wing : "#b3bac3";
  ctx.fillRect(0, 0, W, H);
  // Slats: bare aluminium.
  const slat = ctx.createLinearGradient(0, 0, W * 0.14, 0);
  slat.addColorStop(0, "#d9dde1");
  slat.addColorStop(1, upper ? "#ccd1d6" : "#c3c9cf");
  ctx.fillStyle = slat;
  ctx.fillRect(0, tipY, W * 0.14, H - tipY);
  // Sharklet in the brand colour.
  const shark = ctx.createLinearGradient(0, tipY, 0, 0);
  shark.addColorStop(0, PAINT.deep);
  shark.addColorStop(1, PAINT.sky);
  ctx.fillStyle = shark;
  ctx.fillRect(0, 0, W, tipY + 2);

  const rc = rough.ctx;
  rc.fillStyle = "rgb(0,112,0)";
  rc.fillRect(0, 0, W / 2, H / 2);
  rc.fillStyle = "rgb(0,70,0)";
  rc.fillRect(0, tipY / 2, (W * 0.14) / 2, (H - tipY) / 2);
  rc.fillStyle = "rgb(0,84,0)";
  rc.fillRect(0, 0, W / 2, tipY / 2);

  const b = bump.ctx;
  b.fillStyle = "#808080";
  b.fillRect(0, 0, W, H);
  b.strokeStyle = "#585858";
  b.lineWidth = hi ? 2.5 : 1.5;
  const line = (x0: number, v0: number, x1: number, v1: number, paint = 0) => {
    b.beginPath();
    b.moveTo(x0 * W, Yv(v0));
    b.lineTo(x1 * W, Yv(v1));
    b.stroke();
    if (paint) {
      ctx.strokeStyle = `rgba(52,62,76,${Math.min(1, paint * 1.6)})`;
      ctx.lineWidth = hi ? 3 : 1.8;
      ctx.beginPath();
      ctx.moveTo(x0 * W, Yv(v0));
      ctx.lineTo(x1 * W, Yv(v1));
      ctx.stroke();
    }
  };
  const tip = sharkletFrom;
  // Slat trailing edge and segment breaks.
  line(0.14, 0.12, 0.14, tip * 0.97, 0.35);
  for (const v of [0.12, 0.3, 0.46, 0.62, 0.78, tip * 0.97]) line(0, v, 0.14, v, 0.35);
  if (upper) {
    // Spoilers (five panels) and the flap/aileron hinge line.
    line(0.66, 0.12, 0.66, 0.8, 0.4);
    for (const v of [0.12, 0.26, 0.4, 0.53, 0.66, 0.8]) line(0.66, v, 0.8, v, 0.4);
    line(0.8, 0.06, 0.8, tip * 0.97, 0.45);
    // Flaps (inboard, outboard), aileron.
    for (const v of [0.06, 0.36, 0.8, tip * 0.97]) line(0.8, v, 1, v, 0.45);
    // Walkway near the root.
    ctx.strokeStyle = "rgba(20,24,30,0.55)";
    ctx.lineWidth = hi ? 3 : 2;
    ctx.strokeRect(0.22 * W, Yv(0.27), 0.38 * W, Yv(0.1) - Yv(0.27));
  } else {
    line(0.8, 0.06, 0.8, tip * 0.97, 0.25);
    for (const v of [0.06, 0.36, 0.8]) line(0.8, v, 1, v, 0.25);
    // Access panels along the spar.
    for (let v = 0.12; v < tip * 0.9; v += 0.055) {
      b.strokeRect(0.36 * W, Yv(v + 0.02), 0.1 * W, Yv(v) - Yv(v + 0.02));
    }
  }
  // Fastener rows along the spars.
  b.fillStyle = "#6a6a6a";
  for (const x of [0.15, 0.63]) for (let y = tipY; y < H; y += hi ? 10 : 6) b.fillRect(x * W, y, hi ? 2 : 1, hi ? 2 : 1);
  // Subtle weathering streaks running aft.
  const r = rand(upper ? 11 : 13);
  ctx.globalAlpha = 0.045;
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = "#1c2430";
    const y = tipY + r() * (H - tipY);
    ctx.fillRect(0.3 * W + r() * 0.5 * W, y, (0.1 + r() * 0.4) * W, hi ? 2 : 1);
  }
  ctx.globalAlpha = 1;

  return { map: texture(color.c, anisotropy), roughnessMap: texture(rough.c, anisotropy, false), bumpMap: texture(bump.c, anisotropy, false) };
};

/**
 * Fin maps for one side. Canvas x = absolute chordwise position (planar, so the emblem keeps its
 * shape), canvas y = height from the tip (top) to the root (bottom). The left side (−X) reads the
 * canvas as drawn; the right side reads it mirrored, so its emblem is drawn mirrored.
 * `rudder(v)` gives the rudder hinge's canvas x (0–1) at height v.
 */
const paintFin = (
  { emblem, anisotropy, hi }: LiveryOptions,
  mirrored: boolean,
  shape: { le: (v: number) => number; te: (v: number) => number; rudder: (v: number) => number; emblemAt: [number, number]; emblemSize: number; aspect: number },
): SurfaceMaps => {
  // Square texels: the canvas has the fin's own proportions, so the emblem stays round.
  const W = hi ? 2048 : 1024;
  const H = Math.round(W * shape.aspect);
  const color = canvas(W, H);
  const rough = canvas(W / 4, H / 4);
  const bump = canvas(W, H);
  const glow = canvas(W / 2, H / 2);
  const ctx = color.ctx;
  const Yv = (v: number) => (1 - v) * H;

  const grad = ctx.createLinearGradient(0, H, W * 0.35, 0);
  grad.addColorStop(0, PAINT.deep);
  grad.addColorStop(0.6, "#1a7fe0");
  grad.addColorStop(1, PAINT.sky);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // The livery line sweeping up the leading edge.
  ctx.strokeStyle = PAINT.white;
  ctx.lineWidth = W * 0.016;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const v = i / 40;
    ctx.lineTo((shape.le(v) + 0.06 + 0.22 * (1 - v) ** 2) * W, Yv(v));
  }
  ctx.stroke();
  ctx.strokeStyle = PAINT.navy;
  ctx.lineWidth = W * 0.007;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const v = i / 40;
    ctx.lineTo((shape.le(v) + 0.085 + 0.22 * (1 - v) ** 2) * W, Yv(v));
  }
  ctx.stroke();

  const rc = rough.ctx;
  rc.fillStyle = "rgb(0,150,0)";
  rc.fillRect(0, 0, W, H);

  const b = bump.ctx;
  b.fillStyle = "#808080";
  b.fillRect(0, 0, W, H);
  b.strokeStyle = "#5a5a5a";
  b.lineWidth = hi ? 3 : 2;
  b.beginPath();
  for (let i = 0; i <= 40; i++) {
    const v = 0.04 + (i / 40) * 0.92;
    b.lineTo(shape.rudder(v) * W, Yv(v));
  }
  b.stroke();
  for (const v of [0.04, 0.5, 0.96]) {
    b.beginPath();
    b.moveTo(shape.rudder(v) * W, Yv(v));
    b.lineTo(shape.te(v) * W, Yv(v));
    b.stroke();
  }
  ctx.strokeStyle = "rgba(4,20,48,0.35)";
  ctx.lineWidth = hi ? 2.5 : 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const v = 0.04 + (i / 40) * 0.92;
    ctx.lineTo(shape.rudder(v) * W, Yv(v));
  }
  ctx.stroke();

  const g = glow.ctx;
  g.fillStyle = "#000";
  g.fillRect(0, 0, W / 2, H / 2);
  if (emblem) {
    const [u, v] = shape.emblemAt;
    const s = shape.emblemSize * W;
    ctx.save();
    ctx.translate(u * W, Yv(v));
    if (mirrored) ctx.scale(-1, 1);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.53, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(emblem, -s / 2, -s / 2, s, s);
    ctx.restore();
    // Logo lights wash the emblem after sunset.
    const wash = g.createRadialGradient((u * W) / 2, Yv(v) / 2, 0, (u * W) / 2, Yv(v) / 2, s * 0.3);
    wash.addColorStop(0, "rgba(255,255,255,0.9)");
    wash.addColorStop(0.85, "rgba(255,255,255,0.65)");
    wash.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = wash;
    g.fillRect(0, 0, W / 2, H / 2);
  }
  return {
    map: texture(color.c, anisotropy),
    roughnessMap: texture(rough.c, anisotropy, false),
    bumpMap: texture(bump.c, anisotropy, false),
    emissiveMap: texture(glow.c, anisotropy),
  };
};

/**
 * Engine fan cowl. Canvas x = distance along the cowl from the lip (left) aft, canvas y = angle from the
 * crown, bottom to top. The emblem sits on both sides of each engine.
 */
const paintNacelle = ({ emblem, font, anisotropy, hi }: LiveryOptions): SurfaceMaps => {
  const W = hi ? 1024 : 512;
  const H = hi ? 1024 : 512;
  const color = canvas(W, H);
  const rough = canvas(W / 4, H / 4);
  const bump = canvas(W, H);
  const ctx = color.ctx;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0b3f93");
  grad.addColorStop(0.5, PAINT.deep);
  grad.addColorStop(1, "#0b3f93");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // A white livery band near the exhaust.
  ctx.fillStyle = PAINT.white;
  ctx.fillRect(W * 0.86, 0, W * 0.025, H);
  ctx.fillStyle = PAINT.navy;
  ctx.fillRect(W * 0.885, 0, W * 0.012, H);
  const rc = rough.ctx;
  rc.fillStyle = "rgb(0,80,0)";
  rc.fillRect(0, 0, W, H);
  const b = bump.ctx;
  b.fillStyle = "#808080";
  b.fillRect(0, 0, W, H);
  b.strokeStyle = "#5a5a5a";
  b.lineWidth = hi ? 3 : 2;
  // Inlet/fan-cowl and fan-cowl/reverser joints, the fan-cowl latch line at the bottom.
  for (const x of [0.2, 0.58]) {
    b.beginPath();
    b.moveTo(x * W, 0);
    b.lineTo(x * W, H);
    b.stroke();
  }
  b.beginPath();
  b.moveTo(0.2 * W, H * 0.5);
  b.lineTo(0.58 * W, H * 0.5);
  b.stroke();
  // Texels are ~2× longer round the cowl than along it, so the emblem is squashed to stay round.
  const s = W * 0.24;
  for (const [y, rot] of [[0.75, Math.PI], [0.25, 0]] as const) {
    ctx.save();
    ctx.translate(W * 0.4, H * y);
    ctx.rotate(rot);
    ctx.scale(1, 0.48);
    if (emblem) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.53, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(emblem, -s / 2, -s / 2, s, s);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(s * 0.5)}px ${font}`;
      ctx.textAlign = "center";
      ctx.fillText("ASSI", 0, s * 0.18);
    }
    ctx.restore();
  }
  return { map: texture(color.c, anisotropy), roughnessMap: texture(rough.c, anisotropy, false), bumpMap: texture(bump.c, anisotropy, false) };
};

/** Spinner: polished dark cone with a white spiral, so the fan's rotation reads. */
const paintSpinner = (anisotropy: number) => {
  const { c, ctx } = canvas(256, 256);
  ctx.fillStyle = "#2b3038";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#f2f4f6";
  ctx.lineWidth = 22;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    ctx.lineTo(t * 256, ((t * 0.9 + 0.1) * 256) % 256);
  }
  ctx.stroke();
  return texture(c, anisotropy);
};

/** Glow sprite for navigation lights, strobes, beacons and landing lights. */
export const glowSprite = (rgb: string) => {
  const { c, ctx } = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.08, `rgba(${rgb},0.95)`);
  g.addColorStop(0.28, `rgba(${rgb},0.28)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return texture(c, 1);
};

export const fuselageMaps = (o: LiveryOptions) => memo(`fuselage|${liveryKey(o)}`, o.anisotropy, () => paintFuselage(o));
export const wingMaps = (o: { anisotropy: number; hi: boolean }, sharkletFrom: number, upper: boolean) =>
  memo(`wing|${o.hi}|${sharkletFrom}|${upper}`, o.anisotropy, () => paintWing(o, sharkletFrom, upper));
export const finMaps = (o: LiveryOptions, mirrored: boolean, shape: Parameters<typeof paintFin>[2]) =>
  memo(`fin|${liveryKey(o)}|${mirrored}`, o.anisotropy, () => paintFin(o, mirrored, shape));
export const nacelleMaps = (o: LiveryOptions) => memo(`nacelle|${liveryKey(o)}`, o.anisotropy, () => paintNacelle(o));
export const spinnerMap = (anisotropy: number) => memo("spinner", anisotropy, () => ({ map: paintSpinner(anisotropy) })).map;

