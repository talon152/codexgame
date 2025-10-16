import { ARMIES, getArmyById } from "./data/armies/index.js";
import {
  INDEPENDENT_FACTION,
  getRandomIndependentUnit,
} from "./data/independent-units.js";

const GRID_SIZE = 10;

const mapGrid = document.getElementById("map-grid");
const selectedCellDisplay = document.getElementById("selected-cell");
const currentFactionDisplay = document.getElementById("current-faction");
const turnCounterDisplay = document.getElementById("turn-counter");
const phaseNameDisplay = document.getElementById("phase-name");
const phaseSummaryDisplay = document.getElementById("phase-summary");
const phaseListElement = document.getElementById("phase-list");
const advancePhaseButton = document.getElementById("advance-phase");
const cellUnitList = document.getElementById("cell-unit-list");
const cellResourceList = document.getElementById("cell-resource-list");
const addUnitButton = document.getElementById("add-unit-button");
const capitalGuidance = document.getElementById("capital-guidance");
const unitModal = document.getElementById("unit-modal");
const unitModalList = document.getElementById("unit-modal-list");
const unitModalCloseButton = document.getElementById("unit-modal-close");
const unitModalFactionLabel = document.getElementById("unit-modal-faction");
const armySelectorModal = document.getElementById("army-selector-modal");
const armySelectorForm = document.getElementById("army-selector-form");
const firstArmySelect = document.getElementById("first-army-select");
const secondArmySelect = document.getElementById("second-army-select");
const firstArmySummary = document.getElementById("first-army-summary");
const secondArmySummary = document.getElementById("second-army-summary");
const armySelectorStartButton = document.getElementById("army-selector-start");
const armySelectorError = document.getElementById("army-selector-error");
const battleModal = document.getElementById("battle-modal");
const battleTopList = document.getElementById("battle-top-units");
const battleBottomList = document.getElementById("battle-bottom-units");
const battleTopLabel = document.getElementById("battle-top-label");
const battleBottomLabel = document.getElementById("battle-bottom-label");
const battleLocationDisplay = document.getElementById("battle-location");
const battleLogEntries = document.getElementById("battle-log-entries");
const battleSpeedControl = document.getElementById("battle-speed-control");
const battleSpeedValue = document.getElementById("battle-speed-value");
const battleCloseButton = document.getElementById("battle-close");
const helpButton = document.getElementById("help-button");
const helpModal = document.getElementById("help-modal");
const helpCloseButton = document.getElementById("help-close");
const helpTabButtons = Array.from(
  document.querySelectorAll("[data-help-tab]"),
);
const helpPanels = Array.from(document.querySelectorAll("[data-help-panel]"));

const TERRAIN_TYPES = [
  { name: "forest", label: "Forest", className: "terrain-forest" },
  { name: "plain", label: "Plain", className: "terrain-plain" },
  { name: "village", label: "Village", className: "terrain-village" },
  { name: "mountain", label: "Mountain", className: "terrain-mountain" },
  { name: "swamp", label: "Swamp", className: "terrain-swamp" },
  { name: "water", label: "Water", className: "terrain-water" },
];

const TERRAIN_RESOURCE_RULES = {
  forest: {
    gold: { min: 1, max: 2 },
    metal: { min: 1, max: 2 },
  },
  plain: {
    gold: { min: 2, max: 4 },
    metal: { min: 0, max: 1 },
  },
  village: {
    gold: { min: 3, max: 5 },
    metal: { min: 1, max: 2 },
  },
  mountain: {
    gold: { min: 0, max: 1 },
    metal: { min: 3, max: 5 },
  },
  swamp: {
    gold: { min: 1, max: 3 },
    metal: { min: 0, max: 1 },
  },
  water: {
    gold: { min: 1, max: 2 },
    metal: { min: 0, max: 0 },
  },
};

const RESOURCE_TYPES = [
  { key: "gold", label: "Gold" },
  { key: "metal", label: "Metal" },
];

const getRandomTerrain = () =>
  TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];

document.documentElement.style.setProperty("--grid-size", GRID_SIZE);

let selectedCell = null;
let unitInstanceCounter = 0;
let isResolvingBattles = false;
let factions = [];
const unitRosters = new Map();

const UNIT_STAT_LABELS = [
  { key: "strength", label: "STR" },
  { key: "attack", label: "ATK" },
  { key: "defence", label: "DEF" },
  { key: "hp", label: "HP" },
  { key: "initiative", label: "INIT" },
];

const getResourceDefinition = (key) =>
  RESOURCE_TYPES.find((resource) => resource.key === key);

