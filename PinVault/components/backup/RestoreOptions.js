import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Component for selecting restore options
 * @param {Object} props
 * @param {Object} props.options - Current restore options
 * @param {Function} props.onOptionsChange - Callback when options change
 */
export default function RestoreOptions({ options, onOptionsChange }) {
  const { theme } = useTheme();

  const updateOption = (key, value) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const OptionToggle = ({ title, description, value, onToggle, warningText }) => (
    <View style={[styles.optionContainer, { borderColor: theme.border }]}>
      <View style={styles.optionHeader}>
        <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            { 
              backgroundColor: value ? theme.primary : theme.textSecondary,
              borderColor: value ? theme.primary : theme.border,
            }
          ]}
          onPress={() => onToggle(!value)}
        >
          <Text style={styles.toggleText}>{value ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
        {description}
      </Text>
      
      {value && warningText && (
        <View style={[styles.warningContainer, { backgroundColor: theme.warning + '20', borderColor: theme.warning }]}>
          <Text style={[styles.warningText, { color: theme.warning }]}>
            ⚠️ {warningText}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>⚙️ Restore Options</Text>
      
      <OptionToggle
        title="Replace All Grids"
        description="Clear all existing grids before restoring. This will permanently delete your current grids."
        value={options.replaceAll}
        onToggle={(value) => updateOption('replaceAll', value)}
        warningText="This will delete all your current grids permanently!"
      />

      <OptionToggle
        title="Overwrite Existing"
        description="Replace grids that have the same name as ones being restored. If disabled, duplicate names will be skipped."
        value={options.overwriteExisting}
        onToggle={(value) => updateOption('overwriteExisting', value)}
        warningText="Grids with matching names will be replaced."
      />

      <View style={[styles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          💡 <Text style={{ fontWeight: 'bold' }}>Tip:</Text> If you're unsure, keep both options OFF to safely merge 
          your backup with existing grids without losing any data.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  warningContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});