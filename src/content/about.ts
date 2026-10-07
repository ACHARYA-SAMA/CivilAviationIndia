import type { MediaId } from "./types";

/**
 * Verbatim from the legacy About page. Three apostrophes/dashes were stored as the
 * replacement character (U+FFFD) in the export; they are restored here as ’ and —.
 */
export const about = {
  heading: "About PRESIDENT",
  president: {
    name: "Dr. G. Satyanarayana",
    body: `Dr. G. Satyanarayana leads the Aero Space Society of India and the Indian Institute of Aero Space Technology and Management with an unwavering commitment to aeronautical excellence and operational discipline. As President, he views aviation education not merely as academic instruction, but as the systematic forging of absolute resilience and functional command. Under his guidance, the institution treats every curriculum module—from foundational aerodynamics to complex aerospace management—as a critical framework where clarity defines action. His visionary leadership ensures that cadets do not just learn protocol, but internalize a culture of safety, precision, and situational awareness that will endure throughout their lifelong careers in the global airspace.`,
  },
  sections: [
    {
      id: "awards",
      heading: "AWARDS",
      paragraphs: [
        `Our pursuit of flawless execution and educational integrity has consistently been validated on prestigious national and international platforms. Dr. Satyanarayana’s transformative contributions to aerospace education were notably honored at the Asia Education Summit 2015, recognizing the institute's dedication to building a coherent and world-class safety system. Domestically, the institution's profound impact on space science awareness was celebrated with wide acclaim by the Government of Andhra Pradesh during the State Level Ceremonial Parade for our technological demonstrations.`,
        `These accolades reflect a philosophy that values structural rigor over shortcuts, serving as a testament to our ongoing mission to elevate technical proficiency to its highest standard.`,
      ],
    },
    {
      id: "achievements",
      heading: "ACHIEVEMENTS",
      paragraphs: [
        `Since our establishment in 1994, we have successfully bridged the critical gap between theoretical analysis and applied aerospace engineering, forging robust pathways for aspiring aviators. Beyond launching the pioneering Indian Institute of Aero Space Technology and Management, Dr. Satyanarayana spearheaded the creation of the National Aerospace Museum Exhibit and the groundbreaking "Skill Africa" initiative, taking our instructional blueprint to an international scale. By consistently aligning our training with the stringent standards of regulatory bodies like the DGCA, FAA, and ICAO, we have cultivated an environment where cadets adapt seamlessly to any challenge, turning rigorous simulations into the functional, decisive skills capable of saving lives.`,
      ],
    },
    {
      id: "global-partners",
      heading: "GLOBAL PARTNERS",
      paragraphs: [
        `Our international alliances are constructed with the same intention and discipline that define our flight training, ensuring our cadets are prepared for the complexities of a borderless aviation industry. We have established formalized partnerships with global entities—including strategic Memorandums of Understanding with the Maluti-A-Phofung Local Municipality in South Africa—to drive the "Skill Africa" initiative and expand the horizons of aerospace education.`,
        `By collaborating with international state premiers, civil aviation authorities, and allied engineering leadership, we ensure that our curriculum remains resilient, relevant, and continually updated to reflect the evolving demands of global airspace protocols.`,
      ],
    },
  ],
  /**
   * Photographs for the About page, matched to the text by what is visible in them
   * (Asia Education Summit 2015 banner, National Aerospace Museum Exhibit banner, Skill Africa flag and
   * Maluti-A-Phofung MoU signing, State Level Ceremonial Parade certificate).
   */
  photos: {
    summit: ["fr-hF9lSsMQUISpNJoMrzegHoBCQA", "fr-RyK6o8YZMMqtchMTj5PuGC13qEI", "fr-YJ5EbLIWLKm6G9odweb9GM4", "fr-XQaeI7Ll7eqokr3UbrnLsP1gFgQ"],
    museumExhibit: ["act-34-0", "act-36-0", "act-31-1", "act-30-0"],
    skillAfrica: ["fr-kPLARSlG95YlgO9i6quc4TCFgQ", "fr-D03kQRbvKRnqTsvCvc1DowLxQ", "fr-SSTGRIvqZH3NXyEerxZeHAI2mE", "fr-aABEuDUxMU8vJREmxpZxTXE0"],
    parade: ["act-77-1", "act-77-0"],
  },
} as const satisfies {
  heading: string;
  president: { name: string; body: string };
  sections: readonly { id: string; heading: string; paragraphs: readonly string[] }[];
  photos: Record<string, readonly MediaId[]>;
};

