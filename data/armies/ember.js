export const emberArmy = {
  faction: {
    id: "ember",
    name: "Ember Legion",
    summary: "Fanatical pyromancers that overwhelm foes with relentless pressure.",
  },
  roster: [
    {
      id: "cinder-lancers",
      name: "Cinder Lancers",
      role: "Blazing vanguard",
      description:
        "Plate-clad spears that ignite their weapons to break entrenched lines.",
      detail:
        "Cinder Lancers surge forward in disciplined wedges, their superheated spears melting shields and sowing panic.",
      traits: [
        "Molten Thrust: 7 ATK and 7 STR give them a punishing opening assault.",
        "Shieldbreaker Drill: Their solid 17 HP keeps them in the fight after crashing into the line.",
      ],
      stats: { strength: 7, attack: 7, defence: 5, hp: 17, initiative: 6 },
      cost: { gold: 2, metal: 2 },
    },
    {
      id: "ashen-fusiliers",
      name: "Ashen Fusiliers",
      role: "Volatile gunners",
      description:
        "Experimental firecasters who bombard foes with alchemical bursts.",
      detail:
        "Fusiliers blend sorcery and shrapnel, blanketing the field in embers that force opponents out of cover.",
      traits: [
        "Alchemical Salvo: 8 ATK volleys soften up priority targets at range.",
        "Risky Rigging: Low 13 HP means they falter quickly if focused.",
      ],
      stats: { strength: 5, attack: 8, defence: 3, hp: 13, initiative: 7 },
      cost: { gold: 2, metal: 1 },
    },
    {
      id: "pyre-adepts",
      name: "Pyre Adepts",
      role: "Battle mages",
      description:
        "Flamecallers who twist battlefield hazards into fuel for their sorcery.",
      detail:
        "Adepts kindle cinderstorms that both blind the enemy and invigorate allied zealots surging through the smoke.",
      traits: [
        "Burning Lance: 7 ATK spells carve through defences to set up kills.",
        "Fanatic Zeal: Initiative 8 keeps them acting alongside the fastest Ember troops.",
      ],
      stats: { strength: 6, attack: 7, defence: 4, hp: 15, initiative: 8 },
      cost: { gold: 2, metal: 2 },
    },
    {
      id: "slag-wardens",
      name: "Slag Wardens",
      role: "Heat-tempered bulwark",
      description:
        "Obdurate defenders that convert incoming blows into rippling shockwaves.",
      detail:
        "Wardens anchor siege lines, venting built-up heat to shatter reckless attackers who press too close.",
      traits: [
        "Heat-Hardened: Towering 7 DEF lets them absorb sustained punishment.",
        "Radiant Core: Massive 21 HP makes them the toughest line holders in the legion.",
      ],
      stats: { strength: 8, attack: 5, defence: 7, hp: 21, initiative: 4 },
      cost: { gold: 1, metal: 4 },
    },
    {
      id: "flare-outriders",
      name: "Flare Outriders",
      role: "Scorching cavalry",
      description:
        "Jet-assisted riders that streak across plains leaving blazing contrails.",
      detail:
        "Outriders harry the flanks, torching supply lines before vanishing behind walls of smoke.",
      traits: [
        "Flare Rush: 7 ATK slashes through targets before counter-fire can land.",
        "Ignition Spur: Blazing 9 INIT means they almost always strike first.",
      ],
      stats: { strength: 6, attack: 7, defence: 4, hp: 16, initiative: 9 },
      cost: { gold: 3, metal: 1 },
    },
  ],
};
