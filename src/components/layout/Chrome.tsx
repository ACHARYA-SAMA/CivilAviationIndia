"use client";

import { AltitudeRail } from "./AltitudeRail";
import { CustomCursor } from "./CustomCursor";
import { ScrollProgress } from "./ScrollProgress";

/** Site-wide overlays that need client state: progress bar, altimeter rail, cursor. */
export const Chrome = () => (
  <>
    <ScrollProgress />
    <AltitudeRail />
    <CustomCursor />
  </>
);
