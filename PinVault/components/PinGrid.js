import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Keyboard,
  Platform,
  BackHandler,
} from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../contexts/ThemeContext';

/**
 * @fileoverview Interactive PIN grid component for PIN Vault
 *
 * Renders an 8x5 grid of colored cells that can be tapped to enter PIN digits.
 * Supports both editable and read-only modes with visual feedback for PIN cells.
 * Includes platform-specific optimizations for keyboard handling and user interaction.
 */

const { width, height } = Dimensions.get('window');

/**
 * Interactive PIN Grid Component
 *
 * Displays a visual grid of colored cells for PIN entry and viewing.
 * In editable mode, users can tap cells to enter digits. PIN cells are
 * highlighted with special borders to distinguish them from decoy digits.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.grid - Array of 40 grid cell objects
 * @param {Function} props.onGridUpdate - Callback when grid is updated
 * @param {boolean} [props.isEditable=true] - Whether grid cells can be edited
 * @param {boolean} [props.showValues=true] - Whether to display cell values
 * @param {boolean} [props.showPinHighlight=true] - Whether to highlight PIN cells
 *
 * @example
 * const [grid, setGrid] = useState(generateRandomGrid());
 *
 * <PinGrid
 *   grid={grid}
 *   onGridUpdate={setGrid}
 *   isEditable={true}
 *   showValues={true}
 *   showPinHighlight={true}
 * />
 */
