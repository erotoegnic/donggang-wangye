import {people,places,carriers,catalogue,assignments2027} from './articles.mjs';
import {articleLink,roleFlow,stageFlow,preFestivalLink} from './flow.mjs';

const a=(category,slug)=>articleLink(category,slug);
const l=(url,title)=>({url,title});
const entry=(id,title,text,links,meta='')=>({id,title,paragraphs:[text],links,meta});
const walkingLinks=[a('people','carriers'),a('people','vanguard'),a('people','music')];
const timeline=[
 entry('lottery','上一科送王後：抽定下一科職務','上一科送王後隔兩天，七角頭在東隆宮先抽順序，再抽神職。抽中大千歲的角頭遴選大總理，各角頭開始準備神轎、轎衫、旗傘與人員。',[a('people','carriers'),a('people','chief'),l('/carriers.html','七角頭轎班一覽')],'一科接著一科'),
 entry('before','中軍先到，王船與王府接續準備','中軍府先行安座、開光巡境，並監督王船建造。造船、進表、代天府上樑與嘉蓮宮升帆各有時序，籌備工作也會同時進行。',[preFestivalLink],'八天之前'),
 entry('marshal-opening','中軍府安座、開光與巡境','內司奉請、道長開光，總理團參與祭拜，轎班承接神轎移動。溫王在前、中軍在後巡行七角頭，回宮安座後接續監造與籌備。',[a('guide','marshal-opening'),a('people','marshal'),a('people','bantou')]),
 entry('boat-preparations','王船開斧、豎舟參、開光與扮仙','造船師傅從龍骨開斧開始，接著完成船體、彩繪及開光。神樂團配合祭祀，並在中軍安座、豎舟參及開光後演奏《醉八仙》。',[a('guide','boat-preparations'),a('people','boat-team'),a('people','music')]),
 entry('invitation-palace','進表與代天府上樑','總理代表地方呈送表文，恭請千歲爺蒞臨。祭期將近，東隆宮布置代天府，上樑時將太極金、粽子與五穀包安置中樑，準備迎駕。',[a('guide','invitation-palace'),a('people','chief'),a('people','neisi')]),
 entry('sails','後塭仔嘉蓮宮升帆','後塭仔嘉蓮宮依請示時辰，為平日收帆的茅王船升帆。茅府千歲乘船出迎，接引巡狩千歲爺船隊進入金茄萣港。',[a('guide','jialian-sails'),a('guide','jialian-visit')]),
 entry('day-1','第 1 天：請水、報銜頭、過火與安座','隊伍到鎮海海岸恭迎王駕，班頭在將台前站班，大千歲轎班頭籤報銜頭，確認尊姓。王駕經新街回東隆宮過火，再入代天府安座，內司、總理與神樂團接續祀王。',[a('guide','1'),a('rituals','welcoming'),a('people','bantou'),a('troupes','group-fenglong-golden')],'鎮海公園海岸・新街・東隆宮'),
 entry('day-2','第 2 天：第一輪分區遶境','王駕展開四天分區巡狩，先走南、北兩區中的一區；兩區先後隨科年輪替。轎班扛轎，先鋒官與砲首傳訊，班頭和神樂團配合行列；下頭角許府元帥宋江陣的故事，可對照王馬與中軍前導隊伍。',[a('guide','2'),a('troupes','group-xiato-songjiang'),...walkingLinks.slice(0,2)],'南／北區・第一輪'),
 entry('day-3','第 3 天：第二輪分區遶境','隊伍接續巡行另一分區，宮廟與居民沿途迎駕。輪到家戶所在區域時，街邊擺香案，家裡也辦桌迎接親友；回宮後，晨昏祭祀與夜間待命繼續。',[a('guide','3'),a('people','carriers'),a('people','music'),a('guide','night-patrol')],'南／北區・第二輪'),
 entry('day-4','第 4 天：中區遶境','王駕巡行中區街市，店家與家戶設案迎接。王駕出府時，內司貼上王府封條；回駕後揭封，恭迎安座，接續府內禮儀。',[a('guide','4'),a('people','neisi'),a('people','vanguard')],'中區街市'),
 entry('day-5','第 5 天：農區遶境','四天巡狩走到農村庄頭，將進表中的農、漁、商祈願帶進地方。轎班、指揮人員與沿途宮廟接力，完成這一輪分區遶境。',[a('guide','5'),a('people','carriers'),a('people','committee')],'農區庄頭'),
 entry('day-6','第 6 天：王船法會與敬王','遶境告一段落，法師在廟埕主持王船法會，包含和瘟押煞、開水路等科儀。王府內由總理、內司與神樂團依禮敬王；角頭拜王還有名簿唱名、選下科爐主與乞米包。',[a('guide','6'),a('rituals','ritual-work'),a('rituals','court-offerings')],'東隆宮代天府・廟埕法壇・王船周邊'),
 entry('day-7','第 7 天：遷船、添載與宴王','王船由七角頭轎班分工拖曳、扛運船具，遶行街庄。回廟後，大千歲轎班守船，典務與王船工作人員依艙口簿清點添載；王府內則由總理、內司和神樂團設宴餞別王駕。',[a('guide','7'),a('rituals','boat-duties'),a('people','boat-team'),a('rituals','court-offerings')],'東隆宮・市街・代天府'),
 entry('day-8','第 8 天：送王','宴王後，王令、神轎與王船前往鎮海海岸。眾人立桅、掛帆、完成添載並迎請王令上船，王船火化航向天河，千歲爺返天覆旨；轎班脫下職務衣帽，回到日常生活。',[a('guide','8'),a('rituals','boat-duties'),a('people','carriers')],'鎮海公園海岸'),
 entry('daily','每日晨昏與夜間：作紙、祀王、報時與查夜','請水後至送王前，班頭作紙點兵，內司備辦供品，總理行禮，神樂團配合唱禮。夜裡班頭敲更鼓、更鑼；溫王出巡時，由班頭開道，內司與溫王轎班提燈隨行，巡看七角頭及送王海岸。',[a('guide','daily-offerings'),a('guide','night-patrol'),a('people','neisi'),a('people','music')],'貫穿祭期的日常'),
 entry('jialian-visit','嘉蓮過府：夜間作客，清晨接駕','後塭仔嘉蓮宮與汕尾仔舊嘉蓮宮輪科迎請大千歲王令及值科中軍王令作客，多安排在第二晚。王令在聚落受祭後，清晨送回代天府，溫王爺神轎出迎接駕。',[a('guide','jialian-visit'),a('guide','2'),a('guide','night-patrol')],'第二晚至隔日清晨；部分科年安排第三晚'),
 entry('petitions','放告：王府開堂','第六晚近午夜，王府舉行放告，千歲爺開堂受理陰幽申告。班頭執行差務，王府正門前保持淨空。',[a('guide','night-petitions'),a('people','bantou')],'遷船前一晚'),
 entry('after','送王後：降帆與偃旗息鼓','嘉蓮宮再請示降帆時辰，將茅王船船帆收回。東港偃旗息鼓，祭典人員整理器物與交接，七角頭再抽定下一科職務。',[a('guide','jialian-sails'),a('guide','8'),a('people','carriers')],'一科收束，接續下一科')
];
const firstDay=timeline.findIndex(e=>e.id==='day-1');
export const preFestivalEntries=timeline.slice(0,firstDay);
const festivalEntries=timeline.slice(firstDay,-1);
const roleEntries=people.map(p=>entry('role-'+p.slug,p.title,roleFlow[p.slug].summary,[a('people',p.slug),...roleFlow[p.slug].links.slice(0,1).map(([c,s])=>a(c,s))],'主要出現在：'+roleFlow[p.slug].when));
const carrierEntries=carriers.map(c=>{const current=assignments2027.find(x=>x.slug===c.slug);const p=places.find(x=>x.slug===c.slug);return entry('carrier-'+c.slug,c.title,`${p.temple}是${p.title}的代表廟；轎班保存神轎與祭器，按科年抽定職務。2027 丁未科負責${current.role}，轎衫職務色為${current.color}。`,[a('carriers',c.slug),a('neighborhoods',c.slug)],'主要出現在：請水、遶境、拜王、遷船與送王');});
const placeEntries=[
 entry('place-donglong','東隆宮','溫府千歲常駐的廟宇，也是七角頭職務抽籤、迎王籌備與王駕回宮的重要場所。',[l('/?item=donglong','在首頁地圖看東隆宮'),l('/about.html','認識溫王與東隆宮'),a('guide','marshal-opening')]),
 entry('place-palace','代天府','迎王期間，東隆宮正殿布置為代天府。王駕在此安座，晨昏祀王、敬王、宴王與放告也在此進行。',[a('guide','invitation-palace'),a('guide','daily-offerings'),a('guide','night-petitions')]),
 entry('place-coast','鎮海公園海岸','第 1 天在海邊請水迎王，第 8 天在海岸恭送王駕；送王前的查夜也巡看海灘。',[l('/?item=coast','在首頁地圖看海岸'),a('guide','1'),a('guide','8')]),
 entry('place-boat','王船廠與王船寮','師傅在此建造、整備王船，船廠另奉中軍神位。王船完成後接續添載，準備遷船與送王。',[a('guide','boat-preparations'),a('people','boat-team'),a('rituals','boat-duties')]),
 entry('place-jialian','後塭仔開基大清府嘉蓮宮','茅王船在迎王前升帆、送王後降帆；聚落與汕尾仔輪科迎請王令過府，各有自己的班頭。',[l('/?item=jialian','在首頁地圖看後塭仔嘉蓮宮'),a('guide','jialian-sails'),a('guide','jialian-visit')]),
 entry('place-old-jialian','汕尾仔舊嘉蓮宮','與後塭仔嘉蓮宮分別位於不同聚落，輪科迎請王令過府。舊嘉蓮宮另有班頭及白鶴展翅宋江陣傳承。',[l('/?item=troupe-group-jialian-white-crane','在首頁地圖看舊嘉蓮宮'),a('guide','jialian-visit'),a('troupes','group-jialian-white-crane')]),
 entry('place-lingdi','東港代天府靈帝殿','靈帝殿班頭隸屬伍府千歲，地方傳承記下與東隆宮借班的往事。靈帝殿仍有自己的班頭隊伍，與東隆宮振武堂分開。',[l('/people/bantou.html#section-7','靈帝殿班頭與借班傳承')]),
 ...places.map(p=>entry('temple-'+p.slug,`${p.title}・${p.temple}`,`${p.title}以${p.temple}為代表廟，主祀${p.deity}。中軍到任巡境走訪七角頭，轎班再依當科神職參與迎王。`,[a('neighborhoods',p.slug),a('carriers',p.slug),l('/?item=place-'+p.slug,'在首頁地圖看宮廟')]))
];
const alreadyLocated=new Set(['group-gongshan-shijia','group-dongfu-twentyfour','group-zhenling-thirteen','group-xianlong-cranes','group-xiato-songjiang','group-jialian-white-crane']);
const troupePlaces=catalogue.filter(t=>!alreadyLocated.has(t.slug)).map(t=>entry('base-'+t.slug,t.kicker,t.lead,[a('troupes',t.slug),l('/?item=troupe-'+t.slug,'在首頁地圖看堂口')]));
export const overviewSections=[
 {id:'reading',title:'怎麼讀這個網站',paragraphs:['先從下方時間軸走完整科，再依感興趣的人、地方或科儀翻開細讀頁。'],grid:true,entries:[
  entry('read-first','第一次認識迎王','先讀這篇全覽，再回到溫王傳說、海港往事與七角頭的由來。',[l('/about.html','認識迎王'),l('/#intro','首頁迎王介紹')]),
  entry('read-days','想照時間往下讀','先讀迎王前的科儀，再從請水走到送王的八天祭典；十三程序則將一科迎王按儀式分類。',[preFestivalLink,l('/guide.html#festival-days','八天祭典'),l('/rituals.html','十三程序')]),
  entry('read-people','想知道誰在做什麼','從總理、內司、班頭、神樂團，讀到七角頭轎班的分工。',[l('/people.html','職務介紹'),l('/carriers.html','七角頭轎班')]),
  entry('read-places','想從地方走進迎王','在地圖找宮廟與聚落，再讀角頭故事和陣團傳承。',[l('/neighborhoods.html','迎王地圖'),l('/troupes.html','陣頭與藝陣')])]},
 {id:'pre-festival',title:'一、迎王前的科儀',tone:'vermilion',paragraphs:['一科迎王的準備，從上一科送王後的職務抽籤開始。中軍到任、造船、進表、代天府上樑與嘉蓮宮升帆，都在請水迎駕之前；各項科儀依廟方擇日，籌備工作也會同時進行。'],entries:preFestivalEntries},
 {id:'timeline',title:'二、八天祭典',tone:'indigo',paragraphs:['八天七夜從第 1 天請水迎王開始，到第 8 天送王收束。其間有分區遶境、王船法會、遷船與宴王，也有每日晨昏與夜間的王府工作。'],entries:festivalEntries},
 {id:'post-festival',title:'三、送王後',tone:'sky',entries:timeline.slice(-1)},
 {id:'roles',title:'四、王府內外，誰在做什麼',tone:'gold',paragraphs:['神職、主祭與執事各有分工。沿著每項職務的「主要出現在」，可以回到前面的科儀時序。'],grid:true,entries:roleEntries},
 {id:'bantou-lineages',title:'班頭的四條傳承',tone:'gold',grid:true,entries:[
  entry('bantou-donglong','東隆宮班頭（振武堂）','在東隆宮迎王中負責站班、開道、作紙、查夜與放告。中軍府安座後，班頭暫借駐於振武堂。',[a('people','bantou'),a('guide','daily-offerings')]),
  entry('bantou-lingdi','靈帝殿班頭','隸屬伍府千歲；早期借班給東隆宮，後來重新組成自己的隊伍，執行掛枷、開枷等工作。',[l('/people/bantou.html#section-7','靈帝殿的班頭傳承')]),
  entry('bantou-jialian','後塭仔嘉蓮宮班頭','配合本庄中軍府、王令與迎王程序。班頭神像隨每科中軍府到來一同開光，送王時隨王船返回天河。',[l('/people/bantou.html#section-9','嘉蓮宮班頭'),a('guide','jialian-sails')]),
  entry('bantou-old-jialian','汕尾仔舊嘉蓮宮班頭','舊嘉蓮宮有自己的班頭與廟內分工。班頭神像隨中軍府到來一同開光，送王時也上王船，與千歲爺回天河。',[l('/people/bantou.html#section-9','舊嘉蓮宮班頭'),a('guide','jialian-visit')])]},
 {id:'carriers',title:'七角頭轎班：角頭不變，神職按科輪任',tone:'gold',paragraphs:['七角頭分任大千歲、二至五千歲、中軍府及溫府千歲轎班。轎衫的顏色跟著神職走，並非角頭永遠固定的顏色。'],grid:true,entries:carrierEntries},
 {id:'places',title:'五、把科儀放回東港的地方',tone:'pine',paragraphs:['從東隆宮與鎮海海岸，走向嘉蓮聚落和七角頭廟。代天府、王船廠在文中分項說明，可接著閱讀各處的儀式與工作。'],grid:true,entries:placeEntries},
 {id:'troupes',title:'陣團堂口與地方傳承',tone:'plum',paragraphs:['七角頭裡還有下頭角的宋江陣與東港東福殿城隍廟二十四司、頂中街的共善堂什家將、埔仔角的十三太保。各司尊稱「老爺」，例如功曹司老爺、賞善司老爺。其餘堂口也各有自己的角色、步法與傳承。'],grid:true,entries:[
  entry('local-troupes','從七角頭認識陣團','宋江陣、文陣與神將有不同的隊列、參禮方式和教習傳承。',[a('troupes','group-xiato-songjiang'),a('troupes','group-dongfu-twentyfour'),a('troupes','group-gongshan-shijia'),a('troupes','group-zhenling-thirteen')]),
  ...troupePlaces,
  entry('unlocated-cranes','賢隆宮梓童尊王駕前鶴仙陣','由白鶴童子起陣，再加入持劍、葫蘆與靈芝的角色。此陣沒有固定堂口位置，可直接閱讀陣團故事。',[a('troupes','group-xianlong-cranes')],'非定點')
 ]},
 {id:'comparison',title:'六、十三程序與八天流程對照',paragraphs:['十三程序的前五項屬於迎王前，從第六項請水起進入八天祭典。祀王貫穿多日，王船法會延續至遷船前後；兩種讀法可在這裡互相對照。'],comparison:true,entries:stageFlow.map(s=>entry('compare-'+s.id,`${String(s.number).padStart(2,'0')}・${s.title}`,s.summary,[l(s.url,'閱讀這道程序'),...s.periods],s.phase==='before'?'迎王前':'八天祭典'))}
];