const randomIntInclusive = (min, max) => {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const rollResourcesForTerrain = (terrainName) => {
  const rules = TERRAIN_RESOURCE_RULES[terrainName] ?? {};
  return RESOURCE_TYPES.reduce((accumulator, { key }) => {
    const range = rules[key] ?? { min: 0, max: 0 };
    return {
      ...accumulator,
      [key]: randomIntInclusive(range.min ?? 0, range.max ?? 0),
    };
  }, {});
};

const TURN_PHASES = [
  {
    id: "start",
    label: "Start Phase",
    summary: "Ready units, regenerate health, and resolve any upkeep effects.",
  },
  {
    id: "main",
    label: "Main Phase",
    summary: "Deploy units, play cards, and issue strategic orders.",
  },
  {
    id: "end",
    label: "End Phase",
    summary: "Clean up and prepare combat resolution.",
  },
];

const PHASE_INDEX = TURN_PHASES.reduce((accumulator, phase, index) => {
  return { ...accumulator, [phase.id]: index };
}, {});

const START_PHASE_INDEX = PHASE_INDEX.start ?? 0;
const MAIN_PHASE_INDEX = PHASE_INDEX.main ?? 0;
const END_PHASE_INDEX = PHASE_INDEX.end ?? TURN_PHASES.length - 1;

const turnState = {
  turnNumber: 1,
  currentFactionIndex: 0,
  currentPhaseIndex: 0,
};

const boardUnits = new Map();

const INDEPENDENT_FACTION_ID = INDEPENDENT_FACTION.id;
const capitalAssignments = new Map();

const capitalSelectionState = {
  isActive: false,
  index: 0,
  error: "",
};

const isCapitalSelectionActive = () => capitalSelectionState.isActive;

const getCapitalZone = (index) => (index % 2 === 0 ? "north" : "south");

const getCapitalZoneLabel = (zone) =>
  zone === "north" ? "top third of the map" : "bottom third of the map";

const getZoneRowLimit = () => {
  const limit = Math.floor(GRID_SIZE / 3);
  return limit > 0 ? limit : 1;
};

const isRowInZone = (row, zone) => {
  const zoneDepth = getZoneRowLimit();

  if (zone === "north") {
    return row < zoneDepth;
  }

  const minimum = GRID_SIZE - zoneDepth;
  return row >= minimum;
};

const getCapitalSelectionRequirement = () => {
  if (!isCapitalSelectionActive()) {
    return null;
  }

  const faction = factions[capitalSelectionState.index];

  if (!faction) {
    return null;
  }

  return { faction, zone: getCapitalZone(capitalSelectionState.index) };
};

const setCapitalSelectionError = (message = "") => {
  capitalSelectionState.error = message;
  updatePhaseDisplay();
};

const updateCapitalHighlights = () => {
  if (!mapGrid) {
    return;
  }

  const cells = Array.from(mapGrid.querySelectorAll(".cell"));
  cells.forEach((cell) => {
    cell.classList.remove("cell--capital-eligible");
  });

  if (!isCapitalSelectionActive()) {
    return;
  }

  const requirement = getCapitalSelectionRequirement();
  if (!requirement?.zone) {
    return;
  }

  cells.forEach((cell) => {
    if (cell.dataset.capitalFaction) {
      return;
    }

    const coordinates = getCellCoordinates(cell);
    if (!coordinates) {
      return;
    }

    if (isRowInZone(coordinates.row, requirement.zone)) {
      cell.classList.add("cell--capital-eligible");
    }
  });
};

const markCapitalCell = (cell, faction) => {
  if (!cell || !faction) {
    return;
  }

  cell.classList.add("cell--capital");
  cell.dataset.capitalFaction = faction.id;
  cell.dataset.capitalName = faction.name ?? faction.id;

  let badge = cell.querySelector(".cell-capital-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cell-capital-badge";
    badge.textContent = "Capital";
    badge.setAttribute(
      "title",
      `${cell.dataset.capitalName ?? "Capital"} stronghold`,
    );

    const terrainLabel = cell.querySelector(".cell-terrain");
    if (terrainLabel) {
      terrainLabel.insertAdjacentElement("beforebegin", badge);
    } else {
      cell.prepend(badge);
    }
  }
};

const beginCapitalSelection = () => {
  if (factions.length === 0) {
    capitalSelectionState.isActive = false;
    capitalSelectionState.index = 0;
    capitalSelectionState.error = "";
    updateTurnDisplay();
    return;
  }

  capitalSelectionState.isActive = true;
  capitalSelectionState.index = 0;
  capitalSelectionState.error = "";
  capitalAssignments.clear();
  turnState.currentFactionIndex = 0;
  turnState.currentPhaseIndex = START_PHASE_INDEX;
  setCapitalSelectionError();
  updateTurnDisplay();
};

const renderPhaseList = () => {
  phaseListElement.innerHTML = "";

  TURN_PHASES.forEach((phase, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = phase.label;
    listItem.dataset.phaseIndex = index.toString();
    phaseListElement.appendChild(listItem);
  });
};

const updatePhaseDisplay = () => {
  if (isCapitalSelectionActive()) {
    if (phaseNameDisplay) {
      phaseNameDisplay.textContent = "Capital Placement";
    }

    const requirement = getCapitalSelectionRequirement();
    const summaryParts = [];

    if (requirement?.faction) {
      summaryParts.push(
        `${requirement.faction.name} must claim a capital in the ${getCapitalZoneLabel(
          requirement.zone,
        )}.`,
      );
    } else {
      summaryParts.push("Select capitals for each faction to begin the campaign.");
    }

    if (capitalSelectionState.error) {
      summaryParts.push(capitalSelectionState.error);
    }

    if (phaseSummaryDisplay) {
      phaseSummaryDisplay.textContent = summaryParts.join(" ");
    }

    if (capitalGuidance) {
      const guidanceParts = [];

      if (requirement?.faction) {
        guidanceParts.push(
          `Click any highlighted cell in the ${getCapitalZoneLabel(
            requirement.zone,
          )} to claim ${requirement.faction.name}'s capital.`,
        );
      } else {
        guidanceParts.push("Choose highlighted cells to designate each capital.");
      }

      if (capitalSelectionState.error) {
        guidanceParts.push(capitalSelectionState.error);
      }

      capitalGuidance.textContent = guidanceParts.join(" ");
      capitalGuidance.hidden = guidanceParts.length === 0;
    }

    Array.from(phaseListElement.children).forEach((item) => {
      item.classList.remove("is-active", "is-complete");
      item.removeAttribute("aria-current");
    });

    updateCapitalHighlights();
    return;
  }

  const activePhase = TURN_PHASES[turnState.currentPhaseIndex];
  phaseNameDisplay.textContent = activePhase.label;
  phaseSummaryDisplay.textContent = activePhase.summary;

  if (capitalGuidance) {
    capitalGuidance.textContent = "";
    capitalGuidance.hidden = true;
  }

  Array.from(phaseListElement.children).forEach((item, index) => {
    const isActive = index === turnState.currentPhaseIndex;
    const isComplete = index < turnState.currentPhaseIndex;
    item.classList.toggle("is-active", isActive);
    item.classList.toggle("is-complete", isComplete);

    if (isActive) {
      item.setAttribute("aria-current", "step");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  updateCapitalHighlights();
};

const updateFactionDisplay = () => {
  if (!currentFactionDisplay) {
    return;
  }

  const faction = factions[turnState.currentFactionIndex];

  if (!faction) {
    currentFactionDisplay.textContent = "Awaiting army selection";
    currentFactionDisplay.className = "faction-badge";
    currentFactionDisplay.removeAttribute("title");
    if (turnCounterDisplay) {
      turnCounterDisplay.textContent = "";
    }
    return;
  }

  currentFactionDisplay.textContent = faction.name;
  currentFactionDisplay.className = `faction-badge faction-${faction.id}`;
  currentFactionDisplay.setAttribute("title", faction.summary ?? "");
  if (turnCounterDisplay) {
    turnCounterDisplay.textContent = `Turn ${turnState.turnNumber}`;
  }
};

const isMainPhaseActive = () =>
  !isCapitalSelectionActive() && turnState.currentPhaseIndex === MAIN_PHASE_INDEX;

const updateAdvanceButton = () => {
  if (!advancePhaseButton) {
    return;
  }

  const hasFactions = factions.length > 0;
  const mainPhaseActive = isMainPhaseActive();
  const buttonLabel = hasFactions ? "End Turn" : "Select Armies";
  const buttonAriaLabel = hasFactions
    ? mainPhaseActive
      ? "End the current turn"
      : "Start and end phases resolve automatically"
    : "Select armies to begin the round";

  advancePhaseButton.textContent = buttonLabel;
  advancePhaseButton.setAttribute(
    "aria-label",
    buttonAriaLabel,
  );

  const shouldDisable =
    !hasFactions || isResolvingBattles || !mainPhaseActive || isCapitalSelectionActive();
  advancePhaseButton.disabled = shouldDisable;
};

const getActiveFaction = () => factions[turnState.currentFactionIndex] ?? null;

const createUnitStatsRow = (stats) => {
  const statsRow = document.createElement("span");
  statsRow.className = "unit-stats";

  UNIT_STAT_LABELS.forEach(({ key, label }) => {
    const statValue = stats?.[key];
    const stat = document.createElement("span");
    stat.className = "unit-stat";
    stat.textContent = `${label} ${
      typeof statValue === "number" ? statValue : "—"
    }`;
    statsRow.appendChild(stat);
  });

  return statsRow;
};

const createResourceBadge = (resourceKey, quantity, {
  badgeClass = "unit-cost__badge",
  elementTag = "span",
  formatText = ({ label, value }) => `${label}: ${value}`,
} = {}) => {
  const definition = getResourceDefinition(resourceKey);
  const badge = document.createElement(elementTag);
  badge.className = badgeClass;
  badge.dataset.resource = resourceKey;
  const label = definition?.label ?? resourceKey;
  badge.textContent = formatText({ label, value: quantity, key: resourceKey });
  return badge;
};

const createCostBadges = (cost) => {
  const costRow = document.createElement("span");
  costRow.className = "unit-cost";

  const entries = Object.entries(cost ?? {}).filter(
    ([, amount]) => typeof amount === "number" && amount > 0,
  );

  if (entries.length === 0) {
    const noCost = document.createElement("span");
    noCost.className = "unit-cost__badge";
    noCost.textContent = "No cost";
    costRow.appendChild(noCost);
    return costRow;
  }

  entries.forEach(([resourceKey, amount]) => {
    costRow.appendChild(
      createResourceBadge(resourceKey, amount, {
        badgeClass: "unit-cost__badge",
      }),
    );
  });

  return costRow;
};

const renderUnitModalOptions = () => {
  if (!unitModalList) {
    return null;
  }

  unitModalList.innerHTML = "";

  const activeFaction = getActiveFaction();

  if (unitModalFactionLabel) {
    unitModalFactionLabel.textContent = activeFaction
      ? `${activeFaction.name} roster`
      : "";
  }

  if (!activeFaction) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "unit-modal-empty";
    emptyMessage.textContent = "No faction is currently active.";
    unitModalList.appendChild(emptyMessage);
    return null;
  }

  const units = unitRosters.get(activeFaction.id) ?? [];

  if (units.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "unit-modal-empty";
    emptyMessage.textContent = "This faction has no units available.";
    unitModalList.appendChild(emptyMessage);
    return null;
  }

  let firstButton = null;

  units.forEach((unit) => {
    const listItem = document.createElement("li");
    listItem.className = "unit-modal-item";

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "unit-modal-option";
    selectButton.dataset.unitId = unit.id;

    const summaryRow = document.createElement("div");
    summaryRow.className = "unit-modal-summary";

    const name = document.createElement("span");
    name.className = "unit-name";
    name.textContent = unit.name;
    summaryRow.appendChild(name);

    if (unit.role) {
      const role = document.createElement("span");
      role.className = "unit-role";
      role.textContent = unit.role;
      summaryRow.appendChild(role);
    }

    const statsRow = createUnitStatsRow(unit.stats);
    const costRow = createCostBadges(unit.cost);
    const description = document.createElement("span");
    description.className = "unit-description";
    description.textContent = unit.description ?? "";

    selectButton.append(summaryRow, costRow, statsRow, description);
    selectButton.addEventListener("click", () => {
      handleAddUnitToSelectedCell(activeFaction.id, unit);
      closeUnitModal();
    });

    if (!firstButton) {
      firstButton = selectButton;
    }

    const expandButton = document.createElement("button");
    expandButton.type = "button";
    expandButton.className = "unit-modal-expand";
    const expandId = `${unit.id}-expand`;
    expandButton.id = expandId;
    expandButton.setAttribute("aria-expanded", "false");
    const detailsId = `${unit.id}-details`;
    expandButton.setAttribute("aria-controls", detailsId);
    expandButton.textContent = "Show details";
    expandButton.setAttribute(
      "aria-label",
      `Show details for ${unit.name}`,
    );

    const detailPanel = document.createElement("div");
    detailPanel.className = "unit-modal-details";
    detailPanel.id = detailsId;
    detailPanel.hidden = true;
    detailPanel.setAttribute("role", "region");
    detailPanel.setAttribute("aria-labelledby", expandId);

    if (unit.detail) {
      const detailText = document.createElement("p");
      detailText.className = "unit-detail-text";
      detailText.textContent = unit.detail;
      detailPanel.appendChild(detailText);
    }

    if (Array.isArray(unit.traits) && unit.traits.length > 0) {
      const traitHeading = document.createElement("p");
      traitHeading.className = "unit-trait-heading";
      traitHeading.textContent = "Traits";

      const traitList = document.createElement("ul");
      traitList.className = "unit-trait-list";

      unit.traits.forEach((trait) => {
        const traitItem = document.createElement("li");
        traitItem.textContent = trait;
        traitList.appendChild(traitItem);
      });

      detailPanel.append(traitHeading, traitList);
    }

    if (detailPanel.childElementCount > 0) {
      expandButton.addEventListener("click", () => {
        const isExpanded = expandButton.getAttribute("aria-expanded") === "true";
        const nextState = !isExpanded;
        expandButton.setAttribute("aria-expanded", String(nextState));
        expandButton.textContent = nextState ? "Hide details" : "Show details";
        expandButton.setAttribute(
          "aria-label",
          `${nextState ? "Hide" : "Show"} details for ${unit.name}`,
        );
        detailPanel.hidden = !nextState;
        listItem.classList.toggle("is-expanded", nextState);
      });

      listItem.append(selectButton, expandButton, detailPanel);
    } else {
      expandButton.hidden = true;
      expandButton.setAttribute("aria-hidden", "true");
      listItem.append(selectButton);
    }

  unitModalList.appendChild(listItem);
  });

  return firstButton;
};

let hasInitialisedArmySelector = false;

const resetBoardState = () => {
  boardUnits.clear();

  if (!mapGrid) {
    return;
  }

  mapGrid.querySelectorAll(".cell-unit-stack").forEach((stack) => {
    stack.textContent = "";
    delete stack.dataset.count;
  });

  mapGrid.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("cell--capital");
    cell.classList.remove("cell--capital-eligible");
    delete cell.dataset.capitalFaction;
    delete cell.dataset.capitalName;
    const badge = cell.querySelector(".cell-capital-badge");
    if (badge) {
      badge.remove();
    }
  });

  capitalAssignments.clear();
};

const updateArmySummaryText = (summaryElement, armyId) => {
  if (!summaryElement) {
    return;
  }

  const army = getArmyById(armyId);

  if (army) {
    summaryElement.textContent = army.faction.summary ?? "";
    summaryElement.classList.remove("is-empty");
  } else {
    summaryElement.textContent = "";
    summaryElement.classList.add("is-empty");
  }
};

const updateArmySelectorState = ({ forceShowMissing = false } = {}) => {
  const firstId = firstArmySelect?.value ?? "";
  const secondId = secondArmySelect?.value ?? "";

  updateArmySummaryText(firstArmySummary, firstId);
  updateArmySummaryText(secondArmySummary, secondId);

  let errorMessage = "";
  const hasFirstSelection = Boolean(firstId);
  const hasSecondSelection = Boolean(secondId);
  const selectionsReady = hasFirstSelection && hasSecondSelection;
  const hasDuplicateSelection = selectionsReady && firstId === secondId;

  if (!selectionsReady) {
    if (forceShowMissing) {
      errorMessage = "Select an army for each side.";
    }
  } else if (hasDuplicateSelection) {
    errorMessage = "Choose two different armies.";
  }

  if (armySelectorError) {
    armySelectorError.textContent = errorMessage;
    armySelectorError.hidden = errorMessage.length === 0;
  }

  if (armySelectorStartButton) {
    const shouldDisable = !selectionsReady || hasDuplicateSelection;
    armySelectorStartButton.disabled = shouldDisable;
  }
};

const populateArmySelectorOptions = () => {
  if (hasInitialisedArmySelector) {
    return;
  }

  const populateSelect = (selectElement) => {
    if (!selectElement) {
      return;
    }

    selectElement.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select an army";
    placeholder.disabled = true;
    placeholder.selected = true;
    selectElement.appendChild(placeholder);

    ARMIES.forEach((army) => {
      const option = document.createElement("option");
      option.value = army.faction.id;
      option.textContent = army.faction.name;
      selectElement.appendChild(option);
    });
  };

  populateSelect(firstArmySelect);
  populateSelect(secondArmySelect);

  hasInitialisedArmySelector = true;
};

const openArmySelector = ({ focusSelect = false } = {}) => {
  if (!armySelectorModal) {
    return;
  }

  populateArmySelectorOptions();
  updateArmySelectorState();

  armySelectorModal.hidden = false;
  armySelectorModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();

  if (focusSelect && firstArmySelect) {
    firstArmySelect.focus({ preventScroll: true });
  }
};

const closeArmySelector = () => {
  if (!armySelectorModal) {
    return;
  }

  armySelectorModal.hidden = true;
  armySelectorModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();

  if (advancePhaseButton && document.contains(advancePhaseButton)) {
    advancePhaseButton.focus({ preventScroll: true });
  }
};

const applyArmySelection = (armyIds) => {
  const selectedArmies = armyIds
    .map((id) => getArmyById(id))
    .filter((army) => Boolean(army));

  factions = selectedArmies.map((army) => army.faction);
  unitRosters.clear();

  selectedArmies.forEach((army) => {
    unitRosters.set(army.faction.id, Array.isArray(army.roster) ? army.roster : []);
  });

  turnState.turnNumber = 1;
  turnState.currentFactionIndex = 0;
  turnState.currentPhaseIndex = 0;
  unitInstanceCounter = 0;
  resetBoardState();
  closeUnitModal();

  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell.setAttribute("aria-selected", "false");
  }

  selectedCell = null;
  renderSelectedCellDetails(null);
  beginCapitalSelection();
};

