import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createHall} from '../city-lab/hall.js';
import {createKit} from '../city-lab/kit.js';
import {createWorld} from '../city-lab/world.js';
import {places,worldData,outsidePlaces,separateStories} from '../city-lab/data.mjs';
const require=createRequire(import.meta.url),runtime='C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/';
const {chromium}=require(runtime+'playwright'),sharp=require('sharp'),out=path.resolve('outputs/city-lab/v5');await fs.mkdir(out,{recursive:true});
for(const mobile of [false,true]){const kit=createKit({mobile});createHall(kit);for(const mesh of kit.finish().children)for(const value of mesh.geometry.attributes.position.array)assert(Number.isFinite(value));kit.dispose();}
assert.equal(places.find(p=>p.id==='troupe-group-jialian-white-crane').title,'汕尾仔舊嘉蓮宮');
const routes=JSON.parse(await fs.readFile('routes.json','utf8'));
for(const p of [...places,...outsidePlaces,...separateStories])assert(routes.some(r=>'/'+r.file===p.url.split('#')[0]),'Existing route '+p.url);
assert.equal(places.filter(p=>p.category==='temple').length,7);
assert(!worldData.places.some(p=>p.id.includes('xianlong')));
assert(worldData.roads.length>500);assert(worldData.polygons.some(p=>p.layer==='sea'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={renderer:'Chrome stable / SwiftShader; physical phone GPU and Safari not measured',viewports:[],focus:[],errors:[],checks:[]};
try{
 const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.addInitScript(()=>{const upload=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(target,data,...rest){if(data instanceof Float32Array)for(const value of data)if(!Number.isFinite(value))throw Error('Nonfinite GPU geometry buffer');return upload.call(this,target,data,...rest);};const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,attrs){return get.call(this,type,['webgl','webgl2'].includes(type)?{...attrs,preserveDrawingBuffer:true}:attrs);};});
 const settle=async()=>{await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await page.waitForTimeout(100);};
 const metrics=()=>page.locator('.city-stage').evaluate(el=>({width:innerWidth,calls:+el.dataset.drawCalls,triangles:+el.dataset.triangles,dpr:+el.dataset.dpr,scroll:document.documentElement.scrollWidth,world:JSON.parse(el.dataset.world),labels:[...el.querySelectorAll('[data-hotspot]')].filter(b=>getComputedStyle(b).visibility==='visible').map(b=>b.dataset.hotspot)}));
 const capture=async name=>{await settle();await page.screenshot({path:path.join(out,name+'.png')});const stats=await sharp(await page.locator('canvas').screenshot()).stats();assert(stats.channels.some(c=>c.stdev>15),'Visible canvas pixels '+name);};
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:width===1440?1000:844});await page.goto('http://127.0.0.1:4173/city-lab.html');await page.waitForFunction(()=>document.querySelector('.city-stage').dataset.state==='ready');await settle();
  const initial=await metrics();report.viewports.push(initial);assert(initial.calls<=(width<761?120:160));assert(initial.triangles<=(width<761?120000:300000));assert(initial.scroll<=width);assert(initial.dpr<=(width<761?1.5:2));assert(initial.labels.includes('donglong'));assert(initial.labels.length<places.length);assert(initial.world.boats>=3);
  const initialCamera=await page.locator('.city-stage').getAttribute('data-camera');
  const board=JSON.parse(await page.locator('.city-stage').getAttribute('data-board-bounds'));if(width===1440){assert((board.right-board.left)/2>=.85&&(board.right-board.left)/2<=.90,'Overview occupies 85–90% of canvas width');assert(board.left>=-1&&board.right<=1&&board.top<=1&&board.bottom>=-1,'Desktop board stays in frame');}
  await capture('city-lab-'+width);
  if(width<761){assert.equal(await page.locator('canvas').evaluate(e=>getComputedStyle(e).touchAction),'pan-y');assert.equal(await page.locator('.city-stage').getAttribute('data-motion'),'false');await page.locator('[data-interact]').click();assert.equal(await page.locator('canvas').evaluate(e=>getComputedStyle(e).touchAction),'none');await page.locator('[data-interact]').click();}
  const baseRoof=await page.locator('.city-stage').getAttribute('data-roof-instances');
  for(const time of ['dusk','night','day']){await page.locator(`[data-time=${time}]`).click();await settle();assert.equal(await page.locator('.city-stage').getAttribute('data-roof-instances'),baseRoof);const lighting=JSON.parse(await page.locator('.city-stage').getAttribute('data-lighting'));assert(lighting.some(l=>l.name==='windowGlow'&&l.count>0));assert(lighting.filter(l=>l.name==='windowGlow').every(l=>time==='day'?l.intensity===0:l.intensity>0),'Warm windows follow time');if(time==='night'&&width===1440)await capture('night-1440');}
  for(const id of width===1440?places.map(p=>p.id):['donglong','harbor','place-xia','jialian']){
   await page.locator(`[data-place="${id}"]`).click();await settle();assert(await page.locator('#city-info').isVisible());assert.equal(await page.locator('#city-info h2').textContent(),places.find(p=>p.id===id).title);
   assert.equal((await fetch('http://127.0.0.1:4173'+await page.locator('#city-info a').getAttribute('href'))).status,200);
   const value=await metrics();assert(value.calls<=(width<761?120:160));assert(value.triangles<=(width<761?120000:300000));
   const overlap=await page.evaluate(()=>{const card=document.querySelector('#city-info').getBoundingClientRect();return [...document.querySelectorAll('.city-label')].filter(e=>getComputedStyle(e).visibility==='visible').some(e=>{const r=e.getBoundingClientRect();return r.left<card.right&&r.right>card.left&&r.top<card.bottom&&r.bottom>card.top;});});assert(!overlap,'Card must not cover labels');
   report.focus.push({width,id,calls:value.calls,triangles:value.triangles});
   if(width===1440){const name=({donglong:'closeup-donglong',harbor:'closeup-harbor','place-xia':'closeup-temple-東福殿',jialian:'closeup-temple-後塭仔嘉蓮宮'})[id];if(name)await capture(name);if(id==='donglong'){await page.setViewportSize({width:1440,height:1200});await capture('card-1440');await page.setViewportSize({width:1440,height:1000});}}
   await page.keyboard.press('Escape');assert(await page.locator('#city-info').isHidden());await page.locator('[data-reset]').click();await settle();await page.waitForFunction(expected=>document.querySelector('.city-stage').dataset.camera.split(',').every((n,i)=>Math.abs(Number(n)-Number(expected.split(',')[i]))<.001),initialCamera,{timeout:10000});const resetCamera=(await page.locator('.city-stage').getAttribute('data-camera')).split(',').map(Number);assert(resetCamera.every((n,i)=>Math.abs(n-Number(initialCamera.split(',')[i]))<.001),'Reset returns to initial overview '+JSON.stringify({width,id,initialCamera,resetCamera}));
  }
 }
 // One real model-surface click, separate from the keyboard-readable landmark list.
 const point=await page.evaluate(()=>{const data=JSON.parse(document.querySelector('#city-data').textContent),index=data.findIndex(p=>p.id==='donglong'),dot=document.querySelectorAll('.city-pins circle')[index],r=document.querySelector('.city-canvas').getBoundingClientRect(),x=r.x+ +dot.getAttribute('cx'),y=r.y+ +dot.getAttribute('cy');return {x,y,target:document.elementFromPoint(x,y)?.tagName};});assert.equal(point.target,'CANVAS');await page.mouse.click(point.x,point.y);await settle();assert.equal(await page.locator('#city-info h2').textContent(),'東隆宮');await page.keyboard.press('Escape');
 if(await page.locator('button[data-motion]').getAttribute('aria-pressed')!=='true')await page.locator('button[data-motion]').click();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});const paused=await page.locator('.city-stage').getAttribute('data-frames');await page.waitForTimeout(250);assert.equal(await page.locator('.city-stage').getAttribute('data-frames'),paused);
 assert.equal(report.errors.length,0,report.errors.join('\n'));
 const baseline=(await fs.readFile(path.join(out,'home3d-before.sha256'),'utf8')).trim().split(/\r?\n/);
 for(const line of baseline){const [hash,file]=line.split(/\s+\*?/);assert.equal(createHash('sha256').update(await fs.readFile(file)).digest('hex'),hash,'Home source unchanged '+file);}
 report.checks.push('all existing routes','seven neighborhood temples','no fixed crane troupe','real OSM geometry','all landmarks open','all roof material instances fixed','responsive and DPR budgets','mobile opt-in','no card-label overlap','background pause','home3d hashes unchanged');
 await fs.writeFile(path.join(out,'perf.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({viewports:report.viewports,focusCount:report.focus.length,errors:report.errors},null,2));
}finally{await browser.close();}
