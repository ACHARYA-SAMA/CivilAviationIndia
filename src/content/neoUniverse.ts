/**
 * "Aerospace Theme Park, Neo Universe: A Thrilling Expo", the society's planned project, designed by
 * Dr. G. Satyanarayana (owner's brochure AEROSPACE_THEME_PARK-combined.pdf). Zones and names as in
 * the brochure, summarised. The brochure's photographs are stock imagery, so none is used here.
 * This is a concept: nothing below is presented as built or open.
 */
export const neoUniverse = {
  name: "Neo Universe",
  title: "Aerospace Theme Park, Hyderabad",
  designer: "Dr. G. Satyanarayana",
  intro:
    "The society’s planned aerospace destination in Hyderabad: aircraft you can walk through, simulators, astronaut training, a museum of flight from 1903 to today, a space station and launch complex, with seminars, workshops and hands-on aircraft assembly for students.",
  zones: [
    { name: "Live Aircraft Models", bay: "Arjuna Bays 1 and 2", body: "Two wide-body aircraft open to visitors, with medium and light aircraft, engines, airframes, propellers, system mock-ups and simulators, explained by trainers.", kind: "aircraft" },
    { name: "Helicopter Experience Zone", bay: "Trishul Bay 3", body: "Helicopters on the helipad and on the taxiways, with seminars, workshops and hands-on assembly and disassembly.", kind: "helicopter" },
    { name: "Taxiway rides", bay: "Swaraj Bay 4", body: "Two medium aircraft that take visitors for a ride along the taxiways.", kind: "aircraft" },
    { name: "Flight Demonstration Hangar", bay: "Vijay Dus Bay 5", body: "Ten aircraft types in the hangars, showing their features, design and performance.", kind: "hangar" },
    { name: "Astronaut Training Labs", bay: "Kalpana Chawla", body: "Simulated space walks, low gravity, mock missions and astronaut suits for every age.", kind: "astronaut" },
    { name: "4D Flight Simulators", bay: "Sunita Williams", body: "Fifty motion simulators with surround screens: a forty-minute flight around the world.", kind: "simulator" },
    { name: "Aviation Heritage & Innovation Museum", bay: "Wright Brothers", body: "Flight from 1903 to today: aircraft, engines, a mock control tower and Indian aviation history, with letters, medals and personal accounts.", kind: "museum" },
    { name: "Photo Gallery", bay: "Valmiki", body: "Aviation and space exploration in photographs, from the first flights to the Moon and Mars.", kind: "gallery" },
    { name: "Space Station", bay: "Vikram Sarabhai", body: "Replica spacecraft, shuttles, mission control and a full-scale launch complex.", kind: "rocket" },
    { name: "Aero Cafeterias", bay: "Milky Way", body: "Restaurants built as an aircraft’s wing, mid-fuselage, tail and empennage.", kind: "aircraft" },
    { name: "Exhibition & Convention Center", bay: "Vishwakarma", body: "Halls for aviation and aerospace companies to exhibit, launch products and hold conferences.", kind: "hangar" },
    { name: "Drones and aeromodelling", bay: "Workshops", body: "How unmanned aircraft fly, and model aircraft built and flown: static, free flight, control line and radio control.", kind: "drone" },
  ],
} as const;

export type NeoZoneKind = (typeof neoUniverse.zones)[number]["kind"];
