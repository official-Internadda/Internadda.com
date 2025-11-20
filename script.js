// ---------------------------------------------
// Internadda Main Script (Masterpiece Edition)
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Elements Selection
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('header');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');

    // 2. Mobile Menu Toggle (Lock Body Scroll)
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !hamburgerMenu.contains(e.target)) {
                closeMenu();
            }
        });
    }

    function openMenu() {
        navMenu.classList.add('active');
        hamburgerMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock scroll
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        hamburgerMenu.classList.remove('active');
        document.body.style.overflow = 'auto'; // Unlock scroll
    }

    // 3. Mobile Dropdown Toggle
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', (e) => {
                // Only toggle on mobile or click-based interaction
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    content.classList.toggle('show');
                }
            });
        }
    });


    // 4. Smooth Infinite Scroll Engine
    function setupInfiniteScroll(containerId, speed = 1) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Duplicate content for seamless loop
        const items = Array.from(container.children);
        if(items.length === 0) return;

        items.forEach(item => {
            const clone = item.cloneNode(true);
            container.appendChild(clone);
        });

        let scrollPos = 0;
        function animate() {
            scrollPos += speed;
            // If scrolled past half (original width), reset to 0 instantly
            if (scrollPos >= container.scrollWidth / 2) {
                scrollPos = 0;
            }
            container.scrollLeft = scrollPos;
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // Start Scrolling
    setupInfiniteScroll('partnerLogoMarquee', 0.6); // Slower for logos
    setupInfiniteScroll('testimonialsGrid', 0.8);   // Medium for text cards


    // 5. Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 6. Hero Slider Auto-Play
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        const slides = document.querySelectorAll('.slide');
        if(slides.length > 1) {
            let currentSlide = 0;
            setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            }, 4000);
        }
    }
});
