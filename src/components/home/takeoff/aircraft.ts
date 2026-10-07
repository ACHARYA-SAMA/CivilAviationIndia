import * as THREE from "three";
import { emblemDecal, fuselageTexture, glowTexture, nacelleTexture } from "./textures";

/**
 * A twin-jet airliner (A320-class proportions, metres) built from primitives, in the institute's
 * livery: white body, sky-blue belly and fin, the emblem on the fin, both wings and the engines,
 * "CIVIL AVIATION INDIA" titles. Nose points to −Z, up is +Y, right wing is +X.
 */

export type Aircraft = {
  group: THREE.Group;
  gear: THREE.Group;
  fans: THREE.Object3D[];
  strobes: THREE.Sprite[];
  beacons: THREE.Sprite[];
  dispose: () => void;
};

const LENGTH = 37.2;
const RADIUS = 1.98;
const TAIL = -LENGTH / 2; // local length coordinate of the tail (before rotation)

const fuselageRadius = (y: number) => {
  const nose = LENGTH / 2;
  if (y > 12.4) {
    const t = (y - 12.4) / (nose - 12.4);
    return RADIUS * Math.sqrt(Math.max(0, 1 - t * t)) * (1 - 0.12 * t);
  }
  if (y < -8.6) {
    const t = (-8.6 - y) / (-8.6 - TAIL);
    return RADIUS * (1 - Math.pow(t, 1.7) * 0.93);
  }
  return RADIUS;
};

/** Planform polygon -> thin extruded lifting surface lying in the XZ plane (chord along +Z). */
const surface = (points: [number, number][], thickness: number, bevel: number) => {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 4 });
  geo.rotateX(Math.PI / 2); // shape y -> +z (aft), extrusion -> −y
  geo.translate(0, thickness / 2, 0);
  geo.computeVertexNormals();
  return geo;
};

const decal = (texture: THREE.Texture, size: number) =>
  new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.35, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: -4 }),
  );

