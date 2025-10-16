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
        "Shield-bearing infantry that fortify villages to benefit from sanctuary healing.",
      detail:
        "The Vanguard hold the line while radiating protective wards that help allies recover between exchanges.",
      traits: [
        "Sanctified Shields: Their 5 DEF keeps damage low even against elite attackers.",
        "Ward-Hardened: A hearty 18 HP lets them anchor the Sun Dominion battle line for extended fights.",
      ],
      stats: { strength: 7, attack: 6, defence: 5, hp: 18, initiative: 6 },
    },
    {
      id: "dawnblade-cavalry",
      name: "Dawnblade Cavalry",
      role: "Shock cavalry",
      description:
        "Lightning-quick riders that excel on plains but lose momentum scaling mountains.",
      detail:
        "Dawnblade outriders focus on flanking strikes that disrupt the enemy line before withdrawing to safety.",
      traits: [
        "Shock Charge: Opening strikes leverage 8 ATK to burst through enemy defences.",
        "Blazing Tempo: Initiative 8 often puts them ahead of slower foes each combat round.",
      ],
      stats: { strength: 6, attack: 8, defence: 4, hp: 16, initiative: 8 },
    },
    {
      id: "luminar-arcanist",
      name: "Luminar Arcanist",
      role: "Ranged battlemage",
      description:
        "Radiant bolts cut through swamp mists to negate attack penalties for allied casters.",
      detail:
        "The arcanists specialise in burning away cover, softening entrenched foes before the infantry advance.",
      traits: [
        "Radiant Volley: Focused 7 ATK blasts reliably chip away at enemy lines.",
        "Fragile Channel: With only 14 HP they rely on allies to keep them safe once engaged.",
      ],
      stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 7 },
    },
    {
      id: "aegis-sentinels",
      name: "Aegis Sentinels",
      role: "Phalanx guardians",
      description:
        "Armoured wardens that anchor forest approaches, leveraging the defensive bonus to hold the line.",
      detail:
        "Sentinels form immovable bulwarks that slow enemy assaults while ranged allies pick them apart.",
      traits: [
        "Immovable Wall: Their 7 DEF turns most blows into glancing strikes.",
        "Bulwark Endurance: 20 HP lets them soak punishment longer than other Sun units.",
      ],
      stats: { strength: 8, attack: 5, defence: 7, hp: 20, initiative: 4 },
    },
    {
      id: "solar-skirmisher",
      name: "Solar Skirmisher",
      role: "Forward scout",
      description:
        "Flexible outrider who scouts villages and forests before a major advance.",
      detail:
        "Skirmishers screen the army, striking opportunistically and relaying enemy movements back to command.",
      traits: [
        "Forward Scouts: Balanced 6 ATK and 7 INIT make them dependable first responders.",
        "Adaptive Patrol: Moderate 15 HP lets them skirmish without immediately folding under pressure.",
      ],
      stats: { strength: 6, attack: 6, defence: 4, hp: 15, initiative: 7 },
    },
  ],
};
