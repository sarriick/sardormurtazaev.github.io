
(function(){
'use strict';
if(typeof THREE==='undefined'){return;}
var cvs=document.getElementById('solar-bg');
if(!cvs)return;

/* ─ RENDERER ─ */
var renderer=new THREE.WebGLRenderer({canvas:cvs,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0x010408,1);

var scene=new THREE.Scene();
var cam=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,3000);
cam.position.set(0,80,200);cam.lookAt(0,0,0);

window.addEventListener('resize',function(){
  renderer.setSize(window.innerWidth,window.innerHeight);
  cam.aspect=window.innerWidth/window.innerHeight;
  cam.updateProjectionMatrix();
});

/* ─ TWINKLING STARS (custom shader) ─ */
var SC=4000;
var sPos=new Float32Array(SC*3),sPhase=new Float32Array(SC),sSz=new Float32Array(SC);
for(var i=0;i<SC;i++){
  var r=500+Math.random()*1200,th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1);
  sPos[i*3]=r*Math.sin(ph)*Math.cos(th);
  sPos[i*3+1]=r*Math.sin(ph)*Math.sin(th);
  sPos[i*3+2]=r*Math.cos(ph);
  sPhase[i]=Math.random()*Math.PI*2;
  sSz[i]=Math.random()*2.8+0.4;
}
var sGeo=new THREE.BufferGeometry();
sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3));
sGeo.setAttribute('phase',new THREE.BufferAttribute(sPhase,1));
sGeo.setAttribute('sz',new THREE.BufferAttribute(sSz,1));
var sMat=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0}},
  vertexShader:[
    'attribute float phase;attribute float sz;uniform float uTime;',
    'varying float vBright;',
    'void main(){',
    '  vBright=0.55+0.45*sin(uTime*1.8+phase);',
    '  gl_PointSize=sz*vBright;',
    '  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);',
    '}'
  ].join('\n'),
  fragmentShader:[
    'varying float vBright;',
    'void main(){',
    '  float d=length(gl_PointCoord-0.5)*2.0;',
    '  float a=1.0-smoothstep(0.0,1.0,d);',
    '  vec3 col=mix(vec3(0.8,0.85,1.0),vec3(1.0,0.95,0.8),vBright);',
    '  gl_FragColor=vec4(col,a*vBright*0.9);',
    '}'
  ].join('\n'),
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
});
scene.add(new THREE.Points(sGeo,sMat));

/* ─ PROCEDURAL TEXTURES ─ */
function mktex(w,h,fn){
  var c=document.createElement('canvas');c.width=w;c.height=h;
  fn(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c);
}
function nx(x,y,s){var n=Math.sin(x*127.1+y*311.7+s)*43758.5453;return n-Math.floor(n);}
function fbm(x,y,s){return nx(x,y,s)*0.5+nx(x*2.1,y*2.1,s+1)*0.25+nx(x*4.3,y*4.3,s+2)*0.125;}

