#!/bin/sh
# Docker startup script
# If DEPLOY_THEME_SLUG is set, serve standalone theme frontend (no backend, no CMS)
# Otherwise, start the full CMS server

set -e  # Exit on error

if [ -n "$DEPLOY_THEME_SLUG" ]; then
  echo "[testing] Starting standalone theme deployment: Theme at / (no admin/CMS)"
  echo "[testing] Theme slug: $DEPLOY_THEME_SLUG"
  echo "[testing] PORT: ${PORT:-4173}"
  echo "[testing] Current directory: $(pwd)"
  echo "[testing] Node version: $(node --version)"
  # Serve static files only - no backend, no database
  exec node scripts/serve-theme-static.js
else
  echo "[testing] Starting full CMS server"
  exec node scripts/docker-entrypoint.js
fi

