from pathlib import Path
import io,json,re,collections,sys,subprocess
from PIL import Image,ImageDraw
import vtracer

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Image.open(ROOT/'art-source/donggang-original-map.jpg').convert('RGBA')
OUT=ROOT/'art-source/vectors'; OUT.mkdir(exist_ok=True)
BOXES={
 'temple-lunding':[689,1312,165,166],'temple-xia':[465,28,170,167],
 'temple-anhai':[1502,1095,174,174],'temple-xiazhong':[1504,478,174,173],
 'temple-dingzhong':[17,1311,167,173],'temple-ding':[20,209,171,173],
 'temple-pu':[18,768,172,174],'temple-donglong':[1298,21,175,172],
 'carrier-yellow':[39,1135,143,159],'carrier-pink':[688,32,141,161],
 'carrier-black':[38,33,149,161],'carrier-green':[23,592,157,161],
 'carrier-purple':[477,1312,146,163],'carrier-white':[1316,1311,143,173],
 'carrier-blue':[1513,691,150,166],
 'wudu':[872,22,151,176],'eighth':[1512,247,158,181],
 'seventh':[910,1320,153,157],'lantern':[1072,36,181,123],
 'arch':[21,402,169,137],'night':[229,39,185,113],
 'horse':[1097,1314,168,140],'offerings':[1506,897,169,158],
 'boat':[243,1318,195,122],'blessing':[27,966,156,159],
 'boat-vessel':[243,1318,195,122],
 'flag':[1570,17,99,192],'palace':[1507,1310,165,138],
 'arrow':[846,586,27,29],
}

