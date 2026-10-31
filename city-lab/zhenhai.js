import {CylinderGeometry,BufferGeometry,Float32BufferAttribute} from 'three';
import {createMergeKit} from './merge-kit.js';

// 崙仔頂鎮海宮：高台、左右分開的寬石階與中央圓形石欄假山，前殿石龍柱與紅柱，
// 後方殿宇層層升高，最高一層小亭頂立葫蘆寶塔。本地座標 +z 為廟門方向，單位約為前殿寬度的十分之一。
// 每種顏色先合併成一個幾何，整座廟只多出少數幾次繪製。
export function createZhenhai({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'zhenhai'}),{add,m4,box,ball,bead,cyl,tube}=mk;
 const azure='ceramicAzure',tile='zhenhaiTile',gold='hallGoldLight',green='ceramicGreen',red='hallRed',dark='hallDark',stone='stone';
 const H=2.2;

 // 歇山屋頂：曲面瓦、翹角、燕尾正脊、垂脊與剪黏
 function roof(x,y,z,w,d,h,{deco=1,ridge=true,dragons=true}={}){
  const height=(xx,zz)=>{const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*.3)/(w*.2)));return h*Math.max(0,1-t)**1.4+.32*(Math.abs(xx)/(w/2))**6;};
  const nx=mobile?8:12,nz=mobile?4:6,v=[],pt=(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [x+xx,y+height(xx,zz),z+zz];};
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),e=pt(i,j+1);v.push(...a,...c,...b,...a,...e,...c,...a,...b,...c,...a,...c,...e);}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(tile,g);
  box(w*.9,.12,d*.86,dark,x,y-.07,z);
  for(const side of [-1,1]){const e=[];for(let i=0;i<=8;i++){const xx=(i/8-.5)*w;e.push([x+xx,y+height(xx,side*d/2),z+side*d/2]);}tube(e,.07,gold,12);}
  if(!ridge)return;
  const rw=w*.34,ry=xx=>y+h+.08+.35*(Math.abs(xx)/rw)**4,line=[];
  for(let i=0;i<=10;i++){const xx=(i/10-.5)*2*rw;line.push([x+xx,ry(xx),z]);}
  tube(line,.09,gold,12);
  for(const end of [-1,1])for(const dz of [-.07,.07])tube([[x+end*rw,ry(rw*end),z],[x+end*(rw+.3),y+h+.75,z+dz],[x+end*(rw+.38),y+h+1.15,z+dz*2.4],[x+end*(rw+.28),y+h+1.3,z+dz*3]],.055,gold,6);
  for(const end of [-1,1])for(const side of [-1,1]){const hip=[];for(let i=0;i<=5;i++){const t=i/5,xx=end*w*(.3+.2*t),zz=side*d*.5*t;hip.push([x+xx,y+height(xx,zz)+.08,z+zz]);}hip.push([x+end*w*.53,y+.75,z+side*d*.53]);tube(hip,.06,gold,8);
   bead(.09,.2,.09,green,x+end*w*.47,y+height(end*w*.47,side*d*.4)+.3,z+side*d*.4);}
  const n=Math.max(3,Math.round(w*deco/.42));
  for(let i=0;i<=n;i++){const xx=(i/n-.5)*2*rw*.92,yy=ry(xx);if(Math.abs(xx)<.45&&dragons)continue;
   bead(.07,.2,.07,[green,gold,azure][i%3],x+xx,yy+.22,z);bead(.11,.07,.05,green,x+xx,yy+.1,z,[0,0,(i%3-1)*.5]);}
  if(dragons){for(const side of [-1,1])tube([[x+side*1.05,y+h+.15,z],[x+side*.8,y+h+.55,z],[x+side*.55,y+h+.3,z],[x+side*.3,y+h+.6,z]],.075,green,8);
   for(const side of [-1,1])bead(.13,.11,.1,gold,x+side*.26,y+h+.66,z);ball(.12,.12,.12,gold,x,y+h+.62,z);cyl(.04,.07,.3,gold,x,y+h+.35,z);}
 }
 function body(w,d,color,x,y0,y1,z){box(w,y1-y0,d,color,x,(y0+y1)/2,z);}

 // 地坪與高台
 box(10.8,.1,13.2,stone,0,.05,-.4);
 box(10.4,H,8.2,stone,0,H/2,-2.7);box(10.6,.12,8.4,'zhenhaiStone',0,H+.02,-2.7);
 // 石階：全寬往下延伸，中央下段被圓形假山截開成左右兩道
 const steps=11,run=.42;
 for(let i=0;i<steps;i++){const top=H*(steps-i)/steps;box(10.4,top,run,i%2?stone:'zhenhaiStone',0,top/2,1.4+run*i+run/2);}
 const foot=1.4+steps*run;
 for(const side of [-1,1]){
  tube([[side*5.25,H+.55,1.2],[side*5.25,.6,foot]],.08,stone,4);
  for(let i=0;i<=6;i++){const t=i/6,zz=1.2+(foot-1.2)*t,yy=H*(1-t)+.02;box(.2,.62,.2,stone,side*5.25,yy+.28,zz);}
  tube([[side*5.25,H+.55,1.2],[side*5.25,H+.55,-6.6]],.07,stone,4);
 }
 // 圓形石欄假山
 const rc=1.75,cz=foot-rc-.05;
 add(stone,new CylinderGeometry(rc,rc,.6,mobile?12:24),m4([0,.3,cz]));
 add('zhenhaiStone',new CylinderGeometry(rc+.08,rc+.08,.12,mobile?12:24),m4([0,.62,cz]));
 const ring=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ring.push([Math.sin(a)*rc,1.38,cz+Math.cos(a)*rc]);if(i%(mobile?2:1)===0)box(.14,.72,.14,'zhenhaiStone',Math.sin(a)*rc,1.04,cz+Math.cos(a)*rc,a);const b=(i+.5)/16*Math.PI*2;if(!mobile)box(.6,.3,.05,'zhenhaiStone',Math.sin(b)*rc,.95,cz+Math.cos(b)*rc,b);}
 tube(ring,.07,'zhenhaiStone',mobile?12:24,true);
 for(const [x,y,z,s] of [[0,1.2,cz-.3,.75],[-.6,1,cz+.2,.5],[.65,1.05,cz+.1,.55],[.2,1.95,cz-.4,.5],[-.25,1.65,cz-.6,.42],[.5,.95,cz+.8,.35],[.05,2.45,cz-.45,.3]])ball(s,s*1.1,s*.8,'zhenhaiStone',x,y,z,[.3,x,0]);
 for(const [x,z,s] of [[-1.05,cz-.4,.45],[1,cz-.5,.5],[-.9,cz+.7,.35],[.95,cz+.75,.3],[0,cz+1.05,.32],[.35,cz-.9,.4]])ball(s,s*.8,s,green,x,1.05,z);
 // 前殿：五開間紅牆、石龍柱與紅柱、燈籠
 body(9.4,2.3,red,0,H,4.15,-.45);
 for(const x of [-3.6,-1.8,0,1.8,3.6]){box(x===0?1.3:1.05,1.45,.05,dark,x,H+.78,.73);box(x===0?1.3:1.05,.07,.06,gold,x,H+1.52,.74);}
 for(const x of [-4.55,-3.25,-2.35,-.85,.85,2.35,3.25,4.55]){
  const dragonPillar=Math.abs(x)!==3.25&&Math.abs(x)!==.85;
  if(dragonPillar){cyl(.2,.22,1.95,stone,x,H+.98,1.05);const sp=[];for(let i=0;i<=10;i++){const a=i*1.3;sp.push([x+Math.sin(a)*.23,H+.15+i*.17,1.05+Math.cos(a)*.23]);}tube(sp,.06,stone,14);}
  else cyl(.13,.14,1.95,red,x,H+.98,1.05);
  box(.42,.16,.42,stone,x,H+.08,1.05);box(.34,.14,.34,gold,x,H+1.92,1.05);
 }
 box(9.6,.3,.35,red,0,H+2.05,1.05);box(9.6,.08,.38,gold,0,H+2.24,1.05);
 for(const x of [-4,-2.85,-1.55,1.55,2.85,4]){cyl(.02,.02,.25,dark,x,H+1.82,1.12);ball(.17,.2,.17,red,x,H+1.6,1.12);cyl(.09,.09,.05,gold,x,H+1.78,1.12);}
 roof(0,4.25,.45,10.6,1.9,.35,{ridge:false});
 // 前殿屋頂：中央拔高、左右兩翼較低
 body(4.4,2.2,red,0,4.25,5.05,-.35);box(1.6,.55,.06,dark,0,4.68,.77);box(1.75,.07,.07,gold,0,4.98,.78);box(1.75,.07,.07,gold,0,4.38,.78);
 roof(0,5.05,-.35,5.2,2.8,.85,{deco:1.2});
 for(const side of [-1,1]){body(2.6,2,red,side*3.55,4.25,4.65,-.35);box(1.1,.32,.06,dark,side*3.55,4.47,.67);roof(side*3.55,4.65,-.4,3.2,2.5,.62,{deco:1});}
 // 後方層疊殿宇
 body(9.4,5.4,red,0,H,4.25,-4.1);box(9.5,.08,5.5,tile,0,4.29,-4.1);
 body(5.4,2.8,red,0,4.25,6.2,-2.9);roof(0,6.2,-2.9,6.4,3.4,.9,{deco:1.1});
 box(1.3,.45,.06,dark,0,5.7,-1.48);box(1.4,.06,.07,gold,0,5.95,-1.47);
 for(const side of [-1,1]){
  body(2.1,2.1,red,side*3.75,4.25,6.0,-3.2);roof(side*3.75,6.0,-3.2,2.9,2.8,.7,{deco:1,dragons:false});
  body(1.4,1.4,red,side*3.75,6.3,6.95,-3.2);roof(side*3.75,6.95,-3.2,2.1,2,.55,{deco:.8,dragons:false});
 }
 body(4.6,3.2,red,0,4.25,7.7,-5.1);roof(0,7.7,-5.1,5.6,3.6,.95,{deco:1.1});
 body(2.6,2.2,red,0,8.2,9.15,-5.2);box(1,.35,.06,dark,0,8.75,-4.08);
 roof(0,9.15,-5.2,3.4,2.8,.85,{deco:.9,dragons:false});
 // 葫蘆寶塔頂
 for(let i=0;i<5;i++){const r=.3-i*.045;cyl(r*.75,r,.16,gold,0,10.15+i*.2,-5.2);cyl(r*.4,r*1.2,.05,red,0,10.25+i*.2,-5.2);}
 ball(.2,.24,.2,gold,0,11.25,-5.2);ball(.13,.15,.13,gold,0,11.55,-5.2);bead(.05,.18,.05,gold,0,11.8,-5.2);

 const {group,materials,dispose}=mk.finish();
 return {group,materials,dispose,bounds:{x:[-5.4,5.4],z:[-7,6.2]}};
}
