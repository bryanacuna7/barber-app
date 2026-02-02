from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})

    # Server is already running on port 3000
    page.goto('http://localhost:3000/citas')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)  # Extra time for animations

    # Take screenshot
    page.screenshot(path='/tmp/citas_page.png', full_page=True)
    print("Screenshot saved to /tmp/citas_page.png")

    # Get any console errors
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

    # Check if there are visible error messages on the page
    content = page.content()
    if "error" in content.lower():
        print("Page may contain error messages")

    browser.close()
