export const envyArmy = {
  faction: {
    id: "envy",
    name: "Envy Syndicate",
    summary: "Cunning manifestations of jealousy that siphon strength from rivals and weaponise comparison amid the radiant skies.",
  },
  roster: [
    {
      id: "covetous-raiders",
      name: "Covetous Raiders",
      role: "Adaptive infantry",
      description:
        "Opportunists who mirror nearby strengths, gaining +1 STR/+1 DEF when sharing a tile with an allied stack.",
      detail:
        "They catalogue every advantage others enjoy and imitate it until the original owners buckle under shame.",
      traits: [
        "Stolen Edge: Base 6 STR/5 DEF climb to 7 STR/6 DEF when another friendly unit occupies the cell.",
        "Parasite Formation: After victories they harvest fragments of enemy abilities for later rounds.",
      ],
      terrainModifiers: {},
      stats: { strength: 6, attack: 6, defence: 5, hp: 18, initiative: 6, movement: 3 },
      cost: { inspiration: 2, will: 1 },
    },
    {
      id: "mirror-pirouettes",
      name: "Mirror Pirouettes",
      role: "Reactive skirmishers",
      description:
        "Sinuous duelists who gain +2 INIT on Star Currents by copying the fluid grace of admired foes.",
      detail:
        "They dance around opponents, reflecting every flourish back with a spiteful twist that undermines confidence.",
      traits: [
        "Envious Riposte: 7 INIT climbs to 9 INIT on Star Currents, letting them respond before rivals can bask in success.",
        "Fluid Imitation: When they defeat an enemy they temporarily borrow +1 ATK for the next battle.",
      ],
      terrainModifiers: {
        current: { initiative: 2 },
      },
      stats: { strength: 5, attack: 6, defence: 4, hp: 15, initiative: 7, movement: 5 },
      cost: { inspiration: 2, will: 1 },
    },
    {
      id: "grudge-artillerists",
      name: "Grudge Artillerists",
      role: "Ranged saboteurs",
      description:
        "Long-range projections that gain +2 ATK on Celestial Spires as they hurl weaponised comparisons from lofty vantage points.",
      detail:
        "Each salvo is a litany of perceived slights, exploding into shrapnel that convinces targets they'll never measure up.",
      traits: [
        "Barbed Accusations: Baseline 7 ATK jumps to 9 ATK on Celestial Spire ridges.",
        "Spotlight Theft: Damaging an enemy stack siphons 1 inspiration into the Envy reserve once per turn.",
      ],
      terrainModifiers: {
        spire: { attack: 2 },
      },
      stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 6, movement: 4 },
      cost: { inspiration: 2, will: 2 },
    },
    {
      id: "siphon-corsairs",
      name: "Siphon Corsairs",
      role: "Amphibious cavalry",
      description:
        "Predatory raiders who gain +1 STR/+1 ATK on Star Currents while draining 1 inspiration from captured tiles.",
      detail:
        "They surge through emotional tides, stealing credit and momentum to deny others the spotlight.",
      traits: [
        "Jealous Undertow: Base 6 STR/7 ATK rise to 7 STR/8 ATK on Star Currents.",
        "Credit Hoarders: Seize 1 inspiration from defeated foes if any remains.",
      ],
      terrainModifiers: {
        current: { strength: 1, attack: 1 },
      },
      stats: { strength: 6, attack: 7, defence: 4, hp: 16, initiative: 7, movement: 5 },
      cost: { inspiration: 3, will: 1 },
    },
    {
      id: "envy-obelisks",
      name: "Envy Obelisks",
      role: "Control bastions",
      description:
        "Towering monuments that project comparison auras, gaining +2 DEF in Sky Sanctums and converting excess inspiration into will.",
      detail:
        "They remind every inhabitant of others' successes until only those who can weaponise that longing remain loyal.",
      traits: [
        "Coveting Citadel: Base 7 DEF becomes 9 DEF inside sanctum hubs.",
        "Transmute Longing: Whenever they secure a tile that produced inspiration, gain 1 will as well.",
      ],
      terrainModifiers: {
        sanctum: { defence: 2 },
      },
      stats: { strength: 8, attack: 5, defence: 7, hp: 20, initiative: 4, movement: 2 },
      cost: { inspiration: 1, will: 3 },
    },
  ],
};
