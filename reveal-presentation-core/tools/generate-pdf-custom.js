#!/usr/bin/env node
/**
 * Custom PDF Generator for Reveal.js
 * Ensures all content is loaded before printing
 */

const puppeteer = require('puppeteer');

async function generatePDF() {
  console.log('🚀 Starting custom PDF generation...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();

  // Set viewport to exact Reveal.js size
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1
  });

  console.log('📄 Loading presentation...');
  await page.goto('http://localhost:8000/WebLeaper_Presentation/index.html?print-pdf', {
    waitUntil: ['load', 'networkidle0'],
    timeout: 120000
  });

  // Wait for Reveal.js to be ready
  await page.waitForFunction(() => {
    return window.Reveal && window.Reveal.isReady && window.Reveal.isReady();
  }, { timeout: 60000 });

  console.log('✅ Reveal.js ready');

  // Ensure print media CSS applies and enforce page size that matches the good PDF
  await page.emulateMediaType('print');
  await page.addStyleTag({
    content: `@page { size: 21.6in 12.15in; margin: 0; }`
  });

  // Wait for all images to load
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.onload = img.onerror = resolve;
        }))
    );
  });

  console.log('✅ All images loaded');

  // Wait for fonts
  await page.evaluateHandle('document.fonts.ready');
  console.log('✅ Fonts loaded');

  // Additional wait for dynamic content
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ Dynamic content loaded');

  // Get slide count
  const slideCount = await page.evaluate(() => {
    return window.Reveal ? window.Reveal.getTotalSlides() : 0;
  });
  console.log(`📊 Found ${slideCount} slides\n`);

  // Generate PDF with proper settings
  console.log('🖨️  Generating PDF...');
  await page.pdf({
    path: 'out/index-custom.pdf',
    width: '1920px',
    height: '1080px',
    printBackground: true,
    preferCSSPageSize: true,
    // 1.08x yields 1554.96 x 875.04 pts (≈21.6 x 12.15 in)
    scale: 1.08,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  console.log('✅ PDF generated: out/index-custom.pdf');

  await browser.close();

  // Show PDF info
  const { execSync } = require('child_process');
  try {
    const info = execSync('pdfinfo out/index-custom.pdf').toString();
    console.log('\n📊 PDF Information:');
    console.log(info.split('\n').filter(line =>
      line.includes('Pages:') || line.includes('Page size:')
    ).join('\n'));
  } catch (e) {
    console.log('PDF info not available');
  }
}

generatePDF().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
