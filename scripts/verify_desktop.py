#!/usr/bin/env python3
"""Take desktop screenshot of reservation calendar."""

from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = "/tmp/mobile_verify"

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            device_scale_factor=2,
            color_scheme="dark"
        )
        page = context.new_page()

        print("Capturing desktop reservation calendar...")
        page.goto("http://localhost:3000/reservar/barberia-test", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)

        # Click on service to see calendar
        service_btn = page.locator('button:has-text("Corte")')
        if service_btn.count() > 0:
            service_btn.first.click()
            page.wait_for_timeout(1000)
            page.screenshot(path=f"{OUTPUT_DIR}/reservar_desktop.png", full_page=True)
            print(f"  Saved: {OUTPUT_DIR}/reservar_desktop.png")

        browser.close()

if __name__ == "__main__":
    main()
