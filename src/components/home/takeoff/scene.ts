import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GEAR_HEIGHT, buildAircraft } from "./aircraft";
import { buildCity } from "./city";
import { compileFor, compileMaterials, uploadTextures, warmUp, yieldToMain } from "./geometry";
import { RUNWAY, asphaltDetail, grassTexture, runwayMaps, taxiwayTexture } from "./ground";
import { fieldTexture, terminalGlowTexture, terminalTexture } from "./textures";

/**
 * Sunset take-off, third person: the society's aircraft lines up on runway 27 with its lights on,
 * rolls between the edge lights, rotates and climbs out over the city, while the camera chases and
 * then swings round to show the livery. Scroll progress (0–1) drives the flight; the pointer nudges
 * the chase camera.
 *
 * Rendering: an HDR sunset sky (deep blue zenith, amber horizon belt, sun glow) that also lights and
 * reflects in the paint through a prefiltered environment map; aerial-perspective haze that matches the
 * horizon and warms towards the sun, so distant ground melts into the sky; HDR render with
 * multisampling, bloom on the lights, filmic tone mapping, then a lens pass (sun flare and ghosts,
 * slight chromatic aberration, vignette, film grain).
 */

export type Telemetry = { kt: number; ft: number; mode: string; callout: string | null };

type Options = {
  emblem: HTMLImageElement | null;
  font: string;
  small: boolean;
  reduced: boolean;
  onTelemetry?: (t: Telemetry) => void;
  onFirstFrame?: () => void;
  onProgress?: (fraction: number) => void;
  palette?: PaletteName;
  /** A fixed frame instead of the scroll-driven flight (used to render stills of the aircraft). */
  still?: Still;
};

type Still = {
  plane: { x: number; y: number; z: number; pitch: number; yaw: number; roll: number; gear: number };
  camera: [number, number, number];
  look: [number, number, number];
  focal: number;
  /** Lens flare from the left landing light instead of the sun. */
  flare?: boolean;
};

const DEG = Math.PI / 180;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Light and sky. "sunset" is the take-off: the low sun 3.6° up, ahead and to the left of runway 27.
 * "bluehour" is the arrival: the sun 5° below the horizon, a fading glow in the west, the city lit.
 * Horizon colours are linear HDR, away from and towards the sun; the haze uses the same pair.
 */
export type Palette = {
  sun: THREE.Vector3;
  horizonAway: THREE.Color;
  horizonSun: THREE.Color;
  upperAway: THREE.Color;
  upperSun: THREE.Color;
  zenith: THREE.Color;
  sunLight: number;
  hemi: number;
  exposure: number;
  haze: number;
};
const PALETTES = {
  sunset: {
    sun: new THREE.Vector3().setFromSphericalCoords(1, (90 - 3.6) * DEG, -140 * DEG),
    horizonAway: new THREE.Color(0.42, 0.33, 0.37),
    horizonSun: new THREE.Color(1.75, 0.78, 0.32),
    upperAway: new THREE.Color(0.06, 0.13, 0.36),
    upperSun: new THREE.Color(0.14, 0.19, 0.38),
    zenith: new THREE.Color(0.022, 0.05, 0.15),
    sunLight: 3.1,
    hemi: 0.25,
    exposure: 1,
    haze: 0.000062,
  },
  bluehour: {
    sun: new THREE.Vector3().setFromSphericalCoords(1, (90 + 5) * DEG, -140 * DEG),
    horizonAway: new THREE.Color(0.075, 0.095, 0.2),
    horizonSun: new THREE.Color(0.62, 0.3, 0.16),
    upperAway: new THREE.Color(0.018, 0.04, 0.13),
    upperSun: new THREE.Color(0.05, 0.07, 0.17),
    zenith: new THREE.Color(0.005, 0.012, 0.045),
    sunLight: 0,
    hemi: 0.55,
    exposure: 1.5,
    haze: 0.00005,
  },
} satisfies Record<string, Palette>;
export type PaletteName = keyof typeof PALETTES;

