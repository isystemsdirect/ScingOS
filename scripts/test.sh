#!/bin/bash

# ScingOS Test Runner Script

set -e

echo "================================================"
echo "  Running ScingOS Test Suite"
echo "================================================"
echo ""

# Test client
echo "🧪 Testing client..."
cd client
npm test -- --coverage
CLIENT_EXIT=$?
cd ..

if [ $CLIENT_EXIT -ne 0 ]; then
    echo "❌ Client tests failed"
    exit 1
fi

echo "✅ Client tests passed"
echo ""

# Test cloud functions
echo "🧪 Testing cloud functions..."
cd cloud/functions
npm test
FUNCTIONS_EXIT=$?
cd ../..

if [ $FUNCTIONS_EXIT -ne 0 ]; then
    echo "❌ Functions tests failed"
    exit 1
fi

echo "✅ Functions tests passed"
echo ""

echo "================================================"
echo "  ✅ All tests passed!"
echo "================================================"