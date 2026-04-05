/**
 * Rideshare Battle Boards (READ-ONLY from Supabase, NO WORKERS)
 * - Data entry happens manually in Supabase Table Editor
 * - This app only READS from Supabase using anon key + RLS SELECT policies
 *
 * Requirements:
 * 1) index.html includes:
 *    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 * 2) RLS enabled + SELECT policies for anon on:
 *    drives_daily, challenges, tier_periods
 */

const SUPABASE_URL = "https://vpwegwzronwnxvdturvy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwd2Vnd3pyb253bnh2ZHR1cnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwOTI3NzMsImV4cCI6MjA4MjY2ODc3M30.iB8oydlAIbjyyJ60NXCLcXTibDeo6fQatxGzdO3sSKs"; // <-- REQUIRED

// Chart.js is already loaded by index.html
let charts = {};

// App state
let state = {
  mode: localStorage.getItem("mode") || "zai",
  viewing: "Cody",
  data: [],
  challenges: [],
  tier: null
};

function $(id) {
  return document.getElementById(id);
}

function ymd(d = new Date()) {
  return d.toISOString().split("T")[0];
}

function startOfMonthStr(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

function safeNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function clampNonNeg(n) {
  n = safeNum(n, 0);
  return n < 0 ? 0 : n;
}

function fmtMoney(n) {
  return `$${safeNum(n, 0).toFixed(2)}`;
}

function fmtInt(n) {
  return String(Math.round(safeNum(n, 0)));
}

function renderMode() {
  const entry = $("entrySection");
  if (!entry) return;
  state.mode === "cody" ? entry.classList.remove("hidden") : entry.classList.add("hidden");

  // Since we're doing manual edits in Supabase, disable submit UX
  const form = $("logForm");
  if (form) {
    const btn = form.querySelector("button");
    if (btn) {
      btn.textContent = "MANUAL MODE (EDIT IN SUPABASE)";
      btn.disabled = true;
      btn.classList.add("opacity-60");
      btn.title = "Manual Mode: Edit rows in Supabase Table Editor.";
    }
  }
}

function switchTab() {
  const c = $("tabCody");
  const z = $("tabZai");
  const active = "flex-1 py-2 rounded-xl transition-all bg-white shadow-sm";
  const inactive = "flex-1 py-2 rounded-xl transition-all text-slate-500";

  c.className = state.viewing === "Cody" ? active : inactive;
  z.className = state.viewing === "Zai" ? active : inactive;

  fetchData(); // refresh view
}

function bindEvents() {
  $("appMode").onchange = (e) => {
    state.mode = e.target.value;
    localStorage.setItem("mode", state.mode);
    renderMode();
  };

  $("tabCody").onclick = () => { state.viewing = "Cody"; switchTab(); };
  $("tabZai").onclick = () => { state.viewing = "Zai"; switchTab(); };

  // We are not submitting via browser in this mode
  const form = $("logForm");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      alert("Manual Mode: Enter/update data in Supabase Table Editor.");
    };
  }
}

