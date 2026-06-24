import { chromium } from 'playwright'

const OUT = '/tmp/shots'
const BASE = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

const shot = async (name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('shot', name)
}

// 1. Month view
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await sleep(600)
await shot('01-month')

// 2. Timeline
await page.getByRole('button', { name: 'Timeline', exact: true }).click()
await sleep(500)
await shot('02-timeline')

// 3. Locked drawer (Loctite 243 Relaunch — 8/20)
await page.getByRole('button', { name: 'Month', exact: true }).click()
await sleep(300)
await page.getByRole('button', { name: /Loctite 243 Relaunch/ }).first().click()
await sleep(600)
await shot('03-drawer-locked')
await page.keyboard.press('Escape')
await sleep(400)

// 4. Unlocked drawer (Loctite Threadlocker Webinar — already 20/20)
await page.getByRole('button', { name: /Loctite Threadlocker Webinar/ }).first().click()
await sleep(600)
await shot('04-drawer-unlocked')

// 5. Brief modal — review step
await page.getByRole('button', { name: 'Brief campaign', exact: true }).click()
await sleep(600)
await shot('05-brief-review')

// 6. Brief modal — confirmation step
await page.getByRole('button', { name: /Send brief/ }).click()
await sleep(600)
await shot('06-brief-confirm')
await page.getByRole('button', { name: 'Done', exact: true }).click()
await sleep(400)

// 7. Production view
await page.goto(BASE + '/campaign/loctite-243-relaunch/production', { waitUntil: 'networkidle' })
await sleep(600)
await shot('07-production')

// 8. Filter interaction (Brand = Loctite) on month view
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await sleep(400)
await page.getByRole('button', { name: /^Brand/ }).click()
await sleep(300)
await page.getByText('Loctite', { exact: true }).first().click()
await page.keyboard.press('Escape')
await sleep(400)
await shot('08-filter-brand')

await browser.close()
console.log('ERRORS:', errors.length ? JSON.stringify(errors, null, 2) : 'none')
