const baseUrl = "http://localhost:8080";
const token = localStorage.getItem("jwtToken");

let allDepartments = [];

let currentPage = 1;
const rowsPerPage = 5; // Jumlah baris per halaman
let departmentData = []; // Menyimpan data karyawan

if (!token) window.location.href = "login.html";

async function fetchDepartments() {
  try {
    const response = await fetch(`${baseUrl}/departments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch department details");
    }

    departmentData = await response.json();
    displayTable(departmentData);
    setupPagination(departmentData.length);
  } catch (error) {
    console.error("Error fetching department details:", error);
  }
}

function displayTable(data) {
  const tableBody = document.getElementById("departmentTableBody");
  tableBody.innerHTML = ""; // Clear any existing data

  // Filter data based on search input
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredData = data.filter((department) => {
    return Object.values(department).some((value) =>
      String(value).toLowerCase().includes(searchInput)
    );
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach((department) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${department.departmentId}</td>
          <td>${department.departmentName}</td>
          <td>${department.locationId}</td>
          <td>${department.managerId}</td>
          <td>
          <button class="btn btn-warning btn-sm" onclick="editDepartment(${department.departmentId})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteDepartment(${department.departmentId})">Delete</button>
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
      displayTable(departmentData);
    };
    pagination.appendChild(pageButton);
  }
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1; // Reset to first page on search
  displayTable(departmentData);
});

document
  .getElementById("createDepartmentForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const newDepartment = {
      departmentName: document.getElementById("departmentName").value,
      locationId: document.getElementById("locationId").value,
      managerId: document.getElementById("managerId").value,
    };

    try {
      const response = await fetch(`${baseUrl}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newDepartment),
      });

      if (response.ok) {
        alert("Department created successfully!");
        // Refresh the employee data table and close modal
        await fetchDepartments();
        fetchDepartments();
        $("#createDepartmentModal").modal("hide");
      } else {
        console.error("Failed to create department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
    }
  });

// Edit employee (popup form)
async function editDepartment(id) {
  console.log("Edit button clicked");
  const response = await fetch(`${baseUrl}/departments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const department = await response.json();

  // Populate the popup form with employee data
  document.getElementById("editDepartmentId").value = department.departmentId;
  document.getElementById("editDepartmentName").value =
    department.departmentName;
  document.getElementById("editLocationId").value = department.locationId;
  document.getElementById("editManagerId").value = department.managerId;

  // Show the popup modal
  $("#editDepartmentModal").modal("show");
}

// Submit the edited employee data
async function submitEditDepartment(event) {
  event.preventDefault();

  const updatedDepartment = {
    departmentId: document.getElementById("editDepartmentId").value,
    departmentName: document.getElementById("editDepartmentName").value,
    locationId: document.getElementById("editLocationId").value,
    managerId: document.getElementById("editManagerId").value,
  };

  const response = await fetch(
    `${baseUrl}/departments/${updatedDepartment.departmentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDepartment),
    }
  );

  if (response.ok) {
    alert("Department updated successfully!");
    fetchDepartments(); // Reload employee data after update
    $("#editDepartmentModal").modal("hide"); // Hide the popup using Bootstrap's modal control
  } else {
    alert("Failed to update department.");
  }
}

// Close the edit modal without saving
function closeEditModal() {
  $("#editDepartmentModal").modal("hide");
}

// Delete employee
async function deleteDepartment(id) {
  if (confirm(`Are you sure you want to delete department ID ${id}?`)) {
    const response = await fetch(`${baseUrl}/departments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      alert("Department deleted successfully!");
      fetchDepartments(); // Reload employee data after deletion
    } else {
      alert("Failed to delete department.");
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchDepartments);
document.getElementById("logoutButton").onclick = () => {
  localStorage.removeItem("jwtToken");
  window.location.href = "login.html";
};
