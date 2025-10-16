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
        "Veiled Approach: Ignore zone-of-control when moving through village hexes at night.",
        "Deathmark: First strike each battle deals +2 ATK if the target acted this phase.",
      ],
      stats: { strength: 7, attack: 9, defence: 4, hp: 14, initiative: 9 },
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
        "Nightroot Aegis: Forest hexes grant +2 DEF instead of +1.",
        "Ward of Stillness: Enemy cavalry entering the wardens' hex lose 1 movement next round.",
      ],
      stats: { strength: 6, attack: 5, defence: 8, hp: 19, initiative: 5 },
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
        "Tidal Bridge: Amphibious allies ignore water movement restrictions when adjacent to the sages.",
        "Moonward Pulse: Heal 3 HP on one ally that starts the phase on water.",
      ],
      stats: { strength: 5, attack: 7, defence: 5, hp: 16, initiative: 6 },
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
        "Swamp Skip: Ignore swamp movement penalties and attack penalties.",
        "Sky Harriers: Gain +1 INIT when beginning combat from a higher elevation hex such as mountains.",
      ],
      stats: { strength: 6, attack: 8, defence: 5, hp: 17, initiative: 8 },
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
        "Resonant Shatter: Ignore the strength cap imposed on cavalry in mountain hexes.",
        "Fracture Wave: First successful hit reduces target DEF by 1 for the battle.",
      ],
      stats: { strength: 8, attack: 7, defence: 6, hp: 18, initiative: 6 },
    },
  ],
};
