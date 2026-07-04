#!/usr/bin/env node

import { chromium, firefox, webkit } from 'playwright'

const argUrl = process.argv.find((arg) => arg.startsWith('--url='))?.slice('--url='.length)
const url = argUrl ?? process.env.VERIFY_URL ?? 'http://localhost:3000/'
process.env.HEADLESS = process.env.HEADLESS ?? 'true'

const viewports = [
  { name: 'iphone12', width: 390, height: 844 },
  { name: 'iphoneX', width: 375, height: 812 }
]

function rectToJson(rect) {
  if (!rect) return null
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left
  }
}

function createLaunchOptions() {
  const isHeadless = process.env.HEADLESS !== 'false'

  return {
    headless: isHeadless,
    chromiumSandbox: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
}

function shouldFallbackFromChromium(error) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes('bootstrap_check_in') ||
    message.includes('MachPortRendezvous') ||
    message.includes('Permission denied (1100)')
  )
}

function resolveBrowserName() {
  const requested = (process.env.PLAYWRIGHT_VERIFY_BROWSER ?? 'chromium').trim().toLowerCase()

  if (requested === 'webkit' || requested === 'firefox' || requested === 'chromium') {
    return requested
  }

  return 'chromium'
}

async function launchBrowser() {
  const requestedBrowser = resolveBrowserName()

  if (requestedBrowser === 'webkit') {
    return {
      browserName: 'webkit',
      browser: await webkit.launch(createLaunchOptions())
    }
  }

  if (requestedBrowser === 'firefox') {
    return {
      browserName: 'firefox',
      browser: await firefox.launch(createLaunchOptions())
    }
  }

  try {
    return {
      browserName: 'chromium',
      browser: await chromium.launch(createLaunchOptions())
    }
  } catch (error) {
    if (!shouldFallbackFromChromium(error)) {
      throw error
    }

    console.warn('Chromium headless-shell blocked by host bootstrap restrictions; trying system Chrome channel.')

    try {
      return {
        browserName: 'chrome',
        browser: await chromium.launch({
          ...createLaunchOptions(),
          channel: 'chrome'
        })
      }
    } catch {
      console.warn(
        'System Chrome launch unavailable; falling back to WebKit. ' +
          'Set PLAYWRIGHT_VERIFY_BROWSER=chromium once host permissions are available.'
      )

      return {
        browserName: 'webkit',
        browser: await webkit.launch(createLaunchOptions())
      }
    }
  }
}

function extractH1(html) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (!match) {
    return null
  }

  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null
}

const results = []

try {
  const { browser, browserName } = await launchBrowser()

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    })
    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

    const data = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim() ?? null
    const rootClassList = document.body.firstElementChild?.className ?? null

    const isMarketing = !!document.querySelector('.marketing-header')
    const isEpic4 = !!document.querySelector('.e4s-nav')

    const login = document.querySelector('.marketing-header__login')
    const menu = document.querySelector('.marketing-nav__toggle')
    const wordmark = document.querySelector('.e4s-wordmark')
    const cta = document.querySelector('.e4s-nav-cta')

    const visible = (el) => {
      if (!el) return false
      const style = window.getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    }

    const overlap = (a, b) => {
      if (!a || !b) return false
      return !(
        a.right <= b.left ||
        b.right <= a.left ||
        a.bottom <= b.top ||
        b.bottom <= a.top
      )
    }

    const loginRect = login?.getBoundingClientRect() ?? null
    const menuRect = menu?.getBoundingClientRect() ?? null
    const wordmarkRect = wordmark?.getBoundingClientRect() ?? null
    const ctaRect = cta?.getBoundingClientRect() ?? null

    return {
      variant: isMarketing ? 'marketing' : isEpic4 ? 'epic4' : 'unknown',
      rootClassList,
      h1,
      viewportWidth: window.innerWidth,
      marketing: {
        loginVisible: visible(login),
        menuVisible: visible(menu),
        overlap: overlap(loginRect, menuRect),
        overflowRight:
          !!menuRect && menuRect.right > window.innerWidth ? Number((menuRect.right - window.innerWidth).toFixed(2)) : 0,
        loginRect: loginRect ? {
          x: loginRect.x,
          y: loginRect.y,
          width: loginRect.width,
          height: loginRect.height,
          top: loginRect.top,
          right: loginRect.right,
          bottom: loginRect.bottom,
          left: loginRect.left
        } : null,
        menuRect: menuRect ? {
          x: menuRect.x,
          y: menuRect.y,
          width: menuRect.width,
          height: menuRect.height,
          top: menuRect.top,
          right: menuRect.right,
          bottom: menuRect.bottom,
          left: menuRect.left
        } : null
      },
      epic4: {
        wordmarkVisible: visible(wordmark),
        ctaVisible: visible(cta),
        overlap: overlap(wordmarkRect, ctaRect),
        overflowRight:
          !!ctaRect && ctaRect.right > window.innerWidth ? Number((ctaRect.right - window.innerWidth).toFixed(2)) : 0,
        wordmarkRect: wordmarkRect ? {
          x: wordmarkRect.x,
          y: wordmarkRect.y,
          width: wordmarkRect.width,
          height: wordmarkRect.height,
          top: wordmarkRect.top,
          right: wordmarkRect.right,
          bottom: wordmarkRect.bottom,
          left: wordmarkRect.left
        } : null,
        ctaRect: ctaRect ? {
          x: ctaRect.x,
          y: ctaRect.y,
          width: ctaRect.width,
          height: ctaRect.height,
          top: ctaRect.top,
          right: ctaRect.right,
          bottom: ctaRect.bottom,
          left: ctaRect.left
        } : null
      }
    }
    })

    const screenshot = `/private/tmp/mobile-home-${viewport.name}.png`
    await page.screenshot({ path: screenshot, fullPage: false })

    results.push({
      mode: 'browser',
      url,
      viewport,
      screenshot,
      browserName,
      ...data
    })

    await context.close()
  }

  await browser.close()
} catch (error) {
  const response = await fetch(url)
  const html = await response.text()
  const h1 = extractH1(html)

  for (const viewport of viewports) {
    results.push({
      mode: 'http_fallback',
      url,
      viewport,
      screenshot: null,
      browserName: null,
      fallbackReason: error instanceof Error ? error.message : String(error),
      statusCode: response.status,
      h1,
      viewportWidth: viewport.width,
      marketing: null,
      epic4: null
    })
  }
}

const output = {
  cwd: process.cwd(),
  url,
  results
}

console.log(JSON.stringify(output, null, 2))
