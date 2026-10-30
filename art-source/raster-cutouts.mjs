import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const sharp=require('sharp');
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out=path.join(root,'art-source/raster-cutouts');
await fs.mkdir(out,{recursive:true});
const coordinateSource=await fs.readFile(path.join(root,'art-source/vector-trace.py'),'utf8');
function readCoordinates(name){
 const literal=coordinateSource.match(new RegExp(name+'=(\\{[\\s\\S]*?\\n\\})'))?.[1];
 if(!literal)throw new Error('Missing coordinate table: '+name);
 return JSON.parse(literal.replaceAll("'",'"').replaceAll('(','[').replaceAll(')',']').replace(/,\s*([}\]])/g,'$1'));
}
const boxes=readCoordinates('BOXES');
const limbs=readCoordinates('PARTS');
const details=readCoordinates('DETAILS');
const sourceFile=path.join(root,'art-source/donggang-original-map.jpg');
const sourceBytes=await fs.readFile(sourceFile);
const sourceHash=createHash('sha256').update(sourceBytes).digest('hex');
const {data:source,info}=await sharp(sourceBytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const stillsOnly=process.argv.includes('--stills-only');
const polygonVessel=[[50,71],[55,60],[63,59],[69,64],[74,60],[75,51],[87,51],[92,59],[101,58],[105,53],[115,60],[115,72],[108,82],[112,87],[120,82],[127,89],[139,91],[143,99],[159,105],[148,126],[137,136],[112,140],[88,137],[79,126],[76,109],[67,98],[65,89],[60,78],[53,81]];
const shirtColors={yellow:[255,233,0],pink:[238,166,200],black:[38,36,41],green:[78,172,72],purple:[188,153,202],white:[255,253,252],blue:[35,56,101]};
const relative=name=>'art-source/raster-cutouts/'+name;
const colorDistance=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
function inside(x,y,points){
 let hit=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [xi,yi]=points[i],[xj,yj]=points[j];
  if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;
 }
 return hit;
}
function removeFrame(data,width,height){
 const visited=new Uint8Array(width*height),queue=[];
 for(let x=0;x<width;x++){queue.push(x,(height-1)*width+x);}
 for(let y=0;y<height;y++){queue.push(y*width,y*width+width-1);}
 for(let q=0;q<queue.length;q++){
  const n=queue[q];if(visited[n])continue;visited[n]=1;
  const i=n*4;
  if(colorDistance(data.subarray(i,i+3),[167,128,118])>=65)continue;
  data[i+3]=0;
  const x=n%width,y=Math.floor(n/width);
  if(x)queue.push(n-1);if(x+1<width)queue.push(n+1);if(y)queue.push(n-width);if(y+1<height)queue.push(n+width);
 }
 const seen=new Uint8Array(width*height),components=[];
 for(let start=0;start<seen.length;start++){
  if(seen[start]||!data[start*4+3])continue;
  const members=[start];seen[start]=1;
  for(let p=0;p<members.length;p++){
   const n=members[p],x=n%width,y=Math.floor(n/width);
   for(const next of [x?n-1:-1,x+1<width?n+1:-1,y?n-width:-1,y+1<height?n+width:-1]){
    if(next<0||seen[next]||!data[next*4+3])continue;seen[next]=1;members.push(next);
   }
  }
  components.push(members);
 }
 const largest=Math.max(...components.map(c=>c.length));
 for(const members of components)if(members.length<largest*.035)for(const n of members)data[n*4+3]=0;
}
function makeCanvas(name,box){
 const [x,y,w,h]=box;
 const x0=Math.round(x*info.width/1694),y0=Math.round(y*info.height/1504);
 const width=Math.round((x+w)*info.width/1694)-x0,height=Math.round((y+h)*info.height/1504)-y0;
 const crop=Buffer.alloc(width*height*4);
 for(let yy=0;yy<height;yy++)source.copy(crop,yy*width*4,((y0+yy)*info.width+x0)*4,((y0+yy)*info.width+x0+width)*4);
 const original=Buffer.from(crop);
 if(name==='night'){
  const outline=[[14,32],[16,28],[31,24],[47,20],[66,16],[86,14],[108,13],[133,14],[154,17],[173,22],[187,28],[193,32],[193,40],[189,53],[184,68],[178,83],[169,99],[160,111],[154,115],[141,114],[127,112],[115,108],[105,106],[94,106],[83,111],[74,108],[64,110],[57,115],[47,115],[39,111],[33,103],[29,94],[25,83],[23,72],[20,61],[18,48]];
  for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++)if(!inside((xx+.5)*207/width,(yy+.5)*126/height,outline))crop[(yy*width+xx)*4+3]=0;
 }else removeFrame(crop,width,height);
 if(name==='arrow'){
  for(let n=0;n<width*height;n++){const i=n*4,r=crop[i],g=crop[i+1],b=crop[i+2];if((g>r&&g>b*1.04)||(r<65&&g<90&&b<70))crop[i+3]=0;}
 }
 const size=Math.max(width,height),offset=[Math.floor((size-width)/2),Math.floor((size-height)/2)];
 const canvas=Buffer.alloc(size*size*4),originalCanvas=Buffer.alloc(size*size*4);
 for(let yy=0;yy<height;yy++){
  crop.copy(canvas,((yy+offset[1])*size+offset[0])*4,yy*width*4,(yy+1)*width*4);
  original.copy(originalCanvas,((yy+offset[1])*size+offset[0])*4,yy*width*4,(yy+1)*width*4);
 }
 if(name==='boat-vessel'){
  for(let yy=0;yy<size;yy++)for(let xx=0;xx<size;xx++){
   const i=(yy*size+xx)*4,r=canvas[i],g=canvas[i+1],b=canvas[i+2];
   const green=r>90&&r<225&&g>r*.94&&b<150&&g>b*1.3;
   if(!inside((xx+.5)*180/size,(yy+.5)*180/size,polygonVessel)||green)canvas[i+3]=0;
  }
 }
 return {data:canvas,originalCanvas,size,sourceBox:[x0,y0,width,height],sourceOffset:offset};
}
async function savePng(file,data,size){
 await sharp(data,{raw:{width:size,height:size,channels:4}}).png({compressionLevel:9,palette:false}).toFile(path.join(out,file));
}
function partPixels(asset,polygon,isCarrier,whiteUniform){
 const {size,data}=asset,part=Buffer.from(data);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,r=part[i],g=part[i+1],b=part[i+2];
  const halo=r>95&&r<195&&g>110&&g<205&&b>25&&b<115&&g>r*.95&&g>b*1.4;
  const cream=r>232&&g>216&&b>170&&!whiteUniform;
  const water=r<160&&g>130&&b>130&&Math.abs(g-b)<55;
  if(!inside((x+.5)*180/size,(y+.5)*180/size,polygon)||(isCarrier&&(halo||cream||water)))part[i+3]=0;
 }
 return part;
}
function backgroundClone(name,asset,parts){
 const {data,size}=asset,base=Buffer.from(data),union=new Uint8Array(size*size);
 for(const part of parts)for(let n=0;n<union.length;n++)if(part[n*4+3])union[n]=1;
 const role=name.startsWith('carrier-')?name.slice(8):null;
 const shirt=shirtColors[role],candidates={background:[],shirt:[],skin:[],any:[]};
 for(let n=0;n<union.length;n++){
  if(union[n]||!data[n*4+3])continue;
  const i=n*4,r=data[i],g=data[i+1],b=data[i+2],p=[r,g,b];
  const candidate={n,x:n%size,y:Math.floor(n/size),p};candidates.any.push(candidate);
  if((g>r*.95&&g>b*1.4&&r>90)||(r>232&&g>216&&b>170)||(r<160&&g>130&&b>130))candidates.background.push(candidate);
  if(shirt&&colorDistance(p,shirt)<90)candidates.shirt.push(candidate);
  if(colorDistance(p,[243,216,157])<50)candidates.skin.push(candidate);
 }
 let copied=0;const provenance=[];
 for(let n=0;n<union.length;n++){
  if(!union[n])continue;
  const x=n%size,y=Math.floor(n/size),lx=(x+.5)*180/size,ly=(y+.5)*180/size;
  let type='background';
  if(role&&ly>=80&&ly<=132&&lx>=(role==='blue'?37:60)&&lx<=(role==='blue'?98:128))type='shirt';
  else if(role&&ly>=45&&ly<80&&lx>=68&&lx<=118)type='skin';
  let options=candidates[type].length?candidates[type]:candidates.background;
  if(!options.length)options=candidates.any;
  let chosen=null,best=Infinity;
  for(const p of options){const d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;chosen=p;}}
  if(chosen){data.copy(base,n*4,chosen.n*4,chosen.n*4+4);provenance.push([n,chosen.n]);copied++;}
  else base[n*4+3]=0;
 }
 return {base,provenance,copied};
}
const assets=new Map(),manifest={},proof={sourceSha256:sourceHash,method:'Original JPEG pixels copied without resizing, recoloring, tracing, or generative painting. Alpha masking only; base repairs copy original unmasked pixels.',assets:[]};
for(const [name,box] of Object.entries(boxes)){
 const asset=makeCanvas(name,box);assets.set(name,asset);
 const file=name+'-still.png';await savePng(file,asset.data,asset.size);
 manifest[name]={still:relative(file),base:relative(file),parts:[],canvasSize:asset.size,logicalSize:180,sourceBox:asset.sourceBox,sourceOffset:asset.sourceOffset};
}
await fs.writeFile(path.join(root,'raster-art-data.mjs'),'export const rasterArt = '+JSON.stringify(manifest,null,2)+';\n');
const tileW=330,tileH=220,columns=4,rows=Math.ceil(assets.size/columns),contact=[];
let tileIndex=0;
for(const [name,a] of assets){
 const x=(tileIndex%columns)*tileW,y=Math.floor(tileIndex/columns)*tileH;
 const left=await sharp(a.originalCanvas,{raw:{width:a.size,height:a.size,channels:4}}).resize(160,180,{fit:'contain',background:{r:255,g:252,b:246,alpha:1}}).png().toBuffer();
 const right=await sharp(a.data,{raw:{width:a.size,height:a.size,channels:4}}).resize(160,180,{fit:'contain',background:{r:255,g:252,b:246,alpha:1}}).png().toBuffer();
 const label=Buffer.from(`<svg width="330" height="30"><text x="8" y="21" font-family="sans-serif" font-size="14" fill="#3e3a39">${name}: source / cutout</text></svg>`);
 contact.push({input:label,left:x,top:y},{input:left,left:x+2,top:y+30},{input:right,left:x+167,top:y+30});tileIndex++;
}
await sharp({create:{width:columns*tileW,height:rows*tileH,channels:4,background:'#FFFCF6'}}).composite(contact).png().toFile(path.join(out,'contact-sheet.png'));
console.log('Stills and contact sheet ready: '+assets.size);
if(!stillsOnly){
 for(const [name,asset] of assets){
  const isCarrier=name.startsWith('carrier-');
  const entries=isCarrier?Object.entries(limbs[name.slice(8)]):(details[name]?[details[name]]:[]);
  const partBuffers=[],partInfo=[];
  for(const [partName,polygon] of entries){
   const data=partPixels(asset,polygon,isCarrier,name==='carrier-white');
   if(!data.some((v,i)=>i%4===3&&v))continue;
   const file=name+'-'+partName+'.png';await savePng(file,data,asset.size);
   partBuffers.push(data);partInfo.push({name:partName,pivot:polygon[0],path:relative(file)});
  }
  const {base,provenance,copied}=backgroundClone(name,asset,partBuffers);
  if(partBuffers.length){const file=name+'-base.png';await savePng(file,base,asset.size);manifest[name].base=relative(file);}
  manifest[name].parts=partInfo;
  let opaque=0,stillMismatch=0,recompositionMismatch=0,cloneMismatch=0;
  const rebuilt=Buffer.from(base);
  for(const part of partBuffers)for(let i=0;i<part.length;i+=4)if(part[i+3])part.copy(rebuilt,i,i,i+4);
  for(let i=0;i<asset.data.length;i+=4){
   if(asset.data[i+3]){opaque++;for(let c=0;c<3;c++)if(asset.data[i+c]!==asset.originalCanvas[i+c])stillMismatch++;}
   for(let c=0;c<4;c++)if(rebuilt[i+c]!==asset.data[i+c])recompositionMismatch++;
  }
  for(const [to,from] of provenance)for(let c=0;c<4;c++)if(base[to*4+c]!==asset.data[from*4+c])cloneMismatch++;
  proof.assets.push({name,canvasSize:asset.size,visiblePixels:opaque,parts:partInfo.length,baseCopiedPixels:copied,stillRgbMismatch:stillMismatch,restRecompositionMismatch:recompositionMismatch,baseCopyMismatch:cloneMismatch});
  if(stillMismatch||recompositionMismatch||cloneMismatch)throw new Error('Pixel provenance failed for '+name);
 }
 await fs.writeFile(path.join(root,'raster-art-data.mjs'),'export const rasterArt = '+JSON.stringify(manifest,null,2)+';\n');
 const afterHash=createHash('sha256').update(await fs.readFile(sourceFile)).digest('hex');
 proof.sourceUnchanged=afterHash===sourceHash;
 await fs.writeFile(path.join(out,'pixel-provenance.json'),JSON.stringify(proof,null,2));
 console.log(JSON.stringify({assets:assets.size,parts:Object.values(manifest).reduce((n,a)=>n+a.parts.length,0),sourceUnchanged:proof.sourceUnchanged,pixelMismatches:proof.assets.reduce((n,a)=>n+a.stillRgbMismatch+a.restRecompositionMismatch+a.baseCopyMismatch,0)}));
}
