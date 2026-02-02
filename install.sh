#!/bin/bash

# Minecraft SSH System - Installation Script
# This script installs dependencies for both backend and frontend.

echo "🚀 Starting installation of Minecraft SSH System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

ROOT_DIR=$(pwd)

# 1. Install Backend Dependencies
echo "📦 Installing backend dependencies..."
cd "$ROOT_DIR/src" || exit
npm install

# 2. Install Frontend Dependencies
echo "🎨 Installing frontend dependencies..."
cd "$ROOT_DIR/src/frontend" || exit
npm install

# 3. Build Frontend (Optional, but recommended for production)
# echo "🏗️ Building frontend..."
# npm run build

cd "$ROOT_DIR" || exit

echo ""
echo "✅ Installation complete!"
echo "👉 You can now start the application by running 'npm start' in the src directory (if configured) or using 'src/start.bat' on Windows."
echo "👉 Alternatively, use 'docker-compose up -d' for containerized deployment."
