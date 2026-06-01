/* ===== Dashboard Penyisihan Piala Dunia 2026 (versi server) =====
   Data tersimpan di server (PHP + MySQL via api.php), bukan localStorage,
   sehingga bisa diakses banyak peserta dari perangkat berbeda.
   Poin: tebakan benar = 10, salah = 0. Skor dihitung di server.
*/

/* ============ Lokasi API ============
   Jika frontend & api.php berada di domain yang sama (disarankan: sama-sama
   di idcloudhost), biarkan "api.php". Jika frontend di GitHub Pages dan API
   di idcloudhost, ganti ke URL penuh, mis: "https://domain-anda/api.php" */
const API_URL = "api.php";

/* ---------- Data turnamen (statis) ---------- */
const GROUPS = {
  A: ["Meksiko", "Afrika Selatan", "Korea Selatan", "Ceko"],
  B: ["Kanada", "Bosnia", "Qatar", "Swiss"],
  C: ["Brasil", "Maroko", "Haiti", "Skotlandia"],
  D: ["Amerika Serikat", "Paraguay", "Australia", "Turki"],
  E: ["Jerman", "Curaçao", "Pantai Gading", "Ekuador"],
  F: ["Belanda", "Jepang", "Swedia", "Tunisia"],
  G: ["Belgia", "Mesir", "Iran", "Selandia Baru"],
  H: ["Spanyol", "Tanjung Verde", "Arab Saudi", "Uruguay"],
  I: ["Prancis", "Senegal", "Irak", "Norwegia"],
  J: ["Argentina", "Aljazair", "Austria", "Yordania"],
  K: ["Portugal", "DR Kongo", "Uzbekistan", "Kolombia"],
  L: ["Inggris", "Kroasia", "Ghana", "Panama"],
};

