// 멀티테넌트(화주사) 환경을 위한 타입 정의

// 화주사(테넌트) 기본 정보
export interface Tenant {
  id: string;
  code: string;
  name: string;
  type: 'internal' | 'external'; // 자체 vs 외부 공급처
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 가격 정보
export interface PricingInfo {
  supplyPrice?: number;
  costPrice?: number;
  salePrice?: number;
  discountPrice?: number;
  marginRate?: number;
  marginAmount?: number;
  discountRate?: number;
  actualMarginRate?: number;
  actualMarginAmount?: number;
}

// 가격 규칙
export interface PricingRule {
  id: string;
  name: string;
  type: 'margin' | 'discount' | 'category' | 'supplier';
  condition: 'minimum' | 'maximum' | 'range';
  value: number;
  description: string;
}

// 멀티테넌트 상품 확장 타입
export interface MultiTenantProduct {
  id: string;
  tenantId: string; // 화주사 ID
  productName: string;
  englishProductName?: string;
  
  // 상품 코드 관리 (3종)
  codes: ProductCodes;
  
  // 카테고리 및 브랜드
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  
  // 가격 정보
  pricing: ProductPricing;
  
  // 재고 정보 (읽기 전용)
  stockInfo: StockInfo;
  
  // 상태 관리
  status: ProductStatus;
  
  // 태그 시스템
  tags: ProductTag[];
  
  // 물류 정보 (간편 필드)
  logistics: LogisticsInfo;
  
  // 정책 필드들
  policies: ProductPolicies;
  
  // 기본 필드
  description?: string;
  thumbnailUrl?: string;
  images: string[];
  
  // 조건부 공급처 정보 (외부 화주사인 경우만)
  supplier?: SupplierInfo;
  
  // 바코드 유무
  hasBarcode: boolean;
  barcodes: string[];
  
  // 메타 정보
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  
  // 채널 동기화 상태
  syncStatus: ChannelSyncStatus[];
}

// 상품 코드 관리 (3종)
export interface ProductCodes {
  internal: string; // 자체상품코드 (필수)
  cafe24?: string; // 카페24상품코드
  channels: ChannelCode[]; // 판매처별 상품코드
}

export interface ChannelCode {
  channelId: string;
  channelName: string;
  code: string;
  lastSyncAt?: Date;
}

// 가격 정책
export interface ProductPricing {
  sellingPrice: number; // 판매가 (필수)
  consumerPrice?: number; // 소비자가 (선택, 마케팅용)
  supplyPrice: number; // 공급가 (자동계산, 읽기전용)
  commissionRate: number; // 수수료율 (%)
  marginRate?: number; // 마진율 (%)
  
  // 자동계산 관련
  isSupplyPriceCalculated: boolean;
  calculatedAt?: Date;
  calculationMethod: 'commission' | 'margin' | 'fixed';
}

// 재고 정보 (읽기 전용)
export interface StockInfo {
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  safetyStock?: number;
  lastStockUpdate: Date;
  
  // 위치별 재고 (멀티 창고)
  warehouseStocks: WarehouseStock[];
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  stock: number;
  location?: string;
}

// 상품 상태
export interface ProductStatus {
  isActive: boolean;
  isSelling: boolean;
  isDisplayed: boolean;
  isSoldOut: boolean;
  
  // 승인 상태 (외부 공급처의 경우)
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: string;
}

// 태그 시스템
export type TagCategory = 'general' | 'brand' | 'season' | 'style' | 'feature' | 'target' | 'event';

export interface ProductTag {
  id: string;
  name: string;
  category: TagCategory;
  createdAt?: string;
}

// 물류 정보 (간편 필드)
export interface LogisticsInfo {
  // 치수 정보
  width?: number; // 가로 (cm)
  height?: number; // 세로 (cm)
  depth?: number; // 높이 (cm)
  weight?: number; // 무게 (g)
  
  // 포장 정보
  packagingUnit: 'box' | 'ea' | 'set';
  packagingQuantity: number; // 포장 단위당 수량
  
  // 배송 제한
  isFragile: boolean; // 파손 주의
  isLiquid: boolean; // 액체 여부
  temperatureControl?: 'none' | 'frozen' | 'refrigerated'; // 온도 관리
}

// 상품 정책 필드들
export interface ProductPolicies {
  // 송장 관련
  showProductNameOnInvoice: boolean; // 상품명 송장 표시 여부
  
  // 배송 관련
  preventConsolidation: boolean; // 합포 방지 여부
  shippingPolicyId?: string; // 배송비 정책 ID
  
  // 사은품 관련
  giftPolicyId?: string; // 사은품 정책 ID
  isSampleIncluded?: boolean; // 샘플 정책 포함 여부
  
