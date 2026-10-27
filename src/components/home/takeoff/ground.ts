import * as THREE from "three";

/**
 * Airfield surfaces painted on canvases: runway 27/09 (45 m × 3,300 m) with ICAO markings, rubber
 * deposits, crack sealant, patch repairs and worn paint; a fine asphalt detail tile for the close-up;
 * mown grass; the taxiway with its yellow centreline. Nothing is downloaded.
 */

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

const finish = (c: HTMLCanvasElement, opts: { repeat?: [number, number]; anisotropy: number; srgb?: boolean; channel?: number }) => {
  const tex = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) tex.colorSpace = THREE.SRGBColorSpace;
  if (opts.repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  if (opts.channel) tex.channel = opts.channel;
  tex.anisotropy = opts.anisotropy;
  return tex;
};

/**
 * A tile of random specks written straight into pixels, used as a repeating fill: one draw call instead
 * of tens of thousands of tiny rectangles. `speck(r)` returns [r, g, b, a] or null for a clear pixel.
 */
const specks = (ctx: CanvasRenderingContext2D, seed: number, speck: (r: () => number) => [number, number, number, number] | null, size = 256) => {
  const tile = canvas(size, size);
  const img = tile.ctx.createImageData(size, size);
  const r = rand(seed);
  for (let i = 0; i < size * size; i++) {
    const v = speck(r);
    if (!v) continue;
    img.data.set(v, i * 4);
  }
  tile.ctx.putImageData(img, 0, 0);
  return ctx.createPattern(tile.c, "repeat")!;
};

export const RUNWAY = { width: 45, length: 3300 } as const;

/**
 * Runway colour and roughness. Canvas x = across (45 m), canvas y = along, threshold 27 at the bottom
 * (where the roll starts), threshold 09 at the top.
 */
