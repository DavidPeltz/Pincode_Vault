# PIN Vault v1.3 - Secure PIN Storage App

A mobile app built with React Native and Expo that allows users to securely store their bank and credit card PIN codes using a unique visual grid system with biometric authentication protection and secure backup capabilities.

## 🚀 What's New in v1.3

### 📱 Enhanced Gallery Navigation
- **Improved Swipe Sensitivity**: Customized swipe detection with two options - single grid navigation or jump to beginning/end
- **Reliable Grid Centering**: Fixed swiping issues for consistent, smooth navigation between grids
- **Smart Gesture Recognition**: Velocity-based swipe detection prevents accidental multi-grid jumps
- **Optimized Scroll Performance**: Debounced updates and improved FlatList configuration for smoother experience

### 🎨 Visual Improvements
- **Better Color Contrast**: Lightened blue grid cells in light mode for improved digit visibility
- **Enhanced Accessibility**: Black text now clearly readable on all background colors
- **Consistent Theming**: Maintained dark mode compatibility while improving light mode readability

### 🔧 Bug Fixes & Reliability
- **Fixed Backup Restore**: "Replace All" option now properly clears existing grids before restoring
- **Improved Data Integrity**: Added `clearAllGrids()` function for reliable complete data replacement
- **Backward Compatibility**: Maintains support for v1.2 backup files while using v1.3 format for new backups

## 🚀 What Was New in v1.2

### 🔐 Secure Backup & Restore System
- **Encrypted Backups**: Password-protected backup files with PBKDF2-based encryption (10,000 rounds)
- **Cross-Device Support**: Share backups between devices using password authentication
- **User-Accessible Storage**: Save backups to your chosen folder on Android using Storage Access Framework
- **Multiple Export Options**: Keep local backups or share/export to cloud services
- **Authentication Protected**: All backup operations require biometric verification

### 📱 Enhanced User Interface
- **Header Integration**: Backup functionality accessible from all screens via header button
- **Improved Navigation**: Better handling of Android gesture vs button navigation
- **Password Visibility**: Toggle password visibility during backup/restore with eye icon
- **Consistent Styling**: Standardized header icons with 44x44px circular design
- **Better Onboarding**: Enhanced guidance for devices without authentication setup

### 🛡️ Security Improvements
- **Generic Authentication**: Updated messaging to support all authentication types (PIN, Pattern, Password, Face ID, Fingerprint)
- **Cross-Platform Compatibility**: Works seamlessly across iOS and Android devices
- **Secure File Format**: Custom `.pvb` (PIN Vault Backup) format with header identification
- **Fallback Protection**: Graceful handling when advanced storage features aren't available

## Features

### 🔐 Visual PIN Security
- **8x5 Color Grid**: Each PIN is stored in a randomly colored grid with 40 cells
- **Four Colors**: Red, Blue, Green, and Yellow cells are evenly distributed
- **Hidden PIN**: Only you know which colored cells contain your actual PIN digits
- **Decoy Numbers**: Fill empty cells with random digits for additional security

### 💾 Backup & Data Management
- **Encrypted Backup Files**: Password-protected backups with strong encryption
- **Cross-Device Migration**: Move your data between devices securely
- **User-Controlled Storage**: Choose where to save your backups on Android
- **Export Options**: Keep local or share to cloud services
- **Disaster Recovery**: Restore your data after device loss or replacement
- **Import/Export**: Works even on fresh installations with no existing grids

### 📱 User-Friendly Interface
- **Touch Interface**: Simply tap cells to enter PIN digits (0-9)
- **Visual Feedback**: PIN cells are highlighted with special borders
- **Real-time Preview**: See your PIN as you enter it
- **Card Naming**: Assign memorable names to each grid (e.g., "Chase Credit Card")
- **Theme Toggle**: Switch between dark and light modes instantly
- **Header Access**: Backup functionality always available in the header

### 🔐 Enhanced Authentication
- **Multiple Auth Types**: Support for Face ID, Touch ID, Fingerprint, Iris, PIN, Pattern, Password
- **Flexible Requirements**: Authentication required only for sensitive operations
- **Setup Guidance**: Clear instructions for enabling device authentication
- **Graceful Fallbacks**: Handles devices without biometric capabilities

### 🎨 Gallery View
- **Swipe Navigation**: Horizontally swipe through your saved grids
- **PIN Display**: Clearly see your PIN extracted from the grid
- **Edit/Delete**: Manage your grids with intuitive controls (requires authentication)
- **Pagination**: Visual indicators show your position in the gallery
- **Theme-Aware**: Beautiful appearance in both light and dark themes

## How It Works

### Security Concept
The app uses "security through obscurity" combined with device-level authentication and encrypted backups. Your PIN is hidden among random digits in a colorful grid, access to modify grids requires biometric verification, and backups are protected with password-based encryption.

### Backup Security
- **Password-Based Encryption**: Uses PBKDF2-like key derivation with 10,000 rounds
- **Cross-Device Compatibility**: Backups work across different devices with the same password
- **Authentication Required**: Biometric verification needed for all backup/restore operations
- **Secure File Format**: Custom format prevents accidental data exposure