// Jadwal resmi babak grup (waktu ET). { h, a, d, t, v }
const FIXTURES = {
  A: [
    { h: 0, a: 1, d: "2026-06-11", t: "15:00", v: "Estadio Azteca, Mexico City" },
    { h: 2, a: 3, d: "2026-06-11", t: "22:00", v: "Estadio Akron, Guadalajara" },
    { h: 3, a: 1, d: "2026-06-18", t: "12:00", v: "Mercedes-Benz Stadium, Atlanta" },
    { h: 0, a: 2, d: "2026-06-18", t: "21:00", v: "Estadio Akron, Guadalajara" },
    { h: 3, a: 0, d: "2026-06-24", t: "21:00", v: "Estadio Azteca, Mexico City" },
    { h: 1, a: 2, d: "2026-06-24", t: "21:00", v: "Estadio BBVA, Monterrey" },
  ],
  B: [
    { h: 0, a: 1, d: "2026-06-12", t: "15:00", v: "BMO Field, Toronto" },
    { h: 2, a: 3, d: "2026-06-13", t: "15:00", v: "Levi's Stadium, San Francisco" },
    { h: 3, a: 1, d: "2026-06-18", t: "15:00", v: "SoFi Stadium, Los Angeles" },
    { h: 0, a: 2, d: "2026-06-18", t: "18:00", v: "BC Place, Vancouver" },
    { h: 3, a: 0, d: "2026-06-24", t: "15:00", v: "BC Place, Vancouver" },
    { h: 1, a: 2, d: "2026-06-24", t: "15:00", v: "Lumen Field, Seattle" },
  ],
  C: [
    { h: 0, a: 1, d: "2026-06-13", t: "18:00", v: "MetLife Stadium, New Jersey" },
    { h: 2, a: 3, d: "2026-06-13", t: "21:00", v: "Gillette Stadium, Boston" },
    { h: 3, a: 1, d: "2026-06-19", t: "18:00", v: "Gillette Stadium, Boston" },
    { h: 0, a: 2, d: "2026-06-19", t: "21:00", v: "Lincoln Financial Field, Philadelphia" },
    { h: 3, a: 0, d: "2026-06-24", t: "18:00", v: "Hard Rock Stadium, Miami" },
    { h: 1, a: 2, d: "2026-06-24", t: "18:00", v: "Mercedes-Benz Stadium, Atlanta" },
  ],
  D: [
    { h: 0, a: 1, d: "2026-06-12", t: "21:00", v: "SoFi Stadium, Los Angeles" },
    { h: 2, a: 3, d: "2026-06-13", t: "00:00", v: "BC Place, Vancouver" },
    { h: 0, a: 2, d: "2026-06-19", t: "15:00", v: "Lumen Field, Seattle" },
    { h: 3, a: 1, d: "2026-06-19", t: "00:00", v: "Levi's Stadium, San Francisco" },
    { h: 3, a: 0, d: "2026-06-25", t: "22:00", v: "SoFi Stadium, Los Angeles" },
    { h: 1, a: 2, d: "2026-06-25", t: "22:00", v: "Levi's Stadium, San Francisco" },
  ],
  E: [
    { h: 0, a: 1, d: "2026-06-14", t: "13:00", v: "NRG Stadium, Houston" },
    { h: 2, a: 3, d: "2026-06-14", t: "19:00", v: "Lincoln Financial Field, Philadelphia" },
    { h: 0, a: 2, d: "2026-06-20", t: "16:00", v: "BMO Field, Toronto" },
    { h: 3, a: 1, d: "2026-06-20", t: "20:00", v: "Arrowhead Stadium, Kansas City" },
    { h: 3, a: 0, d: "2026-06-25", t: "16:00", v: "MetLife Stadium, New Jersey" },
    { h: 1, a: 2, d: "2026-06-25", t: "16:00", v: "Lincoln Financial Field, Philadelphia" },
  ],
  F: [
    { h: 0, a: 1, d: "2026-06-14", t: "16:00", v: "AT&T Stadium, Dallas" },
    { h: 2, a: 3, d: "2026-06-14", t: "22:00", v: "Estadio BBVA, Monterrey" },
    { h: 0, a: 2, d: "2026-06-20", t: "13:00", v: "NRG Stadium, Houston" },
    { h: 3, a: 1, d: "2026-06-20", t: "00:00", v: "Estadio BBVA, Monterrey" },
    { h: 1, a: 2, d: "2026-06-25", t: "19:00", v: "AT&T Stadium, Dallas" },
    { h: 3, a: 0, d: "2026-06-25", t: "19:00", v: "Arrowhead Stadium, Kansas City" },
  ],
  G: [
    { h: 0, a: 1, d: "2026-06-15", t: "15:00", v: "Lumen Field, Seattle" },
    { h: 2, a: 3, d: "2026-06-15", t: "21:00", v: "SoFi Stadium, Los Angeles" },
    { h: 0, a: 2, d: "2026-06-21", t: "15:00", v: "SoFi Stadium, Los Angeles" },
    { h: 3, a: 1, d: "2026-06-21", t: "21:00", v: "BC Place, Vancouver" },
    { h: 1, a: 2, d: "2026-06-26", t: "23:00", v: "Lumen Field, Seattle" },
    { h: 3, a: 0, d: "2026-06-26", t: "23:00", v: "BC Place, Vancouver" },
  ],
  H: [
    { h: 0, a: 1, d: "2026-06-15", t: "12:00", v: "Mercedes-Benz Stadium, Atlanta" },
    { h: 2, a: 3, d: "2026-06-15", t: "18:00", v: "Hard Rock Stadium, Miami" },
    { h: 0, a: 2, d: "2026-06-21", t: "12:00", v: "Mercedes-Benz Stadium, Atlanta" },
    { h: 3, a: 1, d: "2026-06-21", t: "18:00", v: "Hard Rock Stadium, Miami" },
    { h: 1, a: 2, d: "2026-06-26", t: "20:00", v: "NRG Stadium, Houston" },
    { h: 3, a: 0, d: "2026-06-26", t: "20:00", v: "Estadio Akron, Guadalajara" },
  ],
  I: [
    { h: 0, a: 1, d: "2026-06-16", t: "15:00", v: "MetLife Stadium, New Jersey" },
    { h: 2, a: 3, d: "2026-06-16", t: "18:00", v: "Gillette Stadium, Boston" },
    { h: 0, a: 2, d: "2026-06-22", t: "17:00", v: "Lincoln Financial Field, Philadelphia" },
    { h: 3, a: 1, d: "2026-06-22", t: "20:00", v: "MetLife Stadium, New Jersey" },
    { h: 3, a: 0, d: "2026-06-26", t: "15:00", v: "Gillette Stadium, Boston" },
    { h: 1, a: 2, d: "2026-06-26", t: "15:00", v: "BMO Field, Toronto" },
  ],
  J: [
    { h: 0, a: 1, d: "2026-06-16", t: "21:00", v: "Arrowhead Stadium, Kansas City" },
    { h: 2, a: 3, d: "2026-06-16", t: "00:00", v: "Levi's Stadium, San Francisco" },
    { h: 0, a: 2, d: "2026-06-22", t: "13:00", v: "AT&T Stadium, Dallas" },
    { h: 3, a: 1, d: "2026-06-22", t: "23:00", v: "Levi's Stadium, San Francisco" },
    { h: 1, a: 2, d: "2026-06-27", t: "22:00", v: "Arrowhead Stadium, Kansas City" },
    { h: 3, a: 0, d: "2026-06-27", t: "22:00", v: "AT&T Stadium, Dallas" },
  ],
  K: [
    { h: 0, a: 1, d: "2026-06-17", t: "13:00", v: "NRG Stadium, Houston" },
    { h: 2, a: 3, d: "2026-06-17", t: "22:00", v: "Estadio Azteca, Mexico City" },
    { h: 0, a: 2, d: "2026-06-23", t: "13:00", v: "NRG Stadium, Houston" },
    { h: 3, a: 1, d: "2026-06-23", t: "22:00", v: "Estadio Akron, Guadalajara" },
    { h: 3, a: 0, d: "2026-06-27", t: "19:30", v: "Hard Rock Stadium, Miami" },
    { h: 1, a: 2, d: "2026-06-27", t: "19:30", v: "Mercedes-Benz Stadium, Atlanta" },
  ],
  L: [
    { h: 0, a: 1, d: "2026-06-17", t: "16:00", v: "AT&T Stadium, Dallas" },
    { h: 2, a: 3, d: "2026-06-17", t: "19:00", v: "BMO Field, Toronto" },
    { h: 0, a: 2, d: "2026-06-23", t: "16:00", v: "Gillette Stadium, Boston" },
    { h: 3, a: 1, d: "2026-06-23", t: "19:00", v: "BMO Field, Toronto" },
    { h: 3, a: 0, d: "2026-06-27", t: "17:00", v: "MetLife Stadium, New Jersey" },
    { h: 1, a: 2, d: "2026-06-27", t: "17:00", v: "Lincoln Financial Field, Philadelphia" },
  ],
};
const MATCHDAY = [1, 1, 2, 2, 3, 3];

const POIN_BENAR = 10;
const POIN_SALAH = 0;
const DEADLINE = new Date("2026-06-10T23:59:59"); // batas pendaftaran peserta baru
const TOTAL_MATCHES = Object.values(FIXTURES).reduce((n, f) => n + f.length, 0); // 72
const AUTH_KEY = "wc2026-auth";

