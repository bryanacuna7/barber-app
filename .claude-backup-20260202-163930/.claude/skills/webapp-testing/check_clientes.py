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

    # Go to clientes
    page.goto('http://localhost:3000/clientes')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path='/tmp/clientes_page.png', full_page=True)
    print("Screenshot saved to /tmp/clientes_page.png")
    print(f"Current URL: {page.url}")

    # Click "Agregar Cliente" button to show the form
    add_button = page.locator('button:has-text("Agregar Cliente")')
    if add_button.is_visible():
        add_button.click()
        page.wait_for_timeout(500)
        page.screenshot(path='/tmp/clientes_form.png', full_page=True)
        print("Form screenshot saved to /tmp/clientes_form.png")

    browser.close()
