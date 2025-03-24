// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration
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

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');

signupBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("User signed up successfully!");
            window.location.href = "dashboard.html"; 
        })
        .catch((error) => {
            alert(error.message);
        });
});

loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html"; 
    }
});
