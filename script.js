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

// --- MOCK INITIALIZATION DATA (Replaces old mock data arrays) ---
const INITIAL_MOCK_COURSES = [
    { title: 'Essential Data Science Intern Course', progress: 0, completed: false, url: "/courses/courses/Essential Data Science Intern Course.html" },
    { title: 'Generative AI & Prompt Engineering Masterclass', progress: 0, completed: false, url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { title: 'Ethical Hacking Mastery', progress: 0, completed: false, url: "/courses/courses/Ethical-Hacking-Mastery.html" }
];
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

    // Initialize mock courses if none exist
    const coursesPath = getUserPath('enrollments');
    const coursesSnapshot = await db.collection(coursesPath).limit(1).get();
    if (coursesSnapshot.empty) {
        const batch = db.batch();
        INITIAL_MOCK_COURSES.forEach(course => {
            const docRef = db.collection(coursesPath).doc();
            batch.set(docRef, { ...course, userId: user.uid });
        });
        INITIAL_MOCK_INTERNSHIPS.forEach(internship => {
            const docRef = db.collection(getUserPath('internships')).doc();
            batch.set(docRef, { ...internship, userId: user.uid });
        });
        await batch.commit();
    }
}

// --- UI Rendering Functions (Now uses Firestore real-time data) ---

function renderCourseProgress(coursesData) {
    const coursesListContainer = document.getElementById('coursesListContainer');
    if (!coursesListContainer) return;

    coursesListContainer.innerHTML = '';
    
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
         coursesListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">Please log in to view your courses.</p>';
         return;
    }
    
    if (coursesData.length === 0) {
        coursesListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">You are not currently enrolled in any courses. <a href="/courses/course.html" class="text-primary font-semibold">Start learning now!</a></p>';
        return;
    }

    coursesData.forEach(course => {
        let buttonHtml;
        let statusColor;
        
        // Hardcoded list for URL fallback
        const allCourses = [
            { title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "/courses/courses/Essential Data Science Intern Course.html" },
            { title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
            { title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "/courses/courses/Ethical-Hacking-Mastery.html" },
            { title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "/courses/courses/Python-Essentials-for-All.html" },
            { title: 'Cloud & DevOps Essentials', instructor: 'Lucky Kumar', image: '/images/Cloud-DevOps-Essentials.png', url: "/courses/courses/Cloud-DevOps-Essentials.html" }
        ];
        
        const courseDetails = allCourses.find(c => course.title.includes(c.title.split(' - ')[0]) || c.title.includes(course.title.split(' ').slice(0, 3).join(' '))) || { url: '/courses/course.html' };
        const courseUrl = course.url || courseDetails.url; // Prefer Firestore URL, fallback to local lookup

        if (course.completed && course.progress >= 99) {
            statusColor = 'var(--success)';
            const nameEncoded = encodeURIComponent(user.displayName || user.email.split('@')[0]);
            const courseNameEncoded = encodeURIComponent(course.title);
            const certificateUrl = `/courses/courses/certificate.html?name=${nameEncoded}&course=${courseNameEncoded}`;
            
            buttonHtml = `<a href="${certificateUrl}" target="_blank" class="btn btn-primary animate-pulse" style="padding: 8px 15px; font-size: 14px; background-color: var(--success);"><i class="fas fa-download" style="margin-right: 5px;"></i> Certificate</a>`;
        } else {
            statusColor = course.progress > 0 ? 'var(--warning)' : 'var(--primary)';
            buttonHtml = `<a href="${courseUrl}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px;">Continue Course</a>`;
        }
        
        const itemHtml = `
            <div class="data-item animated-item">
                <div style="flex-grow: 1;">
                    <h4 style="font-size: 16px; margin-bottom: 8px; color: var(--dark);">${escapeHTML(course.title)}</h4>
                    <div style="font-size: 14px; color: var(--gray); display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 600; color: ${statusColor};">${course.progress}% Complete</span>
                        <div style="flex-grow: 1; height: 8px; background-color: #e2e8f0; border-radius: 999px; max-width: 150px; overflow: hidden;">
                             <div style="height: 100%; width: ${course.progress}%; background-color: ${statusColor}; border-radius: 999px; transition: width 0.8s ease-out;"></div>
                        </div>
                    </div>
                </div>
                ${buttonHtml}
            </div>
        `;
        coursesListContainer.innerHTML += itemHtml;
    });
}

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
        let finalExamUrl = internship.finalExamUrl || '/intern/internship.html'; // Fallback
        
        // Logic to determine action button
        switch (internship.status) {
            case 'Passed':
                statusColor = 'var(--success)';
                statusText = `Qualified (${internship.score}%)`;
                // Assumes finalExamUrl points to payment, but we redirect to the actual exam results page
                const finalExamPage = finalExamUrl.replace('payment_page_', '').replace('.html', '_final_exam.html');
                actionLink = `<a href="${finalExamPage}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; background-color: var(--success);">View Results</a>`;
                break;
            case 'Failed':
                statusColor = '#c53030'; // Red
                statusText = `Not Qualified (${internship.score}%)`;
                actionLink = `<a href="${finalExamUrl}" class="btn btn-outline" style="padding: 8px 15px; font-size: 14px; border-color: #c53030; color: #c53030;">Re-attempt Exam</a>`;
                break;
            default: // Pending
                statusColor = 'var(--warning)';
                statusText = 'Awaiting Payment/Exam';
                actionLink = `<a href="${finalExamUrl}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px;">Take Exam</a>`;
                break;
        }

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

    const name = profileName.value.trim();
    const gender = profileGender.value;
    const domain = interestedDomain.value;
    let photoUrl = user.photoURL || '/images/no_image.png';

    // Image upload logic is complex and relies on Firebase Storage, so we will skip actual file upload.

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
let courseUnsubscribe;
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
        if (courseUnsubscribe) courseUnsubscribe(); 
        if (internshipUnsubscribe) internshipUnsubscribe(); 

        courseUnsubscribe = db.collection(getUserPath('enrollments'))
            .onSnapshot(snapshot => {
                const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderCourseProgress(courses);
            }, err => console.error("Firestore Courses Error:", err));

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
        if (courseUnsubscribe) { courseUnsubscribe(); courseUnsubscribe = null; }
        if (internshipUnsubscribe) { internshipUnsubscribe(); internshipUnsubscribe = null; }

        // If modal is open, show login screen
        if (authModal && authModal.classList.contains('active')) {
            if(loginSection) showSection(loginSection);
        }
        
        // Hide/Reset profile content
        const coursesListContainer = document.getElementById('coursesListContainer');
        const internshipsListContainer = document.getElementById('internshipsListContainer');
        if(coursesListContainer) coursesListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">Please log in to view your courses.</p>';
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
    courses: document.getElementById('coursesTabContent'),
    internships: document.getElementById('internshipsTabContent'),
};
const searchInput = document.getElementById('searchInput');


