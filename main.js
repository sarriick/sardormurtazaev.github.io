/* =============================================
   main.js — All interactive effects
   - Custom cursor
   - Canvas particle field
   - Scroll reveal (IntersectionObserver)
   - Nav scroll state + progress bar
   - Mouse-parallax on hero orbs
   ============================================= */

(function () {
  'use strict';

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  let mx = -100, my = -100, cx = -100, cy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  function animateCursor() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ---------- PARTICLE CANVAS ---------- */
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }
  initParticles();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  const GOLD  = [200, 168, 92];
  const WHITE = [220, 215, 200];

  function drawParticles(ts) {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.pulse += 0.008;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.6;
        p.x += dx / dist * force;
        p.y += dy / dist * force;
      }

      const pulse = (Math.sin(p.pulse) + 1) / 2;
      const a = p.alpha * (0.6 + pulse * 0.4);
      const c = dist < 140 ? GOLD : WHITE;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + pulse * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx2 = p.x - q.x, dy2 = p.y - q.y;
        const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        if (d2 < 90) {
          const lineA = (1 - d2 / 90) * 0.08;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(200,168,92,${lineA})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }
  requestAnimationFrame(drawParticles);

  /* ---------- NAV SCROLL STATE + PROGRESS BAR ---------- */
  const nav      = document.getElementById('nav');
  const progress = document.getElementById('nav-progress');
  const heroEl   = document.getElementById('hero');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = docH > 0 ? (scrollTop / docH) * 100 : 0;
    progress.style.width = pct + '%';

    if (scrollTop > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('.sr-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.sr-reveal');
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 60;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* ---------- HERO PARALLAX (mouse-follow orbs) ---------- */
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const orb3 = document.querySelector('.hero-orb-3');

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    if (orb1) orb1.style.transform = `translate(${nx * 20}px, ${ny * 15}px)`;
    if (orb2) orb2.style.transform = `translate(${nx * -12}px, ${ny * -10}px)`;
    if (orb3) orb3.style.transform = `translate(${nx * 8}px, ${ny * 12}px)`;
  });

  /* ---------- SMOOTH NAV LINKS ---------- */
  document.querySelectorAll('.nav-links a, .hero-cta a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

})();