const updateTurnDisplay = () => {
  updateFactionDisplay();
  updatePhaseDisplay();
  updateAdvanceButton();
  renderSelectedCellDetails(selectedCell);
};

const applyStartPhaseRegeneration = () => {
  const faction = getActiveFaction();
  if (!faction) {
    return;
  }

  const templatesById = new Map();
  const roster = unitRosters.get(faction.id);
  if (Array.isArray(roster)) {
    roster.forEach((template) => {
      templatesById.set(template.id, template);
    });
  }

  boardUnits.forEach((units) => {
    units.forEach((unit) => {
      if (unit.factionId !== faction.id) {
        return;
      }

      const template = templatesById.get(unit.templateId);
      const templateMaxHp = template?.stats?.hp;
      if (typeof unit.maxHp !== "number" && typeof templateMaxHp === "number") {
        unit.maxHp = templateMaxHp;
      }

      const maxHp =
        typeof unit.maxHp === "number"
          ? unit.maxHp
          : typeof templateMaxHp === "number"
            ? templateMaxHp
            : null;
      const currentHp = unit.stats?.hp;

      if (
        typeof maxHp !== "number" ||
        maxHp <= 0 ||
        typeof currentHp !== "number" ||
        currentHp <= 0 ||
        currentHp >= maxHp
      ) {
        if (typeof maxHp === "number" && typeof unit.maxHp !== "number") {
          unit.maxHp = maxHp;
        }
        return;
      }

      const healAmount = Math.ceil(maxHp * 0.2);
      unit.stats.hp = Math.min(maxHp, currentHp + healAmount);
      unit.maxHp = maxHp;
    });
  });
};

