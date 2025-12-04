#!/bin/bash

# ScingOS Deployment Script

set -e

ENVIRONMENT=${1:-staging}

echo "================================================"
echo "  Deploying ScingOS to $ENVIRONMENT"
echo "================================================"
echo ""

# Confirm production deployment
if [ "$ENVIRONMENT" = "production" ]; then
    read -p "⚠️  Deploy to PRODUCTION? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

# Run tests first
echo "🧪 Running tests..."
./scripts/test.sh
echo ""

# Build
echo "🏗️  Building..."
./scripts/build.sh
echo ""

# Deploy client to Vercel
echo "🚀 Deploying client to Vercel..."
cd client
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
else
    vercel
fi
cd ..

echo "✅ Client deployed"
echo ""

# Deploy functions to Firebase
echo "🚀 Deploying functions to Firebase..."
firebase deploy --only functions --project "$ENVIRONMENT"

echo "✅ Functions deployed"
echo ""

# Deploy Firestore rules
echo "🚀 Deploying Firestore rules..."
firebase deploy --only firestore:rules --project "$ENVIRONMENT"

echo "✅ Firestore rules deployed"
echo ""

# Deploy Storage rules
echo "🚀 Deploying Storage rules..."
firebase deploy --only storage:rules --project "$ENVIRONMENT"

echo "✅ Storage rules deployed"
echo ""

echo "================================================"
echo "  ✅ Deployment to $ENVIRONMENT complete!"
echo "================================================"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌐 Client: https://scingos.isystemsdirect.com"
else
    echo "🌐 Client: https://scingos-staging.vercel.app"
fi

echo "🔥 Functions: https://console.firebase.google.com/project/$ENVIRONMENT/functions"