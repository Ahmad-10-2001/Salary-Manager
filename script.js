// ─── Data (prefixed to avoid collision with DOM IDs) ───
let txData = JSON.parse(localStorage.getItem('transactions') || '[]');
let debtData = JSON.parse(localStorage.getItem('debts') || '[]');
let budgetData = JSON.parse(localStorage.getItem('budgets') || '{}');

// Set default budgets if empty
if (Object.keys(budgetData).length === 0) {
  budgetData = { 'Food': 10000, 'Bike/Fuel': 10000, 'Groceries': 8000, 'Bills': 5000 };
}

// ─── Helpers ───
function $(id) { return document.getElementById(id); }

function saveAll() {
  localStorage.setItem('transactions', JSON.stringify(txData));
  localStorage.setItem('debts', JSON.stringify(debtData));
  localStorage.setItem('budgets', JSON.stringify(budgetData));
  renderAll();
}

function toast(msg) {
  let existing = document.querySelector('.toast');
  if (existing) existing.remove();
  let el = document.createElement('div');
  el.className = 'toast show';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.classList.remove('show'); }, 2000);
  setTimeout(() => { el.remove(); }, 2500);
}

function formatMoney(n) {
  return '₨ ' + Math.abs(n).toLocaleString('en-PK');
}

function formatDate(iso) {
  let d = new Date(iso);
  let day = String(d.getDate()).padStart(2, '0');
  let mon = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  let h = String(d.getHours()).padStart(2, '0');
  let m = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${mon}/${year}, ${h}:${m}`;
}

// ─── Transactions ───
function addTransaction() {
  let amount = +$('txAmount').value;
  if (!amount || amount <= 0) {
    toast('Please enter a valid amount');
    return;
  }

  txData.unshift({
    id: Date.now(),
    type: $('txType').value,
    amount: amount,
    category: $('txCategory').value,
    comment: $('txComment').value.trim(),
    date: new Date().toISOString()
  });

  // Clear form
  $('txAmount').value = '';
  $('txComment').value = '';
  $('txType').value = 'expense';

  saveAll();
  toast('Transaction saved!');
}

function deleteTransaction(id) {
  if (confirm('Delete this transaction?')) {
    txData = txData.filter(t => t.id !== id);
    saveAll();
    toast('Transaction deleted');
  }
}

function openEditModal(id) {
  let tx = txData.find(t => t.id === id);
  if (!tx) return;
  $('editId').value = id;
  $('editType').value = tx.type;
  $('editAmount').value = tx.amount;
  $('editCategory').value = tx.category;
  $('editComment').value = tx.comment || '';
  $('editModal').classList.add('active');
}

function closeEditModal() {
  $('editModal').classList.remove('active');
}

function saveEdit() {
  let id = +$('editId').value;
  let tx = txData.find(t => t.id === id);
  if (!tx) return;

  let amount = +$('editAmount').value;
  if (!amount || amount <= 0) {
    toast('Please enter a valid amount');
    return;
  }

  tx.type = $('editType').value;
  tx.amount = amount;
  tx.category = $('editCategory').value;
  tx.comment = $('editComment').value.trim();

  closeEditModal();
  saveAll();
  toast('Transaction updated!');
}

// ─── Debts / Udhaar ───
function addDebt() {
  let person = $('debtPerson').value.trim();
  let amount = +$('debtAmount').value;

  if (!person) {
    toast('Please enter person name');
    return;
  }
  if (!amount || amount <= 0) {
    toast('Please enter a valid amount');
    return;
  }

  debtData.push({
    id: Date.now(),
    type: $('debtType').value,
    person: person,
    amount: amount,
    note: $('debtNote').value.trim(),
    date: new Date().toISOString(),
    settled: false
  });

  // Clear form
  $('debtPerson').value = '';
  $('debtAmount').value = '';
  $('debtNote').value = '';

  saveAll();
  toast('Udhaar added!');
}

function deleteDebt(id) {
  if (confirm('Delete this udhaar entry?')) {
    debtData = debtData.filter(d => d.id !== id);
    saveAll();
    toast('Udhaar deleted');
  }
}

function settleDebt(id) {
  let d = debtData.find(x => x.id === id);
  if (d) {
    d.settled = !d.settled;
    saveAll();
    toast(d.settled ? 'Marked as settled' : 'Marked as unsettled');
  }
}

function openDebtEditModal(id) {
  let d = debtData.find(x => x.id === id);
  if (!d) return;
  $('editDebtIdx').value = id;
  $('editDebtType').value = d.type;
  $('editDebtPerson').value = d.person;
  $('editDebtAmount').value = d.amount;
  $('editDebtNote').value = d.note || '';
  $('editDebtModal').classList.add('active');
}

function closeDebtEditModal() {
  $('editDebtModal').classList.remove('active');
}

function saveDebtEdit() {
  let id = +$('editDebtIdx').value;
  let d = debtData.find(x => x.id === id);
  if (!d) return;

  let amount = +$('editDebtAmount').value;
  let person = $('editDebtPerson').value.trim();
  if (!person || !amount || amount <= 0) {
    toast('Please fill in the fields correctly');
    return;
  }

  d.type = $('editDebtType').value;
  d.person = person;
  d.amount = amount;
  d.note = $('editDebtNote').value.trim();

  closeDebtEditModal();
  saveAll();
  toast('Udhaar updated!');
}

// ─── Budgets ───
function setBudget() {
  let cat = $('budgetCategory').value;
  let amt = +$('budgetAmount').value;
  if (!amt || amt <= 0) {
    toast('Please enter a valid budget amount');
    return;
  }
  budgetData[cat] = amt;
  $('budgetAmount').value = '';
  saveAll();
  toast('Budget set for ' + cat);
}

// ─── Reports ───
function showReport(period) {
  let now = new Date();
  let startDate;
  let periodLabel;

  if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    periodLabel = 'Last 7 Days';
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    periodLabel = 'This Month (' + now.toLocaleString('default', { month: 'long', year: 'numeric' }) + ')';
  } else {
    startDate = new Date(0);
    periodLabel = 'All Time';
  }

  let filtered = txData.filter(t => new Date(t.date) >= startDate);
  let totalIncome = 0;
  let totalExpense = 0;
  let categorySpend = {};

  filtered.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    }
  });

  let html = '<div class="report-section">';
  html += '<div class="report-period">' + periodLabel + ' &middot; ' + filtered.length + ' transactions</div>';

  // Category breakdown
  let cats = Object.keys(categorySpend).sort((a, b) => categorySpend[b] - categorySpend[a]);
  if (cats.length > 0) {
    cats.forEach(c => {
      html += '<div class="report-row"><span class="label">' + c + '</span><span class="value" style="color:#ff3b30">' + formatMoney(categorySpend[c]) + '</span></div>';
    });
  } else {
    html += '<div class="empty-state">No expenses in this period</div>';
  }

  // Totals
  html += '<div class="report-total"><span>Total Income</span><span style="color:#34c759">' + formatMoney(totalIncome) + '</span></div>';
  html += '<div class="report-total"><span>Total Expense</span><span style="color:#ff3b30">' + formatMoney(totalExpense) + '</span></div>';
  html += '<div class="report-total"><span>Net</span><span style="color:' + (totalIncome - totalExpense >= 0 ? '#34c759' : '#ff3b30') + '">' + formatMoney(totalIncome - totalExpense) + '</span></div>';
  html += '</div>';

  $('reportOutput').innerHTML = html;
}

// ─── Backup ───
function exportBackup() {
  let data = {
    transactions: txData,
    debts: debtData,
    budgets: budgetData,
    exportDate: new Date().toISOString(),
    version: 4
  };

  let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'salary_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Backup exported!');
}

function importBackup() {
  let fileInput = $('importFile');
  let file = fileInput.files[0];

  if (!file) {
    toast('Please choose a backup file first');
    return;
  }

  let reader = new FileReader();
  reader.onload = function (e) {
    try {
      let data = JSON.parse(e.target.result);

      if (!data.transactions || !Array.isArray(data.transactions)) {
        toast('Invalid backup file');
        return;
      }

      if (!confirm('This will replace ALL your current data. Continue?')) return;

      txData = data.transactions || [];
      debtData = data.debts || [];
      budgetData = data.budgets || {};

      saveAll();
      fileInput.value = '';
      toast('Backup imported successfully!');
    } catch (err) {
      toast('Error reading backup file');
    }
  };
  reader.readAsText(file);
}

// ─── Render Functions ───
function renderBalance() {
  let totalIncome = 0;
  let totalExpense = 0;

  txData.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  let balance = totalIncome - totalExpense;
  $('balanceDisplay').textContent = formatMoney(balance);
  $('balanceDisplay').style.color = balance >= 0 ? '#34c759' : '#ff3b30';
  $('totalIncome').textContent = formatMoney(totalIncome);
  $('totalExpense').textContent = formatMoney(totalExpense);
}

function renderBudgets() {
  let now = new Date();
  let monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate this month's spending per category
  let monthSpend = {};
  txData.forEach(t => {
    if (t.type === 'expense' && new Date(t.date) >= monthStart) {
      monthSpend[t.category] = (monthSpend[t.category] || 0) + t.amount;
    }
  });

  let cats = Object.keys(budgetData);
  if (cats.length === 0) {
    $('budgetList').innerHTML = '<div class="empty-state">No budgets set yet</div>';
    return;
  }

  let html = '';
  cats.forEach(cat => {
    let limit = budgetData[cat];
    let spent = monthSpend[cat] || 0;
    let pct = Math.min(100, (spent / limit) * 100);
    let colorClass = pct < 70 ? 'ok' : pct < 100 ? 'warn' : 'over';

    html += '<div class="budget-item">';
    html += '<div class="budget-header"><span>' + cat + '</span><span class="budget-spent">' + formatMoney(spent) + ' / ' + formatMoney(limit) + '</span></div>';
    html += '<div class="progress-bar"><div class="progress-fill ' + colorClass + '" style="width:' + pct + '%"></div></div>';
    html += '</div>';
  });

  $('budgetList').innerHTML = html;
}

function renderTransactions() {
  let search = ($('txSearch').value || '').toLowerCase();
  let filtered = txData;

  if (search) {
    filtered = txData.filter(t =>
      t.category.toLowerCase().includes(search) ||
      (t.comment && t.comment.toLowerCase().includes(search)) ||
      String(t.amount).includes(search)
    );
  }

  if (filtered.length === 0) {
    $('txList').innerHTML = '<div class="empty-state">' + (search ? 'No matching transactions' : 'No transactions yet') + '</div>';
    return;
  }

  let html = '';
  filtered.forEach(t => {
    let sign = t.type === 'income' ? '+' : '-';
    html += '<div class="tx-item">';
    html += '<div class="tx-header">';
    html += '<span class="tx-category">' + t.category + '</span>';
    html += '<span class="tx-amount ' + t.type + '">' + sign + ' ' + formatMoney(t.amount) + '</span>';
    html += '</div>';
    if (t.comment) {
      html += '<div class="tx-detail">' + escapeHtml(t.comment) + '</div>';
    }
    html += '<div class="tx-detail">' + formatDate(t.date) + '</div>';
    html += '<div class="tx-actions">';
    html += '<button class="btn-edit" onclick="openEditModal(' + t.id + ')">Edit</button>';
    html += '<button class="btn-delete" onclick="deleteTransaction(' + t.id + ')">Delete</button>';
    html += '</div>';
    html += '</div>';
  });

  $('txList').innerHTML = html;
}

function renderDebts() {
  let unsettled = debtData.filter(d => !d.settled);
  let settled = debtData.filter(d => d.settled);

  if (debtData.length === 0) {
    $('debtList').innerHTML = '<div class="empty-state">No udhaar entries yet</div>';
    return;
  }

  let html = '';

  // Summary
  let owedToMe = debtData.filter(d => d.type === 'receive' && !d.settled).reduce((s, d) => s + d.amount, 0);
  let iOwe = debtData.filter(d => d.type === 'pay' && !d.settled).reduce((s, d) => s + d.amount, 0);

  if (owedToMe > 0 || iOwe > 0) {
    html += '<div style="display:flex;gap:10px;margin:14px 0">';
    html += '<div class="balance-sub income-bg" style="flex:1;padding:10px;border-radius:12px;text-align:center"><div style="font-size:12px;opacity:0.8">Owed to me</div><div style="font-weight:700">' + formatMoney(owedToMe) + '</div></div>';
    html += '<div class="balance-sub expense-bg" style="flex:1;padding:10px;border-radius:12px;text-align:center"><div style="font-size:12px;opacity:0.8">I owe</div><div style="font-weight:700">' + formatMoney(iOwe) + '</div></div>';
    html += '</div>';
  }

  // Active debts
  unsettled.forEach(d => {
    html += '<div class="debt-item">';
    html += '<div class="debt-header">';
    html += '<span class="debt-person">' + escapeHtml(d.person) + '</span>';
    html += '<span class="debt-amount ' + d.type + '">' + (d.type === 'receive' ? '+' : '-') + ' ' + formatMoney(d.amount) + '</span>';
    html += '</div>';
    html += '<div class="debt-detail">' + (d.type === 'receive' ? 'Owes me' : 'I owe') + (d.note ? ' &middot; ' + escapeHtml(d.note) : '') + '</div>';
    if (d.date) html += '<div class="debt-detail">' + formatDate(d.date) + '</div>';
    html += '<div class="debt-actions">';
    html += '<button class="btn-settle" onclick="settleDebt(' + d.id + ')">Settle</button>';
    html += '<button class="btn-edit" onclick="openDebtEditModal(' + d.id + ')">Edit</button>';
    html += '<button class="btn-delete" onclick="deleteDebt(' + d.id + ')">Delete</button>';
    html += '</div>';
    html += '</div>';
  });

  // Settled debts
  if (settled.length > 0) {
    html += '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee">';
    html += '<div style="font-size:13px;color:#8e8e93;margin-bottom:8px">Settled (' + settled.length + ')</div>';
    settled.forEach(d => {
      html += '<div class="debt-item" style="opacity:0.5">';
      html += '<div class="debt-header">';
      html += '<span class="debt-person" style="text-decoration:line-through">' + escapeHtml(d.person) + '</span>';
      html += '<span class="debt-amount">' + formatMoney(d.amount) + '</span>';
      html += '</div>';
      html += '<div class="debt-detail">' + (d.note ? escapeHtml(d.note) : '') + '</div>';
      html += '<div class="debt-actions">';
      html += '<button class="btn-settle" onclick="settleDebt(' + d.id + ')">Unsettle</button>';
      html += '<button class="btn-delete" onclick="deleteDebt(' + d.id + ')">Delete</button>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  $('debtList').innerHTML = html;
}

function escapeHtml(str) {
  let div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderAll() {
  renderBalance();
  renderBudgets();
  renderTransactions();
  renderDebts();
}

// ─── Service Worker Registration ───
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.log('SW failed:', err));
}

// ─── Close modals on overlay click ───
$('editModal').addEventListener('click', function (e) {
  if (e.target === this) closeEditModal();
});
$('editDebtModal').addEventListener('click', function (e) {
  if (e.target === this) closeDebtEditModal();
});

// ─── Initial Render ───
renderAll();
