#!/usr/bin/env python3
"""UX Review - Capture screenshots of all app pages"""

from playwright.sync_api import sync_playwright
import os

os.makedirs('/tmp/ux_review', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})

    # Auth pages (public)
    auth_pages = [
        ('http://localhost:3000/login', 'login'),
        ('http://localhost:3000/register', 'register'),
    ]

    for url, name in auth_pages:
        print(f"📸 Capturing {name}...")
        try:
            page.goto(url, timeout=15000)
            page.wait_for_load_state('networkidle', timeout=10000)
            page.screenshot(path=f'/tmp/ux_review/{name}.png', full_page=True)
            print(f"✅ Saved {name}.png")
        except Exception as e:
            print(f"❌ Failed {name}: {e}")

    # Public booking page
    print("📸 Capturing public booking...")
    try:
        page.goto('http://localhost:3000/reservar/barberia-test', timeout=15000)
        page.wait_for_load_state('networkidle', timeout=10000)
        page.screenshot(path='/tmp/ux_review/booking_public.png', full_page=True)
        print("✅ Saved booking_public.png")
    except Exception as e:
        print(f"❌ Failed booking: {e}")

    browser.close()
    print("\n🎉 Auth & public pages captured!")
