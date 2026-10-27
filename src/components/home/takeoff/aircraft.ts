import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { lerp, loft, revolve, sectionPoint, smooth, weldSeam, yieldToMain, type Station } from "./geometry";
import { FUSELAGE_LENGTH, RH, RW, fairing, section } from "./airframe";
import { PAINT, finMaps, fuselageMaps, glowSprite, nacelleMaps, spinnerMap, wingMaps } from "./livery";

/**
 * The society's twin-jet airliner (A320neo-class dimensions, metres) in the institute's livery.
 * Lofted fuselage with a real nose, belly fairing and up-swept tail cone; airfoil-section wings with
 * dihedral, twist, a trailing-edge kink and blended sharklets; high-bypass engines with a polished
 * intake lip, 18 fan blades, spinner, core cowl and exhaust plug; flap-track fairings; retracting
 * landing gear; antennas; navigation lights, strobes, beacons and logo lights.
 * Nose points to −Z, up is +Y, right wing is +X; the wheels touch the ground at y = −GEAR_HEIGHT.
 */

export const GEAR_HEIGHT = 4.18;
const L = FUSELAGE_LENGTH;
const DEG = Math.PI / 180;
const zOf = (d: number) => d - L / 2;

export type AircraftOptions = {
  emblem: HTMLImageElement | null;
  font: string;
  anisotropy: number;
  /** Full-resolution textures and geometry (desktop). */
  hi: boolean;
  shadows: boolean;
};

export type AircraftState = { gear: number; fan: number; time: number; dt: number; cabin: number };

export type Aircraft = {
  group: THREE.Group;
  update: (state: AircraftState) => void;
  /** Rough occluder boxes in the aircraft's frame (for the lens flare). */
  occluders: THREE.Box3[];
  /** Named anchor points for hotspots (aircraft frame). */
  anchors: Record<"cockpit" | "engine" | "wing" | "gear" | "tail" | "cabin", THREE.Vector3>;
  dispose: () => void;
};

