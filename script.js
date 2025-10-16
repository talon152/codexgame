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
const addUnitButton = document.getElementById("add-unit-button");
const unitPicker = document.getElementById("unit-picker");
const unitPickerGroups = document.getElementById("unit-picker-groups");

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
let unitInstanceCounter = 0;

const UNIT_ROSTERS = {
  sun: [
    {
      id: "radiant-vanguard",
      name: "Radiant Vanguard",
      stats: { strength: 7, attack: 6, defence: 5, hp: 18 },
    },
    {
      id: "dawnblade-cavalry",
      name: "Dawnblade Cavalry",
      stats: { strength: 6, attack: 8, defence: 4, hp: 16 },
    },
    {
      id: "luminar-arcanist",
      name: "Luminar Arcanist",
      stats: { strength: 5, attack: 7, defence: 3, hp: 14 },
    },
    {
      id: "aegis-sentinels",
      name: "Aegis Sentinels",
      stats: { strength: 8, attack: 5, defence: 7, hp: 20 },
    },
    {
      id: "solar-skirmisher",
      name: "Solar Skirmisher",
      stats: { strength: 6, attack: 6, defence: 4, hp: 15 },
    },
  ],
  moon: [
    {
      id: "twilight-assassins",
      name: "Twilight Assassins",
      stats: { strength: 7, attack: 9, defence: 4, hp: 14 },
    },
    {
      id: "umbral-wardens",
      name: "Umbral Wardens",
      stats: { strength: 6, attack: 5, defence: 8, hp: 19 },
    },
    {
      id: "lunar-sages",
      name: "Lunar Sages",
      stats: { strength: 5, attack: 7, defence: 5, hp: 16 },
    },
    {
      id: "nightglide-riders",
      name: "Nightglide Riders",
      stats: { strength: 6, attack: 8, defence: 5, hp: 17 },
    },
    {
      id: "veilbreakers",
      name: "Veilbreakers",
      stats: { strength: 8, attack: 7, defence: 6, hp: 18 },
    },
  ],
};

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

const boardUnits = new Map();

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

const getActiveFaction = () => FACTIONS[turnState.currentFactionIndex] ?? null;

const renderUnitPickerForActiveFaction = () => {
  const activeFaction = getActiveFaction();
  unitPickerGroups.innerHTML = "";

  if (!activeFaction) {
    return;
  }

  const units = UNIT_ROSTERS[activeFaction.id] ?? [];
  const group = document.createElement("section");
  group.className = "unit-picker-group";

  const title = document.createElement("h3");
  title.className = "unit-picker-group-title";
  title.textContent = activeFaction.name;

  const list = document.createElement("ul");
  list.className = "unit-picker-list";

  units.forEach((unit) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "unit-option";

    const name = document.createElement("span");
    name.className = "unit-name";
    name.textContent = unit.name;

    const statsRow = document.createElement("span");
    statsRow.className = "unit-stats";

    [
      `STR ${unit.stats.strength}`,
      `ATK ${unit.stats.attack}`,
      `DEF ${unit.stats.defence}`,
      `HP ${unit.stats.hp}`,
    ].forEach((label) => {
      const stat = document.createElement("span");
      stat.textContent = label;
      statsRow.appendChild(stat);
    });

    button.append(name, statsRow);
    button.addEventListener("click", () =>
      handleAddUnitToSelectedCell(activeFaction.id, unit),
    );

    listItem.appendChild(button);
    list.appendChild(listItem);
  });

  group.append(title, list);
  unitPickerGroups.appendChild(group);
};

const updateTurnDisplay = () => {
  updateFactionDisplay();
  updatePhaseDisplay();
  updateAdvanceButton();
  renderUnitPickerForActiveFaction();
  toggleUnitPicker(false);
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

const getFactionById = (id) => FACTIONS.find((faction) => faction.id === id);

const getCellKey = (row, col) => `${row}-${col}`;

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

const createUnitInstance = (factionId, template) => ({
  instanceId: `${template.id}-${++unitInstanceCounter}`,
  templateId: template.id,
  name: template.name,
  factionId,
  stats: { ...template.stats },
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

  units.forEach((unit) => {
    const faction = getFactionById(unit.factionId);
    const listItem = document.createElement("li");

    const factionLabel = document.createElement("span");
    factionLabel.className = "unit-meta";
    factionLabel.textContent = faction ? faction.name : unit.factionId;

    const nameLabel = document.createElement("span");
    nameLabel.className = "unit-name";
    nameLabel.textContent = unit.name;

    const statsRow = document.createElement("span");
    statsRow.className = "unit-stats";

    [
      `STR ${unit.stats.strength}`,
      `ATK ${unit.stats.attack}`,
      `DEF ${unit.stats.defence}`,
      `HP ${unit.stats.hp}`,
    ].forEach((label) => {
      const stat = document.createElement("span");
      stat.textContent = label;
      statsRow.appendChild(stat);
    });

    listItem.appendChild(nameLabel);
    listItem.appendChild(factionLabel);
    listItem.appendChild(statsRow);

    cellUnitList.appendChild(listItem);
  });
};

const toggleUnitPicker = (shouldOpen) => {
  unitPicker.hidden = !shouldOpen;
  addUnitButton.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
};

const renderSelectedCellDetails = (cell) => {
  if (!cell) {
    selectedCellDisplay.textContent = "None";
    cellUnitList.innerHTML = "";
    const promptItem = document.createElement("li");
    promptItem.className = "unit-empty";
    promptItem.textContent = "Select a cell to view or add units.";
    cellUnitList.appendChild(promptItem);
    addUnitButton.disabled = true;
    toggleUnitPicker(false);
    return;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const terrain = cell.dataset.terrainLabel || "Unknown terrain";
  selectedCellDisplay.textContent = `${terrain} — ${formatCoordinates(row, col)}`;
  addUnitButton.disabled = false;
  const units = getUnitsForCell(row, col);
  updateCellUnitStack(cell, units);
  renderCellUnitList(row, col);
};

const handleAddUnitToSelectedCell = (factionId, template) => {
  if (!selectedCell) {
    return;
  }

  const activeFaction = getActiveFaction();
  if (!activeFaction || factionId !== activeFaction.id) {
    toggleUnitPicker(false);
    return;
  }

  const row = Number(selectedCell.dataset.row);
  const col = Number(selectedCell.dataset.col);
  const existingUnits = [...getUnitsForCell(row, col)];
  const unitInstance = createUnitInstance(factionId, template);
  existingUnits.push(unitInstance);
  setUnitsForCell(row, col, existingUnits);
  renderSelectedCellDetails(selectedCell);
  toggleUnitPicker(false);
};

const handleSelect = (cell, row, col) => {
  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell.setAttribute("aria-selected", "false");
  }

  selectedCell = cell;
  selectedCell.classList.add("selected");
  selectedCell.setAttribute("aria-selected", "true");
  selectedCell.focus({ preventScroll: true });

  renderSelectedCellDetails(cell);
  toggleUnitPicker(false);
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

  const terrainLabel = document.createElement("span");
  terrainLabel.className = "cell-terrain";
  terrainLabel.textContent = terrain.label;

  const unitStack = document.createElement("span");
  unitStack.className = "cell-unit-stack";
  unitStack.setAttribute("aria-hidden", "true");

  cell.append(terrainLabel, unitStack);

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
renderSelectedCellDetails(null);

advancePhaseButton.addEventListener("click", advancePhase);
addUnitButton.addEventListener("click", () => {
  if (addUnitButton.disabled) {
    return;
  }
  const shouldOpen = unitPicker.hidden;
  toggleUnitPicker(shouldOpen);
});
