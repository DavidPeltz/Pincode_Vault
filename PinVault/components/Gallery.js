import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getGrids, deleteGrid } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { useGridRefresh } from '../contexts/GridRefreshContext';
import { useNavigationBarHeight } from '../hooks/useNavigationBarHeight';
import { useAuth } from './AuthProvider';
import EmptyState from './gallery/EmptyState';
import GridCard from './gallery/GridCard';

const { width } = Dimensions.get('window');

const Gallery = ({ navigation }) => {
  const [grids, setGrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const swipeStartRef = useRef({ x: 0, time: 0 });
  const isCustomScrollingRef = useRef(false);
  const { authenticate, authenticationInProgress, biometricType, isAuthAvailable } = useAuth();
  const { theme } = useTheme();
  const { setGridRefreshCallback } = useGridRefresh();
  const { safeBottomPadding, isButtonNavigation } = useNavigationBarHeight();

  const updateCurrentIndex = useCallback(
    offset => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const newIndex = Math.round(offset / width);
        const clampedIndex = Math.max(0, Math.min(newIndex, grids.length - 1));
        setCurrentIndex(clampedIndex);
      }, 100);
    },
    [grids.length, width]
  );

  const handleSwipeStart = useCallback(event => {
    swipeStartRef.current = {
      x: event.nativeEvent.contentOffset.x,
      time: Date.now(),
    };
  }, []);

  const handleSwipeEnd = useCallback(
    event => {
      const endX = event.nativeEvent.contentOffset.x;
      const endTime = Date.now();
      const startX = swipeStartRef.current.x;
      const startTime = swipeStartRef.current.time;

      const distance = Math.abs(endX - startX);
      const timeElapsed = Math.max(1, endTime - startTime);
      const velocity = distance / timeElapsed;

      // Only handle very forceful swipes to ends - let paging handle normal scrolling
      if (velocity > 4.0 && distance > 250) {
        const direction = endX < startX ? 1 : -1;
        const targetIndex = direction > 0 ? grids.length - 1 : 0;

        if (flatListRef.current) {
          isCustomScrollingRef.current = true;
          flatListRef.current.scrollToOffset({
            offset: targetIndex * width,
            animated: true,
          });

          setTimeout(() => {
            setCurrentIndex(targetIndex);
            isCustomScrollingRef.current = false;
          }, 300);
        }
      }
      // Otherwise let pagingEnabled handle normal scrolling
    },
    [grids.length, width]
  );

  useFocusEffect(
    useCallback(() => {
      loadGrids();
    }, [])
  );

  // Register grid refresh callback with the context
  useEffect(() => {
    setGridRefreshCallback(() => loadGrids);
  }, [setGridRefreshCallback]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      isCustomScrollingRef.current = false;
    };
  }, []);

  const loadGrids = async () => {
    setLoading(true);
    try {
      const gridData = await getGrids();
      const gridArray = Object.values(gridData).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setGrids(gridArray);
      setCurrentIndex(0);
      // Ensure FlatList scrolls to the beginning when grids are loaded
      setTimeout(() => {
        if (flatListRef.current && gridArray.length > 0) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading grids:', error);
      Alert.alert('Error', 'Failed to load saved grids.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async gridData => {
    if (!isAuthAvailable) {
      Alert.alert(
        'Authentication Required',
        'Device authentication (PIN, Pattern, Password, Face ID, or Fingerprint) must be set up to edit PIN grids. Please configure device security in your system settings.',
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

  const handleDelete = async gridData => {
    if (!isAuthAvailable) {
      Alert.alert(
        'Authentication Required',
        'Device authentication (PIN, Pattern, Password, Face ID, or Fingerprint) must be set up to delete PIN grids. Please configure device security in your system settings.',
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
    Alert.alert('Delete Grid', `Are you sure you want to delete "${gridData.name}"?`, [
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
        },
      },
    ]);
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderGridItem = ({ item, index }) => (
    <GridCard
      item={item}
      index={index}
      onEdit={handleEdit}
      onDelete={handleDelete}
      formatDate={formatDate}
    />
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background, paddingBottom: safeBottomPadding },
        ]}
      >
        <View style={styles.centered}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your grids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (grids.length === 0) {
    return (
      <EmptyState
        onCreateNew={async () => {
          if (!isAuthAvailable) {
            Alert.alert(
              'Authentication Setup Required',
              'To create PIN grids, you must first set up device authentication (PIN, Pattern, Password, Face ID, or Fingerprint) in your device settings. Once configured, restart PIN Vault to begin.',
              [{ text: 'OK' }]
            );
            return;
          }
          const authenticated = await authenticate('Authenticate to create a new PIN grid');
          if (authenticated) {
            navigation.navigate('GridEditor');
          }
        }}
      />
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingBottom: safeBottomPadding },
      ]}
    >
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>PIN Vault Gallery</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {grids.length} saved grid{grids.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={grids}
        renderItem={renderGridItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={styles.flatListContainer}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollBeginDrag={handleSwipeStart}
        onScrollEndDrag={handleSwipeEnd}
        onMomentumScrollEnd={event => {
          if (!isCustomScrollingRef.current) {
            const position = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(position / width);
            const clampedIndex = Math.max(0, Math.min(newIndex, grids.length - 1));
            setCurrentIndex(clampedIndex);
          }
        }}
      />

      <View style={styles.pagination}>
        {grids.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, index === currentIndex && styles.activeDot]}
          />
        ))}
      </View>

      {/* Create New Grid Button */}
      <TouchableOpacity
        style={[
          styles.fabButton,
          { backgroundColor: isAuthAvailable ? theme.green : theme.textSecondary },
          (authenticationInProgress || !isAuthAvailable) && styles.disabledButton,
        ]}
        onPress={async () => {
          if (!isAuthAvailable) {
            Alert.alert(
              'Authentication Setup Required',
              'To create PIN grids, you must first set up device authentication (PIN, Pattern, Password, Face ID, or Fingerprint) in your device settings. Once configured, restart PIN Vault to begin.',
              [{ text: 'OK' }]
            );
            return;
          }
          const authenticated = await authenticate('Authenticate to create a new PIN grid');
          if (authenticated) {
            navigation.navigate('GridEditor');
          }
        }}
        disabled={authenticationInProgress || !isAuthAvailable}
      >
        {authenticationInProgress ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.fabText}>{isAuthAvailable ? '+' : '🔒'}</Text>
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
  centeredScrollable: {
    flexGrow: 1,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
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
  },
  gridCard: {
    width,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
  overviewSection: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  instructionsSection: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  authSetupSection: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  authMethodsList: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  authMethod: {
    fontSize: 16,
    marginBottom: 5,
  },
  authSetupNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default Gallery;
