// Records the Anna taste handoff on the #demo stage: patient app (left) -> clinician portal (right) -> back.
// Usage (dev server running): node scripts/record-anna.cjs [http://localhost:5180]
// Output: output/demo/anna-taste-handoff.webm (repo root). Demo data only, localhost only.
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')

const BASE = process.argv[2] || process.env.QA_BASE_URL || 'http://localhost:5180'
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE)) throw new Error('localhost only: ' + BASE)
const OUT = path.resolve(__dirname, '../../output/demo')
const SIZE = { width: 1600, height: 900 }

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: SIZE, recordVideo: { dir: OUT, size: SIZE } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/#demo')
  await page.evaluate(() => { Object.keys(localStorage).filter((k) => k.startsWith('tend')).forEach((k) => localStorage.removeItem(k)) })
  await page.reload()
  const [pf, cf] = [page.frameLocator('iframe').nth(0), page.frameLocator('iframe').nth(1)]

  // Caption bar + fake cursor live on the stage page, above both frames.
  await page.addStyleTag({ content: `
    #cap{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99;background:rgba(15,20,30,.88);color:#fff;
      font:600 22px/1.35 system-ui;padding:14px 26px;border-radius:14px;max-width:80%;text-align:center;transition:opacity .3s}
    #cur{position:fixed;z-index:100;width:22px;height:22px;border-radius:50%;background:rgba(255,90,90,.85);border:3px solid #fff;
      box-shadow:0 2px 8px #0006;transform:translate(-50%,-50%);transition:left .7s ease,top .7s ease;left:50%;top:50%;pointer-events:none}
    #cur.tap{animation:tap .35s}@keyframes tap{50%{transform:translate(-50%,-50%) scale(.6)}}` })
  await page.evaluate(() => { for (const id of ['cap', 'cur']) { const d = document.createElement('div'); d.id = id; document.body.append(d) } })
  const say = (t) => page.evaluate((t) => { document.getElementById('cap').textContent = t }, t)
  const pause = (ms) => page.waitForTimeout(ms)
  // Stage frames are CSS-scaled, so map the element's in-frame rect through the iframe's scale ourselves.
  const tap = async (loc, wait = 900) => {
    await loc.waitFor({ state: 'visible' })
    await loc.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'smooth' }))
    await pause(500)
    const r = await loc.evaluate((el) => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, src: location.href } })
    const xy = await page.evaluate((r) => {
      const f = [...document.querySelectorAll('iframe')].find((x) => x.contentWindow.location.href === r.src)
      const fb = f.getBoundingClientRect(), k = fb.width / f.offsetWidth
      return [fb.x + r.x * k, fb.y + r.y * k]
    }, r)
    {
      await page.evaluate(([x, y]) => { const c = document.getElementById('cur'); c.style.left = x + 'px'; c.style.top = y + 'px' }, xy)
      await pause(800)
      await page.evaluate(() => { const c = document.getElementById('cur'); c.classList.remove('tap'); void c.offsetWidth; c.classList.add('tap') })
    }
    await loc.evaluate((el) => el.click()) // frames are scaled and covered by the stage's pick overlays
    await pause(wait)
  }
  const btn = (f, name) => f.getByRole('button', { name }).first()

  // Setup off camera-ish: sign both sides in.
  await say('ReNu: Anna\'s app on the left, her care team\'s portal on the right.')
  await tap(btn(pf, /continue with patient portal/i), 1500)
  for (let i = 0; i < 3; i++) { const s = btn(pf, /^(skip for now|not now)$/i); if (await s.isVisible().catch(() => false)) await s.evaluate((el) => el.click()); await pause(500) }
  await tap(cf.getByText('Transplant coordinator').first(), 400)
  await tap(btn(cf, /continue with sso/i), 2000)

  await say('Anna checks in for her morning dose, but something has been getting in the way.')
  await tap(btn(pf, /^need help$/i), 1200)
  await say('She tells her team what\'s hard, in one tap.')
  await tap(btn(pf, /tell my team what's hard/i), 1000)
  await tap(btn(pf, /hate the taste/i), 1500)

  await say('Instantly, her transplant coordinator sees it, in Anna\'s own words.')
  const card = cf.locator('article, section, div').filter({ hasText: /^Anna K\./ }).filter({ has: cf.getByRole('button', { name: /make plan/i }) }).last()
  await card.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  await pause(3000)
  await say('The portal puts Anna on this week\'s list with a ready-made taste plan.')
  await pause(2000)
  await tap(card.getByRole('button', { name: /make plan/i }), 2500)

  await say('Conversation starters and options Anna already said she\'d try (green).')
  await pause(2500)
  await tap(btn(cf, /popsicle first/i), 600)
  await cf.locator('#pl-when').fill('Before the 8 pm dose')
  await pause(800)
  await say('The coordinator agrees on one plan and sends it back.')
  await tap(btn(cf, /^save plan$/i), 1500)

  await say('Anna gets the suggestion right in her app: heard, understood, supported.')
  await pause(4500)
  await say('')
  await pause(800)

  const video = page.video()
  await ctx.close()
  const dest = path.join(OUT, 'anna-taste-handoff.webm')
  fs.copyFileSync(await video.path(), dest)
  await browser.close()
  console.log('saved', dest)
})().catch((e) => { console.error(e); process.exit(1) })
