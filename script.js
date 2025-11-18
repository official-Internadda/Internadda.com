// ---------------------------------------------
// Internadda Masterpiece Script - 2025
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================
    // 1. GLOBAL VARIABLES & UTILITIES
    // =========================================
    const hamburgerBtn = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    const header = document.querySelector('header');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');

    // Utility: Get correct path prefix based on current page depth
    function getRelativePath(targetPath) {
        const currentPath = window.location.pathname;
        // Simple check: if we are deep in a folder (e.g. /courses/), add ../
        if (currentPath.includes('/courses/') || currentPath.includes('/intern/') || currentPath.includes('/blog/')) {
             // Remove leading slash if present to append to ../
             return '../' + (targetPath.startsWith('/') ? targetPath.substring(1) : targetPath);
        }
        // Otherwise, assume root or near root
        return targetPath;
    }

    // =========================================
    // 2. MOBILE MENU & DROPDOWN LOGIC
    // =========================================
    
    // Toggle Mobile Menu
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Toggle hamburger animation spans
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
                body.style.overflow = 'hidden'; // Lock scroll
            } else {
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
                body.style.overflow = ''; // Unlock scroll
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                const spans = hamburgerBtn.querySelectorAll('span');
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
                body.style.overflow = '';
            }
        });
    }

    // Mobile Accordion for Dropdowns
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dropdown => {
        const toggleLink = dropdown.querySelector('.dropdown-toggle');
        
        if (toggleLink) {
            toggleLink.addEventListener('click', function(e) {
                // Only trigger on mobile screens (<= 1024px)
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Close other open dropdowns (Accordion style)
                    dropdowns.forEach(other => {
                        if (other !== dropdown) other.classList.remove('active');
                    });

                    dropdown.classList.toggle('active');
                }
            });
        }
    });

    // =========================================
    // 3. STICKY HEADER EFFECT
    // =========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // =========================================
    // 4. SEARCH FUNCTIONALITY
    // =========================================
    
    // Search Data
    const allSearchableItems = [
        { type: 'course', title: 'Essential Data Science Intern Course', url: '/courses/courses/Essential Data Science Intern Course.html' },
        { type: 'course', title: 'Generative AI & Prompt Engineering Masterclass', url: '/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html' },
        { type: 'course', title: 'Ethical Hacking Mastery', url: '/courses/courses/Ethical-Hacking-Mastery.html' },
        { type: 'course', title: 'Python Essentials for All', url: '/courses/courses/Python-Essentials-for-All.html' },
        { type: 'internship', title: 'Data Science & Analytics Internship', url: '/intern/payment_page_data_science.html' },
        { type: 'internship', title: 'AI & Machine Learning Internship', url: '/intern/payment_page_ai_ml.html' },
        { type: 'internship', title: 'Python Developer Internship', url: '/intern/payment_page_python.html' },
        { type: 'internship', title: 'Web Development Internship', url: '/intern/internship.html' },
        { type: 'internship', title: 'Cybersecurity Internship', url: '/intern/internship.html' }
    ];

    if (searchInput && searchResultsContainer) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            
            // Redirect shortcuts
            if (query === "all courses") {
                window.location.href = getRelativePath('/courses/course.html');
                return;
            }

            if (query.length < 2) {
                searchResultsContainer.classList.add('hidden');
                searchResultsContainer.innerHTML = '';
                return;
            }

            // Filter Results
            const results = allSearchableItems.filter(item => 
                item.title.toLowerCase().includes(query)
            ).slice(0, 6); // Limit to top 6

            // Render Results
            searchResultsContainer.innerHTML = '';
            if (results.length > 0) {
                results.forEach(item => {
                    const itemUrl = getRelativePath(item.url);
                    // Determine icon and subtitle based on type
                    const isCourse = item.type === 'course';
                    const iconClass = isCourse ? 'fa-book-open' : 'fa-briefcase';
                    const subText = isCourse ? 'Free Course' : 'Paid Internship';
                    
                    const itemHtml = `
                        <a href="${itemUrl}" class="search-result-item">
                            <div style="background: #f1f5f9; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink:0;">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div>
                                <h4>${item.title}</h4>
                                <p>${subText}</p>
                            </div>
                        </a>
                    `;
                    searchResultsContainer.innerHTML += itemHtml;
                });
                searchResultsContainer.classList.remove('hidden');
            } else {
                searchResultsContainer.innerHTML = `
                    <div style="padding: 15px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                        No results found for "${query}"
                    </div>`;
                searchResultsContainer.classList.remove('hidden');
            }
        });

        // Hide results on click outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                searchResultsContainer.classList.add('hidden');
            }
        });
        
        // Handle "Enter" key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = searchInput.value.toLowerCase().trim();
                if (q.includes('intern')) {
                     window.location.href = getRelativePath('/intern/internship.html');
                } else {
                     window.location.href = getRelativePath('/courses/course.html');
                }
            }
        });
    }

    // =========================================
    // 5. TESTIMONIAL AUTO-SCROLL (Infinite Loop)
    // =========================================
    const testimonialContainer = document.getElementById('testimonialsGrid');
    
    if (testimonialContainer) {
        // 1. Clone items for infinite effect if needed
        const originalItems = Array.from(testimonialContainer.children);
        
        // If we have enough items, duplicate them to create the loop
        if (originalItems.length > 0) {
            originalItems.forEach(item => {
                const clone = item.cloneNode(true);
                clone.classList.add('cloned');
                testimonialContainer.appendChild(clone);
            });
        }

        // 2. Auto Scroll Logic
        let scrollAmount = 0;
        const scrollSpeed = 0.8; // Pixels per frame
        let animationFrameId;

        function autoScroll() {
            scrollAmount += scrollSpeed;
            
            // If we've scrolled past the first set of items (halfway)
            // We reset to 0 to create the infinite illusion
            if (scrollAmount >= testimonialContainer.scrollWidth / 2) {
                scrollAmount = 0;
            }
            
            testimonialContainer.scrollLeft = scrollAmount;
            animationFrameId = requestAnimationFrame(autoScroll);
        }

        // Start scrolling
        animationFrameId = requestAnimationFrame(autoScroll);

        // Pause on hover/touch
        const stopScroll = () => cancelAnimationFrame(animationFrameId);
        const resumeScroll = () => {
            cancelAnimationFrame(animationFrameId); // Safety clear
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        testimonialContainer.addEventListener('mouseenter', stopScroll);
        testimonialContainer.addEventListener('mouseleave', resumeScroll);
        testimonialContainer.addEventListener('touchstart', stopScroll);
        testimonialContainer.addEventListener('touchend', resumeScroll);
    }

});
