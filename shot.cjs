const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1217/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('https://bbsflooring.ca/', { waitUntil: 'networkidle', timeout: 60000 });
  try { await p.click('text=Accept All', { timeout: 4000 }); } catch {}
  await p.waitForTimeout(2000);
  await p.screenshot({ path: '/tmp/desktop-cta.png' });
  await b.close();
})();
