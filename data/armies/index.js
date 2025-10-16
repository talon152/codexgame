import { sunArmy } from "./sun.js";
import { moonArmy } from "./moon.js";
import { emberArmy } from "./ember.js";
import { tideArmy } from "./tide.js";

export const ARMIES = [sunArmy, moonArmy, emberArmy, tideArmy];

export const ARMIES_BY_ID = new Map(
  ARMIES.map((army) => [army.faction.id, army]),
);

export const getArmyById = (id) => ARMIES_BY_ID.get(id) ?? null;
