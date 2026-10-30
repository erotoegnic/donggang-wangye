// 掃描 dist：確認子路徑部署沒有漏掉的站內絕對路徑、站內連結都指得到檔案、沒有 chatgpt.site。
// 用法：BASE_PATH=/donggang-wangye node tools/check-base-path.mjs [dist]
import fs from 'node:fs/promises';
import path from 'node:path';
const dir=process.argv[2]||'dist';
const base=(process.env.BASE_PATH||'').replace(/\/+$/,'');
if(!base)throw Error('請設定 BASE_PATH，例如 BASE_PATH=/donggang-wangye');
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const B=esc(base.slice(1));
// 以單一斜線開頭、但不是 base 前綴的路徑
const BAD=`\\/(?![\\/\\\\])(?!${B}(?:[\\/"'#?)\\s&]|$))`;
const vendor=/(^|\/)chunk-(3GEBB2HK|QXRAVRNB)\.js$|LICENSE/; // 打包進來的 three.js
const rules={
 html:[
  ['attr',new RegExp(`\\s(?:href|src|action|poster|value|content|formaction|xlink:href|data-[\\w-]+)=["']${BAD}`,'gi')],
  ['srcset',new RegExp(`\\s(?:srcset|imagesrcset)=["'][^"']*(?:^|,|["'])\\s*${BAD}`,'gi')],
  ['meta-refresh',new RegExp(`url=${BAD}`,'gi')],
  ['css-url',new RegExp(`url\\(\\s*(?:&quot;|["'])?${BAD}`,'gi')],
  ['json',new RegExp(`[:\\[,{]\\s*"${BAD}`,'g')],
 ],
 css:[['css-url',new RegExp(`url\\(\\s*["']?${BAD}`,'gi')]],
 js:[
  ['js-origin',new RegExp(`location\\.origin\\s*\\+\\s*['"\`]${BAD}`,'g')],
  ['js-path',new RegExp(`['"\`]${BAD}(?:(?:assets|guide|troupes|people|carriers|rituals|neighborhoods)\\/|[\\w-]+\\.(?:html|js|css|json|webmanifest|webp|png|jpe?g|svg|woff2)\\b|\\?|['"\`])`,'g')],
  ['sw/manifest',new RegExp(`(?:serviceWorker\\.register|fetch|importScripts)\\(\\s*['"\`]${BAD}`,'g')],
 ],
 json:[['json',new RegExp(`[:\\[,{]\\s*"${BAD}`,'g')]],
};
const kind={'.html':'html','.svg':'html','.css':'css','.js':'js','.mjs':'js','.json':'json','.webmanifest':'json'};
const problems=[];let files=0,links=0;const missing=new Set();
const all=(await fs.readdir(dir,{recursive:true})).map(f=>f.split(path.sep).join('/'));
const exists=new Set(all);
for(const rel of all){
 const file=path.join(dir,rel);if(!(await fs.stat(file)).isFile())continue;
 const ext=path.extname(rel).toLowerCase();
 if(!['.html','.svg','.css','.js','.mjs','.json','.webmanifest','.txt','.xml'].includes(ext))continue;
 const text=await fs.readFile(file,'utf8');files++;
 for(const m of text.matchAll(/chatgpt\.site/gi))problems.push([rel,'chatgpt.site',text.slice(Math.max(0,m.index-40),m.index+40)]);
 const k=kind[ext];if(!k||(k==='js'&&vendor.test(rel)))continue;
 for(const [name,re] of rules[k])for(const m of text.matchAll(re)){if(name==='js-path'&&/key\s*===?\s*$/.test(text.slice(Math.max(0,m.index-12),m.index)))continue;problems.push([rel,name,text.slice(Math.max(0,m.index-30),m.index+60)]);}
 // 連結檢查：所有帶 base 前綴的站內路徑都要對應到 dist 內的檔案
 if(k==='html'||k==='css'){
  for(const m of text.matchAll(new RegExp(`(?:href|src|content|value|url=|srcset)=?["']?\\(?\\s*(${esc(base)}\\/[^"'\\s)>,]*)|url\\(\\s*["']?(${esc(base)}\\/[^"'\\s)]*)|"(${esc(base)}\\/[^"\\s]*)"`,'g'))){
   let p=(m[1]||m[2]||m[3]).slice(base.length+1).replace(/[?#].*$/,'').replace(/&amp;.*/,'');
   p=decodeURI(p);links++;
   const ok=p===''||exists.has(p)||exists.has(p.replace(/\/$/,'')+'/index.html')||exists.has(p+'.html');
   if(!ok)missing.add(rel+' -> '+base+'/'+p);
  }
 }
}
console.log(`掃描 ${files} 個文字檔、檢查 ${links} 個站內連結。`);
for(const [f,r,ctx] of problems.slice(0,80))console.log(`✗ [${r}] ${f}: …${ctx.replace(/\s+/g,' ')}…`);
for(const m of [...missing].slice(0,80))console.log('✗ [missing] '+m);
if(!exists.has('.nojekyll'))problems.push(['.nojekyll','missing','']),console.log('✗ 缺少 .nojekyll');
if(!exists.has('404.html'))problems.push(['404.html','missing','']),console.log('✗ 缺少 404.html');
if(problems.length||missing.size){console.log(`失敗：${problems.length} 個路徑問題、${missing.size} 個找不到的連結。`);process.exit(1);}
console.log('通過：沒有漏掉的站內絕對路徑，沒有 chatgpt.site，.nojekyll 與 404.html 都在。');
