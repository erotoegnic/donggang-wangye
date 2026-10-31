import {BufferGeometry,Float32BufferAttribute} from 'three';
import {createMergeKit} from './merge-kit.js';

// 下頭角東福殿（城隍廟）：沿延平路（屏128鄉道）是一座長長的紅色鋼構雨棚，淺坡浪板屋頂從空中看是橘紅色，
// 一端屋頂上架著黃色「城隍廟」招牌；紅色鋼柱間的棚頂掛滿一排排紅燈籠，棚下是寬敞的廟埕。廟身在雨棚後側：單層灰色石雕牆、
// 石獅與「城隍廟」匾；側面是紅磚牆、小拱門與鋸齒女兒牆，上方前後兩落硬山頂，
// 山牆面藍綠彩繪、燕尾脊上剪黏很高。本地座標 +z 為臨街方向，廟身在 +x 側。
export function createDongfu({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'dongfu'}),{add,box,ball,bead,cyl,tube,panel}=mk;
 const canopy='dongfuCanopy',red='hallRed',wall='dark',dark='hallDark',roofTile='dongfuRoof',azure='ceramicAzure',green='ceramicGreen',gold='hallGoldLight',sign='dongfuSign';
 const colours=[azure,green,gold,red];
 let seed=53;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const quad=(v,a,b,c,d)=>v.push(...a,...b,...c,...a,...c,...d,...a,...c,...b,...a,...d,...c);
 const surface=(color,nx,nz,pt)=>{const v=[];for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)quad(v,pt(i,j),pt(i+1,j),pt(i+1,j+1),pt(i,j+1));const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(color,g);};
 // 雨棚：脊線沿 x 的淺坡屋頂，前緣厚紅色封簷
 const cx0=-7,cx1=5.4,cz0=-1.2,cz1=5.2,eave=4.7,peak=.7,mid=(cz0+cz1)/2;
 surface(canopy,mobile?4:6,mobile?4:6,(i,j)=>{const x=cx0+(cx1-cx0)*i/(mobile?4:6),z=cz0+(cz1-cz0)*j/(mobile?4:6);return [x,eave+peak*(1-Math.abs(z-mid)/((cz1-cz0)/2)),z];});
 box(cx1-cx0+.1,.55,.18,red,(cx0+cx1)/2,eave-.15,cz1);box(cx1-cx0+.1,.4,.16,red,(cx0+cx1)/2,eave-.1,cz0);
 for(const x of [cx0,cx1])box(.16,.4,cz1-cz0,red,x,eave-.1,mid);
 for(let i=0;i<=(mobile?4:6);i++){const x=cx0+(cx1-cx0)*i/(mobile?4:6);tube([[x,eave-.3,cz0],[x,eave+peak-.15,mid],[x,eave-.3,cz1]],.06,red,4);}
 for(const x of [-6.8,-3.2,-.5,5.2])box(.22,eave-.2,.3,red,x,(eave-.2)/2,cz1-.15);
 for(const x of [-6.8,-3.2])box(.22,eave-.2,.3,red,x,(eave-.2)/2,cz0+.2);
  // 燈籠：三排掛滿棚下
 const rows=mobile?3:5,cols=mobile?8:14;for(let r=0;r<rows;r++)for(let i=0;i<cols;i++)ball(.19,.23,.19,red,cx0+.5+(i+(r%2)*.5)*(cx1-cx0-1.2)/(cols-.5),eave-.5-(r%2)*.12,cz1-.5-r*(cz1-cz0-1)/(rows-1));
 // 廟身：正面灰石牆、門、石獅、匾額
 const hx=2.3;
 box(6,.3,9.4,wall,hx,.15,-5.6);
 box(5.8,3.5,.4,wall,hx,2.05,-1.1);box(1.4,2.0,.08,dark,hx,1.3,-.88);for(const s of [-1,1]){box(.9,1.7,.08,dark,hx+s*1.85,1.15,-.88);box(.32,2.8,.36,wall,hx+s*1.05,1.7,-.78);}
 box(3.9,.5,.1,red,hx,2.9,-.86);for(let i=0;i<5;i++)box(.42,.9,.06,[gold,azure,red,azure,gold][i],hx-1.4+i*.7,2.25,-.82);
 for(const s of [-1,1]){const x=hx+s*2.4;box(.6,.6,.7,wall,x,.6,-.2);ball(.3,.38,.34,wall,x,1.15,-.2);ball(.22,.22,.22,wall,x,1.55,-.05);}
 box(3.1,.9,.14,red,hx,3.3,-.84);panel(sign,2.8,.76,[0,.5,1,1],hx,3.3,-.76);
 // 雨棚頂上一端的黃色「城隍廟」招牌架
 for(const x of [-6.6,-4.6])box(.08,.9,.08,red,x,eave+.85,mid+.4);box(2.4,.85,.1,gold,-5.6,eave+1.45,mid+.4);panel(sign,2.2,.72,[0,0,1,.5],-5.6,eave+1.45,mid+.46);
 // 側面紅磚牆、小拱門、鋸齒女兒牆
 box(.3,2.9,9.2,red,hx+3.0,1.45,-5.6);box(.06,1.6,.8,dark,hx+3.17,.8,-4.2);ball(.04,.4,.4,dark,hx+3.17,1.6,-4.2);
 for(let i=0;i<6;i++){box(.32,.32,1.4,canopy,hx+3.0,3.05,-1.6-i*1.55);box(.32,.12,.3,canopy,hx+3.0,2.95,-2.35-i*1.55);}
 box(.7,.1,9.2,dark,hx+3.25,2.75,-5.6);
 box(.3,2.9,9.2,red,hx-3.0,1.45,-5.6);box(5.8,2.9,.3,red,hx,1.45,-10.1);
 // 兩落硬山頂：脊線沿 x，山牆朝兩側，燕尾脊與高剪黏
 for(const [z,d,h,ridgeH] of [[-3.1,3.8,1.6,1.4],[-7.6,4.4,1.9,2.0]]){
  const y=2.95,w=6.4,nz=mobile?4:6;
  surface(roofTile,mobile?4:6,nz,(i,j)=>{const xx=(i/(mobile?4:6)-.5)*w,zz=(j/nz-.5)*d;return [hx+xx,y+h*(1-Math.abs(zz)/(d/2)),z+zz];});
  for(const s of [-1,1]){const g=new BufferGeometry(),x=hx+s*(w/2-.02);g.setAttribute('position',new Float32BufferAttribute([x,y,z-d/2+.1,x,y,z+d/2-.1,x,y+h-.1,z,x,y,z-d/2+.1,x,y+h-.1,z,x,y,z+d/2-.1],3));g.computeVertexNormals();add(azure,g);
   for(const f of [-1,1])tube([[x+s*.05,y+h+.05,z],[x+s*.05,y+.05,z+f*d/2]],.07,green,4);
   ball(.3,.3,.08,gold,x+s*.06,y+h*.5,z,[0,Math.PI/2,0]);}
  box(w*.82,.3,.24,green,hx,y+h+.12,z);
  for(const s of [-1,1])tube([[hx+s*w*.38,y+h+.2,z],[hx+s*w*.48,y+h+.5,z],[hx+s*w*.54,y+h+ridgeH*.9,z],[hx+s*w*.5,y+h+ridgeH,z]],.11,s<0?azure:green,8);
  const n=mobile?8:16;for(let i=0;i<n;i++){const u=rnd()*2-1,xx=u*w*.36,hh=.25+(1-Math.abs(u))**.5*ridgeH*.55*rnd(),c=colours[i%4];
   if(i%3===0){cyl(.07,.09,.4,c,hx+xx,y+h+.25+hh,z);ball(.08,.08,.08,colours[(i+1)%4],hx+xx,y+h+.5+hh,z);}else bead(.1,.26,.1,c,hx+xx,y+h+.3+hh,z+(rnd()-.5)*.2);}
  bead(.14,.5,.14,gold,hx,y+h+ridgeH*.7,z);
 }
 // 匾額文字「城隍廟」（由右往左讀）
 mk.canvasMaterial(sign,768,512,(ctx,W,H)=>{const h=H/2,font='bold 170px "Noto Serif TC","Noto Serif CJK TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=font;
  ctx.fillStyle='#4a3b2c';ctx.fillRect(0,0,W,h);ctx.strokeStyle='#c9993f';ctx.lineWidth=12;ctx.strokeRect(8,8,W-16,h-16);ctx.fillStyle='#e8c46a';['廟','隍','城'].forEach((c,i)=>ctx.fillText(c,W*(i*.3+.2),h/2+8));
  ctx.fillStyle='#f2c531';ctx.fillRect(0,h,W,h);ctx.fillStyle='#c42b20';['城','隍','廟'].forEach((c,i)=>ctx.fillText(c,W*(i*.3+.2),h*1.5+8));});
 const result=mk.finish();
 result.bounds={x:[-7.2,5.7],z:[-10.4,5.4]};
 return result;
}
