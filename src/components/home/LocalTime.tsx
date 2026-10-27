"use client";

import { useEffect, useState } from "react";

/** A partner's local time (HH:MM), filled in after hydration so server and client never disagree. */
export const LocalTime = ({ timeZone, className }: { timeZone: string; className?: string }) => {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return <span className={className}>{time ?? "--:--"}</span>;
};
