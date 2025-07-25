import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import PropTypes from 'prop-types';
import { useTheme } from '../../contexts/ThemeContext';
import PinGrid from '../PinGrid';

const { width } = Dimensions.get('window');

/**
 * Individual grid card component for the gallery
 * @param {Object} props
 * @param {Object} props.item - Grid item data
 * @param {number} props.index - Grid index
 * @param {Function} props.onEdit - Callback when edit is pressed
 * @param {Function} props.onDelete - Callback when delete is pressed
 * @param {Function} props.formatDate - Date formatting function
 */
export default function GridCard({ item, index, onEdit, onDelete, formatDate }) {
  const { theme } = useTheme();

  const extractPinFromGrid = () => {
    if (!item.grid) {
      return '';
    }
    return item.grid
      .filter(cell => cell.isPinDigit)
      .map(cell => cell.value)
      .join('');
  };

  const handleEdit = () => {
    onEdit(item);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Grid',
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(item),
        },
      ]
    );
  };

  return (
    <View style={[styles.gridItem, { backgroundColor: theme.surface }]}>
      {/* Header with name and actions */}
      <View style={styles.gridHeader}>
        <View style={styles.gridTitleContainer}>
          <Text style={[styles.gridName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.gridDate, { color: theme.textSecondary }]}>
            Created: {formatDate(item.createdAt)}
          </Text>
        </View>

        <View style={styles.gridActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={handleEdit}
          >
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.danger }]}
            onPress={handleDelete}
          >
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PIN Display */}
      <View style={[styles.pinContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.pinLabel, { color: theme.textSecondary }]}>Your PIN:</Text>
        <Text style={[styles.pinValue, { color: theme.primary }]}>
          {extractPinFromGrid() || 'No PIN set'}
        </Text>
      </View>

      {/* Grid Display */}
      <View style={styles.gridContainer}>
        <PinGrid
          grid={item.grid}
          onGridUpdate={() => {}} // Read-only in gallery
          isEditable={false}
          showValues={true}
          showPinHighlight={true}
        />
      </View>

      {/* Grid Index Indicator */}
      <View style={styles.gridFooter}>
        <Text style={[styles.gridIndex, { color: theme.textSecondary }]}>Grid {index + 1}</Text>
      </View>
    </View>
  );
}

/**
 * PropTypes for GridCard component
 */
GridCard.propTypes = {
  /** Grid item data object containing grid information */
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    grid: PropTypes.array.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
  }).isRequired,

  /** Grid index number for display */
  index: PropTypes.number.isRequired,

  /** Callback function called when edit button is pressed */
  onEdit: PropTypes.func.isRequired,

  /** Callback function called when delete button is pressed */
  onDelete: PropTypes.func.isRequired,

  /** Function to format date strings for display */
  formatDate: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  gridItem: {
    width,
    padding: 20,
    paddingBottom: 30,
  },
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  gridTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  gridName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gridDate: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  gridActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionText: {
    fontSize: 18,
    color: 'white',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 5,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pinValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 3,
  },
  gridContainer: {
    marginBottom: 15,
  },
  gridFooter: {
    alignItems: 'center',
    paddingTop: 10,
  },
  gridIndex: {
    fontSize: 14,
    fontWeight: '500',
  },
});
