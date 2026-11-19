// 1. Initialize Supabase Client
const SUPABASE_URL = "https://jayilmfdjotbpnprpbkc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_B-2NPAqhvuCge5ysuEVYMw_aRiOYc5b";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let applicationsData = [];
let editingId = null;
let currentStatusFilter = "All";
let isDemoMode = false;

const DEMO_APPLICATIONS = [
  {
    id: "demo-1",
    company: "Penn State Health",
    role_title: "IT Support Specialist I",
    applied_date: "2026-11-14",
    status: "Interviewing",
  },
  {
    id: "demo-2",
    company: "Commonwealth of Pennsylvania",
    role_title: "Information Technology Generalist 1",
    applied_date: "2026-11-16",
    status: "Applied",
  },
  {
    id: "demo-3",
    company: "Best Buy (Geek Squad)",
    role_title: "Consultation Agent",
    applied_date: "2026-11-04",
    status: "Offer",
  },
  {
    id: "demo-4",
    company: "UPMC Central PA",
    role_title: "Service Desk Analyst",
    applied_date: "2026-11-18",
    status: "Applied",
  },
  {
    id: "demo-5",
    company: "Giant Food Stores Corporate",
    role_title: "Junior Systems Technician",
    applied_date: "2026-10-28",
    status: "Rejected",
  },
];

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 2. Authentication & Demo Mode Functions
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
    isDemoMode = false;
    checkUserSession();
  }
}

function startDemoMode() {
  isDemoMode = true;
  applicationsData = [...DEMO_APPLICATIONS];
  document.getElementById("authSection").style.display = "none";
  document.getElementById("userBar").style.display = "flex";
  document.getElementById("demoBadge").style.display = "inline-block";
  document.getElementById("userEmailDisplay").textContent = "guest@msjcloud.demo";
  document.getElementById("trackerApp").style.display = "block";
  setDefaultDate();
  applyFiltersAndSort();
}

async function signOut() {
  if (!isDemoMode) {
    await supabaseClient.auth.signOut();
  }
  isDemoMode = false;
  applicationsData = [];
  editingId = null;
  resetForm();
  checkUserSession();
}

async function checkUserSession() {
  if (isDemoMode) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  const authSection = document.getElementById("authSection");
  const userBar = document.getElementById("userBar");
  const trackerApp = document.getElementById("trackerApp");
  const demoBadge = document.getElementById("demoBadge");

  if (session && session.user) {
    authSection.style.display = "none";
    userBar.style.display = "flex";
    demoBadge.style.display = "none";
    document.getElementById("userEmailDisplay").textContent = session.user.email;
    trackerApp.style.display = "block";
    setDefaultDate();
    loadApplications();
  } else {
    authSection.style.display = "block";
    userBar.style.display = "none";
    trackerApp.style.display = "none";
  }
}

