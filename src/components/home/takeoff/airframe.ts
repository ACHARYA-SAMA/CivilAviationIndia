/**
 * Fuselage shape shared by the geometry and the livery (so windows and titles land on the real
 * surface). A320neo-class: 37.57 m long, 3.96 m wide, 4.14 m tall. Distances `d` are metres from the
 * nose tip; heights are metres from the fuselage axis.
 */

export const FUSELAGE_LENGTH = 37.57;
export const RW = 1.98;
export const RH = 2.07;

/** Monotone cubic interpolation (Fritsch–Carlson) through [x, y] points: smooth, no overshoot. */
const monotone = (points: [number, number][]) => {
  const n = points.length;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const slopes = xs.slice(0, -1).map((x, i) => (ys[i + 1]! - ys[i]!) / (xs[i + 1]! - x));
  const m = ys.map((_, i) => (i === 0 ? slopes[0]! : i === n - 1 ? slopes[n - 2]! : slopes[i - 1]! * slopes[i]! <= 0 ? 0 : (slopes[i - 1]! + slopes[i]!) / 2));
  for (let i = 0; i < n - 1; i++) {
    const s = slopes[i]!;
    if (s === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i]! / s;
    const b = m[i + 1]! / s;
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * s;
      m[i + 1] = t * b * s;
    }
  }
  return (x: number) => {
    if (x <= xs[0]!) return ys[0]!;
    if (x >= xs[n - 1]!) return ys[n - 1]!;
    let i = 0;
    while (x > xs[i + 1]!) i++;
    const h = xs[i + 1]! - xs[i]!;
    const t = (x - xs[i]!) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i]! + (t3 - 2 * t2 + t) * h * m[i]! + (-2 * t3 + 3 * t2) * ys[i + 1]! + (t3 - t2) * h * m[i + 1]!;
  };
};

// Nose, from side and plan views of the type: a blunt radome, the windshield on a ~30° slope,
// the crown reached about 7 m back.
const noseTop = monotone([[0, -0.38], [0.18, -0.05], [0.5, 0.2], [1.0, 0.4], [1.6, 0.56], [2.2, 0.74], [2.9, 1.12], [3.6, 1.48], [4.6, 1.8], [5.8, 2.0], [7.2, RH]]);
const noseBottom = monotone([[0, -0.38], [0.18, -0.72], [0.5, -1.0], [1.0, -1.3], [1.7, -1.58], [2.7, -1.84], [3.9, -1.99], [5.4, -RH]]);
const noseHalf = monotone([[0, 0], [0.12, 0.42], [0.45, 0.82], [1.0, 1.16], [1.7, 1.44], [2.6, 1.66], [3.8, 1.85], [5.2, 1.95], [6.6, RW]]);

/** Depth of the wing-to-body fairing (0–1). */
export const fairing = (d: number) => smoothstep(11.0, 14.6, d) * (1 - smoothstep(20.8, 24.8, d));

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Section at distance d from the nose: top, bottom and half-width (before the belly fairing). */
export const section = (d: number) => {
  let top = RH;
  let bottom = -RH;
  let half = RW;
  if (d < 7.2) {
    top = noseTop(d);
    bottom = d < 5.4 ? noseBottom(d) : -RH;
    half = d < 6.6 ? noseHalf(d) : RW;
  } else if (d > 24.2) {
    const t = Math.min(1, (d - 24.2) / (FUSELAGE_LENGTH - 24.2));
    bottom = -RH + (RH + 0.55) * (0.35 * t + 0.65 * t * t * (3 - 2 * t));
    top = RH - (RH - 1.12) * Math.pow(t, 2.4);
    half = RW - (RW - 0.3) * Math.pow(t, 1.55);
  }
  return { top, bottom, half };
};

/**
 * The angle round the body (degrees from the crown, right side) at which the surface reaches height y
 * at station d: puts windows at true heights on the curved nose.
 */
export const angleAt = (d: number, y: number) => {
  const { top, bottom } = section(d);
  const cy = (top + bottom) / 2;
  const b = (top - bottom) / 2;
  return (Math.acos(Math.min(1, Math.max(-1, (y - cy) / b))) * 180) / Math.PI;
};
