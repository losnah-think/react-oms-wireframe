# FULGO OMS 개발자 가이드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [개발 환경 설정](#개발-환경-설정)
5. [컴포넌트 가이드](#컴포넌트-가이드)
6. [상태 관리](#상태-관리)
7. [API 연동](#api-연동)
8. [스타일링 가이드](#스타일링-가이드)
9. [테스트 가이드](#테스트-가이드)
10. [배포 가이드](#배포-가이드)

---

##  프로젝트 개요

FULGO OMS는 React + TypeScript + Next.js 기반의 현대적인 Order Management System입니다.

### 핵심 아키텍처
- **객체지향 설계**: 클래스 기반 모델과 서비스
- **컴포넌트 기반**: 재사용 가능한 UI 컴포넌트
- **타입 안전성**: TypeScript를 통한 컴파일 타임 검증
- **모듈화**: 기능별 독립적인 모듈 구조

### 주요 도메인
- **Product**: 상품 및 옵션 관리
- **Order**: 주문 처리 및 관리
- **User**: 사용자 및 권한 관리
- **Vendor**: 판매처 연동 관리
- **Settings**: 시스템 설정 관리

---

##  기술 스택

### Frontend
- **React 18**: UI 라이브러리
- **Next.js 13**: React 프레임워크
- **TypeScript**: 정적 타입 검사
- **Tailwind CSS**: 유틸리티 CSS 프레임워크

### 상태 관리
- **React Hooks**: useState, useEffect, useContext
- **Custom Hooks**: 비즈니스 로직 캡슐화
- **Context API**: 전역 상태 관리

### 개발 도구
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Jest**: 단위 테스트
- **Playwright**: E2E 테스트

### 배포
- **Vercel**: 호스팅 및 CI/CD
- **GitHub Actions**: 자동화 워크플로우

---

## 📁 프로젝트 구조

```
src/
├── components/              # 재사용 가능한 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── Sidebar.tsx     # 사이드바 네비게이션
│   │   ├── Header.tsx      # 상단 헤더
│   │   └── Layout.tsx      # 전체 레이아웃
│   └── design-system/      # 디자인 시스템 컴포넌트
│       ├── Button.tsx      # 버튼 컴포넌트
│       ├── Card.tsx        # 카드 컴포넌트
│       ├── Table.tsx       # 테이블 컴포넌트
│       └── ...
├── features/               # 기능별 모듈
│   ├── products/          # 상품 관리
│   │   ├── components/    # 상품 관련 컴포넌트
│   │   ├── hooks/         # 상품 관련 훅
│   │   ├── types/         # 상품 관련 타입
│   │   └── pages/         # 상품 관련 페이지
│   ├── users/             # 사용자 관리
│   ├── vendors/           # 거래처 관리
│   └── settings/          # 환경설정
├── lib/                   # 유틸리티 및 서비스
│   ├── services/          # API 서비스
│   ├── utils/             # 유틸리티 함수
│   └── types/             # 전역 타입 정의
├── models/                # 데이터 모델 클래스
├── pages/                 # Next.js 페이지
└── styles/                # 전역 스타일
```

### 핵심 디렉토리 설명

#### `/components`
- 재사용 가능한 UI 컴포넌트
- 디자인 시스템 컴포넌트
- 레이아웃 컴포넌트

#### `/features`
- 기능별 모듈화된 구조
- 각 기능은 독립적인 컴포넌트, 훅, 타입을 포함
- 관심사의 분리 원칙 적용

#### `/lib`
- 비즈니스 로직 및 서비스
- 유틸리티 함수
- 전역 설정

---

##  개발 환경 설정

### 1. 필수 요구사항
- Node.js 18.0.0 이상
- npm 8.0.0 이상
- Git

### 2. 프로젝트 클론 및 설치
```bash
# 저장소 클론
git clone https://github.com/your-org/react-oms-wireframe.git
cd react-oms-wireframe

# 의존성 설치
npm install
```

### 3. 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local

# 환경 변수 설정
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCKS=1
```

### 4. 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 5. 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 정적 사이트 생성 (GitHub Pages용)
npm run export
```

---

## 🧩 컴포넌트 가이드

### 디자인 시스템 컴포넌트

#### Button 컴포넌트
```typescript
import { Button } from '@/design-system';

// 기본 사용법
<Button>클릭하세요</Button>

// 다양한 변형
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// 크기 설정
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// 상태 설정
<Button loading>로딩 중</Button>
<Button disabled>비활성화</Button>
```

#### Card 컴포넌트
```typescript
import { Card } from '@/design-system';

<Card padding="lg">
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>
```

#### Table 컴포넌트
```typescript
import { Table, type TableColumn } from '@/design-system';

const columns: TableColumn<Product>[] = [
  {
    key: 'name',
    title: '상품명',
    render: (item) => <span>{item.name}</span>
  },
  {
    key: 'price',
    title: '가격',
    render: (item) => <span>{item.price.toLocaleString()}원</span>
  }
];

<Table data={products} columns={columns} />
```

### 커스텀 컴포넌트 작성

#### 컴포넌트 구조
```typescript
// src/features/products/components/ProductCard.tsx
import React from 'react';
import { Card, Button, Badge } from '../../../design-system';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete
}) => {
  return (
    <Card padding="md">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.description}</p>
      <div className="flex gap-2 mt-4">
        <Button size="small" onClick={() => onEdit?.(product)}>
          수정
        </Button>
        <Button size="small" variant="ghost" onClick={() => onDelete?.(product)}>
          삭제
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
```

---

## 🔄 상태 관리

### Custom Hooks 패턴

#### 비즈니스 로직 훅
```typescript
// src/features/products/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { Product, ProductFilters } from '../types';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  setFilters: (filters: ProductFilters) => void;
  refresh: () => void;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});

  const refresh = async () => {
    setLoading(true);
    try {
      // API 호출 로직
      const data = await fetchProducts(filters);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    // 상품 생성 로직
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    // 상품 수정 로직
  };

  const deleteProduct = async (id: string) => {
    // 상품 삭제 로직
  };

  useEffect(() => {
    refresh();
  }, [filters]);

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
```

#### 페이지에서 훅 사용
```typescript
// src/features/products/ProductsListPage.tsx
import React from 'react';
import { useProducts } from './hooks/useProducts';
import { ProductCard } from './components';

const ProductsListPage: React.FC = () => {
  const {
    products,
    loading,
    error,
    filters,
    setFilters,
    refresh,
    deleteProduct
  } = useProducts();

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={deleteProduct}
        />
      ))}
    </div>
  );
};
```

### 전역 상태 관리

#### Context API 사용
```typescript
// src/lib/contexts/AppContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

---

##  API 연동

### API 서비스 구조

#### 서비스 클래스
```typescript
// src/lib/services/ProductService.ts
import { Product, ProductFilters } from '@/types';

class ProductService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    
    const response = await fetch(`${this.baseUrl}/products?${params}`);
    if (!response.ok) {
      throw new Error('상품 목록을 가져오는데 실패했습니다');
    }
    
    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`);
    if (!response.ok) {
      throw new Error('상품을 가져오는데 실패했습니다');
    }
    
    return response.json();
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      throw new Error('상품 생성에 실패했습니다');
    }
    
    return response.json();
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      throw new Error('상품 수정에 실패했습니다');
    }
    
    return response.json();
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('상품 삭제에 실패했습니다');
    }
  }
}

export const productService = new ProductService();
```

#### 훅에서 서비스 사용
```typescript
// src/features/products/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { productService } from '@/lib/services/ProductService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('상품 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { products, loading, refresh };
};
```

### 에러 처리

#### 에러 바운더리
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-4">
            페이지를 새로고침하거나 관리자에게 문의하세요.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 🎨 스타일링 가이드

### Tailwind CSS 사용법

#### 기본 클래스 사용
```typescript
// 간단한 스타일링
<div className="p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900 mb-2">제목</h2>
  <p className="text-gray-600">내용</p>
</div>

// 반응형 디자인
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 bg-blue-50">모바일: 1열, 태블릿: 2열, 데스크톱: 3열</div>
</div>

// 상태별 스타일링
<button className={`
  px-4 py-2 rounded
  ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}
  hover:bg-blue-600 transition-colors
`}>
  버튼
</button>
```

#### 커스텀 스타일 클래스
```css
/* src/styles/custom.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors;
  }
  
  .card-hover {
    @apply hover:shadow-lg transition-shadow duration-200;
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent;
  }
}
```

### 디자인 토큰

#### 색상 팔레트
```typescript
// src/lib/design-tokens.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827',
  },
  success: {
    500: '#10b981',
  },
  error: {
    500: '#ef4444',
  },
  warning: {
    500: '#f59e0b',
  },
} as const;
```

#### 타이포그래피
```typescript
export const typography = {
  heading: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-semibold',
    h4: 'text-xl font-medium',
  },
  body: {
    large: 'text-lg',
    base: 'text-base',
    small: 'text-sm',
    tiny: 'text-xs',
  },
} as const;
```

---

## 🧪 테스트 가이드

### 단위 테스트 (Jest)

#### 컴포넌트 테스트
```typescript
// src/features/products/components/__tests__/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { Product } from '../../types';

const mockProduct: Product = {
  id: '1',
  name: '테스트 상품',
  price: 10000,
  description: '테스트 설명',
  // ... 기타 필드
};

describe('ProductCard', () => {
  it('상품 정보를 올바르게 표시한다', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('테스트 상품')).toBeInTheDocument();
    expect(screen.getByText('10,000원')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 콜백을 호출한다', () => {
    const onEdit = jest.fn();
    render(<ProductCard product={mockProduct} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('수정'));
    expect(onEdit).toHaveBeenCalledWith(mockProduct);
  });
});
```

#### 훅 테스트
```typescript
// src/features/products/hooks/__tests__/useProducts.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProducts } from '../useProducts';

describe('useProducts', () => {
  it('초기 상태가 올바르다', () => {
    const { result } = renderHook(() => useProducts());
    
    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('상품 목록을 로드한다', async () => {
    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.refresh();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.products).toHaveLength(0); // Mock 데이터에 따라 조정
  });
});
```

### E2E 테스트 (Playwright)

#### 페이지 테스트
```typescript
// tests/e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('상품 관리', () => {
  test('상품 목록 페이지가 올바르게 로드된다', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('h1')).toContainText('상품 목록');
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible();
  });

  test('상품 검색이 작동한다', async ({ page }) => {
    await page.goto('/products');
    
    await page.fill('[data-testid="search-input"]', '테스트');
    await page.click('[data-testid="search-button"]');
    
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(1);
  });

  test('상품 추가 폼이 작동한다', async ({ page }) => {
    await page.goto('/products/add');
    
    await page.fill('[data-testid="product-name"]', '새 상품');
    await page.fill('[data-testid="product-price"]', '10000');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

### 테스트 실행
```bash
# 단위 테스트 실행
npm test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:coverage
```

---

##  배포 가이드

### Vercel 배포

#### 1. Vercel 프로젝트 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_USE_MOCKS production
```

#### 2. GitHub Actions 설정
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitHub Pages 배포

#### 1. 정적 사이트 생성
```bash
# 정적 사이트 빌드
npm run build
npm run export

# GitHub Pages에 배포
npm run deploy
```

#### 2. 자동 배포 설정
```json
// package.json
{
  "scripts": {
    "deploy": "gh-pages -d out"
  }
}
```

### 환경별 설정

#### 개발 환경
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCKS=1
NEXT_PUBLIC_ENV=development
```

#### 프로덕션 환경
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.fulgo.com
NEXT_PUBLIC_USE_MOCKS=0
NEXT_PUBLIC_ENV=production
```

---

## 📚 추가 자료

### 유용한 링크
- [React 공식 문서](https://react.dev/)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

### 코드 스타일 가이드
- ESLint 설정: `.eslintrc.js`
- Prettier 설정: `.prettierrc`
- TypeScript 설정: `tsconfig.json`

### 성능 최적화
- 이미지 최적화: `next/image` 사용
- 코드 분할: 동적 import 사용
- 번들 분석: `@next/bundle-analyzer` 사용

---

**마지막 업데이트**: 2025년 1월 1일  
**문서 버전**: v1.0  
**작성자**: FULGO 개발팀
