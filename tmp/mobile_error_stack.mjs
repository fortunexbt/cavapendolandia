import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.on('pageerror', (err) => {
  console.log('PAGEERROR_STACK_START');
  console.log(err && err.stack ? err.stack : String(err));
  console.log('PAGEERROR_STACK_END');
});
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    console.log('CONSOLE_ERROR', msg.text());
  }
});
await page.goto('http://127.0.0.1:4175/galleria', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await browser.close();
