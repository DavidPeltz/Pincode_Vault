import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveGrid,
  getGrids,
  deleteGrid,
  clearAllGrids,
  generateRandomGrid,
  fillEmptyCells,
} from '../../utils/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGrid', () => {
    it('should save a new grid successfully', async () => {
      const mockGrid = {
        id: '1',
        name: 'Test Grid',
        grid: [[1, 2], [3, 4]],
        createdAt: '2023-01-01',
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      AsyncStorage.setItem.mockResolvedValue();

      const result = await saveGrid(mockGrid.name, mockGrid.grid);

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('savedGrids');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'savedGrids',
        expect.stringContaining(mockGrid.name)
      );
    });

    it('should update existing grid successfully', async () => {
      const existingGrid = {
        id: '1',
        name: 'Test Grid',
        grid: [[1, 2], [3, 4]],
        createdAt: '2023-01-01',
      };

      const updatedGrid = {
        ...existingGrid,
        grid: [[5, 6], [7, 8]],
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingGrid]));
      AsyncStorage.setItem.mockResolvedValue();

      const result = await saveGrid(updatedGrid.name, updatedGrid.grid, existingGrid.id);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'savedGrids',
        expect.stringContaining('"grid":[[5,6],[7,8]]')
      );
    });

    it('should handle save errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await saveGrid('Test Grid', [[1, 2], [3, 4]]);

      expect(result).toBe(false);
    });
  });

  describe('getGrids', () => {
    it('should return empty array when no grids exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getGrids();

      expect(result).toEqual([]);
    });

    it('should return parsed grids from storage', async () => {
      const mockGrids = [
        { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
        { id: '2', name: 'Grid 2', grid: [[5, 6], [7, 8]] },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockGrids));

      const result = await getGrids();

      expect(result).toEqual(mockGrids);
    });

    it('should handle parsing errors', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await getGrids();

      expect(result).toEqual([]);
    });
  });

  describe('deleteGrid', () => {
    it('should delete grid successfully', async () => {
      const mockGrids = [
        { id: '1', name: 'Grid 1', grid: [[1, 2], [3, 4]] },
        { id: '2', name: 'Grid 2', grid: [[5, 6], [7, 8]] },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockGrids));
      AsyncStorage.setItem.mockResolvedValue();

      const result = await deleteGrid('1');

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'savedGrids',
        JSON.stringify([mockGrids[1]])
      );
    });

    it('should handle delete errors', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await deleteGrid('1');

      expect(result).toBe(false);
    });
  });

  describe('clearAllGrids', () => {
    it('should clear all grids successfully', async () => {
      AsyncStorage.setItem.mockResolvedValue();

      const result = await clearAllGrids();

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('savedGrids', '[]');
    });

    it('should handle clear errors', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const result = await clearAllGrids();

      expect(result).toBe(false);
    });
  });

  describe('generateRandomGrid', () => {
    it('should generate a grid with correct dimensions', () => {
      const rows = 5;
      const cols = 5;
      const grid = generateRandomGrid(rows, cols);

      expect(grid).toHaveLength(rows);
      expect(grid[0]).toHaveLength(cols);
    });

    it('should generate a grid with numbers 0-9', () => {
      const grid = generateRandomGrid(3, 3);
      
      grid.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBeGreaterThanOrEqual(0);
          expect(cell).toBeLessThanOrEqual(9);
        });
      });
    });

    it('should generate different grids on subsequent calls', () => {
      const grid1 = generateRandomGrid(3, 3);
      const grid2 = generateRandomGrid(3, 3);

      // Very unlikely to be identical
      expect(grid1).not.toEqual(grid2);
    });
  });

  describe('fillEmptyCells', () => {
    it('should fill empty cells with random numbers', () => {
      const gridWithEmpties = [
        [1, '', 3],
        ['', 5, ''],
        [7, 8, ''],
      ];

      const filledGrid = fillEmptyCells(gridWithEmpties);

      expect(filledGrid[0][1]).not.toBe('');
      expect(filledGrid[1][0]).not.toBe('');
      expect(filledGrid[1][2]).not.toBe('');
      expect(filledGrid[2][2]).not.toBe('');
      expect(typeof filledGrid[0][1]).toBe('number');
    });

    it('should preserve existing numbers', () => {
      const originalGrid = [
        [1, 2, 3],
        [4, '', 6],
        [7, 8, 9],
      ];

      const filledGrid = fillEmptyCells(originalGrid);

      expect(filledGrid[0][0]).toBe(1);
      expect(filledGrid[0][1]).toBe(2);
      expect(filledGrid[0][2]).toBe(3);
      expect(filledGrid[1][0]).toBe(4);
      expect(filledGrid[1][2]).toBe(6);
      expect(filledGrid[2][0]).toBe(7);
      expect(filledGrid[2][1]).toBe(8);
      expect(filledGrid[2][2]).toBe(9);
    });

    it('should handle grid with no empty cells', () => {
      const completeGrid = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const result = fillEmptyCells(completeGrid);

      expect(result).toEqual(completeGrid);
    });
  });
});