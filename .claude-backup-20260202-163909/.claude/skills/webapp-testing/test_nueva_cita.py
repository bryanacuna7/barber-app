from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})

    # Login
    page.goto('http://localhost:3000/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"]', 'bryn.acuna7@gmail.com')
    page.fill('input[type="password"]', 'abcd1234')
    page.click('button[type="submit"]')
    page.wait_for_timeout(3000)

    # Go to citas
    page.goto('http://localhost:3000/citas')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)

    # Click "Nueva cita" button
    page.click('text=Nueva cita')
    page.wait_for_timeout(1000)

    # Screenshot the modal
    page.screenshot(path='/tmp/nueva_cita_modal.png', full_page=True)
    print("Modal screenshot saved to /tmp/nueva_cita_modal.png")

    # Now test the other views - Horario
    page.keyboard.press('Escape')
    page.wait_for_timeout(500)

    page.click('text=Horario')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/vista_horario.png', full_page=True)
    print("Horario view saved to /tmp/vista_horario.png")

    # Linea view
    page.click('text=Línea')
    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/vista_linea.png', full_page=True)
    print("Linea view saved to /tmp/vista_linea.png")

    browser.close()
