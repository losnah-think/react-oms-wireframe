import { PrismaClient } from '../../generated/prisma';
import { Product as DomainProduct, IProduct } from '../models/Product';

const prisma = new PrismaClient();

export class PrismaProductService {
  async getAllProducts(): Promise<DomainProduct[]> {
    const rows = await prisma.product.findMany({ include: { variants: true } });
    return rows.map(r => new DomainProduct({ ...r } as Partial<IProduct>));
  }

  async getProductById(id: string): Promise<DomainProduct | null> {
    const row = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    return row ? new DomainProduct({ ...row } as Partial<IProduct>) : null;
  }

  async createProduct(productData: Partial<IProduct>): Promise<DomainProduct> {
    const created = await prisma.product.create({ data: { ...productData } as any, include: { variants: true } });
    return new DomainProduct({ ...created } as Partial<IProduct>);
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<DomainProduct> {
    const updated = await prisma.product.update({ where: { id }, data: { ...productData } as any, include: { variants: true } });
    return new DomainProduct({ ...updated } as Partial<IProduct>);
  }

  async deleteProduct(id: string): Promise<boolean> {
    await prisma.product.delete({ where: { id } });
    return true;
  }

  async searchProducts(query: string): Promise<DomainProduct[]> {
    const rows = await prisma.product.findMany({
      where: {
        OR: [
          { productName: { contains: query, mode: 'insensitive' } },
          { productCode: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: { variants: true }
    });
    return rows.map(r => new DomainProduct({ ...r } as Partial<IProduct>));
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    const prod = await prisma.product.findUnique({ where: { id: productId } });
    if (!prod) return false;
    await prisma.product.update({ where: { id: productId }, data: { stock: prod.stock + quantity } });
    await prisma.inventoryMovement.create({ data: { productId, quantity, type: 'adjustment' } });
    return true;
  }
}

export default new PrismaProductService();