### Usage Workflow
1. **Authenticate**: Use device authentication to access editing features
2. **Create Grid**: Generate a new 8x5 grid with randomly distributed colors
3. **Enter PIN**: Tap colored cells to enter your PIN digits
4. **Fill Decoys**: Add random digits to remaining cells for camouflage
5. **Save**: Give your grid a memorable name and save it
6. **Backup**: Create encrypted backups with password protection
7. **Access**: Use the gallery to swipe through and find your PINs

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/pin-vault.git
cd PinVault

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android  # Android
npm run ios      # iOS (requires macOS)
npm run web      # Web browser
```

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- For iOS: Xcode and iOS Simulator (macOS required)
- For Android: Android Studio and Android Emulator

## Technical Details

### Architecture
- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation v7 with Stack Navigator
- **Storage**: AsyncStorage for persistent local data
- **Authentication**: Expo Local Authentication for biometric security
- **Backup System**: Password-based encryption with file system integration
- **Theming**: React Context-based theme system
- **UI**: Custom components with responsive design

### Key Components
- **AuthProvider**: Biometric authentication management
- **ThemeProvider**: Dark/light theme system
- **PinGrid**: Interactive 8x5 grid component
- **GridEditor**: PIN entry and grid management interface
- **Gallery**: Swipeable grid viewer with management controls
- **BackupRestore**: Secure backup and restore modal interface
- **BackupButton**: Header-integrated backup access component
- **SecurityInfoModal**: Built-in security guidance
- **Storage Utils**: Data persistence and grid generation utilities
- **Encryption Utils**: Password-based encryption and decryption
- **Backup Utils**: File operations and backup management

### Dependencies
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/stack": "^7.4.2",
  "buffer": "^6.0.3",
  "expo": "~53.0.17",
  "expo-crypto": "~14.1.5",
  "expo-document-picker": "~13.1.6",
  "expo-file-system": "~18.1.11",
  "expo-local-authentication": "^16.0.5",
  "expo-sharing": "~13.1.5",
  "expo-status-bar": "~2.2.3",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "react-native-gesture-handler": "^2.27.1",
  "react-native-safe-area-context": "^5.5.2",
  "react-native-screens": "^4.11.1"
}
```

## Security Features

### Multi-Layer Protection
- **Biometric Authentication**: Device-level security for sensitive operations
- **Encrypted Backups**: Password-protected backup files with strong encryption
- **Visual Obfuscation**: PINs hidden among decoy digits in colorful grids
- **Local Storage**: No cloud storage or external servers by default
- **Cross-Device Security**: Secure backup sharing between your devices

### Authentication Types Supported
- **Face ID** (iOS)
- **Touch ID** (iOS)
- **Fingerprint** (Android)
- **Iris Recognition** (Samsung devices)
- **Device PIN/Password/Pattern** (fallback)

### Backup Security
- **Password Protection**: Strong password required for backup encryption/decryption
- **Key Derivation**: PBKDF2-like algorithm with 10,000 rounds
- **Cross-Device Compatibility**: Same password works across different devices
- **Authentication Gate**: Biometric verification required for all backup operations
- **Secure Storage**: User-controlled backup file locations

### Security Considerations

#### Strengths
- **Multi-factor Protection**: Combines biometric auth, visual obfuscation, and backup encryption
- **Device-Only Storage**: All data remains on your device unless you choose to backup
- **No Network Access**: Completely offline operation
- **Encrypted Backups**: Password-protected backup files for disaster recovery
- **Cross-Device Migration**: Secure way to move data between devices
- **User-Controlled Storage**: Choose where your backups are saved

#### Limitations
- **Device Security Dependency**: Security relies on your device's lock screen
- **Physical Access**: Still vulnerable to direct observation during use
- **Password Dependency**: Backup security depends on password strength
- **Single Password**: All backups use the same password system

## Usage Tips

### Best Practices
1. **Use Different Colors**: Spread your PIN across different colored cells
2. **Memorable Patterns**: Choose colors in a pattern you can remember
3. **Strong Backup Passwords**: Use a strong, memorable password for backups
4. **Regular Backups**: Create backups before major device changes
5. **Secure Storage**: Save backups to trusted cloud services or secure locations
6. **Test Restores**: Verify your backups work before relying on them
7. **Private Use**: Always use in private to prevent shoulder surfing
8. **Enable Authentication**: Ensure your device has authentication set up

### Backup Workflow
1. **Create Backup**: Tap backup icon in header, authenticate, set password
2. **Choose Storage**: Select "Keep Local" for device storage or "Share/Export" for cloud
3. **Secure Password**: Use a strong password you can remember across devices
4. **Test Restore**: Verify backup works by testing restore process
5. **Regular Updates**: Create new backups when you add/modify grids

### Security Examples
- **Bank Debit**: PIN 1234 → Enter 1 in red, 2 in blue, 3 in green, 4 in yellow
- **Credit Card**: PIN 9876 → Enter 9 in green, 8 in red, 7 in blue, 6 in yellow

