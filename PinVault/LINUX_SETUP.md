# Linux Setup Guide for PIN Vault App

This guide will help you set up your Linux environment to pull, build, and test the PIN Vault mobile app.

## Prerequisites Installation

### 1. Install Node.js and npm

#### Option A: Using Node Version Manager (Recommended)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

#### Option B: Using Package Manager
**Ubuntu/Debian:**
```bash
# Update package index
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify versions (should be Node 16+ and npm 8+)
node --version
npm --version
```

**Fedora/RHEL/CentOS:**
```bash
sudo dnf install nodejs npm
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm
```

### 2. Install Git (if not already installed)
```bash
# Ubuntu/Debian
sudo apt install git

# Fedora/RHEL/CentOS  
sudo dnf install git

# Arch Linux
sudo pacman -S git
```

### 3. Install Expo CLI
```bash
npm install -g @expo/cli
```

## Android Development Setup (Optional)

If you want to test on Android devices or emulator:

### Install Java Development Kit (JDK)
```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Fedora/RHEL/CentOS
sudo dnf install java-17-openjdk-devel

# Arch Linux
sudo pacman -S jdk17-openjdk
```

### Install Android Studio
1. Download from: https://developer.android.com/studio
2. Extract and run:
```bash
cd ~/Downloads
tar -xzf android-studio-*.tar.gz
cd android-studio/bin
./studio.sh
```

3. Follow setup wizard to install Android SDK

### Configure Environment Variables
Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload:
```bash
source ~/.bashrc
```

## Getting the Repository

### 1. Clone the Repository
```bash
# Replace with your actual repository URL
git clone <your-repo-url>
cd <repo-name>
```

### 2. Navigate to PIN Vault Directory
```bash
cd PinVault
```

### 3. Install Dependencies
```bash
npm install
```

## Running the App

### Option 1: Web Browser (Easiest)
```bash
npm run web
```
- Opens in your default browser
- Best for initial testing and development
- No mobile features (camera, etc.) but core functionality works

### Option 2: Expo Go App on Phone
```bash
npm start
```

Then:
1. Install **Expo Go** app from Google Play Store or App Store
2. Scan the QR code that appears in terminal
3. App will load on your phone

### Option 3: Android Emulator
```bash
# Start Android emulator (if Android Studio installed)
npm run android
```

### Option 4: Physical Android Device (USB Debugging)
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Run:
```bash
npm run android
```

## Testing the App

Once running, you can test all features:

### Core Functionality
- ✅ Create new PIN grids (8x5 colored cells)
- ✅ Tap cells to enter PIN digits (0-9)
- ✅ Fill remaining cells with random digits
- ✅ Save grids with custom names
- ✅ Browse saved grids in gallery
- ✅ Edit and delete existing grids

### Navigation
- ✅ Swipe between grids in gallery
- ✅ Navigate between screens
- ✅ Use back buttons and navigation

## Troubleshooting

### Common Issues

**Metro bundler port conflict:**
```bash
npx react-native start --reset-cache --port 8082
```

**Permission errors:**
```bash
sudo chown -R $(whoami) ~/.npm
```

**Expo CLI issues:**
```bash
npm uninstall -g @expo/cli
npm install -g @expo/cli@latest
```

**Android emulator not starting:**
```bash
# Check if virtualization is enabled
egrep -c '(vmx|svm)' /proc/cpuinfo

# If 0, enable virtualization in BIOS
```

### Performance Tips

**Increase file watchers (if needed):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Development Tools (Optional)

### Useful VS Code Extensions
- React Native Tools
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- GitLens

### React Native Debugger
```bash
# Download from: https://github.com/jhen0409/react-native-debugger/releases
# Extract and run the AppImage
chmod +x react-native-debugger-*.AppImage
./react-native-debugger-*.AppImage
```

## System Requirements

### Minimum Requirements
- **OS:** Ubuntu 18.04+, Fedora 28+, or equivalent
- **RAM:** 4GB (8GB recommended)
- **Storage:** 2GB free space (more for Android development)
- **CPU:** Any modern 64-bit processor

### Recommended for Android Development
- **RAM:** 8GB+
- **Storage:** 10GB+ free space
- **CPU:** Multi-core processor with virtualization support

## Quick Start Commands

Once everything is installed:
```bash
# Clone and setup
git clone <repo-url>
cd <repo-name>/PinVault
npm install

# Run on web (fastest)
npm run web

# Or run on mobile via Expo Go
npm start
# Then scan QR code with Expo Go app
```

## Getting Help

If you encounter issues:
1. Check Node.js version: `node --version` (should be 16+)
2. Check npm version: `npm --version` (should be 8+)
3. Clear npm cache: `npm cache clean --force`
4. Restart Metro bundler: `npx expo start --clear`

The PIN Vault app should now be running and ready for testing on your Linux system! 🚀