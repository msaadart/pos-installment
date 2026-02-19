// @ts-nocheck
const API_URL = 'http://localhost:4000/api';

async function testInstallment() {
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

        // 2. Get Product (Stock > 0)
        const productRes = await fetch(`${API_URL}/products?shopId=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await productRes.json();
        const productToSell = products[0];

        // 3. Create Installment Sale
        console.log('Creating Installment Sale...');
        const saleData = {
            shopId: 1,
            userId: user.id,
            customerId: null,
            paymentMethod: 'MIXED',
            saleType: 'INSTALLMENT',
            discount: 0,
            paidAmount: 200, // Down payment
            items: [
                {
                    productId: productToSell.id,
                    quantity: 1,
                    price: Number(productToSell.price) // 1200
                }
            ]
        };

        const planData = {
            totalAmount: 1200,
            downPayment: 200,
            totalInstallments: 5,
            monthlyInstallment: 200,
            startDate: new Date(),
            interestRate: 0
        };

        const installRes = await fetch(`${API_URL}/installments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ saleData, planData })
        });

        const result = await installRes.json();
        console.log('Installment Sale Status:', installRes.status);
        console.log('Plan ID:', result.plan?.id);

        if (!installRes.ok) console.error('Error:', result);

        if (result.plan) {
            // 4. Pay Installment
            const firstInstallment = result.plan.installments[0];
            console.log(`Paying Installment ${firstInstallment.id}...`);

            const payRes = await fetch(`${API_URL}/installments/${firstInstallment.id}/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: 200 })
            });
            console.log('Payment Status:', payRes.status);
            console.log('Payment Result:', await payRes.json());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testInstallment();