var TEXTURES={
  sun:mktex(512,256,function(c,w,h){
    var g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w*0.55);
    g.addColorStop(0,'#fff8b0');g.addColorStop(0.25,'#ffd700');
    g.addColorStop(0.6,'#ff9500');g.addColorStop(1,'#cc4400');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    for(var i=0;i<20;i++){
      var x=w*0.15+Math.random()*w*0.7,y=h*0.1+Math.random()*h*0.8,r=Math.random()*14+4;
      c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='rgba(160,40,0,0.35)';c.fill();
      c.beginPath();c.arc(x+r*0.3,y-r*0.3,r*0.35,0,Math.PI*2);c.fillStyle='rgba(255,220,80,0.3)';c.fill();
    }
  }),
  mercury:mktex(512,256,function(c,w,h){
    c.fillStyle='#7a7a7a';c.fillRect(0,0,w,h);
    for(var px=0;px<w;px+=3){for(var py=0;py<h;py+=3){
      var n=fbm(px/90,py/90,10);
      c.fillStyle='rgba('+(n>0.55?90:60)+','+(n>0.55?90:60)+','+(n>0.55?90:60)+',0.7)';
      c.fillRect(px,py,3,3);
    }}
    for(var i=0;i<45;i++){
      var x=Math.random()*w,y=Math.random()*h,r=Math.random()*11+2;
      c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='rgba(40,40,40,0.55)';c.fill();
      c.beginPath();c.arc(x-r*0.35,y-r*0.35,r*0.4,0,Math.PI*2);c.fillStyle='rgba(160,160,160,0.35)';c.fill();
    }
  }),
  venus:mktex(512,256,function(c,w,h){
    var g=c.createLinearGradient(0,0,w,0);
    g.addColorStop(0,'#e8c87a');g.addColorStop(0.4,'#d4a840');g.addColorStop(0.7,'#c0a050');g.addColorStop(1,'#e0bc70');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    for(var y=0;y<h;y+=8){
      var a=0.06+Math.abs(Math.sin(y*0.18))*0.09;
      c.fillStyle='rgba(255,200,80,'+a+')';c.fillRect(0,y,w,5);
    }
  }),
  earth:mktex(512,256,function(c,w,h){
    c.fillStyle='#1835a0';c.fillRect(0,0,w,h);
    for(var px=0;px<w;px+=2){for(var py=0;py<h;py+=2){
      var n=fbm(px/70,py/70,3)+fbm(px/25,py/25,7)*0.4;
      if(n>0.68){
        var g2=n>0.82?'#3a6e2a':n>0.75?'#4a7e35':'#556640';
        c.fillStyle=g2;c.fillRect(px,py,2,2);
      } else if(n>0.62){
        c.fillStyle='#2060c0';c.fillRect(px,py,2,2);
      }
    }}
    c.fillStyle='rgba(210,235,255,0.75)';c.fillRect(0,0,w,14);c.fillRect(0,h-14,w,14);
    for(var i=0;i<22;i++){
      c.beginPath();c.ellipse(Math.random()*w,Math.random()*h,Math.random()*35+8,Math.random()*11+3,Math.random()*Math.PI,0,Math.PI*2);
      c.fillStyle='rgba(255,255,255,0.14)';c.fill();
    }
  }),
  mars:mktex(512,256,function(c,w,h){
    c.fillStyle='#b83a0c';c.fillRect(0,0,w,h);
    for(var px=0;px<w;px+=2){for(var py=0;py<h;py+=2){
      var n=fbm(px/65,py/65,6);
      if(n>0.62){c.fillStyle='rgba(90,15,0,0.5)';c.fillRect(px,py,2,2);}
      else if(n<0.38){c.fillStyle='rgba(200,80,30,0.6)';c.fillRect(px,py,2,2);}
    }}
    for(var i=0;i<30;i++){
      var x=Math.random()*w,y=Math.random()*h,r=Math.random()*13+3;
      c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='rgba(70,10,0,0.45)';c.fill();
    }
    c.fillStyle='rgba(220,235,255,0.65)';
    c.beginPath();c.ellipse(w/2,8,w*0.28,11,0,0,Math.PI*2);c.fill();
  }),
  jupiter:mktex(512,256,function(c,w,h){
    var bands=['#c8905a','#e8c898','#9a5a28','#d4aa70','#b07040','#e0c080','#8a4818','#cc9060','#d8b878'];
    var bh=h/bands.length;
    bands.forEach(function(col,i){c.fillStyle=col;c.fillRect(0,i*bh,w,bh+2);});
    for(var y=0;y<h;y+=1){
      var wave=Math.sin(y*0.22+1.5)*12;
      c.fillStyle='rgba(0,0,0,0.04)';c.fillRect(wave,y,w,1);
    }
    c.save();c.translate(w*0.62,h*0.56);
    c.beginPath();c.ellipse(0,0,30,18,0,0,Math.PI*2);c.fillStyle='#b83818';c.fill();
    c.beginPath();c.ellipse(0,0,22,13,0,0,Math.PI*2);c.fillStyle='#d84828';c.fill();
    c.beginPath();c.ellipse(0,0,14,8,0,0,Math.PI*2);c.fillStyle='#e86030';c.fill();
    c.restore();
  }),
  saturn:mktex(512,256,function(c,w,h){
    var bands=['#c0983a','#ddb858','#a87830','#cca848','#b89040','#d8c060','#a07028'];
    var bh=h/bands.length;
    bands.forEach(function(col,i){c.fillStyle=col;c.fillRect(0,i*bh,w,bh+2);});
    for(var y=0;y<h;y+=2){
      c.fillStyle='rgba(0,0,0,0.03)';c.fillRect(Math.sin(y*0.15)*8,y,w,1);
    }
  }),
  uranus:mktex(512,256,function(c,w,h){
    var g=c.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#90d0cc');g.addColorStop(0.5,'#70bcc0');g.addColorStop(1,'#50a8b8');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(140,200,210,0.25)';c.fillRect(0,h*0.3,w,h*0.4);
  }),
  neptune:mktex(512,256,function(c,w,h){
    var g=c.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#203898');g.addColorStop(0.45,'#1828b8');g.addColorStop(1,'#102070');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(40,80,200,0.45)';c.fillRect(0,h*0.38,w,h*0.18);
    c.beginPath();c.ellipse(w*0.35,h*0.47,22,14,0,0,Math.PI*2);
    c.fillStyle='rgba(10,20,100,0.5)';c.fill();
  })
};

