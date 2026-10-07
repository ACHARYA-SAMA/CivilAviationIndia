"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { nav, site } from "@/content/site";

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const Brand = () => (
  <Link href="/" aria-label={`${site.name}, home`} className="flex shrink-0 items-center gap-2.5">
    <Image src="/media/brand/assi-emblem.png" alt="" width={37} height={38} priority className="h-8 w-auto" />
    <span className="heading text-[1.0625rem] text-ink sm:text-[1.1875rem]">{site.name}</span>
  </Link>
);

/** Floating frosted bar: the brand, the sections, and the one action everyone looks for (Apply). */
export const Navbar = () => {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => setSolid(value > 40));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const links = nav.filter((item) => item.href !== "/");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="container-deck pt-3">
        <div
          className={cn(
            "flex h-[calc(var(--header-h)-0.75rem)] items-center justify-between gap-4 rounded-full pr-2 pl-4 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-500 ease-flight sm:pl-5",
            solid || open
              ? "bg-white/82 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7),0_16px_40px_-24px_rgb(6_24_47/0.45)]"
              : "bg-white/62 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.55),0_10px_30px_-24px_rgb(6_24_47/0.4)]",
          )}
        >
          <Brand />

          <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
            {links.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[0.9375rem] font-medium tracking-[-0.01em] transition-[color,background-color] duration-200 ease-flight",
                    active ? "bg-[#0a5bc4]/10 text-[#0a5bc4]" : "text-ink/70 hover:bg-white hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/admissions"
              className="sign-type hidden min-h-11 items-center rounded-full bg-act px-5 text-[0.9375rem] text-act-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-colors duration-200 hover:bg-act-hover sm:inline-flex"
            >
              Apply
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="grid size-11 place-items-center rounded-full bg-ink text-white xl:hidden"
            >
              <span aria-hidden className="relative block size-4">
                <span className={cn("absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ease-flight", open ? "top-[7px] rotate-45" : "top-1")} />
                <span className={cn("absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ease-flight", open ? "top-[7px] -rotate-45" : "top-[11px]")} />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="container-deck mt-2 xl:hidden"
          >
            <div className="flex max-h-[calc(100svh-var(--header-h)-1.5rem)] flex-col justify-between overflow-y-auto rounded-[28px] bg-white/92 p-6 shadow-[0_30px_60px_-30px_rgb(6_24_47/0.5)] backdrop-blur-xl">
              <ul>
                {nav.map((item) => (
                  <li key={item.href} className="border-b border-line last:border-0">
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="display flex min-h-14 items-center py-2 text-[2rem] text-ink aria-[current=page]:text-[#0a5bc4]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/admissions" className="sign-type mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-act text-[1rem] text-act-ink">
                Apply for admission
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
