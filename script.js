document.addEventListener('DOMContentLoaded', function() {
    
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    
    // Mobile Menu Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Hamburger Animation
            const spans = hamburger.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
            } else {
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            }
        });
    }

    // Mobile Dropdown Accordion
    const dropdowns = document.querySelectorAll('.nav-item');
    dropdowns.forEach(item => {
        const link = item.querySelector('.dropdown-toggle');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    // Close others
                    dropdowns.forEach(other => {
                        if (other !== item) other.classList.remove('active');
                    });
                    item.classList.toggle('active');
                }
            });
        }
    });

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (val.length > 2) {
                searchResults.innerHTML = `
                    <a href="courses/course.html" class="search-result-item" style="display:block; padding:10px; border-bottom:1px solid #eee; color:#333;">
                        <strong>${val}</strong> in Courses
                    </a>
                    <a href="intern/internship.html" class="search-result-item" style="display:block; padding:10px; color:#333;">
                        <strong>${val}</strong> in Internships
                    </a>
                `;
                searchResults.classList.remove('hidden');
                searchResults.style.display = 'block';
            } else {
                searchResults.classList.add('hidden');
                searchResults.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
});
