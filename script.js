// ---------------------------------------------
// Firebase Auth & Firestore Logic (Compatibility SDK)
// ---------------------------------------------

// Global variables injected by the environment (Canvas system requirement)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // ATTENTION: This API key is a placeholder and MUST be replaced with a valid Firebase API Key for authentication to work.
    apiKey: "AIzaSyCEas4FDRozXwhnzKeCz09LQnyCjY1twh4",
    authDomain: "internadda-c7217.firebaseapp.com",
    projectId: "internadda-c7217",
    // Placeholder config - replace with actual production values if possible
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App and Services
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    // Set Firestore log level to debug for development visibility
    firebase.firestore.setLogLevel('debug'); 
}

const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Utility to ensure authenticated state before getting user data
async function getAuthenticatedUser() {
    if (initialAuthToken) {
        try {
            // Sign in using custom token provided by the environment
            await auth.signInWithCustomToken(initialAuthToken);
        } catch (error) {
            console.error("Custom token sign-in failed. Falling back to anonymous.", error);
            await auth.signInAnonymously();
        }
    } else if (!auth.currentUser) {
        // Fallback to anonymous sign-in if no custom token and no current user
        await auth.signInAnonymously();
    }
    return auth.currentUser;
}

// --- Firestore Data Paths ---
// Mandate: /artifacts/{appId}/users/{userId}/{collectionName}
function getUserPath(collection) {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anon-user';
    return `artifacts/${appId}/users/${userId}/${collection}`;
}

// --- MOCK INITIALIZATION DATA ---
const INITIAL_MOCK_INTERNSHIPS = [
    { title: 'Data Science & Analytics', status: 'Pending', score: 0, finalExamUrl: '/intern/payment_page_data_science.html' },
    { title: 'Artificial Intelligence & ML', status: 'Pending', score: 0, finalExamUrl: '/intern/payment_page_ai_ml.html' }
];

