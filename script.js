function addApplication() {
    const company = document.getElementById("company").value;
    const position = document.getElementById("position").value;
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;
    if (company === "" || position === "" || date === "") {
        alert("Please fill out all fields.");
        return;
    }
    const table = document.getElementById("applicationTable");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${company}</td>
        <td>${position}</td>
        <td>${date}</td>
        <td class="${status.toLowerCase()}">${status}</td>
        <td>
        <button class="edit-btn" onclick="editRow(this)">Edit</button>
        <button onclick="deleteRow(this)">Delete</button>
        </td>
    `;
    table.appendChild(newRow);
    saveApplications();
    updateCounter();
    updateStats();
    document.getElementById("company").value = "";
    document.getElementById("position").value = "";
    document.getElementById("date").value = "";
    document.getElementById("status").value = "Applied";
}
function updateCounter() {
    const total =
        document.getElementById("applicationTable").rows.length;
    document.getElementById("counter").textContent =
        "Total Applications: " + total;
}
function deleteRow(button) {
  button.parentElement.parentElement.remove();
  updateCounter();
  updateStats();
  saveApplications();
}
function searchApplications() {
    const search =
        document.getElementById("search").value.toLowerCase();
    const rows =
        document.getElementById("applicationTable")
        .getElementsByTagName("tr");
    for (let row of rows) {
        const company =
            row.cells[0].textContent.toLowerCase();
        if (company.includes(search)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    }
}
function saveApplications() {
  localStorage.setItem(
    "applications",
    document.getElementById("applicationTable").innerHTML
  );
  }
window.onload = function() {
  const saved=
  localStorage.getItem("applications");
  if (saved) {
    document.getElementById("applicationTable").innerHTML = saved;
    updateCounter();
    updateStats();
  }
};
function updateStats() {
  const rows =
    document.getElementById("applicationTable")
    .getElementsByTagName("tr");
    let applied = 0;
    let interviewing = 0;
    let offer = 0;
    let rejected = 0;
    for (let row of rows) {
      const status = row.cells[3].textContent;
      if (status === "Applied") applied++;
      if (status === "Interviewing") interviewing++;
      if (status === "Offer") offer++;
      if (status === "Rejected") rejected++;
    }
    document.getElementById("appliedCount").textContent = applied;
    document.getElementById("interviewingCount").textContent = interviewing;
    document.getElementById("offerCount").textContent = offer;
    document.getElementById("rejectedCount").textContent = rejected;
}
function clearAll(){
  if (confirm("Delete all applications?")) {
    document.getElementById("applicationTable").innerHTML = "";
    localStorage.removeItem("applications");
    updateCounter();
    updateStats();
  }
}
function sortApplications() {
  const sortBy = document.getElementById("sortOption").value;
  const table=document.getElementById("applicationTable");
  const rows = Array.from(table.rows);
  let columnIndex = 0;
  if (sortBy === "company") columnIndex = 0;
  if (sortBy === "position") columnIndex = 1;
  if (sortBy === "date") columnIndex = 2;
  if (sortBy === "status") columnIndex = 3;
  rows.sort((a, b) => {
    if (sortBy === "date") {
      return new Date (a.cells[2].textContent) - 
            new Date(b.cells[2].textContent);
    }
    return a.cells[columnIndex].textContent.localeCompare(
      b.cells[columnIndex].textContent
    );
  });
table.innerHTML = "";
rows.forEach(row => table.appendChild (row));
saveApplications();
}
function exportCSV() {
  let csv =
  "Company,Position,Date Applied,Status\n";
  const rows =
  document.getElementById("applicationTable")
  .getElementsByTagName("tr");
  for (let row of rows) {
    csv +=
    row.cells[0].textContent + "," +
    row.cells[1].textContent + "," +
    row.cells[2].textContent + "," +
    row.cells[3].textContent + "\n";
  }
  const blob =
    new Blob([csv], { type: "text/csv"});
  const link =
    document.createElement("a");
  link.href =
    URL.createObjectURL(blob);
  link.download=
    "job-applications.csv";
  link.click();
}
function editRow(button) {
  const row = button.parentElement.parentElement;
  const company = row.cells[0].textContent;
  const position = row.cells[1].textContent;
  const date = row.cells[2].textContent;
  const status = row.cells[3].textContent;
  document.getElementById("company").value = company;
  document.getElementById("position").value = position;
  document.getElementById("date").value = date;
  document.getElementById("status").value = status;
  row.remove();
  updateCounter();
  updateStats();
  saveApplications();
}