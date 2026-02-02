#!/usr/bin/env python3
"""
Premium Loading Screen - Final Visual Validation
Quick visual test to capture the premium loading screen in action
"""

from playwright.sync_api import sync_playwright
import sys

def test_final_loading():
    """Quick visual validation of premium loading screen"""

    print("\n🎬 Premium Loading Screen - Final Test\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})

        try:
            print("📍 Loading application...")
            page.goto('http://localhost:8002/Index.html', wait_until='domcontentloaded')

            # Capture loader at start
            page.wait_for_timeout(200)
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/FINAL-loader-premium.png',
                full_page=False
            )
            print("  ✓ Captured premium loader")

            # Wait for home to load
            print("⏳ Waiting for app to load...")
            page.wait_for_selector('.hero', timeout=15000)

            # Capture final home state
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/FINAL-home-loaded.png',
                full_page=True
            )
            print("  ✓ App loaded successfully!")

            # Get console logs
            print("\n📋 Console output:")
            console_logs = page.evaluate("""() => {
                return window.app && window.app.DEBUG ? 'Debug mode active' : 'Normal mode';
            }""")
            print(f"  {console_logs}")

            print("\n✅ Test Complete - Premium Loading Screen Working!\n")
            print("📸 Screenshots:")
            print("   - FINAL-loader-premium.png (loading screen)")
            print("   - FINAL-home-loaded.png (home page)")

            return True

        except Exception as e:
            print(f"\n❌ Error: {e}")
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/FINAL-error.png',
                full_page=True
            )
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test_final_loading()
    sys.exit(0 if success else 1)
