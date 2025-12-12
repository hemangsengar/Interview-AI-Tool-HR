#!/bin/bash

# 🗂️ Documentation Organization Script
# This script organizes all documentation files into a clean structure

set -e  # Exit on error

echo "📁 Starting documentation organization..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create clean directory structure
echo ""
echo "${YELLOW}Creating directory structure...${NC}"

mkdir -p docs/{setup,features,troubleshooting,deployment,archived,api}

# Move files from root to appropriate locations
echo ""
echo "${YELLOW}Moving files to correct locations...${NC}"

# Rate Limiting docs → features/
if [ -f "RATE_LIMITING_GUIDE.md" ]; then
    echo "  Moving RATE_LIMITING_GUIDE.md → docs/features/"
    mv RATE_LIMITING_GUIDE.md docs/features/
fi

if [ -f "RATE_LIMITING_SUMMARY.md" ]; then
    echo "  Moving RATE_LIMITING_SUMMARY.md → docs/features/"
    mv RATE_LIMITING_SUMMARY.md docs/features/
fi

if [ -f "RATE_LIMITING_QUICKSTART.md" ]; then
    echo "  Moving RATE_LIMITING_QUICKSTART.md → docs/features/"
    mv RATE_LIMITING_QUICKSTART.md docs/features/
fi

if [ -f "RATE_LIMITING_VISUAL.md" ]; then
    echo "  Moving RATE_LIMITING_VISUAL.md → docs/features/"
    mv RATE_LIMITING_VISUAL.md docs/features/
fi

# Avatar Guide → features/
if [ -f "AVATAR_GUIDE.md" ]; then
    echo "  Moving AVATAR_GUIDE.md → docs/features/"
    mv AVATAR_GUIDE.md docs/features/
fi

# Audio fixes → troubleshooting/
if [ -f "AUDIO_FILE_404_FIX.md" ]; then
    echo "  Moving AUDIO_FILE_404_FIX.md → docs/troubleshooting/"
    mv AUDIO_FILE_404_FIX.md docs/troubleshooting/
fi

if [ -f "AUDIO_FIX_CHECKLIST.md" ]; then
    echo "  Moving AUDIO_FIX_CHECKLIST.md → docs/troubleshooting/"
    mv AUDIO_FIX_CHECKLIST.md docs/troubleshooting/
fi

if [ -f "AUDIO_DOUBLE_SLASH_FIX.md" ]; then
    echo "  Moving AUDIO_DOUBLE_SLASH_FIX.md → docs/troubleshooting/"
    mv AUDIO_DOUBLE_SLASH_FIX.md docs/troubleshooting/
fi

# Setup guides → setup/
if [ -f "LOCAL_SETUP_GUIDE.md" ]; then
    echo "  Moving LOCAL_SETUP_GUIDE.md → docs/setup/"
    mv LOCAL_SETUP_GUIDE.md docs/setup/
fi

if [ -f "BUILD_FROM_SCRATCH_GUIDE.md" ]; then
    echo "  Moving BUILD_FROM_SCRATCH_GUIDE.md → docs/setup/"
    mv BUILD_FROM_SCRATCH_GUIDE.md docs/setup/
fi

if [ -f "VIEW_DATABASE_GUIDE.md" ]; then
    echo "  Moving VIEW_DATABASE_GUIDE.md → docs/setup/"
    mv VIEW_DATABASE_GUIDE.md docs/setup/
fi

# Old deployment docs → archived/
if [ -f "FIX_VERCEL_404_NOW.md" ]; then
    echo "  Moving FIX_VERCEL_404_NOW.md → docs/archived/"
    mv FIX_VERCEL_404_NOW.md docs/archived/
fi

if [ -f "IMMEDIATE_FIX.md" ]; then
    echo "  Moving IMMEDIATE_FIX.md → docs/archived/"
    mv IMMEDIATE_FIX.md docs/archived/
fi

if [ -f "POSTGRESQL_DEPLOY.txt" ]; then
    echo "  Moving POSTGRESQL_DEPLOY.txt → docs/archived/"
    mv POSTGRESQL_DEPLOY.txt docs/archived/
fi

# Remove duplicate files
echo ""
echo "${YELLOW}Removing duplicate files...${NC}"

# Check for duplicates in docs/features/
if [ -f "docs/features/RATE_LIMITING_GUIDE.md" ]; then
    # Count how many rate limiting guides exist
    COUNT=$(find docs -name "RATE_LIMITING_GUIDE.md" | wc -l)
    if [ $COUNT -gt 1 ]; then
        echo "  Found duplicate rate limiting guides, keeping only in docs/features/"
        find docs -name "RATE_LIMITING_GUIDE.md" | grep -v "docs/features" | xargs rm -f
    fi
fi

# Create comprehensive README files
echo ""
echo "${YELLOW}Creating README files...${NC}"

# Create main docs README
cat > docs/README.md << 'EOF'
# 📚 Documentation Index

Welcome to the AI Interview Platform documentation!

## 📖 Quick Links

### 🚀 Getting Started
- [Local Setup Guide](setup/LOCAL_SETUP_GUIDE.md) - Set up the project on your machine
- [Build from Scratch](setup/BUILD_FROM_SCRATCH_GUIDE.md) - Complete guide for beginners
- [Quick Start](setup/QUICK_START.md) - Get running in 5 minutes

