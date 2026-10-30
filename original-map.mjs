import {places,assignments2027} from './articles.mjs';

export const mapWidth=1694, mapHeight=1504;
export const originalImage='/assets/donggang-original-map.jpg';
const stops=[];
const add=(id,label,sub,group,box,url,motion,detail,extra={})=>{
 const [left,top,width,height]=box;
 stops.push({id,label,sub,group,left,top,width,height,x:left+width/2,y:top+height/2,url,motion,detail,...extra});
};
const centers={lunding:[406,1013,146,165],xia:[710,918,158,160],anhai:[890,770,140,158],xiazhong:[868,533,143,163],dingzhong:[1052,516,146,152],ding:[1045,322,157,153],pu:[1334,474,144,157]};
const paintings={lunding:[689,1312,165,166],xia:[465,28,170,167],anhai:[1502,1095,174,174],xiazhong:[1504,478,174,173],dingzhong:[17,1311,167,173],ding:[20,209,171,173],pu:[18,768,172,174]};
places.forEach(p=>{
 add(p.slug,p.temple,p.title,'宮廟',centers[p.slug],`/neighborhoods/${p.slug}.html`,'place',p.lead,{terrain:true});
 add('art-'+p.slug,p.temple,p.title+'・宮廟插畫','宮廟',paintings[p.slug],`/neighborhoods/${p.slug}.html`,'temple',p.lead);
});
add('donglong','東隆宮','代天府','宮廟',[973,898,161,161],'/about.html','place','東港溫王信仰與迎王祭典的中心。從溫王傳說、漂木建廟，讀到七角頭的傳承。',{terrain:true});
add('art-donglong','東隆宮','宮廟插畫','宮廟',[1298,21,175,172],'/about.html','temple','東隆宮奉祀溫府千歲，是迎王祭典的中心。');
add('coast','鎮海海岸','請水・送王','科儀',[216,1156,148,127],'/guide/1.html','place','請水時在海邊恭迎王駕；送王時，王船由東隆宮遷往海岸。',{terrain:true});
const portraits=[
 ['xiazhong',[39,1135,143,159]],['pu',[688,32,141,161]],['anhai',[38,33,149,161]],['dingzhong',[23,592,157,161]],['xia',[477,1312,146,163]],['lunding',[1316,1311,143,173]],['ding',[1513,691,150,166]]
];
for(const [slug,box] of portraits){const a=assignments2027.find(a=>a.slug===slug);add('carrier-'+slug,a.role+'轎班','2027・'+a.neighborhood,'轎班',box,`/carriers/${slug}.html`,'carrier',`2027 丁未正科由${a.neighborhood}負責${a.role}，轎衫為${a.color}。閱讀轎班傳承、職務與歷科輪值。`);}
const parade=[['ding',[636,1123,131,159]],['lunding',[752,1130,110,152]],['xia',[863,1126,108,156]],['dingzhong',[969,1122,108,159]],['anhai',[1076,1126,107,157]],['pu',[1180,1124,105,158]],['xiazhong',[1284,1126,115,159]]];
for(const [slug,box] of parade){const a=assignments2027.find(a=>a.slug===slug);add('parade-'+slug,a.role+'轎班','2027・'+a.neighborhood+'・隊伍插畫','轎班',box,`/carriers/${slug}.html`,'parade',`2027 丁未正科由${a.neighborhood}負責${a.role}，轎衫為${a.color}。`,{terrain:true});}
for(const row of [
 ['wudu','五毒大神','五毒陣','陣頭',[872,22,151,176],'/troupes/wudu.html','mask','共心堂五毒大神的角色、臉譜與陣式。'],
 ['qibaye','八爺','什家將','陣頭',[1512,247,158,181],'/troupes/shijiajiang.html','eighth','從家將的角色分工，認識什家將的傳承與陣式。'],
 ['seventh','七爺','什家將','陣頭',[910,1320,153,157],'/troupes/shijiajiang.html','seventh','七爺與八爺的角色及家將陣式。'],
 ['lantern','燈籠','代天府設置','科儀',[1072,36,181,155],'/guide/invitation-palace.html','lantern','進表、代天府上樑與迎王前的準備。'],
 ['arch','牌樓','東隆宮','宮廟',[21,402,169,174],'/about.html','arch','從東隆宮走入溫王信仰與東港往事。'],
 ['night','溫王查夜','祭期每晚','科儀',[229,39,185,148],'/guide/night-patrol.html','night','溫王爺轎班在迎王期間每晚查夜，巡察王府與地方。'],
 ['horse','王馬','王府執事','科儀',[1097,1314,168,167],'/people/vanguard.html','horse','王馬、馬伕與駕前隊伍的職務分工。'],
 ['offerings','添載','王船行裝','科儀',[1506,897,169,158],'/guide/7.html','offering','遷船後準備王船行裝，添載物資，接續宴王。'],
 ['send','送王','王船出航','科儀',[243,1318,195,164],'/guide/8.html','boat','王船離宮、遷往海岸，舉行送王。'],
 ['blessing','祈福','平安祈願','科儀',[27,966,156,159],'/rituals/welcoming.html','blessing','從請水、候駕與報銜頭，認識恭迎王駕的程序。'],
 ['sails','平安祭典','科儀介紹','科儀',[1529,17,145,192],'/guide.html','flag','從迎王前的中軍到任、嘉蓮宮升帆，到祭期的請水、巡境與送王。'],
 ['palace','設置代天府','迎王籌備','科儀',[1507,1310,165,171],'/guide/invitation-palace.html','palace','進表、代天府上樑與迎駕準備。']
])add(...row);
export const mapStops=stops;

// One shared original image is clipped in the browser; the source artwork remains unchanged.
const photo=()=>`<image href="${originalImage}" width="${mapWidth}" height="${mapHeight}" preserveAspectRatio="none"/>`;
export function originalPlaceArt(slug,cls='card-icon'){
 const box=paintings[slug];if(!box)return '';
 return `<svg class="${cls}" viewBox="${box.join(' ')}" aria-hidden="true">${photo()}</svg>`;
}
export function originalTerrain(){return `<svg class="map-terrain" viewBox="0 0 ${mapWidth} ${mapHeight}" aria-hidden="true">${photo()}</svg>`;}
export function originalHotspot(p,i){return `<a class="map-stop original-stop motion-${p.motion}${p.terrain?' terrain-stop':''}${p.left<200?' edge-left':p.left>1450?' edge-right':''}${p.top>1250?' edge-bottom':''}" id="map-${p.id}" href="${p.url}" data-id="${p.id}" data-group="${p.group}" data-x="${p.x}" data-y="${p.y}" data-detail="${p.detail}" style="left:${p.left}px;top:${p.top}px;width:${p.width}px;height:${p.height}px;--delay:-${i*.29}s;--tempo:${3.5+(i%7)*.43}s;--swing:${i%2?1:-1}" aria-label="${p.label}・${p.sub}，閱讀介紹"><svg class="original-art" viewBox="${p.left} ${p.top} ${p.width} ${p.height}" aria-hidden="true">${photo()}</svg><span class="map-stop-tooltip"><span class="map-stop-name">${p.label}</span><small>${p.sub}</small></span></a>`;}
