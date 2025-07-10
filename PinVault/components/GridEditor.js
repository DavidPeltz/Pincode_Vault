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

const GridEditor = ({ navigation, route }) => {
  const [grid, setGrid] = useState([]);
  const [cardName, setCardName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasEnteredPin, setHasEnteredPin] = useState(false);

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

  const getPinDigits = () => {
    return grid
      .filter(cell => cell.isPinDigit)
      .sort((a, b) => a.id - b.id)
      .map(cell => cell.value)
      .join('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Grid' : 'Create New Grid'}
          </Text>
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.label}>Card Name:</Text>
          <TextInput
            style={styles.nameInput}
            value={cardName}
            onChangeText={setCardName}
            placeholder="Enter card name (e.g., Chase Credit Card)"
            maxLength={50}
          />
        </View>

        {hasEnteredPin && (
          <View style={styles.pinPreview}>
            <Text style={styles.pinLabel}>Your PIN: {getPinDigits()}</Text>
          </View>
        )}

        <PinGrid
          grid={grid}
          onGridUpdate={handleGridUpdate}
          isEditable={true}
          showValues={true}
        />

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            1. Tap colored cells to enter your PIN digits (0-9)
          </Text>
          <Text style={styles.instructionText}>
            2. Fill remaining cells with random digits for security
          </Text>
          <Text style={styles.instructionText}>
            3. Save your grid with a memorable name
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.newGridButton]}
            onPress={handleNewGrid}
          >
            <Text style={styles.buttonText}>New Random Grid</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.fillButton,
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
              styles.saveButton,
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
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
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