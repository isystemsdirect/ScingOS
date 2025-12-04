#!/bin/bash

# ScingOS Build Script

set -e

echo "================================================"
echo "  Building ScingOS for Production"
echo "================================================"
echo ""

# Build client
echo "🏗️  Building client..."
cd client
npm run build
CLIENT_EXIT=$?
cd ..

if [ $CLIENT_EXIT -ne 0 ]; then
    echo "❌ Client build failed"
    exit 1
fi

echo "✅ Client built successfully"
echo ""

# Build cloud functions
echo "🏗️  Building cloud functions..."
cd cloud/functions
npm run build
FUNCTIONS_EXIT=$?
cd ../..

if [ $FUNCTIONS_EXIT -ne 0 ]; then
    echo "❌ Functions build failed"
    exit 1
fi

echo "✅ Functions built successfully"
echo ""

echo "================================================"
echo "  ✅ Build complete!"
echo "================================================"
echo ""
echo "Output:"
echo "  - Client: client/.next/"
echo "  - Functions: cloud/functions/lib/"