const v3 = (c: THREE.Color | THREE.Vector3) => ("isColor" in c ? `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})` : `vec3(${c.x.toFixed(4)}, ${c.y.toFixed(4)}, ${c.z.toFixed(4)})`);
const hazeColours = (p: Palette) => ({ away: p.horizonAway.clone().multiplyScalar(0.62), sun: p.horizonSun.clone().multiplyScalar(0.62) });
/** How far round towards the sun a direction looks (0 = away, 1 = into the sun), shared by sky and haze. */
const towardsGlsl = (p: Palette) => `float towardsSun(vec3 d) { vec2 a = normalize(d.xz + 1e-5); vec2 b = normalize(${v3(p.sun)}.xz); return pow(clamp(dot(a, b) * 0.5 + 0.5, 0.0, 1.0), 2.4); }`;

const skyFragment = (p: Palette) => /* glsl */ `
  varying vec3 vDir;
  ${towardsGlsl(p)}
  void main() {
    vec3 d = normalize(vDir);
    vec3 sun = ${v3(p.sun)};
    float h = d.y;
    float hp = max(h, 0.0);
    float tw = towardsSun(d);
    float cosSun = max(dot(d, sun), 0.0);
    vec3 horizon = mix(${v3(p.horizonAway)}, ${v3(p.horizonSun)}, tw);
    vec3 upper = mix(${v3(p.upperAway)}, ${v3(p.upperSun)}, tw * 0.6);
    vec3 zenith = ${v3(p.zenith)};
    // Horizon belt: tight and hot towards the sun, softer and rose away from it.
    float belt = exp(-hp * mix(9.5, 4.6, tw));
    vec3 col = mix(upper, horizon, belt);
    col = mix(col, zenith, smoothstep(0.22, 0.95, hp));
    // A thin bright band right on the horizon (airlight), and the Earth's shadow rising opposite the sun.
    col += horizon * 0.35 * exp(-hp * 40.0);
    col *= mix(0.82, 1.0, smoothstep(0.0, 0.06, hp + tw * 0.1));
    // Mie glow and the disc (both fade out once the sun is down).
    float up = smoothstep(-0.12, 0.02, sun.y);
    col += vec3(2.4, 1.15, 0.42) * pow(cosSun, 10.0) * 0.55 * up;
    col += vec3(4.0, 2.1, 0.9) * pow(cosSun, 160.0) * 1.1 * up;
    col += vec3(90.0, 58.0, 30.0) * smoothstep(0.99986, 0.99994, cosSun);
    if (h < 0.0) col = mix(horizon * 0.8, ${v3(hazeColours(p).away)} * 0.5, smoothstep(0.0, 0.1, -h));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Aerial perspective: three's fog, but the haze colour warms towards the sun. Patched into the shared
 * shader chunks once; only materials rendered with `scene.fog` (this scene) are affected.
 */
let aerialInstalled = false;
const installAerialFog = (p: Palette) => {
  if (aerialInstalled) return;
  aerialInstalled = true;
  THREE.ShaderChunk.fog_pars_vertex = `#ifdef USE_FOG\n varying float vFogDepth;\n varying vec3 vFogDir;\n#endif`;
  THREE.ShaderChunk.fog_vertex = `#ifdef USE_FOG\n vFogDepth = - mvPosition.z;\n vFogDir = (vec4(mvPosition.xyz, 0.0) * viewMatrix).xyz;\n#endif`;
  THREE.ShaderChunk.fog_pars_fragment = `#ifdef USE_FOG
  uniform vec3 fogColor;
  varying float vFogDepth;
  varying vec3 vFogDir;
  #ifdef FOG_EXP2
    uniform float fogDensity;
  #else
    uniform float fogNear;
    uniform float fogFar;
  #endif
  ${towardsGlsl(p)}
#endif`;
  THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  vec3 haze = mix( fogColor, ${v3(hazeColours(p).sun)}, towardsSun( vFogDir ) );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, haze, fogFactor );
#endif`;
};

