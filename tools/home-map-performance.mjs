import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4173',out=process.env.QA_PERF_OUT||'work/home-map-qa/phase-3/performance.json';
let authToken='';if(process.env.SITE_QA_AUTH==='1'){let input='';for await(const chunk of process.stdin)input+=chunk;authToken=JSON.parse(input).token;}
const report={base,measuredAt:new Date().toISOString(),files:[],cold:[],interaction:null};
for(const file of ['data/donggang-basemap.json','home-map.js','home-map.css',...(await fs.readdir('dist/assets')).filter(n=>n.startsWith('basemap-')).map(n=>'dist/assets/'+n)]){const bytes=await fs.readFile(file);report.files.push({file,raw:bytes.length,gzip:gzipSync(bytes).length});}
const browser=await chromium.launch({channel:'chrome',headless:true});
async function authorize(context){if(authToken)await context.route('**/*',route=>route.continue({headers:new URL(route.request().url()).origin===new URL(base).origin?{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+authToken}:route.request().headers()}));}
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});await context.addInitScript(()=>localStorage.setItem('donggang-home-coach-v1','1'));
  await authorize(context);const page=await context.newPage(),cdp=await context.newCDPSession(page),loads=[],requests=[];await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});cdp.on('Network.loadingFinished',e=>loads.push(e.encodedDataLength));page.on('request',r=>requests.push(r.url()));
  await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
  const timing=await page.evaluate(()=>{const all=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];return {transfer:all.reduce((n,r)=>n+r.transferSize,0),encoded:all.reduce((n,r)=>n+r.encodedBodySize,0),decoded:all.reduce((n,r)=>n+r.decodedBodySize,0),resources:all.map(r=>({url:r.name,transfer:r.transferSize,encoded:r.encodedBodySize,decoded:r.decodedBodySize})),stageNodes:document.querySelector('.hm-stage').querySelectorAll('*').length};});
  report.cold.push({width,...timing,cdpTransfer:loads.reduce((a,b)=>a+b,0),requestCount:requests.length,thirdParty:requests.filter(u=>new URL(u).origin!==new URL(base).origin),galleryLoaded:await page.evaluate(()=>{const urls=[...document.querySelectorAll('template[id^="hm-card-"]')].flatMap(t=>[...t.content.querySelectorAll('.hm-gallery img')].map(i=>i.src));return performance.getEntriesByType('resource').filter(r=>urls.includes(r.name)).map(r=>r.name);})});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await authorize(context);await context.addInitScript(()=>localStorage.setItem('donggang-home-coach-v1','1'));const page=await context.newPage(),cdp=await context.newCDPSession(page);await page.goto(base+'/?item=donglong',{waitUntil:'networkidle'});await page.keyboard.press('Escape');await page.evaluate(()=>document.fonts.ready);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await page.mouse.move(230,400);await page.mouse.down();
 report.interaction=await page.evaluate(async()=>{
  const stage=document.querySelector('.hm-stage'),frames=[],longTasks=[];const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});
  for(let i=0;i<180;i++){await new Promise(resolve=>requestAnimationFrame(time=>{frames.push(time);if(i<120)stage.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:1,pointerType:'mouse',buttons:1,clientX:230+Math.sin(i/12)*60,clientY:400+Math.cos(i/12)*40}));else stage.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:230,clientY:400,deltaY:Math.sin(i/12)*8}));resolve();}));}
  await new Promise(resolve=>setTimeout(resolve,100));observer.disconnect();const intervals=frames.slice(1).map((t,i)=>t-frames[i]);return {cpuThrottle:4,frames:frames.length,elapsed:frames.at(-1)-frames[0],fps:1000*(frames.length-1)/(frames.at(-1)-frames[0]),maxFrameMs:Math.max(...intervals),longTasks,over50ms:longTasks.filter(d=>d>50).length};
 });await page.mouse.up();await context.close();
}finally{await browser.close();await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,JSON.stringify(report,null,2));}
console.log(JSON.stringify({...report,cold:report.cold.map(({resources,...rest})=>rest)}));
