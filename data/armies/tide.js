export const tideArmy = {
  faction: {
    id: "tide",
    name: "Tideforged Enclave",
    summary: "Amphibious tacticians who reshape the shoreline each battle.",
  },
  roster: [
    {
      id: "reef-guardians",
      name: "Reef Guardians",
      role: "Coral phalanx",
      description:
        "Tidal infantry wielding living coral shields that harden under pressure.",
      detail:
        "Guardians advance as a rolling wave, their coral plating knitting closed the moment blows land.",
      traits: [
        "Tidal Bulwark: Gain +1 DEF when fighting in or adjacent to water hexes.",
        "Undertow Hold: Enemies that disengage suffer -1 INIT next round.",
      ],
      stats: { strength: 7, attack: 6, defence: 6, hp: 19, initiative: 5 },
    },
    {
      id: "brine-slingers",
      name: "Brine Slingers",
      role: "Hydrokinetic artillery",
      description:
        "Launch pressurised jets that carve channels through even rocky highlands.",
      detail:
        "Slingers sculpt the battlefield, eroding defensive walls while providing mobile cover for allies.",
      traits: [
        "Erosive Volley: Reduce target DEF by 1 until the end of the battle when damage is dealt.",
        "Misty Veil: Create light cover, granting adjacent allies +1 DEF after attacking.",
      ],
      stats: { strength: 5, attack: 8, defence: 4, hp: 15, initiative: 6 },
    },
    {
      id: "current-callers",
      name: "Current Callers",
      role: "Support channelers",
      description:
        "Flow-sculptors who redirect allies across waterways in an instant.",
      detail:
        "Callers weave currents that ferry warriors along unseen rivers while drowning enemy supply lines.",
      traits: [
        "River Gate: Once per turn, swap positions of two friendly units on water hexes.",
        "Undercurrent Surge: Allied units entering battle from water gain +1 INIT this round.",
      ],
      stats: { strength: 4, attack: 6, defence: 4, hp: 14, initiative: 7 },
    },
    {
      id: "kelp-stalkers",
      name: "Kelp Stalkers",
      role: "Ambush predators",
      description:
        "Camouflaged hunters that strike unseen from swamp and shoreline alike.",
      detail:
        "Stalkers bind prey in tidal fronds, leaving them helpless as the rest of the enclave sweeps in.",
      traits: [
        "Drowning Snare: First hit each battle roots the target, preventing movement next round.",
        "Slipstream Veil: Gain +1 DEF against ranged attacks while in swamp or water.",
      ],
      stats: { strength: 6, attack: 7, defence: 5, hp: 16, initiative: 8 },
    },
    {
      id: "storm-marshals",
      name: "Storm Marshals",
      role: "Tempest cavalry",
      description:
        "Leviathan riders that crash through waves with thunderous impact.",
      detail:
        "Marshals direct tidal booms that scatter opposing formations before the decisive strike lands.",
      traits: [
        "Breaker Charge: Charge attacks from water hexes deal +2 damage.",
        "Tidal Wake: After moving, push adjacent enemy units 1 hex directly away if possible.",
      ],
      stats: { strength: 8, attack: 7, defence: 5, hp: 18, initiative: 7 },
    },
  ],
};
