const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Mobile screenshot (iPhone 12 size: 390x844, but using 375x667 as requested)
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 667 });
  await mobilePage.goto('http://localhost:3000/reservar/barberia-test');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.screenshot({ path: '/tmp/booking-mobile.png', fullPage: true });
  console.log('Mobile screenshot saved to /tmp/booking-mobile.png');

  // Desktop screenshot (1280x800)
  const desktopPage = await context.newPage();
  await desktopPage.setViewportSize({ width: 1280, height: 800 });
  await desktopPage.goto('http://localhost:3000/reservar/barberia-test');
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.screenshot({ path: '/tmp/booking-desktop.png', fullPage: true });
  console.log('Desktop screenshot saved to /tmp/booking-desktop.png');

  await browser.close();
})();
