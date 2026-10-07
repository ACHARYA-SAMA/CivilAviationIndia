import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Scroll-linked effects implemented with CSS scroll-driven animations (see globals.css):
 * no JavaScript, no hydration, compositor-friendly. Safe in server and client components.
 */
type FxProps = { children: ReactNode; className?: string };

/** A photo "develops": a mask opens from the bottom edge as the frame enters the viewport. */
export const Unveil = ({ children, className }: FxProps) => <div className={cn("sd-unveil", className)}>{children}</div>;

/** Short fade-and-rise for a lead line of copy as it enters. Use sparingly. */
export const Rise = ({ children, className }: FxProps) => <div className={cn("sd-rise", className)}>{children}</div>;

/** Depth shift while crossing the viewport; `distance` is the travel each way in % of the element's height. */
export const Drift = ({ children, className, distance = 8 }: FxProps & { distance?: number }) => (
  <div className={cn("sd-drift", className)} style={{ "--drift": `${distance}%` } as CSSProperties}>
    {children}
  </div>
);
