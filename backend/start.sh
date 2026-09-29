#!/bin/bash
set -e

# Clear any stale caches from the image build
php artisan optimize:clear

# Cache Laravel config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"