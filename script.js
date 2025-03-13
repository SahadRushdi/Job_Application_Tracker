// Firebase Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://application-tracker-ce334-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  // Add New Job
  function addJob() {
      const company = document.getElementById("company").value;
      const role = document.getElementById("role").value;
      const description = document.getElementById("description").value;
      const deadline = document.getElementById("deadline").value || "No Deadline";
      const timestamp = new Date().toLocaleString();
  
      const jobRef = db.ref("jobs").push();
      jobRef.set({
          company,
          role,
          description,
          deadline,
          timestamp
      });
  
      window.location.href = "index.html";
  }
  
  // Read Data & Display in Table
  db.ref("jobs").on("value", (snapshot) => {
      const jobTable = document.getElementById("jobTable");
      jobTable.innerHTML = "";
  
      snapshot.forEach((childSnapshot) => {
          const job = childSnapshot.val();
          jobTable.innerHTML += `
              <tr>
                  <td>${job.timestamp}</td>
                  <td>${job.company}</td>
                  <td>${job.role}</td>
                  <td>${job.description}</td>
                  <td>${job.deadline}</td>
                  <td>
                      <button onclick="updateJob('${childSnapshot.key}', '${job.company}', '${job.role}', '${job.description}', '${job.deadline}')">Update</button>
                      <button onclick="deleteJob('${childSnapshot.key}')">Delete</button>
                  </td>
              </tr>`;
      });
  });
  
  // Delete Job
  function deleteJob(id) {
      db.ref("jobs/" + id).remove();
  }
  
  // Update Job (Redirects to add page with pre-filled data)
  function updateJob(id, company, role, description, deadline) {
      window.location.href = `add.html?id=${id}&company=${company}&role=${role}&description=${description}&deadline=${deadline}`;
  }
  