async function initializeUserData(user) {
    // Only run initialization if user is NOT anonymous
    if (user.isAnonymous) return;
    
    const profileRef = db.collection('users').doc(user.uid);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
        // Initialize user profile
        await profileRef.set({
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            photoUrl: user.photoURL || '/images/no_image.png',
            gender: '',
            interestedDomain: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    // Initialize mock internships if none exist
    const internshipsPath = getUserPath('internships');
    const internshipsSnapshot = await db.collection(internshipsPath).limit(1).get();
    if (internshipsSnapshot.empty) {
        const batch = db.batch();
        // NOTE: INITIAL_MOCK_COURSES logic removed entirely
        INITIAL_MOCK_INTERNSHIPS.forEach(internship => {
            const docRef = db.collection(internshipsPath).doc();
            batch.set(docRef, { ...internship, userId: user.uid });
        });
        await batch.commit();
    }
}

// --- UI Rendering Functions ---

function renderInternshipHistory(internshipsData) {
    const internshipsListContainer = document.getElementById('internshipsListContainer');
    if (!internshipsListContainer) return;
    
    internshipsListContainer.innerHTML = '';
    
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
        internshipsListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">Please log in to view your internship history.</p>';
        return;
    }

    if (internshipsData.length === 0) {
        internshipsListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">No internship application or test history found. <a href="/intern/internship.html" class="text-primary font-semibold">Start your application!</a></p>';
        return;
    }

    internshipsData.forEach(internship => {
        let statusColor;
        let actionLink;
        let statusText;
        
        // --- START OF REQUEST 1 IMPLEMENTATION ---
        // Use the stored finalExamUrl which points to the payment page by default.
        const paymentPageUrl = internship.finalExamUrl;
        
        // Logic to determine action button
        switch (internship.status) {
            case 'Passed':
                statusColor = 'var(--success)';
                statusText = `Qualified (${internship.score}%)`;
                // Link to the results page (which is the Final Exam Page HTML)
                const finalExamUrlBase = paymentPageUrl ? paymentPageUrl.replace('/intern/payment_page_', '').replace('.html', '') : 'internship';
                const finalExamPage = `/intern/${finalExamUrlBase}_final_exam.html`;
                actionLink = `<a href="${finalExamPage}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; background-color: var(--success);">View Results</a>`;
                break;
            case 'Failed':
                statusColor = '#c53030'; // Red
                statusText = `Not Qualified (${internship.score}%)`;
                // Link directly to the payment/re-attempt page
                actionLink = `<a href="${paymentPageUrl}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; border-color: #c53030; background-color: #c53030; color: white;">Re-attempt Exam</a>`;
                break;
            default: // Pending
                statusColor = 'var(--warning)';
                statusText = 'Currently Open';
                // Link directly to the payment page
                actionLink = `<a href="${paymentPageUrl}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px;">Take Exam (Fee Required)</a>`;
                break;
        }
        // --- END OF REQUEST 1 IMPLEMENTATION ---

        const itemHtml = `
            <div class="data-item animated-item">
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 16px; margin-bottom: 8px; color: var(--dark);">${escapeHTML(internship.title)} Internship</h4>
                    <div style="font-size: 14px; color: var(--gray); display: flex; align-items: center; gap: 15px;">
                        <span style="font-weight: 600; color: ${statusColor};">Status: ${statusText}</span>
                    </div>
                </div>
                ${actionLink}
            </div>
        `;
        internshipsListContainer.innerHTML += itemHtml;
    });
}

// --- Profile Update/Save Logic (Uses Firestore) ---

async function saveProfileData(user) {
    const profileName = document.getElementById('profileName');
    const profileGender = document.getElementById('profileGender');
    const interestedDomain = document.getElementById('interestedDomain');
    const profileImageInput = document.getElementById('profileImageInput');
    const userAvatarPreview = document.getElementById('userAvatarPreview');

    const name = profileName.value.trim();
    const gender = profileGender.value;
    const domain = interestedDomain.value;
    let photoUrl = user.photoURL || '/images/no_image.png';

    // NOTE ON IMAGE UPLOAD: 
    // Since Firebase Storage is disabled in this environment, 
    // we only allow local preview and rely on the existing photoUrl or default.

    const profileUpdate = {
        name: name,
        gender: gender,
        interestedDomain: domain,
        photoUrl: photoUrl, // Keep existing or default URL
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('users').doc(user.uid).set(profileUpdate, { merge: true });
        // Update user's display name in Firebase Auth too
        await user.updateProfile({ displayName: name }); 
        
        // Refresh UI
        await loadProfileData(user); // Wait for profile data to reload
        
        // Show success message
        const successElement = document.getElementById('profileEditSection').closest('.auth-section').querySelector('.error');
        if (successElement) {
             successElement.style.backgroundColor = '#d1f7e0'; 
             successElement.style.borderColor = 'var(--success)';
             successElement.style.color = 'var(--dark)';
             showError(successElement, "✅ Profile updated successfully!");
        }

        // Switch views
        const profileDisplaySection = document.getElementById('profileDisplaySection');
        const profileEditSection = document.getElementById('profileEditSection');
        if(profileDisplaySection) profileDisplaySection.classList.remove('hidden'); 
        if(profileEditSection) profileEditSection.classList.add('hidden');
    } catch (error) {
        console.error("Profile save error:", error);
        const errorElement = document.getElementById('profileEditSection').querySelector('.error') || document.getElementById('loginError');
        if (errorElement) showError(errorElement, "Failed to save profile. Check connection or try again.");
    }
}

async function loadProfileData(user) {
    const profileRef = db.collection('users').doc(user.uid);
    const doc = await profileRef.get();
    
    let profileData = {};

    if (doc.exists) {
        profileData = doc.data();
    } else {
         // Fallback to minimal data if doc doesn't exist
        profileData = {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoUrl: user.photoURL || '/images/no_image.png',
            gender: 'Not specified',
            interestedDomain: 'Not specified'
        };
    }
    profileData.email = user.email; // Ensure email is current
    
    // Update both header and dashboard UI
    updateProfileUI(profileData);
}

// --- Auth State Observer (Handles profile updates and showing/hiding auth elements) ---
let internshipUnsubscribe;

// --- onAuthStateChanged: Main entry point for UI updates ---
auth.onAuthStateChanged(async (user) => {
    // 1. Manage UI for auth status (Desktop & Mobile)
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const authButtonsMobile = document.getElementById('authButtonsMobile');
    const userProfileMobile = document.getElementById('userProfileMobile');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginSection = document.getElementById('loginSection');
    
    if (user && !user.isAnonymous) {
        // --- User is signed in ---
        if(authButtons) authButtons.classList.add('hidden');
        if(userProfile) userProfile.classList.remove('hidden');
        if(authButtonsMobile) authButtonsMobile.style.display = 'none'; 
        if(userProfileMobile) userProfileMobile.classList.remove('hidden'); 

        // Check/Initialize user's data on first login
        await initializeUserData(user);
        await loadProfileData(user);

        // 2. Setup real-time listeners for dashboard data
        if (internshipUnsubscribe) internshipUnsubscribe(); 

        internshipUnsubscribe = db.collection(getUserPath('internships'))
            .onSnapshot(snapshot => {
                const internships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderInternshipHistory(internships);
            }, err => console.error("Firestore Internships Error:", err));

        // Redirect to dashboard if modal is active, or close modal if showing login/signup
        if (authModal && authModal.classList.contains('active') && (loginSection.classList.contains('active') || signupSection.classList.contains('active'))) {
             if(dashboardSection) showSection(dashboardSection);
        }

    } else {
        // --- User is signed out or anonymous ---
        if(authButtons) authButtons.classList.remove('hidden');
        if(userProfile) userProfile.classList.add('hidden');
        if(authButtonsMobile) authButtonsMobile.style.display = 'flex'; 
        if(userProfileMobile) userProfileMobile.classList.add('hidden'); 

        // 3. Clear listeners when logged out
        if (internshipUnsubscribe) { internshipUnsubscribe(); internshipUnsubscribe = null; }

        // If modal is open, show login screen
        if (authModal && authModal.classList.contains('active')) {
            if(loginSection) showSection(loginSection);
        }
        
        // Hide/Reset profile content
        const internshipsListContainer = document.getElementById('internshipsListContainer');
        if(internshipsListContainer) internshipsListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">Please log in to view your internship history.</p>';
    }

    // 4. Handle full page access gate
    const isProtectedPage = window.location.pathname.includes('/courses/course.html') || window.location.pathname.includes('/intern/internship.html');
    const fullPageGate = document.getElementById('fullPageGate');
    const mainContentArea = document.querySelector('.courses-grid') || document.querySelector('.courses-list') || document.querySelector('.courses');

    if (isProtectedPage) {
        if (user && !user.isAnonymous) {
            if (fullPageGate) fullPageGate.classList.add('hidden');
            if (mainContentArea) mainContentArea.style.display = 'grid'; 
        } else {
            if (!fullPageGate) {
                // This logic block handles creating the gate if the main page didn't define it
                const container = document.querySelector('main .courses .container') || document.querySelector('main .value-prop .container');
                if (container) {
                    const gate = document.createElement('div');
                    gate.id = 'fullPageGate';
                    gate.innerHTML = `
                         <div class="login-gate" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--light); z-index: 10; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; text-align: center; border-radius: 14px; min-height: 500px;">
                           <i class="fas fa-lock" style="font-size: 4rem; color: var(--primary); margin-bottom: 30px;"></i>
                            <h2 style="font-size: 2.2rem; color: var(--dark); margin-bottom: 20px;">Login Required to View This Content</h2>
                           <p style="font-size: 1.2rem; color: var(--gray); max-width: 600px; margin-bottom: 30px;">Please sign in or create an account to view courses and apply for internships.</p>
                           <button class="btn btn-primary" id="fullPageLoginButton">Sign In Now</button>
                          </div>
                      `;
                    container.style.position = 'relative';
                    container.appendChild(gate);
                    
                    document.getElementById('fullPageLoginButton').addEventListener('click', () => {
                         const loginBtnHeader = document.getElementById('loginBtnHeader');
                         if(loginBtnHeader) loginBtnHeader.click();
                    });
                }
            } else {
                fullPageGate.classList.remove('hidden');
            }
            if (mainContentArea) mainContentArea.style.display = 'none';
        }
    }
});


// --- DOM Elements (Repeated for local use) ---
const authModal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('closeModal');
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const dashboardSection = document.getElementById('dashboardSection');

const loginBtnHeader = document.getElementById('loginBtnHeader');
const signupBtnHeader = document.getElementById('signupBtnHeader');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const emailLoginBtn = document.getElementById('emailLoginBtn');
const emailSignupBtn = document.getElementById('emailSignupBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleSignupBtn = document.getElementById('googleSignupBtn');
const logoutBtnHeader = document.getElementById('logoutBtnHeader');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navMenu = document.querySelector('.nav-menu');
const profileBtnHeader = document.getElementById('profileBtnHeader');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const loginLoading = document.getElementById('loginLoading');
const signupLoading = document.getElementById('signupLoading');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const userProfile = document.getElementById('userProfile');
const userAvatarHeader = document.getElementById('userAvatarHeader');
const userNameHeader = document.getElementById('userNameHeader');
const userDropdown = document.getElementById('userDropdown');
const userAvatarDashboard = document.getElementById('userAvatarDashboard');
const userNameDashboard = document.getElementById('userNameDashboard');
const userEmailDashboard = document.getElementById('userEmailDashboard');
const profileName = document.getElementById('profileName');
const profileGender = document.getElementById('profileGender');
const interestedDomain = document.getElementById('interestedDomain');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileDisplaySection = document.getElementById('profileDisplaySection');
const profileEditSection = document.getElementById('profileEditSection');
const userAvatarPreview = document.getElementById('userAvatarPreview');
const profileImageInput = document.getElementById('profileImageInput');
const editProfileBtn = document.getElementById('editProfileBtn'); 
const tabButtons = document.querySelectorAll('.tab-btn');
const tabsContent = {
    profile: document.getElementById('profileTabContent'),
    internships: document.getElementById('internshipsTabContent'),
};
const searchInput = document.getElementById('searchInput');
const searchResultsContainer = document.getElementById('searchResults');


// --- GLOBAL SEARCH DATA AND LOGIC ---

// Utility function to get the correct path prefix (Handles nested directories like /courses/courses/FILE)
function getRelativePath(targetPath) {
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(p => p.length > 0);

    // Simple check: if we are in a subdirectory (like /courses or /intern), prepend '../'
    if (segments.length >= 2 && !currentPath.includes('.html')) {
        // Assume depth of 1 (e.g. /courses/course.html -> ../images/file.png)
        // If the current path is /courses/course.html, depth is 1
        return '../' + targetPath.replace(/^\//, '');
    } else if (segments.length >= 3) {
         // Assume depth of 2 (e.g. /courses/courses/file.html -> ../../images/file.png)
         return '../../' + targetPath.replace(/^\//, '');
    }
    // If we are at the root or already handling relative path correctly
    return targetPath;
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
    // Add other 8 internship domains here for completeness (using mock image paths)
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
        if (item.type === 'course') {
            const imgSrc = getRelativePath(item.image);
            itemHtml = `
                <a href="${item.url}" class="search-result-item course-result">
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
                         <a href="${item.practiceUrl}" class="search-action-link btn btn-outline">Practice Test</a>
                         <a href="${item.finalExamUrl}" class="search-action-link btn btn-primary">Final Exam</a>
                    </div>
                </div>
            `;
        }
        searchResultsContainer.innerHTML += itemHtml;
    });

    searchResultsContainer.classList.remove('hidden');
}


// --- BLOG POST DATA AND RENDERING ---
// Mock Blog Data (Only one folder as requested: Nov 2025)
const allBlogPosts = [
    {
        id: 1,
        title: "The Python Paradox: Why Your First Language Should Be Python",
        excerpt: "Python is simple yet versatile, making it the perfect choice for beginners in data science and web development. Explore its powerful ecosystem and community support.",
        author: "Lucky Tiwari",
        date: "2025-11-25",
        category: "Programming",
        image: "/images/Python-Essentials-for-All.png",
        content: "<p>Python's readability and vast library support truly make it a paradoxical language: easy to learn, but incredibly powerful. We delve into how it dominates fields from AI to web backend.</p><h2>The Readability Factor</h2><p>Python’s syntax mirrors English, greatly reducing the barrier to entry for new programmers. This clarity is a direct result of design philosophy. <a href='/about.html'>Learn more about Python’s philosophy.</a></p><h3>Key Libraries</h3><ul><li><strong>Pandas:</strong> For data analysis.</li><li><strong>NumPy:</strong> For numerical computing.</li></ul><p>Start your Python journey today!</p>",
        isTrending: true
    },
    {
        id: 2,
        title: "Mastering Prompt Engineering: 5 Tips for Better AI Results",
        excerpt: "Garbage in, garbage out. Learn the 5 core principles of context, clarity, constraints, iteration, and chaining to get precise, creative, and powerful outputs from Large Language Models (LLMs).",
        author: "Abhay Sharma",
        date: "2025-11-22",
        category: "AI & ML",
        image: "/images/Generative-AI-Prompt-Engineering-Masterclass.png",
        content: "<p>Prompt Engineering is the new lingua franca of AI. By carefully designing your prompts, you move from vague results to actionable insights.</p><h2>The Core Principle: Constraints</h2><p>Always tell the AI what you DON'T want, not just what you do. Limiting the output length, tone, and format dramatically improves quality.</p><h3>Use Cases</h3><p>Prompt engineering is crucial in marketing copy generation, coding assistance, and creating synthetic data for ML training.</p>",
        isTrending: true
    },
    {
        id: 3,
        title: "SQL vs. NoSQL: Choosing the Right Database for Your Project",
        excerpt: "Should you use a relational SQL database or a flexible NoSQL database? We break down the key differences for developers and data scientists.",
        author: "Pranjal Singh",
        date: "2025-11-18",
        category: "Databases",
        image: "/images/test_data Science.png",
        content: "<p>The choice between SQL and NoSQL comes down to structure. SQL excels with fixed, complex relationships, while NoSQL offers scalability and flexibility for rapidly changing data models.</p><h2>When to choose SQL</h2><p>If you need ACID compliance (Atomicity, Consistency, Isolation, Durability) and complex JOIN operations, SQL is your friend.</p>",
        isTrending: false
    },
    {
        id: 4,
        title: "Cybersecurity Fundamentals: Protecting Yourself from Phishing",
        excerpt: "Phishing attacks remain the most common entry point for cyber threats. Learn how to spot malicious emails and secure your digital identity.",
        author: "Sumit Pandey",
        date: "2025-11-15",
        category: "Cybersecurity",
        image: "/images/test_Cybersecurity & Ethical Hacking.png",
        content: "<p>Never click suspicious links! That's the golden rule. We explore the tell-tale signs of a phishing email, including generic greetings and urgent demands.</p><h2>Two-Factor Authentication is a Must</h2><p>Even if phishers steal your password, 2FA ensures they can't access your account.</p>",
        isTrending: false
    }

];

function renderBlogPosts() {
    const blogPostList = document.getElementById('blogPostList');
    const createPostBtn = document.getElementById('createPostBtn');

    if (!blogPostList) return;

    // Remove loading indicator
    const loadingPosts = document.getElementById('loadingPosts');
    if (loadingPosts) loadingPosts.remove();

    // The 'Write a New Post' button remains hidden as requested.
    if (createPostBtn) createPostBtn.classList.add('hidden');
    
    // Split into trending (top 2) and others
    const trendingPosts = allBlogPosts.filter(p => p.isTrending).slice(0, 2);
    const regularPosts = allBlogPosts.filter(p => !p.isTrending);

    let trendingHtml = '';
    if (trendingPosts.length > 0) {
        trendingHtml = `
            <h2 class="section-title" style="margin-top: 20px; margin-bottom: 30px;">🔥 Trending Articles</h2>
            <div class="courses-grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); margin-bottom: 60px;">
        `;
        trendingPosts.forEach(post => {
            const imgSrc = getRelativePath(post.image);
            trendingHtml += `
                <a href="post.html?id=${post.id}" class="course-card" style="text-decoration:none; color:inherit;">
                    <div class="course-image">
                        <img src="${imgSrc}" alt="${post.title}" onerror="this.onerror=null;this.src='${getRelativePath('/images/logo.jpg')}'">
                    </div>
                    <div class="course-content">
                        <h3 class="course-title" style="color: var(--dark);">${post.title}</h3>
                        <p class="course-author">${post.excerpt}</p>
                        <div class="course-duration" style="color: var(--primary); font-weight: 600;">
                            <i class="fas fa-calendar-alt"></i> ${post.date}
                        </div>
                        <div class="course-price">
                             <span class="badge free" style="background-color: var(--warning); color: var(--dark);">TRENDING</span>
                        </div>
                    </div>
                </a>
            `;
        });
        trendingHtml += `</div>`;
    }

    let regularHtml = '';
    if (allBlogPosts.length > 0) {
        regularHtml = `<h2 class="section-title" style="margin-top: 20px; margin-bottom: 30px;">📚 All Articles</h2>`;
        
        allBlogPosts.forEach(post => {
            const imgSrc = getRelativePath(post.image);
            regularHtml += `
                <a href="post.html?id=${post.id}" class="blog-post-card" style="text-decoration:none; color:inherit;">
                    <div class="blog-card-image">
                        <img src="${imgSrc}" alt="${post.title}" onerror="this.onerror=null;this.src='${getRelativePath('/images/logo.jpg')}'">
                    </div>
                    <div class="blog-card-content">
                        <h3 class="blog-card-title">${post.title}</h3>
                        <p class="blog-card-excerpt">${post.excerpt}</p>
                        <div class="blog-card-meta">
                            <span><i class="fas fa-user-edit"></i> ${post.author}</span>
                            <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                            <span><i class="fas fa-tag"></i> ${post.category}</span>
                        </div>
                    </div>
                </a>
            `;
        });
    }

    blogPostList.innerHTML = trendingHtml + regularHtml;
    
    // Render single post content if on post.html
    if (window.location.pathname.includes('/blog/post.html')) {
        renderSingleBlogPost();
    }
}

function renderSingleBlogPost() {
    const params = new URLSearchParams(window.location.search);
    const postId = parseInt(params.get('id'));
    const post = allBlogPosts.find(p => p.id === postId);
    const blogPostFull = document.getElementById('blogPostFull');
    
    if (!blogPostFull) return;
    
    if (post) {
        const imgSrc = getRelativePath(post.image);
        blogPostFull.innerHTML = `
            <h1 class="blog-post-title">${post.title}</h1>
            <div class="blog-post-meta">
                <span><i class="fas fa-user-edit"></i> ${post.author}</span>
                <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                <span><i class="fas fa-tag"></i> ${post.category}</span>
            </div>
            <div class="blog-post-image">
                <img src="${imgSrc}" alt="${post.title}" onerror="this.onerror=null;this.src='${getRelativePath('/images/logo.jpg')}'">
            </div>
            <div class="blog-post-content">
                ${post.content}
            </div>
        `;
    } else {
        blogPostFull.innerHTML = `<h1 class="blog-post-title" style="color: #c53030;">Post Not Found</h1><p style="text-align: center;">The requested blog post could not be located.</p>`;
    }
}

// --- Helper Functions (Defined after global elements for scoping) ---
function showSection(sectionElement) {
    if (!sectionElement) return;
    const parentModalContent = sectionElement.closest('.modal-content');
    if (parentModalContent) {
        parentModalContent.querySelectorAll('.auth-section').forEach(sec => sec.classList.remove('active'));
    }
    sectionElement.classList.add('active');
}
function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => { element.style.display = 'none'; }, 5000);
}
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
function handleImagePreview(event) {
    const file = event.target.files[0];
    if (file && userAvatarPreview) {
        // NOTE: Actual image upload to Firebase Storage is required here for persistence.
        // Since Firebase Storage is not implemented in this mock environment, 
        // this only provides a local preview.
        const reader = new FileReader();
        reader.onload = (e) => { userAvatarPreview.src = e.target.result; };
        reader.readAsDataURL(file);
    }
}
function updateProfileUI(profileData) {
    const avatarUrl = profileData.photoUrl || '/images/no_image.png';
    const userName = profileData.name || 'User';

    // Desktop Header
    if (userAvatarHeader) userAvatarHeader.src = avatarUrl;
    if (userNameHeader) userNameHeader.textContent = userName.split(' ')[0];

    // Mobile Header (Hide text in the active menu view)
    const userAvatarHeaderMobile = document.getElementById('userAvatarHeaderMobile');
    const userNameHeaderMobile = document.getElementById('userNameHeaderMobile');
    if (userAvatarHeaderMobile) userAvatarHeaderMobile.src = avatarUrl;
    // Show 'My Profile' only when the user is logged in
    if (userNameHeaderMobile) userNameHeaderMobile.textContent = userName; 

    // Dashboard
    if (userAvatarDashboard) userAvatarDashboard.src = avatarUrl;
    if (userNameDashboard) userNameDashboard.textContent = userName;
    if (userEmailDashboard) userEmailDashboard.textContent = profileData.email;
    const genderDisplay = document.getElementById('profileGenderDisplay');
    const domainDisplay = document.getElementById('profileDomainDisplay');
    if (genderDisplay) genderDisplay.textContent = profileData.gender || 'Not specified';
    if (domainDisplay) domainDisplay.textContent = profileData.interestedDomain || 'Not specified';

    // Update edit form fields
    const profileEditSectionEl = document.getElementById('profileEditSection');
    if (profileEditSectionEl && !profileEditSectionEl.classList.contains('hidden')) {
        const profileNameEl = document.getElementById('profileName');
        if(profileNameEl) profileNameEl.value = profileData.name || '';
        const profileGenderEl = document.getElementById('profileGender');
        if(profileGenderEl) profileGenderEl.value = profileData.gender || '';
        const interestedDomainEl = document.getElementById('interestedDomain');
        if(interestedDomainEl) interestedDomainEl.value = profileData.interestedDomain || '';
    }
}


