(function(){
'use strict';

/* ── CURSOR ── */
var cr=document.getElementById('cr'),cd=document.getElementById('cd');
var mx=-200,my=-200,rx=-200,ry=-200;
document.addEventListener('mousemove',function(e){
  mx=e.clientX;my=e.clientY;
  if(cd){cd.style.left=mx+'px';cd.style.top=my+'px';}
});
(function tick(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
  if(cr){cr.style.left=rx+'px';cr.style.top=ry+'px';}
  requestAnimationFrame(tick);
})();
document.querySelectorAll('a,button,.tc').forEach(function(el){
  el.addEventListener('mouseenter',function(){cr&&cr.classList.add('big')});
  el.addEventListener('mouseleave',function(){cr&&cr.classList.remove('big')});
});

/* ── CLICK RIPPLE ── */
var rw=document.getElementById('rw');
document.addEventListener('click',function(e){
  if(!rw)return;
  var r=document.createElement('div');r.className='rpl';
  r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
  r.style.width=r.style.height='60px';rw.appendChild(r);
  r.addEventListener('animationend',function(){r.remove()});
});

/* ── FOREST CANVAS ── */
var fc=document.getElementById('fc');
if(fc){
  var ctx=fc.getContext('2d'),W,H,pts=[],mouse={x:-999,y:-999};
  var COLS=['rgba(90,138,100,','rgba(61,102,68,','rgba(45,74,50,','rgba(139,96,64,','rgba(92,61,40,'];
  function resize(){W=fc.width=fc.offsetWidth;H=fc.height=fc.offsetHeight;}
  resize();
  window.addEventListener('resize',function(){resize();init();});
  function mk(){return{
    x:Math.random()*W,y:Math.random()*H,
    vx:(Math.random()-.5)*.5,vy:Math.random()*.6+.25,
    sz:Math.random()*4+2.5,rot:Math.random()*Math.PI*2,
    rv:(Math.random()-.5)*.018,
    sw:Math.random()*Math.PI*2,ss:Math.random()*.007+.003,sa:Math.random()*.5+.2,
    col:COLS[Math.floor(Math.random()*COLS.length)],
    al:Math.random()*.42+.1,sh:Math.floor(Math.random()*3)
  };}
  function init(){pts=[];var n=Math.floor(W*H/10000);for(var i=0;i<n;i++)pts.push(mk());}
  init();
  fc.addEventListener('mousemove',function(e){
    var r=fc.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });
  function drawCanvas(){
    ctx.clearRect(0,0,W,H);
    /* connections */
    for(var i=0;i<pts.length;i++){
      for(var j=i+1;j<pts.length;j++){
        var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<75){
          ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle='rgba(61,102,68,'+(1-d/75)*.06+')';ctx.lineWidth=.5;ctx.stroke();
        }
      }
    }
    /* leaves */
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
    requestAnimationFrame(drawCanvas);
  }
  drawCanvas();
}

/* ══════════════════════════════════════════
   PARALLAX SCROLL  (Jungle + Moon technique)
   Each layer moves at a different speed —
   creates illusion of depth on scroll.
   ══════════════════════════════════════════ */
var plxEye   = document.querySelector('.eye');
var plxName  = document.getElementById('hero-name');  /* was .hname */
var plxTags  = document.querySelector('.htags');
var plxDesc  = document.querySelector('.hdesc');
var plxBtns  = document.querySelector('.hbtns');
var plxScr   = document.querySelector('.hscr');
var plxB1    = document.querySelector('.b1');
var plxB2    = document.querySelector('.b2');
var plxCanvas= document.getElementById('fc');

/* Store each element's natural transform so we ADD to it, not replace */
function applyParallax(){
  var v = window.scrollY;
  /* Only run inside hero viewport */
  var hero = document.getElementById('hero');
  if(!hero) return;
  var heroH = hero.offsetHeight;
  if(v > heroH) return;

  /* ── Background blobs: slowest (like rocks/water in Jungle) ── */
    if(plxB1) plxB1.style.transform='translate('+(v*0.04+mouseOffX*22)+'px,'+(v*-0.18+mouseOffY*15)+'px)';
  if(plxB2) plxB2.style.transform='translate('+(v*-0.06+mouseOffX*-14)+'px,'+(v*-0.12+mouseOffY*-10)+'px)';

  /* ── Canvas drifts up very slowly (like forest layer) ── */
  if(plxCanvas) plxCanvas.style.transform = 'translateY('+(v*0.08)+'px)';

  /* ── Eyebrow: moves up slightly faster than scroll (Moon: text.marginTop) ── */
  if(plxEye)  plxEye.style.transform  = 'translateY('+(v*-0.12)+'px)';

  /* ── Name: middle speed – drifts up + slight horizontal (like title in Moon) ── */
  if(plxName) plxName.style.transform = 'translate('+(v*0.04)+'px,'+(v*-0.22)+'px)';

  /* ── Tags: slightly faster than name ── */
  if(plxTags) plxTags.style.transform = 'translateY('+(v*-0.3)+'px)';

  /* ── Description: faster still (foreground) ── */
  if(plxDesc) plxDesc.style.transform = 'translateY('+(v*-0.38)+'px)';

  /* ── Buttons + scroll hint: fastest layer (like bird in Jungle) ── */
  if(plxBtns) plxBtns.style.transform = 'translateY('+(v*-0.45)+'px)';
  if(plxScr)  plxScr.style.transform  = 'translateY('+(v*-0.5)+'px)';
}

,55);
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
if(document.getElementById('w1'))buildWord('w1','Sardor',300);
if(document.getElementById('w2'))buildWord('w2','Murtazaev',650);

