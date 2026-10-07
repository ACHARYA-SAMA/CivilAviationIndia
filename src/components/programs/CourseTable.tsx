import type { CourseRow } from "@/content/fees";
import { cn } from "@/lib/cn";

type CourseTableProps = {
  caption: string;
  rows: readonly CourseRow[];
  /** Rows whose code should read as "this programme" (detail pages). */
  highlight?: readonly string[];
  className?: string;
};

/** "3 years" -> 36, "15 Months" -> 15, "45 days" -> 1.5; null when the source wording has no number. */
const months = (duration: string): number | null => {
  const match = duration.match(/([\d.]+)\s*(year|month|week|day)/i);
  if (!match) return null;
  const n = Number(match[1]);
  const unit = match[2]!.toLowerCase();
  return unit === "year" ? n * 12 : unit === "month" ? n : unit === "week" ? n / 4.35 : n / 30;
};

/** "1,01,000 USD" -> { amount: 101000, currency: "USD" }. */
const money = (fee: string): { amount: number; currency: string } | null => {
  const match = fee.replace(/,/g, "").match(/([\d.]+)\s*([A-Z]{3})/);
  return match ? { amount: Number(match[1]), currency: match[2]! } : null;
};

const SeatIcon = () => (
  <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
    <path d="M4 2.5h4.5A1.5 1.5 0 0 1 10 4v5H5a1 1 0 0 1-1-1zM3 9.5h8.5l1.2 3.5H11l-.8-2H4a1 1 0 0 1-1-1z" fill="currentColor" />
  </svg>
);

/**
 * Fee-schedule rows exactly as the owner's PDF lists them (code, course, intake, duration, fee per
 * head), drawn so they compare at a glance: each duration and fee also as a bar against the longest
 * course and the highest fee in the same currency. Bars grow in as the table scrolls into view.
 */
export const CourseTable = ({ caption, rows, highlight = [], className }: CourseTableProps) => {
  const maxMonths = Math.max(1, ...rows.map((row) => months(row.duration) ?? 0));
  const maxFee = new Map<string, number>();
  rows.forEach((row) => {
    const m = money(row.fee);
    if (m) maxFee.set(m.currency, Math.max(maxFee.get(m.currency) ?? 0, m.amount));
  });

  return (
    <div className={cn("overflow-x-auto rounded-[14px] bg-panel p-2 shadow-[0_1px_0_rgb(11_34_64/0.04),0_20px_50px_-30px_rgb(11_50_100/0.35)] ring-1 ring-line sm:p-3", className)}>
      <table className="w-full min-w-[46rem] border-separate border-spacing-y-1 text-left">
        <caption className="px-3 pt-2 pb-4 text-left">
          <span className="heading block text-[1.375rem] text-ink">{caption}</span>
          <span className="mt-1 block text-[0.875rem] text-mute">
            {rows.length} {rows.length === 1 ? "course" : "courses"}. Bars compare duration and fee within this table.
          </span>
        </caption>
        <thead>
          <tr className="text-[0.75rem] tracking-[0.04em] text-dim">
            <th scope="col" className="px-3 pb-2 font-medium">Code</th>
            <th scope="col" className="px-3 pb-2 font-medium">Course</th>
            <th scope="col" className="w-[22%] px-3 pb-2 font-medium">Duration</th>
            <th scope="col" className="w-[22%] px-3 pb-2 text-right font-medium">Fee per head</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const own = highlight.includes(row.code);
            const length = months(row.duration);
            const fee = money(row.fee);
            const top = fee ? (maxFee.get(fee.currency) ?? 1) : 1;
            return (
              <tr key={row.no} className={cn("group/row transition-colors duration-300", own ? "bg-[#e3f2ff]" : "hover:bg-[#f0f8ff]")}>
                <td className={cn("rounded-l-[10px] py-4 pr-3 pl-3 align-middle", own && "shadow-[inset_4px_0_0_var(--color-sky-400)]")}>
                  <span className="readout inline-flex min-h-7 items-center rounded-full bg-navy px-3 text-[0.75rem] whitespace-nowrap text-white transition-colors duration-300 group-hover/row:bg-sky-500">
                    {row.code}
                  </span>
                </td>
                <th scope="row" className="px-3 py-4 align-middle font-normal">
                  <span className="block text-[1rem] leading-snug text-ink">{row.training}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-mute">
                    <SeatIcon />
                    {row.strength} seats per intake
                    {own ? <span className="ml-2 rounded-full bg-sky-400 px-2 py-0.5 text-[0.6875rem] font-semibold text-white">This programme</span> : null}
                  </span>
                </th>
                <td className="px-3 py-4 align-middle">
                  <span className="block text-[0.9375rem] whitespace-nowrap text-ink">{row.duration}</span>
                  {length ? (
                    <span aria-hidden className="mt-2 block h-1.5 overflow-hidden rounded-full bg-deck-800">
                      <span className="sd-grow block h-full rounded-full bg-sky-400/70 transition-colors group-hover/row:bg-sky-400" style={{ width: `${(length / maxMonths) * 100}%` }} />
                    </span>
                  ) : null}
                </td>
                <td className="rounded-r-[10px] px-3 py-4 text-right align-middle">
                  {fee ? (
                    <>
                      <span className="block whitespace-nowrap">
                        <span className="heading text-[1.25rem] text-ink tabular-nums">{fee.amount.toLocaleString("en-US")}</span>
                        <span className="ml-1.5 text-[0.75rem] font-semibold text-mute">{fee.currency}</span>
                      </span>
                      <span aria-hidden className="mt-2 ml-auto block h-1.5 w-full overflow-hidden rounded-full bg-deck-800">
                        <span className="sd-grow ml-auto block h-full origin-right rounded-full bg-navy/70 transition-colors group-hover/row:bg-navy" style={{ width: `${(fee.amount / top) * 100}%` }} />
                      </span>
                    </>
                  ) : (
                    <span className="text-[0.9375rem] text-ink">{row.fee}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
