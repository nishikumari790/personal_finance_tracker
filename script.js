/* ================================================================
   BudgetIQ — Personal Finance Tracker
   script.js
   ================================================================ */

'use strict';

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS & STATE
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'budgetIQ_expenses';
const BUDGET_KEY  = 'budgetIQ_budget';

let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let budget   = parseFloat(localStorage.getItem(BUDGET_KEY)  || '0');

let pieChartInstance = null;
let barChartInstance = null;

let isDark = true; // tracks current theme

/** Category colour palette */
const CAT_COLORS = {
  Food:          '#f59e0b',
  Travel:        '#06b6d4',
  Shopping:      '#ec4899',
  Entertainment: '#8b5cf6',
  Health:        '#10b981',
  Education:     '#3b82f6',
  Utilities:     '#ef4444',
  Other:         '#64748b',
};


// ═══════════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════

/** Persist expenses array to localStorage */
const saveExpenses = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));

/** Format a number as Indian Rupee */
const fmt = n =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Generate a short unique ID */
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

/** Return today's date as YYYY-MM-DD */
const todayISO = () => new Date().toISOString().split('T')[0];

/** Show a toast notification */
function toast(msg, icon = '✓', color = 'var(--accent3)') {
  const container = document.getElementById('toastContainer');
  const el        = document.createElement('div');
  el.className    = 'toast';
  el.innerHTML    = `<span class="toast-icon" style="color:${color}">${icon}</span> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}


// ═══════════════════════════════════════════════════════════════
//  INITIALISE
// ═══════════════════════════════════════════════════════════════

function init() {
  // Set today's date as default for the add-expense form
  document.getElementById('expDate').value = todayISO();

  // Pre-fill budget input if one was saved
  if (budget > 0) {
    document.getElementById('budgetInput').value = budget;
  }

  attachEventListeners();
  render();
}


// ═══════════════════════════════════════════════════════════════
//  RENDER (top-level)
// ═══════════════════════════════════════════════════════════════

function render() {
  renderCards();
  renderList();
  renderCharts();
}


// ═══════════════════════════════════════════════════════════════
//  RENDER — SUMMARY CARDS
// ═══════════════════════════════════════════════════════════════

function renderCards() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const left  = Math.max(0, budget - total);
  const pct   = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;

  // Text values
  document.getElementById('totalSpent').textContent = fmt(total);
  document.getElementById('budgetLeft').textContent = fmt(left);
  document.getElementById('txCount').textContent    = expenses.length;

  // Average per active day
  const uniqueDays = new Set(expenses.map(e => e.date)).size || 1;
  document.getElementById('avgDay').textContent = fmt(total / uniqueDays);

  // Budget progress bar
  const fill = document.getElementById('budgetBarFill');
  fill.style.width      = pct + '%';
  fill.style.background =
    pct > 85 ? 'var(--danger)' :
    pct > 60 ? 'var(--warning)' :
               'var(--accent3)';

  // Budget-left card colour
  document.getElementById('budgetLeft').style.color =
    pct > 85 ? 'var(--danger)' :
    pct > 60 ? 'var(--warning)' :
               'var(--accent3)';

  // List badge
  document.getElementById('listCountBadge').textContent = expenses.length + ' items';

  // Budget status text
  document.getElementById('budgetStatus').textContent =
    budget > 0
      ? `₹${total.toLocaleString('en-IN')} of ₹${budget.toLocaleString('en-IN')} used (${pct.toFixed(1)}%)`
      : 'No budget set';
}


// ═══════════════════════════════════════════════════════════════
//  RENDER — EXPENSE LIST
// ═══════════════════════════════════════════════════════════════

/** Return filtered + sorted expenses based on search / category inputs */
function getFiltered() {
  const query    = document.getElementById('searchInput').value.toLowerCase();
  const catFilter = document.getElementById('filterCategory').value;

  return expenses
    .filter(e => {
      const matchQuery = !query ||
        e.title.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query);
      const matchCat   = !catFilter || e.category === catFilter;
      return matchQuery && matchCat;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first
}

function renderList() {
  const list = document.getElementById('expenseList');
  const data = getFiltered();

  if (!data.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧾</div>
        No expenses yet.<br>Add one above!
      </div>`;
    return;
  }

  list.innerHTML = data.map(e => `
    <div class="expense-item" data-id="${e.id}">
      <div class="expense-dot"
           style="background:${CAT_COLORS[e.category] || '#64748b'}">
      </div>

      <div class="expense-info">
        <div class="expense-title">${escapeHTML(e.title)}</div>
        <div class="expense-meta">${e.category} · ${e.date}</div>
      </div>

      <div class="expense-amount"
           style="color:${CAT_COLORS[e.category] || '#94a3b8'}">
        ${fmt(e.amount)}
      </div>

      <div class="expense-actions">
        <button class="btn-xs edit"
                onclick="openEditModal('${e.id}')"
                title="Edit">✎</button>
        <button class="btn-xs"
                onclick="deleteExpense('${e.id}')"
                title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

/** Escape HTML to prevent XSS from user-typed titles */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ═══════════════════════════════════════════════════════════════
//  RENDER — CHARTS
// ═══════════════════════════════════════════════════════════════

function renderCharts() {
  renderDoughnutChart();
  renderBarChart();
}

function renderDoughnutChart() {
  // Aggregate totals per category
  const totals = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(l => CAT_COLORS[l] || '#64748b');

  const dark        = isDark;
  const borderColor = dark ? '#12121a' : '#ffffff';
  const tickColor   = dark ? '#94a3b8' : '#4338ca';

  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth:      2,
        borderColor,
        hoverOffset:      6,
      }],
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color:    tickColor,
            font:     { family: 'DM Mono', size: 11 },
            padding:  12,
            boxWidth: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${fmt(ctx.raw)}`,
          },
        },
      },
    },
  });
}

