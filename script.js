// ---------------------------------------------
// Internadda Main Script
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Element Selection
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    
    // 2. Mobile Menu Toggle
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent clicks from bubbling
            
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside
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


    // 3. Dropdown Logic (Mobile & Desktop Compatibility)
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (toggle && content) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Close other open dropdowns first
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.querySelector('.dropdown-content').classList.remove('show');
                    }
                });

                // Toggle current
                content.classList.toggle('show');
            });
        }
    });

    // Global click to close dropdowns
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
    });


    // 4. Infinite Scroll (Smooth Loop)
    function setupInfiniteScroll(containerId, speed = 1) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clone items for loop
        const items = Array.from(container.children);
        if(items.length === 0) return;

        items.forEach(item => {
            const clone = item.cloneNode(true);
            container.appendChild(clone);
        });

        let scrollPos = 0;
        function animate() {
            scrollPos += speed;
            // Reset when half way (original width)
            if (scrollPos >= container.scrollWidth / 2) {
                scrollPos = 0;
            }
            container.scrollLeft = scrollPos;
            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // Init Scrolls
    setupInfiniteScroll('partnerLogoMarquee', 0.5); // Slower logos
    
    // Only scroll testimonials on desktop if needed, or let CSS snap handle it
    // For this masterpiece version, we'll auto-scroll lightly
    const testimonialGrid = document.getElementById('testimonialsGrid');
    if(testimonialGrid && window.innerWidth > 768) {
       setupInfiniteScroll('testimonialsGrid', 0.8); 
    }


    // 5. Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    
    // 6. Search Logic
    if (searchInput && searchResultsContainer) {
        const items = [
             { title: 'Data Science Intern Course', url: 'courses/courses/Essential%20Data%20Science%20Intern%20Course.html', role: 'Data Science' },
             { title: 'Generative AI Masterclass', url: 'courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html', role: 'AI & ML' },
             { title: 'Python Essentials', url: 'courses/courses/Python-Essentials-for-All.html', role: 'Development' },
             { title: 'Data Analyst Internship', url: 'intern/internship.html', role: 'Internship' }
        ];

        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if(val.length < 2) {
                searchResultsContainer.classList.add('hidden');
                return;
            }
            
            searchResultsContainer.innerHTML = '';
            const filtered = items.filter(item => item.title.toLowerCase().includes(val));
            
            if(filtered.length > 0) {
                filtered.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'search-result-item';
                    div.innerHTML = `
                        <div>
                            <h4>${item.title}</h4>
                            <p>${item.role}</p>
                        </div>
                        <div class="search-result-actions">
                            <a href="${item.url}" class="btn btn-primary" style="padding: 5px 10px; font-size: 0.75rem;">Go</a>
                        </div>
                    `;
                    searchResultsContainer.appendChild(div);
                });
                searchResultsContainer.classList.remove('hidden');
            } else {
                searchResultsContainer.classList.add('hidden');
            }
        });
        
        document.addEventListener('click', (e) => {
            if(!searchInput.contains(e.target)) searchResultsContainer.classList.add('hidden');
        });
    }
    
    // 7. Hero Image Slider Logic
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if(sliderWrapper) {
        const slides = document.querySelectorAll('.slide');
        let currentSlide = 0;
        
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 4000);
    }

});
