// ---------------------------------------------
// Internadda Main Script
// ---------------------------------------------

// --- 1. HELPER FUNCTIONS ---

// Utility: Handle relative paths for assets based on current page depth
function getRelativePath(targetPath) {
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(p => p.length > 0);
    
    // Determine if we are inside a subfolder (like /courses/ or /intern/)
    // If the last segment is an HTML file, we don't count it as a directory level
    const isFile = currentPath.endsWith('.html');
    const depth = isFile ? segments.length - 1 : segments.length;

    let prefix = '';
    // Simple heuristic: if depth is 1 (e.g. /about.html), no prefix. 
    // If depth is 2 (e.g. /courses/course.html), prefix is ../
    if (depth >= 1) {
        prefix = '../'.repeat(depth);
    }
    // Fix for root: if at root, prefix is empty.
    // This is a simplified logic; adjust based on your specific hosting structure if needed.
    // For this specific project structure:
    // /index.html -> depth 0
    // /about.html -> depth 0
    // /courses/course.html -> depth 1
    
    // Force absolute paths if preferred, or refined relative logic:
    return targetPath.startsWith('/') ? targetPath : '/' + targetPath;
}

// --- 2. SEARCH DATA & LOGIC ---

const allSearchableItems = [
    // Courses
    { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: 'images/Essential Data Science Intern Course.png', url: "courses/courses/Essential%20Data%20Science%20Intern%20Course.html" },
    { type: 'course', title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: 'images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: 'images/Ethical-Hacking-Mastery.png', url: "courses/courses/Ethical-Hacking-Mastery.html" },
    { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: 'images/Python-Essentials-for-All.png', url: "courses/courses/Python-Essentials-for-All.html" },
    
    // Internships
    { type: 'internship', title: 'Data Science & Analytics', roles: 'Data Analyst, Data Scientist Intern', url: 'intern/internship.html#tests', image: 'images/test_data Science.png', practiceUrl: 'intern/data_science_practice_test.html', finalExamUrl: 'intern/payment_page_data_science.html' },
    { type: 'internship', title: 'Artificial Intelligence & ML', roles: 'AI Intern, Machine Learning Intern', url: 'intern/internship.html#tests', image: 'images/test_Artificial Intelligence.png', practiceUrl: 'intern/ai_ml_practice_test.html', finalExamUrl: 'intern/payment_page_ai_ml.html' },
    { type: 'internship', title: 'Python Dev & Software Eng', roles: 'Python Developer, Backend Developer', url: 'intern/internship.html#tests', image: 'images/test_Python Development.png', practiceUrl: 'intern/python_dev_practice_test.html', finalExamUrl: 'intern/payment_page_python.html' },
    { type: 'internship', title: 'Cloud Computing & DevOps', roles: 'Cloud Engineer, DevOps Intern', url: 'intern/internship.html#tests', image: 'images/test_Cloud Computing.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'Cybersecurity & Ethical Hacking', roles: 'Security Analyst, Pentester', url: 'intern/internship.html#tests', image: 'images/test_Cybersecurity & Ethical Hacking.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'Web & Mobile Development', roles: 'Frontend, React/Angular Dev', url: 'intern/internship.html#tests', image: 'images/test_Web & Mobile Development.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'UI/UX Design & Product Design', roles: 'UI/UX Designer, Product Intern', url: 'intern/internship.html#tests', image: 'images/test_UIUX Design & Product Design.png', practiceUrl: '#', finalExamUrl: '#' },
    { type: 'internship', title: 'Digital Marketing & Growth Hacking', roles: 'SEO, SEM, Social Media Intern', url: 'intern/internship.html#tests', image: 'images/test_Digital Marketing & Growth Hacking.png', practiceUrl: '#', finalExamUrl: '#' }
];

function renderSearchResults(query) {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;

    const q = query.toLowerCase().trim();

    // Shortcuts
    if (q === "all courses") { window.location.href = '/courses/course.html'; return; }
    if (q === "all internships" || q === "internships") { window.location.href = '/intern/internship.html'; return; }

    searchResultsContainer.classList.add('hidden');
    searchResultsContainer.innerHTML = '';

    if (q.length < 2) return;

    // Filter
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
        const imgSrc = item.image; // Assuming paths are relative to root or handled by server
        const practiceUrl = item.practiceUrl === '#' ? '#' : item.practiceUrl;
        const finalExamUrl = item.finalExamUrl === '#' ? '#' : item.finalExamUrl;
        const isDisabled = item.practiceUrl === '#' && item.finalExamUrl === '#';

        const itemHtml = `
            <div class="search-result-item internship-result">
                <div>
                    <img src="${imgSrc}" alt="${item.title}" onerror="this.src='images/logo.jpg'">
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
        searchResultsContainer.innerHTML += itemHtml;
    });

    searchResultsContainer.classList.remove('hidden');
}


// --- 3. INFINITE SCROLL LOGIC ---

/**
 * Enables seamless infinite scrolling for a horizontal container.
 * @param {string} containerId - HTML ID of the container.
 * @param {number} speed - Pixels per frame (e.g., 0.5 for slow, 2 for fast).
 */
function setupInfiniteScroll(containerId, speed = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // A. Duplicate Content
    const originalContent = Array.from(container.children);
    if (originalContent.length === 0) return;

    // Clone items to fill space and allow looping
    originalContent.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('cloned-item');
        container.appendChild(clone);
    });

    // B. Style Container via JS (to ensure it works even if CSS misses it)
    container.style.display = 'flex';
    container.style.flexWrap = 'nowrap';
    container.style.overflowX = 'hidden'; // Hide scrollbar
    
    // C. Animation Loop
    let scrollPos = 0;
    
    function animate() {
        scrollPos += speed;
        
        // The reset threshold is half the total width (the length of the original content)
        const resetThreshold = container.scrollWidth / 2;
        
        // Reset instantly to 0 when we reach the end of the first set
        if (scrollPos >= resetThreshold) {
            scrollPos = 0;
        }
        
        container.scrollLeft = scrollPos;
        requestAnimationFrame(animate);
    }
    
    // Start animation
    requestAnimationFrame(animate);
}


// --- 4. DOM INITIALIZATION ---

document.addEventListener('DOMContentLoaded', function() {
    
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    
    // --- A. Initialize Infinite Scrolls ---
    // Testimonials
    setupInfiniteScroll('testimonialsGrid', 1); 
    // Partner Logos (Make sure <div class="logo-marquee" id="partnerLogoMarquee"> exists)
    setupInfiniteScroll('partnerLogoMarquee', 0.8); 


    // --- B. Mobile Menu Toggle ---
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from immediately closing it
            
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                // Close Menu
                navMenu.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                document.body.style.overflow = 'auto'; // Re-enable body scroll
            } else {
                // Open Menu
                navMenu.classList.add('active');
                hamburgerMenu.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock body scroll
            }
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Close menu when clicking outside (on the blurred overlay part)
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }


    // --- C. Dropdown Logic (Desktop & Mobile) ---
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (toggle && content) {
            // Click event for toggle
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isVisible = content.style.display === 'block';

                // Close all other dropdowns first
                document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');

                // Toggle this one
                content.style.display = isVisible ? 'none' : 'block';
            });
        }
    });

    // Global click to close dropdowns
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
    });


    // --- D. Search Logic ---
    if (searchInput && searchResultsContainer) {
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });
        
        // Enter key redirect
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const q = searchInput.value.toLowerCase().trim();
                if (q === "all courses" || q === "courses") {
                    window.location.href = '/courses/course.html';
                    event.preventDefault();
                } else if (q === "all internships" || q === "internships") {
                    window.location.href = '/intern/internship.html';
                    event.preventDefault();
                }
            }
        });

        // Close search on outside click
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                searchResultsContainer.classList.add('hidden');
            }
        });
    }


    // --- E. Header Scroll Effect ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

});
