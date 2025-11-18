/**
 * INTERNADDA 2.0 - MAIN SCRIPT
 */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initUI();
    initAnimations();
    initSearch();
});

function initUI() {
    // Header Scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            if (isActive) {
                mobileNav.classList.add('active');
                gsap.fromTo(mobileNav, {height: 0, opacity: 0}, {height: '100vh', opacity: 1, duration: 0.4});
                gsap.fromTo(".mobile-nav .nav-link", {x: -20, opacity: 0}, {x: 0, opacity: 1, stagger: 0.1, delay: 0.2});
            } else {
                mobileNav.classList.remove('active');
            }
        });
    }
}

function initAnimations() {
    // Hero Entrance
    const tl = gsap.timeline();
    tl.from(".hero-tag", {y: 20, opacity: 0, duration: 0.8, delay: 0.2})
      .from(".hero-title", {y: 30, opacity: 0, duration: 1}, "-=0.6")
      .from(".hero-desc", {y: 20, opacity: 0, duration: 0.8}, "-=0.8")
      .from(".hero-btns", {y: 20, opacity: 0, duration: 0.8}, "-=0.6")
      .from(".hero-image-wrapper", {x: 50, opacity: 0, duration: 1.2, ease: "power2.out"}, "-=1");

    // Scroll Reveal for Cards
    gsap.utils.toArray('.card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.2)"
        });
    });

    // Marquee Hover Pause
    const marquee = document.querySelector('.marquee-track');
    if(marquee) {
        marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
        marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
    }
}

function initSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    
    if(!input || !results) return;

    const data = [
        { title: 'Data Science Course', url: 'https://courses.internadda.com/' },
        { title: 'Python Course', url: 'https://courses.internadda.com/' },
        { title: 'Gen AI Course', url: 'https://courses.internadda.com/' },
        { title: 'Data Science Internship', url: 'intern/internship.html' },
        { title: 'Web Dev Internship', url: 'intern/internship.html' }
    ];

    input.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        results.innerHTML = '';
        if (val.length < 2) { results.classList.add('hidden'); return; }
        
        const matches = data.filter(d => d.title.toLowerCase().includes(val));
        if (matches.length > 0) {
            results.classList.remove('hidden');
            matches.forEach(m => {
                const div = document.createElement('a');
                div.href = m.url;
                div.className = 'search-result-item';
                div.textContent = m.title;
                results.appendChild(div);
            });
        } else {
            results.classList.add('hidden');
        }
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !results.contains(e.target)) results.classList.add('hidden');
    });
}
