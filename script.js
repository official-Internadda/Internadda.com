// official-internadda/internadda.com/Internadda.com-42eb2d6d091fd8be3671c44c0b78359624cb4d47/script.js
// ---------------------------------------------
// Website Main Script (Auth Removed, Nav & Carousel Reworked)
// ---------------------------------------------

// --- FIREBASE / AUTH CODE COMPLETELY REMOVED ---

// --- GLOBAL SEARCH DATA AND LOGIC (Request 5) ---

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
    // Courses (Kept for broad search but de-prioritized in logic)
    { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "/courses/courses/Essential%20Data%20Science%20Intern%20Course.html" },
    { type: 'course', title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "/courses/courses/Ethical-Hacking-Mastery.html" },
    { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "/courses/courses/Python-Essentials-for-All.html" },
    
    // Internships (Priority items for search results)
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

    // MODIFIED: Filter to only include 'internship' types and limit results
    const displayResults = allSearchableItems.filter(item =>
        (item.type === 'internship') &&
        (item.title.toLowerCase().includes(q) || (item.roles && item.roles.toLowerCase().includes(q)))
    ).slice(0, 8);
    
    // --- Removed redundant interleaving logic as we only show internships now ---

    if (displayResults.length === 0) {
        // MODIFIED: Updated message to reflect search only for internships
        searchResultsContainer.innerHTML = `<p style="padding: 10px 15px; color: var(--gray);">No related internships found for "${query}".</p>`;
        searchResultsContainer.classList.remove('hidden');
        return;
    }

    displayResults.forEach(item => {
        let itemHtml = '';
        const baseItemUrl = getRelativePath(item.url);

        if (item.type === 'course') {
            const imgSrc = getRelativePath(item.image);
            itemHtml = `
                <a href="${baseItemUrl}" class="search-result-item course-result">
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

        searchResultsContainer.innerHTML += itemHtml;
    });

    searchResultsContainer.classList.remove('hidden');
}

// ✅ Ensures redirect also happens when user presses Enter
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
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
    }
});


// --- Testimonial Carousel/Auto-Scroll Logic (FIXED for seamless loop) ---

function initTestimonialCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove existing clones before re-initializing
    container.querySelectorAll('.cloned').forEach(clone => clone.remove());

    const originalCards = Array.from(container.children).filter(child => !child.classList.contains('cloned'));
    const visibleCardCount = 2; // Approximate number of cards visible on a large screen
    
    // Duplicate enough cards to guarantee seamless looping
    if (originalCards.length > 0 && originalCards.length > visibleCardCount) {
         for (let i = 0; i < originalCards.length; i++) {
             const clone = originalCards[i].cloneNode(true);
             clone.classList.add('cloned'); // Mark as clone
             
             // Update image source for clones (optional, to represent unique students)
             // This supports the user request to use student images for the visual scroll
             const img = clone.querySelector('.author-avatar');
             if (img) {
                 // Cycle through placeholder student images (assuming student1.png to studentX.png)
                 const studentIndex = (originalCards.length + i) % 6 + 1; // Cycle through 1 to 6
                 img.src = getRelativePath(`/images/student${studentIndex}.png`); 
                 img.onerror = function() { this.onerror=null; this.src=getRelativePath('/images/no_image.png'); };
             }
             
             container.appendChild(clone);
         }
    }

    // Start auto-scrolling only if there are items
    if (container.children.length > originalCards.length) {
        startAutoScroll(container, originalCards.length);
    }
}

function startAutoScroll(container, originalCount) {
    // Clear previous animation frames if they exist
    if (container.autoScrollRAF) {
        cancelAnimationFrame(container.autoScrollRAF);
    }
    
    // FIX: Increased speed from 0.5 to 1.0 for visible movement and continuous scroll
    let scrollSpeed = 1.0; // pixels per requestAnimationFrame
    let currentScroll = container.scrollLeft;
    
    // Calculate the width of the original content block. This is the reset point.
    function getOriginalContentWidth() {
         let totalWidth = 0;
         const originalChildren = Array.from(container.children).slice(0, originalCount);
         if (originalChildren.length === 0) return 0;
         
         // Measure first card's width + its margin-right/gap
         const firstCardRect = originalChildren[0].getBoundingClientRect();
         const containerStyle = window.getComputedStyle(container);
         const gap = parseFloat(containerStyle.gap) || 36;
         
         const singleCardFullWidth = firstCardRect.width + gap;
         
         // Total width of the original set excluding the last item's gap
         totalWidth = (singleCardFullWidth * originalCount) - gap;
         
         return totalWidth;
    }

    function autoScroll() {
        const resetPoint = getOriginalContentWidth();
        
        // FIX: Check against resetPoint minus scrollSpeed for smoother loop boundary detection
        if (container.scrollLeft >= resetPoint - scrollSpeed) {
            // Snap back to the visual start point (scroll position 0) instantly
            container.scrollLeft = 0;
        }
        
        container.scrollLeft += scrollSpeed;
        container.autoScrollRAF = requestAnimationFrame(autoScroll);
    }
    
    // Stop scrolling if the user manually interacts (improves UX)
    const stopScroll = () => cancelAnimationFrame(container.autoScrollRAF);
    const resumeScroll = () => {
        if (!container.isScrollingPaused) {
            container.autoScrollRAF = requestAnimationFrame(autoScroll);
        }
    };

    container.addEventListener('mouseenter', stopScroll);
    container.addEventListener('touchstart', stopScroll);
    container.addEventListener('mouseleave', resumeScroll);
    container.addEventListener('touchend', resumeScroll);
    
    container.autoScrollRAF = requestAnimationFrame(autoScroll);
}


// --- Core DOM Initialization ---

document.addEventListener('DOMContentLoaded', function() {
    
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    
    // 1. Hamburger Menu Toggle Logic
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

    // 5. Initialize Testimonial Carousels
    initTestimonialCarousel('testimonialsGrid');
    initTestimonialCarousel('internshipTestimonialsGrid');
    
    // 6. Re-initialize carousel on window resize to fix dimensions
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initTestimonialCarousel('testimonialsGrid');
            initTestimonialCarousel('internshipTestimonialsGrid');
        }, 250);
    });
    
});
