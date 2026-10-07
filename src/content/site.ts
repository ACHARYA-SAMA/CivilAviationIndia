import type { MediaId } from "./types";

/** Everything below is taken from the owner's uploads (facade photo, programme documents, old Framer export). */
export const site = {
  name: "Civil Aviation India",
  society: "Aero Space Society of India",
  societyShort: "ASSI",
  institute: "Indian Institute of Aero Space Technology and Management",
  instituteShort: "IIASTM",
  motto: "Reach for the sky",
  established: 1994,
  accreditation: "Accredited Centre of Aerospace, Aeronautics, Maintenance and Allied Core Engineering",
  registration:
    "Registered under the Andhra Pradesh Societies Registration Act 2001 (Act no. 35 of 2001). Registered no. 1691 of 2012",
  iso: "ISO 9001:2000 certified institute",
  description:
    "Civil Aviation India is the nation's premier aviation academy working exclusively with elite cadets and global airline partners.",
  copyright: "Copyright 2026. All rights reserved.",
  url: "https://www.civilaviationindia.com",
  emblem: "assi-emblem" satisfies MediaId,
} as const;

/** Printed on the institute's facade brochure (uploads: ASSI ACTIVITIES.1.pdf, page 55). */
export const contact = {
  addressLines: ["Sy. No. 158 & 160, Kompally 'X' Roads", "Kompally, Secunderabad 500 014", "Andhra Pradesh, India"],
  email: "iiastm@yahoo.com",
  phones: [
    { label: "09393660097", href: "tel:+919393660097" },
    { label: "09347253325", href: "tel:+919347253325" },
    { label: "08418-232411", href: "tel:+918418232411" },
  ],
  /** Kompally, Secunderabad. */
  coordinates: "17°32′ N  78°29′ E",
} as const;

export type NavItem = { label: string; href: string };

/** Navigation order requested by the owner; legacy URL typos fixed. */
export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Admissions", href: "/admissions" },
  { label: "Research & Media", href: "/research" },
  { label: "Gallery", href: "/gallery" },
  { label: "Student Portal", href: "/student-portal" },
] as const satisfies readonly NavItem[];

export const footerSitemap = [
  { label: "Programs", href: "/programs" },
  { label: "Fleet", href: "/programs#fleet" },
  { label: "Journal", href: "/research" },
  { label: "Appreciation Letters", href: "/about/appreciation-letters" },
] as const satisfies readonly NavItem[];

/** Verbatim home copy (old Framer home + HOME PAGE.docx). */
export const home = {
  mission:
    "We believe aviation is a discipline of absolute precision and unwavering mastery. Our curriculum bridges cutting-edge aerospace technology with rigorous, world-class instruction to forge the leaders of tomorrow’s skies.",
  statement:
    "Civil Aviation India is the nation's premier aviation academy working exclusively with elite cadets and global airline partners.",
  heroImage: "fr-gHf6FbF3cgMIH3vYkWt4nNdE8EU" satisfies MediaId,
  tracks: [
    { id: "maintenance", label: "Aircraft Maintenance", program: "aircraft-maintenance-engineering", image: "fr-uZ9TIswhgcBYAsTZlzbh8NLkgWc" },
    { id: "pilot", label: "Pilot and Simulator Training", program: "commercial-pilot-license", image: "fr-fBCDLWF1y2obyTxEHy1WjW7ccxk" },
    { id: "engineering", label: "Core Engineering and Management", program: "btech-aerospace-engineering", image: "fr-UFblX7rYnF73r2bLwp2xyoQdWQ" },
    { id: "disaster", label: "Disaster Management", program: "aviation-disaster-management", image: "fr-rkREa4FF87drJDq1xrEqoFOBX4" },
  ] as const,
  trainingIntro:
    "Our curriculum bridges foundational aerodynamics and advanced flight operations, balancing rigorous theory with intensive simulator hours.",
  researchIntro:
    "We share perspectives on aerospace technology, global aviation trends, and the realities of command, exploring ideas that inspire pilots",
  closing: "Ascend to command.",
  // The same line, broken where the sky-writing aircraft starts a new pass.
  closingLines: ["Ascend to", "command."],
} as const;

/**
 * Admissions. The procedure, eligibility and outcomes are transcribed from the "Course Details" slide of
 * the owner's PILOT TRAINING.pdf (Flying Training School); the intro is the old admissions page text.
 */
export const admissions = {
  intro: home.mission,
  source: "Flying Training School",
  eligibilityTitle: "Eligibility (10+2 MPC)",
  eligibility: "Candidates with a qualified certificate in 10+2 studies would be eligible for applying for the Flying School Training Program.",
  procedure: [
    "Candidates enroll by applying on the website.",
    "After a round of scrutiny, pre-admission offer is given along with preparatory material.",
    "Pre-coursework preparation is graded by the Mobile Application.",
    "Commencement of Classes",
  ],
  outcomes: ["Course Completion Certificate", "Graded Student Activity Log", "Unique Identification Number", "Research Paper Publication"],
} as const;

/** Cal.com booking (e.g. "assi/15min"). Booking UI only appears once this is set. */
export const calLink = process.env.NEXT_PUBLIC_CAL_LINK?.trim() || null;

/** Old student-portal form fields, shown as a preview until real sign-in exists. */
export const studentPortal = {
  fields: [
    { id: "student-name", label: "Student name", type: "text", placeholder: "type name here" },
    { id: "student-email", label: "Email", type: "email", placeholder: "name@civilaviation.edu" },
  ],
} as const;
