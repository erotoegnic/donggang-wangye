import {places} from '../city-lab/data.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';

export async function checkCity({browser,base,out,report,check,sharp}){
 const captureDir=path.resolve('outputs/city-lab');await fs.mkdir(captureDir,{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const ready=()=>page.waitForFunction(()=>document.querySelector('.city-stage')?.dataset.state==='ready');
 const settle=async()=>{await page.waitForTimeout(1100);await page.evaluate(()=>document.fonts.ready);};
 const capture=async name=>{const file=path.join(captureDir,name+'.png');await page.screenshot({path:file,fullPage:true,animations:'disabled'});report.screenshots.push({file:name,path:file});const rect=await page.locator('.city-stage').evaluate(el=>{const r=el.getBoundingClientRect();return {left:Math.ceil(r.left+12),top:Math.ceil(r.top+scrollY+12),width:Math.floor(r.width*.5),height:Math.floor(r.height*.8)};});const stats=await sharp(file).extract(rect).stats();check('City screenshot contains model '+name,stats.channels.some(c=>c.stdev>15),stats.channels.map(c=>c.stdev));};
 const source=await fs.readFile('dist/city-lab.html','utf8');check('City noindex',/<meta name="robots" content="noindex, nofollow"/.test(source));
 const files=(await fs.readdir('dist',{recursive:true})).filter(f=>f.endsWith('.html')&&f!=='city-lab.html');
 const inbound=[];for(const file of files){const html=await fs.readFile(path.join('dist',file),'utf8');if(/(?:href|src)=["'][^"']*city-lab\.html/.test(html))inbound.push(file);}
 check('City has no inbound links',inbound.length===0,inbound);check('City has no site navigation or footer',!/<nav|<footer|organization-tree|tree-canvas/.test(source));
 report.city={viewports:[],metrics:[],errors};
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(base+'/city-lab.html');await ready();await settle();
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));report.city.viewports.push(layout);check('City no overflow '+width,layout.width>=layout.scroll&&layout.width>=layout.body,layout);
  check('City post-processing policy '+width,await page.locator('.city-stage').getAttribute('data-post')===String(width>760));
  if(width===320){await capture('city-320');await page.locator('.city-stage').evaluate(e=>{e.style.height='0px';e.style.minHeight='0px';e.style.maxHeight='0px';});await page.waitForTimeout(150);await page.locator('.city-stage').evaluate(e=>e.removeAttribute('style'));await settle();check('City recovers from zero-height container',await page.locator('.city-stage').evaluate(e=>e.clientHeight>0&&e.dataset.camera.split(',').every(n=>Number.isFinite(Number(n)))));continue;}
  const roofBaseline=await page.locator('.city-stage').getAttribute('data-roof-colors');
  const allRoofBaseline=await page.locator('.city-stage').getAttribute('data-roof-instances');
  const roofMaterials=JSON.parse(roofBaseline||'{}');
  check('City fixed temple materials are present '+width,['districtTile','districtGold','districtJade','gateTile','hallTile','hallTileLight','hallGold','hallGoldLight','jade','ceramicBlue','ceramicGreen','ceramicAzure','ceramicYellow','ceramicRed','ceramicWhite','canopyDark','canopyRed','hallRed','hallDark'].every(name=>roofMaterials[name]?.color.length===3),roofMaterials);
  check('City hall tile palette '+width,roofMaterials.hallTile?.hex==='d9653a'&&roofMaterials.hallGold?.hex==='e0a63a'&&roofMaterials.gateTile?.hex==='7a2a2a');
  check('City initial major landmark visible '+width,await page.locator('[data-hotspot=donglong]').isVisible());
  for(const time of ['day','dusk','night']){
   await page.locator(`button[data-time="${time}"]`).click();await settle();
   check('City time selection '+width+' '+time,await page.locator('.city-stage').getAttribute('data-time')===time&&await page.locator(`button[data-time="${time}"]`).getAttribute('aria-pressed')==='true');
   const roofAfter=await page.locator('.city-stage').getAttribute('data-roof-colors');
   check('City every temple material instance unchanged '+width+' '+time,allRoofBaseline===await page.locator('.city-stage').getAttribute('data-roof-instances'));
   check('City roof material colors and identities unchanged '+width+' '+time,roofAfter===roofBaseline,JSON.parse(roofAfter||'{}'));
   const shadowFrame=await page.locator('.city-stage').evaluate(el=>({calls:+el.dataset.drawCalls,triangles:+el.dataset.triangles}));
   check('City shadow refresh draw call budget '+width+' '+time,shadowFrame.calls<=(width<761?240:320),shadowFrame);
   await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.waitForTimeout(100);
   const metrics=await page.locator('.city-stage').evaluate(el=>({width:innerWidth,time:el.dataset.time,calls:+el.dataset.drawCalls,triangles:+el.dataset.triangles,frames:+el.dataset.frames,post:el.dataset.post}));report.city.metrics.push(metrics);check('City draw call budget '+width+' '+time,metrics.calls>0&&metrics.calls<=(width<761?120:160),metrics);
   check('City ordinary frame triangle budget '+width+' '+time,metrics.triangles<=(width<761?120000:300000),metrics);
   const pixels=await page.locator('.city-canvas canvas').screenshot();const stats=await sharp(pixels).stats();check('City canvas rendered '+width+' '+time,stats.channels.some(c=>c.stdev>15),stats.channels.map(c=>c.stdev));await capture(`city-${width}-${time}`);
  }
  await page.locator('button[data-time=day]').click();await settle();
  const hash=async()=>createHash('sha256').update(await page.locator('canvas').screenshot()).digest('hex');const before=await hash();
  if(width===390){check('City mobile initially scrollable',await page.locator('canvas').evaluate(el=>getComputedStyle(el).touchAction==='pan-y'));await page.locator('[data-interact]').click();check('City mobile activated',await page.locator('canvas').evaluate(el=>getComputedStyle(el).touchAction==='none'));}
  const r=await page.locator('canvas').boundingBox(),drag={x:r.x+r.width*.12,y:r.y+r.height*.88};
  check('City drag starts on canvas '+width,await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.tagName==='CANVAS',drag));
  await page.mouse.move(drag.x,drag.y);await page.mouse.down();await page.mouse.move(drag.x+60,drag.y-25,{steps:10});await page.mouse.up();await settle();check('City drag changes camera '+width,before!==await hash());
  await page.locator('[data-reset]').click();await settle();
  for(const id of ['gate','hall','incense','furnace']){
   const label=page.locator(`[data-hotspot=${id}]`);const shown=await label.isVisible();await (shown?label:page.locator(`[data-place=${id}]`)).click();await settle();
   check('City hotspot opens '+id+' '+width,await page.locator('#city-info').isVisible());const url=await page.locator('#city-info a').getAttribute('href');check('City hotspot link 200 '+id+' '+width,(await fetch(base+url)).status===200);
   const focusedPixels=await sharp(await page.locator('.city-canvas canvas').screenshot()).stats();check('City focused canvas renders '+id+' '+width,focusedPixels.channels.some(c=>c.stdev>15),focusedPixels.channels.map(c=>c.stdev));
   if(id==='gate')await capture(`city-${width}-hotspot`);
   await page.keyboard.press('Escape');check('City Escape closes '+id+' '+width,await page.locator('#city-info').isHidden());await page.locator('[data-reset]').click();await settle();
  }
  if(width===390){await page.locator('[data-interact]').click();check('City mobile release',await page.locator('canvas').evaluate(el=>getComputedStyle(el).touchAction==='pan-y'));}
 }
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});const paused=await page.locator('.city-stage').getAttribute('data-frames');await page.waitForTimeout(250);check('City hidden pauses',paused===await page.locator('.city-stage').getAttribute('data-frames'));await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.setViewportSize({width:390,height:600});await page.locator('#city-places').scrollIntoViewIfNeeded();await page.waitForTimeout(300);const outside=await page.locator('.city-stage').getAttribute('data-frames');await page.waitForTimeout(250);check('City offscreen pauses',outside===await page.locator('.city-stage').getAttribute('data-frames'));
 for(const mode of ['reduced','webgl','nojs']){
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='nojs'});
  if(mode==='webgl')await ctx.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
  const p=await ctx.newPage();await p.goto(base+'/city-lab.html');if(mode==='reduced'){await p.waitForFunction(()=>document.querySelector('.city-stage').dataset.state==='ready');check('City reduced motion disables post',await p.locator('.city-stage').getAttribute('data-post')==='false');}else{check('City fallback has no canvas '+mode,await p.locator('canvas').count()===0);check('City fallback complete reading links '+mode,await p.locator('.city-places a').count()===places.length&&await p.locator('.city-poster').isVisible());}
  if(mode==='nojs')check('City no-JS motion control hidden',await p.locator('button[data-motion]').isHidden());
  if(mode==='nojs')check('City no-JS titles are not duplicated',await p.locator('.city-places button:visible').count()===0&&await p.locator('.city-places strong:visible').count()===places.length);
  await p.screenshot({path:path.join(captureDir,`city-${mode}.png`),fullPage:true});await ctx.close();
 }
 const delayed=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const loading=await delayed.newPage();let releaseScene;const held=new Promise(resolve=>releaseScene=resolve);
 await loading.route('**/assets/city-lab/chunk-*.js',async route=>{await held;await route.continue();});
 await loading.goto(base+'/city-lab.html',{waitUntil:'domcontentloaded'});
 await loading.locator('button[data-time=night]').click();await loading.locator('[data-place=hall]').click();
 check('City loading poster remains visible',await loading.locator('.city-stage').getAttribute('data-state')==='loading');
 releaseScene();await loading.waitForFunction(()=>document.querySelector('.city-stage').dataset.state==='ready');
 await loading.waitForFunction(()=>document.querySelector('[data-hotspot=hall]').getAttribute('aria-pressed')==='true');
 check('City retains time selected during loading',await loading.locator('.city-stage').getAttribute('data-time')==='night'&&await loading.locator('button[data-time=night]').getAttribute('aria-pressed')==='true');
 check('City retains hotspot selected during loading',await loading.locator('[data-hotspot=hall]').getAttribute('aria-pressed')==='true'&&await loading.locator('#city-info-title').textContent()==='正殿');
 await delayed.close();
 const touch=await browser.newContext({viewport:{width:900,height:450},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const landscape=await touch.newPage();await landscape.goto(base+'/city-lab.html');await landscape.waitForFunction(()=>document.querySelector('.city-stage').dataset.state==='ready');
 const density=await landscape.locator('canvas').evaluate(el=>({ratio:el.width/el.getBoundingClientRect().width,coarse:matchMedia('(pointer:coarse)').matches}));
 check('City landscape mobile DPR cap',density.coarse&&density.ratio<=1.5,density);
 check('City landscape mobile starts scrollable',await landscape.locator('canvas').evaluate(el=>getComputedStyle(el).touchAction==='pan-y'));
 check('City landscape mobile disables post',await landscape.locator('.city-stage').getAttribute('data-post')==='false');await touch.close();
 for(const width of [768,800]){
  await page.setViewportSize({width,height:844});await page.goto(base+'/city-lab.html');await ready();
  check('City narrow desktop remains interactive '+width,await page.locator('canvas').evaluate(el=>getComputedStyle(el).touchAction==='none')&&await page.locator('.city-stage').getAttribute('data-interactive')==='true');
 }
 const sizes=JSON.parse(await fs.readFile('dist/assets/city-lab/size.json','utf8'));report.city.bundle=sizes;check('City gzip budget',sizes.newJS.gzip<=120*1024,sizes.newJS);check('City shared engine used by home and city',sizes.files.some(f=>f.shared&&f.gzip>100000));
 check('City no console errors',errors.length===0,errors);report.errors.push(...errors);await context.close();
 await fs.writeFile(path.join(captureDir,'city-qa.json'),JSON.stringify({city:report.city,checks:report.checks.filter(c=>c.name.startsWith('City')),screenshots:report.screenshots},null,2));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const require=createRequire(import.meta.url),runtime='C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';const {chromium}=require(process.env.PLAYWRIGHT_PATH||runtime+'playwright'),sharp=require(runtime+'sharp');
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const report={checks:[],screenshots:[],errors:[]};
 const check=(name,ok,detail)=>{report.checks.push({name,ok,detail});if(!ok)console.error('FAIL',name,detail);};
 try{await checkCity({browser,base:process.env.QA_BASE||'http://127.0.0.1:4173',out:'outputs/city-lab',report,check,sharp});}finally{await browser.close();}
 console.log(JSON.stringify({checks:report.checks.length,failed:report.checks.filter(c=>!c.ok),metrics:report.city?.metrics,bundle:report.city?.bundle?.newJS},null,2));if(report.checks.some(c=>!c.ok))process.exitCode=1;
}
