import * as THREE from "three";

/**
 * The city at dusk around the airfield, and the airfield's own lighting. Everything here is light
 * points drawn by one small shader (street lights, traffic, runway and approach lights, obstruction
 * beacons) plus instanced buildings with lit windows. No textures are downloaded.
 */

type Rand = () => number;

/** Light points: world-size glows with a pixel floor, optional blinking, fading with distance. */
const POINT_VERTEX = /* glsl */ `
  attribute vec3 color;
  attribute float size;
  attribute float phase;
  attribute vec3 dir;
  attribute float speed;
  uniform float time;
  uniform float scale;
  uniform float floorPx;
  uniform float maxPx;
  varying vec3 vColor;
  varying float vAlpha;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    // Moving lights (traffic) slide along their road; everything else has speed 0.
    vec3 p = position + dir * fract(phase + time * speed);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(1.0, -mv.z);
    gl_PointSize = clamp(size * scale / dist, floorPx, maxPx);
    // phase < 0: steady. Blinking lights use phase >= 2 (offset = phase - 2).
    float blink = phase >= 2.0 ? step(fract(time * 0.8 + phase), 0.14) : 1.0;
    vAlpha = blink * mix(1.0, 0.35, smoothstep(6000.0, 42000.0, dist));
    vColor = color;
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
  }
`;
const POINT_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  #include <logdepthbuf_pars_fragment>
  void main() {
    #include <logdepthbuf_fragment>
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.0, 1.0, d);
    float a = (pow(core, 3.0) * 1.4 + pow(core, 1.2) * 0.25) * vAlpha;
    gl_FragColor = vec4(vColor * a, 1.0);
  }