/**
 * Milestones for the route map. Each one is backed by a document in the owner's uploads: the society
 * registration, dated photographs, the Andhra Pradesh I&PR certificate, and the appreciation letters.
 */
export type Milestone = {
  /** Five-letter waypoint ident, as on a flight plan (decorative). */
  ident: string;
  when: string;
  title: string;
  body: string;
  photo?: MediaId;
  photoAlt?: string;
};

export const milestones: readonly Milestone[] = [
  {
    ident: "ESTAB",
    when: "1994",
    title: "The Aero Space Society of India is established",
    body: "“Since our establishment in 1994, we have successfully bridged the critical gap between theoretical analysis and applied aerospace engineering.”",
  },
  {
    ident: "PARAD",
    when: "15 Aug 2010",
    title: "Cadets on parade",
    body: "Independence Day on campus, as dated on the photograph.",
    photo: "act-55-1",
    photoAlt: "Cadets in uniform standing in formation on the campus ground",
  },
  {
    ident: "TBLAU",
    when: "26 Jan 2012",
    title: "Republic Day tableau",
    body: "The institute joined the State Level Ceremonial Parade with a tableau of space-craft, radar and satellite models. The Government of Andhra Pradesh’s Information and Public Relations Department certified that it “received wide acclaim from the viewers”.",
    photo: "act-77-1",
    photoAlt: "The institute's Republic Day tableau truck with rocket and satellite models",
  },
  {
    ident: "GRDN1",
    when: "Jun–Aug 2012",
    title: "The 1st Guardian Programme",
    body: "An industry–institute programme welcomed in messages from Narendra Modi, then Chief Minister of Gujarat, and the President of India, Pranab Mukherjee.",
  },
  {
    ident: "RG169",
    when: "2012",
    title: "Registered society, no. 1691 of 2012",
    body: "Registered under the Andhra Pradesh Societies Registration Act 2001 (Act no. 35 of 2001).",
  },
  {
    ident: "UNION",
    when: "Jun 2014",
    title: "Letters from New Delhi",
    body: "The Prime Minister’s Office and the offices of twenty Union ministers reply to the institute’s letters of felicitation.",
  },
  {
    ident: "SUMIT",
    when: "2015",
    title: "Asia Education Summit",
    body: "Dr. G. Satyanarayana’s contributions to aerospace education are honoured at the Asia Education Summit 2015.",
    photo: "fr-hF9lSsMQUISpNJoMrzegHoBCQA",
    photoAlt: "An award presented on stage at the Asia Education Summit 2015",
  },
  {
    ident: "MUSEM",
    when: "27–29 Nov 2015",
    title: "National Aerospace Museum Exhibition",
    body: "The society’s ceremony and exhibition at Ramoji Film City, Hyderabad, with a souvenir, “The Aerospace Society of India”. Schools visited the full-size shuttle and aircraft models.",
    photo: "act-36-0",
    photoAlt: "A full-size space shuttle model in the exhibition hall",
  },
  {
    ident: "SKLAF",
    when: "South Africa",
    title: "Skill Africa",
    body: "A Memorandum of Understanding with the Maluti-A-Phofung Local Municipality takes the institute’s training blueprint abroad.",
    photo: "fr-kPLARSlG95YlgO9i6quc4TCFgQ",
    photoAlt: "The Skill Africa flag held up at a meeting",
  },
];

/** Global partners and the standards the curriculum is aligned with (About text), placed for the globe. */
export type Partner = { id: string; name: string; relation: string; place: string; lat: number; lon: number };

export const home_base = { name: "IIASTM, Kompally", lat: 17.53, lon: 78.48 } as const;

export const partners: readonly Partner[] = [
  { id: "map", name: "Maluti-A-Phofung Local Municipality", relation: "Memorandum of Understanding, Skill Africa initiative", place: "Free State, South Africa", lat: -28.27, lon: 29.12 },
  { id: "dgca", name: "DGCA", relation: "Training aligned with India’s civil aviation regulator", place: "New Delhi", lat: 28.61, lon: 77.21 },
  { id: "icao", name: "ICAO", relation: "International standards for training and safety investigation", place: "Montréal", lat: 45.5, lon: -73.57 },
  { id: "faa", name: "FAA", relation: "Maintenance and pilot standards", place: "Washington, D.C.", lat: 38.9, lon: -77.04 },
  { id: "easa", name: "EASA", relation: "European maintenance standards (AME curriculum)", place: "Cologne", lat: 50.94, lon: 6.96 },
];