## Screenshots

*Coming soon - Screenshots of the v1.3 interface with enhanced navigation*

## Changelog

### v1.3.0 (Latest) - Enhanced Navigation & User Experience
- ✅ **Improved grid gallery swiping** with custom velocity-based detection
- ✅ **Fixed swiping reliability** with consistent grid centering and smooth navigation
- ✅ **Added smart swipe sensitivity** with two options: single grid or jump to end
- ✅ **Enhanced blue cell visibility** in light mode for better text contrast
- ✅ **Fixed backup restore "Replace All"** to properly clear existing grids before restore
- ✅ **Added backward compatibility** for v1.2 backup files while using v1.3 format
- ✅ **Improved accessibility** with better color contrast and readability
- ✅ **Optimized scroll performance** with debounced updates and enhanced FlatList configuration

### v1.2.0 - Secure Backup & Restore
- ✅ **Added secure backup system** with password-based encryption
- ✅ **Implemented cross-device backup compatibility** for device migration
- ✅ **Added user-accessible storage** on Android using Storage Access Framework
- ✅ **Enhanced header navigation** with backup button accessible from all screens
- ✅ **Improved authentication messaging** to support all device authentication types
- ✅ **Added password visibility toggle** with eye icon for backup operations
- ✅ **Standardized header icon styling** with consistent 44x44px circular design
- ✅ **Enhanced navigation bar handling** for Android gesture vs button navigation
- ✅ **Added comprehensive backup validation** and error handling
- ✅ **Resolved circular dependencies** by refactoring context providers
- ✅ **Added fallback storage options** when advanced features aren't available
- ✅ **Implemented secure file format** with custom .pvb extension and header identification
- ✅ **Enhanced onboarding experience** for devices without authentication setup
- ✅ **Added backup management utilities** for file operations and validation

#### New Dependencies Added
- `buffer`: For encryption operations
- `expo-crypto`: For cryptographic functions  
- `expo-document-picker`: For backup file selection
- `expo-file-system`: For file operations
- `expo-sharing`: For backup file sharing

#### Architecture Improvements
- **Extracted GridRefreshContext** to resolve circular dependency warnings
- **Added NavigationContext** for coordinating updates across screens
- **Created backup utilities** (`utils/backup.js`, `utils/encryption.js`)
- **Enhanced component structure** with modular backup components
- **Improved error handling** throughout backup/restore flow

#### User Experience Enhancements
- **Header-accessible backup** - Available from all screens including empty state
- **Two backup modes** - "Keep Local" vs "Share/Export" with different storage handling
- **Progress indicators** - Loading states and operation feedback
- **Authentication integration** - Seamless biometric protection for sensitive operations
- **Generic messaging** - Device-agnostic authentication instructions
- **Fallback support** - Graceful degradation when advanced features unavailable

### v1.1.0
- ✅ Added biometric authentication for enhanced security
- ✅ Implemented dark/light theme system with user preference storage
- ✅ Added comprehensive security information modal
- ✅ Enhanced UI with improved color schemes and accessibility
- ✅ Updated dependencies to latest stable versions
- ✅ Improved error handling and user feedback

### v1.0.0
- Initial release with visual PIN grid system
- Basic CRUD operations for PIN storage
- Gallery view with swipe navigation
- Local AsyncStorage data persistence

## Contributing

We welcome contributions! Areas of interest:
- **Security Enhancements**: Additional encryption methods, security audits
- **UI/UX Improvements**: Better accessibility, animations, responsive design
- **Backup Features**: Cloud integration, automated backups, backup scheduling
- **Performance**: Optimization and testing
- **Documentation**: Code documentation and user guides

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure code quality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions
- **Security**: Report security vulnerabilities privately via email

## Disclaimer

**Important Security Notice**: While PIN Vault v1.3 provides multiple layers of security including biometric authentication, visual obfuscation, and encrypted backups, users should:

- Understand that this app is designed for convenience, not maximum security
- Use strong passwords for backup encryption
- Store backup files in secure locations
- Use additional security measures (strong device locks, regular updates)
- Keep backup copies of critical PINs in a separate secure location
- Use the app in private environments to prevent observation
- Regularly review and update stored PINs

**Use at your own risk**. The developers are not responsible for any data loss or security breaches resulting from the use of this application.

---

## Quick Start Guide

1. **Install** the app using the installation instructions above
2. **Set up** device authentication if not already enabled
3. **Create** your first PIN grid by tapping the "+" button
4. **Enter** your PIN digits in colored cells of your choice
5. **Fill** remaining cells with random digits for security
6. **Save** with a memorable name
7. **Create Backup** using the backup button in the header
8. **Set strong password** for backup encryption
9. **Choose storage** location for your backup file
10. **Access** your PINs anytime through the gallery view

**Remember**: The security of this system relies on keeping your color/position system secret, using strong backup passwords, and using the app in private settings with authentication protection enabled.

---

*PIN Vault v1.3 - Secure, Local, Private PIN Storage with Enhanced Navigation* 🔐

---
*Updated for production build - Ready for v1.3 release*
