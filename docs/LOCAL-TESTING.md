# Local Testing Guide - Heart Talk Website

## ⚠️ Important: Why You Need a Local Server

**The search feature requires a local web server to work!**

When you open HTML files directly in your browser (`file:///path/to/index.html`), the browser's security policy (CORS) blocks JavaScript from loading JSON files. This is why search appears to not work.

**Solution:** Run a simple local web server.

---

## 🚀 Quick Start - Run Local Server

### Option 1: Python (Recommended - Usually Pre-installed)

**For Python 3:**
```bash
# Navigate to your project directory
cd /Users/ravikiran/Apps/claude/hralth

# Start server
python3 -m http.server 8000
```

**For Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Then open in browser:**
```
http://localhost:8000
```

### Option 2: Node.js (If you have Node installed)

```bash
# Install http-server globally (one-time)
npm install -g http-server

# Navigate to project directory
cd /Users/ravikiran/Apps/claude/hralth

# Start server
http-server -p 8000
```

**Then open in browser:**
```
http://localhost:8000
```

### Option 3: PHP (If you have PHP installed)

```bash
# Navigate to project directory
cd /Users/ravikiran/Apps/claude/hralth

# Start server
php -S localhost:8000
```

**Then open in browser:**
```
http://localhost:8000
```

---

## ✅ Testing Checklist

Once your local server is running at `http://localhost:8000`:

### 1. Test Index Page
- [ ] Open `http://localhost:8000`
- [ ] Table of contents loads
- [ ] See "🔍 Search" button in header
- [ ] Click a chapter link - should navigate

### 2. Test Search from Index
- [ ] Click "🔍 Search" button (or press Ctrl+K / Cmd+K)
- [ ] Search modal opens
- [ ] Type "cholesterol" (or any term)
- [ ] Results appear with highlighting
- [ ] Click a result - navigates to chapter

### 3. Test Chapter Page
- [ ] Open a chapter (e.g., `http://localhost:8000/chapters/chapter1.html`)
- [ ] Chapter loads with content
- [ ] "🔍 Search" button appears
- [ ] Previous/Next buttons work

### 4. Test Search from Chapter
- [ ] While on a chapter page, click "🔍 Search"
- [ ] Type "heart" (or any term)
- [ ] Results appear
- [ ] Click result - navigates correctly

### 5. Test Glossary
- [ ] Click "Medical Glossary" link in footer
- [ ] Glossary page loads
- [ ] Alphabet navigation works
- [ ] Click a letter (e.g., "C")
- [ ] Jumps to that section
- [ ] Click a chapter link
- [ ] Navigates to related chapter

### 6. Test Keyboard Shortcuts
- [ ] Press Ctrl+K (Windows/Linux) or Cmd+K (Mac)
- [ ] Search modal opens
- [ ] Type a query
- [ ] Press ↓ arrow - selects first result
- [ ] Press ↑ arrow - navigates up
- [ ] Press Enter - opens selected chapter
- [ ] Press Esc - closes modal

---

## 🐛 Troubleshooting

### "Search returns no results"

**Problem:** Opening files directly in browser (`file:///...`)

**Solution:** Use a local server as shown above

**How to verify:**
1. Open browser console (F12)
2. Look for error: `Failed to load search index`
3. You'll see a CORS error if not using a server

### "Search index loaded but no results"

**Check browser console:**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for: `✅ Search index loaded: 63 chapters`
4. If you don't see this, the index didn't load

**Common causes:**
- Not running local server
- Wrong path to search-index.json
- File not generated (run `node build-site.js`)

### "Search button doesn't appear"

**Possible issues:**
1. JavaScript not loading
2. Check browser console for errors
3. Verify `search.js` is included in HTML:
   ```bash
   grep "search.js" index.html
   ```

### "Glossary link doesn't work"

**Check:**
1. Verify `glossary.html` exists:
   ```bash
   ls -lh glossary.html
   ```
2. If missing, rebuild:
   ```bash
   node build-glossary.js
   ```

---

## 🔍 Debug Search Issues

### Check if search index exists:
```bash
ls -lh search-index.json
```

Expected output:
```
-rw-r--r--  1 user  staff   304K Feb 15 19:01 search-index.json
```

### Check search index structure:
```bash
head -20 search-index.json
```

Should show:
```json
[
  {
    "id": 1,
    "number": "1",
    "title": "Calcium and Heart Disease",
    "content": "...",
    "excerpt": "..."
  },
  ...
]
```

