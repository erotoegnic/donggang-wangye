import {Shape,ExtrudeGeometry,BoxGeometry,SphereGeometry,BufferGeometry,Float32BufferAttribute,CanvasTexture,MeshStandardMaterial,PlaneGeometry,CircleGeometry,OctahedronGeometry,SRGBColorSpace} from 'three';

export const gateFont='"Noto Serif TC","Noto Sans TC","PingFang TC","Microsoft JhengHei",serif';
export async function prepareGateFonts(){
 await document.fonts.load('bold 360px '+gateFont,'國泰民安風調雨順東隆宮');
 await document.fonts.ready;
 if(!document.fonts.check('bold 360px '+gateFont))throw new Error('Gate lettering font unavailable');
}
export function createGate(k){
 const {box,cylinder}=k,z=3.4,front=z+.57;
 const curve=(points,r,color)=>k.curve(points,r,color,6,4);
 const ball=(w,h,d,color,x,y,zz,rotation=[0,0,0])=>k.put('gate-bead',k.geometry('gate-bead',()=>new OctahedronGeometry(1)),color,[x,y,zz],[w,h,d],rotation);
 const block=(w,h,d,color,x,y,zz)=>k.put('gate-block',k.geometry('gate-block',()=>new BoxGeometry(1,1,1)),color,[x,y,zz],[w,h,d]);
 function arch(x,width,spring,rise,top){
  const half=width/2,s=new Shape();s.moveTo(-half,top);s.lineTo(-half,spring);
  s.quadraticCurveTo(-half*.65,spring+rise,0,spring+rise);s.quadraticCurveTo(half*.65,spring+rise,half,spring);s.lineTo(half,top);s.closePath();
  const key=`gate-arch:${width}:${spring}:${top}`;
  k.put(key,k.geometry(key,()=>new ExtrudeGeometry(s,{depth:1.02,curveSegments:14,bevelEnabled:false})), 'foil',[x,0,z-.51]);
  for(const dz of [-.53,.59])curve([[x-half,spring,z+dz],[x-half*.55,spring+rise*.78,z+dz],[x,spring+rise,z+dz],[x+half*.55,spring+rise*.78,z+dz],[x+half,spring,z+dz]],.055,'brightGold');
  for(let i=0;i<17;i++){
   const xx=-half+i*width/16,t=Math.abs(xx)/half,bottom=spring+rise*Math.sqrt(1-t*t)+.15;
   for(let yy=bottom;yy<top-.95;yy+=.17){ball(.065,.045,.035,'brightGold',x+xx,yy,front+.05,[0,0,i%2?.7:-.7]);}
  }
 }
 function border(x,y,w,h,zz=front){
  for(const dy of [-h/2,h/2])block(w,.045,.07,'brightGold',x,y+dy,zz);
  for(const dx of [-w/2,w/2])block(.045,h,.07,'brightGold',x+dx,y,zz);
 }
 function relief(x,y,w,h){
  block(w,h,.12,'antiqueGold',x,y,front);border(x,y,w,h,front+.08);
  const cols=Math.max(2,Math.floor(w/.24)),rows=Math.max(1,Math.floor(h/.23));
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const xx=x-w/2+(col+.5)*w/cols,yy=y-h/2+(row+.5)*h/rows;
   ball(.095,.055,.045,'foil',xx,yy,front+.09,[0,0,(row+col)%2?.6:-.6]);
   block(.035,.12,.065,'brightGold',xx,yy,front+.11);
  }
 }
 function niches(x,y,w){
  block(w,.44,.1,'antiqueGold',x,y,front+.015);
  const count=Math.floor(w/.34);
  const s=new Shape();s.moveTo(-.13,0);s.lineTo(-.13,.24);s.absarc(0,.24,.13,Math.PI,0,true);s.lineTo(.13,0);s.closePath();
  const geo=k.geometry('gate-niche',()=>new ExtrudeGeometry(s,{depth:.045,curveSegments:5,bevelEnabled:false}));
  for(let i=0;i<count;i++){
   const xx=x-w/2+(i+.5)*w/count;
   k.put('gate-niche',geo,'foil',[xx,y-.19,front+.08]);
   ball(.052,.052,.045,'brightGold',xx,y+.065,front+.16);
   block(.115,.14,.08,'brightGold',xx,y-.065,front+.17);
   for(const dx of [-.145,.145])block(.025,.34,.075,'brightGold',xx+dx,y,front+.12);
  }
  border(x,y,w,.44,front+.17);
 }
 function roof(x,y,w,d,h){
  const height=(xx,zz)=>h*(1-Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*.27)/(w*.23))))+.27*(Math.abs(xx)/(w/2))**8;
  const key=`gate-roof:${w}:${d}:${h}`,geo=k.geometry(key,()=>{
   const vertices=[],nx=24,nz=10;
   const point=(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [xx,height(xx,zz),zz];};
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),e=point(i,j+1);vertices.push(...a,...c,...b,...a,...e,...c);}
   const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;
  });
  k.put(key,geo,'gateTile',[x,y,z]);
  for(const side of [-1,1]){
   const points=[];for(let i=0;i<=12;i++){const xx=(i/12-.5)*w;points.push([x+xx,y+height(xx,side*d/2),z+side*d/2]);}
   curve(points,.07,'gateTile');curve(points.map(([xx,yy,zz])=>[xx,yy-.09,zz]),.035,'brightGold');
   for(let i=0;i<=Math.floor(w/.17);i++){
    const xx=-w/2+i*w/Math.floor(w/.17),yy=height(xx,side*d/2);
    ball(.055,.055,.07,'foil',x+xx,y+yy-.07,z+side*d/2);
    const rib=[];for(let j=0;j<=4;j++){const zz=side*d/2*j/4;rib.push([x+xx,y+height(xx,zz)+.025,z+zz]);}k.curve(rib,.022,'gateTile',4);
   }
  }
  for(const t of [-.36,-.18,0,.18,.36]){
   const xx=t*w;ornament(x+xx,y+height(xx,0)+.1,z,.55,t<0?-1:1);
  }
  for(const side of [-1,1])for(const end of [-1,1])for(const t of [.3,.65,1]){
   const xx=end*w*(.27+.23*t),zz=side*d*.5*t;
   ornament(x+xx,y+height(xx,zz)+.12,z+zz,.42,end);
  }
  curve([[-.53,.42],[-.42,.09],[0,0],[.42,.09],[.53,.42]].map(([xx,yy])=>[x+xx*w,y+h+yy,z]),.065,'brightGold');
 }
 function ornament(x,y,zz,s,side){
  const bead=(w,h,d,color,xx,yy,z0,rotation=[0,0,0])=>k.put('gate-ceramic',k.geometry('gate-ceramic',()=>new OctahedronGeometry(1,0)),color,[xx,yy,z0],[w,h,d],rotation);
  curve([[x-side*.25*s,y,zz],[x-side*.1*s,y+.15*s,zz],[x+side*.12*s,y+.24*s,zz],[x+side*.2*s,y+.4*s,zz]],.055*s,'jade');
  bead(.1*s,.07*s,.065*s,'ceramicBlue',x+side*.22*s,y+.4*s,zz);
  bead(.08*s,.035*s,.04*s,'brightGold',x+side*.32*s,y+.4*s,zz);
  for(let i=0;i<4;i++)bead(.035*s,.12*s,.045*s,i%2?'red':'brightGold',x+side*(i*.08-.19)*s,y+(.16+i*.045)*s,zz,[0,0,-side*.5]);
  for(const dz of [-1,1])bead(.08*s,.15*s,.035*s,'ceramicBlue',x,y+.22*s,zz+dz*.09*s,[.6*dz,0,side*.5]);
 }
 function dragon(x,y,scale,side){
  const points=[[-.55,0],[-.22,.12],[.05,.48],[-.06,.78],[-.32,.88],[-.5,.68],[-.28,.5],[.15,.5],[.42,.68]];
  curve(points.map(([xx,yy])=>[x+side*xx*scale,y+yy*scale,z]),.055*scale,'jade');
  curve(points.map(([xx,yy])=>[x+side*xx*scale,y+(yy-.06)*scale,z+.055]),.026*scale,'brightGold');
  for(let i=1;i<points.length-1;i++){const [xx,yy]=points[i];ball(.045*scale,.12*scale,.045*scale,i%2?'red':'ceramicBlue',x+side*xx*scale,y+(yy+.1)*scale,z);}
  ball(.13*scale,.08*scale,.09*scale,'jade',x+side*.43*scale,y+.68*scale,z);
  ball(.025*scale,.025*scale,.025*scale,'blackPlaque',x+side*.46*scale,y+.72*scale,z+.09*scale);
  curve([[x+side*.4*scale,y+.74*scale,z],[x+side*.32*scale,y+.95*scale,z]],.025*scale,'brightGold');
  ball(.11*scale,.035*scale,.075*scale,'red',x+side*.55*scale,y+.64*scale,z);
  for(const points of [[[.33,.8],[.22,1.02],[.12,.98]],[[.5,.65],[.68,.56],[.8,.7]],[[.1,.47],[.25,.22],[.43,.25]],[[-.25,.2],[-.42,-.04],[-.6,.02]]])curve(points.map(([xx,yy])=>[x+side*xx*scale,y+yy*scale,z+.08]),.025*scale,'brightGold');
 }
 function phoenix(x,y,side){
  ball(.1,.17,.08,'jade',x,y+.2,z);
  curve([[x,y+.2,z],[x+side*.12,y+.49,z],[x+side*.24,y+.52,z]],.04,'ceramicBlue');
  ball(.045,.045,.04,'brightGold',x+side*.27,y+.51,z);
  for(const direction of [-1,1])for(let i=0;i<3;i++)curve([[x,y+.25,z],[x+direction*(.16+i*.05),y+.34,z],[x+direction*(.25+i*.06),y+.62-i*.09,z]],.028,i%2?'red':'jade');
  for(let i=0;i<3;i++)curve([[x,y+.1,z],[x-side*(.17+i*.05),y-.04,z],[x-side*(.28+i*.04),y+.11,z]],.028,i%2?'brightGold':'ceramicBlue');
 }
 function lion(x){
  const zz=z+.94;
  box(.55,.2,.66,'stoneGreen',x,.23,zz);box(.44,.58,.5,'stoneGreen',x,.59,zz);box(.58,.13,.64,'stoneLight',x,.94,zz);
  ball(.21,.28,.21,'stoneGreen',x,1.2,zz);ball(.25,.23,.23,'stoneLight',x,1.52,zz+.06);
  for(const side of [-1,1]){
   ball(.085,.22,.1,'stoneLight',x+side*.15,1.18,zz+.18);ball(.1,.065,.13,'stoneGreen',x+side*.15,1.02,zz+.23);
   ball(.095,.1,.08,'stoneGreen',x+side*.2,1.66,zz+.05);ball(.035,.035,.035,'blackPlaque',x+side*.1,1.56,zz+.26);
   ball(.12,.09,.085,'stoneLight',x+side*.08,1.43,zz+.25);
   for(let i=0;i<3;i++)ball(.065,.075,.06,'stoneGreen',x+side*.22,1.37+i*.1,zz+.09);
   block(.055,.29,.045,'red',x+side*.08,1.22,zz+.29);
  }
  ball(.085,.07,.055,'red',x,1.36,zz+.32);for(const side of [-1,1])ball(.1,.06,.04,'red',x+side*.09,1.37,zz+.3,[0,0,side*.4]);
  curve([[x,1.11,zz-.18],[x+.26,1.22,zz-.25],[x+.24,1.39,zz-.19]],.05,'stoneGreen');
 }
 const columns=[-6,-4.65,-1.85,1.85,4.65,6];
 for(let i=0;i<5;i++){
  const left=columns[i],right=columns[i+1],x=(left+right)/2,w=right-left,outer=i===0||i===4,center=i===2;
  const spring=outer?1.65:center?2.65:2.25,rise=outer?.3:center?.8:.62,top=outer?3.6:center?4.65:4.25;
  arch(x,w-.24,spring,rise,top);
  for(const yy of [top-.1,top-.65]){block(w,.09,1.1,'red',x,yy,z);border(x,yy,w,.14);}
  niches(x,top-.38,w-.12);relief(x,top-.83,w-.15,.25);
  const panelH=outer?.46:center?1.2:.95,panelY=top+panelH/2;
  block(w,panelH,1.04,'foil',x,panelY,z);relief(x,panelY,w-.16,panelH-.14);
  roof(x,top+panelH+.12,w+.38,1.65,outer?.25:.52);
  if(!outer){roof(x,top+panelH+.79,w*.72,1.05,.42);dragon(x-w*.22,top+panelH+1.21,.67,1);dragon(x+w*.22,top+panelH+1.21,.67,-1);}
  else phoenix(x,top+panelH+.3,i===0?-1:1);
 }
 for(const x of columns){
  const h=Math.abs(x)>5?4.18:Math.abs(x)>3?5.44:6.09;
  box(.45,.66,.8,'baseRed',x,.5,z);box(.4,h-.45,1.36,'stoneGreen',x,(h+.55)/2,z);
  for(const dx of [-.17,.17])block(.035,h-.55,.04,'stoneLight',x+dx,(h+.6)/2,front+.13);
  for(const yy of [h-.16,h-.6]){box(.3,.31,.05,'stoneLight',x,yy,front+.14);box(.21,.23,.065,'stoneGreen',x,yy,front+.17);}
  lion(x);
 }
 for(let i=0;i<7;i++){const y=7.15+i*.14,r=.16-i*.014;cylinder(r*.72,r*.8,.13,'red',0,y,z);cylinder(r*.6,r*1.25,.065,'brightGold',0,y+.065,z);}
 ball(.045,.09,.045,'brightGold',0,8.18,z);
 for(const side of [-1,1])for(const xx of [.55,1,1.45,2.8,3.3,4]){
  const yy=xx<1.8?5.95:5.55;
  ball(.08,.13,.07,xx%1?'jade':'ceramicBlue',side*xx,yy,z+.53);ball(.06,.06,.06,'brightGold',side*xx,yy+.18,z+.53);
 }
 function lettering(name,text,width,height,{round=false,back=false,x=0,y=0,zz=front+.28}={}){
  const canvas=document.createElement('canvas');canvas.width=width<.2?128:512;canvas.height=round?512:Math.ceil(canvas.width*height/width);
  const ctx=canvas.getContext('2d');ctx.fillStyle='#202d2a';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#f3ce68';ctx.textAlign='center';ctx.textBaseline='middle';
  const letters=[...text],step=canvas.height/(letters.length+.25),size=round?360:Math.min(canvas.width*.8,step*.85);
  ctx.font='bold '+size+'px '+gateFont;
  letters.forEach((letter,i)=>ctx.fillText(letter,canvas.width/2,canvas.height/2+(i-(letters.length-1)/2)*step));
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;
  k.materials.set(name,new MeshStandardMaterial({map:texture,roughness:.8}));
  const geo=k.geometry(name,()=>round?new CircleGeometry(width/2,48):new PlaneGeometry(width,height));
  k.put(name,geo,name,[x,y,zz],[1,1,1],[0,back?Math.PI:0,0]);
 }
 box(.82,1.5,.17,'brightGold',0,5.1,front+.28);box(.7,1.38,.19,'blackPlaque',0,5.1,front+.31);
 lettering('gate-title','東隆宮',.64,1.29,{y:5.1,zz:front+.43});
 for(const back of [false,true])for(const [i,x] of [-3.75,-2.8,2.8,3.75].entries()){
  const zz=back?z-.75:front+.17;
  cylinder(.39,.39,.09,'brightGold',x,4.7,zz,[Math.PI/2,0,0]);
  lettering('gate-disc-'+back+'-'+i,(back?'國泰民安':'順雨調風')[i],.69,.69,{round:true,back,x,y:4.7,zz:zz+(back?-.06:.06)});
 }
 for(const [i,x] of columns.entries()){
  const h=Math.abs(x)>5?4.18:Math.abs(x)>3?5.44:6.09;
  lettering('gate-column-'+i,i%2?'風調雨順國泰民安':'國泰民安風調雨順',.17,h-2.2,{x,y:(h-.15)/2+.2,zz:front+.14});
 }
}
