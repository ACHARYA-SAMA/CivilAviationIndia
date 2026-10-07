import * as THREE from "three";

/** Procedural textures for the take-off scene: everything is drawn on canvases, nothing is downloaded. */

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

const finish = (c: HTMLCanvasElement, opts: { repeat?: [number, number]; anisotropy?: number; srgb?: boolean } = {}) => {
  const tex = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  tex.anisotropy = opts.anisotropy ?? 8;
  return tex;
};

/** Patchwork farmland seen from the air (Deccan plateau greens and dusty browns). */
export const fieldTexture = (anisotropy: number) => {
  const { c, ctx } = canvas(1024, 1024);
  const r = rand(7);
  ctx.fillStyle = "#8d9b68";
  ctx.fillRect(0, 0, 1024, 1024);
  const palette = ["#8f9d68", "#99a46f", "#86955f", "#a7a678", "#7f9060", "#93a06c", "#ada67d", "#8b9965", "#9ca371"];
  for (let i = 0; i < 260; i++) {
    ctx.save();
    ctx.translate(r() * 1024, r() * 1024);
    ctx.rotate((r() - 0.5) * 0.5);
    ctx.fillStyle = palette[Math.floor(r() * palette.length)]!;
    ctx.globalAlpha = 0.55 + r() * 0.35;
    ctx.fillRect(-30, -20, 30 + r() * 110, 20 + r() * 80);
    ctx.restore();
  }
  // Tree lines and village greens.
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 120; i++) {
    ctx.fillStyle = r() > 0.5 ? "#6d7f4e" : "#77885a";
    ctx.beginPath();
    ctx.arc(r() * 1024, r() * 1024, 3 + r() * 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 16000; i++) {
    ctx.fillStyle = r() > 0.5 ? "#000" : "#fff";
    ctx.fillRect(r() * 1024, r() * 1024, 1.5, 1.5);
  }
  return finish(c, { repeat: [70, 70], anisotropy });
};

/** Runway 45 m × 3,300 m: asphalt, edge lines, centreline, threshold bars, designator "27", touchdown and aiming-point marks. */
export const runwayTexture = (anisotropy: number) => {
  const W = 256;
  const H = 4096;
  const { c, ctx } = canvas(W, H);
  const r = rand(27);
  const px = W / 45; // pixels per metre across
  const py = H / 3300; // pixels per metre along (bottom = threshold)
  const y = (m: number) => H - m * py; // metres from threshold -> canvas y
  ctx.fillStyle = "#4a4e54";
  ctx.fillRect(0, 0, W, H);
  // Asphalt grain and tyre marks in the touchdown zones.
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "0,0,0"},${0.05 + r() * 0.06})`;
    ctx.fillRect(r() * W, r() * H, 1.2, 1.2);
  }
  for (const zone of [[150, 700], [2600, 3150]] as const) {
    for (let i = 0; i < 120; i++) {
      const x = W / 2 + (r() - 0.5) * 18 * px;
      const len = 20 + r() * 90;
      ctx.fillStyle = `rgba(20,20,22,${0.08 + r() * 0.12})`;
      ctx.fillRect(x, y(zone[0] + r() * (zone[1] - zone[0])), 0.9 * px, len * py);
    }
  }
  ctx.fillStyle = "#f2f4f6";
  // Edge lines.
  ctx.fillRect(0.6 * px, 0, 0.9 * px, H);
  ctx.fillRect(W - 1.5 * px, 0, 0.9 * px, H);
  // Centreline: 30 m dashes, 20 m gaps, starting after the designator.
  for (let m = 110; m < 3200; m += 50) ctx.fillRect(W / 2 - 0.45 * px, y(m + 30), 0.9 * px, 30 * py);
  // Threshold bars (piano keys).
  for (let k = 0; k < 8; k++) {
    for (const side of [-1, 1]) {
      const x = W / 2 + side * (3 + k * 2.4) * px - (side < 0 ? 1.8 * px : 0);
      ctx.fillRect(x, y(36), 1.8 * px, 30 * py);
    }
  }
  // Designator, readable from the approach.
  ctx.save();
  ctx.translate(W / 2, y(70));
  ctx.scale(1, (py / px) * 2.6);
  ctx.font = `bold ${Math.round(9 * px)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("27", 0, 0);
  ctx.restore();
  // Aiming point and touchdown-zone marks.
  for (const side of [-1, 1]) ctx.fillRect(W / 2 + side * 9 * px - (side < 0 ? 9 * px : 0), y(348), 9 * px, 48 * py);
  for (const m of [150, 450, 600, 750, 900]) {
    for (const side of [-1, 1]) for (const dx of [9.5, 13]) ctx.fillRect(W / 2 + side * dx * px - (side < 0 ? 1.8 * px : 0), y(m + 22), 1.8 * px, 22 * py);
  }
  return finish(c, { anisotropy });
};

