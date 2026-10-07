"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";

// The first mount is the initial page load: it must paint immediately (LCP), so only later,
// client-side navigations get the entrance. Always false on the server.
let hasNavigated = false;

const Template = ({ children }: { children: ReactNode }) => {
  const reduced = useReducedMotion();
  const animate = hasNavigated && !reduced;

  useEffect(() => {
    hasNavigated = true;
  }, []);

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

export default Template;
