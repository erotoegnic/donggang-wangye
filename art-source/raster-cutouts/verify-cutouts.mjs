import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {rasterArt} from '../../raster-art-data.mjs';
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {chromium}=require('C:/Users/eroto/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const source=await sharp(path.join(root,'art-source/donggang-original-map.jpg')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
let mismatch=0,recompositionMismatch=0,visible=0;
for(const [name,a] of Object.entries(rasterArt)){
 const still=await sharp(path.join(root,a.still)).ensureAlpha().raw().toBuffer();
 const base=await sharp(path.join(root,a.base)).ensureAlpha().raw().toBuffer();
 for(const p of a.parts){const part=await sharp(path.join(root,p.path)).ensureAlpha().raw().toBuffer();for(let i=0;i<part.length;i+=4)if(part[i+3])part.copy(base,i,i,i+4);}
 for(let y=0;y<a.canvasSize;y++)for(let x=0;x<a.canvasSize;x++){
  const i=(y*a.canvasSize+x)*4;
  if(still[i+3]){visible++;const j=((a.sourceBox[1]+y-a.sourceOffset[1])*source.info.width+a.sourceBox[0]+x-a.sourceOffset[0])*4;for(let c=0;c<3;c++)if(still[i+c]!==source.data[j+c])mismatch++;}
  for(let c=0;c<4;c++)if(base[i+c]!==still[i+c])recompositionMismatch++;
 }
}
const png=async file=>'data:image/png;base64,'+(await fs.readFile(path.join(root,file))).toString('base64');
let html='<style>body{margin:0;background:#fffcf6;font:14px sans-serif;color:#3e3a39}.grid{display:grid;grid-template-columns:repeat(7,180px)}.cell{height:220px}.art{position:relative;width:180px;height:180px}.art img{position:absolute;width:180px;height:180px}p{margin:8px;text-align:center}</style><div class="grid">';
for(const pose of [0,1,-1])for(const [name,a] of Object.entries(rasterArt).filter(([n])=>n.startsWith('carrier-'))){
 html+=`<div class="cell"><p>${name} / ${pose}</p><div class="art"><img src="${await png(a.base)}">`;
 for(const p of a.parts){const degrees=pose*(p.name.includes('leg')?3:p.name.includes('left')?5:-7);html+=`<img src="${await png(p.path)}" style="transform-origin:${p.pivot[0]}px ${p.pivot[1]}px;transform:rotate(${degrees}deg)">`;}
 html+='</div></div>';
}
html+='</div>';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1260,height:660}});await page.setContent(html);await page.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>i.decode())));await page.screenshot({path:path.join(here,'motion-poses.png')});await browser.close();
const result={assets:Object.keys(rasterArt).length,parts:Object.values(rasterArt).reduce((n,a)=>n+a.parts.length,0),visiblePixels:visible,savedPngSourceRgbMismatch:mismatch,savedPngRestRecompositionMismatch:recompositionMismatch};await fs.writeFile(path.join(here,'saved-png-verification.json'),JSON.stringify(result,null,2));console.log(result);if(mismatch||recompositionMismatch)process.exitCode=1;
