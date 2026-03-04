-- init.sql
-- Run this script in phpMyAdmin or your MySQL client to initialize the database tables.

-- --- Shops ---
CREATE TABLE IF NOT EXISTS Shop (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NULL,
  contact VARCHAR(255) NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --- Users & Auth ---
CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL,
  role ENUM('SUPER_ADMIN', 'SHOP_ADMIN', 'SALES_USER') DEFAULT 'SALES_USER',
  shopId INT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE SET NULL
);

-- --- Categories & Brands ---
CREATE TABLE IF NOT EXISTS Category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shopId INT NULL,
  isActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Brand (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE
);

-- --- Products & Inventory ---
CREATE TABLE IF NOT EXISTS Product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(255) UNIQUE NOT NULL,
  barcode VARCHAR(255) NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  costPrice DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  minStock INT DEFAULT 5,
  shopId INT NOT NULL,
  categoryId INT NULL,
  brandId INT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  imageUrl VARCHAR(255) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id),
  FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL,
  FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE SET NULL
);

-- --- Customers & Suppliers ---
CREATE TABLE IF NOT EXISTS Customer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(255) NULL,
  cnic VARCHAR(255) NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  creditLimit DECIMAL(10,2) DEFAULT 0.00,
  shopId INT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Supplier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NULL,
  company VARCHAR(255) NULL,
  balance FLOAT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- --- Sales & POS ---
CREATE TABLE IF NOT EXISTS Sale (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceNo VARCHAR(255) UNIQUE NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  netAmount DECIMAL(10,2) NOT NULL,
  paidAmount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'RETURNED') DEFAULT 'COMPLETED',
  paymentMethod ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'MIXED') DEFAULT 'CASH',
  saleType ENUM('CASH', 'CREDIT', 'INSTALLMENT') DEFAULT 'CASH',
  shopId INT NOT NULL,
  userId INT NOT NULL,
  customerId INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id),
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS SaleItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  saleId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0.00,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (saleId) REFERENCES Sale(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);

-- --- Installments ---
CREATE TABLE IF NOT EXISTS InstallmentPlan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  saleId INT UNIQUE NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  downPayment DECIMAL(10,2) NOT NULL,
  monthlyInstallment DECIMAL(10,2) NOT NULL,
  totalInstallments INT NOT NULL,
  startDate DATETIME NOT NULL,
  endDate DATETIME NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'DEFAULTED') DEFAULT 'ACTIVE',
  shopId INT DEFAULT 1 NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (saleId) REFERENCES Sale(id) ON DELETE CASCADE,
  FOREIGN KEY (shopId) REFERENCES Shop(id)
);

CREATE TABLE IF NOT EXISTS Installment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  planId INT NOT NULL,
  dueDate DATETIME NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paidAmount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE') DEFAULT 'PENDING',
  paidAt DATETIME NULL,
  notes TEXT NULL,
  paymentMethod ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'MIXED') DEFAULT 'CASH',
  referenceId VARCHAR(255) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planId) REFERENCES InstallmentPlan(id) ON DELETE CASCADE
);

-- --- Purchases ---
CREATE TABLE IF NOT EXISTS Purchase (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoiceNo VARCHAR(255) NULL,
  supplierId INT NOT NULL,
  shopId INT NOT NULL,
  userId INT NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  paidAmount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES Supplier(id),
  FOREIGN KEY (shopId) REFERENCES Shop(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS PurchaseItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchaseId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  costPrice DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (purchaseId) REFERENCES Purchase(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);

CREATE TABLE IF NOT EXISTS PurchasePayment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchaseId INT NULL,
  supplierId INT NOT NULL,
  shopId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  method ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'MIXED') DEFAULT 'CASH',
  notes TEXT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchaseId) REFERENCES Purchase(id) ON DELETE SET NULL,
  FOREIGN KEY (supplierId) REFERENCES Supplier(id),
  FOREIGN KEY (shopId) REFERENCES Shop(id)
);

-- --- Accounting ---
CREATE TABLE IF NOT EXISTS Expense (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NULL,
  shopId INT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  userId INT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (shopId) REFERENCES Shop(id),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);

-- Indexes (These speed up queries)
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_shopId ON User(shopId);

CREATE INDEX idx_product_shopId ON Product(shopId);
CREATE INDEX idx_product_sku ON Product(sku);
CREATE INDEX idx_product_categoryId ON Product(categoryId);
CREATE INDEX idx_product_brandId ON Product(brandId);

CREATE INDEX idx_customer_phone ON Customer(phone);
CREATE INDEX idx_customer_shopId ON Customer(shopId);

CREATE INDEX idx_supplier_name ON Supplier(name);

CREATE INDEX idx_sale_shopId ON Sale(shopId);
CREATE INDEX idx_sale_customerId ON Sale(customerId);
CREATE INDEX idx_sale_createdAt ON Sale(createdAt);
CREATE INDEX idx_sale_saleType ON Sale(saleType);

CREATE INDEX idx_installmentplan_shopId ON InstallmentPlan(shopId);
CREATE INDEX idx_installmentplan_startDate ON InstallmentPlan(startDate);
CREATE INDEX idx_installmentplan_status ON InstallmentPlan(status);

CREATE INDEX idx_installment_planId ON Installment(planId);
CREATE INDEX idx_installment_dueDate ON Installment(dueDate);
CREATE INDEX idx_installment_status ON Installment(status);

CREATE INDEX idx_purchase_shopId ON Purchase(shopId);
CREATE INDEX idx_purchase_supplierId ON Purchase(supplierId);
CREATE INDEX idx_purchase_invoiceNo ON Purchase(invoiceNo);
CREATE INDEX idx_purchase_createdAt ON Purchase(createdAt);

CREATE INDEX idx_purchasepayment_purchaseId ON PurchasePayment(purchaseId);
CREATE INDEX idx_purchasepayment_supplierId ON PurchasePayment(supplierId);
CREATE INDEX idx_purchasepayment_shopId ON PurchasePayment(shopId);
CREATE INDEX idx_purchasepayment_paymentDate ON PurchasePayment(paymentDate);

CREATE INDEX idx_expense_shopId ON Expense(shopId);
CREATE INDEX idx_expense_date ON Expense(date);
