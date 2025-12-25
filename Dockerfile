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

# Build phase
RUN npm run build

# Setup phase - expose port
EXPOSE 4173

# Make entrypoint script executable
RUN chmod +x scripts/docker-entrypoint.js

# Start the production server with migrations
# The entrypoint script will:
# 1. Wait for database to be available
# 2. Run database migrations
# 3. Start the server
CMD ["node", "scripts/docker-entrypoint.js"]