`;

type PointSet = { pos: number[]; color: number[]; size: number[]; phase: number[]; dir: number[]; speed: number[] };
const newSet = (): PointSet => ({ pos: [], color: [], size: [], phase: [], dir: [], speed: [] });
const push = (set: PointSet, x: number, y: number, z: number, c: THREE.Color, size: number, phase = -1, dir: [number, number, number] = [0, 0, 0], speed = 0) => {
  set.pos.push(x, y, z);
  set.color.push(c.r, c.g, c.b);
  set.size.push(size);
  set.phase.push(phase);
  set.dir.push(...dir);
  set.speed.push(speed);
};

const C = {
  sodium: new THREE.Color(1.0, 0.62, 0.3).multiplyScalar(1.5),
  led: new THREE.Color(0.85, 0.9, 1.0).multiplyScalar(1.4),
  warm: new THREE.Color(1.0, 0.8, 0.55).multiplyScalar(1.3),
  head: new THREE.Color(1.0, 0.96, 0.85).multiplyScalar(1.8),
  tail: new THREE.Color(1.0, 0.12, 0.08).multiplyScalar(1.6),
  edge: new THREE.Color(1.0, 0.95, 0.82).multiplyScalar(1.8),
  caution: new THREE.Color(1.0, 0.78, 0.25).multiplyScalar(1.8),
  red: new THREE.Color(1.0, 0.1, 0.06).multiplyScalar(2),
  green: new THREE.Color(0.2, 1.0, 0.45).multiplyScalar(1.8),
  blue: new THREE.Color(0.25, 0.45, 1.0).multiplyScalar(2),
};

/** Lit windows on a dark façade; `rows` × `cols` windows per face. */
const windowTexture = (rows: number, cols: number, seed: number) => {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 128, 256);
  const cw = 128 / cols;
  const ch = 256 / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const lit = r();
      if (lit < 0.42) continue;
      ctx.fillStyle = lit > 0.86 ? "#cfe0ff" : lit > 0.6 ? "#ffd9a0" : "#ffb870";
      ctx.globalAlpha = 0.45 + r() * 0.55;
      ctx.fillRect(x * cw + cw * 0.22, y * ch + ch * 0.25, cw * 0.56, ch * 0.5);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  return tex;
};

export const buildCity = ({ small, rnd }: { small: boolean; rnd: Rand }) => {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const lights = newSet();
  const traffic = newSet();

  // --- Airfield lighting: runway 27 runs from z = 0 (where the roll starts) to z = −3,300. ---
  const RWY = 3300;
  for (let d = 0; d <= RWY; d += 60) {
    const caution = d > RWY - 600; // last 600 m ahead of the departing aircraft show yellow
    for (const x of [-24, 24]) push(lights, x, 0.4, -d, caution ? C.caution : C.edge, 2.4);
  }
  for (let d = 15; d < RWY; d += 15) {
    const left = RWY - d;
    const red = left < 300 || (left < 900 && Math.round(d / 15) % 2 === 0);
    push(lights, 0, 0.15, -d, red ? C.red : C.edge, 2.2);
  }
  for (let x = -22; x <= 22; x += 3) {
    push(lights, x, 0.3, 4, C.green, 2.6); // threshold behind the aircraft
    push(lights, x, 0.3, -RWY - 2, C.red, 2.8); // runway end ahead
  }
  // Approach lights for the opposite runway beyond the far end, with the sequenced flashers.
  for (let d = 30; d <= 900; d += 30) {
    push(lights, 0, 1.2, -RWY - d, C.edge, 3.4);
    if (d % 150 === 0) for (const x of [-12, -8, -4, 4, 8, 12]) push(lights, x, 1.2, -RWY - d, C.edge, 3);
    push(lights, 0, 1.6, -RWY - d, C.led, 7, 2 + (1 - d / 900) * 0.9);
  }
  // Taxiway (blue edges) and the apron's floodlights.
  for (let d = 0; d <= RWY; d += 45) for (const x of [178, 202]) push(lights, x, 0.4, -d, C.blue, 2.6);
  for (let k = 0; k < 14; k++) push(lights, 230 + (k % 7) * 60, 26, -1180 - Math.floor(k / 7) * 640, C.sodium, 30);

  // --- The city: a density field of districts, laid out on a street grid turned off the runway. ---
  const districts = Array.from({ length: small ? 16 : 30 }, () => {
    let x = 0;
    let z = 0;
    do {
      x = (rnd() - 0.45) * 32000;
      z = 3000 - rnd() * 32000;
    } while (Math.abs(x) < 2200 && z > -5200 && z < 2000);
    return { x, z, r: 1200 + rnd() * 2800, w: 0.55 + rnd() * 0.6 };
  });
  // The high-rise district ahead and to the left of the climb-out.
  const core = { x: -5200, z: -9800, r: 1500, w: 1.4 };
  districts.push(core);
  const density = (x: number, z: number) => {
    let d = 0;
    for (const k of districts) {
      const dx = x - k.x;
      const dz = z - k.z;
      d += k.w * Math.exp(-(dx * dx + dz * dz) / (2 * k.r * k.r));
    }
    // Keep the airfield itself clear.
    if (Math.abs(x) < 1100 && z > -4400 && z < 900) d = 0;
    return Math.min(1.4, d);
  };

  const CELL = 210;
  const turn = 14 * (Math.PI / 180);
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const toWorld = (u: number, v: number): [number, number] => [u * cos - v * sin, u * sin + v * cos];
  const maxBuildings = small ? 2600 : 8000;
  const maxStreet = small ? 18000 : 56000;
  type Box = { x: number; z: number; w: number; d: number; h: number; rot: number };
  const low: Box[] = [];
  const mid: Box[] = [];
  const tall: Box[] = [];
  let streetCount = 0;
  const span = 17000;
  // Nearest cells first, so the budgets are spent where the camera can see detail.
  const cells: [number, number, number][] = [];
  for (let u = -span; u <= span; u += CELL) {
    for (let v = -span * 1.9 + 4000; v <= 6000; v += CELL) {
      const [x, z] = toWorld(u, v);
      const dd = density(x, z);
      if (dd < 0.12) continue;
      cells.push([u, v, Math.hypot(x, z + 3000)]);
    }
  }
  cells.sort((a, b) => a[2] - b[2]);
  for (const [u, v] of cells) {
    const [x, z] = toWorld(u, v);
    const dd = density(x, z);
    if (rnd() > Math.min(1, dd * 1.25)) continue;
    // Street lights along two edges of the block (the other two belong to the neighbours).
    if (streetCount < maxStreet) {
      const col = rnd() < 0.72 ? C.sodium : C.led;
      for (let k = 0; k < 6; k++) {
        const t = (k / 6) * CELL;
        const [ax, az] = toWorld(u + t, v);
        const [bx, bz] = toWorld(u, v + t);
        // A few lamps are out or set back from the kerb, so the grid never reads as ruled.
        if (rnd() > 0.12) push(lights, ax + (rnd() - 0.5) * 8, 9, az + (rnd() - 0.5) * 8, col, 11);
        if (rnd() > 0.12) push(lights, bx + (rnd() - 0.5) * 8, 9, bz + (rnd() - 0.5) * 8, col, 11);
      }
      streetCount += 12;
    }
    const count = 1 + Math.floor(rnd() * (dd > 0.7 ? 4 : 2.4));
    for (let b = 0; b < count; b++) {
      if (low.length + mid.length + tall.length >= maxBuildings) break;
      const w = 16 + rnd() * 38;
      const depth = 16 + rnd() * 38;
      const [bx, bz] = toWorld(u + 20 + rnd() * (CELL - 40), v + 20 + rnd() * (CELL - 40));
      const inCore = Math.hypot(bx - core.x, bz - core.z) < core.r * 1.4;
      const tallChance = inCore ? 0.45 : dd > 0.9 ? 0.05 : 0.01;
      const h = rnd() < tallChance ? 70 + rnd() * (inCore ? 150 : 60) : dd > 0.6 && rnd() < 0.35 ? 22 + rnd() * 30 : 6 + rnd() * 16;
      const box = { x: bx, z: bz, w: h > 60 ? 26 + rnd() * 20 : w, d: h > 60 ? 26 + rnd() * 20 : depth, h, rot: turn + (rnd() < 0.15 ? rnd() * 0.6 : 0) };
      (h > 60 ? tall : h > 21 ? mid : low).push(box);
      // Red obstruction lights on the tall ones, blinking out of step.
      if (h > 60) push(lights, bx, h + 2, bz, C.red, 9, 2 + rnd());
    }
  }

  // Highways: long straight roads with streams of headlights one way and tail lights the other.
  const roads: [number, number, number, number][] = [
    [-15000, -2600, 16000, -6000],
    [-3000, 4000, -9000, -30000],
    [9000, 5000, 3000, -30000],
    [-16000, -17000, 17000, -14000],
    [-14000, -26000, 15000, -22000],
  ];
  const carBudget = small ? 1200 : 4200;
  for (const [x0, z0, x1, z1] of roads) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const nx = (z1 - z0) / len;
    const nz = -(x1 - x0) / len;
    for (let d = 0; d < len; d += 48) {
      const t = d / len;
      push(lights, x0 + (x1 - x0) * t + nx * 14, 11, z0 + (z1 - z0) * t + nz * 14, C.sodium, 12);
    }
    const cars = Math.floor(carBudget / roads.length / 2);
    for (let k = 0; k < cars; k++) {
      const speed = (22 + rnd() * 14) / len; // 80–130 km/h
      push(traffic, x0 + nx * 4, 1.2, z0 + nz * 4, C.head, 5.5, rnd(), [x1 - x0, 0, z1 - z0], speed);
      push(traffic, x1 - nx * 4, 1.2, z1 - nz * 4, C.tail, 4.5, rnd(), [x0 - x1, 0, z0 - z1], speed);
    }
  }

  // Buildings: three height classes, each with a window texture scaled to its storeys.
  const roofMat = track(new THREE.MeshStandardMaterial({ color: "#2a2f38", roughness: 1 }));
  const makeClass = (boxes: Box[], rows: number, cols: number, seed: number, wall: string) => {
    if (!boxes.length) return;
    const tex = track(windowTexture(rows, cols, seed));
    const wallMat = track(new THREE.MeshStandardMaterial({ color: wall, roughness: 0.85, metalness: 0.05, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 1.25 }));
    const geo = track(new THREE.BoxGeometry(1, 1, 1));
    // Box faces: ±x, ±y (roof, floor), ±z.
    const mesh = new THREE.InstancedMesh(geo, [wallMat, wallMat, roofMat, roofMat, wallMat, wallMat], boxes.length);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    boxes.forEach((b, i) => {
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, b.rot);
      m.compose(pos.set(b.x, b.h / 2, b.z), q, scl.set(b.w, b.h, b.d));
      mesh.setMatrixAt(i, m);
    });
    group.add(mesh);
  };
  makeClass(low, 3, 5, 11, "#596170");
  makeClass(mid, 8, 6, 23, "#525c6c");
  makeClass(tall, 34, 8, 37, "#46536a");

  // One draw call for the static lights, one for the traffic.
  const scale = { value: 600 };
  const time = { value: 0 };
  const floorPx = { value: 1.6 };
  const maxPx = { value: 22 };
  const makePoints = (set: PointSet) => {
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.Float32BufferAttribute(set.pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(set.color, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(set.size, 1));
    geo.setAttribute("phase", new THREE.Float32BufferAttribute(set.phase, 1));
    geo.setAttribute("dir", new THREE.Float32BufferAttribute(set.dir, 3));
    geo.setAttribute("speed", new THREE.Float32BufferAttribute(set.speed, 1));
    const mat = track(
      new THREE.ShaderMaterial({
        uniforms: { time, scale, floorPx, maxPx },
        vertexShader: POINT_VERTEX,
        fragmentShader: POINT_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    group.add(points);
  };
  makePoints(lights);
  makePoints(traffic);

  return {
    group,
    update: (t: number, viewportHeight: number, fov: number, pixelRatio: number) => {
      time.value = t;
      // Glows are sized for a bloom pass that spreads them further.
      scale.value = (0.58 * viewportHeight * pixelRatio) / (2 * Math.tan((fov * Math.PI) / 360));
      floorPx.value = 1.3 * pixelRatio;
      maxPx.value = 14 * pixelRatio;
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
};
