/**
 * Australian fish species list.
 * Sorted alphabetically within groups.
 * Extend as users in different regions report missing species.
 */
export const SPECIES_LIST = [
  // Estuary / Inshore
  'Bream (Yellowfin)',
  'Bream (Black)',
  'Flathead (Dusky)',
  'Flathead (Tiger)',
  'Whiting (Sand)',
  'Whiting (King George)',
  'Luderick',
  'Tarpon',
  'Trevally (Giant)',
  'Trevally (Silver)',
  'Mulloway',
  'Jewfish',
  'Snapper',
  'Leatherjacket',
  'Drummer',
  'Tailor',
  'Garfish',

  // Freshwater
  'Bass (Australian)',
  'Murray Cod',
  'Golden Perch',
  'Silver Perch',
  'Catfish (Eel-tailed)',
  'Redfin Perch',
  'Trout (Brown)',
  'Trout (Rainbow)',

  // Offshore / Pelagic
  'Barramundi',
  'Mangrove Jack',
  'Queenfish',
  'Spanish Mackerel',
  'Mahi Mahi',
  'Amberjack',
  'Cobia',
  'Coral Trout',
  'Sweetlip',

  // Sharks / Rays (catch-and-release)
  'Shark (Bronze Whaler)',
  'Shark (Wobbegong)',
  'Stingray',
  'Shovelnose Ray',

  // Other
  'Unknown / Not Identified',
] as const;

export type Species = (typeof SPECIES_LIST)[number];
