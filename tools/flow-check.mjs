import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {stageFlow,dayStages,preFestivalLink} from '../flow.mjs';
import {pins} from '../home-map.mjs';
import {checkHome3D} from './home3d-check.mjs';
import {checkCity} from './city-lab-check.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
async function cardContrast(page){
 return page.evaluate(()=>{
  const rgb=value=>value.match(/[\d.]+/g).map(Number);
  const composite=(fg,bg)=>fg.slice(0,3).map((v,i)=>v*(fg[3]??1)+bg[i]*(1-(fg[3]??1)));
  const background=el=>{const layers=[];for(let node=el;node;node=node.parentElement)layers.unshift(rgb(getComputedStyle(node).backgroundColor));return layers.reduce((bg,fg)=>composite(fg,bg),[255,255,255]);};
  const luminance=color=>color.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const failures=[];let minRatio=Infinity,count=0;
  const selectors='.story-card,.chapter-card,.overview-entry,.reading-card,.ritual-stage';
  for(const card of document.querySelectorAll(selectors)){
   for(const el of [card,...card.querySelectorAll('*')]){
    if(el.closest('svg')||!el.getClientRects().length||getComputedStyle(el).visibility!=='visible'||![...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()))continue;
    const bg=background(el);const fg=composite(rgb(getComputedStyle(el).color),bg);
    const [light,dark]=[luminance(bg),luminance(fg)].sort((a,b)=>b-a);const ratio=(light+.05)/(dark+.05);
    count++;minRatio=Math.min(minRatio,ratio);
    if(ratio<4.5)failures.push({text:el.textContent.trim().slice(0,80),ratio,fg,bg});
   }
  }
  return {count,minRatio:count?minRatio:null,failures};
 });
}
async function fullScreenshot(page,screenshot){
 await page.evaluate(async()=>{
  const images=[...document.images];images.forEach(img=>img.loading='eager');
  await Promise.all(images.map(img=>img.decode().catch(()=>{})));
 });
 const {width,height}=await page.evaluate(()=>({width:innerWidth,height:document.documentElement.scrollHeight}));
 if(height<7000){await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});return;}
 const style=await page.addStyleTag({content:'.site-header{position:absolute!important}.article-toc{position:static!important}html{scroll-behavior:auto!important}'});
 const tiles=[];const viewport=page.viewportSize().height;
 for(let y=0;y<height;y+=viewport){
  await page.evaluate(offset=>scrollTo(0,offset),Math.min(y,height-viewport));
  const offset=await page.evaluate(()=>scrollY);
  const buffer=await page.screenshot({animations:'disabled'});
  tiles.push({input:await sharp(buffer).extract({left:0,top:y-offset,width,height:Math.min(viewport,height-y)}).toBuffer(),left:0,top:y});
 }
 await sharp({create:{width,height,channels:3,background:'#fffcf6'}}).composite(tiles).png().toFile(screenshot);
 await style.evaluate(el=>el.remove());await page.evaluate(()=>scrollTo(0,0));
}
const base=process.env.QA_BASE||'http://127.0.0.1:4173';
const out=path.resolve(process.env.QA_OUT||'work/flow-review/3d');
await fs.mkdir(path.join(out,'pages'),{recursive:true});
const report={base,checks:[],routes:[],viewports:[],screenshots:[],errors:[],brokenLinks:[],contrast:[]};
const check=(name,ok,detail)=>{report.checks.push({name,ok,detail});if(!ok)console.error('FAIL',name,JSON.stringify(detail));};
const files=(await fs.readdir('dist',{recursive:true})).filter(f=>f.endsWith('.html')).map(f=>f.replaceAll('\\','/')).sort();
const old=JSON.parse((await fs.readFile(path.join(out,'routes-before.json'),'utf8')).replace(/^\uFEFF/,''));
check('All old URLs retained',old.every(r=>files.includes(r.file)),{before:old.length,after:files.length});
const html=new Map();
for(const file of files){
 const res=await fetch(base+'/'+file);const text=await res.text();html.set(file,text);
 report.routes.push({file,status:res.status});
 check('200 '+file,res.status===200);
 check('noindex '+file,/<meta name="robots" content="[^"]*noindex/.test(text));
 check('No tree '+file,!/class="organization-tree"|id="organization-tree-title"|class="tree-canvas"/.test(text));
 check('No invalid troupe name '+file,!/駕前(?:東港)?東福殿|東福殿[^<。]{0,15}駕前二十四司|駕前二十四司/.test(text));
 check('No source section '+file,!/<h[1-6][^>]*>[^<]*(參考資料|資料來源|引用|書目)[^<]*<\/h[1-6]>/.test(text));
}
const idSets=new Map([...html].map(([file,text])=>[file,new Set([...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))]));
for(const [file,text] of html){
 for(const m of text.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
  const url=new URL(m[1].replaceAll('&amp;','&'),base+'/'+file);if(url.origin!==new URL(base).origin)continue;
  const target=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
  if(!html.has(target)){report.brokenLinks.push({file,url:url.href,reason:'page absent'});continue;}
  if(url.hash&&!idSets.get(target).has(decodeURIComponent(url.hash.slice(1))))report.brokenLinks.push({file,url:url.href,reason:'anchor absent'});
  if(url.searchParams.has('item')&&!pins.some(p=>p.id===url.searchParams.get('item')))report.brokenLinks.push({file,url:url.href,reason:'map item absent'});
 }
}
check('Internal links and anchors',report.brokenLinks.length===0,report.brokenLinks);
const robots=await fetch(base+'/robots.txt');report.robots=await robots.text();check('robots.txt',robots.status===200&&/^User-agent: \*\s+Disallow: \/\s*$/.test(report.robots));
check('No sitemap',!(await fs.readdir('dist')).some(f=>/^sitemap/i.test(f)));
const newText=(await fs.readFile('overview.mjs','utf8'))+(await fs.readFile('flow.mjs','utf8'));
check('First five procedures are pre-festival',stageFlow.slice(0,5).every(s=>s.phase==='before'&&s.periods.some(p=>p.title==='迎王前'&&p.url===preFestivalLink.url)&&!s.periods.some(p=>/第 [1-8] 天/.test(p.title))));
check('New text has no hedging',!/據說|未必|不一定|僅供參考/.test(newText));
const changedImages=execFileSync('git',['diff','--name-only','--','art-source','dist/assets'],{encoding:'utf8'}).split(/\r?\n/).filter(f=>/\.(png|jpe?g|webp|svg)$/.test(f));
if(process.env.QA_JINJIA_ZHANG_BLADE==='1'){
 const stem='jinjia-07-zhang';
 const archive='art-source/jinjia/_old/'+stem+'-2026-10-30-before-zhang-blade.png';
 const allowed=new Set(['art-source/jinjia/'+stem+'.png','dist/assets/jinjia/'+stem+'.webp',archive]);
 check('Only Zhang blade illustration changed',changedImages.every(f=>allowed.has(f)),changedImages);
 const sources=(await fs.readdir('art-source/jinjia')).filter(f=>/^jinjia-.*\.png$/.test(f)).sort();
 check('Exactly thirteen golden marshal sources',sources.length===13);
 const baseline=process.env.QA_BASELINE_COMMIT||'8974e0c59816550695e785aed6fb1c825c64a096';
 const original=execFileSync('git',['show',baseline+':art-source/jinjia/'+stem+'.png'],{maxBuffer:16*1024*1024});
 check('Original Zhang blade archived',(await fs.readFile(archive)).equals(original));
 check('Zhang blade edited',!(await fs.readFile('art-source/jinjia/'+stem+'.png')).equals(original));
 for(const name of sources){
  const pngPath='art-source/jinjia/'+name,webpPath='dist/assets/jinjia/'+name.replace(/\.png$/,'.webp');
  const png=await sharp(pngPath).metadata(),webp=await sharp(webpPath).metadata();
  check('Full-body image dimensions '+name,png.width===1024&&png.height===1536&&webp.width===480&&webp.height===720);
  const derived=await sharp(pngPath).resize(480,720,{fit:'inside'}).webp({quality:84,effort:6}).toBuffer();
  check('WebP matches current PNG '+name,derived.equals(await fs.readFile(webpPath)));
  if(name===stem+'.png')continue;
  for(const file of [pngPath,webpPath]){
   const before=execFileSync('git',['show',baseline+':'+file],{maxBuffer:16*1024*1024});
   const digest=data=>createHash('sha256').update(data).digest('hex');
   check('Unchanged illustration SHA-256 '+file,digest(await fs.readFile(file))===digest(before));
  }
 }
}else if(process.env.QA_JINJIA_TOKENFIX==='1'){
 const changed=['03-zhu','04-shen','05-mao','06-zhao','07-zhang','08-li','10-wen','12-xu','13-huang'].map(s=>'jinjia-'+s);
 const unchanged=['01-lin','02-wu','09-chi','11-lu'].map(s=>'jinjia-'+s);
 const approved=new Set(changed.flatMap(s=>['art-source/jinjia/'+s+'.png','dist/assets/jinjia/'+s+'.webp']));
 check('Only approved token and weapon illustrations changed',changedImages.every(f=>approved.has(f)),changedImages);
 check('Exactly thirteen golden marshal sources',(await fs.readdir('art-source/jinjia')).filter(f=>/^jinjia-.*\.png$/.test(f)).length===13);
 for(const stem of [...changed,...unchanged]){
  const png=await sharp('art-source/jinjia/'+stem+'.png').metadata();
  const webp=await sharp('dist/assets/jinjia/'+stem+'.webp').metadata();
  check('Full-body image dimensions '+stem,png.width===1024&&png.height===1536&&webp.width===480&&webp.height===720);
  const derived=await sharp('art-source/jinjia/'+stem+'.png').resize(480,720,{fit:'inside'}).webp({quality:84,effort:6}).toBuffer();
  check('WebP matches current PNG '+stem,derived.equals(await fs.readFile('dist/assets/jinjia/'+stem+'.webp')));
 }
 for(const stem of changed){
  const archived=await fs.readFile('art-source/jinjia/_old/'+stem+'-2026-10-30-before-token-fix.png');
  const previous=execFileSync('git',['show',(process.env.QA_BASELINE_COMMIT||'HEAD')+':art-source/jinjia/'+stem+'.png'],{maxBuffer:16*1024*1024});
  check('Original token illustration archived '+stem,archived.equals(previous));
  check('Requested illustration changed '+stem,!archived.equals(await fs.readFile('art-source/jinjia/'+stem+'.png')));
 }
 for(const stem of unchanged){
  for(const file of ['art-source/jinjia/'+stem+'.png','dist/assets/jinjia/'+stem+'.webp']){
   check('Unchanged illustration '+file,(await fs.readFile(file)).equals(execFileSync('git',['show',(process.env.QA_BASELINE_COMMIT||'HEAD')+':'+file],{maxBuffer:16*1024*1024})));
  }
 }
}else if(process.env.QA_JINJIA_FULLBODY==='1'){
 const stems=['01-lin','02-wu','03-zhu','04-shen','05-mao','06-zhao','07-zhang','08-li','09-chi','10-wen','11-lu','12-xu','13-huang'].map(s=>'jinjia-'+s);
 const allowed=new Set(stems.flatMap(s=>['art-source/jinjia/'+s+'.jpg','art-source/jinjia/'+s+'.png','art-source/jinjia/_old/'+s+'.jpg','dist/assets/jinjia/'+s+'.webp']));
 check('Only approved golden marshal illustrations changed',changedImages.every(f=>allowed.has(f)),changedImages);
 check('Exactly thirteen golden marshal sources',(await fs.readdir('art-source/jinjia')).filter(f=>f.endsWith('.png')).length===13);
 for(const stem of stems){
  const png=await sharp('art-source/jinjia/'+stem+'.png').metadata();
  const webp=await sharp('dist/assets/jinjia/'+stem+'.webp').metadata();
  check('Full-body image dimensions '+stem,png.width===1024&&png.height===1536&&webp.width===480&&webp.height===720);
  const archived=await fs.readFile('art-source/jinjia/_old/'+stem+'.jpg');
  const previous=execFileSync('git',['show','HEAD:art-source/jinjia/'+stem+'.jpg']);
  check('Original illustration archived '+stem,archived.equals(previous));
 }
}else{
 check('Illustration files unchanged',changedImages.length===0,changedImages);
}
const protectedBefore=JSON.parse((await fs.readFile(path.join(out,'protected-before.json'),'utf8')).replace(/^\uFEFF/,''));
for(const p of protectedBefore){const digest=createHash('sha256').update(await fs.readFile(p.Path)).digest('hex');check('Protected file '+path.basename(p.Path),digest.toUpperCase()===p.Hash);}
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
 const requested=['index.html','city-lab.html','map.html','carriers/ding.html','carriers/dingzhong.html','overview.html','guide.html','guide/pre-festival.html','guide/3.html','rituals.html','people.html','people/bantou.html','neighborhoods/anhai.html','carriers/anhai.html','troupes.html'];
 const names={'index.html':'home','overview.html':'overview','guide.html':'guide','guide/pre-festival.html':'pre-festival','guide/3.html':'guide-3','rituals.html':'rituals','people.html':'people','people/bantou.html':'bantou'};
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});
  for(const file of width===390?files.filter(f=>!['troupes/group-dahan-music.html','404.html'].includes(f)):requested){
   await page.goto(base+'/'+file,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   const metrics=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,h1:document.querySelectorAll('h1').length,tree:document.querySelectorAll('.organization-tree,.tree-canvas').length,noindex:document.querySelector('meta[name="robots"]')?.content,overflow:[...document.querySelectorAll('main *')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&!el.closest('.day-links,.home-map,.wang-map,template,svg');}).slice(0,8).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent.slice(0,80)}))}));
   report.viewports.push({file,width,...metrics});check(`Layout ${width} ${file}`,metrics.scrollWidth<=width&&metrics.bodyWidth<=width&&metrics.h1===1&&metrics.tree===0&&metrics.noindex?.includes('noindex'),metrics);
   if(width===390){
    const contrast=await cardContrast(page);report.contrast.push({file,...contrast});check('Card contrast '+file,contrast.failures.length===0,contrast);
    const screenshot=path.join(out,names[file]?names[file]+'.png':'pages/'+file.replaceAll('/','--').replace('.html','.png'));
    await fullScreenshot(page,screenshot);report.screenshots.push({file,width,path:screenshot});
    check('Images loaded '+file,await page.evaluate(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0)));
   }
   if(!['index.html','map.html','city-lab.html'].includes(file)){
    check('Contents '+file,await page.locator('.article-toc').count()===1);
    check('Related reading '+file,await page.locator('.related-reading').count()===1);
   }
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base);
 await page.locator('.menu-toggle').click();await page.locator('#main-nav a[href="/overview.html"]').click();check('Main menu opens overview',page.url().endsWith('/overview.html'));
 await page.goto(base);await page.locator('.hero-actions a[href="/overview.html"]').click();check('Home opens overview',page.url().endsWith('/overview.html'));
 await page.goto(base);check('Home schedule starts before festival',await page.locator('#home-schedule details').first().getAttribute('data-schedule')==='before');await page.locator('#home-schedule [data-schedule="before"] summary').click();await page.locator('#home-schedule a[href="/guide/pre-festival.html"]').click();check('Home schedule opens pre-festival',page.url().endsWith(preFestivalLink.url));
 check('Standalone pre-festival heading hierarchy',await page.locator('.overview-entry h2').count()===6&&await page.locator('.overview-entry h3').count()===0);
 for(const file of ['rituals.html','rituals/welcoming.html','guide/3.html']){await page.goto(base+'/'+file);check('Flow navigation active '+file,await page.locator('#main-nav a[aria-current]').getAttribute('href')===(file==='rituals.html'?'/rituals.html':'/guide.html'));}
 await page.goto(base+'/overview.html');
 await page.locator('.article-toc a[href="#pre-festival"]').click();check('Overview pre-festival contents',new URL(page.url()).hash==='#pre-festival');
 check('Overview separates pre-festival from eight days',await page.locator('#pre-festival #lottery').count()===1&&await page.locator('#timeline #lottery,#timeline #before,#timeline #after').count()===0&&await page.locator('#timeline #day-1,#timeline #day-8').count()===2);
 await page.locator('#pre-festival a[href="/guide/pre-festival.html"]').click();check('Overview opens pre-festival page',page.url().endsWith(preFestivalLink.url));
 await page.goto(base+'/guide.html');
 await page.locator('.article-toc a[href="#pre-festival"]').click();
 check('Guide pre-festival grouping',await page.locator('#pre-festival .story-card').count()===4&&await page.locator('#festival-days a.story-card[href="/guide/marshal-opening.html"]').count()===0);
 await page.locator('#pre-festival a[href="/guide/pre-festival.html"]').click();check('Guide opens pre-festival page',page.url().endsWith(preFestivalLink.url));
 await page.locator('.flow-switch a[href="/rituals.html"]').click();check('Thirteen procedures grouped separately',await page.locator('#pre-procedures .ritual-stage').count()===5&&await page.locator('#festival-procedures .ritual-stage').count()===8);
 await page.locator('.flow-switch a[href="/guide.html"]').click();check('All flow switches work',page.url().endsWith('/guide.html'));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});await page.goto(base+'/overview.html');
  if(width<1024)await page.locator('.menu-toggle').click();
  const summary=page.locator('.nav-flow summary');await summary.focus();await page.keyboard.press('Enter');
  check('Flow group keyboard opens '+width,await page.locator('.nav-flow').getAttribute('open')!==null);
  check('Flow group no overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.keyboard.press('Escape');check('Flow group Escape '+width,await page.locator('.nav-flow').getAttribute('open')===null&&await summary.evaluate(el=>el===document.activeElement));
  await summary.click();await page.locator('.nav-flow a[href="/guide/pre-festival.html"]').click();check('Main flow group opens new page '+width,page.url().endsWith(preFestivalLink.url));
 }
 await page.setViewportSize({width:390,height:844});
 for(const [file,selector] of [['index.html','.chapter-card'],['overview.html','.overview-entry'],['guide.html','.story-card'],['people.html','.story-card'],['troupes.html','.story-card'],['people/bantou.html','.reading-card']]){
  await page.goto(base+'/'+file);const card=page.locator(selector).first();await card.hover();
  const contrast=await cardContrast(page);check('Hovered card contrast '+file,contrast.failures.length===0,contrast);
  const link=await card.evaluate(el=>el.matches('a'));const focus=link?card:card.locator('a').first();await focus.focus();
  check('Visible card focus '+file,await focus.evaluate(el=>{const s=getComputedStyle(el);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=3;}));
 }
 for(const [number,stages] of Object.entries(dayStages)){await page.goto(base+'/guide/'+number+'.html');for(const n of stages)check(`Day ${number} stage ${n}`,await page.locator(`.flow-context a[href="/rituals.html#stage-${n}"]`).count()===1);}
 await page.goto(base+'/people.html');await page.locator('#role-search').fill('班頭');check('People search',await page.locator('#people-grid .story-card:visible').count()===1);await page.locator('#role-search').fill('不存在的測試職務');check('Search empty state',await page.locator('#no-results').isVisible());await page.locator('#reset-search').click();check('Search reset',await page.locator('#people-grid .story-card:visible').count()===12);
 await page.goto(base+'/troupes.html');await page.locator('#role-search').fill('梓童');check('Crane troupe searchable',await page.locator('#people-grid .story-card:visible').count()===1);
 await page.goto(base+'/map.html?item=jialian');check('Map deep link',await page.locator('#hm-panel').isVisible());check('Crane stays unlocated',!pins.some(p=>p.id.includes('xianlong')));
 for(const width of [320,768]){await page.setViewportSize({width,height:844});await page.goto(base+'/overview.html');await page.locator('.menu-toggle').click();check('Menu no overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.keyboard.press('Escape');check('Menu Escape '+width,await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false');}
 await checkHome3D({browser,base,out,report,check,fullScreenshot,sharp});
 await checkCity({browser,base,out,report,check,sharp});
 check('No runtime errors',report.errors.length===0,report.errors);
}finally{
 await browser.close();report.failed=report.checks.filter(c=>!c.ok);await fs.writeFile(path.join(out,'qa.json'),JSON.stringify(report,null,2));
}
console.log(JSON.stringify({routes:report.routes.length,viewportChecks:report.viewports.length,screenshots:report.screenshots.length,checks:report.checks.length,failed:report.failed},null,2));
if(report.failed.length)process.exitCode=1;
