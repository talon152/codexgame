const GRID_SIZE = 10;

const mapGrid = document.getElementById("map-grid");
const selectedCellDisplay = document.getElementById("selected-cell");

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

  selectedCellDisplay.textContent = formatCoordinates(row, col);
};

const createCell = (row, col) => {
  const cell = document.createElement("button");
  cell.className = "cell";
  cell.type = "button";
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.setAttribute("role", "gridcell");
  cell.setAttribute("aria-label", formatCoordinates(row, col));
  cell.setAttribute("aria-selected", "false");
  cell.textContent = `${row + 1},${col + 1}`;

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
