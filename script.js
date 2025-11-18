/**
 * INTERNADDA 2.0 - MASTERPIECE EDITION
 * Powered by GSAP & ScrollTrigger
 * * Features:
 * - Cinematic Hero Entrance
 * - Smooth Scroll Reveals
 * - Magnetic Button Hover Effects
 * - 3D Mouse Parallax
 * - Infinite Marquee Control
 * - Advanced Search Functionality
 */

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core UI (Menu, Search)
    initGlobalUI();
    initSearchSystem();
    
    // 2. Initialize "Masterpiece" Animations
    initHeroAnimations();
    initSmoothScrollReveals();
    initParallaxEffects();
    initMagneticButtons();
    initMarqueeInteraction();
    
    // 3. Initialize Carousels
    initTestimonialCarousel();
});


/* ==========================================================================
   1. CINEMATIC HERO ENTRANCE
   ========================================================================== */
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Header: Drop down smoothly
    tl.from("header", {
        y: -100,
        opacity: 0,
        duration: 1.2,
        delay: 0.2
    })
    
    // Hero Heading: Reveal text with a skew effect
    .from(".hero-heading", {
        y: 100,
        opacity: 0,
        skewY: 5,
        duration: 1.2,
        stagger: 0.1
    }, "-=0.8")
    
    // Description: Fade up
    .from(".hero-description", {
        y: 30,
        opacity: 0,
        duration: 1
    }, "-=1.0")
    
    // Buttons & Stats: Staggered entry
    .from([".hero-cta", ".hero-stats"], {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2
    }, "-=0.8")
    
    // Hero Image: 3D rotation reveal
    .from(".hero-image-slider", {
        x: 100,
        opacity: 0,
        scale: 0.8,
        rotationY: 15,
        duration: 1.5,
        ease: "power2.out"
    }, "-=1.2");
}


/* ==========================================================================
   2. SCROLL REVEALS (BUTTERY SMOOTH)
   ========================================================================== */
function initSmoothScrollReveals() {
    // Animate Section Headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // Value Cards (Bento Grid) - Staggered Popup
    gsap.from(".value-card", {
        scrollTrigger: {
            trigger: ".value-cards",
            start: "top 80%"
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.2)"
    });

    // Course Cards - Floating Entry
    gsap.utils.toArray('.course-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%"
            },
            y: 50,
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            delay: i * 0.1, // Waterfall effect
            ease: "power2.out"
        });
    });
    
    // CTA Section - Parallax Background
    gsap.to(".cta-section::before", {
        scrollTrigger: {
            trigger: ".cta-section",
            scrub: true
        },
        y: -50,
        scale: 1.1
    });
}


/* ==========================================================================
   3. MOUSE PARALLAX & 3D EFFECTS (The "Wow" Factor)
   ========================================================================== */
function initParallaxEffects() {
    // Move Background Blobs gently with mouse
    document.addEventListener("mousemove", (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        gsap.to(".bg-blob", {
            x: (mouseX - window.innerWidth / 2) * 0.05,
            y: (mouseY - window.innerHeight / 2) * 0.05,
            duration: 2, // Laggy float feel
            ease: "power2.out"
        });
    });

    // 3D Tilt Effect for Hero Image
    const heroImg = document.getElementById('heroImageSlider');
    if (heroImg) {
        heroImg.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = heroImg.getBoundingClientRect();
            const x = (e.clientX - left - width / 2) / 25;
            const y = (e.clientY - top - height / 2) / 25;

            gsap.to(heroImg, {
                rotationY: x,
                rotationX: -y,
                transformPerspective: 1000,
                duration: 0.4,
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
   4. MAGNETIC BUTTONS
   ========================================================================== */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-outline');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = btn.getBoundingClientRect();
            const x = (e.clientX - left - width / 2) * 0.3; // Strength
            const y = (e.clientY - top - height / 2) * 0.3;

            gsap.to(btn, {
                x: x,
                y: y,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { 
                x: 0, 
                y: 0, 
                duration: 0.6, 
                ease: "elastic.out(1, 0.3)" 
            });
        });
    });
}


/* ==========================================================================
   5. MARQUEE INTERACTION
   ========================================================================== */
function initMarqueeInteraction() {
    const marquee = document.querySelector('.logo-marquee-container');
    if (!marquee) return;

    // Slow down on hover
    marquee.addEventListener('mouseenter', () => {
        gsap.to('.logo-marquee', { timeScale: 0.2, duration: 1 });
    });
    
    marquee.addEventListener('mouseleave', () => {
        gsap.to('.logo-marquee', { timeScale: 1, duration: 1 });
    });
}


/* ==========================================================================
   6. GLOBAL UI & UTILITIES
   ========================================================================== */
function initGlobalUI() {
    // Header Glass Effect on Scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Animation
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    
    if(hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            
            if (isActive) {
                navMenu.classList.add('active');
                // Animate menu items in
                gsap.fromTo(".nav-link", 
                    { x: -20, opacity: 0 },
                    { x: 0, opacity: 1, stagger: 0.05, duration: 0.3, delay: 0.1 }
                );
            } else {
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Mobile Dropdowns (Tap to Open)
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(group => {
        const toggle = group.querySelector('.dropdown-toggle');
        const content = group.querySelector('.dropdown-content');
        if (toggle && content) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    const isVisible = content.style.display === 'block';
                    // Close others
                    document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
                    // Toggle current
                    content.style.display = isVisible ? 'none' : 'block';
                }
            });
        }
    });
}

// Testimonial Infinite Scroll Logic
function initTestimonialCarousel() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;
    
    // Clone items for seamless loop
    const items = Array.from(container.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        container.appendChild(clone);
    });
    
    // Auto Scroll
    let scrollPos = 0;
    let speed = 1;
    let isHovered = false;
    
    container.addEventListener('mouseenter', () => isHovered = true);
    container.addEventListener('mouseleave', () => isHovered = false);
    
    function animate() {
        if (!isHovered) {
            scrollPos += speed;
            // Reset when half is scrolled (seamless point)
            if (scrollPos >= container.scrollWidth / 2) {
                scrollPos = 0;
            }
            container.scrollLeft = scrollPos;
        }
        requestAnimationFrame(animate);
    }
    animate();
}


/* ==========================================================================
   7. SEARCH SYSTEM (Functional)
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
            // GSAP Animate Results In
            gsap.fromTo(searchResults, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2 });
            
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
                            <h4 style="margin:0; font-size:0.95rem; color:var(--primary);">${item.title}</h4>
                            <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">${item.type}</p>
                        </div>
                    </div>
                `;
                searchResults.appendChild(div);
            });
        } else {
            searchResults.classList.add('hidden');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
    });
}