function renderBarChart() {
  // Build last-7-days array
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }

  const totals = days.map(day =>
    expenses
      .filter(e => e.date === day)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  const labels = days.map(day =>
    new Date(day).toLocaleDateString('en-IN', { weekday: 'short' })
  );

  const dark      = isDark;
  const tickColor = dark ? '#94a3b8' : '#4338ca';
  const gridColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           'Spent',
        data:            totals,
        backgroundColor: totals.map((_, i) =>
          i === 6 ? 'rgba(124,58,237,0.9)' : 'rgba(124,58,237,0.3)'
        ),
        borderRadius:    8,
        borderSkipped:   false,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } },
      },
      scales: {
        x: {
          grid:  { color: gridColor },
          ticks: { color: tickColor, font: { family: 'DM Mono', size: 11 } },
        },
        y: {
          grid:  { color: gridColor },
          ticks: {
            color:    tickColor,
            font:     { family: 'DM Mono', size: 11 },
            callback: v => '₹' + v,
          },
        },
      },
    },
  });
}


// ═══════════════════════════════════════════════════════════════
//  ACTIONS — EXPENSE CRUD
// ═══════════════════════════════════════════════════════════════

function addExpense() {
  const title    = document.getElementById('expTitle').value.trim();
  const amount   = parseFloat(document.getElementById('expAmount').value);
  const date     = document.getElementById('expDate').value;
  const category = document.getElementById('expCategory').value;

  // Validation
  if (!title)              return toast('Enter a title',         '⚠', 'var(--warning)');
  if (!amount || amount <= 0) return toast('Enter a valid amount', '⚠', 'var(--warning)');
  if (!date)               return toast('Select a date',         '⚠', 'var(--warning)');
  if (!category)           return toast('Select a category',     '⚠', 'var(--warning)');

  expenses.push({ id: uid(), title, amount, date, category });
  saveExpenses();
  render();
  toast(`Added: ${title}`);

  // Reset form
  document.getElementById('expTitle').value    = '';
  document.getElementById('expAmount').value   = '';
  document.getElementById('expCategory').value = '';
  document.getElementById('expDate').value     = todayISO();
}

