// ---------------------------------------------
// Website Main Script (Auth Removed, Nav & Carousel Reworked)
// ---------------------------------------------

// --- FIREBASE / AUTH CODE COMPLETELY REMOVED ---
// All logic related to user authentication, sign-up, login, profile dashboard, 
// and modals has been eliminated based on Request 1.

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

// Hardcoded data (used for search/listings)
const allCourses = [
    { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "/courses/courses/Essential%20Data%20Science%20Intern%20Course.html" },
    { type: 'course', title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "/courses/courses/Ethical-Hacking-Mastery.html" },
    { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "/courses/courses/Python-Essentials-for-All.html" },
    { type: 'course', title: 'Cloud & DevOps Essentials', instructor: 'Lucky Kumar', image: '/images/Cloud-DevOps-Essentials.png', url: "/courses/courses/Cloud-DevOps-Essentials.html" }
];

const allInternships = [
    { type: 'internship', title: 'Data Science & Analytics', roles: 'Data Analyst, Data Scientist Intern', url: '/intern/internship.html#tests', image: '/images/test_data Science.png', practiceUrl: '/intern/data_science_practice_test.html', finalExamUrl: '/intern/payment_page_data_science.html' },
    { type: 'internship', title: 'Artificial Intelligence & ML', roles: 'AI Intern, Machine Learning Intern', url: '/intern/internship.html#tests', image: '/images/test_Artificial Intelligence.png', practiceUrl: '/intern/ai_ml_practice_test.html', finalExamUrl: '/intern/payment_page_ai_ml.html' },
    { type: 'internship', title: 'Python Dev & Software Eng', roles: 'Python Developer, Backend Developer', url: '/intern/internship.html#tests', image: '/images/test_Python Development.png', practiceUrl: '/intern/python_dev_practice_test.html', finalExamUrl: '/intern/payment_page_python.html' }
    // Full list of 11 internship domains (kept for search completeness)
    , { type: 'internship', title: 'Cloud Computing & DevOps', roles: 'Cloud Engineer, DevOps Intern', url: '/intern/internship.html#tests', image: '/images/test_Cloud Computing.png', practiceUrl: '/intern/cloud_devops_practice_test.html', finalExamUrl: '/intern/cloud_devops_final_exam.html' }
    , { type: 'internship', title: 'Cybersecurity & Ethical Hacking', roles: 'Security Analyst, Pentester', url: '/intern/internship.html#tests', image: '/images/test_Cybersecurity & Ethical Hacking.png', practiceUrl: '/intern/cybersecurity_practice_test.html', finalExamUrl: '/intern/cybersecurity_final_exam.html' }
    , { type: 'internship', title: 'Web & Mobile Development', roles: 'Frontend, React/Angular Dev', url: '/intern/internship.html#tests', image: '/images/test_Web & Mobile Development.png', practiceUrl: '/intern/web_mobile_practice_test.html', finalExamUrl: '/intern/web_mobile_final_exam.html' }
    , { type: 'internship', title: 'UI/UX Design & Product Design', roles: 'UI/UX Designer, Product Intern', url: '/intern/internship.html#tests', image: '/images/test_UIUX Design & Product Design.png', practiceUrl: '/intern/uiux_practice_test.html', finalExamUrl: '/intern/uiux_final_exam.html' }
    , { type: 'internship', title: 'Digital Marketing & Growth Hacking', roles: 'SEO, SEM, Social Media Intern', url: '/intern/internship.html#tests', image: '/images/test_Digital Marketing & Growth Hacking.png', practiceUrl: '/intern/digital_marketing_practice_test.html', finalExamUrl: '/intern/digital_marketing_final_exam.html' }
    , { type: 'internship', title: 'Prompt Engineering & AI Innovation', roles: 'Prompt Engineer, AI Strategist', url: '/intern/internship.html#tests', image: '/images/test_Prompt Engineering.png', practiceUrl: '/intern/prompt_engineering_practice_test.html', finalExamUrl: '/intern/prompt_engineering_final_exam.html' }
    , { type: 'internship', title: 'Game Development Internship', roles: 'Unity/Unreal Developer Intern', url: '/intern/internship.html#tests', image: '/images/test_Game Development.png', practiceUrl: '/intern/game_dev_practice_test.html', finalExamUrl: '/intern/game_dev_final_exam.html' }
    , { type: 'internship', title: 'Blockchain & Web3 Dev / Fintech', roles: 'Solidity Developer, Fintech Analyst', url: '/intern/internship.html#tests', image: '/images/test_Blockchain & Web3.png', practiceUrl: '/intern/blockchain_practice_test.html', finalExamUrl: '/intern/blockchain_final_exam.html' }
];

