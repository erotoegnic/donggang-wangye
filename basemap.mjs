import fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const geography=JSON.parse(readFileSync(new URL('./data/donggang-basemap.json',import.meta.url),'utf8'));
const mercator=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*180/Math.PI;
const [west,south,east,north]=geography.bounds;
export const mapWidth=1200, mapHeight=(mercator(north)-mercator(south))/(east-west)*mapWidth;
export const project=(lng,lat)=>[(lng-west)/(east-west)*mapWidth,(mercator(north)-mercator(lat))/(east-west)*mapWidth];
export const mapLabels=geography.labels.map(l=>({...l,xy:project(...l.point)}));
const path=f=>f.points.map((p,i)=>(i?'L':'M')+project(...p).map(n=>n.toFixed(2)).join(',')).join('')+(f.closed?'Z':'');
const palette={sea:['#A8D3E6','none',0],urban:['#F5F0E7','none',0],green:['#B9DAA5','none',0],water:['#A8D3E6','none',0],island:['#FFFCF6','none',0],river:['none','#A8D3E6',2],minor:['none','#FFFFFF',1.5],major:['none','#FFFFFF',3],bridge:['none','#FFFFFF',3],boundary:['none','#68635D',.8],lane:['none','#FFFFFF',.8]};
export async function writeBasemap(){
 const assets={};
 for(const kind of ['base','lanes']){
  let body=kind==='base'?`<rect width="${mapWidth}" height="${mapHeight}" fill="#FFFCF6"/>`:'';
  for(const [layer,[fill,stroke,width]] of Object.entries(palette)){
   if((kind==='lanes')!==(layer==='lane'))continue;
   const d=geography.features.filter(f=>f.layer===layer).map(path).join('');
   if(!d)continue;
   if(layer==='major'||layer==='bridge')body+=`<path d="${d}" fill="none" stroke="#E3D7C3" stroke-width="${width+2}" vector-effect="non-scaling-stroke"/>`;
   body+=`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"${layer==='boundary'?' stroke-dasharray="5 5"':''} vector-effect="non-scaling-stroke"/>`;
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${mapWidth}" height="${mapHeight}" viewBox="0 0 ${mapWidth} ${mapHeight}">${body}</svg>`;
  const name=`basemap-${kind}-${createHash('sha256').update(svg).digest('hex').slice(0,12)}.svg`;
  await fs.writeFile('dist/assets/'+name,svg);assets[kind]='/assets/'+name;
 }
 for(const name of await fs.readdir('dist/assets'))if(/^basemap-(base|lanes)-[a-f0-9]+\.svg$/.test(name)&&!Object.values(assets).includes('/assets/'+name))await fs.unlink('dist/assets/'+name);
 return assets;
}
