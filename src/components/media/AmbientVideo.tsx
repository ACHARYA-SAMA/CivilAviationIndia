"use client";

import { useEffect, useState, type ReactNode } from "react";

type AmbientVideoProps = {
  src: string;
  /** Server-rendered poster <Photo/>; it stays underneath, so there is never an empty frame. */
  poster: ReactNode;
};

/**
 * Muted background loop for wide screens only. Phones, data-saver and reduced-motion users keep the
 * still poster, so the page never spends their bandwidth on decoration.
 */
export const AmbientVideo = ({ src, poster }: AmbientVideoProps) => {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const wide = matchMedia("(min-width: 768px)").matches;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPlay(wide && !calm && !connection?.saveData);
  }, []);

  return (
    <div className="absolute inset-0">
      {poster}
      {play ? <video src={src} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto" aria-hidden /> : null}
    </div>
  );
};
