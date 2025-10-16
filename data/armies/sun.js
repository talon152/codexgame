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
        "Sanctuary Bulwark: Gain +2 DEF while occupying a village hex.",
        "Guardian Halo: Adjacent allies recover 2 HP when the Vanguard survives a combat round.",
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
        "Skirmish Dash: May move after attacking if starting from a plain hex.",
        "Momentum Drop: Strength reduced by 2 when ending movement on a mountain hex.",
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
        "Piercing Flare: Ignore the swamp attack penalty when casting from range.",
        "Beacon Sigil: Marked targets grant +1 ATK to subsequent magical attacks this round.",
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
        "Verdant Bastion: Gain +1 DEF from forest terrain bonuses (total +2).",
        "Stalwart Advance: Cannot be forced to retreat by morale checks.",
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
        "Trailblazer: Reveals hidden enemy stacks in adjacent forest hexes.",
        "Supply Cache: When ending in a village, restore 1 spent tactic card.",
      ],
      stats: { strength: 6, attack: 6, defence: 4, hp: 15, initiative: 7 },
    },
  ],
};
