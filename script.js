/* =========================================================
   script.js  -  every feature is its own small block
   1. Mobile menu
   2. Highlight the current menu link while scrolling
   3. Scroll reveal + skill bar animation
   4. Navbar shadow + Back-to-top button
   5. Contact form (opens your email app)
   6. Profile photo fallback + footer year
========================================================= */

/* ---------- 1. MOBILE MENU ---------- */
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");
const navItems  = document.querySelectorAll(".nav-links a");

function setMenu(open) {
    navLinks.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", open);
    // swap the icon: bars <-> X
    hamburger.querySelector("i").className = open ? "fas fa-times" : "fas fa-bars";
}

hamburger.addEventListener("click", () => {
    setMenu(!navLinks.classList.contains("active"));
});

// close the menu after tapping a link
navItems.forEach(link => link.addEventListener("click", () => setMenu(false)));


/* ---------- 2. ACTIVE MENU LINK ----------
   IntersectionObserver tells us when a section crosses the middle of the screen. */
const sections = document.querySelectorAll("main section[id]");

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navItems.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
    });
}, { rootMargin: "-45% 0px -50% 0px" });   // a thin line in the middle of the viewport

sections.forEach(section => sectionObserver.observe(section));


/* ---------- 3. SCROLL REVEAL + SKILL BARS ---------- */
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("active");

        // fill any skill bars inside this block
        entry.target.querySelectorAll(".progress-line span[data-level]").forEach(bar => {
            bar.style.width = bar.dataset.level + "%";
        });

        observer.unobserve(entry.target);   // animate only once
    });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));


/* ---------- 4. NAVBAR SHADOW + BACK TO TOP ---------- */
const navbar    = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
    backToTop.classList.toggle("show", window.scrollY > 400);
}, { passive: true });


/* ---------- 5. CONTACT FORM ----------
   No backend needed: we build a mailto: link and open the visitor's email app. */
const MY_EMAIL = "your.email@gmail.com";   // TODO: put your real email here

document.getElementById("contactForm").addEventListener("submit", event => {
    event.preventDefault();

    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    const body = `${message}\n\n— ${name} (${email})`;

    window.location.href =
        `mailto:${MY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    event.target.reset();
});


/* ---------- 6. SMALL EXTRAS ---------- */
// If profile.jpg is missing, show "AM" initials instead of a broken image
const photo = document.getElementById("profilePhoto");
photo.addEventListener("error", () => {
    photo.style.display = "none";
    document.getElementById("imageWrapper").classList.add("no-photo");
});

// Keep the footer year correct forever
document.getElementById("year").textContent = new Date().getFullYear();


/* ---------- 7. CASE STUDY POP-UPS ----------
   Each "Case Study" button has data-case="mann-vaasam" and opens <dialog id="case-mann-vaasam">. */
document.querySelectorAll("[data-case]").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("case-" + button.dataset.case).showModal();
    });
});

document.querySelectorAll(".case-modal").forEach(modal => {
    // X button closes
    modal.querySelector(".case-close").addEventListener("click", () => modal.close());

    // clicking the dark area outside the box closes
    modal.addEventListener("click", event => {
        if (event.target === modal) modal.close();
    });
});