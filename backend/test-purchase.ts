// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testPurchase() {
    try {
        console.log('--- Starting Purchase Module Test ---');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        if (!loginRes.ok) return console.error('Login Failed');
        const { token, user } = await loginRes.json();
        console.log('✅ Logged in');

        // 2. Create Supplier
        const supplierRes = await fetch(`${API_URL}/purchases/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Main Supplier Co. ' + Date.now(),
                phone: '0900-78601',
                company: 'Electronics Wholesale'
            })
        });
        const supplier = await supplierRes.json();
        console.log('✅ Supplier Created:', supplier.id);

        // 3. Create Purchase
        // We need a product ID. Let's get products first.
        const productsRes = await fetch(`${API_URL}/products?shopId=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await productsRes.json();
        if (products.length === 0) throw new Error('No products found to buy');
        const product = products[0];

        console.log(`✅ Buying product: ${product.name} (Current Stock: ${product.stock})`);

        const purchaseRes = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shopId: 1,
                userId: user.id,
                supplierId: supplier.id,
                totalAmount: 50000,
                paidAmount: 20000,
                items: [
                    {
                        productId: product.id,
                        quantity: 10,
                        costPrice: 5000
                    }
                ]
            })
        });

        const purchase = await purchaseRes.json();
        if (!purchaseRes.ok) throw new Error('Purchase creation failed: ' + JSON.stringify(purchase));
        console.log('✅ Purchase Created:', purchase.invoiceNo);

        // 4. Verify Stock
        const updatedProductRes = await fetch(`${API_URL}/products/${product.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedProduct = await updatedProductRes.json();
        console.log('✅ New Product Stock:', updatedProduct.stock);

        // 5. Verify Supplier Balance
        const supplierDetailRes = await fetch(`${API_URL}/purchases/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const suppliers = await supplierDetailRes.json();
        const updatedSupplier = suppliers.find((s: any) => s.id === supplier.id);
        console.log('✅ Updated Supplier Balance:', updatedSupplier.balance);

        console.log('--- Purchase Module Test Completed Successfully ---');
    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
    }
}

testPurchase();
