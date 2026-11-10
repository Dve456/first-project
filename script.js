// Naija Bill Tracker - Complete working version

const billForm = document.getElementById('billForm');
const billsList = document.getElementById('billsList');
const emptyState = document.getElementById('emptyState');
const totalAmountEl = document.getElementById('totalAmount');
const billCountEl = document.getElementById('billCount');
const clearPaidBtn = document.getElementById('clearPaid');

// Load bills from localStorage
let bills = JSON.parse(localStorage.getItem('naijaBills')) || [];

// Format number as Nigerian Naira
function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

// Format date nicely
function formatDate(dateStr) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-NG', options);
}

// Save to localStorage
function saveBills() {
  localStorage.setItem('naijaBills', JSON.stringify(bills));
}

// Update summary numbers
function updateSummary() {
  const activeBills = bills.filter(b => !b.paid);
  const total = activeBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  
  totalAmountEl.textContent = formatNaira(total);
  billCountEl.textContent = activeBills.length;
}

// Render all bills
function renderBills() {
  billsList.innerHTML = '';

  if (bills.length === 0) {
    emptyState.style.display = 'block';
    updateSummary();
    return;
  }

  emptyState.style.display = 'none';

  // Sort: unpaid first, then by due date
  const sorted = [...bills].sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return new Date(a.due) - new Date(b.due);
  });

  sorted.forEach((bill, index) => {
    const originalIndex = bills.findIndex(b => b.id === bill.id);
    
    const item = document.createElement('div');
    item.className = `bill-item ${bill.paid ? 'paid' : ''}`;
    
    item.innerHTML = `
      <div class="bill-info">
        <div class="bill-name">${bill.name}</div>
        <div class="bill-meta">${bill.category} • Due ${formatDate(bill.due)}</div>
      </div>
      <div class="bill-amount">${formatNaira(bill.amount)}</div>
      <div class="bill-actions">
        ${!bill.paid ? `<button class="btn-icon btn-paid" onclick="markPaid(${originalIndex})" title="Mark as Paid">✓</button>` : ''}
        <button class="btn-icon btn-delete" onclick="deleteBill(${originalIndex})" title="Delete">✕</button>
      </div>
    `;
    
    billsList.appendChild(item);
  });

  updateSummary();
}

// Add new bill
billForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('billName').value.trim();
  const amount = document.getElementById('billAmount').value;
  const due = document.getElementById('billDue').value;
  const category = document.getElementById('billCategory').value;

  if (!name || !amount || !due) return;

  const newBill = {
    id: Date.now(),
    name,
    amount: Number(amount),
    due,
    category,
    paid: false,
    createdAt: new Date().toISOString()
  };

  bills.push(newBill);
  saveBills();
  renderBills();

  // Reset form
  billForm.reset();
  document.getElementById('billName').focus();
});

// Mark bill as paid
function markPaid(index) {
  bills[index].paid = true;
  saveBills();
  renderBills();
}

// Delete bill
function deleteBill(index) {
  if (confirm('Delete this bill?')) {
    bills.splice(index, 1);
    saveBills();
    renderBills();
  }
}

// Clear all paid bills
clearPaidBtn.addEventListener('click', function() {
  const paidCount = bills.filter(b => b.paid).length;
  if (paidCount === 0) {
    alert('No paid bills to clear.');
    return;
  }
  if (confirm(`Clear ${paidCount} paid bill(s)?`)) {
    bills = bills.filter(b => !b.paid);
    saveBills();
    renderBills();
  }
});

// Make functions available globally for onclick
window.markPaid = markPaid;
window.deleteBill = deleteBill;

// Initial render
renderBills();
