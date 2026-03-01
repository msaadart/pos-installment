import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

import authRoutes from './routes/auth.routes';
import shopRoutes from './routes/shop.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import installmentRoutes from './routes/installment.routes';
import reportRoutes from './routes/report.routes';
import purchaseRoutes from './routes/purchase.routes';
import expenseRoutes from './routes/expense.routes';
import customerRoutes from './routes/customer.routes';

app.use(cors({
    // origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}
));
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
//      contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],

//         scriptSrc: [
//           "'self'",
//           "'unsafe-inline'"   // allow inline JS
//         ],

//         styleSrc: [
//           "'self'",
//           "'unsafe-inline'"   // allow inline CSS
//         ],

//         objectSrc: ["'none'"],
//         upgradeInsecureRequests: []
//       }
//     }
// }));
app.use(morgan('dev'));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/customers', customerRoutes);

const angularPath = path.join(__dirname, '../installment-frontend/browser');

app.use(express.static(angularPath));

app.use((req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

export default app;
