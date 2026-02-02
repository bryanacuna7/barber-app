from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})

    # Login first
    page.goto('http://localhost:3000/login')
    page.wait_for_load_state('networkidle')

    page.fill('input[type="email"]', 'bryn.acuna7@gmail.com')
    page.fill('input[type="password"]', 'abcd1234')
    page.click('button[type="submit"]')

    # Wait for redirect
    page.wait_for_timeout(3000)

    # Go to citas
    page.goto('http://localhost:3000/citas')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Take full page screenshot
    page.screenshot(path='/tmp/citas_full.png', full_page=True)
    print("Screenshot saved to /tmp/citas_full.png")
    print(f"Current URL: {page.url}")

    browser.close()