  // 반품/교환 정책
  isReturnable: boolean;
  isExchangeable: boolean;
  returnPeriodDays: number;
}

// 공급처 정보 (외부 화주사용)
export interface SupplierInfo {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
}

// 채널 동기화 상태
export interface ChannelSyncStatus {
  channelId: string;
  channelName: string;
  lastSyncAt?: Date;
  syncStatus: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  needsSync: boolean;
}

// 검색 및 필터 타입
export interface ProductSearchFilters {
  // 기본 필터
  productName?: string;
  internalCode?: string;
  categoryIds?: string[];
  brandIds?: string[];
  status?: ProductStatusFilter[];
  createdDateRange?: DateRange;
  updatedDateRange?: DateRange;
  
  // 조건부 필터 (외부 화주사만)
  supplierIds?: string[];
  
  // 옵션 필터
  channelIds?: string[]; // 판매처/채널
  tagIds?: string[]; // 태그
  hasBarcode?: boolean; // 바코드 유무
  
  // 고급 필터
  priceRange?: PriceRange;
  stockRange?: StockRange;
}

export interface ProductStatusFilter {
  field: 'isActive' | 'isSelling' | 'isDisplayed' | 'isSoldOut';
  value: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export interface StockRange {
  minStock: number;
  maxStock: number;
}

// 페이지네이션 및 정렬
export interface ProductListParams {
  page: number;
  pageSize: number;
  sortBy: ProductSortField;
  sortOrder: 'asc' | 'desc';
  filters: ProductSearchFilters;
  tenantId?: string; // 멀티테넌트 식별자
}

export type ProductSortField = 
  | 'productName'
  | 'internalCode'
  | 'categoryName'
  | 'brandName'
  | 'sellingPrice'
  | 'supplyPrice'
  | 'consumerPrice'
  | 'totalStock'
  | 'createdAt'
  | 'updatedAt'
  | 'status';

// 일괄 처리 타입
export interface BulkOperation {
  type: 'status_change' | 'excel_download' | 'channel_sync';
  productIds: string[];
  params?: Record<string, any>;
}

export interface BulkStatusChange extends BulkOperation {
  type: 'status_change';
  statusChanges: {
    isActive?: boolean;
    isSelling?: boolean;
    isDisplayed?: boolean;
  };
}

export interface ExcelDownload extends BulkOperation {
  type: 'excel_download';
  includeFields: string[];
  format: 'selected' | 'all';
}

// 상품 등록/수정 폼 타입
export interface ProductFormData {
  // 기본 정보
  basicInfo: ProductBasicInfo;
  
  // 추가 정보
  additionalInfo: ProductAdditionalInfo;
  
  // 검증 상태
  validation: FormValidation;
}

export interface ProductBasicInfo {
  productName: string;
  englishProductName?: string;
  codes: ProductCodes;
  categoryId: string;
  brandId?: string;
  pricing: ProductPricing;
  tags: ProductTag[];
  description?: string;
  thumbnailUrl?: string;
  images: string[];
  
  // 물류 간편 필드 (기본 정보로 이동)
  logistics: LogisticsInfo;
  
  // 정책 필드들
  policies: ProductPolicies;
}

export interface ProductAdditionalInfo {
  // 상품 디자이너 및 관리 정보
  productDesigner?: string;
  publishDate?: Date; // 상품 게시일
  
  // 상세 물류 정보 (추가 정보에서 관리)
  detailedLogistics: DetailedLogisticsInfo;
  
  // 옵션 관리 (백로그)
  options?: ProductOption[];
}

export interface DetailedLogisticsInfo extends LogisticsInfo {
  // 상세 치수
  packageWidth?: number;
  packageHeight?: number;
  packageDepth?: number;
  packageWeight?: number;
  
  // 원산지 정보
  countryOfOrigin?: string;
  hsCode?: string; // 세번 코드
  
  // 보관 조건
  storageConditions?: string;
  shelfLife?: number; // 유통기한 (일)
}

export interface ProductOption {
  id: string;
  name: string;
  type: 'color' | 'size' | 'material' | 'other';
  values: ProductOptionValue[];
  isRequired: boolean;
}

export interface ProductOptionValue {
  id: string;
  value: string;
  additionalPrice: number;
  stock: number;
  isActive: boolean;
}

// 폼 검증 타입
export interface FormValidation {
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  isValid: boolean;
  touchedFields: Set<string>;
}

// API 응답 타입
export interface ProductListResponse {
  items: MultiTenantProduct[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ProductFormResponse {
  success: boolean;
  product?: MultiTenantProduct;
  errors?: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}
