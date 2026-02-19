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

export const getAllPurchases = async (filters: any) => {
    return await prisma.purchase.findMany({
        where: filters,
        include: {
            items: { include: { product: true } },
            user: { select: { name: true } },
            supplier: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
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

export const getAllSuppliers = async () => {
    return await prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
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
