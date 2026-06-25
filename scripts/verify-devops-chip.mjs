import { chromium } from 'playwright'
const BASE = 'http://localhost:5173'
const OUT = (process.env.CLAUDE_JOB_DIR || '/tmp') + '/tmp'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'coordinator@demo.henkel')
await page.fill('input[type="password"]', 'Demo1234!')
await page.getByRole('button', { name: 'Sign in', exact: true }).click()
await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 8000 }).catch(() => {})
await sleep(800)
await page.goto(BASE + '/coordinator/tickets', { waitUntil: 'networkidle' })
await sleep(1200)
// Count DevOps chips (links to dev.azure.com)
const chips = await page.locator('a[href*="dev.azure.com"]').count()
await page.screenshot({ path: OUT + '/coord-tickets-devops.png', fullPage: true })
await browser.close()
console.log(JSON.stringify({ devopsChips: chips, errors: errors.slice(0, 5) }, null, 2))
