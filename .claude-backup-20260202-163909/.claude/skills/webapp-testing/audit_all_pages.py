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
    page.wait_for_timeout(3000)

    # 1. Dashboard
    page.goto('http://localhost:3000/dashboard')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)
    page.screenshot(path='/tmp/audit_dashboard.png', full_page=True)
    print("1. Dashboard captured")

    # 2. Citas
    page.goto('http://localhost:3000/citas')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)
    page.screenshot(path='/tmp/audit_citas.png', full_page=True)
    print("2. Citas captured")

    # 3. Servicios
    page.goto('http://localhost:3000/servicios')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)
    page.screenshot(path='/tmp/audit_servicios.png', full_page=True)
    print("3. Servicios captured")

    # 4. Clientes
    page.goto('http://localhost:3000/clientes')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)
    page.screenshot(path='/tmp/audit_clientes.png', full_page=True)
    print("4. Clientes captured")

    # 5. Public booking page (no auth needed)
    page2 = browser.new_page(viewport={'width': 1440, 'height': 900})
    page2.goto('http://localhost:3000/reservar/barberia-test')
    page2.wait_for_load_state('networkidle')
    page2.wait_for_timeout(2000)
    page2.screenshot(path='/tmp/audit_public.png', full_page=True)
    print("5. Public booking page captured")

    # 6. Mobile view of public page
    page3 = browser.new_page(viewport={'width': 390, 'height': 844})
    page3.goto('http://localhost:3000/reservar/barberia-test')
    page3.wait_for_load_state('networkidle')
    page3.wait_for_timeout(2000)
    page3.screenshot(path='/tmp/audit_public_mobile.png', full_page=True)
    print("6. Public mobile captured")

    browser.close()
    print("\nAll pages captured!")
