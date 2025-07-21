function update-pinvault
    cd ~/AppProjects/Pincode_Vault

    # Force clean any local changes and switch branches  
    git add .
    git reset --hard HEAD
    git clean -fd

    # Switch to v1.5 branch (usability improvements)
    git checkout v1.5
    git fetch origin
    git reset --hard origin/v1.5

    cd PinVault
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install
    echo "PIN Vault v1.5 with usability improvements ready! Run 'npm start' to build."
end