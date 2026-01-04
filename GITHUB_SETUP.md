# GitHub Setup Instructions

## Prerequisites

1. **Install Git for Windows**
   - Download from: https://git-scm.com/download/win
   - Install with default settings
   - Restart your terminal after installation

2. **Create a GitHub Account** (if you don't have one)
   - Go to: https://github.com
   - Sign up for a free account

## Step-by-Step Guide

### Step 1: Create GitHub Repository

1. Log into GitHub
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `vikatalks` (or your preferred name)
4. Description: "English Learning Platform"
5. Choose: **Private** (recommended) or **Public**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 2: Copy Your Repository URL

After creating the repository, GitHub will show you the URL. It will look like:
```
https://github.com/YOUR_USERNAME/vikatalks.git
```

Copy this URL - you'll need it in the next step.

### Step 3: Run the Deployment Script

**Option A: Use the PowerShell Script (Easiest)**
1. Open PowerShell in your project folder
2. Run: `.\deploy-to-github.ps1`
3. Follow the prompts
4. Enter your GitHub repository URL when asked

**Option B: Run Commands Manually**

Open PowerShell in your project folder and run:

```powershell
# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - English Learning Platform"

# Add your GitHub repo (REPLACE WITH YOUR ACTUAL URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Set branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Important:** Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Step 4: Verify on GitHub

1. Go to your GitHub repository page
2. You should see all your files there
3. Your code is now on GitHub!

## Troubleshooting

### "Git is not recognized"
- Git is not installed or not in PATH
- Install Git from https://git-scm.com/download/win
- Restart your terminal after installation

### "Authentication failed"
- GitHub requires authentication
- Use GitHub Desktop, or
- Set up SSH keys, or
- Use a Personal Access Token

### "Repository not found"
- Check that the repository URL is correct
- Make sure the repository exists on GitHub
- Verify you have access to the repository

## Next Steps

After pushing to GitHub:
1. Connect to Railway (see Railway setup guide)
2. Deploy your application
3. Connect your domain


