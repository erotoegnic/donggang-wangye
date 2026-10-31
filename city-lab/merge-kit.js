import {BoxGeometry,CylinderGeometry,SphereGeometry,OctahedronGeometry,TubeGeometry,CatmullRomCurve3,Matrix4,Euler,Quaternion,Vector3} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createKit} from './kit.js';

// 程式建模的角頭廟共用工具：零件依顏色收集，finish() 時每種顏色合併成一個網格，每座廟只多出幾次繪製。
export function createMergeKit({mobile=false,name='temple'}={}){
 const parts=new Map(),seg=mobile?6:10;
 const add=(color,geo,matrix)=>{const g=geo.index?geo.toNonIndexed():geo.clone();g.deleteAttribute('uv');if(!g.getAttribute('normal'))g.computeVertexNormals();if(matrix)g.applyMatrix4(matrix);if(!parts.has(color))parts.set(color,[]);parts.get(color).push(g);};
 const m4=(p,s=[1,1,1],r=[0,0,0])=>new Matrix4().compose(new Vector3(...p),new Quaternion().setFromEuler(new Euler(...r)),new Vector3(...s));
 const unitBox=new BoxGeometry(1,1,1),unitBall=new SphereGeometry(1,seg,Math.max(4,seg/2)),unitBead=new OctahedronGeometry(1),cyls=new Map();
 const box=(w,h,d,color,x,y,z,ry=0)=>add(color,unitBox,m4([x,y,z],[w,h,d],[0,ry,0]));
 const ball=(w,h,d,color,x,y,z,r=[0,0,0])=>add(color,unitBall,m4([x,y,z],[w,h,d],r));
 const bead=(w,h,d,color,x,y,z,r=[0,0,0])=>add(color,unitBead,m4([x,y,z],[w,h,d],r));
 const cyl=(rt,rb,h,color,x,y,z,r=[0,0,0])=>{const k=(rt/rb).toFixed(3);if(!cyls.has(k))cyls.set(k,new CylinderGeometry(rt/rb,1,1,seg));add(color,cyls.get(k),m4([x,y,z],[rb,h,rb],r));};
 const tube=(points,r,color,n=10,closed=false)=>add(color,new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p)),closed),mobile?Math.max(3,Math.ceil(n*.6)):n,r,mobile?3:5,closed));
 function finish(){
  const k=createKit({mobile});
  for(const [color,list] of parts){const geo=mergeGeometries(list);list.forEach(g=>g.dispose());k.put(name+'-'+color,geo,color);}
  [unitBox,unitBall,unitBead,...cyls.values()].forEach(g=>g.dispose());
  return {group:k.finish(),materials:k.materials,dispose:k.dispose};
 }
 return {mobile,seg,add,m4,box,ball,bead,cyl,tube,finish};
}
