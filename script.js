import { ARMIES, getArmyById } from "./data/armies/index.js";
import {
  INDEPENDENT_FACTION,
  getRandomIndependentUnit,
} from "./data/independent-units.js";
import {
  GRID_SIZE,
  RESOURCE_TYPES,
  TERRAIN_TYPES,
  TURN_PHASES,
  UNIT_STAT_LABELS,
  ORTHOGONAL_DIRECTIONS,
  START_PHASE_INDEX,
  MAIN_PHASE_INDEX,
  END_PHASE_INDEX,
} from "./src/constants.js";
import {
  mapGrid,
  selectedCellDisplay,
  currentFactionDisplay,
  turnCounterDisplay,
  phaseNameDisplay,
  phaseSummaryDisplay,
  sidebarPhaseBadge,
  advancePhaseButton,
  cellResourceList,
  buyUnitButton,
  buildStructureButton,
  moveUnitsButton,
  selectionGuidance,
  resourceInspirationDisplay,
  resourceWillDisplay,
  capitalGuidance,
  provinceUnitList,
  provinceUnitSummary,
  provinceSelectAllButton,
  unitModal,
  unitModalList,
  unitModalCloseButton,
  unitModalFactionLabel,
  unitDetailModal,
  unitDetailCloseButton,
  unitDetailTitle,
  unitDetailFaction,
  unitDetailRole,
  unitDetailLocation,
  unitDetailDescription,
  unitDetailStats,
  armySelectorModal,
  armySelectorForm,
  firstArmySelect,
  secondArmySelect,
  firstArmySummary,
  secondArmySummary,
  armySelectorStartButton,
  armySelectorError,
  battleModal,
  battleTopList,
  battleBottomList,
  battleTopLabel,
  battleBottomLabel,
  battleLocationDisplay,
  battleLogEntries,
  battleSpeedControl,
  battleSpeedValue,
  battleCloseButton,
  helpButton,
  helpModal,
  helpCloseButton,
  helpTabButtons,
  helpPanels,
  overlaySelect,
} from "./src/ui/dom-elements.js";
import {
  adjustFactionResources,
  canFactionAfford,
  getCapitalProductionForFaction,
  getFactionResources,
  getResourceDefinition,
  getResourcesForCellElement,
  resetFactionResources,
  rollResourcesForTerrain,
  setFactionResources,
  spendFactionResources,
} from "./src/resources.js";
import { randomIntInclusive } from "./src/utils/random.js";
import {
  createStructureInstance,
  formatStructureCost,
  STRUCTURE_TYPES,
  getStructureDefinitions,
} from "./src/structures/index.js";

const getRandomTerrain = () =>
  TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];

document.documentElement.style.setProperty("--grid-size", GRID_SIZE);

let selectedCell = null;
let unitInstanceCounter = 0;
let isResolvingBattles = false;
let factions = [];
const unitRosters = new Map();
const selectedUnitIds = new Set();
let lastRenderedCellKey = null;

const movementState = {
  isActive: false,
  originKey: null,
  originCoords: null,
  unitIds: [],
  range: 0,
  factionId: null,
  targets: new Set(),
  targetInfo: new Map(),
};

const DEFAULT_SELECTION_MESSAGE =
  selectionGuidance?.textContent?.trim() ?? "Select a cell to manage forces.";
const DEFAULT_PROVINCE_SUMMARY =
  provinceUnitSummary?.textContent?.trim() ??
  "Select a province to review stationed forces.";

let isCampaignOver = false;
let campaignOutcome = null;

const applyOverlaySelection = (value) => {
  const overlay = value ?? "none";
  if (!mapGrid) {
    return;
  }

  mapGrid.classList.toggle("map-grid--show-resources", overlay === "resources");
  mapGrid.classList.toggle(
    "map-grid--show-terrain-labels",
    overlay === "province-types",
  );
};

const setSelectionGuidance = (message = DEFAULT_SELECTION_MESSAGE) => {
  if (!selectionGuidance) {
    return;
  }

  if (isCampaignOver) {
    const finalMessage =
      campaignOutcome?.selectionMessage ??
      campaignOutcome?.summary ??
      "The campaign has concluded.";
    selectionGuidance.textContent = finalMessage;
    return;
  }

  selectionGuidance.textContent = message;
};

const updateResourceDisplay = () => {
  const faction = getActiveFaction();
  const resources = faction
    ? getFactionResources(faction.id)
    : { inspiration: 0, will: 0 };

  if (resourceInspirationDisplay) {
    resourceInspirationDisplay.textContent = `Inspiration: ${resources.inspiration}`;
  }

  if (resourceWillDisplay) {
    resourceWillDisplay.textContent = `Will: ${resources.will}`;
  }
};

const turnState = {
  turnNumber: 1,
  currentFactionIndex: 0,
  currentPhaseIndex: 0,
};

const getCellKey = (row, col) => `${row}-${col}`;

const boardUnits = new Map();
const cellEngagements = new Map();
const provinceOwners = new Map();
const boardStructures = new Map();
const STRUCTURE_CELL_CLASSES = new Set(
  getStructureDefinitions()
    .map((definition) => definition.cellClass)
    .filter(Boolean),
);

const INDEPENDENT_FACTION_ID = INDEPENDENT_FACTION.id;
const OWNER_CLASS_BY_FACTION = new Map([
  ["joy", "cell--owner-joy"],
  ["fear", "cell--owner-fear"],
  ["anger", "cell--owner-anger"],
  ["envy", "cell--owner-envy"],
  [INDEPENDENT_FACTION_ID, "cell--owner-independent"],
]);

const OWNER_CLASS_LIST = Array.from(
  new Set([...OWNER_CLASS_BY_FACTION.values(), "cell--owner-generic"]),
);
const capitalAssignments = new Map();

const capitalSelectionState = {
  isActive: false,
  index: 0,
  error: "",
};

const getStructureRecord = (row, col) =>
  boardStructures.get(getCellKey(row, col)) ?? null;

const setStructureForCell = (row, col, structure) => {
  const key = getCellKey(row, col);
  if (structure) {
    boardStructures.set(key, { ...structure });
  } else {
    boardStructures.delete(key);
  }
};

const clearCellStructureElement = (cell) => {
  if (!cell) {
    return;
  }

  delete cell.dataset.structureType;
  delete cell.dataset.structureOwner;
  cell.classList.remove("cell--has-structure");
  STRUCTURE_CELL_CLASSES.forEach((className) => {
    if (className) {
      cell.classList.remove(className);
    }
  });

  const badge = cell.querySelector(".cell-structure-badge");
  if (badge) {
    badge.remove();
  }
};

const applyStructureToCellElement = (cell, structure) => {
  if (!cell) {
    return;
  }

  if (!structure) {
    clearCellStructureElement(cell);
    return;
  }

  cell.dataset.structureType = structure.id;
  if (structure.ownerFactionId) {
    cell.dataset.structureOwner = structure.ownerFactionId;
  } else {
    delete cell.dataset.structureOwner;
  }

  cell.classList.add("cell--has-structure");
  STRUCTURE_CELL_CLASSES.forEach((className) => {
    if (className) {
      cell.classList.remove(className);
    }
  });

  if (structure.cellClass) {
    cell.classList.add(structure.cellClass);
  }

  let badge = cell.querySelector(".cell-structure-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cell-structure-badge";
    badge.setAttribute("aria-hidden", "true");
    cell.appendChild(badge);
  }

  badge.dataset.structure = structure.id;
  badge.textContent = structure.shortLabel ?? structure.name ?? structure.id;
};

const updateCellStructureVisual = (row, col, { cellElement = null } = {}) => {
  const cell = cellElement ?? getCellElementAt(row, col);
  if (!cell) {
    return;
  }

  const structure = getStructureRecord(row, col);
  if (structure) {
    applyStructureToCellElement(cell, structure);
  } else {
    clearCellStructureElement(cell);
  }
};

const cellIsControlledByFaction = (cell, factionId) => {
  if (!cell || !factionId) {
    return false;
  }

  if (cell.dataset.ownerFaction) {
    return cell.dataset.ownerFaction === factionId;
  }

  if (cell.dataset.capitalFaction) {
    return cell.dataset.capitalFaction === factionId;
  }

  return false;
};

const cellAllowsRecruitmentForFaction = (cell, factionId) => {
  if (!cell || !factionId) {
    return false;
  }

  if (cell.dataset.capitalFaction === factionId) {
    return true;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    return false;
  }

  const structure = getStructureRecord(coordinates.row, coordinates.col);
  if (!structure) {
    return false;
  }

  if (!structure.allowsRecruitment) {
    return false;
  }

  if (!structure.ownerFactionId) {
    return cellIsControlledByFaction(cell, factionId);
  }

  return structure.ownerFactionId === factionId;
};

const canFortifyCellForFaction = (cell, factionId) => {
  if (!cell || !factionId) {
    return false;
  }

  if (!cellIsControlledByFaction(cell, factionId)) {
    return false;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    return false;
  }

  if (getStructureRecord(coordinates.row, coordinates.col)) {
    return false;
  }

  const units = getUnitsForCell(coordinates.row, coordinates.col);
  const hasEnemyUnits = units.some((unit) => unit.factionId !== factionId);
  if (hasEnemyUnits) {
    return false;
  }

  return true;
};