/* ---------- State sesi ---------- */
let auth = null;          // { username, password, role }
let adminMode = false;
let currentUser = null;   // peserta aktif { name, phone, username, submitted, submittedAt }
let results = {};         // tebakan peserta aktif { mkey: res }
let official = {};        // hasil resmi (global)
let configOpen = true;    // status input dibuka/ditutup admin
let users = [];           // (admin) daftar peserta lengkap dari server
let leaderboard = [];     // papan skor dari server
let activeGroup = "A";
let pollTimer = null;

/* ===================== API ===================== */
async function apiCall(action, data) {
  const payload = Object.assign(
    { action, auth: auth ? { username: auth.username, password: auth.password } : null },
    data || {}
  );
  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new Error("Tidak bisa menghubungi server. Periksa koneksi internet.");
  }
  let j;
  try { j = await res.json(); } catch (e) { throw new Error("Respons server tidak valid."); }
  if (!res.ok || j.error) throw new Error(j.error || ("Kesalahan server (" + res.status + ")."));
  return j;
}

/* ---------- Kontrol periode ---------- */
function pastDeadline() { return new Date() > DEADLINE; }
function isInputOpen() { return !pastDeadline() && configOpen; }
function fmtDeadline() { return "10 Juni 2026"; }

function matchKey(group, idx) { return `${group}-${idx}`; }
function isSubmitted() { return !!(currentUser && currentUser.submitted); }
function countFilled(map) { return Object.values(map).filter(Boolean).length; }

/* ---------- Skor (klien, untuk ringkasan "saya") ---------- */
function computeScore(predMap) {
  let score = 0, correct = 0, judged = 0;
  Object.keys(official).forEach((key) => {
    if (!official[key]) return;
    const pred = predMap[key];
    if (!pred) return;
    judged++;
    if (pred === official[key]) { score += POIN_BENAR; correct++; }
  });
  return { score, correct, judged };
}

/* ---------- Format tanggal ---------- */
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
function fmtTanggal(d) {
  const p = (d || "").split("-");
  if (p.length !== 3) return d;
  return `${parseInt(p[2], 10)} ${BULAN[parseInt(p[1], 10) - 1]} ${p[0]}`;
}
function fmtDateTime(s) {
  if (!s) return "-";
  const t = new Date((s || "").replace(" ", "T"));
  if (isNaN(t)) return s;
  return t.toLocaleString("id-ID");
}

/* ---------- Perhitungan klasemen (dari tebakan peserta aktif) ---------- */
function computeStandings(group) {
  const teams = GROUPS[group];
  const table = teams.map((name) => ({ name, P: 0, W: 0, D: 0, L: 0, Pts: 0 }));
  FIXTURES[group].forEach((fx, idx) => {
    const res = results[matchKey(group, idx)];
    if (!res) return;
    const h = fx.h, a = fx.a;
    table[h].P++; table[a].P++;
    if (res === "home") { table[h].W++; table[h].Pts += 3; table[a].L++; }
    else if (res === "away") { table[a].W++; table[a].Pts += 3; table[h].L++; }
    else { table[h].D++; table[a].D++; table[h].Pts++; table[a].Pts++; }
  });
  table.sort((x, y) => y.Pts - x.Pts || y.W - x.W || x.name.localeCompare(y.name));
  return table;
}

/* ===================== RENDER ===================== */
function render() {
  document.getElementById("adminBanner").classList.toggle("hidden", !adminMode);
  document.getElementById("btnReset").style.display = adminMode ? "none" : "";
  document.getElementById("btnRecap").style.display = adminMode ? "none" : "";
  renderBadge();
  renderSaveBar();
  renderAdminPanel();
  renderTabs();
  renderGroup(activeGroup);
  renderSummary();
  renderLeaderboard();
  renderResultsBoard();
}

function renderBadge() {
  const badge = document.getElementById("userBadge");
  if (adminMode) {
    badge.innerHTML = `<span class="avatar admin">★</span><span class="ub-name">ADMIN</span><span class="ub-phone">· panitia</span>`;
  } else if (currentUser) {
    const initial = currentUser.name.trim().charAt(0).toUpperCase() || "?";
    badge.innerHTML = `<span class="avatar">${initial}</span><span class="ub-name">${currentUser.name}</span><span class="ub-phone">· @${currentUser.username}</span>`;
  } else {
    badge.innerHTML = "";
  }
}

function renderTabs() {
  const nav = document.getElementById("groupTabs");
  nav.innerHTML = "";
  Object.keys(GROUPS).forEach((g) => {
    const b = document.createElement("button");
    b.className = "tab" + (g === activeGroup ? " active" : "");
    b.textContent = "Grup " + g;
    b.onclick = () => { activeGroup = g; render(); };
    nav.appendChild(b);
  });
}

function renderGroup(group) {
  const container = document.getElementById("groupContainer");
  container.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "group-panel active";
  const grid = document.createElement("div");
  grid.className = "group-grid";
  grid.appendChild(buildStandingsBlock(group));
  grid.appendChild(buildMatchesBlock(group));
  panel.appendChild(grid);
  container.appendChild(panel);
}

