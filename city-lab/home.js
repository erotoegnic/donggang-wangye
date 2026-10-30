// 首頁第一屏的街區微縮模型。共用 city-lab 的 scene.js；three.js 等到頁面載入後才動態載入。
const root=document.querySelector('.home-city');
if(root){
const stage=root.querySelector('.city-stage'),info=root.querySelector('.home-city-info'),status=root.querySelector('.home-city-status');
const places=JSON.parse(root.querySelector('#home-city-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer:coarse)'),narrow=matchMedia('(max-width:760px)');
const touchMode=()=>narrow.matches||coarse.matches;
let scene=null,source=null,time='day',selected=null,playing=!touchMode()&&!reduced.matches;
const timeLabel={day:'白天',dusk:'黃昏',night:'夜晚'};
const motion=root.querySelector('[data-motion]'),interact=root.querySelector('[data-interact]');
function syncMotion(){motion.setAttribute('aria-pressed',String(playing));motion.textContent=playing?'暫停漁船':'播放漁船';scene?.setMotion(playing);}
motion.addEventListener('click',()=>{playing=!playing;syncMotion();});syncMotion();
function select(id,button){const p=places.find(p=>p.id===id);if(!p)return;selected=id;source=button;info.hidden=false;info.querySelector('h2').textContent=p.title;info.querySelector('p').textContent=p.copy;const link=info.querySelector('a');link.href=p.url;link.textContent=p.link+' ↗';stage.dataset.selected=id;scene?.focus(id);status.textContent='已選取'+p.title;info.querySelector('h2').focus({preventScroll:true});}
function close(){selected=null;info.hidden=true;delete stage.dataset.selected;scene?.reset();const back=source?.isConnected&&source.getClientRects().length&&getComputedStyle(source).visibility!=='hidden'?source:root.querySelector('[data-reset]');back.focus({preventScroll:true});}
root.querySelector('[data-close]').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!info.hidden)close();});
for(const b of root.querySelectorAll('button[data-time]'))b.addEventListener('click',()=>{time=b.dataset.time;scene?.setTime(time);for(const o of root.querySelectorAll('button[data-time]'))o.setAttribute('aria-pressed',String(o===b));status.textContent=timeLabel[time]+'的東港街區';});
root.querySelector('[data-reset]').addEventListener('click',()=>{selected=null;info.hidden=true;delete stage.dataset.selected;scene?.reset();});
for(const b of root.querySelectorAll('[data-zoom]'))b.addEventListener('click',()=>scene?.zoom(b.dataset.zoom==='in'?1.2:1/1.2));
interact.addEventListener('click',()=>{const on=interact.getAttribute('aria-pressed')!=='true';stage.dataset.userInteractive=String(on);interact.setAttribute('aria-pressed',String(on));interact.textContent=on?'結束操作':'操作模型';scene?.setInteractive(on);});
// 滑鼠滾輪留給頁面捲動；按住 Ctrl（或觸控板雙指縮放）才縮放模型。
stage.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)e.stopPropagation();},{capture:true});
function fallback(){scene?.dispose?.();scene=null;stage.dataset.state='fallback';root.dataset.state='fallback';status.textContent='這台裝置暫時無法顯示立體模型，可以往下閱讀東港的故事，或打開平面地圖。';root.querySelectorAll('button[data-time],[data-reset],[data-zoom],[data-interact],[data-motion]').forEach(b=>b.disabled=true);}
async function start(){
 try{
  if(navigator.connection?.saveData){fallback();return;}
  const probe=document.createElement('canvas'),gl=probe.getContext('webgl2');if(!gl){fallback();return;}gl.getExtension('WEBGL_lose_context')?.loseContext();
  const [{createScene},world]=await Promise.all([import('./scene.js'),fetch(stage.dataset.world).then(r=>{if(!r.ok)throw Error('world '+r.status);return r.json();})]);
  scene=await createScene(stage,places,select,fallback,world);scene.setTime(time);syncMotion();if(selected)scene.focus(selected);root.dataset.state='ready';
  if(time==='day')status.textContent=touchMode()?'點廟看介紹，按「操作模型」可拖曳縮放。':'拖曳轉個角度，點廟看介紹。';
 }catch(error){console.warn('City scene unavailable:',error);fallback();}
}
const later=()=>('requestIdleCallback' in window?requestIdleCallback(start,{timeout:1200}):setTimeout(start,200));
if(document.readyState==='complete')later();else addEventListener('load',later,{once:true});
}
