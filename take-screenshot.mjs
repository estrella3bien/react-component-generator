const playwright = await import('playwright');
const { chromium } = playwright;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'design-screenshot.png', fullPage: false });
await browser.close();
console.log('Screenshot saved to design-screenshot.png');
