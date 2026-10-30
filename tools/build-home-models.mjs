import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const C = { paper: '#FFFCF6', ink: '#3E3A39', coral: '#F2A497', yellow: '#F6D27A', blue: '#A8D3E6', green: '#B9DAA5', pale: '#F5F0E7', white: '#FFFFFF' };
const pathElement = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = d => pathElement(d, 'none', 'stroke-width="1.5"');
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
function plinth(fill = C.pale) {
  return `${ellipse(99,153,67,13,C.ink,'opacity=".07" stroke="none"')}${ellipse(99,151,57,9,C.ink,'opacity=".08" stroke="none"')}
  ${pathElement('M26 130 Q22 125 30 121 L87 102 Q95 99 104 102 L166 121 Q172 124 167 132 L111 153 Q104 156 95 153 L32 139 Q26 137 26 130Z',fill)}
  ${pathElement('M26 129 Q26 133 34 135 L98 149 Q104 151 112 148 L168 128 L167 134 L111 154 Q104 156 95 153 L31 139 Q26 137 26 129Z',C.ink,'opacity=".1" stroke="none"')}
  ${line('M30 125 L97 140 Q104 142 112 139 L165 122')}`;
}
function roof(y, colour, ornate = false) {
  return `<g transform="translate(0 ${y})">
  ${pathElement('M29 61 Q43 67 53 64 L104 40 Q117 42 140 51 Q151 53 161 44 Q161 55 151 65 L109 88 Q98 94 85 90 L39 76 Q31 72 29 61Z',colour)}
  ${pathElement('M53 64 L104 40 Q119 43 140 51 Q149 53 161 44 Q155 57 142 60 L98 80Z',C.white,'opacity=".32" stroke="none"')}
  ${pathElement('M29 61 Q36 73 52 75 L92 85 Q100 88 109 83 L150 62 Q156 56 161 44 L158 59 Q155 65 150 68 L111 91 Q101 97 90 93 L40 79 Q31 75 29 61Z',C.ink,'opacity=".12" stroke="none"')}
  ${line('M42 69 Q48 72 55 72 L96 83 M58 63 L102 77 M69 58 L113 71 M81 52 L126 65 M92 47 L138 59')}
  ${pathElement('M49 57 Q56 63 66 57 L103 39 Q110 35 118 40 L141 47 Q147 49 155 39 Q153 51 146 52 L117 45 Q110 41 104 44 L67 63 Q58 68 49 57Z',ornate?C.yellow:colour)}
  ${ornate?`${pathElement('M94 38 Q99 34 99 26 Q104 30 107 36 Q111 29 116 27 Q114 34 117 40',C.yellow)}${ellipse(107,38,3,4,C.coral)}`:''}
  </g>`;
}
function temple(roofColour, plaque, ornate = false) {
  return `${plinth()}
  ${pathElement('M42 91 L112 109 L151 87 L151 120 L110 144 L42 126Z',C.paper)}
  ${pathElement('M112 109 L151 87 L151 120 L110 144Z',C.pale)}
  ${pathElement('M42 91 L112 109 L112 118 L42 101Z',plaque)}
  ${pathElement('M112 109 L151 87 L151 97 L112 119Z',roofColour)}
  ${pathElement('M65 107 L91 114 L91 135 L65 129Z',C.ink)}
  ${pathElement('M69 111 L77 113 L77 129 L69 127Z',C.coral)}
  ${pathElement('M80 114 L87 116 L87 131 L80 130Z',C.coral)}
  ${ellipse(76,121,1,1.6,C.yellow,'stroke="none"')}${ellipse(82,123,1,1.6,C.yellow,'stroke="none"')}
  ${pathElement('M47 104 L52 105 L52 129 L47 128Z',plaque)}
  ${pathElement('M101 117 L106 118 L106 142 L101 140Z',plaque)}
  ${pathElement('M121 113 L128 109 L128 124 L121 128Z',C.blue)}
  ${pathElement('M136 105 L143 101 L143 116 L136 120Z',C.blue)}
  ${line('M124 112 L124 125 M139 104 L139 117 M121 119 L128 115 M136 111 L143 107')}
  ${pathElement('M62 129 L94 137 L101 134 L101 140 L92 146 L58 137 L58 133Z',C.pale)}
  ${line('M59 133 L92 142 L100 137')}
  ${roof(12,roofColour,ornate)}
  ${pathElement('M65 97 L94 105 L94 113 L65 105Z',plaque)}
  ${line('M71 101 L87 105 M74 104 L84 107')}
  ${ornate?`<g transform="translate(27 0) scale(.7)">${pathElement('M46 93 L108 109 L148 86 L148 105 L108 127 L46 111Z',C.paper)}${roof(0,C.yellow,true)}</g>${ellipse(53,115,5,7,C.coral)}${ellipse(99,128,5,7,C.coral)}${line('M53 122 L53 126 M99 135 L99 139')}`:''}`;
}
function boatBody() {
  return `${pathElement('M35 107 Q42 114 54 111 L130 83 Q144 78 153 67 Q155 85 141 104 L70 138 Q44 133 35 107Z',C.yellow)}
  ${pathElement('M45 115 Q53 120 68 119 L142 90 Q137 105 126 112 L71 139 Q53 136 45 126Z',C.coral)}
  ${pathElement('M45 109 Q53 115 67 111 L139 85 L128 81 L55 104Z',C.paper)}
  ${pathElement('M63 103 L87 111 L122 96 L122 83 L98 76 L63 90Z',C.paper)}
  ${pathElement('M87 94 L122 81 L122 96 L87 111Z',C.pale)}
  ${pathElement('M56 88 Q62 92 70 88 L95 76 Q108 76 123 78 L130 73 L125 85 L91 99 L60 94Z',C.coral)}
  ${pathElement('M78 99 L85 101 L85 110 L78 108Z',C.ink)}
  ${line('M96 96 L101 94 L101 101 L96 103Z M108 91 L113 89 L113 96 L108 98Z M47 124 Q57 129 68 130 L135 100')}
  ${pathElement('M91 87 L91 34', 'none', 'stroke-width="3"')}
  ${pathElement('M95 37 Q111 33 129 42 L123 70 Q109 64 95 71Z',C.paper)}
  ${line('M96 47 Q109 42 126 49 M96 59 Q109 53 124 60')}
  ${pathElement('M91 32 L112 37 L92 44Z',C.coral)}
  ${pathElement('M142 86 Q145 76 153 68 L157 67 L155 74 L150 77',C.blue)}
  ${ellipse(152,71,1.7,1.7,C.ink,'stroke="none"')}`;
}
function boat(coast = false) {
  return `${plinth(coast?C.blue:C.pale)}${coast?`${pathElement('M30 125 Q42 114 64 119 Q76 123 85 117 Q104 111 117 117 L143 130 L112 141 Q102 145 93 142Z',C.pale,'stroke="none"')}${pathElement('M36 128 Q51 119 65 126 Q81 134 95 125', 'none', `stroke="${C.white}" stroke-width="3"`)}<g transform="translate(21 24) scale(.76)">${boatBody()}</g>${pathElement('M36 113 L36 93 M36 95 Q23 99 25 108 Q32 109 36 102 M36 95 Q48 96 48 105 Q41 107 36 101',C.green)}`:boatBody()}
  ${pathElement('M102 144 Q112 147 125 139 M126 133 Q137 136 149 129','none',`stroke="${C.white}" stroke-width="3"`)}`;
}
function flags() {
  return `${plinth()}${pathElement('M61 126 L61 39 M112 135 L112 57','none','stroke-width="4"')}
  ${pathElement('M63 43 Q80 37 96 49 L91 78 Q76 66 63 73Z',C.coral)}
  ${pathElement('M114 61 Q129 55 147 67 L140 94 Q126 85 114 91Z',C.blue)}
  ${pathElement('M64 48 Q78 42 91 51 L87 70 Q76 63 64 66Z',C.yellow,'stroke-width="1.5"')}
  ${pathElement('M115 66 Q129 61 141 69 L136 86 Q124 80 115 85Z',C.paper,'stroke-width="1.5"')}
  ${line('M71 51 L82 57 L73 62 M122 70 L131 74 L124 79')}${ellipse(61,37,3,4,C.yellow)}${ellipse(112,55,3,4,C.yellow)}
  ${pathElement('M49 128 L63 134 L76 126 L61 121Z',C.pale)}${pathElement('M101 137 L115 141 L126 133 L112 129Z',C.pale)}`;
}
function person(x,y,colour,large=false) {
  return `<g transform="translate(${x} ${y})${large?' scale(1.1)':''}">
  ${pathElement('M-10 24 L-14 48 L-5 50 L0 30 L5 50 L14 48 L10 24Z',colour)}
  ${pathElement('M-11 49 Q-20 48 -21 54 L-4 55 L-3 49 M6 49 L5 55 L22 54 Q20 48 12 49',C.ink)}
  ${pathElement('M-13 -4 Q-20 2 -22 18 L-16 20 L-8 7 L-9 34 Q0 39 12 33 L9 7 L19 19 L25 14 Q19 0 12 -4Z',colour)}
  ${pathElement('M-5 -2 L3 10 L10 -2 M-8 23 L11 23', 'none',`stroke="${C.yellow}" stroke-width="4"`)}
  ${ellipse(0,-13,13,15,C.paper)}
  ${pathElement('M-15 -18 L-11 -30 L-5 -25 L0 -35 L6 -25 L12 -31 L16 -19 Q0 -24 -15 -18Z',C.yellow)}
  ${pathElement('M-9 -14 L-3 -11 M4 -11 L9 -14 M-4 -5 Q0 -2 4 -5','none','stroke-width="2"')}
  ${pathElement('M-11 -10 L-7 -6 M8 -6 L12 -10', 'none',`stroke="${C.coral}" stroke-width="3"`)}</g>`;
}
function generals() {
  return `${plinth()}${person(122,76,C.blue)}${person(73,87,C.coral,true)}${pathElement('M41 133 L47 59 M43 66 L38 51 L46 54 L52 45 L55 61Z',C.yellow)}`;
}
function drums() {
  return `${plinth()}${pathElement('M62 113 L53 140 M119 109 L132 135 M65 128 L125 123','none','stroke-width="5"')}
  ${pathElement('M48 85 Q53 73 84 70 Q118 66 135 81 L133 112 Q118 130 84 130 Q57 126 49 114Z',C.coral)}
  ${ellipse(91,83,43,17,C.yellow)}${ellipse(91,82,36,12,C.paper)}
  ${pathElement('M49 91 Q90 111 134 87 M49 111 Q84 137 133 108','none','stroke-width="2"')}
  ${[57,72,88,104,120].map((x,i)=>ellipse(x,102+[0,5,6,4,0][i],1.8,2,C.yellow,'stroke="none"')).join('')}
  ${pathElement('M64 77 L100 48 M109 80 L86 44','none','stroke-width="4"')}${ellipse(100,48,4,4,C.yellow)}${ellipse(86,44,4,4,C.yellow)}`;
}
function crane() {
  return `${plinth()}${pathElement('M75 110 L69 134 L57 137 M97 108 L105 132 L119 133', 'none','stroke-width="3"')}
  ${pathElement('M48 87 Q67 66 91 76 Q108 80 114 70 Q118 61 117 49 Q119 36 132 40 Q141 46 131 54 Q126 57 128 74 Q130 89 113 104 Q94 121 72 111 Q57 106 48 87Z',C.paper)}
  ${pathElement('M53 86 Q67 69 74 55 Q87 64 91 78 Q101 70 112 75 Q104 94 86 100 Q68 103 53 86Z',C.white)}
  ${pathElement('M56 89 Q70 96 85 92 M63 83 Q74 88 85 85','none','stroke-width="1.5"')}
  ${pathElement('M134 45 L154 51 L135 53Z',C.yellow)}${ellipse(129,45,2,2,C.ink,'stroke="none"')}${pathElement('M119 43 Q124 35 133 40', 'none',`stroke="${C.coral}" stroke-width="4"`)}
  ${pathElement('M50 87 L39 88 L49 95',C.ink)}`;
}
function music() {
  return `${plinth()}${person(75,80,C.blue)}${pathElement('M80 89 L119 72 Q119 63 133 62 L143 72 Q131 84 122 79 L86 98Z',C.yellow)}
  ${ellipse(135,68,6,10,C.paper,'transform="rotate(50 135 68)"')}${pathElement('M86 94 L89 100 M96 87 L100 94 M105 82 L109 89','none','stroke-width="1.5"')}`;
}
function building() {
  return `${plinth()}${pathElement('M48 80 L109 96 L146 77 L146 122 L108 144 L48 127Z',C.paper)}
  ${pathElement('M109 96 L146 77 L146 122 L108 144Z',C.pale)}
  ${pathElement('M39 80 L81 49 L150 68 L112 102Z',C.blue)}
  ${pathElement('M81 49 L150 68 L154 79 L112 102 L106 94Z',C.blue)}
  ${pathElement('M81 49 L150 68 L144 73 L91 60Z',C.white,'opacity=".3" stroke="none"')}
  ${pathElement('M61 102 L77 106 L77 135 L61 131Z',C.coral)}
  ${pathElement('M86 107 L99 110 L99 123 L86 120Z',C.yellow)}
  ${pathElement('M119 103 L135 94 L135 111 L119 120Z',C.blue)}
  ${line('M127 99 L127 116 M119 111 L135 102')}${ellipse(72,121,1.2,1.5,C.ink,'stroke="none"')}`;
}
const models = {
  donglong: temple(C.yellow,C.coral,true),
  'temple-ding': temple(C.blue,C.yellow),
  'temple-dingzhong': temple(C.green,C.coral),
  'temple-xiazhong': temple(C.yellow,C.blue),
  'temple-pu': temple(C.coral,C.green),
  'temple-anhai': temple(C.blue,C.coral),
  'temple-xia': temple(C.coral,C.yellow),
  'temple-lunding': temple(C.green,C.blue),
  temple: temple(C.coral,C.blue), boat: boat(), coast: boat(true),
  flags: flags(), generals: generals(), drums: drums(), crane: crane(), music: music(), building: building()
};
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="176" viewBox="0 0 192 176"><g stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

