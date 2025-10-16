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
        "Coral Rampart: Natural 6 DEF makes them stubborn frontline defenders.",
        "Rolling Wave: Their durable 19 HP lets them weather protracted clashes.",
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
        "Pressurised Jets: 8 ATK bursts carve through entrenched positions.",
        "Veil of Spray: 15 HP gives them modest staying power for artillery units.",
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
        "Guiding Currents: 6 ATK helps them chip in damage while supporting allies.",
        "Tidal Insight: Initiative 7 allows them to react quickly during each combat pass.",
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
        "Tidal Ambush: 7 ATK punishes foes that underestimate their reach.",
        "Ebb and Flow: 16 HP and 8 INIT keep them dangerous deep into a battle.",
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
        "Storm Surge: 7 ATK and 8 STR deliver crushing cavalry blows.",
        "Wave-Rider: Initiative 7 keeps them on pace with other frontline Tideforged units.",
      ],
      stats: { strength: 8, attack: 7, defence: 5, hp: 18, initiative: 7 },
    },
  ],
};
