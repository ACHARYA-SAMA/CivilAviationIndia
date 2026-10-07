import raw from "./fees.generated.json";
import docs from "./documents.generated.json";

/**
 * The owner's fee schedule ("1591940806077_AVIATION TRAINING PROGRAMS.pdf") and maintenance-check
 * costs, extracted by scripts/extract_fee_tables.py. Figures are verbatim, including Indian digit
 * grouping such as "1,01,000 USD". Serial no. 22 does not exist in the source.
 */
type Row = { no: number; code: string; strength: string; duration: string; fee: string };
export type CourseRow = Row & { training: string };
type TypeRow = Row & { aircraft: string[] };

const data = raw as {
  maintenance: CourseRow[];
  maintenanceTypes: TypeRow[];
  pilot: CourseRow[];
  pilotTypes: TypeRow[];
  other: CourseRow[];
  checks: string[][];
};

export const maintenanceCourses: readonly CourseRow[] = data.maintenance;
export const pilotCourses: readonly CourseRow[] = data.pilot;
export const otherCourses: readonly CourseRow[] = data.other;

const MAKERS: readonly [RegExp, string][] = [
  [/^A3/, "Airbus"],
  [/^B7/, "Boeing"],
  [/^ATR/, "ATR"],
  [/^Jetstream/, "Jetstream"],
  [/^Beechcraft/, "Beechcraft"],
  [/^(Piaggio|P180)/, "Piaggio"],
  [/^Bombardier/, "Bombardier"],
  [/^McDonnell/, "McDonnell Douglas"],
  [/^Learjet/, "Learjet"],
  [/^Cessna/, "Cessna"],
  [/^(Dassault|Falcon)/, "Dassault"],
  [/^Embraer/, "Embraer"],
  [/^(Agusta|Bell)/, "Helicopters"],
];

const makerOf = (first: string): string => MAKERS.find(([pattern]) => pattern.test(first))?.[1] ?? "Other";

export type FleetRow = {
  code: string;
  maker: string;
  aircraft: readonly string[];
  /** Engineer type course (listed under Aircraft Maintenance Engineering). */
  engineer: { duration: string; fee: string };
  /** Pilot type rating (listed under Pilot Training). */
  pilot: { duration: string; fee: string } | null;
};

const pilotByCode = new Map(data.pilotTypes.map((row) => [row.code, row]));

/** One row per aircraft family: the engineer course and the pilot type rating side by side. */
export const fleet: readonly FleetRow[] = data.maintenanceTypes.map((row) => {
  const pilot = pilotByCode.get(row.code);
  return {
    code: row.code,
    maker: makerOf(row.aircraft[0] ?? ""),
    aircraft: row.aircraft,
    engineer: { duration: row.duration, fee: row.fee },
    pilot: pilot ? { duration: pilot.duration, fee: pilot.fee } : null,
  };
});

export const fleetMakers: readonly string[] = [...new Set(fleet.map((row) => row.maker))];

export type CheckRow = { code: string; aircraft: string; period: string; strength: string; aAndB: string; cLight: string; cHeavy: string; d: string };

/** A & B check costs are blank in the source document. */
export const maintenanceChecks: readonly CheckRow[] = data.checks.map(([, code = "", aircraft = "", period = "", strength = "", aAndB = "", cLight = "", cHeavy = "", d = ""]) => ({
  code,
  aircraft,
  period,
  strength,
  aAndB,
  cLight,
  cHeavy,
  d,
}));

export type DocumentInfo = { href: string; title: string; bytes: number; pages: number };
export const documents = docs as Record<string, DocumentInfo | undefined>;

export const formatSize = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
