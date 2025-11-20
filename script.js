document.addEventListener('DOMContentLoaded', function() {
    
    // ==============================================
    // 1. INFINITE MARQUEE LOGIC
    // ==============================================
    // This function duplicates the content inside the marquee track
    // to create a seamless infinite loop without gaps.
    function setupMarquee(elementId) {
        const container = document.getElementById(elementId);
        if (!container) return; // specific marquee not found

        const track = container.querySelector('.marquee-track');
        if (!track) return;

        // Check if we already have enough content to scroll
        // If content is short, we might need to clone multiple times, 
        // but one clone is usually enough for standard screens.
        const items = Array.from(track.children);
        
        // Clone original items and append them to the end
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }

    // Initialize the Company Logo Marquee
    setupMarquee('companyMarquee');

    // Initialize the Student Testimonials Marquee
    setupMarquee('studentMarquee');


    // ==============================================
    // 2. MOBILE MENU TOGGLE (Standard Logic)
    // ==============================================
    const menuBtn = document.querySelector('.mobile-menu-btn'); // Hamburger button
    const navLinks = document.querySelector('.nav-links');      // Navigation menu
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            // Toggle the 'active' class to show/hide menu
            navLinks.classList.toggle('active');
            
            // Optional: specific animation class for the button itself
            menuBtn.classList.toggle('open');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('open');
            });
        });
    }

    // ==============================================
    // 3. SMOOTH SCROLL FOR ANCHOR LINKS
    // ==============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

});
