# Deployment Configuration Summary

## Backend (Laravel)
- **URL**: https://uet-jkuat.onrender.com
- **API Endpoint**: https://uet-jkuat.onrender.com/api
- **Database**: Neon DB (PostgreSQL)
- **Configuration**: See root `render.yaml` and `RENDER_DEPLOYMENT.md`

## Frontend (React/Vite)
- **Build Output**: `uetjkuat-funding-platform/public/build/`
- **API Base URL**: Set via `VITE_API_BASE_URL` environment variable
- **Production URL**: Your Render frontend service URL

## Environment Variables

### Frontend (.env file in `uetjkuat-funding-platform/`)
```env
VITE_API_BASE_URL=https://uet-jkuat.onrender.com/api
VITE_API_KEY=your-api-key
GEMINI_API_KEY=your-gemini-key (optional)
```

### Backend (.env file in root)
See `RENDER_DEPLOYMENT.md` in the root directory for backend environment variables.

## Quick Deploy Checklist

### Frontend
- [ ] Set `VITE_API_BASE_URL` to your backend API URL
- [ ] Set `rootDir` to `uetjkuat-funding-platform` in Render
- [ ] Use `npm run build` for build command
- [ ] Use `npm run start` for start command
- [ ] Verify port binding to `0.0.0.0`

### Backend
- [ ] Configure Neon DB credentials
- [ ] Set M-Pesa credentials
- [ ] Configure CORS to allow frontend domain
- [ ] Set up background worker for queues

## CORS Configuration

Make sure your Laravel backend allows requests from your frontend domain. In `config/cors.php`:

```php
'allowed_origins' => [
    'https://your-frontend-domain.onrender.com',
    'http://localhost:5173', // For local development
],
```

