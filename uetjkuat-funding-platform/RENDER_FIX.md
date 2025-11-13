# Fix Render Deployment - Update Service Settings

## The Problem
Render is running `npm run dev` instead of `npm run start`, which causes port binding issues.

## Solution: Update Render Dashboard Settings

### Step 1: Go to Your Service
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click on your frontend service (e.g., `uet-jkuat-frontend`)

### Step 2: Update Service Settings
Go to **Settings** tab and update:

1. **Root Directory**: `uetjkuat-funding-platform`
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run start` ⚠️ **IMPORTANT: Change this from `npm run dev`**

### Step 3: Environment Variables
Make sure these are set in the **Environment** tab:

```
NODE_ENV=production
VITE_API_BASE_URL=https://uet-jkuat.onrender.com/api
VITE_API_KEY=your-api-key (if needed)
GEMINI_API_KEY=your-key (optional)
```

**Note**: Do NOT set `PORT` - Render sets this automatically.

### Step 4: Save and Redeploy
1. Click **Save Changes**
2. Go to **Manual Deploy** → **Deploy latest commit**
3. Or push a new commit to trigger auto-deploy

## Verification

After deployment, check the logs. You should see:
```
🚀 Server running at http://0.0.0.0:${PORT}
📦 Serving files from: /opt/render/project/src/uetjkuat-funding-platform/dist
```

Instead of:
```
VITE v6.4.1  ready in...
➜  Local:   http://localhost:5173/
```

## Alternative: Delete and Recreate Service

If updating doesn't work:

1. **Delete** the current service
2. **Create New Web Service**
3. Connect your GitHub repo
4. Use these exact settings:
   - **Name**: `uet-jkuat-frontend`
   - **Root Directory**: `uetjkuat-funding-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Starter` (free tier)

## Why This Happens

- `npm run dev` starts Vite dev server (for development)
- `npm run start` runs our custom `server.js` (for production)
- The custom server properly binds to `0.0.0.0` which Render requires

