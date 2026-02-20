(function () {
    // Debug Helper (Global)
    // Debug Helper (Disabled)
    window.updateDebugOverlay = function () { };

    window.updateDebugOverlay('Auth Script Loaded...');

    // Initialize Supabase client
    console.log('auth.js: Script started.');
    const SUPABASE_URL = 'https://mykuwuuqhygxwigbiezk.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15a3V3dXVxaHlneHdpZ2JpZXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTEzMDMsImV4cCI6MjA4NjM2NzMwM30.b41hFAjyicVKS28HyRxzoeNvjeCGKlYBeQUwBZn7O84';

    let supabaseInstance;
    try {
        if (window.supabase) {
            supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            window.supabaseClient = supabaseInstance;
            window.updateDebugOverlay('Supabase Client: Initialized', true);
        } else {
            window.updateDebugOverlay('CRITICAL: window.supabase is undefined', true);
        }
    } catch (e) {
        window.updateDebugOverlay('Supabase Init Error: ' + e.message, true);
    }

    // Auth Functions
    async function signUp(email, password) {
        const { data, error } = await supabaseInstance.auth.signUp({
            email: email,
            password: password,
        });
        return { data, error };
    }

    async function signIn(email, password) {
        const { data, error } = await supabaseInstance.auth.signInWithPassword({
            email: email,
            password: password,
        });
        return { data, error };
    }

    async function signOut() {
        const { error } = await supabaseInstance.auth.signOut();
        if (!error) {
            window.location.href = 'index.html';
        }
        return { error };
    }

    async function getCurrentUser() {
        if (!supabaseInstance) return null;
        const { data: { user } } = await supabaseInstance.auth.getUser();
        return user;
    }

    // Check Auth Status & Redirect
    async function checkAuth() {
        window.updateDebugOverlay('Checking Auth...', true);

        if (!supabaseInstance) {
            window.updateDebugOverlay('Aborting: Supabase not ready', true);
            return;
        }

        try {
            const { data, error } = await supabaseInstance.auth.getSession();

            if (error) {
                window.updateDebugOverlay('Session Error: ' + error.message, true);
                throw error;
            }

            const session = data.session;
            window.currentUser = session ? session.user : null;

            window.updateDebugOverlay(session ? 'Status: AUTHENTICATED' : 'Status: GUEST', true);
            window.updateDebugOverlay('User: ' + (session ? session.user.email : 'None'), true);

            // Pages that require auth
            const protectedPages = ['dashboard.html', 'editor.html'];
            const currentPage = window.location.pathname.split('/').pop();

            if (session) {
                updateUserUI(session.user);
            } else {
                updateUserUI(null);
            }

            // Signal app that auth is ready
            document.dispatchEvent(new CustomEvent('auth-ready', { detail: { user: window.currentUser } }));

        } catch (err) {
            window.updateDebugOverlay('CheckAuth Exception: ' + err.message, true);
            console.error(err);
            // Signal ready even on error (as guest)
            document.dispatchEvent(new CustomEvent('auth-ready', { detail: { user: null } }));
        }
    }

    function updateUserUI(user) {
        // Standardized class names
        const nameEls = document.querySelectorAll('.user-name-display');
        const emailEls = document.querySelectorAll('.user-email-display');
        const avatarEls = document.querySelectorAll('.user-avatar-display');

        if (user) {
            nameEls.forEach(el => el.textContent = user.email.split('@')[0]);
            emailEls.forEach(el => el.textContent = user.email);
            avatarEls.forEach(el => el.textContent = user.email.substring(0, 2).toUpperCase());
        } else {
            nameEls.forEach(el => el.textContent = 'Guest User');
            emailEls.forEach(el => el.textContent = 'Sign in to access features');
            avatarEls.forEach(el => el.textContent = 'GU');
        }

        // Toggle Navigation Items
        const authOnlyElements = document.querySelectorAll('.auth-only');
        const guestOnlyElements = document.querySelectorAll('#navLogin, #navRegister');

        if (user) {
            authOnlyElements.forEach(el => el.style.display = 'block');
            guestOnlyElements.forEach(el => el.style.display = 'none');
        } else {
            authOnlyElements.forEach(el => el.style.display = 'none');
            guestOnlyElements.forEach(el => el.style.display = 'block');
        }
    }

    // Initialize Auth Listener
    document.addEventListener('DOMContentLoaded', () => {
        window.updateDebugOverlay('DOM Ready, calling checkAuth', true);
        checkAuth();

        // Logout button handler
        const logoutBtns = document.querySelectorAll('.logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                signOut();
            });
        });
    });

    // Listen for auth state changes if instance exists
    if (supabaseInstance) {
        supabaseInstance.auth.onAuthStateChange((event, session) => {
            updateUserUI(session ? session.user : null);
            window.updateDebugOverlay(`Auth State Change: ${event}`, true);

            if (event === 'SIGNED_OUT') {
                const protectedPages = ['dashboard.html', 'editor.html'];
                const currentPage = window.location.pathname.split('/').pop();
                if (protectedPages.includes(currentPage)) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // Expose functions to global scope
    window.signIn = signIn;
    window.signUp = signUp;
    window.signOut = signOut;
    window.checkAuth = checkAuth;
    console.log('auth.js loaded and functions exposed to window.');

})();
