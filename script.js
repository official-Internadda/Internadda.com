// ---------------------------------------------
// Website Main Script (Optimized for Mobile & Performance)
// ---------------------------------------------

// --- GLOBAL SEARCH DATA AND LOGIC ---

// Utility function to get the correct path prefix for assets based on the current page depth
function getRelativePath(targetPath) {
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(p => p.length > 0);

    // Check if the current path is inside a folder (e.g., /courses/ or /intern/etc.)
    const depth = segments.length > 1 && currentPath.endsWith('/') ? segments.length - 1 : segments.length;

    let prefix = '';
    // Determine the necessary relative path prefix
    if (depth >= 2) {
        prefix = '../'.repeat(depth - 1);
    }
    
    // Ensure the target path is root-relative for clean joining
    const cleanTargetPath = targetPath.startsWith('/') ? targetPath.substring(1) : targetPath;
    
    return prefix + cleanTargetPath;
}

// Hardcoded data for search
const allSearchableItems = [
    // Courses
    { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "/courses/courses/Essential%20Data%20Science%20Intern%20Course.html" },
    { type: 'course', title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "/courses/courses/Ethical-Hacking-Mastery.html" },
    { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "/courses/courses/Python-Essentials-for-All.html" },
    
    // Internships
    { type: 'internship', title: 'Data Science & Analytics', roles: 'Data Analyst, Data Scientist Intern', url: '/intern/internship.html#tests', image: '/images/test_data Science.png', practiceUrl: '/intern/data_science_practice_test.html', finalExamUrl: '/intern/payment_page_data_science.html' },
    { type: 'internship', title: 'Artificial Intelligence & ML', roles: 'AI Intern, Machine Learning Intern', url: '/intern/internship.html#tests', image: '/images/test_Artificial Intelligence.png', practiceUrl: '/intern/ai_ml_practice_test.html', finalExamUrl: '/intern/payment_page_ai_ml.html' },
    { type: 'internship', title: 'Python Dev & Software Eng', roles: 'Python Developer, Backend Developer', url: '/intern/internship.html#tests', image: '/images/test_Python Development.png', practiceUrl: '/intern/python_dev_practice_test.html', finalExamUrl: '/intern/payment_page_python.html' },
    { type: 'internship', title: 'Cloud Computing & DevOps', roles: 'Cloud Engineer, DevOps Intern', url: '/intern/internship.html#tests', image: '/images/test_Cloud Computing.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'Cybersecurity & Ethical Hacking', roles: 'Security Analyst, Pentester', url: '/intern/internship.html#tests', image: '/images/test_Cybersecurity & Ethical Hacking.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'Web & Mobile Development', roles: 'Frontend, React/Angular Dev', url: '/intern/internship.html#tests', image: '/images/test_Web & Mobile Development.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'UI/UX Design & Product Design', roles: 'UI/UX Designer, Product Intern', url: '/intern/internship.html#tests', image: '/images/test_UIUX Design & Product Design.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'Digital Marketing & Growth Hacking', roles: 'SEO, SEM, Social Media Intern', url: '/intern/internship.html#tests', image: '/images/test_Digital Marketing & Growth Hacking.png', practiceUrl: '#', finalExamUrl: '#' }
];

function renderSearchResults(query) {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;

    const q = query.toLowerCase().trim();

    // --- Redirect condition for quick actions ---
    if (q === "all courses") {
        window.location.href = getRelativePath('/courses/course.html');
        return;
    }
    if (q === "all internships" || q === "internships") {
        window.location.href = getRelativePath('/intern/internship.html');
        return;
    }

    searchResultsContainer.classList.add('hidden');
    searchResultsContainer.innerHTML = '';

    if (q.length < 2) return;

    // Filter to only include 'internship' types and limit results
    const displayResults = allSearchableItems.filter(item =>
        (item.type === 'internship') &&
        (item.title.toLowerCase().includes(q) || (item.roles && item.roles.toLowerCase().includes(q)))
    ).slice(0, 8);

    if (displayResults.length === 0) {
        searchResultsContainer.innerHTML = `<p style="padding: 10px 15px; color: var(--gray);">No related internships found for "${query}".</p>`;
        searchResultsContainer.classList.remove('hidden');
        return;
    }

    displayResults.forEach(item => {
        let itemHtml = '';
        
        if (item.type === 'internship') {
            const imgSrc = getRelativePath(item.image);
            const practiceUrl = item.practiceUrl === '#' ? '#' : getRelativePath(item.practiceUrl);
            const finalExamUrl = item.finalExamUrl === '#' ? '#' : getRelativePath(item.finalExamUrl);
            const isDisabled = item.practiceUrl === '#' && item.finalExamUrl === '#';

            itemHtml = `
                <div class="search-result-item internship-result">
                    <div>
                        <img src="${imgSrc}" alt="${item.title}" style="height: 60px; width: 60px; object-fit: contain;" onerror="this.onerror=null;this.src='${getRelativePath('/images/logo.jpg')}'">
                        <div>
                            <h4><i class="fas fa-briefcase" style="margin-right: 5px; color: var(--primary);"></i> ${item.title} Internship</h4>
                            <p>Roles: ${item.roles}</p>
                        </div>
                    </div>
                    <div class="search-result-actions">
                         <a href="${practiceUrl}" class="search-action-link btn btn-transparent ${isDisabled ? 'disabled' : ''}">${item.practiceUrl === '#' ? 'Practice (Soon)' : 'Practice Test'}</a>
                         <a href="${finalExamUrl}" class="search-action-link btn btn-primary ${isDisabled ? 'disabled' : ''}">${item.finalExamUrl === '#' ? 'Final Exam (Soon)' : 'Final Exam'}</a>
                    </div>
                </div>
            `;
        }
        // Courses are excluded from search results per previous requirement logic
        
        searchResultsContainer.innerHTML += itemHtml;
    });

    searchResultsContainer.classList.remove('hidden');
}


// --- OPTIMIZED INFINITE SCROLL LOGIC ---

/**
 * Sets up a smooth, continuous infinite scroll for a container.
 * Automatically clones content to ensure a seamless loop.
 * @param {string} containerId - The ID of the container to scroll.
 * @param {number} speed - Scroll speed in pixels per frame (default: 1).
 */
function setupInfiniteScroll(containerId, speed = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Duplicate Content for Seamless Looping
    // Clone the existing children and append them to the end
    const originalContent = Array.from(container.children);
    
    // Only activate if there is content to scroll
    if (originalContent.length === 0) return;

    originalContent.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('cloned-item'); // Mark as clone if styling needed
        container.appendChild(clone);
    });

    // 2. Configure Container Styles via JS to ensure functionality
    container.style.display = 'flex';
    container.style.flexWrap = 'nowrap';
    container.style.overflowX = 'hidden'; // Hide native scrollbar
    
    // 3. Animation Loop
    let scrollPos = 0;
    
    function animate() {
        scrollPos += speed;
        
        // The scrollable width is now roughly double the original content width.
        // Once we've scrolled past the first set of items (half the total scrollWidth),
        // we instantly reset to 0. Because the cloned items are identical, this is invisible.
        const resetThreshold = container.scrollWidth / 2;
        
        if (scrollPos >= resetThreshold) {
            scrollPos = 0;
        }
        
        container.scrollLeft = scrollPos;
        requestAnimationFrame(animate);
    }
    
    // Start the loop
    requestAnimationFrame(animate);
}


