#!/bin/bash

# Heart Talk Website - Build All Script
# Runs all build scripts to generate the complete website

echo "🚀 Building Heart Talk website..."
echo ""

# Change to project root (parent of build/)
cd "$(dirname "$0")/.." || exit 1

echo "📖 Step 1/3: Generating Medical Glossary..."
node build/build-glossary.js
if [ $? -ne 0 ]; then
    echo "❌ Glossary generation failed!"
    exit 1
fi
echo ""

echo "📚 Step 2/3: Generating Main Website..."
node build/build-site.js
if [ $? -ne 0 ]; then
    echo "❌ Main site generation failed!"
    exit 1
fi
echo ""

echo "🖼️  Step 3/4: Generating Illustrated Website..."
node build/build-site-illustrated.js
if [ $? -ne 0 ]; then
    echo "❌ Illustrated site generation failed!"
    exit 1
fi
echo ""

echo "📄 Step 4/4: Generating PDFs..."
node build/generate-pdfs.js
if [ $? -ne 0 ]; then
    echo "❌ PDF generation failed!"
    exit 1
fi
echo ""

echo "✅ All builds complete! Ready to deploy."
echo ""
echo "📊 Generated files:"
echo "   • index.html + index-illustrated.html"
echo "   • glossary.html"
echo "   • 63 chapters (text + illustrated)"
echo "   • search-index.json"
echo "   • 64 PDFs (63 chapters + complete book)"
echo ""
echo "🚀 To deploy: ./build/deploy.sh"
echo "🧪 To test locally: ./build/test-locally.sh"
