import * as THREE from "three";

/**
 * Geometry helpers for the aircraft: lofted lifting surfaces with real airfoil sections, and
 * surfaces of revolution with seamless normals. Everything is generated, nothing is downloaded.
 */

/** NACA 4-digit half-thickness (closed trailing edge) at chord fraction x, for thickness ratio t. */
const thickness = (x: number, t: number) =>
  5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);

/** Aft-loaded camber line (supercritical-like): zero at both ends, peak near 55% chord. */
const camberLine = (x: number, m: number) => m * 4.6 * x * (1 - x) * (0.35 + 0.9 * x * (1 - 0.45 * x));

export type Station = {
  /** Leading-edge point. */
  le: THREE.Vector3;
  chord: number;
  /** Thickness ratio. */
  t: number;
  /** Max camber as a fraction of chord (0 for symmetric fins and pylons). */
  camber?: number;
  /** Nose-up twist (radians) about the span axis. */
  twist?: number;
  /** Cant of the section about the chord axis: 0 = a flat wing, π/2 = a vertical fin. */
  cant: number;
  /** Texture v coordinate at this station. */
  v: number;
};

/**
 * Loft airfoil sections into one smooth surface. The section runs TE (upper) → LE → TE (lower), so the
 * leading edge is smooth and the trailing edge stays sharp. Groups: 0 = upper surface, 1 = lower, 2 = tip.
 * UV: u = chord fraction (0 at the LE, 1 at the TE), v = station v. `side` mirrors to the left (−X).
 */