// --- CORE INITIALIZATION ---

document.addEventListener('DOMContentLoaded', function() {
    
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    
    // 1. Infinite Scroll Initializations
    // Initialize Testimonial Carousels
    setupInfiniteScroll('testimonialsGrid', 1); 
    setupInfiniteScroll('internshipTestimonialsGrid', 1);
    
    // Initialize Partner Logos
    // Ensure your HTML container has id="partnerLogoMarquee"
    const partnerMarquee = document.querySelector('.logo-marquee');
    if (partnerMarquee) {
        if (!partnerMarquee.id) partnerMarquee.id = 'partnerLogoMarquee';
        setupInfiniteScroll('partnerLogoMarquee', 0.8); // Slightly slower for logos
    }


    // 2. Hamburger Menu Toggle
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            // Prevent body scroll when mobile menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // Close menu if a link is clicked
        navMenu.querySelectorAll('a.nav-link:not(.dropdown-toggle), .dropdown-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    hamburgerMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        });
    }

    // 3. Desktop & Mobile Dropdown Logic
    const allDropdownContainers = document.querySelectorAll('.nav-item.dropdown');
    
    allDropdownContainers.forEach(dropdownContainer => {
        const toggle = dropdownContainer.querySelector('.dropdown-toggle');
        const content = dropdownContainer.querySelector('.dropdown-content');
        const arrow = dropdownContainer.querySelector('.dropdown-arrow');
        
        if (toggle && content) {
            toggle.addEventListener('click', function(event) {
                const isMobile = window.innerWidth <= 1024;
                
                // Close other dropdowns first (Desktop only behavior mostly)
                if (!isMobile) {
                    document.querySelectorAll('.nav-item.dropdown .dropdown-content').forEach(otherContent => {
                        if (otherContent !== content) {
                            otherContent.style.display = 'none';
                            const otherArrow = otherContent.closest('.nav-item.dropdown').querySelector('.dropdown-arrow');
                            if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                        }
                    });
                }

                // Toggle current
                const isVisible = content.style.display === 'block';
                content.style.display = isVisible ? 'none' : 'block';
                if (arrow) {
                    arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                }
                
                event.preventDefault();
                event.stopPropagation();
            });
        }
    });
    
    // Close dropdowns when clicking outside (Desktop)
    document.addEventListener('click', function(event) {
         if (window.innerWidth > 1024) {
             document.querySelectorAll('.nav-item.dropdown .dropdown-content').forEach(content => {
                 const parentDropdown = content.closest('.nav-item.dropdown');
                 if (parentDropdown && !parentDropdown.contains(event.target)) {
                     content.style.display = 'none';
                     const arrow = parentDropdown.querySelector('.dropdown-arrow');
                     if (arrow) arrow.style.transform = 'rotate(0deg)';
                 }
             });
         }
    });

    // 4. Search Functionality
     if (searchInput && searchResultsContainer) {
         searchInput.addEventListener('input', (e) => {
             renderSearchResults(e.target.value);
         });
         
         // Enter key support
         searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                const q = searchInput.value.toLowerCase().trim();
                if (q === "all courses" || q === "courses") {
                    window.location.href = getRelativePath('/courses/course.html');
                    event.preventDefault();
                } else if (q === "all internships" || q === "internships") {
                    window.location.href = getRelativePath('/intern/internship.html');
                    event.preventDefault();
                }
            }
        });

         // Close search results when clicking outside
         document.addEventListener('click', (e) => {
             if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                 searchResultsContainer.classList.add('hidden');
             }
         });
     }
     
    // 5. Header Scroll Animation
     const headerElement = document.querySelector('header');
     if (headerElement) {
         window.addEventListener('scroll', function() {
             if (window.scrollY > 50) {
                 headerElement.classList.add('scrolled');
             } else {
                 headerElement.classList.remove('scrolled');
             }
         });
     }
});
