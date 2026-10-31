import {BufferGeometry,Float32BufferAttribute} from 'three';
import {createMergeKit} from './merge-kit.js';

// 頂中街開基共善堂：臨街是一整排紅色鋼柱前棚，紅色封簷大梁上掛「開基 共善堂」紅匾，
// 沿梁掛著黃、紅圓燈籠；棚下是廟埕，後面是灰色石雕牆面、龍柱與彩繪雕板。
// 屋頂是淡金色琉璃瓦，前後兩落交疊的屋頂，彩色剪黏屋脊從前棚上方露出。本地座標 +z 為臨街方向。
export function createGongshan({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'gongshan'}),{add,box,ball,bead,cyl,tube,panel}=mk;
 const red='hallRed',tile='gongshanTile',roofDark='dark',stone='stone',dark='hallDark',azure='ceramicAzure',gold='hallGoldLight',sign='gongshanSign';
 const colours=[azure,gold,red,stone];
 let seed=71;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const quad=(v,a,b,c,d)=>v.push(...a,...b,...c,...a,...c,...d,...a,...c,...b,...a,...d,...c);
 const surface=(color,nx,nz,pt)=>{const v=[];for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)quad(v,pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1));const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(color,g);};
 function hip(x,y,z,w,d,h,ridge=.3,crown=1){
  const height=(xx,zz)=>{const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*ridge)/(w*(.5-ridge))));return h*Math.max(0,1-t)**1.2+.3*(Math.abs(xx)/(w/2))**6*(.4+.6*(Math.abs(zz)/(d/2))**2);};
  const nx=mobile?8:12,nz=mobile?4:6;surface(tile,nx,nz,(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [x+xx,y+height(xx,zz),z+zz];});
  box(w*.92,.12,d*.88,red,x,y-.06,z);
  const line=[[x-w*ridge-.3,y+h+.5,z]];for(let i=0;i<=6;i++)line.push([x+(i/6-.5)*2*w*ridge,y+h+.08,z]);line.push([x+w*ridge+.3,y+h+.5,z]);tube(line,.12,azure,10);
  for(const s of [-1,1])for(const f of [-1,1]){const l=[];for(let i=0;i<=4;i++){const t=i/4,xx=s*w*(ridge+(.5-ridge)*t),zz=f*d*.5*t;l.push([x+xx,y+height(xx,zz)+.08,z+zz]);}l.push([x+s*w*.53,y+.6,z+f*d*.53]);tube(l,.07,gold,8);}
  const n=Math.round((mobile?8:18)*crown);for(let i=0;i<n;i++){const u=rnd()*2-1,xx=u*w*ridge*1.1,hh=.15+(1-Math.abs(u))**.6*.9*crown*rnd(),c=colours[i%4];
   if(i%3===0){cyl(.06,.08,.32,c,x+xx,y+h+.2+hh,z);ball(.07,.07,.07,colours[(i+1)%4],x+xx,y+h+.4+hh,z);}else bead(.09,.24,.09,c,x+xx,y+h+.25+hh,z+(rnd()-.5)*.25);}
  for(const s of [-1,1]){tube([[x+s*.25,y+h+.3,z],[x+s*.8,y+h+.55,z+.08],[x+s*1.4,y+h+.35,z-.05]],.08,azure,6);}
  bead(.14,.45,.14,gold,x,y+h+.6,z);
 }
 // 前棚：紅鋼柱、封簷大梁、匾額、燈籠
 const x0=-7.2,x1=4.6,front=4.6,back=-.4,eave=4.9;
 surface(roofDark,4,2,(i,j)=>{const x=x0+(x1-x0)*i/4,z=back+(front-back)*j/2;return [x,eave+.35-(z-back)*.07,z];});
 box(x1-x0+.1,.75,.22,red,(x0+x1)/2,eave-.25,front);box(.2,.5,front-back,red,x0,eave,(front+back)/2);box(.2,.5,front-back,red,x1,eave,(front+back)/2);
 for(const x of [x0+.15,-2.6,x1-.15])box(.42,eave-.6,.42,red,x,(eave-.6)/2,front-.15);
 for(const x of [x0+.15,x1-.15])box(.3,eave,.3,red,x,eave/2,back+.2);
 box(3.6,1.2,.16,red,.9,eave-.95,front+.1);panel(sign,3.4,1.05,[0,0,1,1],.9,eave-.95,front+.2);
 for(let i=0;i<9;i++){const x=x0+.8+i*(x1-x0-1.6)/8;if(Math.abs(x-.9)<1.9&&i!==4)continue;ball(.24,.27,.24,i%2?red:gold,x,eave-.95,front-.05);}
 for(const x of [-.9,2.7])ball(.26,.3,.26,red,x,eave-.5,front+.25);
 // 廟身正面：灰石牆、龍柱、彩繪雕板
 const hx=.9;
 box(7,.35,1.6,stone,hx,.17,-.2);for(let i=0;i<2;i++)box(4,.12,.3,stone,hx,.06+i*.12,.75-i*.25);
 box(7.4,3.6,9.5,roofDark,hx,1.95,-5.6);
 box(1.6,2.3,.08,dark,hx,1.5,-.83);for(const s of [-1,1]){box(1.1,1.9,.08,dark,hx+s*2.2,1.3,-.83);cyl(.2,.22,3.1,stone,hx+s*1.15,1.9,-.55);tube([[hx+s*1.15+.22,.6,-.42],[hx+s*1.15-.2,1.4,-.42],[hx+s*1.15+.2,2.2,-.42],[hx+s*1.15-.18,3.0,-.42]],.07,stone,6);}
 for(let i=0;i<9;i++)box(.75,.55,.08,[azure,gold,red][i%3],hx-3.2+i*.8,3.3,-.82);
 box(7.4,.25,.2,red,hx,3.7,-.8);
 // 兩落淡金色琉璃瓦屋頂
 hip(hx,3.75,-3.0,8.2,4.6,1.6,.28,1);
 hip(hx,4.1,-7.4,8.6,5.4,2.0,.3,1.25);
 // 匾額文字「開基 共善堂」（由右往左讀）
 mk.canvasMaterial(sign,768,240,(ctx,W,H)=>{ctx.fillStyle='#b02a1f';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#f2d27a';ctx.lineWidth=8;ctx.strokeRect(10,10,W-20,H-20);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#f6e7c8';ctx.font='bold 54px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';['基','開'].forEach((c,i)=>ctx.fillText(c,W*(.38+i*.24),48));
  ctx.fillStyle='#ffffff';ctx.font='bold 140px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';['堂','善','共'].forEach((c,i)=>ctx.fillText(c,W*(i*.3+.2),H*.62));});
 const result=mk.finish();
 result.bounds={x:[-7.4,4.8],z:[-10.4,4.9]};
 return result;
}
