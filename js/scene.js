/* ============================================================
   UChicago ACM — Three.js hero scene
   A drifting particle constellation in maroon/bone tones that
   reacts to the pointer and to scroll. Degrades to the CSS
   gradient if WebGL is unavailable.
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canvas || typeof THREE === 'undefined' || reduceMotion) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (err) {
    console.warn('WebGL unavailable, skipping hero scene:', err);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 9;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* ---- particle cloud ---- */
  const COUNT = window.innerWidth < 700 ? 900 : 2200;
  const SPREAD = 24;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);

  const maroon = new THREE.Color('#b8273f');
  const bone = new THREE.Color('#ede6e0');
  const deep = new THREE.Color('#800000');

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    const roll = Math.random();
    const c = roll < 0.55 ? maroon : roll < 0.8 ? deep : bone;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    seeds[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  /* ---- wireframe icosahedron accent ---- */
  const icoGeo = new THREE.IcosahedronGeometry(2.6, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xb8273f,
    wireframe: true,
    transparent: true,
    opacity: 0.14,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(4.5, 0.5, -2);
  scene.add(ico);

  /* ---- pointer + scroll state ---- */
  const target = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  let scrollDrift = 0;

  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollDrift = window.scrollY * 0.0012;
  }, { passive: true });

  /* ---- resize ---- */
  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---- render loop (paused when hero is off-screen) ---- */
  let heroVisible = true;
  const observer = new IntersectionObserver(
    (entries) => { heroVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  );
  observer.observe(canvas.parentElement);

  const clock = new THREE.Clock();
  const basePositions = positions.slice();

  function animate() {
    requestAnimationFrame(animate);
    if (!heroVisible) return;

    const t = clock.getElapsedTime();

    eased.x += (target.x - eased.x) * 0.04;
    eased.y += (target.y - eased.y) * 0.04;

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      pos[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(t * 0.4 + s) * 0.35;
      pos[i * 3] = basePositions[i * 3] + Math.cos(t * 0.3 + s * 1.7) * 0.25;
    }
    geometry.attributes.position.needsUpdate = true;

    points.rotation.y = eased.x * 0.12 + t * 0.015;
    points.rotation.x = eased.y * 0.08 - scrollDrift;

    ico.rotation.x = t * 0.12;
    ico.rotation.y = t * 0.16;
    ico.position.y = 0.5 + Math.sin(t * 0.5) * 0.3;

    camera.position.x += (eased.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (-eased.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();