function buildStandingsBlock(group) {
  const block = document.createElement("div");
  block.className = "block";
  block.innerHTML = `<h2>Klasemen Grup ${group} ${adminMode ? "" : "(tebakan Anda)"}</h2>`;
  const table = document.createElement("table");
  table.innerHTML = `<thead><tr><th class="team-col">Tim</th><th>Main</th><th>M</th><th>S</th><th>K</th><th>Poin</th></tr></thead>`;
  const tbody = document.createElement("tbody");
  computeStandings(group).forEach((t, i) => {
    const tr = document.createElement("tr");
    if (i < 2) tr.className = "qualify";
    tr.innerHTML = `<td class="team-col"><span class="pos">${i + 1}</span>${t.name}</td>
      <td>${t.P}</td><td>${t.W}</td><td>${t.D}</td><td>${t.L}</td><td class="pts">${t.Pts}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  block.appendChild(table);
  return block;
}

function buildMatchesBlock(group) {
  const teams = GROUPS[group];
  const block = document.createElement("div");
  block.className = "block";
  block.innerHTML = `<h2>Jadwal & ${adminMode ? "Hasil Resmi" : "Tebakan"} Grup ${group}</h2>`;
  const wrap = document.createElement("div");
  wrap.className = "matches";

  const userLocked = !adminMode && (isSubmitted() || !isInputOpen());

  FIXTURES[group].forEach((fx, idx) => {
    if (idx % 2 === 0) {
      const d = document.createElement("div");
      d.className = "matchday-label";
      d.textContent = "Matchday " + MATCHDAY[idx] + " · " + fmtTanggal(fx.d);
      wrap.appendChild(d);
    }
    const h = fx.h, a = fx.a;
    const key = matchKey(group, idx);
    const pred = results[key];
    const off = official[key];
    const locked = adminMode ? false : userLocked;

    let statusHtml = "";
    if (!adminMode && isSubmitted() && off) {
      const benar = pred === off;
      statusHtml = `<div class="match-status ${benar ? "ok" : "no"}">${benar ? "✓ Benar +" + POIN_BENAR : "✗ Salah +" + POIN_SALAH}</div>`;
    } else if (!adminMode && isSubmitted()) {
      statusHtml = `<div class="match-status pending">🔒 Terkunci · menunggu hasil resmi</div>`;
    } else if (adminMode && off) {
      statusHtml = `<div class="match-status set">✓ Hasil resmi ditetapkan</div>`;
    }

    const cur = adminMode ? off : pred;
    const m = document.createElement("div");
    m.className = "match" + (adminMode ? " admin" : "") + (locked ? " locked" : "");
    m.innerHTML = `
      <div class="home">${teams[h]}</div>
      <div class="vs">vs</div>
      <div class="away">${teams[a]}</div>
      <div class="match-cell">
        <div class="match-meta">🕒 ${fx.t} ET · 📍 ${fx.v}</div>
        <div class="choices">
          <button class="choice sel-home ${cur === "home" ? "active" : ""}" data-res="home" ${locked ? "disabled" : ""}>Menang</button>
          <button class="choice sel-draw ${cur === "draw" ? "active" : ""}" data-res="draw" ${locked ? "disabled" : ""}>Seri</button>
          <button class="choice sel-away ${cur === "away" ? "active" : ""}" data-res="away" ${locked ? "disabled" : ""}>Menang</button>
        </div>
        ${statusHtml}
      </div>`;

    if (!locked) {
      m.querySelectorAll(".choice").forEach((btn) => {
        btn.onclick = async () => {
          const r = btn.dataset.res;
          try {
            if (adminMode) {
              await apiCall("setOfficial", { key, res: official[key] === r ? null : r });
            } else {
              await apiCall("savePrediction", { key, res: results[key] === r ? null : r });
            }
            await refreshState();
          } catch (e) { alert(e.message); }
        };
      });
    }
    wrap.appendChild(m);
  });

  block.appendChild(wrap);
  return block;
}

function renderSummary() {
  const total = TOTAL_MATCHES;
  const predicted = countFilled(results);
  const officialSet = Object.values(official).filter(Boolean).length;
  const { score, correct, judged } = computeScore(results);

  const cards = adminMode
    ? [
        { cls: "", label: "Peserta", val: leaderboard.length },
        { cls: "win", label: "Hasil Resmi", val: `${officialSet}/${total}` },
        { cls: "draw", label: "Status Input", val: isInputOpen() ? "Terbuka" : "Tertutup" },
        { cls: "loss", label: "Sisa Laga", val: total - officialSet },
      ]
    : [
        { cls: "", label: "Tebakan Tersimpan", val: `${predicted}/${total}` },
        { cls: "win", label: "Skor Saya", val: score },
        { cls: "draw", label: "Tebakan Benar", val: `${correct}/${judged}` },
        { cls: "loss", label: "Hasil Resmi", val: `${officialSet}/${total}` },
      ];

  document.getElementById("summary").innerHTML = cards.map((c) =>
    `<div class="card ${c.cls}"><div class="label">${c.label}</div><div class="value">${c.val}</div></div>`
  ).join("");
}

function renderLeaderboard() {
  const board = document.getElementById("leaderboard");
  let body;
  if (!leaderboard.length) {
    body = `<div class="user-list-empty" style="padding:14px 18px">Belum ada peserta.</div>`;
  } else {
    body = `<table>
      <thead><tr><th class="team-col">Peserta</th><th>No. TLP</th><th>Benar</th><th>Dinilai</th><th>Skor</th><th>Tebakan</th></tr></thead>
      <tbody>${leaderboard.map((r, i) => `
        <tr class="${currentUser && r.username === currentUser.username ? "me" : ""}">
          <td class="team-col"><span class="pos">${i + 1}</span>${r.name}</td>
          <td>${r.phone}</td><td>${r.correct}</td><td>${r.judged}</td><td class="pts">${r.score}</td>
          <td><button class="btn btn-ghost btn-sm" data-vlb="${r.username}">👁 Lihat</button></td>
        </tr>`).join("")}</tbody></table>`;
  }
  board.innerHTML = `<h2>🏆 Papan Skor Peserta (benar = ${POIN_BENAR}, salah = ${POIN_SALAH})</h2>${body}`;

  board.querySelectorAll("[data-vlb]").forEach((b) => {
    b.onclick = async () => {
      try {
        const r = await apiCall("getPredictions", { username: b.dataset.vlb });
        const title = `👁 Tebakan ${r.name} (@${b.dataset.vlb})`;
        if (r.hidden) {
          showModal(title, `<p class="recap-empty">🔒 Tebakan peserta ini belum bisa dilihat — peserta belum <b>mengunci (submit)</b> tebakannya.</p>`);
        } else {
          showRecap(title, r.predictions || {});
        }
      } catch (e) { alert(e.message); }
    };
  });
}

function renderResultsBoard() {
  const board = document.getElementById("resultsBoard");
  const rows = [];
  Object.keys(FIXTURES).forEach((g) => {
    FIXTURES[g].forEach((fx, idx) => {
      rows.push({
        g, home: GROUPS[g][fx.h], away: GROUPS[g][fx.a],
        d: fx.d, t: fx.t, off: official[matchKey(g, idx)],
      });
    });
  });
  rows.sort((x, y) => (x.d + x.t).localeCompare(y.d + y.t) || x.g.localeCompare(y.g));
  const selesai = rows.filter((r) => r.off).length;

  const body = rows.map((r) => {
    let hasil;
    if (!r.off) hasil = `<span class="rb-pending">Belum ada hasil</span>`;
    else if (r.off === "draw") hasil = `<span class="rb-draw">🤝 Seri</span>`;
    else hasil = `<span class="rb-win">🏆 ${r.off === "home" ? r.home : r.away} menang</span>`;
    const hw = r.off === "home" ? "win" : "", aw = r.off === "away" ? "win" : "";
    return `<tr class="${r.off ? "done" : ""}">
      <td class="rb-date">Grup ${r.g} · ${fmtTanggal(r.d)}</td>
      <td class="rb-team home ${hw}">${r.home}</td>
      <td class="rb-vs">vs</td>
      <td class="rb-team away ${aw}">${r.away}</td>
      <td class="rb-res">${hasil}</td>
    </tr>`;
  }).join("");

  board.innerHTML = `
    <h2>📋 Papan Hasil Pertandingan <span class="rb-count">(${selesai}/${rows.length} selesai)</span></h2>
    <div class="rb-scroll"><table>
      <thead><tr><th class="team-col">Laga</th><th>Tuan Rumah</th><th></th><th>Tamu</th><th>Hasil</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>`;
}

/* ---------- Save bar (peserta) ---------- */
function renderSaveBar() {
  const bar = document.getElementById("saveBar");
  if (adminMode) { bar.innerHTML = ""; bar.className = "save-bar hidden"; return; }
  bar.className = "save-bar";

  const filled = countFilled(results);
  const complete = filled >= TOTAL_MATCHES;

  if (isSubmitted()) {
    bar.innerHTML = `<div class="sb-info ok">✅ <b>Tebakan terkunci.</b> Disimpan pada ${fmtDateTime(currentUser.submittedAt)}. Hubungi admin bila perlu perubahan.</div>`;
    return;
  }
  if (!isInputOpen()) {
    const why = pastDeadline() ? `Batas input (${fmtDeadline()}) telah lewat.` : `Input sedang ditutup oleh admin.`;
    bar.innerHTML = `<div class="sb-info closed">⛔ <b>Input ditutup.</b> ${why} Tebakan terisi ${filled}/${TOTAL_MATCHES}.</div>`;
    return;
  }

  const pct = Math.round((filled / TOTAL_MATCHES) * 100);
  bar.innerHTML = `
    <div class="sb-row">
      <div class="sb-progress">
        <div class="sb-text">Kelengkapan tebakan: <b>${filled}/${TOTAL_MATCHES}</b> laga ${complete ? "✓ lengkap" : `· sisa ${TOTAL_MATCHES - filled} laga`}</div>
        <div class="sb-bar"><div class="sb-fill" style="width:${pct}%"></div></div>
      </div>
      <button id="btnSave" class="btn btn-primary" ${complete ? "" : "disabled"}>💾 SIMPAN &amp; KUNCI</button>
    </div>
    ${complete ? "" : `<div class="sb-hint">Wajib memilih SEMUA ${TOTAL_MATCHES} laga di seluruh grup sebelum menyimpan.</div>`}`;

  const btn = document.getElementById("btnSave");
  if (btn) btn.onclick = submitPredictions;
}

async function submitPredictions() {
  if (countFilled(results) < TOTAL_MATCHES) { alert("Lengkapi semua " + TOTAL_MATCHES + " laga dulu."); return; }
  if (!confirm("Simpan & KUNCI semua tebakan?\nSetelah disimpan TIDAK bisa diubah lagi (kecuali dibuka admin).")) return;
  try { await apiCall("submit", {}); await refreshState(); alert("Tebakan tersimpan & dikunci. Terima kasih!"); }
  catch (e) { alert(e.message); }
}

/* ---------- Panel admin ---------- */
function renderAdminPanel() {
  const panel = document.getElementById("adminPanel");
  if (!adminMode) { panel.classList.add("hidden"); panel.innerHTML = ""; return; }
  // Jangan render ulang saat admin sedang mengetik di form pendaftaran,
  // supaya isian tidak terhapus oleh auto-refresh 15 detik.
  const activeId = document.activeElement ? document.activeElement.id : "";
  if (panel.innerHTML && ["rgName", "rgPhone", "rgUser", "rgPass"].includes(activeId)) return;
  panel.classList.remove("hidden");

  const submitted = users.filter((u) => u.submitted).length;
  const inputStatus = pastDeadline()
    ? `<span class="badge-closed">Lewat batas (${fmtDeadline()})</span>`
    : (configOpen ? `<span class="badge-open">Terbuka</span>` : `<span class="badge-closed">Ditutup admin</span>`);
  const regClosed = pastDeadline();

  const rows = users.map((u) => `
    <tr>
      <td class="team-col">${u.name}</td>
      <td>${u.phone}</td>
      <td><code>${u.username}</code></td>
      <td><code>${u.password}</code></td>
      <td>${u.filled}/${TOTAL_MATCHES}</td>
      <td>${u.submitted ? "✅ " + fmtDateTime(u.submittedAt) : "— belum"}</td>
      <td class="ac-actions">
        <button class="btn btn-ghost btn-sm" data-view="${u.username}">👁 Lihat Tebakan</button>
        <button class="btn btn-ghost btn-sm" data-pw="${u.username}">🔑 Reset PW</button>
        ${u.submitted ? `<button class="btn btn-ghost btn-sm" data-unlock="${u.username}">🔓 Buka Kunci</button>` : ""}
        <button class="btn btn-ghost btn-sm" data-del="${u.username}">🗑 Hapus</button>
      </td>
    </tr>`).join("");

  panel.innerHTML = `
    <div class="admin-controls">
      <div class="ac-left">
        <div>Status input peserta: ${inputStatus}</div>
        <div class="ac-sub">${submitted}/${users.length} peserta sudah mengunci tebakan · Batas pendaftaran: <b>${fmtDeadline()}</b></div>
      </div>
      <div class="ac-buttons">
        <button id="btnAdminPw" class="btn btn-ghost">🔑 Ubah Password Admin</button>
        <button id="btnToggleOpen" class="btn ${configOpen ? "btn-ghost" : "btn-primary"}" ${regClosed ? "disabled" : ""}>
          ${configOpen ? "🔒 Tutup Input Peserta" : "🔓 Buka Input Peserta"}</button>
      </div>
    </div>
    <div class="reg-box">
      <div class="reg-title">➕ Daftarkan Peserta Baru ${regClosed ? `<span class="badge-closed">(pendaftaran ditutup ${fmtDeadline()})</span>` : ""}</div>
      <form id="regForm" class="reg-form" autocomplete="off">
        <input id="rgName" type="text" placeholder="Nama lengkap" maxlength="40" ${regClosed ? "disabled" : ""} />
        <input id="rgPhone" type="tel" placeholder="No. TLP" ${regClosed ? "disabled" : ""} />
        <input id="rgUser" type="text" placeholder="Username" ${regClosed ? "disabled" : ""} />
        <input id="rgPass" type="text" placeholder="Password" ${regClosed ? "disabled" : ""} />
        <button type="button" id="btnGen" class="btn btn-ghost btn-sm" ${regClosed ? "disabled" : ""}>🎲 Auto</button>
        <button type="submit" class="btn btn-primary btn-sm" ${regClosed ? "disabled" : ""}>Daftarkan</button>
      </form>
      <p id="regErr" class="auth-error"></p>
    </div>
    <table class="admin-table">
      <thead><tr><th class="team-col">Peserta</th><th>No. TLP</th><th>Username</th><th>Password</th><th>Terisi</th><th>Status Simpan</th><th>Aksi</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="7" class="user-list-empty" style="padding:12px">Belum ada peserta. Daftarkan di atas.</td></tr>`}</tbody>
    </table>`;

  const tg = document.getElementById("btnToggleOpen");
  if (tg) tg.onclick = async () => { try { await apiCall("toggleOpen", { open: !configOpen }); await refreshState(); } catch (e) { alert(e.message); } };

  const apw = document.getElementById("btnAdminPw");
  if (apw) apw.onclick = async () => {
    const np = prompt("Password admin baru (minimal 4 karakter):", "");
    if (np === null) return;
    if (np.trim().length < 4) { alert("Password minimal 4 karakter."); return; }
    try { await apiCall("changeAdminPassword", { password: np.trim() }); auth.password = np.trim(); localStorage.setItem(AUTH_KEY, JSON.stringify(auth)); alert("Password admin berhasil diubah."); }
    catch (e) { alert(e.message); }
  };

  const gen = document.getElementById("btnGen");
  if (gen) gen.onclick = () => {
    const nm = (document.getElementById("rgName").value || "user").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    let base = (nm || "user").slice(0, 8), uname = base, n = 1;
    const taken = users.map((u) => u.username.toLowerCase());
    while (taken.includes(uname)) { uname = base + n; n++; }
    document.getElementById("rgUser").value = uname;
    document.getElementById("rgPass").value = "wc" + (1000 + Math.floor(Math.random() * 9000));
  };

  const rf = document.getElementById("regForm");
  if (rf) rf.onsubmit = async (e) => {
    e.preventDefault();
    const err = document.getElementById("regErr");
    const data = {
      name: document.getElementById("rgName").value.trim(),
      phone: document.getElementById("rgPhone").value,
      username: document.getElementById("rgUser").value.trim(),
      password: document.getElementById("rgPass").value.trim(),
    };
    try {
      await apiCall("registerUser", data);
      err.textContent = "";
      await refreshState();
      alert(`Peserta "${data.name}" terdaftar.\nUsername: ${data.username}\nPassword: ${data.password}`);
    } catch (ex) {
      err.textContent = ex.message;
      alert("Gagal mendaftarkan: " + ex.message);
    }
  };

  panel.querySelectorAll("[data-view]").forEach((b) => {
    b.onclick = async () => {
      const u = users.find((x) => x.username === b.dataset.view);
      try {
        const r = await apiCall("getPredictions", { username: u.username });
        showRecap(`👁 Tebakan ${r.name} (@${u.username})`, r.predictions || {});
      } catch (e) { alert(e.message); }
    };
  });

  panel.querySelectorAll("[data-pw]").forEach((b) => {
    b.onclick = async () => {
      const u = users.find((x) => x.username === b.dataset.pw);
      const np = prompt(`Password baru untuk "${u.name}" (@${u.username}):`, u.password);
      if (np === null) return;
      if (np.trim().length < 4) { alert("Password minimal 4 karakter."); return; }
      try { await apiCall("resetPassword", { username: u.username, password: np.trim() }); await refreshState(); alert(`Password "${u.name}" diubah menjadi: ${np.trim()}`); }
      catch (e) { alert(e.message); }
    };
  });
  panel.querySelectorAll("[data-unlock]").forEach((b) => {
    b.onclick = async () => {
      const u = users.find((x) => x.username === b.dataset.unlock);
      if (confirm(`Buka kunci tebakan "${u.name}" agar bisa diedit ulang?`)) {
        try { await apiCall("unlock", { username: u.username }); await refreshState(); } catch (e) { alert(e.message); }
      }
    };
  });
  panel.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = async () => {
      const u = users.find((x) => x.username === b.dataset.del);
      if (confirm(`Hapus peserta "${u.name}" (@${u.username}) beserta semua tebakannya?`)) {
        try { await apiCall("deleteUser", { username: u.username }); await refreshState(); } catch (e) { alert(e.message); }
      }
    };
  });
}

