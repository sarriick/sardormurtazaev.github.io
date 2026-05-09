(function(){
'use strict';

/* ── CURSOR ── */
var ring=document.getElementById('c-ring');
var dot=document.getElementById('c-dot');
var mx=-200,my=-200,rx=-200,ry=-200;
document.addEventListener('mousemove',function(e){
  mx=e.clientX;my=e.clientY;
  if(dot){dot.style.left=mx+'px';dot.style.top=my+'px';}
});
function tickC(){
  rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
  if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px';}
  requestAnimationFrame(tickC);
}
tickC();
document.querySelectorAll('a,button,.tc').forEach(function(el){
  el.addEventListener('mouseenter',function(){ring&&ring.classList.add('big')});
  el.addEventListener('mouseleave',function(){ring&&ring.classList.remove('big')});
});

/* ── CLICK RIPPLE ── */
var rw=document.getElementById('ripple-wrap');
document.addEventListener('click',function(e){
  if(!rw)return;
  var r=document.createElement('div');
  r.className='rpl';
  r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
  r.style.width=r.style.height='60px';
  rw.appendChild(r);
  r.addEventListener('animationend',function(){r.remove()});
});

/* ── FOREST PARTICLE CANVAS ── */
var fc=document.getElementById('fc');
if(fc){
  var ctx=fc.getContext('2d');
  var W,H,pts=[];
  var mouse={x:-999,y:-999};
  var COLS=['rgba(90,138,100,','rgba(61,102,68,','rgba(45,74,50,','rgba(139,96,64,','rgba(92,61,40,'];

  function resize(){W=fc.width=fc.offsetWidth;H=fc.height=fc.offsetHeight;}
  resize();
  window.addEventListener('resize',function(){resize();init();});

  function mkpt(){
    return{
      x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.5,vy:Math.random()*.6+.25,
      sz:Math.random()*4+2.5,
      rot:Math.random()*Math.PI*2,rv:(Math.random()-.5)*.018,
      sw:Math.random()*Math.PI*2,ss:Math.random()*.007+.003,sa:Math.random()*.5+.2,
      col:COLS[Math.floor(Math.random()*COLS.length)],
      al:Math.random()*.45+.12,
      sh:Math.floor(Math.random()*3)
    };
  }
  function init(){
    pts=[];
    var n=Math.floor(W*H/10000);
    for(var i=0;i<n;i++){var p=mkpt();p.y=Math.random()*H;pts.push(p);}
  }
  init();

  fc.addEventListener('mousemove',function(e){
    var r=fc.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });

  function draw(){
    ctx.clearRect(0,0,W,H);
    /* connections */
    for(var i=0;i<pts.length;i++){
      for(var j=i+1;j<pts.length;j++){
        var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
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
      ctx.fillStyle=p.col+p.al+')';
      ctx.beginPath();
      if(p.sh===0){ctx.ellipse(0,0,p.sz,p.sz*.45,0,0,Math.PI*2);}
      else if(p.sh===1){ctx.moveTo(0,-p.sz);ctx.lineTo(p.sz*.6,p.sz*.5);ctx.lineTo(-p.sz*.6,p.sz*.5);ctx.closePath();}
      else{ctx.moveTo(0,-p.sz*.9);ctx.lineTo(p.sz*.5,0);ctx.lineTo(0,p.sz*.65);ctx.lineTo(-p.sz*.5,0);ctx.closePath();}
      ctx.fill();ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── HERO NAME SCRAMBLE ── */
var CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&';
function scrambleEl(el,final,delay){
  var iv;
  setTimeout(function(){
    el.classList.add('hl','animate');
    var count=0,max=12;
    iv=setInterval(function(){
      el.textContent=CHARS[Math.floor(Math.random()*CHARS.length)];
      count++;if(count>=max){clearInterval(iv);el.textContent=final;}
    },55);
  },delay);
}
function buildWord(id,word,base){
  var el=document.getElementById(id);
  if(!el)return;
  var spans=[];
  for(var i=0;i<word.length;i++){
    var s=document.createElement('span');
    s.textContent=word[i];
    s.style.display='inline-block';
    spans.push(s);
    el.appendChild(s);
  }
  spans.forEach(function(s,i){
    scrambleEl(s,word[i],base+i*65);
  });
}
/* Replace existing text nodes with letter spans */
var hn=document.getElementById('hero-name');
if(hn){
  var hw1=hn.querySelector('.hw1');
  var hw2=hn.querySelector('.hw2');
  if(hw1){hw1.innerHTML='';buildWord('x1','Sardor',300);}
  if(hw2){hw2.innerHTML='';buildWord('x2','Murtazaev',650);}
  if(hw1){hw1.id='x1';}
  if(hw2){hw2.id='x2';}
}

/* ── 3D TILT ── */
document.querySelectorAll('.tc').forEach(function(card){
  var MAX=5;
  card.addEventListener('mousemove',function(e){
    var r=card.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-.5;
    var y=(e.clientY-r.top)/r.height-.5;
    card.style.transform='perspective(700px) rotateY('+(x*MAX*2)+'deg) rotateX('+(-y*MAX)+'deg) scale3d(1.012,1.012,1.012)';
    card.style.transition='transform .06s linear';
  });
  card.addEventListener('mouseleave',function(){
    card.style.transform='';
    card.style.transition='transform .4s cubic-bezier(.16,1,.3,1)';
  });
});

/* ── MAGNETIC ── */
document.querySelectorAll('.mag,.btn-p,.btn-g,.clink').forEach(function(el){
  var str=parseFloat(el.dataset.s)||22;
  el.addEventListener('mousemove',function(e){
    var r=el.getBoundingClientRect();
    var x=e.clientX-r.left-r.width/2;
    var y=e.clientY-r.top-r.height/2;
    el.style.transform='translate('+(x*str/r.width)+'px,'+(y*str/r.height)+'px)';
  });
  el.addEventListener('mouseleave',function(){el.style.transform='';});
});

/* ── NAV SCROLL + PROGRESS ── */
var nav=document.getElementById('nav');
var prog=document.getElementById('nav-prog');
window.addEventListener('scroll',function(){
  var sy=window.scrollY;
  var max=document.documentElement.scrollHeight-window.innerHeight;
  if(prog)prog.style.width=(max>0?(sy/max)*100:0)+'%';
  if(nav)nav.classList.toggle('stuck',sy>60);
},{passive:true});

/* ── SCROLL REVEAL (stagger siblings) ── */
var srs=document.querySelectorAll('.sr');
var srObs=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(!entry.isIntersecting)return;
    var parent=entry.target.parentElement;
    var sibs=parent?Array.from(parent.querySelectorAll('.sr')):[];
    var idx=sibs.indexOf(entry.target);
    var delay=idx*75;
    setTimeout(function(){entry.target.classList.add('in');},delay);
    srObs.unobserve(entry.target);
  });
},{threshold:.1,rootMargin:'0px 0px -35px 0px'});
srs.forEach(function(el){srObs.observe(el);});

/* ── STAT COUNTERS ── */
function easeOut(t){return 1-Math.pow(1-t,4);}
function counter(el){
  var t=parseInt(el.dataset.t,10);
  var dec=t===428;
  var dur=1800,st=performance.now();
  (function tick(now){
    var p=Math.min((now-st)/dur,1);
    var v=Math.round(easeOut(p)*t);
    el.textContent=dec?(v/100).toFixed(2):v;
    if(p<1)requestAnimationFrame(tick);
  })(st);
}
var cobs=new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting)return;
    counter(e.target);cobs.unobserve(e.target);
  });
},{threshold:.5});
document.querySelectorAll('.sn[data-t]').forEach(function(el){cobs.observe(el);});

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

})();
