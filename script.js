import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const auth = getAuth();
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById("userDisplay").textContent = user.email;
        loadApplications();
    } else {
        window.location.href = "login.html";
    }
});

document.getElementById("signOutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
});

function loadApplications() {
    const applicationsRef = window.databaseRef(window.firebaseDatabase, `applications/${currentUser.uid}`);

    window.databaseOnValue(applicationsRef, (snapshot) => {
        const tableBody = document.getElementById("applicationsTableBody");
        tableBody.innerHTML = "";

        const applications = snapshot.val();
        if (!applications) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">No job applications found. Add your first one!</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        // Sort applications by dateAdded (newest first)
        const sortedApplications = Object.entries(applications).sort((a, b) => {
            return new Date(b[1].dateAdded) - new Date(a[1].dateAdded);
        });

        for (const [id, application] of sortedApplications) {
            const row = document.createElement("tr");

            // Format the date
            const dateAdded = new Date(application.dateAdded);
            const formattedDate = dateAdded.toLocaleDateString();

            // Format the deadline or show 'N/A'
            let deadlineDisplay = 'N/A';
            if (application.deadline) {
                const deadline = new Date(application.deadline);
                deadlineDisplay = deadline.toLocaleDateString();

                // Check if deadline is approaching (within 7 days)
                const today = new Date();
                const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

                if (daysUntilDeadline < 0) {
                    row.classList.add("deadline-passed");
                } else if (daysUntilDeadline <= 7) {
                    row.classList.add("deadline-approaching");
                }
            }

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${application.companyName}</td>
                <td>${application.jobRole}</td>
                <td>${deadlineDisplay}</td>
                <td class="actions">
                    <button class="view-btn" data-id="${id}">View</button>
                    <button class="edit-btn" data-id="${id}">Edit</button>
                    <button class="delete-btn" data-id="${id}">Delete</button>
                </td>
            `;

            tableBody.appendChild(row);
        }

        addActionButtonListeners();
    });
}

function addActionButtonListeners() {
    document.querySelectorAll(".view-btn").forEach(button => {
        button.addEventListener("click", function () {
            const applicationId = this.getAttribute("data-id");
            viewApplication(applicationId);
        });
    });

    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", function () {
            const applicationId = this.getAttribute("data-id");
            editApplication(applicationId);
        });
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", function () {
            const applicationId = this.getAttribute("data-id");
            deleteApplication(applicationId);
        });
    });
}

function viewApplication(applicationId) {
    const applicationRef = window.databaseRef(window.firebaseDatabase, `applications/${currentUser.uid}/${applicationId}`);

    window.databaseOnValue(applicationRef, (snapshot) => {
        const application = snapshot.val();
        if (!application) return;

        document.getElementById("viewCompanyName").textContent = application.companyName;
        document.getElementById("viewJobRole").textContent = application.jobRole;
        document.getElementById("viewJobDescription").textContent = application.jobDescription;

        const deadlineDisplay = application.deadline ? new Date(application.deadline).toLocaleDateString() : 'No deadline';
        document.getElementById("viewDeadline").textContent = deadlineDisplay;

        document.getElementById("viewModal").style.display = "block";
    });
}

function editApplication(applicationId) {
    const applicationRef = window.databaseRef(window.firebaseDatabase, `applications/${currentUser.uid}/${applicationId}`);

    window.databaseOnValue(applicationRef, (snapshot) => {
        const application = snapshot.val();
        if (!application) return;

        document.getElementById("editJobId").value = applicationId;
        document.getElementById("editCompanyName").value = application.companyName;
        document.getElementById("editJobRole").value = application.jobRole;
        document.getElementById("editJobDescription").value = application.jobDescription;

        if (application.deadline) {
            document.getElementById("editDeadline").value = application.deadline.split('T')[0];
        } else {
            document.getElementById("editDeadline").value = "";
        }

        document.getElementById("editModal").style.display = "block";
    });
}

document.getElementById("editForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const applicationId = document.getElementById("editJobId").value;
    const companyName = document.getElementById("editCompanyName").value;
    const jobRole = document.getElementById("editJobRole").value;
    const jobDescription = document.getElementById("editJobDescription").value;
    const deadline = document.getElementById("editDeadline").value;

    const applicationRef = window.databaseRef(window.firebaseDatabase, `applications/${currentUser.uid}/${applicationId}`);

    window.databaseUpdate(applicationRef, {
        companyName: companyName,
        jobRole: jobRole,
        jobDescription: jobDescription,
        deadline: deadline || null
    }).then(() => {
        document.getElementById("editModal").style.display = "none";
        showNotification("Application updated successfully!");
    }).catch(error => {
        console.error("Error updating application:", error);
        showNotification("Failed to update application.", "error");
    });
});

function deleteApplication(applicationId) {
    if (confirm("Are you sure you want to delete this application?")) {
        const applicationRef = window.databaseRef(window.firebaseDatabase, `applications/${currentUser.uid}/${applicationId}`);

        window.databaseRemove(applicationRef).then(() => {
            showNotification("Application deleted successfully!");
        }).catch(error => {
            console.error("Error deleting application:", error);
            showNotification("Failed to delete application.", "error");
        });
    }
}

// Close modal when clicking the close button or outside the modal
document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.addEventListener("click", function () {
        this.closest(".modal").style.display = "none";
    });
});

document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", function (event) {
        if (event.target === this) {
            this.style.display = "none";
        }
    });
});

// Cancel edit
document.getElementById("cancelEditBtn").addEventListener("click", function () {
    document.getElementById("editModal").style.display = "none";
});

// Show notification
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add("fadeOut");
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2000);
}