import { cn } from "@/lib/cn";

/**
 * The aircraft's livery line, drawn across the top of a sky field: a navy pinstripe with a fine
 * white line beside it, sweeping up towards the tail as it does above the sky-blue belly.
 */
export const Livery = ({ className }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 1440 160" preserveAspectRatio="none" className={cn("livery", className)}>
    <path d="M-20 150 C 480 146, 960 92, 1460 14" fill="none" stroke="#06182f" strokeWidth="3" vectorEffect="non-scaling-stroke" />
    <path d="M-20 140 C 480 136, 960 82, 1460 4" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
  </svg>
);
