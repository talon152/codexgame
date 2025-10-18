const baseStructures = {
  FORT: {
    id: "fort",
    name: "Fort",
    shortLabel: "Fort",
    cost: { inspiration: 3, will: 2 },
    defenceBonus: 2,
    allowsRecruitment: true,
    traits: ["defensive", "recruitment"],
    cellClass: "cell--structure-fort",
  },
};

Object.values(baseStructures).forEach((definition) => {
  if (definition.cost) {
    Object.freeze(definition.cost);
  }
  if (Array.isArray(definition.traits)) {
    Object.freeze(definition.traits);
  }
  Object.freeze(definition);
});

export const STRUCTURE_TYPES = Object.freeze({ ...baseStructures });

const STRUCTURE_LIST = Object.values(STRUCTURE_TYPES);

export const getStructureDefinitions = () => [...STRUCTURE_LIST];

export const getStructureDefinition = (id) =>
  STRUCTURE_LIST.find((structure) => structure.id === id) ?? null;
