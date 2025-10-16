export const moonArmy = {
  faction: {
    id: "moon",
    name: "Moon Covenant",
    summary: "Patient mystics preparing calculated strikes.",
  },
  roster: [
    {
      id: "twilight-assassins",
      name: "Twilight Assassins",
      role: "Stealth operatives",
      description:
        "Shadowy blades that bypass village sentries during nightfall strikes.",
      detail:
        "Assassins pick apart isolated targets, spreading fear through the enemy line before open battle begins.",
      traits: [
        "Nightfall Blades: 9 ATK lets their first swings hit with lethal precision.",
        "Shadow Step: Initiative 9 helps them act before most opponents can respond.",
      ],
      stats: { strength: 7, attack: 9, defence: 4, hp: 14, initiative: 9 },
      cost: { gold: 2, metal: 2 },
    },
    {
      id: "umbral-wardens",
      name: "Umbral Wardens",
      role: "Bulwark defenders",
      description:
        "Obsidian guardians who thrive in forests, turning terrain bonuses into impenetrable cover.",
      detail:
        "Wardens entrench themselves to channel moonlit barriers that blunt even the fiercest charges.",
      traits: [
        "Obsidian Bulwark: 8 DEF shrugs off the majority of counterstrikes.",
        "Moonlit Resolve: Their sturdy 19 HP keeps them entrenched through long battles.",
      ],
      stats: { strength: 6, attack: 5, defence: 8, hp: 19, initiative: 5 },
      cost: { gold: 1, metal: 3 },
    },
    {
      id: "lunar-sages",
      name: "Lunar Sages",
      role: "Support casters",
      description:
        "Diviners whose tidal rites let amphibious allies launch assaults from water hexes.",
      detail:
        "Sages manipulate tides and moonlight to reposition allies while flooding enemies with debilitating hexes.",
      traits: [
        "Guiding Stars: Balanced 7 ATK provides steady support damage from the back line.",
        "Mystic Vigil: 16 HP gives them breathing room compared to other casters of the Covenant.",
      ],
      stats: { strength: 5, attack: 7, defence: 5, hp: 16, initiative: 6 },
      cost: { gold: 2, metal: 1 },
    },
    {
      id: "nightglide-riders",
      name: "Nightglide Riders",
      role: "Flying cavalry",
      description:
        "Glide over swamps to strike without suffering movement loss or attack penalties.",
      detail:
        "Riders loop in crescent patterns, harrying foes while scouting behind enemy lines for weak points.",
      traits: [
        "Crescent Dive: 8 ATK slashes through enemy armour during their high-speed passes.",
        "High Flier: Initiative 8 makes them swift contributors in each combat step.",
      ],
      stats: { strength: 6, attack: 8, defence: 5, hp: 17, initiative: 8 },
      cost: { gold: 3, metal: 1 },
    },
    {
      id: "veilbreakers",
      name: "Veilbreakers",
      role: "Siege breakers",
      description:
        "Siege specialists who batter mountain holds despite the cramped elevation.",
      detail:
        "Veilbreakers dismantle fortifications with seismic crescents that shatter rockbound defenses.",
      traits: [
        "Siege Breakers: 8 STR and 7 ATK combine for powerful opening blows against tough foes.",
        "Steadfast Advance: Solid 18 HP lets them keep hammering even after taking hits.",
      ],
      stats: { strength: 8, attack: 7, defence: 6, hp: 18, initiative: 6 },
      cost: { gold: 1, metal: 4 },
    },
  ],
};
