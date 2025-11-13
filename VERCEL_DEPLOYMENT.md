# Vercel Frontend Deployment Guide

## Current Setup
- **Frontend**: Deployed on Vercel at `https://uet-jkuat.vercel.app/`
- **Backend**: Deployed on Render at `https://uet-jkuat.onrender.com`
- **API Base URL**: `https://uet-jkuat.onrender.com/api`

## ✅ CORS Configuration Updated

The backend CORS has been updated to allow:
- ✅ `https://uet-jkuat.vercel.app` (your Vercel frontend)
- ✅ All Vercel subdomains (`*.vercel.app` pattern)
- ✅ Localhost for development

## 🔧 Vercel Environment Variables

Make sure these are set in your Vercel project settings:

### Required Variables:
```
VITE_API_BASE_URL=https://uet-jkuat.onrender.com/api
VITE_API_KEY=your-api-key (if required by backend)
```

### Optional:
```
GEMINI_API_KEY=your-gemini-key (if using AI features)
```

## 📝 Setting Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `uet-jkuat`
3. Go to **Settings** → **Environment Variables**
4. Add the variables above
5. **Important**: Select all environments (Production, Preview, Development)
6. Redeploy your project

## 🚀 Deployment Configuration

### Vercel Auto-Detection
Vercel should auto-detect your React/Vite project. If not, configure:

**Build Settings:**
- **Framework Preset**: Vite
- **Root Directory**: `uetjkuat-funding-platform`
- **Build Command**: `npm run build` (or `cd uetjkuat-funding-platform && npm run build`)
- **Output Directory**: `uetjkuat-funding-platform/dist`
- **Install Command**: `npm install` (or `cd uetjkuat-funding-platform && npm install`)

### Custom `vercel.json` (Optional)
If you need custom routing, create `vercel.json` in the root:

```json
{
  "buildCommand": "cd uetjkuat-funding-platform && npm run build",
  "outputDirectory": "uetjkuat-funding-platform/dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🧪 Testing

### 1. Test Frontend
Visit: `https://uet-jkuat.vercel.app/`

### 2. Test API Connection
Open browser DevTools (F12) → Console
- Should see no CORS errors
- API calls should succeed

### 3. Test CORS from Terminal
```bash
curl.exe -H "Origin: https://uet-jkuat.vercel.app" \
         https://uet-jkuat.onrender.com/api/health \
         -v
```

Look for `Access-Control-Allow-Origin: https://uet-jkuat.vercel.app` in response headers.

## 🔄 Next Steps

### 1. Commit CORS Changes
```bash
git add config/cors.php
git commit -m "Add Vercel frontend to CORS allowed origins"
git push origin main
```

### 2. Deploy Backend Changes
- Render will auto-deploy when you push
- Or manually trigger deployment in Render dashboard

### 3. Clear Config Cache (After Deployment)
In Render Dashboard → Backend Service → Shell:
```bash
php artisan config:clear
php artisan cache:clear
```

### 4. Verify Frontend
- Visit `https://uet-jkuat.vercel.app/`
- Check browser console for errors
- Test API calls (login, projects, etc.)

## 🐛 Troubleshooting

### Issue: CORS errors in browser
**Solution**:
1. Verify CORS changes are deployed to Render
2. Clear backend config cache: `php artisan config:clear`
3. Check browser console for exact error
4. Verify `VITE_API_BASE_URL` is set correctly in Vercel

### Issue: API calls fail
**Solution**:
1. Check `VITE_API_BASE_URL` in Vercel environment variables
2. Verify backend is accessible: `curl https://uet-jkuat.onrender.com/api/health`
3. Check backend logs in Render dashboard
4. Verify CORS headers in Network tab

### Issue: 404 on routes
**Solution**:
- Vercel needs to serve `index.html` for all routes (SPA routing)
- Add `vercel.json` with rewrites (see above)
- Or configure in Vercel dashboard: Settings → Redirects

### Issue: Build fails on Vercel
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `rootDir` is set correctly
3. Ensure all dependencies are in `package.json`
4. Check Node.js version compatibility

## 📊 Deployment Checklist

- [ ] CORS updated to allow Vercel domain
- [ ] CORS changes committed and pushed
- [ ] Backend deployed on Render
- [ ] Config cache cleared on backend
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Frontend deployed on Vercel
- [ ] Frontend accessible at `https://uet-jkuat.vercel.app/`
- [ ] No CORS errors in browser console
- [ ] API calls working
- [ ] M-Pesa STK push testable

## 🔗 URLs Summary

- **Frontend**: https://uet-jkuat.vercel.app/
- **Backend API**: https://uet-jkuat.onrender.com/api
- **Backend Health**: https://uet-jkuat.onrender.com/api/health

## 🎯 Testing M-Pesa STK Push

Once everything is working:

1. Visit: `https://uet-jkuat.vercel.app/#/register`
2. Register a new account
3. When prompted for payment, enter phone: `0700088271` or `254700088271`
4. Complete the 100 KES mandatory contribution
5. You should receive an STK push on your phone



