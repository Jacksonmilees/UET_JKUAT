# Render Deployment Guide for Frontend

## Quick Setup

1. **Create a new Web Service on Render**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use the following settings:

2. **Service Configuration**
   - **Name**: `uet-jkuat-frontend` (or your preferred name)
   - **Root Directory**: `uetjkuat-funding-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

3. **Environment Variables** (Set in Render Dashboard)
   ```
   NODE_ENV=production
   VITE_API_BASE_URL=https://uet-jkuat.onrender.com/api
   VITE_API_KEY=your-api-key-here (if required)
   GEMINI_API_KEY=your-gemini-key (optional)
   ```
   Note: `PORT` is automatically set by Render, don't set it manually.

## Important Notes

- The `start` command uses `vite preview` which serves the built static files
- Make sure your backend CORS settings allow requests from your frontend domain
- The frontend will be available at a URL like: `https://uet-jkuat-frontend.onrender.com`

## Troubleshooting

### Port Binding Issues
If you see "No open ports detected", make sure:
1. `vite.config.ts` has `host: '0.0.0.0'` in both `server` and `preview` config
2. The `start` command uses `vite preview --host 0.0.0.0`
3. Render automatically sets the `PORT` environment variable

### API Connection Issues
- Verify `VITE_API_BASE_URL` is set correctly in Render dashboard
- Check that your backend is running and accessible
- Ensure CORS is configured on the backend to allow your frontend domain

### Build Issues
- Make sure `rootDir` is set to `uetjkuat-funding-platform` in Render
- Check that all dependencies are in `package.json`
- Review build logs for any missing dependencies

