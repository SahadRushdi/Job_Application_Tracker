import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const auth = getAuth();
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("userDisplay").textContent = user.email;
        console.log("User logged in:", user.uid);
    } else {
        console.log("No user logged in, redirecting to login");
        window.location.href = "login.html";
    }
});

document.getElementById("addJobForm").addEventListener("submit", function (e) {
    e.preventDefault();

    if (!currentUser) {
        console.log("No authenticated user found");
        alert("You must be logged in to add a job application.");
        window.location.href = "login.html";
        return;
    }

    console.log("Adding application for user:", currentUser.uid);

    // Get form values
    const companyName = document.getElementById("companyName").value;
    const jobRole = document.getElementById("jobRole").value;
    const jobDescription = document.getElementById("jobDescription").value;
    const deadline = document.getElementById("deadline").value;

    // Creates a new application reference under the user's ID
    const applicationsRef = window.databaseRef(window.firebaseDatabase, `applications/${currentUser.uid}`);

    const newApplication = {
        companyName: companyName,
        jobRole: jobRole,
        jobDescription: jobDescription,
        deadline: deadline || null,
        dateAdded: new Date().toISOString(),
        status: "Applied"
    };

    console.log("Application data:", newApplication);

    // Push new application
    window.databasePush(applicationsRef, newApplication)
        .then(() => {
            console.log("Application added successfully!");
            // Show success message
            const notification = document.createElement("div");
            notification.className = "notification success";
            notification.textContent = "Job application added successfully!";
            document.body.appendChild(notification);

            document.getElementById("addJobForm").reset();

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        })
        .catch(error => {
            console.error("Error adding application:", error);
            const notification = document.createElement("div");
            notification.className = "notification error";
            notification.textContent = "Failed to add job application: " + error.message;
            document.body.appendChild(notification);
        });
});