const buildFuselage = (hi: boolean) => {
  const rows = hi ? 280 : 160;
  const cols = hi ? 120 : 72;
  const ring = cols + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const stations: number[] = [];
  for (let i = 0; i <= rows; i++) {
    // Denser at the nose and the tail cone.
    const t = i / rows;
    stations.push(L * (t - (0.9 * Math.sin(2 * Math.PI * t)) / (2 * Math.PI) * 0.55));
  }
  const push = (d: number, scale: number, uScale = 1) => {
    const { top, bottom, half } = section(d);
    const cy = (top + bottom) / 2;
    const b = ((top - bottom) / 2) * scale;
    const a = half * scale;
    const f = fairing(d) * scale;
    for (let j = 0; j < ring; j++) {
      const th = (j / cols) * Math.PI * 2;
      const s = Math.sin(th);
      const c = Math.cos(th);
      let x = a * s;
      let y = cy + b * c;
      if (c < 0 && f > 0) {
        // Wing-to-body fairing: deeper and wider on the lower half, with a flattened keel.
        const k = -c;
        y -= 0.34 * f * Math.pow(k, 2.2);
        x += Math.sign(s) * 0.3 * f * Math.abs(s) * Math.pow(k, 0.8);
      }
      positions.push(x, y, zOf(d));
      uvs.push(Math.min(1, d / L) * uScale, 1 - j / cols);
    }
  };
  for (const d of stations) push(Math.max(0, d), 1);
  // Close the tail with the APU exhaust, set slightly into the cone.
  push(L, 0.62);
  push(L - 0.22, 0.02);
  const totalRows = stations.length + 2;
  const index: number[] = [];
  for (let i = 0; i < totalRows - 1; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * ring + j;
      const b = a + 1;
      const c = a + ring;
      const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  weldSeam(geo, totalRows, ring);
  // The nose tip is one point: give it the forward normal.
  const normal = geo.attributes.normal as THREE.BufferAttribute;
  for (let j = 0; j < ring; j++) normal.setXYZ(j, 0, -0.2, -1);
  return geo;
};

/** Right-wing stations (mirrored for the left), sharklet included. Root leading edge at the origin. */
const WING_TIP = 16.95;
const SHARKLET_V = 0.85;
const wingStations = (): Station[] => {
  const sweep = Math.tan(27.5 * DEG);
  const dihedral = 5.1 * DEG;
  const te = (s: number) => (s <= 6.3 ? 6.95 + 0.04 * s : lerp(7.2, WING_TIP * sweep + 1.45, (s - 6.3) / (WING_TIP - 6.3)));
  const stations: Station[] = [];
  for (const s of [0, 1, 2, 3, 4.2, 5.3, 6.3, 7.4, 8.8, 10.3, 11.8, 13.3, 14.8, 16.1, WING_TIP]) {
    const inboard = s <= 6.3;
    const k = inboard ? s / 6.3 : (s - 6.3) / (WING_TIP - 6.3);
    stations.push({
      le: new THREE.Vector3(s, s * Math.tan(dihedral), s * sweep),
      chord: te(s) - s * sweep,
      t: inboard ? lerp(0.152, 0.128, k) : lerp(0.128, 0.105, k),
      camber: inboard ? 0.022 : lerp(0.022, 0.017, k),
      twist: (inboard ? lerp(3.2, 0.8, k) : lerp(0.8, -1.8, k)) * DEG,
      cant: dihedral,
      v: (s / WING_TIP) * 0.82,
    });
  }
  // Sharklet: a blended curve (radius 0.6 m) turning the section up to 78°, then a swept, tapered blade.
  const tip = stations[stations.length - 1]!;
  const R = 0.6;
  const c0 = dihedral;
  const centre = new THREE.Vector3(tip.le.x - R * Math.sin(c0), tip.le.y + R * Math.cos(c0), 0);
  const arc = [20, 38, 56, 78];
  arc.forEach((deg, i) => {
    const c = deg * DEG;
    const k = (i + 1) / arc.length;
    stations.push({
      le: new THREE.Vector3(centre.x + R * Math.sin(c), centre.y - R * Math.cos(c), tip.le.z + 0.28 * k),
      chord: lerp(tip.chord, 1.22, k),
      t: lerp(0.105, 0.09, k),
      camber: 0.012,
      twist: -1.8 * DEG,
      cant: c,
      v: lerp(0.82, 0.88, k),
    });
  });
  const base = stations[stations.length - 1]!;
  const up = new THREE.Vector3(Math.cos(78 * DEG), Math.sin(78 * DEG), 0);
  for (const [h, chord, v] of [[0.6, 1.02, 0.92], [1.25, 0.8, 0.955], [1.85, 0.58, 0.985], [2.3, 0.42, 1]] as const) {
    stations.push({
      le: base.le.clone().addScaledVector(up, h).add(new THREE.Vector3(0, 0, h * 0.7)),
      chord,
      t: 0.085,
      camber: 0.008,
      twist: -1.5 * DEG,
      cant: 78 * DEG,
      v,
    });
  }
  return stations;
};

/** One fan blade: a twisted, cambered plate from hub to tip, at the crown (angle 0). */
const fanBlade = () => {
  const radial = 9;
  const chordwise = 6;
  const positions: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= radial; i++) {
    const k = i / radial;
    const r = lerp(0.34, 0.965, k);
    const chord = lerp(0.3, 0.44, k);
    const stagger = lerp(28, 58, k) * DEG;
    for (let j = 0; j <= chordwise; j++) {
      const x = j / chordwise - 0.5;
      const camber = 0.05 * (1 - 4 * x * x) * chord;
      // Chord runs between the axis (z) and the tangent (x); camber bows the blade along its normal.
      const px = Math.sin(stagger) * x * chord + Math.cos(stagger) * camber;
      const pz = Math.cos(stagger) * x * chord - Math.sin(stagger) * camber;
      positions.push(px, r, pz);
    }
  }
  const row = chordwise + 1;
  for (let i = 0; i < radial; i++) {
    for (let j = 0; j < chordwise; j++) {
      const a = i * row + j;
      index.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
};

/** A tyre: a rounded section revolved about the axle (X axis), plus its hub. */
const wheelGeometries = (radius: number, width: number) => {
  const hw = width / 2;
  const rim = radius * 0.56;
  const profile: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI;
    profile.push([radius - hw * 0.62 + Math.cos(a) * hw * 0.62, Math.sin(a) * hw]);
  }
  const tyre = revolve([[rim, -hw * 0.9], ...profile, [rim, hw * 0.9]], 40);
  tyre.rotateY(Math.PI / 2);
  const hub = revolve([[0.001, hw * 0.55], [rim * 0.35, hw * 0.55], [rim * 0.55, hw * 0.4], [rim, hw * 0.75], [rim, -hw * 0.75], [0.001, -hw * 0.6]], 28, { flip: true });
  hub.rotateY(Math.PI / 2);
  return { tyre, hub };
};

/** Built in steps that yield to the main thread, so painting and meshing never freeze the page for long. */
export const buildAircraft = async (opts: AircraftOptions): Promise<Aircraft> => {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };
  const trackMaps = <T extends Record<string, THREE.Texture | undefined>>(maps: T) => {
    Object.values(maps).forEach((tex) => tex && track(tex));
    return maps;
  };
  const livery = { emblem: opts.emblem, font: opts.font, anisotropy: opts.anisotropy, hi: opts.hi };

  // Materials.
  const body = trackMaps(fuselageMaps(livery));
  await yieldToMain();
  const paint = track(
    new THREE.MeshPhysicalMaterial({
      ...body,
      roughness: 1,
      metalness: 0,
      bumpScale: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: new THREE.Color("#ffd2a1"),
      emissiveIntensity: 0,
    }),
  );
  const wingUpper = trackMaps(wingMaps(livery, SHARKLET_V, true));
  const wingLower = trackMaps(wingMaps(livery, SHARKLET_V, false));
  await yieldToMain();
  const wingMat = (maps: typeof wingUpper) =>
    track(new THREE.MeshPhysicalMaterial({ ...maps, roughness: 1, metalness: 0.18, bumpScale: 0.7, clearcoat: 0.35, clearcoatRoughness: 0.3 }));
  const wingMats = [wingMat(wingUpper), wingMat(wingLower), track(new THREE.MeshPhysicalMaterial({ color: PAINT.deep, roughness: 0.35, clearcoat: 1 }))];
  const tailPaint = track(new THREE.MeshPhysicalMaterial({ color: PAINT.wing, roughness: 0.42, metalness: 0.16, clearcoat: 0.35, clearcoatRoughness: 0.3 }));
  const cowlMaps = trackMaps(nacelleMaps(livery));
  await yieldToMain();
  const cowl = track(new THREE.MeshPhysicalMaterial({ ...cowlMaps, roughness: 1, metalness: 0.05, bumpScale: 0.6, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const lip = track(new THREE.MeshPhysicalMaterial({ color: "#dfe3e7", metalness: 1, roughness: 0.16 }));
  const duct = track(new THREE.MeshStandardMaterial({ color: "#1a1e24", roughness: 0.75, metalness: 0.3, side: THREE.DoubleSide }));
  const blade = track(new THREE.MeshStandardMaterial({ color: "#4b525b", metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide }));
  const spinner = track(new THREE.MeshPhysicalMaterial({ map: track(spinnerMap(opts.anisotropy)), metalness: 0.4, roughness: 0.22, clearcoat: 1 }));
  const core = track(new THREE.MeshStandardMaterial({ color: "#7b8087", metalness: 0.75, roughness: 0.42 }));
  const plug = track(new THREE.MeshStandardMaterial({ color: "#8a8f96", metalness: 0.75, roughness: 0.48 }));
  const strut = track(new THREE.MeshStandardMaterial({ color: "#c9ced4", metalness: 0.35, roughness: 0.42 }));
  const chrome = track(new THREE.MeshStandardMaterial({ color: "#e8ecef", metalness: 1, roughness: 0.07 }));
  const rubber = track(new THREE.MeshStandardMaterial({ color: "#151617", roughness: 0.9, metalness: 0 }));
  const hubMat = track(new THREE.MeshStandardMaterial({ color: "#a5acb4", metalness: 0.8, roughness: 0.32 }));
  const antenna = track(new THREE.MeshStandardMaterial({ color: "#e9ecef", roughness: 0.5 }));

  // Fuselage.
  const fuselage = new THREE.Mesh(track(buildFuselage(opts.hi)), paint);
  group.add(fuselage);
  await yieldToMain();

  // Wings, low on the body: root leading edge 12.6 m from the nose.
  const ROOT = new THREE.Vector3(0, -1.45, zOf(12.6));
  const stations = wingStations();
  const wingGeo = { right: track(loft(stations, { side: 1, points: opts.hi ? 30 : 18 })), left: track(loft(stations, { side: -1, points: opts.hi ? 30 : 18 })) };
  const atSpan = (s: number) => {
    // Interpolated main-wing station at span s.
    const main = stations.filter((st) => st.cant < 6 * DEG && st.le.x <= WING_TIP + 1e-6);
    let i = 0;
    while (i < main.length - 2 && main[i + 1]!.le.x < s) i++;
    const a = main[i]!;
    const b = main[i + 1]!;
    const k = (s - a.le.x) / (b.le.x - a.le.x);
    return { ...a, le: a.le.clone().lerp(b.le, k), chord: lerp(a.chord, b.chord, k), t: lerp(a.t, b.t, k), twist: lerp(a.twist ?? 0, b.twist ?? 0, k) } as Station;
  };
  const fairingMat = tailPaint;
  const canoeGeo = track(revolve([[0.001, 0], [0.12, 0.25], [0.2, 0.8], [0.22, 1.6], [0.18, 2.5], [0.09, 3.2], [0.001, 3.5]], 20));
  canoeGeo.scale(0.75, 1, 1);
  for (const side of [1, -1] as const) {
    const wing = new THREE.Mesh(side > 0 ? wingGeo.right : wingGeo.left, wingMats);
    wing.position.copy(ROOT);
    group.add(wing);
    // Flap-track fairings under the trailing edge.
    for (const s of [4.6, 8.7, 12.1]) {
      const st = atSpan(s);
      const p = sectionPoint(st, 0.62, false, side).add(ROOT);
      const canoe = new THREE.Mesh(canoeGeo, fairingMat);
      canoe.scale.setScalar(lerp(0.7, 1, Math.min(1, st.chord / 5)));
      canoe.position.set(p.x, p.y - 0.06, p.z - 0.9);
      canoe.rotation.x = 0.04;
      group.add(canoe);
    }
  }

  // Horizontal stabilisers and the fin.
  const htp: Station[] = [0, 1.5, 3.2, 4.8, 6.25].map((s) => ({
    le: new THREE.Vector3(s, s * Math.tan(6 * DEG), s * Math.tan(33 * DEG)),
    chord: s < 1.5 ? lerp(4.4, 3.8, s / 1.5) : lerp(3.8, 1.35, (s - 1.5) / 4.75),
    t: lerp(0.1, 0.085, s / 6.25),
    cant: 6 * DEG,
    v: s / 6.25,
  }));
  for (const side of [1, -1] as const) {
    const stab = new THREE.Mesh(track(loft(htp, { side, points: opts.hi ? 22 : 14 })), tailPaint);
    stab.position.set(0, 0.5, zOf(30.9));
    group.add(stab);
  }
  const FIN_H = 6.3;
  const finLe = (h: number) => h * Math.tan(39 * DEG);
  const finChord = (h: number) => lerp(6.2, 1.95, h / FIN_H);
  const fin: Station[] = [0, 0.6, 1.6, 2.8, 4.0, 5.2, FIN_H].map((h) => ({
    le: new THREE.Vector3(0, h, finLe(h)),
    chord: finChord(h),
    t: lerp(0.11, 0.09, h / FIN_H),
    cant: Math.PI / 2,
    v: h / FIN_H,
  }));
  const zMax = Math.max(...fin.map((s) => s.le.z + s.chord));
  const span = zMax;
  const finShape = {
    le: (v: number) => finLe(v * FIN_H) / span,
    te: (v: number) => (finLe(v * FIN_H) + finChord(v * FIN_H)) / span,
    rudder: (v: number) => (finLe(v * FIN_H) + 0.69 * finChord(v * FIN_H)) / span,
    emblemAt: [(finLe(3.3) + 0.47 * finChord(3.3)) / span, 3.3 / FIN_H] as [number, number],
    emblemSize: 2.5 / span,
    aspect: FIN_H / span,
  };
  const finLeft = trackMaps(finMaps(livery, false, finShape));
  const finRight = trackMaps(finMaps(livery, true, finShape));
  await yieldToMain();
  const finMat = (maps: typeof finLeft) =>
    // Satin rather than mirror gloss: the big flat fin would otherwise glint white and hide the emblem.
    track(new THREE.MeshPhysicalMaterial({ ...maps, roughness: 1, metalness: 0.05, bumpScale: 0.7, clearcoat: 0.3, clearcoatRoughness: 0.35, envMapIntensity: 0.38, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0 }));
  const finMats = [finMat(finLeft), finMat(finRight), track(new THREE.MeshPhysicalMaterial({ color: PAINT.sky, roughness: 0.3, clearcoat: 1 }))];
  const finMesh = new THREE.Mesh(track(loft(fin, { side: 1, points: opts.hi ? 24 : 16, planarU: true })), finMats);
  finMesh.position.set(0, 1.62, zOf(28.4));
  group.add(finMesh);

  // Engines (span 5.75 m), lip 2.4 m ahead of the wing's leading edge there.
  const engineSpan = 5.75;
  const engineSt = atSpan(engineSpan);
  const engineLe = engineSt.le.clone().add(ROOT);
  const intakeGeo = track(revolve([[0.975, 1.1], [0.985, 0.8], [0.995, 0.5], [1.012, 0.26], [1.034, 0.11], [1.058, 0.035], [1.088, 0.006], [1.118, 0], [1.148, 0.016], [1.172, 0.052]], opts.hi ? 72 : 44));
  const cowlGeo = track(revolve([[1.172, 0.052], [1.196, 0.15], [1.216, 0.35], [1.233, 0.7], [1.24, 1.1], [1.236, 1.6], [1.216, 2.1], [1.176, 2.6], [1.116, 3.05], [1.046, 3.45], [0.996, 3.7]], opts.hi ? 72 : 44));
  const bypassGeo = track(revolve([[0.996, 3.7], [0.99, 3.3], [0.982, 2.2], [0.976, 1.3]], 44));
  const coreGeo = track(revolve([[0.62, 1.45], [0.78, 2.1], [0.835, 2.9], [0.805, 3.6], [0.725, 4.3], [0.605, 4.95]], opts.hi ? 56 : 36));
  const coreExitGeo = track(revolve([[0.605, 4.95], [0.585, 4.6]], 36));
  const plugGeo = track(revolve([[0.46, 4.75], [0.42, 5.05], [0.33, 5.35], [0.19, 5.6], [0.05, 5.78], [0.001, 5.8]], 36));
  const spinnerGeo = track(revolve([[0.001, 0.42], [0.085, 0.5], [0.175, 0.65], [0.255, 0.85], [0.312, 1.05], [0.34, 1.2], [0.34, 1.34]], 40));
  const annulusGeo = track(revolve([[0.34, 1.34], [0.62, 1.48], [0.978, 1.56]], 44));
  const bladeOne = fanBlade();
  const bladeGeo = track(
    mergeGeometries(
      Array.from({ length: 18 }, (_, i) => {
        const g = bladeOne.clone();
        g.translate(0, 0, 1.13);
        g.rotateZ((i / 18) * Math.PI * 2);
        return g;
      }),
    ),
  );
  bladeOne.dispose();
  const pylonStations: Station[] = [
    { le: new THREE.Vector3(0, 0.95, 1.25), chord: 4.3, t: 0.05, cant: Math.PI / 2, v: 0 },
    { le: new THREE.Vector3(0, 1.35, 1.75), chord: 4.4, t: 0.05, cant: Math.PI / 2, v: 0.5 },
    { le: new THREE.Vector3(0, 1.75, 2.1), chord: 4.2, t: 0.05, cant: Math.PI / 2, v: 1 },
  ];
  const pylonGeo = track(loft(pylonStations, { points: 14 }));
  const fans: THREE.Object3D[] = [];
  const engineCentreY = -2.5;
  for (const side of [1, -1] as const) {
    const engine = new THREE.Group();
    engine.add(new THREE.Mesh(intakeGeo, lip), new THREE.Mesh(cowlGeo, cowl), new THREE.Mesh(bypassGeo, duct), new THREE.Mesh(coreGeo, core), new THREE.Mesh(coreExitGeo, duct), new THREE.Mesh(plugGeo, plug));
    const fan = new THREE.Group();
    fan.add(new THREE.Mesh(spinnerGeo, spinner), new THREE.Mesh(bladeGeo, blade));
    engine.add(fan, new THREE.Mesh(annulusGeo, duct));
    fans.push(fan);
    const pylon = new THREE.Mesh(pylonGeo, tailPaint);
    engine.add(pylon);
    engine.position.set(side * engineSpan, engineCentreY, engineLe.z - 2.4);
    engine.rotation.x = -1.2 * DEG;
    group.add(engine);
  }

  await yieldToMain();
  // Landing gear: main legs under the wing roots (track 7.5 m), twin-wheel nose gear; both retract.
  const mainWheel = wheelGeometries(0.585, 0.42);
  const noseWheel = wheelGeometries(0.38, 0.22);
  [mainWheel.tyre, mainWheel.hub, noseWheel.tyre, noseWheel.hub].forEach(track);
  const cyl = (r: number, h: number, segments = 16) => track(new THREE.CylinderGeometry(r, r, h, segments));
  const legs: { node: THREE.Group; axis: "x" | "z"; sign: number }[] = [];
  const mainPivotY = -1.3;
  const axleY = -(GEAR_HEIGHT - 0.585) - mainPivotY;
  const mainZ = zOf(18.2);
  for (const side of [1, -1] as const) {
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(cyl(0.14, 1.5), strut);
    upper.position.y = -0.75;
    const piston = new THREE.Mesh(cyl(0.1, -axleY - 1.4), chrome);
    piston.position.y = (axleY - 1.45) / 2;
    const axle = new THREE.Mesh(cyl(0.08, 1.0, 12), strut);
    axle.rotation.z = Math.PI / 2;
    axle.position.y = axleY;
    const brace = new THREE.Mesh(cyl(0.06, 1.75, 10), strut);
    brace.position.set(-side * 0.62, -0.42, 0.05);
    brace.rotation.z = side * 0.9;
    const link = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 0.55, 0.12)), strut);
    link.position.set(0, axleY + 0.5, -0.17);
    link.rotation.x = 0.35;
    const door = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 1.45, 1.05)), tailPaint);
    door.position.set(side * 0.24, -0.9, 0);
    leg.add(upper, piston, axle, brace, link, door);
    for (const w of [-1, 1]) {
      const tyre = new THREE.Mesh(mainWheel.tyre, rubber);
      const hub = new THREE.Mesh(mainWheel.hub, hubMat);
      tyre.position.set(w * 0.47, axleY, 0);
      hub.position.copy(tyre.position);
      leg.add(tyre, hub);
    }
    leg.position.set(side * 3.75, mainPivotY, mainZ);
    group.add(leg);
    legs.push({ node: leg, axis: "z", sign: -side });
  }
  const nose = new THREE.Group();
  const nUpper = new THREE.Mesh(cyl(0.1, 1.2), strut);
  nUpper.position.y = -0.6;
  const nPiston = new THREE.Mesh(cyl(0.075, 0.7), chrome);
  nPiston.position.y = -1.5;
  const nAxle = new THREE.Mesh(cyl(0.05, 0.56, 10), strut);
  nAxle.rotation.z = Math.PI / 2;
  nAxle.position.y = -1.98;
  const nBrace = new THREE.Mesh(cyl(0.045, 1.3, 8), strut);
  nBrace.position.set(0, -0.45, 0.45);
  nBrace.rotation.x = -0.75;
  nose.add(nUpper, nPiston, nAxle, nBrace);
  for (const w of [-1, 1]) {
    const tyre = new THREE.Mesh(noseWheel.tyre, rubber);
    const hub = new THREE.Mesh(noseWheel.hub, hubMat);
    tyre.position.set(w * 0.27, -1.98, 0);
    hub.position.copy(tyre.position);
    nose.add(tyre, hub);
  }
  const noseZ = zOf(5.0);
  nose.position.set(0, -1.82, noseZ);
  group.add(nose);
  legs.push({ node: nose, axis: "x", sign: 1 });

  // Antennas: VHF blades on the crown and belly, a satcom fairing.
  const blade1: Station[] = [
    { le: new THREE.Vector3(0, 0, 0), chord: 0.42, t: 0.12, cant: Math.PI / 2, v: 0 },
    { le: new THREE.Vector3(0, 0.34, 0.2), chord: 0.2, t: 0.12, cant: Math.PI / 2, v: 1 },
  ];
  const antennaGeo = track(loft(blade1, { points: 8 }));
  for (const [d, up] of [[9.2, true], [21.4, true], [12.6, false], [26.5, false]] as const) {
    const s = section(d);
    const a = new THREE.Mesh(antennaGeo, antenna);
    a.position.set(0, up ? s.top - 0.02 : s.bottom - 0.34 * fairing(d) + 0.02, zOf(d));
    if (!up) a.rotation.z = Math.PI;
    group.add(a);
  }
  const satcom = new THREE.Mesh(track(new THREE.SphereGeometry(1, 24, 12)), antenna);
  satcom.scale.set(0.55, 0.16, 1.5);
  satcom.position.set(0, RH - 0.02, zOf(19.5));
  group.add(satcom);
  // Pitot probes and angle-of-attack vanes by the cockpit.
  const probe = cyl(0.018, 0.22, 6);
  probe.rotateX(Math.PI / 2);
  for (const side of [1, -1]) {
    for (const [d, y] of [[2.9, -0.2], [3.25, -0.55]] as const) {
      const s = section(d);
      const p = new THREE.Mesh(probe, chrome);
      p.position.set(side * s.half * Math.sqrt(1 - ((y - (s.top + s.bottom) / 2) / ((s.top - s.bottom) / 2)) ** 2) + side * 0.06, y, zOf(d) + 0.08);
      group.add(p);
    }
  }

  // Lights: red/green navigation and white strobes at the wingtips, a white tail light, red beacons.
  const tipSt = stations.find((st) => Math.abs(st.le.x - WING_TIP) < 1e-6)!;
  const sprite = (rgb: string, size: number, intensity: number) => {
    const material = track(new THREE.SpriteMaterial({ map: track(glowSprite(rgb)), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    material.color.setScalar(intensity);
    const s = new THREE.Sprite(material);
    s.scale.setScalar(size);
    return s;
  };
  const tipPoint = (side: 1 | -1) => sectionPoint(tipSt, 0.04, true, side).add(ROOT);
  const navGreen = sprite("80,255,150", 0.7, 3);
  navGreen.position.copy(tipPoint(1)).add(new THREE.Vector3(0.05, 0, -0.08));
  const navRed = sprite("255,70,60", 0.7, 3);
  navRed.position.copy(tipPoint(-1)).add(new THREE.Vector3(-0.05, 0, -0.08));
  const tailLight = sprite("255,255,255", 0.8, 2.5);
  tailLight.position.set(0, 0.84, zOf(L) + 0.1);
  const strobes = [sprite("255,255,255", 1.2, 3.2), sprite("255,255,255", 1.2, 3.2), sprite("255,255,255", 0.9, 2.6)];
  strobes[0]!.position.copy(tipPoint(1)).add(new THREE.Vector3(0.1, 0.05, 0.5));
  strobes[1]!.position.copy(tipPoint(-1)).add(new THREE.Vector3(-0.1, 0.05, 0.5));
  strobes[2]!.position.copy(tailLight.position);
  const beacons = [sprite("255,50,40", 1.1, 4), sprite("255,50,40", 1.1, 4)];
  beacons[0]!.position.set(0, RH + 0.12, zOf(17.2));
  beacons[1]!.position.set(0, -RH - 0.42, zOf(15.8));
  // Take-off and taxi lights on the nose gear, landing lights in the wing roots.
  const taxi = sprite("255,244,220", 0.9, 5);
  taxi.position.set(0, -1.1, -0.3);
  nose.add(taxi);
  const landing = [sprite("255,244,220", 1.3, 5), sprite("255,244,220", 1.3, 5)];
  landing[0]!.position.set(3.1, -1.62, zOf(13.4));
  landing[1]!.position.set(-3.1, -1.62, zOf(13.4));
  group.add(navGreen, navRed, tailLight, ...strobes, ...beacons, ...landing);

  if (opts.shadows) {
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }

  const occluders = [
    new THREE.Box3(new THREE.Vector3(-RW, -RH - 0.4, -L / 2), new THREE.Vector3(RW, RH, L / 2)),
    new THREE.Box3(new THREE.Vector3(-WING_TIP - 1, -1.9, ROOT.z), new THREE.Vector3(WING_TIP + 1, 0.6, ROOT.z + 7.2)),
    new THREE.Box3(new THREE.Vector3(-0.4, 1.6, zOf(28.4)), new THREE.Vector3(0.4, 1.6 + FIN_H, zOf(28.4) + zMax)),
  ];

  const anchors = {
    cockpit: new THREE.Vector3(0, 0.95, zOf(3.0)),
    engine: new THREE.Vector3(engineSpan, engineCentreY, engineLe.z - 2.2),
    wing: sectionPoint(atSpan(12.5), 0.5, true, 1).add(ROOT),
    gear: new THREE.Vector3(3.75, -3.2, mainZ),
    tail: new THREE.Vector3(0, 5.6, zOf(28.4) + 3.6),
    cabin: new THREE.Vector3(-RW, 0.55, zOf(19)),
  };

  let lastGear = -1;
  const update = ({ gear, fan, time, dt, cabin }: AircraftState) => {
    if (gear !== lastGear) {
      lastGear = gear;
      const angle = (1 - smooth(0, 1, gear)) * (Math.PI / 2);
      for (const leg of legs) {
        leg.node.visible = gear > 0.02;
        if (leg.axis === "z") leg.node.rotation.z = leg.sign * angle;
        else leg.node.rotation.x = leg.sign * angle;
      }
    }
    fans.forEach((f) => (f.rotation.z += fan * dt));
    const strobe = time % 1.2;
    const on = strobe < 0.05 || (strobe > 0.13 && strobe < 0.17);
    strobes.forEach((s) => (s.visible = on));
    const beacon = (time + 0.4) % 1.1 < 0.14;
    beacons.forEach((s) => (s.visible = beacon));
    paint.emissiveIntensity = cabin * 0.16;
    finMats[0]!.emissiveIntensity = finMats[1]!.emissiveIntensity = cabin * 0.045;
  };

  return {
    group,
    update,
    occluders,
    anchors,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
};
