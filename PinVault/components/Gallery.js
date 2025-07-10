import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PinGrid from './PinGrid';
import { getGrids, deleteGrid } from '../utils/storage';

const { width } = Dimensions.get('window');

const Gallery = ({ navigation }) => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadGrids();
    }, [])
  );

  const loadGrids = async () => {
    setLoading(true);
    try {
      const gridData = await getGrids();
      const gridArray = Object.values(gridData).sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setGrids(gridArray);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading grids:', error);
      Alert.alert('Error', 'Failed to load saved grids.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gridData) => {
    navigation.navigate('GridEditor', { gridData });
  };

  const handleDelete = (gridData) => {
    Alert.alert(
      'Delete Grid',
      `Are you sure you want to delete "${gridData.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteGrid(gridData.id);
            if (success) {
              loadGrids();
              Alert.alert('Success', 'Grid deleted successfully.');
            } else {
              Alert.alert('Error', 'Failed to delete grid.');
            }
          }
        }
      ]
    );
  };

  const renderGridItem = ({ item, index }) => {
    const getPinDigits = () => {
      return item.grid
        .filter(cell => cell.isPinDigit)
        .sort((a, b) => a.id - b.id)
        .map(cell => cell.value)
        .join('');
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <View style={styles.gridCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDate}>
            Updated: {formatDate(item.updatedAt)}
          </Text>
        </View>

        <View style={styles.pinDisplay}>
          <Text style={styles.pinLabel}>Your PIN:</Text>
          <Text style={styles.pinValue}>{getPinDigits()}</Text>
        </View>

        <PinGrid
          grid={item.grid}
          onGridUpdate={() => {}} // Read-only in gallery
          isEditable={false}
          showValues={true}
        />

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading your grids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (grids.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No PIN Grids Found</Text>
          <Text style={styles.emptyMessage}>
            Create your first PIN grid to securely store your card PINs.
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('GridEditor')}
          >
            <Text style={styles.createButtonText}>Create First Grid</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PIN Vault Gallery</Text>
        <Text style={styles.subtitle}>
          {grids.length} saved grid{grids.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={grids}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContainer}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />

      <View style={styles.pagination}>
        {grids.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.activeDot
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate('GridEditor')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  flatListContainer: {
    paddingVertical: 20,
  },
  gridCard: {
    width: width,
    paddingHorizontal: 20,
  },
  cardHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  pinDisplay: {
    backgroundColor: '#E8F4F8',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 5,
  },
  pinValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3498DB',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BDC3C7',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3498DB',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default Gallery;