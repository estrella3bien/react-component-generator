import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5173');
await page.screenshot({ path: './app-screenshot.png', fullPage: true });
await browser.close();
console.log('Screenshot saved to app-screenshot.png');
