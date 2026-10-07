# Civil Aviation India — web

Next.js 16 (App Router) · TypeScript · Tailwind v4 · motion · Lenis. Design: "flight deck at night" (near-black navy, one amber, one sky-blue; Archivo variable for display, Instrument Sans for body, IBM Plex Mono for instrument labels).

```bash
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start  # production
npm run typecheck
npm run assets              # python: re-ingest the owner's uploads into public/media (see scripts/ingest_uploads.py)
npm run check:media         # fails if any media id used in src/ is missing
```

- Content lives in `src/content/*` (verbatim from the owner's documents); see `docs/CONTENT_INVENTORY.md`.
- Every photo goes through `components/media/Photo.tsx` (real files only, true pixel dimensions, blur placeholder, never stretched).
- Motion: one easing / three durations (`lib/motion.ts`, `--ease-flight`). Scroll-linked effects are CSS scroll-driven animations (`components/motion/ScrollFx.tsx`), so they cost no JavaScript; everything respects `prefers-reduced-motion`.
- Visual checks: `docs/screens/` holds the latest desktop / mobile / interaction contact sheets.
