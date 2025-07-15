#!/bin/bash

echo "🚀 SupportIQ Vercel Deployment Helper";
echo "=====================================\n";

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!";
    echo "Run ./setup-env.sh first to create it.";
    exit 1;
fi

# Check for placeholder values
if grep -q "your_.*_here\|sk-your_\|pk_test_your_" .env.local; then
    echo "❌ Found placeholder values in .env.local!";
    echo "Please replace all placeholder values before deploying.";
    echo "";
    echo "Run: node check-setup.js to see what needs to be configured.";
    exit 1;
fi

echo "✅ Environment file looks good!";
echo "";

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI...";
    npm install -g vercel;
fi

echo "📋 ENVIRONMENT VARIABLES TO ADD TO VERCEL:";
echo "==========================================";
echo "";

# Extract and format environment variables
grep -v '^#' .env.local | grep -v '^$' | while read line; do
    if [[ $line =~ ^[A-Z_]+= ]]; then
        echo "  $line";
    fi;
done;

echo "";
echo "🔗 Vercel Dashboard Link:";
echo "https://vercel.com/dashboard/supportiq/settings/environment-variables";
echo "";

echo "📝 DEPLOYMENT STEPS:";
echo "===================";
echo "1. Go to the Vercel dashboard link above";
echo "2. Click 'Add New' for each environment variable above";
echo "3. Copy each line exactly as shown";
echo "4. Click 'Save' after adding all variables";
echo "5. Run: vercel --prod to deploy";
echo "";

echo "🤖 AUTOMATED DEPLOYMENT (Alternative):";
echo "======================================";
echo "If you want to deploy directly from CLI:";
echo "1. Run: vercel --prod";
echo "2. Follow the prompts to link your project";
echo "3. Vercel will automatically read .env.local";
echo "";

echo "✅ Ready to deploy!";
echo "Choose either manual (dashboard) or automated (CLI) method above."; 