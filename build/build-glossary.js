#!/usr/bin/env node

/**
 * Heart Talk Medical Glossary Generator
 *
 * Generates a standalone glossary page from glossary-terms.json
 */

const fs = require('fs');

// Load glossary terms
const glossaryData = JSON.parse(fs.readFileSync('glossary-terms.json', 'utf-8'));

// Group terms alphabetically
const groupedTerms = {};
glossaryData.terms.forEach(term => {
    const firstLetter = term.term[0].toUpperCase();
    if (!groupedTerms[firstLetter]) {
        groupedTerms[firstLetter] = [];
    }
    groupedTerms[firstLetter].push(term);
});

// Sort within each letter group
Object.keys(groupedTerms).forEach(letter => {
    groupedTerms[letter].sort((a, b) => a.term.localeCompare(b.term));
});

const alphabet = Object.keys(groupedTerms).sort();

// Generate HTML
const glossaryHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medical Glossary - Heart Talk Collection</title>
    <link rel="stylesheet" href="book.css">
    <link rel="stylesheet" href="glossary.css">
</head>
<body>
    <div class="book-container">
        <header class="glossary-header">
            <a href="index.html" class="home-link">← Table of Contents</a>
            <h1>Medical Glossary</h1>
            <p class="glossary-subtitle">Quick reference guide to medical terms used throughout Heart Talk</p>
            <p class="glossary-ai-note">⚠️ These definitions were generated with AI assistance and are intended for general educational purposes only. Always consult a qualified medical professional for medical advice.</p>
        </header>

        <nav class="alphabet-nav" aria-label="Jump to letter">
            ${alphabet.map(letter => `<a href="#letter-${letter}" class="alphabet-link">${letter}</a>`).join('\n            ')}
        </nav>

        <main class="glossary-content">
            ${alphabet.map(letter => `
            <section class="glossary-section" id="letter-${letter}">
                <h2 class="glossary-letter">${letter}</h2>
                <dl class="glossary-list">
                    ${groupedTerms[letter].map(term => `
                    <div class="glossary-entry">
                        <dt class="glossary-term" id="term-${term.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}">${term.term}</dt>
                        <dd class="glossary-definition">
                            ${term.definition}
                            ${term.relatedChapters && term.relatedChapters.length > 0 ? `
                            <div class="glossary-chapters">
                                Related chapters: ${term.relatedChapters.map(ch =>
                                    `<a href="chapters/chapter${ch}.html">Heart Talk #${ch}</a>`
                                ).join(', ')}
                            </div>
                            ` : ''}
                        </dd>
                    </div>
                    `).join('')}
                </dl>
            </section>
            `).join('\n')}
        </main>

        <footer class="book-footer">
            <p>${glossaryData.terms.length} medical terms · <a href="index.html">Return to Table of Contents</a></p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

fs.writeFileSync('glossary.html', glossaryHTML);
console.log('✅ Generated glossary.html');
console.log(`📊 ${glossaryData.terms.length} medical terms across ${alphabet.length} letters`);
