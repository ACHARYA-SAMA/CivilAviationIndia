/**
 * "Aviation Training Programs" (uploads: Aviation Training Programs.pdf, p.2) in the owner's order.
 * `group` is only used for layout on the Programs page.
 */
export type TrainingGroup = "maintenance" | "pilot" | "cabin" | "sciences" | "degrees";

export const trainingPrograms = [
  { name: "Aircraft Maintenance Engineering in Mechanical", group: "maintenance" },
  { name: "Aircraft Maintenance Engineering in Avionics", group: "maintenance" },
  { name: "Aircraft Maintenance Engineering in Rotor Blade", group: "maintenance" },
  { name: "Private Pilot Training", group: "pilot" },
  { name: "Commercial Pilot Training", group: "pilot" },
  { name: "Simulator Training", group: "pilot" },
  { name: "Helicopter Pilot Training", group: "pilot" },
  { name: "Cabin Crew Training", group: "cabin" },
  { name: "Diploma in Aviation Medicine", group: "sciences" },
  { name: "Degree in Aviation Medicine", group: "sciences" },
  { name: "Degree in Air Traffic Control", group: "sciences" },
  { name: "Degree in Aviation Healthcare", group: "sciences" },
  { name: "Degree in Aviation Disaster", group: "sciences" },
  { name: "Degree in Aviation Hospitality", group: "cabin" },
  { name: "Bachelor of Technology in Aerospace Engineering", group: "degrees" },
  { name: "Bachelor of Technology in Astronaut", group: "degrees" },
  { name: "Bachelor of Business Administration in Aviation", group: "degrees" },
  { name: "Master of Business Administration in Aviation", group: "degrees" },
  { name: "Ground Handling Training", group: "cabin" },
] as const satisfies readonly { name: string; group: TrainingGroup }[];

/** "Aviation Training Programs" graphic from the old home page (verbatim, including its grammar). */
export const campusProgramsIntro =
  "This campus also extends the facilities for aviation and a allied engineering programs in this campus from an International Approved organizations.";

export const campusPrograms = [
  "Aircraft Maintenance Engineering",
  "Aircraft Maintenance Organization",
  "Aviation Hospitality, Management and Communications",
  "Cabin Crew Training",
  "Flying Training School",
  "Diploma in Aviation Medicine",
  "Aviation Security Training",
  "B.Sc in Aircraft Maintenance Engineering",
  "Air Ticketing and Allied Services",
  "Air cargo & Ware House Handling",
  "Non Destructive Testing",
  "Emergency Landing On Water, Air Ambulance",
  "Basic Astronaut Training",
  "Disaster Training programs",
  "Ground Handling Airports",
] as const;
