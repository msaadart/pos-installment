// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testExpense() {
    try {
        console.log('--- Starting Expense Module Test ---');

        // 1. Login
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        const { token, user } = await loginRes.json();
        console.log('✅ Logged in');

        // 2. Create Expense
        const expenseRes = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                description: 'Monthly Electricity Bill ' + Date.now(),
                amount: 1500,
                category: 'Utilities',
                shopId: 1,
                userId: user.id
            })
        });
        const expense = await expenseRes.json();
        console.log('✅ Expense Created:', expense.id);

        // 3. List Expenses
        const listRes = await fetch(`${API_URL}/expenses?shopId=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expenses = await listRes.json();
        console.log('✅ Total Expenses Found:', expenses.length);

        console.log('--- Expense Module Test Completed Successfully ---');
    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
    }
}

testExpense();
