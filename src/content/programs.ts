import type { MediaId } from "./types";

/**
 * All copy below is verbatim from the legacy site (the eight Framer "template"
 * project pages turned out to be the real programme detail pages).
 * Source file for each programme is noted in `legacyFile`.
 */
export type ProgramSection = { heading: string; body: string };
export type ProgramFact = { label: string; value: string };

export type ProgramCategory = "pilot" | "engineering" | "management" | "cabin";

export type Program = {
  slug: string;
  category: ProgramCategory;
  /** Course code(s) from the owner's "Aviation Training Programs" fee schedule, where one exists. */
  code?: string;
  title: string;
  /** Compact label for tight places (folded rail spines). */
  short: string;
  /** Legacy "Categories" field: the one-line promise shown under the title. */
  tagline: string;
  /** Legacy "Client" field: employers / regulators the programme feeds. */
  client: string;
  /** The client field as a list, when it can't be split mechanically (commas inside one name). */
  partners?: readonly string[];
  /** Legacy "Project" field: flagship practical / capstone. */
  project: string;
  /** Legacy "Services" field: programme overview. */
  overview: string;
  /** Optional lead-in label printed above the overview (MER only). */
  overviewLabel?: string;
  /** Optional long-form paragraph (B.Tech only). */
  essay?: string;
  sections: readonly ProgramSection[];
  /** Quick-scan facts distilled from the sections; every value appears verbatim in them. */
  facts: readonly ProgramFact[];
  /** The three figures shown on the programme's flight strip (from the programme's own fee text). */
  strip: { duration: string; intake: string; fee: string };
  /** Lead photograph (owner's own photos: uploads or the original site). */
  image: MediaId | null;
  gallery: readonly MediaId[];
  related: readonly string[];
  /** Keys into documents.generated.json: syllabi and papers offered as downloads. */
  downloads: readonly string[];
  legacyFile: string;
  /** Legacy "Year" field, shown as "4" on every programme page (template residue; see notes). Not rendered. */
  legacyYearField: "4";
};

