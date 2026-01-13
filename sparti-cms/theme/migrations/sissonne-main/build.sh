#!/bin/bash
set -e

# Build the client
echo "Building client..."
pnpm run build:client

# Create server directory
echo "Setting up server directory..."
mkdir -p dist/server

# Copy the standalone server file
echo "Copying server file..."
cp server/standalone-server.js dist/server/node-build.mjs

echo "Build completed successfully!"
