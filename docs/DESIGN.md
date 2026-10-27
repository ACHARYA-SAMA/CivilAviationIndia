# Design notes, v7: photoreal, 27 Oct, fifth round

The owner liked the take-off but found the aircraft cartoonish, and asked for an awwwards-level site
with more components. v6 CAVOK (palette, type, fields, controls) stays; what changed:

- **Aircraft** (`components/home/takeoff/aircraft.ts`, `geometry.ts`, `airframe.ts`, `livery.ts`).
  A320neo-class dimensions. Fuselage lofted from side and plan profiles (monotone splines for the nose,
  an up-swept tail cone, a wing-to-body fairing); wings, stabilisers, fin and sharklets lofted from real
  airfoil sections with dihedral, twist and a trailing-edge kink; engines with a polished intake lip,
  18 fan blades, spinner, core cowl and plug; flap-track fairings; retracting gear; antennas, probes.
  Livery painted on canvases at the surface's true geometry (cockpit glazing placed by height on the
  curved nose): colour, roughness, panel-line bump and a cabin-window glow; mixed-case titles.
- **Rendering** (`takeoff/scene.ts`): HDR sunset sky shader that also lights and reflects in the paint
  (PMREM), aerial-perspective haze that matches the horizon and warms towards the sun, MSAA HDR target,
  bloom, ACES, and a lens pass (sun or landing-light flare with ghosts and an anamorphic streak,
  chromatic aberration, vignette, grain). Palettes: `sunset` (take-off) and `bluehour` (arrival).
  Watch for NaN on Direct3D: clamp every `pow()` base and never use reversed `smoothstep` edges.
- **Stills**: `/dev/render` (development only) renders any frame of the scene from query parameters
  (`palette`, plane `px py pz pitch yaw roll gear`, camera `cx cy cz`, look `lx ly lz`, `focal`, `flare`).
  It produced `public/media/hero/arrival*.webp`; the take-off poster is the live scene's first frame.
- **New on Home**: intro curtain (`Preloader.tsx`, once per session, driven by the scene's real build
  progress); the anatomy studio (`AircraftStudio.tsx` + `studio/scene.ts`: drag to turn, six system
  hotspots that fly the camera in and name the programme that trains for each); a scroll-velocity type
  marquee; the partners band (Spartan College and the Hiller Aviation Museum, confirmed partners, plus
  Maluti-A-Phofung, with distance and live local time); the blue-hour arrival finale (replaces the 2D
  approach canvas). Every client-side navigation opens on a navy curtain naming the destination.
- **Performance** (measured on an Intel UHD integrated GPU, Chrome, production build): 59–60 fps while
  scrolling the take-off, the studio and the rest of Home, at 1× and 2× screens; phones 52–60 fps.
  What it took: shaders compiled in parallel against the render target they draw into (three.js builds
  a different variant for a target than for the screen); shader error checks off in production (each is
  a synchronous GPU round trip); textures uploaded one at a time with yields; an off-screen, unculled
  warm-up draw (Direct3D builds pipeline variants on first draw); canvases sized before the GPU is busy
  and never re-written unless the size changes; livery canvases painted once and shared by both scenes;
  noise drawn as tiled patterns; a fixed pixel budget (about 1 MP for the take-off, 1.2 MP for the studio)
  instead of stepping resolution at run time; HDR + 2× MSAA only on the scene buffer; half-rate render
  when idle; camera smoothed relative to the aircraft; readouts written to the DOM, not React state.

# Design notes, v6: CAVOK (clear air), 7 Oct, fourth round

The owner rejected v5's pastel sky and procedural clouds as childish ("2012"). v6 keeps the client's
sky blue and makes it premium. CAVOK is the weather report for perfect flying conditions: no cloud,
unlimited visibility.

