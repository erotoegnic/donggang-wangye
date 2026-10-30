import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {page,places} from './template.mjs';
import {outsidePlaces,separateStories} from './data.mjs';
import {scenePins} from '../home3d/build.mjs';

export async function buildCity(){
 const directory='dist/assets/city-lab';await fs.mkdir(directory,{recursive:true});
 const result=await build({entryPoints:{home:'home3d/ui.js',city:'city-lab/ui.js'},bundle:true,minify:true,format:'esm',splitting:true,outdir:directory,entryNames:'[name]-[hash]',chunkNames:'chunk-[hash]',metafile:true,target:'es2022',write:false,legalComments:'none'});
 const outputs=result.metafile.outputs;
 const entry=name=>Object.entries(outputs).find(([,meta])=>meta.entryPoint===name)[0];
 const closure=start=>{const seen=new Set();function visit(file){if(seen.has(file))return;seen.add(file);for(const dep of outputs[file].imports)if(!dep.external)visit(dep.path);}visit(start);return seen;};
 const home=entry('home3d/ui.js'),city=entry('city-lab/ui.js'),homeFiles=closure(home),cityFiles=closure(city);
 const sizes=[];for(const file of result.outputFiles){await fs.writeFile(file.path,file.contents);const name=path.relative(process.cwd(),file.path).replaceAll('\\','/');sizes.push({file:name,raw:file.contents.length,gzip:gzipSync(file.contents).length,shared:homeFiles.has(name)&&cityFiles.has(name),city:cityFiles.has(name)});}
 const css=await fs.readFile('city-lab/style.css'),cssName='style-'+createHash('sha256').update(css).digest('hex').slice(0,12)+'.css';await fs.writeFile(directory+'/'+cssName,css);
 const text=page({js:'',css:'',fontCSS:''}).replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'')+places.map(p=>p.title+p.copy+p.link).join('')+await fs.readFile('city-lab/ui.js','utf8');
 const fontName='huninn-'+createHash('sha256').update(text).digest('hex').slice(0,12)+'.woff2';
 execFileSync(process.env.PYTHON||'python',['-m','fontTools.subset','font-source/Huninn-Regular.ttf','--text='+[...new Set(text)].join(""),'--flavor=woff2','--output-file='+directory+'/'+fontName,'--no-hinting'],{stdio:'pipe'});
 const keep=new Set([cssName,fontName,...result.outputFiles.map(f=>path.basename(f.path)),'LICENSE-three.txt','size.json']);for(const file of await fs.readdir(directory))if(!keep.has(file))await fs.unlink(directory+'/'+file);
 await fs.copyFile('node_modules/three/LICENSE',directory+'/LICENSE-three.txt');
 const newJS=sizes.filter(f=>f.city&&!f.shared).reduce((sum,f)=>({raw:sum.raw+f.raw,gzip:sum.gzip+f.gzip}),{raw:0,gzip:0});
 if(newJS.gzip>120*1024)throw Error('City JavaScript exceeds 120 KiB gzip: '+newJS.gzip);
 await fs.writeFile(directory+'/size.json',JSON.stringify({newJS,files:sizes},null,2));
 const routes=JSON.parse(await fs.readFile('routes.json','utf8'));const allowed=new Set(routes.map(r=>'/'+r.file));for(const p of [...places,...outsidePlaces,...separateStories]){const [file,anchor]=p.url.split('#');if(!allowed.has(file))throw Error('City link missing from routes.json: '+p.url);const html=await fs.readFile('dist'+file,'utf8');if(anchor&&!html.includes(`id="${anchor}"`))throw Error('City anchor missing: '+p.url);}
 const homeHTML=await fs.readFile('dist/index.html','utf8');await fs.writeFile('dist/index.html',homeHTML.replace(/src="\/assets\/home3d\/ui-[^"]+\.js"/,`src="${home.replace(/^dist/,'')}"`));
 const fontCSS=`@font-face{font-family:Huninn;font-style:normal;font-weight:400;font-display:swap;src:url('/assets/city-lab/${fontName}') format('woff2')}`;
 await fs.writeFile('dist/city-lab.html',page({js:city.replace(/^dist/,''),css:'/assets/city-lab/'+cssName,fontCSS}));
 console.log('City JavaScript (shared engine excluded): '+newJS.raw+' raw / '+newJS.gzip+' gzip bytes');
}
