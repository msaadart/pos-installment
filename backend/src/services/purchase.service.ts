import prisma from '../utils/prisma';

export const createPurchase = async (data: any) => {
    const { shopId, userId, supplierId, items, totalAmount, paidAmount } = data;

    const balance = Number(totalAmount) - (Number(paidAmount) || 0);
    const invoiceNo = data.invoiceNo || `PUR-${Date.now()}`;

    // Transaction: Create Purchase, PurchaseItems, Update Inventory, Update Supplier Balance
    const purchase = await prisma.$transaction(async (prisma: any) => {
        // 1. Create Purchase Record
        const newPurchase = await prisma.purchase.create({
            data: {
                invoiceNo,
                shopId,
                userId,
                supplierId,
                totalAmount,
                paidAmount: paidAmount || 0,
                balance,
                status: 'COMPLETED',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        costPrice: item.costPrice,
                        subtotal: Number(item.costPrice) * item.quantity
                    }))
                }
            },
            include: { items: true }
        });

        // 2. Update Inventory (Increment Stock)
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }

        // 3. Update Supplier Balance
        if (balance > 0) {
            await prisma.supplier.update({
                where: { id: supplierId },
                data: { balance: { increment: balance } }
            });
        }

        return newPurchase;
    });

    return purchase;
};

export const getAllPurchases = async (filters: any = {}) => {
    const { search, shopId, supplierId } = filters;
    const where: any = {};
    if (shopId) where.shopId = shopId;
    if (supplierId) where.supplierId = Number(supplierId);
    if (search) {
        where.OR = [
            { invoiceNo: { contains: search } },
            { supplier: { name: { contains: search } } }
        ];
    }
    return await prisma.purchase.findMany({
        where,
        include: {
            supplier: { select: { name: true } },
            shop: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
    });
};

export const getPurchaseById = async (id: number) => {
    return await prisma.purchase.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } },
            user: true,
            supplier: true,
            shop: true
        }
    });
};

// --- Supplier Management ---

export const createSupplier = async (data: any) => {
    return await prisma.supplier.create({ data });
};

export const getAllSuppliers = async (filters: any = {}) => {
    const { search } = filters;
    const where: any = { isActive: true };
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { company: { contains: search } }
        ];
    }
    return await prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        take: 200
    });
};

export const getSupplierById = async (id: number) => {
    return await prisma.supplier.findFirst({
        where: { id, isActive: true },
        include: { purchases: true }
    });
};

export const deleteSupplier = async (id: number) => {
    return await (prisma.supplier as any).update({
        where: { id },
        data: { isActive: false }
    });
};

export const clearSupplierBalance = async (id: number) => {
    return await prisma.supplier.update({
        where: { id },
        data: { balance: 0 }
    });
};

export const clearPurchaseBalance = async (purchaseId: number, amount: number, method: string, notes: string) => {
    return await prisma.$transaction(async (tx: any) => {
        const purchase = await tx.purchase.findUnique({ where: { id: purchaseId } });
        if (!purchase) throw new Error('Purchase not found');

        if (amount > purchase.balance) {
            throw new Error('Amount exceeds purchase balance');
        }

        if (amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }

        if(amount < 0) {
            throw new Error('Negative values are not allowed');
        }

        const newPaidAmount = Number(purchase.paidAmount) + amount;
        const newBalance = Number(purchase.totalAmount) - newPaidAmount;

        // 1. Update Purchase
        await tx.purchase.update({
            where: { id: purchaseId },
            data: {
                paidAmount: newPaidAmount,
                balance: newBalance
            }
        });

        // 2. Update Supplier Balance
        await tx.supplier.update({
            where: { id: purchase.supplierId },
            data: {
                balance: { decrement: amount }
            }
        });

        // 3. Log Payment entry
        await (tx as any).purchasePayment.create({
            data: {
                purchaseId,
                supplierId: purchase.supplierId,
                shopId: purchase.shopId,
                amount,
                method: method, // Defaulting for simple clear
                notes: notes
            }
        });

        return { success: true };
    });
};

export const getAllPurchasePayments = async (filters: any = {}) => {
    const { supplierId, purchaseId, shopId } = filters;
    const where: any = {};
    if (supplierId) where.supplierId = Number(supplierId);
    if (purchaseId) where.purchaseId = Number(purchaseId);
    if (shopId) where.shopId = shopId;

    return await prisma.purchasePayment.findMany({
        where,
        include: {
            supplier: { select: { name: true } },
            purchase: { select: { invoiceNo: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 200
    });
};
