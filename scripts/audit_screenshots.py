from playwright.sync_api import sync_playwright
import os

# All pages to audit
PAGES = [
    ("/dashboard", "dashboard"),
    ("/servicios", "servicios"),
    ("/configuracion", "configuracion"),
    ("/citas", "citas"),
    ("/clientes", "clientes"),
    ("/barberos", "barberos"),
    ("/reservar/demo-barber", "reservar"),
    ("/login", "login"),
    ("/register", "register"),
]

# Viewports
DESKTOP = {"width": 1440, "height": 900}
MOBILE = {"width": 390, "height": 844}

os.makedirs("/tmp/audit", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Desktop screenshots
    print("📸 Taking desktop screenshots...")
    page = browser.new_page(viewport=DESKTOP)
    for path, name in PAGES:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=10000)
            page.wait_for_timeout(500)
            page.screenshot(path=f"/tmp/audit/{name}_desktop.png", full_page=True)
            print(f"  ✓ {name} desktop")
        except Exception as e:
            print(f"  ✗ {name} desktop: {e}")
    page.close()

    # Mobile screenshots
    print("📱 Taking mobile screenshots...")
    page = browser.new_page(viewport=MOBILE)
    for path, name in PAGES:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=10000)
            page.wait_for_timeout(500)
            page.screenshot(path=f"/tmp/audit/{name}_mobile.png", full_page=True)
            print(f"  ✓ {name} mobile")
        except Exception as e:
            print(f"  ✗ {name} mobile: {e}")
    page.close()

    browser.close()
    print("\n✅ All screenshots saved to /tmp/audit/")
