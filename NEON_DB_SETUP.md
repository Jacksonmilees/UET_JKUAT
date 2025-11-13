# 🗄️ Using Neon DB with Render

## ✅ Yes, Neon DB Works Perfectly!

Neon DB is a serverless PostgreSQL database that works great with Laravel. Your connection string is already configured!

## 🔧 Your Neon DB Connection Details

From your connection string:
```
postgresql://neondb_owner:npg_0eOnTvcjFJV3@ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Parsed Details:**
- **Host**: `ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech`
- **Port**: `5432` (default)
- **Database**: `neondb`
- **Username**: `neondb_owner`
- **Password**: `npg_0eOnTvcjFJV3`
- **SSL**: Required

## 🚀 Deployment Steps

### Option 1: Using Blueprint (Easiest)

1. **Push your code to GitHub** (with updated `render.yaml`)

2. **Go to Render Dashboard** → **New +** → **Blueprint**

3. **Connect your repository**

4. **Render will create services automatically**

5. **Add Environment Variables** in Render dashboard:
   - Go to your web service → **Environment** tab
   - Add `DB_PASSWORD` = `npg_0eOnTvcjFJV3`
   - All other DB variables are already in `render.yaml`

### Option 2: Manual Setup

1. **Create Web Service** in Render:
   - **New +** → **Web Service**
   - Connect your GitHub repo
   - **Root Directory**: Leave empty (root is correct)
   - **Build Command**: `chmod +x .render-build.sh && ./.render-build.sh`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`

2. **Add Environment Variables** in Render dashboard:

   **Database Variables:**
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech
   DB_PORT=5432
   DB_DATABASE=neondb
   DB_USERNAME=neondb_owner
   DB_PASSWORD=npg_0eOnTvcjFJV3
   DB_SSLMODE=require
   ```

   **App Variables:**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-app-name.onrender.com
   APP_KEY=base64:YOUR_GENERATED_KEY
   
   LOG_CHANNEL=stderr
   LOG_LEVEL=error
   
   API_KEY=your-secure-api-key
   ```

   **MPesa Variables:**
   ```env
   MPESA_ENV=production
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://your-app-name.onrender.com/api/v1/payments/mpesa/callback
   # ... add all other MPesa variables
   ```

3. **Create Background Worker** (same environment variables)

4. **Generate APP_KEY**:
   - Go to **Shell** in Render dashboard
   - Run: `php artisan key:generate`
   - Copy the key and update `APP_KEY` in environment variables

5. **Run Migrations**:
   - In Shell, run: `php artisan migrate --force`

## ✅ What's Already Configured

- ✅ `render.yaml` updated with Neon DB connection
- ✅ `config/database.php` updated to support SSL mode
- ✅ SSL mode set to `require` for Neon DB

## 🧪 Test Connection

After deployment, test your database connection:

1. Go to **Shell** in Render dashboard
2. Run: `php artisan tinker`
3. Then: `DB::connection()->getPdo();`
4. If it returns a PDO object, connection is working! ✅

## 🔒 Security Notes

- ✅ SSL is required (already configured)
- ✅ Password is stored securely in Render environment variables
- ✅ Connection uses connection pooling (good for serverless)

## 📝 Benefits of Neon DB

- ✅ **Serverless** - Scales automatically
- ✅ **Free tier** available
- ✅ **Fast** - Low latency
- ✅ **Auto-scaling** - Handles traffic spikes
- ✅ **Connection pooling** - Better for serverless apps
- ✅ **Branching** - Create database branches for testing

## 🐛 Troubleshooting

### Connection Timeout
- Check that `DB_SSLMODE=require` is set
- Verify host, port, and credentials

### SSL Error
- Ensure `DB_SSLMODE=require` in environment variables
- Neon DB requires SSL connections

### Authentication Failed
- Double-check username and password
- Make sure password doesn't have extra spaces

### Database Not Found
- Verify database name is `neondb`
- Check in Neon DB dashboard

## 🔄 Alternative: Using DB_URL

You can also use the full connection string directly:

In Render environment variables, add:
```env
DB_URL=postgresql://neondb_owner:npg_0eOnTvcjFJV3@ep-square-moon-ah1uup8k-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Laravel will parse this automatically if `DB_URL` is set.

## ✅ You're All Set!

Your Neon DB is ready to use with Render. Just deploy and add the environment variables!

---

**Need Help?** Check the main `RENDER_DEPLOYMENT.md` guide for more details.