export async function buildHomeModels() {
  const source = path.join(root,'art-source/home-models'), output = path.join(root,'dist/assets/home-models');
  await Promise.all([fs.mkdir(source,{recursive:true}),fs.mkdir(output,{recursive:true})]);
  const report = [];
  for (const [name,body] of Object.entries(models)) {
    const svg = wrap(body).replace(/[ \t]+$/gm,'');
    await fs.writeFile(path.join(source,name+'.svg'),svg);
    const webp = await sharp(Buffer.from(svg),{density:144}).resize(192,176).webp({lossless:true,effort:6}).toBuffer();
    if (webp.length>25*1024) throw Error(`${name} exceeds model budget: ${webp.length}`);
    await fs.writeFile(path.join(output,name+'.webp'),webp);
    report.push({name,bytes:webp.length});
  }
  return report;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report=await buildHomeModels();
  console.log(JSON.stringify({models:report,totalBytes:report.reduce((sum,item)=>sum+item.bytes,0)},null,2));
  if (process.argv.includes('--contact-sheet')) {
    const dest=path.resolve(root,'../homepage-fix2/after');await fs.mkdir(dest,{recursive:true});
    const sheet=Object.entries(models).map(([name,body],i)=>`<g transform="translate(${i%5*220+14} ${Math.floor(i/5)*208})"><g stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</g><text x="96" y="188" text-anchor="middle" font-family="sans-serif" font-size="14" fill="${C.ink}">${name}</text></g>`).join('');
    await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="832"><rect width="1100" height="832" fill="${C.paper}"/>${sheet}</svg>`)).png().toFile(path.join(dest,'models.png'));
  }
}
