import fs from 'node:fs/promises';
const raw=JSON.parse(await fs.readFile(new URL('../work/osm/merged.json',import.meta.url),'utf8'));
const {bounds,town}=raw, [w,s,e,n]=bounds;
const objects=new Map(raw.elements.map(o=>[o.type+'/'+o.id,o]));
const point=id=>{const p=objects.get('node/'+id);if(!p)throw Error('Missing OSM node '+id);return [p.lon,p.lat];};
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const inside=p=>p[0]>=w&&p[0]<=e&&p[1]>=s&&p[1]<=n;
const quantize=ps=>ps.map(p=>p.map(v=>+v.toFixed(6)));
function simplify(ps,tolerance=.000006){
 if(ps.length<=2)return ps;
 const a=ps[0],b=ps.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
 let max=0,index=0;
 for(let i=1;i<ps.length-1;i++){const p=ps[i],t=length?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length)):0;const d=(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;if(d>max){max=d;index=i;}}
 return max>tolerance*tolerance?[...simplify(ps.slice(0,index+1),tolerance).slice(0,-1),...simplify(ps.slice(index),tolerance)]:[a,b];
}
function segment(a,b){
 let lo=0,hi=1;const dx=b[0]-a[0],dy=b[1]-a[1];
 for(const [p,q] of [[-dx,a[0]-w],[dx,e-a[0]],[-dy,a[1]-s],[dy,n-a[1]]]){
  if(p===0){if(q<0)return null;continue;}const r=q/p;if(p<0)lo=Math.max(lo,r);else hi=Math.min(hi,r);if(lo>hi)return null;
 }
 return [[a[0]+lo*dx,a[1]+lo*dy],[a[0]+hi*dx,a[1]+hi*dy]];
}
function lines(ps){const result=[];let run=[];for(let i=1;i<ps.length;i++){const part=segment(ps[i-1],ps[i]);if(!part){if(run.length>1)result.push(run);run=[];continue;}if(run.length&&!same(run.at(-1),part[0])){if(run.length>1)result.push(run);run=[];}if(!run.length)run.push(part[0]);run.push(part[1]);}if(run.length>1)result.push(run);return result;}
function polygon(ps){
 let result=ps.slice();
 for(const [axis,value,sign] of [[0,w,1],[0,e,-1],[1,s,1],[1,n,-1]]){
  const input=result;result=[];for(let i=0;i<input.length;i++){const a=input[i],b=input[(i+1)%input.length],ia=(a[axis]-value)*sign>=0,ib=(b[axis]-value)*sign>=0;if(ia)result.push(a);if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}
 }
 if(result.length&&!same(result[0],result.at(-1)))result.push(result[0]);return result;
}
function join(parts,directed=false){
 const pending=parts.map(p=>p.slice()),result=[];
 while(pending.length){let line=pending.shift(),changed=true;while(changed){changed=false;for(let i=0;i<pending.length;i++){const p=pending[i];if(same(line.at(-1),p[0]))line.push(...p.slice(1));else if(same(p.at(-1),line[0]))line.unshift(...p.slice(0,-1));else if(!directed&&same(line.at(-1),p.at(-1)))line.push(...p.slice(0,-1).reverse());else if(!directed&&same(line[0],p[0]))line.unshift(...p.slice(1).reverse());else continue;pending.splice(i,1);changed=true;break;}}result.push(line);}return result;
}
const features=[],labels=[],labelNames=new Set();
function label(name,ps,priority,ref){if(!name||!/[\u3400-\u9fff]/.test(name)||labelNames.has(name)||!ps.length)return;const p=ps[Math.floor(ps.length/2)];if(!inside(p))return;labelNames.add(name);labels.push({name,point:quantize([p])[0],priority,ref});}
function add(layer,ps,closed,ref,name=''){
 const parts=closed?[polygon(ps)]:lines(ps);
 for(const part of parts){if(part.length<(closed?4:2))continue;const geometry=quantize(simplify(part));if(geometry.length<(closed?4:2))continue;features.push({layer,points:geometry,closed,ref});}
 if(name){const flat=parts.flat();const at=closed&&flat.length?[[flat.reduce((s,p)=>s+p[0],0)/flat.length,flat.reduce((s,p)=>s+p[1],0)/flat.length]]:flat;label(name,at,layer==='water'||layer==='river'?(['東港溪','大鵬灣'].includes(name)?1:2):3,ref);}
}
const ways=raw.elements.filter(o=>o.type==='way');
// OSM coastline direction has land on its left. Close sea on its right
// using only the clipping rectangle, never invented shoreline points.
const coast=join(ways.filter(o=>o.tags?.natural==='coastline').map(o=>o.nodes.map(point)),true);
function perimeter(p){const eps=1e-8;if(Math.abs(p[0]-w)<eps)return(p[1]-s)/(n-s);if(Math.abs(p[1]-n)<eps)return 1+(p[0]-w)/(e-w);if(Math.abs(p[0]-e)<eps)return 2+(n-p[1])/(n-s);if(Math.abs(p[1]-s)<eps)return 3+(e-p[0])/(e-w);throw Error('Unclosed coastline inside extract');}
const corners=[[w,s],[w,n],[e,n],[e,s]];
for(const chain of coast)for(const line of lines(chain)){
 if(same(line[0],line.at(-1)))throw Error('Island coastline needs explicit outer ring handling');
 let end=perimeter(line.at(-1)),start=perimeter(line[0]);if(start<=end)start+=4;
 for(let k=Math.floor(end)+1;k<start;k++)line.push(corners[k%4]);line.push(line[0]);add('sea',line,true,'OSM coastline');
}
for(const o of ways){const t=o.tags||{},ref='way/'+o.id;let layer,closed=false;
 if(t.natural==='water'||t.waterway==='riverbank'){layer='water';closed=true;}
 else if(t.leisure==='park'||['grass','recreation_ground'].includes(t.landuse)){layer='green';closed=true;}
 else if(['residential','commercial','retail'].includes(t.landuse)){layer='urban';closed=true;}
 else if(['river','stream','canal'].includes(t.waterway))layer='river';
 else if(t.highway){if(t.bridge&&t.bridge!=='no')layer='bridge';else if(/^(motorway|trunk|primary|secondary)(_link)?$/.test(t.highway))layer='major';else if(/^(tertiary|residential|unclassified)(_link)?$/.test(t.highway))layer='minor';else if(/^(service|living_street|footway|path|pedestrian|cycleway|steps)$/.test(t.highway))layer='lane';}
 if(layer)add(layer,o.nodes.map(point),closed,ref,['major','minor','river','water'].includes(layer)?t['name:zh']||t.name:'');
}
for(const o of raw.elements.filter(o=>o.type==='relation'&&o.tags?.natural==='water')){
 for(const role of ['outer','inner']){
 const members=o.members.filter(m=>m.type==='way'&&(m.role||'outer')===role);
 const available=members.map(m=>objects.get('way/'+m.ref));
 if(available.some(m=>!m))throw Error('Incomplete water relation '+o.id);
 for(const ring of join(available.map(m=>m.nodes.map(point)))){if(!same(ring[0],ring.at(-1)))throw Error('Open water ring '+o.id);add(role==='inner'?'island':'water',ring,true,'relation/'+o.id,o.tags['name:zh']||o.tags.name);}
 }
}
const boundary=objects.get('relation/2766783');
for(const m of boundary.members.filter(m=>m.type==='way'))add('boundary',objects.get('way/'+m.ref).nodes.map(point),false,'relation/2766783');
for(const o of raw.elements.filter(o=>o.type==='node'&&o.tags?.place))label(o.tags['name:zh']||o.tags.name,[[o.lon,o.lat]],o.tags.place==='town'?1:2,'node/'+o.id);
const data={source:'OpenStreetMap contributors',license:'ODbL-1.0',checked:'2026-10-25',bounds,town,features,labels};
await fs.mkdir(new URL('../data/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../data/donggang-basemap.json',import.meta.url),JSON.stringify(data));
console.log(JSON.stringify({features:features.length,labels:labels.length,bytes:Buffer.byteLength(JSON.stringify(data))}));