/** Exposed globally so inline onclick in HTML can call it */
window.deleteExpense = function (id) {
  const found = expenses.find(e => e.id === id);
  expenses    = expenses.filter(e => e.id !== id);
  saveExpenses();
  render();
  if (found) toast(`Deleted: ${found.title}`, '🗑', 'var(--danger)');
};

/** Open edit modal and populate fields */
window.openEditModal = function (id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;

  document.getElementById('editId').value       = e.id;
  document.getElementById('editTitle').value    = e.title;
  document.getElementById('editAmount').value   = e.amount;
  document.getElementById('editDate').value     = e.date;
  document.getElementById('editCategory').value = e.category;

  document.getElementById('editModal').classList.add('open');
};

function saveEdit() {
  const id       = document.getElementById('editId').value;
  const title    = document.getElementById('editTitle').value.trim();
  const amount   = parseFloat(document.getElementById('editAmount').value);
  const date     = document.getElementById('editDate').value;
  const category = document.getElementById('editCategory').value;

  if (!title || !amount || !date) {
    return toast('Fill all fields', '⚠', 'var(--warning)');
  }

  const idx = expenses.findIndex(e => e.id === id);
  if (idx !== -1) {
    expenses[idx] = { id, title, amount, date, category };
  }

  saveExpenses();
  render();
  closeEditModal();
  toast('Expense updated ✓');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
}


// ═══════════════════════════════════════════════════════════════
//  ACTIONS — BUDGET
// ═══════════════════════════════════════════════════════════════

function setBudget() {
  const val = parseFloat(document.getElementById('budgetInput').value);
  if (!val || val <= 0) return toast('Enter a valid budget', '⚠', 'var(--warning)');

  budget = val;
  localStorage.setItem(BUDGET_KEY, budget);
  renderCards();
  toast(`Budget set to ${fmt(budget)}`);
}


// ═══════════════════════════════════════════════════════════════
//  ACTIONS — THEME TOGGLE
// ═══════════════════════════════════════════════════════════════

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeBtn').textContent = isDark ? '☀' : '🌙';
  renderCharts(); // re-draw with correct colours
}


// ═══════════════════════════════════════════════════════════════
//  ACTIONS — CSV EXPORT
// ═══════════════════════════════════════════════════════════════

function exportCSV() {
  if (!expenses.length) return toast('No data to export', '⚠', 'var(--warning)');

  const header = 'Title,Amount,Category,Date\n';
  const rows   = expenses
    .map(e => `"${e.title}",${e.amount},"${e.category}","${e.date}"`)
    .join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href     = URL.createObjectURL(blob);
  link.download = 'finflow_expenses.csv';
  link.click();

  toast('CSV exported!', '⬇', 'var(--accent2)');
}


// ═══════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

function attachEventListeners() {
  // Add expense
  document.getElementById('addBtn').addEventListener('click', addExpense);

  // Budget
  document.getElementById('setBudgetBtn').addEventListener('click', setBudget);

  // Search & filter → re-render list only (no need to rebuild charts)
  document.getElementById('searchInput').addEventListener('input', renderList);
  document.getElementById('filterCategory').addEventListener('change', renderList);

  // Theme toggle
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);

  // CSV export
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  // Edit modal — save / cancel
  document.getElementById('editSave').addEventListener('click', saveEdit);
  document.getElementById('editCancel').addEventListener('click', closeEditModal);

  // Close modal when clicking the backdrop
  document.getElementById('editModal').addEventListener('click', e => {
    if (e.target === document.getElementById('editModal')) closeEditModal();
  });

  // Allow Enter key to submit the Add-Expense form
  ['expTitle', 'expAmount', 'expDate'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') addExpense();
    });
  });
}


// ═══════════════════════════════════════════════════════════════
//  BOOTSTRAP
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', init);
