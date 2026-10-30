import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {scenePins} from '../home3d/build.mjs';
export async function checkHome3D({browser,base,out,report,check,fullScreenshot,sharp}){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 const capture=async(name,full=false)=>{const file=path.join(out,name+'.png');if(full)await fullScreenshot(page,file);else{await page.evaluate(async()=>{window.scrollTo({top:0,behavior:'instant'});await Promise.all([...document.images].filter(i=>i.complete).map(i=>i.decode().catch(()=>{})));});await page.screenshot({path:file,animations:'disabled'});}report.screenshots.push({file:name,width:page.viewportSize().width,path:file});};
 const loaded=async()=>{await page.waitForFunction(()=>document.querySelector('.home3d')?.dataset.state==='ready');await page.evaluate(()=>document.fonts.ready);};
 await page.goto(base);await loaded();check('First visit tutorial visible',await page.locator('.scene-coach').isVisible());await page.locator('[data-next]').click();await page.locator('[data-next]').click();await page.locator('[data-next]').click();await page.reload();await loaded();check('Tutorial remembered',await page.locator('.scene-coach').isHidden());
 report.homepageTransfer=await page.evaluate(()=>performance.getEntriesByType('resource').map(e=>({url:e.name,type:e.initiatorType,transfer:e.transferSize,encoded:e.encodedBodySize,decoded:e.decodedBodySize})));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(base);await loaded();await page.waitForTimeout(350);
  const pixels=await page.locator('.scene-canvas canvas').screenshot();const stats=await sharp(pixels).stats();check('Canvas renders nonempty scene '+width,stats.channels.some(c=>c.stdev>20)&&await page.locator('.home3d').evaluate(el=>Number(el.dataset.drawCalls)>100),stats.channels.map(c=>c.stdev));
  check('All located hotspots '+width,await page.locator('[data-hotspot]').count()===scenePins.length&&await page.locator('[data-place]').count()===scenePins.length);
  check('Crane stays nonpoint '+width,await page.locator('#scene-list a[href="/troupes/group-xianlong-cranes.html"]').count()===1&&await page.locator('[data-hotspot*="xianlong"]').count()===0);
  const overlaps=await page.locator('.scene-label:visible').evaluateAll(els=>{const r=els.map(el=>({text:el.textContent,r:el.getBoundingClientRect()}));return r.flatMap((a,i)=>r.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.text,b.text]));});check('Labels do not overlap '+width,overlaps.length===0,overlaps);
  await capture('home-'+width);
  if(width===390){await page.locator('[data-interact]').click();check('Mobile interaction enabled',await page.locator('[data-interact]').getAttribute('aria-pressed')==='true');}
  const before=createHash('sha256').update(await page.locator('.scene-canvas canvas').screenshot()).digest('hex');
  await page.mouse.move(width*.16,300);await page.mouse.down();await page.mouse.move(width*.16+65,325,{steps:12});await page.mouse.up();await page.waitForTimeout(400);
  const after=createHash('sha256').update(await page.locator('.scene-canvas canvas').screenshot()).digest('hex');check('Dragging rotates scene '+width,before!==after);
  await page.locator('[data-reset]').click();await page.waitForTimeout(350);
  await page.locator('[data-hotspot="donglong"]').click();check('Hotspot opens information '+width,await page.locator('#scene-info').isVisible()&&await page.locator('#scene-info-title').textContent()==='東隆宮');
  const url=await page.locator('[data-info-link]').getAttribute('href');check('Hotspot article 200 '+width,(await fetch(base+url)).status===200);await page.waitForTimeout(1000);await capture('hotspot-'+width);await page.keyboard.press('Escape');check('Escape closes information '+width,await page.locator('#scene-info').isHidden());
  await page.locator('[data-list]').click();await page.locator('[data-place="place-dingzhong"]').click();check('List opens selected temple '+width,(await page.locator('#scene-info-title').textContent()).includes('進水宮'));await page.keyboard.press('Escape');check('List focus restored '+width,await page.locator('[data-list]').evaluate(el=>el===document.activeElement));
  if(width===390){await page.locator('[data-interact]').click();check('Mobile returns page scrolling',await page.locator('[data-interact]').getAttribute('aria-pressed')==='false');}
  await page.locator('.scene-bottom a[href="#intro"]').click();await page.waitForFunction(()=>document.querySelector('#intro').getBoundingClientRect().top<180);check('Intro anchor reachable '+width,await page.locator('#intro').evaluate(el=>el.getBoundingClientRect().top<180));
  for(const file of ['carriers/ding.html','carriers/dingzhong.html','map.html','overview.html']){await page.goto(base+'/'+file,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await capture(file.replaceAll('/','-').replace('.html','')+'-'+width,true);}
 }
 await page.goto(base);await loaded();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});const paused=await page.locator('.home3d').getAttribute('data-frames');await page.waitForTimeout(200);check('Hidden document pauses drawing',paused===await page.locator('.home3d').getAttribute('data-frames'));await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 for(const mode of ['reduced','webgl','saveData']){
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  if(mode==='webgl')await ctx.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
  if(mode==='saveData')await ctx.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
  const p=await ctx.newPage();await p.goto(base);await p.waitForFunction(()=>document.querySelector('.home3d').dataset.state==='fallback');check('Static fallback '+mode,await p.locator('.scene-canvas canvas').count()===0&&await p.locator('#scene-list').isVisible());await p.locator('[data-place="place-ding"]').click();check('Fallback information '+mode,await p.locator('#scene-info').isVisible());await p.screenshot({path:path.join(out,'fallback-'+mode+'.png')});await ctx.close();
 }
 await page.goto(base+'/map.html',{waitUntil:'networkidle'});check('Planar map defaults to 2D',await page.locator('#home-map').getAttribute('data-mode')==='2d'&&await page.locator('[data-mode-toggle]').textContent()==='2D');
 await page.goto(base+'/?item=jialian');await loaded();check('Existing home item deep link preserved',await page.locator('#scene-info').isVisible());
 let gzip=0,raw=0;for(const f of await fs.readdir('dist/assets/home3d'))if(f.endsWith('.js')){const b=await fs.readFile('dist/assets/home3d/'+f);gzip+=gzipSync(b).length;raw+=b.length;}report.sceneBundle={raw,gzip};check('3D JavaScript gzip under 300KB',gzip<=300*1024,report.sceneBundle);
 const touchContext=await browser.newContext({hasTouch:true,viewport:{width:1024,height:900}});const touchPage=await touchContext.newPage();await touchPage.goto(base);await touchPage.waitForFunction(()=>document.querySelector('.home3d').dataset.state==='ready');await touchPage.locator('[data-skip]').click();check('Touch tablet has activation control',await touchPage.locator('[data-interact]').isVisible());await touchPage.locator('[data-interact]').click();
 const client=await touchContext.newCDPSession(touchPage);const touchBefore=createHash('sha256').update(await touchPage.locator('canvas').first().screenshot()).digest('hex');
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:300,id:0},{x:230,y:300,id:1}]});
 await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:145,y:280,id:0},{x:265,y:320,id:1}]});
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touchPage.waitForTimeout(400);
 check('Touch tablet pinch changes scene',touchBefore!==createHash('sha256').update(await touchPage.locator('canvas').first().screenshot()).digest('hex'));
 await touchPage.setViewportSize({width:390,height:844});await touchPage.locator('[data-interact]').click();check('Touch resize can restore page scrolling',await touchPage.locator('.scene-canvas canvas').evaluate(el=>getComputedStyle(el).touchAction==='pan-y'));await touchContext.close();
 await context.close();
}