// --- AUTH & PROFILE LOGIC ---

// FIX 1: Global function to show modal/dashboard for mobile hamburger
window.handleProfileClick = function() {
    if(authModal) authModal.classList.add('active');
    if(dashboardSection) showSection(dashboardSection);
    document.body.style.overflow = 'hidden'; 
    
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburgerMenu && navMenu) { 
        hamburgerMenu.classList.remove('active'); 
        navMenu.classList.remove('active'); 
    }
    
    // Ensure profile tab is the active tab when opening the dashboard
    const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]'); 
    if (profileTabBtn) profileTabBtn.click();
}

// Global function to show login modal (used by course pages)
window.showLoginModal = function() {
    if(authModal) authModal.classList.add('active');
    if(loginSection) showSection(loginSection);
    document.body.style.overflow = 'hidden';
}

// Google Login/Signup function (Consolidated logic)
async function handleGoogleAuth(errorElement) {
    try { 
        await auth.signInWithPopup(googleProvider); 
        if(authModal) authModal.classList.remove('active'); 
        document.body.style.overflow = ''; 
    } catch (error) { 
        // Display user-friendly error messages
        let errorMessage = error.message;
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Google sign-in was cancelled. Please try again.';
        } else if (error.code === 'auth/cancelled-popup-request') {
             errorMessage = 'Only one authentication window can be open at a time.';
        } else if (error.code === 'auth/operation-not-allowed') {
             errorMessage = 'Google login is not enabled for this project. Check Firebase console.';
        } else if (error.code === 'auth/network-request-failed') {
             errorMessage = 'Network error. Check your connection.';
        }
        if(errorElement) showError(errorElement, errorMessage); 
        console.error("Google Auth Error:", error.message);
    } 
}


