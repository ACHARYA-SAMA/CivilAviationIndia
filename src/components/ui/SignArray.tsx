import Link from "next/link";
import { cn } from "@/lib/cn";

type Destination = { label: string; href: string };

/**
 * Jump links to the sections of this page, as one frosted bar. Scrolls sideways on phones rather
 * than wrapping into a block.
 */
export const SignArray = ({ destinations, className }: { destinations: readonly Destination[]; className?: string }) => (
  <nav
    aria-label="On this page"
    className={cn(
      // Phones: one scrolling row that never widens its column (inline-size containment).
      // Wider screens: the bar fits its links and wraps if it must.
      "scrollbar-none flex max-w-full gap-1 rounded-[1.5rem] bg-white/60 p-1 shadow-[inset_0_0_0_1px_var(--color-line)] backdrop-blur-md max-sm:w-full max-sm:overflow-x-auto max-sm:rounded-full max-sm:[contain:inline-size] sm:w-fit sm:flex-wrap [.night_&]:bg-white/10",
      className,
    )}
  >
    {destinations.map((destination) => (
      <Link
        key={destination.href}
        href={destination.href}
        className="group/jump sign-type inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[0.9375rem] whitespace-nowrap text-ink/80 transition-colors duration-200 ease-flight hover:bg-white hover:text-ink [.night_&]:hover:bg-white/15"
      >
        {destination.label}
        <svg aria-hidden viewBox="0 0 20 20" className="size-3.5 opacity-50 transition-transform duration-300 ease-flight group-hover/jump:translate-y-0.5">
          <path d="M10 4v11m-4.5-4.5L10 15l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    ))}
  </nav>
);
