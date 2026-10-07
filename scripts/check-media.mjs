#!/usr/bin/env node
/** Fails if any media id referenced in src/ is missing from the manifest, or any manifest file is missing from /public. */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(path.join(ROOT, "src/content/media.generated.json"), "utf8"));
const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = path.join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

const referenced = new Set();
for (const file of walk(path.join(ROOT, "src")).filter((f) => /\.(ts|tsx)$/.test(f))) {
  for (const m of readFileSync(file, "utf8").matchAll(/["'`]((?:act-\d\d-\d|letter-\d\d|hero-glass-roof|assi-emblem|fr-[A-Za-z0-9_-]{10,}|video-[A-Za-z0-9_-]{10,}))["'`]/g)) referenced.add(m[1]);
}
const missingIds = [...referenced].filter((id) => !manifest[id]);
const missingFiles = Object.entries(manifest).filter(([, v]) => !existsSync(path.join(ROOT, "public", v.src))).map(([id]) => id);
console.log(`${referenced.size} ids referenced, ${Object.keys(manifest).length} in manifest`);
if (missingIds.length) console.log("Not in manifest:", missingIds.join(", "));
if (missingFiles.length) console.log("File missing on disk:", missingFiles.join(", "));
process.exit(missingIds.length || missingFiles.length ? 1 : 0);
