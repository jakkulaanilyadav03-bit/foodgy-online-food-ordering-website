// Firebase Authentication Handler
// This file handles sign up, login, logout, and password reset
// Safe for all pages - only binds to elements that exist on the current page

(function() {
    'use strict';

    // ---- AUTH.HTML ELEMENTS ----
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const toggleAuthMode = document.getElementById('toggleAuthMode');
    const authTitle = document.querySelector('.auth-title');

    // ---- INDEX.HTML AUTH MODAL ELEMENTS ----
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const loginForm = document.getElementById('loginForm');
    const switchLogin = document.getElementById('switchLogin');
    const switchSignup = document.getElementById('switchSignup');
    const authClose = document.querySelector('.auth-close');

    // Helper: showToast (fallback if not already defined)
    function authShowToast(message, type, duration) {
        if (typeof showToast === 'function') {
            showToast(message, type, duration);
        } else {
            // minimal fallback toast
            const t = document.createElement('div');
            t.textContent = message;
            t.style.cssText = 'position:fixed;right:1rem;bottom:1rem;padding:0.7rem 1.2rem;border-radius:8px;z-index:9999;color:#fff;font-size:0.95rem;transition:opacity .3s;';
            t.style.background = type === 'error' ? '#F87171' : '#10B981';
            document.body.appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
        }
    }

    // Helper: loading state
    function showLoadingState(form) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.dataset.origText = btn.textContent; btn.textContent = 'Loading...'; }
    }
    function hideLoadingState(form) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origText || 'Submit'; }
    }

    // ===========================================
    //   AUTH.HTML: Sign In Form (full page)
    // ===========================================
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signInEmail').value.trim();
            const password = document.getElementById('signInPassword').value;

            try {
                showLoadingState(signInForm);
                if (typeof firebase !== 'undefined' && auth) {
                    const result = await auth.signInWithEmailAndPassword(email, password);
                    await db.collection('users').doc(result.user.uid).set({
                        email: result.user.email,
                        lastLogin: new Date(),
                    }, { merge: true });
                }
                // Also save to localStorage for fallback
                localStorage.setItem('userAccount', JSON.stringify({ name: email.split('@')[0], email }));

                authShowToast('Signed in successfully!', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } catch (error) {
                authShowToast('Sign in failed: ' + error.message, 'error');
            } finally {
                hideLoadingState(signInForm);
            }
        });
    }

    // ===========================================
    //   AUTH.HTML: Sign Up Form (full page)
    // ===========================================
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signUpName').value.trim();
            const email = document.getElementById('signUpEmail').value.trim();
            const password = document.getElementById('signUpPassword').value;
            const confirmPassword = document.getElementById('signUpConfirmPassword').value;

            if (password !== confirmPassword) { authShowToast('Passwords do not match', 'error'); return; }
            if (password.length < 6) { authShowToast('Password must be at least 6 characters', 'error'); return; }
            if (!name) { authShowToast('Please enter your name', 'error'); return; }

            try {
                showLoadingState(signUpForm);
                if (typeof firebase !== 'undefined' && auth) {
                    const result = await auth.createUserWithEmailAndPassword(email, password);
                    await result.user.updateProfile({ displayName: name });
                    await db.collection('users').doc(result.user.uid).set({
                        name, email, createdAt: new Date(), phone: '', address: '', profileImage: '', bio: ''
                    });
                }
                // Also save to localStorage
                localStorage.setItem('userAccount', JSON.stringify({ name, email, createdAt: new Date().toISOString() }));

                authShowToast('Account created successfully!', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1000);
            } catch (error) {
                authShowToast('Sign up failed: ' + error.message, 'error');
            } finally {
                hideLoadingState(signUpForm);
            }
        });
    }

    // ===========================================
    //   INDEX.HTML: Auth Modal (popup on main page)
    // ===========================================
    if (authModal) {
        // Close button
        if (authClose) {
            authClose.addEventListener('click', () => { authModal.style.display = 'none'; });
        }
        // Click outside to close
        window.addEventListener('click', (e) => {
            if (e.target === authModal) { authModal.style.display = 'none'; }
        });

        // Switch between signup and login forms
        if (switchLogin) {
            switchLogin.addEventListener('click', () => {
                if (authForm) authForm.style.display = 'none';
                if (loginForm) loginForm.style.display = 'block';
            });
        }
        if (switchSignup) {
            switchSignup.addEventListener('click', () => {
                if (authForm) authForm.style.display = 'block';
                if (loginForm) loginForm.style.display = 'none';
            });
        }

        // Create Account form submit
        if (authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('authName').value.trim();
                const email = document.getElementById('authEmail').value.trim();
                const phone = document.getElementById('authPhone').value.trim();
                const password = document.getElementById('authPass').value;

                if (!name || !email || !password) { authShowToast('Please fill all fields', 'error'); return; }
                if (password.length < 6) { authShowToast('Password must be at least 6 characters', 'error'); return; }

                try {
                    showLoadingState(authForm);
                    if (typeof firebase !== 'undefined' && auth) {
                        const result = await auth.createUserWithEmailAndPassword(email, password);
                        await result.user.updateProfile({ displayName: name });
                        if (db) {
                            await db.collection('users').doc(result.user.uid).set({
                                name, email, phone, createdAt: new Date(), address: '', profileImage: '', bio: ''
                            });
                        }
                    }
                    // Save to localStorage
                    localStorage.setItem('userAccount', JSON.stringify({ name, email, phone, createdAt: new Date().toISOString() }));
                    
                    authShowToast('Account created! Welcome, ' + name.split(' ')[0] + '!', 'success');
                    authModal.style.display = 'none';
                    if (typeof updateSignInUI === 'function') updateSignInUI();
                } catch (error) {
                    authShowToast('Sign up failed: ' + error.message, 'error');
                } finally {
                    hideLoadingState(authForm);
                }
            });
        }

        // Login form submit
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value.trim();
                const password = document.getElementById('loginPass').value;

                if (!email || !password) { authShowToast('Please fill all fields', 'error'); return; }

                try {
                    showLoadingState(loginForm);
                    if (typeof firebase !== 'undefined' && auth) {
                        const result = await auth.signInWithEmailAndPassword(email, password);
                        if (db) {
                            await db.collection('users').doc(result.user.uid).set({
                                email: result.user.email, lastLogin: new Date(),
                            }, { merge: true });
                        }
                    }
                    // Save to localStorage
                    const displayName = (typeof firebase !== 'undefined' && auth && auth.currentUser && auth.currentUser.displayName) 
                        ? auth.currentUser.displayName : email.split('@')[0];
                    localStorage.setItem('userAccount', JSON.stringify({ name: displayName, email }));

                    authShowToast('Logged in successfully!', 'success');
                    authModal.style.display = 'none';
                    if (typeof updateSignInUI === 'function') updateSignInUI();
                } catch (error) {
                    authShowToast('Login failed: ' + error.message, 'error');
                } finally {
                    hideLoadingState(loginForm);
                }
            });
        }
    }

    // ===========================================
    //   LOGOUT (works on any page with #logoutBtn)
    // ===========================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                if (typeof firebase !== 'undefined' && auth) { await auth.signOut(); }
                localStorage.removeItem('userAccount');
                authShowToast('Logged out successfully', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 500);
            } catch (error) {
                authShowToast('Logout failed: ' + error.message, 'error');
            }
        });
    }

    // ===========================================
    //   PASSWORD RESET
    // ===========================================
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', async () => {
            const email = prompt('Enter your email address:');
            if (email) {
                try {
                    if (typeof firebase !== 'undefined' && auth) {
                        await auth.sendPasswordResetEmail(email);
                    }
                    authShowToast('Password reset email sent! Check your inbox.', 'success');
                } catch (error) {
                    authShowToast('Error: ' + error.message, 'error');
                }
            }
        });
    }
})();
