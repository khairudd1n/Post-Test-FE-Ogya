const baseUrl = "http://localhost:8080";
const token = localStorage.getItem("jwtToken");

if (!token) {
  window.location.href = "login.html";
}

let currentPage = 1;
const rowsPerPage = 5; // Jumlah baris per halaman
let jobHistoryData = []; // Menyimpan data karyawan

async function fetchJobHistoryDetails() {
  try {
    const response = await fetch(`${baseUrl}/job-history/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch department details");
    }

    jobHistoryData = await response.json();
    displayTable(jobHistoryData);
    setupPagination(jobHistoryData.length);
  } catch (error) {
    console.error("Error fetching department details:", error);
  }
}

function displayTable(data) {
  const tableBody = document.getElementById("jobHistoryBody");
  tableBody.innerHTML = ""; // Clear any existing data

  // Filter data based on search input
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const filteredData = data.filter((jobHistory) => {
    return Object.values(jobHistory).some((value) =>
      String(value).toLowerCase().includes(searchInput)
    );
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  paginatedData.forEach((jobHistory) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${jobHistory.jobHistoryId}</td>
          <td>${jobHistory.departmentName}</td>
          <td>${jobHistory.employeeId}</td>
          <td>${jobHistory.jobTitle}</td>
          <td>${jobHistory.hireDate}</td>
          <td>${jobHistory.endDate ? item.endDate : "Masih kerja"}</td>
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
      displayTable(jobHistoryData);
    };
    pagination.appendChild(pageButton);
  }
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1; // Reset to first page on search
  displayTable(jobHistoryData);
});

function displayError(message) {
  const tableBody = document.getElementById("jobHistoryBody");
  tableBody.innerHTML = `<tr><td colspan="6">${message}</td></tr>`;
}

// Fetch job history details when the page loads
document.addEventListener("DOMContentLoaded", fetchJobHistoryDetails);
