function update-pinvault
    set -l target_branch "v1.5"
    
    # Accept branch as argument (default to v1.5)
    if test (count $argv) -gt 0
        set target_branch $argv[1]
    end
    
    cd ~/AppProjects/Pincode_Vault

    # Force clean any local changes
    git add .
    git reset --hard HEAD
    git clean -fd

    # Fetch all branches from origin
    git fetch origin

    # Check if target branch exists on origin
    if git show-ref --verify --quiet refs/remotes/origin/$target_branch
        echo "Switching to $target_branch from origin..."
        git checkout $target_branch
        git reset --hard origin/$target_branch
    else if git show-ref --verify --quiet refs/heads/$target_branch
        echo "Switching to local $target_branch branch..."
        git checkout $target_branch
        echo "⚠️  Note: $target_branch exists locally but not on origin yet"
    else
        echo "❌ Branch $target_branch not found locally or on origin"
        echo "Available branches:"
        git branch -a
        return 1
    end

    cd PinVault
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install
    
    # Show current branch info
    set current_branch (git branch --show-current)
    set current_commit (git rev-parse --short HEAD)
    
    echo "✅ PIN Vault $current_branch ($current_commit) ready!"
    echo "🚀 Run 'npm start' to build and test the usability improvements"
    
    # Show what's new in v1.5 if that's the target
    if test "$target_branch" = "v1.5"
        echo ""
        echo "🎯 v1.5 Usability Improvements:"
        echo "  • 40-50% fewer touches for digit entry"
        echo "  • Auto-submit keyboard mode"
        echo "  • Inline picker mode (ultra-fast)"
        echo "  • Android-optimized keyboard handling"
        echo "  • Hardware back button support"
        echo "  • Material Design touch feedback"
        echo ""
        echo "📱 Test both input modes in GridEditor settings!"
    end
end