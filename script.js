// ==========================================================================
// INTERNADDA MASTERPIECE UI LOGIC v3.0
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    
    /* ----------------------------------------------------------------------
       1. SCROLL ANIMATIONS (The "Fade Up" Effect)
       ---------------------------------------------------------------------- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Target all elements with .fade-up class
    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });


    /* ----------------------------------------------------------------------
       2. STICKY GLASS HEADER
       ---------------------------------------------------------------------- */
    const header = document.getElementById('main-header');
    
    function handleScroll() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);


    /* ----------------------------------------------------------------------
       3. MOBILE NAVIGATION & DROPDOWNS
       ---------------------------------------------------------------------- */
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.getElementById('navMenu');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Lock body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        // Handle Mobile Dropdown Clicks
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Only activate click toggle on mobile screens
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent bubbling
                    
                    const content = toggle.nextElementSibling;
                    const isVisible = content.style.display === 'block';
                    
                    // Close all other open dropdowns first
                    document.querySelectorAll('.dropdown-content').forEach(c => {
                        if (c !== content) c.style.display = 'none';
                    });
                    
                    // Toggle current dropdown
                    content.style.display = isVisible ? 'none' : 'block';
                }
            });
        });
    }


    /* ----------------------------------------------------------------------
       4. HERO IMAGE SLIDER (Auto-Play & Dots)
       ---------------------------------------------------------------------- */
    const sliderWrapper = document.querySelector('.slider-wrapper');
    if (sliderWrapper) {
        const dots = document.querySelectorAll('.dot');
        const totalSlides = dots.length;
        let currentIndex = 0;
        let slideInterval;

        const updateSlider = () => {
            sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        };

        // Start Auto-play
        slideInterval = setInterval(nextSlide, 5000);

        // Manual Navigation (Clicking dots)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(slideInterval); // Reset timer on manual click
                currentIndex = index;
                updateSlider();
                slideInterval = setInterval(nextSlide, 5000); // Restart timer
            });
        });
    }


    /* ----------------------------------------------------------------------
       5. TESTIMONIAL AUTO-SCROLLER
       ---------------------------------------------------------------------- */
    const testimonialContainer = document.querySelector('.testimonial-scroller');
    
    if (testimonialContainer) {
        // Clone items to create an infinite loop effect
        const items = Array.from(testimonialContainer.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            testimonialContainer.appendChild(clone);
        });

        let scrollPos = 0;
        const speed = 0.5; // Pixels per frame
        let isHovered = false;

        function autoScrollTestimonials() {
            if (!isHovered) {
                scrollPos += speed;
                // Reset scroll when we reach halfway (end of original set)
                if (scrollPos >= testimonialContainer.scrollWidth / 2) {
                    scrollPos = 0;
                }
                testimonialContainer.scrollLeft = scrollPos;
            }
            requestAnimationFrame(autoScrollTestimonials);
        }

        // Start scrolling
        requestAnimationFrame(autoScrollTestimonials);

        // Pause on hover for readability
        testimonialContainer.addEventListener('mouseenter', () => isHovered = true);
        testimonialContainer.addEventListener('mouseleave', () => {
            isHovered = false;
            scrollPos = testimonialContainer.scrollLeft; // Sync position
        });
        
        // Handle touch events
        testimonialContainer.addEventListener('touchstart', () => isHovered = true);
        testimonialContainer.addEventListener('touchend', () => isHovered = false);
    }


    /* ----------------------------------------------------------------------
       6. GLOBAL SEARCH FUNCTIONALITY
       ---------------------------------------------------------------------- */
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // Database of searchable content
    const searchData = [
        { title: 'Data Science Intern Course', url: 'courses/courses/Essential Data Science Intern Course.html', type: 'Course' },
        { title: 'Python Essentials for All', url: 'courses/courses/Python-Essentials-for-All.html', type: 'Course' },
        { title: 'Generative AI Masterclass', url: 'courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html', type: 'Course' },
        { title: 'Ethical Hacking Mastery', url: 'courses/courses/Ethical-Hacking-Mastery.html', type: 'Course' },
        { title: 'Data Science Internship', url: 'intern/internship.html', type: 'Internship' },
        { title: 'Web Development Internship', url: 'intern/internship.html', type: 'Internship' },
        { title: 'Python Developer Internship', url: 'intern/internship.html', type: 'Internship' },
        { title: 'AI & ML Internship', url: 'intern/internship.html', type: 'Internship' },
        { title: 'ATS Score Checker', url: 'https://check-ats.internadda.com/', type: 'Tool' },
        { title: 'Resume Builder', url: 'https://cv-builder.internadda.com/', type: 'Tool' }
    ];

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = '';

            if (query.length > 1) {
                const filtered = searchData.filter(item => item.title.toLowerCase().includes(query));
                
                if (filtered.length > 0) {
                    searchResults.classList.remove('hidden');
                    filtered.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';
                        // Using flexbox inline styles for the result item layout
                        div.innerHTML = `
                            <a href="${item.url}" style="display:block; width:100%; text-decoration:none; color: inherit;">
                                <h4 style="margin:0; font-size:0.95rem;">${item.title}</h4>
                                <p style="margin:0; font-size:0.8rem; color:#64748B;">${item.type}</p>
                            </a>
                        `;
                        searchResults.appendChild(div);
                    });
                } else {
                    searchResults.innerHTML = '<div style="padding:12px; color:#64748B; text-align:center;">No results found.</div>';
                    searchResults.classList.remove('hidden');
                }
            } else {
                searchResults.classList.add('hidden');
            }
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
        
        // Handle "Enter" key redirection for quick access
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = searchInput.value.toLowerCase();
                if (val.includes('course')) window.location.href = 'courses/course.html';
                else if (val.includes('intern')) window.location.href = 'intern/internship.html';
            }
        });
    }

});
