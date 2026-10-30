import {articles,articlePath,ritualStages,places,catalogue} from './articles.mjs';

const link=(url,title)=>({url,title});
export const articleLink=(category,slug)=>{
 const a=articles.find(a=>a.category===category&&a.slug===slug);
 if(!a)throw Error(`Unknown reading: ${category}/${slug}`);
 return link('/'+articlePath(a),a.title);
};
const day=n=>link(`/guide/${n}.html`,`第 ${n} 天`);
export const preFestivalLink=link('/guide/pre-festival.html','迎王前的科儀');
const before=link(preFestivalLink.url,'迎王前');
const daily=link('/guide/daily-offerings.html','請水後至送王前・每日晨昏');
const definitions=[
 ['lottery','上一科送王後隔兩天，七角頭抽定下一科神職，再安排祭祀人員與轎班工作。',[before,link('/people/carriers.html#section-5','上一科送王後抽職務')],'lottery'],
 ['marshal','中軍府先行到任，負責傳令、巡察及監督王船建造。',[before],'before'],
 ['boat','師傅以木工、雕刻與彩繪建造王船，依序完成開斧、豎舟參與開光。',[before],'before'],
 ['invitation','總理代表地方呈送表文，恭請千歲爺蒞臨巡狩。',[before],'before'],
 ['palace','東隆宮布置為代天府，上樑後準備迎接五府千歲駐蹕。',[before],'before'],
 ['welcoming','到海邊請王，以報銜頭確認大千歲尊姓，再恭迎王駕回宮。',[day(1)],'day-1'],
 ['fire','請水後回到東隆宮過火，潔淨去穢，再入王府安座。',[day(1)],'day-1'],
 ['procession','王駕巡行南、北、中與農區，宮廟和家戶沿途迎駕。',[day(2),day(3),day(4),day(5)],'day-2'],
 ['offerings','王府晨昏備供品祀王，各團體另依安排入府敬王。',[daily,day(1),day(6)],'daily'],
 ['rites','法師在廟埕主持王船法會，完成和瘟押煞、開水路等科儀。',[day(6),day(7)],'day-6'],
 ['moving','轎班分領船身、桅帆與錠索，讓王船遶行街庄，回廟後清點添載。',[day(7)],'day-7'],
 ['banquet','總理、內司與神樂團依禮進獻，設宴餞別王駕。',[day(7)],'day-7'],
 ['sending','王船前往海岸，立桅掛帆、迎請王令上船，恭送千歲爺返天覆旨。',[day(8)],'day-8']
];
export const stageFlow=definitions.map(([id,summary,periods,anchor],i)=>({id,summary,periods,anchor,phase:i<5?'before':'festival',number:i+1,title:ritualStages[i].title,url:`/rituals.html#stage-${i+1}`}));
export function readingTone(url){
 const [pathname,hash='']=url.split('#');
 const article=articles.find(a=>'/'+articlePath(a)===pathname);
 if(pathname===preFestivalLink.url||article?.phase==='before'||pathname==='/guide.html'&&['before','pre-festival'].includes(hash)||pathname==='/overview.html'&&['before','pre-festival','lottery'].includes(hash)||pathname==='/rituals.html'&&(hash==='pre-procedures'||/^stage-[1-5]$/.test(hash)))return 'vermilion';
 const belongsTo=categories=>categories.some(category=>pathname===`/${category}.html`||pathname.startsWith(`/${category}/`));
 if(belongsTo(['guide','rituals']))return 'indigo';
 if(belongsTo(['people','carriers']))return 'gold';
 if(belongsTo(['neighborhoods'])||pathname.startsWith('/?item='))return 'pine';
 if(belongsTo(['troupes']))return 'plum';
 return 'sky';
}
export const dayStages={1:[6,7,9],2:[8,9],3:[8,9],4:[8,9],5:[8,9],6:[9,10],7:[9,10,11,12],8:[13]};
export const topicStages={'marshal-opening':[2],'boat-preparations':[3],'invitation-palace':[4,5],'jialian-sails':[],'daily-offerings':[9],'night-patrol':[],'jialian-visit':[],'night-petitions':[10]};
export const overviewPosition=a=>a.category==='guide'?(a.number?'day-'+a.number:a.phase==='before'?'before':a.slug==='jialian-visit'?'jialian-visit':a.slug==='night-petitions'?'petitions':'daily'):a.category==='rituals'?stageFlow[a.stageNumber-1].anchor:a.category==='people'?'roles':a.category==='carriers'?'carriers':a.category==='neighborhoods'?'places':'troupes';
export const roleFlow={
 chief:{summary:'由負責大千歲的角頭遴選，代表地方主祭。',when:'祭前進表、祀王與第 7 天宴王',links:[['guide','invitation-palace'],['rituals','court-offerings'],['guide','7']]},
 deputy:{summary:'其餘六角頭各遴選一位副總理，陪祭並協調角頭工作。',when:'籌備、王令安座、祀王與宴王',links:[['people','chief'],['rituals','court-offerings'],['people','carriers']]},
 'inner-outer':{summary:'協助大總理，銜接府內禮儀、供品與府外隊伍。',when:'進表、祀王、宴王與送王',links:[['guide','invitation-palace'],['rituals','court-offerings'],['guide','8']]},
 advisers:{summary:'由熟悉前科程序的人員擔任，協助新任人員準備和交接。',when:'籌備會議、王船上樑與團體敬王',links:[['guide','boat-preparations'],['people','chief'],['people','committee']]},
 committee:{summary:'總務、經理、典務、設計與指揮五科協調祭典和志工工作。',when:'祭前籌備至第 8 天送王',links:[['people','boat-team'],['guide','1'],['guide','7']]},
 marshal:{summary:'千歲爺的前鋒，先行到任、巡察並監造王船。',when:'祭前安座、巡境與造船',links:[['guide','marshal-opening'],['guide','boat-preparations'],['people','bantou']]},
 neisi:{summary:'振文堂內司處理榜文、疏文、供品和王府唱禮。',when:'祀王、敬王、宴王與夜間查夜',links:[['guide','daily-offerings'],['rituals','court-offerings'],['guide','night-patrol']]},
 bantou:{summary:'東隆宮振武堂班頭站班、開道、作紙，並承接查夜與放告差務。',when:'第 1 天請水、每日晨昏與夜間',links:[['guide','daily-offerings'],['guide','night-patrol'],['guide','night-petitions']]},
 music:{summary:'東隆宮大漢樂團擔任神樂團，負責駕前吹班與府內禮樂。',when:'祭前扮仙、遶境、祀王與宴王',links:[['guide','boat-preparations'],['guide','daily-offerings'],['guide','7']]},
 carriers:{summary:'七角頭轎班扛抬神轎，遷船時依神職分擔船身與船具。',when:'職務抽籤、第 1–8 天與遷船分工',links:[['rituals','welcoming'],['rituals','boat-duties'],['guide','8']]},
 vanguard:{summary:'先鋒官前行通報，砲首以炮聲傳遞王駕行進訊息。',when:'王駕出巡、停駕與進廟',links:[['guide','2'],['people','bantou'],['people','carriers']]},
 'boat-team':{summary:'造船師傅與工作人員完成船體、船具及添載交接。',when:'祭前造船、第 7 天遷船及第 8 天送王',links:[['guide','boat-preparations'],['rituals','boat-duties'],['guide','8']]}
};
const localTroupes={dingzhong:'group-gongshan-shijia',xia:'group-dongfu-twentyfour',pu:'group-zhenling-thirteen'};
export function relatedFor(a){
 if(a.category==='people')return roleFlow[a.slug].links.map(([c,s])=>articleLink(c,s));
 if(a.category==='neighborhoods'||a.category==='carriers'){
  return [articleLink(a.category==='carriers'?'neighborhoods':'carriers',a.slug),articleLink('people','carriers'),articleLink('rituals','boat-duties'),...(localTroupes[a.slug]?[articleLink('troupes',localTroupes[a.slug])]:[])];
 }
 if(a.category==='rituals')return [...a.days.map(day),articleLink('people',a.slug==='welcoming'?'bantou':a.slug==='boat-duties'?'boat-team':'neisi')];
 if(a.category==='guide'){
  const related={1:[['rituals','welcoming'],['people','bantou'],['people','carriers']],2:[['people','vanguard'],['guide','jialian-visit'],['troupes','group-xiato-songjiang']],3:[['people','carriers'],['people','music'],['guide','night-patrol']],4:[['people','neisi'],['people','vanguard'],['guide','daily-offerings']],5:[['people','carriers'],['people','committee'],['guide','night-patrol']],6:[['rituals','ritual-work'],['rituals','court-offerings'],['guide','night-petitions']],7:[['rituals','boat-duties'],['people','boat-team'],['rituals','court-offerings']],8:[['rituals','boat-duties'],['guide','jialian-sails'],['people','carriers']],
   'marshal-opening':[['people','marshal'],['people','bantou'],['guide','boat-preparations']],
   'boat-preparations':[['people','boat-team'],['people','music'],['people','marshal']],
   'invitation-palace':[['people','chief'],['people','neisi'],['guide','1']],
   'jialian-sails':[['guide','jialian-visit'],['guide','1'],['guide','8']],
   'daily-offerings':[['people','bantou'],['people','neisi'],['people','music']],
   'night-patrol':[['people','bantou'],['people','neisi'],['people','carriers']],
   'jialian-visit':[['guide','2'],['guide','jialian-sails'],['people','bantou']],
   'night-petitions':[['guide','6'],['people','bantou'],['rituals','ritual-work']]};
  return related[a.slug].map(([c,s])=>articleLink(c,s));
 }
 if(a.category==='troupes'){
  const place=places.find(p=>localTroupes[p.slug]===a.slug);
  const relatives=a.relatedType?[articleLink('troupes',a.relatedType)]:catalogue.filter(t=>t.relatedType===a.slug).slice(0,2).map(t=>articleLink('troupes',t.slug));
  return [...relatives,...(place?[articleLink('neighborhoods',place.slug)]:[]),link('/troupes.html#directory','陣團名錄'),link('/guide.html#festival-days','八天流程中的遶境')].slice(0,4);
 }
 throw Error(`Missing related readings: ${a.category}/${a.slug}`);
}
