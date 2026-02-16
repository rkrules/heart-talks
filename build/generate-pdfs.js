#!/usr/bin/env node

/**
 * Heart Talk PDF Generator
 *
 * Generates professional PDFs for all chapters and a complete book PDF
 * using Puppeteer (headless Chrome).
 *
 * Output:
 * - pdfs/chapter1.pdf through pdfs/chapter63.pdf (individual chapters)
 * - pdfs/heart-talk-complete.pdf (all chapters + glossary + cover + TOC)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============================================
// Configuration
// ============================================

const CHAPTERS_DIR = path.join(__dirname, '../chapters');
const PDFS_DIR = path.join(__dirname, '../pdfs');
const GLOSSARY_PATH = path.join(__dirname, '../glossary.html');
const CSS_PATH = path.join(__dirname, '../book.css');

// Total number of chapters
const TOTAL_CHAPTERS = 63;

// PDF options
const PDF_OPTIONS = {
    format: 'A4',
    margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
    },
    printBackground: true,
    preferCSSPageSize: true
};

// ============================================
// Utility Functions
// ============================================

/**
 * Ensure output directory exists
 */
function ensurePdfsDirectory() {
    if (!fs.existsSync(PDFS_DIR)) {
        fs.mkdirSync(PDFS_DIR, { recursive: true });
        console.log(`✅ Created pdfs/ directory`);
    }
}

/**
 * Read file as UTF-8
 */
function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Extract chapter title from HTML content
 */
function extractChapterTitle(html) {
    const match = html.match(/<h1[^>]*class="chapter-title"[^>]*>([^<]+)<\/h1>/);
    return match ? match[1].trim() : 'Unknown Chapter';
}

// ============================================
// PDF Generation Functions
// ============================================

/**
 * Generate PDF for a single chapter
 */
