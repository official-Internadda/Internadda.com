document.addEventListener('DOMContentLoaded', function() {
    
    // ==============================================
    // 1. INFINITE MARQUEE LOGIC
    // ==============================================
    // This function duplicates the marquee items to create a seamless loop.
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

    // Initialize marquees
    setupMarquee('companyMarquee');
    setupMarquee('studentMarquee');


    // ==============================================
    // 2. MOBILE MENU TOGGLE
    // ==============================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        // Toggle menu on hamburger click
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Animate the burger icon (bars to X)
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a regular link
        // (This ensures the menu slides back when a user navigates)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close if clicking the "More" dropdown placeholder
                if(link.getAttribute('href') === '#') return; 
                
                navLinks.classList.remove('active');
                
                // Reset icon back to bars
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});
