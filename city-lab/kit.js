import {Group,MeshStandardMaterial,InstancedMesh,Object3D,SphereGeometry,CylinderGeometry,TubeGeometry,CatmullRomCurve3,Vector3,Shape,ExtrudeGeometry,DoubleSide,FrontSide,BoxGeometry} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const palette={cream:0xeee4cf,wood:0xb68a62,red:0xae6353,gold:0xd8af61,tile:0x728b87,leaf:0x81977b,pine:0x526f64,stone:0xb6b4a6,dark:0x4b4847,skin:0xe8ba91,lantern:0xd88b68,paper:0xfffcf6,blue:0xa8d3e6,foil:0xe4b844,brightGold:0xf3ce68,antiqueGold:0xaa762b,stoneGreen:0x516c66,stoneLight:0x799087,gateTile:0x7a2a2a,baseRed:0x653d37,blackPlaque:0x202d2a,jade:0x418c86,ceramicBlue:0x527a9c,hallTile:0xd9653a,hallTileLight:0xe0703f,hallGold:0xe0a63a,hallGoldLight:0xe8b54a,ceramicGreen:0x36856b,ceramicAzure:0x367ba5,ceramicYellow:0xe8b54a,ceramicRed:0xbd4036,ceramicWhite:0xeee4cf,canopyDark:0x292f30,canopyRed:0x9d3a30,hallRed:0x963e32,hallWood:0x674b37,hallDark:0x282826,hallLantern:0xedbd46,sea:0x78aebf,water:0x689faf,paleBlue:0xb8cbd0,dustRose:0xc79888,districtTile:0xd9653a,districtGold:0xe8b54a,districtJade:0x36856b,windowGlow:0xd8c394,zhenhaiTile:0xe2741a,zhenhaiStone:0xd2cfc4};
export const templeRoofMaterials=new Set(["zhenhaiTile","districtTile","districtGold","districtJade",'gateTile','foil','brightGold','gold','red','jade','ceramicBlue','blackPlaque','hallTile','hallTileLight','hallGold','hallGoldLight','ceramicGreen','ceramicAzure','ceramicYellow','ceramicRed','ceramicWhite','canopyDark','canopyRed','hallWood','hallRed','hallDark']);
export function createKit({mobile=false}={}){
 const group=new Group(),geometries=new Map(),materials=new Map(),batches=new Map();
 const dummy=new Object3D();let ceramicCount=0,ribCount=0;
 function geometry(key,create){if(!geometries.has(key))geometries.set(key,create());return geometries.get(key);}
 function material(name){if(!materials.has(name)){const mat=new MeshStandardMaterial({color:palette[name],side:['gateTile','hallTile','hallGold','districtTile'].includes(name)?DoubleSide:FrontSide,roughness:name==='foil'?.57:.82,metalness:['gold','foil','brightGold','antiqueGold'].includes(name)?.28:0,emissive:['lantern','hallLantern','windowGlow'].includes(name)?0xffa34e:0,emissiveIntensity:0});mat.name=name;mat.userData.fixedTempleColor=templeRoofMaterials.has(name);materials.set(name,mat);}return materials.get(name);}
 function put(key,geo,color,p=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
  if(mobile&&key==='hall-ceramic'&&++ceramicCount%4!==0)return;
  const id=key+':'+color;if(!batches.has(id))batches.set(id,{geo,mat:material(color),matrices:[]});
  dummy.position.set(...p);dummy.scale.set(...scale);dummy.rotation.set(...rotation);dummy.updateMatrix();batches.get(id).matrices.push(dummy.matrix.clone());
 }
 function box(w,h,d,color,x,y,z,ry=0){put('box',geometry('box',()=>mobile?new BoxGeometry(1,1,1):new RoundedBoxGeometry(1,1,1,1,.09)),color,[x,y,z],[w,h,d],[0,ry,0]);}
 function ball(w,h,d,color,x,y,z,rotation=[0,0,0]){put('ball',geometry('ball',()=>new SphereGeometry(1,mobile?5:8,mobile?3:5)),color,[x,y,z],[w,h,d],rotation);}
 function cylinder(rt,rb,h,color,x,y,z,rotation=[0,0,0]){
  const ratio=rt/rb,key='cylinder'+ratio.toFixed(3);put(key,geometry(key,()=>new CylinderGeometry(ratio,1,1,mobile?6:12)),color,[x,y,z],[rb,h,rb],rotation);
 }
 function curve(points,r,color,segments=16,radialSegments=5){if(mobile&&r<=.025&&++ribCount%2)return;const geo=new TubeGeometry(new CatmullRomCurve3(points.map(p=>new Vector3(...p))),mobile?Math.max(2,Math.ceil(segments*.5)):segments,r,mobile?3:radialSegments,false);const key='curve'+geometries.size;geometries.set(key,geo);put(key,geo,color);}
 function hex(radius,depth,color,x,z,y){
  const key='hex'+radius+':'+depth;const geo=geometry(key,()=>{const shape=new Shape();for(let i=0;i<6;i++){const a=Math.PI/3*i;shape[i?'lineTo':'moveTo'](Math.cos(a)*radius,Math.sin(a)*radius);}shape.closePath();const g=new ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.12,bevelThickness:.08,curveSegments:1});g.rotateX(-Math.PI/2);return g;});put(key,geo,color,[x,y,z]);
 }
 function finish(){
  const curves=new Map();for(const [id,batch] of batches)if(id.startsWith('curve')){const color=id.split(':')[1];if(!curves.has(color))curves.set(color,[]);curves.get(color).push(batch.geo);batches.delete(id);}
  for(const [color,parts] of curves){const geo=mergeGeometries(parts);geometries.set('merged-'+color,geo);put('merged-'+color,geo,color);}
  const staticParts=new Map();
  for(const [id,batch] of batches){
   const hallMaterial=/^(hall|ceramicGreen|ceramicAzure|ceramicYellow|ceramicRed|ceramicWhite|canopy)/.test(batch.mat.name);
   if(batch.mat.map||(!hallMaterial&&batch.matrices.length>32)||batch.geo===geometries.get('gate-ceramic'))continue;
   const color=id.split(':').at(-1);if(!staticParts.has(color))staticParts.set(color,[]);
   for(const matrix of batch.matrices){const part=batch.geo.index?batch.geo.toNonIndexed():batch.geo.clone();part.deleteAttribute('uv');part.applyMatrix4(matrix);staticParts.get(color).push(part);}
   batches.delete(id);
  }
  for(const [color,parts] of staticParts){const geo=mergeGeometries(parts);parts.forEach(part=>part.dispose());geometries.set('static-'+color,geo);put('static-'+color,geo,color);}
  for(const {geo,mat,matrices} of batches.values()){const mesh=new InstancedMesh(geo,mat,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=!mat.map&&geo!==geometries.get('gate-ceramic');mesh.receiveShadow=true;mesh.computeBoundingSphere();group.add(mesh);}return group;
 }
 return {group,box,ball,cylinder,curve,hex,put,geometry,finish,materials,dispose(){for(const g of geometries.values())g.dispose();for(const m of materials.values()){m.map?.dispose();m.dispose();}group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});}};
}
