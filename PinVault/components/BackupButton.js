import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import BackupRestore from './BackupRestore';

export default function BackupButton({ onGridsUpdated }) {
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const { theme } = useTheme();

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.purple }]}
        onPress={() => setBackupModalVisible(true)}
      >
        <Text style={styles.icon}>💾</Text>
      </TouchableOpacity>

      <BackupRestore
        visible={backupModalVisible}
        onClose={() => setBackupModalVisible(false)}
        onGridsUpdated={onGridsUpdated}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  icon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});