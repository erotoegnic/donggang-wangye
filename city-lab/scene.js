import {Scene,Color,Fog,WebGLRenderer,OrthographicCamera,HemisphereLight,DirectionalLight,PointLight,PCFShadowMap,Vector3,ACESFilmicToneMapping,WebGLRenderTarget,ShaderMaterial,Mesh,PlaneGeometry,Vector2,Raycaster,Plane} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {CSS2DRenderer,CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js';
import {createWorld} from './world.js';
import {prepareGateFonts} from './gate.js';

export async function createScene(root,places,onSelect,onFailure,world){
 await prepareGateFonts();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer:coarse)');
 const renderer=new WebGLRenderer({antialias:true});renderer.shadowMap.enabled=true;renderer.shadowMap.type=PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','東隆宮周邊街區、廟宇與港口的立體模型');root.querySelector('.city-canvas').append(renderer.domElement);
 const scene=new Scene();let mobileModel=matchMedia('(max-width:760px)').matches||coarse.matches,model=createWorld(world,{mobile:mobileModel});scene.add(model.group);
 const camera=new OrthographicCamera(-60,60,45,-45,.1,500);const controls=new OrbitControls(camera,renderer.domElement);
 controls.minPolarAngle=.35;controls.maxPolarAngle=1.22;controls.minZoom=.75;controls.maxZoom=14;controls.enablePan=true;controls.screenSpacePanning=false;controls.dampingFactor=.12;
 const hemi=new HemisphereLight(0xfffcf6,0xb68a62,2.6);scene.add(hemi);
 const sun=new DirectionalLight(0xfff1db,3.1);sun.position.set(-40,80,45);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:230});sun.shadow.radius=2;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;scene.add(sun);
 const glow=new PointLight(0xffa45e,0,16,1.5);glow.position.set(0,2,1);scene.add(glow);
 const labels=new CSS2DRenderer();labels.domElement.className='city-labels';root.querySelector('.city-canvas').append(labels.domElement);
 const pins=document.createElementNS('http://www.w3.org/2000/svg','svg');pins.classList.add('city-pins');pins.setAttribute('aria-hidden','true');root.querySelector('.city-canvas').prepend(pins);
 const labelEntries=places.map(p=>{const button=document.createElement('button');button.className='city-label';button.textContent=p.number+' '+p.title;button.dataset.hotspot=p.id;button.setAttribute('aria-controls','city-info');button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>onSelect(p.id,button));const object=new CSS2DObject(button);object.position.set(...(model.labels?.[p.id]||p.labelPoint||p.point));scene.add(object);const line=document.createElementNS(pins.namespaceURI,'line'),dot=document.createElementNS(pins.namespaceURI,'circle');dot.setAttribute('r','3');pins.append(line,dot);return {p,button,object,line,dot};});
 const target=new WebGLRenderTarget(1,1,{depthBuffer:true});const postScene=new Scene(),postCamera=new OrthographicCamera(-1,1,1,-1,0,1);
 const postMaterial=new ShaderMaterial({uniforms:{image:{value:target.texture},resolution:{value:new Vector2(1,1)}},vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform sampler2D image;uniform vec2 resolution;varying vec2 uv0;
 void main(){float radius=smoothstep(.21,.48,abs(uv0.y-.51))*1.5;vec2 d=vec2(0.,radius/resolution.y);vec4 c=texture2D(image,uv0)*.4;c+=texture2D(image,uv0+d)*.24;c+=texture2D(image,uv0-d)*.24;c+=texture2D(image,uv0+d*2.)*.06;c+=texture2D(image,uv0-d*2.)*.06;gl_FragColor=c;
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const quad=new Mesh(new PlaneGeometry(2,2),postMaterial);postScene.add(quad);
 let playing=false,frame=0,frames=0,visible=true,disposed=false,flight=null,interactive=false,post=false,selected=null;
 const homeTarget=new Vector3(-10,0,0),homeOffset=new Vector3(5,48,110);
 function schedule(){if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
 function pause(){cancelAnimationFrame(frame);frame=0;}
 function setInteractive(value){interactive=value;controls.enabled=value;renderer.domElement.style.touchAction=value?'none':'pan-y';root.dataset.interactive=String(value);}
 function layoutLabels(){
  const occupied=[],w=root.clientWidth,h=root.clientHeight;
  for(const entry of [...labelEntries].sort((a,b)=>a.p.id===selected?-1:b.p.id===selected?1:a.p.priority-b.p.priority)){
   const v=entry.object.position.clone().project(camera),x=(v.x+1)*w/2,y=(1-v.y)*h/2,bw=entry.button.offsetWidth||110;
   const near=camera.zoom>=3.2,detail=camera.zoom>=6;
   const eligible=entry.p.id===selected||(entry.p.kind==='detail'?detail:entry.p.priority===1||near||(camera.zoom>=1.35&&entry.p.priority===2));
   let rect=null,xx=x,yy=y-14;
   if(eligible&&x>10&&x<w-10&&y>15&&y<h-15)for(const dy of [0,-46,46]){
    yy=y-14+dy;xx=Math.max(bw/2+8,Math.min(w-bw/2-8,x));const r={l:xx-bw/2,r:xx+bw/2,t:yy-22,b:yy+22};
    if(r.t<8||r.b>h-8)continue;
    if(!occupied.some(o=>o.l<r.r+8&&o.r>r.l-8&&o.t<r.b+8&&o.b>r.t-8)){rect=r;break;}
   }
   const show=v.z>-1&&v.z<1&&rect!==null;
   entry.button.style.translate=`${xx-x}px ${yy-y}px`;entry.button.style.visibility=show?'visible':'hidden';entry.button.tabIndex=show?0:-1;entry.button.setAttribute('aria-pressed',String(entry.p.id===selected));if(show)occupied.push(rect);
   const anchor=new Vector3(...(entry.p.anchorPoint||entry.p.point)).project(camera),ax=(anchor.x+1)*w/2,ay=(1-anchor.y)*h/2;
   for(const element of [entry.line,entry.dot])element.style.visibility=show?'visible':'hidden';
   entry.line.setAttribute('x1',xx);entry.line.setAttribute('y1',yy);entry.line.setAttribute('x2',ax);entry.line.setAttribute('y2',ay);entry.dot.setAttribute('cx',ax);entry.dot.setAttribute('cy',ay);
  }
 }
 function render(now){
  frame=0;if(disposed||!visible||document.hidden||root.clientWidth<=0||root.clientHeight<=0)return;
  let moving=false;
  if(flight){const t=reduced.matches?1:Math.min(1,(now-flight.start)/800),ease=1-(1-t)**3;camera.position.lerpVectors(flight.from,flight.to,ease);controls.target.lerpVectors(flight.targetFrom,flight.targetTo,ease);camera.zoom=flight.zoomFrom+(flight.zoomTo-flight.zoomFrom)*ease;camera.updateProjectionMatrix();if(t===1)flight=null;else moving=true;}
  moving=controls.update()||moving;
  if(playing&&!reduced.matches){model.animate(now);moving=true;}
  renderer.info.reset();renderer.info.autoReset=false;
  if(post){renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(postScene,postCamera);}else renderer.render(scene,camera);
  labels.render(scene,camera);layoutLabels();frames++;root.dataset.frames=String(frames);root.dataset.drawCalls=String(renderer.info.render.calls);root.dataset.triangles=String(renderer.info.render.triangles);root.dataset.post=String(post);root.dataset.state='ready';root.dataset.camera=[...camera.position.toArray(),camera.zoom].join(',');root.dataset.world=JSON.stringify(model.stats);root.dataset.dpr=String(renderer.getPixelRatio());root.dataset.motion=String(playing&&!reduced.matches);
  const [[west,north],[east,south]]=world.bounds,board=[...[-.2,-3].flatMap(y=>[west-.7,east+.7].flatMap(x=>[north-.7,south+.7].map(z=>new Vector3(x,y,z).project(camera))))];root.dataset.boardBounds=JSON.stringify({left:Math.min(...board.map(p=>p.x)),right:Math.max(...board.map(p=>p.x)),top:Math.max(...board.map(p=>p.y)),bottom:Math.min(...board.map(p=>p.y))});
  const lighting=[];model.group.traverse(o=>{if(['windowGlow','lantern','hallLantern'].includes(o.material?.name))lighting.push({name:o.material.name,intensity:o.material.emissiveIntensity,count:o.count||1});});root.dataset.lighting=JSON.stringify(lighting);
  const roofColors={};model.group.traverse(object=>{const mat=object.material;if(mat?.userData.fixedTempleColor)roofColors[mat.name]={color:mat.color.toArray(),hex:mat.color.getHexString(),uuid:mat.uuid};});root.dataset.roofColors=JSON.stringify(roofColors);const allRoofs=new Map();model.group.traverse(o=>{const m=o.material;if(m?.userData.fixedTempleColor)allRoofs.set(m.uuid,{name:m.name,hex:m.color.getHexString(),color:m.color.toArray()});});root.dataset.roofInstances=JSON.stringify([...allRoofs]);
  if(moving)schedule();
 }
 function resize(){
  const w=root.clientWidth,h=root.clientHeight,mobile=matchMedia('(max-width:760px)').matches||coarse.matches;
  if(disposed||w<=0||h<=0){pause();return;}
  if(mobile!==mobileModel){scene.remove(model.group);model.dispose();mobileModel=mobile;model=createWorld(world,{mobile});scene.add(model.group);for(const e of labelEntries)e.object.position.set(...(model.labels?.[e.p.id]||e.p.labelPoint||e.p.point));setTime(root.dataset.time||'day');}
  homeOffset.y=mobile?85:48;if(!selected&&!flight&&Math.abs(camera.zoom-1)<.001){controls.target.copy(homeTarget);camera.position.copy(homeTarget).add(homeOffset);controls.update();}
  const span=w<761?72:Math.max(103,43*w/h);renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.5:2));renderer.setSize(w,h);labels.setSize(w,h);camera.left=-span/2;camera.right=span/2;camera.top=span*h/w/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();post=!mobile&&!reduced.matches;controls.enableDamping=!reduced.matches;target.setSize(Math.round(w*renderer.getPixelRatio()),Math.round(h*renderer.getPixelRatio()));postMaterial.uniforms.resolution.value.set(target.width,target.height);setInteractive(!mobile?true:root.dataset.userInteractive==='true');schedule();
 }
 function fly(targetTo,zoomTo,offset=homeOffset){controls.update();flight={start:performance.now(),from:camera.position.clone(),to:targetTo.clone().add(offset),targetFrom:controls.target.clone(),targetTo,zoomFrom:camera.zoom,zoomTo};schedule();}
 function reset(){selected=null;fly(homeTarget.clone(),1);}
 function focus(id){const place=places.find(p=>p.id===id);if(!place)return;selected=id;const targetTo=new Vector3(...place.point),at=model.focus?.[id];targetTo.y=Math.max(.8,targetTo.y-1);if(at){targetTo.x=at[0];targetTo.z=at[1];targetTo.y=at[2]??targetTo.y;}const zoomTo=place.kind==='harbor'?3.5:place.kind==='donglong'?5.8:place.kind==='detail'?9:at?at[3]??8:9;fly(targetTo,root.clientWidth<761?zoomTo*.65:zoomTo);}
 function setMotion(value){playing=value;schedule();}
 function setTime(time){
  const presets={day:{bg:0xeee8dc,sky:0xfffcf6,sun:0xfff1db,ambient:2.6,power:3.1,glow:0,pos:[-9,17,12]},dusk:{bg:0xe2c5ad,sky:0xffdec0,sun:0xffb578,ambient:1.8,power:2.7,glow:.65,pos:[-14,8,9]},night:{bg:0x293a4b,sky:0xadc8e5,sun:0xa9c8e5,ambient:.95,power:1.1,glow:2.8,pos:[-8,15,-5]}};
  const p=presets[time];if(!p)return;scene.background=new Color(p.bg);scene.fog=new Fog(p.bg,180,380);hemi.color.set(p.sky);hemi.intensity=p.ambient;sun.color.set(p.sun);sun.intensity=p.power;sun.position.set(...p.pos.map(n=>n*4));model.group.traverse(o=>{if(['lantern','hallLantern','windowGlow'].includes(o.material?.name))o.material.emissiveIntensity=o.material.name==='windowGlow'?p.glow*1.4:p.glow;});glow.intensity=p.glow*13;renderer.shadowMap.needsUpdate=true;root.dataset.time=time;schedule();
 }
 const raycaster=new Raycaster(),ground=new Plane(new Vector3(0,1,0),0);let pointerStart=null;
 renderer.domElement.addEventListener('pointerdown',e=>{pointerStart=[e.clientX,e.clientY];});
 renderer.domElement.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])>6)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const point=raycaster.ray.intersectPlane(ground,new Vector3());if(!point)return;const nearest=world.places.map(p=>({p,d:Math.hypot(p.point[0]-point.x,p.point[2]-point.z)})).sort((a,b)=>a.d-b.d)[0];if(nearest&&nearest.d<(nearest.p.kind==='donglong'?4:nearest.p.kind==='harbor'?4:1.8))onSelect(nearest.p.id,renderer.domElement);});
 controls.addEventListener('change',schedule);controls.addEventListener('start',()=>{flight=null;});
 const observer=new ResizeObserver(resize);observer.observe(root);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;root.dataset.visible=String(visible);if(visible)schedule();else pause();});intersection.observe(root);
 const visibility=()=>document.hidden?pause():schedule();document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',resize);coarse.addEventListener('change',resize);
 function dispose(){if(disposed)return;disposed=true;pause();observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',resize);coarse.removeEventListener('change',resize);controls.dispose();model.dispose();target.dispose();quad.geometry.dispose();postMaterial.dispose();renderer.dispose();root.querySelector('.city-canvas').replaceChildren();}
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();onFailure();});
 controls.target.copy(homeTarget);camera.position.copy(homeTarget).add(homeOffset);controls.update();resize();setTime('day');schedule();
 return {focus,reset,setTime,setInteractive,setMotion,dispose,zoom(factor){flight=null;camera.zoom=Math.min(14,Math.max(.75,camera.zoom*factor));camera.updateProjectionMatrix();schedule();}};
}
