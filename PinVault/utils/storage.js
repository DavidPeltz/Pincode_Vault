import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage key used for storing PIN grids in AsyncStorage
 * @constant {string}
 */
const STORAGE_KEY = 'PIN_GRIDS';

/**
 * Grid cell structure type definition
 * @typedef {Object} GridCell
 * @property {number} id - Unique identifier for the cell
 * @property {string} color - Color of the cell ('red', 'blue', 'green', 'yellow')
 * @property {number|null} value - Digit value (0-9) or null if empty
 * @property {boolean} isPinDigit - Whether this cell contains a PIN digit
 */

/**
 * Grid data structure type definition
 * @typedef {Object} GridData
 * @property {string} id - Unique identifier for the grid
 * @property {string} name - User-defined name for the grid
 * @property {GridCell[]} grid - Array of 40 grid cells (8x5 layout)
 * @property {string} createdAt - ISO date string when grid was created
 * @property {string} updatedAt - ISO date string when grid was last updated
 */

/**
 * Saves a PIN grid to AsyncStorage
 * @async
 * @function saveGrid
 * @param {GridData} gridData - The grid data to save
 * @returns {Promise<boolean>} True if save was successful, false otherwise
 * 
 * @example
 * const gridData = {
 *   id: 'grid_123',
 *   name: 'Chase Credit Card',
 *   grid: generateRandomGrid(),
 *   createdAt: new Date().toISOString(),
 *   updatedAt: new Date().toISOString()
 * };
 * const success = await saveGrid(gridData);
 * if (success) {
 *   console.log('Grid saved successfully');
 * }
 */
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

/**
 * Retrieves all PIN grids from AsyncStorage
 * @async
 * @function getGrids
 * @returns {Promise<Object<string, GridData>>} Object with grid IDs as keys and GridData as values
 * 
 * @example
 * const grids = await getGrids();
 * const gridArray = Object.values(grids);
 * console.log(`Found ${gridArray.length} saved grids`);
 */
export const getGrids = async () => {
  try {
    const grids = await AsyncStorage.getItem(STORAGE_KEY);
    return grids ? JSON.parse(grids) : {};
  } catch (error) {
    console.error('Error loading grids:', error);
    return {};
  }
};

/**
 * Deletes a specific PIN grid from AsyncStorage
 * @async
 * @function deleteGrid
 * @param {string} gridId - The ID of the grid to delete
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 * 
 * @example
 * const success = await deleteGrid('grid_123');
 * if (success) {
 *   console.log('Grid deleted successfully');
 * }
 */
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

/**
 * Clears all PIN grids from AsyncStorage
 * @async
 * @function clearAllGrids
 * @returns {Promise<boolean>} True if clearing was successful, false otherwise
 * 
 * @example
 * const success = await clearAllGrids();
 * if (success) {
 *   console.log('All grids cleared successfully');
 * }
 */
export const clearAllGrids = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    return true;
  } catch (error) {
    console.error('Error clearing all grids:', error);
    return false;
  }
};

/**
 * Generates a random 8x5 PIN grid with evenly distributed colors
 * 
 * This function creates a 40-cell grid where each color (red, blue, green, yellow)
 * appears exactly 10 times. The colors are then shuffled to create a random layout.
 * 
 * @function generateRandomGrid
 * @returns {GridCell[]} Array of 40 grid cells with randomized color positions
 * 
 * @example
 * const newGrid = generateRandomGrid();
 * console.log(newGrid.length); // 40
 * 
 * // Count colors to verify even distribution
 * const colorCounts = newGrid.reduce((acc, cell) => {
 *   acc[cell.color] = (acc[cell.color] || 0) + 1;
 *   return acc;
 * }, {});
 * console.log(colorCounts); // { red: 10, blue: 10, green: 10, yellow: 10 }
 */
export const generateRandomGrid = () => {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const grid = [];
  
  // Create 8x5 grid (40 cells) with evenly distributed colors
  for (let i = 0; i < 40; i++) {
    grid.push({
      id: i,
      color: colors[i % 4], // Evenly distribute colors
      value: null,
      isPinDigit: false
    });
  }
  
  // Shuffle the grid using Fisher-Yates algorithm to randomize color positions
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i].color, grid[j].color] = [grid[j].color, grid[i].color];
  }
  
  return grid;
};

/**
 * Fills all empty cells in a grid with random digits (0-9)
 * 
 * This function is used to add decoy digits to cells that don't contain PIN digits,
 * providing visual obfuscation for security purposes.
 * 
 * @function fillEmptyCells
 * @param {GridCell[]} grid - The grid to fill with random digits
 * @returns {GridCell[]} New grid array with random values in previously empty cells
 * 
 * @example
 * const grid = generateRandomGrid();
 * // Set some PIN digits first
 * grid[0].value = 1;
 * grid[0].isPinDigit = true;
 * grid[5].value = 2;
 * grid[5].isPinDigit = true;
 * 
 * // Fill remaining cells with random digits
 * const filledGrid = fillEmptyCells(grid);
 * const emptyCells = filledGrid.filter(cell => cell.value === null);
 * console.log(emptyCells.length); // 0 - all cells now have values
 */
export const fillEmptyCells = (grid) => {
  return grid.map(cell => ({
    ...cell,
    value: cell.value === null ? Math.floor(Math.random() * 10) : cell.value
  }));
};