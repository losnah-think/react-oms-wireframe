// 공통 타입 정의
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 상품 관련 타입
export interface Product extends BaseEntity {
  productName: string;
  englishProductName?: string;
  productCode: string;
  productCategory: string;
  // 내부 분류 (ReactOMS에서 사용하는 분류 이름)
  classification?: string;
  brandId?: string;
  supplierId?: string;
  
  // 가격 정보
  originalCost: number;
  representativeSellingPrice: number;
  representativeSupplyPrice?: number;
  marketPrice?: number;
  consumerPrice?: number;
  foreignCurrencyPrice?: number;
  
  // 재고 및 상태
  stock: number;
  safeStock?: number;
  isOutOfStock: boolean;
  isSelling: boolean;
  isSoldout: boolean;
  
  // 상품 상세 정보
  description?: string;
  representativeImage?: string;
  descriptionImages: string[];
  
  // 물리적 정보
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  volume?: number;
  
  // 기타 정보
  hsCode?: string;
  origin?: string;
  isTaxExempt: boolean;
  showProductNameOnInvoice: boolean;
  productDesigner?: string;
  productRegistrant?: string;
  productYear?: string;
  productSeason?: string;
  
  // 외부 연동 정보
  externalProductId?: string;
  externalUrl?: string;
  classificationId?: string;
  
  active: boolean;
}

// 상품 변형 타입
export interface ProductVariant extends BaseEntity {
  productId: string;
  variantName: string;
  optionCode?: string;
  
  // 재고 정보
  stock: number;
  safeStock: number;
  location?: string;
  
  // 가격 정보
  costPrice: number;
  sellingPrice: number;
  supplyPrice: number;
  
  // 상태
  isSelling: boolean;
  isSoldout: boolean;
  
  // 바코드 정보
  code?: string;
  barcode1?: string;
  barcode2?: string;
  barcode3?: string;
  linkCode?: string;
  
  active: boolean;
}

// 카테고리 타입
export interface Category extends BaseEntity {
  name: string;
  nameEng?: string;
  description?: string;
  parentId?: string | null;
  level: number;
  sortOrder: number;
  status: 'active' | 'inactive';
  icon?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
}

// 브랜드 타입
export interface Brand extends BaseEntity {
  name: string;
  nameEng?: string;
  description?: string;
  logo?: string;
  website?: string;
  status: 'active' | 'inactive';
}

// 공급업체/판매처 타입
export interface Vendor extends BaseEntity {
  name: string;
  type: '판매처' | '공급처';
  businessNumber: string;
  representative: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  
  // API 연동 정보
  apiKey?: string;
  password?: string;
  apiUrl?: string;
  
  lastLoginDate?: Date;
}

// 배송업체 타입
export interface DeliveryCompany extends BaseEntity {
  name: string;
  code: string;
  apiUrl?: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  trackingUrlFormat: string;
  logo?: string;
  
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  
  pricing: {
    basePrice: number;
    weightLimit: number;
    sizeLimit: string;
    jejuSurcharge: number;
    islandSurcharge: number;
  };
}

// 쇼핑몰 타입
export interface Mall extends BaseEntity {
  name: string;
  status: 'active' | 'inactive';
  logo?: string;
  apiUrl?: string;
  
  // 연동 정보
  isConnected: boolean;
  lastSync?: Date;
  
  // 설정 정보
  mallInfo?: MallInfo;
}

export interface MallInfo {
  shipping: {
    freeShippingThreshold: number;
    standardShippingFee: number;
    expressShippingFee: number;
    returnShippingFee: number;
    exchangeShippingFee: number;
    jejuShippingFee: number;
    mountainShippingFee: number;
  };
  
  policies: {
    returnPolicy: string;
    exchangePolicy: string;
    refundPolicy: string;
    warrantyPolicy: string;
    asPolicy: string;
  };
  
  templates: {
    productDescription: string;
    asNotice: string;
  };
  
  options: {
    autoReply: boolean;
    inventorySync: boolean;
    priceSync: boolean;
    promotionSync: boolean;
    reviewSync: boolean;
    qnaAutoReply: boolean;
  };
}

// 쇼핑몰 카테고리 타입
export interface MallCategory {
  id: string;
  mallId: string;
  name: string;
  level: number;
  parentId?: string;
  externalCategoryId?: string;
}

// 카테고리 매핑 타입
export interface CategoryMapping extends BaseEntity {
  internalCategoryId: string;
  mallCategoryId: string;
  mallId: string;
  isActive: boolean;
  syncSettings?: {
    autoSync: boolean;
    priceSync: boolean;
    stockSync: boolean;
  };
}

// 주문 관련 타입
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED', 
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // 주문 상품
  items: OrderItem[];
  totalAmount: number;
  
  // 주문 상태
  status: OrderStatus;
  
  // 배송 정보
  shippingAddress?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  
  // 결제 정보
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'cancelled' | 'refunded';
  
  // 기타
  notes?: string;
  mallId?: string; // 어느 쇼핑몰에서 온 주문인지
}

// 사용자 타입
export interface User extends BaseEntity {
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  lastLogin?: Date;
  isActive: boolean;
}

// 외부 쇼핑몰 연동 타입
export interface ShoppingMallIntegration extends BaseEntity {
  mallType: 'makeshop' | 'cafe24' | 'wemakeprice' | 'godo' | 'naver' | 'coupang';
  mallName: string;
  isConnected: boolean;
  lastSync?: Date;
  
  // 연동 설정
  apiCredentials: {
    apiKey?: string;
    secretKey?: string;
    mallId?: string;
    [key: string]: any;
  };
  
  syncSettings: {
    autoSync: boolean;
    syncInterval: number; // 분 단위
    syncFields: {
      price: boolean;
      stock: boolean;
      status: boolean;
      description: boolean;
      images: boolean;
      options: boolean;
    };
    priceMarkup: number; // 가격 마크업 %
    stockBuffer: number; // 재고 버퍼
  };
  
  // 통계
  productCount: number;
  lastImportCount: number;
  successCount: number;
  failureCount: number;
}

// 외부 상품 정보 타입 (가져오기용)
export interface ExternalProduct {
  externalId: string;
  mallType: string;
  externalName: string;
  externalCode?: string;
  price: number;
  stock: number;
  category: string;
  categoryCode?: string;
  brand?: string;
  description?: string;
  images: string[];
  
  // 상태 정보
  displayStatus: 'Y' | 'N';
  sellStatus: 'Y' | 'N';
  productStatus: 'sale' | 'stop' | 'soldout';
  
  // 메타 정보
  externalUrl?: string;
  registDate?: Date;
  modifyDate?: Date;
  
  // 가져오기 상태
  isImported: boolean;
  mappedProductId?: string;
}
