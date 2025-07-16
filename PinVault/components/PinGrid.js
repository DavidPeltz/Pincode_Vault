import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

const PinGrid = ({ grid, onGridUpdate, isEditable = true, showValues = true, showPinHighlight = true }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const { theme, isDarkMode } = useTheme();

  const getColorHex = (color) => {
    return theme.gridColors[color] || '#CCCCCC';
  };

  const handleCellPress = (cellIndex) => {
    if (!isEditable) return;
    
    setSelectedCell(cellIndex);
    setInputValue(grid[cellIndex].value?.toString() || '');
    setModalVisible(true);
  };

  const handleValueSubmit = () => {
    if (inputValue === '' || (inputValue >= '0' && inputValue <= '9')) {
      const updatedGrid = [...grid];
      updatedGrid[selectedCell] = {
        ...updatedGrid[selectedCell],
        value: inputValue === '' ? null : parseInt(inputValue),
        isPinDigit: inputValue !== ''
      };
      onGridUpdate(updatedGrid);
      closeModal();
    } else {
      Alert.alert('Invalid Input', 'Please enter a digit from 0 to 9');
    }
  };

  const handleClearCell = () => {
    const updatedGrid = [...grid];
    updatedGrid[selectedCell] = {
      ...updatedGrid[selectedCell],
      value: null,
      isPinDigit: false
    };
    onGridUpdate(updatedGrid);
    closeModal();
  };

  const closeModal = () => {
    inputRef.current?.blur(); // Dismiss keyboard
    setModalVisible(false);
    setSelectedCell(null);
    setInputValue('');
  };

  const handleKeyboardSubmit = () => {
    handleValueSubmit();
  };

  const renderCell = (cell, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    
    // Dynamic PIN cell style that adapts to theme
    const pinCellStyle = cell.isPinDigit && showPinHighlight ? {
      ...styles.pinCell,
      borderColor: isDarkMode ? '#FFFFFF' : '#333333'
    } : null;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          { backgroundColor: getColorHex(cell.color) },
          pinCellStyle
        ]}
        onPress={() => handleCellPress(index)}
        disabled={!isEditable}
      >
        <Text style={[
          styles.cellText,
          cell.isPinDigit && showPinHighlight && styles.pinText
        ]}>
          {showValues && cell.value !== null ? cell.value : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((cell, index) => renderCell(cell, index))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.modal.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Enter Digit (0-9)</Text>
            
            <TouchableOpacity
              style={styles.inputTouchArea}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              <TextInput
                ref={inputRef}
                style={[styles.input, { 
                  backgroundColor: theme.surface, 
                  color: theme.text, 
                  borderColor: theme.primary 
                }]}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="Tap to enter"
                placeholderTextColor={theme.textSecondary}
                returnKeyType="done"
                onSubmitEditing={handleKeyboardSubmit}
                selectTextOnFocus={true}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </TouchableOpacity>
            
            <Text style={[styles.instruction, { color: theme.textSecondary }]}>
              Tap the input above to open keyboard and enter your PIN digit
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.warning }]}
                onPress={handleClearCell}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.error }]}
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.success }]}
                onPress={handleValueSubmit}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width * 0.9,
    aspectRatio: 8/5,
    justifyContent: 'space-between',
  },
  cell: {
    width: '11.5%',
    aspectRatio: 1,
    margin: '0.5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  pinCell: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cellText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pinText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.85,
    maxWidth: 400,
  },
  inputTouchArea: {
    width: '100%',
    marginVertical: 10,
  },
  instruction: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    height: 90,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 10,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    flex: 1,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PinGrid;