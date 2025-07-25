import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PropTypes from 'prop-types';

/**
 * Component to display backup file information
 * @param {Object} props
 * @param {Object} props.backupInfo - Backup information object
 * @param {Object} props.restoreOptions - Restore options object
 */
export default function BackupInfo({ backupInfo, restoreOptions }) {
  const { theme } = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!backupInfo) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>📁 Backup Information</Text>
      
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>File Name:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{backupInfo.fileName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Version:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{backupInfo.version}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Created:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatDate(backupInfo.timestamp)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Grids:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{backupInfo.gridCount} grid(s)</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>File Size:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatFileSize(backupInfo.fileSize)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Encryption:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{backupInfo.encryptionType}</Text>
        </View>
      </View>

      {/* Restore Options Section */}
      <View style={[styles.optionsSection, { borderTopColor: theme.border }]}>
        <Text style={[styles.optionsTitle, { color: theme.text }]}>🔄 Restore Options</Text>
        
        <View style={styles.optionRow}>
          <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>Replace All:</Text>
          <Text style={[styles.optionValue, { color: restoreOptions.replaceAll ? theme.warning : theme.textSecondary }]}>
            {restoreOptions.replaceAll ? 'Yes - Clear existing grids first' : 'No - Merge with existing'}
          </Text>
        </View>
        
        <View style={styles.optionRow}>
          <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>Overwrite:</Text>
          <Text style={[styles.optionValue, { color: restoreOptions.overwriteExisting ? theme.warning : theme.textSecondary }]}>
            {restoreOptions.overwriteExisting ? 'Yes - Replace matching grids' : 'No - Skip duplicates'}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * PropTypes for BackupInfo component
 */
BackupInfo.propTypes = {
  /** Backup information object containing file metadata */
  backupInfo: PropTypes.shape({
    fileName: PropTypes.string,
    version: PropTypes.string,
    timestamp: PropTypes.string,
    gridCount: PropTypes.number,
    fileSize: PropTypes.number,
    encryptionType: PropTypes.string,
  }),
  
  /** Restore options configuration object */
  restoreOptions: PropTypes.shape({
    replaceAll: PropTypes.bool.isRequired,
    overwriteExisting: PropTypes.bool.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoGrid: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  optionsSection: {
    borderTopWidth: 1,
    paddingTop: 15,
    marginTop: 5,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  optionValue: {
    fontSize: 13,
    flex: 2,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});