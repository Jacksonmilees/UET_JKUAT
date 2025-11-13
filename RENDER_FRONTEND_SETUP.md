# Render Frontend Deployment - Complete Setup Guide

## The Problem
Render can't find the `start` script because it's looking in the wrong `package.json` file.

## Solution: Update Render Dashboard Settings

### Step 1: Go to Your Frontend Service
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click on your frontend service

### Step 2: Update Service Settings
Go to **Settings** tab and update these **EXACT** values:

#### Basic Settings:
- **Name**: `uet-jkuat-frontend` (or your preferred name)
- **Root Directory**: `uetjkuat-funding-platform` ⚠️ **CRITICAL**
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Plan**: `Starter` (free tier)

#### Build & Deploy:
- **Build Command**: `cd uetjkuat-funding-platform && npm install && npm run build`
- **Start Command**: `cd uetjkuat-funding-platform && npm run start` ⚠️ **MUST BE THIS**

**OR** if Root Directory is set correctly, you can use:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### Step 3: Environment Variables
In the **Environment** tab, add these variables:

```
NODE_ENV=production
VITE_API_BASE_URL=https://uet-jkuat.onrender.com/api
VITE_API_KEY=your-api-key (if needed)
GEMINI_API_KEY=your-key (optional)
```

**Important**: Do NOT set `PORT` - Render sets this automatically.

### Step 4: Save and Deploy
1. Click **Save Changes** at the bottom
2. Go to **Manual Deploy** → **Deploy latest commit**
3. Watch the logs to verify it works

## Verification

After deployment, check the logs. You should see:
```
🚀 Server running at http://0.0.0.0:${PORT}
📦 Serving files from: /opt/render/project/src/uetjkuat-funding-platform/dist
```

If you see:
```
npm error Missing script: "start"
```

Then the Root Directory is not set correctly, or the commands need the `cd` prefix.

## Alternative: Use Root Directory Approach

If the above doesn't work, try this configuration:

**Root Directory**: Leave **EMPTY** (root of repo)

**Build Command**: `cd uetjkuat-funding-platform && npm install && npm run build`

**Start Command**: `cd uetjkuat-funding-platform && npm run start`

This ensures we're always in the right directory.

## Troubleshooting

### Issue: "Missing script: start"
**Solution**: Make sure Root Directory is set to `uetjkuat-funding-platform` OR use `cd uetjkuat-funding-platform && npm run start` in Start Command.

### Issue: "No open ports detected"
**Solution**: This means `npm run dev` is still being used. Make absolutely sure Start Command is `npm run start` (or `cd uetjkuat-funding-platform && npm run start`).

### Issue: "Cannot find module 'server.js'"
**Solution**: The server.js file needs to be in the `uetjkuat-funding-platform` directory. Verify it exists there.

## File Structure Check

Make sure your repo has this structure:
```
/
├── package.json (root - has start script as backup)
├── uetjkuat-funding-platform/
│   ├── package.json (has start: "node server.js")
│   ├── server.js (the custom server)
│   ├── vite.config.ts
│   └── ... (other frontend files)
└── ... (other files)
```

## Quick Test

After updating settings, the deployment should:
1. ✅ Install dependencies
2. ✅ Build the app (creates `dist/` folder)
3. ✅ Start the server on `0.0.0.0:${PORT}`
4. ✅ Render detects the port and makes the service live

If any step fails, check the logs and verify the settings match this guide exactly.

