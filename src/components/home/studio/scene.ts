import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { SystemId } from "@/content/anatomy";
import { GEAR_HEIGHT, buildAircraft } from "../takeoff/aircraft";
import { uploadTextures, warmUp, yieldToMain } from "../takeoff/geometry";

/**
 * The anatomy studio: the society's aircraft on a turntable under softbox light, with a soft floor
 * shadow on a transparent canvas (the page's sky field shows through). Drag to turn it; focusing a
 * system flies the camera to it. Hotspot screen positions are reported every frame for the HTML layer.
 */

type Options = {
  emblem: HTMLImageElement | null;
  font: string;
  small: boolean;
  reduced: boolean;
  onFirstFrame?: () => void;
  onFrame?: (points: Record<SystemId, { x: number; y: number; visible: boolean }>) => void;
};

const DEG = Math.PI / 180;

/** Camera views: orbit target, yaw (0 = behind the tail, −90° = left side), pitch, distance. */
type View = { target: THREE.Vector3; yaw: number; pitch: number; dist: number };
const OVERVIEW: View = { target: new THREE.Vector3(0, -0.2, 0.6), yaw: -138 * DEG, pitch: 12 * DEG, dist: 66 };
const VIEWS: Record<SystemId, View> = {
  cockpit: { target: new THREE.Vector3(0, 0.6, -15.2), yaw: -146 * DEG, pitch: 9 * DEG, dist: 17 },
  engine: { target: new THREE.Vector3(-5.75, -2.4, -8.6), yaw: -128 * DEG, pitch: 5 * DEG, dist: 15 },
  wing: { target: new THREE.Vector3(-10.5, -0.6, -1.5), yaw: -62 * DEG, pitch: 40 * DEG, dist: 30 },
  gear: { target: new THREE.Vector3(-3.6, -2.9, -0.5), yaw: -56 * DEG, pitch: 4 * DEG, dist: 13 },
  tail: { target: new THREE.Vector3(0, 4.2, 14.2), yaw: -58 * DEG, pitch: 9 * DEG, dist: 27 },
  cabin: { target: new THREE.Vector3(-1.6, 0.2, 0.5), yaw: -96 * DEG, pitch: 5 * DEG, dist: 30 },
};

/** Which way each hotspot faces (left-side version), for hiding the ones turned away from the camera. */
const FACING: Record<SystemId, THREE.Vector3> = {
  cockpit: new THREE.Vector3(-0.4, 0.5, -1).normalize(),
  engine: new THREE.Vector3(-1, 0, -0.7).normalize(),
  wing: new THREE.Vector3(-0.2, 1, 0).normalize(),
  gear: new THREE.Vector3(-1, -0.4, 0).normalize(),
  tail: new THREE.Vector3(-1, 0.2, 0).normalize(),
  cabin: new THREE.Vector3(-1, 0.1, 0).normalize(),
};