const runStartPhase = () => {
  if (factions.length === 0) {
    updateTurnDisplay();
    return;
  }

  turnState.currentPhaseIndex = START_PHASE_INDEX;
  applyStartPhaseRegeneration();
  updateTurnDisplay();

  turnState.currentPhaseIndex = MAIN_PHASE_INDEX;
  updateTurnDisplay();
};

const advancePhase = async () => {
  if (isResolvingBattles) {
    return;
  }

  if (isCapitalSelectionActive()) {
    return;
  }

  if (factions.length === 0) {
    openArmySelector({ focusSelect: true });
    return;
  }

  if (!isMainPhaseActive()) {
    return;
  }

  isResolvingBattles = true;
  updateAdvanceButton();

  turnState.currentPhaseIndex = END_PHASE_INDEX;
  updateTurnDisplay();

  if (advancePhaseButton) {
    advancePhaseButton.disabled = true;
  }

  if (phaseNameDisplay) {
    phaseNameDisplay.textContent = "Combat Resolution";
  }

  if (phaseSummaryDisplay) {
    phaseSummaryDisplay.textContent =
      "Resolving contested cells before the next turn.";
  }

  try {
    await resolveEndOfTurnBattles();
  } finally {
    isResolvingBattles = false;
    if (advancePhaseButton) {
      advancePhaseButton.disabled = false;
    }
  }

  turnState.currentPhaseIndex = START_PHASE_INDEX;
  turnState.currentFactionIndex =
    (turnState.currentFactionIndex + 1) % factions.length;
  turnState.turnNumber += 1;

  runStartPhase();
};

const formatCoordinates = (row, col) => `Row ${row + 1}, Column ${col + 1}`;

const getFactionById = (id) => {
  if (id === INDEPENDENT_FACTION_ID) {
    return INDEPENDENT_FACTION;
  }

  return factions.find((faction) => faction.id === id);
};

const getCellKey = (row, col) => `${row}-${col}`;

const getCellCoordinates = (cell) => {
  if (!cell) {
    return null;
  }

  const row = Number.parseInt(cell.dataset.row ?? "", 10);
  const col = Number.parseInt(cell.dataset.col ?? "", 10);

  if (Number.isNaN(row) || Number.isNaN(col)) {
    return null;
  }

  return { row, col };
};

const getUnitsForCell = (row, col) => {
  const key = getCellKey(row, col);
  return boardUnits.get(key) ?? [];
};

const setUnitsForCell = (row, col, units) => {
  const key = getCellKey(row, col);
  if (units.length > 0) {
    boardUnits.set(key, units);
  } else {
    boardUnits.delete(key);
  }
};

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

let helpReturnFocusElement = null;
let battleReturnFocusElement = null;
let unitModalReturnFocusElement = null;

const isModalVisible = (modalElement) =>
  Boolean(modalElement) &&
  modalElement.getAttribute("aria-hidden") === "false";

const syncBodyModalState = () => {
  if (
    isModalVisible(helpModal) ||
    isModalVisible(battleModal) ||
    isModalVisible(unitModal) ||
    isModalVisible(armySelectorModal)
  ) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.remove("modal-open");
  }
};

