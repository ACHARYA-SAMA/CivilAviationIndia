import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { ProgramCategory } from "@/content/programs";
import { CATEGORY_LABEL, HOLDER } from "./streams";

export type PassProgram = {
  slug: string;
  category: ProgramCategory;
  code?: string;
  title: string;
  short: string;
  strip: { duration: string; intake: string; fee: string };
};

/** Decorative barcode: bar widths derived from the programme code, so every pass is different. */
const Barcode = ({ seed, className }: { seed: string; className?: string }) => {
  let h = 2166136261;
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; x < 120; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i % seed.length) ^ i, 16777619);
    const w = 1 + ((h >>> 3) % 3);
    const gap = 1 + ((h >>> 7) % 2);
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg aria-hidden viewBox="0 0 120 40" preserveAspectRatio="none" className={className}>
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y={0} width={bar.w} height={40} fill="currentColor" />
      ))}
    </svg>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[0.625rem] tracking-[0.14em] text-[#546a89] uppercase">{label}</p>
    <p className="mt-1 text-[0.875rem] leading-tight font-semibold text-[#0b2240]">{value}</p>
  </div>
);

/**
 * A programme as a boarding pass: from the campus (HYD, Kompally) to the programme. White stock with a
 * sky-blue airline band carrying the society's emblem, perforation and a sky-tinted stub with the code. Pure markup, so it renders
 * on the server or inside client lists alike.
 */
export const BoardingPass = ({ program, photo, className }: { program: PassProgram; photo: ReactNode; className?: string }) => (
  <Link
    href={`/programs/${program.slug}`}
    data-cursor="Board"
    draggable={false}
    className={cn(
      "group/pass relative flex h-full w-full overflow-hidden rounded-[16px] bg-white text-[#0b2240] shadow-[0_2px_0_rgb(11_34_64/0.04),0_30px_70px_-34px_rgb(11_50_100/0.55)] ring-1 ring-[#0b2240]/6 [transform-style:preserve-3d]",
      className,
    )}
  >
    {/* Photo panel */}
    <div className="relative hidden w-[29%] shrink-0 overflow-hidden sm:block">
      <div className="absolute inset-0 transition-transform duration-700 ease-flight group-hover/pass:scale-[1.06]">{photo}</div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(14_111_199/0.55),transparent_55%)]" />
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", HOLDER[program.category])} />
    </div>

    {/* Main body */}
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
      <span aria-hidden className={cn("absolute inset-y-0 left-0 z-[1] w-1.5 sm:hidden", HOLDER[program.category])} />
      {/* Airline header band with the society's emblem */}
      <div className="flex items-center justify-between gap-3 bg-[linear-gradient(100deg,#1a86e3,#0d6dc6)] px-5 py-2.5 text-white sm:px-6">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
            <Image src="/media/brand/assi-emblem.png" alt="" width={24} height={24} className="size-6" />
          </span>
          <span className="sign-type truncate text-[0.75rem] tracking-[0.08em]"><span className="sm:hidden">ASSI</span><span className="hidden sm:inline">Civil Aviation India</span></span>
        </span>
        <span className="shrink-0 text-[0.625rem] tracking-[0.18em] text-white/85 uppercase">Boarding pass</span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-5 pt-4 sm:p-6 sm:pt-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-4 sm:grid-cols-[auto_1.75rem_minmax(0,1fr)] sm:gap-3">
          <div>
            <p className="text-[0.625rem] tracking-[0.14em] text-[#546a89] uppercase">From</p>
            <p className="display text-[1.75rem] leading-none text-[#0b2240] sm:text-[2rem]">HYD</p>
            <p className="mt-1 text-[0.6875rem] text-[#546a89]">Kompally</p>
          </div>
          <svg aria-hidden viewBox="0 0 24 24" className="mb-6 hidden size-5 rotate-90 text-[#1a86e3] transition-transform duration-500 ease-flight group-hover/pass:translate-x-1 sm:block">
            <path d="M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.1l-8-2.3v4.6l2.4 1.7v1.8L12 20.6l-3.9 1.1v-1.8l2.4-1.7v-4.6l-8 2.3v-2.1l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z" fill="currentColor" />
          </svg>
          <div className="min-w-0">
            <p className="text-[0.625rem] tracking-[0.14em] text-[#546a89] uppercase">To</p>
            <p className="heading text-[1.0625rem] leading-[1.08] tracking-[-0.02em] break-words hyphens-auto transition-colors duration-300 group-hover/pass:text-[#0d6dc6]">{program.short}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-dashed border-[#0b2240]/15 pt-3">
          <Field label="Duration" value={program.strip.duration} />
          <Field label="Intake" value={program.strip.intake} />
          <Field label="Class" value={CATEGORY_LABEL[program.category]} />
        </div>
      </div>
    </div>

    {/* Perforation */}
    <div aria-hidden className="relative w-0">
      <span className="absolute -top-3 -left-3 size-6 rounded-full bg-[#3ba4f2]" />
      <span className="absolute -bottom-3 -left-3 size-6 rounded-full bg-[#3ba4f2]" />
      <span className="absolute inset-y-4 left-0 border-l-2 border-dotted border-[#0b2240]/20" />
    </div>

    {/* Stub, tinted sky */}
    <div className="flex w-[19%] max-w-28 shrink-0 flex-col items-center justify-between gap-3 bg-[#eaf4fe] py-5 pr-3 pl-4">
      <p className="readout text-center text-[0.8125rem] leading-tight font-bold text-[#0d6dc6]">{program.code ?? CATEGORY_LABEL[program.category]}</p>
      <Barcode seed={program.code ?? program.slug} className="h-16 w-full text-[#0b2240]" />
      <div className="text-center">
        <p className="text-[0.625rem] tracking-[0.14em] text-[#546a89] uppercase">Fee</p>
        <p className="mt-1 text-[0.75rem] leading-tight font-semibold">{program.strip.fee}</p>
      </div>
    </div>

    {/* Holographic foil: shifts with the tilt sheen position. */}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,transparent_20%,rgb(120_200_255/0.4)_35%,rgb(200_180_255/0.25)_45%,rgb(160_230_255/0.3)_55%,transparent_70%)] bg-[length:250%_100%] bg-[position:var(--gx,50%)_0] opacity-0 mix-blend-multiply transition-opacity duration-300 group-hover/pass:opacity-50"
    />
  </Link>
);
