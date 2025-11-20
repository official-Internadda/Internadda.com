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
    // Handles opening/closing "More" on click for Desktop & Mobile
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        const trigger = dropdown.querySelector('span'); // The "More" text label
        
        // Toggle on click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing from document listener
            dropdown.classList.toggle('active');
        });

        // Close when clicking inside the dropdown links
        const dropdownLinks = dropdown.querySelectorAll('a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        });

        // Close when clicking anywhere outside
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
            e.stopPropagation(); // Prevent conflict with document click
            navLinks.classList.toggle('active');
            
            // Animate icon
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when clicking outside
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
});
