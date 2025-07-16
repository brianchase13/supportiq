#!/bin/bash

# Quick test runner for SupportIQ
# This script ensures tests run quickly and reliably

echo "🚀 Running SupportIQ tests..."

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Dev server not running. Starting it..."
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for dev server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo "✅ Dev server ready!"
            break
        fi
        sleep 2
    done
fi

# Run tests with optimized settings
echo "🧪 Running Playwright tests..."
npx playwright test \
    --workers=4 \
    --timeout=30000 \
    --reporter=html \
    --project=chromium

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    
    # Optional: Run all browsers if chromium passed
    if [ "$1" = "--all-browsers" ]; then
        echo "🌐 Running tests on all browsers..."
        npx playwright test --workers=2
    fi
else
    echo "❌ Tests failed!"
    exit 1
fi

# Cleanup
if [ ! -z "$DEV_PID" ]; then
    echo "🧹 Cleaning up dev server..."
    kill $DEV_PID 2>/dev/null
fi

echo "🎉 Test run complete!" 