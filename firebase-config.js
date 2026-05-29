// Firebase Configuration
// Replace these with your Firebase project credentials from console.firebase.google.com

const firebaseConfig = {
  apiKey: "AIzaSyAsJcyNpxF_D-G25cvOSzWi3Kh7MA1Dl6I",
  authDomain: "online-food-ordering-web-9a010.firebaseapp.com",
  projectId: "online-food-ordering-web-9a010",
  storageBucket: "online-food-ordering-web-9a010.firebasestorage.app",
  messagingSenderId: "719690490952",
  appId: "1:719690490952:web:7cdc6f5369b1e7eb9fe47d",
  measurementId: "G-BRCEJZ6GNH"
};

// Initialize Firebase only if SDK is available
var auth = null;
var db = null;
var storage = null;

try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        // Check if already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase SDK not loaded yet');
    }
} catch (error) {
    console.log('Firebase not initialized:', error.message);
}

// Auth State Observer - updates UI when login state changes
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User logged in:', user.email);
            // Save to localStorage so main.js can pick it up
            localStorage.setItem('userAccount', JSON.stringify({
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                uid: user.uid
            }));
        } else {
            console.log('User logged out');
        }
        
        // Trigger UI update in main.js if available
        if (typeof updateSignInUI === 'function') {
            updateSignInUI();
        }
    });
}

// Get current user
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// Check if user is authenticated
function isUserAuthenticated() {
    if (auth && auth.currentUser) return true;
    // Also check localStorage
    const stored = localStorage.getItem('userAccount');
    return stored && stored !== 'null';
}
