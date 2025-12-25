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
ENV DEPLOY_THEME_SLUG=${DEPLOY_THEME_SLUG}

# Build based on DEPLOY_THEME_SLUG
# Railway passes environment variables that are available during build
RUN if [ -n "${DEPLOY_THEME_SLUG}" ]; then \
      echo "Building static theme export for: ${DEPLOY_THEME_SLUG}" && \
      DEPLOY_THEME_SLUG=${DEPLOY_THEME_SLUG} npm run build:theme; \
    else \
      echo "Building full CMS application" && \
      npm run build; \
    fi

# Setup phase - expose port
EXPOSE 4173

# Install serve for static theme hosting and make scripts executable
RUN npm install -g serve && \
    chmod +x scripts/docker-entrypoint.js && \
    chmod +x scripts/docker-theme-start.sh

# Start command - script will check DEPLOY_THEME_SLUG and route accordingly
CMD ["sh", "scripts/docker-theme-start.sh"]

