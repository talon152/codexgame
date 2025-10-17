# Status Overview

## Core Loop & Phases
- Turn structure is defined as Start/Main/End phases, driving UI labels and gating actions based on the `turnState` indices.【F:script.js†L295-L325】【F:script.js†L448-L520】
- Starting a turn collects capital income, sums territory production from owned provinces, applies 20% regeneration to damaged units, and refreshes the sidebar displays before handing control to the Main phase.【F:script.js†L1015-L1183】
- Ending the Main phase locks the advance button, runs queued battles for contested cells, rotates the active faction, increments the turn counter, and restarts the loop at the next Start phase.【F:script.js†L1186-L1238】【F:script.js†L1889-L2050】

## Setup & Capitals
- Players pick two armies through the modal selector, which seeds faction rosters, resets board state, and launches the capital placement flow.【F:index.html†L373-L430】【F:script.js†L962-L1013】
- Capital placement enforces alternating north/south zones, surfaces guidance messaging, marks chosen strongholds, and records ownership for income tracking.【F:script.js†L346-L505】【F:script.js†L2799-L2831】
- Once every faction claims a capital the map is populated with independent defenders, the turn order resets to the first faction, and Start-phase upkeep begins automatically.【F:script.js†L2567-L2603】

## Map & Resources
- The board generator builds a 10×10 grid with randomised terrain, assigns resource values per terrain rules, and renders badges plus stack counters for each cell.【F:script.js†L59-L140】【F:script.js†L2959-L3044】
- Resource counters in the sidebar mirror the active faction's reserves, while the overlay selector can toggle per-cell income highlights for quick scanning.【F:index.html†L71-L142】【F:script.js†L282-L293】【F:script.js†L132-L139】【F:script.js†L3041-L3048】

## Units & Recruitment
- Army data modules expose detailed rosters for the Joy, Fear, Anger, and Envy factions, and are cached so recruited units can diverge from their templates.【F:data/armies/index.js†L1-L12】【F:data/armies/joy.js†L1-L101】【F:data/armies/fear.js†L1-L99】【F:data/armies/anger.js†L1-L102】【F:data/armies/envy.js†L1-L97】
- Independent unit tables supply neutral defenders that are instantiated across non-capital tiles after setup to contest expansion.【F:data/independent-units.js†L1-L289】【F:script.js†L2567-L2591】
- Recruiting opens a faction-specific modal, checks affordability, enforces capital-only placement during the Main phase, spends resources, and injects the new unit into the selected stack with feedback messaging.【F:script.js†L640-L759】【F:script.js†L2834-L2879】

## Movement & Control
- Cell selections render resource/unit breakdowns, keep movement guidance current, and maintain a multi-select list for grouping units.【F:script.js†L2641-L2776】
- Movement orders compute shared range for the slowest unit, highlight valid destinations, transfer units between cells, update ownership for unoccupied provinces, and preserve the moved selection for follow-up actions.【F:script.js†L2197-L2524】

## Combat & Resolution
- Contested cells are queued at end of turn, where the battle modal loads each side, applies terrain modifiers, iterates initiative steps with animated summaries, and writes back survivors to the map.【F:script.js†L1600-L2050】
- Province control, battle logs, and modal focus/continue handling ensure outcomes update both data structures and the UI before returning players to the map.【F:script.js†L1786-L2050】【F:index.html†L148-L189】

## UI & Accessibility
- The interface layers include help tabs, overlay toggles, recruit/move controls, and modal focus management to keep keyboard users oriented.【F:index.html†L25-L246】【F:script.js†L1280-L1358】【F:script.js†L3041-L3176】
- Live regions announce turn/phase/capital guidance updates, and Escape closes secondary modals while leaving the army picker dominant when active.【F:index.html†L13-L188】【F:script.js†L493-L505】【F:script.js†L3157-L3176】
