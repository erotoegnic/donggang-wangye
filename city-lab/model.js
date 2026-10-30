import {Shape,ExtrudeGeometry,BoxGeometry} from 'three';
import {createKit} from './kit.js';
import {createGate} from './gate.js';
import {createHall} from './hall.js';

export function createTemple({district=false,mobile=false}={}){
 const k=createKit({mobile}),{box,ball,cylinder,curve,hex}=k;
 function roof(x,y,z,w,d,h,color='gold'){
  const key=`roof:${w}:${d}:${h}`;
  const geo=k.geometry(key,()=>{const s=new Shape();s.moveTo(-d/2,.18);s.quadraticCurveTo(-d*.3,.12,0,h);s.quadraticCurveTo(d*.3,.12,d/2,.18);s.lineTo(d/2,0);s.quadraticCurveTo(d*.3,-.08,0,h-.18);s.quadraticCurveTo(-d*.3,-.08,-d/2,0);s.closePath();const g=new ExtrudeGeometry(s,{depth:w,steps:1,curveSegments:8,bevelEnabled:true,bevelThickness:.045,bevelSize:.045,bevelSegments:2});g.rotateY(Math.PI/2);g.translate(-w/2,0,0);return g;});
  k.put(key,geo,color,[x,y,z]);
  curve([[x-w*.6,y+h+.5,z],[x-w*.48,y+h+.14,z],[x-w*.25,y+h,z],[x+w*.25,y+h,z],[x+w*.48,y+h+.14,z],[x+w*.6,y+h+.5,z]],.075,'gold');
  for(const side of [-1,1]){
   curve([[x-w*.57,y+.4,z+side*d*.53],[x-w*.46,y+.15,z+side*d*.5],[x,y+.1,z+side*d*.5],[x+w*.46,y+.15,z+side*d*.5],[x+w*.57,y+.4,z+side*d*.53]],.055,'gold');
   for(let i=0;i<=Math.round(w/.3);i++){const xx=x-w/2+i*w/Math.round(w/.3);ball(.052,.052,.08,'gold',xx,y+.09,z+side*d*.49);}
  }
 }
 function lantern(x,y,z){cylinder(.025,.025,.23,'dark',x,y+.34,z);ball(.16,.22,.16,'lantern',x,y,z);cylinder(.09,.09,.05,'gold',x,y+.22,z);cylinder(.06,.06,.12,'gold',x,y-.27,z);}
 function person(x,z,color='red',angle=0){
  ball(.13,.15,.13,'skin',x,.78,z);cylinder(.12,.16,.32,color,x,.48,z);
  for(const side of [-1,1]){box(.09,.19,.1,'dark',x+side*.075,.23,z);ball(.05,.14,.05,'skin',x+side*.17,.48,z,[0,0,side*.25]);}
  ball(.13,.06,.13,'dark',x,.88,z);if(angle)box(.22,.12,.09,'gold',x,.53,z+.15,angle);
 }
 function banyan(x,z,s=1){cylinder(.12,.2,1.5*s,'wood',x,.8*s,z);for(const [dx,dy,dz,r] of [[0,2,0,.8],[-.55,1.75,.05,.65],[.55,1.85,.1,.7],[.1,1.7,.55,.6]])ball(r*s,r*.7*s,r*s,'leaf',x+dx*s,dy*s,z+dz*s);for(const dx of [-.35,.3])cylinder(.035,.055,1.2*s,'wood',x+dx*s,.8*s,z+.08);}
 function palm(x,z){cylinder(.08,.14,2.4,'wood',x,1.3,z,[0,0,-.1]);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;ball(.18,.12,.9,'pine',x+Math.sin(a)*.48,2.48,z+Math.cos(a)*.48,[.2,a,.12]);}ball(.18,.18,.18,'gold',x,2.48,z);}
 function bench(x,z,ry=0){box(1,.12,.36,'wood',x,.43,z,ry);for(const dx of [-.35,.35])box(.1,.32,.28,'dark',x+dx,.23,z,ry);}
 function scooter(x,z,color){for(const dz of [-.28,.28])cylinder(.13,.13,.12,'dark',x,.23,z+dz,[0,0,Math.PI/2]);box(.29,.26,.62,color,x,.41,z);box(.27,.13,.38,'dark',x,.6,z-.1);box(.3,.45,.13,color,x,.56,z+.28);box(.46,.06,.07,'dark',x,.81,z+.26);ball(.09,.09,.05,'paper',x,.65,z+.37);}
 function stall(x,z,color){for(const dx of [-.6,.6])for(const dz of [-.42,.42])cylinder(.035,.035,1.65,'wood',x+dx,.93,z+dz);box(1.4,.62,.85,'wood',x,.45,z);box(1.65,.12,1.15,color,x,1.82,z);for(let i=0;i<5;i++)box(.16,.14,1.17,'paper',x-.64+i*.32,1.82,z);for(let i=0;i<3;i++)ball(.12,.08,.12,'gold',x-.35+i*.35,.83,z);}
 if(!district){hex(8.3,.6,'wood',0,0,-.65);hex(8.25,.1,'cream',0,0,-.06);
 for(const [x,z] of [[-8.9,-2.9],[-8.9,2.9],[8.9,-2.9],[8.9,2.9],[0,8.5],[0,-8.5]]){hex(2.05,.36,'wood',x,z,-.42);hex(2.02,.06,'leaf',x,z,-.02);}
 }
 box(10,.12,8,'stone',0,.08,.3);
 for(let x=-4.5;x<=4.5;x+=.76)for(let z=-2.7;z<=3.5;z+=.74)k.put('paving',k.geometry('paving',()=>new BoxGeometry(.7,.05,.68)),(Math.round((x+4.5)/.76)+Math.round((z+2.7)/.74))%4===0?'cream':'stone',[x,.16,z]);
 createHall(k);
 createGate(k);
 cylinder(.48,.38,.48,'gold',0,.62,.05);cylinder(.55,.55,.12,'gold',0,.88,.05);cylinder(.42,.42,.06,'dark',0,.95,.05);
 for(const dx of [-.33,.33]){cylinder(.065,.09,.35,'gold',dx,.3,.05);curve([[dx,.6,.05],[dx*1.9,.82,.05],[dx*1.7,1.05,.05],[dx*1.3,.96,.05]],.055,'gold');}
 for(const dx of [-.12,0,.12]){cylinder(.013,.013,.5,'wood',dx,1.2,.05);ball(.024,.028,.024,'red',dx,1.46,.05);}
 box(1.65,.16,.58,'red',0,.77,-.94);for(const dx of [-.65,.65])box(.12,.65,.42,'red',dx,.4,-.94);for(const dx of [-.5,.5])ball(.13,.1,.13,'gold',dx,.91,-.94);
 cylinder(.57,.68,1.5,'red',4.35,.9,-.7);cylinder(.67,.7,.12,'gold',4.35,.35,-.7);box(.42,.5,.12,'dark',4.35,.85,-.13);roof(4.35,1.7,-.7,1.55,1.55,.52,'hallTile');cylinder(.15,.18,.5,'gold',4.35,2.3,-.7);
 for(const side of [-1,1]){
  cylinder(.04,.06,3.2,'wood',side*4.85,1.7,2.5);box(.56,.88,.05,side===1?'gold':'red',side*4.85+.26,2.68,2.5);
  curve([[side*3.5,2.7,2.8],[side*3.8,2.42,1.2],[side*3.5,2.7,-1.9]],.022,'dark');
  for(let i=0;i<6;i++)lantern(side*(3.5+.25*Math.sin(i/5*Math.PI)),2.4-.25*Math.sin(i/5*Math.PI),2.6-i*.83);
  lantern(side*1.65,1.96,-1.9);
  bench(side*5.2,1.1);stall(side*7.1,1.8,side===1?'red':'tile');
  for(let i=0;i<3;i++){cylinder(.22,.15,.34,'red',side*4.85,.3,-3.5+i*.7);ball(.28,.24,.27,'leaf',side*4.85,.58,-3.5+i*.7);}
 }
 for(const [x,z,s] of [[-5.8,-3.6,1.05],[-6,-.7,.85],[5.8,-4.3,1],[-8.9,-2.9,.85],[8.9,3,.9],[0,-8.5,.9]])banyan(x,z,s);
 for(const [x,z] of [[6,1.5],[-8.8,3.1],[8.9,-2.8]])palm(x,z);
 for(let i=0;i<5;i++)scooter(-3+i*.62,5.1,i%2?'tile':'red');
 if(!district)for(const [x,z,color] of [[-1.8,1,'blue'],[1.3,1.6,'red'],[-2.2,-.8,'gold'],[2.4,-1,'tile'],[.7,4.2,'red'],[1.7,4.7,'tile'],[-.7,5,'gold'],[4.9,3.1,'paper'],[-4.7,3.1,'paper'],[-2.6,2,'paper'],[2.5,.1,'blue'],[.6,-1,'gold'],[-1,1.6,'tile'],[3.2,4.6,'red'],[-.5,8.5,'gold'],[8.9,2.3,'red']])person(x,z,color,.3);
 for(const [x,z] of [[-5.9,2],[6,3.9],[1,8.5],[-7.3,-1.7]]){cylinder(.035,.06,2,'dark',x,1.1,z);box(.42,.1,.42,'dark',x,2.17,z);ball(.16,.2,.16,'lantern',x,2,z);}
 return {group:k.finish(),materials:k.materials,dispose:k.dispose};
}
