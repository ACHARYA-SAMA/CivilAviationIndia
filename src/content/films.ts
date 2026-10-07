import type { MediaId } from "./types";

/** The society's films from the old site (live-site originals), captioned from what each one shows. */
export type Film = { id: MediaId; title: string; detail: string; duration: string; language?: string };

export const films: readonly Film[] = [
  {
    id: "video-C5eNHX5de3nvVkXNT5M43qZrpe4",
    title: "Give wings to your dreams",
    detail: "The society’s film announcing its ceremony and exhibition of 27 to 29 November 2015.",
    duration: "0:47",
  },
  {
    id: "video-ZXWsvw51LZaOmHYcmEI8noyXS6w",
    title: "ETV Telangana, Yuva",
    detail: "Television report on the aerospace exhibition at Ramoji Film City: the shuttle model, engine parts and visiting schools.",
    duration: "4:11",
    language: "Telugu",
  },
  {
    id: "video-QopV5GNEpT3TObCcv1wYVJh1M",
    title: "ETV Andhra Pradesh",
    detail: "Cadets of the institute interviewed among the aircraft and engine exhibits.",
    duration: "5:31",
    language: "Telugu",
  },
  {
    id: "video-aIE1JSOilnhredQcDJz8VD61hzg",
    title: "IIASTM in pictures",
    detail: "The institute’s slideshow: programmes offered, board of directors, affiliated bodies and tie-ups.",
    duration: "3:08",
  },
];
