#!/bin/bash

# Heart Talk Website - Local Testing Script
# This script starts a local web server for testing

echo "🚀 Starting Heart Talk Local Server..."
echo ""
echo "📍 Project directory: $(pwd)"
echo "🌐 Server will run at: http://localhost:8000"
echo ""
echo "✅ Once started:"
echo "   • Open your browser to: http://localhost:8000"
echo "   • Test search by clicking 🔍 Search or pressing Ctrl+K (Cmd+K on Mac)"
echo "   • Test glossary by clicking the link in footer"
echo ""
echo "⏹️  To stop the server: Press Ctrl+C"
echo ""
echo "─────────────────────────────────────────────────"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000
# Check if Python 2 is available
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8000
# Check if Node.js http-server is available
elif command -v http-server &> /dev/null; then
    echo "Using Node.js http-server..."
    http-server -p 8000
# Check if PHP is available
elif command -v php &> /dev/null; then
    echo "Using PHP..."
    php -S localhost:8000
else
    echo "❌ Error: No web server available!"
    echo ""
    echo "Please install one of the following:"
    echo "  • Python 3 (recommended)"
    echo "  • Node.js http-server: npm install -g http-server"
    echo "  • PHP"
    exit 1
fi
