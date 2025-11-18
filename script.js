document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Mobile Menu Toggle Logic (Fixed) ---
    const hamburger = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            // Toggle display between block (visible) and none (hidden)
            if (mobileNav.style.display === 'block') {
                mobileNav.style.display = 'none';
            } else {
                mobileNav.style.display = 'block';
            }
        });
        
        // Close menu when clicking a link inside it
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.style.display = 'none';
                hamburger.classList.remove('active');
            });
        });
    }

    // --- 2. Header Scroll Effect ---
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled'); // Adds shadow in CSS
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 3. Hero Slider (Simple Auto-Fade) ---
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000);
    }

    // --- 4. GSAP Animations (Optional Polish) ---
    // Only runs if GSAP is loaded correctly
    if (typeof gsap !== 'undefined') {
        gsap.from(".hero-content > *", {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out",
            delay: 0.2
        });
    }
});
