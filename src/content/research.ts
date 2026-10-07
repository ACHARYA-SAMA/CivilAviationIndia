import type { MediaId } from "./types";

/** Verbatim articles from the legacy "Research & Media" section. Slugs are the legacy file names. */
export type Article = {
  slug: string;
  title: string;
  /** ISO date (UTC). */
  published: string;
  author: string;
  /** Card / hero image. */
  image: MediaId | null;
  paragraphs: readonly string[];
};

export const articles = [
  {
    slug: "global-aviation-disaster-management-assessment",
    title: "A Critical Assessment of Global Aviation Disaster Management & Technical Investigation",
    published: "2025-10-15",
    author: "ASSI Research Department",
    image: "fr-rkREa4FF87drJDq1xrEqoFOBX4",
    paragraphs: [
      `The assessment of aviation disaster management is no longer a localized technical exercise; it represents a global shift into a space where legal accountability and safety imperatives frequently collide. In this context, the investigation of an aircraft accident is not just about identifying a mechanical failure, but navigating the profound tension between judicial retribution and technical prevention. The increasing trend of criminalizing "mere negligence" among flight crews and maintenance personnel signals a shift in societal expectations, yet it threatens the very foundation of how the aviation industry interprets failure. For investigators, the challenge is ensuring that the pursuit of fault does not eclipse the discovery of cause, recognizing that every legal intervention contributes to shaping the future transparency and safety of the industry.`,
      `The most compelling aspect of a technical investigation is that it functions as a language of safety participation between the industry participants and the investigative bodies. Consider the "chilling effect" often discussed in modern safety discourse: if the primary aim of an inquiry is to avenge tragedy through punishment, those with the most critical insight—pilots, engineers, and air traffic controllers—may become reticent. Truth in the aftermath of a disaster is an engineered construct that requires a non-punitive environment to emerge. Safety is highly interactive; it encourages open reporting and reinforces standard operating procedures only when witnesses feel that their honesty will be protected from being utilized inappropriately in subsequent criminal or civil proceedings.`,
      `Of course, the protection of safety data is never a static administrative task; it requires a rapid and robust alignment with international standards, particularly the protocols established by ICAO. The unrestricted authority of a safety investigation agency is a necessary signaling of institutional trust, granting investigators unhampered access to wreckage, flight data recorders, and cockpit voice recordings. This sensitive information must receive absolute protection from disclosure to ensure that the investigation remains focused solely on the prevention of future accidents. This fluidity in protection is not merely a "box-checking" exercise but reflects how modern aviation must adjust its relationship to justice. Reverting to a culture of blame only degrades the systems of communication that are essential for maintaining safety in a complex global airspace.`,
      `Ultimately, mastering global aviation safety requires stakeholders to think critically about disaster management as more than just a legal hurdle. An investigation report is the lens through which the industry interprets complex failures, assigns corrective actions, and decides the safest course of action for the future. In an era where technical data mediates nearly every aspect of commercial operations, the underlying logic of the investigation shapes not only the immediate response but the safety values that underpin the entire global network. The responsibility of a state or institution is therefore both legal and professional: to craft a technical culture that is precise, situational aware, and capable of fostering a non-punitive environment where safety remains the absolute priority.`,
    ],
  },
  {
    slug: "aerospace-materials-alloy-analysis",
    title: "Comparative Analysis of Ferrous and Non-Ferrous Alloys in Modern Aircraft Structures",
    published: "2025-12-01",
    author: "Dr. G. Satyanarayana & Faculty",
    image: "fr-MnQ5umUh1Oz9juwim5IL7mzoB0",
    paragraphs: [
      `The selection of materials for modern aircraft is no longer merely a logistical choice of supply; it represents a profound engineering commitment to structural integrity where every gram of weight and every unit of tensile strength defines the envelope of flight possibility. In the context of professional B.Tech and AME education, the transition into advanced metallurgy is not just about learning a table of elements, but understanding the very foundation of how an airframe survives the stresses of the atmosphere. The resistance of a wing spar to bending, the logic of heat treatment protocols, or the fatigue limits of a turbine blade all signal specific engineering values and operational expectations. For engineers and maintenance cadets, the challenge is not only to make the aircraft "flyable" but to recognize that every material choice contributes to shaping the aircraft's long-term safety behavior. A specific alloy might offer weight efficiency, but it may also lead to structural catastrophe if its fatigue life is misunderstood. These tensions reveal that materials research is both technical and philosophical, deeply tied to how aviation safety itself evolves.`,
      `The most compelling aspect of master aerospace metallurgy is that material properties become a language of participation between the engineer and the forces of physics. Think of non-ferrous alloys—specifically aluminum, titanium, and magnesium—and their role in the airframe: their underlying logic is not neutral but actively dictates the aircraft’s performance margins. High strength-to-weight ratios are not just technical features but engineered constructs that allow for the fuel efficiency and range required by global aviation. The fly-by-wire precision of a modern jet is useless if the non-ferrous skin cannot withstand the aerodynamic loading and corrosion of high-altitude flight. This material system is thus highly interactive; it encourages certain design inputs, reinforces standard maintenance procedures, and creates a form of structural airmanship. Cadets who understand this dynamic move beyond "identifying metals" to commanding a system that actively negotiates impact resistance, energy management, and airworthiness protocols within the airspace.`,
      `Of course, the transition from conventional steels to high-performance alloys is never a static learning curve; it requires a rapid shift in response to technological complexity. The heavy, mechanical reliability of ferrous alloys in landing gear and engine mounts gives way to the sophisticated electronic and chemical signaling of advanced composites and non-ferrous structures elsewhere. This requires a more analytical, systems-oriented mindset that acknowledges both the material’s intelligence and its inevitable degradation. This fluidity in training is not merely a box-checking exercise but reflects how modern aviators must adjust their relationship to technology. Conventional maintenance once relied heavily on visual intuition, but today, managing the structural integrity of alloys requires precision testing, such as Non-Destructive Testing (NDT) and microscopic fatigue analysis. For cadets, the key is to recognize when a material functions as a stabilizing force and when the environment requires a disruption—reverting to raw data inspection—to ensure the safety context of the flight.`,
      `Ultimately, mastering the comparative analysis of alloys requires students to think critically about the aircraft as more than just a machine. The material science lab is the lens through which engineers interpret structural limits, assign trust to manufacturing standards, and decide the safest course of maintenance. In an era where global standards like the DGCA, EASA, and FAA mediate nearly every aspect of certification, the underlying logic of the material shapes not only the physical flight path but also the safety values that underpin global aviation. The responsibility for a cadet entering the hangar is therefore both technical and professional: to craft operational habits that are precise, situational aware, and capable of fostering flawless structural coordination. The future of an engineer's career will not be written solely in their ability to design, but in their mastery of the stress-strain curve, the heat treatment oven, and the way these elements work together to ensure a safe arrival in a complex global network.`,
    ],
  },
  {
    slug: "integrating-research-in-pilot-training",
    title: "Integrating Research Paper Publication into Undergraduate Pilot Training Outcomes",
    published: "2023-11-23",
    author: "Dr. G. Satyanarayana",
    image: "fr-Sx6Z8oTMLJM2yeDLwU2bcTbxkc",
    paragraphs: [
      `The evolution of undergraduate pilot training is no longer confined to the mastery of stick-and-rudder skills; it represents a profound shift into an intellectual landscape where analytical rigor and operational command are inextricably linked. In this context, the mandate for research paper publication within the "Flying Training School" is not merely an academic hurdle, but the very foundation of how a cadet interprets the complexities of modern aviation. The ability to dissect the logic of a flight management system, the nuances of meteorological phenomena, or the physics of advanced aerodynamics signals a transition from being a reactive operator to a proactive commander. For cadets, the challenge is to recognize that every research inquiry contributes to shaping their professional intuition, ensuring that their actions on the flight deck are guided by deep technical understanding rather than just rote memorization.`,
      `The most compelling aspect of integrating research into flight training is that the process of inquiry becomes a language of participation between the pilot and the rapidly evolving technology they command. When a student publishes on topics like air navigation or electronic control systems, they are engaging with "engineered constructs" that define the boundaries of safety. This requirement forces a cadet to move beyond "flying by feel" and instead develop a systematic approach to problem-solving. By investigating the underlying principles of flight envelope protections or the integration of AI in the cockpit, the trainee builds a form of situational awareness that is both technical and philosophical. This discipline encourages a mindset where technical proficiency and safety protocols are perfectly aligned, allowing the pilot to negotiate the demands of high-stakes environments with precision.`,
      `Of course, the transition from a traditional trainee to a "research-pilot" is never a static learning curve; it requires a rapid shift in response to the technological complexity of the global airspace. The move from simple mechanical linkages to complex, software-driven interfaces requires an analytical, systems-oriented mindset that acknowledges both the aircraft's intelligence and its inherent limitations. This fluidity in training—where a cadet must act as both a scientist and an operator—reflects how modern aviators must adjust their relationship to technology. Research publication acts as a stabilizing force, providing the intellectual relief needed to handle the fatigue of long-haul sectors and the pressure of emergency situations. It ensures that when automation fails or systems degrade, the pilot possesses the "raw data" of knowledge necessary to revert to manual command without hesitation.`,
      `Ultimately, mastering the flight deck requires cadets to think critically about the aircraft as a total ecosystem of data, physics, and human judgment. The publication requirement is the lens through which our trainees interpret complex systems, assign trust to technology, and decide the safest course of action. In an era where digital platforms mediate nearly every aspect of flight, the ability to contribute to the global body of aviation knowledge shapes the safety values that underpin the entire industry. The responsibility for a cadet at the Indian Institute of Aero Space Technology and Management is therefore both technical and professional: to craft operational habits that are precise, research-backed, and capable of fostering flawless leadership. The future of a pilot's career will not be written solely in the hours logged in a logbook, but in their mastery of the information systems that ensure a safe arrival in an increasingly complex global network.`,
    ],
  },
  {
    slug: "aircraft-maintenance-engineering-manual",
    title: "The Comprehensive Manual of Aircraft Maintenance Engineering: Standards and Practices",
    published: "2025-12-15",
    author: "Dr. G. Satyanarayana & IIASTM Faculty",
    image: "fr-UoBFPrBq7SNnu0LZ79EBYsFBcPY",
    paragraphs: [
      `The transition from general engineering to the specialized field of Aircraft Maintenance Engineering (AME) is not merely an acquisition of technical skill; it represents a profound entry into a world defined by absolute airworthiness and regulatory discipline. In this context, The Comprehensive Manual of Aircraft Maintenance Engineering is not just a textbook, but the foundational blueprint for how the modern engineer interprets the mechanical and digital heartbeat of an aircraft. Understanding the relationship between a throttle linkage and engine response, or the specific logic of a Cockpit Voice Recorder (CVR), requires more than a passing glance at a diagram; it requires a deep immersion into the standards that ensure a machine remains "flyable" under the most grueling conditions. For the student, the challenge is recognizing that every torque value and every inspection stamp contributes to the overarching safety of the global aviation network.`,
      `The most compelling aspect of this manual is that its chapters function as a language of participation between the engineer and the regulatory bodies like the DGCA, FAA, and EASA. Consider the sections on CAR (Civil Aviation Requirements): these are not just legal rules, but engineered constructs designed to shape an engineer's physical actions and professional ethics. Whether dealing with the "Subpart G" of Continuing Airworthiness Management or the precision required for NDT (Non-Destructive Testing), the manual teaches that true command of a hangar floor emerges when technical proficiency and a "safety-first" mindset are perfectly aligned. It encourages a culture where following a maintenance schedule is not a choice, but a rigorous habit that allows for seamless operations across different aircraft types, from a Boeing 737 to a Bell 206 helicopter.`,
      `Of course, the content within these pages is never static; it reflects a rapid shift in response to the technological complexity of fly-by-wire systems and advanced avionics. The manual guides the reader from the "raw data" of basic electrical fundamentals—the behavior of ions and compounds—to the sophisticated integration of Ground Proximity Warning Systems (GPWS) and Airborne Collision Avoidance Systems (ACAS). This fluidity in the curriculum reflects how modern aviators and engineers must adjust their relationship to technology. While the manual respects the mechanical instincts of the past, it emphasizes a systems-oriented mindset that acknowledges the aircraft's intelligence. It ensures that the reader recognizes when a system functions as a stabilizing force and when a degradation of components requires a total, disciplined overhaul.`,
      `Ultimately, mastering the contents of this manual requires a cadet to think of themselves as a guardian of the aircraft. The hangar and the cockpit are the lenses through which they interpret complex engineering failures and decide the safest course of action. In an era where digital maintenance records mediate every flight, the underlying logic of this book shapes the safety values of the entire institution. The responsibility of the student is therefore both technical and professional: to craft operational habits that are precise, documented, and capable of fostering flawless airworthiness. The future of an engineer’s career will not be written in their ability to simply fix a part, but in their mastery of the entire regulatory and technical ecosystem that ensures every takeoff leads to a safe arrival.`,
    ],
  },
] as const satisfies readonly Article[];

