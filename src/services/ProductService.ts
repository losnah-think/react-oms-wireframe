import { Product, IProduct } from '../models/Product';

export interface IProductService {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(productData: Partial<IProduct>): Promise<Product>;
  updateProduct(id: string, productData: Partial<IProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  updateStock(productId: string, quantity: number): Promise<boolean>;
}

export class ProductService implements IProductService {
  private products: Product[] = [
    new Product({
      id: '1',
      name: '스마트폰 케이스',
      price: 25000,
      stock: 150,
      category: '액세서리',
      description: '충격 방지 기능이 있는 프리미엄 스마트폰 케이스'
    }),
    new Product({
      id: '2',
      name: '무선 이어폰',
      price: 89000,
      stock: 75,
      category: '전자제품',
      description: '노이즈 캔슬링 기능이 탑재된 무선 이어폰'
    }),
    new Product({
      id: '3',
      name: '노트북 스탠드',
      price: 45000,
      stock: 200,
      category: '사무용품',
      description: '각도 조절이 가능한 알루미늄 노트북 스탠드'
    }),
    new Product({
      id: '4',
      name: '마우스 패드',
      price: 15000,
      stock: 0,
      category: '사무용품',
      description: '게이밍용 대형 마우스 패드'
    })
  ];

  async getAllProducts(): Promise<Product[]> {
    // Simulate API call delay
    await this.delay(100);
    return [...this.products];
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.delay(50);
    const product = this.products.find(p => p.id === id);
    return product ? new Product(product.toJSON()) : null;
  }

  async createProduct(productData: Partial<IProduct>): Promise<Product> {
    await this.delay(200);
    const newProduct = new Product({
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<Product> {
    await this.delay(150);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    const updatedProduct = new Product({
      ...this.products[index].toJSON(),
      ...productData,
      id,
      updatedAt: new Date()
    });
    
    this.products[index] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.delay(100);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    this.products.splice(index, 1);
    return true;
  }

  async searchProducts(query: string): Promise<Product[]> {
    await this.delay(80);
    const lowercaseQuery = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    await this.delay(60);
    return this.products.filter(product => product.category === category);
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    await this.delay(100);
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      return false;
    }
    product.updateStock(quantity);
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Additional utility methods
  getCategories(): string[] {
    return Array.from(new Set(this.products.map(p => p.category)));
  }

  getLowStockProducts(threshold: number = 10): Product[] {
    return this.products.filter(p => p.stock <= threshold);
  }

  getTotalInventoryValue(): number {
    return this.products.reduce((total, product) => total + (product.price * product.stock), 0);
  }
}