async function generateChapterPDF(browser, chapterNum) {
    const chapterPath = path.join(CHAPTERS_DIR, `chapter${chapterNum}.html`);

    if (!fs.existsSync(chapterPath)) {
        console.log(`⚠️  Chapter ${chapterNum} not found, skipping`);
        return false;
    }

    const page = await browser.newPage();

    try {
        // Load the chapter HTML
        const fileUrl = `file://${chapterPath}`;
        await page.goto(fileUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Extract title for logging
        const title = await page.evaluate(() => {
            const h1 = document.querySelector('.chapter-title');
            return h1 ? h1.textContent.trim() : 'Unknown';
        });

        // Generate PDF
        const pdfPath = path.join(PDFS_DIR, `chapter${chapterNum}.pdf`);
        await page.pdf({
            ...PDF_OPTIONS,
            path: pdfPath
        });

        const stats = fs.statSync(pdfPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`✅ Chapter ${chapterNum}: "${title}" (${sizeMB} MB)`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating PDF for chapter ${chapterNum}:`, error.message);
        return false;
    } finally {
        await page.close();
    }
}

/**
 * Generate complete book PDF with cover, TOC, all chapters, and glossary
 */
async function generateCompleteBookPDF(browser) {
    console.log('\n📚 Generating complete book PDF...');

    const page = await browser.newPage();

    try {
        // Read CSS
        const css = readFile(CSS_PATH);

        // Build complete HTML document
        let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heart Talk - Complete Book</title>
    <style>${css}</style>
</head>
<body>
    <div class="book-container">
`;

        // Add cover page
        htmlContent += `
        <div class="cover-page" style="text-align: center; padding: 200px 0; page-break-after: always;">
            <h1 style="font-size: 3.5em; margin-bottom: 40px; color: var(--accent-color);">Heart Talk</h1>
            <p style="font-size: 1.8em; color: var(--text-secondary); font-style: italic; margin-bottom: 20px;">
                Heart Health Education
            </p>
            <p style="font-size: 1.3em; color: var(--text-primary); margin-top: 60px;">
                <strong>Dr. Keshava Aithal</strong><br>
                <span style="color: var(--text-secondary);">ಅಂಕ 8 Double 0</span>
            </p>
            <p style="font-size: 1.1em; color: var(--text-secondary); margin-top: 100px;">
                63 Chapters on Cardiovascular Health
            </p>
        </div>
`;

        // Add table of contents
        htmlContent += `
        <div class="toc-page" style="page-break-before: always; page-break-after: always;">
            <h2 style="text-align: center; margin-bottom: 60px; font-size: 2.5em;">Table of Contents</h2>
            <div class="toc-list">
`;

        // Read all chapters to build TOC
        for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
            const chapterPath = path.join(CHAPTERS_DIR, `chapter${i}.html`);
            if (fs.existsSync(chapterPath)) {
                const html = readFile(chapterPath);
                const title = extractChapterTitle(html);
                htmlContent += `
                <div style="padding: 12px 0; border-bottom: 1px dotted #ccc; display: flex; justify-content: space-between;">
                    <span><strong>${i}.</strong> ${title}</span>
                    <span style="color: var(--text-secondary);">${i}</span>
                </div>
`;
            }
        }

        htmlContent += `
            </div>
        </div>
`;

        // Add all chapters
        for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
            const chapterPath = path.join(CHAPTERS_DIR, `chapter${i}.html`);
            if (fs.existsSync(chapterPath)) {
                const html = readFile(chapterPath);

                // Extract chapter content (skip header, footer, navigation)
                const contentMatch = html.match(/<div class="chapter-content">([\s\S]*?)<\/div>\s*(?:<div class="chapter-navigation"|<footer|$)/);

                if (contentMatch) {
                    const title = extractChapterTitle(html);
                    htmlContent += `
        <div class="chapter-content" style="page-break-before: always;">
            <h1 class="chapter-title">${title}</h1>
            ${contentMatch[1]}
        </div>
`;
                }
            }
        }

        // Add glossary if exists
        if (fs.existsSync(GLOSSARY_PATH)) {
            const glossaryHtml = readFile(GLOSSARY_PATH);
            const glossaryMatch = glossaryHtml.match(/<div class="glossary-content">([\s\S]*?)<\/div>\s*(?:<footer|$)/);

            if (glossaryMatch) {
                htmlContent += `
        <div class="glossary-appendix" style="page-break-before: always;">
            <h1 style="text-align: center; margin-bottom: 60px;">Medical Glossary</h1>
            ${glossaryMatch[1]}
        </div>
`;
            }
        }

        // Close HTML
        htmlContent += `
    </div>
</body>
</html>
`;

        // Set content and generate PDF
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        const completePdfPath = path.join(PDFS_DIR, 'heart-talk-complete.pdf');
        await page.pdf({
            ...PDF_OPTIONS,
            path: completePdfPath,
            displayHeaderFooter: true,
            headerTemplate: '<div style="font-size:10px; text-align:center; width:100%; color:#666;">Heart Talk Collection by Dr. Keshava Aithal</div>',
            footerTemplate: '<div style="font-size:10px; text-align:center; width:100%; color:#666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
        });

        const stats = fs.statSync(completePdfPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`✅ Complete book PDF generated (${sizeMB} MB)`);
        return true;
    } catch (error) {
        console.error(`❌ Error generating complete book PDF:`, error.message);
        return false;
    } finally {
        await page.close();
    }
}

// ============================================
// Main Execution
// ============================================

async function main() {
    console.log('📄 Heart Talk PDF Generator\n');
    console.log('=' . repeat(50));

    // Ensure output directory exists
    ensurePdfsDirectory();

    // Launch browser
    console.log('🚀 Launching headless Chrome...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // Generate individual chapter PDFs
        console.log(`\n📖 Generating ${TOTAL_CHAPTERS} individual chapter PDFs...\n`);

        let successCount = 0;
        for (let i = 1; i <= TOTAL_CHAPTERS; i++) {
            const success = await generateChapterPDF(browser, i);
            if (success) successCount++;
        }

        console.log(`\n✅ Generated ${successCount}/${TOTAL_CHAPTERS} chapter PDFs`);

        // Generate complete book PDF
        await generateCompleteBookPDF(browser);

        console.log('\n' + '='.repeat(50));
        console.log('✅ PDF generation complete!');
        console.log(`📁 Output directory: ${PDFS_DIR}`);
        console.log('\n📊 Summary:');
        console.log(`   • ${successCount} individual chapter PDFs`);
        console.log(`   • 1 complete book PDF`);

        // Calculate total size
        const files = fs.readdirSync(PDFS_DIR);
        let totalSize = 0;
        files.forEach(file => {
            const stats = fs.statSync(path.join(PDFS_DIR, file));
            totalSize += stats.size;
        });
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        console.log(`   • Total size: ${totalSizeMB} MB`);

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { generateChapterPDF, generateCompleteBookPDF };
