document.addEventListener('DOMContentLoaded', function() {
    
    // =========================================
    // 1. SELECTORS
    // =========================================
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const dropdowns = document.querySelectorAll('.nav-item'); // For mobile accordion

    // =========================================
    // 2. MOBILE MENU TOGGLE
    // =========================================
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling to document
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active'); // Optional: for animating the icon itself
            
            // Animate Hamburger Icon
            const spans = hamburger.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                // Transform to X
                spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
                body.style.overflow = 'hidden'; // Lock body scroll
            } else {
                // Reset to Hamburger
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
                body.style.overflow = ''; // Unlock body scroll
            }
        });

        // Close menu when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !hamburger.contains(e.target)) {
                
                navMenu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
                body.style.overflow = '';
            }
        });
    }

    // =========================================
    // 3. MOBILE DROPDOWN ACCORDION
    // =========================================
    dropdowns.forEach(item => {
        const toggleLink = item.querySelector('.dropdown-toggle');
        
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                // Only activate accordion logic on mobile screens
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    e.stopPropagation(); // Stop link navigation

                    // Close other open dropdowns for accordion effect
                    dropdowns.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                        }
                    });

                    // Toggle current dropdown
                    item.classList.toggle('active');
                }
            });
        }
    });

    // =========================================
    // 4. SMART SEARCH FUNCTIONALITY
    // =========================================
    
    // Mock Data for Search - Expand this list as needed
    const searchData = [
        { title: 'Essential Data Science Intern Course', url: 'courses/courses/Essential Data Science Intern Course.html', type: 'Course' },
        { title: 'Python Essentials for All', url: 'courses/courses/Python-Essentials-for-All.html', type: 'Course' },
        { title: 'Generative AI & Prompt Engineering', url: 'courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html', type: 'Course' },
        { title: 'Ethical Hacking Mastery', url: 'courses/courses/Ethical-Hacking-Mastery.html', type: 'Course' },
        { title: 'Data Science Internship', url: 'intern/payment_page_data_science.html', type: 'Internship' },
        { title: 'AI & Machine Learning Internship', url: 'intern/payment_page_ai_ml.html', type: 'Internship' },
        { title: 'Python Developer Internship', url: 'intern/payment_page_python.html', type: 'Internship' },
        { title: 'Web Development Internship', url: 'intern/internship.html', type: 'Internship' }
    ];

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Hide if query is too short
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                searchResults.innerHTML = '';
                return;
            }

            // Filter Data
            const matches = searchData.filter(item => 
                item.title.toLowerCase().includes(query)
            ).slice(0, 5); // Limit to top 5 results

            // Render Results
            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(item => `
                    <a href="${item.url}" class="search-result-item">
                        <strong>${item.title}</strong>
                        <span style="font-size:0.8em; color:var(--text-gray); display:block;">${item.type}</span>
                    </a>
                `).join('');
                searchResults.classList.remove('hidden');
            } else {
                searchResults.innerHTML = `
                    <div style="padding:15px; color:var(--text-gray); text-align:center; font-size:0.9rem;">
                        No results found for "${query}"
                    </div>
                `;
                searchResults.classList.remove('hidden');
            }
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
        
        // Handle 'Enter' key in search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                // Redirect to courses page as a fallback search page
                window.location.href = 'courses/course.html'; 
            }
        });
    }
    
});
