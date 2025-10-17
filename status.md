# Status Overview

## Turn Phases
- The Start → Main → End sequence drives both the sidebar checklist and the internal phase index mapping.【F:script.js†L270-L288】
- Each new turn awards capital income, applies regeneration, and then advances the active faction straight into the Main phase for player orders.【F:script.js†L96-L100】【F:script.js†L1040-L1082】
- Ending a turn is only possible during the Main phase; selecting it resolves any contested cells, rotates the active faction, increments the turn counter, and restarts the loop.【F:script.js†L1085-L1136】

## Units
- Army rosters (Sun, Moon, Ember, Tide) and the independent dossier include movement values, terrain perks, and recruitment costs consumed by the UI.【F:data/armies/sun.js†L1-L115】【F:data/armies/moon.js†L1-L115】【F:data/armies/ember.js†L1-L165】【F:data/armies/tide.js†L1-L155】【F:data/independent-units.js†L1-L278】
- Chosen armies cache their templates so each recruited unit becomes an independent instance whose stats can diverge in combat without mutating the source data.【F:script.js†L706-L752】【F:script.js†L1890-L1944】
- The unit sidebar supports multi-select with inline movement previews, and movement orders always respect the slowest unit in the selected group.【F:script.js†L2437-L2516】【F:script.js†L2140-L2295】

## Combat
- Contested tiles automatically queue a battle at end of turn; the resolver builds a modal view, applies any terrain modifiers, and steps through the fight.【F:script.js†L1478-L1889】
- Engagements iterate through initiative tiers, toggling active indicators, logging attack summaries, and applying simultaneous damage before checking for survivors.【F:script.js†L1676-L1784】
- Results prune defeated units from both the board model and the rendered stack, then restore focus to the map for the next action.【F:script.js†L1786-L1868】

## Resources
- Terrain definitions seed gold/metal dice ranges, and grid generation rolls and stores those values on each cell for later retrieval.【F:script.js†L55-L157】【F:script.js†L1952-L2050】
- The sidebar tracks faction stockpiles in real time, pairing the markup with dedicated styling and update hooks for accessibility announcements.【F:index.html†L47-L121】【F:style.css†L406-L455】【F:script.js†L242-L259】
- Capitals now produce faction-specific income at the start of every turn before regeneration resolves, feeding directly into the resource tracker.【F:script.js†L96-L100】【F:script.js†L1040-L1082】
- Recruiting units at a capital spends the appropriate gold/metal costs before adding the new instance to the selected stack.【F:script.js†L2579-L2624】

## Setup & Independent Control
- Selecting armies resets the board, seeds faction rosters, and launches capital placement in the order the players chose their factions.【F:script.js†L706-L752】【F:script.js†L411-L455】
- Each faction must claim a capital within its permitted zone (top third for the first picker, bottom third for the second); errors update both the summary text and the highlighted cells until a valid choice is made.【F:script.js†L318-L362】【F:script.js†L2669-L2710】
- Once capitals are placed the map is repopulated with independent defenders and the first faction begins its start-of-turn income and regeneration sequence.【F:script.js†L2349-L2373】【F:script.js†L1040-L1082】
- Capital tiles retain distinctive styling and tooltips so commanders can quickly spot their strongholds,【F:script.js†L214-L236】【F:style.css†L148-L170】 and movement targets are overlaid with their own highlight to clarify valid destinations.【F:script.js†L2140-L2199】【F:style.css†L148-L159】
