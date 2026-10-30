import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const source=await fs.readFile(new URL('./art-source/donggang-original-map.jpg',import.meta.url));
const metadata=await sharp(source).metadata();
const sx=1694/metadata.width,sy=1504/metadata.height;
export const mapCrop={left:Math.floor(211/sx),top:Math.floor(212/sy)};
mapCrop.width=Math.ceil((211+1271)/sx)-mapCrop.left;
mapCrop.height=Math.ceil((212+1081)/sy)-mapCrop.top;
const hash=createHash('sha256').update(source).update(JSON.stringify(mapCrop)).update('lossless-v1').digest('hex').slice(0,12);
export const mapBackground={
 url:'/assets/map-background-'+hash+'.webp',
 style:`left:${mapCrop.left*sx-211}px;top:${mapCrop.top*sy-212}px;width:${mapCrop.width*sx}px;height:${mapCrop.height*sy}px`,
 width:mapCrop.width,height:mapCrop.height
};
export async function writeMapBackground(){
 const output='dist'+mapBackground.url;
 try{await fs.access(output);}catch{await sharp(source).extract(mapCrop).webp({lossless:true,effort:4}).toFile(output);}
}