export const runwayMaps = (anisotropy: number, hi: boolean) => {
  const W = hi ? 512 : 256;
  const H = hi ? 8192 : 4096;
  const { c, ctx } = canvas(W, H);
  const rough = canvas(W / 2, H / 2);
  const r = rand(27);
  const px = W / RUNWAY.width;
  const py = H / RUNWAY.length;
  const X = (m: number) => W / 2 + m * px; // metres from the centreline
  const Y = (m: number) => H - m * py; // metres from threshold 27

  // Asphalt: base tone, lane-width resurfacing strips, patch repairs.
  ctx.fillStyle = "#3d4045";
  ctx.fillRect(0, 0, W, H);
  for (let k = -3; k <= 3; k++) {
    ctx.fillStyle = `rgba(${k % 2 ? "255,255,255" : "0,0,0"},0.025)`;
    ctx.fillRect(X(k * 6.4 - 3.2), 0, 6.4 * px, H);
  }
  for (let i = 0; i < 70; i++) {
    const w = (4 + r() * 14) * px;
    const h = (6 + r() * 40) * py;
    ctx.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(r() * W, r() * H, w, h);
  }
  // Grain.
  ctx.fillStyle = specks(ctx, 3, (q) => (q() > 0.12 ? null : q() > 0.5 ? [255, 255, 255, 10 + q() * 14] : [0, 0, 0, 12 + q() * 18]));
  ctx.fillRect(0, 0, W, H);
  // Rubber: two wheel tracks the whole length, heavy deposits in both touchdown zones.
  for (const side of [-1, 1]) {
    const g = ctx.createLinearGradient(X(side * 1.5), 0, X(side * 6), 0);
    g.addColorStop(0, "rgba(10,10,12,0)");
    g.addColorStop(0.5, "rgba(10,10,12,0.16)");
    g.addColorStop(1, "rgba(10,10,12,0)");
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(X(side * 1.5), X(side * 6)), 0, 4.5 * px, H);
  }
  for (const [a, b] of [[120, 950], [RUNWAY.length - 950, RUNWAY.length - 120]] as const) {
    for (let i = 0; i < (hi ? 900 : 400); i++) {
      const along = a + r() * (b - a);
      const fade = Math.sin(((along - a) / (b - a)) * Math.PI);
      const x = (r() - 0.5) * 13;
      ctx.fillStyle = `rgba(8,8,10,${(0.05 + r() * 0.12) * fade})`;
      ctx.fillRect(X(x), Y(along), (0.3 + r() * 0.6) * px, -(8 + r() * 60) * py);
    }
  }
  // Crack sealant: transverse and longitudinal joints, then random cracks.
  ctx.strokeStyle = "rgba(12,12,14,0.55)";
  ctx.lineWidth = hi ? 1.3 : 1;
  for (let m = 20; m < RUNWAY.length; m += 25 + r() * 40) {
    ctx.beginPath();
    let x = 0;
    ctx.moveTo(x, Y(m));
    while (x < W) {
      x += 6 + r() * 18;
      ctx.lineTo(x, Y(m) + (r() - 0.5) * 3);
    }
    ctx.stroke();
  }
  for (const k of [-11.25, 0, 11.25]) {
    ctx.beginPath();
    for (let m = 0; m < RUNWAY.length; m += 6) ctx.lineTo(X(k) + (r() - 0.5) * 2, Y(m));
    ctx.stroke();
  }
  for (let i = 0; i < 160; i++) {
    let x = r() * W;
    let y = r() * H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (r() - 0.5) * 14;
      y += (r() - 0.5) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Markings in white paint, worn by the tyres.
  const paint = (x: number, y: number, w: number, h: number) => ctx.fillRect(X(x), Y(y + h), w * px, h * py);
  ctx.fillStyle = "#e9ebee";
  // Side stripes and centreline (30 m dashes, 20 m gaps).
  paint(-22, 0, 0.9, RUNWAY.length);
  paint(21.1, 0, 0.9, RUNWAY.length);
  for (let m = 110; m < RUNWAY.length - 110; m += 50) paint(-0.45, m, 0.9, 30);
  for (const flip of [false, true]) {
    const at = (m: number) => (flip ? RUNWAY.length - m : m);
    const bar = (x: number, m: number, w: number, len: number) => paint(x, flip ? at(m) - len : at(m), w, len);
    // Threshold: 8 bars each side.
    for (let k = 0; k < 8; k++) {
      bar(1.7 + k * 2.55, 6, 1.8, 30);
      bar(-1.7 - k * 2.55 - 1.8, 6, 1.8, 30);
    }
    // Aiming point and touchdown-zone marks.
    bar(5.25, 400, 7, 45);
    bar(-12.25, 400, 7, 45);
    for (const [m, n] of [[150, 3], [300, 3], [450, 2], [600, 2], [750, 1], [900, 1]] as const) {
      for (let k = 0; k < n; k++) {
        bar(4.5 + k * 3, m, 1.8, 22.5);
        bar(-4.5 - k * 3 - 1.8, m, 1.8, 22.5);
      }
    }
    // Designator, stretched for the pilot's eye-height.
    ctx.save();
    ctx.translate(X(0), Y(at(54)));
    if (flip) ctx.rotate(Math.PI);
    ctx.scale(1, (py / px) * 4.2);
    ctx.font = `700 ${Math.round(8.4 * px)}px "Arial Narrow", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(flip ? "09" : "27", 0, 0);
    ctx.restore();
  }
  // Wear: tyres and weather take the paint off in specks.
  ctx.fillStyle = specks(ctx, 9, (q) => (q() > 0.07 ? null : [60, 63, 68, 90 + q() * 130]));
  ctx.fillRect(0, 0, W, H);

  // Roughness: asphalt matte, painted markings a little smoother (G channel).
  const rc = rough.ctx;
  rc.drawImage(c, 0, 0, W / 2, H / 2);
  const img = rc.getImageData(0, 0, W / 2, H / 2);
  for (let i = 0; i < img.data.length; i += 4) {
    const lum = img.data[i]!;
    const v = lum > 150 ? 150 : 228 - lum * 0.2;
    img.data[i] = 0;
    img.data[i + 1] = v;
    img.data[i + 2] = 0;
  }
  rc.putImageData(img, 0, 0);

  return { map: finish(c, { anisotropy }), roughnessMap: finish(rough.c, { anisotropy, srgb: false }) };
};

/** Close-up asphalt aggregate, tiled every 2 m on the runway's second UV set (bump). */
export const asphaltDetail = (anisotropy: number, repeat: [number, number]) => {
  const { c, ctx } = canvas(512, 512);
  const r = rand(5);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const s = 1 + r() * 4;
    const v = Math.round(90 + r() * 90);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.beginPath();
    ctx.ellipse(r() * 512, r() * 512, s, s * (0.6 + r() * 0.4), r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  return finish(c, { anisotropy, srgb: false, repeat, channel: 1 });
};

/** Mown airfield grass, 48 m per tile: clumps, mowing stripes, dry patches. */
export const grassTexture = (anisotropy: number, repeat: [number, number]) => {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  const r = rand(44);
  ctx.fillStyle = "#4f5c36";
  ctx.fillRect(0, 0, S, S);
  // Mowing stripes.
  for (let k = 0; k < 16; k++) {
    ctx.fillStyle = k % 2 ? "rgba(255,255,220,0.035)" : "rgba(0,0,0,0.04)";
    ctx.fillRect(k * (S / 16), 0, S / 16, S);
  }
  // Clumps and dry patches, wrapped so the tile repeats seamlessly.
  const blob = (x: number, y: number, rad: number, fill: string) => {
    for (const dx of [-S, 0, S]) {
      for (const dy of [-S, 0, S]) {
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rad);
        g.addColorStop(0, fill);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x + dx - rad, y + dy - rad, rad * 2, rad * 2);
      }
    }
  };
  for (let i = 0; i < 90; i++) blob(r() * S, r() * S, 30 + r() * 120, r() > 0.6 ? "rgba(140,128,74,0.22)" : "rgba(30,44,22,0.28)");
  ctx.fillStyle = specks(ctx, 45, (q) => {
    if (q() > 0.2) return null;
    const v = q();
    return v > 0.66 ? [150, 160, 96, 64] : v > 0.33 ? [36, 48, 24, 76] : [98, 108, 62, 64];
  });
  ctx.fillRect(0, 0, S, S);
  return finish(c, { anisotropy, repeat });
};

/** Taxiway: darker asphalt, yellow centreline, edge markings. Canvas x across 23 m, y along. */
export const taxiwayTexture = (anisotropy: number) => {
  const W = 128;
  const H = 2048;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#383b3f";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = specks(ctx, 62, (q) => (q() > 0.1 ? null : q() > 0.5 ? [255, 255, 255, 10] : [0, 0, 0, 15]), 128);
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#d9a92a";
  ctx.fillRect(W / 2 - 1.5, 0, 3, H);
  for (const x of [5, W - 8]) {
    ctx.fillRect(x, 0, 1.5, H);
    ctx.fillRect(x + 2.5, 0, 1.5, H);
  }
  return finish(c, { anisotropy });
};
