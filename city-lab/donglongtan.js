import {BufferGeometry,Float32BufferAttribute,CylinderGeometry} from 'three';
import {createMergeKit} from './merge-kit.js';

// 頂頭角東隆壇：夾在街屋之間的窄高廟。一樓深紅牆面開圓拱門，左右兩道白石欄杆樓梯
// 從拱門兩側往上接二樓平台；二樓正殿有石龍柱與紅燈籠，平台兩角各一座小亭。
// 屋頂為兩重簷深紅瓦、綠色簷線，屋脊上方是密集的彩色剪黏與小寶塔。本地座標 +z 為廟門方向。
export function createDonglongtan({mobile=false}={}){
 const mk=createMergeKit({mobile,name:'donglongtan'}),{add,m4,box,ball,bead,cyl,tube}=mk;
 const tile='donglongtanTile',wall='hallRed',white='ceramicWhite',gold='hallGoldLight',green='ceramicGreen',azure='ceramicAzure',red='ceramicRed',dark='hallDark';
 const colours=[azure,green,gold,red,white];
 let seed=97;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 function roof(x,y,z,w,d,h,{crown=0,corners=true}={}){
  const height=(xx,zz)=>{const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*.28)/(w*.22)));return h*Math.max(0,1-t)**1.3+.28*(Math.abs(xx)/(w/2))**6+.12*(Math.abs(zz)/(d/2))**6;};
  const nx=mobile?8:12,nz=mobile?4:6,v=[],pt=(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [x+xx,y+height(xx,zz),z+zz];};
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),e=pt(i,j+1);v.push(...a,...c,...b,...a,...e,...c,...a,...b,...c,...a,...c,...e);}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(v,3));g.computeVertexNormals();add(tile,g);
  box(w*.9,.1,d*.86,dark,x,y-.06,z);
  for(const side of [-1,1]){const e=[];for(let i=0;i<=8;i++){const xx=(i/8-.5)*w;e.push([x+xx,y+height(xx,side*d/2),z+side*d/2]);}tube(e,.06,green,12);}
  for(const end of [-1,1]){const e=[];for(let i=0;i<=4;i++){const zz=(i/4-.5)*d;e.push([x+end*w/2,y+height(end*w/2,zz),z+zz]);}tube(e,.05,green,6);}
  const rw=w*.3,line=[];for(let i=0;i<=8;i++){const xx=(i/8-.5)*2*rw;line.push([x+xx,y+h+.06,z]);}tube(line,.08,red,8);
  if(corners)for(const end of [-1,1])for(const side of [-1,1]){
   const hip=[];for(let i=0;i<=5;i++){const t=i/5,xx=end*w*(.28+.22*t),zz=side*d*.5*t;hip.push([x+xx,y+height(xx,zz)+.07,z+zz]);}hip.push([x+end*w*.54,y+.62,z+side*d*.54]);tube(hip,.05,gold,8);
   for(let i=0;i<(mobile?2:4);i++){const t=.25+i*.18,xx=end*w*(.28+.22*t),zz=side*d*.5*t;bead(.07,.18,.07,colours[(i+end+side+4)%5],x+xx,y+height(xx,zz)+.22,z+zz);}
  }
  if(crown){
   // 密集剪黏：神將、花鳥與雙龍擠滿屋脊上方
   const n=Math.round(crown*(mobile?.5:1));
   for(let i=0;i<n;i++){const u=rnd()*2-1,xx=u*rw*1.45,zz=(rnd()-.5)*d*.36,hh=.12+(1-Math.abs(u))**.6*1.7*rnd()+.1;
    const c=colours[i%5];
    if(i%4===0){cyl(.05,.07,.28,c,x+xx,y+h+hh,z+zz);ball(.06,.06,.06,colours[(i+2)%5],x+xx,y+h+hh+.2,z+zz);}
    else bead(.08+rnd()*.06,.14+rnd()*.14,.08,c,x+xx,y+h+hh+.1,z+zz,[0,rnd()*3,(rnd()-.5)*.8]);
   }
   for(const end of [-1,1]){
    tube([[x+end*rw*1.05,y+h+.1,z],[x+end*rw*1.25,y+h+.6,z],[x+end*rw*1.05,y+h+1.05,z],[x+end*rw*.75,y+h+1.2,z],[x+end*rw*.55,y+h+1.5,z]],.09,green,10);
    tube([[x+end*rw*1.05,y+h+.15,z+.06],[x+end*rw*1.2,y+h+.6,z+.08],[x+end*rw*1,y+h+1,z+.08],[x+end*rw*.7,y+h+1.12,z+.06]],.045,gold,8);
    bead(.16,.12,.12,azure,x+end*rw*.5,y+h+1.55,z);
    for(const dz of [-.2,.2])tube([[x+end*rw*1.1,y+h+.1,z+dz],[x+end*rw*1.4,y+h+.55,z+dz*1.4],[x+end*rw*1.5,y+h+.95,z+dz*1.6]],.04,colours[(dz>0?0:3)],5);
   }
   ball(.14,.14,.14,gold,x,y+h+1.5,z);
   for(let i=0;i<4;i++){const r=.17-i*.03;cyl(r*.7,r,.13,i%2?red:gold,x,y+h+1.7+i*.15,z);}bead(.05,.16,.05,gold,x,y+h+2.35,z);
  }
 }
 const F=2.6;
 // 一樓：深紅牆面與圓拱門
 box(7.2,.08,7.8,'ceramicWhite',0,.04,-1.5);
 box(5.8,F,6,wall,0,F/2,-2.2);
 const archW=.95,archY=1.55;
 box(archW*2,archY,.06,dark,0,archY/2,.83);add(dark,new CylinderGeometry(archW,archW,.06,mobile?10:20,1,false,Math.PI/2,Math.PI),m4([0,archY,.83],[1,1,1],[Math.PI/2,0,0]));
 const arch=[];for(let i=0;i<=12;i++){const a=Math.PI*i/12;arch.push([Math.cos(a)*(archW+.08),archY+Math.sin(a)*(archW+.08),.9]);}tube([[archW+.08,0,.9],...arch,[-archW-.08,0,.9]],.07,gold,20);
 box(archW*2+.6,.12,.25,white,0,.06,1.0);
 // 左右白石樓梯：由中央平台往兩側斜下
 const steps=mobile?8:11;
 for(const side of [-1,1]){
  // 樓梯往外、往前彎出，像兩道拱橋把拱門夾在中間
  const at=t=>[side*(1.3+2.05*t),1.2+.55*t*t];
  for(let i=0;i<steps;i++){const t=(i+.5)/steps,top=F*(1-i/steps),[xx,zz]=at(t);box(2.05/steps+.06,top,.8,white,xx,top/2,zz,-side*.5*t);}
  for(const dz of [-.36,.36]){const rail=[];for(let i=0;i<=8;i++){const t=i/8,[xx,zz]=at(t);rail.push([xx,F*(1-t)**1.15+.58,zz+dz]);}tube(rail,.06,white,12);
   for(let i=0;i<=6;i++){const t=i/6,[xx,zz]=at(t);box(.12,.62,.12,white,xx,F*(1-t)**1.15+.28,zz+dz);}}
  cyl(.03,.03,.7,dark,side*3.45,.35,2.25);ball(.13,.13,.13,gold,side*3.45,.78,2.25);
  cyl(.03,.03,.6,dark,side*1.2,F+.3,1.7);ball(.12,.12,.12,gold,side*1.2,F+.68,1.7);
 }
 // 二樓平台與白欄杆
 box(5.9,.16,6.6,white,0,F+.06,-1.9);box(2.6,.16,.85,white,0,F+.06,1.25);
 tube([[-1.25,F+.6,1.65],[1.25,F+.6,1.65]],.06,white,4);for(let i=0;i<=6;i++)box(.1,.55,.1,white,-1.2+i*.4,F+.4,1.65);
 box(2.2,.3,.05,gold,0,F-.25,.86);
 // 平台兩角小亭
 for(const side of [-1,1]){
  box(.95,1.3,.95,wall,side*2.45,F+.8,.2);box(.6,.75,.04,gold,side*2.45,F+.85,.69);
  roof(side*2.45,F+1.45,.2,1.5,1.5,.45,{corners:true});
  tube([[side*1.35,F+.55,1.2],[side*1.95,F+.55,.75]],.05,white,3);
 }
 // 二樓正殿：石龍柱、紅燈籠、金色木雕樑
 box(4,2.4,4.6,wall,0,F+1.25,-2.0);box(2.6,1.8,.05,dark,0,F+1,.32);
 for(const x of [-1.6,-.75,.75,1.6]){
  const dragonPillar=Math.abs(x)<1;
  if(dragonPillar){cyl(.17,.19,2.1,white,x,F+1.1,.55);const sp=[];for(let i=0;i<=9;i++){const a=i*1.3;sp.push([x+Math.sin(a)*.2,F+.2+i*.2,.55+Math.cos(a)*.2]);}tube(sp,.05,'hallDark',12);}
  else cyl(.11,.12,2.1,wall,x,F+1.1,.55);
 }
 for(const x of [-1.15,-.38,.38,1.15]){cyl(.015,.015,.2,dark,x,F+1.85,.62);ball(.14,.17,.14,red,x,F+1.65,.62);}
 box(4.2,.42,.3,gold,0,F+2.35,.55);box(4.3,.08,.33,red,0,F+2.12,.56);
 // 兩重簷屋頂
 roof(0,F+2.6,-1.5,5.6,5.8,.55,{corners:true});
 box(3.3,.75,3.4,wall,0,F+3.45,-1.6);box(1.3,.4,.05,dark,0,F+3.45,.13);box(1.4,.06,.06,gold,0,F+3.68,.14);box(1.4,.06,.06,gold,0,F+3.22,.14);
 roof(0,F+3.85,-1.6,4.8,4.6,.85,{crown:mobile?90:220,corners:true});
 return {...mk.finish(),bounds:{x:[-3.6,3.6],z:[-5.4,2.4]}};
}