function ensureSupabase() {
  if (!window.supabase) {
    throw new Error("Supabase JS client not found. Add <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> to index.html");
  }
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("PASTE_ANON_KEY_HERE")) {
    throw new Error("Missing SUPABASE_ANON_KEY. Paste your anon public key into app.js.");
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function getDrives(sb, driver, start, end) {
  const { data, error } = await sb
    .from("drives_daily")
    .select("*")
    .eq("driver", driver)
    .gte("drive_date", start)
    .lte("drive_date", end)
    .order("drive_date", { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function getChallenges(sb, driver) {
  const { data, error } = await sb
    .from("challenges")
    .select("*")
    .eq("driver", driver)
    .order("start_date", { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

async function getTierForDate(sb, driver, date) {
  const { data, error } = await sb
    .from("tier_periods")
    .select("*")
    .eq("driver", driver)
    .lte("period_start", date)
    .gte("period_end", date)
    .order("period_start", { ascending: false })
    .limit(1);

  if (error) throw error;
  return (Array.isArray(data) && data[0]) ? data[0] : null;
}

async function fetchData() {
  const sb = ensureSupabase();

  const todayStr = ymd(new Date());
  const startMonth = startOfMonthStr(new Date());

  try {
    const [drives, tier, challenges] = await Promise.all([
      getDrives(sb, state.viewing, startMonth, todayStr),
      getTierForDate(sb, state.viewing, todayStr),
      getChallenges(sb, state.viewing)
    ]);

    state.data = drives;
    state.tier = tier;
    state.challenges = challenges;

    render();
  } catch (e) {
    console.error("Supabase read failure:", e);

    // Visible fail-state
    const container = document.querySelector("main");
    if (container) {
      const msg = document.createElement("div");
      msg.className = "bg-red-50 border border-red-200 text-red-900 p-4 rounded-3xl";
      msg.innerHTML = `
        <div class="text-xs font-black uppercase tracking-widest mb-2">Data Load Failed</div>
        <div class="text-sm font-semibold">${String(e.message || e)}</div>
        <div class="text-xs text-red-800 mt-2">
          Checklist:
          <ul class="list-disc ml-5 mt-1">
            <li>Did you add the Supabase JS script tag in index.html?</li>
            <li>Did you paste the SupABASE anon key into app.js?</li>
            <li>Is RLS enabled AND anon SELECT policies created for drives_daily/challenges/tier_periods?</li>
          </ul>
        </div>
      `;
      // Replace any existing error cards
      const existing = container.querySelector("[data-error-card='1']");
      if (existing) existing.remove();
      msg.setAttribute("data-error-card", "1");
      container.prepend(msg);
    }
  }
}

function getNet(d) {
  return (safeNum(d.earnings, 0) + safeNum(d.tips, 0)) - safeNum(d.gas_cost, 0) - safeNum(d.other_costs, 0);
}

function render() {
  const todayStr = ymd(new Date());
  const todayData = state.data.find(d => d.drive_date === todayStr) || {};

  // Vehicle status dot
  const navStatus = $("navVehicleStatus");
  if (navStatus) {
    navStatus.className = `status-dot bg-status-${todayData.vehicle_status || "green"}`;
  }

  // Notes & Rating
  $("displayNotes").textContent = todayData.notes || "";
  $("displayRating").textContent = `⭐ ${safeNum(todayData.rating_stars, 5).toFixed(1)}`;

  // Today net + efficiency
  const tNet = getNet(todayData);
  $("statTodayNet").textContent = fmtMoney(tNet);

  const drivingHours = clampNonNeg(todayData.driving_hours) || 0;
  const eff = drivingHours > 0 ? (tNet / drivingHours) : tNet;
  $("statTodayEfficiency").textContent = `$${eff.toFixed(2)}/hr`;

  // Week & Month nets
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const weekNet = state.data
    .filter(d => new Date(d.drive_date) >= weekStart)
    .reduce((a, b) => a + getNet(b), 0);

  const monthNet = state.data.reduce((a, b) => a + getNet(b), 0);

  $("statWeekNet").textContent = `$${fmtInt(weekNet)}`;
  $("statMonthNet").textContent = `$${fmtInt(monthNet)}`;

  // Challenges
  renderChallenges();

  // Tier
  const pts = safeNum(state.tier?.points_total, 0);

  // Your tier thresholds (adjust anytime)
  let name = "SILVER", next = 500;
  if (pts >= 2000) { name = "PLATINUM"; next = 5000; }
  else if (pts >= 1000) { name = "GOLD"; next = 2000; }
  else if (pts >= 500) { name = "SILVER"; next = 1000; }

  $("tierName").textContent = name;
  $("tierPoints").textContent = `${pts} PTS`;
  $("tierNext").textContent = `NEXT: ${next}`;
  $("tierProgress").style.width = `${Math.min(100, (pts / next) * 100)}%`;
  $("tierPerk").textContent = fmtMoney(state.tier?.perk_value || 0);

  updateCharts();
}

function renderChallenges() {
  const container = $("challengeContainer");
  container.innerHTML = "";

  // No challenges = show a small placeholder
  if (!state.challenges.length) {
    container.innerHTML = `
      <div class="bg-slate-100 border border-slate-200 p-4 rounded-3xl">
        <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active challenges</div>
        <div class="text-xs text-slate-600 mt-1">Add challenge rows in Supabase → public.challenges</div>
      </div>
    `;
    return;
  }

  state.challenges.forEach(chal => {
    const ridesInWindow = state.data
      .filter(d => d.drive_date >= chal.start_date && d.drive_date <= chal.end_date)
      .reduce((sum, d) => sum + safeNum(d.rides_completed, 0), 0);

    const required = safeNum(chal.required_rides, 0) || 1;
    const perc = Math.min(100, Math.round((ridesInWindow / required) * 100));

    const html = `
      <div class="bg-blue-50 border border-blue-100 p-4 rounded-3xl">
        <div class="flex justify-between items-center mb-2">
          <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">${chal.label}</span>
          <span class="text-[10px] font-bold text-blue-800">${ridesInWindow} / ${chal.required_rides}</span>
        </div>
        <div class="h-2 bg-blue-200 rounded-full overflow-hidden">
          <div class="h-full bg-blue-600 transition-all duration-700" style="width: ${perc}%"></div>
        </div>
        <div class="text-[10px] text-blue-900/70 mt-2 font-semibold">
          ${chal.start_date} → ${chal.end_date}
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

function updateCharts() {
  // Destroy existing charts
  if (charts.week) charts.week.destroy();
  if (charts.month) charts.month.destroy();

  const last7 = state.data.slice(-7);

  // Rides bar chart (last 7)
  charts.week = new Chart($("chartWeekRides"), {
    type: "bar",
    data: {
      labels: last7.map(d => d.drive_date.split("-").slice(1).join("/")),
      datasets: [{
        data: last7.map(d => safeNum(d.rides_completed, 0)),
        backgroundColor: "#3b82f6",
        borderRadius: 4
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Month gas line chart
  charts.month = new Chart($("chartMonthGas"), {
    type: "line",
    data: {
      labels: state.data.map(d => d.drive_date.split("-")[2]),
      datasets: [{
        data: state.data.map(d => safeNum(d.gas_cost, 0)),
        borderColor: "#f59e0b",
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(245,158,11,0.05)"
      }]
    },
    options: {
      plugins: { legend: { display: false } }
    }
  });
}

async function init() {
  $("appMode").value = state.mode;
  $("formDate").valueAsDate = new Date();

  bindEvents();
  renderMode();
  await fetchData();
}

init();
