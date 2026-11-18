// 1. Initialize Supabase Client
const SUPABASE_URL = "https://jayilmfdjotbpnprpbkc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_B-2NPAqhvuCge5ysuEVYMw_aRiOYc5b";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let applicationsData = [];
let editingId = null;

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 2. Authentication Functions
async function signUp() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  if (!email || !password) return alert("Enter an email and password.");

  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    alert("Sign up error: " + error.message);
  } else {
    alert("Account created! You are now signed in.");
    checkUserSession();
  }
}

async function signIn() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  if (!email || !password) return alert("Enter your email and password.");

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Sign in error: " + error.message);
  } else {
    checkUserSession();
  }
}

async function signOut() {
  await supabaseClient.auth.signOut();
  applicationsData = [];
  editingId = null;
  checkUserSession();
}

async function checkUserSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const authForm = document.getElementById("authForm");
  const userBar = document.getElementById("userBar");
  const trackerApp = document.getElementById("trackerApp");
  const authStatus = document.getElementById("authStatus");

  if (session && session.user) {
    authForm.style.display = "none";
    authStatus.style.display = "none";
    userBar.style.display = "flex";
    document.getElementById("userEmailDisplay").textContent = "Signed in as: " + session.user.email;
    trackerApp.style.display = "block";
    loadApplications();
  } else {
    authForm.style.display = "flex";
    authStatus.style.display = "block";
    userBar.style.display = "none";
    trackerApp.style.display = "none";
  }
}

// 3. Load Applications from Supabase
async function loadApplications() {
  const { data, error } = await supabaseClient
    .from("applications")
    .select("*")
    .order("applied_date", { ascending: false });

  if (error) {
    console.error("Error loading applications:", error.message);
    return;
  }

  applicationsData = data || [];
  renderTable(applicationsData);
}

function renderTable(list) {
  const table = document.getElementById("applicationTable");
  table.innerHTML = "";

  list.forEach((app) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${escapeHTML(app.company)}</td>
      <td>${escapeHTML(app.role_title)}</td>
      <td>${escapeHTML(app.applied_date)}</td>
      <td class="${escapeHTML(app.status).toLowerCase()}">${escapeHTML(app.status)}</td>
      <td>
        <button class="edit-btn" onclick="editRow('${app.id}')">Edit</button>
        <button class="delete-btn" onclick="deleteRow('${app.id}')">Delete</button>
      </td>
    `;
    table.appendChild(newRow);
  });

  updateCounter();
  updateStats();
}

// 4. Add or Update Application in Supabase
async function addApplication() {
  const company = document.getElementById("company").value.trim();
  const role_title = document.getElementById("position").value.trim();
  const applied_date = document.getElementById("date").value;
  const status = document.getElementById("status").value;

  if (company === "" || role_title === "" || applied_date === "") {
    alert("Please fill out all fields.");
    return;
  }

  if (editingId !== null) {
    // Update existing row
    const { error } = await supabaseClient
      .from("applications")
      .update({ company, role_title, applied_date, status })
      .eq("id", editingId);

    if (error) return alert("Update failed: " + error.message);
    editingId = null;
    document.getElementById("submitBtn").textContent = "Add Application";
  } else {
    // Insert new row
    const { error } = await supabaseClient
      .from("applications")
      .insert([{ company, role_title, applied_date, status }]);

    if (error) return alert("Save failed: " + error.message);
  }

  document.getElementById("company").value = "";
  document.getElementById("position").value = "";
  document.getElementById("date").value = "";
  document.getElementById("status").value = "Applied";

  loadApplications();
}

function editRow(id) {
  const app = applicationsData.find((item) => String(item.id) === String(id));
  if (!app) return;

  document.getElementById("company").value = app.company;
  document.getElementById("position").value = app.role_title;
  document.getElementById("date").value = app.applied_date;
  document.getElementById("status").value = app.status;

  editingId = app.id;
  document.getElementById("submitBtn").textContent = "Save Changes";
  document.getElementById("company").focus();
}

async function deleteRow(id) {
  const { error } = await supabaseClient
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed: " + error.message);
    return;
  }

  editingId = null;
  document.getElementById("submitBtn").textContent = "Add Application";
  loadApplications();
}

async function clearAll() {
  if (!confirm("Delete all applications from your database?")) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { error } = await supabaseClient
    .from("applications")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    alert("Clear failed: " + error.message);
    return;
  }

  editingId = null;
  document.getElementById("submitBtn").textContent = "Add Application";
  loadApplications();
}

// 5. Stats, Search, Sort & CSV Export
function updateCounter() {
  document.getElementById("counter").textContent =
    "Total Applications: " + applicationsData.length;
}

function updateStats() {
  let applied = 0;
  let interviewing = 0;
  let offer = 0;
  let rejected = 0;

  applicationsData.forEach((app) => {
    if (app.status === "Applied") applied++;
    if (app.status === "Interviewing") interviewing++;
    if (app.status === "Offer") offer++;
    if (app.status === "Rejected") rejected++;
  });

  document.getElementById("appliedCount").textContent = applied;
  document.getElementById("interviewingCount").textContent = interviewing;
  document.getElementById("offerCount").textContent = offer;
  document.getElementById("rejectedCount").textContent = rejected;
}

function searchApplications() {
  const search = document.getElementById("search").value.toLowerCase();
  const filtered = applicationsData.filter(
    (app) =>
      app.company.toLowerCase().includes(search) ||
      app.role_title.toLowerCase().includes(search)
  );
  renderTable(filtered);
}

function sortApplications() {
  const sortBy = document.getElementById("sortOption").value;
  if (!sortBy) return;

  const sorted = [...applicationsData].sort((a, b) => {
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "position") return a.role_title.localeCompare(b.role_title);
    if (sortBy === "date") return new Date(b.applied_date) - new Date(a.applied_date);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  renderTable(sorted);
}

function exportCSV() {
  let csv = "Company,Position,Date Applied,Status\n";
  applicationsData.forEach((app) => {
    const company = `"${app.company.replace(/"/g, '""')}"`;
    const position = `"${app.role_title.replace(/"/g, '""')}"`;
    csv += `${company},${position},${app.applied_date},${app.status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "job-applications.csv";
  link.click();
}

window.onload = function () {
  checkUserSession();
};