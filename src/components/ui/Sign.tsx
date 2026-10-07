import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Magnetic } from "./Magnetic";

/**
 * Buttons and links that act. Pills in sentence case.
 *  direction: the primary action (deep sky blue; white on night surfaces, navy on sky fields).
 *  location:  the selected / current state.
 *  plain:     a quiet secondary action on frosted white.
 * An icon is shown only where it tells you something: down = further down this page,
 * up-right = opens a file or another site.
 */
export type SignArrow = "right" | "left" | "down" | "up-right" | "none";
export type SignTone = "direction" | "location" | "plain";
type SignSize = "sm" | "md" | "lg";

const ROTATION: Record<Exclude<SignArrow, "none">, string> = { right: "", left: "rotate-180", down: "rotate-90", "up-right": "-rotate-45" };
const NUDGE: Record<Exclude<SignArrow, "none">, string> = {
  right: "group-hover/sign:translate-x-0.5",
  left: "group-hover/sign:-translate-x-0.5",
  down: "group-hover/sign:translate-y-0.5",
  "up-right": "group-hover/sign:translate-x-0.5 group-hover/sign:-translate-y-0.5",
};

/** Thin arrow, drawn to the text's weight. */
const SignGlyph = ({ arrow }: { arrow: Exclude<SignArrow, "none"> }) => (
  <svg aria-hidden viewBox="0 0 20 20" className={cn("size-[1em] shrink-0 transition-transform duration-300 ease-flight", NUDGE[arrow])}>
    <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={cn("origin-center", ROTATION[arrow])} />
  </svg>
);

const SIZES: Record<SignSize, string> = {
  sm: "min-h-10 gap-2 px-4 text-[0.9375rem]",
  md: "min-h-12 gap-2.5 px-6 text-[1rem]",
  lg: "min-h-14 gap-3 px-7 text-[1.0625rem]",
};

const TONES: Record<SignTone, string> = {
  direction: "bg-act text-act-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_24px_-12px_rgb(6_24_47/0.55)] hover:bg-act-hover",
  location: "bg-on text-on-ink",
  plain: "bg-white/75 text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] backdrop-blur-md hover:bg-white [.night_&]:bg-white/10 [.night_&]:hover:bg-white/18",
};

export const signClass = ({ tone = "direction", size = "md" }: { tone?: SignTone; size?: SignSize } = {}) =>
  cn(
    "group/sign sign-type inline-flex items-center justify-center rounded-full whitespace-nowrap transition-[background-color,box-shadow,color] duration-200 ease-flight active:scale-[0.98]",
    SIZES[size],
    TONES[tone],
  );

const Legend = ({ arrow, children }: { arrow: SignArrow; children: ReactNode }) => (
  <>
    {arrow === "left" ? <SignGlyph arrow="left" /> : null}
    <span>{children}</span>
    {arrow !== "none" && arrow !== "left" ? <SignGlyph arrow={arrow} /> : null}
  </>
);

type SignLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  arrow?: SignArrow;
  tone?: SignTone;
  size?: SignSize;
  magnetic?: boolean;
  children: ReactNode;
};

export const SignLink = ({ arrow = "none", tone = "direction", size = "md", magnetic = tone === "direction", className, children, ...rest }: SignLinkProps) => {
  const link = (
    <Link className={cn(signClass({ tone, size }), className)} {...rest}>
      <Legend arrow={arrow}>{children}</Legend>
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
};

/** Plain anchor version for files and external targets (download, new tab). */
export const SignAnchor = ({
  arrow = "up-right",
  tone = "plain",
  size = "sm",
  className,
  children,
  ...rest
}: Omit<ComponentProps<"a">, "children"> & { arrow?: SignArrow; tone?: SignTone; size?: SignSize; children: ReactNode }) => (
  <a className={cn(signClass({ tone, size }), className)} {...rest}>
    <Legend arrow={arrow}>{children}</Legend>
  </a>
);

export const SignButton = ({
  arrow = "none",
  tone = "location",
  size = "sm",
  className,
  children,
  ...rest
}: Omit<ComponentProps<"button">, "children"> & { arrow?: SignArrow; tone?: SignTone; size?: SignSize; children: ReactNode }) => (
  <button type="button" className={cn(signClass({ tone, size }), className)} {...rest}>
    <Legend arrow={arrow}>{children}</Legend>
  </button>
);