const setActiveHelpTab = (tabId, { focusTab = false } = {}) => {
  if (helpTabButtons.length === 0 || helpPanels.length === 0) {
    return;
  }

  const fallbackTab = helpTabButtons[0];
  const targetTab =
    helpTabButtons.find((button) => button.dataset.helpTab === tabId) ??
    fallbackTab;

  helpTabButtons.forEach((button) => {
    const isActive = button === targetTab;
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  helpPanels.forEach((panel) => {
    const isActive =
      targetTab && panel.dataset.helpPanel === targetTab.dataset.helpTab;
    panel.hidden = !isActive;
    panel.classList.toggle("is-hidden", !isActive);
  });

  if (focusTab && targetTab) {
    targetTab.focus();
  }
};

const openHelpModal = () => {
  if (!helpModal) {
    return;
  }

  helpReturnFocusElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  helpModal.hidden = false;
  helpModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();
  setActiveHelpTab("combat", { focusTab: true });
};

const closeHelpModal = () => {
  if (!helpModal) {
    return;
  }

  helpModal.hidden = true;
  helpModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();

  if (
    helpReturnFocusElement instanceof HTMLElement &&
    document.contains(helpReturnFocusElement)
  ) {
    helpReturnFocusElement.focus({ preventScroll: true });
  }

  helpReturnFocusElement = null;
};

const openUnitModal = () => {
  if (!unitModal || !selectedCell || addUnitButton.disabled) {
    return;
  }

  unitModalReturnFocusElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const firstButton = renderUnitModalOptions();

  unitModal.hidden = false;
  unitModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();

  if (firstButton) {
    firstButton.focus({ preventScroll: true });
  } else if (unitModalCloseButton) {
    unitModalCloseButton.focus({ preventScroll: true });
  }
};

const closeUnitModal = () => {
  if (!unitModal) {
    return;
  }

  unitModal.hidden = true;
  unitModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();

  if (
    unitModalReturnFocusElement instanceof HTMLElement &&
    document.contains(unitModalReturnFocusElement)
  ) {
    unitModalReturnFocusElement.focus({ preventScroll: true });
  }

  unitModalReturnFocusElement = null;
};

const focusAdjacentHelpTab = (currentIndex, offset) => {
  if (helpTabButtons.length === 0) {
    return;
  }

  const total = helpTabButtons.length;
  const nextIndex = (currentIndex + offset + total) % total;
  const nextTab = helpTabButtons[nextIndex];

  if (nextTab) {
    setActiveHelpTab(nextTab.dataset.helpTab);
    nextTab.focus();
  }
};

const getBattleSpeedMultiplier = () => {
  if (!battleSpeedControl) {
    return 1;
  }

  const value = Number.parseFloat(battleSpeedControl.value);
  return Number.isFinite(value) && value > 0 ? value : 1;
};

const getBattleDelay = (base = 800) =>
  Math.max(120, base / getBattleSpeedMultiplier());

const formatSpeedMultiplier = (value) => {
  if (!Number.isFinite(value)) {
    return "1";
  }

  if (Math.abs(value - Math.round(value)) < 0.001) {
    return Math.round(value).toString();
  }

  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
};

const updateBattleSpeedDisplay = () => {
  if (!battleSpeedValue) {
    return;
  }

  const multiplier = getBattleSpeedMultiplier();
  battleSpeedValue.textContent = `${formatSpeedMultiplier(multiplier)}x`;
};

const appendBattleLog = (message) => {
  if (!battleLogEntries) {
    return;
  }

  const entry = document.createElement("li");
  entry.textContent = message;
  battleLogEntries.appendChild(entry);

  const maxEntries = 60;
  while (battleLogEntries.children.length > maxEntries) {
    battleLogEntries.removeChild(battleLogEntries.firstChild);
  }

  battleLogEntries.scrollTop = battleLogEntries.scrollHeight;
};

const getCellElementAt = (row, col) => {
  if (!mapGrid) {
    return null;
  }

  return mapGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
};

const getCellTerrainInfo = (row, col) => {
  const cell = getCellElementAt(row, col);
  if (!cell) {
    return null;
  }

  const name = cell.dataset?.terrain ?? null;
  if (!name) {
    return null;
  }

  const label = cell.dataset?.terrainLabel ?? name;
  return { name, label };
};

const TERRAIN_MODIFIABLE_STATS = new Set([
  "attack",
  "defence",
  "strength",
  "initiative",
]);

const TERRAIN_STAT_LABELS = {
  attack: "ATK",
  defence: "DEF",
  strength: "STR",
  initiative: "INIT",
};

const formatTerrainModifierSummary = (unit, modifiers, terrainLabel) => {
  const entries = Object.entries(modifiers).filter(([, value]) =>
    Number.isFinite(value),
  );

  if (entries.length === 0) {
    return "";
  }

  const parts = entries.map(([key, value]) => ({
    key,
    value,
    label: TERRAIN_STAT_LABELS[key] ?? key.toUpperCase(),
  }));

  const positives = parts.filter(({ value }) => value > 0);
  const negatives = parts.filter(({ value }) => value < 0);

  const formatPart = ({ label, value }) =>
    `${value > 0 ? "+" : ""}${value} ${label}`;

  const locationText = terrainLabel ? ` on the ${terrainLabel}` : "";

  let message;

  if (positives.length > 0 && negatives.length > 0) {
    message = `${unit.name} gains ${positives
      .map(formatPart)
      .join(", ")} but suffers ${negatives.map(formatPart).join(", ")}`;
  } else if (positives.length > 0) {
    message = `${unit.name} gains ${positives.map(formatPart).join(", ")}`;
  } else {
    message = `${unit.name} suffers ${negatives.map(formatPart).join(", ")}`;
  }

  return `${message}${locationText}.`;
};

const applyTerrainModifiersToUnits = (units, terrainInfo) => {
  const terrainName = terrainInfo?.name;
  const terrainLabel = terrainInfo?.label;

  if (!terrainName) {
    return { revert: () => {}, summaries: [] };
  }

  const adjustments = [];
  const summaries = [];

  units.forEach((unit) => {
    if (!unit || typeof unit !== "object") {
      return;
    }

    const modifiers = unit.terrainModifiers?.[terrainName];
    if (!modifiers) {
      return;
    }

    const applicableEntries = Object.entries(modifiers).filter(
      ([stat, delta]) =>
        TERRAIN_MODIFIABLE_STATS.has(stat) && Number.isFinite(delta),
    );

    if (applicableEntries.length === 0) {
      return;
    }

    const original = {};
    const appliedModifiers = {};

    applicableEntries.forEach(([stat, delta]) => {
      if (!Number.isFinite(unit.stats?.[stat])) {
        return;
      }

      if (!Object.prototype.hasOwnProperty.call(original, stat)) {
        original[stat] = unit.stats[stat];
      }

      unit.stats[stat] = Math.max(0, unit.stats[stat] + delta);
      appliedModifiers[stat] = delta;
    });

    const originalKeys = Object.keys(original);
    if (originalKeys.length === 0) {
      return;
    }

    adjustments.push({ unit, original });

    const summary = formatTerrainModifierSummary(unit, appliedModifiers, terrainLabel);
    if (summary) {
      summaries.push(summary.trim());
    }
  });

  return {
    revert: () => {
      adjustments.forEach(({ unit, original }) => {
        Object.entries(original).forEach(([stat, value]) => {
          unit.stats[stat] = value;
        });
      });
    },
    summaries,
  };
};

const openBattleModal = ({
  row,
  col,
  topFactionName,
  bottomFactionName,
  terrainLabel,
}) => {
  if (!battleModal) {
    return;
  }

  battleReturnFocusElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  battleModal.hidden = false;
  battleModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();

  if (battleTopList) {
    battleTopList.innerHTML = "";
  }

  if (battleBottomList) {
    battleBottomList.innerHTML = "";
  }

  if (battleLogEntries) {
    battleLogEntries.innerHTML = "";
  }

  if (battleTopLabel) {
    battleTopLabel.textContent = topFactionName;
  }

  if (battleBottomLabel) {
    battleBottomLabel.textContent = bottomFactionName;
  }

  if (battleLocationDisplay) {
    const locationText = terrainLabel
      ? `${formatCoordinates(row, col)} — ${terrainLabel}`
      : `${formatCoordinates(row, col)}`;
    battleLocationDisplay.textContent = locationText;
  }

  if (battleCloseButton) {
    battleCloseButton.disabled = true;
    battleCloseButton.textContent = "Continue";
  }
};

const closeBattleModal = () => {
  if (!battleModal) {
    return;
  }

  battleModal.hidden = true;
  battleModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();

  if (battleReturnFocusElement) {
    battleReturnFocusElement.focus({ preventScroll: true });
  }

  battleReturnFocusElement = null;
};

const waitForBattleContinue = () =>
  new Promise((resolve) => {
    if (!battleCloseButton) {
      resolve();
      return;
    }

    const handler = () => {
      battleCloseButton.removeEventListener("click", handler);
      resolve();
    };

    battleCloseButton.addEventListener("click", handler);
  });

const createBattleUnitCard = (unit) => {
  const card = document.createElement("li");
  card.className = "battle-unit";
  card.dataset.instanceId = unit.instanceId;

  const name = document.createElement("span");
  name.className = "battle-unit-name";
  name.textContent = unit.name;

  const hp = document.createElement("span");
  hp.className = "battle-unit-health";
  hp.textContent = `HP ${Math.max(0, unit.stats.hp)}`;

  const initiative = document.createElement("span");
  initiative.textContent = `Init ${unit.stats.initiative}`;

  const meta = document.createElement("span");
  meta.className = "battle-unit-meta";
  meta.append(hp, initiative);

  const combatMeta = document.createElement("span");
  combatMeta.className = "battle-unit-meta";
  combatMeta.textContent = `ATK ${unit.stats.attack} • DEF ${unit.stats.defence}`;

  card.append(name, meta, combatMeta);

  if (unit.stats.hp <= 0) {
    card.classList.add("is-defeated");
  }

  return { element: card, hpElement: hp };
};

const hasLivingUnits = (units) => units.some((unit) => unit.stats.hp > 0);

const calculateDamage = (attacker, defender) => {
  const attackScore =
    attacker.stats.attack + Math.floor(attacker.stats.strength / 2);
  const defenceScore = defender.stats.defence;
  const variance = Math.floor(
    Math.random() * Math.max(1, Math.ceil(attacker.stats.strength / 3)),
  );
  const rawDamage = attackScore + variance - Math.floor(defenceScore / 2);
  return Math.max(1, rawDamage);
};

const getContestedCells = () => {
  const contested = [];

  boardUnits.forEach((units, key) => {
    const uniqueFactions = new Set(units.map((unit) => unit.factionId));
    if (uniqueFactions.size < 2) {
      return;
    }

    const [row, col] = key.split("-").map(Number);
    contested.push({ row, col, units });
  });

  contested.sort((a, b) => {
    if (a.row === b.row) {
      return a.col - b.col;
    }
    return a.row - b.row;
  });

  return contested;
};

const runBattleForCell = async ({ row, col, units }) => {
  const uniqueFactionIds = Array.from(
    new Set(units.map((unit) => unit.factionId)),
  );

  if (uniqueFactionIds.length < 2) {
    return;
  }

  const [topFactionId, ...otherFactionIds] = uniqueFactionIds;
  const bottomFactionIds = otherFactionIds.length
    ? otherFactionIds
    : uniqueFactionIds.slice(1);

  const topFaction = getFactionById(topFactionId);
  const bottomFactionNames = bottomFactionIds.map(
    (id) => getFactionById(id)?.name ?? id,
  );

  const topFactionName = topFaction?.name ?? topFactionId;
  const bottomFactionName = bottomFactionNames.length
    ? bottomFactionNames.join(" / ")
    : "Opposing Forces";

  const topUnits = units.filter((unit) => unit.factionId === topFactionId);
  const bottomUnits = units.filter((unit) =>
    bottomFactionIds.includes(unit.factionId),
  );

  const terrainInfo = getCellTerrainInfo(row, col);
  const terrainLabel = terrainInfo?.label ?? null;

  openBattleModal({
    row,
    col,
    topFactionName,
    bottomFactionName,
    terrainLabel,
  });

  const { revert: revertTerrainModifiers, summaries: terrainSummaries } =
    applyTerrainModifiersToUnits(units, terrainInfo);

  const unitElements = new Map();

  topUnits.forEach((unit) => {
    const record = createBattleUnitCard(unit);
    unitElements.set(unit.instanceId, record);
    if (battleTopList) {
      battleTopList.appendChild(record.element);
    }
  });

  bottomUnits.forEach((unit) => {
    const record = createBattleUnitCard(unit);
    unitElements.set(unit.instanceId, record);
    if (battleBottomList) {
      battleBottomList.appendChild(record.element);
    }
  });

  appendBattleLog(`${topFactionName} engage ${bottomFactionName}.`);
  if (terrainLabel) {
    appendBattleLog(`The clash erupts on the ${terrainLabel}.`);
  }
  terrainSummaries.forEach((summary) => {
    appendBattleLog(summary);
  });

  const allUnits = () => [...topUnits, ...bottomUnits];
  const livingTop = () => topUnits.filter((unit) => unit.stats.hp > 0);
  const livingBottom = () => bottomUnits.filter((unit) => unit.stats.hp > 0);

  const toggleActingState = (actingUnits, isActing) => {
    actingUnits.forEach((unit) => {
      const record = unitElements.get(unit.instanceId);
      if (record) {
        record.element.classList.toggle("is-acting", isActing);
      }
    });
  };

  const updateUnitHpDisplay = (unit) => {
    const record = unitElements.get(unit.instanceId);
    if (!record) {
      return;
    }

    record.hpElement.textContent = `HP ${Math.max(0, unit.stats.hp)}`;
    if (unit.stats.hp <= 0) {
      record.element.classList.add("is-defeated");
    }
  };

  let round = 0;

  while (round < 25 && hasLivingUnits(topUnits) && hasLivingUnits(bottomUnits)) {
    round += 1;
    appendBattleLog(`— Round ${round} —`);

    const initiativeSteps = Array.from(
      new Set(
        allUnits()
          .filter((unit) => unit.stats.hp > 0)
          .map((unit) => unit.stats.initiative),
      ),
    ).sort((a, b) => b - a);

    for (const initiative of initiativeSteps) {
      const actingUnits = allUnits().filter(
        (unit) => unit.stats.hp > 0 && unit.stats.initiative === initiative,
      );

      if (actingUnits.length === 0) {
        continue;
      }

      appendBattleLog(`Initiative ${initiative} phase.`);
      toggleActingState(actingUnits, true);
      await wait(getBattleDelay(400));

      const pendingDamage = new Map();
      const attackSummaries = [];

      actingUnits.forEach((attacker) => {
        const enemies =
          attacker.factionId === topFactionId ? livingBottom() : livingTop();

        if (enemies.length === 0) {
          return;
        }

        const target = enemies[Math.floor(Math.random() * enemies.length)];
        const damage = calculateDamage(attacker, target);
        pendingDamage.set(target, (pendingDamage.get(target) ?? 0) + damage);
        attackSummaries.push({ attacker, target, damage });
      });

      attackSummaries.forEach(({ attacker, target, damage }) => {
        appendBattleLog(
          `${attacker.name} strikes ${target.name} for ${damage} damage.`,
        );
      });

      if (attackSummaries.length > 0) {
        await wait(getBattleDelay(500));
      }

      pendingDamage.forEach((damage, target) => {
        target.stats.hp = Math.max(0, target.stats.hp - damage);
        updateUnitHpDisplay(target);
        if (target.stats.hp <= 0) {
          appendBattleLog(`${target.name} has been defeated.`);
        }
      });

      toggleActingState(actingUnits, false);

      if (!hasLivingUnits(topUnits) || !hasLivingUnits(bottomUnits)) {
        break;
      }

      await wait(getBattleDelay(250));
    }
  }

  const topAlive = hasLivingUnits(topUnits);
  const bottomAlive = hasLivingUnits(bottomUnits);

  let outcomeMessage = "The battle ends.";

  if (topAlive && !bottomAlive) {
    outcomeMessage = `${topFactionName} are victorious.`;
  } else if (!topAlive && bottomAlive) {
    outcomeMessage = `${bottomFactionName} prevail.`;
  } else if (!topAlive && !bottomAlive) {
    outcomeMessage = `Both forces are destroyed in the fighting.`;
  } else {
    outcomeMessage = `After ${round} rounds the battle ends in a stalemate.`;
  }

  appendBattleLog(outcomeMessage);

  revertTerrainModifiers();

  const survivors = units.filter((unit) => unit.stats.hp > 0);
  setUnitsForCell(row, col, survivors);

  const cellElement = mapGrid.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  if (cellElement) {
    updateCellUnitStack(cellElement, survivors);
  }

  if (
    selectedCell &&
    Number(selectedCell.dataset.row) === row &&
    Number(selectedCell.dataset.col) === col
  ) {
    renderSelectedCellDetails(selectedCell);
  }

  if (battleCloseButton) {
    battleCloseButton.disabled = false;
    battleCloseButton.focus({ preventScroll: true });
  }

  await waitForBattleContinue();
  closeBattleModal();
};

const resolveEndOfTurnBattles = async () => {
  const contestedCells = getContestedCells();

  for (const contested of contestedCells) {
    // eslint-disable-next-line no-await-in-loop
    await runBattleForCell(contested);
  }
};

const createUnitInstance = (factionId, template) => ({
  instanceId: `${template.id}-${++unitInstanceCounter}`,
  templateId: template.id,
  name: template.name,
  factionId,
  description: template.description,
  role: template.role,
  detail: template.detail,
  traits: Array.isArray(template.traits) ? [...template.traits] : [],
  terrainModifiers: template.terrainModifiers
    ? Object.fromEntries(
        Object.entries(template.terrainModifiers).map(([terrain, modifiers]) => [
          terrain,
          { ...modifiers },
        ]),
      )
    : {},
  maxHp: typeof template.stats?.hp === "number" ? template.stats.hp : null,
  stats: { ...template.stats },
  cost: { ...template.cost },
});

const updateCellUnitStack = (cell, units) => {
  if (!cell) return;
  const stack = cell.querySelector(".cell-unit-stack");
  if (stack) {
    const count = units.length;
    if (count > 0) {
      stack.textContent = count.toString();
      stack.dataset.count = count.toString();
    } else {
      stack.textContent = "";
      delete stack.dataset.count;
    }
  }
};

const populateIndependentCells = () => {
  if (!mapGrid) {
    return;
  }

  const cells = Array.from(mapGrid.querySelectorAll(".cell"));
  cells.forEach((cell) => {
    if (cell.dataset.capitalFaction) {
      return;
    }

    const coordinates = getCellCoordinates(cell);
    if (!coordinates) {
      return;
    }

    const { row, col } = coordinates;
    const unitCount = randomIntInclusive(1, 2);
    const units = Array.from({ length: unitCount }, () =>
      createUnitInstance(INDEPENDENT_FACTION_ID, getRandomIndependentUnit()),
    );

    setUnitsForCell(row, col, units);
    updateCellUnitStack(cell, units);
  });
};

const completeCapitalSelection = () => {
  capitalSelectionState.isActive = false;
  capitalSelectionState.index = 0;
  capitalSelectionState.error = "";
  updatePhaseDisplay();
  populateIndependentCells();
  renderSelectedCellDetails(selectedCell);
  turnState.currentFactionIndex = 0;
  runStartPhase();
};

const getResourcesForCellElement = (cell) => {
  if (!cell) {
    return {};
  }

  return RESOURCE_TYPES.reduce((accumulator, { key }) => {
    const value = Number.parseInt(cell.dataset?.[key] ?? "0", 10);
    if (!Number.isNaN(value) && value > 0) {
      return { ...accumulator, [key]: value };
    }
    return accumulator;
  }, {});
};

const renderCellResourceList = (cell) => {
  if (!cellResourceList) {
    return;
  }

  cellResourceList.innerHTML = "";
  if (!cell) {
    const prompt = document.createElement("li");
    prompt.className = "resource-item";
    prompt.textContent = "Select a cell to view resources.";
    cellResourceList.appendChild(prompt);
    return;
  }

  const resources = getResourcesForCellElement(cell);
  const entries = Object.entries(resources);

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "resource-item";
    empty.textContent = "No resources";
    cellResourceList.appendChild(empty);
    return;
  }

  entries.forEach(([key, amount]) => {
    cellResourceList.appendChild(
      createResourceBadge(key, amount, {
        badgeClass: "resource-item",
        elementTag: "li",
        formatText: ({ label, value }) => `${value} ${label}`,
      }),
    );
  });
};

const renderCellUnitList = (row, col) => {
  cellUnitList.innerHTML = "";
  const units = getUnitsForCell(row, col);

  if (units.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "unit-empty";
    emptyItem.textContent = "No units assigned.";
    cellUnitList.appendChild(emptyItem);
    return;
  }

  const grouped = units.reduce((accumulator, unit) => {
    const key = `${unit.templateId}-${unit.factionId}`;
    const existing = accumulator.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      accumulator.set(key, { unit, count: 1 });
    }
    return accumulator;
  }, new Map());

  grouped.forEach(({ unit, count }) => {
    const faction = getFactionById(unit.factionId);
    const listItem = document.createElement("li");
    listItem.className = "unit-card";

    const header = document.createElement("div");
    header.className = "unit-card__header";

    const nameLabel = document.createElement("span");
    nameLabel.className = "unit-name";
    nameLabel.textContent = unit.name;

    const quantityBadge = document.createElement("span");
    quantityBadge.className = "unit-quantity";
    quantityBadge.textContent = `×${count}`;

    header.append(nameLabel, quantityBadge);
    listItem.appendChild(header);

    if (unit.role) {
      const roleLabel = document.createElement("span");
      roleLabel.className = "unit-role";
      roleLabel.textContent = unit.role;
      listItem.appendChild(roleLabel);
    }

    const factionLabel = document.createElement("span");
    factionLabel.className = "unit-meta";
    factionLabel.textContent = faction ? faction.name : unit.factionId;
    listItem.appendChild(factionLabel);

    const statsRow = createUnitStatsRow(unit.stats);
    listItem.appendChild(statsRow);

    if (unit.cost) {
      listItem.appendChild(createCostBadges(unit.cost));
    }

    if (unit.description) {
      const description = document.createElement("span");
      description.className = "unit-description";
      description.textContent = unit.description;
      listItem.appendChild(description);
    }

    cellUnitList.appendChild(listItem);
  });
};

