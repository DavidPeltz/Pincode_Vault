import React, { useState, useEffect } from 'react';
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

const { width, height } = Dimensions.get('window');

const PinGrid = ({ grid, onGridUpdate, isEditable = true, showValues = true }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const getColorHex = (color) => {
    const colors = {
      red: '#FF6B6B',
      blue: '#4ECDC4',
      green: '#45B7D1',
      yellow: '#FFA07A'
    };
    return colors[color] || '#CCCCCC';
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
      setModalVisible(false);
      setSelectedCell(null);
      setInputValue('');
    } else {
      Alert.alert('Invalid Input', 'Please enter a digit from 0 to 9');
    }
  };

  const renderCell = (cell, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          { backgroundColor: getColorHex(cell.color) },
          cell.isPinDigit && styles.pinCell
        ]}
        onPress={() => handleCellPress(index)}
        disabled={!isEditable}
      >
        <Text style={[
          styles.cellText,
          cell.isPinDigit && styles.pinText
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Digit (0-9)</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              maxLength={1}
              placeholder="0-9 or leave empty"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
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
    borderColor: '#333',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    width: 80,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PinGrid;