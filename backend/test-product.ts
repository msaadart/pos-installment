// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testProductManagement() {
    try {
        // 1. Login as Super Admin (Shop 1 owner or global admin)
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) return console.error('Login Failed');
        const { token } = await loginRes.json();

        // 2. Create Category
        console.log('Creating Category...');
        const catRes = await fetch(`${API_URL}/products/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Electronics', shopId: 1 })
        });
        const category = await catRes.json();
        console.log('Category:', category);

        // 3. Create Brand
        console.log('Creating Brand...');
        const brandRes = await fetch(`${API_URL}/products/brands`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Samsung' })
        });
        const brand = await brandRes.json();
        console.log('Brand:', brand);

        // 4. Create Product
        console.log('Creating Product...');
        const productRes = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Samsung Galaxy S24',
                sku: 'SAMSUNG-S24-001',
                price: 1200.00,
                costPrice: 900.00,
                stock: 50,
                shopId: 1,
                categoryId: category.id,
                brandId: brand.id
            })
        });
        console.log('Create Product Status:', productRes.status);
        console.log('Product:', await productRes.json());

        // 5. Get Products
        console.log('Fetching Products...');
        const getRes = await fetch(`${API_URL}/products?shopId=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await getRes.json();
        console.log('Products Count:', products.length);

    } catch (error) {
        console.error('Error:', error);
    }
}

testProductManagement();
