(()=>{
 const stage=document.querySelector('.cover-stage');
 if(!stage)return;
 const poster=stage.querySelector('img'),button=document.querySelector('.cover-toggle');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let paused=matchMedia('(pointer:coarse)').matches,visible=false,render=null,canvas=null,frame=0,last=0,time=0,loading=false,failed=false;
 const WIDTH=800,HEIGHT=800*2/3;
 const boat=[[69,128],[77,105],[94,100],[110,78],[123,70],[143,79],[152,99],[173,95],[184,115],[169,139],[203,203],[263,239],[336,242],[353,223],[385,229],[415,251],[450,253],[467,275],[504,278],[514,310],[507,343],[489,371],[463,383],[273,373],[235,366],[211,350],[173,340],[143,290],[121,240],[101,185]];
 function hullWeight(x,y){
  let inside=false,distance=Infinity;
  for(let i=0,j=boat.length-1;i<boat.length;j=i++){
   const [ax,ay]=boat[i],[bx,by]=boat[j];
   if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
   const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
   distance=Math.min(distance,Math.hypot(x-ax-t*dx,y-ay-t*dy));
  }
  if(inside)return 1;
  const w=Math.max(0,1-distance/15);return w*w*(3-2*w);
 }
 function influence(x,y,cx,cy,rx,ry){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;return d<1?(1-d)**2:0;}
 function makeRenderer(gl){
  const vertex=`attribute vec2 point;attribute float hull;attribute vec4 walk;attribute float flag;attribute vec4 crowd;uniform float time;uniform float strength;varying vec2 uv;
  void main(){uv=point/vec2(800.,533.333333);float s=sin(time*3.4),c=cos(time*3.4);vec2 d=vec2(walk.x*s+walk.y*c,walk.z*s+walk.w*c);float cs=sin(time*1.7),cc=cos(time*1.7);d+=vec2(crowd.x*cs+crowd.y*cc,crowd.z*cs+crowd.w*cc);d+=hull*vec2(4.0*sin(time*.95),2.2*sin(time*1.9));d.x+=flag*2.8*sin(time*2.2);vec2 p=(point+d*strength)/vec2(800.,533.333333);gl_Position=vec4(p.x*2.-1.,1.-p.y*2.,0.,1.);}`;
  const fragment='precision mediump float;varying vec2 uv;uniform sampler2D picture;void main(){gl_FragColor=texture2D(picture,uv);}';
  const shaders=[];
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader unavailable');shaders.push(shader);}
  const program=gl.createProgram();for(const shader of shaders)gl.attachShader(program,shader);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');gl.useProgram(program);for(const shader of shaders)gl.deleteShader(shader);
  const vertices=[],indices=[],cols=160,rows=108;
  const people=[[124,409,1],[178,411,1],[271,412,1],[344,413,.88],[394,416,.7],[452,411,.78],[511,413,.62]];
  const spectators=[[62,466,42,47],[236,504,39,32],[532,509,36,30],[589,489,36,38],[704,439,34,41],[768,490,29,36],[30,379,15,22],[60,375,14,21],[96,365,12,18],[551,375,13,22],[578,380,13,23],[612,376,14,23],[647,367,13,22],[677,363,12,19],[716,369,13,23],[751,371,13,21],[780,386,14,23]];
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
   const x=col/cols*WIDTH,y=row/rows*HEIGHT,w=[0,0,0,0],crowd=[0,0,0,0];
   function add(weight,dx,dy,phase){w[0]+=weight*dx*Math.cos(phase);w[1]+=weight*dx*Math.sin(phase);w[2]+=weight*dy*Math.cos(phase);w[3]+=weight*dy*Math.sin(phase);}
   people.forEach(([cx,cy,size],i)=>{
    const phase=i*.7;
    add(influence(x,y,cx,cy-6,27*size,43*size),.5,1.5,phase);
    for(const side of [-1,1]){
     add(influence(x,y,cx+side*13*size,cy+54*size,16*size,24*size),4.4*size,-1.7*size,phase+(side<0?0:Math.PI));
     add(influence(x,y,cx-18*size,cy+12*size,17*size,17*size),1.4,2.2,phase);
    }
   });
   add(influence(x,y,603,442,18,23),1.4,-2.2,.6);
   add(influence(x,y,107,468,19,23),-1.8,-2.0,1.6);
   add(influence(x,y,654,417,19,23),1.6,-2.6,2.4);
   spectators.forEach(([cx,cy,rx,ry],i)=>{
    const radius=Math.hypot((x-cx)/rx,(y-cy)/ry);
    const fade=Math.max(0,Math.min(1,(1-radius)/.45));
    const weight=fade*fade*(3-2*fade)*Math.max(0,Math.min(1,x/12,(WIDTH-x)/12,(HEIGHT-y)/14));
    const phase=i*1.13,amplitude=i<6?2.8:1.6;
    crowd[0]+=weight*amplitude*Math.cos(phase);crowd[1]+=weight*amplitude*Math.sin(phase);
    crowd[2]+=weight*1.3*Math.cos(phase+.7);crowd[3]+=weight*1.3*Math.sin(phase+.7);
   });
   for(const [cx,cy,rx,ry,phase] of [[50,413,14,21,.2],[107,466,17,24,1.6],[328,511,17,22,2.5],[493,503,20,23,3.4],[601,444,15,23,.9],[651,413,17,24,2.2]]){
    add(influence(x,y,cx,cy,rx,ry),3.4,-3.5,phase);
   }
   const flag=influence(x,y,28,226,28,65)+influence(x,y,788,233,18,70);
   vertices.push(x,y,hullWeight(x,y),...w,flag,...crowd);
  }
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+1,c=a+cols+1;indices.push(a,c,b,b,c,c+1);}
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  for(const [name,size,offset] of [['point',2,0],['hull',1,2],['walk',4,3],['flag',1,7],['crowd',4,8]]){const at=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(at);gl.vertexAttribPointer(at,size,gl.FLOAT,false,48,offset*4);}
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,poster);
  const clock=gl.getUniformLocation(program,'time'),strength=gl.getUniformLocation(program,'strength');
  return elapsed=>{const width=Math.min(1200,Math.round(stage.clientWidth*Math.min(devicePixelRatio||1,2))),height=Math.round(width*2/3);if(canvas.width!==width){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}gl.uniform1f(clock,elapsed);gl.uniform1f(strength,Math.min(elapsed/0.6,1));gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);};
 }
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
 function tick(now){
  if(paused||reduced.matches||document.hidden||!visible){stop();return;}
  if(!last)last=now;
  if(now-last>=1000/30){time+=Math.min((now-last)/1000,.08);last=now;render(time);}
  frame=requestAnimationFrame(tick);
 }
 function staticFallback(){failed=true;stop();stage.classList.remove('is-ready');button.textContent='封面插畫';button.setAttribute('aria-pressed','false');button.disabled=true;}
 async function initialize(){
  if(render||loading||failed)return;loading=true;
  try{
   await poster.decode();canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');stage.append(canvas);
   const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});if(!gl)throw Error('No rendering context');
   canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();staticFallback();});
   render=makeRenderer(gl);render(0);stage.classList.add('is-ready');
  }catch{staticFallback();}finally{loading=false;sync();}
 }
 function sync(){
  if(failed)return;
  button.hidden=false;button.disabled=reduced.matches;button.textContent=reduced.matches?'已減少動態':paused?'播放封面動畫':'暫停封面動畫';button.setAttribute('aria-pressed',String(!paused&&!reduced.matches));
  if(reduced.matches){stage.classList.remove('is-ready');stop();return;}
  if(paused||!visible||document.hidden){stop();return;}
  if(!render){initialize();return;}
  stage.classList.add('is-ready');if(!frame)frame=requestAnimationFrame(tick);
 }
 button.addEventListener('click',()=>{paused=!paused;sync();});reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.05}).observe(stage);
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',sync);sync();
})();
