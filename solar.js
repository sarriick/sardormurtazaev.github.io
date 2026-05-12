/* solar.js — 3D Solar System with scroll-driven camera */
(function () {
  'use strict';

  var canvas = document.getElementById('solar-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ─── RENDERER ─── */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;

  /* ─── SCENE ─── */
  var scene = new THREE.Scene();

  /* ─── CAMERA ─── */
  var cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  cam.position.set(0, 55, 130);
  cam.lookAt(0, 0, 0);

  /* ─── RESIZE ─── */
  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
  });

  /* ─── HELPERS ─── */
  function hex(h) { return new THREE.Color(h); }

  /* ─── STARS ─── */
  (function buildStars() {
    var geo = new THREE.BufferGeometry();
    var n = 2800;
    var pos = new Float32Array(n * 3);
    var col = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var r = 400 + Math.random() * 600;
      var theta = Math.random() * Math.PI * 2;
      var phi   = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      /* warm/cool star colors */
      var warm = Math.random() > 0.5;
      col[i*3]   = warm ? 0.95 : 0.75;
      col[i*3+1] = warm ? 0.88 : 0.82;
      col[i*3+2] = warm ? 0.70 : 1.00;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(geo, mat));
  })();

  /* ─── SUN ─── */
  var sunGeo = new THREE.SphereGeometry(9, 40, 40);
  var sunMat = new THREE.MeshBasicMaterial({ color: hex('#f5c842') });
  var sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  /* Sun glow – three nested transparent spheres */
  [14, 18, 24].forEach(function (r, i) {
    var g = new THREE.SphereGeometry(r, 32, 32);
    var m = new THREE.MeshBasicMaterial({
      color: hex('#f5c842'),
      transparent: true,
      opacity: [0.12, 0.07, 0.03][i],
      side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(g, m));
  });

  /* Sun point light */
  var sunLight = new THREE.PointLight(0xffe8a0, 2.2, 400);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x111820, 1.2));

  /* ─── ORBIT RING HELPER ─── */
  function makeOrbit(radius) {
    var pts = [];
    for (var i = 0; i <= 128; i++) {
      var a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var mat = new THREE.LineBasicMaterial({ color: 0x2d4a32, transparent: true, opacity: 0.25 });
    return new THREE.Line(geo, mat);
  }

  /* ─── PLANET FACTORY ─── */
  /* Forest Night palette: greens, browns, creams for planets */
  var PLANET_DATA = [
    /* name,  radius, orbitR, speed,    color,     tilt,  rings */
    ['merc',   1.4,   18,   0.0180,  '#8a6a50',  0.0,   false],
    ['venus',  2.2,   28,   0.0130,  '#c8a87a',  0.0,   false],
    ['earth',  2.4,   40,   0.0100,  '#4a7a5a',  0.41,  false],
    ['mars',   1.8,   54,   0.0080,  '#8b4a3a',  0.44,  false],
    ['jup',    5.5,   78,   0.0042,  '#b08060',  0.05,  false],
    ['sat',    4.5,   102,  0.0030,  '#c8a060',  0.47,  true ],
    ['uran',   3.2,   126,  0.0020,  '#5a8a7a',  1.71,  true ],
    ['nept',   3.0,   150,  0.0015,  '#3a5a8a',  0.49,  false],
  ];

  var planets = [];

  PLANET_DATA.forEach(function (d) {
    var name = d[0], prad = d[1], orbitR = d[2], speed = d[3],
        color = d[4], tilt = d[5], hasRings = d[6];

    /* Orbit ring */
    scene.add(makeOrbit(orbitR));

    /* Planet group (pivot for orbit) */
    var pivot = new THREE.Object3D();
    pivot.rotation.z = tilt;
    scene.add(pivot);

    /* Planet mesh */
    var geo = new THREE.SphereGeometry(prad, 28, 28);
    var mat = new THREE.MeshPhongMaterial({
      color: hex(color),
      shininess: 25,
      specular: new THREE.Color(0x222222)
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = orbitR;
    pivot.add(mesh);

    /* Rings (Saturn / Uranus) */
    if (hasRings) {
      var rInner = prad * 1.5, rOuter = prad * 2.6;
      var rgeo = new THREE.RingGeometry(rInner, rOuter, 64);
      /* rotate ring to lie flat around planet */
      rgeo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
      var rmat = new THREE.MeshBasicMaterial({
        color: name === 'sat' ? hex('#c8a060') : hex('#5a8a7a'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45
      });
      var ring = new THREE.Mesh(rgeo, rmat);
      mesh.add(ring);
    }

    /* Moon for Earth */
    if (name === 'earth') {
      var moonPivot = new THREE.Object3D();
      mesh.add(moonPivot);
      var mGeo = new THREE.SphereGeometry(0.65, 16, 16);
      var mMat = new THREE.MeshPhongMaterial({ color: hex('#aaaaaa') });
      var moon = new THREE.Mesh(mGeo, mMat);
      moon.position.x = 4;
      moonPivot.add(moon);
      pivot._moonPivot = moonPivot;
    }

    pivot._angle = Math.random() * Math.PI * 2; /* random start angle */
    pivot._speed = speed;
    pivot._orbitR = orbitR;
    pivot._mesh = mesh;

    planets.push(pivot);
  });

  /* ─── ASTEROID BELT ─── */
  (function buildBelt() {
    var geo = new THREE.BufferGeometry();
    var n = 500;
    var pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var r = 63 + (Math.random() - 0.5) * 10;
      var a = Math.random() * Math.PI * 2;
      var y = (Math.random() - 0.5) * 2;
      pos[i*3]   = Math.cos(a) * r;
      pos[i*3+1] = y;
      pos[i*3+2] = Math.sin(a) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: 0x5c4030, size: 0.4, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(geo, mat));
  })();

  /* ─── SCROLL-DRIVEN CAMERA ─── */
  /*
    Technique from Jungle/Moon parallax repos:
    read window.scrollY, map to 0-1 progress,
    then interpolate camera position + lookAt angle.

    Camera path:
      progress=0   → high overview angle   (55, 55, 130)
      progress=0.3 → side view             (130, 20, 60)
      progress=0.6 → low sweep             (80, -30, 110)
      progress=1   → top-down              (0, 180, 5)
  */
  var CAM_PATH = [
    { pos: [0,   55, 130], look: [0, 0, 0] },
    { pos: [110, 25,  70], look: [0, 0, 0] },
    { pos: [-80, -20, 100], look: [0, 0, 0] },
    { pos: [10, 160,  15], look: [0, 0, 0] },
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function getCamForProgress(p) {
    /* p in [0,1] -> index in path */
    var segments = CAM_PATH.length - 1;
    var raw = p * segments;
    var idx = Math.floor(raw);
    var frac = raw - idx;
    if (idx >= segments) { idx = segments - 1; frac = 1; }
    var a = CAM_PATH[idx], b = CAM_PATH[idx + 1];
    return {
      x: lerp(a.pos[0], b.pos[0], frac),
      y: lerp(a.pos[1], b.pos[1], frac),
      z: lerp(a.pos[2], b.pos[2], frac),
    };
  }

  var scrollProgress = 0;
  var camTarget = { x: 0, y: 55, z: 130 };
  var camCurrent = { x: 0, y: 55, z: 130 };

  window.addEventListener('scroll', function () {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    var t = getCamForProgress(scrollProgress);
    camTarget.x = t.x; camTarget.y = t.y; camTarget.z = t.z;
  }, { passive: true });

  /* ─── ANIMATE LOOP ─── */
  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var dt = clock.getDelta();
    var elapsed = clock.getElapsedTime();

    /* Orbit planets */
    planets.forEach(function (pivot) {
      pivot._angle += pivot._speed;
      pivot._mesh.position.x = Math.cos(pivot._angle) * pivot._orbitR;
      pivot._mesh.position.z = Math.sin(pivot._angle) * pivot._orbitR;
      pivot._mesh.rotation.y += 0.008;
      if (pivot._moonPivot) pivot._moonPivot.rotation.y += 0.04;
    });

    /* Rotate sun slowly */
    sun.rotation.y += 0.002;

    /* Subtle sun pulse */
    var pulse = 1 + Math.sin(elapsed * 1.2) * 0.015;
    sun.scale.setScalar(pulse);

    /* Smooth camera interpolation (Jungle-style: value * coefficient) */
    camCurrent.x += (camTarget.x - camCurrent.x) * 0.025;
    camCurrent.y += (camTarget.y - camCurrent.y) * 0.025;
    camCurrent.z += (camTarget.z - camCurrent.z) * 0.025;

    cam.position.set(camCurrent.x, camCurrent.y, camCurrent.z);
    cam.lookAt(0, 0, 0);

    /* Scene opacity: slightly fade when far scrolled so content is readable */
    var alpha = 1 - scrollProgress * 0.55;
    renderer.domElement.style.opacity = Math.max(0.25, alpha);

    renderer.render(scene, cam);
  }

  animate();

})();
