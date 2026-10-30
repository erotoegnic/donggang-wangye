import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pins,categories} from '../home-map.mjs';
import {articles,articlePath,catalogue} from '../articles.mjs';
import {geography} from '../basemap.mjs';
const donglong=pins.find(p=>p.id==='donglong');
const siteDetails=[['boat','王船','/guide/boat-preparations.html'],['palace','代天府','/guide/invitation-palace.html']].map(([id,title,url])=>({...donglong,id,title,url,related:[],site:'donglong'}));
const pageTitle=url=>articles.find(a=>'/'+articlePath(a)===url)?.title||({'/rituals.html':'一科迎王的十三程序','/kings.html':'歷科大千歲尊姓','/about.html':'認識迎王'}[url])||'迎王故事';
export const scenePins=[...pins,...siteDetails].map((p,i)=>({...Object.fromEntries(['id','title','category','priority','lat','lng','url','site'].map(k=>[k,p[k]])),related:p.related.map(url=>({url,title:pageTitle(url)})),number:String(i+1).padStart(2,'0'),lead:articles.find(a=>'/'+articlePath(a)===p.url)?.lead||'從東隆宮出發，認識溫王信仰、七角頭與迎王科儀。'}));
export const nonpoint=catalogue.find(a=>a.slug==='group-xianlong-cranes');
export {categories};
export async function buildScene(){
 const result=await build({entryPoints:['home3d/ui.js'],bundle:true,minify:true,format:'esm',splitting:true,outdir:'dist/assets/home3d',entryNames:'[name]-[hash]',chunkNames:'chunk-[hash]',metafile:true,target:'es2022',write:false,legalComments:'none'});
 let total=0;for(const f of result.outputFiles){await fs.mkdir('dist/assets/home3d',{recursive:true});await fs.writeFile(f.path,f.contents);total+=gzipSync(f.contents).length;}
 if(total>300*1024)throw Error(`3D JavaScript gzip exceeds 300KB: ${total}`);
 await fs.copyFile('node_modules/three/LICENSE','dist/assets/home3d/LICENSE-three.txt');
 const css=await fs.readFile('home3d/style.css');const name='style-'+createHash('sha256').update(css).digest('hex').slice(0,12)+'.css';await fs.writeFile('dist/assets/home3d/'+name,css);
 const keep=new Set([name,...result.outputFiles.map(f=>path.basename(f.path))]);
 for(const file of await fs.readdir('dist/assets/home3d'))if(/^(ui-|chunk-|style-).+\.(js|css)$/.test(file)&&!keep.has(file))await fs.unlink('dist/assets/home3d/'+file);
 const entry=Object.entries(result.metafile.outputs).find(([,v])=>v.entryPoint==='home3d/ui.js')[0].replaceAll(String.fromCharCode(92),'/').replace(/^dist/,'');
 const poster=await fs.readFile('home3d/poster.webp');const posterName='poster-'+createHash('sha256').update(poster).digest('hex').slice(0,12)+'.webp';await fs.writeFile('dist/assets/home3d/'+posterName,poster);
 const roads=geography.features.filter(f=>['major','bridge'].includes(f.layer)&&f.points.some(([x,y])=>x>120.44&&x<120.475&&y>22.447&&y<22.484)).map(f=>f.points.filter((p,i)=>i===0||i===f.points.length-1||i%3===0));
 const water=geography.features.filter(f=>f.layer==='water'&&f.points.length>150&&f.points.some(([x,y])=>x>120.45&&x<120.49&&y>22.433&&y<22.457)).map(f=>f.points.filter((p,i)=>i%3===0));
 return {js:entry,css:'/assets/home3d/'+name,poster:'/assets/home3d/'+posterName,data:{pins:scenePins,roads,water},gzip:total};
}
