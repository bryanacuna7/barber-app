#!/usr/bin/env python3
"""
Test: Verificar que el link "Referencias" aparece en la navegación
"""

from playwright.sync_api import sync_playwright
import sys

def test_referencias_navigation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navegar a la página principal
            print("📱 Navegando a http://localhost:3000...")
            page.goto('http://localhost:3000')
            page.wait_for_load_state('networkidle')

            # Tomar screenshot del home
            page.screenshot(path='/tmp/homepage.png', full_page=True)
            print("📸 Screenshot guardado: /tmp/homepage.png")

            # Buscar elementos con "Referencias" o "referencias" en el texto
            print("\n🔍 Buscando links con 'Referencias'...")

            # Obtener el HTML completo para búsqueda
            content = page.content()

            # Verificar si existe el texto "Referencias" en algún link o nav
            if 'Referencias' in content or 'referencias' in content:
                print("✅ Encontrado 'Referencias' en la página")

                # Intentar encontrar el link específico
                try:
                    referencias_link = page.get_by_text('Referencias', exact=False).first
                    if referencias_link.is_visible():
                        print("✅ Link 'Referencias' es visible")
                        href = referencias_link.get_attribute('href')
                        print(f"   URL: {href}")
                    else:
                        print("⚠️  Link existe pero no es visible (puede ser mobile)")
                except Exception as e:
                    print(f"⚠️  No se pudo localizar el link específico: {e}")
            else:
                print("❌ No se encontró 'Referencias' en la página")

            # Listar todos los links de navegación
            print("\n📋 Links de navegación encontrados:")
            nav_links = page.locator('nav a').all()
            for i, link in enumerate(nav_links):
                try:
                    text = link.inner_text()
                    href = link.get_attribute('href')
                    print(f"   {i+1}. {text} → {href}")
                except:
                    pass

            print("\n✅ Test completado")

        except Exception as e:
            print(f"❌ Error: {e}")
            page.screenshot(path='/tmp/error.png')
            print("📸 Screenshot de error: /tmp/error.png")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == '__main__':
    test_referencias_navigation()
