from playwright.sync_api import sync_playwright
import os

# Pages that don't require auth
PUBLIC_PAGES = [
    ("/login", "login"),
    ("/register", "register"),
    ("/reservar/demo-barber", "reservar"),
]

# Viewports
DESKTOP = {"width": 1440, "height": 900}
MOBILE = {"width": 390, "height": 844}

os.makedirs("/tmp/verify", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Desktop screenshots
    print("📸 Taking desktop screenshots...")
    page = browser.new_page(viewport=DESKTOP)
    for path, name in PUBLIC_PAGES:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=15000)
            page.wait_for_timeout(1000)  # Wait for animations
            page.screenshot(path=f"/tmp/verify/{name}_desktop.png", full_page=True)
            print(f"  ✓ {name} desktop")
        except Exception as e:
            print(f"  ✗ {name} desktop: {e}")
    page.close()

    # Mobile screenshots
    print("📱 Taking mobile screenshots...")
    page = browser.new_page(viewport=MOBILE)
    for path, name in PUBLIC_PAGES:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=15000)
            page.wait_for_timeout(1000)  # Wait for animations
            page.screenshot(path=f"/tmp/verify/{name}_mobile.png", full_page=True)
            print(f"  ✓ {name} mobile")
        except Exception as e:
            print(f"  ✗ {name} mobile: {e}")
    page.close()

    browser.close()
    print("\n✅ Screenshots saved to /tmp/verify/")
