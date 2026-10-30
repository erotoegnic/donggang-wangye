import './render.mjs';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {buildCity} from './city-lab/build.mjs';

await fs.mkdir('dist/assets/jinjia',{recursive:true});
const goldenPortraits=(await fs.readdir('art-source/jinjia')).filter(name=>/^jinjia-[0-9]{2}-[a-z]+[.]png$/.test(name)).sort();
if(goldenPortraits.length!==13)throw Error('Expected 13 full-body golden marshal portraits, got '+goldenPortraits.length);
for(const name of goldenPortraits){
 const source='art-source/jinjia/'+name;
 const {width,height}=await sharp(source).metadata();
 if(width!==1024||height!==1536)throw Error('Expected 1024x1536 portrait: '+name);
 await sharp(source).resize(480,720,{fit:'inside'}).webp({quality:84,effort:6}).toFile('dist/assets/jinjia/'+name.replace(/\.png$/,'.webp'));
}
await fs.mkdir('dist/assets/24si',{recursive:true});
const civilPortraits=(await fs.readdir('art-source/24si')).filter(name=>/^24si-(?:[0-9]{2}-[a-z]+|xie|fan)[.]png$/.test(name)).sort();
if(civilPortraits.length!==26)throw Error('Expected 26 full-body portraits, got '+civilPortraits.length);
for(const name of civilPortraits){
 await sharp('art-source/24si/'+name).resize(480,720,{fit:'inside'}).webp({quality:84,effort:6}).toFile('dist/assets/24si/'+name.replace(/\.(jpg|png)$/,'.webp'));
}
execFileSync(process.env.PYTHON || 'python',['optimize-assets.py'],{stdio:'inherit'});
await buildCity();
// public/ 內是不由程式產生的靜態檔（config.js、首頁王船插畫、字型授權），原本只存在於提交的 dist；這裡複製進 dist，讓乾淨環境也能完整 build。
await fs.cp('public','dist',{recursive:true});
// 子路徑部署（GitHub Pages 專案網站）：BASE_PATH=/donggang-wangye 時把 dist 站內絕對路徑加前綴，並放 .nojekyll。
const {applyBasePath,basePath}=await import('./base-path.mjs');
await applyBasePath('dist',basePath);
await fs.writeFile('dist/.nojekyll','');
