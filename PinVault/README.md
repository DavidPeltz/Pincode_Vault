# PIN Vault v1.1 - Secure PIN Storage App

A mobile app built with React Native and Expo that allows users to securely store their bank and credit card PIN codes using a unique visual grid system with biometric authentication protection.

## 🚀 What's New in v1.1

### 🔐 Biometric Authentication
- **Enhanced Security**: Protect your PIN creation and editing with device biometrics
- **Multiple Auth Types**: Support for Face ID, Fingerprint, Iris recognition, and device PIN/password
- **Seamless Integration**: Uses your device's native authentication system
- **Optional Protection**: Authentication required only for sensitive operations

### 🎨 Theme System
- **Dark Mode**: Beautiful dark theme for comfortable viewing in low light
- **Light Mode**: Clean, bright interface for daytime use
- **Automatic Switching**: Remembers your theme preference
- **Enhanced Colors**: Improved color schemes for better accessibility

### ℹ️ Enhanced Security Information
- **Security Guide**: Built-in modal explaining how your data is protected
- **Best Practices**: Tips for maximum security and privacy
- **Authentication Status**: Clear indication of your device's security capabilities

## Features

### 🔐 Visual PIN Security
- **8x5 Color Grid**: Each PIN is stored in a randomly colored grid with 40 cells
- **Four Colors**: Red, Blue, Green, and Yellow cells are evenly distributed
- **Hidden PIN**: Only you know which colored cells contain your actual PIN digits
- **Decoy Numbers**: Fill empty cells with random digits for additional security

### 📱 User-Friendly Interface
- **Touch Interface**: Simply tap cells to enter PIN digits (0-9)
- **Visual Feedback**: PIN cells are highlighted with special borders
- **Real-time Preview**: See your PIN as you enter it
- **Card Naming**: Assign memorable names to each grid (e.g., "Chase Credit Card")
- **Theme Toggle**: Switch between dark and light modes instantly

### 💾 Data Management
- **Local Storage**: All data is stored securely on your device using AsyncStorage
- **CRUD Operations**: Create, read, update, and delete PIN grids
- **Automatic Saving**: Grids are saved with timestamps for easy organization
- **Biometric Protection**: Authentication required for editing and creating grids

### 🎨 Gallery View
- **Swipe Navigation**: Horizontally swipe through your saved grids
- **PIN Display**: Clearly see your PIN extracted from the grid
- **Edit/Delete**: Manage your grids with intuitive controls (requires authentication)
- **Pagination**: Visual indicators show your position in the gallery
- **Theme-Aware**: Beautiful appearance in both light and dark themes

## How It Works

### Security Concept
The app uses "security through obscurity" combined with device-level authentication. Your PIN is hidden among random digits in a colorful grid, and access to modify grids requires biometric verification. Even if someone sees your screen, they won't know which cells contain your actual PIN unless they know your system.

### Usage Workflow
1. **Authenticate**: Use biometric authentication to access editing features
2. **Create Grid**: Generate a new 8x5 grid with randomly distributed colors
3. **Enter PIN**: Tap colored cells to enter your PIN digits
4. **Fill Decoys**: Add random digits to remaining cells for camouflage
5. **Save**: Give your grid a memorable name and save it
6. **Access**: Use the gallery to swipe through and find your PINs

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
- **Theming**: React Context-based theme system
- **UI**: Custom components with responsive design

### Key Components
- **AuthProvider**: Biometric authentication management
- **ThemeProvider**: Dark/light theme system
- **PinGrid**: Interactive 8x5 grid component
- **GridEditor**: PIN entry and grid management interface
- **Gallery**: Swipeable grid viewer with management controls
- **SecurityInfoModal**: Built-in security guidance
- **Storage Utils**: Data persistence and grid generation utilities

### Dependencies
```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/stack": "^7.4.2",
  "expo": "~53.0.17",
  "expo-local-authentication": "^16.0.5",
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
- **Visual Obfuscation**: PINs hidden among decoy digits in colorful grids
- **Local Storage**: No cloud storage or external servers
- **Theme-Aware Security**: Security guidance integrated into the app interface

### Authentication Types Supported
- **Face ID** (iOS)
- **Touch ID** (iOS)
- **Fingerprint** (Android)
- **Iris Recognition** (Samsung devices)
- **Device PIN/Password/Pattern** (fallback)

### Security Considerations

#### Strengths
- **Multi-factor Protection**: Combines biometric auth with visual obfuscation
- **Device-Only Storage**: All data remains on your device
- **No Network Access**: Completely offline operation
- **Random Layouts**: Grid colors randomized for each new grid
- **Authentication Required**: Biometric verification for editing operations

#### Limitations
- **Device Security Dependency**: Security relies on your device's lock screen
- **Physical Access**: Still vulnerable to direct observation during use
- **No Cloud Backup**: Data loss possible if device is lost (by design)
- **Single Device**: No synchronization across multiple devices

## Usage Tips

### Best Practices
1. **Use Different Colors**: Spread your PIN across different colored cells
2. **Memorable Patterns**: Choose colors in a pattern you can remember
3. **Regular Updates**: Regenerate grids periodically for maximum security
4. **External Backup**: Keep a secure backup of important PINs elsewhere
5. **Private Use**: Always use in private to prevent shoulder surfing
6. **Enable Authentication**: Ensure your device has biometric authentication set up

### Security Examples
- **Bank Debit**: PIN 1234 → Enter 1 in red, 2 in blue, 3 in green, 4 in yellow
- **Credit Card**: PIN 9876 → Enter 9 in green, 8 in red, 7 in blue, 6 in yellow

## Screenshots

*Coming soon - Screenshots of the v1.1 interface with dark/light themes*

## Changelog

### v1.1.0 (Latest)
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
- **Security Enhancements**: Additional authentication methods, encryption
- **UI/UX Improvements**: Better accessibility, animations, responsive design
- **Feature Additions**: Export/import, categories, search functionality
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions
- **Security**: Report security vulnerabilities privately via email

## Disclaimer

**Important Security Notice**: While PIN Vault v1.1 provides multiple layers of security including biometric authentication and visual obfuscation, users should:

- Understand that this app is designed for convenience, not maximum security
- Use additional security measures (strong device locks, regular updates)
- Keep backup copies of critical PINs in a separate secure location
- Use the app in private environments to prevent observation
- Regularly review and update stored PINs

**Use at your own risk**. The developers are not responsible for any data loss or security breaches resulting from the use of this application.

---

## Quick Start Guide

1. **Install** the app using the installation instructions above
2. **Set up** biometric authentication on your device if not already enabled
3. **Create** your first PIN grid by tapping the "+" button
4. **Enter** your PIN digits in colored cells of your choice
5. **Fill** remaining cells with random digits for security
6. **Save** with a memorable name
7. **Access** your PINs anytime through the gallery view

**Remember**: The security of this system relies on keeping your color/position system secret and using the app in private settings with biometric protection enabled.

---

*PIN Vault v1.1 - Secure, Local, Private PIN Storage* 🔐