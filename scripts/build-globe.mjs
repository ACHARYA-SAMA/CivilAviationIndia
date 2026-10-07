// Samples land on a 1.6° equal-area-ish grid (Natural Earth 110m, via world-atlas) into a compact dot list
// for the About page globe. Output: src/content/globe.generated.json = [[lat, lon], ...] rounded to 0.1°.
import fs from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/land-110m.json");
const land = feature(world, world.objects.land);

const STEP = 1.6;
const dots = [];
for (let lat = -58; lat <= 78; lat += STEP) {
  // Fewer samples toward the poles keeps the dot spacing even on the sphere.
  const stepLon = STEP / Math.max(0.2, Math.cos((lat * Math.PI) / 180));
  for (let lon = -180; lon < 180; lon += stepLon) {
    if (geoContains(land, [lon, lat])) dots.push([Math.round(lat * 10) / 10, Math.round(lon * 10) / 10]);
  }
}

fs.writeFileSync(new URL("../public/data/globe.json", import.meta.url), JSON.stringify(dots));
console.log("globe dots", dots.length);
