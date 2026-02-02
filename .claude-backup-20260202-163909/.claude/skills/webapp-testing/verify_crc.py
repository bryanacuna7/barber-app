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

    # Go to servicios
    page.goto('http://localhost:3000/servicios')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Click "Agregar Servicio" button to show the form
    add_button = page.locator('button:has-text("Agregar Servicio")')
    if add_button.is_visible():
        add_button.click()
        page.wait_for_timeout(500)

    # Take screenshot
    page.screenshot(path='/tmp/servicios_crc.png', full_page=True)
    print("Screenshot saved to /tmp/servicios_crc.png")
    print(f"Current URL: {page.url}")

    browser.close()
