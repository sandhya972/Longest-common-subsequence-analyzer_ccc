/* =====================================================
   LCS TOOL — app.js
   Full LCS algorithm + DP matrix visualization + UI
   ===================================================== */

'use strict';

// ── State ──────────────────────────────────────────
let state = {
  tokensA: [],
  tokensB: [],
  dp: [],
  lcs: [],
  pathSet: new Set(),
  computed: false,
  animating: false,
  animRevealCount: 0,
};

// ── Samples ────────────────────────────────────────
const SAMPLES = {
  A: `The quick brown fox jumps over the lazy dog near the river bank on a sunny afternoon.`,
  B: `A quick brown dog leaps over the lazy fox beside the river during a bright sunny day.`,
};

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  spawnParticles();
  setupTabs();
  setupCharCounters();
});

// ── Background Particles ───────────────────────────
function spawnParticles() {
  const container = document.getElementById('bgParticles');
  const colors = ['124,107,255', '0,212,255', '34,211,160', '245,158,11'];
  for (let i = 0; i < 22; i++) {
    const span = document.createElement('span');
    const size = 4 + Math.random() * 10;
    const color = colors[Math.floor(Math.random() * colors.length)];
    span.style.cssText = `
      left:${Math.random() * 100}%;
      width:${size}px; height:${size}px;
      background:rgba(${color},0.6);
      animation-duration:${10 + Math.random() * 18}s;
      animation-delay:${-Math.random() * 20}s;
    `;
    container.appendChild(span);
  }
}

// ── Tabs ───────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.nav-pill').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
  if (tab === 'matrix' && state.computed) {
    renderMatrix();
    document.getElementById('matrixInfo').style.display = 'grid';
  }
}

// ── Char counters ──────────────────────────────────
function setupCharCounters() {
  ['A', 'B'].forEach(id => {
    const ta = document.getElementById(`input${id}`);
    const ct = document.getElementById(`count${id}`);
    ta.addEventListener('input', () => {
      ct.textContent = `${ta.value.length} chars`;
    });
  });
}

// ── Sample / Clear / File ──────────────────────────
function loadSample(id) {
  const ta = document.getElementById(`input${id}`);
  ta.value = SAMPLES[id];
  document.getElementById(`count${id}`).textContent = `${ta.value.length} chars`;
}

function clearInput(id) {
  const ta = document.getElementById(`input${id}`);
  ta.value = '';
  document.getElementById(`count${id}`).textContent = '0 chars';
}

function loadFile(event, id) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const ta = document.getElementById(`input${id}`);
    ta.value = e.target.result;
    document.getElementById(`count${id}`).textContent = `${ta.value.length} chars`;
  };
  reader.readAsText(file);
}

// ── Tokenize ───────────────────────────────────────
function tokenize(text, wordMode, caseSensitive) {
  let tokens;
  if (wordMode) {
    tokens = text.trim().split(/\s+/).filter(Boolean);
  } else {
    tokens = text.trim().split('');
  }
  if (!caseSensitive) tokens = tokens.map(t => t.toLowerCase());
  return tokens;
}

// ── LCS Core (DP) ──────────────────────────────────
function computeLCS(a, b) {
  const m = a.length, n = b.length;
  // Build DP table (m+1) x (n+1)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Traceback
  const lcs = [];
  const pathSet = new Set();
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift({ token: a[i - 1], idxA: i - 1, idxB: j - 1 });
      pathSet.add(`${i},${j}`);
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      pathSet.add(`${i},${j}`);
      i--;
    } else {
      pathSet.add(`${i},${j}`);
      j--;
    }
  }
  // Include base row/col path cells
  while (i > 0) { pathSet.add(`${i},${j}`); i--; }
  while (j > 0) { pathSet.add(`${i},${j}`); j--; }
  pathSet.add('0,0');

  return { dp, lcs, pathSet };
}

