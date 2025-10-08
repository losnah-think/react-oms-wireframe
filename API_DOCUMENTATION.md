# FULGO OMS API 문서

## 📋 목차
1. [API 개요](#api-개요)
2. [인증](#인증)
3. [상품 API](#상품-api)
4. [사용자 API](#사용자-api)
5. [거래처 API](#거래처-api)
6. [환경설정 API](#환경설정-api)
7. [오류 처리](#오류-처리)
8. [예제](#예제)

---

##  API 개요

FULGO OMS API는 RESTful 아키텍처를 따르며, JSON 형식으로 데이터를 주고받습니다.

### 기본 정보
- **Base URL**: `https://api.fulgo.com/v1`
- **Content-Type**: `application/json`
- **인증 방식**: Bearer Token
- **응답 형식**: JSON

### 공통 헤더
```http
Content-Type: application/json
Authorization: Bearer {access_token}
Accept: application/json
```

### 공통 응답 형식
```json
{
  "success": true,
  "data": {},
  "message": "성공",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## 🔐 인증

### 로그인
```http
POST /auth/login
```

**요청 본문:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "홍길동",
      "role": "admin"
    }
  },
  "message": "로그인 성공"
}
```

### 토큰 갱신
```http
POST /auth/refresh
```

**요청 본문:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 로그아웃
```http
POST /auth/logout
```

---

## 📦 상품 API

### 상품 목록 조회
```http
GET /products
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)
- `search`: 검색어
- `category`: 카테고리 ID
- `brand`: 브랜드 ID
- `status`: 상품 상태 (active, inactive, out_of_stock)
- `sort`: 정렬 기준 (name, price, created_at)
- `order`: 정렬 순서 (asc, desc)

**응답:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "1",
        "name": "나이키 에어맥스",
        "code": "NK-AM-001",
        "brand": "나이키",
        "category": "신발",
        "price": 120000,
        "cost": 80000,
        "stock": 50,
        "status": "active",
        "images": ["image1.jpg", "image2.jpg"],
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 상품 상세 조회
```http
GET /products/{id}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "나이키 에어맥스",
    "code": "NK-AM-001",
    "description": "편안한 착용감의 운동화",
    "brand": "나이키",
    "category": "신발",
    "price": 120000,
    "cost": 80000,
    "stock": 50,
    "status": "active",
    "images": ["image1.jpg", "image2.jpg"],
    "variants": [
      {
        "id": "1-1",
        "name": "블랙/270",
        "sku": "NK-AM-001-BK-270",
        "price": 120000,
        "stock": 25,
        "attributes": {
          "color": "블랙",
          "size": "270"
        }
      }
    ],
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

### 상품 생성
```http
POST /products
```

**요청 본문:**
```json
{
  "name": "나이키 에어맥스",
  "code": "NK-AM-001",
  "description": "편안한 착용감의 운동화",
  "brand": "나이키",
  "category": "신발",
  "price": 120000,
  "cost": 80000,
  "stock": 50,
  "images": ["image1.jpg", "image2.jpg"],
  "variants": [
    {
      "name": "블랙/270",
      "sku": "NK-AM-001-BK-270",
      "price": 120000,
      "stock": 25,
      "attributes": {
        "color": "블랙",
        "size": "270"
      }
    }
  ]
}
```

### 상품 수정
```http
PUT /products/{id}
```

**요청 본문:**
```json
{
  "name": "나이키 에어맥스 업데이트",
  "price": 130000,
  "stock": 60
}
```

### 상품 삭제
```http
DELETE /products/{id}
```

### 상품 일괄 수정
```http
PUT /products/bulk
```

**요청 본문:**
```json
{
  "updates": [
    {
      "id": "1",
      "price": 130000,
      "stock": 60
    },
    {
      "id": "2",
      "status": "inactive"
    }
  ]
}
```

### CSV 상품 등록
```http
POST /products/import/csv
```

**요청 본문 (multipart/form-data):**
- `file`: CSV 파일
- `mapping`: 필드 매핑 정보

**응답:**
```json
{
  "success": true,
  "data": {
    "import_id": "import_123",
    "total_rows": 100,
    "processed_rows": 95,
    "errors": [
      {
        "row": 5,
        "field": "price",
        "message": "가격은 숫자여야 합니다"
      }
    ]
  }
}
```

---

## 👥 사용자 API

### 사용자 목록 조회
```http
GET /users
```

**쿼리 파라미터:**
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `search`: 검색어
- `role`: 사용자 역할
- `status`: 사용자 상태

**응답:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "name": "홍길동",
        "email": "hong@example.com",
        "role": "admin",
        "department": "개발팀",
        "status": "active",
        "last_login": "2025-01-01T00:00:00Z",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 사용자 생성
```http
POST /users
```

**요청 본문:**
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "password": "password123",
  "role": "admin",
  "department": "개발팀"
}
```

### 사용자 수정
```http
PUT /users/{id}
```

### 사용자 삭제
```http
DELETE /users/{id}
```

### 권한 관리
```http
GET /roles
POST /roles
PUT /roles/{id}
DELETE /roles/{id}
```

---

## 🏢 거래처 API

### 판매처 목록 조회
```http
GET /vendors
```

**응답:**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "1",
        "name": "쿠팡",
        "platform": "coupang",
        "status": "연동중",
        "product_count": 150,
        "category_count": 25,
        "last_sync": "2025-01-01T00:00:00Z",
        "sync_progress": 100
      }
    ]
  }
}
```

### 판매처 연동 설정
```http
POST /vendors/{id}/integrate
```

**요청 본문:**
```json
{
  "api_key": "your_api_key",
  "api_secret": "your_api_secret",
  "sync_schedule": {
    "type": "daily",
    "time": "09:00"
  }
}
```

### 판매처 상품 동기화
```http
POST /vendors/{id}/sync
```

### 카테고리 매핑
```http
GET /vendors/{id}/category-mappings
POST /vendors/{id}/category-mappings
PUT /vendors/{id}/category-mappings/{mapping_id}
DELETE /vendors/{id}/category-mappings/{mapping_id}
```

---

##  환경설정 API

### 외부 연동 설정
```http
GET /settings/integrations
PUT /settings/integrations
```

### 상품 그룹 관리
```http
GET /settings/product-groups
POST /settings/product-groups
PUT /settings/product-groups/{id}
DELETE /settings/product-groups/{id}
```

### 상품 카테고리 관리
```http
GET /settings/categories
POST /settings/categories
PUT /settings/categories/{id}
DELETE /settings/categories/{id}
```

### 브랜드 관리
```http
GET /settings/brands
POST /settings/brands
PUT /settings/brands/{id}
DELETE /settings/brands/{id}
```

---

##  오류 처리

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `422`: 유효성 검사 실패
- `500`: 서버 오류

### 오류 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 데이터가 유효하지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "올바른 이메일 형식이 아닙니다"
      }
    ]
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 오류 코드 목록
- `VALIDATION_ERROR`: 유효성 검사 실패
- `AUTHENTICATION_ERROR`: 인증 실패
- `AUTHORIZATION_ERROR`: 권한 없음
- `NOT_FOUND`: 리소스 없음
- `DUPLICATE_ERROR`: 중복 데이터
- `EXTERNAL_API_ERROR`: 외부 API 오류
- `INTERNAL_ERROR`: 내부 서버 오류

---

##  예제

### JavaScript/TypeScript 예제

#### 상품 목록 조회
```typescript
const fetchProducts = async (filters: ProductFilters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  
  const response = await fetch(`/api/products?${params}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('상품 목록을 가져오는데 실패했습니다');
  }
  
  return response.json();
};
```

#### 상품 생성
```typescript
const createProduct = async (productData: CreateProductRequest) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

### cURL 예제

#### 상품 목록 조회
```bash
curl -X GET "https://api.fulgo.com/v1/products?page=1&limit=20" \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json"
```

#### 상품 생성
```bash
curl -X POST "https://api.fulgo.com/v1/products" \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "나이키 에어맥스",
    "code": "NK-AM-001",
    "price": 120000,
    "stock": 50
  }'
```

### Python 예제

```python
import requests

class FULGOClient:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def get_products(self, page=1, limit=20, **filters):
        params = {'page': page, 'limit': limit}
        params.update(filters)
        
        response = requests.get(
            f'{self.base_url}/products',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def create_product(self, product_data):
        response = requests.post(
            f'{self.base_url}/products',
            headers=self.headers,
            json=product_data
        )
        response.raise_for_status()
        return response.json()

# 사용 예제
client = FULGOClient('https://api.fulgo.com/v1', 'your_access_token')
products = client.get_products(search='나이키')
```

---

## 🔄 웹훅

### 웹훅 이벤트
- `product.created`: 상품 생성
- `product.updated`: 상품 수정
- `product.deleted`: 상품 삭제
- `order.created`: 주문 생성
- `order.updated`: 주문 수정
- `vendor.sync.completed`: 판매처 동기화 완료

### 웹훅 설정
```http
POST /webhooks
```

**요청 본문:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["product.created", "product.updated"],
  "secret": "your_webhook_secret"
}
```

---

##  Rate Limiting

### 제한 사항
- **일반 API**: 1000 requests/hour
- **인증 API**: 100 requests/hour
- **파일 업로드**: 10 requests/hour

### 헤더 정보
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 🔒 보안

### HTTPS 필수
모든 API 요청은 HTTPS를 통해 이루어져야 합니다.

### 토큰 관리
- Access Token: 1시간 유효
- Refresh Token: 30일 유효
- 토큰은 안전하게 저장하고 전송해야 합니다

### 권한 확인
각 API 엔드포인트는 적절한 권한이 필요합니다.

---

**마지막 업데이트**: 2025년 1월 1일  
**API 버전**: v1.0  
**작성자**: FULGO 개발팀
