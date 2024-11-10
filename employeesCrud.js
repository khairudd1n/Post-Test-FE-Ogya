const baseUrl = "http://localhost:8080";
const token = localStorage.getItem("jwtToken");

$(document).ready(function () {
  $("#employeeTable").DataTable({
    paging: true,
    searching: true,
  });
});

let currentPage = 1;
const rowsPerPage = 5;
let employeeData = [];

if (!token) window.location.href = "login.html";

async function fetchEmployeeDetails() {
  try {
    const response = await fetch(`${baseUrl}/employees/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch employee details");
    }

    employeeData = await response.json();
    displayTable(employeeData);
    setupPagination(employeeData.length);
  } catch (error) {
    console.error("Error fetching employee details:", error);
  }
}

function displayTable(data) {
  const tableBody = document.getElementById("employeeTableBody");
  tableBody.innerHTML = "";

  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredData = data.filter((employee) => {
    return Object.values(employee).some((value) =>
      String(value).toLowerCase().includes(searchInput)
    );
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach((employee) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${employee.employeeId}</td>
          <td>${employee.firstName}</td>
          <td>${employee.lastName}</td>
          <td>${employee.email}</td>
          <td>${employee.phoneNumber}</td>
          <td>${employee.hireDate}</td>
          <td>${employee.jobTitle}</td>
          <td>${employee.salary}</td>
          <td>${employee.commissionPct}</td>
          <td>${employee.managerId}</td>
          <td>${employee.departmentName}</td>
          <td>
          <button class="btn btn-warning btn-sm" onclick="editEmployee(${employee.employeeId})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${employee.employeeId})">Delete</button>
        </td>
      `;
    tableBody.appendChild(row);
  });

  setupPagination(filteredData.length);
}

function setupPagination(totalRows) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = "page-button";
    pageButton.onclick = () => {
      currentPage = i;
      displayTable(employeeData);
    };
    pagination.appendChild(pageButton);
  }
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  displayTable(employeeData);
});

