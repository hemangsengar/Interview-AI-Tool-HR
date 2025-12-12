#!/bin/bash

# Move Setup/Installation docs
mv QUICK_START.md docs/setup/ 2>/dev/null
mv LOCAL_SETUP_GUIDE.md docs/setup/ 2>/dev/null
mv BUILD_FROM_SCRATCH_GUIDE.md docs/setup/ 2>/dev/null
mv VIEW_DATABASE_GUIDE.md docs/setup/ 2>/dev/null
mv VIEW_DATA_README.md docs/setup/ 2>/dev/null
mv DATABASE_ACCESS_GUIDE.md docs/setup/ 2>/dev/null
mv DATA_ACCESS_GUIDE.md docs/setup/ 2>/dev/null
mv PROJECT_SUMMARY.md docs/setup/ 2>/dev/null
mv SECURITY_UPDATE.md docs/setup/ 2>/dev/null
mv SECRET_KEY_INFO.md docs/setup/ 2>/dev/null
mv BCRYPT_FIX_GUIDE.md docs/setup/ 2>/dev/null
mv RENDER_POSTGRESQL_SETUP.md docs/setup/ 2>/dev/null

# Move Deployment docs
mv DEPLOYMENT_GUIDE.md docs/deployment/ 2>/dev/null
mv DEPLOYMENT_CHECKLIST.md docs/deployment/ 2>/dev/null
mv PRODUCTION_READY.md docs/deployment/ 2>/dev/null
mv README_DEPLOYMENT.md docs/deployment/ 2>/dev/null
mv VERCEL_SETUP_GUIDE.md docs/deployment/ 2>/dev/null
mv RENDER_ENV_VARS.txt docs/deployment/ 2>/dev/null

# Move Feature docs
mv FEATURE_GUIDE.md docs/features/ 2>/dev/null
mv AVATAR_GUIDE.md docs/features/ 2>/dev/null
mv VIDEO_STORAGE_GUIDE.md docs/features/ 2>/dev/null
mv RATE_LIMITING_GUIDE.md docs/features/ 2>/dev/null
mv RATE_LIMITING_SUMMARY.md docs/features/ 2>/dev/null
mv RATE_LIMITING_VISUAL.md docs/features/ 2>/dev/null
mv RATE_LIMITING_QUICKSTART.md docs/features/ 2>/dev/null

# Move Troubleshooting docs
mv AUDIO_FILE_404_FIX.md docs/troubleshooting/ 2>/dev/null
mv AUDIO_DOUBLE_SLASH_FIX.md docs/troubleshooting/ 2>/dev/null
mv AUDIO_FIX_CHECKLIST.md docs/troubleshooting/ 2>/dev/null
mv AUDIO_CHUNKING_FIX.md docs/troubleshooting/ 2>/dev/null
mv FIX_AUDIO_ISSUES.md docs/troubleshooting/ 2>/dev/null
mv URGENT_FIX_AUDIO.md docs/troubleshooting/ 2>/dev/null
mv CORS_FIX.md docs/troubleshooting/ 2>/dev/null
mv VERCEL_404_FIX.md docs/troubleshooting/ 2>/dev/null
mv FINAL_FIX_401.md docs/troubleshooting/ 2>/dev/null
mv FIX_CORS_NOW.txt docs/troubleshooting/ 2>/dev/null

# Archive old/duplicate/emergency files
mv DEPLOY_NOW.md docs/archived/ 2>/dev/null
mv DEPLOY_NOW.txt docs/archived/ 2>/dev/null
mv EMERGENCY_DEPLOY.md docs/archived/ 2>/dev/null
mv URGENT_DEPLOY_NOW.txt docs/archived/ 2>/dev/null
mv DEPLOYMENT_FIX_NOW.md docs/archived/ 2>/dev/null
mv DEPLOY_FIX_NO_SHELL.md docs/archived/ 2>/dev/null
mv DEPLOY_AUDIO_FIX.txt docs/archived/ 2>/dev/null
mv DEPLOY_CHECKLIST.txt docs/archived/ 2>/dev/null
mv DEPLOY_HASHROUTER.txt docs/archived/ 2>/dev/null
mv FINAL_FIX_DEPLOY.txt docs/archived/ 2>/dev/null
mv FINAL_FIX_HASHROUTER.md docs/archived/ 2>/dev/null
mv FIX_404_NOW.txt docs/archived/ 2>/dev/null
mv FIX_CHECKLIST.txt docs/archived/ 2>/dev/null
mv QUICK_FIX.txt docs/archived/ 2>/dev/null
mv QUICK_DEPLOY.md docs/archived/ 2>/dev/null
mv BOTH_ISSUES_FIXED.md docs/archived/ 2>/dev/null
mv FIXED_SUMMARY.md docs/archived/ 2>/dev/null
mv VERCEL_DEPLOY_STEPS.txt docs/archived/ 2>/dev/null

echo "✅ Documentation organized!"
