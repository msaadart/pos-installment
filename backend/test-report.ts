// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testReports() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        if (!loginRes.ok) return console.error('Login Failed');
        const { token } = await loginRes.json();
        console.log('Login Success.');

        // 2. Get Dashboard Stats
        console.log('Fetching Dashboard Stats...');
        const dashboardRes = await fetch(`${API_URL}/reports/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Dashboard Stats:', await dashboardRes.json());

        // 3. Get Sales Report
        console.log('Fetching Sales Report...');
        const startDate = '2025-01-01';
        const endDate = '2030-12-31';
        const salesRes = await fetch(`${API_URL}/reports/sales?startDate=${startDate}&endDate=${endDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const sales = await salesRes.json();
        console.log(`Sales Report: Found ${sales.length} sales`);

        // 4. Get Installment Report
        console.log('Fetching Installment Report...');
        const installRes = await fetch(`${API_URL}/reports/installments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const installments = await installRes.json();
        console.log(`Installment Report: Found ${installments.length} plans`);

    } catch (error) {
        console.error('Error:', error);
    }
}

testReports();
