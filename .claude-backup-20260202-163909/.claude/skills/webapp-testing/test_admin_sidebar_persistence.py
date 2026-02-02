#!/usr/bin/env python3
"""
Test: Verificar que el sidebar de Super Admin se mantiene al navegar a Referencias
"""

from playwright.sync_api import sync_playwright
import sys

def test_admin_sidebar_persistence():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navegar a admin panel (simulado - normalmente requiere login)
            print("📱 Navegando a http://localhost:3000/admin/referencias...")
            page.goto('http://localhost:3000/admin/referencias', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)

            # 2. Tomar screenshot
            page.screenshot(path='/tmp/admin-referencias.png', full_page=True)
            print("📸 Screenshot guardado: /tmp/admin-referencias.png")

            # 3. Buscar elementos del Super Admin sidebar
            print("\n🔍 Verificando elementos del Super Admin sidebar...")

            # Buscar "Super Admin" text
            content = page.content()

            if 'Super Admin' in content:
                print("✅ Encontrado 'Super Admin' en la página")
            else:
                print("❌ No se encontró 'Super Admin' - puede estar usando sidebar de business")

            # Buscar el Shield icon (específico del admin sidebar)
            try:
                shield_icons = page.locator('svg.lucide-shield').count()
                print(f"✅ Shield icons encontrados: {shield_icons}")
                if shield_icons > 0:
                    print("✅ Sidebar de Super Admin presente")
            except:
                print("⚠️  No se encontró Shield icon")

            # Listar links de navegación visibles
            print("\n📋 Links de navegación encontrados:")
            try:
                nav_links = page.locator('nav a').all()
                for link in nav_links[:10]:  # Primeros 10
                    try:
                        text = link.inner_text(timeout=1000)
                        href = link.get_attribute('href')
                        if text and href:
                            print(f"   • {text} → {href}")
                    except:
                        pass
            except Exception as e:
                print(f"⚠️  Error listando links: {e}")

            # Verificar URL actual
            current_url = page.url
            print(f"\n📍 URL actual: {current_url}")

            if '/admin/referencias' in current_url:
                print("✅ URL correcta")
            else:
                print("❌ URL incorrecta")

            print("\n✅ Test completado")

        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            try:
                page.screenshot(path='/tmp/error-admin.png')
                print("📸 Screenshot de error: /tmp/error-admin.png")
            except:
                pass
            sys.exit(1)
        finally:
            browser.close()

if __name__ == '__main__':
    test_admin_sidebar_persistence()
