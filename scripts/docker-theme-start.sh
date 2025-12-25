#!/bin/sh
# Docker startup script
# If DEPLOY_THEME_SLUG is set, serve standalone theme frontend (no backend, no CMS)
# Otherwise, start the full CMS server

if [ -n "$DEPLOY_THEME_SLUG" ]; then
  echo "Starting standalone theme deployment: Theme at / (no admin/CMS)"
  echo "Theme slug: $DEPLOY_THEME_SLUG"
  # Serve static files only - no backend, no database
  node scripts/serve-theme-static.js
else
  echo "Starting full CMS server"
  node scripts/docker-entrypoint.js
fi