const allSearchableItems = [...allCourses, ...allInternships];

function renderSearchResults(query) {
    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;
    const q = query.toLowerCase().trim();
    searchResultsContainer.classList.add('hidden');
    searchResultsContainer.innerHTML = '';

    if (q.length < 2) return;

    const results = allSearchableItems.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.roles && item.roles.toLowerCase().includes(q))
    ).slice(0, 8); // Limit to top 8 results

    if (results.length === 0) {
        searchResultsContainer.innerHTML = `<p style="padding: 10px 15px; color: var(--gray);">No courses or internships found for "${query}".</p>`;
        searchResultsContainer.classList.remove('hidden');
        return;
    }

    results.forEach(item => {
        let itemHtml = '';
        const courseUrl = getRelativePath(item.url);
        
        if (item.type === 'course') {
            const imgSrc = getRelativePath(item.image);
            itemHtml = `
                <a href="${courseUrl}" class="search-result-item course-result">
                    <img src="${imgSrc}" alt="${item.title}" onerror="this.onerror=null;this.src='${getRelativePath('/images/logo.jpg')}'">
                    <div>
                        <h4>${item.title}</h4>
                        <p>Course by ${item.instructor}</p>
                    </div>
                    <span class="badge free" style="flex-shrink: 0;">FREE</span>
                </a>
            `;
        } else if (item.type === 'internship') {
            const imgSrc = getRelativePath(item.image);
            const practiceUrl = getRelativePath(item.practiceUrl);
            const finalExamUrl = getRelativePath(item.finalExamUrl);
            
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
                         <a href="${practiceUrl}" class="search-action-link btn btn-outline">Practice Test</a>
                         <a href="${finalExamUrl}" class="search-action-link btn btn-primary">Final Exam</a>
                    </div>
                </div>
            `;
        }
        searchResultsContainer.innerHTML += itemHtml;
    });

    searchResultsContainer.classList.remove('hidden');
}


// --- Testimonial Carousel/Auto-Scroll Logic (Request 5) ---

function initTestimonialCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check if enough original cards exist (assuming minimal 3 cards for carousel effect)
    const originalCards = Array.from(container.children).filter(child => !child.classList.contains('cloned'));
    
    // If we already have duplicates (e.g., in index.html where they are added manually), just start scrolling
    if (container.children.length > originalCards.length) {
        startAutoScroll(container);
        return;
    }

    // Duplicate all children if less than 6 cards are present in total (for visual loop)
    if (originalCards.length > 0 && originalCards.length < 6) {
         originalCards.forEach(card => {
             const clone = card.cloneNode(true);
             clone.classList.add('cloned'); // Mark as clone to prevent re-duplication
             container.appendChild(clone);
         });
    }

    // Start auto-scrolling only if there are enough items for a carousel effect (3 original + 3 clone minimum)
    if (container.children.length >= 3) {
        startAutoScroll(container);
    }
}

function startAutoScroll(container) {
    let animationFrame;
    const scrollSpeed = 0.5; // pixels per requestAnimationFrame
    const totalContentWidth = container.scrollWidth / 2; // Scroll width of the original content

    function autoScroll() {
        // If scroll position reaches the end of the original content (start of the duplicates), reset
        if (container.scrollLeft >= totalContentWidth) {
            container.scrollLeft = 0;
        }
        container.scrollLeft += scrollSpeed;
        animationFrame = requestAnimationFrame(autoScroll);
    }
    
    // Stop scrolling if the user manually interacts (optional but improves UX)
    container.addEventListener('mouseenter', () => cancelAnimationFrame(animationFrame));
    container.addEventListener('touchstart', () => cancelAnimationFrame(animationFrame));
    container.addEventListener('mouseleave', () => animationFrame = requestAnimationFrame(autoScroll));
    container.addEventListener('touchend', () => animationFrame = requestAnimationFrame(autoScroll));
    
    animationFrame = requestAnimationFrame(autoScroll);
}


// --- Core DOM Initialization ---

document.addEventListener('DOMContentLoaded', function() {
    
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    
    // 1. Hamburger Menu Toggle Logic (Request 2)
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

    // 2. Desktop & Mobile Dropdown Logic (Handles both Tools and More)
    const allDropdownContainers = document.querySelectorAll('.nav-item.dropdown');
    
    allDropdownContainers.forEach(dropdownContainer => {
        const toggle = dropdownContainer.querySelector('.dropdown-toggle');
        const content = dropdownContainer.querySelector('.dropdown-content');
        const arrow = dropdownContainer.querySelector('.dropdown-arrow');
        
        if (toggle && content) {
            toggle.addEventListener('click', function(event) {
                const isMobile = window.innerWidth <= 1024;
                const isVisible = content.style.display === 'block';
                
                if (!isMobile) {
                    // --- DESKTOP LOGIC ---
                    event.preventDefault(); 
                    
                    // Close all other open dropdowns first
                    document.querySelectorAll('.nav-item.dropdown .dropdown-content').forEach(otherContent => {
                        if (otherContent !== content) {
                            otherContent.style.display = 'none';
                            const otherArrow = otherContent.closest('.nav-item.dropdown').querySelector('.dropdown-arrow');
                            if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                        }
                    });

                    // Toggle the clicked dropdown
                    content.style.display = isVisible ? 'none' : 'block';
                    if (arrow) {
                        arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                    event.stopPropagation();
                } else {
                    // --- MOBILE LOGIC ---
                    event.preventDefault();
                    // Toggle the clicked dropdown content display inline in the mobile menu
                    content.style.display = isVisible ? 'none' : 'block';
                    if (arrow) {
                        arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                    }
                    // Prevent the mobile menu closure if clicking a dropdown toggle
                    event.stopPropagation();
                }
            });
        }
    });
    
    // Close desktop dropdowns when clicking anywhere else 
    document.addEventListener('click', function(event) {
         if (window.innerWidth > 1024) {
             document.querySelectorAll('.nav-item.dropdown .dropdown-content').forEach(content => {
                 const parentDropdown = content.closest('.nav-item.dropdown');
                 // Check if the click is outside the dropdown container itself
                 if (parentDropdown && !parentDropdown.contains(event.target)) {
                     content.style.display = 'none';
                     const arrow = parentDropdown.querySelector('.dropdown-arrow');
                     if (arrow) arrow.style.transform = 'rotate(0deg)';
                 }
             });
         }
    });

    // 3. Desktop Search Functionality
     if (searchInput && searchResultsContainer) {
         searchInput.addEventListener('input', (e) => {
             renderSearchResults(e.target.value);
         });

         // Close search results when clicking anywhere outside
         document.addEventListener('click', (e) => {
             if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                 searchResultsContainer.classList.add('hidden');
             }
         });
     }
     
    // 4. Global Scroll Animation for Header
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

    // 5. Initialize Testimonial Carousels (Request 5)
    initTestimonialCarousel('testimonialsGrid');
    initTestimonialCarousel('internshipTestimonialsGrid');
    
    // 6. Partner Marquee Fix (Request 7 & 8)
    // The visual fix relies primarily on CSS keyframes and duplicating the content in HTML.
    // The script only ensures the container is present and the animation is running via CSS.
    
});
