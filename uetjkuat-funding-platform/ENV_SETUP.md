# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `uetjkuat-funding-platform` directory with the following variables:

```env
# API Configuration
# Backend API URL (Laravel backend)
# For local development: http://localhost:8000/api
# For production (Render): https://uet-jkuat.onrender.com/api
VITE_API_BASE_URL=https://uet-jkuat.onrender.com/api

# API Key for protected endpoints (if required)
VITE_API_KEY=

# Gemini AI API Key (for AI features, optional)
GEMINI_API_KEY=

# Port for Vite dev server (Render will set this automatically)
PORT=5173
```

## Render Deployment

When deploying to Render, set these environment variables in the Render dashboard:

1. **VITE_API_BASE_URL**: `https://uet-jkuat.onrender.com/api`
2. **VITE_API_KEY**: (Your API key if required)
3. **GEMINI_API_KEY**: (Optional, for AI features)
4. **PORT**: (Automatically set by Render, but defaults to 5173)

## Local Development

For local development, create a `.env` file with:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=
GEMINI_API_KEY=
PORT=5173
```

## Notes

- All `VITE_` prefixed variables are exposed to the frontend code
- The `PORT` variable is used by Vite to bind the server to the correct port
- Make sure your backend CORS settings allow requests from your frontend domain