const TEMPLATE_IDS = {
  JOY_GLEAM_WARDENS: "gleam-wardens",
  JOY_SPARK_SCOUTS: "spark-scouts",
  FEAR_DREAD_SENTRIES: "dread-sentries",
  FEAR_PHANTOM_COURIERS: "phantom-couriers",
  FEAR_TERROR_MANCERS: "terror-mancers",
  FEAR_GLOOM_ANCHORS: "gloom-anchors",
  ENVY_COVETOUS_RAIDERS: "covetous-raiders",
  MIRROR_PIROUETTES: "mirror-pirouettes",
  ENVY_GRUDGE_ARTILLERISTS: "grudge-artillerists",
  ENVY_SIPHON_CORSAIRS: "siphon-corsairs",
  ENVY_OBELISKS: "envy-obelisks",
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

const updatePhaseDisplay = () => {
  if (isCampaignOver) {
    const summary =
      campaignOutcome?.summary ?? "The campaign has concluded.";

    if (phaseNameDisplay) {
      phaseNameDisplay.textContent = "Campaign Over";
    }

    if (phaseSummaryDisplay) {
      phaseSummaryDisplay.textContent = summary;
    }

    if (sidebarPhaseBadge) {
      const badgeLabel = "Campaign Over";
      sidebarPhaseBadge.textContent = badgeLabel;
      sidebarPhaseBadge.className = "phase-badge phase-badge--turn";
      sidebarPhaseBadge.hidden = false;
      sidebarPhaseBadge.setAttribute("aria-label", `Current phase: ${badgeLabel}`);
    }

    if (capitalGuidance) {
      capitalGuidance.textContent = "";
      capitalGuidance.hidden = true;
    }

    return;
  }

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

    if (sidebarPhaseBadge) {
      const badgeLabel = "Capital Placement";
      sidebarPhaseBadge.textContent = badgeLabel;
      sidebarPhaseBadge.className = "phase-badge phase-badge--capital";
      sidebarPhaseBadge.hidden = !badgeLabel;
      sidebarPhaseBadge.setAttribute("aria-label", `Current phase: ${badgeLabel}`);
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

    updateCapitalHighlights();
    return;
  }

  const activePhase = TURN_PHASES[turnState.currentPhaseIndex];

  if (activePhase) {
    phaseNameDisplay.textContent = activePhase.label;
    phaseSummaryDisplay.textContent = activePhase.summary;
  } else {
    phaseNameDisplay.textContent = "";
    phaseSummaryDisplay.textContent = "";
  }

  if (sidebarPhaseBadge) {
    const badgeLabel = activePhase?.label ?? "";
    sidebarPhaseBadge.textContent = badgeLabel;
    sidebarPhaseBadge.className = "phase-badge phase-badge--turn";
    sidebarPhaseBadge.hidden = !badgeLabel;

    if (badgeLabel) {
      sidebarPhaseBadge.setAttribute("aria-label", `Current phase: ${badgeLabel}`);
    } else {
      sidebarPhaseBadge.removeAttribute("aria-label");
    }
  }

  if (capitalGuidance) {
    capitalGuidance.textContent = "";
    capitalGuidance.hidden = true;
  }

  updateCapitalHighlights();
};

const updateFactionDisplay = () => {
  if (!currentFactionDisplay) {
    return;
  }

  if (isCampaignOver) {
    const winnerId = campaignOutcome?.winnerId ?? null;
    const winner = winnerId ? getFactionById(winnerId) : null;
    const winnerName =
      campaignOutcome?.winnerName ?? winner?.name ?? winnerId ?? "Victorious faction";
    const summary =
      campaignOutcome?.summary ?? "The campaign has concluded.";

    currentFactionDisplay.textContent = `${winnerName} Victory`;
    currentFactionDisplay.className = winner
      ? `faction-badge faction-${winner.id}`
      : "faction-badge";
    currentFactionDisplay.setAttribute("title", summary);

    if (turnCounterDisplay) {
      turnCounterDisplay.textContent = "Campaign concluded";
    }

    updateResourceDisplay();
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
    updateResourceDisplay();
    return;
  }

  currentFactionDisplay.textContent = faction.name;
  currentFactionDisplay.className = `faction-badge faction-${faction.id}`;
  currentFactionDisplay.setAttribute("title", faction.summary ?? "");
  if (turnCounterDisplay) {
    turnCounterDisplay.textContent = `Turn ${turnState.turnNumber}`;
  }

  updateResourceDisplay();
};

const isMainPhaseActive = () =>
  !isCampaignOver &&
  !isCapitalSelectionActive() &&
  turnState.currentPhaseIndex === MAIN_PHASE_INDEX;

const updateAdvanceButton = () => {
  if (!advancePhaseButton) {
    return;
  }

  if (isCampaignOver) {
    advancePhaseButton.textContent = "Campaign Concluded";
    advancePhaseButton.setAttribute(
      "aria-label",
      "The campaign has concluded",
    );
    advancePhaseButton.disabled = true;
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
    !hasFactions ||
    isResolvingBattles ||
    !mainPhaseActive ||
    isCapitalSelectionActive() ||
    movementState.isActive;
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

const createCondensedUnitStat = (label, value) => {
  if (typeof value !== "number") {
    return null;
  }

  const stat = document.createElement("span");
  stat.className = "province-unit-card__stat";
  stat.textContent = `${label} ${value}`;
  return stat;
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
    const canAfford = canFactionAfford(activeFaction.id, unit.cost);
    selectButton.disabled = !canAfford;
    if (!canAfford) {
      selectButton.setAttribute("aria-disabled", "true");
      listItem.classList.add("unit-modal-item--disabled");
    }

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
      if (selectButton.disabled) {
        setSelectionGuidance("Not enough resources to recruit that unit.");
        return;
      }

      const recruited = handleAddUnitToSelectedCell(activeFaction.id, unit);
      if (recruited) {
        renderUnitModalOptions();
      }
    });

    if (!selectButton.disabled && !firstButton) {
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

const clearProvinceOwnerForCell = (cell) => {
  if (!cell) {
    return;
  }

  cell.classList.remove("cell--owned");
  OWNER_CLASS_LIST.forEach((className) => cell.classList.remove(className));
  delete cell.dataset.ownerFaction;
};

const resetBoardState = () => {
  boardUnits.clear();
  cellEngagements.clear();
  provinceOwners.clear();
  boardStructures.clear();
  selectedUnitIds.clear();
  lastRenderedCellKey = null;
  resetMovementState();

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
    cell.classList.remove("cell--movement-target");
    cell.classList.remove("cell--movement-target-hostile");
    clearProvinceOwnerForCell(cell);
    delete cell.dataset.capitalFaction;
    delete cell.dataset.capitalName;
    clearCellStructureElement(cell);
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

  isCampaignOver = false;
  campaignOutcome = null;

  factions = selectedArmies.map((army) => army.faction);
  unitRosters.clear();
  resetFactionResources();

  selectedArmies.forEach((army) => {
    unitRosters.set(army.faction.id, Array.isArray(army.roster) ? army.roster : []);
    setFactionResources(army.faction.id, { inspiration: 0, will: 0 });
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
  updateResourceDisplay();
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

  const resonanceMap = new Map();
  boardUnits.forEach((units, key) => {
    if (!Array.isArray(units) || units.length === 0) {
      return;
    }

    const hasWardens = units.some(
      (unit) =>
        unit.factionId === faction.id &&
        unit.templateId === TEMPLATE_IDS.JOY_GLEAM_WARDENS,
    );

    if (!hasWardens) {
      return;
    }

    const [row, col] = key.split("-").map(Number);
    if (!Number.isFinite(row) || !Number.isFinite(col)) {
      return;
    }

    ORTHOGONAL_DIRECTIONS.forEach(({ dr, dc }) => {
      const adjacentRow = row + dr;
      const adjacentCol = col + dc;
      if (
        adjacentRow < 0 ||
        adjacentRow >= GRID_SIZE ||
        adjacentCol < 0 ||
        adjacentCol >= GRID_SIZE
      ) {
        return;
      }

      const adjacentKey = getCellKey(adjacentRow, adjacentCol);
      resonanceMap.set(adjacentKey, (resonanceMap.get(adjacentKey) ?? 0) + 1);
    });
  });

  const templatesById = new Map();
  const roster = unitRosters.get(faction.id);
  if (Array.isArray(roster)) {
    roster.forEach((template) => {
      templatesById.set(template.id, template);
    });
  }

  boardUnits.forEach((units, key) => {
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

      const resonanceStacks = resonanceMap.get(key) ?? 0;
      if (resonanceStacks > 0 && unit.stats.hp < maxHp) {
        const bonus = Math.max(1, Math.round(maxHp * 0.1)) * resonanceStacks;
        unit.stats.hp = Math.min(maxHp, unit.stats.hp + bonus);
      }
    });
  });
};

const collectCapitalIncomeForActiveFaction = () => {
  const faction = getActiveFaction();
  if (!faction) {
    return null;
  }

  const capitalCoordinates = capitalAssignments.get(faction.id);
  if (!capitalCoordinates) {
    return null;
  }

  const ownerId = getProvinceOwnerId(capitalCoordinates.row, capitalCoordinates.col);
  if (ownerId !== faction.id) {
    return null;
  }

  const production = getCapitalProductionForFaction(faction.id);
  adjustFactionResources(faction.id, production);
  return production;
};

const collectTerritoryIncomeForActiveFaction = () => {
  const faction = getActiveFaction();
  if (!faction) {
    return null;
  }

  let totalInspiration = 0;
  let totalWill = 0;

  provinceOwners.forEach((ownerId, key) => {
    if (ownerId !== faction.id) {
      return;
    }

    const [rowString, colString] = key.split("-");
    const row = Number.parseInt(rowString ?? "", 10);
    const col = Number.parseInt(colString ?? "", 10);

    if (Number.isNaN(row) || Number.isNaN(col)) {
      return;
    }

    const cell = getCellElementAt(row, col);
    if (!cell) {
      return;
    }

    const resources = getResourcesForCellElement(cell);
    totalInspiration += resources.inspiration ?? 0;
    totalWill += resources.will ?? 0;
  });

  if (totalInspiration === 0 && totalWill === 0) {
    return null;
  }

  adjustFactionResources(faction.id, {
    inspiration: totalInspiration,
    will: totalWill,
  });
  return { inspiration: totalInspiration, will: totalWill };
};

const focusActiveFactionCapital = () => {
  const faction = getActiveFaction();
  if (!faction) {
    return;
  }

  const capitalCoordinates = capitalAssignments.get(faction.id);
  if (!capitalCoordinates) {
    return;
  }

  const capitalCell = getCellElementAt(
    capitalCoordinates.row,
    capitalCoordinates.col,
  );

  if (!capitalCell) {
    return;
  }

  if (movementState.isActive) {
    resetMovementState();
  }

  if (selectedCell === capitalCell) {
    capitalCell.focus({ preventScroll: true });
    renderSelectedCellDetails(capitalCell);
    return;
  }

  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell.setAttribute("aria-selected", "false");
  }

  selectedCell = capitalCell;
  selectedCell.classList.add("selected");
  selectedCell.setAttribute("aria-selected", "true");
  selectedCell.focus({ preventScroll: true });

  renderSelectedCellDetails(capitalCell);
};

const runStartPhase = () => {
  if (isCampaignOver) {
    return;
  }

  if (factions.length === 0) {
    updateTurnDisplay();
    return;
  }

  turnState.currentPhaseIndex = START_PHASE_INDEX;
  const capitalProduction = collectCapitalIncomeForActiveFaction();
  const territoryProduction = collectTerritoryIncomeForActiveFaction();
  applyStartPhaseRegeneration();
  updateResourceDisplay();
  updateTurnDisplay();

  if (phaseSummaryDisplay) {
    const summaryParts = [];

    if (capitalProduction) {
      const capitalParts = [];
      if (capitalProduction.inspiration > 0) {
        capitalParts.push(`${capitalProduction.inspiration} inspiration`);
      }
      if (capitalProduction.will > 0) {
        capitalParts.push(`${capitalProduction.will} will`);
      }
      if (capitalParts.length > 0) {
        summaryParts.push(`Capital yields ${capitalParts.join(" and ")}.`);
      }
    }

    if (territoryProduction) {
      const territoryParts = [];
      if (territoryProduction.inspiration > 0) {
        territoryParts.push(
          `${territoryProduction.inspiration} inspiration`,
        );
      }
      if (territoryProduction.will > 0) {
        territoryParts.push(`${territoryProduction.will} will`);
      }
      if (territoryParts.length > 0) {
        summaryParts.push(
          `Provinces provide ${territoryParts.join(" and ")}.`,
        );
      }
    }

    if (summaryParts.length > 0) {
      const summaryText = phaseSummaryDisplay.textContent ?? "";
      const appended = `${summaryText} ${summaryParts.join(" ")}`.trim();
      phaseSummaryDisplay.textContent = appended;
    }
  }

  turnState.currentPhaseIndex = MAIN_PHASE_INDEX;
  updateTurnDisplay();
  focusActiveFactionCapital();
  refreshSelectionStatus();
};

const advancePhase = async () => {
  if (isResolvingBattles) {
    return;
  }

  if (isCampaignOver) {
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

  if (isCampaignOver) {
    updateTurnDisplay();
    updateAdvanceButton();
    return;
  }

  turnState.currentPhaseIndex = START_PHASE_INDEX;
  turnState.currentFactionIndex =
    (turnState.currentFactionIndex + 1) % factions.length;
  turnState.turnNumber += 1;

  runStartPhase();
};

const formatCoordinates = (row, col) => `Row ${row + 1}, Column ${col + 1}`;

const concludeCampaignFromCapitalCapture = (cell, conquerorId) => {
  if (isCampaignOver || !cell) {
    return;
  }

  const capitalOwnerId = cell.dataset?.capitalFaction ?? null;
  if (!capitalOwnerId || capitalOwnerId === conquerorId) {
    return;
  }

  const defender = getFactionById(capitalOwnerId);
  const attacker = conquerorId ? getFactionById(conquerorId) : null;
  const defenderName = defender?.name ?? capitalOwnerId;
  const attackerName = attacker?.name ?? conquerorId ?? "Unknown forces";
  const capitalLabel = cell.dataset?.capitalName
    ? `${cell.dataset.capitalName} capital`
    : `${defenderName}'s capital`;

  const coordinates = getCellCoordinates(cell);
  const locationLabel = coordinates
    ? formatCoordinates(coordinates.row, coordinates.col)
    : null;

  const summaryParts = [];
  summaryParts.push(
    `${attackerName} capture the ${capitalLabel}${
      locationLabel ? ` at ${locationLabel}` : ""
    }.`,
  );
  summaryParts.push(`${defenderName} can no longer continue the campaign.`);

  const summary = summaryParts.join(" ");

  campaignOutcome = {
    winnerId: conquerorId,
    winnerName: attackerName,
    loserId: capitalOwnerId,
    loserName: defenderName,
    capitalName: capitalLabel,
    location: locationLabel,
    summary,
    selectionMessage: summary,
  };

  isCampaignOver = true;
  resetMovementState();
  selectedUnitIds.clear();

  appendBattleLog(summary);

  if (battleCloseButton) {
    battleCloseButton.textContent = "Close";
  }

  updateTurnDisplay();
  setSelectionGuidance(summary);
  updateAdvanceButton();
  updateActionButtonsAvailability();
  updateProvinceSelectAllButtonState();
};

const buildProvinceSummary = (cell, row, col) => {
  const summaryParts = [];
  const terrainLabel = cell?.dataset?.terrainLabel;
  const coordinatesLabel = formatCoordinates(row, col);
  summaryParts.push(
    terrainLabel ? `${terrainLabel} — ${coordinatesLabel}` : coordinatesLabel,
  );

  const capitalOwnerId = cell?.dataset?.capitalFaction;
  if (capitalOwnerId) {
    const capitalOwner = getFactionById(capitalOwnerId);
    const capitalName = capitalOwner?.name ?? capitalOwnerId;
    summaryParts.push(`Capital of ${capitalName}`);
  }

  const ownerId = cell?.dataset?.ownerFaction;
  if (ownerId) {
    const owner = getFactionById(ownerId);
    const ownerName = owner?.name ?? ownerId;
    summaryParts.push(`Controlled by ${ownerName}`);
  } else if (!capitalOwnerId) {
    summaryParts.push("Unclaimed province");
  }

  return summaryParts.join(" • ");
};

const getFactionById = (id) => {
  if (id === INDEPENDENT_FACTION_ID) {
    return INDEPENDENT_FACTION;
  }

  return factions.find((faction) => faction.id === id);
};

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

const clearUnitBattleRole = (unit) => {
  if (!unit || typeof unit !== "object") {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(unit, "battleRole")) {
    delete unit.battleRole;
  }
};

const synchroniseCellEngagementForCell = (row, col) => {
  const units = getUnitsForCell(row, col);
  const key = getCellKey(row, col);

  if (!Array.isArray(units) || units.length === 0) {
    cellEngagements.delete(key);
    return;
  }

  const factionIds = Array.from(
    new Set(
      units
        .map((unit) => unit?.factionId)
        .filter((factionId) => typeof factionId === "string" || typeof factionId === "number"),
    ),
  );

  if (factionIds.length <= 1) {
    cellEngagements.delete(key);
    units.forEach((unit) => clearUnitBattleRole(unit));
    return;
  }

  let record = cellEngagements.get(key);
  if (!record) {
    const [firstFaction, ...otherFactions] = factionIds;
    record = {
      defenders: new Set(firstFaction ? [firstFaction] : []),
      attackers: new Set(otherFactions),
    };
    cellEngagements.set(key, record);
  }

  const presentFactions = new Set(factionIds);

  Array.from(record.attackers).forEach((factionId) => {
    if (!presentFactions.has(factionId)) {
      record.attackers.delete(factionId);
    }
  });

  Array.from(record.defenders).forEach((factionId) => {
    if (!presentFactions.has(factionId)) {
      record.defenders.delete(factionId);
    }
  });

  if (record.defenders.size === 0) {
    const fallback = factionIds.find((factionId) => !record.attackers.has(factionId));
    if (fallback) {
      record.defenders.add(fallback);
    }
  }

  Array.from(record.attackers).forEach((factionId) => {
    if (record.defenders.has(factionId)) {
      record.attackers.delete(factionId);
    }
  });

  units.forEach((unit) => {
    if (!unit || typeof unit !== "object") {
      return;
    }

    if (record.defenders.has(unit.factionId)) {
      unit.battleRole = "defender";
    } else if (record.attackers.has(unit.factionId)) {
      unit.battleRole = "attacker";
    } else {
      clearUnitBattleRole(unit);
    }
  });
};

const recordCellEngagementAttack = (
  row,
  col,
  { movingFactionId = null, previousUnits = [] } = {},
) => {
  if (!movingFactionId) {
    return;
  }

  const key = getCellKey(row, col);
  let record = cellEngagements.get(key);
  if (!record) {
    record = {
      attackers: new Set(),
      defenders: new Set(),
    };
    cellEngagements.set(key, record);
  }

  const otherFactions = Array.from(
    new Set(
      previousUnits
        .filter((unit) => unit && unit.factionId !== movingFactionId)
        .map((unit) => unit.factionId),
    ),
  ).filter((factionId) => typeof factionId === "string" || typeof factionId === "number");

  const hasExistingRoles =
    record.attackers.size > 0 || record.defenders.size > 0;

  if (!hasExistingRoles && otherFactions.length > 0) {
    otherFactions.forEach((factionId) => record.defenders.add(factionId));
  }

  if (record.defenders.has(movingFactionId)) {
    otherFactions.forEach((factionId) => {
      if (record.defenders.has(factionId)) {
        return;
      }
      record.attackers.add(factionId);
    });
    record.attackers.delete(movingFactionId);
  } else {
    otherFactions.forEach((factionId) => {
      if (!record.attackers.has(factionId) && !record.defenders.has(factionId)) {
        record.defenders.add(factionId);
      }
    });
    record.defenders.delete(movingFactionId);
    record.attackers.add(movingFactionId);
  }

  synchroniseCellEngagementForCell(row, col);
};

const getCellEngagement = (row, col) =>
  cellEngagements.get(getCellKey(row, col)) ?? null;

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

let helpReturnFocusElement = null;
let battleReturnFocusElement = null;
let unitModalReturnFocusElement = null;
let unitDetailReturnFocusElement = null;

const isModalVisible = (modalElement) =>
  Boolean(modalElement) &&
  modalElement.getAttribute("aria-hidden") === "false";

const syncBodyModalState = () => {
  if (
    isModalVisible(helpModal) ||
    isModalVisible(battleModal) ||
    isModalVisible(unitModal) ||
    isModalVisible(unitDetailModal) ||
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
  if (!unitModal || !selectedCell || buyUnitButton?.disabled) {
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

const populateUnitDetailModal = (unit, locationText) => {
  if (!unitDetailModal) {
    return;
  }

  const faction = unit ? getFactionById(unit.factionId) : null;
  const factionName =
    faction?.name ?? unit?.factionId ?? INDEPENDENT_FACTION?.name ?? "Independent";

  if (unitDetailTitle) {
    unitDetailTitle.textContent = unit?.name ?? "Unknown unit";
  }

  if (unitDetailFaction) {
    unitDetailFaction.textContent = `Faction — ${factionName}`;
  }

  if (unitDetailRole) {
    if (unit?.role) {
      unitDetailRole.textContent = unit.role;
      unitDetailRole.hidden = false;
    } else {
      unitDetailRole.textContent = "";
      unitDetailRole.hidden = true;
    }
  }

  if (unitDetailLocation) {
    if (locationText) {
      unitDetailLocation.textContent = locationText;
      unitDetailLocation.hidden = false;
    } else {
      unitDetailLocation.textContent = "";
      unitDetailLocation.hidden = true;
    }
  }

  if (unitDetailStats) {
    unitDetailStats.innerHTML = "";
    unitDetailStats.appendChild(createUnitStatsRow(unit?.stats ?? {}));
  }

  if (unitDetailDescription) {
    unitDetailDescription.textContent =
      unit?.description ?? "No additional details available.";
  }
};

const openUnitDetailModal = (unit, { trigger, location } = {}) => {
  if (!unitDetailModal) {
    return;
  }

  populateUnitDetailModal(unit, location);

  unitDetailReturnFocusElement =
    trigger instanceof HTMLElement
      ? trigger
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

  unitDetailModal.hidden = false;
  unitDetailModal.setAttribute("aria-hidden", "false");
  syncBodyModalState();

  const focusTarget =
    unitDetailCloseButton ?? unitDetailModal.querySelector("button, [tabindex]");
  focusTarget?.focus({ preventScroll: true });
};

const closeUnitDetailModal = () => {
  if (!unitDetailModal) {
    return;
  }

  unitDetailModal.hidden = true;
  unitDetailModal.setAttribute("aria-hidden", "true");
  syncBodyModalState();

  if (
    unitDetailReturnFocusElement instanceof HTMLElement &&
    document.contains(unitDetailReturnFocusElement)
  ) {
    unitDetailReturnFocusElement.focus({ preventScroll: true });
  }

  unitDetailReturnFocusElement = null;
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

const resolveBattleLogContainer = () => {
  const element =
    battleLogEntries ?? document.getElementById("battle-log-entries");
  return element instanceof HTMLElement ? element : null;
};

const appendBattleLog = (message) => {
  const logContainer = resolveBattleLogContainer();
  if (!logContainer) {
    return;
  }

  const entry = document.createElement("li");
  entry.textContent = message;
  logContainer.appendChild(entry);

  const maxEntries = 60;
  while (logContainer.children.length > maxEntries) {
    logContainer.removeChild(logContainer.firstChild);
  }

  logContainer.scrollTop = logContainer.scrollHeight;
};

const getCellElementAt = (row, col) => {
  if (!mapGrid) {
    return null;
  }

  return mapGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
};

const getProvinceOwnerId = (row, col) => {
  const key = getCellKey(row, col);
  return provinceOwners.get(key) ?? null;
};

const setProvinceOwner = (row, col, factionId, { cellElement = null } = {}) => {
  const key = getCellKey(row, col);
  const ownerId = typeof factionId === "string" && factionId.length > 0 ? factionId : null;

  if (ownerId) {
    provinceOwners.set(key, ownerId);
  } else {
    provinceOwners.delete(key);
  }

  const cell = cellElement ?? getCellElementAt(row, col);
  if (!cell) {
    return ownerId;
  }

  clearProvinceOwnerForCell(cell);

  if (ownerId) {
    cell.classList.add("cell--owned");
    const ownerClass =
      OWNER_CLASS_BY_FACTION.get(ownerId) ?? "cell--owner-generic";
    cell.classList.add(ownerClass);
    cell.dataset.ownerFaction = ownerId;
    concludeCampaignFromCapitalCapture(cell, ownerId);
  }

  const structure = getStructureRecord(row, col);
  if (structure) {
    const nextStructure = { ...structure, ownerFactionId: ownerId };
    setStructureForCell(row, col, nextStructure);
    applyStructureToCellElement(cell, nextStructure);
  } else {
    clearCellStructureElement(cell);
  }

  return ownerId;
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

const applyStructureBattleEffects = ({
  row,
  col,
  units = [],
  defenders = [],
  getFactionName = (id) => id,
}) => {
  const structure = getStructureRecord(row, col);
  if (!structure) {
    return { revert: () => {}, summaries: [] };
  }

  const defenceBonus = Number(structure.defenceBonus ?? 0);
  if (!Number.isFinite(defenceBonus) || defenceBonus === 0) {
    return { revert: () => {}, summaries: [] };
  }

  const unitsById = new Map(
    units
      .filter((unit) => unit && unit.instanceId)
      .map((unit) => [unit.instanceId, unit]),
  );

  const defenderSet = new Set(defenders);
  if (defenderSet.size === 0) {
    return { revert: () => {}, summaries: [] };
  }

  if (structure.ownerFactionId && !defenderSet.has(structure.ownerFactionId)) {
    return { revert: () => {}, summaries: [] };
  }

  const affectedUnits = units.filter(
    (unit) =>
      defenderSet.has(unit.factionId) &&
      (!structure.ownerFactionId || unit.factionId === structure.ownerFactionId),
  );

  const originalValues = new Map();
  affectedUnits.forEach((unit) => {
    const current = Number(unit.stats?.defence);
    if (!Number.isFinite(current)) {
      return;
    }
    originalValues.set(unit.instanceId, current);
    unit.stats.defence = current + defenceBonus;
  });

  if (originalValues.size === 0) {
    return { revert: () => {}, summaries: [] };
  }

  const ownerName = structure.ownerFactionId
    ? getFactionName(structure.ownerFactionId)
    : "the defenders";
  const summary = `${structure.name} bolsters ${ownerName} with +${defenceBonus} DEF.`;

  return {
    summaries: [summary],
    revert: () => {
      originalValues.forEach((value, unitId) => {
        const unit = unitsById.get(unitId);
        if (unit && unit.stats) {
          unit.stats.defence = value;
        }
      });
    },
  };
};

const applyBattleTraitEffects = ({
  units,
  getFactionName,
  cellElement,
  battleContext = null,
}) => {
  const allUnitsById = new Map(units.map((unit) => [unit.instanceId, unit]));
  const originalStats = new Map();
  const summaries = [];
  const traitState = {
    phantomCourierBuffed: new Set(),
    spotlightTheftFactions: new Set(),
    battleContext: {
      attackers: new Set(battleContext?.attackers ?? []),
      defenders: new Set(battleContext?.defenders ?? []),
    },
  };

  const adjustUnitStat = (unit, stat, delta) => {
    if (!unit || typeof unit !== "object") {
      return false;
    }

    const current = Number(unit.stats?.[stat]);
    if (!Number.isFinite(current) || delta === 0) {
      return false;
    }

    let unitRecord = originalStats.get(unit.instanceId);
    if (!unitRecord) {
      unitRecord = new Map();
      originalStats.set(unit.instanceId, unitRecord);
    }

    if (!unitRecord.has(stat)) {
      unitRecord.set(stat, current);
    }

    const nextValue = Math.max(0, current + delta);
    unit.stats[stat] = nextValue;
    return nextValue !== current;
  };

  const applyInitiativePenaltyFromSources = (templateId, label) => {
    const factionsWithSources = new Set(
      units
        .filter((unit) => unit.templateId === templateId)
        .map((unit) => unit.factionId),
    );

    factionsWithSources.forEach((factionId) => {
      const affected = units.filter((unit) => unit.factionId !== factionId);
      let adjustedCount = 0;
      affected.forEach((unit) => {
        if (adjustUnitStat(unit, "initiative", -1)) {
          adjustedCount += 1;
        }
      });

      if (adjustedCount > 0) {
        summaries.push(
          `${label}: ${getFactionName(factionId)} impose -1 INIT on ${adjustedCount} opposing unit${adjustedCount === 1 ? "" : "s"}.`,
        );
      }
    });
  };

  applyInitiativePenaltyFromSources(
    TEMPLATE_IDS.FEAR_DREAD_SENTRIES,
    "Lingering Chill",
  );
  applyInitiativePenaltyFromSources(
    TEMPLATE_IDS.FEAR_GLOOM_ANCHORS,
    "Aura of Ominous Silence",
  );

  const raiders = units.filter(
    (unit) => unit.templateId === TEMPLATE_IDS.ENVY_COVETOUS_RAIDERS,
  );
  raiders.forEach((raider) => {
    const alliedSupport = units.some(
      (candidate) =>
        candidate.factionId === raider.factionId &&
        candidate.instanceId !== raider.instanceId,
    );
    if (!alliedSupport) {
      return;
    }

    const buffedStrength = adjustUnitStat(raider, "strength", 1);
    const buffedDefence = adjustUnitStat(raider, "defence", 1);

    if (buffedStrength || buffedDefence) {
      summaries.push(
        `Stolen Edge empowers ${raider.name} with +1 STR/+1 DEF while fighting alongside allies.`,
      );
    }
  });

  const revert = () => {
    originalStats.forEach((statsMap, unitId) => {
      const unit = allUnitsById.get(unitId);
      if (!unit) {
        return;
      }

      statsMap.forEach((value, stat) => {
        unit.stats[stat] = value;
      });
    });
  };

  const onAttack = ({ attacker, target }) => {
    if (!attacker) {
      return;
    }

    if (attacker.templateId === TEMPLATE_IDS.FEAR_TERROR_MANCERS && target) {
      if (adjustUnitStat(target, "initiative", -1)) {
        appendBattleLog(
          `Piercing Whispers rattle ${target.name}, reducing initiative by 1.`,
        );
      }
    }

    if (attacker.templateId === TEMPLATE_IDS.FEAR_PHANTOM_COURIERS) {
      if (!traitState.phantomCourierBuffed.has(attacker.instanceId)) {
        if (adjustUnitStat(attacker, "defence", 1)) {
          traitState.phantomCourierBuffed.add(attacker.instanceId);
          appendBattleLog(
            `${attacker.name} slip into the mist, gaining +1 DEF for the clash.`,
          );
        }
      }
    }

    if (attacker.templateId === TEMPLATE_IDS.ENVY_GRUDGE_ARTILLERISTS) {
      if (!traitState.spotlightTheftFactions.has(attacker.factionId)) {
        traitState.spotlightTheftFactions.add(attacker.factionId);
        adjustFactionResources(attacker.factionId, { inspiration: 1 });
        appendBattleLog(
          `Spotlight Theft awards ${getFactionName(attacker.factionId)} +1 inspiration.`,
        );
      }
    }
  };

  const onUnitDefeated = (target, { attackSummaries }) => {
    if (!target || !Array.isArray(attackSummaries)) {
      return;
    }

    const contributingAttacks = attackSummaries.filter(
      (entry) => entry.target === target,
    );
    const finisher = contributingAttacks[contributingAttacks.length - 1];

    if (
      finisher?.attacker?.templateId === TEMPLATE_IDS.MIRROR_PIROUETTES &&
      adjustUnitStat(finisher.attacker, "attack", 1)
    ) {
      appendBattleLog(
        `${finisher.attacker.name} imitate their fallen foe, gaining +1 ATK for the remainder of the battle.`,
      );
    }
  };

  const onBattleComplete = ({
    survivors,
    winningFactionIds,
    defeatedFactionIds,
  }) => {
    if (!Array.isArray(survivors)) {
      return;
    }

    const survivorByFaction = (factionId, templateId) =>
      survivors.some(
        (unit) =>
          unit.factionId === factionId && unit.templateId === templateId,
      );

    const uniqueWinningFactions = Array.isArray(winningFactionIds)
      ? [...new Set(winningFactionIds)]
      : [];

    uniqueWinningFactions.forEach((factionId) => {
      if (
        survivorByFaction(factionId, TEMPLATE_IDS.JOY_SPARK_SCOUTS)
      ) {
        adjustFactionResources(factionId, { inspiration: 1 });
        appendBattleLog(
          `Bottled Sunshine lets ${getFactionName(
            factionId,
          )} bank +1 inspiration after the victory.`,
        );
      }

      if (survivorByFaction(factionId, TEMPLATE_IDS.ENVY_SIPHON_CORSAIRS)) {
        const defeated = Array.isArray(defeatedFactionIds)
          ? [...defeatedFactionIds]
          : [];
        for (const enemyId of defeated) {
          const resources = getFactionResources(enemyId);
          if ((resources?.inspiration ?? 0) > 0) {
            adjustFactionResources(enemyId, { inspiration: -1 });
            adjustFactionResources(factionId, { inspiration: 1 });
            appendBattleLog(
              `Credit Hoarders seize 1 inspiration from ${getFactionName(
                enemyId,
              )}.`,
            );
            break;
          }
        }
      }

      if (survivorByFaction(factionId, TEMPLATE_IDS.ENVY_OBELISKS)) {
        const resources = getResourcesForCellElement(cellElement);
        if ((resources?.inspiration ?? 0) > 0) {
          adjustFactionResources(factionId, { will: 1 });
          appendBattleLog(
            `Transmute Longing converts captured inspiration into +1 will for ${getFactionName(
              factionId,
            )}.`,
          );
        }
      }
    });
  };

  return {
    revert,
    summaries,
    onAttack,
    onUnitDefeated,
    onBattleComplete,
    battleContext: traitState.battleContext,
  };
};

const openBattleModal = ({
  row,
  col,
  topFactionName,
  bottomFactionName,
  terrainLabel,
  topRole = null,
  bottomRole = null,
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

  const logContainer = resolveBattleLogContainer();
  if (logContainer) {
    logContainer.innerHTML = "";
  }

  if (battleTopLabel) {
    battleTopLabel.textContent = topRole
      ? `${topRole}: ${topFactionName}`
      : topFactionName;
  }

  if (battleBottomLabel) {
    battleBottomLabel.textContent = bottomRole
      ? `${bottomRole}: ${bottomFactionName}`
      : bottomFactionName;
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
    synchroniseCellEngagementForCell(row, col);
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

const updateProvinceOwnershipAfterBattle = (
  row,
  col,
  survivors,
  { cellElement = null } = {},
) => {
  if (survivors.length === 0) {
    return;
  }

  const currentOwner = getProvinceOwnerId(row, col);
  const survivingFactions = new Set(survivors.map((unit) => unit.factionId));

  if (survivingFactions.size !== 1) {
    return;
  }

  const [nextOwner] = survivingFactions;
  if (!nextOwner || nextOwner === currentOwner) {
    return;
  }

  setProvinceOwner(row, col, nextOwner, { cellElement });

  const factionName = getFactionById(nextOwner)?.name ?? nextOwner;
  appendBattleLog(`${factionName} seize control of the province.`);
};

const runBattleForCell = async ({ row, col, units }) => {
  if (isCampaignOver) {
    return;
  }

  synchroniseCellEngagementForCell(row, col);

  const uniqueFactionIds = Array.from(
    new Set(units.map((unit) => unit.factionId)),
  );

  if (uniqueFactionIds.length < 2) {
    return;
  }

  const engagement = getCellEngagement(row, col);
  const presentFactionIds = Array.from(new Set(uniqueFactionIds));
  let defenderFactionIds = engagement
    ? Array.from(engagement.defenders).filter((id) =>
        presentFactionIds.includes(id),
      )
    : [];
  let attackerFactionIds = engagement
    ? Array.from(engagement.attackers).filter((id) =>
        presentFactionIds.includes(id),
      )
    : [];

  if (defenderFactionIds.length === 0 && presentFactionIds.length > 0) {
    const [firstFaction, ...otherFactions] = presentFactionIds;
    if (firstFaction) {
      defenderFactionIds = [firstFaction];
    }
    attackerFactionIds = otherFactions.filter((id) => id !== firstFaction);
  }

  presentFactionIds.forEach((factionId) => {
    if (
      !defenderFactionIds.includes(factionId) &&
      !attackerFactionIds.includes(factionId)
    ) {
      attackerFactionIds.push(factionId);
    }
  });

  const defenderSet = new Set(defenderFactionIds);
  const attackerSet = new Set(attackerFactionIds);

  const defenderNames = defenderFactionIds.map(
    (id) => getFactionById(id)?.name ?? id,
  );
  const attackerNames = attackerFactionIds.map(
    (id) => getFactionById(id)?.name ?? id,
  );

  const topFactionName = defenderNames.length
    ? defenderNames.join(" / ")
    : "Defending Forces";
  const bottomFactionName = attackerNames.length
    ? attackerNames.join(" / ")
    : "Attacking Forces";

  const topUnits = units.filter((unit) => defenderSet.has(unit.factionId));
  const bottomUnits = units.filter((unit) => attackerSet.has(unit.factionId));

  const terrainInfo = getCellTerrainInfo(row, col);
  const terrainLabel = terrainInfo?.label ?? null;
  const cellElement = getCellElementAt(row, col);

  openBattleModal({
    row,
    col,
    topFactionName,
    bottomFactionName,
    topRole: defenderNames.length ? "Defenders" : null,
    bottomRole: attackerNames.length ? "Attackers" : null,
    terrainLabel,
  });

  const { revert: revertTerrainModifiers, summaries: terrainSummaries } =
    applyTerrainModifiersToUnits(units, terrainInfo);
  const {
    revert: revertStructureModifiers = () => {},
    summaries: structureSummaries = [],
  } = applyStructureBattleEffects({
    row,
    col,
    units,
    defenders: defenderFactionIds,
    getFactionName: (id) => getFactionById(id)?.name ?? id,
  });
  const battleContext = {
    defenders: new Set(defenderFactionIds),
    attackers: new Set(attackerFactionIds),
  };
  const traitRuntime = applyBattleTraitEffects({
    units,
    getFactionName: (id) => getFactionById(id)?.name ?? id,
    cellElement,
    battleContext,
  });

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

  if (defenderNames.length && attackerNames.length) {
    appendBattleLog(
      `${attackerNames.join(" / ")} assault ${defenderNames.join(" / ")}.`,
    );
  } else {
    appendBattleLog(`${topFactionName} engage ${bottomFactionName}.`);
  }
  if (terrainLabel) {
    appendBattleLog(`The clash erupts on the ${terrainLabel}.`);
  }
  terrainSummaries.forEach((summary) => {
    appendBattleLog(summary);
  });
  structureSummaries.forEach((summary) => {
    appendBattleLog(summary);
  });
  traitRuntime?.summaries?.forEach((summary) => {
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
        traitRuntime?.onAttack?.({ attacker, target, damage });
      });

      if (attackSummaries.length > 0) {
        await wait(getBattleDelay(500));
      }

      pendingDamage.forEach((damage, target) => {
        target.stats.hp = Math.max(0, target.stats.hp - damage);
        updateUnitHpDisplay(target);
        if (target.stats.hp <= 0) {
          appendBattleLog(`${target.name} has been defeated.`);
          traitRuntime?.onUnitDefeated?.(target, { attackSummaries });
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

  const survivors = units.filter((unit) => unit.stats.hp > 0);
  const survivingFactionIds = new Set(survivors.map((unit) => unit.factionId));
  const defeatedFactionIds = uniqueFactionIds.filter(
    (id) => !survivingFactionIds.has(id),
  );

  let winningFactionIds = [];
  if (topAlive && !bottomAlive) {
    winningFactionIds = [topFactionId];
  } else if (!topAlive && bottomAlive) {
    winningFactionIds = [...bottomFactionIds];
  }

  traitRuntime?.onBattleComplete?.({
    survivors,
    winningFactionIds,
    defeatedFactionIds,
  });

  traitRuntime?.revert?.();
  revertStructureModifiers();
  revertTerrainModifiers();

  setUnitsForCell(row, col, survivors);
  synchroniseCellEngagementForCell(row, col);
  if (cellElement) {
    updateCellUnitStack(cellElement, survivors);
  }

  updateProvinceOwnershipAfterBattle(row, col, survivors, { cellElement });

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
    if (isCampaignOver) {
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    await runBattleForCell(contested);
    if (isCampaignOver) {
      break;
    }
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

const clearMovementHighlights = () => {
  if (!mapGrid) {
    return;
  }

  mapGrid.querySelectorAll(".cell--movement-target").forEach((cell) =>
    cell.classList.remove("cell--movement-target"),
  );
  mapGrid.querySelectorAll(".cell--movement-target-hostile").forEach((cell) =>
    cell.classList.remove("cell--movement-target-hostile"),
  );
};

const resetMovementState = () => {
  movementState.isActive = false;
  movementState.originKey = null;
  movementState.originCoords = null;
  movementState.unitIds = [];
  movementState.range = 0;
  movementState.factionId = null;
  movementState.targets.clear();
  movementState.targetInfo.clear();
  clearMovementHighlights();

  if (moveUnitsButton) {
    moveUnitsButton.textContent = "Move Units";
    moveUnitsButton.classList.remove("action-button--primary");
  }

  updateActionButtonsAvailability();
  updateProvinceSelectAllButtonState();
};

const getSelectedUnitsForCell = (row, col) => {
  const units = getUnitsForCell(row, col);
  if (units.length === 0 || selectedUnitIds.size === 0) {
    return [];
  }

  return units.filter((unit) => selectedUnitIds.has(unit.instanceId));
};

const applyStackSelectionState = (element, button, unitsForCard = []) => {
  const totalUnits = Array.isArray(unitsForCard) ? unitsForCard.length : 0;
  const selectedCount =
    totalUnits === 0
      ? 0
      : unitsForCard.reduce(
          (count, unit) =>
            selectedUnitIds.has(unit.instanceId) ? count + 1 : count,
          0,
        );

  const allSelected = totalUnits > 0 && selectedCount === totalUnits;
  const partiallySelected =
    totalUnits > 0 && selectedCount > 0 && selectedCount < totalUnits;

  if (element) {
    element.classList.toggle("province-unit-card--selected", allSelected);
    element.classList.toggle("province-unit-card--partial", partiallySelected);
  }

  if (button) {
    const defaultLabel = totalUnits > 1 ? `Select (${totalUnits})` : "Select";
    button.textContent = defaultLabel;

    if (allSelected) {
      const clearLabel =
        totalUnits > 1
          ? `Clear selection for ${totalUnits} units`
          : "Clear selection for this unit";
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", clearLabel);
    } else if (partiallySelected) {
      const remaining = totalUnits - selectedCount;
      const partialLabel =
        remaining === 1
          ? `Select remaining unit (1 of ${totalUnits} not selected)`
          : `Select remaining units (${remaining} of ${totalUnits} not selected)`;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", partialLabel);
    } else {
      const selectLabel =
        totalUnits > 1
          ? `Select all ${totalUnits} units`
          : "Select this unit";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", selectLabel);
    }
  }
};

const updateProvinceSelectAllButtonState = ({
  cell = selectedCell,
  units = null,
} = {}) => {
  if (!provinceSelectAllButton) {
    return;
  }

  if (isCampaignOver) {
    provinceSelectAllButton.disabled = true;
    provinceSelectAllButton.textContent = "Select all";
    provinceSelectAllButton.classList.remove("is-clear-mode");
    provinceSelectAllButton.setAttribute(
      "aria-label",
      "Select all units (unavailable)",
    );
    provinceSelectAllButton.setAttribute("aria-pressed", "false");
    return;
  }

  const activeFaction = getActiveFaction();
  const effectiveCell = cell ?? selectedCell;
  const coordinates =
    effectiveCell instanceof HTMLElement ? getCellCoordinates(effectiveCell) : null;

  const provinceUnits = Array.isArray(units)
    ? units
    : coordinates
    ? getUnitsForCell(coordinates.row, coordinates.col)
    : [];

  const friendlyUnits = Array.isArray(provinceUnits) && activeFaction
    ? provinceUnits.filter((unit) => unit.factionId === activeFaction.id)
    : [];

  const friendlyCount = friendlyUnits.length;
  const selectedFriendlyCount = friendlyUnits.reduce(
    (count, unit) => (selectedUnitIds.has(unit.instanceId) ? count + 1 : count),
    0,
  );

  const canModifySelection =
    Boolean(activeFaction) &&
    Boolean(coordinates) &&
    isMainPhaseActive() &&
    !movementState.isActive &&
    friendlyCount > 0;

  provinceSelectAllButton.disabled = !canModifySelection;

  const allSelected =
    canModifySelection && friendlyCount > 0 && selectedFriendlyCount === friendlyCount;
  const hasPartialSelection =
    canModifySelection &&
    selectedFriendlyCount > 0 &&
    selectedFriendlyCount < friendlyCount;

  if (allSelected) {
    provinceSelectAllButton.textContent = `Clear selection (${friendlyCount})`;
  } else if (hasPartialSelection) {
    const remaining = friendlyCount - selectedFriendlyCount;
    provinceSelectAllButton.textContent = `Select all (${remaining} remaining)`;
  } else if (friendlyCount > 0) {
    provinceSelectAllButton.textContent =
      friendlyCount === 1 ? "Select all (1)" : `Select all (${friendlyCount})`;
  } else {
    provinceSelectAllButton.textContent = "Select all";
  }

  provinceSelectAllButton.classList.toggle(
    "is-clear-mode",
    Boolean(allSelected),
  );
  provinceSelectAllButton.setAttribute(
    "aria-pressed",
    allSelected ? "true" : "false",
  );

  const countLabel =
    friendlyCount > 0
      ? `${friendlyCount} unit${friendlyCount === 1 ? "" : "s"}`
      : "units";

  if (canModifySelection) {
    const actionLabel = allSelected ? "Clear selection of" : "Select all";
    provinceSelectAllButton.setAttribute(
      "aria-label",
      `${actionLabel} ${countLabel}`,
    );
  } else {
    provinceSelectAllButton.setAttribute(
      "aria-label",
      `Select all ${countLabel} (unavailable)`,
    );
  }
};

const updateActionButtonsAvailability = () => {
  if (!buyUnitButton && !moveUnitsButton && !buildStructureButton) {
    return;
  }

  if (isCampaignOver) {
    if (buyUnitButton) {
      buyUnitButton.disabled = true;
    }
    if (buildStructureButton) {
      buildStructureButton.disabled = true;
    }
    if (moveUnitsButton) {
      moveUnitsButton.disabled = true;
    }
    return;
  }

  if (movementState.isActive) {
    if (buyUnitButton) {
      buyUnitButton.disabled = true;
    }

    if (buildStructureButton) {
      buildStructureButton.disabled = true;
    }

    if (moveUnitsButton) {
      moveUnitsButton.disabled = false;
      moveUnitsButton.textContent = "Cancel Move";
      moveUnitsButton.classList.add("action-button--primary");
    }
    return;
  }

  if (moveUnitsButton) {
    moveUnitsButton.textContent = "Move Units";
    moveUnitsButton.classList.remove("action-button--primary");
  }

  if (!selectedCell) {
    if (buyUnitButton) {
      buyUnitButton.disabled = true;
    }
    if (buildStructureButton) {
      buildStructureButton.disabled = true;
    }
    if (moveUnitsButton) {
      moveUnitsButton.disabled = true;
    }
    return;
  }

  const activeFaction = getActiveFaction();
  const hasActiveFaction = Boolean(activeFaction);
  const coordinates = getCellCoordinates(selectedCell);

  if (!coordinates) {
    if (buyUnitButton) {
      buyUnitButton.disabled = true;
    }
    if (buildStructureButton) {
      buildStructureButton.disabled = true;
    }
    if (moveUnitsButton) {
      moveUnitsButton.disabled = true;
    }
    return;
  }

  const units = getUnitsForCell(coordinates.row, coordinates.col);
  const friendlyUnits = hasActiveFaction
    ? units.filter((unit) => unit.factionId === activeFaction.id)
    : [];

  const canRecruit =
    hasActiveFaction &&
    isMainPhaseActive() &&
    cellAllowsRecruitmentForFaction(selectedCell, activeFaction.id);
  if (buyUnitButton) {
    buyUnitButton.disabled = !canRecruit;
  }

  if (buildStructureButton) {
    const fortDefinition = STRUCTURE_TYPES.FORT;
    if (!fortDefinition) {
      buildStructureButton.disabled = true;
      buildStructureButton.removeAttribute("title");
    } else {
      const costSummary = formatStructureCost(fortDefinition);
      if (costSummary) {
        buildStructureButton.title = `Cost: ${costSummary}`;
      } else {
        buildStructureButton.removeAttribute("title");
      }

      let canBuild =
        hasActiveFaction && isMainPhaseActive() &&
        canFortifyCellForFaction(selectedCell, activeFaction.id);

      if (canBuild) {
        canBuild = canFactionAfford(activeFaction.id, fortDefinition.cost);
      }

      buildStructureButton.disabled = !canBuild;
    }
  }

  if (moveUnitsButton) {
    const canMove =
      hasActiveFaction && isMainPhaseActive() && friendlyUnits.length > 0;
    moveUnitsButton.disabled = !canMove;
  }
};

const refreshSelectionStatus = () => {
  updateProvinceSelectAllButtonState();

  if (!selectionGuidance) {
    return;
  }

  if (isCampaignOver) {
    setSelectionGuidance();
    return;
  }

  if (movementState.isActive) {
    const range = movementState.range;
    const label = range === 1 ? "space" : "spaces";
    setSelectionGuidance(`Choose a destination within ${range} ${label}.`);
    return;
  }

  if (!selectedCell) {
    setSelectionGuidance(DEFAULT_SELECTION_MESSAGE);
    return;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    setSelectionGuidance(DEFAULT_SELECTION_MESSAGE);
    return;
  }

  const selectedUnits = getSelectedUnitsForCell(coordinates.row, coordinates.col);
  if (selectedUnits.length === 0) {
    const activeFaction = getActiveFaction();
    if (activeFaction) {
      const recruitmentSite = cellAllowsRecruitmentForFaction(
        selectedCell,
        activeFaction.id,
      );
      if (recruitmentSite) {
        if (isMainPhaseActive()) {
          setSelectionGuidance(
            "Recruit new units here or select troops to move.",
          );
        } else {
          setSelectionGuidance("Recruitment opens during the main phase.");
        }
        return;
      }

      if (isMainPhaseActive() && canFortifyCellForFaction(selectedCell, activeFaction.id)) {
        setSelectionGuidance("Fortify this province or select troops to move.");
        return;
      }
    }

    setSelectionGuidance("Select friendly units to form a movement group.");
    return;
  }

  const range = selectedUnits.reduce((slowest, unit) => {
    const movement = Number(unit.stats?.movement ?? 0);
    if (!Number.isFinite(movement) || movement <= 0) {
      return Math.min(slowest, 0);
    }
    return Math.min(slowest, movement);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(range) || range <= 0) {
    setSelectionGuidance(
      `Selected ${selectedUnits.length} unit${selectedUnits.length === 1 ? "" : "s"}, but they cannot move.`,
    );
    return;
  }

  const label = range === 1 ? "space" : "spaces";
  setSelectionGuidance(
    `Selected ${selectedUnits.length} unit${selectedUnits.length === 1 ? "" : "s"} — slowest movement ${range} ${label}.`,
  );
};

const getReachableCells = (row, col, range, factionId) => {
  const maxRange = Number(range);
  if (!Number.isFinite(maxRange) || maxRange <= 0) {
    return [];
  }

  const results = [];
  const visited = new Set([getCellKey(row, col)]);
  const queue = [{ row, col, distance: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();

    ORTHOGONAL_DIRECTIONS.forEach(({ dr, dc }) => {
      const nextRow = current.row + dr;
      const nextCol = current.col + dc;

      if (
        nextRow < 0 ||
        nextRow >= GRID_SIZE ||
        nextCol < 0 ||
        nextCol >= GRID_SIZE
      ) {
        return;
      }

      const nextDistance = current.distance + 1;
      if (nextDistance > maxRange) {
        return;
      }

      const key = getCellKey(nextRow, nextCol);
      if (visited.has(key)) {
        return;
      }

      visited.add(key);
      const occupants = getUnitsForCell(nextRow, nextCol);
      const hasEnemyUnits = occupants.some((unit) => unit.factionId !== factionId);
      results.push({
        row: nextRow,
        col: nextCol,
        key,
        hasEnemyUnits,
        distance: nextDistance,
      });

      if (!hasEnemyUnits) {
        queue.push({ row: nextRow, col: nextCol, distance: nextDistance });
      }
    });
  }

  return results;
};

const highlightMovementTargets = (targets) => {
  clearMovementHighlights();
  targets.forEach(({ row, col }) => {
    const cell = getCellElementAt(row, col);
    if (cell) {
      cell.classList.add(
        movementState.targetInfo.get(getCellKey(row, col))?.hasEnemyUnits
          ? "cell--movement-target-hostile"
          : "cell--movement-target",
      );
    }
  });
};

const beginUnitMovement = () => {
  if (movementState.isActive) {
    resetMovementState();
    refreshSelectionStatus();
    return;
  }

  if (isCampaignOver) {
    setSelectionGuidance();
    return;
  }

  if (!selectedCell) {
    setSelectionGuidance("Select a friendly cell before moving units.");
    return;
  }

  const activeFaction = getActiveFaction();
  if (!activeFaction) {
    setSelectionGuidance("Select armies to begin before issuing movement orders.");
    return;
  }

  if (!isMainPhaseActive()) {
    setSelectionGuidance("Units can only move during the main phase.");
    return;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    setSelectionGuidance("Select a valid cell before moving units.");
    return;
  }

  const selectedUnits = getSelectedUnitsForCell(coordinates.row, coordinates.col).filter(
    (unit) => unit.factionId === activeFaction.id,
  );

  if (selectedUnits.length === 0) {
    setSelectionGuidance("Select one or more of your units first.");
    return;
  }

  const range = selectedUnits.reduce((slowest, unit) => {
    const movement = Number(unit.stats?.movement ?? 0);
    if (!Number.isFinite(movement) || movement <= 0) {
      return Math.min(slowest, 0);
    }
    return Math.min(slowest, movement);
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(range) || range <= 0) {
    setSelectionGuidance("The selected group cannot move.");
    return;
  }

  const reachable = getReachableCells(
    coordinates.row,
    coordinates.col,
    range,
    activeFaction.id,
  );

  if (reachable.length === 0) {
    setSelectionGuidance("No valid destinations within range.");
    return;
  }

  movementState.isActive = true;
  movementState.originKey = getCellKey(coordinates.row, coordinates.col);
  movementState.originCoords = coordinates;
  movementState.unitIds = selectedUnits.map((unit) => unit.instanceId);
  movementState.range = range;
  movementState.factionId = activeFaction.id;
  movementState.targets = new Set(reachable.map(({ key }) => key));
  movementState.targetInfo = new Map(reachable.map((target) => [target.key, target]));

  highlightMovementTargets(reachable);
  updateActionButtonsAvailability();

  const label = range === 1 ? "space" : "spaces";
  setSelectionGuidance(`Choose a destination within ${range} ${label}.`);
  updateProvinceSelectAllButtonState();
};

const tryHandleMovementClick = (cell) => {
  if (!movementState.isActive) {
    return false;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    return true;
  }

  const targetKey = getCellKey(coordinates.row, coordinates.col);

  if (targetKey === movementState.originKey) {
    resetMovementState();
    refreshSelectionStatus();
    return true;
  }

  if (!movementState.targets.has(targetKey)) {
    setSelectionGuidance("That destination is out of range.");
    return true;
  }

  executeMovementTo(cell, coordinates);
  return true;
};

const executeMovementTo = (targetCell, targetCoords) => {
  if (
    !movementState.isActive ||
    !movementState.originCoords ||
    movementState.unitIds.length === 0
  ) {
    resetMovementState();
    refreshSelectionStatus();
    return;
  }

  const originRow = movementState.originCoords.row;
  const originCol = movementState.originCoords.col;
  const originUnits = getUnitsForCell(originRow, originCol);
  const unitsToMove = originUnits.filter((unit) =>
    movementState.unitIds.includes(unit.instanceId),
  );

  if (unitsToMove.length === 0) {
    resetMovementState();
    refreshSelectionStatus();
    return;
  }

  const remainingUnits = originUnits.filter(
    (unit) => !movementState.unitIds.includes(unit.instanceId),
  );
  const movedUnitIds = unitsToMove.map((unit) => unit.instanceId);
  setUnitsForCell(originRow, originCol, remainingUnits);

  const existingDestinationUnits = getUnitsForCell(
    targetCoords.row,
    targetCoords.col,
  );
  const destinationUnits = [...existingDestinationUnits, ...unitsToMove];
  setUnitsForCell(targetCoords.row, targetCoords.col, destinationUnits);

  const originCellElement = getCellElementAt(originRow, originCol);
  if (originCellElement) {
    updateCellUnitStack(originCellElement, remainingUnits);
  }
  updateCellUnitStack(targetCell, destinationUnits);

  const movedCount = unitsToMove.length;
  const moveRange = movementState.range;
  const targetKey = getCellKey(targetCoords.row, targetCoords.col);
  const targetInfo = movementState.targetInfo.get(targetKey);
  const hadEnemyUnits = Boolean(targetInfo?.hasEnemyUnits);

  const movingFactionId = movementState.factionId;
  if (
    movingFactionId &&
    existingDestinationUnits.length === 0 &&
    getProvinceOwnerId(targetCoords.row, targetCoords.col) !== movingFactionId
  ) {
    setProvinceOwner(targetCoords.row, targetCoords.col, movingFactionId, {
      cellElement: targetCell,
    });
    if (isCampaignOver) {
      resetMovementState();
      refreshSelectionStatus();
      return;
    }
  }

  if (hadEnemyUnits) {
    recordCellEngagementAttack(targetCoords.row, targetCoords.col, {
      movingFactionId,
      previousUnits: existingDestinationUnits,
    });
  } else {
    synchroniseCellEngagementForCell(targetCoords.row, targetCoords.col);
  }

  synchroniseCellEngagementForCell(originRow, originCol);

  resetMovementState();
  selectedUnitIds.clear();
  movedUnitIds.forEach((id) => selectedUnitIds.add(id));

  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell.setAttribute("aria-selected", "false");
  }

  selectedCell = targetCell;
  selectedCell.classList.add("selected");
  selectedCell.setAttribute("aria-selected", "true");
  selectedCell.focus({ preventScroll: true });
  lastRenderedCellKey = getCellKey(targetCoords.row, targetCoords.col);
  renderSelectedCellDetails(targetCell);

  const rangeLabel = moveRange === 1 ? "space" : "spaces";
  const arrivalMessage = hadEnemyUnits
    ? " and engaged enemy forces."
    : ".";
  setSelectionGuidance(
    `Moved ${movedCount} unit${movedCount === 1 ? "" : "s"} up to ${moveRange} ${rangeLabel}${arrivalMessage}`,
  );
};

const toggleUnitSelection = (unitIds, { element, button, unitsForCard } = {}) => {
  if (!selectedCell) {
    setSelectionGuidance("Select a friendly cell first.");
    return;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    return;
  }

  const units = getUnitsForCell(coordinates.row, coordinates.col);
  const ids = Array.isArray(unitIds) ? unitIds : [unitIds];
  const foundUnits = ids
    .map((id) => units.find((candidate) => candidate.instanceId === id))
    .filter((unit) => Boolean(unit));

  if (foundUnits.length === 0) {
    return;
  }

  if (movementState.isActive) {
    setSelectionGuidance("Finish the current move before adjusting selection.");
    return;
  }

  const activeFaction = getActiveFaction();
  if (
    !activeFaction ||
    foundUnits.some((unit) => unit.factionId !== activeFaction.id)
  ) {
    setSelectionGuidance("Only your units can be selected for movement.");
    return;
  }

  if (!isMainPhaseActive()) {
    setSelectionGuidance("Units can only move during the main phase.");
    return;
  }

  const allSelected = foundUnits.every((unit) =>
    selectedUnitIds.has(unit.instanceId),
  );

  foundUnits.forEach((unit) => {
    if (allSelected) {
      selectedUnitIds.delete(unit.instanceId);
    } else {
      selectedUnitIds.add(unit.instanceId);
    }
  });

  applyStackSelectionState(
    element,
    button,
    Array.isArray(unitsForCard) && unitsForCard.length > 0
      ? unitsForCard
      : foundUnits,
  );

  refreshSelectionStatus();
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
    synchroniseCellEngagementForCell(row, col);
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

const createUnitStackKey = (unit) => {
  if (!unit) {
    return "unknown";
  }

  const stats = unit.stats ?? {};
  const statsEntries = Object.keys(stats)
    .sort((a, b) => a.localeCompare(b))
    .map((stat) => {
      const value = Number(stats[stat]);
      return `${stat}:${Number.isFinite(value) ? value : 0}`;
    })
    .join("|");

  const factionKey = unit.factionId ?? "neutral";
  const templateKey = unit.templateId ?? unit.name ?? "unknown";
  const roleKey = unit.role ?? "";

  return `${factionKey}::${templateKey}::${roleKey}::${statsEntries}`;
};

const buildProvinceUnitStacks = (units) => {
  const stacks = [];
  const stackMap = new Map();

  units.forEach((unit) => {
    const key = createUnitStackKey(unit);
    let stack = stackMap.get(key);
    if (!stack) {
      stack = { key, units: [], representative: unit };
      stackMap.set(key, stack);
      stacks.push(stack);
    }
    stack.units.push(unit);
  });

  return stacks;
};

const renderProvinceUnitList = (cell, units = null) => {
  if (!provinceUnitList) {
    return;
  }

  provinceUnitList.innerHTML = "";

  if (!cell) {
    if (provinceUnitSummary) {
      provinceUnitSummary.textContent = DEFAULT_PROVINCE_SUMMARY;
    }

    const emptyMessage = document.createElement("li");
    emptyMessage.className = "province-unit-empty";
    emptyMessage.textContent = DEFAULT_PROVINCE_SUMMARY;
    provinceUnitList.appendChild(emptyMessage);
    updateProvinceSelectAllButtonState({ cell: null, units: [] });
    return;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    if (provinceUnitSummary) {
      provinceUnitSummary.textContent = DEFAULT_PROVINCE_SUMMARY;
    }

    const emptyMessage = document.createElement("li");
    emptyMessage.className = "province-unit-empty";
    emptyMessage.textContent = DEFAULT_PROVINCE_SUMMARY;
    provinceUnitList.appendChild(emptyMessage);
    updateProvinceSelectAllButtonState({ cell: null, units: [] });
    return;
  }

  const { row, col } = coordinates;
  const provinceSummary = buildProvinceSummary(cell, row, col);
  const provinceUnits = Array.isArray(units) ? units : getUnitsForCell(row, col);

  const validUnitIds = new Set(provinceUnits.map((unit) => unit.instanceId));
  Array.from(selectedUnitIds).forEach((unitId) => {
    if (!validUnitIds.has(unitId)) {
      selectedUnitIds.delete(unitId);
    }
  });

  const activeFaction = getActiveFaction();
  const stacks = buildProvinceUnitStacks(provinceUnits);

  updateProvinceSelectAllButtonState({ cell, units: provinceUnits });

  if (provinceUnitSummary) {
    if (provinceUnits.length > 0) {
      const unitCountLabel =
        provinceUnits.length === 1
          ? "1 unit stationed"
          : `${provinceUnits.length} units stationed`;
      const stackLabel =
        stacks.length === provinceUnits.length
          ? ""
          : stacks.length === 1
          ? " in 1 formation"
          : ` in ${stacks.length} formations`;
      provinceUnitSummary.textContent = `${unitCountLabel}${stackLabel} — ${provinceSummary}`;
    } else {
      provinceUnitSummary.textContent = `No units stationed — ${provinceSummary}`;
    }
  }

  if (provinceUnits.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "province-unit-empty";
    emptyMessage.textContent = "No units stationed in this province.";
    provinceUnitList.appendChild(emptyMessage);
    return;
  }

  stacks.forEach(({ units: stackUnits, representative }) => {
    const card = document.createElement("li");
    card.className = "province-unit-card";
    card.dataset.unitId = representative.instanceId;
    card.dataset.stackSize = stackUnits.length.toString();

    const isFriendly =
      Boolean(activeFaction) && representative.factionId === activeFaction.id;

    if (isFriendly) {
      card.classList.add("province-unit-card--selectable");
    }

    const header = document.createElement("div");
    header.className = "province-unit-card__header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "province-unit-card__title";

    const name = document.createElement("span");
    name.className = "province-unit-card__name";
    name.textContent = representative.name ?? "Unknown unit";
    titleGroup.appendChild(name);

    if (stackUnits.length > 1) {
      const countBadge = document.createElement("span");
      countBadge.className = "province-unit-card__count";
      countBadge.textContent = `×${stackUnits.length}`;
      titleGroup.appendChild(countBadge);
    }

    header.appendChild(titleGroup);

    const controls = document.createElement("div");
    controls.className = "province-unit-card__controls";

    let selectButton = null;
    if (isFriendly) {
      selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "province-unit-card__select";

      const handleToggle = (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleUnitSelection(
          stackUnits.map((unit) => unit.instanceId),
          {
            element: card,
            button: selectButton,
            unitsForCard: stackUnits,
          },
        );
      };

      selectButton.addEventListener("click", handleToggle);
      card.addEventListener("click", (event) => {
        if (event.target.closest(".province-unit-card__details")) {
          return;
        }
        handleToggle(event);
      });

      controls.appendChild(selectButton);
    }

    const detailsButton = document.createElement("button");
    detailsButton.type = "button";
    detailsButton.className = "province-unit-card__details";
    detailsButton.setAttribute(
      "aria-label",
      `View details for ${representative.name ?? "unit"}`,
    );

    const detailsIcon = document.createElement("span");
    detailsIcon.className = "province-unit-card__details-icon";
    detailsIcon.setAttribute("aria-hidden", "true");
    detailsIcon.textContent = "ⓘ";
    detailsButton.appendChild(detailsIcon);

    controls.appendChild(detailsButton);
    header.appendChild(controls);
    card.appendChild(header);

    const metaRow = document.createElement("div");
    metaRow.className = "province-unit-card__meta";

    if (representative.role) {
      const role = document.createElement("span");
      role.textContent = representative.role;
      metaRow.appendChild(role);
    }

    const faction = getFactionById(representative.factionId);
    const factionName =
      faction?.name ?? representative.factionId ?? INDEPENDENT_FACTION?.name ?? "Independent";
    const factionLabel = document.createElement("span");
    factionLabel.textContent = factionName;
    metaRow.appendChild(factionLabel);

    if (metaRow.childElementCount > 0) {
      card.appendChild(metaRow);
    }

    const statsRow = document.createElement("div");
    statsRow.className = "province-unit-card__stats";

    [
      createCondensedUnitStat("HP", representative.stats?.hp),
      createCondensedUnitStat("STR", representative.stats?.strength),
      createCondensedUnitStat("DEF", representative.stats?.defence),
    ].forEach((stat) => {
      if (stat) {
        statsRow.appendChild(stat);
      }
    });

    if (statsRow.childElementCount > 0) {
      card.appendChild(statsRow);
    }

    detailsButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openUnitDetailModal(representative, {
        trigger: detailsButton,
        location: provinceSummary,
      });
    });

    applyStackSelectionState(card, selectButton, stackUnits);
    provinceUnitList.appendChild(card);
  });
};

const handleSelectAllUnits = () => {
  if (!provinceSelectAllButton || provinceSelectAllButton.disabled) {
    return;
  }

  if (!selectedCell) {
    setSelectionGuidance("Select a friendly cell first.");
    return;
  }

  if (movementState.isActive) {
    setSelectionGuidance("Finish the current move before adjusting selection.");
    return;
  }

  if (!isMainPhaseActive()) {
    setSelectionGuidance("Units can only move during the main phase.");
    return;
  }

  const activeFaction = getActiveFaction();
  if (!activeFaction) {
    return;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    return;
  }

  const units = getUnitsForCell(coordinates.row, coordinates.col);
  const friendlyUnits = units.filter(
    (unit) => unit.factionId === activeFaction.id,
  );

  if (friendlyUnits.length === 0) {
    setSelectionGuidance("No friendly units available to select.");
    return;
  }

  const allSelected = friendlyUnits.every((unit) =>
    selectedUnitIds.has(unit.instanceId),
  );

  if (allSelected) {
    friendlyUnits.forEach((unit) => selectedUnitIds.delete(unit.instanceId));
  } else {
    friendlyUnits.forEach((unit) => selectedUnitIds.add(unit.instanceId));
  }

  renderProvinceUnitList(selectedCell, units);
  refreshSelectionStatus();
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

const renderSelectedCellDetails = (cell) => {
  if (!cell) {
    selectedCellDisplay.textContent = "None";
    renderCellResourceList(null);
    renderProvinceUnitList(null);
    resetMovementState();
    closeUnitModal();
    closeUnitDetailModal();
    selectedUnitIds.clear();
    lastRenderedCellKey = null;
    updateActionButtonsAvailability();
    setSelectionGuidance(DEFAULT_SELECTION_MESSAGE);
    return;
  }

  const coordinates = getCellCoordinates(cell);
  if (!coordinates) {
    selectedCellDisplay.textContent = "None";
    renderCellResourceList(null);
    renderProvinceUnitList(null);
    resetMovementState();
    selectedUnitIds.clear();
    lastRenderedCellKey = null;
    closeUnitModal();
    closeUnitDetailModal();
    updateActionButtonsAvailability();
    setSelectionGuidance(DEFAULT_SELECTION_MESSAGE);
    return;
  }

  const currentKey = getCellKey(coordinates.row, coordinates.col);
  const isNewCell = currentKey !== lastRenderedCellKey;
  if (isNewCell) {
    selectedUnitIds.clear();
    resetMovementState();
    lastRenderedCellKey = currentKey;
    closeUnitDetailModal();
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
  const ownerId = cell.dataset.ownerFaction;
  if (ownerId) {
    const owner = getFactionById(ownerId);
    const ownerName = owner?.name ?? ownerId;
    if (capitalOwnerId && ownerId === capitalOwnerId) {
      selectedText += ` — Held by ${ownerName}`;
    } else {
      selectedText += ` — Controlled by ${ownerName}`;
    }
  } else if (!capitalOwnerId) {
    selectedText += " — Unclaimed province";
  }
  updateCellStructureVisual(row, col, { cellElement: cell });
  const structure = getStructureRecord(row, col);
  if (structure) {
    const ownerName = structure.ownerFactionId
      ? getFactionById(structure.ownerFactionId)?.name ?? structure.ownerFactionId
      : null;
    const structureLabel = ownerName
      ? `${structure.name} (${ownerName})`
      : structure.name;
    selectedText += ` — Fortifications: ${structureLabel}`;
  }
  selectedCellDisplay.textContent = selectedText;

  const units = getUnitsForCell(row, col);
  renderProvinceUnitList(cell, units);
  renderCellResourceList(cell);
  updateCellUnitStack(cell, units);
  updateActionButtonsAvailability();
  refreshSelectionStatus();
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

  const coordinates = getCellCoordinates(cell);
  if (coordinates) {
    setProvinceOwner(coordinates.row, coordinates.col, faction.id, {
      cellElement: cell,
    });
  }

  if (selectedCell === cell) {
    renderSelectedCellDetails(cell);
  }
};

const handleAddUnitToSelectedCell = (factionId, template) => {
  if (!selectedCell) {
    setSelectionGuidance(
      "Select your capital or a friendly fort before recruiting units.",
    );
    return false;
  }

  const activeFaction = getActiveFaction();
  if (!activeFaction || factionId !== activeFaction.id) {
    setSelectionGuidance("Only the active faction can recruit units right now.");
    return false;
  }

  if (!isMainPhaseActive()) {
    setSelectionGuidance("Recruitment is only available during the main phase.");
    return false;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    return false;
  }

  const canRecruitHere = cellAllowsRecruitmentForFaction(
    selectedCell,
    activeFaction.id,
  );
  if (!canRecruitHere) {
    setSelectionGuidance(
      "Recruitment can only occur at your capital or a friendly fort.",
    );
    return false;
  }

  const cost = template.cost ?? {};
  if (!spendFactionResources(factionId, cost)) {
    setSelectionGuidance("Not enough resources to recruit that unit.");
    return false;
  }

  updateResourceDisplay();

  const { row, col } = coordinates;
  const existingUnits = [...getUnitsForCell(row, col)];
  const unitInstance = createUnitInstance(factionId, template);
  existingUnits.push(unitInstance);
  setUnitsForCell(row, col, existingUnits);
  synchroniseCellEngagementForCell(row, col);
  selectedUnitIds.add(unitInstance.instanceId);
  renderSelectedCellDetails(selectedCell);

  setSelectionGuidance(`${template.name} recruited successfully.`);
  return true;
};

const handleBuildFortOnSelectedCell = () => {
  const fortDefinition = STRUCTURE_TYPES.FORT;
  if (!fortDefinition) {
    return false;
  }

  if (!selectedCell) {
    setSelectionGuidance("Select a province you control to build a fort.");
    return false;
  }

  const activeFaction = getActiveFaction();
  if (!activeFaction) {
    setSelectionGuidance("No faction is currently active.");
    return false;
  }

  if (!isMainPhaseActive()) {
    setSelectionGuidance(
      "Fortifications can only be raised during the main phase.",
    );
    return false;
  }

  if (!cellIsControlledByFaction(selectedCell, activeFaction.id)) {
    setSelectionGuidance("You can only build forts in provinces you control.");
    return false;
  }

  const coordinates = getCellCoordinates(selectedCell);
  if (!coordinates) {
    return false;
  }

  const existingStructure = getStructureRecord(coordinates.row, coordinates.col);
  if (existingStructure) {
    setSelectionGuidance("This province is already fortified.");
    return false;
  }

  const units = getUnitsForCell(coordinates.row, coordinates.col);
  const hasEnemyUnits = units.some((unit) => unit.factionId !== activeFaction.id);
  if (hasEnemyUnits) {
    setSelectionGuidance("Clear enemy forces before fortifying this province.");
    return false;
  }

  if (!spendFactionResources(activeFaction.id, fortDefinition.cost)) {
    setSelectionGuidance("Not enough resources to build a fort.");
    return false;
  }

  updateResourceDisplay();

  const structureRecord = createStructureInstance(fortDefinition, {
    ownerFactionId: activeFaction.id,
  });

  setStructureForCell(coordinates.row, coordinates.col, structureRecord);
  applyStructureToCellElement(selectedCell, structureRecord);
  renderSelectedCellDetails(selectedCell);
  setSelectionGuidance("Fort constructed. This province can now recruit units.");
  return true;
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
  if (!cell) {
    return;
  }

  if (movementState.isActive) {
    const handled = tryHandleMovementClick(cell);
    if (handled) {
      return;
    }
  }

  if (selectedCell === cell) {
    renderSelectedCellDetails(cell);
    attemptCapitalSelection(cell);
    return;
  }

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
  terrainLabel.setAttribute("aria-hidden", "true");

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
          formatText: ({ value }) => `${value}`,
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
  if (!mapGrid) {
    return;
  }

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
updateTurnDisplay();
renderSelectedCellDetails(null);
openArmySelector({ focusSelect: true });

if (overlaySelect) {
  applyOverlaySelection(overlaySelect.value);
  overlaySelect.addEventListener("change", (event) => {
    applyOverlaySelection(event.target.value);
  });
} else {
  applyOverlaySelection("none");
}

if (battleSpeedControl) {
  battleSpeedControl.addEventListener("input", updateBattleSpeedDisplay);
  updateBattleSpeedDisplay();
}

advancePhaseButton?.addEventListener("click", advancePhase);
buyUnitButton?.addEventListener("click", () => {
  if (buyUnitButton.disabled) {
    return;
  }
  openUnitModal();
});

buildStructureButton?.addEventListener("click", () => {
  if (buildStructureButton.disabled) {
    return;
  }
  handleBuildFortOnSelectedCell();
});

moveUnitsButton?.addEventListener("click", () => {
  beginUnitMovement();
});

provinceSelectAllButton?.addEventListener("click", handleSelectAllUnits);

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

if (unitDetailCloseButton) {
  unitDetailCloseButton.addEventListener("click", closeUnitDetailModal);
}

if (unitDetailModal) {
  unitDetailModal.addEventListener("click", (event) => {
    if (event.target === unitDetailModal) {
      closeUnitDetailModal();
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

  if (unitDetailModal && unitDetailModal.getAttribute("aria-hidden") === "false") {
    event.preventDefault();
    closeUnitDetailModal();
    return;
  }

  if (helpModal && helpModal.getAttribute("aria-hidden") === "false") {
    event.preventDefault();
    closeHelpModal();
  }
});
