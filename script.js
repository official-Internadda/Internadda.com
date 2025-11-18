/**
 * INTERNADDA 2.0 - CORE JAVASCRIPT
 * Modern, Performance-Optimized, and Modular.
 */

document.addEventListener('DOMContentLoaded', () => {
    initGlobalUI();
    initSearchSystem();
    initHeroSlider();
    initInfiniteMarquees();
    initScrollAnimations();
});

/* ==========================================================================
   1. GLOBAL UI (Header, Mobile Menu, Dropdowns)
   ========================================================================== */
function initGlobalUI() {
    const header = document.querySelector('header');
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');

    // A. Glassmorphism Header Scroll Effect (Performance Optimized)
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (lastScrollY > 20) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // B. Mobile Menu Toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                navMenu.style.display = 'none'; // Reset for desktop resize safety
            }
        });
    }

    // C. Mobile Dropdown Interaction
    // On mobile, we need to tap to open dropdowns since there is no hover.
    dropdowns.forEach(group => {
        const toggle = group.querySelector('.dropdown-toggle');
        const content = group.querySelector('.dropdown-content');

        if (toggle && content) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault(); // Prevent link navigation on first tap
                    e.stopPropagation();
                    
                    // Close other open dropdowns
                    dropdowns.forEach(other => {
                        if (other !== group) {
                            const otherContent = other.querySelector('.dropdown-content');
                            if(otherContent) {
                                otherContent.style.display = 'none';
                                otherContent.style.opacity = '0';
                            }
                        }
                    });

                    // Toggle current
                    const isVisible = content.style.display === 'block';
                    content.style.display = isVisible ? 'none' : 'block';
                    content.style.opacity = isVisible ? '0' : '1';
                    content.style.visibility = isVisible ? 'hidden' : 'visible';
                    content.style.transform = isVisible ? 'translateY(10px)' : 'translateY(0)';
                }
            });
        }
    });
}

/* ==========================================================================
   2. SEARCH SYSTEM (Preserved & Refined)
   ========================================================================== */
// Utility: Handle relative paths for GitHub Pages / Subfolders
function getRelativePath(targetPath) {
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(p => p.length > 0);
    const depth = segments.length > 1 && currentPath.endsWith('/') ? segments.length - 1 : segments.length;
    let prefix = (depth >= 2) ? '../'.repeat(depth - 1) : '';
    const cleanTargetPath = targetPath.startsWith('/') ? targetPath.substring(1) : targetPath;
    return prefix + cleanTargetPath;
}

const searchData = [
    // Courses
    { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "https://courses.internadda.com/" },
    { type: 'course', title: 'Generative AI & Prompt Engineering', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "https://courses.internadda.com/" },
    { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "https://courses.internadda.com/" },
    { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "https://courses.internadda.com/" },
    
    // Internships
    { type: 'internship', title: 'Data Science & Analytics', roles: 'Data Analyst, Scientist', url: '/intern/internship.html', image: '/images/test_data Science.png', practiceUrl: '/intern/data_science_practice_test.html', finalExamUrl: '/intern/payment_page_data_science.html' },
    { type: 'internship', title: 'Artificial Intelligence & ML', roles: 'AI Engineer, ML Intern', url: '/intern/internship.html', image: '/images/test_Artificial Intelligence.png', practiceUrl: '/intern/ai_ml_practice_test.html', finalExamUrl: '/intern/payment_page_ai_ml.html' },
    { type: 'internship', title: 'Python Development', roles: 'Backend Developer', url: '/intern/internship.html', image: '/images/test_Python Development.png', practiceUrl: '/intern/python_dev_practice_test.html', finalExamUrl: '/intern/payment_page_python.html' },
    { type: 'internship', title: 'Web & Mobile Development', roles: 'Frontend, React Native', url: '/intern/internship.html', image: '/images/test_Web & Mobile Development.png', practiceUrl: '#', finalExamUrl: '#' }
];

