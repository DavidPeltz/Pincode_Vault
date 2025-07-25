# PIN Vault API Documentation

This document provides comprehensive API documentation for PIN Vault v1.6, including all components, utilities, contexts, and their interfaces.

## Table of Contents

- [Utility Functions](#utility-functions)
  - [Storage Utils](#storage-utils)
  - [Encryption Utils](#encryption-utils)
- [Context Providers](#context-providers)
  - [AuthProvider](#authprovider)
  - [ThemeProvider](#themeprovider)
- [Core Components](#core-components)
  - [PinGrid](#pingrid)
  - [Gallery](#gallery)
  - [GridEditor](#grideditor)
- [Backup Components](#backup-components)
  - [BackupRestore](#backuprestore)
  - [PasswordInput](#passwordinput)
  - [BackupInfo](#backupinfo)
  - [RestoreOptions](#restoreoptions)
- [Gallery Components](#gallery-components)
  - [EmptyState](#emptystate)
  - [GridCard](#gridcard)
- [Type Definitions](#type-definitions)

## Utility Functions

### Storage Utils

#### `saveGrid(gridData: GridData): Promise<boolean>`
Saves a PIN grid to AsyncStorage.

**Parameters:**
- `gridData` (GridData): Complete grid data object

**Returns:** Promise resolving to true if save was successful

**Example:**
```javascript
const gridData = {
  id: 'grid_123',
  name: 'Chase Credit Card',
  grid: generateRandomGrid(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
const success = await saveGrid(gridData);
```

#### `getGrids(): Promise<Object<string, GridData>>`
Retrieves all PIN grids from AsyncStorage.

**Returns:** Promise resolving to object with grid IDs as keys and GridData as values

#### `deleteGrid(gridId: string): Promise<boolean>`
Deletes a specific PIN grid from AsyncStorage.

**Parameters:**
- `gridId` (string): The ID of the grid to delete

**Returns:** Promise resolving to true if deletion was successful

#### `clearAllGrids(): Promise<boolean>`
Clears all PIN grids from AsyncStorage.

**Returns:** Promise resolving to true if clearing was successful

#### `generateRandomGrid(): GridCell[]`
Generates a random 8x5 PIN grid with evenly distributed colors.

**Returns:** Array of 40 grid cells with randomized color positions

#### `fillEmptyCells(grid: GridCell[]): GridCell[]`
Fills all empty cells in a grid with random digits (0-9).

**Parameters:**
- `grid` (GridCell[]): The grid to fill with random digits

**Returns:** New grid array with random values in previously empty cells

### Encryption Utils

#### `encryptBackupData(data: Object, userPassword: string): Promise<EncryptionResult>`
Encrypts backup data with user password for secure storage.

**Parameters:**
- `data` (Object): Grid data to encrypt (typically from getGrids())
- `userPassword` (string): User-provided password for encryption

**Returns:** Promise resolving to EncryptionResult with encrypted data or error

**Example:**
```javascript
const grids = await getGrids();
const result = await encryptBackupData(grids, 'mySecurePassword');
if (result.success) {
  console.log('Backup created:', result.timestamp);
}
```

#### `decryptBackupData(encryptedData: string, userPassword: string): Promise<DecryptionResult>`
Decrypts backup data with user password.

**Parameters:**
- `encryptedData` (string): Encrypted backup data (from backup file)
- `userPassword` (string): User-provided password for decryption

**Returns:** Promise resolving to DecryptionResult with data or error

## Context Providers

### AuthProvider

React context provider for biometric and device authentication.

**Props:**
- `children` (ReactNode): Child components to wrap with auth context

**Context Value:**
- `isAuthenticated` (boolean): Current authentication state
- `authenticationInProgress` (boolean): Whether authentication is in progress
- `biometricType` (string|null): Type of biometric authentication available
- `isAuthAvailable` (boolean): Whether any authentication method is available
- `authenticate(reason?: string): Promise<boolean>`: Function to trigger authentication
- `logout(): void`: Function to clear authentication state
- `resetAuthentication(): void`: Function to reset authentication state
- `checkAuthenticationAvailability(): Promise<void>`: Function to check auth availability

**Example:**
```javascript
const { authenticate, isAuthenticated, biometricType } = useAuth();

const handleSecureAction = async () => {
  const success = await authenticate('Access secure feature');
  if (success) {
    // Perform secure action
  }
};
```

### ThemeProvider

React context provider for theme management with light/dark mode support.

**Props:**
- `children` (ReactNode): Child components to wrap with theme context

**Context Value:**
- `theme` (Theme): Current theme object with colors
- `isDarkMode` (boolean): Whether dark mode is active
- `toggleTheme(): Promise<void>`: Function to toggle between light/dark themes

**Example:**
```javascript
const { theme, isDarkMode, toggleTheme } = useTheme();

return (
  <View style={{ backgroundColor: theme.background }}>
    <Text style={{ color: theme.text }}>Hello World</Text>
    <Button onPress={toggleTheme} title="Toggle Theme" />
  </View>
);
```

## Core Components

### PinGrid

Interactive PIN grid component for PIN entry and viewing.

**Props:**
- `grid` (GridCell[]): Array of 40 grid cell objects *(required)*
- `onGridUpdate` (Function): Callback when grid is updated *(required)*
- `isEditable` (boolean): Whether grid cells can be edited *(default: true)*
- `showValues` (boolean): Whether to display cell values *(default: true)*
- `showPinHighlight` (boolean): Whether to highlight PIN cells *(default: true)*

**Example:**
```javascript
const [grid, setGrid] = useState(generateRandomGrid());

<PinGrid
  grid={grid}
  onGridUpdate={setGrid}
  isEditable={true}
  showValues={true}
  showPinHighlight={true}
/>
```

### Gallery

Main gallery view for displaying saved PIN grids.

**Props:**
- `navigation` (NavigationProp): React Navigation object *(required)*

**Features:**
- Swipe navigation between grids
- Edit/Delete actions with authentication
- Empty state with onboarding
- Responsive grid display

### GridEditor

Editor interface for creating and modifying PIN grids.

**Props:**
- `navigation` (NavigationProp): React Navigation object *(required)*
- `route` (RouteProp): Route object with optional gridData parameter

**Features:**
- Grid naming functionality
- PIN entry and random fill
- Save validation and feedback
- Authentication-protected editing

## Backup Components

### BackupRestore

Main backup and restore modal interface.

**Props:**
- `visible` (boolean): Whether the modal is visible *(required)*
- `onClose` (Function): Callback when modal is closed *(required)*
- `onGridsUpdated` (Function): Callback when grids are updated

**Features:**
- Create encrypted backups (local and share)
- Restore from backup files
- Password-protected operations
- Cross-device backup compatibility

### PasswordInput

Password input modal for backup operations.

**Props:**
- `visible` (boolean): Whether the modal is visible *(required)*
- `action` (string): Action type ('backup-local', 'backup-share', 'restore')
- `onSubmit` (Function): Callback when password is submitted *(required)*
- `onCancel` (Function): Callback when cancelled *(required)*
- `error` (string): Error message to display

**Features:**
- Password visibility toggle
- Action-specific messaging
- Validation and error handling

### BackupInfo

Component to display backup file information.

**Props:**
- `backupInfo` (Object): Backup information object
- `restoreOptions` (Object): Restore options object *(required)*

**Features:**
- File metadata display
- Version and compatibility info
- Restore options preview

### RestoreOptions

Component for selecting restore options.

**Props:**
- `options` (Object): Current restore options *(required)*
- `onOptionsChange` (Function): Callback when options change *(required)*

**Features:**
- Replace all vs. merge options
- Overwrite vs. skip duplicate handling
- Warning messages for destructive actions

## Gallery Components

### EmptyState

Empty state component for when no grids are available.

**Props:**
- `onCreateNew` (Function): Callback when create new grid is pressed *(required)*

**Features:**
- Welcome message and app overview
- Quick start instructions
- Authentication setup guidance
- Security feature highlights

### GridCard

Individual grid card component for the gallery.

**Props:**
- `item` (Object): Grid item data *(required)*
- `index` (number): Grid index *(required)*
- `onEdit` (Function): Callback when edit is pressed *(required)*
- `onDelete` (Function): Callback when delete is pressed *(required)*
- `formatDate` (Function): Date formatting function *(required)*

**Features:**
- Grid preview with PIN extraction
- Edit/Delete actions
- Creation date display
- Grid index indicator

## Type Definitions

### GridCell
```javascript
{
  id: number,           // Unique identifier for the cell
  color: string,        // Color ('red', 'blue', 'green', 'yellow')
  value: number|null,   // Digit value (0-9) or null if empty
  isPinDigit: boolean   // Whether this cell contains a PIN digit
}
```

### GridData
```javascript
{
  id: string,           // Unique identifier for the grid
  name: string,         // User-defined name for the grid
  grid: GridCell[],     // Array of 40 grid cells (8x5 layout)
  createdAt: string,    // ISO date string when grid was created
  updatedAt: string     // ISO date string when grid was last updated
}
```

### Theme
```javascript
{
  background: string,       // Primary background color
  surface: string,          // Surface/card background color
  primary: string,          // Primary accent color
  text: string,            // Primary text color
  textSecondary: string,   // Secondary text color
  border: string,          // Border color
  error: string,           // Error state color
  success: string,         // Success state color
  warning: string,         // Warning state color
  danger: string,          // Danger/destructive action color
  gridColors: {
    red: string,
    green: string,
    blue: string,
    yellow: string
  },
  modal: {
    background: string,
    overlay: string
  }
}
```

### EncryptionResult
```javascript
{
  success: boolean,           // Whether encryption was successful
  encryptedData?: string,     // Base64 encoded encrypted data (if success)
  timestamp?: string,         // ISO timestamp when backup was created (if success)
  error?: string             // Error message (if not success)
}
```

### DecryptionResult
```javascript
{
  success: boolean,       // Whether decryption was successful
  data?: Object,          // Decrypted backup data (if success)
  version?: string,       // Backup version (if success)
  timestamp?: string,     // Original backup timestamp (if success)
  error?: string         // Error message (if not success)
}
```

## Security Considerations

### Authentication
- All sensitive operations require device authentication
- Supports Face ID, Touch ID, fingerprint, iris, and device PIN/pattern/password
- Graceful handling of authentication failures and cancellations

### Encryption
- Backup files use password-based encryption with PBKDF2-like key derivation
- 10,000 rounds of SHA-256 hashing for key strengthening
- Cross-device compatibility with version-specific salts
- XOR encryption (consider AES for production use)

### Data Storage
- All data stored locally using AsyncStorage
- No cloud storage or external servers by default
- User-controlled backup file locations
- Secure file format with header identification

## Error Handling

### Common Error Patterns
1. **Authentication Errors**: Handle user cancellation, system lockouts, and hardware unavailability
2. **Storage Errors**: Graceful degradation when AsyncStorage operations fail
3. **Encryption Errors**: Clear messaging for invalid passwords or corrupted files
4. **Validation Errors**: User-friendly feedback for invalid inputs

### Best Practices
- Always wrap async operations in try-catch blocks
- Provide meaningful error messages to users
- Log technical errors to console for debugging
- Implement fallback behaviors where possible

## Development Guidelines

### Component Structure
1. Import dependencies
2. Add JSDoc documentation
3. Define PropTypes
4. Implement component logic
5. Export with proper documentation

### Code Style
- Use JSDoc comments for all functions and components
- Implement PropTypes for runtime type checking
- Follow consistent naming conventions
- Include usage examples in documentation

### Testing Recommendations
- Test all utility functions with various inputs
- Mock authentication providers for component testing
- Test error handling and edge cases
- Validate PropTypes are correctly defined

---

*This documentation is for PIN Vault v1.6. For the latest updates, refer to the component source files.*