// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function runTests() {
    try {
        console.log('--- Starting Consolidated Module Tests ---');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            console.log('Login failed, trying to register...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test Admin', role: 'SUPER_ADMIN' })
            });
            const regData = await regRes.json();
            console.log('Register Result:', regData);

            // Try login again
            const loginRes2 = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
            });
            const loginData2 = await loginRes2.json();
            if (!loginRes2.ok) throw new Error('Login failed again: ' + JSON.stringify(loginData2));
            return runWithToken(loginData2.token, loginData2.user);
        }

        await runWithToken(loginData.token, loginData.user);

    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
    }
}

async function runWithToken(token: string, user: any) {
    const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
    console.log('✅ Logged in as:', user.email);

    // 2. Ensure Shop 1 exists
    console.log('Checking Shop...');
    let shopId = 1;
    const shopRes = await fetch(`${API_URL}/shops/1`, config);
    if (!shopRes.ok) {
        console.log('Shop 1 not found, creating one...');
        const newShopRes = await fetch(`${API_URL}/shops`, {
            method: 'POST',
            ...config,
            body: JSON.stringify({ name: 'Test Shop', address: '123 Test St' })
        });
        const newShop = await newShopRes.json();
        shopId = newShop.id;
        console.log('✅ Shop Created:', shopId);
    } else {
        console.log('✅ Shop 1 found');
    }

    // 3. Ensure Product exists
    console.log('Checking Product...');
    const productsRes = await fetch(`${API_URL}/products?shopId=${shopId}`, config);
    const products = await productsRes.json();
    let productId;
    if (products.length === 0) {
        console.log('No products found, creating one...');
        const newProdRes = await fetch(`${API_URL}/products`, {
            method: 'POST',
            ...config,
            body: JSON.stringify({
                name: 'Test Product ' + Date.now(),
                sku: 'SKU-' + Date.now(),
                price: 1000,
                costPrice: 800,
                stock: 0,
                shopId: shopId
            })
        });
        const newProd = await newProdRes.json();
        productId = newProd.id;
        console.log('✅ Product Created:', productId);
    } else {
        productId = products[0].id;
        console.log('✅ Product found:', productId);
    }

    // --- PURCHASE TEST ---
    console.log('\n--- Running Purchase Test ---');
    const supplierRes = await fetch(`${API_URL}/purchases/suppliers`, {
        method: 'POST',
        ...config,
        body: JSON.stringify({ name: 'Supplier ' + Date.now(), phone: '12345' })
    });
    const supplier = await supplierRes.json();
    console.log('✅ Supplier Created:', supplier.id);

    const purchaseRes = await fetch(`${API_URL}/purchases`, {
        method: 'POST',
        ...config,
        body: JSON.stringify({
            shopId: shopId,
            userId: user.id,
            supplierId: supplier.id,
            totalAmount: 10000,
            paidAmount: 4000,
            items: [{ productId: productId, quantity: 10, costPrice: 900 }]
        })
    });
    const purchase = await purchaseRes.json();
    if (!purchaseRes.ok) throw new Error('Purchase failed: ' + JSON.stringify(purchase));
    console.log('✅ Purchase Created:', purchase.invoiceNo);

    // --- EXPENSE TEST ---
    console.log('\n--- Running Expense Test ---');
    const expenseRes = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        ...config,
        body: JSON.stringify({
            description: 'Lunch ' + Date.now(),
            amount: 50,
            category: 'Food',
            shopId: shopId,
            userId: user.id
        })
    });
    const expense = await expenseRes.json();
    console.log('✅ Expense Created:', expense.id);

    console.log('\n--- All Backend Tests Success ---');
}

runTests();