// Hardcoded data (used only for search/listings and lookup for progress rendering)
const allCourses = [
    { title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "/courses/courses/Essential Data Science Intern Course.html" },
    { title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "/courses/courses/Ethical-Hacking-Mastery.html" },
    { title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "/courses/courses/Python-Essentials-for-All.html" },
    { title: 'Cloud & DevOps Essentials', instructor: 'Lucky Kumar', image: '/images/Cloud-DevOps-Essentials.png', url: "/courses/courses/Cloud-DevOps-Essentials.html" }
];


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
    if (userNameHeaderMobile) userNameHeaderMobile.style.display = 'none'; // Hide text

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


// --- 🔑 AUTH & PROFILE LOGIC 🔑 ---

// Global function to show modal (used by course pages)
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
    const logoutBtnHeaderMobile = document.getElementById('logoutBtnHeaderMobile');
    
    // Mobile Login Button
    if (loginBtnMobile) loginBtnMobile.addEventListener('click', (e) => { e.preventDefault(); if(authModal) window.showLoginModal(); if (hamburgerMenu && navMenu) { hamburgerMenu.classList.remove('active'); navMenu.classList.remove('active'); } });
    // Mobile Signup Button
    if (signupBtnMobile) signupBtnMobile.addEventListener('click', (e) => { e.preventDefault(); if(authModal) authModal.classList.add('active'); if(signupSection) showSection(signupSection); document.body.style.overflow = 'hidden'; if (hamburgerMenu && navMenu) { hamburgerMenu.classList.remove('active'); navMenu.classList.remove('active'); } });
    // Mobile Profile Button (open dashboard)
    if (profileBtnHeaderMobile) profileBtnHeaderMobile.addEventListener('click', () => { if(authModal) authModal.classList.add('active'); if(dashboardSection) showSection(dashboardSection); if (hamburgerMenu && navMenu) { hamburgerMenu.classList.remove('active'); navMenu.classList.remove('active'); } document.body.style.overflow = 'hidden'; const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]'); if (profileTabBtn) profileTabBtn.click(); });
    
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
    if (profileBtnHeader) profileBtnHeader.addEventListener('click', () => { if(authModal) authModal.classList.add('active'); if(dashboardSection) showSection(dashboardSection); if(userDropdown) userDropdown.classList.remove('active'); document.body.style.overflow = 'hidden'; const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]'); if (profileTabBtn) profileTabBtn.click(); });
    
    // --- Desktop "More" Dropdown Click Handler ---
    const moreDropdown = document.querySelector('.nav-item.dropdown');
    if (moreDropdown) {
        moreDropdown.addEventListener('click', function(event) {
            const dropdownContent = this.querySelector('.dropdown-content');
            if (window.innerWidth > 1024) { 
                const isVisible = dropdownContent.style.display === 'block';
                dropdownContent.style.display = isVisible ? 'none' : 'block';
                
                const arrow = this.querySelector('.dropdown-arrow');
                if (arrow) {
                    arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                }
                event.stopPropagation();
            }
        });
    }
    document.addEventListener('click', function() {
         const dropdownContent = document.querySelector('.nav-item.dropdown .dropdown-content');
         if (dropdownContent && window.innerWidth > 1024) {
             dropdownContent.style.display = 'none';
             const arrow = document.querySelector('.nav-item.dropdown .dropdown-arrow');
             if (arrow) arrow.style.transform = 'rotate(0deg)';
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
                        console.error('Could not copy text: ', err);
                        alert(`Could not automatically copy. Your (placeholder) profile link is: ${profileUrl}`);
                    });
            } else {
                 alert(`Your (placeholder) profile link is: ${profileUrl}`);
            }
        });
    }

    // --- Tab Switching Logic ---
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
                if (tab === 'courses') {
                    db.collection(getUserPath('enrollments')).get().then(snapshot => {
                        const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        renderCourseProgress(courses);
                    }).catch(err => console.error("Error fetching course data on tab switch:", err));
                } else if (tab === 'internships') {
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
});

console.log('🚀 Internadda Script Loaded! (Firestore Real-Time Tracking Implemented)');