export type ArticleSlug = (typeof articles)[number]["slug"];

/** `articles` keeps the legacy hub order; use this for a newest-first listing. */
export const articlesByDate = (): readonly Article[] =>
  [...articles].sort((a, b) => b.published.localeCompare(a.published));

export const getArticle = (slug: string): Article | undefined => articles.find((article) => article.slug === slug);

export const readingMinutes = (article: Article): number =>
  Math.max(1, Math.round(article.paragraphs.join(" ").split(/\s+/).length / 220));

/**
 * The planned Research and Development Centre, from the owner's "Research and development.pdf"
 * (first paragraph, the two unit definitions, the six criteria for central support and the review cycle).
 */
export const researchCentre = {
  intro:
    "Aerospace Society of India is planning to develop a real time Research and Development Centre to infuse in new Technology, Management, Basic Sciences related Research Programmes. This Centre will also create a new avenue for today’s global changes in the environment. This centre calls for socio economic bodies to plan for the need of research in relation to human and environmental requirements to utilize the modern technology and infrastructure.",
  units: [
    {
      name: "Research Institute",
      body: "A single or multi-disciplinary unit organised primarily to conduct research, with research scholars, post-graduates and graduates, and funding from multiple sources rather than a single grant.",
    },
    {
      name: "Research Center",
      body: "A single or multi-disciplinary unit organised around a specific theme or topic, with a narrower scope; its lifetime is often set by the project it serves.",
    },
  ],
  /** Criteria a proposal must show to receive central matching funds. `short` is the annunciator legend. */
  criteria: [
    { short: "High impact", text: "Is high-impact, potentially transformational to a field or discipline at the national or international level." },
    { short: "Cross discipline", text: "Crosses traditional disciplinary boundaries, usually involving multiple schools or colleges, with broad impact." },
    { short: "Critical area", text: "Is potentially transforming to a critical area at the Aerospace Society of India." },
    { short: "New effort", text: "Seeds a new effort with strong potential to excel." },
    { short: "Research + teaching", text: "Integrates research and education: classroom instruction, graduate research training or community outreach." },
    { short: "New funding", text: "Creates new opportunities, with the likelihood of fostering additional research and funding." },
  ],
  proposal: [
    "The proposed name of the new unit",
    "A mission statement",
    "The principal faculty members, including the director and participating researchers",
    "A short summary of the research agenda and initial projects",
    "The organisational structure",
    "Initial and potential external funding sources",
    "The matching funds requested, and internal support and space",
  ],
  review: "Every unit, and its director, is reviewed at least every five years, and reports to the Office of Research each year.",
} as const;

export const formatPublished = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
