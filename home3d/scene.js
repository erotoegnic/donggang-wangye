import {Scene,Color,WebGLRenderer,OrthographicCamera,HemisphereLight,DirectionalLight,PCFSoftShadowMap,Vector3,Vector2,Raycaster,Group,ACESFilmicToneMapping} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {temple,boat,box,palette} from './landmarks.js';
import {terrain,project} from './terrain.js';
export function createScene(root,data,onSelect,onFailure){
 const mount=root.querySelector('.scene-canvas'),labels=root.querySelector('.scene-labels');
 const renderer=new WebGLRenderer({antialias:true,alpha:false});renderer.setClearColor(0x78aebf);renderer.shadowMap.enabled=true;renderer.shadowMap.type=PCFSoftShadowMap;mount.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','東港宮廟、王船與海岸立體場景');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
 renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 const scene=new Scene();scene.background=new Color(0x78aebf);
 const camera=new OrthographicCamera(-40,40,30,-30,.1,500);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.12;controls.minPolarAngle=.35;controls.maxPolarAngle=1.18;controls.minZoom=.65;controls.maxZoom=3.5;controls.enablePan=true;controls.screenSpacePanning=false;controls.zoomToCursor=true;controls.autoRotate=false;
 scene.add(new HemisphereLight(0xfffcf6,0x78996b,1.5));const sun=new DirectionalLight(0xffffff,2);sun.position.set(-25,60,35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:180});sun.shadow.normalBias=.05;scene.add(sun);
 const land=terrain(data);scene.add(land.group);const targets=[],entries=[];
 const tones={'ritual-site':'indigo',temple:'pine','troupe-base':'plum'};
 const position=p=>p.id==='boat'?[-7,5.5]:p.id==='palace'?[3.7,-1]:project(p.lng,p.lat);
 for(const p of data.pins){const [x,z]=position(p);let model;
  if(p.id==='coast'){model=new Group();box(model,4,.12,4,0xf6d27a,0,.05,0);box(model,1.4,.3,1.2,palette.paper,0,.25,0);}
  else model=p.id==='boat'?boat():temple(p.id==='donglong');
  model.scale.setScalar(p.id==='boat'?.8:p.id==='palace'?.5:p.id==='donglong'?.72:p.category==='troupe-base'?.43:.74);
  model.position.set(x,0,z);model.userData.place=p.id;scene.add(model);targets.push(model);
  const button=document.createElement('button');button.className='scene-label tone-'+tones[p.category];button.dataset.hotspot=p.id;button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','scene-info');const number=document.createElement('span');number.textContent=p.number;button.append(number,document.createTextNode(p.title));button.addEventListener('click',()=>onSelect(p.id,button));labels.append(button);
  entries.push({pin:p,button,point:new Vector3(x,p.id==='boat'?4:p.id==='donglong'?3.6:2.6,z),width:0,height:44});
 }
 const pointer=new Vector2(),ray=new Raycaster();let down=null,selected=null,flight=null,frame=0,visible=true,disposed=false,frames=0;
 const startPosition=new Vector3(),startTarget=new Vector3();
 function reset(){controls.target.set(0,0,-1);camera.position.copy(controls.target).add(new Vector3(20,32,48));camera.zoom=1;camera.updateProjectionMatrix();selected=null;flight=null;controls.update();schedule();}
 function resize(){const w=root.clientWidth,h=root.clientHeight,span=w<761?32:64;renderer.setPixelRatio(Math.min(devicePixelRatio,w<761?1.5:2));renderer.setSize(w,h);camera.left=-span/2;camera.right=span/2;camera.top=span*h/w/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();for(const e of entries){e.button.hidden=false;e.width=e.button.offsetWidth||120;}setInteractive((w>760&&!matchMedia('(pointer:coarse)').matches)||root.dataset.interactive==='true');schedule();}
 function labelLayout(){const occupied=[];const w=root.clientWidth,h=root.clientHeight;const mobile=w<761;const ordered=[...entries].sort((a,b)=>(a.pin.id===selected?-1:b.pin.id===selected?1:a.pin.priority-b.pin.priority));
  for(const e of ordered){const point=e.point.clone().project(camera),x=(point.x+1)*w/2,y=(1-point.y)*h/2;const width=e.width||e.button.offsetWidth;const rect={l:x-width/2-5,r:x+width/2+5,t:y-49,b:y+4};const major=e.pin.priority<3||camera.zoom>1.6||e.pin.id===selected;
   const show=major&&point.z>-1&&point.z<1&&rect.l>8&&rect.r<w-8&&rect.t>(mobile?156:110)&&rect.b<h-(mobile?176:95)&&!occupied.some(r=>r.l<rect.r&&r.r>rect.l&&r.t<rect.b&&r.b>rect.t);
   e.button.hidden=!show;e.button.setAttribute('aria-pressed',String(e.pin.id===selected));if(show){e.button.style.left=x+'px';e.button.style.top=y+'px';occupied.push(rect);}
  }
 }
 function render(now){frame=0;if(disposed||document.hidden||!visible)return;
  if(flight){const t=Math.min(1,(now-flight.time)/900),ease=1-(1-t)**3;controls.target.lerpVectors(startTarget,flight.target,ease);camera.position.lerpVectors(startPosition,flight.position,ease);camera.zoom=flight.fromZoom+(flight.zoom-flight.fromZoom)*ease;camera.updateProjectionMatrix();if(t===1)flight=null;}
  controls.update();renderer.render(scene,camera);labelLayout();frames++;root.dataset.frames=String(frames);root.dataset.drawCalls=String(renderer.info.render.calls);root.dataset.state='ready';schedule();
 }
 function schedule(){if(!frame&&!disposed&&!document.hidden&&visible)frame=requestAnimationFrame(render);}
 function focus(id){const p=data.pins.find(p=>p.id===id);if(!p)return;selected=id;const [x,z]=position(p);startPosition.copy(camera.position);startTarget.copy(controls.target);const offset=camera.position.clone().sub(controls.target);const target=new Vector3(x,0,z);flight={time:performance.now(),target,position:target.clone().add(offset),fromZoom:camera.zoom,zoom:1.8};schedule();}
 function setInteractive(enabled){controls.enabled=enabled;renderer.domElement.style.touchAction=enabled?'none':'pan-y';}
 controls.addEventListener('start',()=>{flight=null;});
 renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
 renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6||!controls.enabled)return;down=null;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets,true)[0];if(hit){let obj=hit.object;while(obj&&!obj.userData.place)obj=obj.parent;if(obj)onSelect(obj.userData.place,renderer.domElement);}});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();onFailure();});
 const observer=new ResizeObserver(resize);observer.observe(root);const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else schedule();});intersection.observe(root);
 const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();};document.addEventListener('visibilitychange',visibility);
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);controls.dispose();renderer.dispose();scene.traverse(obj=>{obj.geometry?.dispose();});mount.replaceChildren();labels.replaceChildren();}
 reset();resize();setInteractive(!matchMedia('(pointer:coarse)').matches&&root.clientWidth>760);schedule();
 return {focus,reset,dispose,setInteractive,zoom(direction){flight=null;camera.zoom=Math.max(.65,Math.min(3.5,camera.zoom*(direction==='in'?1.25:.8)));camera.updateProjectionMatrix();schedule();}};
}
