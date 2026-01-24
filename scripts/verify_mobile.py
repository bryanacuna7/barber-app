#!/usr/bin/env python3
"""Take mobile screenshots to verify UI changes."""

from playwright.sync_api import sync_playwright
import os

MOBILE_VIEWPORT = {"width": 393, "height": 852}
OUTPUT_DIR = "/tmp/mobile_verify"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=MOBILE_VIEWPORT,
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            color_scheme="dark"
        )
        page = context.new_page()

        # Login
        print("Logging in...")
        page.goto("http://localhost:3000/login", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(500)
        page.fill('input[type="email"]', 'bryn.acuna7@gmail.com')
        page.fill('input[type="password"]', 'abcd1234')
        page.click('button[type="submit"]')
        page.wait_for_url("**/dashboard", timeout=15000)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)

        # Dashboard
        print("Capturing dashboard...")
        page.screenshot(path=f"{OUTPUT_DIR}/dashboard.png", full_page=True)

        # Servicios
        print("Capturing servicios...")
        page.goto("http://localhost:3000/servicios", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/servicios.png", full_page=True)

        # Citas
        print("Capturing citas...")
        page.goto("http://localhost:3000/citas", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/citas.png", full_page=True)

        # Configuración
        print("Capturing configuracion...")
        page.goto("http://localhost:3000/configuracion", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)
        page.screenshot(path=f"{OUTPUT_DIR}/configuracion.png", full_page=True)

        browser.close()

        # Now capture reservation page with calendar
        browser2 = p.chromium.launch(headless=True)
        context2 = browser2.new_context(
            viewport=MOBILE_VIEWPORT,
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True,
            color_scheme="dark"
        )
        page2 = context2.new_page()

        print("Capturing reservation calendar...")
        page2.goto("http://localhost:3000/reservar/barberia-test", wait_until="networkidle", timeout=30000)
        page2.wait_for_timeout(1000)

        # Click on service to see calendar
        service_btn = page2.locator('button:has-text("Corte")')
        if service_btn.count() > 0:
            service_btn.first.click()
            page2.wait_for_timeout(1000)
            page2.screenshot(path=f"{OUTPUT_DIR}/reservar_calendar.png", full_page=True)

        browser2.close()

    print(f"\nAll screenshots saved to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