export const programs = [
  {
    slug: "btech-aerospace-engineering",
    code: "BAS 608",
    category: "engineering",
    title: "B.Tech in Aerospace Engineering",
    short: "B.Tech Aerospace",
    tagline: "Engineering the Future of Flight and Space Exploration.",
    client: "Aerospace Manufacturing OEMs, Defense R&D Organizations (DRDO), and Global Space Agencies.",
    project: "Complete Structural Design of an Aircraft, Rocket, or Launch Vehicle System (Mandatory 8th Semester Capstone).",
    overview:
      "A comprehensive four-year technical degree designed to build the next generation of aerospace innovators. The rigorous curriculum spans applied mechanics, fluid dynamics, aircraft structures, and space dynamics. Cadets do not just learn theory; they engage in advanced lab work encompassing mechatronics, composite materials, and computer-aided design, culminating in major Capstone projects involving actual aircraft or launch vehicle system design.",
    essay:
      "The transition from basic physics to aerospace engineering is a profound shift into a domain where margins of error approach zero. It is not merely about understanding aerodynamics, but mastering the intricate dialogue between structural integrity, propulsion, and atmospheric resistance. For the undergraduate, our B.Tech curriculum forces a rapid evolution in analytical thinking. Learning about fluid dynamics, space dynamics, or material stress is not a passive exercise; it is the acquisition of a predictive mindset that anticipates how metallic and composite structures will behave under the extreme forces of high-altitude flight and supersonic velocities. The challenge for the cadet is to recognize that every mathematical equation and physical law they master contributes directly to the uncompromising safety standards of global aviation.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "The B.Tech in Aerospace and Aeronautical Engineering is a comprehensive 4-year undergraduate degree designed to build the next generation of aviation innovators. To ensure rigorous, personalized technical instruction and ample laboratory access, the batch strength is strictly capped at 60 students per intake. The total program fee is structured at 9,200 USD per cadet, which covers the extensive academic curriculum and specialized engineering facility usage.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "This program bridges the critical gap between theoretical physics and applied aerospace mechanics. To meet the demanding academic standards, candidates must have a strong foundational background and hold a 10+2 educational qualification with a focus on Mathematics, Physics, and Chemistry (MPC). The degree is engineered to prepare cadets for elite roles in the design, analysis, and manufacturing of modern flight systems.",
      },
    ],
    facts: [
      { label: "Duration", value: "4-year" },
      { label: "Batch strength", value: "60 students per intake" },
      { label: "Fee", value: "9,200 USD per cadet" },
      { label: "Eligibility", value: "10+2 with Mathematics, Physics, and Chemistry (MPC)" },
    ],
    strip: { duration: "4 years", intake: "60 per intake", fee: "9,200 USD per cadet" },
    image: "fr-9ZxLvev23YNrQiod1gIW4xG9Kec",
    gallery: ["fr-UFblX7rYnF73r2bLwp2xyoQdWQ", "act-30-1", "act-57-1", "act-60-0"],
    related: ["commercial-pilot-license", "aircraft-maintenance-engineering", "multi-engine-rating"],
    downloads: ["btech-structure", "btech-courses"],
    legacyFile: "project-echo.html",
    legacyYearField: "4",
  },
  {
    slug: "commercial-pilot-license",
    code: "CPL 202",
    category: "pilot",
    title: "Commercial Pilot License (CPL)",
    short: "Commercial Pilot (CPL)",
    tagline: "Comprehensive Flight Training",
    client: "DGCA (India), ICAO, and Major International Commercial Airlines.",
    project: "Advanced Multi-Engine Simulator Scenarios and the Mandatory Publication of an Aviation Research Paper.",
    overview:
      "An intensive flying training program that transitions cadets from basic flight principles to advanced commercial command. Operating under stringent international standards, the curriculum integrates rigorous simulator training, multi-engine/instrument ratings, and deep theoretical grounding. Trainees master air navigation, meteorology, and complex electronic control systems, ensuring they develop the absolute situational awareness required for high-stakes leadership in the global airspace.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "Our Commercial Pilot License (CPL) program offers elite, world-class flight instruction over a concentrated duration of 3 years. To maintain the highest international standards of safety, operational discipline, and simulator access, each training batch is limited to exactly 60 cadets. The comprehensive training fee is 32,877 USD per head, encompassing rigorous ground school theory, multi-engine ratings, and essential flight hours.",
      },
      {
        heading: "Training Outcomes & Command",
        body: "Training at IIASTM goes far beyond basic mechanical stick-and-rudder flying. The syllabus mandates the mastery of complex air navigation, advanced meteorology interpretation, and the operation of sophisticated electronic flight control systems. Cadets are constantly evaluated on their situational awareness and emergency response, ensuring they graduate not just as pilots, but as decisive, resilient leaders of the flight deck.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "This training track is designed for aspiring aviators who intend to command commercial airspace with absolute precision. Enrollment eligibility requires candidates to have completed their 10+2 studies with a qualification in Mathematics and Physics (MPC). The program transitions cadets from fundamental single-engine VFR (Visual Flight Rules) flying to advanced, high-stakes instrument rating (IR) operations.",
      },
    ],
    facts: [
      { label: "Duration", value: "3 years" },
      { label: "Batch strength", value: "exactly 60 cadets" },
      { label: "Fee", value: "32,877 USD per head" },
      { label: "Eligibility", value: "10+2 with Mathematics and Physics (MPC)" },
    ],
    strip: { duration: "3 years", intake: "60 per batch", fee: "32,877 USD per head" },
    image: "fr-5LIu8T3EnAG89A3AGlaGvpwpQs",
    gallery: ["fr-Pf5yOJk69xW5ixJo6jC7a27C5vo", "fr-MnQ5umUh1Oz9juwim5IL7mzoB0", "fr-EmOzbyplS3zGpBTAu0kxReQrgM", "act-61-0"],
    related: ["aircraft-maintenance-engineering", "multi-engine-rating", "bba-aviation-management"],
    downloads: ["pilot-training"],
    legacyFile: "studio-atlas.html",
    legacyYearField: "4",
  },
  {
    slug: "aircraft-maintenance-engineering",
    code: "AME 101–103",
    category: "engineering",
    title: "Aircraft Maintenance Engineering (AME)",
    short: "Aircraft Maintenance (AME)",
    tagline: "The Guardians of Global Airworthiness and Safety.",
    client: "DGCA, FAA, EASA, and International Maintenance, Repair, and Overhaul (MRO) Facilities.",
    partners: ["DGCA", "FAA", "EASA", "International Maintenance, Repair, and Overhaul (MRO) Facilities"],
    project: "Live Gas Turbine Engine Overhaul, Fly-by-Wire Diagnostics, and Non-Destructive Testing (NDT) Protocols.",
    overview:
      "A highly specialized engineering track offering streams in Mechanical, Avionics, and Rotor Blade systems. This program strictly adheres to DGCA, FAA, and EASA regulatory frameworks. Students are immersed in the mechanical and digital heartbeat of the aircraft, mastering everything from gas turbine engine overhauls and fly-by-wire logic to Non-Destructive Testing (NDT), ensuring every machine remains flawlessly \"flyable\" under grueling conditions.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "The Aircraft Maintenance Engineering (AME) program is a specialized 3-year track with a strict intake of 60 cadets per stream to ensure hands-on mastery. The total fee varies by technical specialization: Mechanical engineering is structured at 7,889 USD per head. The advanced Avionics stream requires 15,780 USD per head , while the highly targeted Rotor Blade engineering track is offered at 6,575 USD per head.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "This intensive engineering program is designed to forge the ultimate guardians of global airworthiness and aviation safety. Candidates must possess a strong foundational aptitude for mechanics, electronics, and precision work. The curriculum strictly adheres to the rigorous international regulatory frameworks established by the DGCA, FAA, and EASA, ensuring graduates meet the legal and technical standards required to certify commercial aircraft worldwide.",
      },
      {
        heading: "Curriculum & Practical Exposure",
        body: "AME cadets are completely immersed in both the mechanical and digital heartbeat of modern aircraft throughout their training. The syllabus goes far beyond classroom theory, requiring students to master complex gas turbine engine overhauls, interpret intricate fly-by-wire logic, and execute precision Non-Destructive Testing (NDT). This guarantees that every engineer is equipped to ensure aircraft remain flawlessly \"flyable\" under grueling conditions.",
      },
    ],
    facts: [
      { label: "Duration", value: "3-year" },
      { label: "Intake", value: "60 cadets per stream" },
      { label: "Mechanical", value: "7,889 USD per head" },
      { label: "Avionics", value: "15,780 USD per head" },
      { label: "Rotor Blade", value: "6,575 USD per head" },
    ],
    strip: { duration: "3 years", intake: "60 per stream", fee: "6,575 to 15,780 USD per head" },
    image: "fr-eSHSMeASUheim9z7d7Emh0WC8",
    gallery: ["fr-uZ9TIswhgcBYAsTZlzbh8NLkgWc", "fr-UFblX7rYnF73r2bLwp2xyoQdWQ", "fr-oyPbVOd7sGu2zord4SyxJjesLWk", "act-58-0", "act-60-1"],
    related: ["multi-engine-rating", "bba-aviation-management", "aviation-disaster-management"],
    downloads: ["ame-syllabus", "ame-mechanical", "ame-avionics", "mro", "check-costs"],
    legacyFile: "linear-identity.html",
    legacyYearField: "4",
  },
  {
    slug: "multi-engine-rating",
    category: "pilot",
    title: "Multi-Engine Rating (MER)",
    short: "Multi-Engine Rating",
    tagline: "Complex Aircraft Operations",
    client: "Major Commercial Airlines, Corporate VIP Charter Operators, and National Regulatory Bodies (DGCA).",
    project: "Asymmetric Thrust Management Simulations, Advanced Instrument Rating (IR) Scenarios, and Live Piper Seneca Flight Endorsements.",
    overviewLabel: "Program Introduction",
    overview:
      "The Multi-Engine Rating (MER) is a critical operational advancement that transitions commercial cadets from basic single-engine flying to the command of complex, multi-engine aircraft like the Piper Seneca. This rigorous training focuses heavily on advanced instrument rules (IR), asymmetric thrust management, and high-stakes emergency procedures during system failures. It is meticulously designed to cultivate the absolute precision, discipline, and situational awareness required to safely navigate modern commercial airspace under adverse meteorological conditions.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "The advanced flight training tracks, including the Commercial Pilot License with Multi-engine rating (IR) and Piper Seneca endorsements, are rigorously structured for an elite cohort. To ensure maximum simulator and flight line access, intake is strictly capped at 60 cadets per batch. The overarching CPL program requires a fee of 32,877 USD per head, while dedicated advanced simulator training is structured at 40,987 USD for an 18-month duration",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "Candidates aiming to command complex, multi-engine commercial aircraft must first possess a strong foundational background, requiring a 10+2 qualification in Mathematics, Physics, and Chemistry (MPC). The curriculum transitions cadets from basic flying to advanced multi-engine instrument rules. Cadets must demonstrate extreme discipline, situational awareness, and the ability to interpret complex meteorological reports under adverse circumstances",
      },
      {
        heading: "Curriculum & Practical Exposure",
        body: "The coursework demands absolute precision, covering extensive ground subjects like Air Navigation, Mass and Balance, and Principles of Flight alongside intensive Simulator Training. Upon successful completion, cadets achieve highly specific program outcomes. These include a Graded Student Activity Log, a Unique Identification Number, and the mandatory publication of a formal aviation research paper",
      },
    ],
    facts: [
      { label: "Intake", value: "60 cadets per batch" },
      { label: "CPL programme", value: "32,877 USD per head" },
      { label: "Advanced simulator training", value: "40,987 USD for an 18-month duration" },
      { label: "Eligibility", value: "10+2 with Mathematics, Physics, and Chemistry (MPC)" },
    ],
    strip: { duration: "18 months, simulator", intake: "60 per batch", fee: "40,987 USD, simulator training" },
    image: "fr-W6imNlLGte7aaIFctuRCX4w9ZQ",
    gallery: ["fr-fBCDLWF1y2obyTxEHy1WjW7ccxk", "act-51-0", "act-61-1", "fr-Bn92zTyu0b3UImASIQUKubFCuFA"],
    related: ["bba-aviation-management", "aviation-disaster-management", "air-traffic-control"],
    downloads: ["pilot-training"],
    legacyFile: "future-archive.html",
    legacyYearField: "4",
  },
  {
    slug: "bba-aviation-management",
    category: "management",
    title: "BBA in Aviation Management",
    short: "BBA Aviation Management",
    tagline: "Strategic Leadership for the Global Aviation Economy.",
    client: "International Airport Authorities, Global Cargo Logistics Hubs, and Airline Corporate Operations.",
    project: "Comprehensive Field Project mapping the functional and operational areas of an International Airport.",
    overview:
      "A holistic business administration degree focused entirely on the complex operational environments of modern aviation. Students learn the fundamentals of airline business law, airport marketing, cargo logistics, and aviation safety programs. By integrating hands-on experience with Computerized Reservation Systems (CRS) and mandatory industrial projects at international airports, graduates are primed to take on finance, HR, and operational leadership roles across the industry.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "Our Aviation Management programs are meticulously designed to shape strategic operational leaders, maintaining a focused batch strength of 60 students per intake to maximize interactive business instruction. As a progression from the undergraduate BBA, the advanced Master of Business Administration (MBA) in Aviation spans a duration of 2 years and is offered at a comprehensive fee of 6,572 USD per head.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "Aimed at developing high-level leadership for the global aviation economy, this track is tailored for candidates with a sharp analytical mindset and an aptitude for corporate strategy. The academic framework bridges foundational business administration with the highly complex, fast-paced operational realities of modern aviation. Students are rigorously prepared to step into crucial finance, HR, and operational leadership roles across the aerospace sector.",
      },
      {
        heading: "Curriculum & Practical Exposure",
        body: "The management coursework delivers a holistic, rigorous view of the industry, focusing on specialized subjects such as airline business law, airport marketing, and global cargo logistics. Students gain critical hands-on competence by operating complex Computerized Reservation Systems (CRS) and completing mandatory industrial projects at major international airports. This practical immersion ensures graduates are ready to orchestrate high-stakes aviation business operations.",
      },
    ],
    facts: [
      { label: "Batch strength", value: "60 students per intake" },
      { label: "MBA in Aviation duration", value: "2 years" },
      { label: "MBA in Aviation fee", value: "6,572 USD per head" },
    ],
    strip: { duration: "2 years, MBA", intake: "60 per intake", fee: "6,572 USD per head, MBA" },
    image: "fr-lxlc2fOQQR1GYk7Klp6aTBhQVc",
    gallery: ["fr-IszovutAaupnRLHIk5raIxfpVao", "act-21-1", "act-56-1", "fr-sCBhjtKu44SN0B3XH4FVLnoOM"],
    related: ["aviation-disaster-management", "air-traffic-control", "cabin-crew-ground-handling"],
    downloads: ["bba-syllabus", "mba-syllabus"],
    legacyFile: "parallel-forms.html",
    legacyYearField: "4",
  },
  {
    slug: "aviation-disaster-management",
    code: "BAD 605",
    category: "management",
    title: "Degree in Aviation Disaster Management",
    short: "Disaster Management",
    tagline: "Resilience, Prevention, and Technical Investigation.",
    client: "Civil Aviation Authorities, Emergency Service Centers, and International Humanitarian Response Teams.",
    project: "Simulated Casualty Management, Loss Assessment, and Airport Emergency Plan (AEP) Execution Workshops.",
    overview:
      "A unique and highly critical curriculum focused on emergency planning, technical accident investigation, and humanitarian response. Students learn to navigate the profound tension between legal frameworks (such as ICAO Annexes) and technical safety data. By studying past atmospheric and man-made disasters, trainees develop non-punitive, preventative protocols that prioritize the preservation of human life and the continuous improvement of global flight safety.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "The Degree in Aviation Disaster Management is a highly specialized 3-year undergraduate program designed to train future aviation crisis leaders. Maintaining a focused, high-stakes instructional environment, the batch strength is strictly limited to 60 students per intake. The comprehensive fee for this vital, safety-centric degree is structured at 1,315 USD per head.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "This unique degree addresses the profound need for coordinated humanitarian response, casualty management, and loss assessment in global aviation. It bridges the gap between international regulatory frameworks, such as ICAO Annexes, and the practical realities of managing natural, man-made, and atmospheric disasters. Graduates emerge ready to coordinate seamlessly with airport authorities and emergency service centers.",
      },
      {
        heading: "Curriculum & Practical Exposure",
        body: "Students engage in deep theoretical and practical coursework covering Airport Emergency Plans, Safety Management Systems, and Disaster Risk Reduction strategies. The syllabus is intensely practical, integrating real-world case studies, hands-on workshops, and community-based capacity building. Trainees master emergency levels and call signs to understand the exact role of the Airport Authority during a disaster.",
      },
    ],
    facts: [
      { label: "Duration", value: "3-year" },
      { label: "Batch strength", value: "60 students per intake" },
      { label: "Fee", value: "1,315 USD per head" },
    ],
    strip: { duration: "3 years", intake: "60 per intake", fee: "1,315 USD per head" },
    image: "fr-rkREa4FF87drJDq1xrEqoFOBX4",
    gallery: ["fr-vT5r49jFMDqpBOGe48P1tyOcg", "act-68-0", "fr-h8I04gUMi2v40JUAexiHyhxMru4"],
    related: ["air-traffic-control", "cabin-crew-ground-handling", "btech-aerospace-engineering"],
    downloads: ["disaster-paper"],
    legacyFile: "silent-motif.html",
    legacyYearField: "4",
  },
  {
    slug: "air-traffic-control",
    code: "BATC 603",
    category: "management",
    title: "Degree in Air Traffic Control",
    short: "Air Traffic Control",
    tagline: "Advancing Human Performance in Extreme Environments.",
    client: "Airports Authority of India (AAI), Global Air Navigation Service Providers, and Terminal Radar Control Centers.",
    project: "Live Radar Vectoring Simulations, Microwave Landing Systems (MLS) Operation, and CNS-ATM Management.",
    // Verbatim from the legacy page. NB: it describes aviation medicine / human factors, not ATC;
    // flagged in docs/CONTENT_INVENTORY.md for the owner to confirm or replace.
    overview:
      "A specialized academic program examining the physiological and psychological human factors of flight. The curriculum covers the hazards of the aviation environment, spatial disorientation, and regulatory/clinical aviation medicine. Students explore how the human body reacts to altitude, G-forces, and aerospace travel, providing critical insights that support pilot health, aircraft design, and the overall safety of the aviation ecosystem.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "The Degree in Air Traffic Control is an exacting 3-year academic track dedicated to orchestrating the safe, orderly flow of global airspace. To ensure personalized attention on complex communication and radar protocols, the program is strictly capped at 60 students per batch. The total fee for this highly specialized operational degree is set at 1,315 USD per head.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "This program is tailored for analytical minds capable of rapid, high-stakes decision-making in a fast-paced environment. It focuses heavily on the technological and regulatory frameworks that govern Communication, Navigation, and Surveillance alongside Air Traffic Management (CNS-ATM Systems). Students are rigorously prepared to become the invisible but critical backbone of global aviation safety",
      },
      {
        heading: "Curriculum & Practical Exposure",
        body: "The curriculum immerses students in the mechanics of modern airspace, from Area Navigation (RNAV) and Global Positioning Systems to advanced ATC Transponders (SSR). Cadets master the principles of ground stations, Instrument Landing Systems (ILS), and Microwave Landing Systems (MLS) to guide aircraft safely. This practical grounding ensures absolute readiness for live control tower environments.",
      },
    ],
    facts: [
      { label: "Duration", value: "3-year" },
      { label: "Batch strength", value: "60 students per batch" },
      { label: "Fee", value: "1,315 USD per head" },
    ],
    strip: { duration: "3 years", intake: "60 per batch", fee: "1,315 USD per head" },
    image: "fr-qEmYGiQ0w2hg63RGvwIMYUUvk",
    gallery: ["fr-x94WNjhqS7HSPaaFy97N5qmwJU", "fr-zl74lmQ0tArCGMPfFYDuarl6wuc", "fr-h8I04gUMi2v40JUAexiHyhxMru4", "fr-9XvUeImbQXURqhlaR9FYJZskYgU"],
    related: ["cabin-crew-ground-handling", "btech-aerospace-engineering", "commercial-pilot-license"],
    downloads: [],
    legacyFile: "pattern-language.html",
    legacyYearField: "4",
  },
  {
    slug: "cabin-crew-ground-handling",
    code: "CAB801 / GH901",
    category: "cabin",
    title: "Cabin Crew & Ground Handling Training",
    short: "Cabin Crew & Ground Handling",
    tagline: "Excellence in In-Flight Command and Passenger Safety.",
    client: "Premier International Airlines (e.g., Air France), Global VIP Charter Services, and Ground Handling Agencies.",
    project: "High-Pressure Aircraft Evacuation Simulations, Ditching Protocols, and Critical Aviation First-Aid Response.",
    overview:
      "A rigorous training regimen that goes far beyond standard hospitality. This program focuses heavily on aircraft familiarization, emergency evacuation procedures, aviation physiology, and critical first-aid response. Cadets are trained with intention and discipline to manage complex, high-pressure in-flight scenarios, ensuring they act as resilient and reliable safety leaders for passengers in any operational context.",
    sections: [
      {
        heading: "Fee Structure & Program Capacity",
        body: "The Cabin Crew Training program is an intensive 1-year certification track designed to shape elite in-flight safety professionals. To maintain high instructional standards and ensure personalized practical evaluation, the batch strength is strictly capped at 60 cadets per intake. The total program fee is set at 1,643 USD per head, encompassing both comprehensive theoretical instruction and rigorous emergency scenario training.",
      },
      {
        heading: "General Knowledge & Eligibility",
        body: "This program goes far beyond standard passenger hospitality; it focuses on the critical role of the cabin crew as the primary safety commanders on board. Candidates must possess excellent communication skills, high situational awareness, and the psychological resilience to handle high-pressure environments. The training aligns seamlessly with international aviation protocols, ensuring cadets are fully prepared for global airline operations.",
      },
      {
        heading: "Curriculum & Practical Exposure",
        body: "The rigorous curriculum immerses cadets in vital, life-saving subjects such as aircraft familiarization, aviation physiology, and complex emergency evacuation procedures. Trainees undergo extensive practical workshops focusing on critical first-aid response, ditching protocols, and passenger management during severe turbulence or system degradation. Graduates emerge as disciplined, reliable leaders capable of ensuring absolute safety in any flight scenario.",
      },
    ],
    facts: [
      { label: "Duration", value: "1-year certification" },
      { label: "Batch strength", value: "60 cadets per intake" },
      { label: "Fee", value: "1,643 USD per head" },
    ],
    strip: { duration: "1 year", intake: "60 per intake", fee: "1,643 USD per head" },
    image: "fr-tstcLMUk52JRcXsMLWDIlcmTT4",
    gallery: ["fr-VtfCXi9LTCQ9qxyX96obyYbfQ", "fr-KPoj0TUkZEqTnQFRxeeMvJtLAY", "fr-Bl62OexlH5iLgZjw0q6FMy8Nbx8", "fr-lxlc2fOQQR1GYk7Klp6aTBhQVc"],
    related: ["btech-aerospace-engineering", "commercial-pilot-license", "aircraft-maintenance-engineering"],
    downloads: [],
    legacyFile: "spectrum-project.html",
    legacyYearField: "4",
  },
] as const satisfies readonly Program[];

export type ProgramSlug = (typeof programs)[number]["slug"];

export const getProgram = (slug: string): Program | undefined => programs.find((program) => program.slug === slug);

export const requireProgram = (slug: string): Program => {
  const program = getProgram(slug);
  if (!program) throw new Error(`Unknown programme slug: ${slug}`);
  return program;
};
