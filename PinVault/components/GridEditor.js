import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  SafeAreaView
} from 'react-native';
import PinGrid from './PinGrid';
import { generateRandomGrid, fillEmptyCells, saveGrid } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const GridEditor = ({ navigation, route }) => {
  const [grid, setGrid] = useState([]);
  const [cardName, setCardName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasEnteredPin, setHasEnteredPin] = useState(false);
  const { theme } = useTheme();

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditing ? 'Edit Grid' : 'Create New Grid'}
            </Text>
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.nameContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Card Name:</Text>
          <TextInput
            style={[styles.nameInput, { 
              backgroundColor: theme.surface, 
              color: theme.text, 
              borderColor: theme.border,
              placeholderTextColor: theme.textSecondary
            }]}
            value={cardName}
            onChangeText={setCardName}
            placeholder="Enter card name (e.g., Chase Credit Card)"
            placeholderTextColor={theme.textSecondary}
            maxLength={50}
            multiline={true}
            numberOfLines={2}
          />
        </View>

        {hasEnteredPin && (
          <View style={[styles.pinPreview, { backgroundColor: theme.surface }]}>
            <Text style={[styles.pinLabel, { color: theme.primary }]}>Your PIN: {getPinDigits()}</Text>
          </View>
        )}

        <PinGrid
          grid={grid}
          onGridUpdate={handleGridUpdate}
          isEditable={true}
          showValues={true}
        />

        <View style={[styles.instructions, { backgroundColor: theme.surface }]}>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            1. Tap colored cells to enter your PIN digits (0-9)
          </Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            2. Fill remaining cells with random digits for security
          </Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            3. Save your grid with a memorable name
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.purple }]}
            onPress={handleNewGrid}
          >
            <Text style={styles.buttonText}>New Random Grid</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.danger }]}
            onPress={handleClearGrid}
          >
            <Text style={styles.buttonText}>Clear All Digits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: !hasEnteredPin ? theme.textSecondary : theme.orange },
              !hasEnteredPin && styles.disabledButton
            ]}
            onPress={handleFillRandomDigits}
            disabled={!hasEnteredPin}
          >
            <Text style={styles.buttonText}>Fill Random Digits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: (!hasEnteredPin || !cardName.trim()) ? theme.textSecondary : theme.green },
              (!hasEnteredPin || !cardName.trim()) && styles.disabledButton
            ]}
            onPress={handleSave}
            disabled={!hasEnteredPin || !cardName.trim()}
          >
            <Text style={styles.buttonText}>Save Grid</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  nameContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pinPreview: {
    backgroundColor: '#E8F4F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 2,
  },
  instructions: {
    backgroundColor: '#FFF9E6',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGridButton: {
    backgroundColor: '#9B59B6',
  },
  clearGridButton: {
    backgroundColor: '#E74C3C',
  },
  fillButton: {
    backgroundColor: '#F39C12',
  },
  saveButton: {
    backgroundColor: '#27AE60',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GridEditor;