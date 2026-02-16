#!/usr/bin/env node

/**
 * Heart Talk Book Website Generator - Enhanced Edition
 *
 * This script parses "Heart Talk - Formatted.md" and generates a beautiful
 * static website with separate HTML pages for each chapter.
 *
 * Enhancements:
 * - Smart title case normalization with acronym preservation
 * - Intelligent paragraph splitting for better readability
 * - Standardized author signature formatting
 * - Improved mobile-responsive navigation
 *
 * Parsing Logic:
 * 1. Read the Markdown file
 * 2. Split content by "## Heart Talk #" markers (H2 headers)
 * 3. Extract and normalize chapter titles
 * 4. Normalize author signatures
 * 5. Split long paragraphs intelligently
 * 6. Generate individual HTML files for each chapter
 * 7. Create index.html with full TOC navigation
 */

const fs = require('fs');
const path = require('path');

// ============================================
// Helper Functions
// ============================================

/**
 * Convert string to Title Case with smart acronym preservation
 * @param {string} str - Input string
 * @returns {string} Title-cased string
 */
function toTitleCase(str) {
    // Medical acronyms that should remain uppercase
    const medicalAcronyms = ['HDL', 'LDL', 'BMI', 'CT', 'MRI', 'ECG', 'EKG',
                             'FDA', 'DASH', 'APOB', 'COVID', 'DNA', 'RNA'];

    // Small words that should be lowercase (except at start)
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for',
                        'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'with'];

    // First pass: convert to lowercase
    str = str.toLowerCase();

    // Replace acronyms with uppercase versions
    medicalAcronyms.forEach(acronym => {
        const regex = new RegExp(`\\b${acronym.toLowerCase()}\\b`, 'gi');
        str = str.replace(regex, acronym);
    });

    // Split into words and apply title case rules
    const words = str.split(/\s+/);
    const titleCased = words.map((word, index) => {
        // Always capitalize first word
        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }

        // Check if it's a medical acronym (already uppercase)
        if (medicalAcronyms.includes(word.toUpperCase())) {
            return word;
        }

        // Keep small words lowercase (unless at start)
        if (smallWords.includes(word.toLowerCase())) {
            return word.toLowerCase();
        }

        // Capitalize other words
        return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return titleCased.join(' ');
}

/**
 * Smart paragraph splitting for better readability
 * Splits long paragraphs at natural sentence boundaries
 * @param {string} text - Input text
 * @returns {Array} Array of paragraph strings
 */
function smartParagraphSplit(text) {
    // First split on explicit double newlines
    let paragraphs = text.split(/\n\n+/);

    // Further process paragraphs that are too long
    return paragraphs.flatMap(para => {
        para = para.trim();
        if (!para) return [];

        // Don't split if it's short enough or if it's a special element
        if (para.length < 400 ||
            para.startsWith('<h') ||
            para.startsWith('<ul') ||
            para.startsWith('<ol') ||
            para.startsWith('---')) {
            return [para];
        }

        // Split into sentences (at period, exclamation, or question mark followed by capital)
        // But preserve abbreviations like "Dr.", "vs.", "etc.", "U.S."
        const sentences = para.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);

        // Group sentences into paragraphs of ~300-400 characters
        const grouped = [];
        let currentPara = '';

        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (!sentence) return;

            // If adding this sentence keeps us under 400 chars, add it
            if (currentPara.length + sentence.length + 1 < 400) {
                currentPara += (currentPara ? ' ' : '') + sentence;
            } else {
                // Start a new paragraph
                if (currentPara) grouped.push(currentPara);
                currentPara = sentence;
            }
        });

        // Don't forget the last paragraph
        if (currentPara) grouped.push(currentPara);

        return grouped.length > 0 ? grouped : [para];
    });
}

/**
 * Normalize author signature to standard format
 * @param {string} content - Chapter content
 * @returns {string} Content with normalized signature
 */
