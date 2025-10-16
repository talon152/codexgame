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
        "Molten Thrust: First strike each battle deals +2 damage against fortified targets.",
        "Searing Wall: Adjacent allies gain +1 DEF after the lancers charge.",
      ],
      stats: { strength: 7, attack: 7, defence: 5, hp: 17, initiative: 6 },
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
        "Scatterburst: Attacks splash 1 damage onto an additional enemy unit in the same hex.",
        "Volatile Magazine: Roll a d6 after attacking; on a 1 the fusiliers suffer 2 damage.",
      ],
      stats: { strength: 5, attack: 8, defence: 3, hp: 13, initiative: 7 },
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
        "Kindled Gale: Forest and swamp hexes count as plains for movement after the adepts act.",
        "Blazing Focus: Gain +1 ATK when targeting a unit already suffering damage this turn.",
      ],
      stats: { strength: 6, attack: 7, defence: 4, hp: 15, initiative: 8 },
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
        "Thermal Reprisal: The first time they are hit each battle, return 2 damage to the attacker.",
        "Ember Rampart: Gain +1 DEF while adjacent to another Ember Legion unit.",
      ],
      stats: { strength: 8, attack: 5, defence: 7, hp: 21, initiative: 4 },
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
        "Contrail Screen: After moving, reduce ranged damage against adjacent allies by 1.",
        "Flash Brand: Cavalry charges inflict -1 DEF on their target until end of battle.",
      ],
      stats: { strength: 6, attack: 7, defence: 4, hp: 16, initiative: 9 },
    },
  ],
};