/** Terminal façade: white panels with a band of blue glazing. */
export const terminalTexture = () => {
  const { c, ctx } = canvas(512, 128);
  ctx.fillStyle = "#eef2f6";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#3d6f9e";
  ctx.fillRect(0, 34, 512, 46);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let x = 0; x < 512; x += 16) ctx.fillRect(x, 34, 2, 46);
  return finish(c, { anisotropy: 4 });
};

/** The terminal's glazing lit from inside at dusk (emissive map matching terminalTexture). */
export const terminalGlowTexture = () => {
  const { c, ctx } = canvas(512, 128);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 512, 128);
  const r = rand(9);
  for (let x = 0; x < 512; x += 16) {
    ctx.fillStyle = r() > 0.2 ? "#ffd8a0" : "#9fc7ff";
    ctx.globalAlpha = 0.5 + r() * 0.5;
    ctx.fillRect(x + 2, 34, 14, 46);
  }
  return finish(c, { anisotropy: 4 });
};

type Livery = { emblem: HTMLImageElement | null; font: string };

/**
 * Fuselage livery on the lathe's UV space: u runs round the body (0 = crown, 0.25 = right side,
 * 0.5 = belly, 0.75 = left side), v runs from the tail (0) to the nose (1).
 * White upper body, sky-blue belly that sweeps up towards the fin, a navy pinstripe, windows,
 * cockpit glazing, doors, the "CIVIL AVIATION INDIA" title and the society's emblem.
 */
