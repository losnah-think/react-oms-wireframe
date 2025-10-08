# Products 폴더 정리 및 리팩토링 계획

## 1. 삭제 대상 파일들

### 1.1 사용하지 않는 페이지들
- `bulk-edit.tsx` - 메뉴에서 주석 처리됨, 기능이 불명확
- `individual-registration.tsx` - 메뉴에서 주석 처리됨, 기능이 불명확  
- `option-bulk.tsx` - 메뉴에 없음, 옵션 일괄 수정 기능
- `OptionEditPage.tsx` - 메뉴에 없음, 옵션 편집 기능
- `ExternalProductImportPage.tsx` - 메뉴에 없음, 중복 기능

### 1.2 이동 대상 파일들
- `ProductBarcodeManagementPage.tsx` → `src/features/barcodes/`로 이동
- `options/` 폴더 → 별도 옵션 관리 모듈로 분리하거나 삭제

### 1.3 중복 기능 정리
- `ProductImportPage.tsx`와 `ExternalProductImportPage.tsx` 통합
- 옵션 관련 기능들을 하나의 모듈로 통합

## 2. 리팩토링 계획

### 2.1 파일 구조 개선
```
src/features/products/
├── pages/                    # 페이지 컴포넌트들
│   ├── ProductsListPage.tsx
│   ├── ProductsAddPage.tsx
│   ├── ProductCsvUploadPage.tsx
│   ├── ProductImportPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── ProductRegistrationHistoryPage.tsx
│   └── ProductTrashPage.tsx
├── components/               # 재사용 가능한 컴포넌트들
│   ├── ProductCard.tsx
│   ├── ProductTable.tsx
│   ├── ProductFilters.tsx
│   └── ProductForm.tsx
├── hooks/                   # 비즈니스 로직 훅들
│   ├── useProducts.ts
│   ├── useProductImport.ts
│   └── useProductFilters.ts
├── types/                   # 타입 정의
│   └── index.ts
├── utils/                   # 유틸리티 함수들
│   ├── productValidation.ts
│   └── productHelpers.ts
└── index.ts                 # 메인 export 파일
```

### 2.2 컴포넌트 분리 및 재사용성 개선

#### ProductCard 컴포넌트
- 상품 정보 표시를 위한 재사용 가능한 카드 컴포넌트
- 다양한 크기와 레이아웃 지원

#### ProductTable 컴포넌트  
- 상품 목록 표시를 위한 테이블 컴포넌트
- 정렬, 필터링, 페이지네이션 기능 포함

#### ProductFilters 컴포넌트
- 상품 필터링을 위한 공통 컴포넌트
- 검색, 카테고리, 브랜드 등 필터 옵션

#### ProductForm 컴포넌트
- 상품 등록/수정을 위한 폼 컴포넌트
- 유효성 검사 및 에러 처리 포함

### 2.3 훅 설계

#### useProducts 훅
```typescript
interface UseProductsOptions {
  filters?: ProductFilters;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => void;
  createProduct: (product: CreateProductData) => Promise<void>;
  updateProduct: (id: string, updates: UpdateProductData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}
```

#### useProductImport 훅
```typescript
interface UseProductImportReturn {
  importProducts: (data: ImportData) => Promise<void>;
  loading: boolean;
  error: string | null;
  progress: number;
  importedCount: number;
  failedCount: number;
}
```

### 2.4 타입 시스템 개선

#### 통합된 Product 타입
```typescript
interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  cost: number;
  stock: number;
  status: ProductStatus;
  category: string[];
  brand: string;
  image?: string;
  variants: ProductVariant[];
  metadata: ProductMetadata;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  status: VariantStatus;
  barcode?: string;
  location?: string;
}

interface ProductMetadata {
  season: string;
  year: string;
  designer: string;
  supplier: string;
  registrant: string;
  tags: string[];
}
```

## 3. 구현 단계

### 3.1 1단계: 불필요한 파일 삭제
1. 사용하지 않는 페이지 파일들 삭제
2. 중복 기능 파일들 정리
3. 옵션 관련 파일들 별도 모듈로 분리

### 3.2 2단계: 컴포넌트 분리
1. 공통 컴포넌트 추출
2. 재사용 가능한 UI 컴포넌트 생성
3. 디자인 시스템 활용

### 3.3 3단계: 훅 및 로직 분리
1. 비즈니스 로직을 훅으로 분리
2. 상태 관리 개선
3. 에러 처리 통합

### 3.4 4단계: 타입 시스템 개선
1. 통합된 타입 정의
2. 타입 안전성 강화
3. API 인터페이스 정의

## 4. 예상 효과

### 4.1 코드 품질 개선
- 중복 코드 제거
- 재사용성 향상
- 유지보수성 개선

### 4.2 개발 효율성 향상
- 명확한 파일 구조
- 일관된 코딩 패턴
- 타입 안전성 보장

### 4.3 사용자 경험 개선
- 일관된 UI/UX
- 성능 최적화
- 에러 처리 개선