const PinGrid = ({
  grid,
  onGridUpdate,
  isEditable = true,
  showValues = true,
  showPinHighlight = true,
}) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const { theme, isDarkMode } = useTheme();

  /**
   * Gets the hex color code for a grid cell color name
   *
   * @function getColorHex
   * @param {string} color - Color name ('red', 'blue', 'green', 'yellow')
   * @returns {string} Hex color code from current theme
   *
   * @example
   * const redColor = getColorHex('red'); // '#FF0000' in light mode
   */
  const getColorHex = color => {
    return theme.gridColors[color] || '#CCCCCC';
  };

  // Auto-dismiss keyboard when modal closes (Android optimization)
  useEffect(() => {
    if (!modalVisible) {
      Keyboard.dismiss();
    }
  }, [modalVisible]);

  // Android hardware back button handling
  useEffect(() => {
    if (Platform.OS === 'android' && modalVisible) {
      const backAction = () => {
        closeModal();
        return true; // Prevent default back action
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [modalVisible]);

  /**
   * Handles cell press events to open digit input modal
   *
   * @function handleCellPress
   * @param {number} cellIndex - Index of the pressed cell (0-39)
   * @returns {void}
   *
   * @example
   * handleCellPress(0); // Opens input modal for first cell
   */
  const handleCellPress = cellIndex => {
    if (!isEditable) {
      return;
    }

    // Dismiss any existing keyboard first (Android optimization)
    Keyboard.dismiss();

    setSelectedCell(cellIndex);
    setInputValue(grid[cellIndex].value?.toString() || '');
    setModalVisible(true);
  };

  /**
   * Updates a specific cell's value and PIN digit status
   *
   * @function updateCellValue
   * @param {number} cellIndex - Index of the cell to update
   * @param {number|null} value - New digit value (0-9) or null for empty
   * @param {boolean} isPinDigit - Whether this cell contains a PIN digit
   * @returns {void}
   *
   * @example
   * updateCellValue(5, 7, true); // Set cell 5 to digit 7 as PIN digit
   * updateCellValue(10, null, false); // Clear cell 10
   */
  const updateCellValue = (cellIndex, value, isPinDigit) => {
    const updatedGrid = [...grid];
    updatedGrid[cellIndex] = {
      ...updatedGrid[cellIndex],
      value,
      isPinDigit,
    };
    onGridUpdate(updatedGrid);
  };

  /**
   * Handles input value changes in the modal text input
   *
   * @function handleValueChange
   * @param {string} text - New input text value
   * @returns {void}
   */
  const handleValueChange = text => {
    // Update display value only (no auto-submit since keyboard is disabled)
    if (text === '' || (text.length === 1 && /^[0-9]$/.test(text))) {
      setInputValue(text);
    }
  };

  /**
   * Submits the entered value and updates the grid
   *
   * @function handleValueSubmit
   * @param {string} [value=inputValue] - Value to submit (defaults to current input)
   * @returns {void}
   *
   * @example
   * handleValueSubmit('5'); // Submit digit 5 to selected cell
   * handleValueSubmit(''); // Clear the selected cell
   */
  const handleValueSubmit = (value = inputValue) => {
    if (value === '' || (value >= '0' && value <= '9')) {
      updateCellValue(selectedCell, value === '' ? null : parseInt(value), value !== '');
      closeModal();
    } else {
      Alert.alert('Invalid Input', 'Please enter a digit from 0 to 9');
    }
  };

  /**
   * Clears the selected cell value
   *
   * @function handleClearCell
   * @returns {void}
   */
  const handleClearCell = () => {
    updateCellValue(selectedCell, null, false);
    closeModal();
  };

  /**
   * Closes the input modal with platform-specific keyboard handling
   *
   * @function closeModal
   * @returns {void}
   */
  const closeModal = () => {
    // Force keyboard dismissal on Android
    if (Platform.OS === 'android') {
      Keyboard.dismiss();
      // Small delay to ensure keyboard is dismissed before closing modal
      setTimeout(() => {
        setModalVisible(false);
        setSelectedCell(null);
        setInputValue('');
      }, 50);
    } else {
      Keyboard.dismiss();
      setModalVisible(false);
      setSelectedCell(null);
      setInputValue('');
    }
  };

  /**
   * Handles keyboard submit event
   *
   * @function handleKeyboardSubmit
   * @returns {void}
   */
  const handleKeyboardSubmit = () => {
    handleValueSubmit();
  };

  /**
   * Handles modal request close (Android back button)
   *
   * @function handleModalRequestClose
   * @returns {void}
   */
  const handleModalRequestClose = () => {
    closeModal();
  };

  /**
   * Renders a single grid cell with proper styling and interaction
   *
   * @function renderCell
   * @param {Object} cell - Cell data object
   * @param {number} index - Cell index in the grid array
   * @returns {React.ReactElement} Rendered cell component
   *
   * @example
   * const cell = { id: 0, color: 'red', value: 5, isPinDigit: true };
   * const cellElement = renderCell(cell, 0);
   */
  const renderCell = (cell, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;

    // Dynamic PIN cell style that adapts to theme
    const pinCellStyle =
      cell.isPinDigit && showPinHighlight
        ? {
            ...styles.pinCell,
            borderColor: isDarkMode ? '#FFFFFF' : '#333333',
          }
        : null;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.cell, { backgroundColor: getColorHex(cell.color) }, pinCellStyle]}
        onPress={() => handleCellPress(index)}
        disabled={!isEditable}
        activeOpacity={0.7}
        // Android-specific touch feedback
        android_ripple={{
          color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderless: false,
        }}
      >
        <Text style={[styles.cellText, cell.isPinDigit && showPinHighlight && styles.pinText]}>
          {showValues && cell.value !== null ? cell.value : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * Renders the quick number pad for digit selection
   *
   * @function renderQuickNumberPad
   * @returns {React.ReactElement} Number pad component
   */
  const renderQuickNumberPad = () => {
    /**
     * Handles number pad button press with auto-submit
     *
     * @function handleNumberPress
     * @param {number} digit - Selected digit (0-9)
     * @returns {void}
     */
    const handleNumberPress = digit => {
      setInputValue(digit.toString());
      setTimeout(() => handleValueSubmit(digit.toString()), 300);
    };

    return (
      <View style={styles.quickNumberPad}>
        {/* First row: 1, 2, 3 */}
        <View style={styles.numberRow}>
          {[1, 2, 3].map(digit => (
            <TouchableOpacity
              key={digit}
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleNumberPress(digit)}
              activeOpacity={0.7}
              android_ripple={{
                color: 'rgba(255,255,255,0.2)',
                borderless: false,
              }}
            >
              <Text style={styles.quickButtonText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Second row: 4, 5, 6 */}
        <View style={styles.numberRow}>
          {[4, 5, 6].map(digit => (
            <TouchableOpacity
              key={digit}
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleNumberPress(digit)}
              activeOpacity={0.7}
              android_ripple={{
                color: 'rgba(255,255,255,0.2)',
                borderless: false,
              }}
            >
              <Text style={styles.quickButtonText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Third row: 7, 8, 9 */}
        <View style={styles.numberRow}>
          {[7, 8, 9].map(digit => (
            <TouchableOpacity
              key={digit}
              style={[styles.quickButton, { backgroundColor: theme.primary }]}
              onPress={() => handleNumberPress(digit)}
              activeOpacity={0.7}
              android_ripple={{
                color: 'rgba(255,255,255,0.2)',
                borderless: false,
              }}
            >
              <Text style={styles.quickButtonText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fourth row: Clear, 0, OK */}
        <View style={styles.numberRow}>
          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.textSecondary }]}
            onPress={handleClearCell}
            activeOpacity={0.7}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: false,
            }}
          >
            <Text style={styles.quickButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.primary }]}
            onPress={() => handleNumberPress(0)}
            activeOpacity={0.7}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: false,
            }}
          >
            <Text style={styles.quickButtonText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.success }]}
            onPress={() => handleValueSubmit()}
            activeOpacity={0.7}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: false,
            }}
          >
            <Text style={styles.quickButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>{grid.map((cell, index) => renderCell(cell, index))}</View>

      {/* Digit Input Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalRequestClose}
        hardwareAccelerated={true}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.modal.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Enter Digit for {grid[selectedCell]?.color} Cell
            </Text>

            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={inputValue}
              onChangeText={handleValueChange}
              placeholder="0-9 or leave empty"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={1}
              showSoftInputOnFocus={false}
              disableFullscreenUI={true}
              underlineColorAndroid="transparent"
              onSubmitEditing={handleKeyboardSubmit}
            />

            {renderQuickNumberPad()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * PropTypes for PinGrid component
 */
PinGrid.propTypes = {
  /** Array of 40 grid cell objects with id, color, value, and isPinDigit properties */
  grid: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      color: PropTypes.oneOf(['red', 'blue', 'green', 'yellow']).isRequired,
      value: PropTypes.number,
      isPinDigit: PropTypes.bool.isRequired,
    })
  ).isRequired,

  /** Callback function called when grid is updated with new grid array */
  onGridUpdate: PropTypes.func.isRequired,

  /** Whether grid cells can be edited by tapping */
  isEditable: PropTypes.bool,

  /** Whether to display cell values (digits) */
  showValues: PropTypes.bool,

  /** Whether to highlight PIN cells with special border */
  showPinHighlight: PropTypes.bool,
};

/**
 * Default props for PinGrid component
 */
PinGrid.defaultProps = {
  isEditable: true,
  showValues: true,
  showPinHighlight: true,
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: Math.min(width - 40, 320),
    aspectRatio: 8 / 5,
  },
  cell: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  pinCell: {
    borderWidth: 3,
    borderStyle: 'solid',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  pinText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    borderRadius: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  quickNumberPad: {
    width: '100%',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quickButton: {
    flex: 1,
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  quickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PinGrid;