// Login function using Email and Password
async function handleEmailLogin(e) {
    e.preventDefault(); 
    if(loginLoading) loginLoading.style.display = 'block';
    if(loginError) loginError.textContent = ''; 
    const email = loginEmail.value;
    const password = loginPassword.value;
    if (!email || !password) {
        if(loginLoading) loginLoading.style.display = 'none';
        showError(loginError, 'Email aur Password bharna zaroori hai.');
        return;
    }
    try {
        await auth.signInWithEmailAndPassword(email, password);
        if(authModal) authModal.classList.remove('active');
        document.body.style.overflow = '';
    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/wrong-password') {
             errorMessage = 'गलत पासवर्ड। कृपया पुनः प्रयास करें।';
        } else if (error.code === 'auth/user-not-found') {
             errorMessage = 'यह ईमेल पंजीकृत नहीं है।';
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'कृपया एक मान्य ईमेल दर्ज करें।';
        }
        if(loginError) showError(loginError, errorMessage);
        console.error("Login Error:", error.message);
    } finally {
        if(loginLoading) loginLoading.style.display = 'none';
    }
}

// Sign Up function using Email and Password
async function handleEmailSignup(e) {
    e.preventDefault(); 
    if(signupLoading) signupLoading.style.display = 'block';
    if(signupError) signupError.textContent = ''; 
    const email = signupEmail.value;
    const password = signupPassword.value;
    if (!email || !password) {
        if(signupLoading) signupLoading.style.display = 'none';
        showError(signupError, 'Email aur Password bharna zaroori hai.');
        return;
    }
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Initial profile creation (ensures data exists for initialization in listener)
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            name: userCredential.user.displayName || email.split('@')[0], 
            photoUrl: userCredential.user.photoURL || '/images/no_image.png',
            gender: '',
            interestedDomain: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        if(authModal) authModal.classList.remove('active'); 
        document.body.style.overflow = '';
    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
             errorMessage = 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।';
        } else if (error.code === 'auth/weak-password') {
             errorMessage = 'पासवर्ड कमज़ोर है। कृपया 6 या अधिक वर्णों का उपयोग करें।';
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = 'कृपया एक मान्य ईमेल दर्ज करें।';
        }
        if(signupError) showError(signupError, errorMessage);
        console.error("Signup Error:", error.message);
    } finally {
        if(signupLoading) signupLoading.style.display = 'none';
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', function() {
    // --- Auth Buttons & Modal Toggles ---
    if (loginBtnHeader) loginBtnHeader.addEventListener('click', (e) => { e.preventDefault(); if(authModal) window.showLoginModal(); });
    if (signupBtnHeader) signupBtnHeader.addEventListener('click', (e) => { e.preventDefault(); if(authModal) authModal.classList.add('active'); if(signupSection) showSection(signupSection); document.body.style.overflow = 'hidden'; });
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => { if(authModal) authModal.classList.remove('active'); document.body.style.overflow = ''; });
    if (authModal) window.addEventListener('click', (e) => { if (e.target === authModal) { authModal.classList.remove('active'); document.body.style.overflow = ''; } });
    if (showSignupLink) showSignupLink.addEventListener('click', (e) => { e.preventDefault(); if(signupSection) showSection(signupSection); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); if(loginSection) showSection(loginSection); });
    
    // --- Mobile Auth Button Logic
    const loginBtnMobile = document.getElementById('loginBtnHeaderMobile');
    const signupBtnMobile = document.getElementById('signupBtnHeaderMobile');
    const profileBtnHeaderMobile = document.getElementById('profileBtnHeaderMobile');
    
    // Mobile Login Button
    if (loginBtnMobile) loginBtnMobile.addEventListener('click', (e) => { e.preventDefault(); if(authModal) window.showLoginModal(); if (hamburgerMenu && navMenu) { hamburgerMenu.classList.remove('active'); navMenu.classList.remove('active'); } });
    // Mobile Signup Button
    if (signupBtnMobile) signupBtnMobile.addEventListener('click', (e) => { e.preventDefault(); if(authModal) authModal.classList.add('active'); if(signupSection) showSection(signupSection); document.body.style.overflow = 'hidden'; if (hamburgerMenu && navMenu) { hamburgerMenu.classList.remove('active'); navMenu.classList.remove('active'); } });
    // Mobile Profile Button (open dashboard)
    if (profileBtnHeaderMobile) profileBtnHeaderMobile.addEventListener('click', window.handleProfileClick); // Use the global function
    
    const handleLogout = async () => { 
        try { 
            await auth.signOut(); 
            if (hamburgerMenu && navMenu) { hamburgerMenu.classList.remove('active'); navMenu.classList.remove('active'); } 
            if (authModal) authModal.classList.remove('active'); 
            document.body.style.overflow = ''; 
        } catch (error) { 
            console.error('Logout error:', error); 
        } 
    };
    
    // Desktop and Mobile Logout Buttons
    if (document.getElementById('logoutBtnHeader')) document.getElementById('logoutBtnHeader').addEventListener('click', handleLogout);
    const logoutBtnHeaderMobile = document.getElementById('logoutBtnHeaderMobile');
    if (logoutBtnHeaderMobile) logoutBtnHeaderMobile.addEventListener('click', handleLogout);
    
    // --- Auth Actions (FIXED) ---
    // Google Auth
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleGoogleAuth(loginError));
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => handleGoogleAuth(signupError));

    // Email/Password Auth
    if (emailLoginBtn) emailLoginBtn.addEventListener('click', handleEmailLogin);
    if (emailSignupBtn) emailSignupBtn.addEventListener('click', handleEmailSignup);

    // --- User Dropdown & Navigation ---
    if (userProfile) userProfile.addEventListener('click', () => { if(userDropdown) userDropdown.classList.toggle('active'); });
    document.addEventListener('click', (e) => { if (userProfile && userDropdown && !userProfile.contains(e.target) && userDropdown.classList.contains('active')) userDropdown.classList.remove('active'); });
    if (profileBtnHeader) profileBtnHeader.addEventListener('click', window.handleProfileClick); // Use the global function
    
    // --- FIX: Universal Dropdown Click Handler ---
    const allDropdownContainers = document.querySelectorAll('.nav-item.dropdown');
    
    allDropdownContainers.forEach(dropdownContainer => {
        const toggle = dropdownContainer.querySelector('.dropdown-toggle');
        const content = dropdownContainer.querySelector('.dropdown-content');
        const arrow = dropdownContainer.querySelector('.dropdown-arrow');
        
        if (toggle && content) {
            toggle.addEventListener('click', function(event) {
                // Only run for desktop view (prevent mobile interference)
                if (window.innerWidth > 1024) { 
                    event.preventDefault(); 
                    const isVisible = content.style.display === 'block';

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
                }
            });
        }
    });
    
    // Close dropdowns when clicking anywhere else on desktop
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

    // --- Profile Editing ---
    const profileDisplaySectionEl = document.getElementById('profileDisplaySection');
    const profileEditSectionEl = document.getElementById('profileEditSection');
    if (editProfileBtn && profileDisplaySectionEl && profileEditSectionEl) { editProfileBtn.addEventListener('click', () => { profileDisplaySectionEl.classList.add('hidden'); profileEditSectionEl.classList.remove('hidden'); }); }
    if(profileImageInput && userAvatarPreview) { profileImageInput.addEventListener('change', handleImagePreview); }
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => { const user = auth.currentUser; if (user) saveProfileData(user); });

    // --- Share Profile Logic ---
    const shareProfileBtn = document.getElementById('shareProfileBtn');
    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            const profileUrl = user ? `https://www.internadda.com/profile/${user.uid}` : 'https://www.internadda.com/profile/guest';
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(profileUrl)
                    .then(() => {
                        alert("Profile Link Copied to clipboard! (Note: This is a placeholder URL)");
                    })
                    .catch(err => {
                        console.error('Could could not copy text: ', err);
                        alert(`Could not automatically copy. Your (placeholder) profile link is: ${profileUrl}`);
                    });
            } else {
                 alert(`Your (placeholder) profile link is: ${profileUrl}`);
            }
        });
    }

    // --- Tab Switching Logic (Simplified) ---
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                Object.keys(tabsContent).forEach(key => {
                    const content = tabsContent[key];
                    if(content) content.classList.add('hidden');
                });
                button.classList.add('active');
                if (tabsContent[tab]) tabsContent[tab].classList.remove('hidden');

                // Re-render content upon tab switch
                if (tab === 'internships') {
                     db.collection(getUserPath('internships')).get().then(snapshot => {
                        const internships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        renderInternshipHistory(internships);
                    }).catch(err => console.error("Error fetching internship data on tab switch:", err));
                }
            });
        });
        // Ensure profile tab is active by default in the modal
        const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]');
        if (profileTabBtn) profileTabBtn.classList.add('active');
    }
    
    // --- Global Scroll Animation for Header ---
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
     
    // --- FIX 2: Desktop Search Implementation ---
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
     
     // --- FIX 3: Blog Rendering ---
     if (window.location.pathname.includes('/blog/')) {
         renderBlogPosts();
     }
});

console.log('🚀 Internadda Script Loaded! (Firestore Real-Time Tracking, Search, and Mobile Fixes Implemented)');
