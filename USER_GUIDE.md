# User Guide: Installment AI POS System

This guide outlines the key workflows and features of the Installment AI system.

## 🔑 User Roles

1.  **SUPER_ADMIN**: Full access to all shops, users, and global reports. Can create new shops and assign Shop Admins.
2.  **SHOP_ADMIN**: Full access to a specific shop's inventory, sales, and reports. Can manage shop-specific users.
3.  **SALES_USER**: Limited access. Can perform sales (POS), view products, and record payments.

## 🛒 Key Workflows

### 1. Point of Sale (POS)
- Navigate to **POS (Sales)**.
- Select a shop (if Admin) and add products to the cart.
- Choose **Sale Type**:
    - **CASH**: Immediate payment.
    - **INSTALLMENT**: Requires down payment and generates a schedule.
- Complete checkout. Stock is automatically deducted.

### 2. Managing Installments
- Navigate to **Installments**.
- View all active plans and their respective schedules.
- To record a payment:
    - Locate the plan.
    - Click **Pay** on the respective installment.

### 3. Inventory & Purchases
- **Products**: Use the Products module to manage items. Set **Min Stock** to receive low-stock alerts.
- **Purchases**: When stock arrives, use the **Purchases** module.
    - Select Supplier.
    - Add items and specify **Cost Price**.
    - Inventory will increment automatically upon saving.

### 4. Tracking Expenses
- Navigate to **Expenses**.
- Record store costs like Rent, Electricity, or Salaries.
- Expenses are aggregated in financial reports.

### 5. Reporting
- Use the **Reports** module for:
    - **Sales Reports**: Daily/Monthly sales trends.
    - **Low Stock**: Items needing replenishment.
    - **Installment Due**: Tracking upcoming payments.

## 🛠 Support & Maintenance
- Ensure the Docker container is running before starting the backend.
- Regularly check the **Dashboard** for a high-level overview of shop performance.
