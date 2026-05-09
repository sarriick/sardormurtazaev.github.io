/* ================================================
   FOREST NIGHT — main.js
   Effects:
   1. Custom cursor (ring + dot, lag)
   2. Click ripple
   3. Falling leaves / particles on canvas
   4. Hero letter scramble + split animation
   5. Magnetic buttons / links
   6. 3D card tilt on hover
   7. Nav scroll state + progress bar
   8. Scroll reveal (IntersectionObserver, stagger)
   9. Animated stat counters (easeOutQuart)
   10. Nav link hover (roll-up text)
   ================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. CUSTOM CURSOR
  ────────────────────────────────────────── */
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  (function tickCursor() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(tickCursor);
  })();

  document.querySelectorAll('a, button, .tilt-card, .magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('hovering'));
  });

  /* ──────────────────────────────────────────
     2. CLICK RIPPLE
  ────────────────────────────────────────── */
  const rippleCont = document.getElementById('ripple-container');
  document.addEventListener('click', e => {
    if (!rippleCont) return;
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left   = e.clientX + 'px';
    r.style.top    = e.clientY + 'px';
    r.style.width  = r.style.height = '80px';
    rippleCont.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });

  /* ──────────────────────────────────────────
     3. FALLING LEAVES / FOREST PARTICLES
  ────────────────────────────────────────── */
  const canvas = document.getElementById('forest-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, leaves = [], mouse = { x: -999, y: -999 };

    const LEAF_COLORS = [
      'rgba(90,138,100,',
      'rgba(61,102,68,',
      'rgba(45,74,50,',
      'rgba(139,96,64,',
      'rgba(92,61,40,',
      'rgba(176,128,96,',
    ];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initLeaves(); });

    function randLeaf() {
      return {
        x:  Math.random() * W,
        y:  Math.random() * H - H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 0.8 + 0.3,
        size: Math.random() * 5 + 3,
        rot:  Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.02,
        sway: Math.random() * Math.PI * 2,
        swayS: Math.random() * 0.008 + 0.004,
        swayA: Math.random() * 0.6 + 0.2,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        alpha: Math.random() * 0.5 + 0.15,
        shape: Math.floor(Math.random() * 3),
      };
    }

    function initLeaves() {
      leaves = [];
      const n = Math.floor(W * H / 12000);
      for (let i = 0; i < n; i++) {
        const l = randLeaf();
        l.y = Math.random() * H; // start scattered
        leaves.push(l);
      }
    }
    initLeaves();

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });

    function drawLeaf(l) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.alpha;
      ctx.fillStyle = l.color + l.alpha + ')';

      if (l.shape === 0) {
        // Oval leaf
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (l.shape === 1) {
        // Triangle leaf
        ctx.beginPath();
        ctx.moveTo(0, -l.size);
        ctx.lineTo(l.size * 0.6, l.size * 0.5);
        ctx.lineTo(-l.size * 0.6, l.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else {
        // Diamond
        ctx.beginPath();
        ctx.moveTo(0, -l.size * 0.9);
        ctx.lineTo(l.size * 0.5, 0);
        ctx.lineTo(0, l.size * 0.7);
        ctx.lineTo(-l.size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    // Connecting lines between close particles
    function drawConnections() {
      for (let i = 0; i < leaves.length; i++) {
        for (let j = i + 1; j < leaves.length; j++) {
          const dx = leaves[i].x - leaves[j].x;
          const dy = leaves[i].y - leaves[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(leaves[i].x, leaves[i].y);
            ctx.lineTo(leaves[j].x, leaves[j].y);
            ctx.strokeStyle = `rgba(61,102,68,${(1 - d/80) * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();

      leaves.forEach(l => {
        l.sway += l.swayS;
        l.x += l.vx + Math.sin(l.sway) * l.swayA;
        l.y += l.vy;
        l.rot += l.rotV;

        // Mouse repulsion
        const dx = l.x - mouse.x, dy = l.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          const f = (100 - dist) / 100 * 0.8;
          l.x += (dx / dist) * f;
          l.y += (dy / dist) * f;
        }

        if (l.y > H + 20) {
          l.y = -20;
          l.x = Math.random() * W;
        }
        if (l.x < -20) l.x = W + 20;
        if (l.x > W + 20) l.x = -20;

        drawLeaf(l);
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ──────────────────────────────────────────
     4. HERO LETTER SCRAMBLE + SPLIT ANIMATION
  ────────────────────────────────────────── */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';

  function scrambleLetter(el, finalChar, delay, duration) {
    let start = null;
    el.style.animationDelay = delay + 'ms';
    el.classList.add('hero-letter');

    const interval = setInterval(() => {
      el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      el.textContent = finalChar;
    }, delay + duration);
  }

  function splitWord(containerId, word, baseDelay) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    [...word].forEach((ch, i) => {
      if (ch === ' ') {
        el.appendChild(document.createTextNode('\u00A0'));
        return;
      }
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.animationDelay = (baseDelay + i * 60) + 'ms';
      span.classList.add('hero-letter');
      el.appendChild(span);
      scrambleLetter(span, ch, baseDelay + i * 60, 400);
    });
  }

  splitWord('word-sardor',    'Sardor',    200);
  splitWord('word-murtazaev', 'Murtazaev', 550);

  /* ──────────────────────────────────────────
     5. MAGNETIC BUTTONS / ELEMENTS
  ────────────────────────────────────────── */
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = parseFloat(el.dataset.strength) || 20;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      el.style.transform = `translate(${dx * strength / rect.width}px, ${dy * strength / rect.height}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ──────────────────────────────────────────
     6. 3D CARD TILT
  ────────────────────────────────────────── */
  document.querySelectorAll('.tilt-card').forEach(card => {
    const MAXDEG = 6;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * MAXDEG * 2}deg) rotateX(${-y * MAXDEG}deg) scale3d(1.015,1.015,1.015)`;
      card.style.transition = 'transform .05s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
    });
  });

  /* ──────────────────────────────────────────
     7. NAV: SCROLL STATE + PROGRESS BAR
  ────────────────────────────────────────── */
  const nav    = document.getElementById('nav');
  const navBar = document.getElementById('nav-bar');

  window.addEventListener('scroll', () => {
    const sy  = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (navBar) navBar.style.width = (max > 0 ? (sy / max) * 100 : 0) + '%';
    if (nav)    nav.classList.toggle('stuck', sy > 60);
  }, { passive: true });

  /* ──────────────────────────────────────────
     8. SCROLL REVEAL
  ────────────────────────────────────────── */
  const srEls = document.querySelectorAll('.sr-reveal');

  const srObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const parent = entry.target.parentElement;
      const siblings = parent ? [...parent.querySelectorAll('.sr-reveal')] : [];
      const idx   = siblings.indexOf(entry.target);
      const delay = idx * 80;
      setTimeout(() => entry.target.classList.add('in'), delay);
      srObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  srEls.forEach(el => srObs.observe(el));

  /* ──────────────────────────────────────────
     9. ANIMATED STAT COUNTERS
  ────────────────────────────────────────── */
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function runCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    // Special: 428 → display as 4.28
    const isDecimal = target === 428;
    const duration  = 1800;
    const start     = performance.now();

    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const v = Math.round(easeOutQuart(p) * target);
      el.textContent = isDecimal ? (v / 100).toFixed(2) : v;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  const ctrObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      runCounter(e.target);
      ctrObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-n[data-target]').forEach(el => ctrObs.observe(el));

  /* ──────────────────────────────────────────
     10. SMOOTH SCROLL
  ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

})();
