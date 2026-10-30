(()=>{
'use strict';
const root=document.querySelector('#home-map');if(!root)return;
const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)];
const data=JSON.parse($('#hm-data').textContent),stage=$('.hm-stage'),world=$('.hm-world'),panel=$('#hm-panel'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
const pins=data.pins.map(p=>({...p,button:$(`[data-pin="${p.id}"]`)})),labels=$$('.hm-labels>span').map(el=>({el,xy:el.dataset.xy.split(',').map(Number),priority:+el.dataset.priority}));
let camera={x:0,y:0,z:1},fit=1,frame=0,selected=null,lastPin=null,moved=false,snap=0;
let category='all',phase='',composing=false,resultIndex=-1,results=[];
let motion=0,motionTarget=null,walk=-1,walkTimer=0,coachStep=0,coachFocus=null,sample=null,velocity=[0,0];
const search=$('#hm-search'),resultList=$('#hm-results'),phaseSelect=$('#hm-phase'),index=JSON.parse($('#home-map-index').textContent);
const pool=[...pins.map(p=>({t:p.title,k:p.aliases.join(' '),u:p.url,m:p.id})),...index];
const normal=s=>s.toLocaleLowerCase().replace(/\s+/g,'');
const matches=p=>(category==='all'||p.category===category||p.extraCategories.includes(category))&&(!phase||p.phases.includes(phase));
const pointers=new Map();let gesture=null;
const toolbar=$('.hm-topbar'),searchToggle=$('.hm-search-toggle');
let mode=root.dataset.mode==='2d'?'2d':'3d';
const modeButton=$('[data-mode-toggle]');
modeButton.textContent=mode.toUpperCase();
modeButton.setAttribute('aria-pressed',String(mode==='3d'));
modeButton.setAttribute('aria-label',mode==='3d'?'切換至2D俯視地圖':'切換至3D立體地圖');
const tilt=40*Math.PI/180,depth=1200;
function projectPoint(x,y){if(mode==='2d')return [x,y];const cx=stage.clientWidth/2,cy=stage.clientHeight/2,v=y-cy,k=1-v*Math.sin(tilt)/depth;return [cx+(x-cx)/k,cy+v*Math.cos(tilt)/k];}
function unprojectPoint(x,y){if(mode==='2d')return [x,y];const cx=stage.clientWidth/2,cy=stage.clientHeight/2,v=(y-cy)/(Math.cos(tilt)+(y-cy)*Math.sin(tilt)/depth),k=1-v*Math.sin(tilt)/depth;return [cx+(x-cx)*k,cy+v];}
function searchPanel(open,focus=true){toolbar.hidden=!open;searchToggle.setAttribute('aria-expanded',String(open));if(!open)hideResults();if(focus)(open?search:searchToggle).focus({preventScroll:true});}
searchToggle.addEventListener('click',()=>searchPanel(toolbar.hidden));
$('[data-search-close]').addEventListener('click',()=>searchPanel(false));
$('[data-mode-toggle]').addEventListener('click',()=>{mode=mode==='3d'?'2d':'3d';root.dataset.mode=mode;const b=$('[data-mode-toggle]');b.textContent=mode.toUpperCase();b.setAttribute('aria-pressed',String(mode==='3d'));b.setAttribute('aria-label',mode==='3d'?'切換至2D俯視地圖':'切換至3D立體地圖');schedule();});
function hide(el,value){if(el.hidden!==value)el.hidden=value;}
function measureLabels(){
 const entries=[...pins.flatMap(p=>[p.button,p.button.querySelector('.hm-pin-name')]),...labels.map(l=>l.el)],hidden=entries.map(el=>el.hidden);entries.forEach(el=>hide(el,false));
 for(const p of pins){p.name=p.button.querySelector('.hm-pin-name');p.w=p.name.offsetWidth-(p.id===selected?4:0);p.h=p.name.offsetHeight-(p.id===selected?4:0);}
 for(const l of labels){l.w=l.el.offsetWidth;l.h=l.el.offsetHeight;}
 entries.forEach((el,i)=>hide(el,hidden[i]));
}
function draw(){
 frame=0;const {x,y,z}=camera,width=stage.clientWidth,height=stage.clientHeight,level=z/fit>=6?3:z/fit>=2.5?2:1;
 world.style.transform=`translate3d(${x}px,${y}px,0) scale(${z})`;
 root.classList.toggle('z-low',level===1);root.classList.toggle('z-mid',level===2);root.classList.toggle('z-high',level===3);
 for(const p of pins){[p.px,p.py]=projectPoint(x+p.xy[0]*z,y+p.xy[1]*z);const visible=(matches(p)||p.id===selected)&&p.px>=16&&p.px<=width-16&&p.py>=20&&p.py<=height+20;hide(p.button,!visible);p.button.tabIndex=visible?0:-1;if(visible)p.button.style.transform=`translate3d(${p.px}px,${p.py}px,0)`;p.show=visible&&(p.id===selected||p.priority<=level);}
 for(const l of labels){[l.px,l.py]=projectPoint(x+l.xy[0]*z,y+l.xy[1]*z);l.show=l.px>=20&&l.px<=width-20&&l.py>=20&&l.py<=height-20&&l.priority<=level;if(l.show)l.el.style.transform=`translate3d(${l.px}px,${l.py}px,0)`;}
 collide(width,height);
}
function collide(width,height){
 const size=p=>p.id==='donglong'?(root.classList.contains('z-low')?64:80):(root.classList.contains('z-low')?44:56);
 const occupied=pins.filter(p=>!p.button.hidden).map(p=>({id:p.id,priority:p.priority,left:p.px-size(p)*.3,right:p.px+size(p)*.3,top:p.py-size(p)*.8,bottom:p.py}));
 const stageRect=stage.getBoundingClientRect();
 for(const el of [$('.hm-map-heading'),toolbar,panel,$('.hm-controls'),$('.hm-read-arrow')]){if(!el||el.hidden||getComputedStyle(el).visibility==='hidden')continue;const r=el.getBoundingClientRect();occupied.push({left:r.left-stageRect.left,right:r.right-stageRect.left,top:r.top-stageRect.top,bottom:r.bottom-stageRect.top});}
 const overlaps=(r,id,priority=3)=>occupied.some(b=>b.id!==id&&!(priority===1&&b.priority>1)&&r.left<b.right+4&&r.right>b.left-4&&r.top<b.bottom+4&&r.bottom>b.top-4);
 for(const p of [...pins].sort((a,b)=>(b.id===selected)-(a.id===selected)||a.priority-b.priority)){
  if(!p.show){hide(p.name,true);continue;}const w=p.w,h=p.h,n=size(p),left=Math.max(8,Math.min(width-w-8,p.px-w/2));
  const candidates=[p.py+8,p.py-n*.85-h-4,p.py+40,p.py-n*.85-h-36,p.py+72,p.py-n*.85-h-68,p.py+104];let r;
  for(const top of candidates){const box={left,right:left+w,top,bottom:top+h};if(top>=8&&box.bottom<=height-28&&!overlaps(box,p.id,p.priority)){r=box;break;}}
  if(!r&&p.id===selected){const top=Math.max(64,Math.min(height-h-32,p.py+8));r={left,right:left+w,top,bottom:top+h};}
  hide(p.name,!r);p.button.style.zIndex=p.id===selected?'5':p.priority===1?'4':'2';
  if(r){p.name.style.left=(r.left-p.px+n/2)+'px';p.name.style.top=(r.top-p.py+n*.85)+'px';occupied.push({...r,id:'label-'+p.id});}
 }
 for(const l of labels){if(!l.show){hide(l.el,true);continue;}const r={left:l.px-l.w/2,right:l.px+l.w/2,top:l.py-l.h/2,bottom:l.py+l.h/2},blocked=r.left<8||r.right>width-8||overlaps(r,null);hide(l.el,blocked);if(!blocked)occupied.push(r);}
}
function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
function clamp(){camera.z=Math.max(fit*.75,Math.min(fit*40,camera.z));camera.x=Math.max(32-data.width*camera.z,Math.min(stage.clientWidth-32,camera.x));camera.y=Math.max(32-data.height*camera.z,Math.min(stage.clientHeight-32,camera.y));schedule();}
function cancelMotion(){cancelAnimationFrame(motion);motion=0;motionTarget=null;}
function moveCamera(target,duration=600){cancelMotion();if(reduce.matches){camera=target;clamp();return;}motionTarget=target;const from={...camera},start=performance.now();function tick(now){const t=Math.min(1,(now-start)/duration),ease=1-(1-t)**3;camera={x:from.x+(target.x-from.x)*ease,y:from.y+(target.y-from.y)*ease,z:from.z+(target.z-from.z)*ease};clamp();if(t<1)motion=requestAnimationFrame(tick);else{motion=0;motionTarget=null;}}motion=requestAnimationFrame(tick);}
function reset(animated=true){
 const core=pins.filter(p=>p.priority<=2),xs=core.map(p=>p.xy[0]),ys=core.map(p=>p.xy[1]),x1=Math.min(...xs),x2=Math.max(...xs),y1=Math.min(...ys),y2=Math.max(...ys);
 fit=Math.min((stage.clientWidth-64)/(x2-x1+64),(stage.clientHeight-144)/(y2-y1+96));
 const [cx,cy]=unprojectPoint(stage.clientWidth/2,stage.clientHeight*.48),[edgeX]=unprojectPoint(0,0);
 fit=Math.max(fit,(cx-edgeX)/((x1+x2)/2));
 const target={z:fit,x:cx-(x1+x2)/2*fit,y:cy-(y1+y2)/2*fit};
 if(animated)moveCamera(target);else{cancelMotion();camera=target;schedule();}
}
function zoom(factor,cx=stage.clientWidth/2,cy=stage.clientHeight/2){const next=Math.max(fit*.75,Math.min(fit*40,camera.z*factor)),ratio=next/camera.z;camera.x=cx-(cx-camera.x)*ratio;camera.y=cy-(cy-camera.y)*ratio;camera.z=next;clamp();}
function fly(p){const mobile=innerWidth<=760,z=fit*2.8,[cx,cy]=unprojectPoint(stage.clientWidth*(mobile?.5:.35),stage.clientHeight*(mobile?.38:.5));moveCamera({z,x:cx-p.xy[0]*z,y:cy-p.xy[1]*z});}
function writeItem(id,mode='pushState'){const url=new URL(location.href);if(id)url.searchParams.set('item',id);else url.searchParams.delete('item');history[mode]({hmItem:id},'',url);}
function close(write=true,focus=true){const old=selected;selected=null;panel.hidden=true;panel.querySelector('.hm-panel-content').replaceChildren();pins.forEach(p=>p.button.setAttribute('aria-expanded','false'));if(write)writeItem(null);if(focus&&!old)stage.focus({preventScroll:true});if(focus&&old){const p=pins.find(p=>p.id===old);if(p){p.button.hidden=false;p.button.focus({preventScroll:true});}}schedule();}
function open(id,write=true){const p=pins.find(p=>p.id===id);if(!p)return;selected=id;lastPin=p.button;searchPanel(false,false);hideResults();panel.querySelector('.hm-panel-content').replaceChildren($('#hm-card-'+id).content.cloneNode(true));panel.hidden=false;snap=0;panel.dataset.snap='0';$('.hm-handle').setAttribute('aria-expanded','false');$('.hm-panel-content').scrollTop=0;pins.forEach(p=>p.button.setAttribute('aria-expanded',String(p.id===id)));fly(p);if(write)writeItem(id);$('#hm-card-title').focus({preventScroll:true});}
function showPhase(){
 document.querySelectorAll('[data-schedule]').forEach(el=>el.open=el.dataset.schedule===phase);
 $('.hm-phase-jump').hidden=!phase;
}
function applyFilters(){const count=pins.filter(matches).length;$$('[data-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cat===category)));phaseSelect.value=phase;$('.hm-count').textContent=`顯示 ${count} 個地點`;$('.hm-empty').hidden=count>0;showPhase();schedule();}
function writeFilters(){const url=new URL(location.href);if(!selected)url.searchParams.delete('item');for(const [key,value]of [['cat',category==='all'?'':category],['phase',phase]]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}history.replaceState(history.state,'',url);}
function readURL(){const params=new URLSearchParams(location.search);category=$$('[data-cat]').some(b=>b.dataset.cat===params.get('cat'))?params.get('cat'):'all';phase=$('#hm-phase-'+params.get('phase'))?params.get('phase'):'';applyFilters();const id=params.get('item');if(pins.some(p=>p.id===id))open(id,false);else{close(false,false);if(phase)showPhase();}}
function hideResults(){resultList.hidden=true;search.setAttribute('aria-expanded','false');search.removeAttribute('aria-activedescendant');resultIndex=-1;}
function searchResults(){if(composing)return;const query=normal(search.value.trim()),seen=new Set();results=query?pool.filter(r=>normal(r.t+' '+r.k).includes(query)).filter(r=>{const key=r.m||r.u;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,10):[];resultList.replaceChildren();resultIndex=-1;search.removeAttribute('aria-activedescendant');applyFilters();if(!query){hideResults();return;}for(const [i,r]of results.entries()){const option=document.createElement('div');option.id='hm-result-'+i;option.role='option';option.setAttribute('aria-selected','false');option.textContent=r.t+(r.k?' · '+r.k:'');option.addEventListener('pointerdown',e=>e.preventDefault());option.addEventListener('click',()=>choose(r));resultList.append(option);}resultList.hidden=results.length===0;search.setAttribute('aria-expanded',String(results.length>0));$('.hm-empty').hidden=results.length>0;if(!results.length)$('.hm-count').textContent='沒有符合的地點，換個關鍵字或按全部';}
function choose(r){hideResults();if(r.m){const p=pins.find(p=>p.id===r.m);if(!matches(p)){category='all';phase='';applyFilters();writeFilters();}open(r.m);}else location.assign(r.u);}
search.addEventListener('compositionstart',()=>composing=true);search.addEventListener('compositionend',()=>{composing=false;searchResults();});search.addEventListener('input',e=>{if(!e.isComposing)searchResults();});
search.addEventListener('keydown',e=>{if(e.isComposing||composing)return;if(e.key==='Escape'){searchPanel(false);e.stopPropagation();}else if(['ArrowDown','ArrowUp'].includes(e.key)&&results.length){e.preventDefault();resultIndex=(resultIndex+(e.key==='ArrowDown'?1:-1)+results.length)%results.length;[...resultList.children].forEach((el,i)=>el.setAttribute('aria-selected',String(i===resultIndex)));search.setAttribute('aria-activedescendant','hm-result-'+resultIndex);resultList.children[resultIndex].scrollIntoView({block:'nearest'});}else if(e.key==='Enter'&&results.length){e.preventDefault();choose(results[Math.max(0,resultIndex)]);}});
document.addEventListener('click',e=>{if(!e.target.closest('.hm-topbar'))hideResults();});
$$('[data-cat]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.cat;search.value='';hideResults();if(category==='all')phase='';close(false,false);applyFilters();writeFilters();reset();if(phase)showPhase();}));
phaseSelect.addEventListener('change',()=>{phase=phaseSelect.value;close(false,false);applyFilters();writeFilters();reset();if(phase)showPhase();});
root.addEventListener('click',async e=>{const copy=e.target.closest('[data-copy]');if(!copy)return;const url=location.origin+'/?item='+encodeURIComponent(copy.dataset.copy),status=$('.hm-copy-status'),fallback=$('.hm-copy-fallback');try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(url);status.textContent='已複製連結';}catch{fallback.hidden=false;fallback.value=url;fallback.focus();fallback.select();status.textContent='複製這一項的連結';}});
pins.forEach(p=>p.button.addEventListener('click',e=>{e.stopPropagation();if(!moved||e.detail===0)open(p.id);}));
root.addEventListener('click',e=>{if(e.target.closest('[data-close]')){const phaseCard=!selected;close();if(phaseCard){category='all';phase='';applyFilters();writeFilters();reset();}}});
let handleDragged=false;
$('.hm-handle').addEventListener('click',()=>{if(handleDragged){handleDragged=false;return;}snap=(snap+1)%3;panel.dataset.snap=String(snap);$('.hm-handle').setAttribute('aria-expanded',String(snap>0));});
let handleY=0;$('.hm-handle').addEventListener('pointerdown',e=>{handleDragged=false;handleY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId);});$('.hm-handle').addEventListener('pointerup',e=>{if(Math.abs(e.clientY-handleY)>30){handleDragged=true;if(e.clientY>handleY&&snap===0){close();return;}snap=Math.max(0,Math.min(2,snap+(e.clientY<handleY?1:-1)));panel.dataset.snap=String(snap);$('.hm-handle').setAttribute('aria-expanded',String(snap>0));e.preventDefault();}});
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view==='reset'){close();reset();}else zoom(b.dataset.view==='in'?1.5:1/1.5);}));
function local(e){const r=stage.getBoundingClientRect();return unprojectPoint(e.clientX-r.left,e.clientY-r.top);}
stage.addEventListener('wheel',e=>{e.preventDefault();const [x,y]=local(e);zoom(Math.exp(-e.deltaY*.002),x,y);},{passive:false});
stage.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;const [x,y]=local(e);zoom(2,x,y);});
function begin(){const points=[...pointers.values()];gesture={camera:{...camera},points,mid:points.length===2?[(points[0][0]+points[1][0])/2,(points[0][1]+points[1][1])/2]:points[0],distance:points.length===2?Math.hypot(points[0][0]-points[1][0],points[0][1]-points[1][1]):0};}
stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;cancelMotion();velocity=[0,0];sample={time:performance.now(),x:camera.x,y:camera.y};pointers.set(e.pointerId,local(e));e.target.closest('[data-pin]')?.setPointerCapture(e.pointerId);if(!e.target.closest('[data-pin]'))stage.setPointerCapture(e.pointerId);moved=false;begin();});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,local(e));const ps=[...pointers.values()];if(!gesture)return;const mid=ps.length===2?[(ps[0][0]+ps[1][0])/2,(ps[0][1]+ps[1][1])/2]:ps[0];if(Math.hypot(mid[0]-gesture.mid[0],mid[1]-gesture.mid[1])>3)moved=true;const ratio=ps.length===2&&gesture.distance?Math.hypot(ps[0][0]-ps[1][0],ps[0][1]-ps[1][1])/gesture.distance:1;camera={z:gesture.camera.z*ratio,x:mid[0]-(gesture.mid[0]-gesture.camera.x)*ratio,y:mid[1]-(gesture.mid[1]-gesture.camera.y)*ratio};const now=performance.now(),dt=Math.max(8,now-(sample?.time||now));velocity=ps.length===1?[(camera.x-sample.x)/dt,(camera.y-sample.y)/dt].map(v=>Math.max(-2,Math.min(2,v))):[0,0];sample={time:now,x:camera.x,y:camera.y};clamp();});
function end(e){pointers.delete(e.pointerId);if(pointers.size)begin();else{gesture=null;if(e.type==='pointerup'&&moved&&!reduce.matches&&sample&&performance.now()-sample.time<80)moveCamera({x:camera.x+velocity[0]*100,y:camera.y+velocity[1]*100,z:camera.z},300);}}
stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
stage.addEventListener('click',e=>{if(!moved&&!e.target.closest('button')){searchPanel(false,false);if(selected)close();}});
root.addEventListener('keydown',e=>{if(coach.open)return;if(e.key==='?'&&!e.target.matches('input,select,textarea')){e.preventDefault();startCoach();return;}if(e.key==='Escape'){if(!toolbar.hidden){e.preventDefault();searchPanel(false);return;}if(!panel.hidden){e.preventDefault();close();}return;}if(e.target!==stage)return;if(e.key==='/'){e.preventDefault();searchPanel(true);return;}const movements={ArrowLeft:[64,0],ArrowRight:[-64,0],ArrowUp:[0,64],ArrowDown:[0,-64]};if(movements[e.key]){e.preventDefault();camera.x+=movements[e.key][0];camera.y+=movements[e.key][1];clamp();}else if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')reset();else zoom(e.key==='-'?1/1.5:1.5);}});
const coach=$('.hm-coach'),coachTargets=['.hm-map-heading','#hm-search','.hm-filters','#hm-phase','[data-pin="donglong"]','.hm-controls','.hm-read-arrow'];
function coachPage(){searchPanel(coachStep>=1&&coachStep<=3,false);coach.dataset.step=String(coachStep);if(coachStep===3)$('.hm-filters').scrollLeft=$('.hm-filters').scrollWidth;else if(coachStep<3)$('.hm-filters').scrollLeft=0;document.querySelectorAll('.hm-coach-target').forEach(el=>el.classList.remove('hm-coach-target'));document.querySelector(coachTargets[coachStep])?.classList.add('hm-coach-target');$$('[data-coach-step]').forEach((el,i)=>el.hidden=i!==coachStep);$('.hm-coach-count').textContent=`${coachStep+1} / 7`;$('[data-coach-back]').disabled=coachStep===0;$('[data-coach-next]').textContent=coachStep===6?'開始逛':'下一步';if(coachStep===0&&document.activeElement===$('[data-coach-back]'))$('[data-coach-next]').focus();if(coachStep===4)fly(pins.find(p=>p.id==='donglong'));}
function startCoach(){stopWalk();cancelMotion();coachFocus=document.activeElement;coachStep=0;coachPage();coach.showModal();$('[data-coach-next]').focus();}
function finishCoach(){coach.close();searchPanel(false,false);document.querySelectorAll('.hm-coach-target').forEach(el=>el.classList.remove('hm-coach-target'));try{localStorage.setItem('donggang-home-coach-v1','1');}catch{}const target=coachFocus?.isConnected&&coachFocus.getClientRects().length?coachFocus:searchToggle;target.focus({preventScroll:true});}
$('[data-help]').addEventListener('click',startCoach);$('[data-coach-skip]').addEventListener('click',finishCoach);$('[data-coach-back]').addEventListener('click',()=>{coachStep=Math.max(0,coachStep-1);coachPage();});$('[data-coach-next]').addEventListener('click',()=>{if(coachStep===6)finishCoach();else{coachStep++;coachPage();}});coach.addEventListener('cancel',e=>{e.preventDefault();finishCoach();});coach.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const buttons=[...coach.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
function stopWalk(){clearTimeout(walkTimer);walkTimer=0;if(walk<0)return;walk=-1;delete root.dataset.walkStep;$('.hm-walk').hidden=true;pins.forEach(p=>p.button.classList.remove('hm-guided'));cancelMotion();}
function walkStep(){if(walk>=data.guidedStops.length){stopWalk();return;}const s=data.guidedStops[walk];root.dataset.walkStep=String(walk);$('.hm-walk').hidden=false;$('.hm-walk-count').textContent=`${walk+1} / ${data.guidedStops.length}`;$('.hm-walk strong').textContent=s.title;$('.hm-walk p').textContent=s.lead;$('.hm-walk a').href=s.url;pins.forEach(p=>p.button.classList.toggle('hm-guided',Boolean(p.id===s.id||s.ids?.includes(p.id))));if(s.id)fly(pins.find(p=>p.id===s.id));else{const ps=pins.filter(p=>s.ids.includes(p.id)),xs=ps.map(p=>p.xy[0]),ys=ps.map(p=>p.xy[1]),x1=Math.min(...xs),x2=Math.max(...xs),y1=Math.min(...ys),y2=Math.max(...ys),left=0,stageTop=stage.getBoundingClientRect().top,top=innerWidth<=760?$('.hm-map-heading').getBoundingClientRect().bottom-stageTop+48:180,bottom=innerWidth<=760?$('.hm-walk').getBoundingClientRect().top-stageTop-16:stage.clientHeight-60,z=Math.min((stage.clientWidth-left-96)/(x2-x1),Math.max(64,bottom-top)/(y2-y1));moveCamera({z,x:left+(stage.clientWidth-left)/2-(x1+x2)/2*z,y:(top+bottom)/2-(y1+y2)/2*z});}clearTimeout(walkTimer);walkTimer=setTimeout(()=>{walk++;walkStep();},4000);}
$('[data-walk]').addEventListener('click',()=>{searchPanel(false,false);close(false,false);category='all';phase='';applyFilters();writeFilters();walk=0;walkStep();});$('[data-walk-next]').addEventListener('click',()=>{if(walk>=0){walk++;walkStep();}});$('[data-walk-stop]').addEventListener('click',stopWalk);
function interrupt(e){if(e.type==='click'&&e.target===stage&&moved)return;if(e.target.closest('[data-walk],[data-walk-next],[data-walk-stop]'))return;stopWalk();if(!e.target.closest('.hm-coach'))cancelMotion();}
for(const event of ['pointerdown','wheel','keydown','click'])document.addEventListener(event,interrupt,{capture:true,passive:true});
document.addEventListener('scroll',stopWalk,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopWalk();cancelMotion();}});new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){stopWalk();cancelMotion();}},{threshold:0}).observe(stage);reduce.addEventListener('change',()=>{const target=motionTarget;cancelMotion();if(target){camera=target;clamp();}});
addEventListener('popstate',()=>{stopWalk();readURL();});addEventListener('pageshow',()=>{if(!coach.open)readURL();});new ResizeObserver(()=>{measureLabels();reset(false);if(selected)fly(pins.find(p=>p.id===selected));}).observe(stage);
measureLabels();document.fonts.ready.then(()=>{measureLabels();schedule();});reset(false);readURL();
})();
