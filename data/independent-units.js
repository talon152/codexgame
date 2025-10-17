export const INDEPENDENT_FACTION = {
  id: "independent",
  name: "Neutral Echoes",
  summary:
    "Autonomous manifestations of memory that defend drifting skyrealms until a new emotion integrates them.",
};

export const INDEPENDENT_UNITS = [
  {
    id: "memory-bulwark",
    name: "Memory Bulwark",
    role: "Anchored sentinel",
    description:
      "Stoic guardians of long-held beliefs, gaining +2 DEF on Celestial Spire ridges where convictions feel unshakeable.",
    detail:
      "They brace crumbling ramparts of thought, letting warring sentiments negotiate without shattering the past outright.",
    traits: [
      "Unflinching Recall: Balanced stats let them weather most frontal assaults.",
      "Bedrock Resolve: Spire footing adds +2 DEF as they root themselves in certainty.",
    ],
    terrainModifiers: {
      spire: { defence: 2 },
    },
    stats: { strength: 6, attack: 5, defence: 6, hp: 18, initiative: 5, movement: 3 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "glimmer-tracker",
    name: "Glimmer Tracker",
    role: "Grove archer",
    description:
      "Hunters of fleeting optimism that gain +2 ATK and +1 INIT when stalking the luminous paths of nostalgia.",
    detail:
      "They follow sparks of joy through tangled recollections, guiding them toward whichever emotion proves worthy.",
    traits: [
      "Hopeful Volley: Radiant arrows pierce even armored doubts.",
      "Quick Rekindle: Lumin Grove cover grants +1 INIT as they dart between memories.",
    ],
    terrainModifiers: {
      grove: { attack: 2, initiative: 1 },
    },
    stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 7, movement: 4 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "tide-messenger",
    name: "Tide Messenger",
    role: "Fen skirmisher",
    description:
      "Guides who treat shimmering wetlands as open roads, gaining +2 INIT on glimmer fens and Star Currents.",
    detail:
      "They ferry warnings through murky emotions, striking intruders before slipping beneath the surface of awareness.",
    traits: [
      "Bog Dash: Moves effortlessly through stagnant worries.",
      "Wake Ripple: Alerts allies with sudden strikes before vanishing.",
    ],
    terrainModifiers: {
      fen: { initiative: 2 },
      current: { initiative: 2 },
    },
    stats: { strength: 4, attack: 5, defence: 3, hp: 12, initiative: 8, movement: 5 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "catharsis-golem",
    name: "Catharsis Golem",
    role: "Siege bruiser",
    description:
      "A hulking release of bottled rage that crushes barriers with 9 STR yet lumbers with low initiative.",
    detail:
      "Communities conjure the golem to break through blockages of thought, trading tribute for a path toward relief.",
    traits: [
      "Shattering Release: High STR converts pressure into irresistible blows.",
      "Heavy Catharsis: Slow reactions leave gaps for quicker adversaries.",
    ],
    stats: { strength: 9, attack: 7, defence: 4, hp: 22, initiative: 3, movement: 2 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "conviction-keeper",
    name: "Conviction Keeper",
    role: "Sanctum guardian",
    description:
      "Watchers who safeguard communal promises, granting +2 DEF when defending Sky Sanctums of shared intent.",
    detail:
      "They judge which emotions may draw power from a settlement, shielding it from manipulative whispers until consensus forms.",
    traits: [
      "Unbroken Vows: Stout shields repel corrosive guilt.",
      "Hearthstone Ward: Sanctums empower their protective sigils.",
    ],
    terrainModifiers: {
      sanctum: { defence: 2 },
    },
    stats: { strength: 6, attack: 6, defence: 6, hp: 16, initiative: 6, movement: 3 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "impulse-riders",
    name: "Impulse Riders",
    role: "Steppe outriders",
    description:
      "Pairs of thrillseekers who race across the aurora steppe, adding +1 ATK and +1 INIT when charging through exposed thoughts.",
    detail:
      "They read the gusts of shifting attention, harrying invading feelings before they reach the mind's core.",
    traits: [
      "Twin Surges: Operate in tandem to pull focus in opposing directions.",
      "Dust Wake: Steppe winds fuel their accelerating strikes.",
    ],
    terrainModifiers: {
      steppe: { attack: 1, initiative: 1 },
    },
    stats: { strength: 5, attack: 6, defence: 4, hp: 13, initiative: 7, movement: 5 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "storm-thinker",
    name: "Storm Thinker",
    role: "Arcane artillery",
    description:
      "Focuses lightning-fast realizations, adding +2 ATK on Star Currents where intuition flows freely.",
    detail:
      "Communities consult the thinker before voyages into change, lest sudden clarity strike without warning.",
    traits: [
      "Charged Insight: Focused bolts pierce armored denial.",
      "Tempest Recall: Gains +2 ATK on Star Currents as humidity amplifies their resonance.",
    ],
    terrainModifiers: {
      current: { attack: 2 },
    },
    stats: { strength: 4, attack: 8, defence: 3, hp: 13, initiative: 6, movement: 3 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "mire-colossus",
    name: "Mire Colossus",
    role: "Fen guardian",
    description:
      "A gentle giant that steadies anxious bogs, adding +3 DEF in glimmer fens but losing 1 INIT on Celestial Spires of clarity.",
    detail:
      "Colossi anchor floodgates in the subconscious, demanding only that wanderers respect the quiet depths.",
    traits: [
      "Living Bastion: Towering frame soaks damage for nearby allies.",
      "Bogbound: Slow to leave the waters that calm them.",
    ],
    terrainModifiers: {
      fen: { defence: 3 },
      spire: { initiative: -1 },
    },
    stats: { strength: 8, attack: 6, defence: 7, hp: 24, initiative: 4, movement: 2 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "synapse-sparkmage",
    name: "Synapse Sparkmage",
    role: "Area denial mage",
    description:
      "Ignites synaptic storms, adding +2 STR when clashing in Lumin Groves or Sky Sanctums dense with interlinked thoughts.",
    detail:
      "They cauterize spiraling anxieties, burning away clutter so new insights can form without obstruction.",
    traits: [
      "Scorch Pathways: Area flames deter clustered formations.",
      "Focused Surge: Boosted STR in tight terrain clears ambushers.",
    ],
    terrainModifiers: {
      grove: { strength: 2 },
      sanctum: { strength: 2 },
    },
    stats: { strength: 6, attack: 7, defence: 3, hp: 15, initiative: 6, movement: 4 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "aerial-whisper",
    name: "Aerial Whisper",
    role: "Aerial skirmisher",
    description:
      "Winged messengers on currents of thought, boasting +2 INIT on aurora steppes and Sky Sanctums where news spreads fastest.",
    detail:
      "They relay delicate agreements from ridge-top eyries, diving between ideas before skeptics can pin them down.",
    traits: [
      "Spiral Dive: Rapid assaults harry slow-moving notions.",
      "Courier's Grace: Swift repositioning avoids counter-arguments.",
    ],
    terrainModifiers: {
      steppe: { initiative: 2 },
      sanctum: { initiative: 2 },
    },
    stats: { strength: 4, attack: 6, defence: 3, hp: 11, initiative: 9, movement: 6 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "current-sentinel",
    name: "Current Sentinel",
    role: "Current spearwall",
    description:
      "Disciplined spear lines that hold emotional bridges, gaining +1 ATK/+1 DEF on Star Currents.",
    detail:
      "They patrol the flows of empathy, levying tolls in perspective before allowing armies to cross.",
    traits: [
      "Wall of Reassurance: Keeps surging impulses at bay with interlocking staves.",
      "River Wardens: Control ferries of thought to deny hostile landings.",
    ],
    terrainModifiers: {
      current: { attack: 1, defence: 1 },
    },
    stats: { strength: 6, attack: 6, defence: 5, hp: 16, initiative: 5, movement: 3 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "shadow-doubt",
    name: "Shadow Doubt",
    role: "Stealth operative",
    description:
      "Strikes from the subconscious with +2 ATK in Lumin Groves and Sky Sanctums but suffers -1 DEF on open aurora steppes of scrutiny.",
    detail:
      "They enforce neutrality pacts by quietly removing influences that tip the balance too far one way.",
    traits: [
      "Silent Question: Eliminates targets before alarms sound.",
      "Vanishing Trail: Melds with alleys and radiant canopies.",
    ],
    terrainModifiers: {
      grove: { attack: 2 },
      sanctum: { attack: 2 },
      steppe: { defence: -1 },
    },
    stats: { strength: 5, attack: 8, defence: 3, hp: 12, initiative: 8, movement: 5 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "heirloom-ent",
    name: "Heirloom Ent",
    role: "Living fortification",
    description:
      "An ancient memory-tree with +3 DEF in Lumin Groves and +2 STR when rooted in glimmer fens of deep feeling.",
    detail:
      "Ents awaken when treasured traditions are threatened, crushing invaders beneath ironbark limbs.",
    traits: [
      "Rooted Rampart: Bark armor wards off relentless sieges.",
      "Verdant Fury: Draws on wet soil to fuel devastating swings.",
    ],
    terrainModifiers: {
      grove: { defence: 3 },
      fen: { strength: 2 },
    },
    stats: { strength: 8, attack: 6, defence: 8, hp: 26, initiative: 2, movement: 1 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "stillness-oracle",
    name: "Stillness Oracle",
    role: "Control caster",
    description:
      "Manipulates icy calm, reducing enemy INIT while gaining +2 DEF on Star Currents and Celestial Spires of reflection.",
    detail:
      "Oracles freeze racing thoughts to stall conflict until minds can settle on a course.",
    traits: [
      "Frost Lock: Slows foes with numbing insight.",
      "Icebound Ward: Channels cold stone and rivers for protection.",
    ],
    terrainModifiers: {
      current: { defence: 2 },
      spire: { defence: 2 },
    },
    stats: { strength: 4, attack: 6, defence: 5, hp: 14, initiative: 5, movement: 3 },
    cost: { inspiration: 0, will: 0 },
  },
  {
    id: "resolve-monolith",
    name: "Resolve Monolith",
    role: "Animated bulwark",
    description:
      "A sentient shard of determination with immense HP and DEF, immobile but relentless in holding its ground.",
    detail:
      "The monolith drifts between contested thoughts, shielding settlements that honor the mind's core bargains.",
    traits: [
      "Impassable Will: Near-impenetrable defenses slow entire battalions.",
      "Arcane Core: Redirects magical assaults into radiant counterblows.",
    ],
    stats: { strength: 7, attack: 4, defence: 9, hp: 28, initiative: 1, movement: 0 },
    cost: { inspiration: 0, will: 0 },
  },
];

export const getRandomIndependentUnit = () => {
  if (INDEPENDENT_UNITS.length === 0) {
    throw new Error("No independent units defined");
  }
  const index = Math.floor(Math.random() * INDEPENDENT_UNITS.length);
  return INDEPENDENT_UNITS[index];
};
