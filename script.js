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

// --- MOCK INITIALIZATION DATA (Simulated user progress) ---
const INITIAL_MOCK_INTERNSHIPS = [
    { title: 'Data Science & Analytics', status: 'Pending', score: 0, finalExamUrl: '/intern/payment_page_data_science.html' },
    { title: 'Artificial Intelligence & ML', status: 'Pending', score: 0, finalExamUrl: '/intern/payment_page_ai_ml.html' }
];

async function initializeUserData(user) {
    if (user.isAnonymous) return;
    
    const profileRef = db.collection('users').doc(user.uid);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
        await profileRef.set({
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            photoUrl: user.photoURL || '/images/no_image.png',
            gender: '',
            interestedDomain: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    const internshipsPath = getUserPath('internships');
    const internshipsSnapshot = await db.collection(internshipsPath).limit(1).get();
    if (internshipsSnapshot.empty) {
        const batch = db.batch();
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
        
        // Use paymentPageUrl for action buttons (Apply/Re-attempt)
        const paymentPageUrl = internship.finalExamUrl; 
        
        // Logic to derive the final exam/results page URL (for 'View Results' after qualification)
        const finalExamUrlBase = paymentPageUrl ? paymentPageUrl.replace('/intern/payment_page_', '').replace('.html', '') : 'internship';
        const finalExamPage = `/intern/${finalExamUrlBase}_final_exam.html`;
        
        // Logic to determine action button
        switch (internship.status) {
            case 'Passed':
                statusColor = 'var(--success)';
                statusText = `Qualified (${internship.score}%)`;
                // Link to the actual exam results page
                actionLink = `<a href="${finalExamPage}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px; background-color: var(--success);">View Results</a>`;
                break;
            case 'Failed':
                statusColor = '#c53030'; // Red
                statusText = `Not Qualified (${internship.score}%)`;
                // Link to the PAYMENT page for re-attempt (User Request)
                actionLink = `<a href="${paymentPageUrl}" class="btn btn-outline" style="padding: 8px 15px; font-size: 14px; border-color: #c53030; color: #c53030;">Re-attempt Exam</a>`;
                break;
            default: // Pending
                statusColor = 'var(--warning)';
                statusText = 'Currently Open';
                // Link to the PAYMENT page for initial application (User Request)
                actionLink = `<a href="${paymentPageUrl}" class="btn btn-primary" style="padding: 8px 15px; font-size: 14px;">Apply Now / Take Exam</a>`;
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

    const profileUpdate = {
        name: name,
        gender: gender,
        interestedDomain: domain,
        photoUrl: photoUrl, 
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('users').doc(user.uid).set(profileUpdate, { merge: true });
        await user.updateProfile({ displayName: name }); 
        
        await loadProfileData(user); 
        
        const successElement = document.getElementById('profileEditSection').closest('.auth-section').querySelector('.error');
        if (successElement) {
             successElement.style.backgroundColor = '#d1f7e0'; 
             successElement.style.borderColor = 'var(--success)';
             successElement.style.color = 'var(--dark)';
             showError(successElement, "✅ Profile updated successfully!");
        }

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
        profileData = {
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoUrl: user.photoURL || '/images/no_image.png',
            gender: 'Not specified',
            interestedDomain: 'Not specified'
        };
    }
    profileData.email = user.email; 
    
    updateProfileUI(profileData);
}

// --- Auth State Observer (Main application routing/protection logic) ---
let internshipUnsubscribe;

auth.onAuthStateChanged(async (user) => {
    // DOM elements needed inside the listener
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const authButtonsMobile = document.getElementById('authButtonsMobile');
    const userProfileMobile = document.getElementById('userProfileMobile');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginSection = document.getElementById('loginSection');
    const authModal = document.getElementById('authModal');
    const signupSection = document.getElementById('signupSection');
    
    if (user && !user.isAnonymous) {
        // --- User is signed in ---
        if(authButtons) authButtons.classList.add('hidden');
        if(userProfile) userProfile.classList.remove('hidden');
        if(authButtonsMobile) authButtonsMobile.style.display = 'none'; 
        if(userProfileMobile) userProfileMobile.classList.remove('hidden'); 

        await initializeUserData(user);
        await loadProfileData(user);

        if (internshipUnsubscribe) internshipUnsubscribe(); 
        internshipUnsubscribe = db.collection(getUserPath('internships'))
            .onSnapshot(snapshot => {
                const internships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderInternshipHistory(internships);
            }, err => console.error("Firestore Internships Error:", err));

        if (authModal && authModal.classList.contains('active') && (loginSection.classList.contains('active') || signupSection.classList.contains('active'))) {
             if(dashboardSection) showSection(dashboardSection);
        }

    } else {
        // --- User is signed out or anonymous ---
        if(authButtons) authButtons.classList.remove('hidden');
        if(userProfile) userProfile.classList.add('hidden');
        if(authButtonsMobile) authButtonsMobile.style.display = 'flex'; 
        if(userProfileMobile) userProfileMobile.classList.add('hidden'); 

        if (internshipUnsubscribe) { internshipUnsubscribe(); internshipUnsubscribe = null; }
        if (authModal && authModal.classList.contains('active')) {
            if(loginSection) showSection(loginSection);
        }
        const internshipsListContainer = document.getElementById('internshipsListContainer');
        if(internshipsListContainer) internshipsListContainer.innerHTML = '<p class="text-center empty-state" style="padding: 20px 0;">Please log in to view your internship history.</p>';
    }

    // --- Page Protection Logic (All Courses, Internships, Tests, Exams) ---
    const isInternshipListingPage = window.location.pathname.includes('/intern/internship.html');
    // NEW PROTECTION: Matches any practice or final exam file path (e.g., ai_ml_practice_test.html)
    const isExamPage = window.location.pathname.includes('_test.html') || window.location.pathname.includes('_exam.html'); 
    
    // Combine all protected content checks
    const isProtectedPage = window.location.pathname.includes('/courses/course.html') || isInternshipListingPage || isExamPage; 

    const fullPageGate = document.getElementById('fullPageGate');
    // Identify the most relevant content wrapper on the page
    const mainContentArea = document.querySelector('.courses-grid') 
                            || document.querySelector('.courses-list') 
                            || document.querySelector('.courses') 
                            || document.querySelector('#tests .container .courses-grid') 
                            || document.querySelector('main .container')
                            || document.querySelector('main'); // Generic fallback

    if (isProtectedPage) {
        if (user && !user.isAnonymous) {
            if (fullPageGate) fullPageGate.classList.add('hidden');
            if (mainContentArea) mainContentArea.style.display = 'block'; 
        } else {
            // Logic to create and show the login gate for unauthenticated users
            if (!fullPageGate) {
                const targetContainer = document.querySelector('main .courses .container') 
                                        || document.querySelector('#tests .container') 
                                        || document.querySelector('main');
                
                if (targetContainer) {
                    const gate = document.createElement('div');
                    gate.id = 'fullPageGate';
                    gate.classList.add('hidden'); 
                    
                    const title = isInternshipListingPage || isExamPage ? 'Unlock Your Internship & Exam Access: Login Required' : 'Login Required to Access Courses';
                    const message = isInternshipListingPage || isExamPage ? 
                        'Log in or sign up to access practice tests, take the final exams, and manage your professional application history.' : 
                        'Please sign in or create an account to view and access our free course content.';
                    
                    gate.innerHTML = `
                         <div class="login-gate" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--light); z-index: 10; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; text-align: center; border-radius: 14px; min-height: 500px; border: 2px dashed var(--primary); box-shadow: 0 0 20px rgba(43, 108, 176, 0.2);">
                           <i class="fas fa-lock" style="font-size: 4rem; color: var(--primary); margin-bottom: 30px; animation: pulse 1.5s infinite;"></i>
                           <h2 style="font-size: 2.2rem; color: var(--dark); margin-bottom: 20px;">${title}</h2>
                           <p style="font-size: 1.2rem; color: var(--gray); max-width: 600px; margin-bottom: 30px;">${message}</p>
                           <button class="btn btn-primary btn-lg" id="fullPageLoginButton" style="padding: 15px 30px; font-size: 1.2rem;">Sign In / Create Profile</button>
                          </div>
                      `;
                    targetContainer.style.position = 'relative';
                    targetContainer.appendChild(gate);
                    
                    document.getElementById('fullPageLoginButton').addEventListener('click', () => {
                         window.showLoginModal();
                         if(authModal) { authModal.classList.add('active'); showSection(loginSection); document.body.style.overflow = 'hidden'; }
                    });
                }
            }
            if (fullPageGate) fullPageGate.classList.remove('hidden');
            if (mainContentArea) mainContentArea.style.display = 'none';
        }
    }
});


// ---------------------------------------------
// Helper Functions (Used by all pages and auth system)
// ---------------------------------------------

const authModal = document.getElementById('authModal');
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const dashboardSection = document.getElementById('dashboardSection');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navMenu = document.querySelector('.nav-menu');

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

// Global function to show modal/dashboard for mobile hamburger
window.handleProfileClick = function() {
    if(authModal) authModal.classList.add('active');
    if(dashboardSection) showSection(dashboardSection);
    document.body.style.overflow = 'hidden'; 
    
    if (hamburgerMenu && navMenu) { 
        hamburgerMenu.classList.remove('active'); 
        navMenu.classList.remove('active'); 
    }
    
    const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]'); 
    if (profileTabBtn) profileTabBtn.click();
}

// Global function to show login modal (used by protected pages)
window.showLoginModal = function() {
    if(authModal) authModal.classList.add('active');
    if(loginSection) showSection(loginSection);
    document.body.style.overflow = 'hidden';
}

function updateProfileUI(profileData) {
    const avatarUrl = profileData.photoUrl || '/images/no_image.png';
    const userName = profileData.name || 'User';

    const userAvatarHeader = document.getElementById('userAvatarHeader');
    const userNameHeader = document.getElementById('userNameHeader');
    const userAvatarHeaderMobile = document.getElementById('userAvatarHeaderMobile');
    const userNameHeaderMobile = document.getElementById('userNameHeaderMobile');
    const userAvatarDashboard = document.getElementById('userAvatarDashboard');
    const userNameDashboard = document.getElementById('userNameDashboard');
    const userEmailDashboard = document.getElementById('userEmailDashboard');
    const genderDisplay = document.getElementById('profileGenderDisplay');
    const domainDisplay = document.getElementById('profileDomainDisplay');
    const profileEditSectionEl = document.getElementById('profileEditSection');
    
    if (userAvatarHeader) userAvatarHeader.src = avatarUrl;
    if (userNameHeader) userNameHeader.textContent = userName.split(' ')[0];
    if (userAvatarHeaderMobile) userAvatarHeaderMobile.src = avatarUrl;
    if (userNameHeaderMobile) userNameHeaderMobile.textContent = userName; 

    if (userAvatarDashboard) userAvatarDashboard.src = avatarUrl;
    if (userNameDashboard) userNameDashboard.textContent = userName;
    if (userEmailDashboard) userEmailDashboard.textContent = profileData.email;
    if (genderDisplay) genderDisplay.textContent = profileData.gender || 'Not specified';
    if (domainDisplay) domainDisplay.textContent = profileData.interestedDomain || 'Not specified';

    if (profileEditSectionEl && !profileEditSectionEl.classList.contains('hidden')) {
        const profileNameEl = document.getElementById('profileName');
        if(profileNameEl) profileNameEl.value = profileData.name || '';
        const profileGenderEl = document.getElementById('profileGender');
        if(profileGenderEl) profileGenderEl.value = profileData.gender || '';
        const interestedDomainEl = document.getElementById('interestedDomain');
        if(interestedDomainEl) interestedDomainEl.value = profileData.interestedDomain || '';
    }
}


// ---------------------------------------------
// Auth Logic
// ---------------------------------------------

async function handleGoogleAuth(errorElement) {
    try { 
        await auth.signInWithPopup(googleProvider); 
        if(authModal) authModal.classList.remove('active'); 
        document.body.style.overflow = ''; 
    } catch (error) { 
        let errorMessage = error.message;
        if (error.code === 'auth/popup-closed-by-user') { errorMessage = 'Google sign-in was cancelled. Please try again.'; } 
        else if (error.code === 'auth/cancelled-popup-request') { errorMessage = 'Only one authentication window can be open at a time.'; }
        else if (error.code === 'auth/operation-not-allowed') { errorMessage = 'Google login is not enabled for this project. Check Firebase console.'; }
        else if (error.code === 'auth/network-request-failed') { errorMessage = 'Network error. Check your connection.'; }
        if(errorElement) showError(errorElement, errorMessage); 
        console.error("Google Auth Error:", error.message);
    } 
}

async function handleEmailLogin(e) {
    e.preventDefault(); 
    const loginLoading = document.getElementById('loginLoading');
    const loginError = document.getElementById('loginError');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
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
        if (error.code === 'auth/wrong-password') { errorMessage = 'गलत पासवर्ड। कृपया पुनः प्रयास करें।'; } 
        else if (error.code === 'auth/user-not-found') { errorMessage = 'यह ईमेल पंजीकृत नहीं है।'; } 
        else if (error.code === 'auth/invalid-email') { errorMessage = 'कृपया एक मान्य ईमेल दर्ज करें।'; }
        if(loginError) showError(loginError, errorMessage);
        console.error("Login Error:", error.message);
    } finally {
        if(loginLoading) loginLoading.style.display = 'none';
    }
}

async function handleEmailSignup(e) {
    e.preventDefault(); 
    const signupLoading = document.getElementById('signupLoading');
    const signupError = document.getElementById('signupError');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    
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
        if (error.code === 'auth/email-already-in-use') { errorMessage = 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।'; } 
        else if (error.code === 'auth/weak-password') { errorMessage = 'पासवर्ड कमज़ोर है। कृपया 6 या अधिक वर्णों का उपयोग करें।'; } 
        else if (error.code === 'auth/invalid-email') { errorMessage = 'कृपया एक मान्य ईमेल दर्ज करें।'; }
        if(signupError) showError(signupError, errorMessage);
        console.error("Signup Error:", error.message);
    } finally {
        if(signupLoading) signupLoading.style.display = 'none';
    }
}


// ---------------------------------------------
// Search Logic (Mock Data)
// ---------------------------------------------

// Utility function to get the correct path prefix 
function getRelativePath(targetPath) {
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/').filter(p => p.length > 0 && p.includes('.html') && p !== 'index.html'); // Only count segments that represent actual directories

    // If we are in a course/internship directory (e.g., /courses/courses/file.html or /intern/file.html)
    if (segments.length >= 2) {
         return '../../' + targetPath.replace(/^\//, '');
    } else if (segments.length === 1 && currentPath.includes('/blog/')) {
        // e.g. /blog/post.html
        return '../' + targetPath.replace(/^\//, '');
    }
    // Default to root relative
    return targetPath;
}

const allCourses = [
    { type: 'course', title: 'Essential Data Science Intern Course', instructor: 'Lucky Kumar', image: '/images/Essential Data Science Intern Course.png', url: "/courses/courses/Essential%20Data%20Science%20Intern%20Course.html" },
    { type: 'course', title: 'Generative AI & Prompt Engineering Masterclass', instructor: 'Lucky Kumar', image: '/images/Generative-AI-Prompt-Engineering-Masterclass.png', url: "/courses/courses/Generative-AI-Prompt-Engineering-Masterclass.html" },
    { type: 'course', title: 'Ethical Hacking Mastery', instructor: 'Lucky Kumar', image: '/images/Ethical-Hacking-Mastery.png', url: "/courses/courses/Ethical-Hacking-Mastery.html" },
    { type: 'course', title: 'Python Essentials for All', instructor: 'Lucky Kumar', image: '/images/Python-Essentials-for-All.png', url: "/courses/courses/Python-Essentials-for-All.html" },
    { type: 'course', title: 'Cloud & DevOps Essentials', instructor: 'Lucky Kumar', image: '/images/Cloud-DevOps-Essentials.png', url: "/images/Cloud-DevOps-Essentials.png" } // Mock url
];

const allInternships = [
    { type: 'internship', title: 'Data Science & Analytics', roles: 'Data Analyst, Data Scientist Intern', url: '/intern/internship.html#tests', image: '/images/test_data Science.png', practiceUrl: '/intern/data_science_practice_test.html', finalExamUrl: '/intern/payment_page_data_science.html' },
    { type: 'internship', title: 'Artificial Intelligence & ML', roles: 'AI Intern, Machine Learning Intern', url: '/intern/internship.html#tests', image: '/images/test_Artificial Intelligence.png', practiceUrl: '/intern/ai_ml_practice_test.html', finalExamUrl: '/intern/payment_page_ai_ml.html' },
    { type: 'internship', title: 'Python Dev & Software Eng', roles: 'Python Developer, Backend Developer', url: '/intern/internship.html#tests', image: '/images/test_Python Development.png', practiceUrl: '/intern/python_dev_practice_test.html', finalExamUrl: '/intern/payment_page_python.html' },
    { type: 'internship', title: 'Cloud Computing & DevOps', roles: 'Cloud Engineer, DevOps Intern', url: '/intern/internship.html#tests', image: '/images/test_Cloud Computing.png', practiceUrl: '/intern/cloud_devops_practice_test.html', finalExamUrl: '/intern/payment_page_cloud_devops.html' }
];

const allSearchableItems = [...allCourses, ...allInternships];

function renderSearchResults(query) {
    const searchResultsContainer = document.getElementById('searchResults');
    const q = query.toLowerCase().trim();
    if (!searchResultsContainer) return;
    
    searchResultsContainer.classList.add('hidden');
    searchResultsContainer.innerHTML = '';

    if (q.length < 2) return;

    const results = allSearchableItems.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.roles && item.roles.toLowerCase().includes(q))
    ).slice(0, 8); 

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


// --- Blog Post Rendering Logic (Mock Data) ---
const allBlogPosts = [
    {
        id: 1,
        title: "The Python Paradox: Why Your First Language Should Be Python",
        excerpt: "Python is simple yet versatile, making it the perfect choice for beginners in data science and web development.",
        author: "Lucky Tiwari",
        date: "2025-11-25",
        category: "Programming",
        image: "/images/Python-Essentials-for-All.png",
        content: "<p>Python's readability and vast library support truly make it a paradoxical language: easy to learn, but incredibly powerful.</p>",
        isTrending: true
    },
    // ... [Other blog posts omitted for brevity in script.js] ...
];

function renderBlogPosts() {
    const blogPostList = document.getElementById('blogPostList');
    if (!blogPostList) return;

    // Implementation remains similar to previous version (omitted for brevity)
    blogPostList.innerHTML = '<!-- Blog posts dynamically loaded here -->';
    allBlogPosts.forEach(post => {
        // ... build HTML and append (omitted for brevity)
    });

    if (window.location.pathname.includes('/blog/post.html')) {
        renderSingleBlogPost();
    }
}

function renderSingleBlogPost() {
    const params = new URLSearchParams(window.location.search);
    const postId = parseInt(params.get('id'));
    const post = allBlogPosts.find(p => p.id === postId);
    const blogPostFull = document.getElementById('blogPostFull');
    
    if (!blogPostFull || !post) return;
    
    const imgSrc = getRelativePath(post.image);
    blogPostFull.innerHTML = `
        <h1 class="blog-post-title">${post.title}</h1>
        <div class="blog-post-meta">
            <span><i class="fas fa-user-edit"></i> ${post.author}</span>
            <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
            <span><i class="fas fa-tag"></i> ${post.category}</span>
        </div>
        <div class="blog-post-image">
            <img src="${getRelativePath(post.image)}" alt="${post.title}" onerror="this.onerror=null;this.src='${getRelativePath('/images/logo.jpg')}'">
        </div>
        <div class="blog-post-content">
            ${post.content}
        </div>
    `;
}


// ---------------------------------------------
// Event Listeners (DOM Ready)
// ---------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // --- DOM Elements for Event Handlers ---
    const loginBtnHeader = document.getElementById('loginBtnHeader');
    const signupBtnHeader = document.getElementById('signupBtnHeader');
    const loginBtnMobile = document.getElementById('loginBtnHeaderMobile');
    const signupBtnMobile = document.getElementById('signupBtnHeaderMobile');
    const closeModalBtn = document.getElementById('closeModal');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const emailLoginBtn = document.getElementById('emailLoginBtn');
    const emailSignupBtn = document.getElementById('emailSignupBtn');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignupBtn = document.getElementById('googleSignupBtn');
    const logoutBtnHeader = document.getElementById('logoutBtnHeader');
    const logoutBtnHeaderMobile = document.getElementById('logoutBtnHeaderMobile');
    const profileBtnHeader = document.getElementById('profileBtnHeader');
    const profileImageInput = document.getElementById('profileImageInput');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResults');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const profileDisplaySection = document.getElementById('profileDisplaySection');
    const profileEditSection = document.getElementById('profileEditSection');


    const closeHamburgerMenu = () => {
        if (navMenu && hamburgerMenu) {
            navMenu.classList.remove('active');
            hamburgerMenu.classList.remove('active');
        }
    };
    
    // --- Auth Buttons & Modal Toggles ---
    const handleLoginClick = (e) => { e.preventDefault(); if(authModal) window.showLoginModal(); closeHamburgerMenu(); };
    const handleSignupClick = (e) => { e.preventDefault(); if(authModal) authModal.classList.add('active'); if(signupSection) showSection(signupSection); document.body.style.overflow = 'hidden'; closeHamburgerMenu(); };

    if (loginBtnHeader) loginBtnHeader.addEventListener('click', handleLoginClick);
    if (loginBtnMobile) loginBtnMobile.addEventListener('click', handleLoginClick);
    if (signupBtnHeader) signupBtnHeader.addEventListener('click', handleSignupClick);
    if (signupBtnMobile) signupBtnMobile.addEventListener('click', handleSignupClick);

    if (closeModalBtn) closeModalBtn.addEventListener('click', () => { if(authModal) authModal.classList.remove('active'); document.body.style.overflow = ''; });
    if (authModal) window.addEventListener('click', (e) => { if (e.target === authModal) { authModal.classList.remove('active'); document.body.style.overflow = ''; } });
    if (showSignupLink) showSignupLink.addEventListener('click', (e) => { e.preventDefault(); if(signupSection) showSection(signupSection); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); if(loginSection) showSection(loginSection); });
    if (emailLoginBtn) emailLoginBtn.addEventListener('click', handleEmailLogin);
    if (emailSignupBtn) emailSignupBtn.addEventListener('click', handleEmailSignup);
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleGoogleAuth(document.getElementById('loginError')));
    if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => handleGoogleAuth(document.getElementById('signupError')));

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
    if (logoutBtnHeader) logoutBtnHeader.addEventListener('click', handleLogout);
    if (logoutBtnHeaderMobile) logoutBtnHeaderMobile.addEventListener('click', handleLogout);

    // Profile Dropdown/Dashboard Toggle
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    if (userProfile) userProfile.addEventListener('click', (e) => { 
        if (window.innerWidth > 1024) { // Only desktop behavior
            e.stopPropagation(); 
            if(userDropdown) userDropdown.classList.toggle('active');
        }
    });
    document.addEventListener('click', (e) => { 
        if (userProfile && userDropdown && !userProfile.contains(e.target) && userDropdown.classList.contains('active')) 
            userDropdown.classList.remove('active'); 
    });
    
    if (profileBtnHeader) profileBtnHeader.addEventListener('click', window.handleProfileClick); 
    if (document.getElementById('profileBtnHeaderMobile')) document.getElementById('profileBtnHeaderMobile').addEventListener('click', window.handleProfileClick);

    // Profile Editing
    if (editProfileBtn && profileDisplaySection && profileEditSection) { editProfileBtn.addEventListener('click', () => { profileDisplaySection.classList.add('hidden'); profileEditSection.classList.remove('hidden'); }); }
    if(profileImageInput) { profileImageInput.addEventListener('change', (e) => {
        const userAvatarPreview = document.getElementById('userAvatarPreview');
        if (userAvatarPreview) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { userAvatarPreview.src = e.target.result; };
                reader.readAsDataURL(file);
            }
        }
    }); }
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => { const user = auth.currentUser; if (user) saveProfileData(user); });

    // Tab Switching Logic
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                Object.keys(tabsContent).forEach(key => {
                    const content = document.getElementById(`${key}TabContent`);
                    if(content) content.classList.add('hidden');
                });
                
                button.classList.add('active');
                const activeContent = document.getElementById(`${tab}TabContent`);
                if (activeContent) activeContent.classList.remove('hidden');

                if (tab === 'internships') {
                     // Re-fetch internships on tab switch
                     auth.currentUser && db.collection(getUserPath('internships')).get().then(snapshot => {
                        const internships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        renderInternshipHistory(internships);
                    }).catch(err => console.error("Error fetching internship data on tab switch:", err));
                }
            });
        });
        const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]');
        if (profileTabBtn) profileTabBtn.classList.add('active');
    }
    
    // Global Scroll Animation for Header
     const headerElement = document.querySelector('header');
     if (headerElement) {
         window.addEventListener('scroll', function() {
             if (window.scrollY > 50) { headerElement.classList.add('scrolled'); } 
             else { headerElement.classList.remove('scrolled'); }
         });
     }
     
    // Desktop Search Implementation
     if (searchInput && searchResultsContainer) {
         searchInput.addEventListener('input', (e) => { renderSearchResults(e.target.value); });
         document.addEventListener('click', (e) => {
             if (!searchInput.contains(e.target) && !searchResultsContainer.contains(e.target)) {
                 searchResultsContainer.classList.add('hidden');
             }
         });
     }
     
     // Blog Rendering
     if (window.location.pathname.includes('/blog/')) {
         renderBlogPosts();
     }
});

console.log('🚀 Internadda Script Loaded! (Final Version with Exam Protection)');
