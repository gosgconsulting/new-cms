# Use Node.js 20 (matching package.json engines requirement)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Accept build arguments (Railway environment variables are available as build args)
# These will also be available as environment variables at runtime
ARG DEPLOY_THEME_SLUG
ARG VITE_API_BASE_URL
ARG RAILWAY_PUBLIC_DOMAIN
ARG GOOGLE_CLOUD_TRANSLATION_API_KEY
ARG VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY

# Set as environment variables so they're available at runtime too
ENV DEPLOY_THEME_SLUG=${DEPLOY_THEME_SLUG}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV RAILWAY_PUBLIC_DOMAIN=${RAILWAY_PUBLIC_DOMAIN}
ENV GOOGLE_CLOUD_TRANSLATION_API_KEY=${GOOGLE_CLOUD_TRANSLATION_API_KEY}
ENV VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY=${VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY}

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install to handle lock file sync issues)
RUN npm install

# Copy application code
COPY . .

# Build phase - check if building theme static export
# If DEPLOY_THEME_SLUG is set, build static theme export
# Otherwise, build the full CMS application
# Note: Railway environment variables are available at build time as ARG/ENV vars
# Railway automatically provides: RAILWAY_PUBLIC_DOMAIN, PORT, etc.

# Build based on DEPLOY_THEME_SLUG
# Auto-detect VITE_API_BASE_URL from Railway domain if not explicitly set
# Railway provides RAILWAY_PUBLIC_DOMAIN automatically (e.g., "your-app.railway.app")
RUN echo "[testing] Build phase - Checking DEPLOY_THEME_SLUG: ${DEPLOY_THEME_SLUG}" && \
    if [ -n "${DEPLOY_THEME_SLUG}" ] && [ "${DEPLOY_THEME_SLUG}" != "" ]; then \
      echo "[testing] Building standalone theme: Theme at / (no admin/CMS) for: ${DEPLOY_THEME_SLUG}" && \
      if [ -z "${VITE_API_BASE_URL}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN}" ]; then \
        export VITE_API_BASE_URL="https://${RAILWAY_PUBLIC_DOMAIN}" && \
        echo "[testing] Auto-detected VITE_API_BASE_URL from Railway domain: ${VITE_API_BASE_URL}"; \
      elif [ -z "${VITE_API_BASE_URL}" ]; then \
        export VITE_API_BASE_URL="http://localhost:4173" && \
        echo "[testing] WARNING: VITE_API_BASE_URL not set, using fallback: ${VITE_API_BASE_URL}"; \
      else \
        echo "[testing] Using provided VITE_API_BASE_URL: ${VITE_API_BASE_URL}"; \
      fi && \
      DEPLOY_THEME_SLUG=${DEPLOY_THEME_SLUG} CMS_TENANT=${CMS_TENANT} VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build:theme || exit 1; \
    else \
      echo "[testing] Building full CMS application (DEPLOY_THEME_SLUG not set)" && \
      if [ -z "${VITE_API_BASE_URL}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN}" ]; then \
        export VITE_API_BASE_URL="https://${RAILWAY_PUBLIC_DOMAIN}" && \
        echo "[testing] Auto-detected VITE_API_BASE_URL from Railway domain: ${VITE_API_BASE_URL}"; \
      elif [ -z "${VITE_API_BASE_URL}" ]; then \
        export VITE_API_BASE_URL="http://localhost:4173" && \
        echo "[testing] WARNING: VITE_API_BASE_URL not set, using fallback: ${VITE_API_BASE_URL}"; \
      else \
        echo "[testing] Using provided VITE_API_BASE_URL: ${VITE_API_BASE_URL}"; \
      fi && \
      VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build || exit 1; \
    fi

# Verify build output exists
RUN if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then \
      echo "ERROR: Build failed - dist directory is empty or missing" && \
      exit 1; \
    fi && \
    echo "Build verification passed: dist directory exists with files"

# Setup phase - expose port
EXPOSE 4173

# Make scripts executable
RUN chmod +x scripts/docker-entrypoint.js && \
    chmod +x scripts/docker-theme-start.js && \
    chmod +x scripts/serve-theme-static.js

# Start command - script will check DEPLOY_THEME_SLUG and route accordingly
# Use node directly to ensure proper execution
CMD ["node", "scripts/docker-theme-start.js"]

