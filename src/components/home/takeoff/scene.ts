import * as THREE from "three";
import { buildAircraft } from "./aircraft";
import { buildCity } from "./city";
import { fieldTexture, runwayTexture, terminalGlowTexture, terminalTexture } from "./textures";

/**
 * Sunset take-off, third person: the society's aircraft lines up on runway 27 with its lights on,
 * rolls between the edge lights, rotates and climbs out over the city as its lights come on, while the
 * camera chases and then swings round to show the livery. Scroll progress (0–1) drives the flight;
 * the pointer nudges the chase camera.
 */

export type Telemetry = { kt: number; ft: number; mode: string; callout: string | null };

type Options = {
  emblem: HTMLImageElement | null;
  font: string;
  small: boolean;
  reduced: boolean;
  onTelemetry?: (t: Telemetry) => void;
  onFirstFrame?: () => void;
};

const DEG = Math.PI / 180;
const GEAR_HEIGHT = 4.18; // wheel bottoms to the aircraft origin
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The flight, sampled once: position, attitude and speed for every scroll position. */
type Sample = { x: number; y: number; z: number; yaw: number; pitch: number; roll: number; kt: number; gear: number };
const ROLL_END = 0.3;
const LIFTOFF = 0.355;
const buildPath = (): Sample[] => {
  const samples: Sample[] = [];
  const STEPS = 800;
  let x = 0;
  let z = -25;
  let h = 0;
  let yaw = 0;
  let prevD = 0;
  let gamma = 0;
  for (let i = 0; i <= STEPS; i++) {
    const s = i / STEPS;
    const d = s <= ROLL_END ? 1450 * (s / ROLL_END) ** 2 : 1450 + 9667 * (s - ROLL_END);
    const dd = d - prevD;
    prevD = d;
    const pitch = s < ROLL_END ? 0 : s < LIFTOFF ? lerp(0, 9, smooth(ROLL_END, LIFTOFF, s)) : lerp(9, 12.5, smooth(LIFTOFF, 0.52, s)) - 2.5 * smooth(0.7, 1, s);
    const roll = 15 * smooth(0.55, 0.7, s) - 7 * smooth(0.85, 1, s);
    if (s > LIFTOFF) gamma = Math.min(7 * DEG, gamma + dd * 0.00006);
    h += Math.tan(gamma) * dd;
    yaw += Math.tan(roll * DEG) * 0.00035 * dd;
    x += Math.sin(yaw) * dd;
    z -= Math.cos(yaw) * dd;
    const kt = s <= ROLL_END ? 150 * (s / ROLL_END) : lerp(150, 168, smooth(ROLL_END, 0.45, s)) + 22 * smooth(0.45, 1, s);
    samples.push({ x, y: h + GEAR_HEIGHT, z, yaw, pitch: pitch * DEG, roll: roll * DEG, kt, gear: 1 - smooth(0.44, 0.52, s) });
  }
  return samples;
};

const sampleAt = (path: Sample[], s: number): Sample => {
  const f = Math.min(1, Math.max(0, s)) * (path.length - 1);
  const i = Math.floor(f);
  const a = path[i]!;
  const b = path[Math.min(path.length - 1, i + 1)]!;
  const t = f - i;
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    yaw: lerp(a.yaw, b.yaw, t),
    pitch: lerp(a.pitch, b.pitch, t),
    roll: lerp(a.roll, b.roll, t),
    kt: lerp(a.kt, b.kt, t),
    gear: lerp(a.gear, b.gear, t),
  };
};

/** Chase-camera keyframes in the aircraft's heading frame: [s, offset, look-at offset]. */
const CAMERA: [number, THREE.Vector3, THREE.Vector3][] = [
  [0, new THREE.Vector3(-15, 8, 54), new THREE.Vector3(-4, 3.2, -32)],
  [0.28, new THREE.Vector3(-8, 4.6, 34), new THREE.Vector3(-2, 2.6, -30)],
  [0.42, new THREE.Vector3(-10, 3.4, 32), new THREE.Vector3(-1, 2.2, -16)],
  [0.66, new THREE.Vector3(-22, 6, 36), new THREE.Vector3(0, 2, -4)],
  [1, new THREE.Vector3(-34, 5, 30), new THREE.Vector3(0, 1.8, -3)],
];

