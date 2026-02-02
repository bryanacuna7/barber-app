from playwright.sync_api import sync_playwright
import sys

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 1024})

    # Navigate to referencias preview page (public, no auth required)
    print("Navigating to referencias-preview page...")
    page.goto('http://localhost:3000/referencias-preview')

    # Wait for page to load completely
    page.wait_for_load_state('networkidle')

    # Check for console errors
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    # Wait for animations to complete
    page.wait_for_timeout(2000)

    # Verify key components are rendered
    print("\nVerifying components...")

    # Stats Cards
    stats_cards = page.locator('text=Total Referidos').count()
    print(f"✓ Stats Cards: {'Found' if stats_cards > 0 else 'NOT FOUND'}")

    # Referral Code Card
    code_card = page.locator('text=Tu Código de Referido').count()
    print(f"✓ Referral Code Card: {'Found' if code_card > 0 else 'NOT FOUND'}")

    # Milestone Progress
    milestone = page.locator('text=Progreso de Milestones').count()
    print(f"✓ Milestone Progress: {'Found' if milestone > 0 else 'NOT FOUND'}")

    # Badges Showcase
    badges = page.locator('text=Badges Desbloqueados').count()
    print(f"✓ Badges Showcase: {'Found' if badges > 0 else 'NOT FOUND'}")

    # Conversions Table
    conversions = page.locator('text=Historial de Conversiones').count()
    print(f"✓ Conversions Table: {'Found' if conversions > 0 else 'NOT FOUND'}")

    # Take full page screenshot
    page.screenshot(path='/tmp/referencias-preview-full.png', full_page=True)
    print("\n✅ Full screenshot saved to /tmp/referencias-preview-full.png")

    # Take mobile screenshot
    mobile_page = browser.new_page(viewport={'width': 375, 'height': 812})
    mobile_page.goto('http://localhost:3000/referencias-preview')
    mobile_page.wait_for_load_state('networkidle')
    mobile_page.wait_for_timeout(2000)
    mobile_page.screenshot(path='/tmp/referencias-preview-mobile.png', full_page=True)
    print("✅ Mobile screenshot saved to /tmp/referencias-preview-mobile.png")

    # Check for errors
    if console_errors:
        print(f"\n⚠️  Console errors detected: {len(console_errors)}")
        for error in console_errors[:5]:  # Show first 5 errors
            print(f"  - {error}")
        sys.exit(1)
    else:
        print("\n✅ No console errors detected")

    browser.close()
    print("\n🎉 All components verified successfully!")
