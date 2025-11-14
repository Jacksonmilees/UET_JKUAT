#!/bin/bash
# Script to clear Laravel caches on Heroku
# Usage: ./clear-heroku-cache.sh

APP_NAME="uetjkuat-54286e10a43b"

echo "🧹 Clearing Laravel caches on Heroku..."
echo "App: $APP_NAME"
echo ""

echo "1️⃣ Clearing config cache..."
heroku run php artisan config:clear --app $APP_NAME

echo ""
echo "2️⃣ Clearing application cache..."
heroku run php artisan cache:clear --app $APP_NAME

echo ""
echo "3️⃣ Clearing route cache..."
heroku run php artisan route:clear --app $APP_NAME

echo ""
echo "4️⃣ Clearing view cache..."
heroku run php artisan view:clear --app $APP_NAME

echo ""
echo "✅ All caches cleared! CORS should now work."
echo ""
echo "🧪 Test CORS by visiting:"
echo "   https://uetjkuat-54286e10a43b.herokuapp.com/api/cors-test"

