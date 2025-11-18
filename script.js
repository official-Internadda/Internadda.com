// ---------------------------------------------
// Internadda - Premium UI Logic
// ---------------------------------------------

// --- 1. Scroll Animations (Intersection Observer) ---
// Adds the 'visible' class to elements with .reveal-up, .reveal-in, etc. when scrolled into view
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    // Target all elements with reveal classes
    const animatedElements = document.querySelectorAll('.reveal-up, .reveal-in, .reveal-left, .reveal-right');
    animatedElements.forEach(el => observer.observe(el));

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. Carousel / Slider Logic ---
    initHeroSlider();
    initTestimonialCarousel('testimonialsGrid');
    
    // --- 3. Mobile Menu Logic ---
    initMobileMenu();

    // --- 4. Search Logic ---
    initSearch();
});


// --- Hero Slider ---
function initHeroSlider() {
    const slider = document.getElementById('heroImageSlider');
    if (!slider) return;
    
    const wrapper = slider.querySelector('.slider-wrapper');
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');
    let currentIndex = 0;
    
    function updateSlider(index) {
        wrapper.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        if(dots[index]) dots[index].classList.add('active');
        currentIndex = index;
    }

    // Auto Advance
    let interval = setInterval(() => {
        let nextIndex = (currentIndex + 1) % slides.length;
        updateSlider(nextIndex);
    }, 4000);

    // Manual Click
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            clearInterval(interval);
            updateSlider(idx);
            // Restart interval
            interval = setInterval(() => {
                let nextIndex = (currentIndex + 1) % slides.length;
                updateSlider(nextIndex);
            }, 4000);
        });
    });
}


// --- Testimonial Infinite Scroll ---
function initTestimonialCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clone items for infinite loop effect
    const originalCards = Array.from(container.children);
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('cloned');
        container.appendChild(clone);
    });

    // Animate via JS for smoothness if CSS isn't enough, 
    // but relying on the CSS animation logic provided previously or a simple RAF loop
    // Here we implement a simple RAF loop for smooth continuous scrolling
    let scrollPos = 0;
    const speed = 0.8; // pixels per frame

    function animateScroll() {
        scrollPos += speed;
        // If we've scrolled past the original width, reset
        // Assuming horizontal layout
        if (scrollPos >= (container.scrollWidth / 2)) {
            scrollPos = 0;
        }
        container.style.transform = `translateX(-${scrollPos}px)`;
        requestAnimationFrame(animateScroll);
    }
    requestAnimationFrame(animateScroll);
}


// --- Mobile Menu ---
function initMobileMenu() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active'); // You might need CSS for .active on hamburger span logic
        navMenu.classList.toggle('active');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
}


// --- Search Functionality ---
const allSearchableItems = [
    { type: 'course', title: 'Data Science Intern Course', url: "/courses/courses/Essential%20Data%20Science%20Intern%20Course.html", img: "images/Essential Data Science Intern Course.png" },
    { type: 'course', title: 'Generative AI Masterclass', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html", img: "images/Generative-AI-Prompt-Engineering-Masterclass.png" },
    { type: 'course', title: 'Python Essentials', url: "/courses/courses/Python-Essentials-for-All.html", img: "images/Python-Essentials-for-All.png" },
    { type: 'internship', title: 'Data Science Internship', url: '/intern/internship.html', img: "images/test_data Science.png" },
    { type: 'internship', title: 'AI & ML Internship', url: '/intern/internship.html', img: "images/test_Artificial Intelligence.png" },
    { type: 'internship', title: 'Web Development Internship', url: '/intern/internship.html', img: "images/test_Web & Mobile Development.png" }
];

function initSearch() {
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');

    if (!input || !resultsContainer) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';
        
        if (query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const matches = allSearchableItems.filter(item => item.title.toLowerCase().includes(query));
        
        if (matches.length === 0) {
            resultsContainer.innerHTML = `<div class="search-result-item"><p>No results found</p></div>`;
        } else {
            matches.forEach(item => {
                const div = document.createElement('a');
                div.href = item.url;
                div.className = 'search-result-item';
                div.innerHTML = `
                    <img src="${item.img}" alt="thumb">
                    <div>
                        <h4>${item.title}</h4>
                        <p>${item.type.toUpperCase()}</p>
                    </div>
                `;
                resultsContainer.appendChild(div);
            });
        }
        resultsContainer.classList.remove('hidden');
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.classList.add('hidden');
        }
    });
}
