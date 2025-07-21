import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch
} from 'react-native';
import PinGrid from './PinGrid';
import { generateRandomGrid } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const InputDemo = () => {
  const [demoGrid, setDemoGrid] = useState(generateRandomGrid());
  const [useInlineInput, setUseInlineInput] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [lastInputMethod, setLastInputMethod] = useState('');
  const { theme } = useTheme();

  const handleGridUpdate = (updatedGrid) => {
    setDemoGrid(updatedGrid);
    setTouchCount(prev => prev + 1);
    setLastInputMethod(useInlineInput ? 'Inline Picker' : 'Auto-Submit Keyboard');
  };

  const resetDemo = () => {
    setDemoGrid(generateRandomGrid());
    setTouchCount(0);
    setLastInputMethod('');
  };

  const getInputMethodDescription = () => {
    if (useInlineInput) {
      return {
        title: 'Inline Picker Mode',
        description: 'Tap cell → Select from menu (2 touches)',
        benefits: ['Fastest for single digits', 'No keyboard needed', 'Works offline', 'No typing required']
      };
    } else {
      return {
        title: 'Auto-Submit Keyboard Mode', 
        description: 'Tap cell → Type digit → Auto-submits (2 touches + typing)',
        benefits: ['Natural typing feel', 'Auto-focus on open', 'Auto-submit on digit entry', 'Improved keyboard management']
      };
    }
  };

  const methodInfo = getInputMethodDescription();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Input Method Demo</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Test the improved input methods for PIN entry
          </Text>
        </View>

        {/* Method Selector */}
        <View style={[styles.methodSelector, { backgroundColor: theme.surface }]}>
          <Text style={[styles.methodTitle, { color: theme.text }]}>{methodInfo.title}</Text>
          <Text style={[styles.methodDescription, { color: theme.textSecondary }]}>
            {methodInfo.description}
          </Text>
          
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>
              {useInlineInput ? 'Picker Mode' : 'Keyboard Mode'}
            </Text>
            <Switch
              value={useInlineInput}
              onValueChange={setUseInlineInput}
              trackColor={{ false: theme.textSecondary, true: theme.primary }}
              thumbColor={useInlineInput ? theme.success : theme.background}
            />
          </View>
        </View>

        {/* Benefits */}
        <View style={[styles.benefitsSection, { backgroundColor: theme.surface }]}>
          <Text style={[styles.benefitsTitle, { color: theme.primary }]}>Benefits:</Text>
          {methodInfo.benefits.map((benefit, index) => (
            <Text key={index} style={[styles.benefit, { color: theme.textSecondary }]}>
              • {benefit}
            </Text>
          ))}
        </View>

        {/* Stats */}
        <View style={[styles.stats, { backgroundColor: theme.surface }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: theme.primary }]}>{touchCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Touches</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statText, { color: theme.text }]}>{lastInputMethod || 'None'}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Last Method</Text>
          </View>
        </View>

        {/* Demo Grid */}
        <View style={styles.gridContainer}>
          <Text style={[styles.gridTitle, { color: theme.text }]}>Try entering digits in the grid below:</Text>
          <PinGrid
            grid={demoGrid}
            onGridUpdate={handleGridUpdate}
            isEditable={true}
            showValues={true}
            useInlineInput={useInlineInput}
          />
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: theme.surface }]}>
          <Text style={[styles.instructionsTitle, { color: theme.primary }]}>How to test:</Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            1. Choose an input method using the switch above
          </Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            2. Tap any cell in the grid to enter a digit
          </Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            3. Notice how the touch count increases with each interaction
          </Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            4. Try both modes to compare the user experience
          </Text>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: theme.primary }]}
          onPress={resetDemo}
        >
          <Text style={styles.resetButtonText}>Reset Demo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  methodSelector: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefit: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  gridContainer: {
    marginBottom: 20,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructions: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  resetButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InputDemo;