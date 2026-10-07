import type { ReactNode } from "react";
import { Tilt } from "@/components/ui/Tilt";

/**
 * An honour as a stack of real photographs on a card. The stack fans out when the card is hovered,
 * and the card tilts toward the pointer.
 */
export const HonourCard = ({ title, when, text, photos }: { title: string; when: string; text: string; photos: readonly ReactNode[] }) => {
  const stack = photos.slice(0, 3);
  return (
    <Tilt max={5} className="h-full rounded-[8px]">
      <article className="group/honour flex h-full flex-col overflow-hidden rounded-[8px] bg-panel">
        <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,#5eaeef,#1263c8)]">
          {stack.map((photo, index) => {
            // The last photo is on top; the ones beneath fan out to either side on hover.
            const spread = index === stack.length - 1 ? 0 : index % 2 === 0 ? -1 : 1;
            return (
              <div
                key={index}
                className="absolute inset-[13%] overflow-hidden rounded-[3px] shadow-[0_20px_40px_-12px_rgb(4_30_80/0.5)] ring-[5px] ring-[#ffffff] transition-transform duration-700 ease-flight [transform:rotate(calc(var(--s)*4deg))] group-hover/honour:[transform:translateX(calc(var(--s)*30%))_rotate(calc(var(--s)*7deg))]"
                style={{ "--s": spread, zIndex: index } as React.CSSProperties}
              >
                {photo}
              </div>
            );
          })}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-6">
          <p className="readout text-[0.75rem] text-sky-300">{when}</p>
          <h3 className="heading text-[1.625rem] text-ink">{title}</h3>
          <p className="text-[0.9375rem] leading-relaxed text-mute">{text}</p>
        </div>
      </article>
    </Tilt>
  );
};
