import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'PIN_GRIDS';

export const saveGrid = async (gridData) => {
  try {
    const existingGrids = await getGrids();
    const updatedGrids = { ...existingGrids, [gridData.id]: gridData };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGrids));
    return true;
  } catch (error) {
    console.error('Error saving grid:', error);
    return false;
  }
};

export const getGrids = async () => {
  try {
    const grids = await AsyncStorage.getItem(STORAGE_KEY);
    return grids ? JSON.parse(grids) : {};
  } catch (error) {
    console.error('Error loading grids:', error);
    return {};
  }
};

export const deleteGrid = async (gridId) => {
  try {
    const existingGrids = await getGrids();
    delete existingGrids[gridId];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingGrids));
    return true;
  } catch (error) {
    console.error('Error deleting grid:', error);
    return false;
  }
};

export const generateRandomGrid = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const grid = [];
  
  // Create 8x5 grid (40 cells)
  for (let i = 0; i < 40; i++) {
    grid.push({
      id: i,
      color: colors[i % 4], // Evenly distribute colors
      value: null,
      isPinDigit: false
    });
  }
  
  // Shuffle the grid to randomize color positions
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i].color, grid[j].color] = [grid[j].color, grid[i].color];
  }
  
  return grid;
};

export const fillEmptyCells = (grid) => {
  return grid.map(cell => ({
    ...cell,
    value: cell.value === null ? Math.floor(Math.random() * 10) : cell.value
  }));
};