function initSearchSystem() {
    const input = document.getElementById('searchInput');
    const container = document.getElementById('searchResults');

    if (!input || !container) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        container.innerHTML = '';
        container.classList.add('hidden');

        // Quick Navigation Shortcuts
        if (query === 'courses') { window.location.href = getRelativePath('/courses/course.html'); return; }
        if (query === 'internships') { window.location.href = getRelativePath('/intern/internship.html'); return; }

        if (query.length < 2) return;

        const results = searchData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            (item.roles && item.roles.toLowerCase().includes(query))
        ).slice(0, 6);

        if (results.length === 0) {
            container.innerHTML = `<div style="padding:12px; color:var(--text-muted); font-size:0.9rem;">No results found for "${query}"</div>`;
        } else {
            results.forEach(item => {
                const imgPath = getRelativePath(item.image);
                // Check if item is internship to determine links
                let html = '';
                if (item.type === 'course') {
                    html = `
                    <a href="${item.url}" class="search-result-item">
                        <img src="${imgPath}" onerror="this.src='${getRelativePath('/images/logo.jpg')}'">
                        <div>
                            <h4>${item.title}</h4>
                            <p>Course • ${item.instructor}</p>
                        </div>
                    </a>`;
                } else {
                    const pUrl = item.practiceUrl === '#' ? '#' : getRelativePath(item.practiceUrl);
                    const fUrl = item.finalExamUrl === '#' ? '#' : getRelativePath(item.finalExamUrl);
                    html = `
                    <div class="search-result-item" style="display:block;">
                        <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                            <img src="${imgPath}" onerror="this.src='${getRelativePath('/images/logo.jpg')}'">
                            <div>
                                <h4>${item.title}</h4>
                                <p>Internship • ${item.roles}</p>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; padding-left:60px;">
                             <a href="${pUrl}" class="btn btn-transparent" style="padding:4px 12px; font-size:0.75rem;">Practice</a>
                             <a href="${fUrl}" class="btn btn-primary" style="padding:4px 12px; font-size:0.75rem;">Exam</a>
                        </div>
                    </div>`;
                }
                container.innerHTML += html;
            });
        }
        container.classList.remove('hidden');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            container.classList.add('hidden');
        }
    });
}

/* ==========================================================================
   3. HERO SLIDER (Auto-Fade)
   ========================================================================== */
function initHeroSlider() {
    const wrapper = document.querySelector('.slider-wrapper');
    const slides = document.querySelectorAll('.slide');
    if (!wrapper || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    function slide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        // Use CSS transform for hardware accelerated animation
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    setInterval(slide, 5000);
}

/* ==========================================================================
   4. INFINITE SCROLLING (Testimonials & Partners)
   ========================================================================== */
function initInfiniteMarquees() {
    // 1. Initialize Testimonial Carousel
    const tContainer = document.getElementById('testimonialsGrid');
    if (tContainer) setupInfiniteScroll(tContainer, 1.0); // Speed 1.0

    // 2. Initialize Internship Page Testimonials (if present)
    const iContainer = document.getElementById('internshipTestimonialsGrid');
    if (iContainer) setupInfiniteScroll(iContainer, 1.0);
}

function setupInfiniteScroll(container, speed) {
    // Clone content to ensure seamless loop
    const originalContent = Array.from(container.children);
    
    // If not enough content to scroll, don't animate
    if(originalContent.length < 2) return;

    // Append clones
    originalContent.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('cloned');
        container.appendChild(clone);
    });

    let scrollPos = 0;
    let isPaused = false;

    // Pause on hover
    container.addEventListener('mouseenter', () => isPaused = true);
    container.addEventListener('mouseleave', () => isPaused = false);
    container.addEventListener('touchstart', () => isPaused = true);
    container.addEventListener('touchend', () => isPaused = false);

    function animate() {
        if (!isPaused) {
            scrollPos += speed;
            // Reset logic: if we've scrolled past half the width (the original set)
            if (scrollPos >= container.scrollWidth / 2) {
                scrollPos = 0;
            }
            container.scrollLeft = scrollPos;
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

/* ==========================================================================
   5. SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate: Sections, Cards, Hero content
    const animatedElements = document.querySelectorAll('.value-card, .course-card, .testimonial-card, .section-header, .hero-content');

    animatedElements.forEach(el => {
        // Set initial state via JS so CSS doesn't hide them if JS fails
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
        observer.observe(el);
    });
}
