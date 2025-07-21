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
  BackHandler
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

  // Auto-focus input when modal opens (Android optimization)
  useEffect(() => {
    if (modalVisible && inputRef.current) {
      // Longer delay for Android to ensure modal is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, Platform.OS === 'android' ? 250 : 100);
      return () => clearTimeout(timer);
    }
  }, [modalVisible]);

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

  const handleCellPress = (cellIndex) => {
    if (!isEditable) return;
    
    // Dismiss any existing keyboard first (Android optimization)
    Keyboard.dismiss();
    
    setSelectedCell(cellIndex);
    setInputValue(grid[cellIndex].value?.toString() || '');
    setModalVisible(true);
  };

  const updateCellValue = (cellIndex, value, isPinDigit) => {
    const updatedGrid = [...grid];
    updatedGrid[cellIndex] = {
      ...updatedGrid[cellIndex],
      value: value,
      isPinDigit: isPinDigit
    };
    onGridUpdate(updatedGrid);
  };

  const handleValueChange = (text) => {
    // Only allow single digits
    if (text === '' || (text.length === 1 && /^[0-9]$/.test(text))) {
      setInputValue(text);
      
      // Auto-submit when a digit is entered (streamlined UX)
      // Shorter delay on Android for faster feel
      if (text.length === 1 && /^[0-9]$/.test(text)) {
        setTimeout(() => {
          handleValueSubmit(text);
        }, Platform.OS === 'android' ? 150 : 200);
      }
    }
  };

  const handleValueSubmit = (value = inputValue) => {
    if (value === '' || (value >= '0' && value <= '9')) {
      updateCellValue(
        selectedCell, 
        value === '' ? null : parseInt(value),
        value !== ''
      );
      closeModal();
    } else {
      Alert.alert('Invalid Input', 'Please enter a digit from 0 to 9');
    }
  };

  const handleClearCell = () => {
    updateCellValue(selectedCell, null, false);
    closeModal();
  };

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

  const handleKeyboardSubmit = () => {
    handleValueSubmit();
  };

  // Handle hardware back button on Android
  const handleModalRequestClose = () => {
    closeModal();
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
        activeOpacity={0.7}
        // Android-specific touch feedback
        android_ripple={{
          color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderless: false
        }}
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

  // Render number pad for quick access (Android-optimized)
  const renderQuickNumberPad = () => (
    <View style={styles.quickNumberPad}>
      {/* First row: 1, 2, 3 */}
      <View style={styles.numberRow}>
        {[1, 2, 3].map((digit) => (
          <TouchableOpacity
            key={digit}
            style={[styles.quickButton, { backgroundColor: theme.primary }]}
            onPress={() => handleValueSubmit(digit.toString())}
            activeOpacity={0.7}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: false
            }}
          >
            <Text style={styles.quickButtonText}>{digit}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Second row: 4, 5, 6 */}
      <View style={styles.numberRow}>
        {[4, 5, 6].map((digit) => (
          <TouchableOpacity
            key={digit}
            style={[styles.quickButton, { backgroundColor: theme.primary }]}
            onPress={() => handleValueSubmit(digit.toString())}
            activeOpacity={0.7}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: false
            }}
          >
            <Text style={styles.quickButtonText}>{digit}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Third row: 7, 8, 9 */}
      <View style={styles.numberRow}>
        {[7, 8, 9].map((digit) => (
          <TouchableOpacity
            key={digit}
            style={[styles.quickButton, { backgroundColor: theme.primary }]}
            onPress={() => handleValueSubmit(digit.toString())}
            activeOpacity={0.7}
            android_ripple={{
              color: 'rgba(255,255,255,0.2)',
              borderless: false
            }}
          >
            <Text style={styles.quickButtonText}>{digit}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Fourth row: 0 and Clear */}
      <View style={styles.numberRow}>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.primary }]}
          onPress={() => handleValueSubmit('0')}
          activeOpacity={0.7}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: false
          }}
        >
          <Text style={styles.quickButtonText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.warning }]}
          onPress={() => handleClearCell()}
          activeOpacity={0.7}
          android_ripple={{
            color: 'rgba(255,255,255,0.2)',
            borderless: false
          }}
        >
          <Text style={styles.quickButtonText}>✕</Text>
        </TouchableOpacity>
        {/* Empty space for symmetry */}
        <View style={styles.quickButton} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((cell, index) => renderCell(cell, index))}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalRequestClose}
        hardwareAccelerated={true} // Android optimization
        statusBarTranslucent={true} // Android optimization
      >
        <TouchableOpacity 
          style={[styles.modalContainer, { backgroundColor: theme.modal.overlay }]}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity 
            style={[styles.modalContent, { backgroundColor: theme.modal.background }]}
            activeOpacity={1}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>Enter Digit (0-9)</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { 
                  backgroundColor: theme.surface, 
                  color: theme.text, 
                  borderColor: theme.primary 
                }]}
                value={inputValue}
                onChangeText={handleValueChange}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="0-9"
                placeholderTextColor={theme.textSecondary}
                returnKeyType="done"
                onSubmitEditing={handleKeyboardSubmit}
                selectTextOnFocus={true}
                autoCorrect={false}
                autoCapitalize="none"
                blurOnSubmit={true}
                // Android-specific optimizations
                underlineColorAndroid="transparent"
                disableFullscreenUI={true}
                showSoftInputOnFocus={true}
              />
            </View>
            
            <Text style={[styles.instruction, { color: theme.textSecondary }]}>
              Type digit or tap number below • Auto-submits when entered
            </Text>
            
            {/* Quick number pad for visual input */}
            {renderQuickNumberPad()}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.warning }]}
                onPress={handleClearCell}
                android_ripple={{
                  color: 'rgba(255,255,255,0.2)',
                  borderless: false
                }}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.error }]}
                onPress={closeModal}
                android_ripple={{
                  color: 'rgba(255,255,255,0.2)',
                  borderless: false
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
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
    padding: 25,
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
  instruction: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    height: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickNumberPad: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    minWidth: 200,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 12,
  },
  quickButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 10,
    marginTop: 10,
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