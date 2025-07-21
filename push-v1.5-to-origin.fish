function push-v1.5-to-origin
    cd ~/AppProjects/Pincode_Vault
    
    # Verify we're on v1.5 branch
    set current_branch (git branch --show-current)
    
    if test "$current_branch" != "v1.5"
        echo "❌ Not on v1.5 branch (currently on $current_branch)"
        echo "Run 'git checkout v1.5' first"
        return 1
    end
    
    # Show what will be pushed
    echo "📋 Commits to be pushed to origin/v1.5:"
    git log --oneline origin/main..HEAD
    echo ""
    
    # Confirm before pushing
    read -l -P "Push v1.5 branch to origin? [y/N] " confirm
    
    if test "$confirm" = "y" -o "$confirm" = "Y"
        echo "🚀 Pushing v1.5 branch to origin..."
        git push -u origin v1.5
        
        if test $status -eq 0
            echo "✅ v1.5 branch successfully pushed to origin!"
            echo "🔗 You can now sync from origin/v1.5 on other machines"
            echo ""
            echo "To update your function, use:"
            echo "  update-pinvault v1.5"
        else
            echo "❌ Failed to push v1.5 branch"
            return 1
        end
    else
        echo "❌ Push cancelled"
        return 1
    end
end