export const loft = (stations: Station[], opts: { side?: 1 | -1; points?: number; cap?: boolean; planarU?: boolean } = {}) => {
  const side = opts.side ?? 1;
  const M = opts.points ?? 26;
  const ring = 2 * M + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indexUpper: number[] = [];
  const indexLower: number[] = [];
  const indexCap: number[] = [];
  const chordAxis = new THREE.Vector3();
  const normalAxis = new THREE.Vector3();
  const p = new THREE.Vector3();
  // With planarU, u is the absolute chordwise position (for decals that must not stretch with taper).
  let zMin = Infinity;
  let zMax = -Infinity;
  for (const s of stations) {
    zMin = Math.min(zMin, s.le.z);
    zMax = Math.max(zMax, s.le.z + s.chord);
  }

  for (const s of stations) {
    const tw = s.twist ?? 0;
    // Thickness direction for a section canted by `cant` about the chord axis.
    normalAxis.set(-Math.sin(s.cant), Math.cos(s.cant), 0);
    chordAxis.set(0, 0, 1);
    // Nose-up twist: the TE drops along −normal.
    const c = chordAxis.clone().multiplyScalar(Math.cos(tw)).addScaledVector(normalAxis, -Math.sin(tw));
    const n = normalAxis.clone().multiplyScalar(Math.cos(tw)).addScaledVector(chordAxis, Math.sin(tw));
    for (let k = 0; k < ring; k++) {
      // Cosine spacing: dense at the LE and TE.
      const upper = k <= M;
      const j = upper ? M - k : k - M;
      const x = 0.5 * (1 - Math.cos((Math.PI * j) / M));
      const yt = thickness(x, s.t);
      const yc = camberLine(x, s.camber ?? 0);
      const y = upper ? yc + yt : yc - yt;
      p.copy(s.le).addScaledVector(c, x * s.chord).addScaledVector(n, y * s.chord);
      positions.push(p.x * side, p.y, p.z);
      const u = opts.planarU ? (s.le.z + x * s.chord - zMin) / (zMax - zMin) : x;
      uvs.push(u, s.v);
    }
  }
  for (let i = 0; i < stations.length - 1; i++) {
    for (let k = 0; k < ring - 1; k++) {
      const a = i * ring + k;
      const b = a + 1;
      const d = a + ring;
      const e = d + 1;
      const target = k < M ? indexUpper : indexLower;
      if (side > 0) target.push(a, d, b, b, d, e);
      else target.push(a, b, d, b, e, d);
    }
  }
  if (opts.cap !== false) {
    // Close the last section with a fan from its mean point.
    const last = (stations.length - 1) * ring;
    const centre = new THREE.Vector3();
    for (let k = 0; k < ring; k++) centre.add(new THREE.Vector3(positions[(last + k) * 3]!, positions[(last + k) * 3 + 1]!, positions[(last + k) * 3 + 2]!));
    centre.divideScalar(ring);
    const ci = positions.length / 3;
    positions.push(centre.x, centre.y, centre.z);
    uvs.push(0.5, stations[stations.length - 1]!.v);
    for (let k = 0; k < ring - 1; k++) {
      if (side > 0) indexCap.push(last + k, ci, last + k + 1);
      else indexCap.push(last + k, last + k + 1, ci);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex([...indexUpper, ...indexLower, ...indexCap]);
  geo.addGroup(0, indexUpper.length, 0);
  geo.addGroup(indexUpper.length, indexLower.length, 1);
  if (indexCap.length) geo.addGroup(indexUpper.length + indexLower.length, indexCap.length, 2);
  geo.computeVertexNormals();
  return geo;
};

/** A point on a lofted section (for placing fairings, pylons and lights on a surface). */
export const sectionPoint = (s: Station, x: number, upper: boolean, side: 1 | -1 = 1) => {
  const tw = s.twist ?? 0;
  const n0 = new THREE.Vector3(-Math.sin(s.cant), Math.cos(s.cant), 0);
  const c0 = new THREE.Vector3(0, 0, 1);
  const c = c0.clone().multiplyScalar(Math.cos(tw)).addScaledVector(n0, -Math.sin(tw));
  const n = n0.clone().multiplyScalar(Math.cos(tw)).addScaledVector(c0, Math.sin(tw));
  const yt = thickness(x, s.t);
  const yc = camberLine(x, s.camber ?? 0);
  const p = s.le.clone().addScaledVector(c, x * s.chord).addScaledVector(n, (upper ? yc + yt : yc - yt) * s.chord);
  p.x *= side;
  return p;
};

/**
 * Revolve a profile of [radius, z] points about the Z axis. Angle 0 is the crown (+Y), turning towards +X.
 * UV: u = profile arc length (normalised), v = angle / 2π. Seam normals are averaged, so no line shows.
 */
export const revolve = (profile: [number, number][], segments = 64, opts: { flip?: boolean } = {}) => {
  const rows = profile.length;
  const cols = segments + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  const lengths = [0];
  for (let i = 1; i < rows; i++) {
    const [r0, z0] = profile[i - 1]!;
    const [r1, z1] = profile[i]!;
    lengths.push(lengths[i - 1]! + Math.hypot(r1 - r0, z1 - z0));
  }
  const total = lengths[rows - 1] || 1;
  for (let i = 0; i < rows; i++) {
    const [r, z] = profile[i]!;
    for (let j = 0; j < cols; j++) {
      const a = (j / segments) * Math.PI * 2;
      positions.push(r * Math.sin(a), r * Math.cos(a), z);
      uvs.push(lengths[i]! / total, j / segments);
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      if (opts.flip) index.push(a, b, c, b, d, c);
      else index.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  weldSeam(geo, rows, cols);
  return geo;
};

/** Average the normals of the first and last column of a grid so the wrap-around seam is invisible. */
export const weldSeam = (geo: THREE.BufferGeometry, rows: number, cols: number) => {
  const normal = geo.attributes.normal as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const w = new THREE.Vector3();
  for (let i = 0; i < rows; i++) {
    const a = i * cols;
    const b = a + cols - 1;
    v.fromBufferAttribute(normal, a);
    w.fromBufferAttribute(normal, b);
    v.add(w).normalize();
    normal.setXYZ(a, v.x, v.y, v.z);
    normal.setXYZ(b, v.x, v.y, v.z);
  }
  normal.needsUpdate = true;
};

/** Smoothstep. */
export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Give the main thread back (input, scrolling, frames) between heavy build steps. */
export const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Upload every texture in the scene ahead of the first frame, yielding between them. */
export const uploadTextures = async (renderer: THREE.WebGLRenderer, scene: THREE.Object3D) => {
  const textures = new Set<THREE.Texture>();
  scene.traverse((object) => {
    const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const m of Array.isArray(material) ? material : material ? [material] : []) {
      for (const value of Object.values(m)) if (value instanceof THREE.Texture) textures.add(value);
    }
  });
  for (const texture of textures) {
    renderer.initTexture(texture);
    await yieldToMain();
  }
};

/**
 * Draw the whole scene once, off screen and without frustum culling, while it is still hidden: Direct3D
 * drivers (ANGLE) build some pipeline variants on first draw, which would otherwise land as a hitch the
 * first time something new comes into view (the city after lift-off, say).
 */
export const warmUp = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, target: THREE.WebGLRenderTarget | null) => {
  const culled: THREE.Object3D[] = [];
  scene.traverse((object) => {
    if (object.frustumCulled) {
      object.frustumCulled = false;
      culled.push(object);
    }
  });
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  culled.forEach((object) => (object.frustumCulled = true));
};

/**
 * Compile materials in parallel for the render target they will draw into: three.js builds a different
 * shader for a render target than for the screen (tone mapping and colour space move to a later pass),
 * so compiling against the wrong one would recompile, synchronously, on the first frame.
 */
export const compileFor = async (renderer: THREE.WebGLRenderer, root: THREE.Object3D, camera: THREE.Camera, target: THREE.WebGLRenderTarget | null) => {
  const previous = renderer.getRenderTarget();
  renderer.setRenderTarget(target);
  const pending = renderer.compileAsync(root, camera);
  renderer.setRenderTarget(previous);
  await pending;
};

/** The same, for full-screen post-processing materials. */
export const compileMaterials = async (renderer: THREE.WebGLRenderer, materials: THREE.Material[], target: THREE.WebGLRenderTarget | null) => {
  const root = new THREE.Scene();
  const quad = new THREE.PlaneGeometry(2, 2);
  materials.forEach((material) => root.add(new THREE.Mesh(quad, material)));
  await compileFor(renderer, root, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), target);
  quad.dispose();
};

