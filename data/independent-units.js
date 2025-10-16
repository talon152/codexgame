export const INDEPENDENT_FACTION = {
  id: "independent",
  name: "Independent Forces",
  summary:
    "Neutral warbands that defend their own holdings until commanders claim them.",
};

export const INDEPENDENT_UNITS = [
  {
    id: "free-lance-warden",
    name: "Free-Lance Warden",
    role: "Shielded infantry",
    description:
      "Veteran defenders who brace behind tower shields, gaining +2 DEF on mountain passes.",
    detail:
      "Wardens hold chokepoints while negotiators parley, buying time for commanders to maneuver.",
    traits: [
      "Holds the Line: Soaks attacks with balanced stats and reinforced shields.",
      "Rockstead Resolve: Mountain footing adds +2 DEF as they leverage natural cover.",
    ],
    terrainModifiers: {
      mountain: { defence: 2 },
    },
    stats: { strength: 6, attack: 5, defence: 6, hp: 18, initiative: 5 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "amber-ranger",
    name: "Amber Ranger",
    role: "Forest archer",
    description:
      "Hunters who strike from treetops, gaining +2 ATK and +1 INIT when fighting in forests.",
    detail:
      "They guide caravans through the wilds in exchange for supplies and mutual defense pacts.",
    traits: [
      "Treetop Volley: Rain arrows from the canopy with deadly accuracy.",
      "Swift Retreat: Elevated vantage grants +1 INIT in forests.",
    ],
    terrainModifiers: {
      forest: { attack: 2, initiative: 1 },
    },
    stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 7 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "river-ward-scout",
    name: "River Ward Scout",
    role: "Swamp skirmisher",
    description:
      "Guides that treat swamps as home turf, gaining +2 INIT when engaged on wetlands or water.",
    detail:
      "They ferry information between isolated hamlets, striking at invaders who ignore their warnings.",
    traits: [
      "Bog Runner: Moves effortlessly through mud and reeds.",
      "Ambush Signal: Alerts nearby allies with quick strikes before slipping away.",
    ],
    terrainModifiers: {
      swamp: { initiative: 2 },
      water: { initiative: 2 },
    },
    stats: { strength: 4, attack: 5, defence: 3, hp: 12, initiative: 8 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "stonebreaker-ogre",
    name: "Stonebreaker Ogre",
    role: "Siege bruiser",
    description:
      "A hulking mercenary that shatters defenses with 9 STR, but is sluggish to react.",
    detail:
      "Local clans hire the ogre to dismantle rival fortifications in exchange for tribute.",
    traits: [
      "Crushing Blows: High STR turns every swing into a potential breach.",
      "Lumbering Form: Low INIT leaves openings for faster foes.",
    ],
    stats: { strength: 9, attack: 7, defence: 4, hp: 22, initiative: 3 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "dawnshield-zealot",
    name: "Dawnshield Zealot",
    role: "Sacred guardian",
    description:
      "Fanatics that fortify villages, granting +2 DEF when defending settlements.",
    detail:
      "They uphold local pacts, refusing to yield shrines to any faction they deem unworthy.",
    traits: [
      "Radiant Bulwark: Shields glimmer against direct assaults.",
      "Sanctified Ground: Villages empower their divine wards.",
    ],
    terrainModifiers: {
      village: { defence: 2 },
    },
    stats: { strength: 6, attack: 6, defence: 6, hp: 16, initiative: 6 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "ashen-trackers",
    name: "Ashen Trackers",
    role: "Wasteland outriders",
    description:
      "Pairs of scouts who excel on plains, adding +1 ATK and +1 INIT in open ground.",
    detail:
      "Trackers read battlefield signs to predict raids, harrying invaders before they reach the heartlands.",
    traits: [
      "Coordinated Hunts: Operate in tandem to pressure enemy flanks.",
      "Dust Riders: Plains winds propel their sudden strikes.",
    ],
    terrainModifiers: {
      plain: { attack: 1, initiative: 1 },
    },
    stats: { strength: 5, attack: 6, defence: 4, hp: 13, initiative: 7 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "stormglass-mystic",
    name: "Stormglass Mystic",
    role: "Arcane artillery",
    description:
      "Channelers who store lightning in crystals, unleashing +2 ATK during storms over water tiles.",
    detail:
      "Villagers consult them before voyages, lest the mystic summon squalls to bar passage.",
    traits: [
      "Charged Volley: Crackling bolts pierce armoured lines.",
      "Tempest Caller: Gains +2 ATK on water as humidity amplifies their focus.",
    ],
    terrainModifiers: {
      water: { attack: 2 },
    },
    stats: { strength: 4, attack: 8, defence: 3, hp: 13, initiative: 6 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "moorshield-giant",
    name: "Moorshield Giant",
    role: "Swamp guardian",
    description:
      "A gentle behemoth protecting bog villages, adding +3 DEF in swamps but losing 1 INIT on mountains.",
    detail:
      "Giant kin anchor floodgates and redirect rivers, demanding only respect for their marsh homes.",
    traits: [
      "Living Bastion: Towering frame soaks damage for nearby allies.",
      "Bogbound: Slow to leave their watery domain.",
    ],
    terrainModifiers: {
      swamp: { defence: 3 },
      mountain: { initiative: -1 },
    },
    stats: { strength: 8, attack: 6, defence: 7, hp: 24, initiative: 4 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "emberbrand-pyromancer",
    name: "Emberbrand Pyromancer",
    role: "Area denial mage",
    description:
      "Unleashes gouts of flame that add +2 STR when battling in forests or villages.",
    detail:
      "They burn supply trails to keep tyrants from marching, yet spare the innocent when tribute is paid.",
    traits: [
      "Scorching Barrage: Area flames deter close formations.",
      "Selective Blaze: Boosted STR in tight terrain helps clear ambushers.",
    ],
    terrainModifiers: {
      forest: { strength: 2 },
      village: { strength: 2 },
    },
    stats: { strength: 6, attack: 7, defence: 3, hp: 15, initiative: 6 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "skyborne-courier",
    name: "Skyborne Courier",
    role: "Aerial skirmisher",
    description:
      "Messenger riders on gliders, boasting +2 INIT on plains and villages.",
    detail:
      "They relay treaties from cliff-top eyries, dodging arrows with practiced dives.",
    traits: [
      "Dive Strike: Rapid assaults harry slow foes.",
      "Courier's Grace: Swift repositioning avoids counterattacks.",
    ],
    terrainModifiers: {
      plain: { initiative: 2 },
      village: { initiative: 2 },
    },
    stats: { strength: 4, attack: 6, defence: 3, hp: 11, initiative: 9 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "gale-sentinel",
    name: "Gale Sentinel",
    role: "Defensive spear",
    description:
      "Discipline spear lines that hold bridges, gaining +1 ATK and +1 DEF on water tiles.",
    detail:
      "Sentinels patrol trading routes, levying tolls to fund their vigilant watch.",
    traits: [
      "Wall of Spears: Keeps cavalry at bay with interlocking formations.",
      "River Wardens: Control ferries and docks to deny enemy landings.",
    ],
    terrainModifiers: {
      water: { attack: 1, defence: 1 },
    },
    stats: { strength: 6, attack: 6, defence: 5, hp: 16, initiative: 5 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "twilight-assassin",
    name: "Twilight Assassin",
    role: "Stealth operative",
    description:
      "Strikes from shadows with +2 ATK in forests and villages but suffers -1 DEF on open plains.",
    detail:
      "They enforce secret accords, eliminating leaders who break neutrality oaths.",
    traits: [
      "Silent Blade: Eliminates targets before alarms sound.",
      "Shadow Step: Melds with urban alleys and woodland paths.",
    ],
    terrainModifiers: {
      forest: { attack: 2 },
      village: { attack: 2 },
      plain: { defence: -1 },
    },
    stats: { strength: 5, attack: 8, defence: 3, hp: 12, initiative: 8 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "ironroot-treant",
    name: "Ironroot Treant",
    role: "Living fortification",
    description:
      "A colossal tree guardian with +3 DEF in forests and +2 STR when rooted in swamps.",
    detail:
      "Treants awaken when ancient groves are threatened, crushing invaders beneath ironbark limbs.",
    traits: [
      "Rooted Rampart: Bark armour wards off siege engines.",
      "Verdant Fury: Draws on wet soil to fuel devastating swings.",
    ],
    terrainModifiers: {
      forest: { defence: 3 },
      swamp: { strength: 2 },
    },
    stats: { strength: 8, attack: 6, defence: 8, hp: 26, initiative: 2 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "glacial-adept",
    name: "Glacial Adept",
    role: "Control caster",
    description:
      "Manipulates frost, reducing enemy INIT but gaining +2 DEF on water and mountains.",
    detail:
      "Adept enclaves freeze river crossings to stall armies until negotiations conclude.",
    traits: [
      "Frost Lock: Slows foes with numbing blasts.",
      "Icebound Ward: Channel cold stone and rivers for protection.",
    ],
    terrainModifiers: {
      water: { defence: 2 },
      mountain: { defence: 2 },
    },
    stats: { strength: 4, attack: 6, defence: 5, hp: 14, initiative: 5 },
    cost: { gold: 0, metal: 0 },
  },
  {
    id: "crystal-bastion",
    name: "Crystal Bastion",
    role: "Animated bulwark",
    description:
      "A sentient fortress shard with immense HP and DEF, immobile but relentless.",
    detail:
      "The bastion drifts between realms, shielding settlements that honor ancient treaties.",
    traits: [
      "Impassable Wall: Near-impenetrable defenses slow entire battalions.",
      "Arcane Core: Redirects magical assaults into radiant counterblows.",
    ],
    stats: { strength: 7, attack: 4, defence: 9, hp: 28, initiative: 1 },
    cost: { gold: 0, metal: 0 },
  },
];

export const getRandomIndependentUnit = () => {
  if (INDEPENDENT_UNITS.length === 0) {
    throw new Error("No independent units defined");
  }
  const index = Math.floor(Math.random() * INDEPENDENT_UNITS.length);
  return INDEPENDENT_UNITS[index];
};
