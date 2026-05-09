(function(){
'use strict';
/* CURSOR */
var cr=document.getElementById('cr'),cd=document.getElementById('cd');
var mx=-200,my=-200,rx=-200,ry=-200;
document.addEventListener('mousemove',function(e){
  mx=e.clientX;my=e.clientY;
  if(cd){cd.style.left=mx+'px';cd.style.top=my+'px';}
});
(function t(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
  if(cr){cr.style.left=rx+'px';cr.style.top=ry+'px';}
  requestAnimationFrame(t);})();
document.querySelectorAll('a,button,.tc').forEach(function(el){
  el.addEventListener('mouseenter',function(){cr&&cr.classList.add('big')});
  el.addEventListener('mouseleave',function(){cr&&cr.classList.remove('big')});
});

/* RIPPLE */
var rw=document.getElementById('rw');
document.addEventListener('click',function(e){
  if(!rw)return;
  var r=document.createElement('div');r.className='rpl';
  r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
  r.style.width=r.style.height='60px';rw.appendChild(r);
  r.addEventListener('animationend',function(){r.remove()});
});

/* FOREST CANVAS */
var fc=document.getElementById('fc');
if(fc){
  var ctx=fc.getContext('2d'),W,H,pts=[],mouse={x:-999,y:-999};
  var COLS=['rgba(90,138,100,','rgba(61,102,68,','rgba(45,74,50,','rgba(139,96,64,','rgba(92,61,40,'];
  function resize(){W=fc.width=fc.offsetWidth;H=fc.height=fc.offsetHeight;}
  resize();window.addEventListener('resize',function(){resize();init();});
  function mk(){return{x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.5,vy:Math.random()*.6+.25,sz:Math.random()*4+2.5,rot:Math.random()*Math.PI*2,rv:(Math.random()-.5)*.018,sw:Math.random()*Math.PI*2,ss:Math.random()*.007+.003,sa:Math.random()*.5+.2,col:COLS[Math.floor(Math.random()*COLS.length)],al:Math.random()*.42+.1,sh:Math.floor(Math.random()*3)};}
  function init(){pts=[];var n=Math.floor(W*H/10000);for(var i=0;i<n;i++){pts.push(mk());}}
  init();
  fc.addEventListener('mousemove',function(e){var r=fc.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<pts.length;i++)for(var j=i+1;j<pts.length;j++){var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<75){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle='rgba(61,102,68,'+(1-d/75)*.06+')';ctx.lineWidth=.5;ctx.stroke();}}
    pts.forEach(function(p){
      p.sw+=p.ss;p.x+=p.vx+Math.sin(p.sw)*p.sa;p.y+=p.vy;p.rot+=p.rv;
      var dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<90){var f=(90-d)/90*.7;p.x+=dx/d*f;p.y+=dy/d*f;}
      if(p.y>H+15){p.y=-15;p.x=Math.random()*W;}
      if(p.x<-15)p.x=W+15;if(p.x>W+15)p.x=-15;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=p.al;
      ctx.fillStyle=p.col+p.al+')';ctx.beginPath();
      if(p.sh===0)ctx.ellipse(0,0,p.sz,p.sz*.45,0,0,Math.PI*2);
      else if(p.sh===1){ctx.moveTo(0,-p.sz);ctx.lineTo(p.sz*.6,p.sz*.5);ctx.lineTo(-p.sz*.6,p.sz*.5);ctx.closePath();}
      else{ctx.moveTo(0,-p.sz*.9);ctx.lineTo(p.sz*.5,0);ctx.lineTo(0,p.sz*.65);ctx.lineTo(-p.sz*.5,0);ctx.closePath();}
      ctx.fill();ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* SCRAMBLE */
var CH='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%';
function scramble(el,ch,delay){
  setTimeout(function(){
    var n=0,max=10,iv=setInterval(function(){
      el.textContent=CH[Math.floor(Math.random()*CH.length)];
      n++;if(n>=max){clearInterval(iv);el.textContent=ch;}
    },55);
  },delay);
}
function buildWord(id,word,base){
  var el=document.getElementById(id);if(!el)return;
  el.innerHTML='';
  for(var i=0;i<word.length;i++){
    var s=document.createElement('span');
    s.className='hl';s.textContent=word[i];el.appendChild(s);
    (function(sp,ch,d){
      setTimeout(function(){sp.classList.add('go');},d);
      scramble(sp,ch,d);
    })(s,word[i],base+i*65);
  }
}
buildWord('w1','Sardor',300);
buildWord('w2','Murtazaev',650);

/* 3D TILT */
document.querySelectorAll('.tc').forEach(function(c){
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform='perspective(700px) rotateY('+(x*10)+'deg) rotateX('+(-y*5)+'deg) scale3d(1.012,1.012,1.012)';
    c.style.transition='transform .06s linear';
  });
  c.addEventListener('mouseleave',function(){c.style.transform='';c.style.transition='transform .4s cubic-bezier(.16,1,.3,1)';});
});

/* MAGNETIC */
document.querySelectorAll('.bp,.bg,.cl').forEach(function(el){
  el.addEventListener('mousemove',function(e){
    var r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    el.style.transform='translate('+(x*.25)+'px,'+(y*.25)+'px)';
  });
  el.addEventListener('mouseleave',function(){el.style.transform='';});
});

/* NAV */
var nav=document.getElementById('nav'),np=document.getElementById('nprog');
window.addEventListener('scroll',function(){
  var sy=window.scrollY,max=document.documentElement.scrollHeight-window.innerHeight;
  if(np)np.style.width=(max>0?(sy/max)*100:0)+'%';
  if(nav)nav.classList.toggle('stuck',sy>60);
},{passive:true});

/* SCROLL REVEAL */
var obs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting)return;
    var par=e.target.parentElement;
    var sibs=par?Array.from(par.querySelectorAll('.sr')):[];
    var idx=sibs.indexOf(e.target);
    setTimeout(function(){e.target.classList.add('in');},idx*80);
    obs.unobserve(e.target);
  });
},{threshold:.1,rootMargin:'0px 0px -35px 0px'});
document.querySelectorAll('.sr').forEach(function(el){obs.observe(el);});

/* COUNTERS */
function easeOut(t){return 1-Math.pow(1-t,4);}
var cobs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting)return;
    var el=e.target,t=parseInt(el.dataset.t,10),dec=t===428,dur=1800,st=performance.now();
    (function tick(now){var p=Math.min((now-st)/dur,1),v=Math.round(easeOut(p)*t);el.textContent=dec?(v/100).toFixed(2):v;if(p<1)requestAnimationFrame(tick);})(st);
    cobs.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('.sn[data-t]').forEach(function(el){cobs.observe(el);});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});
})();