// ── Analyze ────────────────────────────────────────
function analyze() {
  const rawA = document.getElementById('inputA').value;
  const rawB = document.getElementById('inputB').value;
  if (!rawA.trim() || !rawB.trim()) {
    flash('Please enter text in both fields before analyzing.', 'warning');
    return;
  }

  const caseSensitive = document.getElementById('optCaseSensitive').checked;
  const wordMode      = document.getElementById('optWordMode').checked;

  const tokensA = tokenize(rawA, wordMode, caseSensitive);
  const tokensB = tokenize(rawB, wordMode, caseSensitive);

  // Guard against very long inputs in char mode
  if (!wordMode && (tokensA.length > 800 || tokensB.length > 800)) {
    flash('Texts are very long in char mode (>800 chars each). Switching to word mode is recommended for performance.', 'warning');
    if (tokensA.length > 1500 || tokensB.length > 1500) return;
  }

  const t0 = performance.now();
  const { dp, lcs, pathSet } = computeLCS(tokensA, tokensB);
  const elapsed = performance.now() - t0;

  // Store state
  state = { tokensA, tokensB, dp, lcs, pathSet, computed: true, animating: false, animRevealCount: 0 };

  // Stats
  const lcsLen    = lcs.length;
  const maxLen    = Math.max(tokensA.length, tokensB.length);
  const similarity = maxLen === 0 ? 0 : (lcsLen / maxLen * 100);

  document.getElementById('statLcsLen').textContent    = lcsLen;
  document.getElementById('statSimilarity').textContent = similarity.toFixed(1) + '%';
  document.getElementById('statTokensA').textContent   = tokensA.length;
  document.getElementById('statTokensB').textContent   = tokensB.length;
  document.getElementById('statTime').textContent      = elapsed < 1 ? `<1ms` : `${elapsed.toFixed(1)}ms`;

  // Meter
  const pct = similarity.toFixed(1);
  document.getElementById('meterPct').textContent = `${pct}%`;
  const fill = document.getElementById('meterFill');
  requestAnimationFrame(() => {
    fill.style.width = `${Math.min(similarity, 100)}%`;
    // shift gradient color based on score
    const bg_pos = similarity < 40 ? '0%' : similarity < 70 ? '50%' : '100%';
    fill.style.backgroundPosition = `${bg_pos} 0`;
  });

  // LCS tokens
  const lcsContainer = document.getElementById('lcsTokens');
  lcsContainer.innerHTML = '';
  if (lcs.length === 0) {
    lcsContainer.innerHTML = '<span style="color:var(--text-faint);font-size:13px">No common subsequence found.</span>';
  } else {
    lcs.forEach((item, idx) => {
      const span = document.createElement('span');
      span.className = 'lcs-token';
      span.style.animationDelay = `${idx * 0.03}s`;
      span.textContent = item.token;
      lcsContainer.appendChild(span);
    });
  }

  // Highlighted texts
  renderHighlight('A', tokensA, lcs.map(x => x.idxA));
  renderHighlight('B', tokensB, lcs.map(x => x.idxB));

  // Show results
  const section = document.getElementById('resultsSection');
  section.style.display = 'block';
  requestAnimationFrame(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function renderHighlight(id, tokens, matchIdxs) {
  const matchSet = new Set(matchIdxs);
  const container = document.getElementById(`highlight${id}`);
  container.innerHTML = '';

  tokens.forEach((tok, i) => {
    if (matchSet.has(i)) {
      const span = document.createElement('span');
      span.className = 'hl-match';
      span.textContent = tok;
      container.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.className = 'hl-normal';
      span.textContent = tok;
      container.appendChild(span);
    }
    // Add space between word tokens
    if (document.getElementById('optWordMode').checked && i < tokens.length - 1) {
      container.appendChild(document.createTextNode(' '));
    }
  });
}

// ── Flash message ──────────────────────────────────
function flash(msg, type = 'info') {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    background:${type === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(124,107,255,0.15)'};
    border:1px solid ${type === 'warning' ? 'rgba(245,158,11,0.5)' : 'rgba(124,107,255,0.5)'};
    color:${type === 'warning' ? '#fcd34d' : '#c4b5fd'};
    padding:12px 22px; border-radius:100px; font-size:13px;
    z-index:9999; backdrop-filter:blur(10px);
    animation: fadeIn 0.3s ease;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── Matrix rendering ───────────────────────────────
function renderMatrix() {
  if (!state.computed) return;

  const { tokensA, tokensB, dp, pathSet } = state;
  const m = tokensA.length, n = tokensB.length;
  const showPath   = document.getElementById('showPath').checked;
  const showArrows = document.getElementById('showArrows').checked;
  const limit = 30; // max dim to render for performance

  const A = tokensA.slice(0, limit);
  const B = tokensB.slice(0, limit);
  const rows = Math.min(m, limit);
  const cols = Math.min(n, limit);

  const table = document.getElementById('dpTable');
  table.innerHTML = '';

  // Header row
  const thead = table.createTHead();
  const hr = thead.insertRow();
  addTH(hr, ''); // corner
  addTH(hr, 'ε'); // epsilon col
  for (let j = 0; j < cols; j++) {
    addTH(hr, truncTok(B[j]));
  }

  // Body rows
  const tbody = table.createTBody();

  // Row 0 (base)
  const r0 = tbody.insertRow();
  addTH(r0, 'ε', true);
  for (let j = 0; j <= cols; j++) {
    const td = r0.insertCell();
    td.textContent = 0;
    td.className = 'cell-base';
    if (showPath && pathSet.has(`0,${j}`)) td.classList.add('cell-path');
  }

  for (let i = 1; i <= rows; i++) {
    const tr = tbody.insertRow();
    addTH(tr, truncTok(A[i - 1]), true);
    for (let j = 0; j <= cols; j++) {
      const td = tr.insertCell();
      td.textContent = dp[i][j];

      const isMatch = j > 0 && A[i - 1] === B[j - 1];
      const isPath  = showPath && pathSet.has(`${i},${j}`);

      if (isPath && isMatch) { td.className = 'cell-path cell-match'; }
      else if (isPath)       { td.className = 'cell-path'; }
      else if (isMatch)      { td.className = 'cell-match'; }

      // Arrow
      if (showArrows && i > 0 && j > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'cell-arrow';
        if (A[i - 1] === B[j - 1]) {
          arrow.textContent = '↖';
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
          arrow.textContent = '↑';
        } else {
          arrow.textContent = '←';
        }
        td.appendChild(arrow);
      }
    }
  }

  // Truncation notice
  const notice = document.getElementById('matrixTruncNote');
  if (!notice && (m > limit || n > limit)) {
    const p = document.createElement('p');
    p.id = 'matrixTruncNote';
    p.style.cssText = 'font-size:12px;color:var(--text-muted);text-align:center;margin-top:12px;';
    p.textContent = `Matrix capped at ${limit}×${limit} for display. Full DP was computed (${m}×${n}).`;
    document.getElementById('matrixScroll').after(p);
  }

  document.getElementById('matrixPlaceholder').style.display = 'none';
  document.getElementById('matrixScroll').style.display = 'block';
}

function addTH(row, text, isRowHeader = false) {
  const th = document.createElement(isRowHeader ? 'th' : 'th');
  th.textContent = text;
  row.appendChild(th);
}

function truncTok(tok) {
  if (!tok) return '';
  return tok.length > 3 ? tok.slice(0, 3) : tok;
}

// ── Matrix animation ───────────────────────────────
function animateMatrix() {
  if (!state.computed) { flash('Run an analysis first.', 'warning'); return; }
  if (state.animating) return;
  resetMatrixAnim(false);
  renderMatrix();

  const cells = document.querySelectorAll('#dpTable tbody td');
  cells.forEach(td => { td.classList.add('cell-hidden'); });

  state.animating = true;
  let idx = 0;
  function step() {
    if (idx >= cells.length) { state.animating = false; return; }
    const batch = 3;
    for (let k = 0; k < batch && idx < cells.length; k++, idx++) {
      const td = cells[idx];
      td.classList.remove('cell-hidden');
      td.classList.add('cell-reveal');
    }
    setTimeout(step, 20);
  }
  step();
}

function resetMatrixAnim(rerender = true) {
  state.animating = false;
  if (rerender && state.computed) renderMatrix();
}

// ── Run on DOMContentLoaded (already called above) ─
