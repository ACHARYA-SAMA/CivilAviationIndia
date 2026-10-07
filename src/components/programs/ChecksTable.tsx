import type { CheckRow } from "@/content/fees";

/** "Cost of the maintenance checks" (owner's PDF). A & B check costs are blank in the source. */
export const ChecksTable = ({ rows }: { rows: readonly CheckRow[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[46rem] border-separate border-spacing-y-1 text-left">
      <thead>
        <tr className="text-[0.8125rem] text-dim">
          <th scope="col" className="px-4 pb-2 font-normal">Code</th>
          <th scope="col" className="px-4 pb-2 font-normal">Aircraft type</th>
          <th scope="col" className="px-4 pb-2 font-normal">Period</th>
          <th scope="col" className="px-4 pb-2 font-normal">Strength</th>
          <th scope="col" className="px-4 pb-2 text-right font-normal">A &amp; B</th>
          <th scope="col" className="px-4 pb-2 text-right font-normal">C light</th>
          <th scope="col" className="px-4 pb-2 text-right font-normal">C heavy</th>
          <th scope="col" className="px-4 pb-2 text-right font-normal">D</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.code} className="bg-panel transition-colors duration-200 hover:bg-deck-700">
            <td className="rounded-l-[3px] px-4 py-3 font-mono text-[0.8125rem] text-sky-300">{row.code}</td>
            <th scope="row" className="px-4 py-3 text-[0.9375rem] font-normal text-ink">{row.aircraft}</th>
            <td className="px-4 py-3 text-[0.875rem] whitespace-nowrap text-mute">{row.period}</td>
            <td className="px-4 py-3 font-mono text-[0.8125rem] text-mute">{row.strength}</td>
            <td className="px-4 py-3 text-right text-[0.875rem] text-dim">{row.aAndB || "Not listed"}</td>
            <td className="px-4 py-3 text-right font-mono text-[0.875rem] text-ink tabular-nums">{row.cLight}</td>
            <td className="px-4 py-3 text-right font-mono text-[0.875rem] text-ink tabular-nums">{row.cHeavy}</td>
            <td className="rounded-r-[3px] px-4 py-3 text-right font-mono text-[0.875rem] text-ink tabular-nums">{row.d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