document
  .getElementById("createEmployeeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const newEmployee = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value,
      phoneNumber: document.getElementById("phoneNumber").value,
      hireDate: document.getElementById("hireDate").value,
      jobId: document.getElementById("jobId").value,
      salary: document.getElementById("salary").value,
      commissionPct: document.getElementById("commissionPct").value || null,
      managerId: document.getElementById("managerId").value || null,
      departmentId: document.getElementById("departmentId").value,
    };

    try {
      const response = await fetch(`${baseUrl}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        alert("Employee created successfully!");
        // Refresh the employee data table and close modal
        await fetchEmployeeDetails();
        fetchEmployeeDetails();
        $("#createEmployeeModal").modal("hide");
      } else {
        console.error("Failed to create employee");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  fetchDepartmentsAndJobs();
  fetchEmployeeDetails();
});

async function fetchDepartmentsAndJobs() {
  try {
    const departmentResponse = await fetch(`${baseUrl}/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jobResponse = await fetch(`${baseUrl}/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const departments = await departmentResponse.json();
    const jobs = await jobResponse.json();

    // Populate Department dropdowns
    const departmentSelects = [
      document.getElementById("departmentId"),
      document.getElementById("editDepartmentId"),
    ].filter((select) => select !== null); // Hanya elemen yang ada

    departmentSelects.forEach((select) => {
      select.innerHTML = `<option value="">-- Pilih Department --</option>`;
      departments.forEach((department) => {
        const option = document.createElement("option");
        option.value = department.departmentId; // Pastikan ini adalah nama properti yang benar
        option.text = `${department.departmentId} - ${department.departmentName}`;
        select.appendChild(option);
      });
    });

    // Populate Job dropdowns
    const jobSelects = [
      document.getElementById("jobId"),
      document.getElementById("editJobId"),
    ].filter((select) => select !== null); // Hanya elemen yang ada

    jobSelects.forEach((select) => {
      select.innerHTML = `<option value="">-- Pilih Job --</option>`;
      jobs.forEach((job) => {
        const option = document.createElement("option");
        option.value = job.jobId; // Pastikan ini adalah nama properti yang benar
        option.text = `${job.jobId} - ${job.jobTitle}`;
        select.appendChild(option);
      });
    });
  } catch (error) {
    console.error("Failed to load departments and jobs:", error);
  }
}

// Edit employee (popup form)
async function editEmployee(id) {
  console.log("Edit button clicked");
  const response = await fetch(`${baseUrl}/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const employee = await response.json();

  // Populate the popup form with employee data
  document.getElementById("editEmployeeId").value = employee.employeeId;
  document.getElementById("editFirstName").value = employee.firstName;
  document.getElementById("editLastName").value = employee.lastName;
  document.getElementById("editEmail").value = employee.email;
  document.getElementById("editPhoneNumber").value = employee.phoneNumber;
  document.getElementById("editHireDate").value = employee.hireDate;
  document.getElementById("editDepartmentId").value = employee.departmentId;
  document.getElementById("editCommissionPct").value = employee.commissionPct;
  document.getElementById("editJobId").value = employee.jobId;
  document.getElementById("editSalary").value = employee.salary;

  // Show the popup modal
  // document.getElementById("editEmployeeModal").style.display = "block";
  $("#editEmployeeModal").modal("show");
}

// Submit the edited employee data
async function submitEditEmployee(event) {
  event.preventDefault();

  const updatedEmployee = {
    employeeId: document.getElementById("editEmployeeId").value,
    firstName: document.getElementById("editFirstName").value,
    lastName: document.getElementById("editLastName").value,
    email: document.getElementById("editEmail").value,
    phoneNumber: document.getElementById("editPhoneNumber").value,
    hireDate: document.getElementById("editHireDate").value,
    departmentId: document.getElementById("editDepartmentId").value,
    commissionPct: document.getElementById("editCommissionPct").value,
    jobId: document.getElementById("editJobId").value,
    salary: document.getElementById("editSalary").value,
  };

  const response = await fetch(
    `${baseUrl}/employees/${updatedEmployee.employeeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedEmployee),
    }
  );

  if (response.ok) {
    alert("Employee updated successfully!");
    fetchEmployeeDetails(); // Reload employee data after update
    $("#editEmployeeModal").modal("hide"); // Hide the popup using Bootstrap's modal control
  } else {
    alert("Failed to update employee.");
  }
}

// Close the edit modal without saving
function closeEditModal() {
  $("#editEmployeeModal").modal("hide");
}

// Delete employee
async function deleteEmployee(id) {
  if (confirm(`Are you sure you want to delete employee ID ${id}?`)) {
    const response = await fetch(`${baseUrl}/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Employee deleted successfully!");
      fetchEmployeeDetails(); // Reload employee data after deletion
    } else {
      alert("Failed to delete employee.");
    }
  }
}

// Update editEmployee to set selected values for department and job
async function editEmployee(id) {
  const response = await fetch(`${baseUrl}/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const employee = await response.json();

  document.getElementById("editEmployeeId").value = employee.employeeId;
  document.getElementById("editFirstName").value = employee.firstName;
  document.getElementById("editLastName").value = employee.lastName;
  document.getElementById("editEmail").value = employee.email;
  document.getElementById("editPhoneNumber").value = employee.phoneNumber;
  document.getElementById("editHireDate").value = employee.hireDate;
  document.getElementById("editCommissionPct").value = employee.commissionPct;
  document.getElementById("editSalary").value = employee.salary;

  // Set department and job selection based on employee data
  document.getElementById("editDepartmentId").value = employee.departmentId;
  document.getElementById("editJobId").value = employee.jobId;

  $("#editEmployeeModal").modal("show");
}

document.addEventListener("DOMContentLoaded", fetchEmployeeDetails);

// Logout functionality
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("jwtToken");
  window.location.href = "login.html";
});
