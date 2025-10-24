# OMS-WMS API Documentation

## Overview
이 문서는 OMS-WMS(Order Management System - Warehouse Management System) 통합 시스템의 API 엔드포인트를 설명합니다.

**Base URL**: `/api`

## Authentication
현재 인증 메커니즘이 없습니다. (개발/데모용)

---

## API Endpoints

### 1. Get All Inbound Requests
모든 입고 요청을 조회합니다.

```
GET /api/inbound-requests
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PO-2024-001",
      "poNumber": "PO-2024-001",
      "supplierName": "ABC Supplier Co.",
      "items": [
        {
          "id": "item-001",
          "skuCode": "SKU-001",
          "productName": "상품명 A",
          "quantity": 100,
          "unit": "EA"
        }
      ],
      "requestDate": "2024-10-20",
      "expectedDate": "2024-10-25",
      "approvalStatus": "승인완료",
      "memo": "우선 처리 요청"
    }
  ],
  "count": 3
}
```

**Status Codes:**
- `200`: 성공
- `500`: 서버 오류

---

### 2. Create Inbound Request
새로운 입고 요청을 생성합니다.

```
POST /api/inbound-requests
Content-Type: application/json
```

**Request Body:**
```json
{
  "poNumber": "PO-2024-004",
  "supplierName": "New Supplier Ltd.",
  "items": [
    {
      "id": "item-1",
      "skuCode": "SKU-006",
      "productName": "New Product",
      "quantity": 100,
      "unit": "EA"
    }
  ],
  "requestDate": "2024-10-23",
  "expectedDate": "2024-10-28",
  "memo": "Optional memo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inbound request created successfully",
  "data": {
    "id": "PO-1761280878441",
    "poNumber": "PO-2024-004",
    "supplierName": "New Supplier Ltd.",
    "items": [
      {
        "id": "item-1",
        "skuCode": "SKU-006",
        "productName": "New Product",
        "quantity": 100,
        "unit": "EA"
      }
    ],
    "requestDate": "2024-10-23",
    "expectedDate": "2024-10-28",
    "approvalStatus": "승인대기",
    "memo": "Optional memo"
  }
}
```

**Status Codes:**
- `201`: 요청 생성됨
- `400`: 필수 필드 누락
- `500`: 서버 오류

**Required Fields:**
- `poNumber`: 발주번호
- `supplierName`: 공급업체명
- `items`: 상품 배열 (최소 1개)

---

### 3. Get Inbound Request Status
특정 입고 요청의 상태를 조회합니다.

```
GET /api/inbound-status/{id}
```

**Path Parameters:**
- `id`: 입고 요청 ID (예: PO-2024-001)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PO-2024-001",
    "status": "승인완료",
    "updatedAt": "2025-10-24T04:41:13.722Z",
    "reason": "우선 처리 요청",
    "requestDetails": {
      "id": "PO-2024-001",
      "poNumber": "PO-2024-001",
      "supplierName": "ABC Supplier Co.",
      "items": [
        {
          "id": "item-001",
          "skuCode": "SKU-001",
          "productName": "상품명 A",
          "quantity": 100,
          "unit": "EA"
        }
      ],
      "requestDate": "2024-10-20",
      "expectedDate": "2024-10-25",
      "approvalStatus": "승인완료",
      "memo": "우선 처리 요청"
    }
  }
}
```

**Status Codes:**
- `200`: 성공
- `404`: 요청을 찾을 수 없음
- `500`: 서버 오류

---

### 4. Update Inbound Request Status
입고 요청의 상태를 업데이트합니다.

```
PATCH /api/inbound-status/{id}
Content-Type: application/json
```

**Path Parameters:**
- `id`: 입고 요청 ID (예: PO-2024-001)

**Request Body:**
```json
{
  "status": "승인완료",
  "reason": "Optional reason/memo"
}
```

**Valid Status Values:**
- `승인대기`: 승인 대기 중
- `승인완료`: 승인됨
- `반려됨`: 거절됨
- `입고완료`: 입고 완료

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "id": "PO-2024-002",
    "status": "승인완료",
    "updatedAt": "2025-10-24T04:41:22.819Z",
    "reason": "승인되었습니다"
  }
}
```

**Status Codes:**
- `200`: 성공
- `400`: 필수 필드 누락 또는 잘못된 상태
- `404`: 요청을 찾을 수 없음
- `500`: 서버 오류

---

### 5. Delete Inbound Request
입고 요청을 삭제합니다.

```
DELETE /api/inbound-status/{id}
```

**Path Parameters:**
- `id`: 입고 요청 ID (예: PO-2024-001)

**Response:**
```json
{
  "success": true,
  "message": "Inbound request deleted successfully"
}
```

**Status Codes:**
- `200`: 성공
- `404`: 요청을 찾을 수 없음
- `500`: 서버 오류

---

## Approval Status (ApprovalStatus)

