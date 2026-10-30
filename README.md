# 東港迎王小旅行

以 E大網站開發技能包建立的繁體中文、手機優先文化導覽網站。純靜態 HTML/CSS/JavaScript，無框架、無資料庫、無第三方追蹤。

## 啟動與編輯

需要 Node.js 18 以上、Python 3.10 以上及 requirements-build.txt 的字型建置套件。先使用 uv pip install -r requirements-build.txt 安裝。既有 dist 可直接啟動，不需字型工具。

```sh
node build.mjs
node server.mjs
```

開啟 http://127.0.0.1:4173 。部署目錄為 `dist/`。

- `content.mjs`：原有中繼資料；`stories.mjs`：深化文章；`articles.mjs`：分類與路由。
- `overview.mjs`：迎王全覽與 `/guide/pre-festival.html` 共用迎王前內容，分為迎王前、八天祭典與送王後；`flow.mjs`：十三程序對照、職務時序與相關閱讀，共用於全覽及各細讀頁。
- `troupe-catalog.mjs`：20筆陣團名錄；`carrier-history.mjs`：1952–2027歷科職務；`assignments.mjs`：2027職務表；`carriers.mjs`：7班轎班與2009職務表；`ritual-details.mjs`：4篇科儀細讀。
- `art.mjs`：自繪 SVG 圖示及相對位置示意圖。
- `build.mjs` / `render.mjs`：產生 86 個獨立 HTML 頁面，其中 72 篇專文。
- `site.css`（建置複製到 dist）：配色、字型、版面及手機樣式。
- `site.js`：選單、搜尋與倒數，建置後使用內容雜湊檔名。
- `dist/config.js`：下一科日期與廣告預留設定。

## 日期與內容

2027 丁未正科已核實，精確起訖日期尚未取得官方公告。`confirmedStart` 保持 `null`，畫面顯示待公告。官方日期發布後，設定含時區的 ISO 日期，例如 `YYYY-MM-DDTHH:mm:ss+08:00`，並更新首頁公告文案、核對日期及八日內容。不要把 2024 歷史日程當成 2027 確定路線。

## 廣告

各內容頁已預留有固定最小高度的廣告區，尚未載入 AdSense。`ads.enabled` 是預留設定，切換它不會自動投放。取得通過審核的 publisher ID 與廣告單元 ID 後，才加入 Google 官方程式碼，補足隱私/同意機制並測試版面偏移。目前版位不追蹤訪客。

## 網址與狀態

各科儀保留原獨立網址；職務、陣團搜尋與分類保留在 URL，支援重整與上一頁。筆記及收藏介面已移除；程式不再讀写收藏資料。

## 字型與圖片

Huninn 依 SIL OFL 自託管。`optimize-assets.py` 依建置後各頁文字產生共用字型與該頁專用 WOFF2；每頁載入兩檔。原始字型保存在 `font-source`，來源與插畫說明見 `ASSETS.md`。字型、CSS、JavaScript 使用內容雜湊檔名；更新文字後執行建置會自動更新。`font-manifest.json` 記錄每頁字型大小。前台不顯示引用清單，不公開使用者原始論文或照片。

## 驗證

手機地圖優先版本：`node tools/home-map-mobile-check.mjs` 驗證320/390/768/1440、搜尋浮層、地標卡三段、2D/3D、觸控、鍵盤與WebKit，截圖及JSON位於 `../homepage-fix2/after/`。沿用 `node tools/home-map-check.mjs 1` 跑83路由與原地標卡回歸；舊Phase 2/3的「時序開抽屜／首次自動導覽」已被新規格取代，其新行為由mobile-check驗證。

`home-models.mjs` 對應地點類型到自託管示意模型；`tools/build-home-models.mjs` 在每次建置產生SVG與WebP。3D使用CSS perspective與相同的數學投影／反投影；地理資料與座標不變，2D切換不需其他套件。

平面地圖 `/map.html`：`home-map.mjs` 建置地點卡與非定點清單，`home-places.mjs` 記錄已查證座標，`home-map.js` 只於平面地圖頁載入；`basemap.mjs` 從本機 OSM 裁切資料產生 SVG。`day-links.mjs` 統一八日文章延伸連結。首頁保留共用清單樣式。

OSM 重新取得：手動執行 `node tools/fetch-osm.mjs`，以既有 raw cache 續傳；要更新資料，先另存原 `work/osm/` 再執行。工具使用東港鎮 OSM 行政界外擴1公里，分區下載後自動裁切；版本與授權見 `data/README.md`。平常 `npm run build` 不連網。

首頁專項：`node tools/home-map-check.mjs 1`（後續階段改為2或3）。需本機 4173 預覽服務與 Playwright／axe。可用 `PLAYWRIGHT_PATH` 指定既有工具相依位置；不部署測試工具。

見 `QA.md`。本網站透過 Sites 公開發布；全頁保留 noindex，robots.txt 維持 Disallow: /。原始碼與可部署靜態檔均保留於此資料夾。

全站流程驗收：啟動本機預覽後執行 `node tools/flow-check.mjs`。驗收紀錄及部署報告位於 `work/flow-review/3d/`，包含迎王前分組、流程選單鍵盤操作、卡片文字對比與 3D 場景。Chrome 使用 SwiftShader 驗證 WebGL；`tools/home3d-check.mjs` 另測熱點、相機、清單、首次導覽、手機操作、背景暫停與三種靜態 fallback。

## 立體繪本首頁

`home3d/scene.js`、`terrain.js`、`landmarks.js` 分別負責相機與標籤、地形、共用宮廟與王船模型；`ui.js` 負責面板與導覽。`build.mjs` 以 esbuild 將 npm 安裝的 three.js 打包成自託管模組，整組 JavaScript gzip 超過 300 KB 時建置失敗。先載入 `poster.webp` 靜態場景，WebGL 就緒再淡入；減少動態、節省流量或無 WebGL 使用靜態圖與清單。

25 處座標沿用既有地圖，另以東隆宮同一地點提供王船與代天府兩項故事，共 27 個熱點。兩者在模型中分開擺放以利點選，並非新增地理座標。賢隆宮梓童尊王駕前鶴仙陣只在非定點清單。手機先按操作按鈕才接管手勢；原首頁 `?item=` 與 `#home-map`、`#intro` 入口保持可用。所有舊頁保留。

兩篇大轎故事在 `carriers.mjs`，頂中街 10 節、頂頭角 12 節；角頭頁在 `stories.mjs` 加入互連，歷科職務表沿用共用模板。


king-history.mjs：歷科大千歲尊姓，kings.html為獨立查閱頁。

## 文案語氣

直接介紹人物、角色、服飾、步法、儀式與歷史事件。刪除「不能因為……」「不應把……」「才不會誤認……」「應保留的差別」等告誡讀者如何理解的評論，以及空泛的閱讀指導。團體有差異時，各自列出具體特徵。保留年代、口述歸因、待確認事項與觀禮安全指示，避免以修辭改動史實。
