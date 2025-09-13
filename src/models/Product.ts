import { Product as IProduct, ProductVariant } from '../types/database';

// 기존 인터페이스를 database.ts의 Product 타입으로 대체
export type { IProduct, ProductVariant };

export class Product implements IProduct {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;
  public productName: string;
  public englishProductName?: string;
  public productCode: string;
  public productCategory: string;
  public classification?: string;
  public brandId?: string;
  public supplierId?: string;
  
  // 가격 정보
  public originalCost: number;
  public representativeSellingPrice: number;
  public representativeSupplyPrice?: number;
  public marketPrice?: number;
  public consumerPrice?: number;
  public foreignCurrencyPrice?: number;
  
  // 재고 및 상태
  public stock: number;
  public safeStock?: number;
  public isOutOfStock: boolean;
  public isSelling: boolean;
  public isSoldout: boolean;
  
  // 상품 상세 정보
  public description?: string;
  public representativeImage?: string;
  public descriptionImages: string[];
  
  // 물리적 정보
  public width?: number;
  public height?: number;
  public depth?: number;
  public weight?: number;
  public volume?: number;
  
  // 기타 정보
  public hsCode?: string;
  public origin?: string;
  public isTaxExempt: boolean;
  public showProductNameOnInvoice: boolean;
  public productDesigner?: string;
  public productRegistrant?: string;
  public productYear?: string;
  public productSeason?: string;
  
  // 외부 연동 정보
  public externalProductId?: string;
  public externalUrl?: string;
  
  public active: boolean;

  constructor(data: Partial<IProduct>) {
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.productName = data.productName || '';
    this.englishProductName = data.englishProductName;
    this.productCode = data.productCode || '';
  this.productCategory = data.productCategory || '';
  this.classification = (data as any).classification;
    this.brandId = data.brandId;
    this.supplierId = data.supplierId;
    
    // 가격 정보
    this.originalCost = data.originalCost || 0;
    this.representativeSellingPrice = data.representativeSellingPrice || 0;
    this.representativeSupplyPrice = data.representativeSupplyPrice;
    this.marketPrice = data.marketPrice;
    this.consumerPrice = data.consumerPrice;
    this.foreignCurrencyPrice = data.foreignCurrencyPrice;
    
    // 재고 및 상태
    this.stock = data.stock || 0;
    this.safeStock = data.safeStock;
    this.isOutOfStock = data.isOutOfStock || false;
    this.isSelling = data.isSelling || true;
    this.isSoldout = data.isSoldout || false;
    
    // 상품 상세 정보
    this.description = data.description;
    this.representativeImage = data.representativeImage;
    this.descriptionImages = data.descriptionImages || [];
    
    // 물리적 정보
    this.width = data.width;
    this.height = data.height;
    this.depth = data.depth;
    this.weight = data.weight;
    this.volume = data.volume;
    
    // 기타 정보
    this.hsCode = data.hsCode;
    this.origin = data.origin;
    this.isTaxExempt = data.isTaxExempt || false;
    this.showProductNameOnInvoice = data.showProductNameOnInvoice || false;
    this.productDesigner = data.productDesigner;
    this.productRegistrant = data.productRegistrant;
    this.productYear = data.productYear;
    this.productSeason = data.productSeason;
    
    // 외부 연동 정보
    this.externalProductId = data.externalProductId;
    this.externalUrl = data.externalUrl;
    
    this.active = data.active !== undefined ? data.active : true;
  }

  public isInStock(): boolean {
    return this.stock > 0 && !this.isOutOfStock;
  }

  public getFormattedPrice(): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(this.representativeSellingPrice);
  }

  public updateStock(quantity: number): void {
    this.stock = Math.max(0, this.stock + quantity);
    this.isOutOfStock = this.stock === 0;
    this.updatedAt = new Date();
  }

  public updateStatus(isSelling: boolean): void {
    this.isSelling = isSelling;
    this.updatedAt = new Date();
  }

  // 레거시 호환성을 위한 getter 메서드들
  public get name(): string {
    return this.productName;
  }

  public get price(): number {
    return this.representativeSellingPrice;
  }

  public get category(): string {
    return this.productCategory;
  }

  public get imageUrl(): string | undefined {
    return this.representativeImage;
  }

  public toJSON(): IProduct {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      productName: this.productName,
      englishProductName: this.englishProductName,
      productCode: this.productCode,
      productCategory: this.productCategory,
  classification: this.classification,
      brandId: this.brandId,
      supplierId: this.supplierId,
      originalCost: this.originalCost,
      representativeSellingPrice: this.representativeSellingPrice,
      representativeSupplyPrice: this.representativeSupplyPrice,
      marketPrice: this.marketPrice,
      consumerPrice: this.consumerPrice,
      foreignCurrencyPrice: this.foreignCurrencyPrice,
      stock: this.stock,
      safeStock: this.safeStock,
      isOutOfStock: this.isOutOfStock,
      isSelling: this.isSelling,
      isSoldout: this.isSoldout,
      description: this.description,
      representativeImage: this.representativeImage,
      descriptionImages: this.descriptionImages,
      width: this.width,
      height: this.height,
      depth: this.depth,
      weight: this.weight,
      volume: this.volume,
      hsCode: this.hsCode,
      origin: this.origin,
      isTaxExempt: this.isTaxExempt,
      showProductNameOnInvoice: this.showProductNameOnInvoice,
      productDesigner: this.productDesigner,
      productRegistrant: this.productRegistrant,
      productYear: this.productYear,
      productSeason: this.productSeason,
      externalProductId: this.externalProductId,
      externalUrl: this.externalUrl,
      active: this.active
    };
  }
}