/* ─ SUN ─ */
var sunMesh=new THREE.Mesh(
  new THREE.SphereGeometry(12,64,64),
  new THREE.MeshBasicMaterial({map:TEXTURES.sun})
);
scene.add(sunMesh);
[{r:17,o:0.14,c:'#ff8800'},{r:22,o:0.08,c:'#ffaa00'},{r:30,o:0.04,c:'#ff6600'}].forEach(function(g){
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(g.r,32,32),
    new THREE.MeshBasicMaterial({color:new THREE.Color(g.c),transparent:true,opacity:g.o,
      side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false})
  ));
});
scene.add(new THREE.PointLight(0xffe8a0,3.0,700));
scene.add(new THREE.AmbientLight(0x080c14,2.5));

/* ─ ORBIT LINE ─ */
function orbitLine(r){
  var pts=[];for(var i=0;i<=128;i++){var a=(i/128)*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));}
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({color:0x162a1a,transparent:true,opacity:0.35}));
}

/* ─ PLANET DATA ─ */
/* speed = how many degrees per second in real time (scaled for visibility) */
var EARTH_REAL_PERIOD = 45; /* Earth completes orbit in 45 real seconds */
var PD=[
  {key:'mercury',r:2.0, orb:25, tex:TEXTURES.mercury, tilt:0.01, period:88,  rings:false, atm:null},
  {key:'venus',  r:3.2, orb:36, tex:TEXTURES.venus,   tilt:3.09, period:225, rings:false, atm:'#ffdd88'},
  {key:'earth',  r:3.4, orb:52, tex:TEXTURES.earth,   tilt:0.41, period:365, rings:false, atm:'#4488ff'},
  {key:'mars',   r:2.5, orb:70, tex:TEXTURES.mars,    tilt:0.44, period:687, rings:false, atm:'#ff6622'},
  {key:'jupiter',r:7.5, orb:100,tex:TEXTURES.jupiter, tilt:0.05, period:4333,rings:false, atm:null},
  {key:'saturn', r:6.2, orb:130,tex:TEXTURES.saturn,  tilt:0.47, period:10759,rings:true, atm:null},
  {key:'uranus', r:4.5, orb:160,tex:TEXTURES.uranus,  tilt:1.71, period:30687,rings:true, atm:'#88ddcc'},
  {key:'neptune',r:4.0, orb:190,tex:TEXTURES.neptune, tilt:0.49, period:60190,rings:false,atm:'#2244ff'},
];

