#!/bin/bash

# Heart Talk Book - Deployment Script for Surge.sh
# Usage: ./deploy.sh [domain-name]

set -e

echo "📚 Heart Talk Book - Deployment Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if surge is installed
if ! command -v surge &> /dev/null; then
    echo "📦 Surge is not installed. Installing surge globally..."
    npm install -g surge
    echo "✅ Surge installed successfully!"
    echo ""
fi

# Rebuild the site
echo "🔨 Rebuilding the website from Markdown..."
node build-site.js
echo ""

# Get domain name
DOMAIN="${1:-heart-talks.surge.sh}"

echo "🚀 Deploying to: $DOMAIN"
echo ""

# Create a temporary deployment directory to exclude unnecessary files
echo "📦 Preparing deployment files..."
mkdir -p deploy-temp
cp index.html deploy-temp/
cp book.css deploy-temp/
cp script.js deploy-temp/
cp -r chapters deploy-temp/

# Deploy
echo "🌐 Uploading to Surge.sh..."
cd deploy-temp
surge . "$DOMAIN"
cd ..

# Cleanup
rm -rf deploy-temp

echo ""
echo "✅ Deployment complete!"
echo "🌍 Your book is live at: https://$DOMAIN"
echo ""
echo "📋 Quick links:"
echo "   - View site: https://$DOMAIN"
echo "   - Update domain: surge teardown $DOMAIN"
echo "   - Redeploy: ./deploy.sh $DOMAIN"
echo ""
