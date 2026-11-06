// Isolated local demo: no real patients, messages, pharmacy orders or clinical chart writes.
const { chromium } = require('playwright')
const fs = require('node:fs/promises')
const path = require('node:path')
const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:5186'
if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(BASE).hostname)) throw Error('This demo recorder only targets a local server.')
const OUT = path.resolve(__dirname, '../../output/demo')
const record = process.argv.includes('--record')
const discover = process.argv.includes('--discover')
const inspect = process.argv.includes('--inspect')

async function overlays(page) {
  await page.evaluate(() => {
    const cursor = document.createElement('div')
    cursor.id = 'demo-cursor'
    cursor.innerHTML = '<svg width="25" height="28" viewBox="0 0 25 28"><path d="M3 2L21 15L12 16L9 25Z" fill="white" stroke="#20372d" stroke-width="2" stroke-linejoin="round"/></svg>'
    cursor.style.cssText = 'position:fixed;left:20px;top:20px;z-index:999999;pointer-events:none'
    document.body.append(cursor)
    document.addEventListener('mousemove', e => { cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px' })
    const bar=document.createElement('div')
    bar.id='demo-subtitle'
    bar.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:999998;background:#20372df5;color:#fff;padding:16px 24px;text-align:center;font:500 19px/1.4 system-ui;pointer-events:none'
    document.body.append(bar)
    document.body.style.paddingBottom='85px'
  })
}

async function run(browser, recording) {
  const context = await browser.newContext({ viewport:{width:1280,height:720}, ...(recording ? {recordVideo:{dir:path.join(OUT,'raw'),size:{width:1280,height:720}}} : {}) })
  const page=await context.newPage()
  const pause=ms=>page.waitForTimeout(recording?ms:120)
  const caption=async text=>{await page.locator('#demo-subtitle').evaluate((el,t)=>{el.textContent=t},text);await pause(900)}
  const click=async(locator,label)=>{
    await locator.waitFor({state:'visible',timeout:10000})
    if(!await locator.isEnabled())throw Error(`Disabled: ${label}`)
    await locator.scrollIntoViewIfNeeded()
    await pause(500)
    const box=await locator.boundingBox()
    if(!box)throw Error(`No bounds: ${label}`)
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:18})
    await pause(450);await locator.click();await pause(1600)
    console.log(`OK: ${label}`)
  }
  const requireText=async(locator)=>{await locator.waitFor({state:'visible',timeout:10000})}
  let completed=false
  try {
    await page.goto(`${BASE}/#patients`,{waitUntil:'networkidle'})
    await overlays(page)
    if(discover){
      const fields=await page.evaluate(()=>[...document.querySelectorAll('button,input,select,textarea,[role="region"],section[aria-label]')].filter(el=>el.getBoundingClientRect().width>0).map(el=>({tag:el.tagName,role:el.getAttribute('role'),label:el.getAttribute('aria-label'),text:el.textContent.trim().slice(0,100)})))
      await fs.writeFile(path.join(OUT,'field-map.json'),JSON.stringify(fields,null,2))
      console.log('Discovery saved.');completed=true;return
    }
    await caption('Step 1 — Two patients. Support for different days.')
    await pause(2500)
    const jordan=page.getByRole('region',{name:"Jordan's day",exact:true})
    const teamJordan=page.getByRole('region',{name:'Care team view for Jordan',exact:true})
    const shipping=jordan.locator('.dp-card').filter({hasText:'Refill due, and your day is packed'})
    const approve=teamJordan.getByRole('button',{name:'Approve request',exact:true})
    if(await approve.isEnabled())throw Error('Team action enabled before patient request')
    await caption('Step 2 — Jordan cannot fit pharmacy pickup into his day.')
    await click(shipping.locator('summary'),'Explain calendar and supply context')
    await pause(2500)
    await caption('Step 3 — Jordan asks for help with his refill.')
    await click(shipping.getByRole('button',{name:'Request shipping',exact:true}),'Patient requests shipping')
    await requireText(teamJordan.getByText('New patient request · Jordan · Refill · context attached',{exact:true}))
    await caption('Step 4 — The care team receives Jordan’s request and context.')
    await approve.scrollIntoViewIfNeeded();await pause(3000)
    if(await page.getByRole('region',{name:'Care team view for Maya',exact:true}).getByRole('button',{name:'Looks good',exact:true}).first().isEnabled())throw Error('Patient state leaked to Maya')
    await click(approve,'Care team reviews the request')
    await requireText(teamJordan.getByText('✓ Reviewed · patient view updated (simulated)',{exact:true}))
    await caption('Step 5 — Jordan can see that his team reviewed it.')
    await shipping.scrollIntoViewIfNeeded();await pause(2800)
    await requireText(shipping.getByText('✓ Your care team reviewed this request (demo). No real booking, order or call was made.',{exact:true}))
    const maya=page.getByRole('region',{name:"Maya's day",exact:true})
    const teamMaya=page.getByRole('region',{name:'Care team view for Maya',exact:true})
    await caption('Step 6 — Maya needs privacy during dinner with friends.')
    await click(maya.getByRole('button',{name:'Set mock call',exact:true}),'Maya chooses discreet-call support')
    await requireText(teamMaya.getByText('New patient request · Maya · Evening dose · context attached',{exact:true}))
    await caption('Step 7 — Her coordinator sees the chosen support strategy.')
    const privacy=teamMaya.locator('.cv-card').filter({hasText:'privacy barrier'})
    await click(privacy.getByRole('button',{name:'Looks good',exact:true}),'Coordinator acknowledges Maya’s plan')
    await caption('Step 8 — One connected loop. All records and actions simulated.')
    await pause(3500)
    await fs.writeFile(path.join(OUT,recording?'recording-check.json':'rehearsal.json'),JSON.stringify({passed:true,date:new Date().toISOString(),scenarios:['Jordan request → team review → patient status','Maya request → coordinator acknowledgement'],simulated:true},null,2))
    completed=true
  } finally {
    const video=page.video()
    if(!completed)await page.screenshot({path:path.join(OUT,'failure.png'),fullPage:true})
    await context.close()
    if(recording&&video){await video.saveAs(path.join(OUT,completed?'tend-patient-to-team.webm':'failed-take.webm'));console.log(completed?'Saved tend-patient-to-team.webm':'Saved failed take for diagnosis')}
  }
}

;(async()=>{
  await fs.mkdir(OUT,{recursive:true})
  const browser=await chromium.launch({headless:true})
  try {
    if(inspect){
      const {pathToFileURL}=require('node:url')
      const page=await browser.newPage({viewport:{width:1280,height:720}})
      await page.goto(pathToFileURL(path.join(OUT,'tend-patient-to-team.webm')).href)
      const metadata=await page.locator('video').evaluate(async video=>{
        if(video.readyState<1)await new Promise((resolve,reject)=>{video.addEventListener('loadedmetadata',resolve,{once:true});video.addEventListener('error',reject,{once:true})})
        video.pause();video.currentTime=16
        await new Promise(resolve=>video.addEventListener('seeked',resolve,{once:true}))
        return {width:video.videoWidth,height:video.videoHeight,duration:video.duration}
      })
      await page.screenshot({path:path.join(OUT,'video-review.png')})
      await fs.writeFile(path.join(OUT,'video-metadata.json'),JSON.stringify(metadata,null,2));console.log(metadata)
    }else{await run(browser,false);if(record&&!discover)await run(browser,true)}
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})