const renderSelectedCellDetails = (cell) => {
  if (!cell) {
    selectedCellDisplay.textContent = "None";
    renderCellResourceList(null);
    cellUnitList.innerHTML = "";
    const promptItem = document.createElement("li");
    promptItem.className = "unit-empty";
    promptItem.textContent = "Select a cell to view or add units.";
    cellUnitList.appendChild(promptItem);
    addUnitButton.disabled = true;
    closeUnitModal();
    return;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    selectedCellDisplay.textContent = "None";
    renderCellResourceList(null);
    addUnitButton.disabled = true;
    closeUnitModal();
    return;
  }

  const { row, col } = coordinates;
  const terrain = cell.dataset.terrainLabel || "Unknown terrain";
  let selectedText = `${terrain} — ${formatCoordinates(row, col)}`;
  const capitalOwnerId = cell.dataset.capitalFaction;
  if (capitalOwnerId) {
    const capitalOwner = getFactionById(capitalOwnerId);
    const capitalName = capitalOwner?.name ?? cell.dataset.capitalName ?? capitalOwnerId;
    selectedText += ` — Capital of ${capitalName}`;
  }
  selectedCellDisplay.textContent = selectedText;
  const hasActiveFaction = Boolean(getActiveFaction());
  const canInteract = hasActiveFaction && isMainPhaseActive();
  addUnitButton.disabled = !canInteract;
  if (!canInteract) {
    closeUnitModal();
  }
  const units = getUnitsForCell(row, col);
  renderCellResourceList(cell);
  updateCellUnitStack(cell, units);
  renderCellUnitList(row, col);
};