export const createStudio = async (canvas: HTMLCanvasElement, opts: Options) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  // Resolution is a pixel budget, chosen once: about 1.2 million drawn pixels on desktop whatever the
  // screen's density, so a retina laptop does not draw four times the work of a plain one. Changing it
  // later reallocates every buffer (a visible stall), so the safety net below steps down at most once.
  const maxRatio = Math.min(window.devicePixelRatio || 1, opts.small ? 1.25 : 1.5);
  const budget = opts.small ? 0.9e6 : 1.2e6;
  const initial = canvas.getBoundingClientRect();
  const fit = (w: number, h: number) => Math.max(0.6, Math.min(maxRatio, Math.sqrt(budget / Math.max(1, w * h))));
  let ratio = fit(initial.width, initial.height);
  const minRatio = Math.max(0.6, ratio * 0.75);
  renderer.setPixelRatio(ratio);
  // Size the drawing buffer first, while the GPU is idle: resizing later waits for all queued work.
  renderer.setSize(Math.max(1, initial.width), Math.max(1, initial.height), false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Shader error checks are synchronous round trips to the GPU process (a second or more of blocking on
  // Windows/Direct3D at first use); development keeps them.
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // Only the camera moves in the studio, so the floor shadow is drawn once (and again when the gear moves).
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.setClearColor(0x000000, 0);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.5, 2000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.03).texture;
  room.traverse((o) => o instanceof THREE.Mesh && (o.geometry.dispose(), (o.material as THREE.Material).dispose()));
  scene.environment = env;
  scene.environmentIntensity = 0.9;

  const hemi = new THREE.HemisphereLight(0xcfe6ff, 0xffffff, 0.6);
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-30, 50, -24);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 160 });
  key.shadow.radius = 8;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  const rim = new THREE.DirectionalLight(0xcfe6ff, 1.4);
  rim.position.set(40, 18, 40);
  scene.add(hemi, key, rim);

  await yieldToMain();
  const aircraft = await buildAircraft({ emblem: opts.emblem, font: opts.font, anisotropy, hi: !opts.small, shadows: true });
  scene.add(aircraft.group);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ color: 0x06305f, opacity: 0.22 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -GEAR_HEIGHT;
  floor.receiveShadow = true;
  scene.add(floor);

  // Hotspot anchors on the left side (the side the studio shows first); mirrored to whichever side faces the camera.
  const anchors: Record<SystemId, THREE.Vector3> = {
    cockpit: aircraft.anchors.cockpit.clone(),
    engine: aircraft.anchors.engine.clone().setX(-Math.abs(aircraft.anchors.engine.x)),
    wing: aircraft.anchors.wing.clone().setX(-Math.abs(aircraft.anchors.wing.x)),
    gear: aircraft.anchors.gear.clone().setX(-Math.abs(aircraft.anchors.gear.x)),
    tail: aircraft.anchors.tail.clone(),
    cabin: aircraft.anchors.cabin.clone().setX(-Math.abs(aircraft.anchors.cabin.x)),
  };

  // Compile and upload before the first frame, without one long freeze.
  camera.position.set(-50, 12, -45);
  camera.lookAt(0, 0, 0);
  await renderer.compileAsync(scene, camera);
  await uploadTextures(renderer, scene);
  // The studio draws straight to its canvas (still transparent at this point).
  warmUp(renderer, scene, camera, null);
  renderer.shadowMap.needsUpdate = true;
  await yieldToMain();

  let width = 1;
  let height = 1;
  const view = { target: OVERVIEW.target.clone(), yaw: OVERVIEW.yaw, pitch: OVERVIEW.pitch, dist: OVERVIEW.dist };
  const goal = { target: OVERVIEW.target.clone(), yaw: OVERVIEW.yaw, pitch: OVERVIEW.pitch, dist: OVERVIEW.dist };
  let focused: SystemId | null = null;
  let idleSince = 0;
  let last = -1;
  let first = true;
  let gear = 1;

  // Only reallocate the drawing buffer when the size or pixel ratio really changed (see take-off scene).
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    const pr = renderer.getPixelRatio();
    if (canvas.width !== Math.floor(width * pr) || canvas.height !== Math.floor(height * pr)) renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Narrow screens: a wider lens, and the picture lifted above the system card.
    camera.fov = camera.aspect < 1 ? 26 / Math.max(0.5, camera.aspect) : 26;
    if (camera.aspect < 1) camera.setViewOffset(width, height, 0, height * 0.17, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();

  const tmp = new THREE.Vector3();
  const facing = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  const points = {} as Record<SystemId, { x: number; y: number; visible: boolean }>;

  // Safety net: one step down after a warm-up and three slow seconds in a row.
  let frameMs = 16.7;
  let sampled = -1;
  let slow = 0;
  let steps = 0;
  const adapt = (ms: number, now: number) => {
    // A frame over 400 ms is a tab switch or a pause, not the GPU; slow frames count, capped.
    if (steps >= 1 || ms > 400) return;
    if (sampled < 0) sampled = now + 3000;
    frameMs += (Math.min(ms, 120) - frameMs) * 0.08;
    if (now - sampled < 1000) return;
    sampled = now;
    slow = frameMs > 24 ? slow + 1 : 0;
    if (slow >= 3 && ratio > minRatio) {
      slow = 0;
      steps++;
      ratio = minRatio;
      renderer.setPixelRatio(ratio);
      resize();
    }
  };

  const render = (now: number) => {
    if (last < 0) last = now;
    adapt(now - last, now);
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    const t = now / 1000;
    // Turntable when nobody is steering.
    if (!focused && !opts.reduced && t - idleSince > 3) goal.yaw += dt * 0.11;
    const k = opts.reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    view.target.lerp(goal.target, k);
    view.yaw += (goal.yaw - view.yaw) * k;
    view.pitch += (goal.pitch - view.pitch) * k;
    view.dist += (goal.dist - view.dist) * k;
    const reach = camera.aspect < 1 ? 1.35 : 1;
    camera.position.set(Math.sin(view.yaw) * Math.cos(view.pitch), Math.sin(view.pitch), Math.cos(view.yaw) * Math.cos(view.pitch)).multiplyScalar(view.dist * reach).add(view.target);
    camera.position.y = Math.max(camera.position.y, -GEAR_HEIGHT + 0.6);
    camera.lookAt(view.target);

    aircraft.update({ gear, fan: focused === "engine" ? 6 : 1.6, time: t, dt, cabin: 0 });
    renderer.render(scene, camera);
    if (first) {
      first = false;
      opts.onFirstFrame?.();
    }

    if (opts.onFrame) {
      const side = camera.position.x > 0 ? 1 : -1;
      for (const id of Object.keys(anchors) as SystemId[]) {
        const a = anchors[id];
        const mirrored = id === "cockpit" || id === "tail" ? a : tmp.copy(a).setX(Math.abs(a.x) * side);
        const world = tmp.copy(mirrored);
        facing.copy(FACING[id]);
        if (id !== "cockpit" && id !== "tail") facing.x = Math.abs(facing.x) * side;
        toCamera.copy(camera.position).sub(world).normalize();
        const visible = facing.dot(toCamera) > -0.05;
        world.project(camera);
        points[id] = { x: (world.x * 0.5 + 0.5) * width, y: (-world.y * 0.5 + 0.5) * height, visible: visible && world.z < 1 };
      }
      opts.onFrame(points);
    }
  };

  return {
    resize,
    render,
    focus: (id: SystemId | null) => {
      focused = id;
      const v = id ? VIEWS[id] : OVERVIEW;
      // Approach the nearest way round.
      let yaw = v.yaw;
      while (yaw - view.yaw > Math.PI) yaw -= Math.PI * 2;
      while (yaw - view.yaw < -Math.PI) yaw += Math.PI * 2;
      goal.yaw = yaw;
      goal.pitch = v.pitch;
      goal.dist = v.dist;
      goal.target.copy(v.target);
      idleSince = performance.now() / 1000;
    },
    drag: (dx: number, dy: number) => {
      goal.yaw -= dx * 0.0065;
      goal.pitch = Math.min(55 * DEG, Math.max(-4 * DEG, goal.pitch + dy * 0.004));
      idleSince = performance.now() / 1000;
    },
    setGear: (g: number) => {
      gear = g;
      renderer.shadowMap.needsUpdate = true;
    },
    dispose: () => {
      aircraft.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
};

export type Studio = Awaited<ReturnType<typeof createStudio>>;
