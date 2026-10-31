import {BufferGeometry,Float32BufferAttribute,Shape,ExtrudeGeometry} from 'three';
import {createMergeKit} from './merge-kit.js';

// 下中街朝隆宮：臨街是一座大牌樓「后德門」，中央大圓拱、左右兩個小圓拱；紅柱配金藍柱頭與黑底對聯，
// 中央拱下掛一排五顆紅燈籠。牌樓中段是綠琉璃瓦長脊，脊上雙龍搶珠；兩側較低的山牆面朝街，三角牆
// 彩繪藍紫，下方紅磚牆頂著欄杆女兒牆。牌樓後方是前埕與紅瓦正殿，正脊滿是彩色剪黏，旁邊另有一座小亭。
// 本地座標 +z 為臨街方向。
export function createChaolong({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'chaolong'}),{add,m4,box,ball,bead,cyl,tube,panel}=mk;
 const tile='jadeTile',green='ceramicGreen',red='hallRed',gold='hallGoldLight',white='ceramicWhite',azure='ceramicAzure',dark='hallDark',hallTile='hallTile',sign='chaolongSign';
 const colours=[azure,green,gold,white];
 let seed=31;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const quad=(v,a,b,c,d)=>v.push(...a,...b,...c,...a,...c,...d,...a,...c,...b,...a,...d,...c);
 const surface=(color,nx,nz,pt)=>{const v=[];for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)quad(v,pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1));const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(color,g);};
 // 廡殿頂：中段平脊，四角翹起
 function hip(color,trim,x,y,z,w,d,h,ridge=.3){
  const height=(xx,zz)=>{const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*ridge)/(w*(.5-ridge))));return h*Math.max(0,1-t)**1.25+.35*(Math.abs(xx)/(w/2))**6*(.4+.6*(Math.abs(zz)/(d/2))**2);};
  const nx=mobile?8:12,nz=mobile?4:6;surface(color,nx,nz,(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [x+xx,y+height(xx,zz),z+zz];});
  const line=[[x-w*ridge-.3,y+h+.45,z]];for(let i=0;i<=6;i++)line.push([x+(i/6-.5)*2*w*ridge,y+h+.06,z]);line.push([x+w*ridge+.3,y+h+.45,z]);tube(line,.11,trim,10);
  for(const s of [-1,1])for(const f of [-1,1]){const l=[];for(let i=0;i<=4;i++){const t=i/4,xx=s*w*(ridge+(.5-ridge)*t),zz=f*d*.5*t;l.push([x+xx,y+height(xx,zz)+.08,z+zz]);}l.push([x+s*w*.54,y+.7,z+f*d*.54]);tube(l,.07,trim,8);}
 }
 // 山牆朝前的懸山頂（脊線沿 z），前面一片三角彩繪
 function gable(x,y,z,w,d,h){
  const n=mobile?6:10,yy=xx=>h*(1-Math.abs(xx)/(w/2));
  surface(tile,n,mobile?3:4,(i,j)=>{const xx=(i/n-.5)*w,zz=(j/(mobile?3:4)-.5)*d,e=(Math.abs(xx)/(w/2))**5*.3*(.3+(Math.abs(zz)/(d/2))**2);return [x+xx,y+yy(xx)+e,z+zz];});
  const g=new BufferGeometry(),f=z+d/2-.25;g.setAttribute('position',new Float32BufferAttribute([x-w/2+.35,y+.05,f,x+w/2-.35,y+.05,f,x,y+h-.35,f],3));g.computeVertexNormals();add(azure,g);
  for(const s of [-1,1]){tube([[x,y+h+.1,z+d/2+.05],[x+s*w/4,y+h/2+.08,z+d/2+.05],[x+s*w/2,y+.05,z+d/2+.05],[x+s*(w/2+.15),y+.35,z+d/2+.1]],.09,green,8);tube([[x+s*.4,y+h*.82,f+.02],[x+s*w*.3,y+h*.3,f+.02]],.05,white,4);}
  tube([[x,y+h+.12,z-d/2],[x,y+h+.12,z+d/2]],.1,green,4);ball(.2,.3,.2,gold,x,y+h+.35,z+d/2-.2);
 }
 function arch(x,z,W,H,r,spring,depth){
  const s=new Shape();s.moveTo(-W/2,0);s.lineTo(-r,0);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,0);s.lineTo(W/2,0);s.lineTo(W/2,H);s.lineTo(-W/2,H);s.closePath();
  const g=new ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:mobile?8:14});g.translate(x,0,z-depth/2);add(red,g);g.dispose();
  const ring=(rr,dz,color,t)=>{const p=[[x-rr,0,z+dz],[x-rr,spring,z+dz]];for(let i=1;i<=8;i++){const a=Math.PI-i/8*Math.PI;p.push([x+Math.cos(a)*rr,spring+Math.sin(a)*rr,z+dz]);}p.push([x+rr,0,z+dz]);tube(p,t,color,24);};
  ring(r+.12,depth/2+.04,white,.13);ring(r+.32,depth/2+.04,gold,.05);
 }
 // 前埕
 box(14,.06,8.8,white,0,.03,-.4);
 // 牌樓中段：大圓拱、柱、匾、燈籠、綠瓦長脊與雙龍搶珠
 arch(0,4,5.6,6.6,2.15,4.1,.7);
 for(const s of [-1,1]){const x=s*3.05;cyl(.42,.46,1.2,white,x,.6,4.75);cyl(.3,.3,6.0,red,x,4.2,4.75);box(.75,.5,.75,gold,x,7.15,4.75);box(.75,.14,.78,azure,x,6.9,4.75);box(.36,3.3,.08,dark,x,3.9,5.09);}
 box(3.1,1.2,.2,red,0,7.15,4.32);box(3.25,1.32,.12,gold,0,7.15,4.2);panel(sign,2.75,.95,[0,0,1,1],0,7.15,4.44);
 box(8.6,.75,2.6,red,0,7.95,4.1);box(8.65,.2,2.65,azure,0,7.55,4.1);box(8.62,.12,2.62,gold,0,8.3,4.1);
 hip(tile,green,0,8.35,4.1,9.6,3.6,1.15,.32);
 for(const s of [-1,1]){const y=9.65,l=[];for(let i=0;i<=6;i++){const t=i/6;l.push([s*(.55+t*2.4),y+Math.sin(t*Math.PI*2)*.22+t*.25,4.1+Math.cos(t*Math.PI*1.5)*.12]);}tube(l,.1,green,12);ball(.2,.17,.24,green,s*.5,y+.12,4.1);bead(.08,.25,.08,gold,s*.5,y+.35,4.1);}
 cyl(.4,.4,.08,gold,0,10.0,4.1,[Math.PI/2,0,0]);ball(.15,.15,.15,red,0,10.0,4.15);bead(.12,.3,.12,gold,0,10.55,4.1);
 for(let i=0;i<5;i++){const x=(i-2)*.82;ball(.3,.34,.3,red,x,5.15,4.1);box(.02,.6,.02,dark,x,5.75,4.1);}
 box(4.3,.05,.05,dark,0,6.06,4.1);
 // 兩翼：紅磚小拱門、欄杆女兒牆、山牆小屋頂
 for(const s of [-1,1]){const x=s*5.35;
  arch(x,3.65,4.5,3.6,1.25,1.95,.55);
  box(4.9,.1,1.0,tile,x,3.55,4.15,[.45,0,0]);box(4.7,.75,.85,white,x,3.98,3.7);box(4.72,.2,.88,azure,x,3.98,3.7);for(let i=0;i<6;i++)box(.14,.28,.14,gold,x-2.1+i*.84,4.5,3.95);
  cyl(.36,.4,1.0,white,s*7.6,.5,4.6);cyl(.25,.25,5.4,red,s*7.6,3.7,4.6);box(.6,.4,.6,gold,s*7.6,6.3,4.6);box(.28,2.6,.06,dark,s*7.6,3.4,4.88);
  box(4.9,.55,2.4,red,x,6.25,4.1);box(4.92,.14,2.42,azure,x,5.95,4.1);
  gable(x,6.5,4.1,5.4,3.2,1.75);
 }
 for(const s of [-1,1]){const x=s*2.35;box(.75,.8,.9,white,x,.4,5.45);ball(.34,.42,.4,white,x,1.15,5.45);ball(.26,.26,.26,white,x,1.6,5.62);}
 for(const x of [-6.9,-5.8,-4.6,4.6,5.8,6.9]){cyl(.26,.2,.45,hallTile,x,.22,5.5);ball(.32,.4,.32,green,x,.75,5.5);}
 // 正殿：紅瓦屋頂與彩色剪黏
 box(10.4,.45,6.8,white,0,.22,-7.2);
 box(9.4,3.0,5.6,red,0,1.95,-7.5);box(8.2,2.6,.1,dark,0,1.75,-4.66);
 for(let i=0;i<6;i++)cyl(.2,.2,2.9,red,-4.2+i*1.68,1.9,-4.1);
 for(let i=0;i<7;i++)ball(.2,.24,.2,red,-3.6+i*1.2,2.85,-4.15);
 box(3.6,.42,.08,dark,0,3.1,-4.0);
 hip(hallTile,gold,0,3.45,-7.1,11,7.2,2.1,.3);
 const n=mobile?16:34;for(let i=0;i<n;i++){const u=rnd()*2-1,xx=u*3.4,hh=.15+(1-Math.abs(u))**.7*.9*rnd()+.1,c=colours[i%4];
  if(i%3===0){cyl(.06,.08,.3,c,xx,5.55+hh,-7.1+(rnd()-.5)*.3);ball(.07,.07,.07,colours[(i+1)%4],xx,5.75+hh,-7.1);}else bead(.09,.22,.09,c,xx,5.55+hh,-7.1+(rnd()-.5)*.3);}
 bead(.12,.4,.12,gold,0,6.7,-7.1);
 // 左側小亭
 box(1.8,2.6,1.8,red,-6.2,1.3,-4.6);
 {const x=-6.2,z=-4.6,w=2.6,h=.9,k=mobile?5:8;surface(hallTile,k,k,(i,j)=>{const xx=(i/k-.5)*w,zz=(j/k-.5)*w,t=Math.max(Math.abs(xx),Math.abs(zz))/(w/2),c=(Math.abs(xx)/(w/2))*(Math.abs(zz)/(w/2));return [x+xx,2.6+h*(1-t)**1.5+.3*c**3,z+zz];});bead(.12,.4,.12,gold,x,3.7,z);}
 // 匾額文字「后德門」（由右往左讀）
 mk.canvasMaterial(sign,768,256,(ctx,W,H)=>{ctx.fillStyle='#a3241b';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#e8b54a';ctx.lineWidth=14;ctx.strokeRect(10,10,W-20,H-20);ctx.fillStyle='#f3cf64';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 170px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';['門','德','后'].forEach((c,i)=>ctx.fillText(c,W*(i*.3+.2),H/2+8));});
 const result=mk.finish();
 result.bounds={x:[-8.1,8.1],z:[-10.7,6]};
 return result;
}
