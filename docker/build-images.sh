#!/bin/bash

# Script to build Docker images for the Todo App

set -e  # Exit immediately if a command exits with a non-zero status

echo "Building Docker images for Todo App..."

# Build frontend image
echo "Building frontend image..."
docker build -f Dockerfile.frontend -t todo-frontend:latest .

# Build backend image
echo "Building backend image..."
docker build -f Dockerfile.backend -t todo-backend:latest .

# Build postgres image (using official image with custom config)
echo "Using official postgres:14 image with custom configuration..."

echo "Docker images built successfully!"
echo "Images:"
echo "  - todo-frontend:latest"
echo "  - todo-backend:latest"
echo "  - postgres:14 (official image)"

# Optionally tag with a version
VERSION=${1:-"v1.0.0"}
echo "Tagging images with version: $VERSION"
docker tag todo-frontend:latest todo-frontend:$VERSION
docker tag todo-backend:latest todo-backend:$VERSION

echo "Build complete!"