import type { MediaId } from "./types";

/**
 * The society's activity photographs (ASSI ACTIVITIES.1.pdf, de-duplicated) filed by what they show.
 * Groups were assigned by looking at every photograph; captions are added only where the photo itself
 * says what it is (a banner, a certificate, a date stamp).
 */
export type GalleryGroup = "campus" | "exhibition" | "skill-africa" | "ceremonies" | "republic-day" | "museums" | "press";

export const GALLERY_GROUPS: Record<GalleryGroup, string> = {
  campus: "Campus and training",
  exhibition: "Aerospace Museum Exhibit 2015",
  "skill-africa": "Skill Africa, South Africa",
  ceremonies: "Ceremonies and guests",
  "republic-day": "Republic Day 2012",
  museums: "Aviation museums",
  press: "In the press",
};

const range = (pairs: string) => pairs.split(" ").map((p) => `act-${p}`);

export const galleryGroups: Record<GalleryGroup, readonly MediaId[]> = {
  campus: [
    "fr-eSHSMeASUheim9z7d7Emh0WC8",
    "fr-UFblX7rYnF73r2bLwp2xyoQdWQ",
    "fr-uZ9TIswhgcBYAsTZlzbh8NLkgWc",
    "fr-IszovutAaupnRLHIk5raIxfpVao",
    "fr-9ZxLvev23YNrQiod1gIW4xG9Kec",
    ...range("51-0 54-0 55-1 56-1 57-0 58-0 59-0 60-0 61-1 68-0 55-0"),
  ],
  exhibition: range(
    "36-0 21-0 21-1 22-0 22-1 23-0 24-0 24-1 25-0 25-1 26-0 26-1 27-0 27-1 28-0 29-0 29-1 30-0 30-1 31-0 31-1 32-0 32-1 33-0 34-0 35-0 36-1 37-0 37-1 47-0 47-1 48-0 49-0 49-1 50-0",
  ),
  "skill-africa": [
    "fr-kPLARSlG95YlgO9i6quc4TCFgQ",
    "fr-D03kQRbvKRnqTsvCvc1DowLxQ",
    "fr-aABEuDUxMU8vJREmxpZxTXE0",
    "fr-uolPdO89UrjDmV6tUakNGlgpnpM",
    ...range("01-0 01-1 02-0 02-1 03-1 04-0 04-1 05-0 06-0 06-1 07-0 07-1 08-0 08-1 09-0 09-1 10-0 10-1 11-0 11-1 12-0 12-1 13-0 13-1 14-0 15-0 15-1 16-0 16-1"),
  ],
  ceremonies: [
    "fr-hF9lSsMQUISpNJoMrzegHoBCQA",
    "fr-YJ5EbLIWLKm6G9odweb9GM4",
    "fr-W96PEox7WrQvt6Lrh8jlvdBwt8M",
    "fr-0SBQ3X7fJr7hYoTlm71VqOK4ro",
    ...range("66-1 67-1 20-0 20-1 45-1 51-1 52-1 53-0 53-1 68-1 69-0 70-0 70-1 72-0 72-1 73-1 74-0 74-1 75-0 76-1"),
  ],
  "republic-day": range("77-1 77-0 62-0 63-0 64-0 65-0"),
  museums: range("17-0 17-1 18-1 19-0 19-1"),
  press: range("45-0 39-0 40-0 41-0 42-0 43-0 44-0"),
};

/** Captions only where the photograph states it. */
export const galleryCaptions: Record<MediaId, string> = {
  "act-77-0": "Certificate from the Information and Public Relations Department, Government of Andhra Pradesh: State Level Ceremonial Parade, 26 January 2012",
  "act-77-1": "The institute’s tableau of space-craft, radar and satellite models, Republic Day 2012",
  "act-55-1": "Cadets on parade, 15 August 2010",
  "act-55-0": "The campus at Kompally ‘X’ Roads, from the institute’s brochure",
  "fr-eSHSMeASUheim9z7d7Emh0WC8": "The institute’s training aircraft in its hangar",
  "fr-kPLARSlG95YlgO9i6quc4TCFgQ": "The Skill Africa flag",
  "fr-D03kQRbvKRnqTsvCvc1DowLxQ": "Memorandum of Understanding with the Maluti-A-Phofung Local Municipality",
  "fr-hF9lSsMQUISpNJoMrzegHoBCQA": "Asia Education Summit 2015",
  "fr-YJ5EbLIWLKm6G9odweb9GM4": "Asia Education Summit 2015",
  "act-34-0": "National Aerospace Museum Exhibit",
  "act-36-0": "Full-size space shuttle model at the exhibit",
  "act-51-1": "Inauguration of the IGNOU–ISTE programme centre",
  "act-52-1": "IGNOU–ISTE programme centre",
};
