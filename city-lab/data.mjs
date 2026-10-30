import {pins} from '../home-map.mjs';
import {geography} from '../basemap.mjs';
import {articles,articlePath} from '../articles.mjs';

export const bounds=[120.4345,22.4515,120.4575,22.472];
export const project=(lng,lat)=>[(lng-120.448809)*3700,(22.463047-lat)*4000];
export const templeScale=.42;
const inside=([x,y])=>x>=bounds[0]&&x<=bounds[2]&&y>=bounds[1]&&y<=bounds[3];
function clipPolygon(points){
 let result=points;
 for(const [axis,value,sign] of [[0,bounds[0],1],[0,bounds[2],-1],[1,bounds[1],1],[1,bounds[3],-1]]){
  const input=result;result=[];
  for(let i=0;i<input.length;i++){
   const a=input[i],b=input[(i+1)%input.length],ia=(a[axis]-value)*sign>=0,ib=(b[axis]-value)*sign>=0;
   if(ia)result.push(a);
   if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);result.push(a.map((n,j)=>n+(b[j]-n)*t));}
  }
 }
 return result;
}
function clipSegment(a,b){
 let t0=0,t1=1;const dx=b[0]-a[0],dy=b[1]-a[1];
 for(const [p,q] of [[-dx,a[0]-bounds[0]],[dx,bounds[2]-a[0]],[-dy,a[1]-bounds[1]],[dy,bounds[3]-a[1]]]){
  if(p===0){if(q<0)return null;continue;}
  const r=q/p;if(p<0)t0=Math.max(t0,r);else t1=Math.min(t1,r);if(t0>t1)return null;
 }
 return [[a[0]+dx*t0,a[1]+dy*t0],[a[0]+dx*t1,a[1]+dy*t1]];
}
const shapeLayers=new Set(['sea','water','green']);
const polygons=geography.features.filter(f=>shapeLayers.has(f.layer)).map(f=>({...f,points:clipPolygon(f.points)})).filter(f=>f.points.length>=3).map(f=>({layer:f.layer,ref:f.ref,points:f.points.map(p=>project(...p))}));
const roads=geography.features.filter(f=>['major','minor','lane','bridge'].includes(f.layer)).flatMap(f=>f.points.slice(1).map((p,i)=>{const line=clipSegment(f.points[i],p);return line?{layer:f.layer,ref:f.ref,points:line.map(p=>project(...p))}:null}).filter(Boolean));
const central=pins.filter(p=>inside([p.lng,p.lat]));
export const outsidePlaces=pins.filter(p=>!inside([p.lng,p.lat]));
const details=[
 {id:'gate',title:'黃金牌樓',point:[0,5.4,3.4],anchorPoint:[0,8.25,3.4],url:'/about.html',copy:'從牌樓往裡走，認識東隆宮與東港迎王的故事。'},
 {id:'hall',title:'正殿',point:[0,8.8,-7.3],anchorPoint:[0,9.65,-7.3],url:'/about.html',copy:'從溫王信仰，讀到七角頭的傳承。'},
 {id:'incense',title:'廟埕香爐',point:[0,1.8,.05],url:'/rituals.html',copy:'一科迎王從籌備到送行，循著十三道程序往下讀。'},
 {id:'furnace',title:'金爐',point:[4.35,2.9,-.7],url:'/guide/daily-offerings.html',copy:'迎王的故事，也有王府內外的日常。'}
].map(p=>({...p,kind:'detail',priority:4,point:p.point.map(n=>n*templeScale),anchorPoint:(p.anchorPoint||p.point).map(n=>n*templeScale),parent:'donglong',link:'翻開故事'}));
export const places=[...central.map(p=>{
 const [x,z]=project(p.lng,p.lat),a=articles.find(a=>'/'+articlePath(a)===p.url);
 return {...p,title:p.id==='troupe-group-jialian-white-crane'?'汕尾仔舊嘉蓮宮':p.title,kind:p.id==='coast'?'coast':p.id==='donglong'?'donglong':'temple',size:p.category==='troupe-base'?.7:1,point:[x,p.id==='donglong'?4.5:3,z],anchorPoint:[x,.5,z],copy:a?.lead||'從東隆宮出發，認識溫王信仰、七角頭與迎王科儀。',link:'翻開故事',roof:'hallTile',roofBasis:p.id==='donglong'?'延用照片校準：金黃後殿、橘紅前殿、深栗紅牌樓':'無實景照片；橘紅瓦為通用台灣廟宇示意，未宣稱實際顏色'};
}),{id:'harbor',title:'東港漁港',kind:'harbor',priority:1,lng:120.441571,lat:22.466292,point:[...project(120.441571,22.466292).slice(0,1),1,project(120.441571,22.466292)[1]],anchorPoint:[project(120.441571,22.466292)[0],.2,project(120.441571,22.466292)[1]],url:'/map.html',copy:'沿著港邊看漁船，再到地圖看看東港的街道與海岸。',link:'打開迎王地圖',coordSource:{type:'osm-coastline',ref:'OSM coastline',method:'沿用網站底圖港池岸線頂點；港口範圍示意，非設施入口'}},...details].map((p,i)=>({...p,number:String(i+1).padStart(2,'0')}));
export const separateStories=[
 {title:'靈帝殿班頭',url:'/people/bantou.html#section-7',copy:'靈帝殿班頭與東隆宮的借班傳承。'},
 {title:'東隆宮（振武堂）',url:'/people/bantou.html',copy:'東隆宮振武堂的執事與傳承。'},
 {title:'後塭仔嘉蓮宮班頭',url:'/people/bantou.html#section-9',copy:'後塭仔嘉蓮宮的班頭傳承。'},
 {title:'汕尾仔舊嘉蓮宮班頭',url:'/people/bantou.html#section-9',copy:'汕尾仔舊嘉蓮宮的班頭傳承。'},
 {title:'賢隆宮梓童尊王駕前鶴仙陣',url:'/troupes/group-xianlong-cranes.html',copy:'非定點陣團。'}
];
export const worldData={bounds:[project(bounds[0],bounds[3]),project(bounds[2],bounds[1])],polygons,roads,places:places.filter(p=>p.kind!=='detail'),source:'data/donggang-basemap.json'};
