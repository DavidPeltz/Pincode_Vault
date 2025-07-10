import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  InteractionManager
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PinGrid = ({ grid, onGridUpdate, isEditable = true, showValues = true, showPinHighlight = true }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (modalVisible) {
      console.log('Modal opened, attempting to focus input');
      
      // Use InteractionManager to ensure all interactions are complete
      const interaction = InteractionManager.runAfterInteractions(() => {
        console.log('Running after interactions');
        inputRef.current?.focus();
      });

      // Backup focus attempts with different timings
      const timers = [
        setTimeout(() => {
          console.log('Focus attempt 1');
          inputRef.current?.focus();
        }, 100),
        setTimeout(() => {
          console.log('Focus attempt 2');
          inputRef.current?.focus();
        }, 300),
        setTimeout(() => {
          console.log('Focus attempt 3');
          inputRef.current?.focus();
        }, 500)
      ];
      
      return () => {
        interaction.cancel();
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [modalVisible]);

  const getColorHex = (color) => {
    const colors = {
      red: '#FF0000',    // Pure red (255, 0, 0)
      green: '#00FF00',  // Pure green (0, 255, 0)
      blue: '#0000FF',   // Pure blue (0, 0, 255)
      yellow: '#FFFF00'  // Pure yellow (255, 255, 0)
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
      closeModal();
    } else {
      Alert.alert('Invalid Input', 'Please enter a digit from 0 to 9');
    }
  };

  const closeModal = () => {
    inputRef.current?.blur(); // Dismiss keyboard
    setModalVisible(false);
    setSelectedCell(null);
    setInputValue('');
  };

  const handleKeyboardSubmit = () => {
    console.log('Keyboard submit pressed');
    handleValueSubmit();
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
          cell.isPinDigit && showPinHighlight && styles.pinCell
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
        presentationStyle="overFullScreen"
        supportedOrientations={['portrait', 'landscape']}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when tapping on content
          >
            <Text style={styles.modalTitle}>Enter Digit (0-9)</Text>
            <TouchableOpacity
              style={styles.keyboardHint}
              onPress={() => {
                console.log('Manual focus triggered');
                inputRef.current?.focus();
              }}
            >
              <Text style={styles.keyboardHintText}>
                💡 Tap here if keyboard doesn't appear
              </Text>
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              maxLength={1}
              placeholder="0-9 or leave empty"
              autoFocus={true}
              returnKeyType="done"
              enablesReturnKeyAutomatically={true}
              onSubmitEditing={handleKeyboardSubmit}
              blurOnSubmit={false}
              selectTextOnFocus={true}
              caretHidden={false}
              autoCorrect={false}
              autoCapitalize="none"
              contextMenuHidden={true}
              onFocus={() => console.log('Input focused')}
              onBlur={() => console.log('Input blurred')}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeModal}
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
          </TouchableOpacity>
        </TouchableOpacity>
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
    marginBottom: 15,
  },
  keyboardHint: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  keyboardHintText: {
    fontSize: 12,
    color: '#1976D2',
    textAlign: 'center',
    fontStyle: 'italic',
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