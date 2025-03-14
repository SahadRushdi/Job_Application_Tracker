// DOM elements
const applicationsTableBody = document.getElementById('applicationsTableBody');
const editModal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editForm = document.getElementById('editForm');
const editJobId = document.getElementById('editJobId');
const editCompanyName = document.getElementById('editCompanyName');
const editJobRole = document.getElementById('editJobRole');
const editJobDescription = document.getElementById('editJobDescription');
const editDeadline = document.getElementById('editDeadline');

// Load applications from Firebase
function loadApplications() {
    const applicationsRef = window.databaseRef(window.firebaseDatabase, 'applications');
    
    window.databaseOnValue(applicationsRef, (snapshot) => {
        const applications = snapshot.val();
        applicationsTableBody.innerHTML = '';
        
        if (applications) {
            Object.keys(applications).forEach((key) => {
                const app = applications[key];
                const row = document.createElement('tr');
                
                // Format the date for display
                const dateAdded = new Date(app.dateAdded);
                const formattedDate = dateAdded.toLocaleDateString() + ' ' + 
                    dateAdded.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Format deadline or display "None"
                const deadlineDisplay = app.deadline ? new Date(app.deadline).toLocaleDateString() : "None";
                
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${app.companyName}</td>
                    <td>${app.jobRole}</td>
                    <td>${deadlineDisplay}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${key}">Edit</button>
                        <button class="delete-btn" data-id="${key}">Delete</button>
                    </td>
                `;
                applicationsTableBody.appendChild(row);
            });
            
            // Add event listeners to the buttons
            attachButtonListeners();
        }
    });
}

// Attach event listeners to edit and delete buttons
function attachButtonListeners() {
    // Edit button listeners
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const jobId = button.getAttribute('data-id');
            openEditModal(jobId);
        });
    });
    
    // Delete button listeners
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const jobId = button.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this application?')) {
                deleteApplication(jobId);
            }
        });
    });
}

// Open edit modal and populate with application data
function openEditModal(jobId) {
    const applicationRef = window.databaseRef(window.firebaseDatabase, 'applications/' + jobId);
    
    window.databaseOnValue(applicationRef, (snapshot) => {
        const application = snapshot.val();
        if (application) {
            editJobId.value = jobId;
            editCompanyName.value = application.companyName;
            editJobRole.value = application.jobRole;
            editJobDescription.value = application.jobDescription;
            editDeadline.value = application.deadline || '';
            
            editModal.style.display = 'block';
        }
    }, { once: true });
}

// Update application in Firebase
function updateApplication(jobId, applicationData) {
    const updates = {};
    updates['applications/' + jobId] = applicationData;
    return window.databaseUpdate(window.databaseRef(window.firebaseDatabase), updates);
}

// Delete application from Firebase
function deleteApplication(jobId) {
    return window.databaseRemove(window.databaseRef(window.firebaseDatabase, 'applications/' + jobId));
}

// Event listeners
window.addEventListener('DOMContentLoaded', loadApplications);

closeBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
});

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const jobId = editJobId.value;
    const applicationData = {
        companyName: editCompanyName.value,
        jobRole: editJobRole.value,
        jobDescription: editJobDescription.value,
        deadline: editDeadline.value || null
    };
    
    updateApplication(jobId, applicationData)
        .then(() => {
            editModal.style.display = 'none';
            alert('Application updated successfully!');
        })
        .catch((error) => {
            console.error('Error updating application:', error);
            alert('Error updating application. Please try again.');
        });
});