/* ---------- Modal & Rekap tebakan ---------- */
function showModal(title, html) {
  document.getElementById("modalTitle").innerHTML = title;
  document.getElementById("modalBody").innerHTML = html;
  // Hanya admin yang boleh print/export hasil
  document.getElementById("modalExport").style.display = adminMode ? "" : "none";
  document.getElementById("modal").classList.remove("hidden");
}
function hideModal() {
  document.getElementById("modal").classList.add("hidden");
}
document.getElementById("modalClose").onclick = hideModal;
document.getElementById("modal").onclick = (e) => { if (e.target.id === "modal") hideModal(); };

// Bangun tampilan rekap dari peta tebakan { mkey: res }
function buildRecapHtml(predMap) {
  const filled = countFilled(predMap);
  let html = `<div class="recap-count">${filled}/${TOTAL_MATCHES} laga dipilih</div>`;
  Object.keys(FIXTURES).forEach((g) => {
    const teams = GROUPS[g];
    html += `<div class="recap-group"><div class="recap-gtitle">Grup ${g}</div>`;
    FIXTURES[g].forEach((fx, idx) => {
      const res = predMap[matchKey(g, idx)];
      let pick;
      if (res === "home") pick = `🏆 <b>${teams[fx.h]}</b>`;
      else if (res === "away") pick = `🏆 <b>${teams[fx.a]}</b>`;
      else if (res === "draw") pick = `🤝 Seri`;
      else pick = `<span class="recap-empty">— belum dipilih</span>`;
      html += `<div class="recap-row">
        <span class="recap-match">${teams[fx.h]} <span class="recap-vs">vs</span> ${teams[fx.a]}</span>
        <span class="recap-pick">${pick}</span></div>`;
    });
    html += `</div>`;
  });
  return html;
}