var pMeshes=[];
PD.forEach(function(d){
  scene.add(orbitLine(d.orb));
  /* planet */
  var m=new THREE.Mesh(
    new THREE.SphereGeometry(d.r,48,48),
    new THREE.MeshPhongMaterial({map:d.tex,shininess:18,specular:new THREE.Color(0x111111)})
  );
  m.rotation.z=d.tilt;
  scene.add(m);
  /* atmosphere */
  if(d.atm){
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(d.r*1.1,32,32),
      new THREE.MeshBasicMaterial({color:new THREE.Color(d.atm),transparent:true,opacity:0.1,
        side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false})
    ));
  }
  /* rings */
  if(d.rings){
    var rg=new THREE.RingGeometry(d.r*1.4,d.r*2.5,80);
    rg.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    var ringM=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({
      color:new THREE.Color(d.key==='saturn'?'#c8aa60':'#80bbcc'),
      side:THREE.DoubleSide,transparent:true,opacity:0.55,
      blending:THREE.AdditiveBlending,depthWrite:false
    }));
    scene.add(ringM);
    m._ring=ringM;
  }
  /* earth moon */
  if(d.key==='earth'){
    var moon=new THREE.Mesh(
      new THREE.SphereGeometry(0.9,20,20),
      new THREE.MeshPhongMaterial({color:0xaaaaaa,shininess:5})
    );
    scene.add(moon);m._moon=moon;m._moonA=Math.random()*Math.PI*2;
  }
  m._d=d;
  m._angle=Math.random()*Math.PI*2;
  /* angular speed in radians per second (real time) */
  m._spd=(2*Math.PI/EARTH_REAL_PERIOD)*(365/d.period);
  pMeshes.push(m);
});

/* ─ SCROLL CAMERA ─ */
var KEYS=[
  {p:[0,   80, 200]},
  {p:[190, 45,  90]},
  {p:[-130,-35, 150]},
  {p:[15,  210,  18]},
];
function lp(a,b,t){return a+(b-a)*t;}
function camAt(prog){
  var S=KEYS.length-1,raw=prog*S,idx=Math.floor(raw),fr=raw-idx;
  if(idx>=S){idx=S-1;fr=1;}
  var A=KEYS[idx],B=KEYS[idx+1];
  return[lp(A.p[0],B.p[0],fr),lp(A.p[1],B.p[1],fr),lp(A.p[2],B.p[2],fr)];
}
var sp=0,cT={x:0,y:80,z:200},cC={x:0,y:80,z:200};
window.addEventListener('scroll',function(){
  var mx=document.documentElement.scrollHeight-window.innerHeight;
  sp=mx>0?window.scrollY/mx:0;
  var v=camAt(sp);cT.x=v[0];cT.y=v[1];cT.z=v[2];
},{passive:true});

/* ─ ANIMATION LOOP ─ */
var clock=new THREE.Clock();
function loop(){
  requestAnimationFrame(loop);
  var dt=Math.min(clock.getDelta(),0.05);
  var el=clock.getElapsedTime();
  /* stars twinkle */
  sMat.uniforms.uTime.value=el;
  /* sun rotation */
  sunMesh.rotation.y+=0.004;
  /* planet orbits */
  pMeshes.forEach(function(m){
    m._angle+=m._spd*dt;
    var x=Math.cos(m._angle)*m._d.orb;
    var z=Math.sin(m._angle)*m._d.orb;
    m.position.set(x,0,z);
    m.rotation.y+=0.008;
    if(m._ring)m._ring.position.set(x,0,z);
    if(m._moon){
      m._moonA+=0.5*dt;
      m._moon.position.set(
        x+Math.cos(m._moonA)*(m._d.r*2.8),
        Math.sin(m._moonA*0.3)*0.8,
        z+Math.sin(m._moonA)*(m._d.r*2.8)
      );
    }
  });
  /* smooth camera */
  cC.x+=(cT.x-cC.x)*0.028;cC.y+=(cT.y-cC.y)*0.028;cC.z+=(cT.z-cC.z)*0.028;
  cam.position.set(cC.x,cC.y,cC.z);cam.lookAt(0,0,0);
  /* fade on scroll */
  /* opacity fixed — no fade on scroll */
  renderer.render(scene,cam);
}
loop();
})();
