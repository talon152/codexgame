export const joyArmy = {
  faction: {
    id: "joy",
    name: "Joy Chorus",
    summary: "Radiant avatars of delight who fortify hope and accelerate recovery across the auroral archipelago.",
  },
  roster: [
    {
      id: "gleam-wardens",
      name: "Gleam Wardens",
      role: "Uplifting infantry",
      description:
        "Festival guardians that brighten sky sanctums, gaining +2 DEF while defending luminous plazas that echo with celebration.",
      detail:
        "Wardens weave protective choruses that help nearby fragments of self knit back together after each clash.",
      traits: [
        "Celebration Bulwark: Their 5 DEF keeps despairing blows from landing, rising to 7 DEF inside joyful plazas.",
        "Resonant Guard: Allies adjacent to their tile regain confidence more quickly between exchanges.",
      ],
      terrainModifiers: {
        sanctum: { defence: 2 },
      },
      stats: { strength: 7, attack: 6, defence: 5, hp: 18, initiative: 6, movement: 3 },
      cost: { inspiration: 2, will: 1 },
    },
    {
      id: "euphoria-riders",
      name: "Euphoria Riders",
      role: "Surging cavalry",
      description:
        "Galloping waves of elation that gain +2 ATK/+1 INIT on the open aurora steppe but lose 1 ATK/INIT when climbing into Celestial Spires.",
      detail:
        "They crash through oppressive thoughts before looping back to rally wavering allies with infectious laughter.",
      traits: [
        "Burst of Delight: Opening strikes leverage 8 ATK to crack anxious lines.",
        "Momentum High: Gain +2 ATK and +1 INIT on aurora steppes, but lose 1 ATK and 1 INIT on Celestial Spire slopes.",
      ],
      terrainModifiers: {
        steppe: { attack: 2, initiative: 1 },
        spire: { attack: -1, initiative: -1 },
      },
      stats: { strength: 6, attack: 8, defence: 4, hp: 16, initiative: 8, movement: 5 },
      cost: { inspiration: 3, will: 1 },
    },
    {
      id: "laughter-flare",
      name: "Laughter Flare",
      role: "Radiant support",
      description:
        "Blazing mirth that burns through glimmer fens, gaining +2 ATK when contesting the mist-wreathed bogs of stagnation.",
      detail:
        "The flare pulses waves of endorphins that erode gloom before it ever reaches the front line.",
      traits: [
        "Joyous Volley: Focused 7 ATK bursts whittle down entrenched dread, jumping to 9 ATK in glimmer fens.",
        "Fragile Spark: With only 14 HP they rely on guardians to keep them alight once engaged.",
      ],
      terrainModifiers: {
        fen: { attack: 2 },
      },
      stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 7, movement: 4 },
      cost: { inspiration: 2, will: 2 },
    },
    {
      id: "comfort-bastion",
      name: "Comfort Bastion",
      role: "Anchoring phalanx",
      description:
        "Embracing bulwarks that shelter Lumin Grove paths, gaining +2 DEF from rooted memories of safety.",
      detail:
        "They absorb surges of rage with patient warmth, buying time for serenity to retake the terrain.",
      traits: [
        "Immovable Assurance: Their 7 DEF turns most blows into glancing touches and rises to 9 DEF in Lumin Groves.",
        "Enduring Glow: 20 HP lets them weather long assaults without dimming.",
      ],
      terrainModifiers: {
        grove: { defence: 2 },
      },
      stats: { strength: 8, attack: 5, defence: 7, hp: 20, initiative: 4, movement: 2 },
      cost: { inspiration: 1, will: 3 },
    },
    {
      id: "spark-scouts",
      name: "Spark Scouts",
      role: "Gleeful outriders",
      description:
        "Playful messengers who dart through Lumin Groves and Sky Sanctums, gaining +1 INIT in familiar celebratory terrain.",
      detail:
        "Scouts race ahead to seed optimism, ensuring every region feels the pulse of the chorus before battle arrives.",
      traits: [
        "Radiant Advance: Balanced 6 ATK and 7 INIT make them dependable first responders, rising to 8 INIT in Lumin Groves and Sky Sanctums.",
        "Bottled Sunshine: They can ferry inspiration to nearby stacks after victories.",
      ],
      terrainModifiers: {
        grove: { initiative: 1 },
        sanctum: { initiative: 1 },
      },
      stats: { strength: 6, attack: 6, defence: 4, hp: 15, initiative: 7, movement: 5 },
      cost: { inspiration: 1, will: 1 },
    },
  ],
};
