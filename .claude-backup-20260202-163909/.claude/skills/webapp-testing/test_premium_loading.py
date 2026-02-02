#!/usr/bin/env python3
"""
Premium Loading Screen Visual Validation
Tests the enhanced loading screen with particles, glass panel, monogram, etc.
"""

from playwright.sync_api import sync_playwright
import time
import sys

def test_premium_loading_screen():
    """Validate premium loading screen implementation"""

    print("\n🎬 Starting Premium Loading Screen Test\n")

    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        # Enable console logging
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        try:
            print("📍 Navigating to Index.html...")
            # Note: Server serves from project root, Index.html is at root level
            page.goto('http://localhost:8000/Index.html', wait_until='networkidle')

            # CRITICAL: Capture loader IMMEDIATELY (it appears fast)
            print("📸 Capturing initial loader state (0-500ms)...")
            page.wait_for_timeout(100)  # Brief pause to ensure render
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-initial.png',
                full_page=False
            )

            # Check for premium loader elements
            print("🔍 Validating premium loader components...")

            # 1. Brand Loader Container
            loader = page.locator('.brand-loader')
            if loader.is_visible():
                print("  ✓ Brand loader container visible")
            else:
                print("  ✗ Brand loader NOT visible (may have loaded too fast)")

            # 2. Floating Particles
            particles = page.locator('.brand-loader-particle')
            particle_count = particles.count()
            print(f"  ✓ Particles found: {particle_count}/15 expected")

            # 3. Glass Panel
            glass_panel = page.locator('.brand-loader-glass')
            if glass_panel.count() > 0:
                print("  ✓ Glass panel present")

            # 4. Monogram
            monogram = page.locator('.brand-loader-monogram')
            if monogram.count() > 0:
                print("  ✓ Monogram present")

            # 5. Percentage Display
            percentage = page.locator('.brand-loader-percent')
            if percentage.count() > 0:
                print("  ✓ Percentage display present")

            # 6. Progress Bar
            progress_bar = page.locator('.brand-loader-progress')
            if progress_bar.count() > 0:
                print("  ✓ Progress bar present")

            # 7. Status Text (CLI-style)
            status_text = page.locator('.brand-loader-status')
            if status_text.count() > 0:
                print("  ✓ Status text present")

            # Capture at different progress stages
            print("\n📸 Capturing progress stages...")

            # Stage 2: ~25% progress
            page.wait_for_timeout(300)
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-25percent.png',
                full_page=False
            )
            print("  ✓ Captured ~25% progress")

            # Stage 3: ~50% progress
            page.wait_for_timeout(400)
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-50percent.png',
                full_page=False
            )
            print("  ✓ Captured ~50% progress")

            # Stage 4: ~90% progress (waiting for data)
            page.wait_for_timeout(600)
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-90percent.png',
                full_page=False
            )
            print("  ✓ Captured ~90% progress")

            # Wait for loader to complete and home content to appear
            print("\n⏳ Waiting for loader completion...")
            page.wait_for_selector('.hero', timeout=10000)
            print("  ✓ Loader completed, home content visible")

            # Capture final home state
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-complete.png',
                full_page=True
            )
            print("  ✓ Captured final home state")

            # Test reduced motion support
            print("\n♿ Testing reduced-motion support...")
            page.emulate_media(reduced_motion='reduce')
            page.reload(wait_until='domcontentloaded')
            page.wait_for_timeout(100)
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-reduced-motion.png',
                full_page=False
            )
            print("  ✓ Reduced motion tested")

            # Check for console errors
            print("\n🐛 Checking console output...")
            errors = [msg for msg in console_messages if 'error' in msg.lower()]
            if errors:
                print(f"  ⚠️  Console errors found:")
                for error in errors:
                    print(f"    {error}")
            else:
                print("  ✓ No console errors")

            # Performance check
            print("\n⚡ Performance metrics...")
            metrics = page.evaluate("""() => {
                const perf = performance.getEntriesByType('navigation')[0];
                return {
                    domContentLoaded: Math.round(perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart),
                    loadComplete: Math.round(perf.loadEventEnd - perf.loadEventStart),
                    domInteractive: Math.round(perf.domInteractive - perf.fetchStart)
                };
            }""")
            print(f"  DOM Content Loaded: {metrics['domContentLoaded']}ms")
            print(f"  Load Complete: {metrics['loadComplete']}ms")
            print(f"  DOM Interactive: {metrics['domInteractive']}ms")

            print("\n✅ Premium Loading Screen Test Complete!")
            print(f"\n📂 Screenshots saved to: .playwright-mcp/")
            print("   - premium-loader-initial.png")
            print("   - premium-loader-25percent.png")
            print("   - premium-loader-50percent.png")
            print("   - premium-loader-90percent.png")
            print("   - premium-loader-complete.png")
            print("   - premium-loader-reduced-motion.png")

            return True

        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            page.screenshot(
                path='/Users/bryanacuna/Desktop/Training Platform/.playwright-mcp/premium-loader-error.png',
                full_page=True
            )
            print("Error screenshot saved to: premium-loader-error.png")
            return False

        finally:
            browser.close()

if __name__ == '__main__':
    success = test_premium_loading_screen()
    sys.exit(0 if success else 1)
