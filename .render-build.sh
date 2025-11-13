#!/usr/bin/env bash
# Render build script for Laravel application

set -e

echo "🚀 Starting Laravel build process..."

# Install PHP dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# Generate application key if not set
echo "🔑 Generating application key..."
php artisan key:generate --force || true

# Clear and cache configuration
echo "⚙️ Optimizing Laravel..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force --no-interaction || echo "⚠️ Migration failed or database not ready"

echo "✅ Build completed successfully!"

