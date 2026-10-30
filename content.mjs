export const days = [
  {
    "name": "請水・請王",
    "area": "鎮海海岸 → 東隆宮",
    "icon": "wave",
    "time": "首日｜依公告時辰",
    "map": "東港鎮海公園"
  },
  {
    "name": "北區遶境",
    "area": "東港北區｜依當科路線",
    "icon": "temple",
    "time": "第二日｜2024 儀程範例",
    "map": "東港東隆宮"
  },
  {
    "name": "南區遶境",
    "area": "東港南區｜依當科路線",
    "icon": "map",
    "time": "第三日｜2024 儀程範例",
    "map": "東港東隆宮"
  },
  {
    "name": "中區遶境",
    "area": "東港市街｜依當科路線",
    "icon": "temple",
    "time": "第四日｜2024 儀程範例",
    "map": "東港東隆宮"
  },
  {
    "name": "農區遶境",
    "area": "東港農區｜依當科路線",
    "icon": "leaf",
    "time": "第五日｜2024 儀程範例",
    "map": "東港東隆宮"
  },
  {
    "name": "王船法會・敬王",
    "area": "東隆宮・王船周邊",
    "icon": "boat",
    "time": "第六日｜2024 儀程範例",
    "map": "東港東隆宮"
  },
  {
    "name": "遷船遶境",
    "area": "東隆宮 → 市街",
    "icon": "boat",
    "time": "第七日｜2024 儀程範例",
    "map": "東港東隆宮"
  },
  {
    "name": "送王",
    "area": "鎮海海岸",
    "icon": "boat",
    "time": "第八日凌晨｜依當科公告",
    "map": "東港鎮海公園"
  }
];
export const neighborhoods = [
  {
    "id": "lunding",
    "name": "崙仔頂角",
    "temple": "鎮海宮",
    "deity": "蘇府七代巡",
    "tag": "靠海的信仰聚落",
    "color": "blue",
    "text": "走近鎮海宮，讀懂東港與海的關係。崙仔頂是七角頭之一，與其他角頭共同負擔迎王的轎班工作；附近鎮海海岸也是認識請王與送王的重要場景。",
    "x": 135,
    "y": 340
  },
  {
    "id": "dingzhong",
    "name": "頂中街",
    "temple": "進水宮",
    "deity": "金府千歲、邢府千歲",
    "tag": "走進老街的日常",
    "color": "coral",
    "text": "進水宮是頂中街的信仰據點，居民透過角頭組織參與迎王，準備神轎、旗幟與祭典用品。",
    "x": 340,
    "y": 155
  },
  {
    "id": "ding",
    "name": "頂頭角",
    "temple": "東隆壇",
    "deity": "江府千歲",
    "tag": "從廟埕認識角頭",
    "color": "yellow",
    "text": "頂頭角以東隆壇為信仰據點。七角頭在每一科迎王中輪任不同職務，居民的分工、準備與轎班，是祭典能走入街庄的重要力量。",
    "x": 385,
    "y": 60
  },
  {
    "id": "xiazhong",
    "name": "下中街",
    "temple": "朝隆宮",
    "deity": "天上聖母",
    "tag": "媽祖信仰與街庄記憶",
    "color": "green",
    "text": "下中街朝隆宮主祀天上聖母，為東港三大公廟之一。角頭居民依當科職務組成轎班參與迎王。",
    "x": 190,
    "y": 175
  },
  {
    "id": "anhai",
    "name": "安海街",
    "temple": "福安宮",
    "deity": "福德正神",
    "tag": "伯公守護的街庄",
    "color": "yellow",
    "text": "安海街以福安宮為角頭廟，主祀福德正神。迎王的熱鬧背後，也有居民在熟悉的廟埕相聚、準備與分工的日常。",
    "x": 345,
    "y": 265
  },
  {
    "id": "xia",
    "name": "下頭角",
    "temple": "東福殿",
    "deity": "城隍尊神",
    "tag": "城隍信仰與神將文化",
    "color": "coral",
    "text": "東福殿是下頭角的信仰據點，主祀城隍尊神。除了角頭與轎班，也可以從東福殿二十四司的角色與參禮，認識東港豐富的神將文化。",
    "x": 265,
    "y": 355
  },
  {
    "id": "pu",
    "name": "埔仔角",
    "temple": "鎮靈宮",
    "deity": "關聖帝君、李府千歲",
    "tag": "尋訪十三太保的傳承",
    "color": "green",
    "text": "埔仔角的鎮靈宮連結地方信仰與陣頭傳承。十三太保是認識這裡的線索之一；從信仰、訓練到出陣，是跨世代共同投入的文化工作。",
    "x": 490,
    "y": 170
  }
];
export const roles = [
  {
    "name": "大總理",
    "type": "祭祀人員",
    "icon": "person",
    "intro": "主持一科迎王的重要祭祀人員。",
    "detail": "由當科負責大千歲的角頭選出，與各角頭副總理共同參與祭祀。",
    "source": 3
  },
  {
    "name": "副總理",
    "type": "祭祀人員",
    "icon": "person",
    "intro": "各角頭共同承擔祭祀的代表。",
    "detail": "與大總理共同參與祭典祭祀，讓七角頭的分工與信仰連結到同一科迎王。",
    "source": 3
  },
  {
    "name": "中軍府",
    "type": "神職",
    "icon": "flag",
    "intro": "千歲爺的先鋒，先行督視準備。",
    "detail": "中軍府於迎王準備期安座，督視王船建造等工作；中軍府轎班代表色為白色。",
    "source": 1
  },
  {
    "name": "神樂團",
    "type": "禮樂與執事",
    "icon": "drum",
    "intro": "用禮樂陪伴祀典與迎王。",
    "detail": "東隆宮大漢樂團依府內儀式與遶境路吹的需要安排曲目，並透過教學傳承北管、廣東音樂與國樂。",
    "source": 8
  },
  {
    "name": "班頭",
    "type": "禮樂與執事",
    "icon": "flag",
    "intro": "振武堂執事，維持儀式與行進秩序。",
    "detail": "東港東隆宮振武堂班頭參與儀式排班、遶境、作紙、查夜與放告，並在請水法會於迎王將台前站班。",
    "source": 9
  },
  {
    "name": "內司",
    "type": "禮樂與執事",
    "icon": "book",
    "intro": "振文堂執事，處理府內禮儀及文書。",
    "detail": "準備並執行府內儀式，也處理榜文等文書。迎王的莊重，來自街上與府內許多不同工作的配合。",
    "source": 9
  },
  {
    "name": "轎班",
    "type": "禮樂與執事",
    "icon": "person",
    "intro": "七角頭一起扛起迎王的重量。",
    "detail": "轎班扛抬神轎，也分擔王船船具搬運。角頭每科抽定職務，轎班服色隨之調整。",
    "source": 1
  },
  {
    "name": "先鋒官與砲首",
    "type": "禮樂與執事",
    "icon": "flag",
    "intro": "在隊伍前方傳遞王駕行進的訊息。",
    "detail": "先鋒官負責前行通報，砲首以炮聲報信。",
    "source": 9
  }
];
export const sources = [
  [
    "東隆宮｜2024 甲辰正科官方日程",
    "https://www.66.org.tw/m1_file/detail.php?category=x&id=1&mid=2&nid=128",
    "八日儀程的歷史範例，非 2027 確定行程。"
  ],
  [
    "大鵬灣國家風景區｜迎王平安祭典",
    "https://www.dbnsa.gov.tw/zh-tw/Experience/articles?a=127",
    "祭典流程、中軍府、七角頭與職務色。"
  ],
  [
    "中央社｜丁未正科王船開光",
    "https://www.cna.com.tw/news/aloc/202607080145.aspx",
    "2026/7/8 報導，確認下一科於 2027 舉辦，未載起訖日。"
  ],
  [
    "內政部｜東港迎王平安祭典",
    "https://taiwangods.moi.gov.tw/html/Landscape/1_0011.aspx?i=90",
    "請王、遷船、送王與祭祀組織。"
  ],
  [
    "東港海事｜唐朝官 清朝禮",
    "https://www.tkms.ptc.edu.tw/ischool/wr/file/1/21252/577f9149497e197880698d75893274e7.pdf",
    "七角頭與宮廟對照，PDF 第 3 頁。"
  ],
  [
    "文化部｜共和堂欽點五毒大神",
    "https://tcmb.culture.tw/zh-tw/detail?id=20220902000002&indexCode=BOCH_CountryCulture_51",
    "在地神將陣團的傳承紀錄。"
  ],
  [
    "中央研究院｜東港鎮靈宮調查",
    "https://crgis.rchss.sinica.edu.tw/temples/PingtungCounty/dunggang/1303001-ZLG",
    "鎮靈宮信仰及十三太保陣。"
  ],
  [
    "國立臺灣圖書館｜神將團之鄉—東港",
    "https://wwwacc.ntl.edu.tw/public/Attachment/631613581087.pdf",
    "家將、二十四司、十二家司與聖將文化。"
  ],
  [
    "東隆宮｜大漢樂團",
    "https://www.66.org.tw/m2/m.php?category=x&id=1&m2id=1&mid=3",
    "傳統音樂與禮樂教育。"
  ],
  [
    "木日水巷｜迎王職務紀錄",
    "https://20091010.blogspot.com/2012/09/blog-post_7687.html",
    "地方文史參考：內司、班頭、先鋒官與砲首。"
  ],
  [
    "東港迎王─班頭｜陳啟楨",
    "http://wa-donggang.blogspot.com/2011/11/blog-post_02.html?m=1",
    "東港班頭編制、請水站班、押解順序、水牌火牌與監斬官。"
  ]
];
export const troupes = [
  {
    "name": "欽點五毒大神",
    "group": "共和堂",
    "icon": "mask",
    "color": "coral",
    "intro": "家將的角色、臉譜與陣式。",
    "text": "東港代表性的神將陣團，地方孩童參與扮將、集訓與出陣。",
    "source": 5
  },
  {
    "name": "十三太保",
    "group": "鎮靈宮",
    "icon": "person",
    "color": "blue",
    "intro": "小小身影，認真走出陣法。",
    "text": "與廣澤尊王信仰相關，由學童扮演的在地陣團。1955年組陣。",
    "source": 6
  },
  {
    "name": "什家將",
    "group": "共善堂",
    "icon": "mask",
    "color": "green",
    "intro": "一筆臉譜，一步陣式。",
    "text": "成立於 1925 年的在地家將團，是閱讀東港神將發展的入口。臉譜、服飾與步法依堂口規矩傳承。",
    "source": 7
  },
  {
    "name": "二十四司",
    "group": "東福殿",
    "icon": "book",
    "color": "yellow",
    "intro": "從文陣讀懂城隍信仰。",
    "text": "東福殿二十四司屬文陣類型。透過角色、隊列與參禮動作，可以認識城隍信仰中的不同司職。",
    "source": 7
  },
  {
    "name": "十二家司",
    "group": "聖德宮",
    "icon": "flag",
    "color": "blue",
    "intro": "陣形步法裡的地方記憶。",
    "text": "東港的排陣神將團。",
    "source": 7
  },
  {
    "name": "聖將",
    "group": "朝隆聖堂",
    "icon": "flag",
    "color": "coral",
    "intro": "從兵器與隊形認識武術神將。",
    "text": "結合兵器操演與隊形的武術神將傳統。",
    "source": 7
  }
];

