# Claude Reference Guide - Heart Talk Website

**Project:** Heart Talk - Comprehensive Heart Health Education Website
**Author:** Dr. Keshava Aithal
**Tech Stack:** Static HTML/CSS/JS, Node.js build scripts, Surge.sh + GitHub Pages hosting
**Repository:** github.com:rkrules/heart-talks.git

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Build System](#build-system)
5. [Translation System](#translation-system)
6. [PDF Generation](#pdf-generation)
7. [Deployment](#deployment)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [File Reference](#file-reference)

---

## 🚀 Quick Start

### Essential Commands

```bash
# Navigate to project
cd ~/Apps/claude/hralth

# Build entire website
./build/build-all.sh

# Deploy to Surge
surge . heart-talks.surge.sh

# Translate to Kannada (if needed)
node build/translate-to-kannada.js
node build/translate-glossary.js

# Generate PDFs
node build/generate-pdfs.js

# Git workflow
git add -A
git commit -m "Description"
git push
```

### Project Status (Current)

- ✅ 63 chapters of heart health content
- ✅ 64 downloadable PDFs (6.84 MB)
- ✅ 87% Kannada translation (chapters 1-55)
- ⏳ 13% pending (chapters 56-63, glossary)
- ✅ Language toggle UI
- ✅ Medical glossary
- ✅ Search functionality
- ✅ Responsive design

---

## 📖 Project Overview

### What This Is

Heart Talk is a comprehensive educational website featuring 63 chapters about cardiovascular health, written by Dr. Keshava Aithal. The website provides:

- **Educational Content:** In-depth articles about heart health topics
- **Medical Glossary:** 46 cardiovascular medical terms with definitions
- **PDF Export:** Download individual chapters or complete book
- **Bilingual Support:** English and Kannada (ಕನ್ನಡ) versions
- **Search Functionality:** Find content across all chapters
- **Illustrated Version:** Enhanced version with medical images (10 chapters)

### Key Features

1. **Static Site Generation**
   - Source: Markdown files
   - Output: HTML/CSS/JS
   - No database required
   - Fast, secure, CDN-friendly

2. **Bilingual Support**
   - English: index.html, chapters/
   - Kannada: index-kn.html, chapters-kn/
   - Language toggle on every page
   - Machine translation with Google Translate API

3. **PDF Export**
   - Individual chapter PDFs (63 files)
   - Complete book PDF (all chapters + glossary)
   - Professional formatting with page numbers
   - Generated via Puppeteer (headless Chrome)

4. **Medical Glossary**
   - 46 cardiovascular terms
   - Alphabetically organized
   - Linked from chapter content
   - Available in English and Kannada

---

## 🏗️ Architecture

### Content Flow

```
Source Markdown
    ↓
Build Scripts (Node.js)
    ↓
Generated HTML/CSS/JS
    ↓
Surge.sh Deployment (manual, includes Kannada)
GitHub Pages Deployment (automatic via GitHub Actions, English-only)
```

### Directory Structure

```
hralth/
├── Heart Talk - Formatted.md      # English source (510KB)
├── Heart Talk - Kannada.md        # Kannada source (727KB)
├── glossary-terms.json            # English glossary
├── glossary-terms-kannada.json   # Kannada glossary
├── book.css                       # Main stylesheet
├── search.js                      # Client-side search
├── index.html                     # English homepage (generated)
├── index-kn.html                  # Kannada homepage (generated)
├── glossary.html                  # English glossary (generated)
├── glossary-kn.html               # Kannada glossary (generated)
├── search-index.json              # Search index (generated)
│
├── chapters/                      # English chapters (generated)
│   ├── chapter1.html
│   ├── chapter2.html
│   └── ... (63 total)
│
├── chapters-kn/                   # Kannada chapters (generated)
│   ├── chapter1.html
│   ├── chapter2.html
│   └── ... (63 total)
│
├── pdfs/                          # PDF exports
│   ├── chapter1.pdf
│   ├── chapter2.pdf
│   ├── ... (63 total)
│   └── heart-talk-complete.pdf
│
├── images/                        # Medical illustrations
│   └── chapter_images.json        # Image mappings
│
├── build/                         # Build scripts
│   ├── build-all.sh              # Master build script
│   ├── build-site.js             # English site generator
│   ├── build-site-kannada.js     # Kannada site generator
│   ├── build-site-illustrated.js # Illustrated version generator
│   ├── build-glossary.js         # Glossary generator
│   ├── translate-to-kannada.js   # Main translation script
│   ├── translate-glossary.js     # Glossary translation
│   ├── retry-translation.js      # Retry failed translations
│   ├── generate-pdfs.js          # PDF generation via Puppeteer
│   ├── deploy.sh                 # Deployment script
│   └── test-locally.sh           # Local testing server
│
├── package.json                   # Node.js dependencies
├── node_modules/                  # Dependencies (not in Git)
├── .gitignore                     # Git exclusions
├── SESSION-SUMMARY.md             # Session documentation
├── TRANSLATION-STATUS.md          # Translation progress
└── CLAUDE.md                      # This file
```

---

## 🔧 Build System

### Master Build Script: `build/build-all.sh`

The build process runs in 5 sequential steps:

```bash
#!/bin/bash

# Step 1: Generate Medical Glossary
node build/build-glossary.js
# Output: glossary.html, glossary-kn.html

# Step 2: Generate Main Website (English)
node build/build-site.js
# Output: index.html, chapters/*.html, search-index.json

# Step 3: Generate Illustrated Website
node build/build-site-illustrated.js
# Output: index-illustrated.html

# Step 4: Generate PDFs
node build/generate-pdfs.js
# Output: pdfs/*.pdf (64 files)

# Step 5: Generate Kannada Website (if source exists)
if [ -f "Heart Talk - Kannada.md" ]; then
    node build/build-site-kannada.js
    # Output: index-kn.html, chapters-kn/*.html
fi
```

### Individual Build Scripts

#### 1. `build/build-glossary.js`
- Reads `glossary-terms.json`
- Generates alphabetically organized glossary
- Creates both English and Kannada versions
- Outputs: `glossary.html`, `glossary-kn.html`

#### 2. `build/build-site.js`
- Reads `Heart Talk - Formatted.md`
- Splits into 63 chapters
- Converts Markdown → HTML
- Applies formatting (title case, paragraphs, signatures)
- Generates table of contents
- Creates search index
- Outputs: `index.html`, `chapters/*.html`, `search-index.json`

#### 3. `build/build-site-kannada.js`
- Reads `Heart Talk - Kannada.md`
- Same processing as build-site.js
- Uses Kannada glossary
- Outputs: `index-kn.html`, `chapters-kn/*.html`

#### 4. `build/build-site-illustrated.js`
- Same as build-site.js
- Reads `images/chapter_images.json`
- Embeds medical illustrations (10 chapters have images)
- Outputs: `index-illustrated.html`

#### 5. `build/generate-pdfs.js`
- Uses Puppeteer (headless Chrome)
- Generates 63 individual chapter PDFs
- Creates complete book PDF (all chapters + glossary)
- Professional formatting with headers/footers
- Outputs: `pdfs/*.pdf` (64 files, 6.84 MB total)

---

## 🌐 Translation System

### Google Translate API Integration

**Package:** `@vitalets/google-translate-api` v9.2.0
**Method:** Free unofficial wrapper (no API key required)
**Limit:** ~100 requests/day per IP address
**Reset:** Every 24 hours

### Translation Scripts

#### 1. `build/translate-to-kannada.js`

Main translation script that converts all 63 chapters to Kannada.

**How it works:**
```javascript
const translate = require('@vitalets/google-translate-api').translate;

// Translate text to Kannada
async function translateText(text, targetLang = 'kn') {
    const result = await translate(text, { to: targetLang });
    return result.text;
}

// Process each chapter with rate limiting
for (let chapter of chapters) {
    const translated = await translateText(chapter.content);
    // Save to output file

    // Wait 1 second to avoid rate limits
    await sleep(1000);
}
```

**Features:**
- Preserves Markdown formatting
- Maintains chapter structure
- Rate limiting (1 second between calls)
- Progress reporting
- Error handling (returns original on failure)

**Usage:**
```bash
node build/translate-to-kannada.js
```

**Output:** `Heart Talk - Kannada.md` (727KB)

#### 2. `build/translate-glossary.js`

Translates medical glossary terms and definitions.

**Input:** `glossary-terms.json`
```json
{
  "terms": [
    {
      "term": "Angioplasty",
      "definition": "A medical procedure...",
      "relatedChapters": [12, 34]
    }
  ]
}
```

**Output:** `glossary-terms-kannada.json`
```json
{
  "terms": [
    {
      "term": "ಆಂಜಿಯೋಪ್ಲ್ಯಾಸ್ಟಿ",
      "definition": "ಒಂದು ವೈದ್ಯಕೀಯ ಪ್ರಕ್ರಿಯೆ...",
      "relatedChapters": [12, 34]
    }
  ]
}
```

**Usage:**
```bash
node build/translate-glossary.js
```

#### 3. `build/retry-translation.js`

Retry script for failed translations (chapters 56-63).

**When to use:** After hitting API rate limits

**Features:**
- Targets specific failed chapters
- Slower rate limiting (3 seconds)
- Updates existing file in-place
- Preserves completed translations

**Usage:**
```bash
node build/retry-translation.js
```

### Translation Workflow

**Initial Translation:**
```bash
# 1. Translate all chapters (expect to hit limits around chapter 56)
node build/translate-to-kannada.js

# 2. Translate glossary
node build/translate-glossary.js

# 3. Build Kannada site with partial content
./build/build-all.sh

# 4. Deploy what we have
surge . heart-talks.surge.sh
```

**Complete Translation (Next Day):**
```bash
# 1. Wait 24 hours for API reset

# 2. Retry failed chapters
node build/retry-translation.js

# 3. Complete glossary
node build/translate-glossary.js

# 4. Rebuild with 100% content
./build/build-all.sh

# 5. Redeploy
surge . heart-talks.surge.sh
```

### Current Translation Status

**Completed (87%):**
- Chapters 1-55: ✅ Fully translated
- Total characters: ~450KB of Kannada text

**Pending (13%):**
- Chapter 56: Indian Version of Mediterranean Diet
- Chapter 57: Pre-diabetes and Diabetes 101
- Chapter 58: Cardiac Arrest in Apparently Healthy Young Adults
- Chapter 59: Cardiovascular Effects of Snow Shoveling
- Chapter 60: Peripheral Arterial Disease
- Chapter 61: What Is Apo B Test and Who Should Have It
- Chapter 62: Prevent-new Cardiovascular Risk Estimation
- Chapter 63: Some Myths About Cardiovascular Care
- Glossary: 46 terms (partially complete)

---

## 📄 PDF Generation

### Puppeteer Setup

**Package:** `puppeteer` v21.0.0
**Size:** ~300MB (includes Chromium browser)
**Purpose:** Headless Chrome for PDF generation

### PDF Generation Process

#### Script: `build/generate-pdfs.js`

```javascript
const puppeteer = require('puppeteer');

async function generateChapterPDF(chapterNum) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Load chapter HTML
    const chapterPath = `file://${__dirname}/../chapters/chapter${chapterNum}.html`;
    await page.goto(chapterPath, { waitUntil: 'networkidle0' });

    // Generate PDF with options
    await page.pdf({
        path: `pdfs/chapter${chapterNum}.pdf`,
        format: 'A4',
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div>Heart Talk Collection</div>',
        footerTemplate: '<div><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    });

    await browser.close();
}
```

### PDF Features

**Individual Chapter PDFs:**
- Professional formatting
- Page numbers in footer
- Header with book title
- Print-optimized typography
- A4 page size
- 1-inch margins

**Complete Book PDF:**
- Cover page
- Table of contents with page numbers
- All 63 chapters
- Glossary appendix
- Continuous page numbering

### PDF Sizes

- Individual chapters: 60KB - 340KB each
- Complete book: 140KB
- **Total:** 6.84 MB (64 files)

### Enhanced Print CSS

Located in `book.css`:

```css
@media print {
    /* Page setup */
    @page {
        size: A4;
        margin: 1in;
    }

    /* Chapter page breaks */
    .chapter-content {
        page-break-before: always;
    }

    /* Prevent orphans/widows */
    p {
        orphans: 3;
        widows: 3;
        page-break-inside: avoid;
    }

    /* Remove interactive elements */
    .search-button,
    .chapter-navigation,
    .book-footer {
        display: none !important;
    }
}
```

---

## 🚀 Deployment

The site deploys to **two platforms** in parallel. Surge can return sporadic 500 errors; GitHub Pages is the reliable fallback.

### GitHub Pages (Automatic CI/CD)

**Platform:** GitHub Pages via GitHub Actions
**URL:** https://rkrules.github.io/heart-talks/
**Trigger:** Automatic on every push to `main`
**Workflow:** `.github/workflows/deploy.yml`

The workflow builds the HTML on every push and deploys via artifact upload — no generated files are ever committed to git. Kannada is English-only on GitHub Pages (Kannada source file is gitignored).

**To enable (one-time setup):**
1. Go to `github.com/rkrules/heart-talks` → Settings → Pages
2. Set **Source** to `GitHub Actions`
3. Save — deploys automatically on next push

### Surge.sh Configuration

**Platform:** Surge.sh (static site hosting)
**URL:** heart-talks.surge.sh
**Account:** rkrules@gmail.com (Student plan)
**Limit:** 200MB per deployment
**Current Size:** 12.9 MB (303 files)

### Surge Deployment Process

```bash
# 1. Build everything
./build/build-all.sh

# 2. Deploy to Surge
surge . heart-talks.surge.sh

# Output:
# Running as rkrules@gmail.com (Student)
# project: .
# domain: heart-talks.surge.sh
# size: 303 files, 12.9 MB
# Success! - Published to heart-talks.surge.sh
```

### Deployment Script: `build/deploy.sh`

```bash
#!/bin/bash

echo "🚀 Deploying Heart Talk website..."

# 1. Build everything
./build/build-all.sh

# 2. Deploy to Surge
surge . heart-talks.surge.sh

echo "✅ Deployment complete!"
echo "🌐 Visit: https://heart-talks.surge.sh"
```

### What Gets Deployed

**Included in deployment:**
- ✅ index.html, index-kn.html, index-illustrated.html
- ✅ chapters/*.html (63 files)
- ✅ chapters-kn/*.html (63 files)
- ✅ glossary.html, glossary-kn.html
- ✅ book.css, search.js
- ✅ search-index.json
- ✅ pdfs/*.pdf (64 files, 6.84 MB)
- ✅ images/ (medical illustrations)

**Excluded from deployment (in .gitignore):**
- ❌ node_modules/
- ❌ Heart Talk - Kannada.md (source file)
- ❌ glossary-terms-kannada.json (source file)
- ❌ .git/

### Live URLs

**GitHub Pages (reliable fallback):**
- **English Homepage:** https://rkrules.github.io/heart-talks/
- **Glossary:** https://rkrules.github.io/heart-talks/glossary.html
- **Example Chapter:** https://rkrules.github.io/heart-talks/chapters/chapter1.html
- **Example PDF:** https://rkrules.github.io/heart-talks/pdfs/chapter1.pdf

**Surge (with Kannada support):**
- **English Homepage:** https://heart-talks.surge.sh
- **Kannada Homepage:** https://heart-talks.surge.sh/index-kn.html
- **Illustrated Version:** https://heart-talks.surge.sh/index-illustrated.html
- **Glossary:** https://heart-talks.surge.sh/glossary.html
- **Example Chapter:** https://heart-talks.surge.sh/chapters/chapter1.html
- **Example PDF:** https://heart-talks.surge.sh/pdfs/chapter1.pdf

---

## 🛠️ Common Tasks

### 1. Add a New Chapter

```bash
# 1. Edit source Markdown
nano "Heart Talk - Formatted.md"
# Add: ## Heart Talk #64: Title...

# 2. Rebuild site
./build/build-all.sh

# 3. Commit and deploy
git add "Heart Talk - Formatted.md"
git commit -m "Add chapter 64: [Title]"
git push
surge . heart-talks.surge.sh
```

### 2. Update Existing Chapter

```bash
# 1. Edit source
nano "Heart Talk - Formatted.md"
# Modify chapter content

# 2. Rebuild
./build/build-all.sh

# 3. Commit and deploy
git add "Heart Talk - Formatted.md"
git commit -m "Update chapter X: [what changed]"
git push
surge . heart-talks.surge.sh
```

### 3. Add a Glossary Term

```bash
# 1. Edit glossary
nano glossary-terms.json
# Add new term with definition

# 2. Rebuild
./build/build-all.sh

# 3. Commit and deploy
git add glossary-terms.json
git commit -m "Add glossary term: [term name]"
git push
surge . heart-talks.surge.sh
```

### 4. Update Styles

```bash
# 1. Edit CSS
nano book.css
# Make style changes

# 2. No rebuild needed (CSS is static)

# 3. Commit and deploy
git add book.css
git commit -m "Update styles: [what changed]"
git push
surge . heart-talks.surge.sh
```

### 5. Regenerate All PDFs

```bash
# 1. Generate PDFs
node build/generate-pdfs.js

# 2. Commit (if PDFs changed significantly)
git add pdfs/
git commit -m "Regenerate PDFs with updated content"
git push

# 3. Deploy
surge . heart-talks.surge.sh
```

### 6. Complete Kannada Translation

```bash
# 1. Wait 24 hours after last translation

# 2. Retry failed chapters
node build/retry-translation.js

# 3. Complete glossary
node build/translate-glossary.js

# 4. Rebuild Kannada site
./build/build-all.sh

# 5. Verify quality
open index-kn.html
# Check chapters 56-63

# 6. Commit
git add "Heart Talk - Kannada.md" glossary-terms-kannada.json
git commit -m "Complete Kannada translation to 100%"
git push

# 7. Deploy
surge . heart-talks.surge.sh

# 8. Update status
echo "✅ COMPLETE (100%)" > TRANSLATION-STATUS.md
git add TRANSLATION-STATUS.md
git commit -m "Mark translation as 100% complete"
git push
```

### 7. Add Medical Illustration

```bash
# 1. Add image to images/ directory
cp ~/Downloads/heart-diagram.jpg images/

# 2. Update image mappings
nano images/chapter_images.json
# Add: {"chapterNumber": 15, "image": "heart-diagram.jpg", "caption": "..."}

# 3. Rebuild illustrated version
node build/build-site-illustrated.js

# 4. Commit
git add images/
git commit -m "Add illustration for chapter 15"
git push

# 5. Deploy
surge . heart-talks.surge.sh
```

### 8. Test Locally

```bash
# Option 1: Using built-in test script
./build/test-locally.sh
# Opens http://localhost:8000

# Option 2: Using Python's HTTP server
python3 -m http.server 8000

# Option 3: Using Node's http-server
npx http-server -p 8000

# Then open browser to:
# http://localhost:8000
```

---

## 🔍 Troubleshooting

### Problem: Translation Fails with "Too Many Requests"

**Cause:** Google Translate API rate limit (100 requests/day)

**Solution:**
```bash
# 1. Wait 24 hours
# 2. Run retry script
node build/retry-translation.js

# Or: Translate in smaller batches
# Edit retry-translation.js to do 4 chapters at a time
# Run multiple times throughout the day
```

### Problem: PDFs Not Generating

**Cause:** Puppeteer not installed or corrupted

**Solution:**
```bash
# 1. Reinstall dependencies
rm -rf node_modules
npm install

# 2. Try generating one PDF to test
node build/generate-pdfs.js

# 3. Check for error messages
# Common issues:
# - Missing Chromium: npm install puppeteer
# - Permission issues: check file permissions on pdfs/
# - Out of memory: close other applications
```

### Problem: Surge Deployment Fails

**Cause:** File size too large (>200MB limit)

**Solution:**
```bash
# 1. Check deployment size
du -sh .

# 2. If >200MB, exclude large files
# Add to .gitignore or create .surgeignore

# 3. Current size should be ~12.9 MB (well within limit)
# If larger, check for:
# - Accidentally committed node_modules/
# - Large image files
# - Duplicate files
```

### Problem: Kannada Text Not Displaying

**Cause:** Font rendering issue or encoding problem

**Solution:**
```bash
# 1. Check file encoding
file "Heart Talk - Kannada.md"
# Should show: UTF-8 Unicode text

# 2. Check browser
# - Modern browsers support Kannada by default
# - Try different browser (Chrome, Firefox, Safari)

# 3. Check CSS font-family
# book.css should have: font-family: system-ui, -apple-system, ...
# System fonts include Kannada glyphs
```

### Problem: Search Not Working

**Cause:** search-index.json not generated or corrupted

**Solution:**
```bash
# 1. Regenerate search index
node build/build-site.js
# This creates search-index.json

# 2. Check file exists and is valid JSON
cat search-index.json | jq .
# Should show array of chapter objects

# 3. Redeploy
surge . heart-talks.surge.sh
```

### Problem: Git Push Fails

**Cause:** SSH key or authentication issue

**Solution:**
```bash
# 1. Check Git remote
git remote -v
# Should show: git@github.com:rkrules/heart-talks.git

# 2. Test SSH connection
ssh -T git@github.com
# Should show: Hi rkrules! You've successfully authenticated

# 3. If fails, check SSH key
ls -la ~/.ssh/
# Should have id_rsa and id_rsa.pub

# 4. Pull first if behind
git pull --rebase
git push
```

### Problem: Build Script Fails

**Cause:** Missing dependencies or syntax error

**Solution:**
```bash
# 1. Check Node.js version
node --version
# Should be v14 or higher

# 2. Reinstall dependencies
npm install

# 3. Run scripts individually to isolate error
node build/build-glossary.js
node build/build-site.js
node build/build-site-illustrated.js
node build/generate-pdfs.js
node build/build-site-kannada.js

# 4. Check script syntax
node --check build/build-site.js
```

---

## 📁 File Reference

### Source Files (Edit These)

1. **Heart Talk - Formatted.md** (510KB)
   - English source content
   - All 63 chapters
   - Markdown format
   - Edit to update content

2. **glossary-terms.json** (7KB)
   - English medical glossary
   - 46 cardiovascular terms
   - JSON format
   - Edit to add/update terms

3. **book.css** (24KB)
   - All website styles
   - Print styles for PDFs
   - Language toggle styles
   - Edit to change appearance

4. **search.js** (4KB)
   - Client-side search functionality
   - Edit to modify search behavior

### Generated Files (Don't Edit - Rebuilt Automatically)

1. **index.html** - English homepage
2. **index-kn.html** - Kannada homepage
3. **index-illustrated.html** - Illustrated version homepage
4. **glossary.html** - English glossary page
5. **glossary-kn.html** - Kannada glossary page
6. **search-index.json** - Search index
7. **chapters/*.html** - 63 English chapter pages
8. **chapters-kn/*.html** - 63 Kannada chapter pages
9. **pdfs/*.pdf** - 64 PDF files

### Translation Files (Generated, Can Edit to Fix Translation)

1. **Heart Talk - Kannada.md** (727KB)
   - Kannada translation source
   - Generated by translate-to-kannada.js
   - Can edit manually to fix translation errors

2. **glossary-terms-kannada.json** (12KB)
   - Kannada glossary
   - Generated by translate-glossary.js
   - Can edit manually to fix medical terms

### Build Scripts (Edit to Change Build Process)

1. **build/build-all.sh** - Master build script
2. **build/build-site.js** - English site generator
3. **build/build-site-kannada.js** - Kannada site generator
4. **build/build-site-illustrated.js** - Illustrated version generator
5. **build/build-glossary.js** - Glossary generator
6. **build/generate-pdfs.js** - PDF generator
7. **build/translate-to-kannada.js** - Translation script
8. **build/translate-glossary.js** - Glossary translation
9. **build/retry-translation.js** - Retry failed translations
10. **build/deploy.sh** - Deployment script
11. **build/test-locally.sh** - Local testing script

### Configuration Files

1. **package.json** - Node.js dependencies and scripts
2. **.gitignore** - Git exclusions
3. **images/chapter_images.json** - Image mappings for illustrated version

### Documentation Files

1. **CLAUDE.md** - This file (Claude reference guide)
2. **SESSION-SUMMARY.md** - Session documentation
3. **TRANSLATION-STATUS.md** - Translation progress tracking

---

## 📝 Development Notes

### Code Patterns

#### Markdown Parsing
```javascript
// Split source into chapters
const chapters = source.split(/## Heart Talk #/);

// Extract chapter number and content
const match = chapterText.match(/^(\d+(?:\.\w+)?): (.+)/);
const number = match[1];  // "1" or "59.ver1"
const title = match[2];   // "Calcium and Heart Disease"
```

#### HTML Template Pattern
```javascript
const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="book.css">
</head>
<body>
    <div class="book-container">
        ${content}
    </div>
</body>
</html>
`;
```

#### Rate Limiting Pattern
```javascript
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

for (let item of items) {
    await processItem(item);
    await sleep(1000);  // Wait 1 second
}
```

### Dependencies

```json
{
  "devDependencies": {
    "puppeteer": "^21.0.0",
    "@vitalets/google-translate-api": "^9.2.0"
  }
}
```

**Puppeteer (~300MB):**
- Headless Chrome for PDF generation
- No additional configuration needed
- Works on Mac/Linux/Windows

**Google Translate API (~1MB):**
- Free unofficial wrapper
- No API key required
- Rate limited to ~100 requests/day

### Git Workflow

```bash
# 1. Check status
git status

# 2. Stage changes
git add -A                    # All files
git add "specific file"       # Specific file

# 3. Commit with message
git commit -m "Description"

# 4. Push to remote
git push

# 5. Pull latest changes
git pull

# 6. View history
git log --oneline

# 7. View specific commit
git show dcb2957
```

### Surge Workflow

```bash
# Deploy to domain
surge . heart-talks.surge.sh

# Deploy to random domain (for testing)
surge .

# View deployment list
surge list

# Teardown deployment
surge teardown heart-talks.surge.sh
```

---

## 🎯 Best Practices

### When Editing Content

1. **Always edit source Markdown, never generated HTML**
   - Edit: `Heart Talk - Formatted.md`
   - Don't edit: `chapters/chapter1.html`

2. **Rebuild after content changes**
   - Run: `./build/build-all.sh`
   - This regenerates all HTML

3. **Test locally before deploying**
   - Run: `./build/test-locally.sh`
   - Check changes in browser

4. **Commit source files, not generated files**
   - Commit: `Heart Talk - Formatted.md`, `book.css`
   - Don't commit: `chapters/*.html` (in .gitignore)

### When Adding Features

1. **Make incremental changes**
   - Add one feature at a time
   - Test after each change
   - Commit working code

2. **Update documentation**
   - Add to CLAUDE.md
   - Update SESSION-SUMMARY.md
   - Document in code comments

3. **Version your changes**
   - Clear commit messages
   - Reference issue numbers if applicable
   - Tag major releases

### When Translating

1. **Use retry script for failures**
   - Don't manually retry failed chapters in main script
   - Use `retry-translation.js` with slower rate limiting

2. **Verify translation quality**
   - Spot-check random chapters
   - Medical terms may need review
   - Consider adding disclaimer

3. **Document translation status**
   - Update TRANSLATION-STATUS.md
   - Note any untranslated sections
   - Track completion percentage

---

## 📞 Support

### For Claude (Future Sessions)

**To understand this project:**
1. Read CLAUDE.md (this file)
2. Read SESSION-SUMMARY.md (latest session notes)
3. Read TRANSLATION-STATUS.md (current progress)
4. Review build scripts in build/

**To continue work:**
1. Check `/Users/ravikiran/.claude/plans/` for active plans
2. Review latest Git commits: `git log --oneline -10`
3. Check live site: heart-talks.surge.sh
4. Test locally before making changes

**Common questions:**
- "How do I add a chapter?" → See "Common Tasks #1"
- "How do I fix translations?" → See "Common Tasks #6"
- "Build fails?" → See "Troubleshooting"
- "Deployment issues?" → See "Deployment" section

### Quick Reference

```bash
# Build everything
./build/build-all.sh

# Translate to Kannada
node build/translate-to-kannada.js
node build/translate-glossary.js

# Generate PDFs
node build/generate-pdfs.js

# Deploy
surge . heart-talks.surge.sh

# Test locally
./build/test-locally.sh

# Git
git add -A && git commit -m "Message" && git push
```

---

**Last Updated:** February 16, 2026
**Project Status:** Active Development
**Completion:** PDF ✅ 100%, Translation ⏳ 87%, Deployment ✅ Live
