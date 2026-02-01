const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  
  // Desktop screenshot
  console.log('📸 Capturing desktop view...');
  const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktopPage.goto('http://localhost:3000/lealtad/configuracion', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ path: '/tmp/loyalty-config-desktop.png', fullPage: true });
  await desktopPage.close();
  
  // Mobile screenshot
  console.log('📱 Capturing mobile view...');
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto('http://localhost:3000/lealtad/configuracion', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: '/tmp/loyalty-config-mobile.png', fullPage: true });
  await mobilePage.close();
  
  await browser.close();
  console.log('✅ Screenshots captured successfully');
})();
