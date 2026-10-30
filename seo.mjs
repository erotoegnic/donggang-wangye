export const siteOrigin=(process.env.SITE_ORIGIN||'').replace(/\/+$/,''); // 原為已下線的 https://donggang-wangye-picturebook.edadcard03.chatgpt.site；未設定 SITE_ORIGIN 時輸出站內相對路徑
export const canonicalURL=file=>siteOrigin+'/'+(file==='index.html'?'':file);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=value=>String(value).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();

export function articleSummary(article){
 const lead=plain(article.lead);
 if(lead.length>=55)return lead;
 const sentences=(article.sections||[]).flatMap(s=>s.paragraphs||[]).flatMap(p=>plain(p).match(/[^。！？]+[。！？]?/g)||[]);
 let result=lead+(/[。！？]$/.test(lead)?'':'。');
 for(const sentence of sentences){
  if(result.includes(sentence))continue;
  if(result.length+sentence.length>165&&result.length>=45)break;
  if(result.length+sentence.length>190)continue;
  result+=sentence;
  if(result.length>=85)break;
 }
 return result;
}

export function seoHead({file,title,description,body}){
 const url=canonicalURL(file),fullTitle=title+'｜東港迎王小旅行';
 const base=`<title>${escape(fullTitle)}</title><meta name="description" content="${escape(description)}">`;
 // robots 統一由 render.mjs 的 head 模板設定，避免 404 出現互相衝突的指令。
 if(file==='404.html')return base;
 const graph=[{'@type':'WebPage','@id':url+'#webpage',url,name:fullTitle,description,inLanguage:'zh-Hant',isPartOf:{'@id':siteOrigin+'/#website'}}];
 if(file==='index.html')graph.unshift({'@type':'WebSite','@id':siteOrigin+'/#website',url:siteOrigin+'/',name:'東港迎王小旅行',inLanguage:'zh-Hant'});
 const nav=body.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
 if(nav){
  const items=[...nav.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<span aria-current="page">([\s\S]*?)<\/span>/g)].map((m,i)=>({'@type':'ListItem',position:i+1,name:plain(m[2]||m[3]),item:m[1]?(siteOrigin?(/^\/(?!\/)/.test(m[1])?siteOrigin+m[1]:new URL(m[1],siteOrigin+'/').href):new URL(m[1],'https://local.invalid').pathname):url}));
  if(items.length>1)graph.push({'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:items});
 }
 const json=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');
 return base+`<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"><meta property="og:locale" content="zh_TW"><meta property="og:site_name" content="東港迎王小旅行"><meta property="og:title" content="${escape(fullTitle)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${siteOrigin}/assets/wangchuan.webp"><meta property="og:image:alt" content="王船經過東隆宮黃金牌樓的繪本插畫"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${json}</script>`;
}

export function sitemap(manifest){
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+manifest.filter(p=>p.file!=='404.html'&&p.file!=='troupes/group-dahan-music.html').map(p=>'  <url><loc>'+escape(canonicalURL(p.file))+'</loc></url>').join('\n')+'\n</urlset>\n';
}
