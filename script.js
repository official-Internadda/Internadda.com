document.addEventListener('DOMContentLoaded', function() {
    
    // ==============================================
    // 1. INFINITE MARQUEE LOGIC
    // ==============================================
    function setupMarquee(elementId) {
        const container = document.getElementById(elementId);
        if (!container) return;

        const track = container.querySelector('.marquee-track');
        if (!track) return;

        const items = Array.from(track.children);
        
        // Clone original items and append them to the end for smooth loop
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }

    setupMarquee('companyMarquee');
    setupMarquee('studentMarquee');


    // ==============================================
    // 2. DROPDOWN TOGGLE (CLICK BEHAVIOR)
    // ==============================================
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        const trigger = dropdown.querySelector('span');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        const dropdownLinks = dropdown.querySelectorAll('a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }


    // ==============================================
    // 3. MOBILE MENU TOGGLE
    // ==============================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // ==============================================
    // 4. HERO IMAGE SLIDER
    // ==============================================
    const slides = ['images/slide1.png', 'images/slide2.png', 'images/slide3.png'];
    let currentSlide = 0;
    const heroImg = document.getElementById('hero-slider');

    if (heroImg && slides.length > 0) {
        // Preload images to avoid flickering
        slides.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        setInterval(() => {
            // Fade out
            heroImg.style.opacity = 0;

            setTimeout(() => {
                // Change source
                currentSlide = (currentSlide + 1) % slides.length;
                heroImg.src = slides[currentSlide];
                
                // Fade in
                heroImg.style.opacity = 1;
            }, 500); // Match the CSS transition time (0.5s)
        }, 4000); // Change every 4 seconds
    }
});
