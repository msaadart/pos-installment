// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testSales() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        if (!loginRes.ok) return console.error('Login Failed');
        const { token, user } = await loginRes.json();
        console.log('Login Success.');

        // 2. Get Product to Sell
        const productRes = await fetch(`${API_URL}/products?shopId=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await productRes.json();
        if (products.length === 0) return console.error('No products found to sell');

        const productToSell = products[0];
        console.log(`Selling Product: ${productToSell.name} (Stock: ${productToSell.stock})`);

        // 3. Create Sale (Cash)
        console.log('Creating Cash Sale...');
        const saleData = {
            shopId: 1,
            userId: user.id,
            customerId: null, // Walk-in customer
            paymentMethod: 'CASH',
            saleType: 'CASH',
            discount: 0,
            paidAmount: productToSell.price * 2, // Full payment
            items: [
                {
                    productId: productToSell.id,
                    quantity: 2,
                    price: Number(productToSell.price)
                }
            ]
        };

        const saleRes = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(saleData)
        });

        const sale = await saleRes.json();
        console.log('Sale Status:', saleRes.status);
        console.log('Sale Invoice:', sale.invoiceNo);
        console.log('Sale Total:', sale.totalAmount);

        if (!saleRes.ok) console.error('Sale Error:', sale);

        // 4. Verify Stock Update
        const updatedProductRes = await fetch(`${API_URL}/products/${productToSell.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedProduct = await updatedProductRes.json();
        console.log(`Updated Stock for ${updatedProduct.name}: ${updatedProduct.stock}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

testSales();
