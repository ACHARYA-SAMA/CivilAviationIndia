import * as THREE from "three";

/** Procedural textures for the take-off scene's surroundings: drawn on canvases, nothing is downloaded. */

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
