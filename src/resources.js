import {
  CAPITAL_PRODUCTION,
  RESOURCE_TYPES,
  TERRAIN_RESOURCE_RULES,
} from "./constants.js";
import { randomIntInclusive } from "./utils/random.js";

const factionResources = new Map();

export const resetFactionResources = () => {
  factionResources.clear();
};

export const getResourceDefinition = (key) =>
  RESOURCE_TYPES.find((resource) => resource.key === key);

export const rollResourcesForTerrain = (terrainName) => {
  const rules = TERRAIN_RESOURCE_RULES[terrainName] ?? {};
  return RESOURCE_TYPES.reduce((accumulator, { key }) => {
    const range = rules[key] ?? { min: 0, max: 0 };
    return {
      ...accumulator,
      [key]: randomIntInclusive(range.min ?? 0, range.max ?? 0),
    };
  }, {});
};

export const getResourcesForCellElement = (cell) => {
  if (!cell) {
    return {};
  }

  return RESOURCE_TYPES.reduce((accumulator, { key }) => {
    const value = Number.parseInt(cell.dataset?.[key] ?? "0", 10);
    if (!Number.isNaN(value) && value > 0) {
      return { ...accumulator, [key]: value };
    }
    return accumulator;
  }, {});
};

export const normaliseAmount = (value) => {
  if (typeof value !== "number") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return Math.trunc(parsed);
  }

  return Number.isFinite(value) ? Math.trunc(value) : 0;
};

export const getFactionResources = (factionId) => {
  if (!factionId) {
    return { gold: 0, metal: 0 };
  }

  const stored = factionResources.get(factionId);
  if (!stored) {
    const defaults = { gold: 0, metal: 0 };
    factionResources.set(factionId, defaults);
    return { ...defaults };
  }

  const gold = normaliseAmount(stored.gold ?? 0);
  const metal = normaliseAmount(stored.metal ?? 0);
  return { gold, metal };
};

export const setFactionResources = (factionId, values) => {
  if (!factionId) {
    return;
  }

  const gold = Math.max(0, normaliseAmount(values?.gold ?? 0));
  const metal = Math.max(0, normaliseAmount(values?.metal ?? 0));
  factionResources.set(factionId, { gold, metal });
};

export const adjustFactionResources = (factionId, delta) => {
  if (!factionId) {
    return { gold: 0, metal: 0 };
  }

  const current = getFactionResources(factionId);
  const nextGold = Math.max(0, current.gold + normaliseAmount(delta?.gold ?? 0));
  const nextMetal = Math.max(0, current.metal + normaliseAmount(delta?.metal ?? 0));
  const nextResources = { gold: nextGold, metal: nextMetal };
  setFactionResources(factionId, nextResources);
  return nextResources;
};

export const canFactionAfford = (factionId, cost = {}) => {
  if (!factionId) {
    return false;
  }

  const resources = getFactionResources(factionId);
  return Object.entries(cost).every(([key, amount]) => {
    const required = Math.max(0, normaliseAmount(amount ?? 0));
    if (required === 0) {
      return true;
    }
    return (resources[key] ?? 0) >= required;
  });
};

export const spendFactionResources = (factionId, cost = {}) => {
  if (!canFactionAfford(factionId, cost)) {
    return false;
  }

  adjustFactionResources(factionId, {
    gold: -normaliseAmount(cost.gold ?? 0),
    metal: -normaliseAmount(cost.metal ?? 0),
  });

  return true;
};

export const getCapitalProductionForFaction = (factionId) =>
  CAPITAL_PRODUCTION[factionId] ?? { gold: 2, metal: 1 };
