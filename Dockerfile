# Use Node.js 20 (matching package.json engines requirement)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy application code
COPY . .

# Build phase
RUN npm run build

# Setup phase - expose port
EXPOSE 4173

# Start the production server
CMD ["npm", "start"]

