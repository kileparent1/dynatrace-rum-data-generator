# GitHub Authentication Setup

To push your code to GitHub, you need to authenticate. Here are your options:

## Option 1: GitHub CLI (Recommended)

```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Authenticate
gh auth login

# Push your code
git push -u origin main
```

## Option 2: Personal Access Token

1. **Generate a token:**
   - Go to: https://github.com/settings/tokens
   - Click: "Generate new token" → "Generate new token (classic)"
   - Name: `KP-RUMGEN`
   - Scopes: Select `repo` (all sub-options)
   - Click: "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Configure git to use the token:**
   ```powershell
   # Set credential helper to store token
   git config --global credential.helper wincred
   
   # Or use Git Credential Manager
   winget install --id Git.Git
   ```

3. **Push (will prompt for username/token):**
   ```powershell
   git push -u origin main
   ```
   
   - Username: `kileparent1`
   - Password: **Paste your Personal Access Token**

## Option 3: SSH Key (Advanced)

1. **Generate SSH key:**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click: "New SSH key"
   - Paste your public key
   - Click: "Add SSH key"

3. **Update remote URL:**
   ```powershell
   git remote set-url origin git@github.com:kileparent1/dynatrace-rum-data-generator.git
   git push -u origin main
   ```

## Verify Authentication

After setting up authentication:

```powershell
# Test connection
git push -u origin main

# You should see:
# Enumerating objects...
# Counting objects...
# Writing objects...
# Branch 'main' set up to track remote branch 'main' from 'origin'
```

## Troubleshooting

### "Permission denied"
- Make sure your token has `repo` scope
- Check you're using the correct username: `kileparent1`
- Verify token hasn't expired

### "Authentication failed"
- Clear cached credentials: `git credential-manager clear`
- Try again: `git push -u origin main`

### Still having issues?
- Check git config: `git config --list`
- Check remote: `git remote -v`
- Verify GitHub username: https://github.com/kileparent1

---

## Quick Setup (Recommended)

```powershell
# Install GitHub CLI
winget install --id GitHub.cli

# Restart PowerShell, then:
gh auth login

# Follow the prompts:
# - What account: GitHub.com
# - Protocol: HTTPS
# - Authenticate: Login with a web browser

# Then push:
git push -u origin main
```

**Repository URL:** https://github.com/kileparent1/dynatrace-rum-data-generator
