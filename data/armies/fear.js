export const fearArmy = {
  faction: {
    id: "fear",
    name: "Fear Dominion",
    summary: "Shadows of anxiety that manipulate perception, dragging foes into hesitation and doubt.",
  },
  roster: [
    {
      id: "dread-sentries",
      name: "Dread Sentries",
      role: "Oppressive infantry",
      description:
        "Nightmarish wardens who thrive in forests, gaining +3 DEF as they twist branches into cages of apprehension.",
      detail:
        "They whisper half-remembered failures that paralyse attackers long enough for other nightmares to descend.",
      traits: [
        "Suffocating Presence: 6 DEF becomes 9 DEF among tangled woods where fear tightens.",
        "Lingering Chill: Enemies that retreat from their tile begin the next battle with lowered morale.",
      ],
      terrainModifiers: {
        forest: { defence: 3 },
      },
      stats: { strength: 7, attack: 5, defence: 6, hp: 18, initiative: 5, movement: 3 },
      cost: { inspiration: 1, will: 2 },
    },
    {
      id: "phantom-couriers",
      name: "Phantom Couriers",
      role: "Haunting skirmishers",
      description:
        "Spectral messengers who slip through swamps, gaining +2 INIT/+1 ATK when fighting amid murky recollections.",
      detail:
        "They deliver jolts of panic before melting back into the mist, forcing armies to fight in fragmented formation.",
      traits: [
        "Unnerving Flurry: Flexible 6 ATK and 7 INIT jump to 7 ATK/9 INIT in swamps.",
        "Fleeting Echo: After striking they can relocate one tile, leaving panic behind.",
      ],
      terrainModifiers: {
        swamp: { attack: 1, initiative: 2 },
      },
      stats: { strength: 5, attack: 6, defence: 4, hp: 14, initiative: 7, movement: 5 },
      cost: { inspiration: 2, will: 1 },
    },
    {
      id: "terror-mancers",
      name: "Terror Mancers",
      role: "Hexing casters",
      description:
        "Wielders of chilling illusions who gain +2 ATK and +1 STR on water, reflecting how dread floods the mind.",
      detail:
        "They conjure visions of worst-case futures, sapping resolve while reshaping terrain into traps.",
      traits: [
        "Flood of Dread: Base 6 STR/7 ATK become 7 STR/9 ATK on water.",
        "Piercing Whispers: Even if their attacks glance off, they inflict a temporary INIT penalty on enemies.",
      ],
      terrainModifiers: {
        water: { strength: 1, attack: 2 },
      },
      stats: { strength: 6, attack: 7, defence: 3, hp: 15, initiative: 6, movement: 4 },
      cost: { inspiration: 2, will: 2 },
    },
    {
      id: "panic-harrowers",
      name: "Panic Harrowers",
      role: "Assault cavalry",
      description:
        "Mounted dread that feeds on mountain echoes, gaining +2 INIT while descending but losing 1 ATK on bright plains.",
      detail:
        "They stampede down cliffs in clattering waves, sending shards of trepidation rippling through whole provinces.",
      traits: [
        "Avalanche Charge: Their 7 INIT spikes to 9 INIT on mountains to seize the first strike.",
        "Sunblind: Lose 1 ATK on plains saturated with optimism.",
      ],
      terrainModifiers: {
        mountain: { initiative: 2 },
        plain: { attack: -1 },
      },
      stats: { strength: 6, attack: 7, defence: 4, hp: 16, initiative: 7, movement: 5 },
      cost: { inspiration: 3, will: 1 },
    },
    {
      id: "gloom-anchors",
      name: "Gloom Anchors",
      role: "Fortifying titans",
      description:
        "Colossal fears that root themselves in villages, gaining +2 DEF there while draining 1 INIT from adjacent foes.",
      detail:
        "They crystallise the terror of letting others down, locking settlements into spirals of apprehension until freed.",
      traits: [
        "Unshakable Paranoia: Base 7 DEF rises to 9 DEF amid populated centers.",
        "Aura of Ominous Silence: Adjacent enemies begin engagements at -1 INIT.",
      ],
      terrainModifiers: {
        village: { defence: 2 },
      },
      stats: { strength: 8, attack: 5, defence: 7, hp: 21, initiative: 4, movement: 2 },
      cost: { inspiration: 1, will: 3 },
    },
  ],
};
