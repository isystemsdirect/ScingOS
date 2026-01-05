#!/bin/bash

# ScingOS Development Environment Setup Script

set -e

echo "================================================"
echo "  ScingOS Development Environment Setup"
echo "================================================"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install Firebase CLI if not present
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI $(firebase --version) detected"
fi

# Install client dependencies
echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ Client dependencies installed"

# Install cloud functions dependencies
echo ""
echo "📦 Installing cloud functions dependencies..."
cd cloud/functions
npm install
cd ../..

echo "✅ Cloud functions dependencies installed"

# Create .env files if they don't exist
if [ ! -f "client/.env.local" ]; then
    echo ""
    echo "📝 Creating client/.env.local from .env.example..."
    cp .env.example client/.env.local
    echo "⚠️  Please update client/.env.local with your Firebase credentials"
fi

# Check Firebase login
echo ""
echo "🔐 Checking Firebase authentication..."
if firebase projects:list &> /dev/null; then
    echo "✅ Firebase authenticated"
else
    echo "⚠️  Please run: firebase login"
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Update client/.env.local with your Firebase config"
echo "  2. Run 'npm run dev' in the client directory"
echo "  3. Run 'npm run serve' in the cloud/functions directory"
echo ""
echo "Documentation: https://github.com/isystemsdirect/ScingOS"
echo ""