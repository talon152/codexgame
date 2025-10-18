import { RESOURCE_TYPES } from "../constants.js";

const RESOURCE_BY_KEY = new Map(
  RESOURCE_TYPES.map((resource) => [resource.key, resource]),
);

export const formatStructureCost = (structure) => {
  if (!structure) {
    return "";
  }

  const entries = Object.entries(structure.cost ?? {}).filter(([, value]) =>
    Number.isFinite(value) && value > 0,
  );

  if (entries.length === 0) {
    return "No cost";
  }

  return entries
    .map(([resourceKey, amount]) => {
      const resource = RESOURCE_BY_KEY.get(resourceKey);
      const label = resource?.label ?? resource?.name ?? resourceKey;
      return `${amount} ${label}`;
    })
    .join(" • ");
};

export const createStructureInstance = (definition, overrides = {}) => {
  if (!definition) {
    return null;
  }

  const traits = Array.isArray(definition.traits)
    ? [...definition.traits]
    : [];

  return {
    id: definition.id,
    name: definition.name,
    shortLabel: definition.shortLabel,
    defenceBonus: definition.defenceBonus ?? 0,
    allowsRecruitment: Boolean(definition.allowsRecruitment),
    cost: { ...(definition.cost ?? {}) },
    traits,
    cellClass: definition.cellClass ?? "",
    ...overrides,
  };
};
