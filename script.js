/**
 * INTERNADDA 2.0 - MASTERPIECE ENGINE
 * Handles: GSAP Animations, Mobile Navigation, Sticky Header, and Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initialize all modules
    initGlobalUI();
    initHeroAnimations();
    initScrollReveals();
    initParallaxEffects();
    initMarqueeInteraction();

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
    const body = document.body;

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = mobileNav.classList.contains('active');
            
            if (isActive) {
                mobileNav.classList.remove('active');
                // Animate Out
                gsap.to(mobileNav, { height: 0, opacity: 0, duration: 0.3, display: 'none' });
            } else {
                mobileNav.style.display = 'flex';
                mobileNav.classList.add('active');
                // Animate In
                gsap.fromTo(mobileNav, 
                    { height: 0, opacity: 0 },
                    { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
                );
                
                // Stagger links
                gsap.fromTo(".nav-mobile .nav-link", 
                    { x: -20, opacity: 0 }, 
                    { x: 0, opacity: 1, stagger: 0.05, delay: 0.1 }
                );
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
                mobileNav.classList.remove('active');
                gsap.to(mobileNav, { height: 0, opacity: 0, duration: 0.3, display: 'none' });
            }
        });
    }
}


/* ==========================================================================
   2. CINEMATIC HERO ENTRANCE
   ========================================================================== */
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // 1. Hero Text & Elements
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
    
    // Animate Section Headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Animate Cards (Grid Items) - Staggered
    // Works for Value Cards, Course Cards, Testimonials
    const grids = document.querySelectorAll('.grid-3, .grid-4, .hero-stats');
    
    grids.forEach(grid => {
        const cards = grid.children;
        gsap.from(cards, {
            scrollTrigger: {
                trigger: grid,
                start: "top 85%"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15, // The "Bento" ripple effect
            ease: "back.out(1.2)"
        });
    });
}


/* ==========================================================================
   4. INTERACTIVE EFFECTS (Parallax & Hover)
   ========================================================================== */
function initParallaxEffects() {
    // 1. Floating Background Blobs
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
   5. MARQUEE CONTROL
   ========================================================================== */
function initMarqueeInteraction() {
    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack) return;

    // Clone content for seamless infinite scroll
    const content = marqueeTrack.innerHTML;
    marqueeTrack.innerHTML += content; // Duplicate logos

    // Pause on hover for UX
    const marqueeContainer = document.querySelector('.marquee-container');
    marqueeContainer.addEventListener('mouseenter', () => {
        marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeContainer.addEventListener('mouseleave', () => {
        marqueeTrack.style.animationPlayState = 'running';
    });
}
