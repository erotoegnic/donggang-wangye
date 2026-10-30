// 子路徑部署（例如 GitHub Pages 專案網站 https://<user>.github.io/<repo>/）。
// 設定環境變數 BASE_PATH=/donggang-wangye 後，build 結束時會把 dist 內所有站內絕對路徑（/assets/...、/guide.html 等）
// 加上這個前綴：HTML 屬性、srcset、meta refresh、inline style 與 CSS 的 url()、JSON／JSON-LD 資料、JS 內的站內網址。
// 未設定 BASE_PATH（或為 /）時不做任何事，維持原本根目錄部署的輸出。
import fs from 'node:fs/promises';
import path from 'node:path';

export const basePath=(()=>{const raw=(process.env.BASE_PATH||'').trim().replace(/\/+$/,'');if(!raw)return '';return raw.startsWith('/')?raw:'/'+raw;})();

// 「站內絕對路徑」= 以單一斜線開頭（不是 // 協定相對網址）。
const ROOT='\\/(?![\\/\\\\])';
const ATTRS='href|src|action|poster|value|content|formaction|xlink:href|data-[\\w-]+';

export function prefixHTML(html,base){
 if(!base)return html;
 return html
  // meta refresh：content="0;url=/x"
  .replace(new RegExp('(<meta[^>]*http-equiv=["\']?refresh["\']?[^>]*content=["\']\\s*\\d+\\s*;\\s*url=)'+ROOT,'gi'),'$1'+base+'/')
  // srcset / imagesrcset：每個逗號分隔的候選網址
  .replace(/(\s(?:srcset|imagesrcset)=)(["'])([^"']*)\2/gi,(m,a,q,v)=>a+q+v.split(',').map(part=>part.replace(new RegExp('^(\\s*)'+ROOT),'$1'+base+'/')).join(',')+q)
  // 一般屬性
  .replace(new RegExp('(\\s(?:'+ATTRS+')=)(["\'])'+ROOT,'gi'),'$1$2'+base+'/')
  // inline <style> 與 style="" 的 url(/...)
  .replace(new RegExp('(url\\(\\s*(?:&quot;|["\'])?)'+ROOT,'gi'),'$1'+base+'/')
  // <script type="application/json|ld+json"> 內的字串值
  .replace(/(<script[^>]*type=["']?application\/(?:ld\+)?json["']?[^>]*>)([\s\S]*?)(<\/script>)/gi,(m,open,body,close)=>open+prefixJSON(body,base)+close);
}
export const prefixJSON=(text,base)=>!base?text:text.replace(new RegExp('([:\\[,{]\\s*)"'+ROOT,'g'),'$1"'+base+'/');
export const prefixCSS=(css,base)=>!base?css:css.replace(new RegExp('(url\\(\\s*["\']?)'+ROOT,'gi'),'$1'+base+'/');
// JS：只改確定是站內網址的寫法，避免動到正規表示式或第三方函式庫。
export const prefixJS=(js,base)=>!base?js:js
 .replace(new RegExp('(location\\.origin\\s*\\+\\s*)([\'"`])'+ROOT,'g'),'$1$2'+base+'/')
 .replace(new RegExp('(serviceWorker\\.register\\(\\s*)([\'"`])'+ROOT,'g'),'$1$2'+base+'/')
 .replace(new RegExp('(fetch\\(\\s*)([\'"`])'+ROOT,'g'),'$1$2'+base+'/')
 .replace(new RegExp('([\'"`])'+ROOT+'((?:assets|guide|troupes|people|carriers|rituals|neighborhoods)\\/|[\\w-]+\\.(?:html|js|css|json|webmanifest|webp|png|jpe?g|svg|woff2)\\b)','g'),'$1'+base+'/$2');

export async function applyBasePath(dir='dist',base=basePath){
 if(!base)return 0;
 let changed=0;
 for(const rel of await fs.readdir(dir,{recursive:true})){
  const file=path.join(dir,rel),ext=path.extname(file).toLowerCase();
  const fn={'.html':prefixHTML,'.htm':prefixHTML,'.svg':prefixHTML,'.css':prefixCSS,'.js':prefixJS,'.mjs':prefixJS,'.json':prefixJSON,'.webmanifest':prefixJSON}[ext];
  if(!fn||!(await fs.stat(file)).isFile())continue;
  const before=await fs.readFile(file,'utf8'),after=fn(before,base);
  if(after!==before){await fs.writeFile(file,after);changed++;}
 }
 console.log(`BASE_PATH=${base}: rewrote ${changed} files.`);
 return changed;
}