/** Lens: chromatic aberration, sun flare with ghosts and an anamorphic streak, vignette, grain. */
const LensShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    resolution: { value: new THREE.Vector2(1, 1) },
    time: { value: 0 },
    sun: { value: new THREE.Vector3(0.5, 0.5, 0) },
    grain: { value: 0.03 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float time;
    uniform vec3 sun;
    uniform float grain;
    varying vec2 vUv;
    float hash(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    vec3 ghost(vec2 uv, vec2 centre, float radius, vec3 tint, float aspect) {
      float r = length((uv - centre) * vec2(aspect, 1.0));
      float disc = 1.0 - smoothstep(radius * 0.55, radius, r);
      float rim = (1.0 - smoothstep(radius * 0.97, radius * 1.04, r)) - (1.0 - smoothstep(radius * 0.86, radius * 0.97, r));
      return tint * (disc * 0.45 + rim * 0.7);
    }
    void main() {
      float aspect = resolution.x / resolution.y;
      vec2 c = vUv - 0.5;
      vec2 ca = c * vec2(aspect, 1.0);
      float r2 = dot(ca, ca);
      vec2 off = c * (0.0006 + r2 * 0.0026);
      vec3 col = vec3(texture2D(tDiffuse, vUv - off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + off).b);
      if (sun.z > 0.002) {
        vec2 s = sun.xy;
        vec2 axis = vec2(0.5) - s;
        vec3 f = vec3(0.0);
        f += ghost(vUv, s + axis * 0.48, 0.028, vec3(1.0, 0.6, 0.3), aspect) * 0.09;
        f += ghost(vUv, s + axis * 0.9, 0.06, vec3(0.45, 0.65, 1.0), aspect) * 0.05;
        f += ghost(vUv, s + axis * 1.3, 0.018, vec3(0.6, 1.0, 0.75), aspect) * 0.12;
        f += ghost(vUv, s + axis * 1.62, 0.1, vec3(0.9, 0.55, 1.0), aspect) * 0.035;
        f += ghost(vUv, s + axis * 2.05, 0.045, vec3(1.0, 0.75, 0.45), aspect) * 0.06;
        vec2 d = (vUv - s) * vec2(aspect, 1.0);
        float streak = exp(-abs(d.y) * 340.0) * exp(-abs(d.x) * 1.6);
        f += vec3(1.0, 0.7, 0.45) * streak * 0.42;
        f += vec3(1.0, 0.6, 0.32) * exp(-length(d) * 4.0) * 0.16;
        col += f * sun.z;
      }
      float v = 1.0 - smoothstep(0.25, 1.2, length(ca) * 1.05);
      col *= mix(0.74, 1.0, v);
      col += (hash(vUv * resolution + fract(time * 7.13) * 91.7) - 0.5) * grain;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

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

/** Chase-camera keyframes in the aircraft's heading frame: [s, offset, look-at offset, focal length mm]. */
const CAMERA: [number, THREE.Vector3, THREE.Vector3, number][] = [
  [0, new THREE.Vector3(-17, 4.4, 48), new THREE.Vector3(-3, 2.4, -30), 46],
  [0.16, new THREE.Vector3(-12, 3.4, 42), new THREE.Vector3(-2, 2.4, -26), 44],
  [0.3, new THREE.Vector3(-9, 2.6, 38), new THREE.Vector3(-1.5, 2.4, -22), 44],
  [0.42, new THREE.Vector3(-18, 3, 46), new THREE.Vector3(-1, 2.2, -12), 46],
  [0.66, new THREE.Vector3(-40, 5, 48), new THREE.Vector3(0, 1.4, -4), 50],
  [1, new THREE.Vector3(-62, 2.5, 20), new THREE.Vector3(0, 0.8, -2), 54],
];

const CALLOUTS: [number, string][] = [
  [0.17, "80 KNOTS"],
  [0.28, "V1"],
  [0.31, "ROTATE"],
  [0.39, "POSITIVE RATE"],
  [0.45, "GEAR UP"],
];

/** The left wing-root landing light, in the aircraft's frame. */
const LANDING_LIGHT = new THREE.Vector3(-3.1, -1.62, 13.4 - 37.57 / 2);

/** Yield to the browser between heavy build steps, so building the scene never blocks input for long. */
const pause = yieldToMain;


/** Soft ambient-occlusion footprint under the aircraft while it is on the ground. */
const contactShadowTexture = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ctx.filter = "blur(10px)";
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.beginPath();
  ctx.ellipse(128, 128, 18, 112, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.moveTo(30, 150);
  ctx.lineTo(128, 112);
  ctx.lineTo(226, 150);
  ctx.lineTo(226, 162);
  ctx.lineTo(128, 140);
  ctx.lineTo(30, 162);
  ctx.closePath();
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  return tex;
};

export const createTakeoffScene = async (canvas: HTMLCanvasElement, opts: Options) => {
  const pal: Palette = PALETTES[opts.palette ?? "sunset"];
  const SUN = pal.sun;
  installAerialFog(pal);
  const hi = !opts.small;
  // Logarithmic depth: the scene spans 0.5 m (gear) to 50 km (hills), and the runway lies on the ground.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false, logarithmicDepthBuffer: true, stencil: false });
  // Resolution is a pixel budget, chosen once: about a million drawn pixels on desktop whatever the
  // screen's density, so a retina laptop does not draw four times the work of a plain one. Changing it
  // later reallocates every buffer (a visible stall), so the safety net below steps down at most once.
  const maxRatio = Math.min(window.devicePixelRatio || 1, 1.25);
  const budget = opts.small ? 0.9e6 : 1.0e6;
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = pal.exposure;
  const shadows = hi;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const anisotropy = Math.min(hi ? 12 : 4, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 90000);
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(item: T) => {
    disposables.push(item);
    return item;
  };
  const progress = (f: number) => opts.onProgress?.(f);

  // Sky dome, drawn first and behind everything; it follows the camera.
  const makeSky = () => {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        vertexShader: "varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader: skyFragment(pal),
      }),
    );
    sky.scale.setScalar(60000);
    sky.renderOrder = -10;
    sky.frustumCulled = false;
    return sky;
  };
  const sky = makeSky();
  track(sky.geometry);
  track(sky.material as THREE.Material);
  scene.add(sky);

  // Environment for reflections and image-based light: the same sky over a dark ground.
  const pmrem = track(new THREE.PMREMGenerator(renderer));
  const envScene = new THREE.Scene();
  const envSky = makeSky();
  envScene.add(envSky);
  const envGround = new THREE.Mesh(new THREE.CircleGeometry(5000, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color("#1d1f1b") }));
  envGround.rotation.x = -Math.PI / 2;
  envGround.position.y = -40;
  envScene.add(envGround);
  const env = track(pmrem.fromScene(envScene, 0.02, 1, 100000).texture);
  envSky.geometry.dispose();
  (envSky.material as THREE.Material).dispose();
  envGround.geometry.dispose();
  (envGround.material as THREE.Material).dispose();
  scene.environment = env;
  scene.environmentIntensity = 0.85;
  scene.fog = new THREE.FogExp2(hazeColours(pal).away.getHex(), pal.haze);
  progress(0.15);

  const hemi = new THREE.HemisphereLight(0x7d93c2, 0x24221d, pal.hemi);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(0xffb27a, pal.sunLight);
  sunLight.castShadow = shadows && pal.sunLight > 0;
  sunLight.shadow.mapSize.set(2048, 2048);
  const sc = sunLight.shadow.camera;
  sc.left = -34;
  sc.right = 34;
  sc.top = 34;
  sc.bottom = -34;
  sc.near = 1;
  sc.far = 1600;
  sunLight.shadow.bias = -0.00025;
  sunLight.shadow.normalBias = 0.03;
  sunLight.shadow.radius = 3;
  scene.add(sunLight, sunLight.target);
  // The ground takes far less light from the bright horizon than the glossy paint does.
  const groundEnv = 0.32;

  await pause();
  // Ground: farmland, the airfield's mown grass, runway 27 with shoulders, taxiway, apron, terminal, tower, hangars.
  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(120000, 120000)), track(new THREE.MeshStandardMaterial({ map: track(fieldTexture(anisotropy)), color: "#7b7d70", roughness: 1, envMapIntensity: groundEnv })));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.3, -20000);
  // Only the runway receives the aircraft's shadow: sampling the shadow map across the whole
  // ground plane would cost a full screen of filtered lookups every frame for nothing visible.
  scene.add(ground);
  await pause();
  const grass = new THREE.Mesh(
    track(new THREE.PlaneGeometry(1400, 6200)),
    track(new THREE.MeshStandardMaterial({ map: track(grassTexture(anisotropy, [1400 / 48, 6200 / 48])), color: "#c4c8b4", roughness: 0.95, envMapIntensity: groundEnv })),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(120, -0.12, -1500);
  scene.add(grass);
  await pause();
  const shoulder = new THREE.Mesh(track(new THREE.PlaneGeometry(60, RUNWAY.length + 120)), track(new THREE.MeshStandardMaterial({ color: "#45484c", roughness: 0.95, envMapIntensity: groundEnv })));
  shoulder.rotation.x = -Math.PI / 2;
  shoulder.position.set(0, -0.04, -RUNWAY.length / 2);
  shoulder.receiveShadow = shadows;
  scene.add(shoulder);
  const runwayGeo = track(new THREE.PlaneGeometry(RUNWAY.width, RUNWAY.length, 1, 1));
  runwayGeo.setAttribute("uv1", runwayGeo.attributes.uv!.clone());
  const rwMaps = runwayMaps(anisotropy, hi);
  await pause();
  const runway = new THREE.Mesh(
    runwayGeo,
    track(
      new THREE.MeshStandardMaterial({
        map: track(rwMaps.map),
        roughnessMap: track(rwMaps.roughnessMap),
        roughness: 1,
        bumpMap: track(asphaltDetail(anisotropy, [RUNWAY.width / 2, RUNWAY.length / 2])),
        bumpScale: 1.4,
        envMapIntensity: groundEnv,
      }),
    ),
  );
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(0, 0, -RUNWAY.length / 2);
  runway.receiveShadow = shadows;
  scene.add(runway);
  const twTex = track(taxiwayTexture(anisotropy));
  twTex.wrapT = THREE.RepeatWrapping;
  twTex.repeat.set(1, 6);
  const taxiway = new THREE.Mesh(track(new THREE.PlaneGeometry(23, RUNWAY.length)), track(new THREE.MeshStandardMaterial({ map: twTex, roughness: 0.92, envMapIntensity: groundEnv })));
  taxiway.rotation.x = -Math.PI / 2;
  taxiway.position.set(190, 0.01, -RUNWAY.length / 2);
  scene.add(taxiway);
  // Rapid-exit and link taxiways between the runway and the parallel taxiway.
  const linkMat = track(new THREE.MeshStandardMaterial({ color: "#3a3d41", roughness: 0.92, envMapIntensity: groundEnv }));
  for (const z of [-700, -1500, -2300, -3250]) {
    const link = new THREE.Mesh(track(new THREE.PlaneGeometry(22, 190)), linkMat);
    link.rotation.x = -Math.PI / 2;
    link.rotation.z = z === -3250 ? Math.PI / 2 : Math.PI / 2 - 0.52;
    link.position.set(97, 0.005, z);
    scene.add(link);
  }
  const concrete = track(new THREE.MeshStandardMaterial({ color: "#a7abaf", roughness: 0.95, envMapIntensity: groundEnv }));
  const apron = new THREE.Mesh(track(new THREE.PlaneGeometry(420, 700)), concrete);
  apron.rotation.x = -Math.PI / 2;
  apron.position.set(420, 0.02, -1500);
  scene.add(apron);
  const terminal = new THREE.Mesh(
    track(new THREE.BoxGeometry(70, 24, 520)),
    track(new THREE.MeshStandardMaterial({ map: track(terminalTexture()), emissive: "#ffffff", emissiveMap: track(terminalGlowTexture()), emissiveIntensity: 2.2, roughness: 0.4, metalness: 0.2 })),
  );
  terminal.position.set(660, 12, -1500);
  scene.add(terminal);
  const tower = new THREE.Group();
  const towerShaft = new THREE.Mesh(track(new THREE.CylinderGeometry(3.2, 4.2, 46, 20)), track(new THREE.MeshStandardMaterial({ color: "#d9dde2", roughness: 0.6 })));
  towerShaft.position.y = 23;
  const cab = new THREE.Mesh(track(new THREE.CylinderGeometry(7.5, 6, 6, 20)), track(new THREE.MeshStandardMaterial({ color: "#2f5f8c", emissive: "#8fd0ff", emissiveIntensity: 1.4, roughness: 0.1, metalness: 0.6 })));
  cab.position.y = 49;
  const roof = new THREE.Mesh(track(new THREE.CylinderGeometry(6.2, 7.6, 1.6, 20)), track(new THREE.MeshStandardMaterial({ color: "#c9ced4", roughness: 0.5 })));
  roof.position.y = 52.8;
  tower.add(towerShaft, cab, roof);
  tower.position.set(330, 0, -880);
  scene.add(tower);
  const hangarMat = track(new THREE.MeshStandardMaterial({ color: "#cfd4da", roughness: 0.5, metalness: 0.35 }));
  const hangarGeo = track(new THREE.CylinderGeometry(28, 28, 70, 28, 1, false, 0, Math.PI));
  for (let k = 0; k < 3; k++) {
    const hangar = new THREE.Mesh(hangarGeo, hangarMat);
    hangar.rotation.z = Math.PI / 2;
    hangar.rotation.y = Math.PI / 2;
    hangar.position.set(-230, 0, -300 - k * 90);
    hangar.castShadow = shadows;
    scene.add(hangar);
  }
  progress(0.35);

  await pause();
  // The city at dusk: lit blocks, street lights, traffic, a high-rise district; low Deccan hills beyond.
  const rnd = (() => {
    let seed = 1994;
    return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  })();
  const city = buildCity({ small: opts.small, rnd });
  disposables.push(city);
  scene.add(city.group);
  const hillMat = track(new THREE.MeshStandardMaterial({ color: "#2f3441", roughness: 1 }));
  const hillGeo = track(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  for (let k = 0; k < 16; k++) {
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.scale.set(2500 + rnd() * 4000, 220 + rnd() * 480, 2500 + rnd() * 3000);
    hill.position.set((rnd() - 0.5) * 60000, 0, -30000 - rnd() * 22000);
    scene.add(hill);
  }
  progress(0.55);

  await pause();
  // The aircraft.
  const aircraft = await buildAircraft({ emblem: opts.emblem, font: opts.font, anisotropy, hi, shadows });
  scene.add(aircraft.group);
  // Landing and take-off lights: a beam ahead of the nose that lights the runway on the roll.
  const landing = new THREE.SpotLight(0xfff1dc, 26000, 900, 13 * DEG, 0.7, 2);
  landing.position.set(0, -1.6, -14);
  landing.target.position.set(0, -60, -420);
  aircraft.group.add(landing, landing.target);
  const contact = new THREE.Mesh(
    track(new THREE.PlaneGeometry(40, 44)),
    track(new THREE.MeshBasicMaterial({ map: track(contactShadowTexture()), transparent: true, depthWrite: false, opacity: 0.6, color: 0x000000, fog: false })),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.renderOrder = 1;
  scene.add(contact);
  const path = buildPath();
  progress(0.75);

  await pause();
  // Post: HDR scene (MSAA) → bloom → tone mapping + sRGB → lens.
  // Buffers are created at their real size (resize() only reallocates when that size changes).
  const drawing = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(drawing.x, drawing.y, { type: THREE.HalfFloatType, samples: 2 });
  const composer = new EffectComposer(renderer, target);
  // Only the scene buffer needs HDR and multisampling. The second buffer only ever holds the tone-mapped
  // output for the lens pass (two swaps per frame bring the scene back to the first), so it is plain 8-bit.
  composer.renderTarget2.dispose();
  composer.renderTarget2 = new THREE.WebGLRenderTarget(drawing.x, drawing.y, { type: THREE.UnsignedByteType });
  composer.writeBuffer = composer.renderTarget2;
  composer.setSize(Math.max(1, initial.width), Math.max(1, initial.height));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), hi ? 0.5 : 0.38, 0.62, 1.05);
  composer.addPass(bloom);
  const output = new OutputPass();
  composer.addPass(output);
  const lens = new ShaderPass(LensShader);
  composer.addPass(lens);
  disposables.push(composer, target, bloom);

  // Shaders compile in parallel without blocking the page (KHR_parallel_shader_compile), then textures
  // go up to the GPU one at a time, so neither lands as one long freeze on the first frame.
  camera.position.set(-20, 10, 40);
  camera.lookAt(0, 3, -30);
  // The scene draws into the composer's buffer; the bloom and output passes into render targets; only the
  // lens pass draws to the screen.
  await compileFor(renderer, scene, camera, composer.readBuffer);
  const bloomMaterials = [...bloom.separableBlurMaterials, bloom.materialHighPassFilter, bloom.compositeMaterial, bloom.blendMaterial, output.material];
  await compileMaterials(renderer, bloomMaterials, composer.readBuffer);
  await compileMaterials(renderer, [lens.material], null);
  progress(0.85);
  await uploadTextures(renderer, scene);
  warmUp(renderer, scene, camera, composer.readBuffer);
  await pause();
  progress(0.95);

  // State.
  let width = 1;
  let height = 1;
  let goal = 0;
  let s = 0;
  const pointer = { x: 0, y: 0 };
  const pointerEased = { x: 0, y: 0 };
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  let camReady = false;
  let lastCallout = -1;
  let calloutText: string | null = null;
  let calloutUntil = 0;
  let firstFrame = true;
  let last = -1;
  let lastTelemetry = "";
  let sunVisible = 0;
  let focal = 50;

  const fovFor = (mm: number) => {
    // Vertical FOV for a full-frame (24 mm tall) sensor; portrait screens widen it to keep the aircraft in frame.
    const aspect = width / height;
    const v = 2 * Math.atan(12 / mm) / DEG;
    return aspect < 1 ? Math.min(70, v * (1.25 / Math.max(0.45, aspect))) : v;
  };
  // Writing canvas.width reallocates the drawing buffer (and waits on the GPU) even when the value is the
  // same, so buffers are only resized when the size or the pixel ratio really changed.
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    const pr = renderer.getPixelRatio();
    if (canvas.width !== Math.floor(width * pr) || canvas.height !== Math.floor(height * pr)) renderer.setSize(width, height, false);
    if (composer.renderTarget1.width !== width * pr || composer.renderTarget1.height !== height * pr) {
      composer.setPixelRatio(pr);
      composer.setSize(width, height);
    }
    bloom.resolution.set(width / 2, height / 2);
    lens.uniforms.resolution!.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
    camera.aspect = width / height;
    camera.fov = fovFor(focal);
    camera.updateProjectionMatrix();
  };
  resize();

  const offset = new THREE.Vector3();
  const look = new THREE.Vector3();
  const cameraFrame = (at: number) => {
    let i = 0;
    while (i < CAMERA.length - 2 && at > CAMERA[i + 1]![0]) i++;
    const [s0, o0, l0, f0] = CAMERA[i]!;
    const [s1, o1, l1, f1] = CAMERA[i + 1]!;
    const t = smooth(s0, s1, at);
    offset.copy(o0).lerp(o1, t);
    look.copy(l0).lerp(l1, t);
    return lerp(f0, f1, t);
  };
  const desired = new THREE.Vector3();
  const lookAt = new THREE.Vector3();
  const tmpLook = new THREE.Vector3();
  const sunProbe = new THREE.Vector3();
  const ray = new THREE.Ray();
  const inverse = new THREE.Matrix4();

  // Idle (no scroll or pointer for a while, flight settled): render at half rate, which nobody can see
  // in blinking lights and a slow drift, and which leaves the GPU and battery alone.
  let activeAt = 0;
  let skip = 0;
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
    const idle = !opts.still && now - activeAt > 2500 && Math.abs(goal - s) < 1e-4;
    if (idle && skip++ % 2 === 0) return;
    if (!idle) adapt(now - last, now);
    const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
    last = now;
    const t = now / 1000;
    s += (goal - s) * (opts.reduced ? 1 : 1 - Math.exp(-dt * 4.2));
    const still = opts.still;
    const state: Sample = still
      ? { ...still.plane, pitch: still.plane.pitch * DEG, yaw: still.plane.yaw * DEG, roll: still.plane.roll * DEG, kt: 138 }
      : sampleAt(path, s);

    const g = aircraft.group;
    g.position.set(state.x, state.y, state.z);
    g.rotation.set(state.pitch, -state.yaw, -state.roll, "YXZ");
    aircraft.update({ gear: state.gear, fan: 9 + state.kt * 0.32, time: t, dt, cabin: still ? 1 : 0.35 + 0.4 * smooth(0.3, 0.9, s) });
    const alt = state.y - GEAR_HEIGHT;
    contact.position.set(state.x, 0.04, state.z - 1);
    contact.rotation.z = -state.yaw;
    (contact.material as THREE.MeshBasicMaterial).opacity = 0.62 * (1 - smooth(0.5, 14, alt));
    contact.visible = alt < 14;

    if (still) {
      focal = still.focal;
      camera.position.set(...still.camera);
      camera.lookAt(...still.look);
    } else {
      // Chase camera in the heading frame, nudged by the pointer, with runway rumble on the roll.
      focal = cameraFrame(s);
      // Portrait screens: chase from further behind and centre the aircraft, so the wings stay in frame.
      const portrait = Math.min(1, Math.max(0, (1 - width / height) / 0.5));
      offset.x *= 1 - 0.35 * portrait;
      look.x *= 1 - 0.9 * portrait;
      pointerEased.x += (pointer.x - pointerEased.x) * (1 - Math.exp(-dt * 3));
      pointerEased.y += (pointer.y - pointerEased.y) * (1 - Math.exp(-dt * 3));
      offset.applyAxisAngle(THREE.Object3D.DEFAULT_UP, -state.yaw + pointerEased.x * 0.14);
      offset.y += pointerEased.y * -2;
      look.applyAxisAngle(THREE.Object3D.DEFAULT_UP, -state.yaw);
      // The camera is smoothed relative to the aircraft, never in world space, so however fast the
      // visitor scrolls the aircraft stays in frame; only changes of framing are eased.
      desired.copy(offset);
      if (!opts.reduced) {
        // A hand-held operator: slow drift, plus runway rumble that grows with speed until lift-off.
        desired.x += Math.sin(t * 0.37) * 0.5 + Math.sin(t * 1.13) * 0.12;
        desired.y += Math.sin(t * 0.29) * 0.25 + Math.sin(t * 0.91) * 0.08;
        const rumble = s < LIFTOFF ? (state.kt / 150) * 0.035 : 0.006;
        desired.y += (Math.sin(t * 61) + Math.sin(t * 37.3) * 0.6) * rumble;
        desired.x += Math.sin(t * 47) * rumble;
      }
      lookAt.copy(look);
      const k = camReady ? 1 - Math.exp(-dt * 5) : 1;
      camPos.lerp(desired, k);
      camLook.lerp(lookAt, k);
      camReady = true;
      camera.position.set(state.x, state.y, state.z).add(camPos);
      // Keep the camera above the ground on the roll.
      camera.position.y = Math.max(camera.position.y, 1.6);
      camera.lookAt(tmpLook.set(state.x, state.y, state.z).add(camLook));
    }
    const fov = fovFor(focal);
    if (Math.abs(fov - camera.fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    sky.position.copy(camera.position);
    sunLight.position.set(state.x, state.y, state.z).addScaledVector(SUN, 600);
    sunLight.target.position.set(state.x, state.y, state.z);

    // Sun flare: on screen, in front of the camera, and not hidden behind the aircraft. A still can
    // flare on the landing light instead.
    g.updateMatrixWorld();
    if (still?.flare) sunProbe.copy(LANDING_LIGHT).applyMatrix4(g.matrixWorld).project(camera);
    else sunProbe.copy(camera.position).addScaledVector(SUN, 10000).project(camera);
    let vis = SUN.y > -0.02 || still?.flare ? (sunProbe.z < 1 && Math.abs(sunProbe.x) < 1.15 && Math.abs(sunProbe.y) < 1.15 ? 1 : 0) : 0;
    if (vis && !still?.flare) {
      inverse.copy(g.matrixWorld).invert();
      ray.set(camera.position, SUN).applyMatrix4(inverse);
      if (aircraft.occluders.some((box) => ray.intersectsBox(box))) vis = 0;
    }
    sunVisible += (vis - sunVisible) * (1 - Math.exp(-dt * 10));
    lens.uniforms.sun!.value.set(sunProbe.x * 0.5 + 0.5, sunProbe.y * 0.5 + 0.5, sunVisible);
    lens.uniforms.time!.value = t;

    city.update(t, height, camera.fov, renderer.getPixelRatio());
    composer.render(dt);
    if (firstFrame) {
      firstFrame = false;
      progress(1);
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
    const ft = Math.max(0, Math.round(alt * 3.281));
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
      const next = Math.min(1, Math.max(0, p));
      if (next !== goal) activeAt = performance.now();
      goal = next;
    },
    setPointer: (x: number, y: number) => {
      activeAt = performance.now();
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
