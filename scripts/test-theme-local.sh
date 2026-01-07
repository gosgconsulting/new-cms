#!/bin/bash
# Convenience script to test DEPLOY_THEME_SLUG locally without Docker
# Usage: ./scripts/test-theme-local.sh [theme-slug] [port] [backend-url] [tenant-id]

set -e  # Exit on error

# Get parameters with defaults
THEME_SLUG=${1:-landingpage}
PORT=${2:-4173}
BACKEND_URL=${3:-http://localhost:3000}
TENANT_ID=${4:-}

echo "=========================================="
echo "Local Theme Testing (No Docker)"
echo "=========================================="
echo "Theme: $THEME_SLUG"
echo "Port: $PORT"
echo "Backend URL: $BACKEND_URL"
echo "Tenant ID: ${TENANT_ID:-not set}"
echo "=========================================="
echo ""

# Check if theme exists
THEME_PATH="sparti-cms/theme/$THEME_SLUG"
if [ ! -d "$THEME_PATH" ]; then
  echo "❌ Error: Theme '$THEME_SLUG' not found at $THEME_PATH"
  echo ""
  echo "Available themes:"
  ls -1 sparti-cms/theme/ | grep -v "^custom$" || echo "  (none found)"
  exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "📦 Building theme..."
  DEPLOY_THEME_SLUG=$THEME_SLUG npm run build:theme
  
  if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Error: Build failed - dist directory is empty or missing"
    exit 1
  fi
  echo "✅ Build completed"
  echo ""
else
  echo "ℹ️  Using existing dist/ directory"
  echo "   (Run 'DEPLOY_THEME_SLUG=$THEME_SLUG npm run build:theme' to rebuild)"
  echo ""
fi

# Set environment variables
export DEPLOY_THEME_SLUG=$THEME_SLUG
export PORT=$PORT
export CMS_BACKEND_URL=$BACKEND_URL
export VITE_API_BASE_URL=$BACKEND_URL

if [ -n "$TENANT_ID" ]; then
  export CMS_TENANT=$TENANT_ID
  echo "✅ Tenant ID set: $TENANT_ID"
else
  echo "⚠️  Tenant ID not set (branding may not load)"
fi

echo ""
echo "🚀 Starting theme server..."
echo "   Theme: http://localhost:$PORT/"
echo "   Health: http://localhost:$PORT/health"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start the server
node scripts/serve-theme-static.js

