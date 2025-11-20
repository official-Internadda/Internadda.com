// ---------------------------------------------
// Internadda Main Script (Masterpiece Edition)
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================
    // 1. ELEMENT SELECTION
    // =========================================
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('header');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');

    // =========================================
    // 2. MOBILE MENU TOGGLE (Robust Logic)
    // =========================================
    if (hamburgerMenu && navMenu) {
        // Toggle Menu on Hamburger Click
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            toggleMenu();
        });

        // Close Menu when clicking ANY link inside it
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close Menu when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = navMenu.contains(e.target);
            const isClickOnButton = hamburgerMenu.contains(e.target);
            
            // If menu is open AND click is outside menu AND click is not on button
            if (navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnButton) {
                closeMenu();
            }
        });
    }

    function toggleMenu() {
        const isActive = navMenu.classList.contains('active');
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        navMenu.classList.add('active');
        hamburgerMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Disable scrolling on background
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        hamburgerMenu.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }


    // =========================================
    // 3. DROPDOWN LOGIC (Mobile & Desktop)
    // =========================================
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', (e) => {
                // On mobile/touch, we need to prevent the link from navigating immediately
                // so the user can see the dropdown
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other open dropdowns first (optional, keeps UI clean)
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.querySelector('.dropdown-content').classList.remove('show');
                        }
                    });

                    // Toggle visibility class
                    content.classList.toggle('show');
                }
            });
            
            // Desktop Hover Logic is handled by CSS usually, but for click-based interaction:
            // You can add logic here if you want click-to-open on desktop too.
        }
    });

    // Global click to close all dropdowns
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.dropdown')) {
            document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
        }
    });


    // =========================================
    // 4. INFINITE SCROLL ENGINE
    // =========================================
    
    /**
     * sets up smooth infinite scrolling for a container
     * @param {string} containerId - ID of the element
     * @param {number} speed - Pixels per frame (0.5 slow, 2 fast)
     */
    function setupInfiniteScroll(containerId, speed = 1) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Duplicate Content
        const items = Array.from(container.children);
        // If empty, do nothing
        if (items.length === 0) return;

        // Clone items to fill the scroll track
        items.forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true'); // Accessibility
            container.appendChild(clone);
        });

        // 2. Animation Loop
        let scrollPos = 0;
        
        function animate() {
            scrollPos += speed;
            
            // The container now has 2x the content. 
            // When we scroll past the width of the *original* content (scrollWidth / 2),
            // we reset position to 0 to create the seamless loop illusion.
            if (scrollPos >= container.scrollWidth / 2) {
                scrollPos = 0;
            }
            
            container.scrollLeft = scrollPos;
            requestAnimationFrame(animate);
        }
        
        // Start the animation
        requestAnimationFrame(animate);
    }

    // Initialize Scrollers
    // Ensure these IDs exist in your HTML
    setupInfiniteScroll('partnerLogoMarquee', 0.6); // Slow speed for partners
    setupInfiniteScroll('testimonialsGrid', 0.8);   // Medium speed for testimonials


    // =========================================
    // 5. HEADER SCROLL EFFECT
    // =========================================
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }


    // =========================================
    // 6. SEARCH FUNCTIONALITY
    // =========================================
    if (searchInput && searchResultsContainer) {
        
        // Helper to fix paths if not at root
        function getPath(path) {
             // Simple logic: assume files are relative to root
             return path.startsWith('/') ? path : '/' + path; 
        }

        // Hardcoded Data
        const searchItems = [
             { title: 'Data Science Intern Course', url: 'courses/courses/Essential%20Data%20Science%20Intern%20Course.html', role: 'Course' },
             { title: 'Generative AI Masterclass', url: 'courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html', role: 'Course' },
             { title: 'Python Essentials', url: 'courses/courses/Python-Essentials-for-All.html', role: 'Course' },
             { title: 'Data Analyst Internship', url: 'intern/internship.html', role: 'Internship' },
             { title: 'Web Development Internship', url: 'intern/internship.html', role: 'Internship' }
        ];

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            
            // Clear results if empty
            if(val.length < 2) {
                searchResultsContainer.classList.add('hidden');
                return;
            }
            
            // Shortcuts
            if (val === "courses") { window.location.href = getPath('courses/course.html'); return; }
            if (val === "internships") { window.location.href = getPath('intern/internship.html'); return; }

            // Filter Items
            const filtered = searchItems.filter(item => item.title.toLowerCase().includes(val));
            
            searchResultsContainer.innerHTML = ''; // Clear previous

            if(filtered.length > 0) {
                filtered.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    // Add link logic
                    div.innerHTML = `
                        <a href="${getPath(item.url)}" style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                            <div>
                                <h4>${item.title}</h4>
                                <p>${item.role}</p>
                            </div>
                            <i class="fas fa-chevron-right" style="font-size:0.8rem; color:#ccc;"></i>
                        </a>
                    `;
                    searchResultsContainer.appendChild(div);
                });
                searchResultsContainer.classList.remove('hidden');
            } else {
                searchResultsContainer.innerHTML = '<div style="padding:10px; color:#666;">No results found.</div>';
                searchResultsContainer.classList.remove('hidden');
            }
        });
        
        // Hide results on outside click
        document.addEventListener('click', (e) => {
            if(!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                searchResultsContainer.classList.add('hidden');
            }
        });
    }

    // =========================================
    // 7. HERO IMAGE SLIDER (Auto-play)
    // =========================================
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        const slides = document.querySelectorAll('.slide');
        // Only run if we have slides
        if (slides.length > 1) {
            let currentSlide = 0;
            setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            }, 4000); // Change every 4 seconds
        }
    }

});
