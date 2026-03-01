# Installment AI - POS & Installment Management System

A comprehensive Point of Sale (POS) and Installment Management System built with Node.js, Prisma, MySQL, and Angular.

## 🚀 Features

- **Store & User Management**: Multi-shop support with Role-Based Access Control (RBAC).
- **Product & Inventory**: SKU-based inventory tracking, categories, and brands.
- **POS (Point of Sale)**: Cash and credit sales with automated stock updates.
- **Installment Engine**: Automatic generation of payment schedules and tracking.
- **Purchases**: Manage stock purchases from suppliers with balance tracking.
- **Expenses**: Track store-level expenditures (Rent, Utilities, etc.).
- **Reporting**: Dashboard statistics, sales reports, and low-stock alerts.

## 🛠 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** (for MySQL)
- **Git**

## 📦 Getting Started

### 1. Database Setup
npx prisma db push


### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/giftraob_installment"
   PORT=4000
   JWT_SECRET=your_secret_key
   ```
4. Sync the database:
   ```bash
   npx prisma db push
   ```
5.  npx prisma generate

6. Run the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   *Access the app at `http://localhost:4200`.*

## 🧪 Testing

To run backend module tests:
```bash
cd backend
npx ts-node test-new-modules.ts
```

## 📖 Documentation
- [User Guide](./USER_GUIDE.md)
