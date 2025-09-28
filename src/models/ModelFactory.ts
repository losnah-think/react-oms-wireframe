import { Product, IProduct } from './Product';
import { Order, IOrder } from './Order';
import { User, IUser } from './User';
import { Brand, IBrand } from './Brand';
import { Category, ICategory } from './Category';
import { Vendor, IVendor } from './Vendor';

// 추상 팩토리 패턴 - 모델 생성을 위한 인터페이스
export interface IModelFactory {
  createProduct(data: Partial<IProduct>): Product;
  createOrder(data: Partial<IOrder>): Order;
  createUser(data: Partial<IUser>): User;
  createBrand(data: Partial<IBrand>): Brand;
  createCategory(data: Partial<ICategory>): Category;
  createVendor(data: Partial<IVendor>): Vendor;
}

// 구체적인 모델 팩토리 구현
export class ConcreteModelFactory implements IModelFactory {
  createProduct(data: Partial<IProduct>): Product {
    return new Product(data);
  }

  createOrder(data: Partial<IOrder>): Order {
    return new Order(data);
  }

  createUser(data: Partial<IUser>): User {
    return new User(data);
  }

  createBrand(data: Partial<IBrand>): Brand {
    return new Brand(data);
  }

  createCategory(data: Partial<ICategory>): Category {
    return new Category(data);
  }

  createVendor(data: Partial<IVendor>): Vendor {
    return new Vendor(data);
  }
}

// 싱글톤 모델 팩토리 매니저
export class ModelFactoryManager {
  private static instance: ModelFactoryManager;
  private modelFactory: IModelFactory;

  private constructor() {
    this.modelFactory = new ConcreteModelFactory();
  }

  public static getInstance(): ModelFactoryManager {
    if (!ModelFactoryManager.instance) {
      ModelFactoryManager.instance = new ModelFactoryManager();
    }
    return ModelFactoryManager.instance;
  }

  public getModelFactory(): IModelFactory {
    return this.modelFactory;
  }

  // 편의 메서드들
  public createProduct(data: Partial<IProduct>): Product {
    return this.modelFactory.createProduct(data);
  }

  public createOrder(data: Partial<IOrder>): Order {
    return this.modelFactory.createOrder(data);
  }

  public createUser(data: Partial<IUser>): User {
    return this.modelFactory.createUser(data);
  }

  public createBrand(data: Partial<IBrand>): Brand {
    return this.modelFactory.createBrand(data);
  }

  public createCategory(data: Partial<ICategory>): Category {
    return this.modelFactory.createCategory(data);
  }

  public createVendor(data: Partial<IVendor>): Vendor {
    return this.modelFactory.createVendor(data);
  }
}

// 편의를 위한 전역 인스턴스
export const modelFactory = ModelFactoryManager.getInstance();