def source_crop(box):
 x,y,w,h=box;sx=SOURCE.width/1694;sy=SOURCE.height/1504
 img=SOURCE.crop((round(x*sx),round(y*sy),round((x+w)*sx),round((y+h)*sy)))
 px=img.load()
 edge=[(x,y) for x in range(img.width) for y in [0,img.height-1]]+[(x,y) for x in [0,img.width-1] for y in range(img.height)]
 queue=collections.deque(edge);removed=set()
 while queue:
  xx,yy=queue.popleft()
  if (xx,yy) in removed or not(0<=xx<img.width and 0<=yy<img.height):continue
  removed.add((xx,yy));r,g,b,a=px[xx,yy]
  if abs(r-167)+abs(g-128)+abs(b-118)>=65:continue
  px[xx,yy]=(0,0,0,0);queue.extend([(xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)])
 seen=set();components=[]
 for yy in range(img.height):
  for xx in range(img.width):
   if (xx,yy) in seen or px[xx,yy][3]==0:continue
   queue=collections.deque([(xx,yy)]);seen.add((xx,yy));part=[]
   while queue:
    cx,cy=queue.popleft();part.append((cx,cy))
    for nx,ny in [(cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1)]:
     if 0<=nx<img.width and 0<=ny<img.height and (nx,ny) not in seen and px[nx,ny][3]:seen.add((nx,ny));queue.append((nx,ny))
   components.append(part)
 if components:
  largest=max(map(len,components))
  for component in components:
   if len(component)<largest*.035:
    for pos in component:px[pos]=(0,0,0,0)
 scale=min(180/img.width,180/img.height)
 resized=img.resize((round(img.width*scale),round(img.height*scale)),Image.Resampling.LANCZOS)
 canvas=Image.new('RGBA',(180,180));canvas.alpha_composite(resized,((180-resized.width)//2,(180-resized.height)//2))
 return canvas

def vessel_only(img):
 mask=Image.new('L',img.size)
 ImageDraw.Draw(mask).polygon([(50,71),(55,60),(63,59),(69,64),(74,60),(75,51),(87,51),(92,59),(101,58),(105,53),(115,60),(115,72),(108,82),(112,87),(120,82),(127,89),(139,91),(143,99),(159,105),(148,126),(137,136),(112,140),(88,137),(79,126),(76,109),(67,98),(65,89),(60,78),(53,81)],fill=255)
 px=img.load()
 for y in range(180):
  for x in range(180):
   r,g,b,a=px[x,y]
   if not mask.getpixel((x,y)) or (90<r<225 and g>r*.94 and b<150 and g>b*1.3):px[x,y]=(0,0,0,0)
 return img

def trace(img):
 alpha=img.getchannel('A').point(lambda p:255 if p>100 else 0)
 img=img.convert('RGBA');img.putalpha(alpha)
 bbox=alpha.getbbox()
 if not bbox:return ''
 img=img.crop(bbox)
 buf=io.BytesIO();img.save(buf,format='PNG')
 svg=vtracer.convert_raw_image_to_svg(buf.getvalue(),img_format='png',colormode='color',hierarchical='stacked',mode='spline',filter_speckle=0,color_precision=8,layer_difference=1,corner_threshold=60,length_threshold=1,max_iterations=10,splice_threshold=45,path_precision=2)
 inner=re.search(r'<svg[^>]*>(.*)</svg>',svg,re.S).group(1).strip()
 return f'<g transform="translate({bbox[0]} {bbox[1]})">{inner}</g>'

PARTS={
 'yellow':{'arm-left':[(70,62),(65,82),(53,101),(44,109),(38,103),(43,91),(56,75)],'arm-right':[(123,78),(135,86),(154,105),(151,114),(142,110),(126,98)],'leg-left':[(66,121),(83,124),(91,134),(81,137),(79,151),(60,155),(58,147),(68,145)],'leg-right':[(104,124),(121,125),(117,141),(126,152),(126,158),(112,155),(108,143)]},
 'pink':{'arm-left':[(62,91),(74,100),(92,106),(109,108),(109,115),(95,118),(75,112),(62,105)],'arm-right':[(122,80),(137,87),(135,107),(126,117),(124,104),(129,96)],'leg-left':[(62,122),(87,127),(82,144),(76,161),(62,163),(59,158),(66,154)],'leg-right':[(103,128),(122,129),(119,148),(133,156),(134,164),(114,165),(110,152)]},
 'black':{'arm-left':[(71,75),(63,84),(51,61),(48,47),(54,40),(61,45),(61,57)],'arm-right':[(120,80),(132,84),(143,104),(146,116),(133,120),(130,114),(131,107),(122,97)],'leg-left':[(72,122),(89,126),(90,139),(80,146),(69,151),(62,151),(66,140)],'leg-right':[(103,127),(120,127),(119,142),(125,156),(116,160),(107,153),(107,141)]},
 'green':{'arm-left':[(63,82),(59,99),(47,100),(29,90),(28,83),(35,79),(40,87),(50,91)],'arm-right':[(120,91),(129,95),(130,119),(127,143),(137,151),(137,158),(123,158),(120,142)],'leg-left':[(64,124),(82,127),(80,143),(70,149),(62,147),(64,140)],'leg-right':[(91,129),(107,128),(111,139),(112,153),(105,159),(99,151),(99,141)]},
 'purple':{'arm-left':[(61,82),(67,96),(58,108),(41,124),(33,123),(34,115),(49,99)],'arm-right':[(120,86),(132,93),(141,111),(143,124),(135,129),(129,120),(122,111)],'leg-left':[(66,128),(84,128),(82,145),(76,159),(64,161),(59,156),(69,151)],'leg-right':[(100,129),(117,130),(117,148),(122,158),(117,165),(106,160),(104,147)]},
 'white':{'arm-right':[(121,82),(127,86),(137,81),(145,75),(150,77),(149,83),(137,92),(124,97)],'leg-left':[(69,119),(85,123),(82,138),(77,148),(68,149),(65,144),(71,139)],'leg-right':[(105,124),(121,124),(118,140),(125,147),(123,153),(112,151),(111,139)]},
 'blue':{'arm-left':[(40,94),(50,101),(63,105),(74,107),(75,113),(64,116),(49,111),(40,106)],'arm-right':[(95,80),(104,88),(113,84),(119,76),(124,78),(123,86),(111,96),(101,98)],'leg-left':[(45,123),(61,129),(61,137),(57,149),(46,150),(41,146),(45,137)],'leg-right':[(79,128),(93,129),(91,139),(100,146),(96,153),(85,148),(84,137)]},
}

DETAILS={
 'temple-ding':('temple-bell',[(51,70),(58,70),(59,89),(51,89)]),
 'temple-dingzhong':('temple-bell',[(67,78),(73,78),(74,96),(66,96)]),
 'temple-pu':('temple-bell',[(48,69),(55,70),(55,91),(48,91)]),
 'temple-xiazhong':('temple-bell',[(51,80),(57,80),(59,94),(51,95)]),
 'temple-anhai':('temple-bell',[(66,80),(72,80),(72,101),(65,101)]),
 'temple-xia':('temple-flag',[(97,12),(105,16),(105,36),(97,29)]),
 'temple-lunding':('temple-bell',[(68,71),(75,71),(75,94),(68,94)]),
 'temple-donglong':('temple-bell',[(69,65),(76,65),(76,84),(69,84)]),
 'boat':('boat-flag',[(67,59),(73,52),(83,53),(87,59),(83,66),(72,66)]),
 'boat-vessel':('boat-flag',[(67,59),(73,52),(83,53),(87,59),(83,66),(72,66)]),
 'horse':('horse-tail',[(43,99),(28,87),(29,70),(36,74),(35,85),(48,91)]),
 'wudu':('crown',[(81,9),(94,8),(98,21),(89,31),(81,20)]),
 'seventh':('crown',[(75,24),(89,15),(104,26),(104,43),(73,45)]),
 'eighth':('crown',[(127,15),(138,20),(134,35),(125,37)]),
 'offerings':('offering-ribbon',[(96,97),(105,100),(116,126),(108,131),(103,113),(94,106)]),
 'lantern':('lantern',[(91,48),(97,46),(100,78),(109,88),(108,115),(101,119),(93,110),(90,85)]),
 'flag':('banner',[(71,22),(117,20),(132,66),(111,75),(95,80),(75,58)]),
}

def trace_part(img,polygon,remove_halo=True,white_uniform=False):
 mask=Image.new('L',img.size);ImageDraw.Draw(mask).polygon(polygon,fill=255)
 part=img.copy();px=part.load()
 for y in range(180):
  for x in range(180):
   r,g,b,a=px[x,y]
   halo=95<r<195 and 110<g<205 and 25<b<115 and g>r*.95 and g>b*1.4
   cream=r>232 and g>216 and b>170 and not white_uniform
   water=r<160 and g>130 and b>130 and abs(g-b)<55
   if not mask.getpixel((x,y)) or (remove_halo and (halo or cream or water)):px[x,y]=(0,0,0,0)
 return trace(part)

parts_only='--parts-only' in sys.argv
only=sys.argv[sys.argv.index('--only')+1] if '--only' in sys.argv else None
if not only:
 for asset_name in BOXES:
  args=[sys.executable,__file__,'--only',asset_name]
  if parts_only:args.append('--parts-only')
  subprocess.run(args,check=True)
 sys.exit(0)
data_path=ROOT/'vector-art-data.mjs'
assets=json.loads(data_path.read_text(encoding='utf-8').split(' = ',1)[1].rstrip(';\n')) if data_path.exists() and (parts_only or only) else {}
for name,box in BOXES.items():
 if only and name!=only:continue
 if parts_only and not(name.startswith('carrier-') or name in DETAILS):continue
 img=source_crop(box)
 if name=='boat-vessel':img=vessel_only(img)
 inner=assets[name]['body'] if parts_only else ('<path d="M90 12C132 11 163 48 164 90C166 132 134 168 91 169C48 170 17 132 16 91C15 49 49 13 90 12Z" fill="#B32F3C"/><path d="M42 83H111L96 70L104 61L139 90L104 120L97 111L111 98H42Z" fill="#FFFCF6"/>' if name=='arrow' else trace(img))
 assets[name]={'body':inner,'parts':[]}
 if name.startswith('carrier-'):
  for part,polygon in PARTS[name[8:]].items():
   body=trace_part(img,polygon,white_uniform=name=='carrier-white')
   assets[name]['parts'].append({'name':part,'body':body,'pivot':polygon[0]})
 elif name in DETAILS:
  part,polygon=DETAILS[name];body=trace_part(img,polygon,False)
  assets[name]['parts'].append({'name':part,'body':body,'pivot':polygon[0]})
 (OUT/(name+'.svg')).write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">'+inner+'</svg>',encoding='utf-8')
 img.save(OUT/(name+'-reference.png'))
 print(name,len(inner),flush=True)
(ROOT/'vector-art-data.mjs').write_text('export const vectorArt = '+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('TOTAL',sum(len(v['body']) for v in assets.values()))
