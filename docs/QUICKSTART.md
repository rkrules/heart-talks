# 🚀 Quick Start Guide

## View Your Website Locally

Simply open `index.html` in your web browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or drag `index.html` into your browser window.

## Deploy to Surge.sh (Recommended)

### Simple Deployment (3 steps)

```bash
# 1. Install surge (one-time only)
npm install -g surge

# 2. Deploy using the script
./deploy.sh

# 3. Visit your site
# Opens at: https://heart-talks.surge.sh
```

### Custom Domain

```bash
./deploy.sh my-custom-domain.surge.sh
```

## Alternative: Manual Deployment

```bash
# From the project directory
surge . heart-talks.surge.sh
```

## Rebuild After Editing Markdown

If you update `Heart Talk - Formatted.md`:

```bash
# Regenerate all HTML files
node build-site.js

# Deploy the updates
./deploy.sh
```

## File Overview

```
📦 Your Website Files:
├── index.html          ← Landing page (open this first!)
├── book.css            ← All styles
├── script.js           ← Interactive features
└── chapters/           ← 63 individual chapter pages
    ├── chapter1.html
    ├── chapter2.html
    └── ...

📦 Build Files:
├── build-site.js       ← Generator script
├── deploy.sh           ← Deployment helper
└── Heart Talk - Formatted.md  ← Source content
```

## Test Locally with a Server (Optional)

For better testing, use a local server:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx http-server

# Option 3: PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

## Keyboard Shortcuts (When Viewing Chapters)

- **← →** - Navigate chapters
- **H** or **Esc** - Back to Table of Contents

## Troubleshooting

### "surge: command not found"

Install surge globally:

```bash
npm install -g surge
```

If you don't have npm, install Node.js first from: https://nodejs.org

### Chapters not showing?

Rebuild the site:

```bash
node build-site.js
```

### Want to change colors/fonts?

Edit `book.css` - all styles are in one file with clear comments.

---

## 🎉 That's It!

Your beautiful book website is ready to go. Deploy and share!

**Live URL**: `https://heart-talks.surge.sh` (or your custom domain)
