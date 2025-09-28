// 추상 팩토리 패턴 - 서비스 생성을 위한 인터페이스
export interface IServiceFactory {
  createProductService(): import('./ProductService').IProductService;
  createOrderService(): import('./OrderService').IOrderService;
  createBrandService(): import('./BrandService').IBrandService;
  createCategoryService(): import('./CategoryService').ICategoryService;
  createVendorService(): import('./VendorService').IVendorService;
}

// 구체적인 서비스 팩토리 구현
export class ConcreteServiceFactory implements IServiceFactory {
  createProductService() {
    const { ProductService } = require('./ProductService');
    return new ProductService();
  }

  createOrderService() {
    const { OrderService } = require('./OrderService');
    return new OrderService();
  }

  createBrandService() {
    const { BrandService } = require('./BrandService');
    return new BrandService();
  }

  createCategoryService() {
    const { CategoryService } = require('./CategoryService');
    return new CategoryService();
  }

  createVendorService() {
    const { VendorService } = require('./VendorService');
    return new VendorService();
  }
}

// 싱글톤 패턴 - 서비스 매니저
export class ServiceManager {
  private static instance: ServiceManager;
  private serviceFactory: IServiceFactory;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.serviceFactory = new ConcreteServiceFactory();
  }

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  public getProductService() {
    if (!this.services.has('product')) {
      this.services.set('product', this.serviceFactory.createProductService());
    }
    return this.services.get('product');
  }

  public getOrderService() {
    if (!this.services.has('order')) {
      this.services.set('order', this.serviceFactory.createOrderService());
    }
    return this.services.get('order');
  }

  public getBrandService() {
    if (!this.services.has('brand')) {
      this.services.set('brand', this.serviceFactory.createBrandService());
    }
    return this.services.get('brand');
  }

  public getCategoryService() {
    if (!this.services.has('category')) {
      this.services.set('category', this.serviceFactory.createCategoryService());
    }
    return this.services.get('category');
  }

  public getVendorService() {
    if (!this.services.has('vendor')) {
      this.services.set('vendor', this.serviceFactory.createVendorService());
    }
    return this.services.get('vendor');
  }

  // 서비스 초기화 (필요시)
  public async initializeServices(): Promise<void> {
    console.log('Initializing services...');
    // 각 서비스의 초기화 로직이 있다면 여기서 호출
    await Promise.all([
      this.getProductService(),
      this.getOrderService(),
      this.getBrandService(),
      this.getCategoryService(),
      this.getVendorService()
    ]);
    console.log('All services initialized successfully');
  }

  // 서비스 정리 (필요시)
  public dispose(): void {
    this.services.clear();
  }
}

// 편의를 위한 전역 인스턴스
export const serviceManager = ServiceManager.getInstance();