let lastRecap = null; // { title, predMap } untuk export Word
function showRecap(title, predMap) {
  lastRecap = { title, predMap };
  showModal(title, buildRecapHtml(predMap));
}

/* ---------- Export ke Microsoft Word (.doc) ---------- */
function exportToWord(title, innerHtml) {
  const doc =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><title>" + title + "</title><style>" +
    "body{font-family:Arial,sans-serif;font-size:11pt;color:#000;}" +
    "h1{font-size:16pt;margin:0 0 4px;}h2{font-size:12pt;margin:14px 0 4px;border-bottom:1px solid #000;}" +
    "table{border-collapse:collapse;width:100%;margin-bottom:8px;}" +
    "th,td{border:1px solid #777;padding:4px 8px;text-align:left;font-size:10pt;}" +
    "th{background:#eee;}.sub{color:#444;font-size:10pt;margin:0 0 10px;}" +
    "</style></head><body><h1>" + title + "</h1>" +
    "<p class='sub'>Piala Dunia 2026 — dicetak " + new Date().toLocaleString("id-ID") + "</p>" +
    innerHtml + "</body></html>";
  const blob = new Blob(["﻿", doc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = title.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") + ".doc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Versi tabel (untuk Word) dari rekap tebakan
function recapWordHtml(predMap) {
  let html = `<p class="sub">Jumlah dipilih: ${countFilled(predMap)}/${TOTAL_MATCHES} laga</p>`;
  Object.keys(FIXTURES).forEach((g) => {
    const teams = GROUPS[g];
    html += `<h2>Grup ${g}</h2><table><tr><th>Laga</th><th>Pilihan</th></tr>`;
    FIXTURES[g].forEach((fx, idx) => {
      const res = predMap[matchKey(g, idx)];
      const pick = res === "home" ? teams[fx.h] + " menang"
        : res === "away" ? teams[fx.a] + " menang"
        : res === "draw" ? "Seri" : "—";
      html += `<tr><td>${teams[fx.h]} vs ${teams[fx.a]}</td><td>${pick}</td></tr>`;
    });
    html += `</table>`;
  });
  return html;
}

document.getElementById("modalExport").onclick = () => {
  if (!lastRecap) return;
  exportToWord(lastRecap.title.replace(/[^\w\s\-@.]/g, "").trim(), recapWordHtml(lastRecap.predMap));
};

// Peserta: rekap tebakan sendiri (pakai data di memori)
document.getElementById("btnRecap").onclick = () => {
  if (adminMode || !currentUser) return;
  showRecap(`📋 Tebakan Saya — ${currentUser.name}`, results);
};

/* ---------- Tombol header ---------- */
document.getElementById("btnReset").onclick = async () => {
  if (adminMode) return;
  if (isSubmitted()) { alert("Tebakan sudah dikunci. Minta admin membuka kunci untuk mengubah."); return; }
  if (!isInputOpen()) { alert("Input sudah ditutup, tidak bisa mengubah tebakan."); return; }
  if (confirm(`Kosongkan semua tebakan ${currentUser.name} yang belum disimpan?`)) {
    try { await apiCall("resetMine", {}); await refreshState(); } catch (e) { alert(e.message); }
  }
};
document.getElementById("btnLogout").onclick = doLogout;

/* ===================== AUTH ===================== */
const authOverlay = document.getElementById("authOverlay");
const authForm = document.getElementById("authForm");
const inpUser = document.getElementById("inpUser");
const inpPass = document.getElementById("inpPass");
const authError = document.getElementById("authError");

// Kode ISO bendera (flagcdn) untuk 48 tim peserta WC 2026
const FLAG_CODES = [
  "mx", "za", "kr", "cz", "ca", "ba", "qa", "ch", "br", "ma", "ht", "gb-sct",
  "us", "py", "au", "tr", "de", "cw", "ci", "ec", "nl", "jp", "se", "tn",
  "be", "eg", "ir", "nz", "es", "cv", "sa", "uy", "fr", "sn", "iq", "no",
  "ar", "dz", "at", "jo", "pt", "cd", "uz", "co", "gb-eng", "hr", "gh", "pa",
];
const PLAYER_SVG = `<svg class="silhouette" viewBox="0 0 200 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="100" cy="40" r="26"/>
  <rect x="74" y="66" width="52" height="120" rx="24"/>
  <rect x="48" y="80" width="22" height="86" rx="11" transform="rotate(28 59 80)"/>
  <rect x="130" y="80" width="22" height="86" rx="11" transform="rotate(-30 141 80)"/>
  <rect x="78" y="176" width="22" height="130" rx="11" transform="rotate(12 89 176)"/>
  <rect x="100" y="176" width="22" height="130" rx="11" transform="rotate(-34 111 176)"/>
  <circle cx="150" cy="302" r="22"/>
</svg>`;

function renderAuthBg() {
  const bg = document.getElementById("authBg");
  if (!bg || bg.dataset.done) return; // cukup sekali
  const flags = FLAG_CODES.map(
    (c) => `<img src="https://flagcdn.com/w80/${c}.png" alt="" loading="lazy">`
  ).join("");
  bg.innerHTML =
    `<div class="flags">${flags}${flags}${flags}</div>` +
    PLAYER_SVG.replace('class="silhouette"', 'class="silhouette left"') +
    PLAYER_SVG.replace('class="silhouette"', 'class="silhouette right"');
  bg.dataset.done = "1";
}

function showAuth() {
  stopPolling();
  renderAuthBg();
  authOverlay.classList.remove("hidden");
  authError.textContent = "";
  authForm.reset();
  const dl = document.getElementById("regDeadline");
  if (pastDeadline()) {
    dl.className = "reg-deadline closed";
    dl.innerHTML = `⛔ Pendaftaran peserta baru ditutup (batas <b>${fmtDeadline()}</b>). Peserta terdaftar tetap bisa masuk.`;
  } else {
    dl.className = "reg-deadline";
    dl.innerHTML = `🗓️ Batas pendaftaran & input: <b>${fmtDeadline()}</b>`;
  }
}

authForm.onsubmit = async (e) => {
  e.preventDefault();
  authError.textContent = "Memproses…";
  const username = inpUser.value.trim();
  const password = inpPass.value;
  try {
    const j = await apiCall("login", { auth: { username, password } });
    auth = { username, password, role: j.role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    authError.textContent = "";
    authOverlay.classList.add("hidden");
    startPolling();
    await refreshState();
  } catch (ex) {
    authError.textContent = ex.message;
  }
};

function doLogout() {
  auth = null;
  adminMode = false;
  currentUser = null;
  results = {}; users = []; leaderboard = []; official = {};
  localStorage.removeItem(AUTH_KEY);
  showAuth();
}

/* ---------- Ambil state dari server ---------- */
async function refreshState() {
  if (!auth) return;
  let s;
  try { s = await apiCall("getState", {}); }
  catch (e) {
    // sesi tidak valid → minta login ulang
    if (/login ulang|tidak valid|salah/i.test(e.message)) { doLogout(); }
    return;
  }
  configOpen = !!s.open;
  official = s.official || {};
  leaderboard = s.leaderboard || [];
  adminMode = auth.role === "admin";
  if (adminMode) {
    users = s.users || [];
    results = {}; currentUser = null;
  } else {
    const me = s.me || {};
    results = me.predictions || {};
    currentUser = me.username
      ? { name: me.name, phone: me.phone, username: me.username, submitted: !!me.submitted, submittedAt: me.submittedAt }
      : null;
  }
  render();
}

/* ---------- Polling (sinkron antar perangkat) ---------- */
function startPolling() {
  stopPolling();
  pollTimer = setInterval(() => { refreshState(); }, 15000);
}
function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

/* ---------- Inisialisasi ---------- */
(async function init() {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved) { try { auth = JSON.parse(saved); } catch (e) { auth = null; } }
  if (auth) {
    authOverlay.classList.add("hidden");
    startPolling();
    await refreshState();
  } else {
    showAuth();
  }
})();
