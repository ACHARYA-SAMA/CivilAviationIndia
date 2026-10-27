"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { nav } from "@/content/site";
import { DUR, EASE } from "@/lib/motion";

// The first mount is the initial page load: it must paint immediately (LCP), so only later,
// client-side navigations get the entrance. Always false on the server.
let hasNavigated = false;

const destination = (pathname: string) =>
  [...nav].reverse().find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))?.label ?? "Civil Aviation India";

/**
 * Client-side navigations open on a navy curtain that names the destination, like a gate sign,
 * then lifts away while the new page rises into place.
 */
const Template = ({ children }: { children: ReactNode }) => {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const animate = hasNavigated && !reduced;

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <>
      {animate ? (
        <motion.div
          aria-hidden
          className="night pointer-events-none fixed inset-0 z-[90] flex items-end bg-[radial-gradient(120%_80%_at_70%_20%,#0d3470_0%,#08214a_45%,#041228_100%)]"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.85, ease: EASE, delay: 0.32 }}
        >
          <motion.div
            className="container-deck pb-[8vh]"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: [0, 1, 1, 0], y: [26, 0, 0, -30] }}
            transition={{ duration: 1.05, ease: EASE, times: [0, 0.3, 0.55, 1] }}
          >
            <p className="readout text-[0.8125rem] tracking-[0.2em] text-sky-300 uppercase">Now arriving</p>
            <p className="display mt-3 text-[clamp(3rem,9vw,8.5rem)] text-white">{destination(pathname)}</p>
          </motion.div>
        </motion.div>
      ) : null}
      <motion.div
        initial={animate ? { opacity: 0, y: 40 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASE, delay: animate ? 0.38 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default Template;
