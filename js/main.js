/* ============================================================
   UChicago ACM — interactions
   Preloader, Lenis smooth scroll, GSAP scroll choreography,
   custom cursor, magnetic buttons, accordions, marquee.
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  if (reduceMotion || !hasGsap) {
    document.documentElement.classList.add('reduced-motion');
    const pre = document.getElementById('preloader');
    if (pre) pre.remove();
    if (hasGsap) gsap.set('[data-reveal]', { opacity: 1, y: 0 });
    initAccordions(true);
    initNav(null);
    initForm();
    initFooterYear();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ============ LENIS SMOOTH SCROLL ============ */
  const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ============ SPLIT HERO WORDS INTO CHARS ============ */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const chars = el.textContent.split('');
    el.textContent = '';
    chars.forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      el.appendChild(span);
    });
  });

  /* ============ PRELOADER → HERO INTRO ============ */
  const intro = gsap.timeline({
    onComplete: () => {
      const pre = document.getElementById('preloader');
      if (pre) pre.remove();
      ScrollTrigger.refresh();
    },
  });

  const counter = { value: 0 };
  const countEl = document.getElementById('preloader-count');

  intro
    .to('.preloader-char', {
      y: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out',
    })
    .to('.preloader-partner-mark, .preloader-visa', {
      opacity: 1, y: 0, duration: 0.85, stagger: 0.08, ease: 'expo.out',
    }, '<0.12')
    .to('#preloader-bar', {
      scaleX: 1, duration: 1.4, ease: 'power2.inOut',
    }, '<0.2')
    .to(counter, {
      value: 100, duration: 1.4, ease: 'power2.inOut',
      onUpdate: () => {
        if (countEl) countEl.textContent = String(Math.round(counter.value)).padStart(2, '0');
      },
    }, '<')
    .to('.preloader-inner', { opacity: 0, y: -30, duration: 0.45, ease: 'power2.in' })
    .to('.preloader-curtain', { scaleY: 1, duration: 0.55, ease: 'expo.inOut' }, '<0.1')
    .set('.preloader-curtain', { transformOrigin: 'top' })
    .set('.preloader', { background: 'transparent', pointerEvents: 'none' })
    .to('.preloader-curtain', { scaleY: 0, duration: 0.7, ease: 'expo.inOut' })
    /* hero entrance rides the curtain lift */
    .from('.hero-word .char', {
      yPercent: 115, duration: 1.1, ease: 'expo.out',
      stagger: { each: 0.022, from: 'start' },
    }, '-=0.45')
    .from('.hero-overline', { opacity: 0, x: -24, duration: 0.7, ease: 'power3.out' }, '-=0.8')
    .from('.hero-sub', { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out' }, '-=0.6')
    .from('.hero-actions .btn', { opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, '-=0.5')
    .from('.nav', { yPercent: -100, opacity: 0, duration: 0.7, ease: 'expo.out' }, '-=0.7')
    .from('.hero-meta, .scroll-hint', { opacity: 0, duration: 0.8 }, '-=0.4');

  /* ============ HERO PARALLAX OUT ============ */
  gsap.to('.hero-content', {
    yPercent: -18, opacity: 0.25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ============ SECTION TITLE REVEALS ============ */
  document.querySelectorAll('[data-reveal-title]').forEach((title) => {
    gsap.from(title, {
      opacity: 0, y: 60, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: title, start: 'top 85%' },
    });
  });

  /* ============ GENERIC REVEALS (staggered per section) ============ */
  document.querySelectorAll('.section, .footer').forEach((section) => {
    const items = section.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    gsap.to(items, {
      opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.09,
      scrollTrigger: { trigger: section, start: 'top 72%' },
    });
  });

  /* ============ STAT COUNTERS ============ */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => { el.textContent = Math.round(obj.v); },
    });
  });

  /* ============ MARQUEE (duplicate + infinite drift + scroll skew) ============ */
  const track = document.getElementById('marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML;
    const half = track.scrollWidth / 2;
    gsap.to(track, {
      x: -half, duration: 28, ease: 'none', repeat: -1,
      modifiers: { x: (x) => `${parseFloat(x) % half}px` },
    });
    let skewSetter = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power2.out' });
    lenis.on('scroll', ({ velocity }) => skewSetter(gsap.utils.clamp(-8, 8, velocity * 0.4)));
  }

  /* ============ FOOTER BIG TEXT DRIFT ============ */
  gsap.to('#footer-big-text', {
    xPercent: -25, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
  });

  /* ============ CURSOR ============ */
  initCursor();

  /* ============ MAGNETIC ELEMENTS ============ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.35);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ============ OFFICER CARD TILT ============ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 800 });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * 7);
        ry(px * 7);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ============ REST ============ */
  initAccordions(false);
  initNav(lenis);
  initForm();
  initFooterYear();

  /* ============================================================ helpers */

  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.body.classList.add('custom-cursor');
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const dotX = gsap.quickTo(dot, 'left', { duration: 0.08, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'top', { duration: 0.08, ease: 'power2.out' });
    const ringX = gsap.quickTo(ring, 'left', { duration: 0.35, ease: 'power2.out' });
    const ringY = gsap.quickTo(ring, 'top', { duration: 0.35, ease: 'power2.out' });

    window.addEventListener('pointermove', (e) => {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });

    document.querySelectorAll('[data-cursor="hover"], a, button, input, select, textarea, .committee-head').forEach((el) => {
      el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
    });
  }

  function initAccordions(instant) {
    document.querySelectorAll('.committee').forEach((committee, i) => {
      const head = committee.querySelector('.committee-head');
      const body = committee.querySelector('.committee-body');

      const open = () => {
        committee.classList.add('is-open');
        if (instant || !hasGsap) { body.style.height = 'auto'; return; }
        gsap.to(body, {
          height: body.querySelector('.committee-body-inner').offsetHeight,
          duration: 0.7, ease: 'expo.out',
          onComplete: () => { body.style.height = 'auto'; ScrollTrigger.refresh(); },
        });
      };
      const close = () => {
        committee.classList.remove('is-open');
        if (instant || !hasGsap) { body.style.height = '0px'; return; }
        gsap.to(body, {
          height: 0, duration: 0.55, ease: 'expo.inOut',
          onComplete: () => ScrollTrigger.refresh(),
        });
      };

      head.addEventListener('click', () => {
        committee.classList.contains('is-open') ? close() : open();
      });

      if (i === 0) open(); // first committee starts expanded
    });
  }

  function initNav(lenisInstance) {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('nav-burger');
    const overlay = document.getElementById('menu-overlay');
    let menuOpen = false;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });

    // anchor scrolling through Lenis (falls back to native)
    document.querySelectorAll('a[href^="#"], .back-top').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const target = href ? document.querySelector(href) : document.body;
        if (!target && !link.classList.contains('back-top')) return;
        e.preventDefault();
        if (menuOpen) toggleMenu();
        const dest = link.classList.contains('back-top') ? 0 : target;
        if (lenisInstance) lenisInstance.scrollTo(dest, { offset: -108, duration: 1.4 });
        else (dest === 0 ? window.scrollTo({ top: 0, behavior: 'smooth' }) : target.scrollIntoView({ behavior: 'smooth' }));
      });
    });

    // active link tracking
    if (hasGsap && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
      document.querySelectorAll('main section[id]').forEach((section) => {
        ScrollTrigger.create({
          trigger: section, start: 'top 50%', end: 'bottom 50%',
          onToggle: (self) => {
            if (!self.isActive) return;
            document.querySelectorAll('.nav-link').forEach((l) =>
              l.classList.toggle('is-active', l.getAttribute('href') === `#${section.id}`));
          },
        });
      });
    }

    function toggleMenu() {
      menuOpen = !menuOpen;
      burger.classList.toggle('is-open', menuOpen);
      burger.setAttribute('aria-expanded', String(menuOpen));
      overlay.setAttribute('aria-hidden', String(!menuOpen));
      if (hasGsap && !reduceMotion) {
        if (menuOpen) {
          gsap.set(overlay, { visibility: 'visible' });
          gsap.to(overlay, { clipPath: 'inset(0% 0 0% 0)', duration: 0.7, ease: 'expo.inOut' });
          gsap.fromTo('.menu-link',
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, delay: 0.25, ease: 'expo.out' });
          lenisInstance && lenisInstance.stop();
        } else {
          gsap.to(overlay, {
            clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut',
            onComplete: () => gsap.set(overlay, { visibility: 'hidden' }),
          });
          lenisInstance && lenisInstance.start();
        }
      } else {
        overlay.style.visibility = menuOpen ? 'visible' : 'hidden';
        overlay.style.clipPath = menuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)';
      }
    }
    burger.addEventListener('click', toggleMenu);
  }

  function initForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = '— please fill in every field';
        form.reportValidity();
        return;
      }
      const name = encodeURIComponent(form.name.value.trim());
      const subject = encodeURIComponent(form.subject.value);
      const message = encodeURIComponent(form.message.value.trim());
      const email = encodeURIComponent(form.email.value.trim());
      window.location.href =
        `mailto:uchicagoacm@gmail.com?subject=${subject}%20—%20${name}&body=${message}%0A%0AFrom:%20${name}%20(${email})`;
      status.textContent = '— opening your mail client…';
    });
  }

  function initFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }
})();
