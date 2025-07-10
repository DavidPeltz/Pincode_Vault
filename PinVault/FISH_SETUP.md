# Fish Shell Setup Guide for PIN Vault App

## 🐟 Node.js Installation for Fish Shell

### Method 1: Fisher + NVM (Recommended)

#### Install Fisher (Fish Package Manager)
```fish
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
```

#### Install NVM for Fish
```fish
fisher install jorgebucaran/nvm.fish
```

#### Install Latest Node.js
```fish
# Install latest LTS Node.js
nvm install lts
nvm use lts

# Set as default
set -U nvm_default_version lts

# Verify installation
node --version  # Should show v18.x.x or v20.x.x
npm --version   # Should show 9.x.x or 10.x.x
```

### Method 2: Package Manager (Alternative)

#### Ubuntu/Debian
```fish
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Fedora/RHEL/CentOS
```fish
sudo dnf module install nodejs:18/common
node --version
```

#### Arch Linux
```fish
sudo pacman -S nodejs npm
node --version
```

### Method 3: Manual Download
1. Go to https://nodejs.org/
2. Download LTS version (18.x or 20.x)
3. Extract and install manually

## 🚀 PIN Vault App Setup

### Clone and Setup
```fish
# Clone the repository
git clone https://github.com/DavidPeltz/Pincode_Vault.git
cd Pincode_Vault

# Switch to the correct branch
git checkout cursor/design-a-secure-pin-code-storage-app-bca9

# Navigate to app directory
cd PinVault
```

### Install Dependencies
```fish
# Clean any existing installations
rm -rf node_modules package-lock.json
npm cache clean --force

# Install Expo CLI globally
npm install -g @expo/cli@latest

# Install project dependencies
npm install
```

### Environment Variables (if needed)
Add to `~/.config/fish/config.fish`:
```fish
# Android development (optional)
set -gx ANDROID_HOME $HOME/Android/Sdk
set -gx PATH $PATH $ANDROID_HOME/emulator $ANDROID_HOME/platform-tools

# Node.js path (if manually installed)
set -gx PATH $PATH /usr/local/bin/node /usr/local/bin/npm
```

Reload Fish config:
```fish
source ~/.config/fish/config.fish
```

## 🎯 Running the App

### Web Version (Easiest)
```fish
npm run web
```
- Opens in your default browser
- Perfect for testing all PIN Vault features

### Mobile Version
```fish
npm start
```
- Shows QR code in terminal
- Install "Expo Go" app on your phone
- Scan QR code to load app

### Android Emulator (if Android Studio installed)
```fish
npm run android
```

## 🔧 Troubleshooting Fish-Specific Issues

### Fix NVM Issues
```fish
# If nvm commands don't work
fisher update jorgebucaran/nvm.fish

# Or reinstall
fisher remove jorgebucaran/nvm.fish
fisher install jorgebucaran/nvm.fish
```

### Fix Permission Issues
```fish
# Fix npm permissions
sudo chown -R (whoami) ~/.npm
sudo chown -R (whoami) /usr/local/lib/node_modules
```

### Clear All Caches
```fish
# Clean npm and Metro caches
npm cache clean --force
npx expo start --clear
```

### Reset Everything
```fish
# Complete reset if nothing works
rm -rf node_modules package-lock.json
npm cache clean --force
npm uninstall -g @expo/cli
npm install -g @expo/cli@latest
npm install
```

## ✅ Verification Commands

```fish
# Check versions (should be recent)
node --version      # v18.x.x or v20.x.x
npm --version       # 9.x.x or 10.x.x
npx expo --version  # 7.x.x

# Check if in correct directory
pwd  # Should end with: /Pincode_Vault/PinVault
ls   # Should show: App.js, package.json, components/, etc.

# Test the app
npm run web  # Should open in browser
```

## 🐟 Fish Shell Tips

### Useful Fish Functions
Add to `~/.config/fish/config.fish`:
```fish
# Quick PIN Vault development
function pinvault
    cd ~/path/to/Pincode_Vault/PinVault
    npm run web
end

# Quick dependency reset
function npm-reset
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install
end
```

### Environment Check Function
```fish
function check-dev-env
    echo "Node.js version: "(node --version)
    echo "npm version: "(npm --version)
    echo "Expo CLI version: "(npx expo --version)
    echo "Current directory: "(pwd)
end
```

## 🎮 Testing the PIN Vault App

Once running, you can test:
- ✅ **Create 8x5 colored grids**
- ✅ **Tap cells to enter PIN digits**
- ✅ **Fill random digits for security**
- ✅ **Save multiple card grids**
- ✅ **Swipe through gallery**
- ✅ **Edit and delete grids**

## 📱 Platform Testing Options

```fish
# Web browser (immediate)
npm run web

# Mobile via Expo Go
npm start  # Scan QR code

# Android emulator (if available)
npm run android

# Check what's available
npm run  # Shows all available scripts
```

## 🆘 Common Fish Shell Errors

### "Command not found: nvm"
```fish
# Install nvm for fish
fisher install jorgebucaran/nvm.fish
```

### "Permission denied"
```fish
# Fix npm permissions
sudo chown -R (whoami) ~/.npm
```

### "Port already in use"
```fish
# Kill existing processes
npx expo start --clear --port 8082
```

### "Module not found"
```fish
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Quick Recovery Commands

If everything breaks:
```fish
# 1. Update Node.js
nvm install lts
nvm use lts

# 2. Clean everything
cd ~/path/to/Pincode_Vault/PinVault
rm -rf node_modules package-lock.json
npm cache clean --force

# 3. Reinstall tools
npm uninstall -g @expo/cli
npm install -g @expo/cli@latest

# 4. Reinstall dependencies
npm install

# 5. Test
npm run web
```

The PIN Vault app will work perfectly with Fish shell once Node.js is properly installed! 🐟🚀