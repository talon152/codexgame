export const GRID_SIZE = 10;

export const TERRAIN_TYPES = [
  { name: "forest", label: "Forest", className: "terrain-forest" },
  { name: "plain", label: "Plain", className: "terrain-plain" },
  { name: "village", label: "Village", className: "terrain-village" },
  { name: "mountain", label: "Mountain", className: "terrain-mountain" },
  { name: "swamp", label: "Swamp", className: "terrain-swamp" },
  { name: "water", label: "Water", className: "terrain-water" },
];

export const TERRAIN_RESOURCE_RULES = {
  forest: {
    inspiration: { min: 1, max: 2 },
    will: { min: 1, max: 2 },
  },
  plain: {
    inspiration: { min: 2, max: 4 },
    will: { min: 0, max: 1 },
  },
  village: {
    inspiration: { min: 3, max: 5 },
    will: { min: 1, max: 2 },
  },
  mountain: {
    inspiration: { min: 0, max: 1 },
    will: { min: 3, max: 5 },
  },
  swamp: {
    inspiration: { min: 1, max: 3 },
    will: { min: 0, max: 1 },
  },
  water: {
    inspiration: { min: 1, max: 2 },
    will: { min: 0, max: 0 },
  },
};

export const RESOURCE_TYPES = [
  { key: "inspiration", label: "Inspiration" },
  { key: "will", label: "Will" },
];

export const CAPITAL_PRODUCTION = {
  joy: { inspiration: 4, will: 1 },
  fear: { inspiration: 3, will: 2 },
  anger: { inspiration: 2, will: 3 },
  envy: { inspiration: 3, will: 1 },
};

export const UNIT_STAT_LABELS = [
  { key: "strength", label: "STR" },
  { key: "attack", label: "ATK" },
  { key: "defence", label: "DEF" },
  { key: "movement", label: "MOVE" },
  { key: "hp", label: "HP" },
  { key: "initiative", label: "INIT" },
];

export const ORTHOGONAL_DIRECTIONS = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

export const TURN_PHASES = [
  {
    id: "start",
    label: "Start Phase",
    summary: "Ready units, regenerate health, and resolve any upkeep effects.",
  },
  {
    id: "main",
    label: "Main Phase",
    summary: "Deploy units, play cards, and issue strategic orders.",
  },
  {
    id: "end",
    label: "End Phase",
    summary: "Clean up and prepare combat resolution.",
  },
];

export const PHASE_INDEX = TURN_PHASES.reduce((accumulator, phase, index) => {
  return { ...accumulator, [phase.id]: index };
}, {});

export const START_PHASE_INDEX = PHASE_INDEX.start ?? 0;
export const MAIN_PHASE_INDEX = PHASE_INDEX.main ?? 0;
export const END_PHASE_INDEX = PHASE_INDEX.end ?? TURN_PHASES.length - 1;
