// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testShop() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            const error = await loginRes.json();
            console.error('Login Failed:', error);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Success. Token received.');

        // 2. Create Shop
        console.log('Creating Shop...');
        const createRes = await fetch(`${API_URL}/shops`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'My Awesome Shop',
                address: '123 Main St',
                contact: '555-1234'
            })
        });
        const shop = await createRes.json();
        console.log('Create Shop Status:', createRes.status);
        console.log('Created Shop:', shop);

        if (!createRes.ok) return;

        // 3. Get All Shops
        console.log('Fetching All Shops...');
        const getAllRes = await fetch(`${API_URL}/shops`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const shops = await getAllRes.json();
        console.log('All Shops:', shops);

        // 4. Update Shop
        console.log('Updating Shop...');
        const updateRes = await fetch(`${API_URL}/shops/${shop.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Updated Shop Name' })
        });
        console.log('Update Status:', updateRes.status);
        console.log('Updated Shop:', await updateRes.json());

    } catch (error) {
        console.error('Error:', error);
    }
}

testShop();
