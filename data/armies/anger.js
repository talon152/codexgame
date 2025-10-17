export const angerArmy = {
  faction: {
    id: "anger",
    name: "Anger Legion",
    summary: "Explosive impulses that overwhelm obstacles through relentless strikes and burning resolve.",
  },
  roster: [
    {
      id: "emberlash-brutes",
      name: "Emberlash Brutes",
      role: "Incendiary infantry",
      description:
        "Smoldering vanguards that sear plains for +2 ATK yet find their fury dampened by swampy doubt (-1 ATK).",
      detail:
        "They embody clenched jaws and pounding hearts, pouring raw adrenaline into every swing to break through hesitations.",
      traits: [
        "Righteous Fury: 7 STR and 7 ATK turn hesitation into splintered defenses when they strike first.",
        "Fuel for the Flame: Gain +2 ATK on plains but lose 1 ATK in swamps where anger sputters.",
      ],
      terrainModifiers: {
        plain: { attack: 2 },
        swamp: { attack: -1 },
      },
      stats: { strength: 7, attack: 7, defence: 4, hp: 17, initiative: 6, movement: 3 },
      cost: { inspiration: 2, will: 2 },
    },
    {
      id: "wrathbound-riders",
      name: "Wrathbound Riders",
      role: "Shock cavalry",
      description:
        "Tempestuous chargers that add +2 ATK on plains but suffer -1 DEF on forests where rage snags on calm memories.",
      detail:
        "They spear straight through mental fortifications, unwilling to slow until the obstruction is ground into sparks.",
      traits: [
        "Crushing Momentum: 8 ATK helps them delete exposed thoughts before retaliation forms.",
        "Tunnel Vision: Lose 1 DEF in forests where their fury struggles to navigate.",
      ],
      terrainModifiers: {
        plain: { attack: 2 },
        forest: { defence: -1 },
      },
      stats: { strength: 6, attack: 8, defence: 4, hp: 16, initiative: 7, movement: 5 },
      cost: { inspiration: 3, will: 1 },
    },
    {
      id: "seething-adept",
      name: "Seething Adept",
      role: "Volatile caster",
      description:
        "Channelers who hurl molten invective, gaining +3 ATK on mountains as pressure vents through fault lines.",
      detail:
        "They weaponise focused outrage, translating suppressed grievances into incandescent bolts of pain.",
      traits: [
        "Fury Bolt: Base 7 ATK climbs to 10 ATK on mountain ridges.",
        "Unstable Focus: With only 13 HP they collapse quickly if isolated.",
      ],
      terrainModifiers: {
        mountain: { attack: 3 },
      },
      stats: { strength: 5, attack: 7, defence: 3, hp: 13, initiative: 6, movement: 4 },
      cost: { inspiration: 2, will: 2 },
    },
    {
      id: "smolder-giants",
      name: "Smolder Giants",
      role: "Siege behemoths",
      description:
        "Towering embodiments of wrath that gain +2 STR battering villages but lose 1 INIT on water as anger cools.",
      detail:
        "Every step of these titans cracks the mindscape, hurling molten rubble toward anything that resists them.",
      traits: [
        "Inferno Hammer: Base 8 STR surges to 10 STR when demolishing settlements.",
        "Slow Burn: Initiative drops to 3 on water where their heat hisses away.",
      ],
      terrainModifiers: {
        village: { strength: 2 },
        water: { initiative: -1 },
      },
      stats: { strength: 8, attack: 6, defence: 6, hp: 22, initiative: 4, movement: 2 },
      cost: { inspiration: 1, will: 3 },
    },
    {
      id: "vengeance-stalkers",
      name: "Vengeance Stalkers",
      role: "Ambush skirmishers",
      description:
        "Fury given form that gains +1 ATK/+1 INIT in forests where grudges lie in wait.",
      detail:
        "They trace every slight through the neural undergrowth, pouncing the moment resentment whispers go unheard.",
      traits: [
        "Sudden Reprisal: Balanced 6 ATK and 6 DEF keeps them lethal during the first exchange.",
        "Predatory Focus: Add +1 ATK and +1 INIT in forests dense with unresolved confrontations.",
      ],
      terrainModifiers: {
        forest: { attack: 1, initiative: 1 },
      },
      stats: { strength: 6, attack: 6, defence: 4, hp: 15, initiative: 6, movement: 5 },
      cost: { inspiration: 1, will: 1 },
    },
  ],
};