function normalizeSignature(content) {
    // Patterns to match various signature formats
    const signaturePatterns = [
        /esos\s*Eight\s*Double\s*Zero/gi,
        /esos\s*Eight\s*double\s*[O0]/gi,
        /ಅಂಕ\s*\d+\s*[Dd]ou?ble\s*[0Oo]/g,
        /Dr\.?\s*Keshava\s*Aithal\s*ಅಂಕ.*$/gm,
        /\d{1,2}\/\d{1,2}\/\d{4}/g  // Remove dates like 12/13/2024
    ];

    // Remove existing signature variations
    signaturePatterns.forEach(pattern => {
        content = content.replace(pattern, '');
    });

    // Clean up extra whitespace and dashes
    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.replace(/---+\s*$/gm, '');

    // Add standardized signature
    const standardSignature = '\n\n---\n\n**Dr Keshava Aithal**  \nಅಂಕ 8 Double 0';

    return content.trim() + standardSignature;
}

// ============================================
// Main Processing
// ============================================

// Read the Markdown file
const markdownContent = fs.readFileSync('Heart Talk - Formatted.md', 'utf-8');

// Extract book title and author from the beginning
const titleMatch = markdownContent.match(/^# (.+)/m);
const authorMatch = markdownContent.match(/by (.+)/m);
const bookTitle = titleMatch ? titleMatch[1] : 'Heart Talk Collection';
const author = authorMatch ? authorMatch[1] : 'Dr. Keshava Aithal';

// Split content into chapters (using ## Heart Talk # as delimiter)
const chapterRegex = /## Heart Talk #(\d+(?:\.\w+)?)/g;
let matches = [];
let match;

while ((match = chapterRegex.exec(markdownContent)) !== null) {
  matches.push({
    index: match.index,
    number: match[1],
    fullMatch: match[0]
  });
}

// Extract chapter content
const chapters = [];
for (let i = 0; i < matches.length; i++) {
  const start = matches[i].index;
  const end = i < matches.length - 1 ? matches[i + 1].index : markdownContent.length;
  const chapterContent = markdownContent.substring(start, end);

  // Extract title (### line after ## Heart Talk #)
  const titleLineMatch = chapterContent.match(/###\s*(.+)/);
  let rawTitle = titleLineMatch ? titleLineMatch[1].trim() : `Heart Talk #${matches[i].number}`;

  // Remove trailing punctuation (periods, colons) from titles
  rawTitle = rawTitle.replace(/[.:]+$/, '');

  // Apply title case normalization
  const title = toTitleCase(rawTitle);

  chapters.push({
    number: matches[i].number,
    title: title,
    content: chapterContent
  });
}

console.log(`Found ${chapters.length} chapters`);

/**
 * Enhanced Markdown to HTML converter with smart paragraph splitting
 */
function convertMarkdownToHTML(markdown, chapterTitle = null) {
  let html = markdown;

  // Remove the ## Heart Talk # header (already in page title)
  html = html.replace(/## Heart Talk #\d+(?:\.\w+)?/, '');

  // Convert headers
  html = html.replace(/### (.+)/g, '<h3>$1</h3>');
  html = html.replace(/## (.+)/g, '<h2>$1</h2>');
  html = html.replace(/# (.+)/g, '<h1>$1</h1>');

  // Remove first h3 if it duplicates the chapter title
  if (chapterTitle) {
    const firstH3Match = html.match(/<h3>(.+?)<\/h3>/);
    if (firstH3Match) {
      const firstH3Text = firstH3Match[1].toLowerCase().replace(/[.:]+$/, '').trim();
      const chapterTitleLower = chapterTitle.toLowerCase().trim();

      if (firstH3Text === chapterTitleLower) {
        // Remove the duplicate first h3
        html = html.replace(firstH3Match[0], '');
      }
    }
  }

  // Convert horizontal rules (--- to <hr>)
  html = html.replace(/^---$/gm, '<hr>');

  // Convert bold and italic (before paragraph processing)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Use smart paragraph splitting
  const paragraphs = smartParagraphSplit(html);

  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';

    // Don't wrap headers, lists, horizontal rules
    if (para.startsWith('<h') ||
        para.startsWith('<ul') ||
        para.startsWith('<ol') ||
        para.startsWith('<hr')) {
      return para;
    }

    // Remove single newlines within this paragraph
    para = para.replace(/\n/g, ' ');

    return `<p>${para}</p>`;
  }).join('\n');

  return html;
}

// Create chapters directory
if (!fs.existsSync('chapters')) {
  fs.mkdirSync('chapters');
}

// Generate HTML for each chapter
chapters.forEach((chapter, index) => {
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter = index < chapters.length - 1 ? chapters[index + 1] : null;

  // Normalize signature before converting to HTML
  const normalizedContent = normalizeSignature(chapter.content);
  const htmlContent = convertMarkdownToHTML(normalizedContent, chapter.title);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heart Talk #${chapter.number}: ${chapter.title} - ${bookTitle}</title>
    <link rel="stylesheet" href="../book.css">
</head>
<body>
    <div class="book-container">
        <header class="chapter-header">
            <a href="../index.html" class="home-link">← Table of Contents</a>
            <div class="chapter-number">Heart Talk #${chapter.number}</div>
        </header>

        <article class="chapter-content">
            <h1 class="chapter-title">${chapter.title}</h1>
            ${htmlContent}
        </article>

        <nav class="chapter-navigation">
            ${prevChapter ? `<a href="chapter${index}.html" class="nav-button prev-button">
                <span class="nav-label">Previous</span>
                <span class="nav-title">Heart Talk #${prevChapter.number}</span>
            </a>` : '<div></div>'}

            <select class="chapter-select" onchange="if(this.value) window.location.href=this.value">
                <option value="">Jump to Chapter...</option>
                ${chapters.map((ch, idx) => `
                <option value="chapter${idx + 1}.html" ${idx === index ? 'selected' : ''}>
                    Heart Talk #${ch.number}: ${ch.title}
                </option>`).join('')}
            </select>

            ${nextChapter ? `<a href="chapter${index + 2}.html" class="nav-button next-button">
                <span class="nav-label">Next</span>
                <span class="nav-title">Heart Talk #${nextChapter.number}</span>
            </a>` : '<div></div>'}
        </nav>

        <footer class="book-footer">
            <p>
                <a href="../index.html">← Table of Contents</a> ·
                <a href="../glossary.html">Medical Glossary</a>
            </p>
        </footer>
    </div>
    <script src="../script.js"></script>
    <script src="../search.js"></script>
</body>
</html>`;

  fs.writeFileSync(`chapters/chapter${index + 1}.html`, html);
  console.log(`Generated chapter${index + 1}.html - Heart Talk #${chapter.number}: ${chapter.title}`);
});

// Generate index.html with normalized titles
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bookTitle} by ${author}</title>
    <link rel="stylesheet" href="book.css">
</head>
<body>
    <div class="book-container">
        <header class="book-header">
            <h1 class="book-title">${bookTitle}</h1>
            <p class="book-author">by ${author}</p>
            <p class="book-description">A comprehensive collection of heart health insights and cardiovascular care guidance</p>
        </header>

        <main class="table-of-contents">
            <h2>Table of Contents</h2>
            <div class="toc-grid">
                ${chapters.map((chapter, index) => `
                <a href="chapters/chapter${index + 1}.html" class="toc-item">
                    <span class="toc-number">Heart Talk #${chapter.number}</span>
                    <span class="toc-title">${chapter.title}</span>
                </a>`).join('')}
            </div>
        </main>

        <footer class="book-footer">
            <p>${chapters.length} chapters of heart health wisdom · <a href="glossary.html">Medical Glossary</a></p>
        </footer>
    </div>
    <script src="script.js"></script>
    <script src="search.js"></script>
</body>
</html>`;

fs.writeFileSync('index.html', indexHTML);
console.log('Generated index.html');

// Generate search index
function generateSearchIndex(chapters) {
    const searchIndex = chapters.map((chapter, index) => {
        // Get the HTML content for this chapter
        const normalizedContent = normalizeSignature(chapter.content);
        let htmlContent = convertMarkdownToHTML(normalizedContent);

        // Strip HTML tags to get plain text
        const plainText = htmlContent
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return {
            id: index + 1,
            number: chapter.number,
            title: chapter.title,
            content: plainText,
            excerpt: plainText.substring(0, 200) + '...'
        };
    });

    fs.writeFileSync('search-index.json', JSON.stringify(searchIndex, null, 2));
    console.log('Generated search-index.json');
    return searchIndex;
}

const searchIndex = generateSearchIndex(chapters);

console.log('\n✅ Website generation complete!');
console.log(`\n📊 Formatting improvements applied:`);
console.log(`   - Title case normalization (${chapters.length} chapters)`);
console.log(`   - Smart paragraph splitting for readability`);
console.log(`   - Standardized author signatures`);
console.log('\nTo deploy to surge.sh:');
console.log('1. Install surge: npm install -g surge');
console.log('2. Run: surge . heart-talks.surge.sh');
