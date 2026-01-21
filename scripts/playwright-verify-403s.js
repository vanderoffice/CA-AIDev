/**
 * Playwright URL Verification Script
 *
 * Verifies URLs that returned 403 (bot protection) with the validation script.
 * Uses a real browser to bypass simple bot detection.
 *
 * Usage: node scripts/playwright-verify-403s.js
 *
 * Output: scripts/playwright-verification-results.json
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '403-urls-for-playwright.json');
const OUTPUT_FILE = path.join(__dirname, 'playwright-verification-results.json');

// Timeout for each page load (ms)
const PAGE_TIMEOUT = 30000;

// Concurrency - how many pages to check in parallel
const CONCURRENCY = 5;

async function verifyUrl(browser, urlEntry, index, total) {
    const { url, sources } = urlEntry;
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    let result = {
        url,
        sources,
        verified: false,
        status: null,
        title: null,
        error: null,
        isBlocked: false,
    };

    try {
        const response = await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: PAGE_TIMEOUT
        });

        if (response) {
            result.status = response.status();

            if (response.ok()) {
                // Page loaded successfully
                result.verified = true;
                result.title = await page.title();

                // Check if it's a soft-404 or block page
                const bodyText = await page.textContent('body').catch(() => '');
                const lowerBody = bodyText.toLowerCase();

                if (lowerBody.includes('access denied') ||
                    lowerBody.includes('403 forbidden') ||
                    lowerBody.includes('blocked') ||
                    lowerBody.includes('robot') ||
                    lowerBody.includes('captcha')) {
                    result.isBlocked = true;
                    result.verified = false;
                }

                console.log(`[${index + 1}/${total}] ✓ ${url.substring(0, 60)} - ${result.title?.substring(0, 30)}`);
            } else {
                result.error = `HTTP ${result.status}`;
                console.log(`[${index + 1}/${total}] ✗ ${url.substring(0, 60)} - HTTP ${result.status}`);
            }
        } else {
            result.error = 'No response';
            console.log(`[${index + 1}/${total}] ✗ ${url.substring(0, 60)} - No response`);
        }
    } catch (err) {
        result.error = err.message.substring(0, 100);
        console.log(`[${index + 1}/${total}] ✗ ${url.substring(0, 60)} - ${result.error.substring(0, 50)}`);
    }

    await context.close();
    return result;
}

async function processBatch(browser, batch, startIndex, total) {
    return Promise.all(batch.map((entry, i) =>
        verifyUrl(browser, entry, startIndex + i, total)
    ));
}

async function main() {
    console.log('='.repeat(70));
    console.log('Playwright URL Verification for 403 URLs');
    console.log('='.repeat(70));

    // Load URLs
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Error: ${INPUT_FILE} not found`);
        console.log('Run the URL validation script first to generate this file.');
        process.exit(1);
    }

    const urls = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
    console.log(`\nLoaded ${urls.length} URLs to verify\n`);

    // Launch browser
    const browser = await chromium.launch({
        headless: true,
    });

    console.log('Browser launched (headless mode)\n');

    const results = [];

    // Process in batches for controlled concurrency
    for (let i = 0; i < urls.length; i += CONCURRENCY) {
        const batch = urls.slice(i, i + CONCURRENCY);
        const batchResults = await processBatch(browser, batch, i, urls.length);
        results.push(...batchResults);
    }

    await browser.close();

    // Summarize results
    const verified = results.filter(r => r.verified);
    const blocked = results.filter(r => r.isBlocked);
    const failed = results.filter(r => !r.verified && !r.isBlocked);

    console.log('\n' + '='.repeat(70));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(70));
    console.log(`  ✓ Verified (URL works): ${verified.length}`);
    console.log(`  ⊘ Still blocked:        ${blocked.length}`);
    console.log(`  ✗ Failed:               ${failed.length}`);

    // Save results
    const output = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            verified: verified.length,
            blocked: blocked.length,
            failed: failed.length,
        },
        results,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`\nResults saved to: ${OUTPUT_FILE}`);

    // Show verified URLs (these are actually valid, not bot-blocked)
    if (verified.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('VERIFIED URLs (valid, just have bot protection against scripts):');
        console.log('='.repeat(70));
        for (const r of verified) {
            console.log(`  ${r.url}`);
            console.log(`    Title: ${r.title?.substring(0, 60)}`);
        }
    }

    // Show still-blocked URLs (need manual verification)
    if (blocked.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('STILL BLOCKED (may need manual verification):');
        console.log('='.repeat(70));
        for (const r of blocked) {
            console.log(`  ${r.url}`);
        }
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
