const API_URL = 'http://localhost:4000/api/auth';

async function testAuth() {
    try {
        console.log('Testing Registration...');
        const registerRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: 'SUPER_ADMIN'
            })
        });
        const registerData = await registerRes.json();
        console.log('Register Status:', registerRes.status);
        console.log('Register Response:', registerData);

        console.log('Testing Login...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginData);

    } catch (error) {
        console.error('Error:', error);
    }
}

testAuth();
