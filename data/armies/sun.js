export const sunArmy = {
  faction: {
    id: "sun",
    name: "Sun Dominion",
    summary: "Radiant tacticians focused on swift expansion.",
  },
  roster: [
    {
      id: "radiant-vanguard",
      name: "Radiant Vanguard",
      role: "Sanctified infantry",
      description:
        "Shield-bearing infantry that fortify villages, gaining +2 DEF from sanctuary wards while defending them.",
      detail:
        "The Vanguard hold the line while radiating protective wards that help allies recover between exchanges.",
      traits: [
        "Sanctified Shields: Their 5 DEF keeps damage low even against elite attackers.",
        "Sanctuary Bastion: Gain +2 DEF when fighting in villages as their wards flare to life.",
      ],
      terrainModifiers: {
        village: { defence: 2 },
      },
      stats: { strength: 7, attack: 6, defence: 5, hp: 18, initiative: 6 },
      cost: { gold: 2, metal: 1 },
    },
    {
      id: "dawnblade-cavalry",
      name: "Dawnblade Cavalry",
      role: "Shock cavalry",
      description:
        "Lightning-quick riders that gain +2 ATK/+1 INIT on plains but lose 1 ATK/INIT while scaling mountains.",
      detail:
        "Dawnblade outriders focus on flanking strikes that disrupt the enemy line before withdrawing to safety.",
      traits: [
        "Shock Charge: Opening strikes leverage 8 ATK to burst through enemy defences.",
        "Plains Momentum: Gain +2 ATK and +1 INIT on plains, but lose 1 ATK and 1 INIT on mountain slopes.",
      ],
      terrainModifiers: {
        plain: { attack: 2, initiative: 1 },
        mountain: { attack: -1, initiative: -1 },
      },
      stats: { strength: 6, attack: 8, defence: 4, hp: 16, initiative: 8 },
      cost: { gold: 3, metal: 1 },
    },
    {
      id: "luminar-arcanist",
      name: "Luminar Arcanist",
      role: "Ranged battlemage",
      description:
        "Radiant bolts cut through swamp mists, gaining +2 ATK whenever they battle across boggy ground.",
      detail:
        "The arcanists specialise in burning away cover, softening entrenched foes before the infantry advance.",
      traits: [
        "Radiant Volley: Focused 7 ATK blasts reliably chip away at enemy lines, jumping to 9 ATK in swamps.",
        "Fragile Channel: With only 14 HP they rely on allies to keep them safe once engaged.",
      ],
      terrainModifiers: {
        swamp: { attack: 2 },
      },
      stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 7 },
      cost: { gold: 2, metal: 2 },
    },
    {
      id: "aegis-sentinels",
      name: "Aegis Sentinels",
      role: "Phalanx guardians",
      description:
        "Armoured wardens that anchor forest approaches, gaining +2 DEF from the canopy's warded roots.",
      detail:
        "Sentinels form immovable bulwarks that slow enemy assaults while ranged allies pick them apart.",
      traits: [
        "Immovable Wall: Their 7 DEF turns most blows into glancing strikes and rises to 9 DEF in forests.",
        "Bulwark Endurance: 20 HP lets them soak punishment longer than other Sun units.",
      ],
      terrainModifiers: {
        forest: { defence: 2 },
      },
      stats: { strength: 8, attack: 5, defence: 7, hp: 20, initiative: 4 },
      cost: { gold: 1, metal: 3 },
    },
    {
      id: "solar-skirmisher",
      name: "Solar Skirmisher",
      role: "Forward scout",
      description:
        "Flexible outrider who scouts villages and forests, gaining +1 INIT from the familiar terrain.",
      detail:
        "Skirmishers screen the army, striking opportunistically and relaying enemy movements back to command.",
      traits: [
        "Forward Scouts: Balanced 6 ATK and 7 INIT make them dependable first responders, rising to 8 INIT in forests and villages.",
        "Adaptive Patrol: Moderate 15 HP lets them skirmish without immediately folding under pressure.",
      ],
      terrainModifiers: {
        forest: { initiative: 1 },
        village: { initiative: 1 },
      },
      stats: { strength: 6, attack: 6, defence: 4, hp: 15, initiative: 7 },
      cost: { gold: 1, metal: 1 },
    },
  ],
};
