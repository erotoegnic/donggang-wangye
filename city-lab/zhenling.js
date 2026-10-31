import {BufferGeometry,Float32BufferAttribute} from 'three';
import {createMergeKit} from './merge-kit.js';

// 埔仔角鎮靈宮：三層對稱的宮殿式廟宇。一樓是淺灰牆面與紅柱、石獅，左右兩道白石欄杆長梯
// 從兩端斜斜往上接二樓全寬平台；二樓正殿有石雕龍柱與燈籠，上方一整排綠瓦紅簷、金色斗拱；
// 三樓平台中央是重簷廡殿頂主殿，脊上雙龍搶珠，左右兩角各一座兩重屋頂的角樓。
// 屋瓦為深綠色、簷口紅色。本地座標 +z 為廟門方向。
export function createZhenling({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'zhenling'}),{add,box,ball,bead,cyl,tube,panel}=mk;
 const tile='zhenlingTile',red='hallRed',white='ceramicWhite',wall='zhenhaiStone',dark='hallDark',gold='hallGoldLight',azure='ceramicAzure',sign='zhenlingSign';
 const quad=(v,a,b,c,d)=>v.push(...a,...b,...c,...a,...c,...d,...a,...c,...b,...a,...d,...c);
 const surface=(color,nx,nz,pt)=>{const v=[];for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)quad(v,pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1));const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(color,g);};
 // 廡殿頂；skirt=true 時只做重簷的下層一圈
 function hip(x,y,z,w,d,h,{ridge=.3,skirt=false,lift=.35}={}){
  const height=(xx,zz)=>{const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*ridge)/(w*(.5-ridge))));return h*Math.max(0,1-t)**1.2+lift*(Math.abs(xx)/(w/2))**6*(.4+.6*(Math.abs(zz)/(d/2))**2);};
  const nx=mobile?8:12,nz=mobile?4:6;surface(tile,nx,nz,(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [x+xx,y+(skirt?Math.min(height(xx,zz),h*.45):height(xx,zz)),z+zz];});
  box(w*.93,.2,d*.9,red,x,y-.08,z);
  if(!skirt){const line=[[x-w*ridge-.3,y+h+.4,z]];for(let i=0;i<=6;i++)line.push([x+(i/6-.5)*2*w*ridge,y+h+.06,z]);line.push([x+w*ridge+.3,y+h+.4,z]);tube(line,.1,red,10);}
  for(const s of [-1,1])for(const f of [-1,1]){const l=[];for(let i=skirt?2:0;i<=4;i++){const t=i/4,xx=s*w*(ridge+(.5-ridge)*t),zz=f*d*.5*t;l.push([x+xx,y+height(xx,zz)*(skirt&&i===2?.45/(height(xx,zz)/h||1)*1:1)+.06,z+zz]);}l.push([x+s*w*.54,y+lift+.25,z+f*d*.54]);if(l.length>2)tube(l,.06,red,6);}
 }
 // 長條單坡簷（二樓整排綠瓦）
 function shed(y,z,w,d,drop){surface(tile,mobile?10:16,2,(i,j)=>{const xx=(i/(mobile?10:16)-.5)*w,u=j/2;return [xx,y-drop*u+.35*(Math.abs(xx)/(w/2))**6,z+u*d];});box(w,.22,.25,red,0,y-drop-.05,z+d);box(w-.4,.5,.4,gold,0,y-drop-.4,z+d-.3);}
 function balustrade(x0,x1,y,z,ry=0){const n=Math.max(2,Math.round(Math.abs(x1-x0)/.9));for(let i=0;i<=n;i++)box(.16,.6,.16,white,x0+(x1-x0)*i/n,y+.3,z);box(Math.abs(x1-x0),.1,.14,white,(x0+x1)/2,y+.62,z);box(Math.abs(x1-x0),.3,.06,gold,(x0+x1)/2,y+.3,z);}
 // 一樓
 box(14.4,3.2,9.6,wall,0,1.6,-2.2);
 for(const s of [-1,1]){for(const x of [3.9,6.0])box(1.2,.9,.06,dark,s*x,1.7,2.62);box(1.3,1.8,.06,dark,s*2.1,1.1,2.62);}
 box(2.2,2.4,.06,wall,0,1.2,2.64);
 for(const x of [-3.0,-1.15,1.15,3.0])cyl(.2,.22,3.2,red,x,1.6,2.9);
 for(const s of [-1,1]){box(.6,.7,.7,wall,s*3.6,.35,3.5);ball(.3,.4,.34,wall,s*3.6,1.0,3.5);ball(.22,.22,.22,wall,s*3.6,1.4,3.65);}
 // 左右斜梯
 for(const s of [-1,1]){const xa=s*9.6,xb=s*4.4,dy=3.3,L=Math.hypot(xb-xa,dy),a=Math.atan2(dy,Math.abs(xb-xa));
  box(L,.3,1.5,white,(xa+xb)/2,dy/2,4.2,[0,0,-s*a]);
  box(L,.6,.12,white,(xa+xb)/2,dy/2+.45,4.95,[0,0,-s*a]);box(L,.18,.06,gold,(xa+xb)/2,dy/2+.4,5.0,[0,0,-s*a]);
  box(.16,3.3,.16,white,xa*0+s*7,1.65,4.0);}
 // 二樓平台與正殿
 box(15.6,.35,11.2,white,0,3.35,-1.7);box(8.8,.35,1.5,white,0,3.35,4.2);
 balustrade(-4.4,4.4,3.5,4.9);balustrade(-7.8,-4.4,3.5,3.85);balustrade(4.4,7.8,3.5,3.85);
 box(13.6,3.3,7.6,wall,0,5.15,-3);
 for(const s of [-1,1]){cyl(.3,.3,3.3,wall,s*1.6,5.15,1.1);box(1.3,1.9,.06,dark,s*3.1,4.5,.83);box(.3,3.3,.3,red,s*4.6,5.15,1.0);box(.3,3.3,.3,red,s*6.7,5.15,1.0);box(1.4,1.1,.05,azure,s*5.65,5.4,.82);}
 box(2.4,2.1,.06,dark,0,4.6,.83);
 for(let i=0;i<5;i++)ball(.22,.26,.22,i%2?red:gold,(i-2)*.55,5.9,.9);
 box(13.4,.5,.2,azure,0,6.5,.95);
 shed(7.55,-.2,16.4,2.6,.75);
 // 三樓平台、主殿、重簷廡殿頂
 box(15.6,.3,6.2,white,0,7.75,-2.4);balustrade(-4,4,7.9,.6);balustrade(-7.6,-4,7.9,.4);balustrade(4,7.6,7.9,.4);
 box(7.4,3.1,4.6,wall,0,9.45,-2.4);
 for(const s of [-1,1]){cyl(.26,.26,3.1,wall,s*1.3,9.45,0);box(.28,3.1,.28,red,s*3.4,9.45,-.05);box(1.1,1.6,.05,dark,s*2.3,9.0,-.08);}
 box(1.6,1.9,.05,dark,0,8.9,-.08);for(let i=0;i<3;i++)ball(.2,.24,.2,red,(i-1)*.7,10.1,.1);
 box(2.6,.8,.12,gold,0,10.55,-.02);panel(sign,2.4,.66,[0,0,1,1],0,10.55,.06);
 box(7.6,.45,4.8,gold,0,11.05,-2.4);
 hip(0,11.3,-2.4,10.4,7.4,1.3,{skirt:true});
 box(7.0,.8,4.4,red,0,12.0,-2.4);box(7.1,.3,4.5,gold,0,12.35,-2.4);
 hip(0,12.5,-2.4,9.2,6.4,1.9,{ridge:.3,lift:.45});
 for(const s of [-1,1]){const l=[];for(let i=0;i<=6;i++){const t=i/6;l.push([s*(.6+t*2.0),14.6+Math.sin(t*Math.PI*2)*.2+t*.2,-2.4+Math.cos(t*Math.PI*1.5)*.1]);}tube(l,.1,tile,10);ball(.18,.16,.22,tile,s*.55,14.7,-2.4);}
 cyl(.34,.34,.07,gold,0,15.0,-2.4,[Math.PI/2,0,0]);bead(.1,.3,.1,gold,0,15.5,-2.4);
 // 左右角樓：兩重屋頂
 for(const s of [-1,1]){const x=s*6.2,z=-1.5;
  box(2.8,2.9,2.8,wall,x,9.3,z);for(const a of [-1,1])for(const b of [-1,1])cyl(.15,.15,2.9,red,x+a*1.38,9.3,z+b*1.38);box(.9,1.6,.05,dark,x-.55,9.3,z+1.42);box(.9,1.6,.05,dark,x+.55,9.3,z+1.42);
  hip(x,10.85,z,4.0,4.0,.9,{ridge:.12,lift:.45});
  box(2.0,1.0,2.0,red,x,11.75,z);box(1.2,.6,.05,dark,x,11.75,z+1.02);
  hip(x,12.25,z,3.3,3.3,1.1,{ridge:.08,lift:.4});
  bead(.12,.45,.12,gold,x,13.65,z);
 }
 // 匾額「鎮靈宮」：綠底金字（由右往左讀）
 mk.canvasMaterial(sign,768,212,(ctx,W,H)=>{ctx.fillStyle='#4f6d5f';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#c9993f';ctx.lineWidth=12;ctx.strokeRect(8,8,W-16,H-16);ctx.fillStyle='#e2b04a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 150px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';['宮','靈','鎮'].forEach((c,i)=>ctx.fillText(c,W*(i*.3+.2),H/2+6));});
 const result=mk.finish();
 result.bounds={x:[-9.8,9.8],z:[-7.2,5.2]};
 return result;
}
