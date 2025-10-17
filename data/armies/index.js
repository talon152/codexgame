import { joyArmy } from "./joy.js";
import { fearArmy } from "./fear.js";
import { angerArmy } from "./anger.js";
import { envyArmy } from "./envy.js";

export const ARMIES = [joyArmy, fearArmy, angerArmy, envyArmy];

export const ARMIES_BY_ID = new Map(
  ARMIES.map((army) => [army.faction.id, army]),
);

export const getArmyById = (id) => ARMIES_BY_ID.get(id) ?? null;