export const fuselageTexture = ({ emblem, font }: Livery, anisotropy: number, length: number, radius: number) => {
  const W = 2048;
  const H = 2048;
  const { c, ctx } = canvas(W, H);
  const circ = 2 * Math.PI * radius;
  const U = (u: number) => u * W;
  const V = (metresFromTail: number) => H - (metresFromTail / length) * H; // nose at the top
  const du = (m: number) => (m / circ) * W;
  const dv = (m: number) => (m / length) * H;

  ctx.fillStyle = "#f5f8fc";
  ctx.fillRect(0, 0, W, H);

  // Belly in sky blue; towards the tail the boundary climbs so the blue sweeps up into the fin.
  const boundary = (t: number) => (t > 0.34 ? 0.318 : 0.318 - (0.34 - t) * 0.62); // t = fraction from tail
  const belly = ctx.createLinearGradient(U(0.32), 0, U(0.5), 0);
  belly.addColorStop(0, "#2a96ef");
  belly.addColorStop(1, "#0d6dc6");
  ctx.fillStyle = belly;
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    ctx.lineTo(U(boundary(t)), H - t * H);
  }
  for (let i = 64; i >= 0; i--) {
    const t = i / 64;
    ctx.lineTo(U(1 - boundary(t)), H - t * H);
  }
  ctx.closePath();
  ctx.fill();
  // Navy pinstripe just above the blue.
  ctx.strokeStyle = "#0b2240";
  ctx.lineWidth = du(0.09);
  for (const mirror of [false, true]) {
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const t = i / 64;
      const b = boundary(t) - 0.012;
      ctx.lineTo(U(mirror ? 1 - b : b), H - t * H);
    }
    ctx.stroke();
  }

  // Cabin windows: two rows of rounded windows just above the centreline on each side.
  ctx.fillStyle = "#1b2a3d";
  const drawWindow = (u: number, m: number) => {
    const w = du(0.3);
    const h = dv(0.24);
    const x = U(u) - w / 2;
    const yy = V(m) - h / 2;
    ctx.beginPath();
    ctx.roundRect(x, yy, w, h, Math.min(w, h) * 0.45);
    ctx.fill();
  };
  for (let m = 7.5; m < 29.5; m += 0.53) {
    if (Math.abs(m - 16.2) < 0.6 || Math.abs(m - 17.1) < 0.4) continue; // over-wing exits
    drawWindow(0.205, m);
    drawWindow(0.795, m);
  }
  // Doors.
  ctx.strokeStyle = "rgba(60,80,104,0.55)";
  ctx.lineWidth = 3;
  for (const m of [6.2, 30.6]) {
    for (const u of [0.22, 0.78]) {
      ctx.beginPath();
      ctx.roundRect(U(u) - du(0.9) / 2, V(m) - dv(1.9) / 2, du(0.9), dv(1.9), 8);
      ctx.stroke();
    }
  }
  // Cockpit glazing around the nose.
  ctx.fillStyle = "#14202f";
  for (const [u0, u1] of [[0.035, 0.125], [0.875, 0.965], [0.965, 1], [0, 0.035]] as const) {
    ctx.beginPath();
    ctx.moveTo(U(u0), V(length - 3.1));
    ctx.lineTo(U(u1), V(length - 3.0));
    ctx.lineTo(U(u1), V(length - 2.35));
    ctx.lineTo(U(u0), V(length - 2.45));
    ctx.closePath();
    ctx.fill();
  }

  // Titles along both sides, reading forward on the right and aft on the left, as painted on real liveries.
  const titleSize = du(0.82);
  ctx.fillStyle = "#0b2240";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.round(titleSize)}px ${font}`;
  for (const [u, dir] of [[0.13, -1], [0.87, 1]] as const) {
    ctx.save();
    ctx.translate(U(u), V(18.5));
    ctx.rotate((dir * Math.PI) / 2);
    ctx.textAlign = "center";
    ctx.fillText("CIVIL AVIATION INDIA", 0, 0);
    ctx.restore();
  }
  // Emblem behind the forward door on both sides.
  if (emblem) {
    const s = du(1.5);
    for (const [u, dir] of [[0.13, -1], [0.87, 1]] as const) {
      ctx.save();
      ctx.translate(U(u), V(28.2));
      ctx.rotate((dir * Math.PI) / 2);
      ctx.drawImage(emblem, -s / 2, -s / 2, s, s);
      ctx.restore();
    }
  }
  return finish(c, { anisotropy });
};

/** A white disc with the society's emblem, for the fin, wings and engines. */
export const emblemDecal = (emblem: HTMLImageElement | null, ring = true) => {
  const { c, ctx } = canvas(512, 512);
  if (ring) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();
  }
  if (emblem) ctx.drawImage(emblem, 40, 40, 432, 432);
  const tex = finish(c, { anisotropy: 8 });
  return tex;
};

/** Engine cowling band: sky blue with the society's initials, repeated round the nacelle. */
export const nacelleTexture = (font: string) => {
  const { c, ctx } = canvas(1024, 256);
  ctx.fillStyle = "#f5f8fc";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = "#1a86e3";
  ctx.fillRect(0, 70, 1024, 116);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 64px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const x of [256, 768]) {
    ctx.save();
    ctx.translate(x, 128);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("ASSI", 0, 0);
    ctx.restore();
  }
  return finish(c, { anisotropy: 8 });
};

/** Glow sprite for strobes and navigation lights. */
export const glowTexture = (rgb: string) => {
  const { c, ctx } = canvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, `rgba(${rgb},0.9)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return finish(c, { anisotropy: 1 });
};