export const buildAircraft = (opts: { emblem: HTMLImageElement | null; font: string; anisotropy: number; shadows: boolean }): Aircraft => {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const paint = track(
    new THREE.MeshPhysicalMaterial({
      map: track(fuselageTexture({ emblem: opts.emblem, font: opts.font }, opts.anisotropy, LENGTH, RADIUS)),
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
    }),
  );
  const wingPaint = track(new THREE.MeshStandardMaterial({ color: "#dfe4ea", roughness: 0.42, metalness: 0.32 }));
  const brand = track(new THREE.MeshPhysicalMaterial({ color: "#1a86e3", roughness: 0.3, metalness: 0.08, clearcoat: 0.7, clearcoatRoughness: 0.2 }));
  const dark = track(new THREE.MeshStandardMaterial({ color: "#1d232b", roughness: 0.6, metalness: 0.4 }));
  const rubber = track(new THREE.MeshStandardMaterial({ color: "#16181b", roughness: 0.9 }));
  const metal = track(new THREE.MeshStandardMaterial({ color: "#aab2bc", roughness: 0.35, metalness: 0.8 }));

  // Fuselage: a lathe of the radius profile sampled evenly along the length (so the livery maps 1:1),
  // turned to lie along Z, with the tail cone swept upward.
  const N = 160;
  const profile: THREE.Vector2[] = [new THREE.Vector2(0.001, TAIL)];
  for (let i = 0; i <= N; i++) {
    const y = TAIL + (LENGTH * i) / N;
    profile.push(new THREE.Vector2(Math.max(0.001, fuselageRadius(y)), y));
  }
  const fuselageGeo = track(new THREE.LatheGeometry(profile, 64));
  fuselageGeo.rotateX(-Math.PI / 2); // length -> −z at the nose
  const pos = fuselageGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    if (z > 8.6) pos.setY(i, pos.getY(i) + Math.pow((z - 8.6) / (LENGTH / 2 - 8.6), 1.6) * 1.15);
  }
  fuselageGeo.computeVertexNormals();
  const fuselage = new THREE.Mesh(fuselageGeo, paint);
  group.add(fuselage);

  // Wings: swept, with dihedral, low on the body. Root leading edge 3 m ahead of mid-fuselage.
  const wingPoints: [number, number][] = [
    [0, 0],
    [16.6, 7.6],
    [16.6, 9.2],
    [5.4, 7.0],
    [0, 6.6],
  ];
  const rightWingGeo = track(surface(wingPoints, 0.42, 0.1));
  const leftWingGeo = track(surface(wingPoints.map(([x, y]) => [-x, y] as [number, number]), 0.42, 0.1));
  const wingEmblem = track(emblemDecal(opts.emblem));
  for (const [geo, side] of [[rightWingGeo, 1], [leftWingGeo, -1]] as const) {
    const wing = new THREE.Group();
    const mesh = new THREE.Mesh(geo, wingPaint);
    wing.add(mesh);
    // Emblem on the upper surface, two-thirds out.
    const mark = decal(wingEmblem, 2.2);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(side * 11.2, 0.33, 6.6);
    wing.add(mark);
    // Sharklet at the tip, in the brand blue.
    const sharklet = new THREE.Mesh(
      track(surface([[0, 0], [1.3, 0], [1.9, 2.3], [1.4, 2.4]], 0.16, 0.04)),
      brand,
    );
    // Vertical, canted slightly outboard.
    sharklet.rotation.z = side > 0 ? Math.PI / 2 - 0.12 : Math.PI / 2 + 0.12;
    sharklet.position.set(side * 16.6, 0.1, 7.7);
    wing.add(sharklet);
    wing.position.set(side * 1.3, -1.05, -3.2);
    wing.rotation.z = side * THREE.MathUtils.degToRad(5);
    group.add(wing);
  }

  // Horizontal stabilisers.
  const stabPoints: [number, number][] = [
    [0, 0],
    [6.1, 3.2],
    [6.1, 4.5],
    [0, 3.9],
  ];
  for (const side of [1, -1]) {
    const geo = track(surface(stabPoints.map(([x, y]) => [side * x, y] as [number, number]), 0.22, 0.05));
    const stab = new THREE.Mesh(geo, wingPaint);
    stab.position.set(side * 0.5, 0.6, 13.6);
    stab.rotation.z = side * THREE.MathUtils.degToRad(6);
    group.add(stab);
  }

  // Fin in the brand blue with the emblem on both sides.
  // The root runs 0.8 m into the tail cone so the fin sits on the curved body.
  const finShape = new THREE.Shape([new THREE.Vector2(0, -0.8), new THREE.Vector2(6.0, -0.8), new THREE.Vector2(6.7, 6.3), new THREE.Vector2(4.5, 6.4)]);
  const finGeo = track(new THREE.ExtrudeGeometry(finShape, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3 }));
  finGeo.rotateY(-Math.PI / 2);
  finGeo.translate(0.17, 0, 0);
  const fin = new THREE.Mesh(finGeo, brand);
  fin.position.set(0, 2.0, 10.4);
  group.add(fin);
  const finEmblem = track(emblemDecal(opts.emblem));
  for (const side of [1, -1]) {
    // Logo lights in the stabilisers keep the emblem lit after sunset.
    const mark = decal(finEmblem, 2.9);
    const lit = mark.material as THREE.MeshStandardMaterial;
    lit.emissive.set("#ffffff");
    lit.emissiveMap = finEmblem;
    lit.emissiveIntensity = 0.45;
    mark.rotation.y = side * (Math.PI / 2);
    mark.position.set(side * 0.27, 5.3, 14.9);
    group.add(mark);
  }

  // Engines under each wing: cowling with the ASSI band, dark intake, spinning fan and spinner.
  // Open at both ends: the intake lip curls in, the exhaust narrows.
  const nacelleProfile = [
    [0.8, 2.1],
    [0.9, 2.38],
    [1.02, 2.2],
    [1.08, 1.4],
    [1.06, 0],
    [0.96, -1.3],
    [0.72, -2.1],
    [0.6, -2.3],
  ].map(([r, y]) => new THREE.Vector2(r!, y!));
  const nacelleGeo = track(new THREE.LatheGeometry(nacelleProfile, 40));
  nacelleGeo.rotateX(-Math.PI / 2);
  const cowl = track(new THREE.MeshPhysicalMaterial({ map: track(nacelleTexture(opts.font)), roughness: 0.3, metalness: 0.1, clearcoat: 0.6, side: THREE.DoubleSide }));
  const fans: THREE.Object3D[] = [];
  for (const side of [1, -1]) {
    const engine = new THREE.Group();
    engine.add(new THREE.Mesh(nacelleGeo, cowl));
    const intake = new THREE.Mesh(track(new THREE.CircleGeometry(0.86, 32)), dark);
    intake.position.z = -2.0;
    intake.rotation.y = Math.PI;
    engine.add(intake);
    const fan = new THREE.Group();
    const spinner = new THREE.Mesh(track(new THREE.ConeGeometry(0.3, 0.6, 24)), metal);
    spinner.rotation.x = -Math.PI / 2;
    spinner.position.z = -2.25;
    fan.add(spinner);
    // A painted swirl on the spinner, so the rotation reads.
    const swirl = new THREE.Mesh(track(new THREE.BoxGeometry(0.04, 0.42, 0.04)), track(new THREE.MeshBasicMaterial({ color: "#ffffff" })));
    swirl.position.set(0, 0.12, -2.35);
    swirl.rotation.x = 0.5;
    fan.add(swirl);
    engine.add(fan);
    fans.push(fan);
    const pylon = new THREE.Mesh(track(new THREE.BoxGeometry(0.32, 1.1, 3.2)), wingPaint);
    pylon.position.set(0, 0.95, 0.4);
    engine.add(pylon);
    engine.position.set(side * 5.9, -2.2, -2.2);
    group.add(engine);
  }

  // Landing gear (retracts after lift-off).
  const gear = new THREE.Group();
  const wheel = track(new THREE.CylinderGeometry(0.58, 0.58, 0.36, 24));
  wheel.rotateZ(Math.PI / 2);
  const strut = track(new THREE.CylinderGeometry(0.11, 0.11, 2.1, 10));
  const addLeg = (x: number, z: number, length: number, wheels: number) => {
    const leg = new THREE.Group();
    const s = new THREE.Mesh(strut, metal);
    s.scale.y = length / 2.1;
    s.position.y = -length / 2;
    leg.add(s);
    for (let k = 0; k < wheels; k++) {
      const w = new THREE.Mesh(wheel, rubber);
      w.position.set((k - (wheels - 1) / 2) * 0.48, -length, 0);
      leg.add(w);
    }
    leg.position.set(x, -1.4, z);
    gear.add(leg);
  };
  addLeg(2.6, 1.6, 2.2, 2);
  addLeg(-2.6, 1.6, 2.2, 2);
  addLeg(0, -12.6, 2.3, 2);
  group.add(gear);

  // Lights: red/green navigation, white strobes at the tips, red beacons above and below.
  const red = track(glowTexture("255,60,50"));
  const green = track(glowTexture("70,255,140"));
  const white = track(glowTexture("255,255,255"));
  const sprite = (tex: THREE.Texture, size: number) => {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
    s.scale.setScalar(size);
    return s;
  };
  const navRed = sprite(red, 1.4);
  navRed.position.set(-17.9, 0.4, 4.4);
  const navGreen = sprite(green, 1.4);
  navGreen.position.set(17.9, 0.4, 4.4);
  group.add(navRed, navGreen);
  const strobes = [sprite(white, 3.4), sprite(white, 3.4)];
  strobes[0]!.position.set(-18, 0.5, 4.9);
  strobes[1]!.position.set(18, 0.5, 4.9);
  group.add(...strobes);
  const beacons = [sprite(red, 2), sprite(red, 2)];
  beacons[0]!.position.set(0, 2.15, -1);
  beacons[1]!.position.set(0, -2.05, -1);
  group.add(...beacons);

  if (opts.shadows) group.traverse((o) => o instanceof THREE.Mesh && (o.castShadow = true));

  return {
    group,
    gear,
    fans,
    strobes,
    beacons,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
};
