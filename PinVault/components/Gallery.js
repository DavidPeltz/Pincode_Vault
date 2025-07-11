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
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PinGrid from './PinGrid';
import { getGrids, deleteGrid } from '../utils/storage';
import { useAuth } from './AuthProvider';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import InfoButton from './InfoButton';

const { width } = Dimensions.get('window');

const Gallery = ({ navigation }) => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { authenticate, authenticationInProgress, biometricType, isAuthAvailable } = useAuth();
  const { theme } = useTheme();

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

  const handleEdit = async (gridData) => {
    if (!isAuthAvailable) {
      Alert.alert(
        'Authentication Required',
        'Device authentication (biometric or PIN/pattern) must be set up to edit PIN grids. Please configure device security in your system settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    const authReason = `Authenticate to edit "${gridData.name}"`;
    const authenticated = await authenticate(authReason);
    
    if (authenticated) {
      navigation.navigate('GridEditor', { gridData });
    }
  };

  const handleDelete = async (gridData) => {
    if (!isAuthAvailable) {
      Alert.alert(
        'Authentication Required',
        'Device authentication (biometric or PIN/pattern) must be set up to delete PIN grids. Please configure device security in your system settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    const authReason = `Authenticate to delete "${gridData.name}"`;
    const authenticated = await authenticate(authReason);
    
    if (!authenticated) {
      return; // User cancelled or authentication failed
    }

    // Show confirmation dialog only after successful authentication
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
          <View style={styles.gridContent}>
            <View style={[styles.cardHeader, { backgroundColor: theme.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.cardDate, { color: theme.textSecondary }]}>
                Updated: {formatDate(item.updatedAt)}
              </Text>
            </View>

          <PinGrid
            grid={item.grid}
            onGridUpdate={() => {}} // Read-only in gallery
            isEditable={false}
            showValues={true}
            showPinHighlight={false}
          />

                      <View style={styles.cardActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  { backgroundColor: theme.primary },
                  authenticationInProgress && styles.disabledButton
                ]}
                onPress={() => handleEdit(item)}
                disabled={authenticationInProgress}
              >
                {authenticationInProgress ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {isAuthAvailable ? `Edit (${biometricType})` : 'Edit'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  { backgroundColor: theme.danger },
                  authenticationInProgress && styles.disabledButton
                ]}
                onPress={() => handleDelete(item)}
                disabled={authenticationInProgress}
              >
                {authenticationInProgress ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {isAuthAvailable ? `Delete (${biometricType})` : 'Delete'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your grids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (grids.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <View style={styles.headerTop}>
            <InfoButton />
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: theme.text }]}>PIN Vault</Text>
            </View>
            <ThemeToggle />
          </View>
        </View>
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No PIN Grids Found</Text>
          <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
            Create your first PIN grid to securely store your card PINs.
          </Text>
          <TouchableOpacity
            style={[
              styles.createButton, 
              { backgroundColor: theme.primary },
              authenticationInProgress && styles.disabledButton
            ]}
            onPress={async () => {
              if (!isAuthAvailable) {
                Alert.alert(
                  'Authentication Required',
                  'Device authentication must be set up to create PIN grids.',
                  [{ text: 'OK' }]
                );
                return;
              }
              const authenticated = await authenticate('Authenticate to create a new PIN grid');
              if (authenticated) {
                navigation.navigate('GridEditor');
              }
            }}
            disabled={authenticationInProgress}
          >
            {authenticationInProgress ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.createButtonText}>
                Create First Grid {isAuthAvailable ? `(${biometricType})` : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View style={styles.headerTop}>
          <InfoButton />
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.text }]}>PIN Vault Gallery</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {grids.length} saved grid{grids.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <ThemeToggle />
        </View>
        <TouchableOpacity
          style={[styles.securityButton, { backgroundColor: theme.purple }]}
          onPress={() => navigation.navigate('SecurityInfo')}
        >
          <Text style={styles.securityButtonText}>🔐 Security Info</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={grids}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContainer}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
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
        style={[
          styles.fabButton, 
          { backgroundColor: theme.green },
          authenticationInProgress && styles.disabledButton
        ]}
        onPress={async () => {
          if (!isAuthAvailable) {
            Alert.alert(
              'Authentication Required',
              'Device authentication must be set up to create PIN grids.',
              [{ text: 'OK' }]
            );
            return;
          }
          const authenticated = await authenticate('Authenticate to create a new PIN grid');
          if (authenticated) {
            navigation.navigate('GridEditor');
          }
        }}
        disabled={authenticationInProgress}
      >
        {authenticationInProgress ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.fabText}>+</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  securityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  securityButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  createButton: {
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
    alignItems: 'center',
  },
  gridCard: {
    width: width,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    width: '100%',
    maxWidth: width * 0.9,
    alignItems: 'center',
  },
  cardHeader: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    width: '100%',
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
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
  },
    cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 15,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#95A5A6',
    opacity: 0.6,
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