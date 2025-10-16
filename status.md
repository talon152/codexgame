# Status Overview

## Turn Phases
- The phase order is defined as Start, Main, and End, each with a short rules summary used to render the UI checklist.【F:script.js†L130-L159】
- Starting a turn forces the state machine through the Start phase (handling regeneration) and then immediately advances to the Main phase for player actions.【F:script.js†L809-L821】
- Ending a turn is only possible during the Main phase. Pressing "End Turn" pushes the game into combat resolution, advances the faction turn order, and loops back through the Start/Main cycle for the next round.【F:script.js†L823-L875】

## Units
- Army rosters live in the `data/armies` folder; each faction provides a list of unit templates with roles, trait text, terrain modifiers, stats, and costs that feed the roster picker and debug deployment tools.【F:data/armies/sun.js†L1-L100】
- During army selection the chosen rosters are cached per faction, and every deployed stack clones one of these templates into a tracked instance (with unique IDs, stats, terrain modifiers, and costs) so battles can mutate HP without touching the source data.【F:script.js†L582-L605】【F:script.js†L1628-L1689】
- Neutral forces now use a dedicated independent roster containing fifteen unique unit types with their own terrain bonuses and statlines. These templates drive the neutral armies that occupy the map at setup.【F:data/independent-units.js†L1-L289】

## Combat
- Battles trigger automatically on contested cells at end of turn. The resolver gathers all factions in the cell, builds the battle view, and applies any terrain modifiers before fighting.【F:script.js†L1238-L1305】【F:script.js†L1147-L1253】
- Combat proceeds in initiative steps; units act from highest to lowest initiative, mark the acting cards, and queue damage against opposing forces before resolving it simultaneously.【F:script.js†L1369-L1498】
- Damage is calculated from a unit’s attack plus half its strength (with random variance) against half the defender’s defence. Survivors remain on the tile, while defeated stacks are removed from both the board model and the UI.【F:script.js†L1373-L1451】【F:script.js†L1577-L1607】

## Resources
- Each terrain type defines gold and metal dice ranges, and grid generation rolls those ranges when a cell is created, storing the values on the DOM node for later reference.【F:script.js†L50-L127】【F:script.js†L1952-L1988】
- Resource readouts pull the stored values into the sidebar; cells with no rolled output render a "No resources" placeholder.【F:script.js†L1703-L1751】

## Setup & Independent Control
- When two armies are chosen the board resets, capital markers are cleared, and capital placement mode begins with faction order locked to the selection.【F:script.js†L582-L605】【F:script.js†L237-L254】
- Each faction must click a valid capital on its assigned half of the map (west for the first player, east for the second). Invalid choices surface contextual guidance in the phase summary until a legal location is chosen.【F:script.js†L150-L188】【F:script.js†L1893-L1934】
- After both capitals are set the mode ends, the turn track resumes, and every remaining cell is seeded with one or two independent units drawn at random from the neutral roster.【F:script.js†L1665-L1700】
- Capital cells gain a visual badge and extra tooltip context so commanders can quickly spot the chosen strongholds during play.【F:script.js†L209-L235】【F:style.css†L128-L150】
