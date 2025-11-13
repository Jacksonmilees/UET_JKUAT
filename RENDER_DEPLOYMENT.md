# Deploying Laravel Backend to Render

This guide will help you deploy your Laravel backend to Render.

## 📁 Which Folder to Deploy?

**Deploy the `main-system/` folder** - This contains your Laravel application.

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub/GitLab/Bitbucket
2. The `main-system/` folder should be at the root or you'll need to set the root directory in Render

### Step 2: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Sign up for a free account (or login)
3. Connect your GitHub/GitLab account

### Step 3: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name it: `uet-jkuat-db`
3. Select **Free** plan (or paid for production)
4. Choose region closest to Kenya (or your preference)
5. Click **"Create Database"**
6. **Save the connection details** - you'll need them

### Step 4: Deploy Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your repository
3. **Important Settings:**
   - **Name**: `uet-jkuat-backend`
   - **Root Directory**: `main-system` (if your repo has the folder structure)
   - **Runtime**: `PHP`
   - **Build Command**: `chmod +x .render-build.sh && ./.render-build.sh`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`
   - **Plan**: Free (or Standard for production)

### Step 5: Configure Environment Variables

In the Render dashboard, go to your web service → **Environment** tab and add:

#### Required Variables:

```env
APP_NAME=UET JKUAT Funding
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-name.onrender.com
APP_KEY=base64:YOUR_GENERATED_KEY_HERE

LOG_CHANNEL=stderr
LOG_LEVEL=error

# Database (Render provides this automatically if you link the database)
# Or set manually:
DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

# Cache & Queue
CACHE_STORE=file
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120

# API
API_KEY=your-secure-random-api-key-here

# MPesa Configuration
MPESA_ENV=production
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-app-name.onrender.com/api/v1/payments/mpesa/callback
MPESA_CALLBACK_SECRET=your_callback_secret
MPESA_TREASURER_NUMBERS=2547XXXXXXXX,2547YYYYYYYY
MPESA_DEFAULT_ACCOUNT_REFERENCE=UETFUND
MPESA_DEFAULT_ACCOUNT_TYPE_ID=1
MPESA_DEFAULT_ACCOUNT_SUBTYPE_ID=1
MPESA_INITIATOR=your_initiator
MPESA_SECURITY_CREDENTIAL=your_security_credential
MPESA_PARTY_A=your_party_a

# MPesa B2C
MPESA_B2C_URL=https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest
MPESA_TOKEN_URL=https://api.safaricom.co.ke/oauth/v1/generate
MPESA_B2C_INITIATOR_NAME=your_initiator_name
MPESA_B2C_SECURITY_CREDENTIAL=your_b2c_security_credential
MPESA_B2C_SHORTCODE=your_b2c_shortcode
MPESA_B2C_RESULT_URL=https://your-app-name.onrender.com/api/v1/mpesa/b2c/result
MPESA_B2C_TIMEOUT_URL=https://your-app-name.onrender.com/api/v1/mpesa/b2c/timeout

# Mail (Optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=donotreply@uetjkuat.org
MAIL_FROM_NAME=UET JKUAT Funding
```

### Step 6: Generate APP_KEY

1. After first deployment, go to **Shell** in Render dashboard
2. Run: `php artisan key:generate`
3. Copy the generated key
4. Update `APP_KEY` in environment variables

### Step 7: Run Migrations

1. Go to **Shell** in Render dashboard
2. Run: `php artisan migrate --force`
3. (Optional) Run seeders: `php artisan db:seed`

### Step 8: Create Background Worker (Queue Processor)

1. In Render Dashboard, click **"New +"** → **"Background Worker"**
2. Connect same repository
3. **Settings:**
   - **Name**: `uet-jkuat-worker`
   - **Root Directory**: `main-system`
   - **Runtime**: `PHP`
   - **Build Command**: `chmod +x .render-build.sh && ./.render-build.sh`
   - **Start Command**: `php artisan queue:work --tries=3 --timeout=90`
   - **Plan**: Free (or Standard)
4. Add same environment variables as web service

### Step 9: Link Database to Services

1. In your database service, go to **"Connections"** tab
2. Link both web service and worker to the database
3. This automatically sets `DB_CONNECTION` environment variable

## 🔧 Alternative: Using render.yaml (Blueprint)

If you want to use the `render.yaml` file:

1. Push `render.yaml` to your repository root
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically create all services from the YAML file
5. You'll still need to add environment variables manually

## 📝 Important Notes

### 1. Root Directory
- If your Laravel app is in `main-system/` folder, set **Root Directory** to `main-system` in Render
- Or move all files to repository root

### 2. Database Connection
- Render provides PostgreSQL by default
- Update `config/database.php` if needed for PostgreSQL
- Connection string is automatically set when you link the database

### 3. File Storage
- Render's file system is ephemeral (files are lost on restart)
- Use S3 or database for file storage
- Or use Render's persistent disk (paid feature)

### 4. Queue Workers
- Must run as separate Background Worker service
- Web service cannot run queue workers continuously

### 5. MPesa Callback URL
- Update `MPESA_CALLBACK_URL` with your Render app URL
- Format: `https://your-app-name.onrender.com/api/v1/payments/mpesa/callback`
- Must be HTTPS (Render provides this automatically)

### 6. Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid plan for always-on service

## 🧪 Testing Deployment

1. Visit your Render app URL: `https://your-app-name.onrender.com`
2. Test health endpoint: `https://your-app-name.onrender.com/api/health`
3. Test API: `https://your-app-name.onrender.com/api/v1/projects`

## 🔄 Updating Frontend

After deployment, update your frontend `.env.local`:

```env
VITE_API_BASE_URL=https://your-app-name.onrender.com/api
VITE_API_KEY=your-api-key-here
```

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `composer.json` is correct
- Verify PHP version (Laravel 11 needs PHP 8.2+)

### Database Connection Error
- Verify database is linked to service
- Check environment variables
- Test connection in Shell: `php artisan tinker` → `DB::connection()->getPdo()`

### 500 Errors
- Check logs in Render dashboard
- Verify `APP_KEY` is set
- Check `APP_DEBUG=true` temporarily to see errors
- Run `php artisan config:clear` in Shell

### Queue Not Processing
- Ensure Background Worker service is running
- Check worker logs
- Verify `QUEUE_CONNECTION=database`

## 📚 Resources

- [Render PHP Documentation](https://render.com/docs/php)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub/GitLab
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Web service deployed
- [ ] Environment variables configured
- [ ] APP_KEY generated
- [ ] Database migrations run
- [ ] Background worker created
- [ ] MPesa callback URL updated
- [ ] Frontend API URL updated
- [ ] Health endpoint tested
- [ ] MPesa integration tested

---

**Your backend will be live at**: `https://your-app-name.onrender.com`