### 🎯 Features
- [Rate Limiting Guide](features/RATE_LIMITING_GUIDE.md) - API protection for free tier
- [Avatar Guide](features/AVATAR_GUIDE.md) - Understanding the AI interviewer avatars
- [Feature Guide](features/FEATURE_GUIDE.md) - All platform features explained

### 🔧 Troubleshooting
- [Audio Issues](troubleshooting/AUDIO_FILE_404_FIX.md) - Fix audio 404 errors
- [CORS Issues](troubleshooting/CORS_FIX.md) - Cross-origin problems
- [401 Authentication](troubleshooting/FINAL_FIX_401.md) - Login issues

### 🚢 Deployment
- [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md) - Deploy to Render + Vercel
- [Production Checklist](deployment/PRODUCTION_READY.md) - Pre-launch checklist
- [Environment Variables](deployment/RENDER_ENV_VARS.txt) - Required env vars

### 🗄️ Database
- [View Database Guide](setup/VIEW_DATABASE_GUIDE.md) - Access and query data
- [PostgreSQL Setup](setup/RENDER_POSTGRESQL_SETUP.md) - Render database setup

## 📂 Documentation Structure

```
docs/
├── setup/              # Installation and setup guides
├── features/           # Feature documentation
├── troubleshooting/    # Problem solving guides
├── deployment/         # Deployment guides
├── archived/           # Old/deprecated docs
└── api/                # API documentation (future)
```

## 🆘 Need Help?

1. Check the relevant section above
2. Search the troubleshooting folder
3. Check GitHub Issues
4. Read the main [README.md](../README.md)

## 🤝 Contributing

When adding new documentation:
- Place it in the appropriate folder
- Update this index
- Use clear, beginner-friendly language
- Include code examples
EOF

# Create setup README
cat > docs/setup/README.md << 'EOF'
# 🛠️ Setup Guides

This folder contains all guides related to setting up and configuring the project.

## 📋 Available Guides

- **LOCAL_SETUP_GUIDE.md** - Complete local development setup
- **BUILD_FROM_SCRATCH_GUIDE.md** - Build the entire project step by step
- **VIEW_DATABASE_GUIDE.md** - View and query database
- **QUICK_START.md** - Fast setup for experienced developers

## 🚀 Recommended Order

1. Start with LOCAL_SETUP_GUIDE.md
2. If issues, check troubleshooting folder
3. For database access, see VIEW_DATABASE_GUIDE.md
EOF

# Create features README
cat > docs/features/README.md << 'EOF'
# ✨ Feature Documentation

This folder contains detailed documentation for all platform features.

## 📋 Available Features

- **RATE_LIMITING_GUIDE.md** - API rate limiting for free tier protection
- **AVATAR_GUIDE.md** - AI interviewer avatar system
- **FEATURE_GUIDE.md** - Complete feature overview

## 🎯 Feature Highlights

### Rate Limiting
Protects your free-tier deployment from abuse with intelligent IP-based rate limiting.

### AI Avatars
Realistic video avatars that play during interviews, creating a human-like experience.

### Voice AI
Text-to-Speech (TTS) and Speech-to-Text (STT) for natural voice interviews.
EOF

# Create troubleshooting README
cat > docs/troubleshooting/README.md << 'EOF'
# 🔧 Troubleshooting Guides

This folder contains solutions to common problems.

## 📋 Common Issues

### Audio Problems
- **AUDIO_FILE_404_FIX.md** - Fix audio 404 errors
- **AUDIO_DOUBLE_SLASH_FIX.md** - Fix double slash in URLs
- **AUDIO_FIX_CHECKLIST.md** - Step-by-step audio debugging

### Authentication
- **FINAL_FIX_401.md** - Resolve 401 Unauthorized errors

### CORS Issues
- **CORS_FIX.md** - Fix cross-origin errors

## 🆘 Quick Debugging Steps

1. Check browser console (F12)
2. Check backend logs (Render dashboard)
3. Verify environment variables
4. Test API endpoints directly
EOF

# Create deployment README
cat > docs/deployment/README.md << 'EOF'
# 🚀 Deployment Guides

This folder contains guides for deploying to production.

## 📋 Available Guides

- **DEPLOYMENT_GUIDE.md** - Complete deployment walkthrough
- **PRODUCTION_READY.md** - Pre-launch checklist
- **VERCEL_SETUP_GUIDE.md** - Deploy frontend to Vercel
- **RENDER_ENV_VARS.txt** - Required environment variables

## 🎯 Deployment Platforms

- **Frontend:** Vercel (auto-deploy from GitHub)
- **Backend:** Render (free tier with PostgreSQL)

## ✅ Pre-Deployment Checklist

1. Test locally
2. Set all environment variables
3. Configure persistent disk (Render)
4. Test audio/voice features
5. Check rate limiting
EOF

echo ""
echo "${GREEN}✅ Documentation organized successfully!${NC}"
echo ""
echo "📂 Final structure:"
tree -L 2 docs/ 2>/dev/null || find docs -type d | sed 's|[^/]*/| |g'

echo ""
echo "${GREEN}🎉 Done! Check docs/README.md for the documentation index.${NC}"