| 상태 | 설명 | 색상 코드 |
|------|------|---------|
| 승인대기 | 승인 대기 중 | #C4C4C4 (Gray) |
| 승인완료 | 승인됨 | #4CAF50 (Green) |
| 반려됨 | 거절됨 | #F44336 (Red) |
| 입고완료 | 입고 완료 | #2196F3 (Blue) |

---

## Error Responses

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Missing required fields | 필수 필드가 누락되었습니다 |
| 400 | Invalid status | 잘못된 상태값입니다 |
| 404 | Inbound request not found | 요청을 찾을 수 없습니다 |
| 500 | Failed to [operation] | 서버 오류가 발생했습니다 |

---

## Data Models

### InboundRequest
```typescript
{
  id: string;                    // 요청 ID (자동 생성)
  poNumber: string;              // 발주번호
  supplierName: string;          // 공급업체명
  items: InboundItem[];          // 상품 배열
  requestDate: string;           // 요청 날짜 (YYYY-MM-DD)
  expectedDate: string;          // 예정 입고일 (YYYY-MM-DD)
  approvalStatus: ApprovalStatus; // 승인 상태
  memo?: string;                 // 메모/비고
}
```

### InboundItem
```typescript
{
  id: string;           // 항목 ID
  skuCode: string;      // SKU 코드
  productName: string;  // 상품명
  quantity: number;     // 수량
  unit: string;        // 단위 (EA, BOX, PALLET 등)
}
```

### InboundStatusResponse
```typescript
{
  id: string;                    // 요청 ID
  status: ApprovalStatus;        // 승인 상태
  updatedAt: string;             // 업데이트 시간 (ISO 8601)
  reason?: string;               // 사유/메모
  requestDetails?: InboundRequest; // 전체 요청 정보
}
```

---

## Usage Examples

### JavaScript/Fetch

```javascript
// 1. 모든 요청 조회
const requests = await fetch('/api/inbound-requests')
  .then(res => res.json());

// 2. 새 요청 생성
const newRequest = await fetch('/api/inbound-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    poNumber: 'PO-2024-005',
    supplierName: 'Supplier Name',
    items: [
      {
        id: 'item-1',
        skuCode: 'SKU-001',
        productName: 'Product Name',
        quantity: 50,
        unit: 'EA'
      }
    ]
  })
}).then(res => res.json());

// 3. 상태 조회
const status = await fetch('/api/inbound-status/PO-2024-001')
  .then(res => res.json());

// 4. 상태 업데이트
const updated = await fetch('/api/inbound-status/PO-2024-001', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: '승인완료',
    reason: 'Approved'
  })
}).then(res => res.json());

// 5. 요청 삭제
const deleted = await fetch('/api/inbound-status/PO-2024-001', {
  method: 'DELETE'
}).then(res => res.json());
```

### cURL

```bash
# 1. 모든 요청 조회
curl http://localhost:3000/api/inbound-requests

# 2. 새 요청 생성
curl -X POST http://localhost:3000/api/inbound-requests \
  -H "Content-Type: application/json" \
  -d '{"poNumber":"PO-2024-005","supplierName":"Supplier","items":[...]}'

# 3. 상태 조회
curl http://localhost:3000/api/inbound-status/PO-2024-001

# 4. 상태 업데이트
curl -X PATCH http://localhost:3000/api/inbound-status/PO-2024-001 \
  -H "Content-Type: application/json" \
  -d '{"status":"승인완료"}'

# 5. 요청 삭제
curl -X DELETE http://localhost:3000/api/inbound-status/PO-2024-001
```

---

## Implementation Details

### Database
현재 구현은 **인메모리 데이터베이스**를 사용합니다. 
실제 프로덕션 환경에서는 다음과 같은 데이터베이스로 교체하세요:
- PostgreSQL
- MySQL
- MongoDB
- DynamoDB

파일 위치: `app/lib/db.ts`

### File Structure
```
app/
├── api/
│   ├── inbound-requests/
│   │   └── route.ts           # GET, POST
│   └── inbound-status/
│       └── [id]/
│           └── route.ts       # GET, PATCH, DELETE
├── lib/
│   └── db.ts                  # In-memory database
├── services/
│   └── inboundAPI.ts          # API client (for frontend)
└── types/
    └── inbound.ts             # TypeScript types
```

### Supported Languages
- **Korean (ko)**: `/ko/`
- **English (en)**: `/en/`
- **Vietnamese (vi)**: `/vi/`

Access the app at:
- `http://localhost:3000/ko` - Korean
- `http://localhost:3000/en` - English
- `http://localhost:3000/vi` - Vietnamese

---

## Future Enhancements

- [ ] Authentication & Authorization
- [ ] Pagination for list endpoints
- [ ] Search/Filter capabilities
- [ ] Batch operations
- [ ] File upload support
- [ ] Webhook notifications
- [ ] Rate limiting
- [ ] API versioning
- [ ] Request logging & monitoring
- [ ] Email notifications

---

## Support

For issues or questions, please create an issue in the repository:
https://github.com/losnah-think/react-oms-wireframe/issues

---

**Last Updated**: 2024-10-24  
**Version**: 1.0.0  
**Status**: Development
