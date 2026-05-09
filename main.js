(function () {
  'use strict';

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor    = document.getElementById('cursor');
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
    if (cursor) { cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ---------- PARTICLE CANVAS ---------- */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouse = { x: -999, y: -999 };

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    function initParticles() {
      particles = [];
      const count = Math.floor((W * H) / 13000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.2 + 0.3,
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
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += 0.008;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.6;
          p.x += dx / dist * force; p.y += dy / dist * force;
        }

        const pulse = (Math.sin(p.pulse) + 1) / 2;
        const a = p.alpha * (0.6 + pulse * 0.4);
        const c = dist < 140 ? [200, 168, 92] : [220, 215, 200];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + pulse * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx2 = p.x - q.x, dy2 = p.y - q.y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(200,168,92,${(1 - d2 / 90) * 0.08})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);
  }

  /* ---------- NAV SCROLL + PROGRESS BAR ---------- */
  const nav      = document.getElementById('nav');
  const progress = document.getElementById('nav-progress');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (docH > 0 ? (scrollTop / docH) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('scrolled', scrollTop > 60);
  }, { passive: true });

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('.sr-reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger siblings
      const parent = entry.target.parentElement;
      const siblings = parent ? parent.querySelectorAll('.sr-reveal') : [];
      let delay = 0;
      siblings.forEach((sib, idx) => { if (sib === entry.target) delay = idx * 70; });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ---------- ANIMATED COUNTERS (like Artel stats) ---------- */
  const statNums = document.querySelectorAll('.stat-num[data-target]');

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuart(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => counterObs.observe(el));

  /* ---------- HERO PARALLAX ORBS ---------- */
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

  /* ---------- SMOOTH NAV SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

})();
