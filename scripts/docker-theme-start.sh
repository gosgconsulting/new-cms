#!/bin/sh
# Docker startup script for theme static export
# If DEPLOY_THEME_SLUG is set, serve static theme
# Otherwise, start the full CMS server

if [ -n "$DEPLOY_THEME_SLUG" ]; then
  echo "Serving static theme: $DEPLOY_THEME_SLUG"
  serve -s dist-theme -l 4173
else
  echo "Starting full CMS server"
  node scripts/docker-entrypoint.js
fi

