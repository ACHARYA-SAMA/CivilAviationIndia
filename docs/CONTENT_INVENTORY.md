# Content inventory (uploads of 6 Oct 2026 + old Framer export)

Ingest: `python scripts/ingest_uploads.py` → `public/media/**` (webp + blur placeholders), `public/documents/letters/*` (untouched originals for download), manifest `src/content/media.generated.json` (156 entries). `npm run check:media` fails on any broken reference.

| Source | Real content | Where it lives |
|---|---|---|
| `appreciationletters.docx` | 29 scanned letters: President of India Pranab Mukherjee (21 Aug 2012), Prime Minister's Office / Bharat Lal (18 Jun 2014), Narendra Modi as Chief Minister of Gujarat (25 Jun 2012), Union ministers (2014–15), Air Vice Marshal, outgoing letter to the President of the USA (5 Sep 2012) | Home: 3 featured + zoom viewer of all 29 · next: `/about/appreciation-letters` with captions + download |
| `ASSI ACTIVITIES.1.pdf` | 133 photos → 125 after de-duplication (6 stored sideways, fixed): Skill Africa / Maluti-A-Phofung MoU, museum visits, Asia Education Summit 2015, National Aerospace Museum Exhibit, labs and classrooms, the institute's Cessna, Republic Day 2012 tableau + AP Govt certificate, press clippings, campus facade (address, phones, e-mail, ISO 9001:2000) | Home tracks, programme rail, gallery band, contact details · next: `/gallery`, `/about` |
| `Aviation Training Programs.pdf` | 19-programme list, society registration no. 1691 of 2012 | `src/content/training.ts` · Home counter · next: `/programs` |
| `1591940806077_AVIATION TRAINING PROGRAMS.pdf` | Coded fee tables: AME 101–103, SLE104–108, OJT 109–111 (in `training.ts`); type-rating table TP206–TP26x by aircraft family (the "Fleet") | next: `/programs#fleet` |
| `MAINTENACE-CHEKCS.pdf`, `COST OF THE MAINTENACE CHEKCS.pdf` | A&B / C light / C heavy / D check costs by aircraft (B737-800 …) | next: AME programme page |
| Syllabi: AME (112 p), mechanical, avionics, diploma, B.Tech, BBA (56 p), MBA (42 p), Courses and Subjects (104 p) | Full curricula | next: programme pages (summary + PDF download) |
| `PILOT TRAINING.pdf`, `MRO.pdf` | Slide text; images look like stock photography | text next batch; **images not used until you confirm** |
| `Research and development.pdf`, `DISASTER MANAGEMENT.pdf` | R&D centre plan; disaster-management essay | next: `/research` |
| `ADVISORY C MEMBERS OF ASSI.pdf` | Advisory committee biographies | next: `/about` |
| `AEROSPACE SOCIET OF INDIA HOME PAGE.docx` | Old sitemap (Events, Publications, Membership …) | information-architecture reference |
| Registration / Certificate Course Admission forms | Blank forms | `/admissions` downloads |
| `Audit Form.pdf` | Asks for card number / expiry on paper | **not published** (collects payment data) |
| `batch 1–3.pdf`, `Clear-number-of-Students-*.pdf` (8) | Student personal data: DOB, Aadhaar, phones, e-mails, addresses, login passwords | **never published; text never read by the ingest script** |
| Screen recording (3 min) | Old-site walkthrough | layout reference (the interim hero frame is retired: the original photo is used) |
| Old Framer export | Programme, About, research text | `src/content/{programs,about,research,site}.ts` |
| Live site originals (downloaded 7 Oct with the owner's OK) | 77 images + 5 videos from framerusercontent.com: glass-roof hero (5184 px), photos for all 8 programmes, research and About photos, ASSI promo video, two ETV news segments, IIASTM slideshow, aircraft loop | `public/media/fr/*`, `public/media/video/*`; hero, programme pages, Programs hero video |
| Fee schedule tables (extracted by `scripts/extract_fee_tables.py`) | 11 AME/licensing/OJT rows, 5 pilot rows, 11 degree/certificate rows, 57 aircraft-family type courses (engineer + pilot fees), 16 maintenance-check rows | `/programs` (Fees, Fleet, Check costs) and each programme page |

Corrected obvious typos in the source tables: "Aircrfat" → Aircraft, "&600K" → $600K, "$$120K" → $120K. Serial no. 22 does not exist in the fee schedule. A & B check costs are blank in the source.

## Added in the 7 Oct batch
| Source | Real content | Where it lives |
|---|---|---|
| `appreciationletters.docx` | All 29 letters read and captioned (sender, office, date, one-line summary; 2 in Hindi, translated) | `src/content/letters.ts`, `/about/appreciation-letters`, Home fan |
| `ADVISORY C MEMBERS OF ASSI.pdf` | 13 advisory committee members, qualifications and honours (R. N. Agarwal: Padma Shri 1990, Padma Bhushan 2000, Agni Mission) | `src/content/advisory.ts`, `/about#advisory`, PDF in documents |
| `Research and development.pdf` | R&D Centre intro, Organized Research Unit definitions, six criteria for central support, proposal contents, five-year review | `researchCentre` in `src/content/research.ts`, `/research#centre`, PDF in documents |
| Letters 08, 10–12 | Ceremony "The Aerospace Society of India" and National Aerospace Museum Exhibition, Ramoji Film City, 27–29 Nov 2015 | About milestones |
| `ASSI ACTIVITIES.1.pdf` | 126 photos filed into 7 groups by looking at each (captions only where the photo states it) | `src/content/gallery.ts`, `/gallery` |
| Live-site videos | Promo film, two ETV reports (Telugu), IIASTM slideshow (programmes, board, affiliated bodies, tie-ups) | `src/content/films.ts`, `/research#films`, `/gallery#films` |

**AI-generated images on the old site.** Nine of its photos carry Google Gemini's visible watermark (✦):
fr-BF25…, fr-NZus8…, fr-RpaGO…, fr-TdetB…, fr-YjSYf…, fr-dTSHj…, fr-gHSq0…, fr-oSmXs…, fr-xZwgD…
They were the B.Tech, BBA and Disaster programme heroes, three Home track photos, the Admissions hero and
several programme galleries. All are now replaced by the institute's real photographs; none is used anywhere.

## Added in the second 7 Oct batch
| Source | Content | Where it lives | Notes |
|---|---|---|---|
| `IIASTM_Spartan_MOU_V7.pdf` + emails 1–10 (Mar–Aug 2026) | 2 + 2 aviation-maintenance pathway with Spartan College of Aeronautics and Technology, Tulsa: stages, Spartan admission requirements, who pays what, F-1 visa | `src/content/pathway.ts`, `/programs/usa-pathway`, band on Home and Programs | **MOU unsigned** (updated MOU "for signature" on 25 Aug). MOU §5 requires Spartan's written approval before using its name or program details publicly; `published: false` hides it all. No Spartan logo used; seat-deposit amount left out. |
| `hillerEmaail1.pdf`, `hillerEmail2.pdf` | Hiller Aviation Museum correspondence | **not used** | The museum's CEO declined collaboration (15 Jun) and co-branding (15 Aug 2026), so the site makes no Hiller claim. |
| `AEROSPACE_THEME_PARK-combined.pdf` | Neo Universe Aerospace Theme Park concept, designed by Dr. G. Satyanarayana: 12 zones | `src/content/neoUniverse.ts`, `/about#neo-universe` | Labelled "planned project". Brochure photos are stock, not used. |
| `Neo_Universe_Feasibility_Report.pdf` | Internal feasibility study with cost and revenue estimates | **not used** | Internal financials. |

## Built
Every page: Home, About, Appreciation letters, Programs + 8 programme pages, Admissions, Research & Media + 4 papers, Gallery, Student portal.

## Still needed from the owner
1. Cal.com booking link: set `NEXT_PUBLIC_CAL_LINK` (e.g. `assi/15min`); the booking section and buttons appear automatically.
2. Confirm: the ATC programme overview describes aviation medicine (verbatim from the old site); every old programme page showed "Year: 4"; Home's old "Training (6)" listed five programmes.
3. Dates for Skill Africa (the MoU photos carry none) and the year of the IGNOU–ISTE programme centre, if they should appear on the milestones route.
4. The PILOT TRAINING / MRO slide photos look like stock photography; they are only offered inside the PDFs.
