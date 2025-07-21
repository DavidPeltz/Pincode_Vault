import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  SafeAreaView,
  Keyboard,
  Platform
} from 'react-native';
import PinGrid from './PinGrid';
import { generateRandomGrid, fillEmptyCells, saveGrid } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigationBarHeight } from '../hooks/useNavigationBarHeight';

const GridEditor = ({ navigation, route }) => {
  const [grid, setGrid] = useState([]);
  const [cardName, setCardName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasEnteredPin, setHasEnteredPin] = useState(false);

  const { theme } = useTheme();
  const { safeBottomPadding } = useNavigationBarHeight();
  const cardNameInputRef = useRef(null);

  useEffect(() => {
    if (route.params?.gridData) {
      // Editing existing grid
      const { gridData } = route.params;
      setGrid(gridData.grid);
      setCardName(gridData.name);
      setIsEditing(true);
      setHasEnteredPin(gridData.grid.some(cell => cell.isPinDigit));
    } else {
      // Creating new grid
      setGrid(generateRandomGrid());
    }
  }, [route.params]);

  const handleGridUpdate = (updatedGrid) => {
    setGrid(updatedGrid);
    setHasEnteredPin(updatedGrid.some(cell => cell.isPinDigit));
  };

  const handleCardNameSubmit = () => {
    // Dismiss keyboard when user finishes entering card name
    Keyboard.dismiss();
  };

  const handleCardNameFocus = () => {
    // Ensure we're using the text keyboard for card names
    cardNameInputRef.current?.focus();
  };

  const handleFillRandomDigits = () => {
    if (!hasEnteredPin) {
      Alert.alert('No PIN Entered', 'Please enter your PIN digits first before filling random digits.');
      return;
    }

    Alert.alert(
      'Fill Random Digits',
      'This will fill all empty cells with random digits. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Fill',
          onPress: () => {
            const filledGrid = fillEmptyCells(grid);
            setGrid(filledGrid);
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!cardName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this card.');
      return;
    }

    if (!hasEnteredPin) {
      Alert.alert('No PIN Entered', 'Please enter your PIN digits before saving.');
      return;
    }

    const gridData = {
      id: route.params?.gridData?.id || Date.now().toString(),
      name: cardName.trim(),
      grid: grid,
      createdAt: route.params?.gridData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const success = await saveGrid(gridData);
    if (success) {
      Alert.alert(
        'Success',
        `Grid saved successfully as "${cardName}"`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', 'Failed to save grid. Please try again.');
    }
  };

  const handleNewGrid = () => {
    Alert.alert(
      'New Grid',
      'Create a new random grid? This will lose current progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create New',
          onPress: () => {
            setGrid(generateRandomGrid());
            setHasEnteredPin(false);
          }
        }
      ]
    );
  };

  const handleClearGrid = () => {
    Alert.alert(
      'Clear Grid',
      'Clear all digits from the grid? This will remove both PIN digits and random digits.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            const clearedGrid = grid.map(cell => ({
              ...cell,
              value: null,
              isPinDigit: false
            }));
            setGrid(clearedGrid);
            setHasEnteredPin(false);
          }
        }
      ]
    );
  };

  const getPinDigits = () => {
    return grid
      .filter(cell => cell.isPinDigit)
      .sort((a, b) => a.id - b.id)
      .map(cell => cell.value)
      .join('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, paddingBottom: safeBottomPadding }]}>
      <TouchableOpacity 
        style={styles.content}
        activeOpacity={1}
        onPress={() => {
          // Dismiss keyboard when user touches anywhere outside input fields
          Keyboard.dismiss();
        }}
      >
        
        {/* Top Section: Card Name and PIN Preview */}
        <View style={styles.topSection}>
          <View style={styles.nameContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Card Name:</Text>
            <TextInput
              ref={cardNameInputRef}
              style={[styles.nameInput, { 
                backgroundColor: theme.surface, 
                color: theme.text, 
                borderColor: theme.border,
                placeholderTextColor: theme.textSecondary
              }]}
              value={cardName}
              onChangeText={setCardName}
              placeholder="Enter card name"
              placeholderTextColor={theme.textSecondary}
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleCardNameSubmit}
              onFocus={handleCardNameFocus}
              autoCorrect={true}
              autoCapitalize="words"
              keyboardType="default"
              blurOnSubmit={true}
              // Android-specific optimizations
              underlineColorAndroid="transparent"
              disableFullscreenUI={Platform.OS === 'android'}
            />
          </View>

          {hasEnteredPin && (
            <View style={[styles.pinPreview, { backgroundColor: theme.surface }]}>
              <Text style={[styles.pinLabel, { color: theme.primary }]}>Your PIN: {getPinDigits()}</Text>
            </View>
          )}
        </View>



        {/* Action Buttons Row */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonThird,
              { backgroundColor: !hasEnteredPin ? theme.textSecondary : theme.orange },
              !hasEnteredPin && styles.disabledButton
            ]}
            onPress={handleFillRandomDigits}
            disabled={!hasEnteredPin}
          >
            <Text style={styles.buttonText}>Fill Random</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonThird, { backgroundColor: theme.purple }]}
            onPress={handleNewGrid}
          >
            <Text style={styles.buttonText}>New Grid</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonThird, { backgroundColor: theme.danger }]}
            onPress={handleClearGrid}
          >
            <Text style={styles.buttonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Grid Section */}
        <TouchableOpacity 
          style={styles.gridSection}
          activeOpacity={1}
          onPress={() => {
            // Dismiss keyboard when user touches grid area
            Keyboard.dismiss();
          }}
        >
          <PinGrid
            grid={grid}
            onGridUpdate={handleGridUpdate}
            isEditable={true}
            showValues={true}
          />
        </TouchableOpacity>

        {/* Detailed Instructions */}
        <View style={[styles.compactInstructions, { backgroundColor: theme.surface }]}>
          <Text style={[styles.instructionTitle, { color: theme.text }]}>How to Create Your PIN Grid:</Text>
          <Text style={[styles.instructionStep, { color: theme.textSecondary }]}>
            1. <Text style={{ fontWeight: 'bold' }}>Name your card</Text> in the field above
          </Text>
          <Text style={[styles.instructionStep, { color: theme.textSecondary }]}>
            2. <Text style={{ fontWeight: 'bold' }}>Tap grid cells</Text> to enter your PIN digits
          </Text>
          <Text style={[styles.instructionStep, { color: theme.textSecondary }]}>
            3. <Text style={{ fontWeight: 'bold' }}>Tap numbers</Text> in the popup to select digits
          </Text>
          <Text style={[styles.instructionStep, { color: theme.textSecondary }]}>
            4. <Text style={{ fontWeight: 'bold' }}>Fill Random</Text> to add decoy digits
          </Text>
          <Text style={[styles.instructionStep, { color: theme.textSecondary }]}>
            5. <Text style={{ fontWeight: 'bold' }}>Save Grid</Text> to store your PIN card securely
          </Text>
          <Text style={[styles.betaIndicator, { color: theme.warning }]}>
            🧪 v1.5 Beta - Enhanced Input Experience
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: (!hasEnteredPin || !cardName.trim()) ? theme.textSecondary : theme.green },
            (!hasEnteredPin || !cardName.trim()) && styles.disabledButton
          ]}
          onPress={handleSave}
          disabled={!hasEnteredPin || !cardName.trim()}
        >
          <Text style={styles.saveButtonText}>Save Grid</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topSection: {
    marginBottom: 12,
  },
  nameContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 45,
  },
  pinPreview: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  gridSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 12,
  },
  compactInstructions: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: 12,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  betaIndicator: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonThird: {
    flex: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GridEditor;