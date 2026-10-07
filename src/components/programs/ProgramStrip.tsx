import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import type { Program } from "@/content/programs";
import { cn } from "@/lib/cn";
import { CATEGORY_LABEL, HOLDER } from "./streams";

export { CATEGORY_LABEL, HOLDER };

const Field = ({ label, value, className }: { label: string; value: string; className?: string }) => (
  <div className={cn("min-w-0 border-line px-4 py-3 md:border-l", className)}>
    <p className="text-[0.75rem] leading-none text-dim">{label}</p>
    <p className="mt-2 text-[0.9375rem] leading-snug text-sky-300">{value}</p>
  </div>
);

/**
 * A programme as an ATC flight progress strip: holder colour, code, title, then the three figures
 * a cadet compares first. On hover the strip slides out of the board and its photo slides in
 * underneath; small screens show a thumbnail instead.
 */
export const ProgramStrip = ({ program, compact = false }: { program: Program; compact?: boolean }) => (
  <Link
    href={`/programs/${program.slug}`}
    data-cursor="Open"
    className="group/strip relative isolate flex min-h-[5.5rem] items-stretch overflow-hidden rounded-[14px] bg-panel shadow-[0_18px_40px_-30px_rgb(4_30_80/0.6)] ring-1 ring-line transition-[transform,background-color,box-shadow] duration-500 ease-flight hover:translate-x-2 hover:shadow-[0_24px_50px_-28px_rgb(4_30_80/0.7)] focus-visible:translate-x-2"
  >
    {/* The programme's photo slides in under the strip from the right on hover. */}
    {program.image ? (
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 hidden w-[62%] [clip-path:inset(0_0_0_100%)] transition-[clip-path] duration-700 ease-flight group-hover/strip:[clip-path:inset(0_0_0_0)] group-focus-visible/strip:[clip-path:inset(0_0_0_0)] md:block"
      >
        <span className="absolute inset-0 scale-110 transition-transform duration-1000 ease-flight group-hover/strip:scale-100">
          <Photo id={program.image} alt="" mode="cover" sizes="40vw" />
        </span>
        <span className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-panel),rgb(255_255_255/0.86)_35%,rgb(255_255_255/0.6))]" />
      </span>
    ) : null}
    <span aria-hidden className={cn("w-1.5 shrink-0 transition-[width] duration-500 ease-flight group-hover/strip:w-2.5", HOLDER[program.category])} />

    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[7.5rem_minmax(0,1fr)_repeat(3,minmax(0,10.5rem))]">
      <div className="hidden items-center px-4 font-mono text-[0.8125rem] text-sky-300 md:flex">{program.code ?? CATEGORY_LABEL[program.category]}</div>

      <div className="min-w-0 px-4 py-4 md:border-l md:border-line">
        <p className="font-mono text-[0.75rem] text-sky-300 md:hidden">{program.code ?? CATEGORY_LABEL[program.category]}</p>
        <h3 className="heading text-[1.5rem] text-ink transition-colors duration-300 group-hover/strip:text-amber-300 md:text-[1.75rem]">{program.title}</h3>
        <p className="mt-1 text-[0.9375rem] leading-snug text-mute">{program.tagline}</p>
      </div>

      {program.image ? (
        <div className="relative m-2 w-24 shrink-0 overflow-hidden rounded-[2px] md:hidden">
          <Photo id={program.image} alt="" mode="cover" sizes="96px" />
        </div>
      ) : (
        <span className="md:hidden" />
      )}

      {compact ? null : (
        <>
          <Field label="Duration" value={program.strip.duration} className="hidden md:block" />
          <Field label="Intake" value={program.strip.intake} className="hidden md:block" />
          <Field label="Fee" value={program.strip.fee} className="hidden md:block" />
        </>
      )}
    </div>
  </Link>
);
