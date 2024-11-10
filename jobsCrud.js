const baseUrl = "http://localhost:8080";
const token = localStorage.getItem("jwtToken");

let allJobs = [];

let currentPage = 1;
const rowsPerPage = 5;
let jobData = [];

if (!token) window.location.href = "login.html";

async function fetchJobs() {
  try {
    const response = await fetch(`${baseUrl}/jobs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch job details");
    }

    jobData = await response.json();
    displayTable(jobData);
    setupPagination(jobData.length);
  } catch (error) {
    console.error("Error fetching job details:", error);
  }
}

function displayTable(data) {
  const tableBody = document.getElementById("jobTableBody");
  tableBody.innerHTML = ""; // Clear any existing data

  // Filter data based on search input
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredData = data.filter((job) => {
    return Object.values(job).some((value) =>
      String(value).toLowerCase().includes(searchInput)
    );
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${job.jobId}</td>
          <td>${job.jobTitle}</td>
          <td>${job.minSalary}</td>
          <td>${job.maxSalary}</td>
          <td>
          <button class="btn btn-warning btn-sm" onclick="editJob(${job.jobId})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteJob(${job.jobId})">Delete</button>
        </td>
      `;
    tableBody.appendChild(row);
  });

  setupPagination(filteredData.length);
}

function setupPagination(totalRows) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = ""; // Clear previous pagination

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = "page-button";
    pageButton.onclick = () => {
      currentPage = i;
      displayTable(jobData);
    };
    pagination.appendChild(pageButton);
  }
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1; // Reset to first page on search
  displayTable(jobData);
});

document
  .getElementById("createJobForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const newJob = {
      jobTitle: document.getElementById("jobTitle").value,
      minSalary: document.getElementById("minSalary").value,
      maxSalary: document.getElementById("maxSalary").value,
    };

    try {
      const response = await fetch(`${baseUrl}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (response.ok) {
        alert("Job created successfully!");
        // Refresh the employee data table and close modal
        await fetchJobs();
        fetchJobs();
        $("#createJobModal").modal("hide");
      } else {
        console.error("Failed to create job");
      }
    } catch (error) {
      console.error("Error creating job:", error);
    }
  });

// Edit employee (popup form)
async function editJob(id) {
  console.log("Edit button clicked");
  const response = await fetch(`${baseUrl}/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const job = await response.json();

  // Populate the popup form with employee data
  document.getElementById("editJobId").value = job.jobId;
  document.getElementById("editJobTitle").value = job.jobTitle;
  document.getElementById("editMinSalary").value = job.minSalary;
  document.getElementById("editMaxSalary").value = job.maxSalary;

  // Show the popup modal
  $("#editJobModal").modal("show");
}

// Submit the edited employee data
async function submitEditJob(event) {
  event.preventDefault();

  const updatedJob = {
    jobId: document.getElementById("editJobId").value,
    jobTitle: document.getElementById("editJobTitle").value,
    minSalary: document.getElementById("editMinSalary").value,
    maxSalary: document.getElementById("editMaxSalary").value,
  };

  const response = await fetch(`${baseUrl}/jobs/${updatedJob.jobId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedJob),
  });

  if (response.ok) {
    alert("Job updated successfully!");
    fetchJobs(); // Reload employee data after update
    $("#editJobModal").modal("hide"); // Hide the popup using Bootstrap's modal control
  } else {
    alert("Failed to update job.");
  }
}

// Close the edit modal without saving
function closeEditModal() {
  $("#editJobModal").modal("hide");
}

// Delete employee
async function deleteJob(id) {
  if (confirm(`Are you sure you want to delete job ID ${id}?`)) {
    const response = await fetch(`${baseUrl}/jobs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Job deleted successfully!");
      fetchJobs(); // Reload employee data after deletion
    } else {
      alert("Failed to delete job.");
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchJobs);

document.getElementById("logoutButton").onclick = () => {
  localStorage.removeItem("jwtToken");
  window.location.href = "login.html";
};
