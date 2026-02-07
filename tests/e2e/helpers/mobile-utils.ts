import { Page, expect } from '@playwright/test'

// Tier 1 viewports - Must pass (blocks CI)
export const TIER_1_VIEWPORTS = [
  { width: 360, height: 800, name: 'samsung-galaxy' },
  { width: 375, height: 667, name: 'iphone-se' },
  { width: 390, height: 844, name: 'iphone-14' },
  { width: 412, height: 915, name: 'pixel-7' },
] as const

// Tier 2 viewports - Should pass (warning)
export const TIER_2_VIEWPORTS = [
  { width: 320, height: 568, name: 'iphone-se-1st' },
  { width: 375, height: 812, name: 'iphone-x' },
  { width: 393, height: 852, name: 'iphone-15-pro' },
  { width: 414, height: 896, name: 'iphone-xr' },
  { width: 428, height: 926, name: 'iphone-14-pro-max' },
  { width: 430, height: 932, name: 'iphone-15-pro-max' },
] as const

// Tier 3 viewports - Tablet boundary (informational)
export const TIER_3_VIEWPORTS = [
  { width: 768, height: 1024, name: 'ipad-mini' },
  { width: 810, height: 1080, name: 'ipad-10th' },
] as const

/**
 * Assert all matching interactive elements have minimum 44x44px tap targets.
 * Uses bounding boxes, not CSS values, for real rendered sizes.
 */
export async function assertMinTapTargets(page: Page, selector: string, minSize = 44) {
  const elements = page.locator(selector)
  const count = await elements.count()

  for (let i = 0; i < count; i++) {
    const el = elements.nth(i)
    if (!(await el.isVisible())) continue

    const box = await el.boundingBox()
    if (!box) continue

    // At least one dimension must meet minimum (width OR height)
    const meetsTarget = box.width >= minSize || box.height >= minSize
    if (!meetsTarget) {
      const testInfo = await el.evaluate((node) => ({
        tag: node.tagName,
        text: node.textContent?.slice(0, 30),
        classes: node.className?.toString().slice(0, 60),
      }))
      expect
        .soft(
          meetsTarget,
          `Tap target too small: ${testInfo.tag} "${testInfo.text}" (${Math.round(box.width)}x${Math.round(box.height)}px < ${minSize}px) classes="${testInfo.classes}"`
        )
        .toBe(true)
    }
  }
}

/**
 * Assert page has no horizontal overflow (no unintended horizontal scroll).
 */
export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })
  expect(overflow, 'Page has horizontal overflow - content wider than viewport').toBe(false)
}

/**
 * Assert all matching elements are fully within the viewport bounds.
 */
export async function assertWithinViewport(page: Page, selector: string) {
  const viewport = page.viewportSize()
  if (!viewport) return

  const elements = page.locator(selector)
  const count = await elements.count()

  for (let i = 0; i < count; i++) {
    const el = elements.nth(i)
    if (!(await el.isVisible())) continue

    const box = await el.boundingBox()
    if (!box) continue

    const withinBounds =
      box.x >= -1 && // small tolerance for subpixel
      box.x + box.width <= viewport.width + 1 &&
      box.y >= -1

    if (!withinBounds) {
      const text = await el.evaluate((node) => node.textContent?.slice(0, 30) || '')
      expect
        .soft(
          withinBounds,
          `Element outside viewport: "${text}" at x=${Math.round(box.x)}, right=${Math.round(box.x + box.width)}, viewport=${viewport.width}`
        )
        .toBe(true)
    }
  }
}

/**
 * Assert an element is clickable (not obscured by overlays).
 * Clicks the element and verifies no error. Optionally checks that
 * a result selector becomes visible after click.
 */
export async function assertElementClickable(
  page: Page,
  clickSelector: string,
  resultSelector?: string
) {
  const el = page.locator(clickSelector).first()
  await expect(el).toBeVisible({ timeout: 5000 })
  await el.tap()

  if (resultSelector) {
    await expect(page.locator(resultSelector).first()).toBeVisible({ timeout: 3000 })
  }
}

/**
 * Take screenshots at all Tier 1 viewports for a given page.
 */
export async function screenshotAllTier1(page: Page, pageName: string) {
  for (const vp of TIER_1_VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.waitForTimeout(300) // let layout settle
    await page.screenshot({
      path: `tests/screenshots/${pageName}-${vp.name}-${vp.width}x${vp.height}.png`,
      fullPage: true,
    })
  }
}

/**
 * Count fixed bottom elements to detect double bottom nav conflicts.
 */
export async function countFixedBottomElements(page: Page): Promise<number> {
  return page.evaluate(() => {
    const all = document.querySelectorAll('*')
    let count = 0
    for (const el of all) {
      const style = window.getComputedStyle(el)
      if (style.position === 'fixed' && parseInt(style.bottom) <= 10) {
        const rect = el.getBoundingClientRect()
        if (rect.height > 30 && rect.width > 200) {
          count++
        }
      }
    }
    return count
  })
}