const CALLOUTS: [number, string][] = [
  [0.17, "80 KNOTS"],
  [0.28, "V1"],
  [0.31, "ROTATE"],
  [0.39, "POSITIVE RATE"],
  [0.45, "GEAR UP"],
];

/** Yield to the browser between heavy build steps, so building the scene never blocks input for long. */
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export const createTakeoffScene = async (canvas: HTMLCanvasElement, opts: Options) => {
  // Logarithmic depth: the scene spans 0.5 m (gear) to 50 km (hills), and the runway lies on the ground.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.small, powerPreference: "high-performance", alpha: false, logarithmicDepthBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.small ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const shadows = !opts.small;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 1, 90000);
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  // Sky at sunset: deep blue overhead, a warm band low towards the sun (ahead and to the left).
  const sun = new THREE.Vector3().setFromSphericalCoords(1, (90 - 2.5) * DEG, -131 * DEG);
  const makeSky = () =>
    new THREE.Mesh(
      new THREE.SphereGeometry(70000, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          zenith: { value: new THREE.Color("#173f88") },
          mid: { value: new THREE.Color("#3f78c6") },
          horizon: { value: new THREE.Color("#93a9d2") },
          glow: { value: new THREE.Color("#ffab6b") },
          sunDir: { value: sun },
        },
        vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; }",
        fragmentShader: `
          uniform vec3 zenith; uniform vec3 mid; uniform vec3 horizon; uniform vec3 glow; uniform vec3 sunDir; varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            float h = clamp(d.y, 0.0, 1.0);
            float toward = pow(max(dot(normalize(d.xz + 1e-5), normalize(sunDir.xz)), 0.0), 3.0);
            vec3 hor = mix(horizon, glow, toward);
            vec3 col = mix(hor, mix(mid, hor, toward * 0.35), smoothstep(0.0, 0.16, h));
            col = mix(col, zenith, smoothstep(0.14, 0.8, h));
            float s = max(dot(d, normalize(sunDir)), 0.0);
            col += vec3(1.0, 0.72, 0.42) * (pow(s, 900.0) * 4.0 + pow(s, 40.0) * 0.35 + pow(s, 6.0) * 0.12 * (1.0 - h));
            if (d.y < 0.0) col = hor * 0.85;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
        toneMapped: false,
      }),
    );
  const skyMesh = makeSky();
  track(skyMesh.geometry);
  track(skyMesh.material);
  scene.add(skyMesh);
  const pmrem = track(new THREE.PMREMGenerator(renderer));
  const envScene = new THREE.Scene();
  envScene.add(makeSky());
  const env = track(pmrem.fromScene(envScene).texture);
  scene.environment = env;
  scene.fog = new THREE.Fog(0x7f93bd, 3500, 38000);

  const hemi = new THREE.HemisphereLight(0xa9c3ee, 0x4a4d58, 1.25);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(0xffb27a, 2.2);
  sunLight.castShadow = shadows;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -30;
  sunLight.shadow.camera.right = 30;
  sunLight.shadow.camera.top = 30;
  sunLight.shadow.camera.bottom = -30;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 800;
  sunLight.shadow.bias = -0.0005;
  sunLight.shadow.normalBias = 0.04;
  scene.add(sunLight, sunLight.target);

  await pause();
  // Ground: farmland, the airfield's mown grass, runway 27, taxiway, apron, terminal, tower, hangars.
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(120000, 120000)), track(new THREE.MeshStandardMaterial({ map: track(fieldTexture(anisotropy)), color: "#8a8c82", roughness: 1 })));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.2, -20000);
  ground.receiveShadow = shadows;
  scene.add(ground);
  const grass = new THREE.Mesh(track(new THREE.PlaneGeometry(900, 5200)), track(new THREE.MeshStandardMaterial({ color: "#6f8152", roughness: 1 })));
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(80, -0.1, -1500);
  grass.receiveShadow = shadows;
  scene.add(grass);
  const runway = new THREE.Mesh(track(new THREE.PlaneGeometry(45, 3300)), track(new THREE.MeshStandardMaterial({ map: track(runwayTexture(anisotropy)), roughness: 0.9 })));
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(0, 0, -1650);
  runway.receiveShadow = shadows;
  scene.add(runway);
  const concrete = track(new THREE.MeshStandardMaterial({ color: "#b7bcc1", roughness: 0.95 }));
  const taxiway = new THREE.Mesh(track(new THREE.PlaneGeometry(23, 3300)), track(new THREE.MeshStandardMaterial({ color: "#5a5e63", roughness: 0.95 })));
  taxiway.rotation.x = -Math.PI / 2;
  taxiway.position.set(190, 0.01, -1650);
  scene.add(taxiway);
  const apron = new THREE.Mesh(track(new THREE.PlaneGeometry(420, 700)), concrete);
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(420, 0.02, -1500);
  scene.add(apron);
  // The terminal's glazing is lit from inside.
  const terminal = new THREE.Mesh(
    track(new THREE.BoxGeometry(70, 24, 520)),
    track(new THREE.MeshStandardMaterial({ map: track(terminalTexture()), emissive: "#ffffff", emissiveMap: track(terminalGlowTexture()), emissiveIntensity: 1.4, roughness: 0.4, metalness: 0.2 })),
  );
  terminal.position.set(660, 12, -1500);
  scene.add(terminal);
  const tower = new THREE.Group();
  const towerShaft = new THREE.Mesh(track(new THREE.CylinderGeometry(3.2, 4.2, 46, 16)), track(new THREE.MeshStandardMaterial({ color: "#e9edf1", roughness: 0.6 })));
  towerShaft.position.y = 23;
  const cab = new THREE.Mesh(track(new THREE.CylinderGeometry(7.5, 6, 6, 16)), track(new THREE.MeshStandardMaterial({ color: "#2f5f8c", emissive: "#8fd0ff", emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.6 })));
  cab.position.y = 49;
  tower.add(towerShaft, cab);
  tower.position.set(330, 0, -880);
  scene.add(tower);
  const hangarMat = track(new THREE.MeshStandardMaterial({ color: "#dfe3e8", roughness: 0.55, metalness: 0.3 }));
  const hangarGeo = track(new THREE.CylinderGeometry(28, 28, 70, 24, 1, false, 0, Math.PI));
  for (let k = 0; k < 3; k++) {
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.rotation.z = Math.PI / 2;
    hangar.rotation.y = Math.PI / 2;
    hangar.position.set(-230, 0, -300 - k * 90);
    scene.add(hangar);
  }

  await pause();
  // The city at dusk: lit blocks, street lights, traffic, a high-rise district; low Deccan hills beyond.
  const rnd = (() => {
    let seed = 1994;
    return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  })();
  const city = buildCity({ small: opts.small, rnd });
  disposables.push(city);
  scene.add(city.group);
  const hillMat = track(new THREE.MeshStandardMaterial({ color: "#3f4656", roughness: 1 }));
  const hillGeo = track(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  for (let k = 0; k < 14; k++) {
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.scale.set(2500 + rnd() * 4000, 250 + rnd() * 500, 2500 + rnd() * 3000);
    hill.position.set((rnd() - 0.5) * 60000, 0, -30000 - rnd() * 22000);
    scene.add(hill);
  }

  await pause();
  // The aircraft.
  const aircraft = buildAircraft({ emblem: opts.emblem, font: opts.font, anisotropy, shadows });
  scene.add(aircraft.group);
  // Landing lights: a beam ahead of the nose that lights the runway on the roll.
  const landing = new THREE.SpotLight(0xfff4e0, 70000, 700, 14 * DEG, 0.6, 1.6);
  landing.position.set(0, -1.2, -12);
  landing.target.position.set(0, -60, -400);
  aircraft.group.add(landing, landing.target);
  const path = buildPath();

  // State.
  let width = 1;
  let height = 1;
  let target = 0;
  let progress = 0;
  const pointer = { x: 0, y: 0 };
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  let camReady = false;
  let lastCallout = -1;
  let calloutText: string | null = null;
  let calloutUntil = 0;
  let firstFrame = true;
  let last = performance.now();
  let lastTelemetry = "";

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width / height < 1 ? 52 : 38;
    camera.updateProjectionMatrix();
  };
  resize();

  const offset = new THREE.Vector3();
  const look = new THREE.Vector3();
  const cameraFrame = (s: number) => {
    let i = 0;
    while (i < CAMERA.length - 2 && s > CAMERA[i + 1]![0]) i++;
    const [s0, o0, l0] = CAMERA[i]!;
    const [s1, o1, l1] = CAMERA[i + 1]!;
    const t = smooth(s0, s1, s);
    offset.copy(o0).lerp(o1, t);
    look.copy(l0).lerp(l1, t);
  };

  const render = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    progress += (target - progress) * (opts.reduced ? 1 : 1 - Math.exp(-dt * 4.5));
    const s = progress;
    const state = sampleAt(path, s);

    const g = aircraft.group;
    g.position.set(state.x, state.y, state.z);
    g.rotation.set(state.pitch, -state.yaw, -state.roll, "YXZ");
    aircraft.gear.scale.setScalar(Math.max(0.001, state.gear));
    aircraft.gear.position.y = (1 - state.gear) * 1.2;
    const spin = 8 + state.kt * 0.25;
    aircraft.fans.forEach((fan) => (fan.rotation.z += spin * dt));
    const strobe = t % 1.2;
    aircraft.strobes.forEach((sp) => (sp.visible = strobe < 0.05 || (strobe > 0.12 && strobe < 0.16)));
    const beacon = t % 1.0 < 0.12;
    aircraft.beacons.forEach((sp) => (sp.visible = beacon));

    // Chase camera in the heading frame, nudged by the pointer, with runway rumble on the roll.
    cameraFrame(s);
    const yaw = -state.yaw + pointer.x * 0.16;
    offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw);
    offset.y += pointer.y * -2.2;
    look.applyAxisAngle(THREE.Object3D.DEFAULT_UP, -state.yaw);
    const desired = new THREE.Vector3(state.x, state.y, state.z).add(offset);
    if (!opts.reduced) {
      const idle = s < 0.01 ? 1 : 0;
      desired.x += Math.sin(t * 0.37) * 0.8 * idle;
      desired.y += Math.sin(t * 0.29) * 0.4 * idle;
      const rumble = s < LIFTOFF ? (state.kt / 150) * 0.05 : 0;
      desired.y += Math.sin(t * 61) * rumble;
      desired.x += Math.sin(t * 47) * rumble;
    }
    const lookAt = new THREE.Vector3(state.x, state.y, state.z).add(look);
    const k = camReady ? 1 - Math.exp(-dt * 5) : 1;
    camPos.lerp(desired, k);
    camLook.lerp(lookAt, k);
    camReady = true;
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    skyMesh.position.copy(camera.position);
    sunLight.position.set(state.x, state.y, state.z).addScaledVector(sun, 400);
    sunLight.target.position.set(state.x, state.y, state.z);

    city.update(t, height, camera.fov, renderer.getPixelRatio());
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      opts.onFirstFrame?.();
    }

    // Telemetry for the overlay: indicated airspeed, radio altitude, flight mode, callouts.
    const passed = CALLOUTS.findIndex(([at]) => s < at);
    const index = (passed === -1 ? CALLOUTS.length : passed) - 1;
    if (index > lastCallout && index >= 0) {
      calloutText = CALLOUTS[index]![1];
      calloutUntil = t + 1.4;
    }
    lastCallout = index;
    const ft = Math.max(0, Math.round((state.y - GEAR_HEIGHT) * 3.281));
    const mode = s < LIFTOFF ? "TOGA" : s < 0.6 ? "SRS" : "CLB";
    const telemetry: Telemetry = { kt: Math.round(state.kt), ft, mode, callout: t < calloutUntil ? calloutText : null };
    const key = `${telemetry.kt}|${telemetry.ft}|${telemetry.mode}|${telemetry.callout}`;
    if (key !== lastTelemetry) {
      lastTelemetry = key;
      opts.onTelemetry?.(telemetry);
    }
  };

  return {
    setProgress: (p: number) => {
      target = Math.min(1, Math.max(0, p));
    },
    setPointer: (x: number, y: number) => {
      pointer.x = x;
      pointer.y = y;
    },
    resize,
    render,
    dispose: () => {
      aircraft.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
};

export type TakeoffScene = Awaited<ReturnType<typeof createTakeoffScene>>;
