"use client";

import { useEffect, useRef, useState } from "react";

/** Cal.com booking page, loaded only when the section approaches the viewport (it is heavy). */
export const CalEmbed = ({ link }: { link: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setShow(true), { rootMargin: "600px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="min-h-[44rem] overflow-hidden rounded-[3px] bg-panel" data-lenis-prevent>
      {show ? (
        <iframe
          title="Book a 15-minute meeting with admissions"
          src={`https://cal.com/${link}?embed=true&theme=dark`}
          className="h-[44rem] w-full"
          loading="lazy"
        />
      ) : null}
    </div>
  );
};
