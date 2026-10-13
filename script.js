/* ==========================================================================
   Arivazhagan M | Portfolio interactions
   No dependencies. Every feature degrades gracefully if something is missing.
   ========================================================================== */
(function () {
    'use strict';

    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    var EMAIL = 'ariv@gmail.com';   // <-- change your email here (also update the mailto/text in index.html for no-JS visitors)
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var body = document.body;
    var root = document.documentElement;

    function store(get, key, val) {
        try { return get ? localStorage.getItem(key) : localStorage.setItem(key, val); } catch (e) { return null; }
    }

    /* ---------- Email (single source of truth) ---------- */
    $$('[data-email-link]').forEach(function (a) {
        a.setAttribute('href', 'mailto:' + EMAIL);
        if (a.hasAttribute('data-email-text')) a.textContent = EMAIL;
    });

    /* ---------- Toast ---------- */
    var toastEl = $('#toast'), toastTimer;
    function toast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3600);
    }

    /* ---------- Theme ---------- */
    var themeBtn = $('#themeBtn');
    function applyTheme(t) {
        root.setAttribute('data-theme', t);
        var meta = $('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', t === 'light' ? '#eef3ef' : '#04171a');
        if (themeBtn) {
            var next = t === 'light' ? 'dark' : 'light';
            themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
            themeBtn.setAttribute('title', 'Switch to ' + next + ' theme');
        }
    }
    function toggleTheme() {
        var t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(t);
        store(false, 'av-theme', t);
        toast(t === 'light' ? 'Light theme on' : 'Dark theme on');
    }
    applyTheme(store(true, 'av-theme') === 'light' ? 'light' : 'dark');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    /* ---------- Counting numbers ---------- */
    function countUp(el, to, decimals, suffix, dur) {
        decimals = decimals || 0; suffix = suffix || '';
        if (reduced) { el.textContent = to.toFixed(decimals) + suffix; return; }
        var start = performance.now();
        (function step(now) {
            var t = Math.min(1, (now - start) / dur);
            var e = 1 - Math.pow(1 - t, 4);
            el.textContent = (to * e).toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(step);
        })(start);
    }

    /* ---------- Loader (cinematic intro) ---------- */
    var loader = $('#loader'), bar = $('#loaderBar'), count = $('#loaderCount');
    var started = false;

    function startSite() {
        if (started) return;
        started = true;
        body.classList.add('is-ready');
        $$('.hero-facts dd').forEach(function (el, i) {
            var to = parseFloat(el.getAttribute('data-count'));
            var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
            if (isNaN(to)) return;
            setTimeout(function () { countUp(el, to, dec, '', 1600); }, 1000 + i * 120);
        });
        initObservers();
    }

    function runLoader() {
        if (!loader) { body.classList.remove('is-loading'); startSite(); return; }

        var seen = false;
        try { seen = sessionStorage.getItem('av-intro') === '1'; } catch (e) {}
        var dur = reduced ? 350 : (seen ? 1200 : 3000);
        var pageLoaded = document.readyState === 'complete';
        window.addEventListener('load', function () { pageLoaded = true; });

        var t0 = performance.now(), shown = 0, finished = false;

        function finish() {
            if (finished) return;
            finished = true;
            bar.style.transform = 'scaleX(1)';
            count.textContent = '100';
            try { sessionStorage.setItem('av-intro', '1'); } catch (e) {}
            setTimeout(function () {
                loader.classList.add('is-done');
                body.classList.remove('is-loading');
                setTimeout(startSite, reduced ? 0 : 750);
                setTimeout(function () { loader.remove(); }, reduced ? 100 : 2200);
            }, reduced ? 0 : 400);
        }

        (function frame(now) {
            if (finished) return;
            var t = Math.min(1, (now - t0) / dur);
            var p = 100 * (1 - Math.pow(1 - t, 3));
            if (!pageLoaded) p = Math.min(p, 90);
            shown = Math.max(shown, p);
            bar.style.transform = 'scaleX(' + (shown / 100) + ')';
            count.textContent = String(Math.round(shown));
            if ((t >= 1 && pageLoaded) || now - t0 > 9000) { finish(); return; }
            requestAnimationFrame(frame);
        })(t0);
    }

    /* ---------- Observers: reveal, skill bars, active nav ---------- */
    function initObservers() {
        // Scroll reveal (simple fade)
        var revealEls = $$('.reveal');
        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
            revealEls.forEach(function (el) { io.observe(el); });

            // Skill bars
            var skillIO = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting) return;
                    var bar = $('[data-level]', en.target), pct = $('[data-pct]', en.target);
                    var lvl = parseInt(bar.getAttribute('data-level'), 10) || 0;
                    bar.style.width = lvl + '%';
                    setTimeout(function () { bar.classList.add('filled'); }, 1500);
                    if (pct) countUp(pct, lvl, 0, '%', 1500);
                    skillIO.unobserve(en.target);
                });
            }, { threshold: 0.4 });
            $$('.skill-bar').forEach(function (el) { skillIO.observe(el); });
        } else {
            revealEls.forEach(function (el) { el.classList.add('in'); });
            $$('[data-level]').forEach(function (b) { b.style.width = b.getAttribute('data-level') + '%'; });
        }
    }

    // Active section in nav
    var navLinks = $$('.nav-links a');
    if ('IntersectionObserver' in window) {
        var secIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                navLinks.forEach(function (a) {
                    var on = a.getAttribute('href') === '#' + en.target.id;
                    a.classList.toggle('active', on);
                    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('main section[id]').forEach(function (s) { secIO.observe(s); });
    }

    /* ---------- Scroll: navbar, progress, timeline, back-to-top ---------- */
    var navbar = $('#navbar'), progress = $('#scrollProgress'), toTop = $('#backToTop');
    var timeline = $('#timeline'), tFill = $('#timelineFill');
    var lastY = window.scrollY, ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
        navbar.classList.toggle('scrolled', y > 24);
        var menuOpen = body.classList.contains('nav-open');
        navbar.classList.toggle('hide', !menuOpen && y > 480 && y > lastY + 4);
        if (y < lastY - 4) navbar.classList.remove('hide');
        if (toTop) toTop.classList.toggle('show', y > 700);

        if (timeline && tFill) {
            var r = timeline.getBoundingClientRect();
            var p = (window.innerHeight * 0.65 - r.top) / r.height;
            tFill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
        }
        lastY = y;
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* ---------- Mobile menu ---------- */
    var burger = $('#hamburger'), menu = $('#navLinks');
    function setMenu(open) {
        menu.classList.toggle('open', open);
        body.classList.toggle('nav-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (open) navbar.classList.remove('hide');
    }
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    navLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });

    /* ---------- Cursor ring ---------- */
    var ring = $('#cursorRing');
    if (ring && finePointer && !reduced) {
        var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
        var loop = function () {
            cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
            ring.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
            raf = (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) ? requestAnimationFrame(loop) : null;
        };
        window.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            tx = e.clientX; ty = e.clientY;
            ring.classList.add('is-visible');
            if (!raf) raf = requestAnimationFrame(loop);
        }, { passive: true });
        document.addEventListener('pointerover', function (e) {
            ring.classList.toggle('is-hover', !!e.target.closest('a, button, input, textarea, [role="option"], .project-card'));
        });
        document.addEventListener('mouseleave', function () { ring.classList.remove('is-visible'); });
    }

    /* ---------- Hero: lens spotlight on lattice + photo tilt ---------- */
    var hero = $('.hero'), lit = $('.hero-lattice.lit'), lens = $('#imageWrapper'), photoBox = $('#lensPhoto');
    if (hero && finePointer && !reduced) {
        hero.addEventListener('pointermove', function (e) {
            var r = hero.getBoundingClientRect();
            lit.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            lit.style.setProperty('--my', (e.clientY - r.top) + 'px');
            if (lens) {
                var lr = lens.getBoundingClientRect();
                var nx = (e.clientX - (lr.left + lr.width / 2)) / window.innerWidth;
                var ny = (e.clientY - (lr.top + lr.height / 2)) / window.innerHeight;
                lens.style.setProperty('--ry', (nx * 14).toFixed(2) + 'deg');
                lens.style.setProperty('--rx', (-ny * 14).toFixed(2) + 'deg');
            }
        });
        hero.addEventListener('pointerleave', function () {
            lit.style.setProperty('--mx', '-400px'); lit.style.setProperty('--my', '-400px');
            if (lens) { lens.style.setProperty('--rx', '0deg'); lens.style.setProperty('--ry', '0deg'); }
        });
    }
    // Photo fallback: if profile.jpg is missing, the "AM" monogram stays visible
    var photo = $('#profilePhoto');
    if (photo && photoBox) {
        var check = function () { if (photo.complete && photo.naturalWidth === 0) photoBox.classList.add('no-photo'); };
        photo.addEventListener('error', function () { photoBox.classList.add('no-photo'); });
        check();
    }

    /* ---------- Magnetic buttons ---------- */
    if (finePointer && !reduced) {
        $$('.magnetic').forEach(function (el) {
            el.addEventListener('pointermove', function (e) {
                var r = el.getBoundingClientRect();
                el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
            });
            el.addEventListener('pointerleave', function () { el.style.transform = ''; });
        });
    }

    /* ---------- Project cards: spotlight, filters, case studies ---------- */
    var cards = $$('.project-card');
    if (finePointer) {
        cards.forEach(function (c) {
            c.addEventListener('pointermove', function (e) {
                var r = c.getBoundingClientRect();
                c.style.setProperty('--px', (e.clientX - r.left) + 'px');
                c.style.setProperty('--py', (e.clientY - r.top) + 'px');
            });
        });
    }

    // Links without a real URL yet are shown as "coming soon" instead of jumping to the top of the page
    function markPlaceholders(scope) {
        $$('a[href="#"]', scope).forEach(function (a) {
            a.classList.add('is-soon');
            a.setAttribute('aria-disabled', 'true');
            a.setAttribute('tabindex', '-1');
            a.setAttribute('title', 'Coming soon');
            a.removeAttribute('target');
        });
    }
    // Keep case-study buttons in sync with the project card (edit links in one place only)
    cards.forEach(function (card) {
        var btn = $('[data-case]', card);
        if (!btn) return;
        var dlg = document.getElementById('case-' + btn.getAttribute('data-case'));
        if (!dlg) return;
        var src = $$('.project-links a', card), dst = $$('.case-actions a', dlg);
        dst.forEach(function (a, i) { if (src[i]) a.setAttribute('href', src[i].getAttribute('href')); });
    });
    markPlaceholders($('#projects'));

    var filters = $$('.filter'), emptyNote = $('#emptyNote');
    filters.forEach(function (f) {
        f.addEventListener('click', function () {
            var key = f.getAttribute('data-filter'), shown = 0;
            filters.forEach(function (b) {
                var on = b === f;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-pressed', String(on));
            });
            cards.forEach(function (c) {
                var match = key === 'all' || c.getAttribute('data-cat').split(' ').indexOf(key) > -1;
                c.hidden = !match;
                if (match) { shown++; c.classList.add('in'); }
            });
            if (emptyNote) emptyNote.hidden = shown > 0;
        });
    });

    function openDialog(d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); body.classList.add('modal-open'); }
    function closeDialog(d) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }

    $$('[data-case]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var d = document.getElementById('case-' + btn.getAttribute('data-case'));
            if (d) openDialog(d);
        });
    });
    $$('dialog.case-modal').forEach(function (d) {
        $('.case-close', d).addEventListener('click', function () { closeDialog(d); });
        d.addEventListener('click', function (e) { if (e.target === d) closeDialog(d); });
        d.addEventListener('close', function () { body.classList.remove('modal-open'); });
    });

    /* ---------- Quick navigation palette (Ctrl/Cmd + K) ---------- */
    var palette = $('#palette'), pInput = $('#paletteInput'), pList = $('#paletteList'), pBtn = $('#paletteBtn');
    var sel = 0, shownItems = [];

    function goTo(id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
    function copyEmail() {
        var done = function () { toast('Email address copied'); };
        var fallback = function () {
            var ta = document.createElement('textarea');
            ta.value = EMAIL; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); done(); } catch (e) { toast('Copy failed. The address is ' + EMAIL); }
            ta.remove();
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(EMAIL).then(done, fallback);
        else fallback();
    }

    var commands = [
        { label: 'Go to Home', icon: 'fa-house', hint: 'Section', run: function () { goTo('home'); } },
        { label: 'Go to About', icon: 'fa-user', hint: 'Section', run: function () { goTo('about'); } },
        { label: 'Go to Skills', icon: 'fa-laptop-code', hint: 'Section', run: function () { goTo('skills'); } },
        { label: 'Go to Experience', icon: 'fa-briefcase', hint: 'Section', run: function () { goTo('experience'); } },
        { label: 'Go to Projects', icon: 'fa-diagram-project', hint: 'Section', run: function () { goTo('projects'); } },
        { label: 'Go to Achievements', icon: 'fa-trophy', hint: 'Section', run: function () { goTo('certifications'); } },
        { label: 'Go to Contact', icon: 'fa-envelope', hint: 'Section', run: function () { goTo('contact'); } },
        { label: 'Switch theme', icon: 'fa-circle-half-stroke', hint: 'Action', run: toggleTheme },
        { label: 'Copy email address', icon: 'fa-copy', hint: 'Action', run: copyEmail },
        { label: 'Open GitHub', icon: 'fa-brands fa-github', hint: 'Link', run: function () { window.open('https://github.com/Arivu-2005', '_blank', 'noopener'); } },
        { label: 'Open LinkedIn', icon: 'fa-brands fa-linkedin', hint: 'Link', run: function () { window.open('https://www.linkedin.com/in/arivazhaganmani/', '_blank', 'noopener'); } }
    ];

    function renderPalette() {
        var q = pInput.value.trim().toLowerCase();
        shownItems = commands.filter(function (c) { return !q || c.label.toLowerCase().indexOf(q) > -1; });
        sel = Math.min(sel, Math.max(0, shownItems.length - 1));
        pList.innerHTML = '';
        if (!shownItems.length) {
            var li = document.createElement('li');
            li.className = 'none'; li.textContent = 'Nothing matches "' + pInput.value + '". Try "projects" or "theme".';
            pList.appendChild(li); pInput.removeAttribute('aria-activedescendant'); return;
        }
        shownItems.forEach(function (c, i) {
            var li = document.createElement('li');
            li.id = 'pal-' + i; li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', String(i === sel));
            var ic = document.createElement('i'); ic.className = (c.icon.indexOf('fa-brands') === 0 ? '' : 'fas ') + c.icon; ic.setAttribute('aria-hidden', 'true');
            var tx = document.createElement('span'); tx.textContent = c.label;
            var sm = document.createElement('small'); sm.textContent = c.hint;
            li.appendChild(ic); li.appendChild(tx); li.appendChild(sm);
            li.addEventListener('click', function () { runCommand(i); });
            li.addEventListener('pointermove', function () { if (sel !== i) { sel = i; markSel(); } });
            pList.appendChild(li);
        });
        pInput.setAttribute('aria-activedescendant', 'pal-' + sel);
    }
    function markSel() {
        $$('li[role="option"]', pList).forEach(function (li, i) { li.setAttribute('aria-selected', String(i === sel)); });
        pInput.setAttribute('aria-activedescendant', 'pal-' + sel);
        var cur = $('#pal-' + sel); if (cur) cur.scrollIntoView({ block: 'nearest' });
    }
    function runCommand(i) {
        var c = shownItems[i]; if (!c) return;
        closeDialog(palette);
        setTimeout(c.run, 60);
    }
    function openPalette() {
        if (!palette) return;
        pInput.value = ''; sel = 0; renderPalette();
        openDialog(palette); pInput.focus();
    }
    if (palette) {
        pInput.addEventListener('input', function () { sel = 0; renderPalette(); });
        pInput.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, shownItems.length); markSel(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shownItems.length) % Math.max(1, shownItems.length); markSel(); }
            else if (e.key === 'Enter') { e.preventDefault(); runCommand(sel); }
        });
        palette.addEventListener('click', function (e) { if (e.target === palette) closeDialog(palette); });
        palette.addEventListener('close', function () { body.classList.remove('modal-open'); });
        if (pBtn) pBtn.addEventListener('click', openPalette);
        document.addEventListener('keydown', function (e) {
            var tag = (e.target.tagName || '').toLowerCase();
            var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                palette.open ? closeDialog(palette) : openPalette();
            } else if (e.key === '/' && !typing && !palette.open) {
                e.preventDefault(); openPalette();
            }
        });
        // Show the right shortcut label on Mac
        if (/Mac|iPhone|iPad/.test(navigator.platform)) { var k = $('.kbd'); if (k) k.textContent = '\u2318 K'; }
    }

    /* ---------- Contact form (opens the visitor's email app) ---------- */
    var form = $('#contactForm');
    function setError(input, msg) {
        var g = input.closest('.input-group'), err = $('#err-' + input.id);
        g.classList.toggle('invalid', !!msg);
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (err) err.textContent = msg || '';
    }
    function validate(input) {
        var v = input.value.trim();
        if (!v) { setError(input, 'Please fill in this field.'); return false; }
        if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setError(input, 'Enter a valid email, like name@example.com.'); return false; }
        setError(input, ''); return true;
    }
    if (form) {
        var fields = $$('input, textarea', form);
        fields.forEach(function (f) {
            f.addEventListener('blur', function () { if (f.value || f.closest('.input-group').classList.contains('invalid')) validate(f); });
            f.addEventListener('input', function () { if (f.closest('.input-group').classList.contains('invalid')) validate(f); });
        });
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var firstBad = null;
            fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
            if (firstBad) { firstBad.focus(); return; }
            var v = function (id) { return $('#' + id).value.trim(); };
            var text = v('message') + '\n\n' + 'From: ' + v('name') + ' (' + v('email') + ')';
            window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(v('subject')) + '&body=' + encodeURIComponent(text);
            toast('Opening your email app. If nothing opens, copy my address instead.');
        });
    }
    var copyBtn = $('#copyEmail');
    if (copyBtn) copyBtn.addEventListener('click', copyEmail);

    /* ---------- Footer: year + local time ---------- */
    var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
    var lt = $('#localTime');
    function tick() {
        if (!lt) return;
        try {
            lt.textContent = 'Local time ' + new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(new Date()) + ' IST';
        } catch (e) { lt.textContent = ''; }
    }
    tick(); setInterval(tick, 30000);

    /* ---------- Go ---------- */
    runLoader();
})();
