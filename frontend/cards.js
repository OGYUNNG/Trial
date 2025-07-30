// --- Card Actions ---
const freezeBtn = document.querySelector('.btn-primary');
const virtualCardBtn = document.querySelector('.btn-outline');

freezeBtn.addEventListener('click', () => {
  alert('Your card has been frozen.');
  freezeBtn.textContent = 'Card Frozen';
  freezeBtn.disabled = true;
});

virtualCardBtn.addEventListener('click', () => {
  alert('A virtual card has been generated and sent to your email.');
});

// --- Transaction Filter ---
const filterButtons = document.querySelectorAll('.filter-btn');
const transactions = document.querySelectorAll('.transaction-table tbody tr');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.textContent;

    transactions.forEach(row => {
      const amount = row.querySelector('.transaction-amount').textContent;
      if (filter === 'All') {
        row.style.display = '';
      } else if (filter === 'Income' && amount.includes('+')) {
        row.style.display = '';
      } else if (filter === 'Expenses' && amount.includes('-')) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
});

// --- Progress Bar (Spent this month) ---
const spent = 1200; // example value
const limit = 10000; // example value
const percent = (spent / limit) * 100;
const progressBar = document.querySelector('.progress');

if (progressBar) {
  progressBar.style.width = `${percent}%`;
}

// --- Toggle Switches Feedback (Optional) ---
const toggles = document.querySelectorAll('.toggle-switch input');
toggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    const label = toggle.closest('.control-item')?.querySelector('.control-label')?.textContent;
    if (toggle.checked) {
      console.log(`${label} enabled`);
    } else {
      console.log(`${label} disabled`);
    }
  });
});