const handleAddUnitToSelectedCell = (factionId, template) => {
  if (!selectedCell) {
    return;
  }

  const activeFaction = getActiveFaction();
  if (!activeFaction || factionId !== activeFaction.id) {
    return;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    return;
  }

  const { row, col } = coordinates;
  const existingUnits = [...getUnitsForCell(row, col)];
  const unitInstance = createUnitInstance(factionId, template);
  existingUnits.push(unitInstance);
  setUnitsForCell(row, col, existingUnits);
  renderSelectedCellDetails(selectedCell);
};

const attemptCapitalSelection = (cell) => {
  if (!isCapitalSelectionActive()) {
    return;
  }

  const requirement = getCapitalSelectionRequirement();
  if (!requirement?.faction) {
    return;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    return;
  }

  const { faction, zone } = requirement;

  if (cell.dataset.capitalFaction) {
    setCapitalSelectionError("This location already houses a capital.");
    return;
  }

  if (!isRowInZone(coordinates.row, zone)) {
    setCapitalSelectionError(
      `Choose a territory in the ${getCapitalZoneLabel(zone)}.`,
    );
    return;
  }

  setCapitalSelectionError();
  capitalAssignments.set(faction.id, coordinates);
  markCapitalCell(cell, faction);

  capitalSelectionState.index += 1;

  if (capitalSelectionState.index < factions.length) {
    turnState.currentFactionIndex = capitalSelectionState.index;
    updateTurnDisplay();
    return;
  }

  completeCapitalSelection();
};

