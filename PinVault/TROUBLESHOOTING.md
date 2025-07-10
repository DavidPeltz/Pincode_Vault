# PIN Vault Troubleshooting Guide

## Common Issues and Solutions

### ❌ SyntaxError: Unexpected token '?'

**Error Message:**
```
SyntaxError: Unexpected token '?'
(node:3188694) UnhandledPromiseRejectionWarning: ...
```

**Cause:** You're running an outdated Node.js version that doesn't support modern JavaScript syntax.

**Solution:** Upgrade Node.js to version 16+ (LTS recommended)

#### Quick Fix - Install Latest Node.js

**Option 1: Using Node Version Manager (Recommended)**
```bash
# Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts

# Verify version (should be 18.x or 20.x)
node --version
```

**Option 2: Download from Official Site**
1. Go to https://nodejs.org/
2. Download the LTS version (18.x or 20.x)
3. Install the package

**Option 3: Package Manager**
```bash
# Ubuntu/Debian - Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora/RHEL
sudo dnf module install nodejs:18/common

# Arch Linux
sudo pacman -S nodejs npm
```

#### After Node.js Upgrade

```bash
# Clean npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Now try running the app
npm start
```

### ❌ Wrong Command Usage

**Issue:** Running `npm start app` instead of `npm start`

**Correct Commands:**
```bash
npm start          # For mobile development (shows QR code)
npm run web        # For web browser testing
npm run android    # For Android emulator
npm run ios        # For iOS simulator (macOS only)
```

### ❌ Expo CLI Version Issues

**Error:** Various Expo CLI errors

**Solution:**
```bash
# Uninstall old Expo CLI
npm uninstall -g expo-cli @expo/cli

# Install latest Expo CLI
npm install -g @expo/cli@latest

# Verify installation
npx expo --version
```

### ❌ Permission Errors

**Error:** `EACCES` permission denied errors

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### ❌ Port Already in Use

**Error:** `Port 8081 already in use`

**Solution:**
```bash
# Kill existing Metro bundler
npx expo start --clear

# Or use different port
npx expo start --port 8082
```

### ❌ Metro Bundler Issues

**Error:** Metro bundler crashes or fails to start

**Solution:**
```bash
# Clear all caches
npx expo start --clear
npm cache clean --force

# Reset Metro cache
npx expo start --reset-cache
```

### ❌ Missing Dependencies

**Error:** Module not found errors

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Verify all packages are installed
npm ls
```

## ✅ Verification Steps

After fixing issues, verify everything works:

```bash
# Check Node.js version (should be 16+)
node --version

# Check npm version (should be 8+)
npm --version

# Check Expo CLI
npx expo --version

# Try running the app
npm run web    # Should open in browser
```

## 🔧 Development Tools Check

Make sure you have the right versions:

```bash
# Recommended versions:
# Node.js: 18.x or 20.x LTS
# npm: 9.x or 10.x
# Expo CLI: 7.x

node --version   # v18.19.0 or v20.x.x
npm --version    # 9.x.x or 10.x.x
npx expo --version  # 7.x.x
```

## 🏃‍♂️ Quick Recovery Commands

If nothing works, try this complete reset:

```bash
# 1. Update Node.js (using NVM)
nvm install --lts
nvm use --lts

# 2. Clean everything
rm -rf node_modules package-lock.json
npm cache clean --force

# 3. Reinstall Expo CLI
npm uninstall -g @expo/cli
npm install -g @expo/cli@latest

# 4. Reinstall dependencies
npm install

# 5. Start fresh
npm start
```

## 📱 Testing Different Platforms

Once working, test on different platforms:

```bash
# Web (immediate testing)
npm run web

# Mobile via Expo Go app
npm start  # Scan QR code

# Android emulator (if Android Studio installed)
npm run android
```

## 🆘 Still Having Issues?

1. **Check system requirements:**
   - Linux: Ubuntu 18.04+, Fedora 28+, or equivalent
   - RAM: 4GB minimum (8GB recommended)
   - Node.js: 16+ (18+ LTS recommended)

2. **Common environment issues:**
   - Firewall blocking Metro bundler
   - Antivirus interfering with npm
   - Insufficient disk space
   - File permission issues

3. **Get help:**
   - Check Node.js version first: `node --version`
   - Clear all caches: `npm cache clean --force`
   - Try different terminal/shell
   - Restart computer if all else fails

The PIN Vault app should work perfectly once Node.js is updated! 🚀