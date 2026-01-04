# Git Deployment Script for English Learning Platform
# Run this script AFTER installing Git and creating your GitHub repository

Write-Host "=== Git Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Cyan
git init

Write-Host ""
Write-Host "Step 2: Adding all files..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Step 3: Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit - English Learning Platform"

Write-Host ""
Write-Host "Step 4: Setting branch to 'main'..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "=== IMPORTANT ===" -ForegroundColor Yellow
Write-Host "Before continuing, you need to:" -ForegroundColor Yellow
Write-Host "1. Create a repository on GitHub (github.com)" -ForegroundColor Yellow
Write-Host "2. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)" -ForegroundColor Yellow
Write-Host ""
$repoUrl = Read-Host "Enter your GitHub repository URL"

if ($repoUrl) {
    Write-Host ""
    Write-Host "Step 5: Adding remote repository..." -ForegroundColor Cyan
    git remote add origin $repoUrl
    
    Write-Host ""
    Write-Host "Step 6: Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    Write-Host ""
    Write-Host "=== SUCCESS! ===" -ForegroundColor Green
    Write-Host "Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: $repoUrl" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "No repository URL provided. Skipping push." -ForegroundColor Yellow
    Write-Host "You can add the remote later with:" -ForegroundColor Yellow
    Write-Host "  git remote add origin YOUR_REPO_URL" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor Yellow
}


