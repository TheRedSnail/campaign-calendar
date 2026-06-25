import { chromium } from 'playwright'
const BASE = 'http://localhost:5173'
const OUT = (process.env.CLAUDE_JOB_DIR || '/tmp') + '/tmp'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'owner@demo.henkel')
await page.fill('input[type="password"]', 'Demo1234!')
await page.getByRole('button', { name: 'Sign in', exact: true }).click()
await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 8000 }).catch(() => {})
await sleep(1200)

await page.getByText('New campaign', { exact: true }).click()
await sleep(1200)
const sbuShown = (await page.locator('text=Industrial').count()) > 0
const countryShown = (await page.locator('text=Germany').count()) > 0
await page.locator('input[placeholder="Campaign name"]').fill('Owner Test Campaign')
await sleep(1600) // debounced persist (600ms) + margin
await page.screenshot({ path: OUT + '/owner-create.png' })

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await sleep(1200)
const persistedOccurrences = await page.getByText('Owner Test Campaign', { exact: false }).count()

await browser.close()
console.log(JSON.stringify({ sbuShown, countryShown, persistedOccurrences, errors: errors.slice(0, 5) }, null, 2))
