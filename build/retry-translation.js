#!/usr/bin/env node

/**
 * Retry failed Kannada translations
 *
 * Translates chapters that failed due to rate limiting
 * with longer delays between requests
 */

const fs = require('fs');
const translate = require('@vitalets/google-translate-api').translate;

// Chapters that failed (56-63)
const FAILED_CHAPTERS = [56, 57, 58, 59, '59.ver1', 60, 61, 62];
const RATE_LIMIT_MS = 3000; // 3 seconds between translations (slower)
const TARGET_LANG = 'kn';

async function translateText(text, targetLang = TARGET_LANG) {
    if (!text || text.trim() === '') {
        return text;
    }

    try {
        const result = await translate(text, { to: targetLang });
        return result.text;
    } catch (error) {
        console.error('   ⚠️  Translation error:', error.message);
        return text; // Return original on error
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryFailedChapters() {
    console.log('🔄 Retrying Failed Kannada Translations');
    console.log('='.repeat(50));

    // Read the partially translated file
    const kannadaFile = 'Heart Talk - Kannada.md';
    if (!fs.existsSync(kannadaFile)) {
        console.error('❌ Kannada file not found!');
        process.exit(1);
    }

    let content = fs.readFileSync(kannadaFile, 'utf-8');

    console.log(`📊 Retrying ${FAILED_CHAPTERS.length} failed chapters with slower rate (3 sec/chapter)`);
    console.log('');

    for (let i = 0; i < FAILED_CHAPTERS.length; i++) {
        const chapterId = FAILED_CHAPTERS[i];
        const chapterNum = typeof chapterId === 'string' ? chapterId : String(chapterId);

        console.log(`🔄 Retrying chapter ${i + 1}/${FAILED_CHAPTERS.length}: Heart Talk #${chapterNum}...`);

        // Find the chapter in the file
        const chapterMarker = `## Heart Talk #${chapterNum}`;
        const nextChapterPattern = /## Heart Talk #/;

        const chapterStart = content.indexOf(chapterMarker);
        if (chapterStart === -1) {
            console.log(`   ⚠️  Chapter not found, skipping`);
            continue;
        }

        // Find the end of this chapter (start of next chapter or end of file)
        const searchStart = chapterStart + chapterMarker.length;
        const restOfContent = content.substring(searchStart);
        const nextChapterMatch = restOfContent.match(nextChapterPattern);

        const chapterEnd = nextChapterMatch
            ? chapterStart + chapterMarker.length + nextChapterMatch.index
            : content.length;

        const chapterContent = content.substring(chapterStart + chapterMarker.length, chapterEnd);

        try {
            // Translate the chapter content
            const translatedContent = await translateText(chapterContent);

            // Replace in the content
            const newChapterText = chapterMarker + translatedContent;
            content = content.substring(0, chapterStart) +
                     newChapterText +
                     content.substring(chapterEnd);

            console.log(`   ✅ Successfully translated`);

            // Rate limiting - wait longer between requests
            if (i < FAILED_CHAPTERS.length - 1) {
                await wait(RATE_LIMIT_MS);
            }
        } catch (error) {
            console.error(`   ❌ Error translating chapter ${chapterNum}:`, error.message);
        }
    }

    // Write the updated file
    console.log('');
    console.log('💾 Writing updated file...');
    fs.writeFileSync(kannadaFile, content, 'utf-8');

    const stats = fs.statSync(kannadaFile);
    const sizeMB = (stats.size / 1024).toFixed(2);

    console.log('');
    console.log('='.repeat(50));
    console.log('✅ Retry complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Processed ${FAILED_CHAPTERS.length} chapters`);
    console.log(`   • Output file: ${kannadaFile}`);
    console.log(`   • File size: ${sizeMB} KB`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Run: npm run translate:glossary (retry glossary)');
    console.log('   2. Run: ./build/build-all.sh');
}

retryFailedChapters().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
