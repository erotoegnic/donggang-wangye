import {BufferGeometry,Float32BufferAttribute} from 'three';
import {createMergeKit} from './merge-kit.js';

// 安海街福安宮：街角的單層廟，前方墊高幾階。整面拱形採光棚橫跨廟前，棚口掛「宮」「安」「福」圓牌；
// 棚下是深灰石雕牆、紅柱與紅燈籠。中央綠琉璃瓦屋頂上立著「福安宮」招牌，左右兩角各一座
// 兩重綠色攢尖頂的鐘鼓樓。廟前右側有一棵大樹，種在紅色格柵圍起的圓形花台裡。本地座標 +z 為廟門方向。
export function createFuan({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'fuan'}),{add,box,ball,cyl,tube,panel}=mk;
 const tile='jadeTile',wall='dark',door='hallDark',red='hallRed',stone='zhenhaiStone',canopy='ceramicWhite',leaf='leaf',sign='fuanSign';
 const pushQuad=(v,a,b,c,d)=>v.push(...a,...b,...c,...a,...c,...d,...a,...c,...b,...a,...d,...c);
 const surface=(color,nx,nz,pt)=>{const v=[];for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)pushQuad(v,pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1));const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(color,g);};
 // 歇山／廡殿式屋頂：中段平脊，四角簷口翹起
 function roof(x,y,z,w,d,h,ridge=.28){
  const height=(xx,zz)=>{const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*ridge)/(w*(.5-ridge))));return h*Math.max(0,1-t)**1.25+.32*(Math.abs(xx)/(w/2))**6*(.4+.6*(Math.abs(zz)/(d/2))**2);};
  surface(tile,mobile?8:12,mobile?4:6,(i,j)=>{const xx=(i/(mobile?8:12)-.5)*w,zz=(j/(mobile?4:6)-.5)*d;return [x+xx,y+height(xx,zz),z+zz];});
  box(w*.92,.12,d*.88,red,x,y-.06,z);
  const line=[];for(let i=0;i<=8;i++){const xx=(i/8-.5)*2*w*ridge;line.push([x+xx,y+h+.05,z]);}
  line.unshift([x-w*ridge-.25,y+h+.4,z]);line.push([x+w*ridge+.25,y+h+.4,z]);tube(line,.09,tile,10);
  for(const s of [-1,1])for(const f of [-1,1]){const hip=[];for(let i=0;i<=4;i++){const t=i/4,xx=s*w*(ridge+(.5-ridge)*t),zz=f*d*.5*t;hip.push([x+xx,y+height(xx,zz)+.08,z+zz]);}hip.push([x+s*w*.53,y+.6,z+f*d*.53]);tube(hip,.06,tile,8);}
  return height;
 }
 // 攢尖頂：四面收到一點，簷角上翹
 function pyramid(x,y,z,w,h){
  const n=mobile?6:10;surface(tile,n,n,(i,j)=>{const xx=(i/n-.5)*w,zz=(j/n-.5)*w,t=Math.max(Math.abs(xx),Math.abs(zz))/(w/2),c=(Math.abs(xx)/(w/2))*(Math.abs(zz)/(w/2));return [x+xx,y+h*(1-t)**1.6+.3*c**3,z+zz];});
  box(w*.84,.14,w*.84,red,x,y-.05,z);
  for(const s of [-1,1])for(const f of [-1,1])tube([[x,y+h,z],[x+s*w*.25,y+h*.4,z+f*w*.25],[x+s*w*.5,y+.3,z+f*w*.5],[x+s*w*.56,y+.48,z+f*w*.56]],.05,tile,8);
 }
 // 台基與前階
 box(9.2,.45,6.8,stone,0,.225,-.4);
 for(let i=0;i<3;i++)box(7.4,.15,.32,stone,0,.075+i*.15,3.62-i*.3);
 // 正殿牆身與門
 box(8,2.5,5,wall,0,1.7,-1.2);
 box(1.5,1.95,.08,door,0,1.43,1.32);for(const s of [-1,1]){box(1.05,1.6,.08,door,s*2.45,1.25,1.32);box(.7,.7,.08,door,s*1.35,1.75,1.32);box(.6,.6,.08,door,s*3.45,1.8,1.32);}
 box(8.1,.18,5.1,red,0,2.9,-1.2);
 // 紅柱與燈籠
 for(const x of [-3.7,-1.55,1.55,3.7])cyl(.14,.15,2.5,red,x,1.7,2.9);
 for(const x of [-3.1,-2.3,-.8,.8,2.3,3.1])ball(.22,.26,.22,red,x,2.45,2.6);
 // 拱形採光棚：橫向中央拱起、縱向成弧，前緣有一圈飾板
 const edge=x=>3.05+.5*(1-(x/4.5)**2);
 surface(canopy,mobile?10:16,mobile?3:5,(i,j)=>{const xx=(i/(mobile?10:16)-.5)*9,u=j/(mobile?3:5);return [xx,edge(xx)+.55*Math.sin(Math.PI*.75*u)-.08*u,1.25+u*2.05];});
 surface(canopy,mobile?10:16,1,(i,j)=>{const xx=(i/(mobile?10:16)-.5)*9;return [xx,edge(xx)+.31-j*.6,3.3];});
 const rim=[];for(let i=0;i<=10;i++){const xx=(i/10-.5)*9;rim.push([xx,edge(xx)+.31,3.32]);}tube(rim,.05,stone,14);
 const rim2=[];for(let i=0;i<=10;i++){const xx=(i/10-.5)*9;rim2.push([xx,edge(xx)-.29,3.32]);}tube(rim2,.04,stone,14);
 // 「宮」「安」「福」圓牌（由左至右）
 [['g',-1.75],['a',0],['f',1.75]].forEach(([k,x],i)=>panel(sign,.82,.82,[i/3,0,(i+1)/3,.5],x,edge(x),3.35));
 // 中央屋頂、綠脊與招牌
 box(6.4,.6,4.6,wall,0,3.25,-1.4);roof(0,3.5,-1.3,6.6,5.0,1.85,.22);
 box(5.2,.36,.08,door,0,3.25,1.42);
 box(3.5,1.2,.16,canopy,0,5.85,-1.2);box(.12,.6,.12,red,-1.4,5.25,-1.2);box(.12,.6,.12,red,1.4,5.25,-1.2);
 panel(sign,3.3,1.05,[0,.5,1,1],0,5.85,-1.1);
 // 左右鐘鼓樓：兩重綠色攢尖頂
 for(const s of [-1,1]){const x=s*3.55,z=.5;
  box(1.9,1.4,1.9,red,x,3.65,z);
  pyramid(x,4.3,z,2.9,.6);
  box(1.3,.85,1.3,red,x,4.95,z);box(.8,.45,.06,door,x,4.95,z+.66);
  pyramid(x,5.4,z,2.3,1.15);
  cyl(.06,.12,.35,tile,x,6.7,z);ball(.17,.24,.17,tile,x,6.95,z);cyl(.02,.05,.25,tile,x,7.22,z);
 }
 // 街角大樹與紅格柵花台
 const tx=5.75,tz=2.55;
 cyl(1.3,1.35,.55,stone,tx,.275,tz);
 const n=mobile?14:22;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;box(.07,.62,.07,red,tx+Math.cos(a)*1.18,.86,tz+Math.sin(a)*1.18);}
 const ring=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI*2;ring.push([tx+Math.cos(a)*1.18,1.17,tz+Math.sin(a)*1.18]);}tube(ring,.05,red,18,true);
 const ring2=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI*2;ring2.push([tx+Math.cos(a)*1.18,.8,tz+Math.sin(a)*1.18]);}tube(ring2,.035,red,18,true);
 cyl(.16,.24,2.6,door,tx,1.8,tz);tube([[tx,2.4,tz],[tx-.5,3.0,tz-.2],[tx-.9,3.4,tz-.3]],.09,door,4);
 ball(2.2,1.6,2.0,leaf,tx-.25,3.9,tz-.1);ball(1.3,1.1,1.3,leaf,tx-1.35,3.55,tz+.2);ball(1.3,1.1,1.25,leaf,tx+1.0,3.5,tz+.3);ball(1.2,1.0,1.2,leaf,tx-.1,4.6,tz-.4);
 // 文字貼圖：上半為招牌「宮安福」（由右往左讀），下半為三面圓牌
 mk.canvasMaterial(sign,768,512,(ctx,W,H)=>{
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#f4ead2';ctx.fillRect(0,0,W,H/2);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#c42b20';ctx.font='bold 190px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';
  ['宮','安','福'].forEach((c,i)=>ctx.fillText(c,W*(i*.3+.2),H/4+8));
  ['宮','安','福'].forEach((c,i)=>{const cx=W*(i+.5)/3,cy=H*.75,r=H/4-6;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle='#c42b20';ctx.fill();ctx.beginPath();ctx.arc(cx,cy,r*.82,0,Math.PI*2);ctx.fillStyle='#f0c531';ctx.fill();ctx.fillStyle='#c42b20';ctx.font='bold 150px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';ctx.fillText(c,cx,cy+6);});
 },{alphaTest:.5});
 const result=mk.finish();
 result.bounds={x:[-4.7,7.8],z:[-3.8,4]};
 return result;
}
