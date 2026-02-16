# Heart Talk - Editing & Publishing Workflow Guide

**Complete guide for editing, building, and publishing Heart Talk content**

This guide explains how to make changes to the Heart Talk website and publish updates, designed for both technical and non-technical users.

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [File Organization](#file-organization)
3. [Editing Content](#editing-content)
4. [Building the Website](#building-the-website)
5. [Testing Locally](#testing-locally)
6. [Publishing (Deployment)](#publishing-deployment)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

**The 4-step process:**

```bash
# 1. Edit the markdown file
open "Heart Talk - Formatted.md"  # Use any text editor

# 2. Build the website
./build/build-all.sh

# 3. Test locally (optional but recommended)
./build/test-locally.sh
# Open: http://localhost:8000

# 4. Deploy to the web
./build/deploy.sh
# Or: surge . heart-talks.surge.sh
```

**That's it!** Your changes are now live.

---

## File Organization

### What You Need to Know:

**SOURCE FILE (Edit this):**
- `Heart Talk - Formatted.md` - The single source file containing all 63 chapters

**BUILD SCRIPTS (Run these):**
- `build/build-all.sh` - Builds everything (glossary + main + illustrated sites)
- `build/deploy.sh` - Deploys to surge.sh
- `build/test-locally.sh` - Starts local test server

**GENERATED FILES (Don't edit these directly):**
- `index.html`, `glossary.html` - Generated from markdown
- `chapters/` folder - 63 auto-generated chapter HTML files
- `search-index.json` - Auto-generated search data

**DATA FILES (Edit to customize):**
- `glossary-terms.json` - Medical term definitions for glossary

**DOCUMENTATION:**
- `docs/` folder - All documentation and guides
- `EDITING-WORKFLOW.md` (this file) - How to edit and publish

**LEGACY/BACKUP:**
- `archive/` folder - Old files and backups

---

## Editing Content

### 1. Locate the Source File

The master content file is:
```
Heart Talk - Formatted.md
```

Open it with any text editor:
- **Mac:** TextEdit, VS Code, Sublime Text
- **Windows:** Notepad, VS Code, Notepad++
- **Online:** Any markdown editor

### 2. Understanding Markdown Format

The file uses simple Markdown syntax:

```markdown
## Heart Talk #1

### Calcium and Heart Disease

This is a paragraph of text.

**Bold text** for emphasis.
*Italic text* for subtle emphasis.

---

Dr Keshava Aithal
ಅಂಕ 8 Double 0
```

**Key markers:**
- `##` - Separates chapters (DON'T change these)
- `###` - Chapter title/headings
- `**text**` - Bold
- `*text*` - Italic
- `---` - Horizontal line (before signature)

### 3. Making Common Edits

**Fix a typo:**
1. Search for the word (Cmd+F / Ctrl+F)
2. Fix it
3. Save the file
4. Run `./build/build-all.sh`

**Add a new paragraph:**
1. Find the location in the chapter
2. Add a blank line before and after your new paragraph
3. Type your content
4. Save and rebuild

**Update a chapter:**
1. Find `## Heart Talk #XX` where XX is the chapter number
2. Make your changes in that section
3. Don't change the `## Heart Talk #XX` line itself
4. Save and rebuild

### 4. Adding a New Chapter

**Steps:**
1. Go to the end of `Heart Talk - Formatted.md`
2. Add this template:

```markdown
## Heart Talk #64

### Your New Chapter Title

Your chapter content here. Write naturally in paragraphs.

Use **bold** for important terms.

---

Dr Keshava Aithal
ಅಂಕ 8 Double 0
```

3. Save the file
4. Run `./build/build-all.sh`
5. The new chapter will appear as chapter 64!

**Important:**
- Start with `## Heart Talk #XX` (increment the number)
- End with the signature format shown above
- Use `###` for the chapter title

---

## Building the Website

### Prerequisites (One-Time Setup)

**Install Node.js:**
1. Visit: https://nodejs.org
2. Download the LTS version
3. Install it
4. Verify: `node --version` (should show v18 or higher)

**No other dependencies needed!** The build scripts handle everything else.

### Running the Build

**Build everything (recommended):**
```bash
cd /Users/ravikiran/Apps/claude/hralth
./build/build-all.sh
```

This will:
1. Generate the medical glossary (`glossary.html`)
2. Generate the main website (63 chapters + index)
3. Generate the illustrated version
4. Create the search index

**Output:**
```
✅ All builds complete! Ready to deploy.

📊 Generated files:
   • index.html + index-illustrated.html
   • glossary.html
   • 63 chapters (text + illustrated)
   • search-index.json
```

### Build Individual Components

If you only need to rebuild specific parts:

```bash
# Just the glossary
node build/build-glossary.js

# Just the main site
node build/build-site.js

# Just the illustrated version
node build/build-site-illustrated.js
```

---

## Testing Locally

**Before deploying**, test your changes locally to make sure everything looks correct.

### Start Local Server

```bash
./build/test-locally.sh
```

You'll see:
```
🌐 Server will run at: http://localhost:8000
```

### Open in Browser

1. Open your web browser
2. Go to: **http://localhost:8000**
3. Browse the site and verify your changes

### What to Check

- ✅ Your edits appear correctly
- ✅ No formatting issues
- ✅ Search works (click 🔍 Search or press Ctrl+K)
- ✅ Navigation works (previous/next buttons)
- ✅ Glossary link in footer works
- ✅ No duplicate chapter titles

### Stop the Server

When done testing, go back to Terminal and press **Ctrl+C**

---

## Publishing (Deployment)

### Deploy to Surge.sh

**First time setup:**
```bash
# Install surge (one-time only)
npm install -g surge

# Deploy
surge . heart-talks.surge.sh
```

You'll be asked to create a free account (email + password).

**Subsequent deploys:**
```bash
# Quick deploy
surge . heart-talks.surge.sh

# Or use the deploy script
./build/deploy.sh
```

**Your site will be live at:**
```
https://heart-talks.surge.sh
```

### Deployment Checklist

Before deploying:
1. ✅ Made your edits in `Heart Talk - Formatted.md`
2. ✅ Ran `./build/build-all.sh` successfully
3. ✅ Tested locally and verified changes
4. ✅ All features work (search, navigation, glossary)
5. ✅ Ready to publish!

Then run:
```bash
surge . heart-talks.surge.sh
```

**Deployment takes ~30 seconds.** Your changes will be live immediately!

---

## Common Tasks

### Task 1: Fix a Typo

```bash
# 1. Edit the markdown file
open "Heart Talk - Formatted.md"
# Fix the typo and save

# 2. Rebuild
./build/build-all.sh

# 3. Test (optional)
./build/test-locally.sh

# 4. Deploy
surge . heart-talks.surge.sh
```

**Time: 2-3 minutes**

---

### Task 2: Add Medical Term to Glossary

**Edit `glossary-terms.json`:**

```json
{
  "terms": [
    {
      "term": "New Medical Term",
      "definition": "Clear, concise explanation of the term...",
      "relatedChapters": [5, 12, 23],
      "category": "Heart Disease"
    }
  ]
}
```

**Rebuild glossary:**
```bash
node build/build-glossary.js
surge . heart-talks.surge.sh
```

**Time: 5 minutes**

---

### Task 3: Update Multiple Chapters

**Scenario:** You want to update chapters 10, 15, and 20.

```bash
# 1. Edit Heart Talk - Formatted.md
#    Search for "## Heart Talk #10"
#    Make your changes
#    Search for "## Heart Talk #15"
#    Make your changes
#    Search for "## Heart Talk #20"
#    Make your changes
#    Save the file

# 2. Rebuild everything
./build/build-all.sh

# 3. Test the specific chapters
./build/test-locally.sh
# Navigate to chapters 10, 15, 20 and verify

# 4. Deploy
surge . heart-talks.surge.sh
```

**Time: 10-15 minutes**

---

### Task 4: Add a Brand New Chapter

**Add Heart Talk #64:**

1. **Open markdown file** and go to the very end
2. **Add this template:**

```markdown
## Heart Talk #64

### Your Chapter Title Here

Write your content here. The build system will automatically:
- Format it with proper typography
- Split long paragraphs for readability
- Add navigation (previous/next)
- Include it in the search index
- Add it to the table of contents

You can write naturally, and the formatting will be handled automatically!

**Bold text** and *italic text* work as expected.

---

Dr Keshava Aithal
ಅಂಕ 8 Double 0
```

3. **Save and rebuild:**
```bash
./build/build-all.sh
```

4. **Verify:** The new chapter will be:
   - Listed on the main index
   - Accessible as `chapters/chapter64.html`
   - Included in search results
   - Linked from chapter 63's "Next" button

5. **Deploy:**
```bash
surge . heart-talks.surge.sh
```

**Time: 10 minutes**

---

### Task 5: Translate to Kannada

**Coming soon!** The translation workflow will allow machine translation of all content to Kannada with medical term review.

**Manual process for now:**
1. Create `Heart Talk - Kannada.md` with translated content
2. Create Kannada-specific build script
3. Deploy to separate URL

---

## Troubleshooting

### Issue: "node: command not found"

**Problem:** Node.js not installed

**Solution:**
```bash
# Install Node.js from https://nodejs.org
# Then verify:
node --version
```

---

### Issue: Build fails with error

**Check for:**
1. Markdown formatting errors (unmatched `**` or `*`)
2. Missing chapter signatures
3. Corrupted character encoding

**Fix:**
1. Open `Heart Talk - Formatted.md`
2. Find the last chapter mentioned in the error
3. Check for formatting issues around that chapter
4. Save and rebuild

---

### Issue: Search doesn't work locally

**Problem:** Opening files directly (`file:///...`) blocks search due to browser security

**Solution:**
Always use the local server:
```bash
./build/test-locally.sh
```

Then open: `http://localhost:8000` (not `file:///...`)

---

### Issue: Changes don't appear on the website

**Did you:**
1. ✅ Save the markdown file?
2. ✅ Run `./build/build-all.sh`?
3. ✅ Deploy with `surge`?
4. ✅ Hard refresh the browser (Cmd+Shift+R / Ctrl+F5)?

If yes to all and still not working:
```bash
# Clear browser cache
# Wait 1-2 minutes for CDN propagation
# Try in incognito/private window
```

---

### Issue: Duplicate chapter titles appear

**Problem:** Old chapters may still have duplicates from before the fix

**Solution:**
The build scripts now automatically remove duplicate h3 titles that match the h1 chapter title. Just rebuild:

```bash
./build/build-all.sh
```

---

### Issue: Glossary link doesn't appear in chapters

**Problem:** Old generated chapters don't have footer links

**Solution:**
Rebuild to regenerate all chapters with footer links:

```bash
./build/build-all.sh
```

Every chapter will now have:
```
← Table of Contents · Medical Glossary
```

in the footer.

---

## Tips & Best Practices

### Writing Style

1. **Keep it conversational** - Dr. Aithal's friendly tone
2. **Use short paragraphs** - Build system auto-splits, but starting with ~3-4 sentences per paragraph helps
3. **Bold important terms** - Use `**term**` for medical terms or key concepts
4. **Consistent signatures** - Always end with the standard signature format

### Markdown Tips

**Good:**
```markdown
This is a paragraph.

This is another paragraph.

**Important term** needs emphasis.
```

**Avoid:**
```markdown
This is a paragraph.
No blank line before this paragraph makes them merge.

**Unclosed bold text without matching **
```

### Version Control (Optional)

Consider using Git to track changes:

```bash
# Initialize (one-time)
git init
git add "Heart Talk - Formatted.md"
git commit -m "Initial content"

# After each edit
git add "Heart Talk - Formatted.md"
git commit -m "Added Heart Talk #64 about X"
```

Benefits:
- Track all changes
- Revert to previous versions if needed
- Collaborate with others
- Keep backup history

---

## Quick Reference

### File Locations

| File | Purpose | Edit? |
|------|---------|-------|
| `Heart Talk - Formatted.md` | Source content | ✅ YES |
| `glossary-terms.json` | Glossary definitions | ✅ YES |
| `build/build-all.sh` | Build everything | ❌ NO |
| `build/deploy.sh` | Deploy to web | ❌ NO |
| `index.html` | Generated index | ❌ NO |
| `chapters/*.html` | Generated chapters | ❌ NO |
| `search-index.json` | Generated search data | ❌ NO |

### Command Cheat Sheet

```bash
# Build everything
./build/build-all.sh

# Test locally
./build/test-locally.sh

# Deploy
surge . heart-talks.surge.sh

# Quick deploy script
./build/deploy.sh

# Build just glossary
node build/build-glossary.js

# Build just main site
node build/build-site.js
```

### Keyboard Shortcuts

**In the website:**
- `Ctrl+K` / `Cmd+K` - Open search
- `←` - Previous chapter
- `→` - Next chapter
- `H` - Home (table of contents)
- `Esc` - Close search

---

## Getting Help

**Need assistance?**

1. **Check this guide** - Most common tasks are covered
2. **Check `/docs` folder** - Detailed technical documentation
3. **Test locally first** - Catch issues before deploying
4. **Review error messages** - Build scripts show helpful errors

**Common issues:** See [Troubleshooting](#troubleshooting) section above

---

## Summary

**The workflow is simple:**

1. **Edit** `Heart Talk - Formatted.md` with your changes
2. **Build** with `./build/build-all.sh`
3. **Test** with `./build/test-locally.sh` (optional)
4. **Deploy** with `surge . heart-talks.surge.sh`

**That's it!** The build system handles all the complexity:
- Converts Markdown to beautiful HTML
- Generates 63 individual chapter pages
- Creates search index
- Builds medical glossary
- Formats with proper typography
- Adds navigation between chapters
- Makes it all mobile-responsive

**You just focus on the content!**

---

**Last Updated:** February 16, 2026
**Version:** 2.0 (with glossary access, title deduplication, reorganized structure)
