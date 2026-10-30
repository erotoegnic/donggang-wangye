import {BufferGeometry,Float32BufferAttribute,BoxGeometry,OctahedronGeometry,SphereGeometry} from 'three';

// Positive z faces the gate. The three halls rise along the shared x=0 axis.
export function createHall(k){
 const ceramic=['ceramicGreen','ceramicAzure','ceramicYellow','ceramicRed','ceramicWhite'];
 const block=(w,h,d,color,x,y,z)=>k.put('hall-block',k.geometry('hall-block',()=>new BoxGeometry(1,1,1)),color,[x,y,z],[w,h,d]);
 const bead=(w,h,d,color,x,y,z,rotation=[0,0,0])=>k.put('hall-ceramic',k.geometry('hall-ceramic',()=>new OctahedronGeometry(1)),color,[x,y,z],[w,h,d],rotation);
 const curve=(points,r,color)=>k.curve(points,r,color,6,3);
 function spray(x,y,z,s,side=1,index=0){
  bead(.07*s,.17*s,.07*s,ceramic[index%5],x,y+.14*s,z,[0,0,side*.25]);
  bead(.065*s,.065*s,.065*s,'ceramicWhite',x+side*.035*s,y+.33*s,z);
  for(let i=0;i<5;i++){
   const a=(i-2)*.53;
   bead(.035*s,.18*s,.045*s,ceramic[(i+index)%5],x+Math.sin(a)*.16*s,y+.25*s+Math.cos(a)*.1*s,z,[0,0,-a]);
  }
  for(const dz of [-1,1])bead(.14*s,.065*s,.035*s,'ceramicGreen',x,y+.1*s,z+dz*.08*s,[dz*.4,0,side*.4]);
 }
 function dragon(x,y,z,s,side){
  const body=[[-.65,0],[-.4,.12],[-.22,.48],[-.38,.68],[-.59,.56],[-.48,.32],[-.12,.35],[.12,.64],[.36,.64]];
  curve(body.map(([a,b])=>[x+side*a*s,y+b*s,z]),.075*s,'ceramicYellow');
  curve(body.map(([a,b])=>[x+side*a*s,y+(b-.075)*s,z+.035*s]),.035*s,'ceramicGreen');
  body.slice(1,-1).forEach(([a,b],i)=>bead(.045*s,.13*s,.055*s,ceramic[i%5],x+side*a*s,y+(b+.09)*s,z,[0,0,-side*.4]));
  bead(.19*s,.12*s,.1*s,'ceramicGreen',x+side*.34*s,y+.65*s,z);
  bead(.13*s,.055*s,.1*s,'ceramicRed',x+side*.49*s,y+.59*s,z);
  bead(.028*s,.028*s,.028*s,'ceramicWhite',x+side*.38*s,y+.7*s,z+.09*s);
  for(const a of [.18,.32])curve([[x+side*a*s,y+.73*s,z],[x+side*(a-.08)*s,y+.95*s,z],[x+side*(a-.2)*s,y+.97*s,z]],.025*s,'ceramicYellow');
  for(const a of [-.3,0])for(const dz of [-1,1])curve([[x+side*a*s,y+.4*s,z],[x+side*(a+.1)*s,y+.17*s,z+dz*.15*s],[x+side*(a+.28)*s,y+.2*s,z+dz*.2*s]],.03*s,'ceramicGreen');
 }
 function pagoda(x,y,z){
  for(let i=0;i<8;i++){
   const r=.18-i*.017;
   k.cylinder(r*.65,r*.7,.12,'hallRed',x,y+i*.14,z);
   k.cylinder(r*.45,r*1.25,.055,'hallGoldLight',x,y+i*.14+.07,z);
  }
  bead(.045,.12,.045,'hallGoldLight',x,y+1.12,z);
 }
 function roof({x=0,y,z,w,d,h,gold=false,dense=1,crown=false}){
  const tile=gold?'hallGold':'hallTile',rib=gold?'hallGoldLight':'hallTileLight';
  const height=(xx,zz)=>{
   const t=Math.max(Math.abs(zz)/(d/2),Math.max(0,(Math.abs(xx)-w*.27)/(w*.23)));
   return h*Math.max(0,1-t)**1.45+.3*(Math.abs(xx)/(w/2))**8;
  };
  const key=`hall-roof:${w}:${d}:${h}`;
  k.put(key,k.geometry(key,()=>{
   const vertices=[],nx=16,nz=8;
   const p=(i,j)=>{const xx=(i/nx-.5)*w,zz=(j/nz-.5)*d;return [xx,height(xx,zz),zz];};
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),e=p(i,j+1);vertices.push(...a,...c,...b,...a,...e,...c);}
   const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(vertices,3));geo.computeVertexNormals();return geo;
  }),tile,[x,y,z]);
  for(const side of [-1,1]){
   const eave=[];for(let i=0;i<=16;i++){const xx=(i/16-.5)*w;eave.push([x+xx,y+height(xx,side*d/2),z+side*d/2]);}
   curve(eave,.065,tile);curve(eave.map(([a,b,c])=>[a,b-.1,c]),.055,'hallWood');
   const count=Math.ceil(w/.18);
   for(let i=0;i<=count;i++){
    const xx=-w/2+i*w/count,points=[];
    for(let j=0;j<=6;j++){const zz=side*d/2*j/6;points.push([x+xx,y+height(xx,zz)+.024,z+zz]);}
    k.curve(points,.022,rib,3,3);
    bead(.045,.048,.06,rib,x+xx,y+height(xx,side*d/2)-.015,z+side*d/2);
   }
   for(let xx=-w*.43;xx<=w*.43;xx+=.23){block(.065,.2,.15,'hallWood',x+xx,y-.13,z+side*d*.43);block(.13,.045,.2,'hallGold',x+xx,y-.06,z+side*d*.43);}
  }
  const ridgeY=xx=>y+h+.08+.5*(Math.abs(xx)/(w*.36))**5;
  const ridge=[];for(let i=0;i<=16;i++){const xx=(i/16-.5)*w*.72;ridge.push([x+xx,ridgeY(xx),z]);}
  curve(ridge,.075,'ceramicRed');curve(ridge.map(([a,b,c])=>[a,b+.1,c]),.035,'ceramicWhite');
  const count=Math.ceil(w*dense/.34);
  for(let i=0;i<=count;i++){const xx=(i/count-.5)*w*.69;spray(x+xx,ridgeY(xx)+.08,z,.65+(.15*dense),xx<0?-1:1,i);}
  for(const end of [-1,1]){
   curve([[x+end*w*.3,y+h+.28,z],[x+end*w*.38,y+h+.65,z],[x+end*w*.42,y+h+1,z]],.045,'ceramicGreen');
   for(const side of [-1,1]){
    const points=[];
    for(let i=0;i<=8;i++){const t=i/8,xx=end*w*(.27+.23*t),zz=side*d*.5*t;points.push([x+xx,y+height(xx,zz)+.1,z+zz]);}
    curve(points,.06,'ceramicRed');
    const n=Math.ceil(4*dense);for(let i=0;i<=n;i++){const t=i/n,xx=end*w*(.27+.23*t),zz=side*d*.5*t;spray(x+xx,y+height(xx,zz)+.15,z+zz,.58,end,i+2);}
    curve([[x+end*w*.44,y+.25,z+side*d*.44],[x+end*w*.51,y+.47,z+side*d*.51],[x+end*w*.56,y+.92,z+side*d*.54]],.045,'ceramicGreen');
   }
  }
  for(const side of [-1,1])dragon(x+side*w*.16,y+h+.36,z,crown?1:.58,-side);
  if(crown)pagoda(x,y+h+.42,z);
  else bead(.12,.17,.1,'ceramicRed',x,y+h+.51,z);
 }
 function facade(x,z,w,base,top){
  block(w,top-base,.04,'hallDark',x,(top+base)/2,z+.02);
  block(w,.18,.22,'hallWood',x,top-.13,z);
  const bays=Math.round(w/.8);
  for(let i=0;i<=bays;i++){
   const xx=x-w/2+i*w/bays;
   k.cylinder(.065,.08,top-base,'hallRed',xx,(base+top)/2,z+.08);
   block(.2,.13,.24,'stone',xx,base+.03,z+.08);
   block(.2,.12,.2,'hallGold',xx,top-.15,z+.08);
   if(i<bays)for(const dx of [.18,.32,.46])block(.027,.47,.04,'hallWood',xx+dx,top-.5,z+.09);
  }
 }
 function body(x,z,w,d,base,top){
  block(w,top-base,d,'hallRed',x,(top+base)/2,z);
  facade(x,z+d/2+.01,w,base,top);
 }
 block(9.8,.38,7.8,'stone',0,.34,-4.6);
 body(0,-6.35,8.8,3.4,.53,5.55);
 roof({y:5.57,z:-6.35,w:9.6,d:3.9,h:.85,gold:true,dense:.8});
 body(0,-6.85,7.1,2.65,5.8,6.25);
 roof({y:6.27,z:-6.85,w:8,d:3.1,h:.9,gold:true,dense:.85});
 body(0,-7.3,4.6,1.9,6.9,7.25);
 roof({y:7.27,z:-7.3,w:5.5,d:2.3,h:.9,gold:true,dense:1,crown:true});
 body(0,-4.1,4.6,2.5,.53,4.35);
 roof({y:4.37,z:-4.1,w:5.4,d:2.95,h:.85,dense:1.35});
 body(0,-2.2,4,1.9,.53,3.35);
 roof({y:3.37,z:-2.2,w:4.8,d:2.35,h:.7,dense:1.65});
 for(const side of [-1,1]){
  body(side*3.85,-4.3,1.7,4.6,.53,2.55);
  roof({x:side*3.85,y:2.57,z:-4.3,w:2.2,d:4.95,h:.5,dense:1});
  for(const [z,top] of [[-4.3,3.85],[-2.05,2.95]]){
   body(side*3.6,z,1.75,1.6,top-1.1,top);
   roof({x:side*3.6,y:top-.85,z,w:2.4,d:2.05,h:.45,dense:1.4});
   roof({x:side*3.6,y:top,z,w:2.3,d:2,h:.6,dense:1.65});
  }
 }
 const canopyFront=-.72,canopyBack=-2.1;
 for(const [x,w,edge,rise] of [[0,5.7,2.64,.86],[-3.55,1.4,2.35,.47],[3.55,1.4,2.35,.47]]){
  const arc=xx=>edge+rise*(1-(2*xx/w)**2),key=`hall-canopy:${w}`;
  k.put(key,k.geometry(key,()=>{
   const vertices=[],segments=32,point=(i,z,dy)=>{const xx=(i/segments-.5)*w;return [xx,arc(xx)+dy,z];};
   for(let i=0;i<segments;i++){
    const a=point(i,canopyFront,0),b=point(i+1,canopyFront,0),c=point(i+1,canopyBack,0),d=point(i,canopyBack,0);
    vertices.push(...a,...b,...c,...a,...c,...d);
    const e=point(i,canopyFront,-.13),f=point(i+1,canopyFront,-.13),g=point(i+1,canopyBack,-.13),h=point(i,canopyBack,-.13);
    vertices.push(...e,...g,...f,...e,...h,...g,...a,...f,...b,...a,...e,...f);
   }
   const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(vertices,3));geo.computeVertexNormals();return geo;
  }),'canopyDark',[x,0,0]);
  for(const z of [canopyFront,canopyBack]){
   const points=[];for(let i=0;i<=16;i++){const xx=(i/16-.5)*w;points.push([x+xx,arc(xx)+.03,z]);}
   curve(points,.065,'canopyRed');
   curve(points.map(([a,b,c])=>[a,b-.15,c]),.045,'hallDark');
  }
  for(let i=0;i<=12;i++){const xx=(i/12-.5)*w;curve([[x+xx,arc(xx)+.01,canopyFront],[x+xx,arc(xx)+.01,canopyBack]],.018,'canopyRed');}
  const count=Math.round(w/.46);
  for(let i=0;i<count;i++){
   const xx=(i/(count-1)-.5)*w*.9,yy=arc(xx)-.27;
   k.cylinder(.015,.015,.12,'hallWood',x+xx,yy+.13,canopyFront+.02);
   k.put('hall-lantern',k.geometry('hall-lantern',()=>new SphereGeometry(1,8,6)),'hallLantern',[x+xx,yy,canopyFront+.02],[.09,.12,.09]);
   bead(.03,.065,.03,'ceramicRed',x+xx,yy-.16,canopyFront+.02);
  }
 }
 for(const x of [-4.25,-2.85,2.85,4.25]){
  k.cylinder(.075,.085,2.35,'hallRed',x,1.52,canopyFront+.02);
  block(.22,.24,.24,'stone',x,.48,canopyFront+.02);
 }
 k.ball(.66,.2,.065,'hallGoldLight',0,3.45,canopyFront+.09);
 for(const x of [-.36,0,.36]){bead(.065,.09,.025,'canopyRed',x,3.45,canopyFront+.16);block(.15,.025,.03,'canopyRed',x,3.45,canopyFront+.16);}
 block(2.8,.45,.07,'hallRed',0,2.93,canopyFront+.07);
 for(const y of [2.73,3.13])block(2.8,.025,.09,'hallGold',0,y,canopyFront+.09);
 for(let i=0;i<16;i++)block(.08,.035,.025,'ceramicWhite',-.98+i*.13,2.94,canopyFront+.12);
 for(let i=0;i<5;i++)block(5.7,.1,1.15-i*.15,'stone',0,.2+i*.1,-.55-i*.075);
}