const handleSelect = (cell) => {
  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell.setAttribute("aria-selected", "false");
  }

  selectedCell = cell;
  selectedCell.classList.add("selected");
  selectedCell.setAttribute("aria-selected", "true");
  selectedCell.focus({ preventScroll: true });

  renderSelectedCellDetails(cell);
  attemptCapitalSelection(cell);
};

const createCell = (row, col) => {
  const cell = document.createElement("button");
  const terrain = getRandomTerrain();
  cell.className = `cell ${terrain.className}`;
  cell.type = "button";
  cell.dataset.row = row.toString();
  cell.dataset.col = col.toString();
  cell.dataset.terrain = terrain.name;
  cell.dataset.terrainLabel = terrain.label;

  const resources = rollResourcesForTerrain(terrain.name);
  RESOURCE_TYPES.forEach(({ key }) => {
    const amount = resources[key] ?? 0;
    if (amount > 0) {
      cell.dataset[key] = amount.toString();
    }
  });

  cell.setAttribute("role", "gridcell");
  cell.setAttribute(
    "aria-label",
    `${terrain.label} — ${formatCoordinates(row, col)}`,
  );
  cell.setAttribute("aria-selected", "false");

  const terrainLabel = document.createElement("span");
  terrainLabel.className = "cell-terrain";
  terrainLabel.textContent = terrain.label;

  const unitStack = document.createElement("span");
  unitStack.className = "cell-unit-stack";
  unitStack.setAttribute("aria-hidden", "true");

  const resourceBadges = document.createElement("div");
  resourceBadges.className = "cell-resources";

  RESOURCE_TYPES.forEach(({ key }) => {
    const amount = resources[key] ?? 0;
    if (amount > 0) {
      resourceBadges.appendChild(
        createResourceBadge(key, amount, {
          badgeClass: "cell-resource-badge",
          formatText: ({ value, label }) => `${label[0]}${value}`,
        }),
      );
    }
  });

  cell.append(terrainLabel, unitStack);
  if (resourceBadges.childElementCount > 0) {
    cell.append(resourceBadges);
  }

  cell.addEventListener("click", () => handleSelect(cell));
  cell.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(cell);
    }
  });

  return cell;
};

const buildGrid = () => {
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      fragment.appendChild(createCell(row, col));
    }
  }

  mapGrid.appendChild(fragment);
};

closeBattleModal();
buildGrid();
renderPhaseList();
updateTurnDisplay();
renderSelectedCellDetails(null);
openArmySelector({ focusSelect: true });

if (battleSpeedControl) {
  battleSpeedControl.addEventListener("input", updateBattleSpeedDisplay);
  updateBattleSpeedDisplay();
}

advancePhaseButton.addEventListener("click", advancePhase);
addUnitButton.addEventListener("click", () => {
  if (addUnitButton.disabled) {
    return;
  }
  openUnitModal();
});

if (helpButton) {
  helpButton.addEventListener("click", () => {
    if (helpModal && helpModal.getAttribute("aria-hidden") === "false") {
      closeHelpModal();
      return;
    }

    openHelpModal();
  });
}

if (helpCloseButton) {
  helpCloseButton.addEventListener("click", closeHelpModal);
}

if (helpModal) {
  helpModal.addEventListener("click", (event) => {
    if (event.target === helpModal) {
      closeHelpModal();
    }
  });
}

if (unitModalCloseButton) {
  unitModalCloseButton.addEventListener("click", closeUnitModal);
}

if (unitModal) {
  unitModal.addEventListener("click", (event) => {
    if (event.target === unitModal) {
      closeUnitModal();
    }
  });
}

if (armySelectorForm) {
  armySelectorForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstId = firstArmySelect?.value ?? "";
    const secondId = secondArmySelect?.value ?? "";

    if (!firstId || !secondId || firstId === secondId) {
      updateArmySelectorState({ forceShowMissing: true });
      return;
    }

    applyArmySelection([firstId, secondId]);
    closeArmySelector();
  });
}

if (firstArmySelect) {
  firstArmySelect.addEventListener("change", () => updateArmySelectorState());
}

if (secondArmySelect) {
  secondArmySelect.addEventListener("change", () => updateArmySelectorState());
}

helpTabButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    setActiveHelpTab(button.dataset.helpTab);
  });

  button.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAdjacentHelpTab(index, 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAdjacentHelpTab(index, -1);
    } else if (event.key === "Home") {
      event.preventDefault();
      const firstTab = helpTabButtons[0];
      if (firstTab) {
        setActiveHelpTab(firstTab.dataset.helpTab);
        firstTab.focus();
      }
    } else if (event.key === "End") {
      event.preventDefault();
      const lastTab = helpTabButtons[helpTabButtons.length - 1];
      if (lastTab) {
        setActiveHelpTab(lastTab.dataset.helpTab);
        lastTab.focus();
      }
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (armySelectorModal && armySelectorModal.getAttribute("aria-hidden") === "false") {
    event.preventDefault();
    return;
  }

  if (unitModal && unitModal.getAttribute("aria-hidden") === "false") {
    event.preventDefault();
    closeUnitModal();
    return;
  }

  if (helpModal && helpModal.getAttribute("aria-hidden") === "false") {
    event.preventDefault();
    closeHelpModal();
  }
});
