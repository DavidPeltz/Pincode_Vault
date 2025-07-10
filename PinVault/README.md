# PIN Vault - Secure PIN Storage App

A mobile app built with React Native and Expo that allows users to securely store their bank and credit card PIN codes using a unique visual grid system.

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

### 💾 Data Management
- **Local Storage**: All data is stored securely on your device using AsyncStorage
- **CRUD Operations**: Create, read, update, and delete PIN grids
- **Automatic Saving**: Grids are saved with timestamps for easy organization

### 🎨 Gallery View
- **Swipe Navigation**: Horizontally swipe through your saved grids
- **PIN Display**: Clearly see your PIN extracted from the grid
- **Edit/Delete**: Manage your grids with intuitive controls
- **Pagination**: Visual indicators show your position in the gallery

## How It Works

### Security Concept
The app uses "security through obscurity" - your PIN is hidden among random digits in a colorful grid. Even if someone sees your screen, they won't know which cells contain your actual PIN unless they know your system.

### Usage Workflow
1. **Create Grid**: Generate a new 8x5 grid with randomly distributed colors
2. **Enter PIN**: Tap colored cells to enter your PIN digits
3. **Fill Decoys**: Add random digits to remaining cells for camouflage
4. **Save**: Give your grid a memorable name and save it
5. **Access**: Use the gallery to swipe through and find your PINs

## Installation & Setup

```bash
# Clone or download the project
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

## Technical Details

### Architecture
- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6 with Stack Navigator
- **Storage**: AsyncStorage for persistent local data
- **UI**: Custom components with responsive design

### Key Components
- **PinGrid**: Interactive 8x5 grid component
- **GridEditor**: PIN entry and grid management interface
- **Gallery**: Swipeable grid viewer with management controls
- **Storage Utils**: Data persistence and grid generation utilities

### Dependencies
- `@react-native-async-storage/async-storage`: Local data storage
- `@react-navigation/native`: Navigation framework
- `@react-navigation/stack`: Stack navigation
- `react-native-screens`: Screen optimization
- `react-native-safe-area-context`: Safe area handling
- `react-native-gesture-handler`: Touch gesture support

## Security Considerations

### Strengths
- **Visual Obfuscation**: PINs are hidden among decoy digits
- **Local Storage**: No cloud storage or external servers
- **No Screenshots**: Consider implementing screenshot prevention
- **Random Layout**: Grid colors are randomized for each new grid

### Limitations
- **Device Security**: Security depends on your device's lock screen
- **Shoulder Surfing**: Still vulnerable to direct observation during use
- **Backup**: No cloud backup means data loss if device is lost
- **Biometric Protection**: Consider adding biometric authentication

## Usage Tips

### Best Practices
1. **Use Different Colors**: Spread your PIN across different colored cells
2. **Memorable Patterns**: Choose colors in a pattern you can remember
3. **Regular Updates**: Regenerate grids periodically for maximum security
4. **Backup Externally**: Keep a secure backup of important PINs elsewhere
5. **Screen Privacy**: Use in private to prevent shoulder surfing

### Examples
- **Chase Debit**: PIN 1234 → Enter 1 in red, 2 in blue, 3 in green, 4 in yellow
- **Visa Credit**: PIN 9876 → Enter 9 in green, 8 in red, 7 in blue, 6 in yellow

## Future Enhancements

### Potential Features
- **Biometric Authentication**: Fingerprint/Face ID to open app
- **Export/Import**: Secure backup and restore functionality
- **Dark Mode**: Theme customization options
- **Grid Sizes**: Different grid dimensions (6x6, 10x4, etc.)
- **Color Customization**: User-defined color schemes
- **Categories**: Group grids by bank or card type
- **Search**: Find grids by name or partial PIN

### Security Improvements
- **Encryption**: Encrypt stored data
- **Screenshot Prevention**: Block screenshots and screen recording
- **Auto-Lock**: Automatic timeout and lock
- **Decoy Grids**: Create fake grids to confuse attackers
- **Two-Factor**: Additional authentication methods

## Contributing

This app was built as a secure, local-first solution for PIN storage. Contributions are welcome for:
- Security enhancements
- UI/UX improvements
- Performance optimizations
- Additional features

## License

This project is for educational and personal use. Please review and enhance security features before using for actual sensitive data storage.

## Disclaimer

While this app provides a novel approach to PIN security, users should:
- Understand the security limitations
- Use additional security measures (device locks, etc.)
- Keep backup copies of important PINs
- Use at their own risk

Remember: The security of this system relies on keeping your color/position system secret and using it in private settings.