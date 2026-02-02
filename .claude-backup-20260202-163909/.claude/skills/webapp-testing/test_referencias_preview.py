from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 1024})

    # Navigate to referencias preview page
    page.goto('http://localhost:3000/referencias-preview')

    # Wait for page to load completely
    page.wait_for_load_state('networkidle')

    # Wait for animations to complete
    page.wait_for_timeout(2000)

    # Take full page screenshot
    page.screenshot(path='/tmp/referencias-preview.png', full_page=True)

    print("✅ Screenshot saved to /tmp/referencias-preview.png")

    browser.close()
