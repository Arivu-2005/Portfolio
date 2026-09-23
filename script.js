/* =====================================================
   PORTFOLIO SCRIPT — Arivazhagan M
   One file, one job per section. Edit CONFIG and CASES
   below; you should not need to touch anything else.
===================================================== */
(function () {
  'use strict';

  /* ---------- SETTINGS YOU CAN EDIT ---------- */
  const CONFIG = {
    // The contact form opens the visitor's email app addressed to this email.
    CONTACT_EMAIL: 'arivazhaganm.dev@gmail.com',

    // OPTIONAL: to send messages straight from the website (no email app),
    // create a free form at https://formspree.io and paste its URL here,
    // e.g. 'https://formspree.io/f/abcdwxyz'. Leave '' to use the email app.
    FORM_ENDPOINT: ''
  };

  // Text shown in the case-study popup (key = data-project in index.html)
  const CASES = {
    glauco:   { problem: 'Glaucoma is often detected late because screening needs specialist review of retinal images.',
                solution: 'A Vision Transformer model classifies retinal images, served through a Flask web app for quick upload and result viewing.',
                tech: 'Python, Vision Transformer, Flask',
                features: 'Image upload, AI prediction, simple result dashboard' },
    foodic:   { problem: 'Ordering food online needs a fast, reliable flow from menu to checkout.',
                solution: 'A MERN-style platform with a React frontend and a Node/Express API backed by MongoDB.',
                tech: 'React, Node.js, Express, MongoDB',
                features: 'Menu browsing, cart, order management, REST API' },
    mann:     { problem: 'Small sellers need an easy storefront for showing products online.',
                solution: 'A responsive e-commerce site focused on product browsing and shopping functionality.',
                tech: 'HTML, CSS, JavaScript',
                features: 'Product listing, cart, responsive layout' },
    employee: { problem: 'Paper or spreadsheet employee records are hard to search and keep consistent.',
                solution: 'A Python application that stores and manages employee records in a SQL database.',
                tech: 'Python, SQL',
                features: 'Add, update, delete and search employee records' },
    atm:      { problem: 'Learning how banking logic works needs a safe, realistic practice project.',
                solution: 'An object-oriented Python program that simulates common ATM operations.',
                tech: 'Python, OOP',
                features: 'PIN check, balance, deposit, withdraw' },
    weather:  { problem: 'People want quick weather details without noisy websites.',
                solution: 'A responsive app that fetches live weather data from a REST API.',
                tech: 'JavaScript, REST API',
                features: 'City search, live conditions, responsive design' }
  };

  const CATEGORY_LABELS = { ai: 'AI / ML', fullstack: 'Full stack', python: 'Python', web: 'Web' };

  /* ---------- HELPERS ---------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  // Safe listener: if an element is missing, nothing crashes and the rest of the site still works.
  const on = (el, type, fn) => { if (el) el.addEventListener(type, fn); };

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover     = matchMedia('(hover: hover)').matches;

  /* ---------- TOAST MESSAGE ---------- */
  const toastBox  = $('#messageBox');
  const toastText = $('#toastText');
  let toastTimer;

  function toast(message) {
    if (!toastBox || !toastText) return;
    toastText.textContent = message;
    toastBox.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastBox.classList.remove('show'), 2600);
  }

  /* ---------- 1. DARK / LIGHT THEME ---------- */
  const root     = document.documentElement;
  const themeBtn = $('#themeBtn');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (!themeBtn) return;
    const isDark = theme === 'dark';
    themeBtn.textContent = isDark ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  on(themeBtn, 'click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: ignore */ }
  });

  /* ---------- 2. MOBILE MENU ---------- */
  const menuBtn = $('#menuBtn');
  const navMenu = $('#navMenu');

  function setMenu(open) {
    if (!menuBtn || !navMenu) return;
    navMenu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuBtn.textContent = open ? '✕' : '☰';
  }

  on(menuBtn, 'click', () => setMenu(!navMenu.classList.contains('open')));
  $$('a', navMenu).forEach(link => on(link, 'click', () => setMenu(false)));
  on(document, 'click', e => {
    if (navMenu && menuBtn && !navMenu.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });

  /* ---------- 3. ACTIVE LINK WHILE SCROLLING ---------- */
  const navLinks = $$('a[href^="#"]', navMenu);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => spy.observe(s));
  }

  /* ---------- 4. REVEAL ON SCROLL ---------- */
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); reveal.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(el => reveal.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('in'));   // very old browsers: just show everything
  }

  /* ---------- 5. 3D CUBE FOLLOWS THE MOUSE ---------- */
  const rig = $('#rig');
  if (rig && !reduceMotion && canHover) {
    on(window, 'mousemove', e => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      rig.style.setProperty('--ry', (x * 30) + 'deg');
      rig.style.setProperty('--rx', (-18 - y * 22) + 'deg');
    });
  }

  /* ---------- 6. 3D TILT CARDS ---------- */
  if (!reduceMotion && canHover) {
    $$('.tilt').forEach(card => {
      on(card, 'mousemove', e => {
        const r  = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top)  / r.height;
        card.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-4px)`;
        card.style.setProperty('--gx', (px * 100) + '%');
        card.style.setProperty('--gy', (py * 100) + '%');
      });
      on(card, 'mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 7. PROJECT FILTER BUTTONS ---------- */
  const filterBtns   = $$('.filter');
  const projectCards = $$('.project');

  filterBtns.forEach(btn => on(btn, 'click', () => {
    filterBtns.forEach(b => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    const wanted = btn.dataset.filter;
    projectCards.forEach(card => card.classList.toggle('hide', wanted !== 'all' && card.dataset.cat !== wanted));
  }));

  /* ---------- 8. MISSING PROJECT IMAGES ---------- */
  // If an image file is not found, remove it so the gradient + title fallback shows.
  $$('.project-img img').forEach(img => {
    const drop = () => img.remove();
    on(img, 'error', drop);
    if (img.complete && img.naturalWidth === 0) drop();
  });

  /* ---------- 9. LINKS THAT ARE STILL "#" ---------- */
  on(document, 'click', e => {
    const link = e.target.closest ? e.target.closest('a.ext-link') : null;
    if (link && link.getAttribute('href') === '#') {
      e.preventDefault();
      toast('This link has not been added yet.');
    }
  });

  /* ---------- 10. CASE-STUDY POPUP ---------- */
  const modal    = $('#modal');
  const closeBtn = $('#closeModal');
  let lastFocus  = null;

  function openModal(card) {
    const info = CASES[card.dataset.project];
    if (!modal || !info) return;

    lastFocus = document.activeElement;
    $('#mCat').textContent      = CATEGORY_LABELS[card.dataset.cat] || '';
    $('#mTitle').textContent    = $('h3', card).textContent;
    $('#mProblem').textContent  = info.problem;
    $('#mSolution').textContent = info.solution;
    $('#mTech').textContent     = info.tech;
    $('#mFeatures').textContent = info.features;

    // Reuse the links from the card, so you only edit them in one place.
    $('#mCode').setAttribute('href', $('.link-code', card).getAttribute('href'));
    $('#mDemo').setAttribute('href', $('.link-demo', card).getAttribute('href'));

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  $$('.case').forEach(btn => on(btn, 'click', () => openModal(btn.closest('.project'))));
  on(closeBtn, 'click', closeModal);
  on(modal, 'click', e => { if (e.target === modal) closeModal(); });   // click the dark backdrop

  // Keyboard: Esc closes; Tab stays inside the popup while it is open.
  on(document, 'keydown', e => {
    const modalOpen = modal && modal.classList.contains('open');

    if (e.key === 'Escape') {
      if (modalOpen) closeModal(); else setMenu(false);
      return;
    }
    if (e.key === 'Tab' && modalOpen) {
      const items = $$('button, a[href]', modal);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- 11. COPY BUTTONS (email / phone) ---------- */
  function legacyCopy(text) {
    const box = document.createElement('textarea');
    box.value = text;
    box.setAttribute('readonly', '');
    box.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand('copy');
    box.remove();
    if (!ok) throw new Error('copy failed');
  }

  $$('.copy-button').forEach(btn => on(btn, 'click', async () => {
    const text = btn.dataset.copy || '';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else legacyCopy(text);
      toast('Copied to clipboard');
    } catch (err) {
      toast('Could not copy. Please copy it manually.');
    }
  }));

  /* ---------- 12. CONTACT FORM ---------- */
  const form = $('#contactForm');
  const note = $('#formNote');

  on(form, 'submit', async e => {
    e.preventDefault();

    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const subject = $('#subject').value.trim() || 'Message from your portfolio';
    const message = $('#message').value.trim();

    if (!name || !email || !message) {
      note.textContent = 'Please fill in your name, email and message.';
      return;
    }
    if (!$('#email').checkValidity()) {
      note.textContent = 'Please enter a valid email address.';
      return;
    }

    // Option A: send from the website using a form service (Formspree)
    if (CONFIG.FORM_ENDPOINT) {
      const sendBtn = $('.send-button', form);
      sendBtn.disabled = true;
      note.textContent = 'Sending…';
      try {
        const res = await fetch(CONFIG.FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        note.textContent = '';
        toast('Message sent successfully!');
      } catch (err) {
        note.textContent = 'Could not send the message. Please email me directly.';
      } finally {
        sendBtn.disabled = false;
      }
      return;
    }

    // Option B (default): open the visitor's email app with everything filled in
    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href =
      `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Opening your email app…';
    toast('Opening your email app');
    form.reset();
  });

  /* ---------- 13. FOOTER YEAR ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();