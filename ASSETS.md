# 圖像與字型來源

## 十三金甲戰帥全身插畫

2026-10-29 依使用者提供的臉譜與全身照片（攝影：攝影廟會心情，僅作私下參考、未收錄原照）以 Codex 內建 imagegen 重繪 13 張全身插畫。臉部為通用繪本臉，只參照臉譜彩繪與服裝。13 位皆有臉譜特寫，並以特寫為準；吳、沈、趙也已依使用者補充的 face13-wu、face11-shen、face12-zhao 臉譜特寫重畫。對照來源與 MAPPING.md 摘要見 `art-source/jinjia/PROMPTS.md`。

13 張 1024×1536 PNG 原圖保存於 `art-source/jinjia/`，舊版 JPG 插畫封存於 `_old/`。`npm run build` 使用 sharp 轉成 480×720 WebP（quality 84），自託管於 `dist/assets/jinjia/`；全身圖卡沿用二十四司樣式，不裁切頭冠或鞋子。圖卡順序為林、吳、朱、沈、茅、趙、李、張、池、溫、盧、許、黃；李對應 `jinjia-08-li`，張對應 `jinjia-07-zhang`。參考照片、攝影者與來源紀錄不輸出至公開頁面。

2026-10-29 林大元帥兵器修正：以現有 `art-source/jinjia/jinjia-01-lin.png` 為底，透過 Codex 內建 imagegen edit，依 `lin_hands_zoom.jpg` 與 `body16-group3.jpg` 中間人物改為雙手各持一把短柄單刃手斧（金屬斧刃、木柄，交接處綁紅白花飾），移除長桿大斧與木令牌，其餘造型保持一致。舊 PNG 保存於 `art-source/jinjia/_old/jinjia-01-lin-2026-10-29-before-hand-axes.png`；新 PNG 與輸出 WebP 沿用原路徑及尺寸。其餘十二張插畫未變更。

2026-10-29 吳、茅大元帥兵器修正：依使用者權威更正，以各自現有 PNG 經 Codex 內建 imagegen edit。吳改為單面月牙刃方天畫戟，保留直槍尖與刃下紅色長穗；茅改為九節金屬短棍以圓環串連的九節鞭，帶握柄及尖錐鏢頭，另一手令牌保留。臉譜、服裝、綬帶文字及背景保持原造型，其餘 11 張插畫未變更。舊圖封存於 `art-source/jinjia/_old/jinjia-02-wu-2026-10-29-before-weapon-fix.png`、`art-source/jinjia/_old/jinjia-05-mao-2026-10-29-before-weapon-fix.png`；新 PNG 與 WebP 沿用原路徑及尺寸。提示與重畫紀錄見 `art-source/jinjia/PROMPTS.md`。

2026-10-30 令牌與兵器修正：以現有 PNG 經 Codex 內建 imagegen edit，修改朱、沈、茅、趙、張、李、溫、許、黃九張。朱、沈令牌改綠色；茅、溫改黑底金色細紋；趙改白色；張、黃改紫色；李改寶藍色，皆依各尊袍服主色，不計黃色披肩、前擺與虎紋。許保留原有藍令牌。張的刀戟改為頂端槍尖、左右分別為寬刀刃與月牙戟刃；許的彎刀改為頂端槍尖、左右分別為彎曲刀刃與月牙戟刃，兩者均保留刃下紅穗。令牌形狀、大小、握姿及雕花感維持原造型；茅的九節鞭保留。林、吳、池、盧四張原檔未變更。九張舊檔移至 `art-source/jinjia/_old/`，檔名加 `-2026-10-30-before-token-fix`；輸出仍為 1024×1536 PNG 與 480×720 WebP。詳細提示及配色表見 `art-source/jinjia/PROMPTS.md`。

