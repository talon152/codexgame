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

const getRandomTerrain = () =>
  TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];

document.documentElement.style.setProperty("--grid-size", GRID_SIZE);

let selectedCell = null;
let unitInstanceCounter = 0;
let isResolvingBattles = false;

const UNIT_ROSTERS = {
  sun: [
    {
      id: "radiant-vanguard",
      name: "Radiant Vanguard",
      stats: { strength: 7, attack: 6, defence: 5, hp: 18, initiative: 6 },
    },
    {
      id: "dawnblade-cavalry",
      name: "Dawnblade Cavalry",
      stats: { strength: 6, attack: 8, defence: 4, hp: 16, initiative: 8 },
    },
    {
      id: "luminar-arcanist",
      name: "Luminar Arcanist",
      stats: { strength: 5, attack: 7, defence: 3, hp: 14, initiative: 7 },
    },
    {
      id: "aegis-sentinels",
      name: "Aegis Sentinels",
      stats: { strength: 8, attack: 5, defence: 7, hp: 20, initiative: 4 },
    },
    {
      id: "solar-skirmisher",
      name: "Solar Skirmisher",
      stats: { strength: 6, attack: 6, defence: 4, hp: 15, initiative: 7 },
    },
  ],
  moon: [
    {
      id: "twilight-assassins",
      name: "Twilight Assassins",
      stats: { strength: 7, attack: 9, defence: 4, hp: 14, initiative: 9 },
    },
    {
      id: "umbral-wardens",
      name: "Umbral Wardens",
      stats: { strength: 6, attack: 5, defence: 8, hp: 19, initiative: 5 },
    },
    {
      id: "lunar-sages",
      name: "Lunar Sages",
      stats: { strength: 5, attack: 7, defence: 5, hp: 16, initiative: 6 },
    },
    {
      id: "nightglide-riders",
      name: "Nightglide Riders",
      stats: { strength: 6, attack: 8, defence: 5, hp: 17, initiative: 8 },
    },
    {
      id: "veilbreakers",
      name: "Veilbreakers",
      stats: { strength: 8, attack: 7, defence: 6, hp: 18, initiative: 6 },
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
      `INIT ${unit.stats.initiative}`,
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

const advancePhase = async () => {
  if (isResolvingBattles) {
    return;
  }

  if (turnState.currentPhaseIndex < TURN_PHASES.length - 1) {
    turnState.currentPhaseIndex += 1;
    updateTurnDisplay();
    return;
  }

  isResolvingBattles = true;

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

  turnState.currentPhaseIndex = 0;
  turnState.currentFactionIndex =
    (turnState.currentFactionIndex + 1) % FACTIONS.length;
  turnState.turnNumber += 1;

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

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

let helpReturnFocusElement = null;
let battleReturnFocusElement = null;

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
  document.body.classList.add("modal-open");
  setActiveHelpTab("combat", { focusTab: true });
};

const closeHelpModal = () => {
  if (!helpModal) {
    return;
  }

  helpModal.hidden = true;
  helpModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (
    helpReturnFocusElement instanceof HTMLElement &&
    document.contains(helpReturnFocusElement)
  ) {
    helpReturnFocusElement.focus({ preventScroll: true });
  }

  helpReturnFocusElement = null;
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

const openBattleModal = ({ row, col, topFactionName, bottomFactionName }) => {
  if (!battleModal) {
    return;
  }

  battleReturnFocusElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  battleModal.hidden = false;
  battleModal.setAttribute("aria-hidden", "false");

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
    battleLocationDisplay.textContent = `${formatCoordinates(row, col)}`;
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

  openBattleModal({
    row,
    col,
    topFactionName,
    bottomFactionName,
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

  appendBattleLog(`${topFactionName} engage ${bottomFactionName}.`);

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
      `INIT ${unit.stats.initiative}`,
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

closeBattleModal();
buildGrid();
renderPhaseList();
updateTurnDisplay();
renderSelectedCellDetails(null);

if (battleSpeedControl) {
  battleSpeedControl.addEventListener("input", updateBattleSpeedDisplay);
  updateBattleSpeedDisplay();
}

advancePhaseButton.addEventListener("click", advancePhase);
addUnitButton.addEventListener("click", () => {
  if (addUnitButton.disabled) {
    return;
  }
  const shouldOpen = unitPicker.hidden;
  toggleUnitPicker(shouldOpen);
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
  if (event.key === "Escape" && helpModal && helpModal.getAttribute("aria-hidden") === "false") {
    closeHelpModal();
  }
});
