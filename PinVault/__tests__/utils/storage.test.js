import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  saveGrid, 
  getGrids, 
  deleteGrid, 
  clearAllGrids, 
  generateRandomGrid, 
  fillEmptyCells 
} from '../../utils/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('Storage Utils', () => {
  const mockGridData = {
    id: 'test_grid_1',
    name: 'Test Grid',
    grid: Array.from({ length: 40 }, (_, i) => ({
      id: i,
      value: i < 10 ? i : null,
      color: ['red', 'blue', 'green', 'yellow'][i % 4],
      isPinDigit: i < 4
    })),
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const mockGridsObject = {
    'grid_1': {
      id: 'grid_1',
      name: 'Grid 1',
      grid: Array.from({ length: 40 }, (_, i) => ({
        id: i,
        value: i % 10,
        color: ['red', 'blue', 'green', 'yellow'][i % 4],
        isPinDigit: false
      })),
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    },
    'grid_2': {
      id: 'grid_2',
      name: 'Grid 2',
      grid: Array.from({ length: 40 }, (_, i) => ({
        id: i,
        value: (i + 5) % 10,
        color: ['red', 'blue', 'green', 'yellow'][i % 4],
        isPinDigit: false
      })),
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGrid', () => {
    it('should save a new grid successfully', async () => {
      AsyncStorage.getItem.mockResolvedValue('{}'); // Empty storage
      AsyncStorage.setItem.mockResolvedValue();

      const result = await saveGrid(mockGridData);

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('PIN_GRIDS');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'PIN_GRIDS',
        JSON.stringify({ [mockGridData.id]: mockGridData })
      );
    });

    it('should update existing grid successfully', async () => {
      const existingGrids = { 'other_grid': { id: 'other_grid', name: 'Other' } };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingGrids));
      AsyncStorage.setItem.mockResolvedValue();

      const updatedGridData = { ...mockGridData, name: 'Updated Grid' };
      const result = await saveGrid(updatedGridData);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'PIN_GRIDS',
        JSON.stringify({
          ...existingGrids,
          [updatedGridData.id]: updatedGridData
        })
      );
    });

    it('should handle save errors gracefully', async () => {
      AsyncStorage.getItem.mockResolvedValue('{}');
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await saveGrid(mockGridData);

      expect(result).toBe(false);
    });
  });

  describe('getGrids', () => {
    it('should return empty object when no grids exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getGrids();

      expect(result).toEqual({});
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('PIN_GRIDS');
    });

    it('should return parsed grids from storage', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockGridsObject));

      const result = await getGrids();

      expect(result).toEqual(mockGridsObject);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('PIN_GRIDS');
    });

    it('should handle parsing errors', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await getGrids();

      expect(result).toEqual({});
    });

    it('should handle storage errors', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getGrids();

      expect(result).toEqual({});
    });
  });

  describe('deleteGrid', () => {
    it('should delete grid successfully', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockGridsObject));
      AsyncStorage.setItem.mockResolvedValue();

      const result = await deleteGrid('grid_1');

      const expectedGrids = { ...mockGridsObject };
      delete expectedGrids['grid_1'];

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'PIN_GRIDS',
        JSON.stringify(expectedGrids)
      );
    });

    it('should handle delete errors', async () => {
      AsyncStorage.getItem.mockResolvedValue('{}');
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await deleteGrid('grid_1');

      expect(result).toBe(false);
    });

    it('should handle deleting non-existent grid', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockGridsObject));
      AsyncStorage.setItem.mockResolvedValue();

      const result = await deleteGrid('non_existent_grid');

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'PIN_GRIDS',
        JSON.stringify(mockGridsObject)
      );
    });
  });

  describe('clearAllGrids', () => {
    it('should clear all grids successfully', async () => {
      AsyncStorage.setItem.mockResolvedValue();

      const result = await clearAllGrids();

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('PIN_GRIDS', '{}');
    });

    it('should handle clear errors', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await clearAllGrids();

      expect(result).toBe(false);
    });
  });

  describe('generateRandomGrid', () => {
    it('should generate a grid with correct number of cells', async () => {
      const grid = generateRandomGrid();

      expect(Array.isArray(grid)).toBe(true);
      expect(grid).toHaveLength(40); // 8x5 grid
      
      // Check first cell structure
      expect(grid[0]).toHaveProperty('id');
      expect(grid[0]).toHaveProperty('value');
      expect(grid[0]).toHaveProperty('color');
      expect(grid[0]).toHaveProperty('isPinDigit');
    });

    it('should generate grid cells with correct properties', async () => {
      const grid = generateRandomGrid();
      
      grid.forEach((cell, index) => {
        expect(cell.id).toBe(index);
        expect(['red', 'blue', 'green', 'yellow']).toContain(cell.color);
        expect(typeof cell.isPinDigit).toBe('boolean');
        
        if (cell.value !== null) {
          expect(cell.value).toBeGreaterThanOrEqual(0);
          expect(cell.value).toBeLessThanOrEqual(9);
        }
      });
    });

    it('should generate different grids on subsequent calls', async () => {
      const grid1 = generateRandomGrid();
      const grid2 = generateRandomGrid();

      // Grids should have different color arrangements
      const colors1 = grid1.map(cell => cell.color).join('');
      const colors2 = grid2.map(cell => cell.color).join('');
      
      expect(colors1).not.toBe(colors2);
    });

    it('should include some empty cells', async () => {
      const grid = generateRandomGrid();
      
      const emptyCells = grid.filter(cell => cell.value === null);
      expect(emptyCells.length).toBeGreaterThan(0);
    });
  });

  describe('fillEmptyCells', () => {
    it('should fill empty cells with random numbers', async () => {
      const gridWithEmpties = [
        { id: 0, value: 1, color: 'red', isPinDigit: false },
        { id: 1, value: null, color: 'blue', isPinDigit: false },
        { id: 2, value: 3, color: 'green', isPinDigit: false },
        { id: 3, value: null, color: 'yellow', isPinDigit: false },
      ];

      const filledGrid = fillEmptyCells(gridWithEmpties);

      expect(filledGrid[0].value).toBe(1); // Preserved
      expect(filledGrid[1].value).not.toBe(null); // Filled
      expect(filledGrid[1].value).toBeGreaterThanOrEqual(0);
      expect(filledGrid[1].value).toBeLessThanOrEqual(9);
      expect(filledGrid[2].value).toBe(3); // Preserved
      expect(filledGrid[3].value).not.toBe(null); // Filled
      expect(filledGrid[3].value).toBeGreaterThanOrEqual(0);
      expect(filledGrid[3].value).toBeLessThanOrEqual(9);
    });

    it('should preserve existing numbers', async () => {
      const gridWithValues = [
        { id: 0, value: 1, color: 'red', isPinDigit: false },
        { id: 1, value: 2, color: 'blue', isPinDigit: false },
        { id: 2, value: 3, color: 'green', isPinDigit: false },
      ];

      const result = fillEmptyCells(gridWithValues);

      expect(result[0].value).toBe(1);
      expect(result[1].value).toBe(2);
      expect(result[2].value).toBe(3);
    });

    it('should handle grid with no empty cells', async () => {
      const completeGrid = [
        { id: 0, value: 1, color: 'red', isPinDigit: false },
        { id: 1, value: 2, color: 'blue', isPinDigit: false },
        { id: 2, value: 3, color: 'green', isPinDigit: false },
      ];

      const result = fillEmptyCells(completeGrid);

      expect(result).toEqual(completeGrid);
    });

    it('should maintain cell structure', async () => {
      const gridWithEmpties = [
        { id: 0, value: null, color: 'red', isPinDigit: true },
        { id: 1, value: null, color: 'blue', isPinDigit: false },
      ];

      const filledGrid = fillEmptyCells(gridWithEmpties);

      filledGrid.forEach((cell, index) => {
        expect(cell.id).toBe(index);
        expect(cell.color).toBe(gridWithEmpties[index].color);
        expect(cell.isPinDigit).toBe(gridWithEmpties[index].isPinDigit);
        expect(cell.value).not.toBe(null);
      });
    });
  });
});