/* ══════════════════════════════════════════
   3D TILT on cards
   ══════════════════════════════════════════ */
document.querySelectorAll('.tc').forEach(function(c){
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-.5;
    var y=(e.clientY-r.top)/r.height-.5;
    c.style.transform='perspective(700px) rotateY('+(x*10)+'deg) rotateX('+(-y*5)+'deg) scale3d(1.012,1.012,1.012)';
    c.style.transition='transform .06s linear';
  });
  c.addEventListener('mouseleave',function(){
    c.style.transform='';
    c.style.transition='transform .4s cubic-bezier(.16,1,.3,1)';
  });
});

/* ══════════════════════════════════════════
   MAGNETIC BUTTONS
   ══════════════════════════════════════════ */
document.querySelectorAll('.bp,.bg,.cl').forEach(function(el){
  el.addEventListener('mousemove',function(e){
    var r=el.getBoundingClientRect();
    var x=e.clientX-r.left-r.width/2;
    var y=e.clientY-r.top-r.height/2;
    el.style.transform='translate('+(x*.25)+'px,'+(y*.25)+'px)';
  });
  el.addEventListener('mouseleave',function(){el.style.transform='';});
});

/* ══════════════════════════════════════════
   SCROLL REVEAL  (stagger siblings)
   ══════════════════════════════════════════ */
var srObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting)return;
    var par=e.target.parentElement;
    var sibs=par?Array.from(par.querySelectorAll('.sr')):[];
    var idx=sibs.indexOf(e.target);
    setTimeout(function(){e.target.classList.add('in');},idx*80);
    srObs.unobserve(e.target);
  });
},{threshold:.1,rootMargin:'0px 0px -35px 0px'});
document.querySelectorAll('.sr').forEach(function(el){srObs.observe(el);});

/* ══════════════════════════════════════════
   ANIMATED STAT COUNTERS
   ══════════════════════════════════════════ */
function easeOut(t){return 1-Math.pow(1-t,4);}
var cObs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting)return;
    var el=e.target,t=parseInt(el.dataset.t,10),dec=(t===428),dur=1800,st=performance.now();
    (function tick(now){
      var p=Math.min((now-st)/dur,1),v=Math.round(easeOut(p)*t);
      el.textContent=dec?(v/100).toFixed(2):v;
      if(p<1)requestAnimationFrame(tick);
    })(st);
    cObs.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('.sn[data-t]').forEach(function(el){cObs.observe(el);});

/* ══════════════════════════════════════════
   SMOOTH SCROLL
   ══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

})();


/* ── UNIFIED PARALLAX RAF — smooth blob+mouse response every frame ── */
(function mouseTick(){
  mouseOffX += (targetOX - mouseOffX) * 0.06;
  mouseOffY += (targetOY - mouseOffY) * 0.06;
  applyParallax();
  requestAnimationFrame(mouseTick);
})();
