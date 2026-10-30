// Manual acquisition only. The production build never imports this tool.
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const dir = new URL('../work/osm/', import.meta.url);
await fs.mkdir(dir, {recursive:true});
async function download(url, name) {
  const file = new URL(name, dir);
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  execFileSync('curl.exe', ['-sS','-L','--fail','--max-time','55','-A','DonggangWangyeLocalMap/1.0 (one-time local extract)',url,'-o',file.pathname.replace(/^\/(\w:)/,'$1')], {stdio:'inherit'});
  return JSON.parse(await fs.readFile(file, 'utf8'));
}
const boundary = await download('https://api.openstreetmap.org/api/0.6/relation/2766783/full.json','boundary-api.json');
const relation = boundary.elements.find(e=>e.type==='relation'&&e.id===2766783);
if(relation?.tags?.name !== '東港鎮') throw Error('Unexpected administrative boundary');
const nodes = boundary.elements.filter(e=>e.type==='node');
const town = [Math.min(...nodes.map(n=>n.lon)), Math.min(...nodes.map(n=>n.lat)), Math.max(...nodes.map(n=>n.lon)), Math.max(...nodes.map(n=>n.lat))];
const latPad=1/111.32, lonPad=latPad/Math.cos((town[1]+town[3])/2*Math.PI/180);
const bounds=[town[0]-lonPad,town[1]-latPad,town[2]+lonPad,town[3]+latPad].map(n=>+n.toFixed(7));
const all=new Map(boundary.elements.map(e=>[e.type+'/'+e.id,e]));
// Main API enforces 50,000 nodes per response; small sequential boxes respect it.
for(let row=0;row<3;row++) for(let col=0;col<3;col++) {
  const box=[bounds[0]+(bounds[2]-bounds[0])*col/3,bounds[1]+(bounds[3]-bounds[1])*row/3,bounds[0]+(bounds[2]-bounds[0])*(col+1)/3,bounds[1]+(bounds[3]-bounds[1])*(row+1)/3].map(n=>+n.toFixed(7));
  const data=await download('https://api.openstreetmap.org/api/0.6/map.json?bbox='+box.join(','),`map-${row}-${col}.json`);
  if(!data.elements?.length)throw Error('Empty OSM extract: '+box);
  data.elements.forEach(e=>all.set(e.type+'/'+e.id,e));
  console.log(`Downloaded ${row},${col}: ${data.elements.length} objects`);
}
await fs.writeFile(new URL('merged.json',dir),JSON.stringify({bounds,town,elements:[...all.values()]}));
console.log('OSM download complete; raw extract retained in work/osm/merged.json');
await import('./prepare-osm.mjs');
