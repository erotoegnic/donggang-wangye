import {Box3,Group,Shape,ShapeGeometry,BoxGeometry,BufferGeometry,Float32BufferAttribute,PlaneGeometry,ExtrudeGeometry} from 'three';
import {createKit} from './kit.js';
import {createTemple} from './model.js';
import {createZhenhai} from './zhenhai.js';
import {createDonglongtan} from './donglongtan.js';
import {createFuan} from './fuan.js';
import {createChaolong} from './chaolong.js';
import {createDongfu} from './dongfu.js';
import {createGongshan} from './gongshan.js';
import {createZhenling} from './zhenling.js';

const inside=(p,polygon)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};
const segmentDistance=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
export function createWorld(data,{mobile=false}={}){
 const group=new Group(),k=createKit({mobile:true}),temple=createTemple({district:true,mobile}),boats=[],targets=[];
 const block=(w,h,d,color,x,y,z,rotation=0)=>k.put('city-block',k.geometry('city-block',()=>new BoxGeometry(1,1,1)),color,[x,y,z],[w,h,d],[0,rotation,0]);
 const [[west,north],[east,south]]=data.bounds,cx=(west+east)/2,cz=(north+south)/2;
 k.box(east-west+1.4,2.8,south-north+1.4,'wood',cx,-1.6,cz);
 k.box(east-west+.3,.23,south-north+.3,'cream',cx,-.09,cz);
 const water=data.polygons.filter(p=>p.layer==='sea'||p.layer==='water');
 function polygon(points,color,y,key){const s=new Shape();points.forEach(([x,z],i)=>s[i?'lineTo':'moveTo'](x,-z));s.closePath();const geo=k.geometry(key,()=>{const g=new ShapeGeometry(s);g.rotateX(-Math.PI/2);return g;});k.put(key,geo,color,[0,y,0]);}
 data.polygons.forEach((p,i)=>polygon(p.points,p.layer==='green'?'leaf':p.layer==='sea'?'sea':'water',p.layer==='green'?.035:.055,'ground-'+i));
 const isWater=p=>water.some(w=>inside(p,w.points));
 const roadWidth=layer=>layer==='major'||layer==='bridge'?.72:layer==='minor'?.48:.26;
 let seed=2718;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 // 依實景照片程式建模的角頭廟。鎮海宮依 OSM way/1274413112 外框，廟門朝西南西面向鎮海路；
 // 東隆壇（延平路49號）面向西北的延平路。福安宮（延平路209號）面向延平路、左側是福德街；
 // 朝隆宮依 OSM way/773895829 外框，牌樓臨延平路；東福殿面向延平路（屏128），雨棚在前、廟身在右後；
 // 共善堂（頂中街西側，進水宮神祇同祀於此）面向頂中街；鎮靈宮（新基街68號）坐東朝西面向新基街。
 // 廟宇依實際位置面向前方街道，以等比例放大到接近東隆宮的量體；back／side 讓前緣停在路邊，必要時在街廓內微調位置與角度。
 const customTemples=[
  {id:'place-lunding',create:createZhenhai,angle:Math.atan2(-.8824,.4706),scale:.42,back:2.36,side:-2},
  {id:'place-ding',create:createDonglongtan,angle:Math.atan2(-.855,-.519),scale:.52,back:.64,side:-.5},
  {id:'place-anhai',create:createFuan,angle:Math.atan2(-.538,-.844),scale:.56,back:1.62,side:-.55},
  {id:'place-xiazhong',create:createChaolong,angle:Math.atan2(.904,.427),scale:.4,back:1.39,side:-.4},
  {id:'place-xia',create:createDongfu,angle:Math.atan2(-.748,-.664)-.16,scale:.34,back:1.97,side:1.52},
  {id:'place-dingzhong',create:createGongshan,angle:Math.atan2(.863,.505)+.08,scale:.39,back:2.07,side:-1.74},
  {id:'place-pu',create:createZhenling,angle:Math.atan2(-.879,-.476)+.16,scale:.32,back:.11,side:-1.46}
 ].map(c=>{const p=data.places.find(p=>p.id===c.id);return p&&{...c,at:[p.point[0]-Math.sin(c.angle)*c.back+Math.cos(c.angle)*c.side,p.point[2]-Math.cos(c.angle)*c.back-Math.sin(c.angle)*c.side]};}).filter(Boolean);
 // 先建模型取得外框：外框內的民宅、樹木與完全被蓋住的巷道段都不再產生。
 for(const c of customTemples){c.model=c.create({mobile});const box=new Box3().setFromObject(c.model.group);c.box=[box.min.x*c.scale,box.max.x*c.scale,box.min.z*c.scale,box.max.z*c.scale];c.top=box.max.y*c.scale+.04;}
 const inTemple=(x,z,m=0)=>customTemples.some(c=>{const dx=x-c.at[0],dz=z-c.at[1],cs=Math.cos(c.angle),sn=Math.sin(c.angle),lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;return lx>c.box[0]-m&&lx<c.box[1]+m&&lz>c.box[2]-m&&lz<c.box[3]+m;});
 for(const r of data.roads){const [a,b]=r.points,dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.015||(r.layer!=='major'&&r.layer!=='bridge'&&inTemple(...a)&&inTemple(...b)&&inTemple((a[0]+b[0])/2,(a[1]+b[1])/2)))continue;k.put('road',k.geometry('road',()=>new PlaneGeometry(1,1).rotateX(-Math.PI/2)),'paper',[(a[0]+b[0])/2,.09,(a[1]+b[1])/2],[roadWidth(r.layer),1,len+.08],[0,Math.atan2(dx,dz),0]);}
 const occupied=[],landmarks=data.places.filter(p=>p.kind!=='harbor'),houses=[];
 const clear=(x,z,r=1)=>!isWater([x,z])&&!inTemple(x,z,r+.35)&&!landmarks.some(p=>Math.hypot(p.point[0]-x,p.point[2]-z)<(p.kind==='donglong'?5.6:p.kind==='coast'?3:p.size===1?2.1:1.25)+r)&&!occupied.some(p=>Math.hypot(p[0]-x,p[1]-z)<r+.55)&&!data.roads.some(road=>segmentDistance([x,z],...road.points)<roadWidth(road.layer)/2+r*.58);
 for(const road of data.roads.filter(r=>r.layer!=='lane').sort((a,b)=>Math.sin(a.points[0][0]*73+a.points[0][1]*31)-Math.sin(b.points[0][0]*73+b.points[0][1]*31))){
  const [a,b]=road.points,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<1.5)continue;
  for(let t=.9;t<length;t+=1.55+random()*.5)for(const side of [-1,1]){
   const offset=roadWidth(road.layer)/2+.85,x=a[0]+dx*t/length+dz/length*offset*side,z=a[1]+dz*t/length-dx/length*offset*side;
   if(x<west+1||x>east-1||z<north+1||z>south-1||!clear(x,z,.7)||houses.length>=(mobile?150:360))continue;
   occupied.push([x,z]);const angle=Math.atan2(-dz*side,dx*side),tier=Math.floor(random()*3),h=.85+tier*.45,w=.78+random()*.3,d=1.1,shade=['paper','cream','paleBlue','dustRose','stone'][Math.floor(random()*5)];
   block(w,h,d,shade,x,h/2+.12,z,angle);block(w+.12,.12,d+.1,'tile',x,h+.2,z,angle);
   const local=(xx,zz)=>[x+xx*Math.cos(angle)+zz*Math.sin(angle),z-xx*Math.sin(angle)+zz*Math.cos(angle)];
   for(const floor of [.55,1.05,1.5].filter(y=>y<h))for(const xx of [-w*.24,w*.24]){const [wx,wz]=local(xx,d*.51);k.put('window',k.geometry('window',()=>new PlaneGeometry(1,1)),(houses.length+Math.round(floor*10))%3===0?'windowGlow':'pine',[wx,floor,wz],[w*.22,.25,1],[0,angle,0]);}
   if(houses.length%3===0){const [wx,wz]=local(w*.51,0);k.put('window',k.geometry('window',()=>new PlaneGeometry(1,1)),'windowGlow',[wx,h*.65,wz],[.25,.3,1],[0,angle+Math.PI/2,0]);}
   const [ax,az]=local(0,d*.62);block(w+.15,.08,.45,'cream',ax,.65,az,angle);
   for(const xx of [-w*.43,w*.43]){const [px,pz]=local(xx,d*.78);block(.06,.57,.06,'stone',px,.34,pz,angle);}
   if(random()<.25){const [sx,sz]=local(w*.58,.35);block(.17,.55,.1,random()<.5?'red':'blue',sx,.95,sz,angle);}
   if(random()<.35){const [ax,az]=local(w*.25,.59);block(.23,.18,.14,'paper',ax,h*.6,az,angle);}
   if(random()<.4)for(let rib=0;rib<4;rib++){const [rx,rz]=local((rib-1.5)*w/4,0);block(.025,.025,d,'stone',rx,h+.28,rz,angle);}
   if(houses.length%18===0){const [lx,lz]=local(-w*.65,d*.8);block(.055,1.55,.055,'wood',lx,.88,lz);block(.24,.07,.22,'windowGlow',lx,1.66,lz);}
   houses.push({x,z,h});
  }
 }
 function tree(x,z,palm=false){
  k.cylinder(.055,.09,palm?1.5:.8,'wood',x,palm?.8:.45,z);
  if(palm)for(let i=0;i<6;i++){const a=i*Math.PI/3;k.ball(.1,.08,.6,'pine',x+Math.sin(a)*.28,1.57,z+Math.cos(a)*.28,[.16,a,0]);}
  else for(const [dx,dy,dz,r] of [[0,1.05,0,.46],[-.3,.9,0,.36],[.3,.95,.1,.36],[0,.9,.3,.35]])k.ball(r,r*.7,r,'leaf',x+dx,dy,z+dz);
 }
 for(let i=0;i<houses.length;i+=9){const p=houses[i],x=p.x+.95,z=p.z+.3;if(clear(x,z,.25))tree(x,z,i%3===0);}
 function roof(x,y,z,w,d,h){
  const key=`district-roof-${w}-${d}-${h}`,geo=k.geometry(key,()=>{
   const positions=[],nx=4,nz=4,point=(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d,edge=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*.28)/(w*.22)));return [xx,h*Math.max(0,1-edge)**1.3+.09*(Math.abs(xx)/(w/2))**6,zz];};
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),e=point(i,j+1);positions.push(...a,...c,...b,...a,...e,...c);}
   const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.computeVertexNormals();return g;
  });k.put(key,geo,'districtTile',[x,y,z]);
  block(w,.045,d,'districtTile',x,y-.025,z);
  k.curve([[x-w*.4,y+h+.16,z],[x-w*.28,y+h+.015,z],[x,y+h,z],[x+w*.28,y+h+.015,z],[x+w*.4,y+h+.16,z]],.035,'districtGold',6,3);
  for(const side of [-1,1])k.ball(.055,.09,.055,'districtJade',x+side*w*.22,y+h+.1,z);
 }
 for(const p of data.places){const [x,,z]=p.point;
  if(customTemples.some(c=>c.id===p.id)){p.height=2.2;}
  else if(p.kind==='temple'){
   const s=p.size,w=2.1*s,d=1.6*s;
   block(w+.6,.14,d+1.3,'stone',x,.16,z+.25);block(w,1.05*s,d,'cream',x,.72*s,z);block(w*.66,.78*s,.04,'hallDark',x,.64*s,z+d/2+.02);
   for(const dx of [-.43,-.2,.2,.43])k.cylinder(.06*s,.075*s,.94*s,'hallRed',x+w*dx,.69*s,z+d/2+.3*s);
   roof(x,1.32*s,z-.16*s,w+.45*s,d+.25*s,.29*s);
   roof(x,1.12*s,z+d*.49,w+.55*s,.85*s,.16*s);
   block(.58*s,.14*s,.06,'districtGold',x,1.02*s,z+d/2+.12);
   k.cylinder(.15*s,.12*s,.23*s,'districtGold',x,.32*s,z+d/2+.6);k.cylinder(.17*s,.17*s,.04,'hallDark',x,.46*s,z+d/2+.6);
   for(const dx of [-.35,.35])k.ball(.09*s,.13*s,.09*s,'hallLantern',x+w*dx,.95*s,z+d/2+.18);
   k.cylinder(.025,.04,1.7*s,'wood',x-w*.7,.9*s,z+.6);block(.32*s,.5*s,.03,'red',x-w*.7+.15*s,1.5*s,z+.6);
   p.height=s===1?2.5:1.6;
  }else if(p.kind==='coast'){
   block(3,.1,2.6,'cream',x,.12,z);for(let i=0;i<4;i++)tree(x-1.2+i*.8,z-.7,true);block(1.7,.18,.85,'stone',x,.24,z+.4);
   k.cylinder(.03,.04,2,'wood',x,1.2,z+.5);block(.5,.65,.04,'gold',x+.22,1.8,z+.5);
  }
  if(p.kind!=='harbor')targets.push({id:p.id,point:[x,.5,z],radius:p.kind==='donglong'?5:1.5});
 }
 // Quay segments follow the actual harbor coastline, with boats placed on its water side.
 const sea=data.polygons.find(p=>p.layer==='sea');let dockCount=0;
 for(let i=1;i<sea.points.length;i++){
  const a=sea.points[i-1],b=sea.points[i],x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(x>-40&&x<-12&&z>-21&&z<-3&&len>.8){block(.28,.18,len,'stone',x,.08,z,Math.atan2(b[0]-a[0],b[1]-a[1]));dockCount++;}
 }
 for(const [x,z] of [[-26,-16],[-28,-14],[-22,-12],[-34,-10],[-18,-9]]){
  if(!isWater([x,z]))continue;
  const bk=createKit({mobile:true});
  const hull=bk.geometry('fishing-hull',()=>{const s=new Shape();s.moveTo(-.35,-.7);s.lineTo(.35,-.7);s.lineTo(.35,.35);s.lineTo(.15,.9);s.lineTo(0,1.05);s.lineTo(-.15,.9);s.lineTo(-.35,.35);s.closePath();return new ExtrudeGeometry(s,{depth:.24,bevelEnabled:false}).rotateX(-Math.PI/2);});
  bk.put('fishing-hull',hull,'blue',[0,.04,0]);bk.box(.5,.12,1.35,'paper',0,.32,0);bk.box(.44,.42,.5,'paper',0,.56,-.25);bk.box(.48,.06,.55,'red',0,.8,-.25);bk.box(.35,.15,.03,'pine',0,.6,.02);bk.cylinder(.025,.025,.75,'wood',0,.8,.35);bk.box(.6,.025,.03,'wood',0,1.02,.35);
  const boat=bk.finish();boat.position.set(x,.05,z);boat.scale.setScalar(1.25);boat.rotation.y=.4+boats.length*.6;group.add(boat);boats.push({group:boat,dispose:bk.dispose,phase:boats.length});
 }
 for(let i=0;i<55;i++){const x=west+2+random()*(east-west-4),z=north+2+random()*(south-north-4);if(isWater([x,z]))block(.6+random(),.015,.055,'blue',x,.07,z);}
 const customModels=customTemples.map(c=>{const model=c.model;model.group.scale.setScalar(c.scale);model.group.rotation.y=c.angle;model.group.position.set(c.at[0],.04,c.at[1]);group.add(model.group);return model;});
 const district=k.finish();group.add(district);temple.group.scale.setScalar(.52);temple.group.position.y=.12;group.add(temple.group);
 const materials=new Map([...k.materials,...temple.materials,...customModels.flatMap(m=>[...m.materials])]);
 return {group,materials,targets,boats,focus:Object.fromEntries(customTemples.map(c=>[c.id,[c.at[0],c.at[1],c.top*.45,Math.max(6,Math.min(8,40/Math.max(c.box[1]-c.box[0],c.box[3]-c.box[2],c.top*1.4)))]])),labels:Object.fromEntries(customTemples.map(c=>[c.id,[c.at[0],c.top+.45,c.at[1]]])),stats:{houses:houses.length,roads:data.roads.length,docks:dockCount,boats:boats.length},animate(now){for(const b of boats){b.group.position.y=.08+Math.sin(now*.0007+b.phase)*.045;b.group.rotation.z=Math.sin(now*.0005+b.phase)*.035;}},dispose(){k.dispose();temple.dispose();customModels.forEach(m=>m.dispose());boats.forEach(b=>b.dispose());}};
}
