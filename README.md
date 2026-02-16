# Heart Talk - Heart Health Education Website

A comprehensive collection of heart health insights by **Dr. Keshava Aithal** (ಅಂಕ 8 Double 0).

## 🫀 Project Overview

- **63 chapters** covering cardiovascular health topics
- **Full-text search** across all content
- **Medical glossary** with 46 terms
- **Mobile-responsive** book-quality typography
- **Static site** deployable to any hosting service

## 📁 Project Structure

```
hralth/
├── Heart Talk - Formatted.md       # Source content (EDIT THIS)
├── build/                          # Build scripts
│   ├── build-all.sh               # Build everything
│   ├── build-site.js              # Main site generator
│   ├── build-glossary.js          # Glossary generator
│   └── deploy.sh                  # Deploy to surge.sh
├── docs/                          # Documentation
├── *.css                          # Stylesheets
├── *.js                           # Client-side scripts
└── EDITING-WORKFLOW.md            # How to edit & publish
```

## 🚀 Quick Start

### Build the Site

```bash
./build/build-all.sh
```

### Test Locally

```bash
./build/test-locally.sh
# Open: http://localhost:8000
```

### Deploy

```bash
surge . heart-talks.surge.sh
```

## 📝 Making Changes

1. Edit `Heart Talk - Formatted.md`
2. Run `./build/build-all.sh`
3. Test with `./build/test-locally.sh`
4. Commit and push to GitHub
5. Deploy with `surge . heart-talks.surge.sh`

See `EDITING-WORKFLOW.md` for detailed instructions.

## 🔄 Git Workflow

```bash
# After editing
git add "Heart Talk - Formatted.md"
git commit -m "Add Heart Talk #64: Your Chapter Title"
git push

# Then rebuild and deploy
./build/build-all.sh
surge . heart-talks.surge.sh
```

## 🔐 Private Repository

This repository is private to protect intellectual property.

## 📄 License

All rights reserved © Dr. Keshava Aithal
