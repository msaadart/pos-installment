/*
  Warnings:

  - You are about to drop the column `penalty` on the `installment` table. All the data in the column will be lost.
  - You are about to drop the column `interestRate` on the `installmentplan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `brand` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `customer` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `expense` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `installment` DROP COLUMN `penalty`,
    ADD COLUMN `paymentMethod` ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE', 'MIXED') NULL DEFAULT 'CASH',
    ADD COLUMN `referenceId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `installmentplan` DROP COLUMN `interestRate`,
    ADD COLUMN `shopId` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `supplier` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `InstallmentPlan` ADD CONSTRAINT `InstallmentPlan_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
