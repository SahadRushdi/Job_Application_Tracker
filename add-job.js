const addJobForm = document.getElementById('addJobForm');
const companyNameInput = document.getElementById('companyName');
const jobRoleInput = document.getElementById('jobRole');
const jobDescriptionInput = document.getElementById('jobDescription');
const deadlineInput = document.getElementById('deadline');
const discardBtn = document.getElementById('discardBtn');

function addApplication(applicationData) {
    const applicationsRef = window.databaseRef(window.firebaseDatabase, 'applications');
    return window.databasePush(applicationsRef, applicationData);
}

addJobForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const applicationData = {
        companyName: companyNameInput.value,
        jobRole: jobRoleInput.value,
        jobDescription: jobDescriptionInput.value,
        deadline: deadlineInput.value || null,
        dateAdded: new Date().toISOString()
    };
    
    addApplication(applicationData)
        .then(() => {
            alert('Application added successfully!');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error adding application:', error);
            alert('Error adding application. Please try again.');
        });
});

discardBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to discard this application?')) {
        window.location.href = 'index.html';
    }
});