#!/bin/sh
# Docker startup script
# If DEPLOY_THEME_SLUG is set, build hybrid app (theme at /, admin at /admin) with backend
# Otherwise, start the full CMS server

if [ -n "$DEPLOY_THEME_SLUG" ]; then
  echo "Starting hybrid deployment: Theme at /, Admin at /admin"
  echo "Theme slug: $DEPLOY_THEME_SLUG"
  # Still need backend for /admin to work, so use the full server
  # The frontend build already includes both theme and admin routes
  node scripts/docker-entrypoint.js
else
  echo "Starting full CMS server"
  node scripts/docker-entrypoint.js
fi

