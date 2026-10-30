# 東港鎮 OSM 裁切資料

來源：© OpenStreetMap contributors，ODbL 1.0。
版權與授權：https://www.openstreetmap.org/copyright
行政界：https://www.openstreetmap.org/relation/2766783
下載：2026-10-25（OSM 回應的資料時間戳保留在 work/osm 原始檔）。

初始 Overpass 查詢：`[out:json][timeout:25];rel["boundary"="administrative"]["name"="東港鎮"];out bb;`。
Overpass 回傳空資料或 HTTP 502；改用 OSM 官方主 API，並以 Nominatim 搜尋 Donggang, Pingtung, Taiwan 確認 relation 2766783。
主 API：`https://api.openstreetmap.org/api/0.6/relation/2766783/full.json`。
依行政界節點實際範圍外擴 1 公里，分 3×3 區塊循序下載 `https://api.openstreetmap.org/api/0.6/map.json?bbox=...`，避開單次 50,000 節點上限。

`node tools/fetch-osm.mjs` 下載（已有原始檔時復用），`node tools/prepare-osm.mjs` 裁切。
一般 `npm run build` 只讀已提交的 JSON，不連線。
原始檔留在被忽略的 work/osm，不部署；裁切資料 donggang-basemap.json 依 ODbL 提供。
裁切以線段矩形裁切與多邊形裁切完成；Douglas–Peucker 容差 0.000006 度，座標保留小數六位。保留可追溯 OSM ref，去除建築及不需要的 POI。
海面依 OSM 海岸線方向（陸地在左、海在右）拼接，再沿外接裁切框閉合；框邊不是宣稱存在的新海岸。
水域 relation 先依 outer/inner 拼接閉合環，未完整時直接失敗；不猜測缺漏幾何。
投影為 Web Mercator。底圖與巷道分為兩個雜湊 SVG，巷道只於高縮放顯示；比每個道路建立 DOM 節點更節省元素。
