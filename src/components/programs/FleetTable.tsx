"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { SignButton } from "@/components/ui/Sign";
import type { FleetRow } from "@/content/fees";
import { cn } from "@/lib/cn";

const VISIBLE_VARIANTS = 3;

/**
 * Type training by aircraft family: the engineer course (Aircraft Maintenance Engineering schedule)
 * and the pilot type rating (Pilot Training schedule) for the same family, side by side.
 */
export const FleetTable = ({ rows, makers }: { rows: readonly FleetRow[]; makers: readonly string[] }) => {
  const [maker, setMaker] = useState<string>("all");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          (maker === "all" || row.maker === maker) &&
          (!deferred || row.code.toLowerCase().includes(deferred) || row.aircraft.some((line) => line.toLowerCase().includes(deferred))),
      ),
    [rows, maker, deferred],
  );

  const toggle = (code: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div role="group" aria-label="Filter by manufacturer" className="flex flex-wrap gap-2">
          {["all", ...makers].map((name) => (
            <SignButton key={name} aria-pressed={maker === name} tone={maker === name ? "location" : "plain"} onClick={() => setMaker(name)}>
              {name === "all" ? "All aircraft" : name}
            </SignButton>
          ))}
        </div>
        <label className="flex min-w-[16rem] flex-col gap-2 text-[0.8125rem] text-mute">
          Find an aircraft or code
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="A320, B737 NG, TP226…"
            className="min-h-11 rounded-[10px] border border-line-strong bg-white px-3 text-[0.9375rem] text-ink placeholder:text-dim focus:border-sky-300 focus:outline-none"
          />
        </label>
      </div>

      <p aria-live="polite" className="mb-3 text-[0.8125rem] text-dim">
        {visible.length} of {rows.length} aircraft families
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-separate border-spacing-y-1 text-left">
          <thead>
            <tr className="text-[0.8125rem] text-dim">
              <th scope="col" className="px-4 pb-2 font-normal">Code</th>
              <th scope="col" className="px-4 pb-2 font-normal">Aircraft</th>
              <th scope="col" colSpan={2} className="border-l border-line px-4 pb-2 font-normal">
                Engineer type course
              </th>
              <th scope="col" colSpan={2} className="border-l border-line px-4 pb-2 font-normal">
                Pilot type rating
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const open = expanded.has(row.code);
              const [family, ...rest] = row.aircraft;
              const extra = rest.length - VISIBLE_VARIANTS;
              return (
                <tr key={row.code} className="bg-panel align-top transition-colors duration-200 hover:bg-deck-700">
                  <td className="rounded-l-[3px] px-4 py-4 font-mono text-[0.8125rem] whitespace-nowrap text-sky-300">
                    {row.code}
                    <span className="mt-1 block font-sans text-[0.75rem] text-dim">{row.maker}</span>
                  </td>
                  <th scope="row" className="px-4 py-4 font-normal">
                    <span className="block text-[0.9375rem] text-ink">{family}</span>
                    <ul className="mt-1 space-y-0.5 text-[0.8125rem] text-mute">
                      {(open ? rest : rest.slice(0, VISIBLE_VARIANTS)).map((line, index) => (
                        <li key={`${line}-${index}`}>{line}</li>
                      ))}
                    </ul>
                    {extra > 0 ? (
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => toggle(row.code)}
                        className="mt-1 min-h-9 text-[0.8125rem] text-sky-300 underline decoration-sky-300/40 underline-offset-4 hover:decoration-sky-300"
                      >
                        {open ? "Show fewer variants" : `Show ${extra} more variants`}
                      </button>
                    ) : null}
                  </th>
                  <Figures duration={row.engineer.duration} fee={row.engineer.fee} />
                  {row.pilot ? <Figures duration={row.pilot.duration} fee={row.pilot.fee} last /> : <td colSpan={2} className="rounded-r-[3px]" />}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Figures = ({ duration, fee, last = false }: { duration: string; fee: string; last?: boolean }) => (
  <>
    <td className="border-l border-line px-4 py-4 text-[0.875rem] whitespace-nowrap text-mute">{duration}</td>
    <td className={cn("px-4 py-4 text-right font-mono text-[0.875rem] whitespace-nowrap text-ink tabular-nums", last && "rounded-r-[3px]")}>{fee}</td>
  </>
);
