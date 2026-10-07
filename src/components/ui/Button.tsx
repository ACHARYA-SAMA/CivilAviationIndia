import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SignLink, type SignArrow } from "./Sign";

type ButtonProps = Omit<ComponentProps<typeof Link>, "children"> & {
  /** primary = the main action; outline = a quiet secondary action. */
  variant?: "primary" | "outline";
  arrow?: SignArrow;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

/** Site CTAs; see Sign.tsx. */
export const Button = ({ variant = "primary", arrow = "none", ...rest }: ButtonProps) => (
  <SignLink tone={variant === "primary" ? "direction" : "plain"} arrow={arrow} {...rest} />
);

/** Quiet inline link with a sliding underline. */
export const TextLink = ({ href, className, children, ...rest }: Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode }) => (
  <Link
    href={href}
    className={cn(
      "inline-flex min-h-11 items-center bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat text-sky-300 transition-[background-size] duration-500 ease-flight hover:bg-[length:100%_1px]",
      className,
    )}
    {...rest}
  >
    {children}
  </Link>
);
