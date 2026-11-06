const { chromium } = require('playwright')
const fs = require('node:fs/promises')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:5186'
if (!['localhost','127.0.0.1','[::1]'].includes(new URL(BASE).hostname)) throw Error('Local story only.')
const OUT = path.resolve(__dirname,'../../output/maya-story')
const record = process.argv.includes('--record')
const inspect = process.argv.includes('--inspect')
const discover = process.argv.includes('--discover')
const headings=['A routine starts with understanding.','First, let her tell us why.','A small message. A real connection.','The right person hears it.','Turn “that’s hard” into “let’s help.”','Heard. Understood. Supported.']

async function play(browser, recording) {
  const context=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1,reducedMotion:'no-preference',...(recording?{recordVideo:{dir:path.join(OUT,'raw'),size:{width:1280,height:720}}}:{})})
  const page=await context.newPage()
  let passed=false
  try {
    await page.goto(`${BASE}/#story`,{waitUntil:'domcontentloaded'})
    if(discover){console.log(await page.locator('main').innerText());passed=true;return}
    for(let i=0;i<6;i++){
      await page.locator(`main[data-scene="${i}"]`).waitFor({state:'visible',timeout:10000})
      if(await page.locator('h1').innerText()!==headings[i])throw Error(`Wrong scene ${i}`)
      if(i===1){await page.getByText('Sent to my care team ✓',{exact:true}).waitFor({state:'visible',timeout:6500});if(!recording)await page.screenshot({path:path.join(OUT,'patient-frame.png')})}
      if(i===3){await page.getByText('“My medicine tastes bad.”',{exact:true}).waitFor({state:'visible',timeout:4000});if(!recording)await page.screenshot({path:path.join(OUT,'clinician-frame.png')})}
      if(i===4){await page.getByText('Follow-up task created ✓',{exact:true}).waitFor({state:'visible',timeout:5000})}
      console.log(`Scene ${i+1} passed`)
    }
    await page.locator('main[data-finished="true"]').waitFor({state:'visible',timeout:10000})
    if(recording)await page.waitForTimeout(900)
    else {await page.getByRole('button',{name:'Replay story ↻',exact:true}).click();await page.locator('main[data-scene="0"]').waitFor({timeout:1500})}
    await fs.writeFile(path.join(OUT,recording?'recording-check.json':'rehearsal.json'),JSON.stringify({passed:true,scenes:6,replay:!recording,fictionalStory:true,date:new Date().toISOString()},null,2))
    passed=true
  } finally {
    const video=page.video();await context.close()
    if(video)await video.saveAs(path.join(OUT,passed?'tend-maya-story.webm':'failed-take.webm'))
  }
}

;(async()=>{
  await fs.mkdir(OUT,{recursive:true})
  const browser=await chromium.launch({headless:true})
  try {
    if(inspect){
      const page=await browser.newPage()
      await page.goto(pathToFileURL(path.join(OUT,'tend-maya-story.webm')).href)
      const video=page.locator('video')
      await video.evaluate(async v=>{if(v.readyState<1)await new Promise(r=>v.addEventListener('loadedmetadata',r,{once:true}));v.pause()})
      await video.evaluate(v=>{v.removeAttribute('controls');v.style.cssText='width:1280px;height:720px;display:block'})
      await page.addStyleTag({content:'body{margin:0;background:#f3eee5}video{max-width:none!important;max-height:none!important}'})
      for(const t of [9,21,29,35]){
        const result=await video.evaluate(async(v,time)=>{
          v.currentTime=time;await new Promise(r=>v.addEventListener('seeked',r,{once:true}))
          return {width:v.videoWidth,height:v.videoHeight,duration:v.duration}
        },t)
        await video.screenshot({path:path.join(OUT,`video-${t}s.png`)})
        console.log({time:t,width:result.width,height:result.height,duration:result.duration})
      }
    }else {await play(browser,false);if(record&&!discover)await play(browser,true)}
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
