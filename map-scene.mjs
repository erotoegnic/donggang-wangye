import {artIcon} from './illustrated-art.mjs';
import {mapBackground} from './map-background.mjs';
export const temples=[
 {id:'ding',name:'東隆壇',district:'頂頭角',x:912,y:186},
 {id:'pu',name:'鎮靈宮',district:'埔仔角',x:1195,y:341},
 {id:'dingzhong',name:'進水宮',district:'頂中街',x:914,y:380},
 {id:'xiazhong',name:'朝隆宮',district:'下中街',x:729,y:402},
 {id:'anhai',name:'福安宮',district:'安海街',x:749,y:637},
 {id:'xia',name:'東福殿',district:'下頭角',x:578,y:786},
 {id:'lunding',name:'鎮海宮',district:'崙仔頂角',x:268,y:883},
 {id:'donglong',name:'東隆宮',district:'代天府',x:843,y:767}
].map(t=>({...t,url:t.id==='donglong'?'/about.html':`/neighborhoods/${t.id}.html`}));
export const characters=[
 ['ding','blue','溫府千歲',485,1000],['lunding','white','中軍府',595,1005],['xia','purple','五千歲',705,1000],['dingzhong','green','四千歲',815,1005],['anhai','black','三千歲',925,1000],['pu','pink','二千歲',1035,1005],['xiazhong','yellow','大千歲',1145,1000]
].map(([id,color,name,x,y])=>({id,color,name,x,y,url:`/carriers/${id}.html`}));
export const stories=[
 ['wudu','五毒大神','mask','/troupes/wudu.html',1150,65],['qibaye','七爺與八爺','qibaye','/troupes/shijiajiang.html',1200,550],['night','溫王查夜','lantern','/guide/night-patrol.html',80,360],['horse','王馬','horse','/people/vanguard.html',375,990],['offerings','添載','offerings','/guide/7.html',1200,795],['sails','升帆','flag','/guide/jialian-sails.html',80,665]
].map(([id,name,art,url,x,y])=>({id,name,art,url,x,y}));
export function terrain(){return `<div class="map-terrain original-map-window" aria-hidden="true"><img src="${mapBackground.url}" width="${mapBackground.width}" height="${mapBackground.height}" style="${mapBackground.style}" decoding="async" alt="" draggable="false"></div><svg class="map-terrain terrain-cover" viewBox="0 0 1271 1081" aria-hidden="true"><circle cx="843" cy="767" r="78" fill="#fff"/><path d="M410 900Q530 922 600 899L1190 896V1081H410Z" fill="#91ad3e"/><g fill="#aabb43"><path d="m430 919 89 16-7 61-81-8zm104 27 86 0 3 75-73-10zm124-32 91 4-5 68-88-4zm124 17 87-9 6 75-86 7zm111-20 84 6-5 70-85 1zm110 19 85 0 4 72-87 1zm118-20 64 4 1 72-69-4z"/></g></svg>`;}
export function scene(){return `${terrain()}${temples.map(t=>`<div class="temple-target" style="left:${t.x}px;top:${t.y}px" data-target="${t.id}"><button class="temple-drop" type="button" data-match="${t.id}" aria-label="${t.district}，放入宮廟"><span class="target-illustration">${artIcon('temple-'+t.id,'target-art',{animated:true})}</span><span class="target-district">${t.district}</span><span class="target-hint">放入宮廟</span></button><a class="target-read" href="${t.url}">${t.name}介紹 ↗</a></div>`).join('')}${characters.map((c,i)=>`<a href="${c.url}" class="map-character art-animated" style="left:${c.x}px;top:${c.y}px;--art-delay:-${i*.31}s" aria-label="2027 ${c.name}轎班介紹">${artIcon('carrier-'+c.color,'character-art',{animated:true})}<span>${c.name}</span></a>`).join('')}${stories.map(s=>`<a class="map-story art-animated" href="${s.url}" style="left:${s.x}px;top:${s.y}px" aria-label="${s.name}介紹">${artIcon(s.art,'story-art',{animated:true})}<span>${s.name}</span></a>`).join('')}<div class="sailing-track"><a class="sailing-boat art-animated" href="/guide/8.html" aria-label="航行中的王船，閱讀送王介紹">${artIcon('boat-vessel','boat-art',{animated:true})}<span>王船出航 ↗</span></a></div>`;}
