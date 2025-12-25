# Use Node.js 20 (matching package.json engines requirement)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install to handle lock file sync issues)
RUN npm install

# Copy application code
COPY . .

# Build phase - check if building theme static export
# If DEPLOY_THEME_SLUG is set, build static theme export
# Otherwise, build the full CMS application
# Note: Railway environment variables are available at build time
ARG DEPLOY_THEME_SLUG
ARG VITE_API_BASE_URL
ENV DEPLOY_THEME_SLUG=${DEPLOY_THEME_SLUG}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build based on DEPLOY_THEME_SLUG
# Railway passes environment variables that are available during build
# When DEPLOY_THEME_SLUG is set, build hybrid app (theme + admin)
# Otherwise, build the full CMS application
# VITE_API_BASE_URL must be available at build time for frontend API calls
RUN if [ -n "${DEPLOY_THEME_SLUG}" ]; then \
      echo "Building hybrid app: Theme at /, Admin at /admin for: ${DEPLOY_THEME_SLUG}" && \
      echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" && \
      DEPLOY_THEME_SLUG=${DEPLOY_THEME_SLUG} VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build:theme; \
    else \
      echo "Building full CMS application" && \
      echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" && \
      VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build; \
    fi

# Setup phase - expose port
EXPOSE 4173

# Install serve for static theme hosting and make scripts executable
RUN npm install -g serve && \
    chmod +x scripts/docker-entrypoint.js && \
    chmod +x scripts/docker-theme-start.sh

# Start command - script will check DEPLOY_THEME_SLUG and route accordingly
CMD ["sh", "scripts/docker-theme-start.sh"]

