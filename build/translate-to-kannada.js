#!/usr/bin/env node

/**
 * Heart Talk Kannada Translation Script
 *
 * Translates "Heart Talk - Formatted.md" from English to Kannada (ಕನ್ನಡ)
 * using Google Translate API.
 *
 * Output: Heart Talk - Kannada.md
 *
 * Features:
 * - Preserves markdown formatting
 * - Maintains chapter structure
 * - Rate-limited to avoid API throttling
 * - Progress reporting
 */

const fs = require('fs');
const translate = require('@vitalets/google-translate-api').translate;

// ============================================
// Configuration
// ============================================

const SOURCE_FILE = 'Heart Talk - Formatted.md';
const OUTPUT_FILE = 'Heart Talk - Kannada.md';
const TARGET_LANG = 'kn'; // Kannada language code

// Rate limiting (milliseconds between API calls)
const RATE_LIMIT_MS = 1000; // 1 second between translations

// ============================================
// Translation Functions
// ============================================

/**
 * Translate text to Kannada
 */
async function translateText(text, targetLang = TARGET_LANG) {
    if (!text || text.trim() === '') {
        return text;
    }

    try {
        const result = await translate(text, { to: targetLang });
        return result.text;
    } catch (error) {
        console.error('Translation error:', error.message);
        // Return original text if translation fails
        return text;
    }
}

/**
 * Wait for specified milliseconds (for rate limiting)
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Translate markdown file chapter by chapter
 */
async function translateMarkdownFile() {
    console.log('🌐 Heart Talk Kannada Translation');
    console.log('='.repeat(50));
    console.log(`📖 Reading source: ${SOURCE_FILE}`);

    // Read source file
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`❌ Source file not found: ${SOURCE_FILE}`);
        process.exit(1);
    }

    const source = fs.readFileSync(SOURCE_FILE, 'utf-8');

    // Split into chapters by "## Heart Talk #" marker
    const parts = source.split(/(?=## Heart Talk #)/);
    const header = parts[0]; // Content before first chapter
    const chapterParts = parts.slice(1);

    console.log(`📊 Found ${chapterParts.length} chapters to translate`);
    console.log('');

    // Translate header if it exists
    let translatedHeader = '';
    if (header.trim()) {
        console.log('📝 Translating header...');
        translatedHeader = await translateText(header);
        await wait(RATE_LIMIT_MS);
    }

    // Translate each chapter
    const translatedChapters = [];

    for (let i = 0; i < chapterParts.length; i++) {
        const chapterText = chapterParts[i];
        const chapterNum = i + 1;

        // Extract chapter number/ID from first line
        const firstLineMatch = chapterText.match(/^## Heart Talk #([\d.a-zA-Z]+)/);
        const chapterId = firstLineMatch ? firstLineMatch[1] : chapterNum;

        console.log(`🔄 Translating chapter ${chapterNum}/${chapterParts.length} (Heart Talk #${chapterId})...`);

        // Keep the chapter marker in English, translate the rest
        const chapterMarker = `## Heart Talk #${chapterId}`;
        const restOfChapter = chapterText.substring(chapterMarker.length);

        try {
            // Translate the chapter content
            const translatedContent = await translateText(restOfChapter);

            // Combine chapter marker (English) with translated content
            translatedChapters.push(chapterMarker + translatedContent);

            // Show progress
            const percentage = Math.round((chapterNum / chapterParts.length) * 100);
            console.log(`   ✅ ${percentage}% complete`);

            // Rate limiting
            if (i < chapterParts.length - 1) {
                await wait(RATE_LIMIT_MS);
            }
        } catch (error) {
            console.error(`   ❌ Error translating chapter ${chapterNum}:`, error.message);
            // Keep original if translation fails
            translatedChapters.push(chapterText);
        }
    }

    // Combine all translated parts
    const output = translatedHeader + translatedChapters.join('');

    // Write output file
    console.log('');
    console.log(`💾 Writing output: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

    // Statistics
    const outputSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
    console.log('');
    console.log('='.repeat(50));
    console.log('✅ Translation complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • ${chapterParts.length} chapters translated`);
    console.log(`   • Output file: ${OUTPUT_FILE}`);
    console.log(`   • File size: ${outputSize} KB`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Review the translated file');
    console.log('   2. Run: node build/translate-glossary.js');
    console.log('   3. Run: ./build/build-all.sh');
    console.log('   4. Test the Kannada site locally');
}

// ============================================
// Main Execution
// ============================================

if (require.main === module) {
    translateMarkdownFile().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { translateText, translateMarkdownFile };
