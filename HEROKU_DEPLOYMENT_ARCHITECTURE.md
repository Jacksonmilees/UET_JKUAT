# Heroku Deployment Architecture

## Current Setup

Your application is deployed to **Heroku** at:
- **URL**: `https://uetjkuat-54286e10a43b.herokuapp.com/`

## Architecture Explanation

### What's Happening on Heroku

When you deployed the root directory to Heroku, you're serving **BOTH**:

1. **Frontend (React App)**: 
   - Served from `index.html` in the root directory
   - This is your built React application
   - Users see this when they visit `https://uetjkuat-54286e10a43b.herokuapp.com/`

2. **Backend (Laravel API)**:
   - Available at `https://uetjkuat-54286e10a43b.herokuapp.com/api/*`
   - All API routes are accessible at the same domain
   - Handles all backend logic, database, M-Pesa, etc.

### How It Works

```
User visits: https://uetjkuat-54286e10a43b.herokuapp.com/
    ↓
Heroku serves: index.html (React Frontend)
    ↓
React app loads and makes API calls to: https://uetjkuat-54286e10a43b.herokuapp.com/api/*
    ↓
Laravel backend processes requests and returns data
```

## ✅ What I've Updated

1. **Frontend API Configuration** (`uetjkuat-funding-platform/services/api.ts`):
   - Changed default API URL to: `https://uetjkuat-54286e10a43b.herokuapp.com/api`
   - This means your React app will call the backend on the same Heroku domain

2. **CORS Configuration** (`config/cors.php`):
   - Added your Heroku domain to allowed origins
   - Added pattern to allow all Heroku subdomains
   - This allows the frontend to make API requests without CORS errors

## 🔧 Next Steps

### Option 1: Rebuild Frontend (Recommended)

Since the frontend API URL is hardcoded in the built assets, you need to rebuild:

1. **Set Environment Variable** (if using Vite):
   ```bash
   # In your local .env file in uetjkuat-funding-platform/
   VITE_API_BASE_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api
   ```

2. **Rebuild the Frontend**:
   ```bash
   cd uetjkuat-funding-platform
   npm run build
   ```

3. **Copy Built Files to Root**:
   - Copy the built `index.html` and `assets/` folder to the root directory
   - Or configure Heroku to serve from the build directory

4. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Update API URL for Heroku deployment"
   git push heroku main
   ```

### Option 2: Use Environment Variable in Heroku

If you want to set the API URL dynamically:

1. **In Heroku Dashboard**:
   - Go to Settings → Config Vars
   - Add: `VITE_API_BASE_URL=https://uetjkuat-54286e10a43b.herokuapp.com/api`

2. **Rebuild on Heroku**:
   - The build process will use this environment variable
   - Make sure your build command reads from environment variables

## 🧪 Testing

After deployment, test:

1. **Frontend**: Visit `https://uetjkuat-54286e10a43b.herokuapp.com/`
   - Should load your React app

2. **Backend API**: Visit `https://uetjkuat-54286e10a43b.herokuapp.com/api/health`
   - Should return: `{"status":"healthy",...}`

3. **API from Frontend**:
   - Open browser console
   - Try logging in or making any API call
   - Check Network tab - API calls should go to `/api/*` on the same domain

## 📝 Important Notes

1. **Same Domain = No CORS Issues**: 
   - Since frontend and backend are on the same domain, CORS is simpler
   - But we've still configured it properly for flexibility

2. **API Routes**:
   - All API routes are prefixed with `/api/`
   - Example: `https://uetjkuat-54286e10a43b.herokuapp.com/api/v1/projects`

3. **Static Assets**:
   - React assets (JS, CSS) are served from `/assets/`
   - Make sure these are accessible

4. **Laravel Public Directory**:
   - Heroku should be configured to serve from `public/` directory
   - But since you have `index.html` in root, it might be serving that first
   - Check your Heroku build configuration

## 🔍 Troubleshooting

### If Frontend Shows but API Calls Fail:

1. Check browser console for errors
2. Verify API URL in Network tab
3. Check CORS headers in response
4. Test API directly: `curl https://uetjkuat-54286e10a43b.herokuapp.com/api/health`

### If You See Laravel Welcome Page:

- Heroku is serving from `public/` directory
- You need to configure it to serve `index.html` for root route
- Or move `index.html` to `public/` directory

### If Assets Don't Load:

- Check that `assets/` folder is in the correct location
- Verify file paths in `index.html` match actual file locations
- Check Heroku build logs for asset compilation

## 🎯 Summary

**Your Heroku deployment serves BOTH frontend and backend on the same domain:**
- Frontend: `https://uetjkuat-54286e10a43b.herokuapp.com/` (React app)
- Backend: `https://uetjkuat-54286e10a43b.herokuapp.com/api/*` (Laravel API)

This is actually a **good setup** because:
- ✅ No CORS issues (same domain)
- ✅ Simpler deployment (one service)
- ✅ Lower latency (no cross-domain requests)

Just make sure to rebuild the frontend with the updated API URL!

