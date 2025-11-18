// ---------------------------------------------
// Internadda Masterpiece UI Script v2.0
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    /* ============================
       1. SCROLL ANIMATIONS (Intersection Observer)
       ============================ */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Target all elements with the 'fade-up' class
    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });


    /* ============================
       2. STICKY GLASS HEADER
       ============================ */
    const header = document.getElementById('main-header');
    
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleScroll);


    /* ============================
       3. MOBILE MENU & DROPDOWNS
       ============================ */
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Prevent body scrolling when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Mobile Dropdown Toggles
        const dropdowns = document.querySelectorAll('.dropdown-toggle');
        dropdowns.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation();
                    const content = toggle.nextElementSibling;
                    const isVisible = content.style.display === 'block';
                    
                    // Reset others
                    document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
                    
                    // Toggle current
                    content.style.display = isVisible ? 'none' : 'block';
                    content.style.position = 'static';
                    content.style.boxShadow = 'none';
                    content.style.paddingLeft = '20px';
                    content.style.animation = 'none';
                }
            });
        });
    }


    /* ============================
       4. GLOBAL SEARCH LOGIC
       ============================ */
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');

    // Data for search
    const allSearchableItems = [
        // Courses
        { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: 'images/Essential Data Science Intern Course.png', url: "courses/courses/Essential Data Science Intern Course.html" },
        { type: 'course', title: 'Generative AI & Prompt Engineering', instructor: 'Lucky Kumar', image: 'images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
        { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: 'images/Python-Essentials-for-All.png', url: "courses/courses/Python-Essentials-for-All.html" },
        { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: 'images/Ethical-Hacking-Mastery.png', url: "courses/courses/Ethical-Hacking-Mastery.html" },
        
        // Internships
        { type: 'internship', title: 'Data Science & Analytics', roles: 'Data Analyst, Data Scientist Intern', url: 'intern/internship.html', image: 'images/test_data Science.png', practiceUrl: 'intern/data_science_practice_test.html', finalExamUrl: 'intern/payment_page_data_science.html' },
        { type: 'internship', title: 'Artificial Intelligence & ML', roles: 'AI Intern, Machine Learning Intern', url: 'intern/internship.html', image: 'images/test_Artificial Intelligence.png', practiceUrl: 'intern/ai_ml_practice_test.html', finalExamUrl: 'intern/payment_page_ai_ml.html' },
        { type: 'internship', title: 'Python Dev & Software Eng', roles: 'Python Developer, Backend Developer', url: 'intern/internship.html', image: 'images/test_Python Development.png', practiceUrl: 'intern/python_dev_practice_test.html', finalExamUrl: 'intern/payment_page_python.html' },
        { type: 'internship', title: 'Web & Mobile Development', roles: 'Frontend, React/Angular Dev', url: 'intern/internship.html', image: 'images/test_Web & Mobile Development.png' }
    ];

    function renderSearchResults(query) {
        if (!searchResultsContainer) return;

        const q = query.toLowerCase().trim();
        searchResultsContainer.innerHTML = '';

        if (q.length < 2) {
            searchResultsContainer.classList.add('hidden');
            return;
        }

        // Filter results
        const displayResults = allSearchableItems.filter(item =>
            item.title.toLowerCase().includes(q) || 
            (item.roles && item.roles.toLowerCase().includes(q))
        ).slice(0, 6);

        if (displayResults.length === 0) {
            searchResultsContainer.innerHTML = `<p style="padding: 15px; color: var(--gray); font-size: 0.9rem;">No results found for "${query}".</p>`;
            searchResultsContainer.classList.remove('hidden');
            return;
        }

        // Build HTML
        displayResults.forEach(item => {
            let itemHtml = '';
            
            if (item.type === 'course') {
                itemHtml = `
                    <a href="${item.url}" class="search-result-item course-result" style="text-decoration:none; color:inherit;">
                        <img src="${item.image}" alt="${item.title}" onerror="this.onerror=null;this.src='images/logo.jpg'">
                        <div>
                            <h4>${item.title}</h4>
                            <p style="font-size: 0.8rem; color: #64748B;">Course by ${item.instructor}</p>
                        </div>
                    </a>
                `;
            } else if (item.type === 'internship') {
                const practiceUrl = item.practiceUrl ? item.practiceUrl : '#';
                const finalUrl = item.finalExamUrl ? item.finalExamUrl : '#';
                
                itemHtml = `
                    <div class="search-result-item internship-result">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${item.image}" alt="${item.title}" style="width:40px; height:40px; object-fit:contain;">
                            <div>
                                <h4>${item.title}</h4>
                                <p style="font-size: 0.8rem; color: #64748B;">${item.roles}</p>
                            </div>
                        </div>
                        <div class="search-result-actions">
                             <a href="${practiceUrl}" class="btn btn-outline" style="font-size:0.75rem; padding:4px 10px;">Practice</a>
                             <a href="${finalUrl}" class="btn btn-primary" style="font-size:0.75rem; padding:4px 10px;">Exam</a>
                        </div>
                    </div>
                `;
            }
            searchResultsContainer.innerHTML += itemHtml;
        });

        searchResultsContainer.classList.remove('hidden');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });
        
        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                searchResultsContainer.classList.add('hidden');
            }
        });
    }


    /* ============================
       5. TESTIMONIAL AUTO-SCROLL
       ============================ */
    function initTestimonialCarousel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Clone items for infinite loop effect if not already cloned
        if (!container.classList.contains('initialized')) {
            const items = Array.from(container.children);
            items.forEach(item => {
                const clone = item.cloneNode(true);
                container.appendChild(clone);
            });
            container.classList.add('initialized');
        }

        let scrollAmount = 0;
        const scrollSpeed = 0.8; // Speed of marquee

        function autoScroll() {
            scrollAmount += scrollSpeed;
            // Reset when halfway (end of original items)
            if (scrollAmount >= container.scrollWidth / 2) {
                scrollAmount = 0;
            }
            container.scrollLeft = scrollAmount;
            requestAnimationFrame(autoScroll);
        }

        // Pause on hover
        let animationId = requestAnimationFrame(autoScroll);
        
        container.addEventListener('mouseenter', () => cancelAnimationFrame(animationId));
        container.addEventListener('mouseleave', () => {
            scrollAmount = container.scrollLeft; // Resume from current pos
            animationId = requestAnimationFrame(autoScroll);
        });
        
        // Allow touch scrolling to override auto-scroll temporarily
        container.addEventListener('touchstart', () => cancelAnimationFrame(animationId));
        container.addEventListener('touchend', () => {
            scrollAmount = container.scrollLeft;
            animationId = requestAnimationFrame(autoScroll);
        });
    }

    // Initialize Carousel
    initTestimonialCarousel('testimonialsGrid');

});
