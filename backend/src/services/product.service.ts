import prisma from '../utils/prisma';
import * as fs from 'fs';
import * as path from 'path';

// --- Category Services ---
export const createCategory = async (data: any) => {
    return await (prisma.category as any).create({ data });
};

export const getAllCategories = async (shopId?: number) => {
    return await (prisma.category as any).findMany({
        where: shopId ? { OR: [{ shopId }, { shopId: null }], isActive: true } : { isActive: true },
    });
};

// --- Brand Services ---
export const createBrand = async (data: any) => {
    return await (prisma.brand as any).create({ data });
};

export const getAllBrands = async () => {
    return await (prisma.brand as any).findMany({
        where: { isActive: true }
    });
};

// --- Product Services ---
export const createProduct = async (data: any) => {
    const { image, ...productData } = data;

    if (image) {
        // Handle base64 image
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `${Date.now()}-${data.sku || 'product'}.png`;
        const filePath = path.join('uploads', 'products', fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');
        productData.imageUrl = `/uploads/products/${fileName}`;
    }

    return await (prisma.product as any).create({ data: productData });
};

export const getAllProducts = async (filters: any) => {
    return await prisma.product.findMany({
        where: { ...filters, isActive: true },
        include: {
            category: true,
            brand: true,
            shop: { select: { name: true } }
        }
    });
};

export const getProductById = async (id: number) => {
    return await prisma.product.findFirst({
        where: { id, isActive: true },
        include: {
            category: true,
            brand: true,
            shop: true
        }
    });
};

export const updateProduct = async (id: number, data: any) => {
    return await prisma.product.update({
        where: { id },
        data
    });
};

export const deleteProduct = async (id: number) => {
    return await (prisma.product as any).update({
        where: { id },
        data: { isActive: false }
    });
};