2026-10-30 張大元帥刀身照片校準（v88）：以現有 `jinjia-07-zhang.png` 經 Codex 內建 imagegen edit，依使用者提供的 `zhang-weapon-ref.jpg`，將刀面改為沿桿向上的細長單刃、微彎刀尖與向後上方翹起的背刺。刀面泛紫，白色符紙上只畫不可辨讀的紅黑筆畫；另一側月牙戟刃保留，吞口下繫紅色長穗與小鈴。此版取代前次張的寬刀刃與獨立槍尖設定。人物紫袍、紫令牌、臉譜、頭盔、綬帶、姿勢、畫風與背景維持原造型。舊檔封存於 `art-source/jinjia/_old/jinjia-07-zhang-2026-10-30-before-zhang-blade.png`，輸出仍為 1024×1536 PNG 與 480×720 WebP；其餘十二張插畫不變。提示見 `art-source/jinjia/PROMPTS.md`，照片與審核圖只留於本機。

## 二十四司全身插畫

插畫由 Codex 使用 GPT 影像生成繪製，參考使用者提供的東港城隍廟官方 Instagram 影片（https://www.instagram.com/reel/DAxIo7WMtYv/）中各司與謝范將軍的裝扮；功過司依使用者提供的照片繪製；其餘人物臉部為通用繪本臉，不描繪真人樣貌；來源不在頁面上顯示。

26 張 1024×1536 PNG 原圖保存在 `art-source/24si/`。沿用 sharp 建置為 480×720 WebP（quality 84），完整保留 2:3 比例，不裁切頭冠或鞋子。網頁使用繁中 alt、明確尺寸及原生 lazy loading。

見錄司、保健司依使用者提供的照片重繪，臉部為通用繪本臉、不描繪真人樣貌。見錄司斜捧「善惡分明」繡匾；保健司右手持頂端紅綵球、筆尖朝下的大毛筆，左手持攤開小簿子。

2026-10-25 修正：謝將軍、陰陽司、庫官司依使用者提供的照片重繪；註福司、記功司、感應司、監獄司依影片修正手持物。謝將軍持孔雀羽扇與橘色火簽；陰陽司、庫官司、註福司、記功司持插著毛筆的簿子；監獄司、感應司雙手空，感應司胸前為白鶴刺繡。臉部為通用繪本臉、不描繪真人樣貌；來源不在頁面上顯示。

- `24si-01-gongcao.png`：功曹司
- `24si-02-gongguo.png`：功過司
- `24si-03-xingfa.png`：刑法司
- `24si-04-shangfa.png`：賞法司
- `24si-05-jingbao.png`：警報司
- `24si-06-xuncha.png`：巡察司
- `24si-07-shangshan.png`：賞善司
- `24si-08-fae.png`：罰惡司
- `24si-09-jianyu.png`：監獄司
- `24si-10-gongkao.png`：功考司
- `24si-11-yinyang.png`：陰陽司
- `24si-12-subao.png`：速報司
- `24si-13-kuguan.png`：庫官司
- `24si-14-ganying.png`：感應司
- `24si-15-zhufu.png`：註福司
- `24si-16-jigong.png`：記功司
- `24si-17-jianlu.png`：見錄司
- `24si-18-lailu.png`：來錄司
- `24si-19-gaiyuan.png`：改原司
- `24si-20-wenyi.png`：瘟疫司
- `24si-21-shidao.png`：事到司
- `24si-22-chaguo.png`：察過司
- `24si-23-renting.png`：人丁司
- `24si-24-baojian.png`：保健司
- `24si-xie.png`：謝將軍（七爺）
- `24si-fan.png`：范將軍（八爺）

## 首頁真實地理底圖（2026-10-25）
© OpenStreetMap contributors，ODbL 1.0。一次性下載與裁切資料見 `data/README.md`、`data/donggang-basemap.json`；建置以 `basemap.mjs` 輸出自託管雜湊 SVG。沒有執行期圖磚、外部字型、地圖 API 或 CDN。地點座標查證在 `home-places.mjs`，來源連結僅作內部核對；前台僅提供 Google 地圖一般連結及 OSM 版權頁。

