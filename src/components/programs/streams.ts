import type { ProgramCategory } from "@/content/programs";

/** Strip-holder colours, as on an ATC board: the colour tells you the stream. */
export const HOLDER: Record<ProgramCategory, string> = {
  pilot: "bg-amber-400",
  engineering: "bg-sky-300",
  management: "bg-ink",
  cabin: "bg-mute",
};

export const CATEGORY_LABEL: Record<ProgramCategory, string> = {
  pilot: "Pilot",
  engineering: "Engineering",
  management: "Management",
  cabin: "Cabin crew and ground",
};
