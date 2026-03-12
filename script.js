// ── Config ──────────────────────────────────────────────────────────────────
const TOTAL_SEATS = 49;
const ROWS_NORMAL = 11;       // rows with 4 seats
const SEATS_PER_NORMAL_ROW = 4;
const SEATS_LAST_ROW = 5;

// Animation: starts fast, slows to a stop
const ROLL_STEPS = [
  { duration: 60,  count: 20 },   // fast flicker
  { duration: 100, count: 10 },   // medium
  { duration: 160, count: 7  },   // slowing
  { duration: 250, count: 5  },   // slow
  { duration: 380, count: 3  },   // very slow
  { duration: 520, count: 2  },   // almost stopped
];

// ── State ────────────────────────────────────────────────────────────────────
let available = [];   // seat ids not yet drawn
let winners   = [];   // seat ids already drawn (in order)
let isRolling = false;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const seatGrid    = document.getElementById('seatGrid');
const drawBtn     = document.getElementById('drawBtn');
const resetBtn    = document.getElementById('resetBtn');
const counterEl   = document.getElementById('counter');
const bannerEl    = document.getElementById('winnerBanner');
const winnerListEl = document.getElementById('winnerList');
const winnerOlEl   = document.getElementById('winnerOl');

// ── Build seat grid ──────────────────────────────────────────────────────────
function buildGrid() {
  seatGrid.innerHTML = '';
  let seatId = 1;

  // Rows 1–11: 4 seats each (left-2 | aisle | right-2)
  for (let row = 0; row < ROWS_NORMAL; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';

    // Left pair
    for (let col = 0; col < 2; col++) {
      rowEl.appendChild(makeSeat(seatId++));
    }
    // Aisle
    const aisle = document.createElement('div');
    aisle.className = 'aisle';
    rowEl.appendChild(aisle);
    // Right pair
    for (let col = 0; col < 2; col++) {
      rowEl.appendChild(makeSeat(seatId++));
    }

    seatGrid.appendChild(rowEl);
  }

  // Last row: 5 seats in one straight line (no aisle), seat 47 is centre
  const lastRowEl = document.createElement('div');
  lastRowEl.className = 'seat-row last-row';

  for (let col = 0; col < 5; col++) {
    lastRowEl.appendChild(makeSeat(seatId++));
  }

  seatGrid.appendChild(lastRowEl);
}

function makeSeat(id) {
  const el = document.createElement('div');
  el.className = 'seat';
  el.dataset.id = id;
  el.textContent = id;
  return el;
}

function getSeatEl(id) {
  return seatGrid.querySelector(`.seat[data-id="${id}"]`);
}

// ── State helpers ────────────────────────────────────────────────────────────
function initState() {
  available = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1);
  winners   = [];
  isRolling = false;
}

function updateCounter() {
  counterEl.textContent = `${winners.length} / ${TOTAL_SEATS} drawn`;
}

function refreshSeatClasses() {
  for (let id = 1; id <= TOTAL_SEATS; id++) {
    const el = getSeatEl(id);
    el.className = 'seat';
    if (winners.includes(id)) el.classList.add('picked');
  }
}

// ── Draw logic ───────────────────────────────────────────────────────────────
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function draw() {
  if (isRolling || available.length === 0) return;
  isRolling = true;
  drawBtn.disabled = true;
  bannerEl.classList.add('hidden');

  const winnerId = pickRandom(available);   // decide winner upfront
  let currentHighlight = null;

  // Build a flat sequence of steps: e.g. 20 ticks at 60ms, then 10 at 100ms …
  const schedule = [];
  for (const { duration, count } of ROLL_STEPS) {
    for (let i = 0; i < count; i++) schedule.push(duration);
  }

  let stepIndex = 0;

  function tick() {
    // Remove previous rolling highlight
    if (currentHighlight !== null) {
      const prev = getSeatEl(currentHighlight);
      if (prev) prev.classList.remove('rolling');
    }

    if (stepIndex < schedule.length) {
      // Pick a random seat to flash (from all 49 for visual excitement)
      const flashId = pickRandom(
        // bias toward available seats but include all for chaos effect
        Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1)
      );
      const el = getSeatEl(flashId);
      if (el) el.classList.add('rolling');
      currentHighlight = flashId;
      stepIndex++;
      setTimeout(tick, schedule[stepIndex - 1]);
    } else {
      // Animation done — reveal winner
      revealWinner(winnerId);
    }
  }

  tick();
}

function revealWinner(id) {
  // Remove rolling from any seat still lit
  seatGrid.querySelectorAll('.seat.rolling').forEach(el => el.classList.remove('rolling'));

  // Mark previous winners as picked
  winners.forEach(wid => {
    const el = getSeatEl(wid);
    if (el) { el.className = 'seat picked'; }
  });

  // Record winner
  winners.push(id);
  available = available.filter(sid => sid !== id);

  // Highlight new winner
  const winEl = getSeatEl(id);
  if (winEl) { winEl.className = 'seat winner'; }

  updateCounter();

  // Show banner
  bannerEl.textContent = `🏆 Seat ${id} wins!`;
  bannerEl.classList.remove('hidden');

  // Append to winner list
  winnerListEl.classList.remove('hidden');
  const li = document.createElement('li');
  li.innerHTML = `<span class="rank">${winners.length}.</span><span class="badge">Seat ${id}</span>`;
  winnerOlEl.prepend(li);  // newest at top

  isRolling = false;

  if (available.length === 0) {
    drawBtn.disabled = true;
    drawBtn.textContent = '🎉 All seats drawn!';
  } else {
    drawBtn.disabled = false;
  }
}

// ── Reset ────────────────────────────────────────────────────────────────────
function reset() {
  if (isRolling) return;
  if (!confirm('Reset all draws? This will clear all winners and start over.')) return;
  initState();
  refreshSeatClasses();
  updateCounter();
  bannerEl.classList.add('hidden');
  winnerListEl.classList.add('hidden');
  winnerOlEl.innerHTML = '';
  drawBtn.disabled = false;
  drawBtn.textContent = '🎲 Draw Next Winner';
}

// ── Init ─────────────────────────────────────────────────────────────────────
buildGrid();
initState();
updateCounter();

drawBtn.addEventListener('click', draw);
resetBtn.addEventListener('click', reset);
