import { chromium } from 'playwright'

const OUT = process.env.CLAUDE_JOB_DIR ? `${process.env.CLAUDE_JOB_DIR}/tmp` : '/tmp'
const BASE = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const roles = [
  { key: 'owner', email: 'owner@demo.henkel' },
  { key: 'coordinator', email: 'coordinator@demo.henkel' },
  { key: 'run', email: 'run@demo.henkel' },
  { key: 'admin', email: 'admin@demo.henkel' },
]

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' })
const results = []

for (const r of roles) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await sleep(300)
  const redirectedToLogin = page.url().includes('/login')

  await page.fill('input[type="email"]', r.email)
  await page.fill('input[type="password"]', 'Demo1234!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL((u) => !u.toString().includes('/login'), { timeout: 8000 }).catch(() => {})
  await sleep(1500)

  const loggedIn = !page.url().includes('/login')

  // Header nav gating (scope to the <header>). Coordinator/Settings/Users render as links.
  const header = page.locator('header').first()
  const coordinatorVisible = (await header.getByText('Coordinator', { exact: true }).count()) > 0
  const usersVisible = (await header.getByText('Users', { exact: true }).count()) > 0
  const newCampaignVisible = (await header.getByText('New campaign', { exact: true }).count()) > 0

  await page.screenshot({ path: `${OUT}/role-${r.key}.png` })

  // Route guard: owner hitting /coordinator should bounce back to '/'.
  await page.goto(BASE + '/coordinator', { waitUntil: 'networkidle' })
  await sleep(800)
  const coordinatorUrl = page.url().replace(BASE, '')

  // Admin screen check.
  let adminUsersRows = null
  if (r.key === 'admin') {
    await page.goto(BASE + '/admin', { waitUntil: 'networkidle' })
    await sleep(1000)
    adminUsersRows = await page.locator('tbody tr').count()
    await page.screenshot({ path: `${OUT}/role-admin-users.png` })
  }

  results.push({
    role: r.key,
    redirectedToLogin,
    loggedIn,
    coordinatorVisible,
    usersVisible,
    newCampaignVisible,
    coordinatorUrl,
    adminUsersRows,
    errors: errors.filter((e) => !e.includes('favicon')).slice(0, 4),
  })
  await ctx.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))
