#!/usr/bin/env node

/**
 * Heart Talk Glossary Kannada Translation Script
 *
 * Translates glossary-terms.json from English to Kannada
 *
 * Output: glossary-terms-kannada.json
 *
 * Features:
 * - Translates term names and definitions
 * - Preserves relatedChapters and category fields
 * - Rate-limited to avoid API throttling
 */

const fs = require('fs');
const translate = require('@vitalets/google-translate-api').translate;

// ============================================
// Configuration
// ============================================

const SOURCE_FILE = 'glossary-terms.json';
const OUTPUT_FILE = 'glossary-terms-kannada.json';
const TARGET_LANG = 'kn'; // Kannada

// Rate limiting
const RATE_LIMIT_MS = 1000;

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
        return text; // Return original on error
    }
}

/**
 * Wait for specified milliseconds
 */
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Translate glossary file
 */
async function translateGlossary() {
    console.log('🌐 Glossary Kannada Translation');
    console.log('='.repeat(50));
    console.log(`📖 Reading source: ${SOURCE_FILE}`);

    // Read source file
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`❌ Source file not found: ${SOURCE_FILE}`);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
    const terms = data.terms || [];

    console.log(`📊 Found ${terms.length} terms to translate`);
    console.log('');

    // Translate each term
    const translatedTerms = [];

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const progress = i + 1;

        console.log(`🔄 Translating ${progress}/${terms.length}: "${term.term}"...`);

        try {
            // Translate term name and definition
            const translatedTerm = await translateText(term.term);
            const translatedDefinition = await translateText(term.definition);

            // Keep category in English for consistency, but could translate if needed
            const translatedCategory = term.category; // Keep English for now

            translatedTerms.push({
                term: translatedTerm,
                definition: translatedDefinition,
                relatedChapters: term.relatedChapters, // Keep numbers as-is
                category: translatedCategory
            });

            const percentage = Math.round((progress / terms.length) * 100);
            console.log(`   ✅ ${percentage}% complete`);

            // Rate limiting
            if (i < terms.length - 1) {
                await wait(RATE_LIMIT_MS);
            }
        } catch (error) {
            console.error(`   ❌ Error translating "${term.term}":`, error.message);
            // Keep original on error
            translatedTerms.push(term);
        }
    }

    // Create output structure
    const output = {
        terms: translatedTerms
    };

    // Write output file
    console.log('');
    console.log(`💾 Writing output: ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

    // Statistics
    const outputSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);
    console.log('');
    console.log('='.repeat(50));
    console.log('✅ Glossary translation complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • ${translatedTerms.length} terms translated`);
    console.log(`   • Output file: ${OUTPUT_FILE}`);
    console.log(`   • File size: ${outputSize} KB`);
    console.log('');
    console.log('🚀 Next step: Run ./build/build-all.sh to generate Kannada site');
}

// ============================================
// Main Execution
// ============================================

if (require.main === module) {
    translateGlossary().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { translateGlossary };
