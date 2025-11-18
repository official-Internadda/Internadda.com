/**
 * INTERNADDA 2.0 - MASTERPIECE ENGINE
 * Powered by GSAP & ScrollTrigger
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Initialize Animations
        initHeroAnimations();
        initScrollReveals();
        initParallaxEffects();
    }

    // Initialize UI & Functionality
    initGlobalUI();
    initMarqueeInteraction();
    initSearchSystem();

});


/* ==========================================================================
   1. GLOBAL UI (Header & Mobile Menu)
   ========================================================================== */
function initGlobalUI() {
    // --- Sticky Header Glass Effect ---
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.contains('active');
            
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu when clicking a link inside it
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        hamburger.classList.add('active');
        mobileNav.style.display = 'flex';
        mobileNav.classList.add('active');
        
        if (typeof gsap !== 'undefined') {
            // Animate In (Slide Down)
            gsap.fromTo(mobileNav, 
                { height: 0, opacity: 0 },
                { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
            );
            
            // Stagger links entrance
            gsap.fromTo(".mobile-nav .nav-link", 
                { x: -20, opacity: 0 }, 
                { x: 0, opacity: 1, stagger: 0.05, delay: 0.1 }
            );
        }
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        
        if (typeof gsap !== 'undefined') {
            // Animate Out (Slide Up)
            gsap.to(mobileNav, { 
                height: 0, 
                opacity: 0, 
                duration: 0.3, 
                onComplete: () => mobileNav.style.display = 'none' 
            });
        } else {
            mobileNav.style.display = 'none';
        }
    }
}


/* ==========================================================================
   2. CINEMATIC HERO ENTRANCE
   ========================================================================== */
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Hero Text & Elements Staggered Reveal
    tl.from(".hero-tag", { y: 20, opacity: 0, duration: 0.8, delay: 0.2 })
      .from(".hero-title", { y: 50, opacity: 0, duration: 1, skewY: 2 }, "-=0.6")
      .from(".hero-desc", { y: 20, opacity: 0, duration: 1 }, "-=0.8")
      .from(".hero-btns a", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.8")
      .from(".stat", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.6");

    // 2. Hero Image Reveal (3D Tilt Entrance)
    gsap.from(".hero-image-wrapper", {
        x: 50,
        opacity: 0,
        rotationY: 10,
        scale: 0.9,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.5
    });
}


/* ==========================================================================
   3. SCROLL REVEALS ("Bento" Cards & Sections)
   ========================================================================== */
function initScrollReveals() {
    
    // Animate Section Headers (Fade Up)
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%", // Triggers when top of element hits 85% viewport height
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Animate Cards (Grid Items) - Staggered Ripple Effect
    const grids = document.querySelectorAll('.grid-3, .grid-4, .footer-grid');
    
    grids.forEach(grid => {
        const cards = Array.from(grid.children);
        if(cards.length > 0) {
            gsap.from(cards, {
                scrollTrigger: {
                    trigger: grid,
                    start: "top 85%"
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.2)"
            });
        }
    });
}


/* ==========================================================================
   4. INTERACTIVE EFFECTS (Parallax & Hover)
   ========================================================================== */
function initParallaxEffects() {
    // 1. Floating Background Blobs (Mouse Movement)
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX - window.innerWidth / 2) * 0.02;
        const y = (e.clientY - window.innerHeight / 2) * 0.02;

        gsap.to(".blob-1", { x: x, y: y, duration: 2, ease: "power1.out" });
        gsap.to(".blob-2", { x: -x, y: -y, duration: 2, ease: "power1.out" });
    });

    // 2. Hero Image 3D Tilt on Mouseover
    const heroImg = document.querySelector('.hero-image-wrapper');
    if (heroImg) {
        heroImg.addEventListener('mousemove', (e) => {
            const rect = heroImg.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 20;
            const y = (e.clientY - rect.top - rect.height / 2) / 20;

            gsap.to(heroImg, {
                rotationY: x,
                rotationX: -y,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power1.out"
            });
        });

        heroImg.addEventListener('mouseleave', () => {
            gsap.to(heroImg, {
                rotationY: 0,
                rotationX: 0,
                duration: 1,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }
}


/* ==========================================================================
   5. MARQUEE CONTROL (Infinite Logos)
   ========================================================================== */
function initMarqueeInteraction() {
    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack) return;

    // Clone content for seamless infinite scroll
    const content = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML += content; // Duplicate logos

    // Pause on hover for better UX
    const marqueeContainer = document.querySelector('.marquee-container');
    if (marqueeContainer) {
        marqueeContainer.addEventListener('mouseenter', () => {
            marqueeTrack.style.animationPlayState = 'paused';
        });
        marqueeContainer.addEventListener('mouseleave', () => {
            marqueeTrack.style.animationPlayState = 'running';
        });
    }
}

/* ==========================================================================
   6. SEARCH SYSTEM
   ========================================================================== */
function initSearchSystem() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    const searchData = [
        { title: 'Data Science Intern Course', type: 'Course', url: 'https://courses.internadda.com/' },
        { title: 'Python Essentials', type: 'Course', url: 'https://courses.internadda.com/' },
        { title: 'Generative AI Masterclass', type: 'Course', url: 'https://courses.internadda.com/' },
        { title: 'Data Science Internship', type: 'Internship', url: 'intern/internship.html' },
        { title: 'AI & ML Internship', type: 'Internship', url: 'intern/internship.html' },
        { title: 'Web Development Internship', type: 'Internship', url: 'intern/internship.html' },
        { title: 'Cybersecurity Internship', type: 'Internship', url: 'intern/internship.html' }
    ];

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }

        const results = searchData.filter(item => item.title.toLowerCase().includes(query));
        
        if (results.length > 0) {
            searchResults.classList.remove('hidden');
            
            // Animate Results Container
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(searchResults, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 });
            }
            
            results.forEach(item => {
                const div = document.createElement('a');
                div.href = item.url;
                div.className = 'search-result-item';
                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:32px; height:32px; background:#f1f5f9; border-radius:6px; display:flex; align-items:center; justify-content:center;">
                            <i class="fas ${item.type === 'Course' ? 'fa-book-open' : 'fa-briefcase'}" style="color:var(--secondary); font-size:14px;"></i>
                        </div>
                        <div>
                            <h4 style="margin:0; font-size:0.9rem; color:var(--primary); font-weight:600;">${item.title}</h4>
                            <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">${item.type}</p>
                        </div>
                    </div>
                `;
                searchResults.appendChild(div);
            });
        } else {
            searchResults.innerHTML = `<div style="padding:12px; color:var(--text-muted); font-size:0.85rem;">No results found.</div>`;
            searchResults.classList.remove('hidden');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}
