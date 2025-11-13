# 🚀 Quick Start: Deploy to Render

## ✅ Perfect! Your Laravel files are at the root level

Since you've moved all Laravel files to the root, you're ready to deploy!

## Fast Deployment (5 minutes)

### 1. Push to GitHub
```bash
# From your project root (coresystem folder)
git add .
git commit -m "Ready for Render deployment"
git push
```

### 2. Create Render Services

#### Option A: Use Blueprint (Easiest - Recommended)
1. Go to [render.com](https://render.com) → **New +** → **Blueprint**
2. Connect your GitHub repo
3. Render will automatically create all services from `render.yaml`
4. Add your environment variables (see below)

#### Option B: Manual Setup

##### A. Create Database
1. Go to [render.com](https://render.com) → **New +** → **PostgreSQL**
2. Name: `uet-jkuat-db`
3. Plan: **Free**
4. Click **Create**

##### B. Create Web Service
1. **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `uet-jkuat-backend`
   - **Root Directory**: Leave empty (root is correct!) ✅
   - **Runtime**: `PHP`
   - **Build Command**: `chmod +x .render-build.sh && ./.render-build.sh`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`
4. Click **Create Web Service**

#### C. Add Environment Variables
In your web service → **Environment** tab, add:

**Minimum Required:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-name.onrender.com
APP_KEY=base64:YOUR_KEY_HERE

DB_CONNECTION=pgsql
# Database connection will be auto-set when you link the database

API_KEY=generate-random-key-here

MPESA_ENV=production
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-app-name.onrender.com/api/v1/payments/mpesa/callback
```

#### D. Link Database
1. In database service → **Connections** tab
2. Link your web service
3. This auto-sets `DB_CONNECTION` env var

#### E. Generate APP_KEY
1. Web service → **Shell** tab
2. Run: `php artisan key:generate`
3. Copy the key
4. Update `APP_KEY` in environment variables

#### F. Run Migrations
1. In Shell, run: `php artisan migrate --force`

#### G. Create Worker (Optional but Recommended)
1. **New +** → **Background Worker**
2. Same repo, **Root Directory**: Leave empty (root is correct!) ✅
3. Start Command: `php artisan queue:work --tries=3`
4. Build Command: `chmod +x .render-build.sh && ./.render-build.sh`
5. Link same database
6. Copy all environment variables from web service

### 3. Get Your URL
Your backend will be at: `https://your-app-name.onrender.com`

### 4. Update Frontend
In `uetjkuat-funding-platform/.env.local`:
```env
VITE_API_BASE_URL=https://your-app-name.onrender.com/api
VITE_API_KEY=your-api-key-here
```

## ✅ Done!

Your backend is now live! Test it:
- Health: `https://your-app-name.onrender.com/api/health`
- Projects: `https://your-app-name.onrender.com/api/v1/projects`

## 📝 Full Guide
See `RENDER_DEPLOYMENT.md` for detailed instructions.

