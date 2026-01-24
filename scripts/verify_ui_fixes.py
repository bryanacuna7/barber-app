#!/usr/bin/env python3
"""Verify UI fixes for barber-app with authentication"""

from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = "/tmp/barber-ui-verify"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Login first
        print("\n🔐 Logging in...")
        page = context.new_page()
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')

        page.fill('input[type="email"]', 'bryn.acuna7@gmail.com')
        page.fill('input[type="password"]', 'abcd1234')
        page.click('button[type="submit"]')
        page.wait_for_url('**/dashboard**', timeout=10000)
        print("  ✅ Logged in successfully")

        # Test 1: Configuración page - mobile viewport for horario layout
        print("\n📱 Testing /configuracion on mobile (390px)...")
        page.set_viewport_size({"width": 390, "height": 844})
        page.goto('http://localhost:3000/configuracion')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        # Scroll to horario section
        page.evaluate("window.scrollTo(0, 600)")
        page.wait_for_timeout(500)

        page.screenshot(path=f"{OUTPUT_DIR}/01_config_mobile_horario.png", full_page=True)
        print(f"  ✅ Screenshot saved: {OUTPUT_DIR}/01_config_mobile_horario.png")

        # Test 2: Servicios page - stats cards
        print("\n📊 Testing /servicios stats cards...")
        page.goto('http://localhost:3000/servicios')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        page.screenshot(path=f"{OUTPUT_DIR}/02_servicios_mobile.png", full_page=True)
        print(f"  ✅ Screenshot saved: {OUTPUT_DIR}/02_servicios_mobile.png")

        # Test 3: Citas page - resumen del día (desktop)
        print("\n📅 Testing /citas resumen del día...")
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto('http://localhost:3000/citas')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)

        page.screenshot(path=f"{OUTPUT_DIR}/03_citas_desktop.png", full_page=True)
        print(f"  ✅ Screenshot saved: {OUTPUT_DIR}/03_citas_desktop.png")

        # Test 4: Public booking page - calendar
        print("\n📆 Testing /reservar/barberia-test calendar...")
        public_page = context.new_page()
        public_page.set_viewport_size({"width": 1280, "height": 800})
        public_page.goto('http://localhost:3000/reservar/barberia-test')
        public_page.wait_for_load_state('networkidle')
        public_page.wait_for_timeout(1500)

        # Click on a service to see the calendar
        service_btn = public_page.locator('button:has-text("min")').first
        if service_btn.is_visible():
            service_btn.click()
            public_page.wait_for_timeout(1000)

        public_page.screenshot(path=f"{OUTPUT_DIR}/04_reservar_calendar.png", full_page=True)
        print(f"  ✅ Screenshot saved: {OUTPUT_DIR}/04_reservar_calendar.png")

        public_page.close()
        page.close()
        browser.close()

        print(f"\n✅ All screenshots saved to {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
