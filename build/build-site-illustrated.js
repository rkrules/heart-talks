#!/usr/bin/env node

/**
 * Heart Talk Book Website Generator - ILLUSTRATED Edition
 *
 * This extends the base build script to include medical images in chapters
 * Images are configured via image-mapping.json
 */

const fs = require('fs');
const path = require('path');

// ============================================
// Load Image Configuration
// ============================================

let imageMapping = {};
try {
  const mappingData = fs.readFileSync('image-mapping.json', 'utf-8');
  imageMapping = JSON.parse(mappingData);
  console.log(`📷 Loaded image mappings for ${Object.keys(imageMapping).length} chapters`);
} catch (error) {
  console.warn('⚠️  No image-mapping.json found, building text-only version');
}

// ============================================
// Helper Functions (same as build-site.js)
// ============================================

function toTitleCase(str) {
    const medicalAcronyms = ['HDL', 'LDL', 'BMI', 'CT', 'MRI', 'ECG', 'EKG',
                             'FDA', 'DASH', 'APOB', 'COVID', 'DNA', 'RNA'];
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for',
                        'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'with'];

    str = str.toLowerCase();
    medicalAcronyms.forEach(acronym => {
        const regex = new RegExp(`\\b${acronym.toLowerCase()}\\b`, 'gi');
        str = str.replace(regex, acronym);
    });

    const words = str.split(/\s+/);
    const titleCased = words.map((word, index) => {
        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (medicalAcronyms.includes(word.toUpperCase())) {
            return word;
        }
        if (smallWords.includes(word.toLowerCase())) {
            return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return titleCased.join(' ');
}

function smartParagraphSplit(text) {
    let paragraphs = text.split(/\n\n+/);
    return paragraphs.flatMap(para => {
        para = para.trim();
        if (!para) return [];
        if (para.length < 400 ||
            para.startsWith('<h') ||
            para.startsWith('<ul') ||
            para.startsWith('<ol') ||
            para.startsWith('---') ||
            para.startsWith('<figure')) {
            return [para];
        }

        const sentences = para.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
        const grouped = [];
        let currentPara = '';

        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (!sentence) return;
            if (currentPara.length + sentence.length + 1 < 400) {
                currentPara += (currentPara ? ' ' : '') + sentence;
            } else {
                if (currentPara) grouped.push(currentPara);
                currentPara = sentence;
            }
        });

        if (currentPara) grouped.push(currentPara);
        return grouped.length > 0 ? grouped : [para];
    });
}

function normalizeSignature(content) {
    const signaturePatterns = [
        /esos\s*Eight\s*Double\s*Zero/gi,
        /esos\s*Eight\s*double\s*[O0]/gi,
        /ಅಂಕ\s*\d+\s*[Dd]ou?ble\s*[0Oo]/g,
        /Dr\.?\s*Keshava\s*Aithal\s*ಅಂಕ.*$/gm,
        /\d{1,2}\/\d{1,2}\/\d{4}/g
    ];

    signaturePatterns.forEach(pattern => {
        content = content.replace(pattern, '');
    });

    content = content.replace(/\n{3,}/g, '\n\n');
    content = content.replace(/---+\s*$/gm, '');

    const standardSignature = '\n\n---\n\n**Dr Keshava Aithal**  \nಅಂಕ 8 Double 0';
    return content.trim() + standardSignature;
}

/**
 * Insert images based on configuration
 * @param {string} html - HTML content
 * @param {string} chapterKey - Chapter key (e.g., "chapter1")
 * @returns {string} HTML with inserted images
 */
function insertImages(html, chapterKey) {
    if (!imageMapping[chapterKey] || !imageMapping[chapterKey].images) {
        return html;
    }

    const images = imageMapping[chapterKey].images;

    images.forEach(img => {
        const { src, alt, caption, position } = img;

        // Create figure element
        const figure = `
<figure class="chapter-image">
    <img src="../${src}" alt="${alt}" loading="lazy">
    <figcaption>${caption}</figcaption>
</figure>
`;

        // Insert based on position
        if (position === 'after-h3') {
            // Insert after first h3 tag
            html = html.replace(/(<h3>.*?<\/h3>)/, `$1${figure}`);
        } else if (position === 'after-intro') {
            // Insert after first paragraph
            html = html.replace(/(<p>.*?<\/p>)/, `$1${figure}`);
        } else if (position === 'before-signature') {
            // Insert before the HR tag
            html = html.replace(/(<hr>)/, `${figure}$1`);
        }
    });

    return html;
}

// ============================================
// Main Processing
// ============================================

const markdownContent = fs.readFileSync('Heart Talk - Formatted.md', 'utf-8');

const titleMatch = markdownContent.match(/^# (.+)/m);
const authorMatch = markdownContent.match(/by (.+)/m);
const bookTitle = titleMatch ? titleMatch[1] : 'Heart Talk Collection';
const author = authorMatch ? authorMatch[1] : 'Dr. Keshava Aithal';

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

const chapters = [];
for (let i = 0; i < matches.length; i++) {
  const start = matches[i].index;
  const end = i < matches.length - 1 ? matches[i + 1].index : markdownContent.length;
  const chapterContent = markdownContent.substring(start, end);

  const titleLineMatch = chapterContent.match(/###\s*(.+)/);
  let rawTitle = titleLineMatch ? titleLineMatch[1].trim() : `Heart Talk #${matches[i].number}`;
  rawTitle = rawTitle.replace(/[.:]+$/, '');
  const title = toTitleCase(rawTitle);

  chapters.push({
    number: matches[i].number,
    title: title,
    content: chapterContent
  });
}

console.log(`Found ${chapters.length} chapters`);

function convertMarkdownToHTML(markdown, chapterTitle = null) {
  let html = markdown;
  html = html.replace(/## Heart Talk #\d+(?:\.\w+)?/, '');
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

  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  const paragraphs = smartParagraphSplit(html);
  html = paragraphs.map(para => {
    para = para.trim();
    if (!para) return '';
    if (para.startsWith('<h') ||
        para.startsWith('<ul') ||
        para.startsWith('<ol') ||
        para.startsWith('<hr') ||
        para.startsWith('<figure')) {
      return para;
    }
    para = para.replace(/\n/g, ' ');
    return `<p>${para}</p>`;
  }).join('\n');

  return html;
}

// Create chapters-illustrated directory
if (!fs.existsSync('chapters-illustrated')) {
  fs.mkdirSync('chapters-illustrated');
}

// Generate HTML for each chapter (with images)
chapters.forEach((chapter, index) => {
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter = index < chapters.length - 1 ? chapters[index + 1] : null;

  const normalizedContent = normalizeSignature(chapter.content);
  let htmlContent = convertMarkdownToHTML(normalizedContent, chapter.title);

  // Insert images if configured
  const chapterKey = `chapter${index + 1}`;
  htmlContent = insertImages(htmlContent, chapterKey);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heart Talk #${chapter.number}: ${chapter.title} - ${bookTitle}</title>
    <link rel="stylesheet" href="../book-illustrated.css">
</head>
<body>
    <div class="book-container">
        <header class="chapter-header">
            <a href="../index-illustrated.html" class="home-link">← Table of Contents</a>
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
                <a href="../index-illustrated.html">← Table of Contents</a> ·
                <a href="../glossary.html">Medical Glossary</a>
            </p>
        </footer>
    </div>
    <script src="../script.js"></script>
    <script src="../search.js"></script>
</body>
</html>`;

  fs.writeFileSync(`chapters-illustrated/chapter${index + 1}.html`, html);
  const hasImages = imageMapping[chapterKey] ? ' 📷' : '';
  console.log(`Generated chapter${index + 1}.html${hasImages} - Heart Talk #${chapter.number}: ${chapter.title}`);
});

// Generate index-illustrated.html
const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bookTitle} by ${author} - Illustrated Edition</title>
    <link rel="stylesheet" href="book-illustrated.css">
</head>
<body>
    <div class="book-container">
        <header class="book-header">
            <h1 class="book-title">${bookTitle}</h1>
            <p class="book-author">by ${author}</p>
            <p class="book-description">A comprehensive collection of heart health insights and cardiovascular care guidance</p>
            <p class="edition-badge">📷 Illustrated Edition</p>
        </header>

        <main class="table-of-contents">
            <h2>Table of Contents</h2>
            <div class="toc-grid">
                ${chapters.map((chapter, index) => {
                    const chapterKey = `chapter${index + 1}`;
                    const hasImage = imageMapping[chapterKey] ? '📷 ' : '';
                    return `
                <a href="chapters-illustrated/chapter${index + 1}.html" class="toc-item">
                    <span class="toc-number">${hasImage}Heart Talk #${chapter.number}</span>
                    <span class="toc-title">${chapter.title}</span>
                </a>`;
                }).join('')}
            </div>
        </main>

        <footer class="book-footer">
            <p>${chapters.length} chapters of heart health wisdom · <a href="glossary.html">Medical Glossary</a></p>
            <p class="version-note">View <a href="index.html">text-only version</a></p>
        </footer>
    </div>
    <script src="script.js"></script>
    <script src="search.js"></script>
</body>
</html>`;

fs.writeFileSync('index-illustrated.html', indexHTML);
console.log('Generated index-illustrated.html');

// Generate search index (same as text version)
function generateSearchIndex(chapters) {
    const searchIndex = chapters.map((chapter, index) => {
        const normalizedContent = normalizeSignature(chapter.content);
        let htmlContent = convertMarkdownToHTML(normalizedContent);

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

console.log('\n✅ Illustrated website generation complete!');
console.log(`\n📊 Summary:`);
console.log(`   - ${chapters.length} chapters generated`);
console.log(`   - ${Object.keys(imageMapping).length} chapters with images`);
console.log(`   - Smart formatting applied (title case, paragraphs, signatures)`);
console.log('\n📷 Next steps:');
console.log('   1. Add images to the images/ directory');
console.log('   2. See images/README.md for sources and specs');
console.log('   3. Deploy: surge . heart-talks-illustrated.surge.sh');
