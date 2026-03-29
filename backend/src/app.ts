import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Security Middlewares
import rateLimit from 'express-rate-limit';

// Global Error Handler
import { errorHandler } from './middleware/errorHandler';

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

// Ensure CORS allows necessary origins only in production
app.use(cors({
  origin: 'https://pos.giftokarachi.com/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// Apply Helmet for Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

// Apply Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter); // Apply rate limiting to API routes

app.use(morgan('dev'));

// Parse incoming requests
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

const angularPath = path.join(__dirname, process.env.FRONTEND_URL || 'installment-frontend/browser');
app.use(express.static(angularPath));

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API Route Not Found' });
});

app.use((req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

// Use Global Error Handler LAST
app.use(errorHandler);

export default app;
