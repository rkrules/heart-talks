# Heart Talk Collection - Static Book Website

A beautiful, book-like static website generated from "Heart Talk - Formatted.md" by Dr. Keshava Aithal.

## 📚 Features

- **63 Chapters** - Each chapter on its own dedicated page
- **Beautiful Typography** - Georgia serif font, 18px, 1.7 line-height for optimal readability
- **Book-like Design** - Subtle shadows, justified text, drop caps on first paragraphs
- **Responsive Layout** - Mobile-friendly with CSS Grid for 2-column TOC on desktop
- **Navigation**:
  - Sidebar TOC on index page
  - Previous/Next chapter buttons
  - Jump-to-chapter dropdown
  - Keyboard shortcuts (← → arrows, H for home, Esc)
- **Reading Experience**:
  - Smooth scrolling
  - Reading progress indicator
  - Page transition effects
  - Print-friendly styles

## 📁 File Structure

```
hralth/
├── index.html              # Landing page with Table of Contents
├── book.css                # All styling (premium typography)
├── script.js               # Interactive features & navigation
├── chapters/
│   ├── chapter1.html       # Heart Talk #1: Calcium and heart disease
│   ├── chapter2.html       # Heart Talk #2: Lipoprotein a
│   ├── ...
│   └── chapter63.html      # Heart Talk #62: Myths about cardiovascular care
├── build-site.js           # Generator script (Node.js)
└── Heart Talk - Formatted.md  # Source Markdown file
```

## 🚀 Deployment to Surge.sh

### Option 1: Deploy Current Build

```bash
# Install surge globally (one-time)
npm install -g surge

# Deploy from the project directory
surge . heart-talks.surge.sh
```

Your site will be live at: `https://heart-talks.surge.sh`

### Option 2: Rebuild & Deploy

```bash
# Regenerate all HTML files from Markdown
node build-site.js

# Deploy to surge
surge . heart-talks.surge.sh
```

### Custom Domain

To use a custom domain:

```bash
# Deploy with your custom domain
surge . your-custom-domain.com
```

## 🔧 Regenerating the Site

If you update the Markdown file, regenerate the website:

```bash
node build-site.js
```

This will:
1. Parse `Heart Talk - Formatted.md`
2. Split content by `## Heart Talk #` headers
3. Generate individual HTML files for each chapter
4. Create index.html with complete TOC
5. Apply book-like styling

## 🎨 Customization

### Change Colors

Edit `book.css` variables at the top:

```css
:root {
    --accent-color: #c54a4a;     /* Change to your preferred color */
    --text-primary: #2c2c2c;
    --page-bg: #ffffff;
}
```

### Change Typography

```css
:root {
    --serif: Georgia, "Times New Roman", serif;
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
    font-size: 18px;        /* Adjust base font size */
    line-height: 1.7;       /* Adjust line spacing */
}
```

### Disable Drop Caps

Comment out in `book.css`:

```css
/* .chapter-content p:first-of-type::first-letter {
    font-size: 3.5em;
    ...
} */
```

### Enable Print Button

Uncomment in `script.js`:

```javascript
// Uncomment to enable print button
addPrintButton();
```

## ⌨️ Keyboard Shortcuts

When viewing a chapter:

- **← / →** - Previous/Next chapter
- **H** or **Esc** - Return to Table of Contents
- **P** - Previous chapter (alternative)
- **N** - Next chapter (alternative)

## 🖨️ Printing

The site includes print-optimized CSS. To print a chapter:

1. Open any chapter
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Print or save as PDF

## 📱 Mobile Experience

- Fully responsive design
- Single-column layout on mobile
- Touch-friendly navigation
- Optimized font sizes
- Reading progress bar

## 🔍 Technical Details

### Markdown Parsing Logic

The `build-site.js` script:

1. Reads the Markdown file
2. Uses regex to find all `## Heart Talk #` headers
3. Extracts chapter numbers and content between headers
4. Converts Markdown to HTML (headers, paragraphs, bold/italic)
5. Wraps content in semantic HTML with navigation

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid support required
- JavaScript ES6+ features used

### Performance

- No external dependencies
- Pure HTML/CSS/JS (vanilla)
- Small file sizes (~5-15KB per chapter)
- Fast loading times

## 📊 Statistics

- **63 Chapters** covering comprehensive heart health topics
- **~300KB** total Markdown source
- **~1MB** total generated HTML (all chapters)
- **Zero external requests** - fully self-contained

## 🛠️ Requirements

- Node.js (for running build-site.js)
- Modern web browser
- Surge CLI (for deployment)

## 📄 License

Content by Dr. Keshava Aithal

## 🤝 Contributing

To improve the website:

1. Edit `book.css` for styling changes
2. Edit `script.js` for interactive features
3. Edit `build-site.js` for generation logic
4. Rebuild with `node build-site.js`
5. Test locally by opening `index.html`
6. Deploy to surge

## 📞 Support

For issues with:
- Content: Contact Dr. Keshava Aithal
- Website/Design: Check the code comments in `book.css` and `script.js`

---

Built with ❤️ for accessible heart health education
