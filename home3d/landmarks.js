import {Group,Mesh,MeshStandardMaterial,BoxGeometry,CylinderGeometry,SphereGeometry,Shape,ExtrudeGeometry,DoubleSide} from 'three';
export const palette={paper:0xfffcf6,roof:0xba6958,red:0x8a4436,gold:0xf6d27a,stone:0xc6b592,pine:0x78996b,green:0xb9daa5,blue:0xa8d3e6,ink:0x3e3a39};
const materials=new Map();
export function material(color){if(!materials.has(color))materials.set(color,new MeshStandardMaterial({color,roughness:1,flatShading:true,side:DoubleSide}));return materials.get(color);}
export function box(parent,w,h,d,color,x=0,y=0,z=0){const m=new Mesh(new BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function roof(parent,w,d,y){const s=new Shape();s.moveTo(-w/2,.1);s.lineTo(-w/2-.15,.65);s.quadraticCurveTo(-w/3,.25,0,1);s.quadraticCurveTo(w/3,.25,w/2+.15,.65);s.lineTo(w/2,.1);s.lineTo(0,.72);s.closePath();const m=new Mesh(new ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:4}),material(palette.roof));m.position.set(0,y,-d/2);m.castShadow=true;parent.add(m);box(parent,w,.12,d,palette.gold,0,y+.08,0);box(parent,w*.32,.12,.16,palette.gold,0,y+1,0);}
export function temple(large=false){const g=new Group();const w=large?4.6:2.3,d=large?3.4:1.8;
 box(g,w+.9,.25,d+.8,palette.stone,0,.12,0);box(g,w+.5,.2,d+.5,palette.paper,0,.35,0);box(g,w,.95,d,palette.paper,0,1,0);
 box(g,w*.38,.85,.06,palette.ink,0,.96,d/2+.02);
 for(const x of [-.42,-.2,.2,.42]){const c=new Mesh(new CylinderGeometry(.1,.13,1.1,8),material(palette.red));c.position.set(w*x,1,d/2+.12);g.add(c);}
 roof(g,w+.5,d+.6,1.45);roof(g,w*.72,d*.72,2.25);
 box(g,w*.33,.3,.12,palette.gold,0,1.55,d/2+.25);
 for(const x of [-w*.36,w*.36]){const l=new Mesh(new SphereGeometry(.19,8,6),material(palette.red));l.position.set(x,1.43,d/2+.28);g.add(l);}
 if(large){for(const x of [-3.2,3.2]){box(g,1.4,.85,3,palette.paper,x,.85,0);const wing=new Group();roof(wing,1.8,3.3,1.3);wing.position.x=x;g.add(wing);}const arch=new Group();for(const x of [-2,-.8,.8,2])box(arch,.22,2,.25,palette.gold,x,1,0);box(arch,4.5,.5,.5,palette.gold,0,1.8,0);roof(arch,4.7,.8,2.1);arch.position.z=4;g.add(arch);box(g,6.5,.1,3.2,palette.stone,0,.05,2.8);}
 return g;
}
export function boat(){const g=new Group(),s=new Shape();s.moveTo(-3,.5);s.quadraticCurveTo(-1.4,-.9,2.8,.2);s.lineTo(3.2,1);s.quadraticCurveTo(0,.1,-3.3,1.1);s.closePath();const hull=new Mesh(new ExtrudeGeometry(s,{depth:1.1,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:1}),material(palette.gold));hull.position.z=-.55;hull.castShadow=true;g.add(hull);
 for(const [i,x]of [-1.6,0,1.6].entries()){const h=i===1?4:3;box(g,.09,h,.09,palette.red,x,h/2+.4,0);const sail=new Shape();sail.moveTo(0,0);sail.lineTo(1.3,.1);sail.lineTo(1.1,h*.63);sail.lineTo(0,h*.7);sail.closePath();const m=new Mesh(new ExtrudeGeometry(sail,{depth:.04,bevelEnabled:false}),material(palette.paper));m.position.set(x-.6,1.2,0);g.add(m);for(let j=0;j<4;j++)box(g,1.25,.04,.07,palette.stone,x,1.2+j*h*.18,.05);box(g,.5,.25,.05,palette.red,x+.2,h+.4,0);}
 box(g,1.3,.6,.9,palette.roof,0,.7,0);return g;
}
export function tree(){const g=new Group();box(g,.15,.65,.15,palette.stone,0,.32,0);const crown=new Mesh(new SphereGeometry(.65,6,4),material(palette.pine));crown.scale.y=1.3;crown.position.y=1.05;crown.castShadow=true;g.add(crown);return g;}
