// app.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const trackerSection = document.getElementById('tracker-section');
    const loginSection = document.getElementById('login-section');
    const transactionForm = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const remainingBudgetEl = document.getElementById('remaining-budget');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;

    const renderDashboard = () => {
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += parseFloat(transaction.amount);
            } else if (transaction.type === 'expense') {
                totalExpenses += parseFloat(transaction.amount);
            }
        });

        const remainingBudget = totalIncome - totalExpenses;
        totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        remainingBudgetEl.textContent = `$${remainingBudget.toFixed(2)}`;
    };

    const renderTransactions = () => {
        transactionList.innerHTML = '';
        transactions.forEach((transaction, index) => {
            const transactionItem = document.createElement('li');
            transactionItem.className = 'list-group-item';
            transactionItem.innerHTML = `
                ${transaction.description} - $${transaction.amount.toFixed(2)} 
                <span class="badge badge-${transaction.type === 'income' ? 'success' : 'danger'}">
                    ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
                <button class="btn btn-danger btn-sm float-right" onclick="removeTransaction(${index})">Delete</button>
            `;
            transactionList.appendChild(transactionItem);
        });
    };

    const renderChart = () => {
        const categories = transactions
            .filter(transaction => transaction.type === 'expense')
            .map(transaction => transaction.description);
        const amounts = transactions
            .filter(transaction => transaction.type === 'expense')
            .map(transaction => parseFloat(transaction.amount));

        new Chart(expenseChartCtx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'],
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            }
        });
    };

    const addTransaction = (description, amount, type) => {
        transactions.push({ description, amount: parseFloat(amount), type });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        renderDashboard();
        renderChart();
    };

    const removeTransaction = (index) => {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        renderDashboard();
        renderChart();
    };

    window.removeTransaction = removeTransaction; // Expose function to the global scope

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        if (username) {
            localStorage.setItem('isLoggedIn', JSON.stringify(true));
            loginSection.classList.add('d-none');
            trackerSection.classList.remove('d-none');
        }
    });

    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const type = document.getElementById('type').value;

        if (description && amount && type) {
            addTransaction(description, amount, type);
            transactionForm.reset();
        }
    });

    if (isLoggedIn) {
        loginSection.classList.add('d-none');
        trackerSection.classList.remove('d-none');
        renderTransactions();
        renderDashboard();
        renderChart();
    }
});
