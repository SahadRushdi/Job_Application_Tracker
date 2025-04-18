import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDgtRjqA7Bd4ZSVwhjMgjVVB5rsI7qNoVY",
    authDomain: "application-tracker-ce334.firebaseapp.com",
    databaseURL: "https://application-tracker-ce334-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "application-tracker-ce334",
    storageBucket: "application-tracker-ce334.firebasestorage.app",
    messagingSenderId: "505550718775",
    appId: "1:505550718775:web:632027a85320fe26fa3cb2",
    measurementId: "G-LTKNE7FMQZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to index page
        window.location.href = "index.html";
    }
});

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const forgotPassword = document.getElementById("forgotPassword");
const backToLogin = document.getElementById("backToLogin");
const authMessage = document.getElementById("authMessage");

const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const passwordResetForm = document.getElementById("passwordResetForm");

loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
    resetPasswordForm.classList.remove("active");
    hideMessage();
});

registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
    resetPasswordForm.classList.remove("active");
    hideMessage();
});

forgotPassword.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.remove("active");
    registerForm.classList.remove("active");
    resetPasswordForm.classList.add("active");
    hideMessage();
});

backToLogin.addEventListener("click", () => {
    resetPasswordForm.classList.remove("active");
    loginForm.classList.add("active");
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    hideMessage();
});

signInForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("signInEmail").value;
    const password = document.getElementById("signInPassword").value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in successfully
            showMessage("Login successful! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Invalid email format.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password.";
                    break;
                default:
                    errorMessage = "Error signing in: " + error.message;
            }
            showMessage(errorMessage, "error");
        });
});

// Sign Up functionality
signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("signUpName").value;
    const email = document.getElementById("signUpEmail").value;
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById("signUpConfirmPassword").value;
    
    // Password confirmation check
    if (password !== confirmPassword) {
        showMessage("Passwords do not match!", "error");
        return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            
            // Save user profile info to database
            return set(ref(database, 'users/' + user.uid), {
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            showMessage("Account created successfully! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "Email already in use.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email format.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password is too weak.";
                    break;
                default:
                    errorMessage = "Error creating account: " + error.message;
            }
            showMessage(errorMessage, "error");
        });
});

// Password Reset functionality
passwordResetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const email = document.getElementById("resetEmail").value;
    
    sendPasswordResetEmail(auth, email)
        .then(() => {
            showMessage("Password reset email sent! Check your inbox.", "success");
            setTimeout(() => {
                resetPasswordForm.classList.remove("active");
                loginForm.classList.add("active");
                loginTab.classList.add("active");
            }, 3000);
        })
        .catch((error) => {
            let errorMessage;
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Invalid email format.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email.";
                    break;
                default:
                    errorMessage = "Error sending reset email: " + error.message;
            }
            showMessage(errorMessage, "error");
        });
});

// Utility functions
function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = "auth-message " + type;
    authMessage.style.display = "block";
}

function hideMessage() {
    authMessage.style.display = "none";
}