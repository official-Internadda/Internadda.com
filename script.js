document.addEventListener('DOMContentLoaded', function() {
    
    // ==============================================
    // 1. INFINITE MARQUEE LOGIC
    // ==============================================
    function setupMarquee(elementId) {
        const container = document.getElementById(elementId);
        if (!container) return;

        const track = container.querySelector('.marquee-track');
        if (!track) return;

        // Clone items for smooth infinite loop
        const items = Array.from(track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }

    setupMarquee('companyMarquee');
    setupMarquee('studentMarquee');


window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  const main = document.getElementById("main-content");

  setTimeout(() => {
    intro.classList.add("outro");
    setTimeout(() => {
      intro.style.display = "none";
      main.style.display = "block";
      document.body.style.overflow = "auto";
    }, 700);
  }, 2400); // ⏱ Total ~2.4 sec
});


    // ==============================================
    // 2. DROPDOWN LOGIC (Desktop & Mobile Accordion)
    // ==============================================
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('span');
        
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent closing immediately
                
                // Optional: Close other open dropdowns for a cleaner "accordion" feel
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                dropdown.classList.toggle('active');
            });
        }
    });

    // Close all dropdowns when clicking anywhere else on the page
    document.addEventListener('click', (e) => {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });


    // ==============================================
    // 3. MOBILE MENU TOGGLE (Hamburger)
    // ==============================================
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            
            // Toggle Icon between Hamburger (fa-bars) and Close (fa-times)
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }


    // ==============================================
    // 4. HERO IMAGE SLIDER
    // ==============================================
    const slides = ['images/slide1.png', 'images/slide2.png', 'images/slide3.png'];
    let currentSlide = 0;
    const heroImg = document.getElementById('hero-slider');

    if (heroImg && slides.length > 0) {
        // Preload images to prevent flickering
        slides.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        setInterval(() => {
            // Step 1: Fade Out
            heroImg.style.opacity = 0;

            setTimeout(() => {
                // Step 2: Change Image Source
                currentSlide = (currentSlide + 1) % slides.length;
                heroImg.src = slides[currentSlide];
                
                // Step 3: Fade In
                heroImg.style.opacity = 1;
            }, 500); // Matches the CSS transition duration
        }, 4000); // Change slide every 4 seconds
    }

});
