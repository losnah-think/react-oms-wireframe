import { Product, IProduct } from '../models/Product';
import { BaseRepository } from '../lib/Repository';

export class ProductRepository extends BaseRepository<Product> {
  constructor(products: Product[] = []) {
    super();
    this.entities = [...products];
  }

  protected generateId(): string {
    return `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Product 특화 메서드들
  async findByCategory(category: string): Promise<Product[]> {
    await this.delay(40);
    return this.entities.filter(product => product.category === category);
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    await this.delay(40);
    return this.entities.filter(product => product.brandId === brandId);
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    await this.delay(40);
    return this.entities.filter(product => product.stock <= threshold);
  }

  async findOutOfStock(): Promise<Product[]> {
    await this.delay(40);
    return this.entities.filter(product => !product.isInStock());
  }

  async searchByName(name: string): Promise<Product[]> {
    await this.delay(50);
    const lowercaseName = name.toLowerCase();
    return this.entities.filter(product =>
      product.name.toLowerCase().includes(lowercaseName)
    );
  }

  async getTotalInventoryValue(): Promise<number> {
    await this.delay(30);
    return this.entities.reduce((total, product) =>
      total + (product.price * product.stock), 0
    );
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    await this.delay(60);
    const product = this.entities.find(p => p.id === productId);
    if (!product) {
      return false;
    }
    product.updateStock(quantity);
    return true;
  }
}