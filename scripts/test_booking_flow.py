#!/usr/bin/env python3
"""Test end-to-end booking flow"""

from playwright.sync_api import sync_playwright
import os
from datetime import datetime

os.makedirs('/tmp/ux_review', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})

    print("🧪 Testing Booking Flow")
    print("=" * 50)

    # Step 1: Navigate to booking page
    print("\n📍 Step 1: Navigate to booking page")
    page.goto('http://localhost:3000/reservar/barberia-test', timeout=15000)
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/ux_review/flow_1_service.png', full_page=True)
    print("✅ Booking page loaded")

    # Step 2: Select a service
    print("\n📍 Step 2: Select a service")
    service_cards = page.locator('button:has-text("Corte")')
    if service_cards.count() > 0:
        service_cards.first.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        page.screenshot(path='/tmp/ux_review/flow_2_after_service.png', full_page=True)
        print("✅ Service selected")
    else:
        print("❌ No services found")
        page.screenshot(path='/tmp/ux_review/flow_error_no_services.png', full_page=True)

    # Check current step
    current_url = page.url
    page_content = page.content()

    # Determine if we're on barber selection or datetime
    if 'Elige tu barbero' in page_content:
        print("\n📍 Step 3: Select a barber")
        barber_cards = page.locator('button:has-text("barbero")').or_(page.locator('div[class*="rounded-xl"]:has(h3)'))
        page.screenshot(path='/tmp/ux_review/flow_3_barber.png', full_page=True)

        # Try to click a barber
        clickable_barbers = page.locator('button').filter(has=page.locator('div.rounded-full'))
        if clickable_barbers.count() > 0:
            clickable_barbers.first.click()
            page.wait_for_timeout(500)
            print("✅ Barber selected")
        else:
            print("⚠️ No barbers to select, checking if auto-skipped")

    # Step: Select date and time
    print("\n📍 Step: Select date and time")
    page.wait_for_timeout(500)
    page.screenshot(path='/tmp/ux_review/flow_4_datetime.png', full_page=True)

    # Select today or first available date
    date_buttons = page.locator('button:has(.text-2xl.font-bold)')
    if date_buttons.count() > 0:
        date_buttons.first.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)
        print("✅ Date selected")
        page.screenshot(path='/tmp/ux_review/flow_5_timeslots.png', full_page=True)

        # Select first available time slot
        time_slots = page.locator('button:has-text(":"):not([disabled])')
        if time_slots.count() > 0:
            time_slots.first.click()
            page.wait_for_timeout(500)
            print("✅ Time selected")
            page.screenshot(path='/tmp/ux_review/flow_6_client_info.png', full_page=True)
        else:
            print("⚠️ No available time slots")
            page.screenshot(path='/tmp/ux_review/flow_no_slots.png', full_page=True)
    else:
        print("⚠️ Date selection not found - may be on different step")

    # Check if we're on client info form
    if page.locator('input[placeholder*="nombre"]').count() > 0:
        print("\n📍 Step: Fill client info")
        page.fill('input[placeholder*="nombre"]', 'Test Cliente')
        page.fill('input[placeholder*="8"]', '87175866')
        page.screenshot(path='/tmp/ux_review/flow_7_filled_form.png', full_page=True)
        print("✅ Client info filled")

        # Don't submit to avoid creating real appointment
        print("⚠️ Skipping actual submission to avoid creating test data")

    print("\n" + "=" * 50)
    print("🎉 Booking flow test completed!")
    print("📸 Screenshots saved to /tmp/ux_review/")

    browser.close()
