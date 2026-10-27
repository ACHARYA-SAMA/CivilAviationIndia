/**
 * The aircraft's main systems for the anatomy studio on Home, each tied to the programme that trains
 * people to fly, maintain or design it. Descriptions are general aviation knowledge; the programme
 * mapping follows the programmes' own overviews (AME: engines, fly-by-wire, NDT; CPL; B.Tech; cabin crew).
 */

export type SystemId = "cockpit" | "engine" | "wing" | "gear" | "tail" | "cabin";

export type AircraftSystem = {
  id: SystemId;
  label: string;
  title: string;
  body: string;
  program: string;
  trainedAs: string;
};

export const aircraftSystems: readonly AircraftSystem[] = [
  {
    id: "cockpit",
    label: "Flight deck",
    title: "Flight deck and avionics",
    body: "Flight management, autopilot, navigation, communication and weather radar: the digital systems that fly and guide the aircraft, and the fly-by-wire logic behind the controls.",
    program: "aircraft-maintenance-engineering",
    trainedAs: "Aircraft Maintenance Engineering, Avionics stream",
  },
  {
    id: "engine",
    label: "Engines",
    title: "High-bypass turbofans",
    body: "The big fan pushes most of the air around the core for thrust; the core compresses, burns and expands the rest. Overhauls, borescope inspections and non-destructive testing keep every engine airworthy.",
    program: "aircraft-maintenance-engineering",
    trainedAs: "Aircraft Maintenance Engineering, Mechanical stream",
  },
  {
    id: "wing",
    label: "Wing",
    title: "Wing and flight controls",
    body: "Slats and flaps reshape the wing for take-off and landing; ailerons and spoilers roll the aircraft and dump lift on touchdown. Pilots learn to fly it by hand and by automation.",
    program: "commercial-pilot-license",
    trainedAs: "Commercial Pilot License (CPL)",
  },
  {
    id: "gear",
    label: "Landing gear",
    title: "Landing gear and brakes",
    body: "Oleo-pneumatic struts absorb the touchdown, hydraulics retract the gear after take-off, and multi-disc brakes stop the aircraft: a core part of airframe maintenance.",
    program: "aircraft-maintenance-engineering",
    trainedAs: "Aircraft Maintenance Engineering, Mechanical stream",
  },
  {
    id: "tail",
    label: "Tail",
    title: "Fin, rudder and stabilisers",
    body: "The fin and rudder keep the aircraft straight and yaw it; the stabilisers and elevators control pitch. Their shape is aerodynamics, structures and stability: aerospace engineering.",
    program: "btech-aerospace-engineering",
    trainedAs: "B.Tech in Aerospace Engineering",
  },
  {
    id: "cabin",
    label: "Cabin",
    title: "Cabin and safety",
    body: "Doors, slides, over-wing exits, oxygen and the drills that go with them. Cabin crew are trained for safety first, then for service.",
    program: "cabin-crew-ground-handling",
    trainedAs: "Cabin Crew & Ground Handling Training",
  },
];
