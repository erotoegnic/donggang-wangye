import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium,webkit}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.QA_BASE||'http://127.0.0.1:4173';
const out=path.resolve(process.env.QA_OUT||'../homepage-fix3/after');
let input='';for await(const chunk of process.stdin)input+=chunk;
const {token}=JSON.parse(input.trim()||'{}');
const report={base,checks:[],metrics:[],errors:[],failed:[],screenshots:[]};
const check=(name,value)=>{assert.ok(value,name);report.checks.push(name);};
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const capture=async(page,name)=>{await settle(page);await page.screenshot({path:path.join(out,name+'.png')});report.screenshots.push(name+'.png');};
const browser=await chromium.launch({channel:'chrome'});
await fs.mkdir(out,{recursive:true});
async function contextFor(engine,options){
 const context=await engine.newContext(options);
 if(token)await context.route('**/*',route=>route.continue({headers:new URL(route.request().url()).origin===new URL(base).origin?{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+token}:route.request().headers()}));
 return context;
}
async function atIntro(page,label){
 await settle(page);
 check(label+' hash',new URL(page.url()).hash==='#intro');
 const position=await page.locator('#intro .intro-navigation').boundingBox();
 const header=await page.locator('.site-header').boundingBox();
 check(label+' visible',position.y>=header.height&&position.y+position.height<844);
 check(label+' h1',await page.locator('h1').count()===1&&await page.locator('h1').innerText()==='三年一科，\n一起來迎王。');
}
try{
 const context=await contextFor(browser,{reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failed.push({url:r.url(),status:r.status()});});
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});await page.goto(base);await page.evaluate(()=>document.fonts.ready);await settle(page);
  const metrics=await page.evaluate(()=>{
   const stage=document.querySelector('.hm-stage').getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();
   const selectors=['.hm-title-pill','.hm-search-toggle','.hm-controls','.hm-read-arrow','.hm-attribution'];
   const rects=selectors.map(s=>document.querySelector(s).getBoundingClientRect());let covered=0;
   for(let y=Math.ceil(stage.top);y<stage.bottom;y++)for(let x=0;x<innerWidth;x++)if(rects.some(r=>x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom))covered++;
   const button=document.querySelector('.hm-read-arrow'),r=button.getBoundingClientRect();
   return {width:innerWidth,headerHeight:header.height,mapHeight:stage.height,mapVisiblePercent:100*(1-covered/(stage.width*stage.height)),overlap:rects.some((a,i)=>rects.slice(i+1).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)),overflow:document.documentElement.scrollWidth>innerWidth,button:{width:r.width,height:r.height,x:r.x,y:r.y,bottom:r.bottom,color:getComputedStyle(button).backgroundColor},headingChildren:document.querySelector('.hm-map-heading').children.length};
  });
  report.metrics.push(metrics);
  check('No overflow '+width,!metrics.overflow);check('No control overlap '+width,!metrics.overlap);
  check('Touch target '+width,metrics.button.width>=44&&metrics.button.height>=44);
  check('CTA visible '+width,metrics.button.y>metrics.headerHeight&&metrics.button.bottom<=844);
  check('Yellow capsule '+width,metrics.button.color==='rgb(246, 210, 122)');
  check('No additions top left '+width,metrics.headingChildren===2);
  check('Map fills screen '+width,metrics.mapHeight===844-metrics.headerHeight);
  if(width===390)check('Map visible >=90 percent',metrics.mapVisiblePercent>=90);
  check('CTA copy '+width,await page.locator('.hm-read-arrow').innerText()==='迎王介紹 ↓');
  await capture(page,'overview-'+width);
  await page.locator('.hm-read-arrow').click();await atIntro(page,'CTA '+width);await capture(page,'intro-'+width);
  check('Retained homepage '+width,await page.locator('#cover-stage,.countdown-box,.home-chapters,.featured-story').count()===4);
  await page.locator('#intro a[href="#home-map"]').click();await settle(page);check('Return to top '+width,await page.evaluate(()=>scrollY===0));
  const menu=page.locator('.menu-toggle');if(await menu.isVisible())await menu.click();
  check('Menu second item '+width,await page.locator('#main-nav>a').nth(1).getAttribute('href')==='/#intro');
  await capture(page,'menu-'+width);await page.locator('#main-nav a[href="/#intro"]').click();await atIntro(page,'Menu '+width);
  check('Menu closed '+width,await menu.getAttribute('aria-expanded')==='false');
  await page.goto(base+'/#intro');await page.evaluate(()=>document.fonts.ready);await atIntro(page,'Direct link '+width);
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/about.html');await page.locator('.menu-toggle').click();await page.locator('#main-nav a[href="/#intro"]').click();await atIntro(page,'Article menu');
 await page.goto(base);await page.locator('.hm-read-arrow').focus();await page.keyboard.press('Enter');await atIntro(page,'Keyboard');check('Keyboard focus intro',await page.locator('#intro').evaluate(e=>document.activeElement===e));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base);await settle(page);
 check('Smooth CSS',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='smooth'));
 const motion=await page.evaluate(async()=>{
  document.querySelector('.hm-read-arrow').click();const samples=[];
  for(let i=0;i<70;i++){await new Promise(requestAnimationFrame);samples.push(scrollY);}
  return [...new Set(samples)];
 });
 check('Smooth scroll intermediate positions',motion.length>3);await atIntro(page,'Smooth');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await settle(page);
 check('Reduced CSS',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior==='auto'));
 const instant=await page.evaluate(()=>{document.querySelector('.hm-read-arrow').click();return scrollY;});
 await settle(page);check('Reduced motion immediate',instant>300&&instant===await page.evaluate(()=>scrollY));
 const qaRequire=createRequire(path.resolve('../../work/donggang-qa/depth-check.mjs')),AxeBuilder=qaRequire('@axe-core/playwright').default;
 report.accessibility=(await new AxeBuilder({page}).analyze()).violations;
 check('Axe no violations',report.accessibility.length===0);
 for(const route of ['/?item=donglong','/neighborhoods.html','/guide/8.html']){
  const response=await page.goto(base+route);check('Route '+route,response.status()===200);
  if(route.includes('?item'))check('Map deep link',await page.locator('#hm-card-title').textContent()==='東隆宮');
  check('No tree '+route,await page.locator('.organization-tree,.tree-canvas').count()===0);
 }
 const wk=await webkit.launch();try{
  const wc=await contextFor(wk,{viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),wp=await wc.newPage();
  await wp.goto(base);await wp.evaluate(()=>document.fonts.ready);await capture(wp,'webkit-overview-390');
  await wp.locator('.hm-read-arrow').click();await atIntro(wp,'WebKit CTA');await capture(wp,'webkit-intro-390');
  await wp.locator('#intro a[href="#home-map"]').click();await settle(wp);check('WebKit return',await wp.evaluate(()=>scrollY===0));
 }finally{await wk.close();}
 check('No JS errors',report.errors.length===0);check('No failed resources',report.failed.length===0);
}finally{await browser.close();await fs.writeFile(path.join(out,'intro-qa.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({checks:report.checks.length,metrics:report.metrics,errors:report.errors,failed:report.failed}));
