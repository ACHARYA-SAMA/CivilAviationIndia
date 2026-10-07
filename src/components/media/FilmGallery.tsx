"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";

export type FilmItem = { id: string; title: string; detail: string; duration: string; language?: string; src: string; poster: string; width: number; height: number; blur: string };

/**
 * Film cards (poster, title, running time) that open into a dark screening room: the video plays
 * full-width with native controls; Esc, the close button or the backdrop ends it and returns focus.
 */
export const FilmGallery = ({ films, className }: { films: readonly FilmItem[]; className?: string }) => {
  const [playing, setPlaying] = useState<FilmItem | null>(null);
  const reduced = useReducedMotion();
  const opener = useRef<HTMLElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!playing) return;
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPlaying(null);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      opener.current?.focus();
    };
  }, [playing]);

  return (
    <>
      <ul className={cn("grid gap-6 sm:grid-cols-2", className)}>
        {films.map((film, index) => (
          <li key={film.id} className={cn(index === 0 && "sm:col-span-2")}>
            <button
              type="button"
              data-cursor="Play"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setPlaying(film);
              }}
              className="group/film block w-full text-left"
            >
              <span className={cn("night relative block overflow-hidden rounded-[6px] bg-deck-900", index === 0 ? "aspect-[21/9]" : "aspect-video")}>
                <Image
                  src={film.poster}
                  alt=""
                  fill
                  sizes={index === 0 ? "(min-width: 1024px) 80vw, 100vw" : "(min-width: 640px) 40vw, 100vw"}
                  placeholder="blur"
                  blurDataURL={film.blur}
                  className="object-cover transition-transform duration-1000 ease-flight group-hover/film:scale-[1.05]"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-deck-950/90 via-deck-950/20 to-transparent" />
                {/* Sprocket holes, as on a film strip. */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-4 bg-[radial-gradient(circle,rgb(5_8_15/0.85)_38%,transparent_42%)] bg-[length:18px_16px] opacity-0 transition-opacity duration-300 group-hover/film:opacity-100" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-4 bg-[radial-gradient(circle,rgb(5_8_15/0.85)_38%,transparent_42%)] bg-[length:18px_16px] opacity-0 transition-opacity duration-300 group-hover/film:opacity-100" />
                <span aria-hidden className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-[0_0_0_10px_rgb(255_255_255/0.2)] transition-transform duration-500 ease-flight group-hover/film:scale-110">
                  <svg viewBox="0 0 24 24" className="ml-1 size-7">
                    <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
                  </svg>
                </span>
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
                  <span className="min-w-0">
                    <span className="heading block text-[clamp(1.375rem,2.2vw,2rem)] text-ink">{film.title}</span>
                    <span className="mt-1 block max-w-xl text-[0.9375rem] leading-snug text-ink/80">{film.detail}</span>
                  </span>
                  <span className="readout shrink-0 text-[0.8125rem] text-sky-300">
                    {film.duration}
                    {film.language ? <span className="block text-right text-dim">{film.language}</span> : null}
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {playing ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={playing.title}
            className="night fixed inset-0 z-[90] grid place-items-center bg-deck-950/95 p-4 backdrop-blur-md md:p-10"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
            onClick={(event) => event.target === event.currentTarget && setPlaying(null)}
          >
            <div className="w-full max-w-6xl">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="heading text-[1.5rem] text-ink">{playing.title}</p>
                  <p className="readout text-[0.8125rem] text-sky-300">{playing.duration}</p>
                </div>
                <button
                  ref={close}
                  type="button"
                  onClick={() => setPlaying(null)}
                  className="sign-type inline-flex min-h-11 items-center rounded-[6px] bg-white px-4 text-[0.9375rem] text-navy hover:bg-[#d6ecff]"
                >
                  Close
                </button>
              </div>
              <video
                key={playing.id}
                src={playing.src}
                poster={playing.poster}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full rounded-[6px] bg-black"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