### Check if search.js is included in HTML:
```bash
grep -n "search.js" index.html chapters/chapter1.html
```

Should show lines like:
```
index.html:XX:    <script src="search.js"></script>
chapters/chapter1.html:XX:    <script src="../search.js"></script>
```

### Test search index manually:

Open browser console (F12) and run:
```javascript
fetch('search-index.json')
  .then(r => r.json())
  .then(data => console.log(`Loaded ${data.length} chapters`))
  .catch(e => console.error('Error:', e));
```

Expected: `Loaded 63 chapters`

---

## 📊 Server Comparison

| Method | Speed | Setup | Notes |
|--------|-------|-------|-------|
| Python 3 | Fast | Zero (pre-installed on Mac) | ⭐ Recommended |
| Node http-server | Fast | `npm install -g http-server` | Good if you have Node |
| PHP | Medium | Pre-installed on Mac | Works well |
| File:// | N/A | None | ❌ Doesn't work for search |

---

## 🎯 Step-by-Step: First Time Testing

**Complete walkthrough:**

1. **Open Terminal**
   - Press Cmd+Space
   - Type "Terminal"
   - Press Enter

2. **Navigate to project**
   ```bash
   cd /Users/ravikiran/Apps/claude/hralth
   ```

3. **Start server**
   ```bash
   python3 -m http.server 8000
   ```

4. **You'll see:**
   ```
   Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
   ```

5. **Open browser**
   - Open Chrome, Firefox, or Safari
   - Go to: `http://localhost:8000`

6. **Test search**
   - Click "🔍 Search" or press Cmd+K
   - Type "cholesterol"
   - See results!

7. **Stop server** (when done)
   - In Terminal, press Ctrl+C

---

## 🌐 Why File:// Doesn't Work

When you open `file:///Users/ravikiran/Apps/claude/hralth/index.html`:

**Browser sees:**
```
URL: file:///Users/ravikiran/Apps/claude/hralth/index.html
Trying to fetch: file:///Users/ravikiran/Apps/claude/hralth/search-index.json
```

**Security policy blocks this because:**
- Cross-origin security (CORS)
- Local file access restrictions
- JavaScript module limitations

**With local server:**
```
URL: http://localhost:8000/index.html
Trying to fetch: http://localhost:8000/search-index.json
✅ Allowed - same origin!
```

---

## 💡 Pro Tips

### Keep server running while developing

Leave the terminal window open with server running:
```bash
python3 -m http.server 8000
```

Then:
1. Make changes to files
2. Refresh browser (Cmd+R)
3. See changes immediately

### Use a different port

If port 8000 is busy:
```bash
python3 -m http.server 8080  # Use port 8080
```

Then open: `http://localhost:8080`

### Auto-open browser

```bash
python3 -m http.server 8000 && open http://localhost:8000
```

### Check what's running on a port

```bash
lsof -i :8000
```

---

## ✅ Success Indicators

**When everything is working, you'll see:**

1. **In Terminal:**
   ```
   Serving HTTP on 0.0.0.0 port 8000 ...
   127.0.0.1 - - [15/Feb/2026 19:30:00] "GET / HTTP/1.1" 200 -
   127.0.0.1 - - [15/Feb/2026 19:30:01] "GET /search-index.json HTTP/1.1" 200 -
   ```

2. **In Browser Console (F12):**
   ```
   ✅ Search index loaded: 63 chapters
   ```

3. **In Browser:**
   - Search button visible
   - Clicking search opens modal
   - Typing shows results
   - Results have yellow highlights
   - Clicking results navigates

---

## 🎉 You're All Set!

Once your local server is running:

✅ Search works perfectly
✅ Glossary accessible
✅ All navigation works
✅ Chapter loading is instant
✅ Ready to test all features

**When you deploy to surge.sh, everything will work automatically** - no server setup needed for production!

---

## 📞 Still Having Issues?

1. **Check browser console** (F12 → Console tab)
2. **Look for error messages**
3. **Verify files exist:**
   ```bash
   ls -lh search-index.json glossary.html search.js
   ```
4. **Rebuild if needed:**
   ```bash
   node build-glossary.js
   node build-site.js
   ```

---

**Remember:** Local server is only needed for **testing**. Once deployed to surge.sh, it works without any setup!

```bash
# Test locally
python3 -m http.server 8000
# Open: http://localhost:8000

# When ready, deploy
surge . heart-talks.surge.sh
# Works automatically!
```