- **Palette.** Haze ground #E5F1FC; white panels; navy type #06182F; deep sky #0A5BC4 for actions and
  links; the brand sky blue #3BA4F2 in large rounded fields (`.field-sky`); deep navy-blue `.night`
  surfaces (#08214A to #0B2A5C) for instruments, photo heroes and the footer. No clouds, no black.
- **Type.** One family, Mona Sans (variable), mixed case, tight tracking for titles. The expanded
  all-caps Hubot titling is gone. B612 Mono only on instruments.
- **Fields.** Big surfaces are rounded panels inset from the viewport (`.field`, `--frame`,
  `--field-radius`): the pinned take-off and landing windows, photo heroes, the programmes band,
  the closing section and the footer.
- **Brand device.** The livery line (`components/ui/Livery.tsx`): the aircraft's navy pinstripe and
  white line sweeping up towards the tail, drawn across the top of sky fields. Used three times.
- **Controls.** Pill buttons in sentence case (icons only for in-page and external links); a
  segmented control with a sliding selection (`components/ui/Segmented.tsx`) for every filter; a
  frosted jump-link bar; a floating navigation bar with an Apply button.
- **Home.** Sunset take-off (three.js): low sun, warm horizon, landing lights on the runway, edge,
  centreline, threshold, end and approach lights with sequenced flashers, a lit terminal and tower,
  then a climb over the city (`takeoff/city.ts`: about 8,000 instanced buildings with lit windows,
  ~56,000 street lights, highways with moving traffic, a high-rise district with blinking
  obstruction lights; one shader for all light points). The tail emblem has logo lights. Then the
  cabin window, mission board, training, programmes on the sky field, pathway, letters, a bento of
  field photographs, research, the closing field, the blue-hour landing, the footer.

# v4: sky (day) with night instruments, kept for reference

## v4 changes (owner feedback, 7 Oct, second round)
- **Sky theme.** The client asked for sky blue. Colours are CSS variables (`@theme`, not inline), light by default
  (ground #F4F9FF, panels white, ink navy #0B2240, data sky #0A6CC9, brand fill #2391EE); any section marked
  `.night` swaps to the night palette (instruments, photo heroes, the landing finale, viewers, footer).
  Taxiway-sign yellow stays only on signs; location signs are black-on-yellow (`--color-sign`).
- **Take off, not land.** Home now opens on a three.js daytime take-off seen in third person behind the
  society's own aircraft (procedural A320-class jet: sky-blue belly and fin, the emblem on the fin, both wings and
  the engines, "CIVIL AVIATION INDIA" titles). Scroll rolls, rotates and climbs it out with real callouts
  (80 knots, V1, rotate, positive rate, gear up). Loads on idle (desktop) or first touch (phones); a rendered
  poster frame stands in before that. The night landing moved to the end of Home: "Welcome to Hyderabad."
- Boarding passes in white with a sky-blue airline band and the emblem; fee tables became comparison bars;
  the departures board flips on the compositor (no per-flip React renders); the Student Portal is a sky with
  an aircraft drawing its contrail and a clean sign-in card. New: the 2 + 2 USA pathway page and band, and the
  Neo Universe planned theme park on About.

# v3 (night operations), kept for reference

## Why v2 still read as static (owner feedback, 7 Oct)
The stat strip, the programme strips and the portal form were tidy but inert: panels of text that
did nothing until clicked. v3 gives every page one moving, aviation-native centrepiece built for this
site, and keeps the v2 vocabulary (taxiway signs, stream holders) around it.

## Type
| Face | Role | Why |
|---|---|---|
| **Hubot Sans** (expanded caps, 700–800) | Page titles, signs, headings | Mechanical grotesque; expanded caps read like fuselage titling. Self-hosted and trimmed to weight 700–800 and width 100–116% (`scripts/trim-hubot.py`, 93 KB to 49 KB), `display: block` because no fallback can imitate the width. |
| **Mona Sans** (normal width) | Reading text | Hubot's sister family; 40 KB variable. |
| **B612 Mono** | Every instrument readout, flaps, codes | The typeface Airbus commissioned for cockpit displays. Not preloaded. |

## Signature components (one per page)
| Page | Component | What it does |
|---|---|---|
| Home | `ApproachScene` (canvas 2D, ~8k projected light sprites) | Scroll flies a 3° night approach to touchdown: approach lights with sequenced flashers, PAPI that reads correctly for the camera's angle, edge/centreline colour coding, taxiway, beacon, city below, painted markings lit by the landing lights. HUD readouts (speed, radio altitude, callouts, RETARD). Built on idle, 30 fps on phones, one still frame for reduced motion. |
| Home | `WindowReveal` | The glass-roof photo seen through a cabin window that opens to full bleed. |
| Home, Programs, footer | `SplitFlap` / `FactsBoard` / `DepartureBoard` | Solari flaps: facts board with live IST clock; bilingual (प्रस्थान / Departures) programme board that re-flips when a stream is chosen. |
| Home | `PassDeck` + `BoardingPass` + `Tilt` | Programmes as paper boarding passes (HYD to the programme), 3D tilt with foil sheen, horizontal "gate walk" pinned to vertical scroll. |
| Home | `LetterFan` | A hand of letters fanned in 3D as you scroll; hover names the sender. |
| About | `RouteTimeline` | Milestones as a flight route: dashed track, flown part drawn in amber, aircraft follows the path, waypoints light as passed. |
| About | `PartnerGlobe` | Dotted Earth (Natural Earth land, `scripts/build-globe.mjs`) with flight tracks from Kompally to each partner; drag to turn, select to face. |
| About | `HonourCard`, `AdvisoryList` | Photo stacks that fan on hover; crew-list of advisers with a detail panel. |
| Letters | `LetterArchive` | Letters filed by year with pinned outlined years, filters by sender, paper light-sweep on hover. |
| Research | `Annunciator`, `ReadingGauge` | Criteria as a cockpit annunciator panel that lights in sequence; article reading gauge as an altitude tape. |
| Gallery | `LightTable` | An endless, tilted table of prints: drifts, drags with inertia, wraps forever, opens the viewer. |
| Admissions | `Checklist` | The procedure as a laminated challenge/response checklist that ticks itself. |
| Portal | `Mcdu` | Sign-in as a flight-management keypad and screen in cockpit colours (cyan labels, amber required boxes, green data), honestly disabled. |
| Every page | `AdmitCta` runway | A runway in perspective whose centreline and edge lights stream toward you (take-off roll). |

## Colour
Unchanged ground and accents (deck #05080F, panel #0E1828, amber #FFB547 = signage only, cyan #8ED1FF = data).
Added `--color-hud` #72F5A3, used **only** on instrument surfaces (HUD, MCDU), following cockpit display convention.
Runway light colours in the canvas are the real ones (white, green threshold, red, yellow caution, blue taxiway).

## Performance budget (Lighthouse, production build)
Desktop 99–100 on every page; mobile 84–91 (Gallery 86); Accessibility, Best Practices, SEO 100; CLS ≤ 0.01.
Rules that got us there: heavy scenes start on idle and pause off-screen; Hubot trimmed and blocking; Mona without the width axis; B612 not preloaded; no blur placeholders on the 126-photo gallery; favicon 5 KB.