## 首頁王船場景

- 本站使用 `dist/assets/wangchuan.webp`，1536 × 1024；從 AI 生成原圖轉 WebP，非照片。
- 題材參考：大鵬灣國家風景區管理處 [東港迎王](https://www.dbnsa.gov.tw/attraction/AttractionPage?a=181) 頁面的王船與東隆宮牌樓場景。
- 參考照片 URL：https://www.dbnsa.gov.tw/UserFiles/experience/tradition/trad_banner_01.jpg
- 風格參考：使用者提供的「東港迎王七角頭地圖」，僅作一般插畫語言參照，不作底圖或網站截圖。
- 使用 imagegen 重新繪製：淺和紙白、平塗粉彩、墨灰輪廓、圓潤人物；保留東港王船上翹船首與船眼、東隆宮黃金牌樓題材；不將細節作紀實或儀式服制依據。
- 生成日期：2026-10-10。最終採用第二張王船照片重繪；第一張風格草稿未使用。

## SVG

`art.mjs` 為本站自繪 SVG symbols：王船、宮廟、斗笠人物、鼓、面具、地圖、日曆、書、小旗、波浪、葉子、箭頭。七角頭地圖為相對位置示意，不按比例；使用實際宮廟地圖外連導航。通用面具不冒充各陣團精確臉譜。

## 字型

- Google Fonts Huninn Regular：[官方來源](https://github.com/google/fonts/tree/main/ofl/huninn)。
- 原始字型 `font-source/Huninn-Regular.ttf` 來自 Google Fonts 官方倉庫 `ofl/huninn/Huninn-Regular.ttf`，建置時用 fontTools 裁成共用與逐頁 WOFF2，自託管避免第三方字型請求。
- 原授權：`dist/assets/Huninn-OFL.txt`。

## 使用者原創地圖
`art-source/donggang-original-map.jpg`：使用者2026-10-11明確表示為本人創作，要求網站美術與原畫一致。自指定 G 槽檔案原樣複製；發佈為 `dist/assets/donggang-original-map.jpg`。SVG clipping / viewBox 僅控制瀏覽器顯示區域，不改寫影像內容。原畫只取用一個快取資源，43個可操作區域共用。
# 首頁立體示意地標（2026-10-25）

17 款原創 SVG 模型由 `tools/build-home-models.mjs` 產生，主檔保留於 `art-source/home-models/`，透明無損 WebP 自託管於 `dist/assets/home-models/`。每款192×176；合計141,998 bytes，最大12,586 bytes，全部小於25KB。25個地點目前使用15款，另有王船與小建築共用型。圖片原生lazy載入，無新增執行期套件、CDN或圖磚請求。

模型採本站繪本色票，燕尾屋簷、分層牆面、底座與淡墨落地陰影皆為示意，非實際建築重建；七角頭屋頂與匾額配色只供介面辨識，不代表廟宇實際色彩或神職。原繪本與原稿素材不變。更多製作規格見 `art-source/home-models/README.md`。

2026-10-25 手持物補正：謝將軍火簽依使用者提供的火簽照片修正，為黑字直書「火簽」的原木色長木牌，頂端為紅漆葫蘆，與孔雀羽扇同持；人丁司手持物改為金色如意繫紅色繡球與橘色流蘇。

2026-10-25 帳簿樣式修正：陰陽司、庫官司、註福司、記功司、保健司的帳簿樣式依使用者提供的帳簿照片統一修正為直立展開的雙摺帳簿；帳簿上插毛筆，保健司保留右手持頂端紅綵球的大毛筆。庫官司持簿手依使用者照片改為左手，右手空。

2026-10-26 謝將軍持物修正：依使用者照片，右手持孔雀羽扇，左手握火簽上端朝下拿，紅漆葫蘆端在下。

2026-10-26 謝將軍採用使用者選定的定稿：右手持孔雀羽扇，左手持正立火簽（葫蘆端在上），原圖不作修改。
