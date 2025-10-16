const GRID_SIZE = 10;

const mapGrid = document.getElementById("map-grid");
const selectedCellDisplay = document.getElementById("selected-cell");

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
