const GRID_SIZE = 10;

const mapGrid = document.getElementById("map-grid");
const selectedCellDisplay = document.getElementById("selected-cell");
const currentFactionDisplay = document.getElementById("current-faction");
const turnCounterDisplay = document.getElementById("turn-counter");
const phaseNameDisplay = document.getElementById("phase-name");
const phaseSummaryDisplay = document.getElementById("phase-summary");
const phaseListElement = document.getElementById("phase-list");
const advancePhaseButton = document.getElementById("advance-phase");

const TERRAIN_TYPES = [
  { name: "forest", label: "Forest", className: "terrain-forest" },
  { name: "plain", label: "Plain", className: "terrain-plain" },
  { name: "village", label: "Village", className: "terrain-village" },
  { name: "mountain", label: "Mountain", className: "terrain-mountain" },
  { name: "swamp", label: "Swamp", className: "terrain-swamp" },
  { name: "water", label: "Water", className: "terrain-water" },
];

const getRandomTerrain = () =>
  TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];

document.documentElement.style.setProperty("--grid-size", GRID_SIZE);

let selectedCell = null;

const FACTIONS = [
  {
    id: "sun",
    name: "Sun Dominion",
    summary: "Radiant tacticians focused on swift expansion.",
  },
  {
    id: "moon",
    name: "Moon Covenant",
    summary: "Patient mystics preparing calculated strikes.",
  },
];

const TURN_PHASES = [
  {
    id: "start",
    label: "Start Phase",
    summary: "Ready units and resolve any upkeep effects.",
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

const turnState = {
  turnNumber: 1,
  currentFactionIndex: 0,
  currentPhaseIndex: 0,
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
  const activePhase = TURN_PHASES[turnState.currentPhaseIndex];
  phaseNameDisplay.textContent = activePhase.label;
  phaseSummaryDisplay.textContent = activePhase.summary;

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
};

const updateFactionDisplay = () => {
  const faction = FACTIONS[turnState.currentFactionIndex];
  currentFactionDisplay.textContent = faction.name;
  currentFactionDisplay.className = `faction-badge faction-${faction.id}`;
  currentFactionDisplay.setAttribute("title", faction.summary);
  turnCounterDisplay.textContent = `Turn ${turnState.turnNumber}`;
};

const updateAdvanceButton = () => {
  const isLastPhase =
    turnState.currentPhaseIndex === TURN_PHASES.length - 1;
  advancePhaseButton.textContent = isLastPhase ? "End Turn" : "Next Phase";
  advancePhaseButton.setAttribute(
    "aria-label",
    isLastPhase ? "End the current turn" : "Advance to the next phase",
  );
};

const updateTurnDisplay = () => {
  updateFactionDisplay();
  updatePhaseDisplay();
  updateAdvanceButton();
};

const advancePhase = () => {
  if (turnState.currentPhaseIndex < TURN_PHASES.length - 1) {
    turnState.currentPhaseIndex += 1;
  } else {
    turnState.currentPhaseIndex = 0;
    turnState.currentFactionIndex =
      (turnState.currentFactionIndex + 1) % FACTIONS.length;
    turnState.turnNumber += 1;
  }

  updateTurnDisplay();
};

const formatCoordinates = (row, col) => `Row ${row + 1}, Column ${col + 1}`;

const handleSelect = (cell, row, col) => {
  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell.setAttribute("aria-selected", "false");
  }

  selectedCell = cell;
  selectedCell.classList.add("selected");
  selectedCell.setAttribute("aria-selected", "true");
  selectedCell.focus({ preventScroll: true });

  const terrain = cell.dataset.terrainLabel || "Unknown terrain";
  selectedCellDisplay.textContent = `${terrain} — ${formatCoordinates(row, col)}`;
};

const createCell = (row, col) => {
  const cell = document.createElement("button");
  const terrain = getRandomTerrain();
  cell.className = `cell ${terrain.className}`;
  cell.type = "button";
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.dataset.terrain = terrain.name;
  cell.dataset.terrainLabel = terrain.label;
  cell.setAttribute("role", "gridcell");
  cell.setAttribute(
    "aria-label",
    `${terrain.label} — ${formatCoordinates(row, col)}`,
  );
  cell.setAttribute("aria-selected", "false");
  cell.textContent = terrain.label;

  cell.addEventListener("click", () => handleSelect(cell, row, col));
  cell.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(cell, row, col);
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

buildGrid();
renderPhaseList();
updateTurnDisplay();

advancePhaseButton.addEventListener("click", advancePhase);
