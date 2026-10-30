import {Shape,Mesh,ExtrudeGeometry,ShapeGeometry,PlaneGeometry,Group,BufferGeometry,Line,LineBasicMaterial,Vector3} from 'three';
import {material,palette,box,tree} from './landmarks.js';
export const project=(lng,lat)=>[(lng-120.448809)*1850,(22.463047-lat)*2000];
export const coast=[[120.439,22.496],[120.444,22.481],[120.449,22.477],[120.451,22.474],[120.452,22.472],[120.447,22.4692],[120.442,22.4685],[120.438,22.466],[120.4408,22.467],[120.443,22.4668],[120.446,22.4646],[120.4435,22.4644],[120.441,22.4662],[120.4386,22.4646],[120.4365,22.4642],[120.441,22.460],[120.444,22.4568],[120.447,22.4536],[120.4506,22.4499],[120.4523,22.4477],[120.456,22.4455],[120.462,22.4419],[120.470,22.436],[120.488,22.436],[120.488,22.496]];
function shape(points){const s=new Shape();points.forEach(([lng,lat],i)=>{const [x,z]=project(lng,lat);if(i)s.lineTo(x,-z);else s.moveTo(x,-z);});s.closePath();return s;}
export function terrain(data){const group=new Group();
 const land=new Mesh(new ExtrudeGeometry(shape(coast),{depth:1.4,bevelEnabled:true,bevelSize:.35,bevelThickness:.3,bevelSegments:1}),[material(0xd9e6d3),material(palette.stone)]);land.rotation.x=-Math.PI/2;land.position.y=-1.4;land.receiveShadow=true;group.add(land);
 for(const points of data.water){const water=new Mesh(new ShapeGeometry(shape(points)),material(0x78aebf));water.rotation.x=-Math.PI/2;water.position.y=.36;group.add(water);}
 for(const points of data.roads){const line=new Line(new BufferGeometry().setFromPoints(points.map(([lng,lat])=>{const [x,z]=project(lng,lat);return new Vector3(x,.36,z);})),new LineBasicMaterial({color:0xfffcf6}));group.add(line);}
 const sea=new Mesh(new PlaneGeometry(700,700),material(0x78aebf));sea.rotation.x=-Math.PI/2;sea.position.y=-1.9;sea.receiveShadow=true;group.add(sea);
 const houses=new Group();
 for(let i=0;i<65;i++){const x=2+(i%9)*2.6,z=-35+Math.floor(i/9)*4.3;if(data.pins.some(p=>{const [px,pz]=project(p.lng,p.lat);return Math.hypot(x-px,z-pz)<4;}))continue;const h=.5+(i%3)*.28;box(houses,1.3,h,1.5,i%3?palette.paper:palette.stone,x,h/2,z);box(houses,1.5,.2,1.7,i%2?palette.roof:palette.pine,x,h+.1,z);}
 group.add(houses);
 for(let i=0;i<40;i++){const x=22+(i%8)*3.7,z=-38+Math.floor(i/8)*8;if(data.pins.some(p=>{const [px,pz]=project(p.lng,p.lat);return Math.hypot(x-px,z-pz)<3;}))continue;const t=tree();t.position.set(x,0,z);group.add(t);}
 const waves=[];for(let i=0;i<32;i++){const x=-38+(i%4)*5,z=-28+Math.floor(i/4)*7;const wave=box(group,2.2,.025,.12,0xa8d3e6,x,-1.83,z);waves.push(wave);}
 return {group,waves};
}
