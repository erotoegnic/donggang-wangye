import guideRecords from './guide-topics.mjs';
import {withLegends} from './troupe-legends.mjs';
import {neighborhoods, roles, troupes, days} from './content.mjs';
import troupeCatalogue from './troupe-catalog.mjs';
import carrierRecords from './carriers.mjs';
export {assignments2009} from './carriers.mjs';
import ritualRecords from './ritual-details.mjs';
import {assignments2027} from './assignments.mjs';
export {assignments2027};
import {placeStories, roleStories, troupeStories, dayStories, background, ritualStages} from './stories.mjs';

export const chapters = [
  {key:'overview',path:'overview.html',title:'迎王全覽',subtitle:'從上一科抽籤，讀到送王後',icon:'book',color:'yellow'},
  {key:'about',path:'about.html',title:'認識迎王',subtitle:'從信仰與歷史，讀懂三年一科',icon:'book',color:'yellow'},
  {key:'guide',path:'guide.html',title:'祭典流程',subtitle:'迎王前科儀・八天祭典',icon:'calendar',color:'yellow'},
  {key:'people',path:'people.html',title:'職務介紹',subtitle:'王府內外，每份工作的意義',icon:'person',color:'green'},
  {key:'neighborhoods',path:'neighborhoods.html',title:'迎王地圖',subtitle:'從海港出發，走進七角頭',icon:'map',color:'blue'},
  {key:'troupes',path:'troupes.html',title:'陣頭與藝陣',subtitle:'從角色、陣式走進地方傳承',icon:'mask',color:'coral'}
];
const roleSlugs=['chief','deputy','marshal','music','bantou','neisi','carriers','vanguard'];
const troupeSlugs=['wudu','thirteen','shijiajiang','twentyfour','twelve','shengjiang'];
export const places=neighborhoods.map((n,i)=>({ ...n, slug:n.id, title:n.name, kicker:n.temple, lead:n.tag, icon:'temple', category:'neighborhoods', number:i+1, facts:[['角頭廟',n.temple],['主要信仰',n.deity]], map:n.temple, sections:placeStories[n.id]||[] }));
export const people=roles.map((r,i)=>({...r,slug:roleSlugs[i],title:r.name,kicker:r.type,lead:r.intro,category:'people',color:['yellow','green','coral','blue'][i%4],sections:roleStories[roleSlugs[i]]||[]}));
const musicRole=people.find(p=>p.slug==='music');
musicRole.lead='東隆宮大漢樂團在迎王期間擔任神樂團，負責駕前吹班及祀王、敬王、宴王的禮樂。';
musicRole.facts=[['迎王職務','神樂團'],['承擔團體','東隆宮大漢樂團']];
for(const [slug,title,type,icon,lead] of [
 ['inner-outer','內、外總理','祭祀人員','person','協助王府禮儀，銜接迎王的各項工作。'],
 ['advisers','參事','祭祀人員','book','曾任總理等職務者，協助下一科籌備與行禮。'],
 ['committee','祭典委員會','祭祀人員','book','讓跨角頭的籌備工作得以持續運作。'],
 ['boat-team','王船工作團隊','禮樂與執事','boat','從造船、整備到遷船，把王船帶向送王的終點。']
]) people.push({slug,title,type,kicker:type,icon,lead,category:'people',color:'yellow',sections:roleStories[slug]||[]});
export const ensembles=troupes.map((t,i)=>({...t,slug:troupeSlugs[i],title:t.name,kicker:t.group,lead:t.intro,category:'troupes',sections:withLegends(troupeSlugs[i],troupeStories[troupeSlugs[i]]||[])}));
export const itinerary=days.map((d,i)=>({...d,slug:String(i+1),title:['請水・恭迎王駕','第一輪分區遶境','第二輪分區遶境','中區遶境','農區遶境','王船法會・敬王','遷船・添載・宴王','送王'][i],kicker:`第 ${i+1} 天`,lead:['從海邊請王，到回宮安座，一科迎王正式展開。','沿著街庄的迎接，認識王駕出巡的秩序。','王駕接續巡行另一分區，宮廟與居民沿途迎駕。','王駕巡行中區宮廟與街市，居民設案迎駕。','王駕巡行農村庄頭，祈求農作豐收與地方平安。','王船法會與敬王依禮舉行，由道士、總理、內司及禮樂人員分工。','陸上行舟之後，還有添載與送行前的宴王。','從王船離宮到海邊送王，為一科迎王畫下句點。'][i],category:'guide',color:['blue','green','coral','yellow'][i%4],number:i+1,area:i===1||i===2?'南／北區・依當科先後輪替':d.area,sections:dayStories[String(i+1)]||[]}));
export const catalogue=troupeCatalogue.map(t=>({...t,sections:withLegends(t.slug,t.sections),category:'troupes',directory:true}));
export const carriers=carrierRecords.map((t,i)=>({...t,category:'carriers',icon:'person',color:['blue','yellow','green','coral'][i%4]}));
export const ritualDetails=ritualRecords.map(t=>({...t,category:'rituals',icon:'book',color:'yellow'}));
for(const article of [...places,...carriers]){
 const current=assignments2027.find(a=>a.slug===article.slug);
 article.facts=[...(article.facts||[]),['2027 丁未職務',current.role],['轎衫職務色',current.color]];
}
export const guideTopics=guideRecords.map(t=>({...t,category:"guide",thematic:true}));
export const guideSequence=['marshal-opening','boat-preparations','invitation-palace','jialian-sails','1','daily-offerings','night-patrol','2','jialian-visit','3','4','5','6','night-petitions','7','8'].map(slug=>[...guideTopics,...itinerary].find(a=>a.slug===slug));
export const articles=[...guideTopics,...places,...people,...ensembles,...itinerary,...catalogue,...carriers,...ritualDetails];
export {background,ritualStages};
export const articlePath=a=>`${a.category}/${a.slug}.html`;