function setDefaultDate() {
  const dateInput = document.getElementById("date");
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

// 3. Load Applications from Supabase
async function loadApplications() {
  if (isDemoMode) {
    applyFiltersAndSort();
    return;
  }

  const { data, error } = await supabaseClient
    .from("applications")
    .select("*")
    .order("applied_date", { ascending: false });

  if (error) {
    console.error("Error loading applications:", error.message);
    return;
  }

  applicationsData = data || [];
  applyFiltersAndSort();
}

function renderTable(list) {
  const table = document.getElementById("applicationTable");
  const emptyState = document.getElementById("emptyState");
  table.innerHTML = "";

  if (list.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  list.forEach((app) => {
    const statusClass = `status-${escapeHTML(app.status).toLowerCase()}`;
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td class="company-cell">${escapeHTML(app.company)}</td>
      <td class="role-cell">${escapeHTML(app.role_title)}</td>
      <td class="date-cell">${escapeHTML(app.applied_date)}</td>
      <td>
        <select
          class="status-select ${statusClass}"
          onchange="quickStatusUpdate('${app.id}', this.value)"
          aria-label="Application status"
        >
          <option value="Applied" ${app.status === "Applied" ? "selected" : ""}>Applied</option>
          <option value="Interviewing" ${app.status === "Interviewing" ? "selected" : ""}>Interviewing</option>
          <option value="Offer" ${app.status === "Offer" ? "selected" : ""}>Offer</option>
          <option value="Rejected" ${app.status === "Rejected" ? "selected" : ""}>Rejected</option>
        </select>
      </td>
      <td class="text-right">
        <div class="row-actions">
          <button class="btn btn-secondary btn-sm" onclick="editRow('${app.id}')">Edit</button>
          <button class="btn btn-danger-outline btn-sm" onclick="deleteRow('${app.id}')">Delete</button>
        </div>
      </td>
    `;
    table.appendChild(newRow);
  });

  updateStats();
}

// 4. Add, Update & Quick Status Change
async function addApplication() {
  const company = document.getElementById("company").value.trim();
  const role_title = document.getElementById("position").value.trim();
  const applied_date = document.getElementById("date").value;
  const status = document.getElementById("status").value;

  if (company === "" || role_title === "" || applied_date === "") {
    alert("Please fill out Company, Role, and Date Applied.");
    return;
  }

  if (isDemoMode) {
    if (editingId !== null) {
      applicationsData = applicationsData.map((item) =>
        String(item.id) === String(editingId)
          ? { ...item, company, role_title, applied_date, status }
          : item
      );
    } else {
      applicationsData.unshift({
        id: "demo-" + Date.now(),
        company,
        role_title,
        applied_date,
        status,
      });
    }
    resetForm();
    applyFiltersAndSort();
    return;
  }

  if (editingId !== null) {
    const { error } = await supabaseClient
      .from("applications")
      .update({ company, role_title, applied_date, status })
      .eq("id", editingId);

    if (error) return alert("Update failed: " + error.message);
  } else {
    const { error } = await supabaseClient
      .from("applications")
      .insert([{ company, role_title, applied_date, status }]);

    if (error) return alert("Save failed: " + error.message);
  }

  resetForm();
  loadApplications();
}

async function quickStatusUpdate(id, newStatus) {
  if (isDemoMode) {
    applicationsData = applicationsData.map((item) =>
      String(item.id) === String(id) ? { ...item, status: newStatus } : item
    );
    applyFiltersAndSort();
    return;
  }

  const { error } = await supabaseClient
    .from("applications")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    alert("Status update failed: " + error.message);
    return;
  }
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
  document.getElementById("formHeading").textContent = "Edit Application";
  document.getElementById("submitBtn").textContent = "Save Changes";
  document.getElementById("cancelEditBtn").style.display = "inline-flex";
  document.getElementById("company").focus();
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingId = null;
  document.getElementById("company").value = "";
  document.getElementById("position").value = "";
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  document.getElementById("status").value = "Applied";
  document.getElementById("formHeading").textContent = "Add New Application";
  document.getElementById("submitBtn").textContent = "+ Add Application";
  document.getElementById("cancelEditBtn").style.display = "none";
}

async function deleteRow(id) {
  if (isDemoMode) {
    applicationsData = applicationsData.filter((item) => String(item.id) !== String(id));
    if (String(editingId) === String(id)) resetForm();
    applyFiltersAndSort();
    return;
  }

  const { error } = await supabaseClient
    .from("applications")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed: " + error.message);
    return;
  }

  if (String(editingId) === String(id)) resetForm();
  loadApplications();
}

async function clearAll() {
  if (!confirm("Delete all applications from your current list?")) return;

  if (isDemoMode) {
    applicationsData = [];
    resetForm();
    applyFiltersAndSort();
    return;
  }

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

  resetForm();
  loadApplications();
}

// 5. KPI Stats, Filtering, Sorting & CSV Export
function updateStats() {
  const total = applicationsData.length;
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

  const rate = total > 0 ? Math.round(((interviewing + offer) / total) * 100) : 0;

  document.getElementById("counter").textContent = total;
  document.getElementById("appliedCount").textContent = applied;
  document.getElementById("interviewingCount").textContent = interviewing;
  document.getElementById("offerCount").textContent = offer;
  document.getElementById("rejectedCount").textContent = rejected;
  document.getElementById("responseRate").textContent = `${rate}%`;
}

function setStatusFilter(status, tabEl) {
  currentStatusFilter = status;
  document.querySelectorAll(".filter-tab").forEach((btn) => btn.classList.remove("active"));
  if (tabEl) tabEl.classList.add("active");
  applyFiltersAndSort();
}

function applyFiltersAndSort() {
  const search = document.getElementById("search").value.toLowerCase().trim();
  const sortBy = document.getElementById("sortOption").value;

  let result = applicationsData.filter((app) => {
    const matchesStatus =
      currentStatusFilter === "All" || app.status === currentStatusFilter;
    const matchesSearch =
      app.company.toLowerCase().includes(search) ||
      app.role_title.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  result.sort((a, b) => {
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "position") return a.role_title.localeCompare(b.role_title);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return new Date(b.applied_date) - new Date(a.applied_date);
  });

  renderTable(result);
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