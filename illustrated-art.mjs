import {rasterArt} from './raster-art-data.mjs';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const assets=new Map();
const byContent=new Map();
const aliases={logo:'boat',person:'carrier-white',chief:'grand-chief',temple:'temple-donglong',mask:'wudu',map:'temple-ding',calendar:'flag',book:'blessing',leaf:'blessing',wave:'boat',drum:'night',send:'boat',sails:'flag'};
const safe=v=>String(v).replace(/["<>]/g,'');
function asset(name,path){
 const bytes=readFileSync(new URL(path,import.meta.url));
 const digest=createHash('sha256').update(bytes).update('lossless-webp-v1').digest('hex').slice(0,12);
 if(byContent.has(digest))return byContent.get(digest);
 const file='original-cutout-'+name+'-'+digest+'.webp';
 const result={bytes,file,url:'/assets/'+file};assets.set(file,result);byContent.set(digest,result);return result;
}
const files=new Map(Object.entries(rasterArt).map(([name,a])=>[name,{
 still:asset(name,a.still),base:asset(name+'-base',a.base||a.still),
 parts:a.parts.map(p=>({...p,asset:asset(name+'-'+p.name,p.path)}))
}]));
const layer=(a,lazy)=>'<img src="'+a.url+'" width="270" height="270" alt="" decoding="async"'+(lazy?' loading="lazy"':'')+' draggable="false">';
function drawing(name,animated=false,lazy=false){
 const f=files.get(name);if(!f)return '';
 if(!animated)return '<span class="original-vector art-'+name+'">'+layer(f.still,lazy)+'</span>';
 return '<span class="original-vector art-'+name+'">'+layer(f.base)+f.parts.map(p=>'<span class="art-part art-'+p.name+'" style="transform-origin:'+(p.pivot[0]/1.8)+'% '+(p.pivot[1]/1.8)+'%">'+layer(p.asset)+'</span>').join('')+'</span>';
}
export function artIcon(name='boat',cls='icon',options={}){
 const resolved=aliases[name]||name,animated=!!options.animated;
 const lazy=/^(card-icon|chapter-art|count-art)$/.test(cls);
 const content=motion=>resolved==='qibaye'?'<span class="art-pair art-pair-first">'+drawing('seventh',motion,lazy)+'</span><span class="art-pair art-pair-second">'+drawing('eighth',motion,lazy)+'</span>':drawing(rasterArt[resolved]?resolved:'boat',motion,lazy);
 return '<span class="'+safe(cls)+' illustrated-art'+(animated?' art-animated':'')+'" data-vector-art="'+safe(resolved)+'" data-art-source="original-cutout" aria-hidden="true"><span class="art-still">'+content(false)+'</span>'+(animated?'<template data-art-animation><span class="art-live">'+content(true)+'</span></template>':'')+'</span>';
}
export function takeArtSprite(){return '';}
export function artStillURL(name){return files.get(aliases[name]||name)?.still.url||'';}
export const artSprite=takeArtSprite;
export async function writeArtAssets(directory){
 await fs.mkdir(directory,{recursive:true});const keep=new Set(assets.keys());
 for(const name of await fs.readdir(directory)){
  if(/^original-(?:art|cutout)-.*-[a-f0-9]{12}\.(?:svg|webp|png)$/.test(name)&&!keep.has(name))await fs.unlink(directory+'/'+name);
 }
 for(const f of assets.values()){
  try{await fs.access(directory+'/'+f.file);}catch{await sharp(f.bytes).webp({lossless:true,effort:4}).toFile(directory+'/'+f.file);}
 }
 await sharp(files.get('boat').still.bytes).resize(48,48).png().toFile(directory+'/favicon.png');
}
export function heroArt(){return '<div class="illustrated-hero art-animated" aria-hidden="true"><div class="hero-art-temple">'+artIcon('temple-donglong','hero-temple',{animated:true})+'</div><div class="hero-art-boat">'+artIcon('boat-vessel','hero-boat',{animated:true})+'</div><div class="hero-art-carriers">'+['blue','white','purple','green','black','pink','yellow'].map(c=>artIcon('carrier-'+c,'hero-carrier',{animated:true})).join('')+'</div><div class="hero-art-lantern">'+artIcon('lantern','hero-lantern',{animated:true})+'</div></div>';}

