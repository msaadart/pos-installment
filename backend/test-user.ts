// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testUserManagement() {
    try {
        // 1. Login as Super Admin
        console.log('Logging in as Super Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            console.error('Login Failed:', await loginRes.json());
            return;
        }

        const { token } = await loginRes.json();
        console.log('Login Success.');

        // 2. Create Shop Admin User
        console.log('Creating Shop Admin...');
        const createRes = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email: 'shopadmin@example.com',
                password: 'password123',
                name: 'Shop Admin',
                role: 'SHOP_ADMIN',
                shopId: 1 // Assuming shop 1 exists from previous test
            })
        });
        console.log('Create User Status:', createRes.status);
        console.log('Created User:', await createRes.json());

        // 3. Get All Users
        console.log('Fetching All Users...');
        const getAllRes = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('All Users:', await getAllRes.json());

    } catch (error) {
        console.error('Error:', error);
    }
}

testUserManagement();
