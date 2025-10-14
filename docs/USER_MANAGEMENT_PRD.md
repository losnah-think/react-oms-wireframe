# 사용자 관리 시스템 PRD (Product Requirements Document)

## 문서 정보
- **작성일**: 2025년 10월 14일
- **버전**: 1.0
- **작성자**: 플고물류 개발팀
- **상태**: 초안

---

## 1. 개요

### 1.1 목적
OMS(Order Management System)를 사용하는 조직 내 사용자를 효율적으로 관리하고, 적절한 권한을 부여하여 시스템의 보안성과 사용성을 확보합니다.

### 1.2 범위
- 사용자 생성, 수정, 삭제 (CRUD)
- 권한 관리 (관리자, 매니저, 일반 사용자)
- 활동 로그 기록 및 조회
- 사용자 검색 및 필터링

### 1.3 목표
- **단순성**: 복잡한 UI 없이 직관적이고 실용적인 인터페이스
- **신뢰성**: 서버 타임스탬프 기반의 정확한 활동 로그
- **확장성**: 향후 조직/부서 관리, 세밀한 권한 관리로 확장 가능
- **보안성**: 모든 사용자 활동 추적 및 감사

---

## 2. 사용자 스토리

### 2.1 관리자
```
AS A 시스템 관리자
I WANT TO 사용자를 추가/수정/삭제하고 권한을 설정할 수 있다
SO THAT 조직의 인원 변동에 맞춰 시스템 접근을 관리할 수 있다
```

**인수 기준**:
- [ ] 사용자 이름, 이메일, 권한, 부서, 연락처를 입력하여 생성 가능
- [ ] 기존 사용자 정보 수정 가능
- [ ] 사용자 삭제 가능 (확인 프롬프트 포함)
- [ ] 권한 변경 시 즉시 반영됨

### 2.2 감사자
```
AS A 감사 담당자
I WANT TO 모든 사용자의 활동 이력을 조회할 수 있다
SO THAT 보안 감사 및 문제 추적이 가능하다
```

**인수 기준**:
- [ ] 모든 사용자 활동이 서버 타임스탬프로 정확히 기록됨
- [ ] 카테고리별 (인증, 상품, 판매처, 설정 등) 필터링 가능
- [ ] 날짜 범위로 검색 가능
- [ ] 로그를 CSV로 내보내기 가능
- [ ] 변경 전/후 상세 정보 확인 가능

### 2.3 일반 사용자
```
AS A 일반 사용자
I WANT TO 내 프로필 정보를 확인할 수 있다
SO THAT 내 계정 정보가 정확한지 확인할 수 있다
```

**인수 기준**:
- [ ] 자신의 이름, 이메일, 부서, 연락처 조회 가능
- [ ] 마지막 로그인 시간 확인 가능
- [ ] (향후) 비밀번호 변경 가능

---

## 3. 기능 요구사항

### 3.1 사용자 관리 (CRUD)

#### 3.1.1 사용자 목록 조회
**요구사항**:
- 테이블 형식으로 사용자 목록 표시
- 표시 정보: 이름, 이메일, 권한, 부서, 연락처, 마지막 로그인
- 페이지당 10~50개 사용자 표시

**UI 구성**:
```
┌─────────────────────────────────────────────────────┐
│  사용자 관리                                          │
│  시스템 사용자를 관리합니다                             │
├─────────────────────────────────────────────────────┤
│  [검색창: 이름, 이메일, 부서]  [전체 권한 ▼]  [+ 사용자 추가] │
├─────────────────────────────────────────────────────┤
│  📊 통계                                             │
│  전체: 12명  │  관리자: 2명  │  일반: 10명              │
├─────────────────────────────────────────────────────┤
│  사용자  │  권한  │  부서  │  연락처  │  마지막 로그인  │  작업  │
│  ────────┼────────┼────────┼────────┼──────────┼────── │
│  김철수   │ 관리자 │ IT팀   │ 010-… │ 2025-10-14│ 수정 삭제│
│  이영희   │ 매니저 │ 마케팅 │ 010-… │ 2025-10-14│ 수정 삭제│
│  박민수   │ 일반   │ 영업   │ 010-… │ 2025-10-13│ 수정 삭제│
└─────────────────────────────────────────────────────┘
```

#### 3.1.2 사용자 추가
**필수 입력 필드**:
- 이름 (text, required, 2~50자)
- 이메일 (email, required, 유효성 검증, 중복 불가)
- 권한 (select, required, 기본값: 일반)
  - 관리자
  - 매니저
  - 일반

**선택 입력 필드**:
- 부서 (text, optional, 50자 이내)
- 연락처 (text, optional, 전화번호 형식)

**검증 규칙**:
- 이메일 형식: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- 이메일 중복 확인
- 이름 최소 2자 이상

**모달 UI**:
```
┌─────────────────────────────────┐
│  사용자 추가               ✕     │
├─────────────────────────────────┤
│  이름 *                         │
│  [홍길동________________]        │
│                                 │
│  이메일 *                        │
│  [hong@example.com______]       │
│                                 │
│  권한                            │
│  [일반 ▼]                       │
│                                 │
│  부서                            │
│  [IT팀__________________]        │
│                                 │
│  연락처                          │
│  [010-1234-5678_________]        │
│                                 │
├─────────────────────────────────┤
│              [취소]  [저장]      │
└─────────────────────────────────┘
```

#### 3.1.3 사용자 수정
**수정 가능 필드**:
- 이름
- 이메일 (중복 확인)
- 권한
- 부서
- 연락처

**제약사항**:
- 자기 자신의 권한은 변경 불가
- 마지막 관리자는 삭제/권한 변경 불가

#### 3.1.4 사용자 삭제
**프로세스**:
1. 삭제 버튼 클릭
2. 확인 다이얼로그 표시: "김철수 사용자를 삭제하시겠습니까?"
3. 확인 시 삭제 실행
4. 활동 로그에 기록

**제약사항**:
- 자기 자신은 삭제 불가
- 마지막 관리자는 삭제 불가
- (향후) 삭제 대신 비활성화 옵션 제공

### 3.2 검색 및 필터링

#### 3.2.1 통합 검색
**검색 대상**:
- 이름
- 이메일
- 부서

**검색 동작**:
- 실시간 검색 (입력 중 필터링)
- 대소문자 무시
- 부분 일치

#### 3.2.2 권한 필터
**옵션**:
- 전체 권한 (기본값)
- 관리자
- 매니저
- 일반

**동작**:
- 드롭다운 선택 시 즉시 필터링
- 검색과 조합 가능

### 3.3 통계 표시

**표시 정보**:
- 전체 사용자 수
- 관리자 수
- 일반 사용자 수

**업데이트**:
- 사용자 추가/삭제/수정 시 자동 재계산
- 필터 적용 시 전체 통계는 유지 (필터링된 결과만 표시)

---

## 4. 활동 로그 시스템

### 4.1 로그 기록

#### 4.1.1 기록 대상 활동
**인증**:
- `login`: 로그인
- `logout`: 로그아웃
- `login_failed`: 로그인 실패

**사용자 관리**:
- `user_create`: 사용자 생성
- `user_update`: 사용자 수정
- `user_delete`: 사용자 삭제
- `user_password_reset`: 비밀번호 초기화

**상품 관리**:
- `product_create`: 상품 등록
- `product_update`: 상품 수정
- `product_delete`: 상품 삭제
- `product_send`: 상품 송신
- `product_bulk_create`: 상품 대량등록
- `product_bulk_update`: 상품 대량수정
- `product_import`: 상품 가져오기
- `product_export`: 상품 내보내기

**판매처 관리**:
- `vendor_create`: 판매처 등록
- `vendor_update`: 판매처 수정
- `vendor_delete`: 판매처 삭제
- `vendor_info_update`: 판매처 정보 수정
- `vendor_category_map`: 카테고리 매핑

**환경설정**:
- `settings_update`: 설정 변경
- `settings_brand_create`: 브랜드 생성
- `settings_category_create`: 카테고리 생성

**외부연동**:
- `integration_create`: 연동 생성
- `integration_update`: 연동 수정
- `integration_delete`: 연동 삭제
- `integration_sync`: 연동 동기화

#### 4.1.2 로그 데이터 구조
```typescript
interface LogEntry {
  id: string;                    // 고유 ID (자동 생성)
  timestamp: string;             // 서버 타임스탬프 (자동 생성, 조작 불가)
  userId: string;                // 사용자 ID
  userName: string;              // 사용자 이름
  category: LogCategory;         // 카테고리
  action: LogAction;             // 액션
  target: string;                // 대상 (예: "상품", "판매처")
  targetId?: string;             // 대상 ID
  description: string;           // 간단한 설명
  details?: Record<string, any>; // 상세 정보 (변경 전/후 등)
  level: 'info' | 'warning' | 'error'; // 레벨
  ipAddress?: string;            // IP 주소
  userAgent?: string;            // User Agent
}
```

#### 4.1.3 타임스탬프 보장
**요구사항**:
- 모든 로그는 서버 시간으로 기록됨
- 클라이언트에서 타임스탬프를 전송하지 않음
- DB 기본값으로 `CURRENT_TIMESTAMP` 사용
- 조작 불가능하며 감사 추적 가능

**DB 스키마**:
```sql
CREATE TABLE activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 서버 시간 자동 생성
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  target_id VARCHAR(255),
  description TEXT NOT NULL,
  details TEXT,                    -- JSON 문자열
  level VARCHAR(20) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_id (user_id),
  INDEX idx_category (category),
  INDEX idx_action (action)
);
```

### 4.2 로그 조회

#### 4.2.1 로그 목록 화면
**UI 구성**:
```
┌─────────────────────────────────────────────────────────┐
│  활동 로그                                                │
│  모든 사용자 활동이 서버 시간 기준으로 기록됩니다            │
├─────────────────────────────────────────────────────────┤
│  [전체 카테고리 ▼] [전체 레벨 ▼] [시작일] [종료일] [CSV 내보내기] │
│  [검색창: 사용자, 액션, 설명]                [검색]          │
├─────────────────────────────────────────────────────────┤
│  📊 통계                                                 │
│  전체: 1,234건 │ 정보: 1,100 │ 경고: 120 │ 오류: 14      │
├─────────────────────────────────────────────────────────┤
│  시간 │ 사용자 │ 카테고리 │ 액션 │ 대상 │ 설명 │ 레벨 │ 상세 │
│  ────┼────────┼────────┼─────┼─────┼─────┼─────┼───── │
│  10:30│ 김철수  │ 상품    │등록  │상품   │...  │정보  │보기 │
│  10:25│ 이영희  │ 판매처  │수정  │판매처 │...  │정보  │보기 │
│  10:20│ 박민수  │ 인증    │실패  │시스템 │...  │경고  │보기 │
└─────────────────────────────────────────────────────────┘
│  [이전] 1 / 25 [다음]                                     │
└─────────────────────────────────────────────────────────┘
```

#### 4.2.2 필터링 옵션
**카테고리 필터**:
- 전체 카테고리 (기본값)
- 인증
- 사용자
- 상품
- 판매처
- 주문
- 설정
- 연동
- 시스템

**레벨 필터**:
- 전체 레벨 (기본값)
- 정보 (info)
- 경고 (warning)
- 오류 (error)

**날짜 범위**:
- 시작일 (date picker)
- 종료일 (date picker)
- 빈 값 = 제한 없음

#### 4.2.3 검색
**검색 대상**:
- 사용자 이름
- 대상 (target)
- 설명 (description)
- 액션

**검색 동작**:
- Enter 키 또는 검색 버튼 클릭 시 실행
- 대소문자 무시
- 부분 일치

#### 4.2.4 로그 상세 모달
**표시 정보**:
- 서버 타임스탬프 (년-월-일 시:분:초)
- 사용자 ID 및 이름
- 카테고리 및 액션 (한글 레이블)
- 대상 및 대상 ID
- 설명
- 레벨 (색상 코딩)
- IP 주소
- User Agent
- 상세 정보 (JSON 포맷)

**상세 정보 예시**:
```json
{
  "productName": "티셔츠",
  "changes": {
    "price": {
      "from": 29000,
      "to": 35000
    },
    "stock": {
      "from": 100,
      "to": 150
    }
  }
}
```

#### 4.2.5 CSV 내보내기
**포함 컬럼**:
1. ID
2. 시간
3. 사용자
4. 카테고리
5. 액션
6. 대상
7. 대상 ID
8. 설명
9. 레벨
10. IP 주소

**파일명 형식**: `logs_[timestamp].csv`  
**인코딩**: UTF-8 BOM (Excel 호환)

### 4.3 로그 보존 정책

#### 4.3.1 보존 기간
- **기본**: 1년
- **보안 이벤트** (로그인 실패, 권한 변경): 3년
- **중요 변경** (삭제, 대량 작업): 3년

#### 4.3.2 아카이빙
- 1년 경과한 로그는 별도 테이블로 이동
- 압축 저장
- 필요 시 복원 가능

#### 4.3.3 삭제 정책
- 관리자도 로그 삭제 불가 (보안 감사용)
- 시스템 유지보수 목적으로만 삭제 가능
- 삭제 시 별도 감사 로그 생성

---

## 5. 비기능 요구사항

### 5.1 성능
- **사용자 목록 로딩**: 1초 이내
- **검색 결과**: 500ms 이내
- **로그 조회**: 페이지당 50개 기준 2초 이내
- **CSV 내보내기**: 10,000건 기준 10초 이내

### 5.2 확장성
- **사용자 수**: 1,000명까지 지원
- **로그 레코드**: 1,000만 건까지 조회 가능
- **동시 사용자**: 100명

### 5.3 보안
- **인증**: 세션 기반 인증 (NextAuth.js)
- **비밀번호**: bcrypt 해싱 (salt rounds: 10)
- **세션 타임아웃**: 24시간
- **HTTPS**: 프로덕션 환경 필수
- **SQL Injection**: Prisma ORM으로 방어
- **XSS**: React 기본 이스케이핑

### 5.4 가용성
- **목표 가동률**: 99.5% (연 43.8시간 다운타임)
- **백업**: 일 1회 자동 백업
- **복구 시간 목표 (RTO)**: 4시간
- **복구 지점 목표 (RPO)**: 24시간

### 5.5 사용성
- **학습 시간**: 신규 사용자 30분 이내
- **모바일 반응형**: 태블릿 이상 지원 (768px+)
- **브라우저 지원**: Chrome, Edge, Safari (최신 2개 버전)
- **접근성**: WCAG 2.1 Level A

---

## 6. 기술 스택

### 6.1 프론트엔드
- **프레임워크**: Next.js 15.5+ (React 18+)
- **언어**: TypeScript 5.0+
- **스타일링**: Tailwind CSS 3.0+
- **상태 관리**: React Hooks (useState, useEffect)
- **폼 검증**: 기본 HTML5 검증 + 커스텀 로직

### 6.2 백엔드
- **API**: Next.js API Routes
- **ORM**: Prisma 5.0+
- **데이터베이스**: PostgreSQL 14+
- **인증**: NextAuth.js 4.0+

### 6.3 인프라
- **호스팅**: Vercel / AWS
- **데이터베이스**: AWS RDS / Supabase
- **파일 저장**: AWS S3 (CSV 내보내기)
- **모니터링**: Sentry (에러 추적)

---

## 7. API 명세

### 7.1 사용자 관리 API

#### GET /api/users
**설명**: 사용자 목록 조회

**Query Parameters**:
- `search` (string, optional): 검색어
- `role` (string, optional): 권한 필터
- `page` (number, optional): 페이지 번호 (기본값: 1)
- `limit` (number, optional): 페이지 크기 (기본값: 10)

**Response**:
```json
{
  "users": [
    {
      "id": "user-001",
      "name": "김철수",
      "email": "kim@fulgo.com",
      "role": "관리자",
      "department": "IT팀",
      "phone": "010-1234-5678",
      "lastLogin": "2025-10-14T09:30:00Z",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "totalPages": 2
}
```

#### POST /api/users
**설명**: 사용자 생성

**Request Body**:
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "role": "일반",
  "department": "IT팀",
  "phone": "010-9876-5432"
}
```

**Response**:
```json
{
  "id": "user-013",
  "name": "홍길동",
  "email": "hong@example.com",
  "role": "일반",
  "department": "IT팀",
  "phone": "010-9876-5432",
  "createdAt": "2025-10-14T10:00:00Z"
}
```

**Error Responses**:
- `400`: 필수 필드 누락 / 이메일 형식 오류
- `409`: 이메일 중복
- `500`: 서버 오류

#### PUT /api/users/:id
**설명**: 사용자 수정

**Request Body**:
```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "role": "매니저",
  "department": "마케팅팀",
  "phone": "010-9876-5432"
}
```

**Response**: 수정된 사용자 객체

#### DELETE /api/users/:id
**설명**: 사용자 삭제

**Response**:
```json
{
  "success": true,
  "message": "사용자가 삭제되었습니다"
}
```

**Error Responses**:
- `400`: 자기 자신 삭제 시도 / 마지막 관리자 삭제 시도
- `404`: 사용자 없음
- `500`: 서버 오류

### 7.2 활동 로그 API

#### POST /api/logs
**설명**: 로그 생성 (내부 사용, 서버 타임스탬프 자동 생성)

**Request Body**:
```json
{
  "userId": "user-001",
  "userName": "김철수",
  "category": "product",
  "action": "product_create",
  "target": "상품",
  "targetId": "PROD-001",
  "description": "상품 등록: 티셔츠",
  "details": {
    "productName": "티셔츠",
    "price": 29000
  },
  "level": "info"
}
```

**Response**:
```json
{
  "id": "log-001",
  "timestamp": "2025-10-14T10:30:15.123Z",
  "userId": "user-001",
  "userName": "김철수",
  "category": "product",
  "action": "product_create",
  "target": "상품",
  "targetId": "PROD-001",
  "description": "상품 등록: 티셔츠",
  "details": {...},
  "level": "info",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

#### GET /api/logs
**설명**: 로그 목록 조회

**Query Parameters**:
- `category` (string, optional): 카테고리 필터
- `level` (string, optional): 레벨 필터
- `userId` (string, optional): 사용자 ID 필터
- `startDate` (string, optional): 시작일 (ISO 8601)
- `endDate` (string, optional): 종료일 (ISO 8601)
- `search` (string, optional): 검색어
- `page` (number, optional): 페이지 번호 (기본값: 1)
- `limit` (number, optional): 페이지 크기 (기본값: 50)

**Response**:
```json
{
  "logs": [...],
  "total": 1234,
  "page": 1,
  "totalPages": 25
}
```

#### GET /api/logs/search
**설명**: 로그 검색

**Query Parameters**:
- `q` (string, required): 검색어
- `category` (string, optional): 카테고리 필터
- `level` (string, optional): 레벨 필터

**Response**: 로그 배열

#### GET /api/logs/export
**설명**: 로그 내보내기

**Query Parameters**:
- `format` (string, optional): 포맷 (csv | json, 기본값: csv)
- 기타 필터 파라미터

**Response**: 
- CSV: `text/csv` MIME type, 파일 다운로드
- JSON: `application/json` MIME type, 파일 다운로드

---

## 8. 데이터 모델

### 8.1 User (사용자)
```typescript
interface User {
  id: string;                // 고유 ID
  name: string;              // 이름
  email: string;             // 이메일 (unique)
  password: string;          // 비밀번호 해시
  role: 'ADMIN' | 'MANAGER' | 'USER'; // 권한
  department?: string;       // 부서
  phone?: string;            // 연락처
  avatar?: string;           // 프로필 이미지 URL
  lastLogin?: Date;          // 마지막 로그인
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // 상태
  createdAt: Date;           // 생성일
  updatedAt: Date;           // 수정일
}
```

### 8.2 ActivityLog (활동 로그)
```typescript
interface ActivityLog {
  id: string;                // 고유 ID
  timestamp: Date;           // 서버 타임스탬프 (DB 자동 생성)
  userId: string;            // 사용자 ID (FK)
  userName: string;          // 사용자 이름 (스냅샷)
  category: LogCategory;     // 카테고리
  action: LogAction;         // 액션
  target: string;            // 대상
  targetId?: string;         // 대상 ID
  description: string;       // 설명
  details?: string;          // JSON 문자열
  level: 'info' | 'warning' | 'error'; // 레벨
  ipAddress?: string;        // IP 주소
  userAgent?: string;        // User Agent
}
```

---

## 9. UI/UX 가이드라인

### 9.1 디자인 원칙
1. **단순성**: 불필요한 장식 없이 기능에 집중
2. **일관성**: 전체 시스템과 동일한 디자인 언어 사용
3. **피드백**: 모든 액션에 명확한 피드백 제공
4. **예측 가능성**: 사용자가 예상할 수 있는 동작

### 9.2 색상 시스템
- **Primary**: Blue (#3B82F6) - 주요 액션 버튼
- **Success**: Green (#10B981) - 성공 메시지
- **Warning**: Yellow (#F59E0B) - 경고 메시지
- **Danger**: Red (#EF4444) - 위험한 액션, 오류
- **Gray**: (#6B7280) - 일반 텍스트, 비활성 요소

### 9.3 타이포그래피
- **제목 (H1)**: 24px, Bold
- **부제목 (H2)**: 20px, Semibold
- **본문**: 14px, Regular
- **작은 텍스트**: 12px, Regular

### 9.4 버튼 스타일
- **Primary**: 파란 배경, 흰 텍스트
- **Secondary**: 회색 배경, 검정 텍스트
- **Danger**: 빨간 배경, 흰 텍스트
- **크기**: 
  - Large: px-6 py-3
  - Medium: px-4 py-2
  - Small: px-3 py-1

### 9.5 상호작용
- **호버**: 약간 어두운 색상 (`hover:bg-blue-700`)
- **클릭**: 스케일 효과 (`active:scale-95`)
- **포커스**: 아웃라인 표시 (`focus:ring-2`)
- **로딩**: 스피너 또는 스켈레톤 UI

### 9.6 반응형 디자인
- **Desktop** (1024px+): 최대 7컬럼 테이블
- **Tablet** (768px~1023px): 5컬럼 테이블, 일부 컬럼 숨김
- **Mobile** (< 768px): 카드 형식으로 전환 (향후 지원)

---

## 10. 테스트 계획

### 10.1 단위 테스트
**대상**:
- 사용자 검증 로직
- 필터링 함수
- 로그 포맷 함수

**도구**: Jest + React Testing Library

### 10.2 통합 테스트
**시나리오**:
1. 사용자 CRUD 전체 플로우
2. 로그 기록 및 조회
3. 검색 및 필터링
4. CSV 내보내기

**도구**: Playwright / Cypress

### 10.3 E2E 테스트
**핵심 시나리오**:
1. 관리자가 사용자를 추가하고 권한을 부여
2. 사용자가 로그인하여 활동 수행
3. 관리자가 활동 로그를 조회하고 내보내기
4. 사용자 수정 및 삭제

**도구**: Playwright

### 10.4 성능 테스트
**시나리오**:
- 1,000명 사용자 목록 로딩 시간
- 100,000건 로그 조회 시간
- 동시 100명 사용자 접속

**도구**: k6 / Artillery

### 10.5 보안 테스트
**체크리스트**:
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] CSRF 토큰 검증
- [ ] 권한 검증 (관리자만 삭제 가능)
- [ ] 세션 타임아웃
- [ ] 비밀번호 해싱

---

## 11. 배포 계획

### 11.1 배포 환경
- **Development**: 개발 서버 (localhost)
- **Staging**: 스테이징 서버 (staging.fulgo.com)
- **Production**: 프로덕션 서버 (fulgo.com)

### 11.2 배포 프로세스
1. **코드 리뷰**: Pull Request 승인
2. **자동 테스트**: CI/CD 파이프라인 실행
3. **Staging 배포**: 자동 배포
4. **QA 테스트**: 수동 테스트 (체크리스트)
5. **Production 배포**: 수동 승인 후 배포
6. **모니터링**: 에러율, 응답 시간 모니터링

### 11.3 롤백 계획
- **자동 롤백**: 에러율 10% 초과 시
- **수동 롤백**: 치명적 버그 발견 시
- **롤백 시간**: 5분 이내

---

## 12. 유지보수 계획

### 12.1 모니터링
**메트릭**:
- 에러율 (목표: < 1%)
- 평균 응답 시간 (목표: < 500ms)
- 사용자 수
- 로그 레코드 수
- DB 용량

**알림**:
- 에러율 5% 초과: 경고
- 에러율 10% 초과: 심각
- 응답 시간 1초 초과: 경고
- DB 용량 80% 초과: 경고

### 12.2 백업
- **빈도**: 일 1회 (새벽 2시)
- **보존 기간**: 30일
- **대상**: 
  - 사용자 데이터
  - 활동 로그
- **복구 테스트**: 월 1회

### 12.3 업데이트
- **버그 수정**: 발견 즉시
- **마이너 업데이트**: 월 1회
- **메이저 업데이트**: 분기 1회

---

## 13. 향후 계획 (Roadmap)

### Phase 1 (현재)
- [x] 기본 사용자 CRUD
- [x] 활동 로그 기록 및 조회
- [x] 검색 및 필터링
- [x] CSV 내보내기

### Phase 2 (다음 분기)
- [ ] 조직/부서 계층 관리
- [ ] 세밀한 권한 관리 (RBAC)
- [ ] 비밀번호 변경 기능
- [ ] 이메일 알림 (로그인 실패, 권한 변경 등)

### Phase 3 (6개월 후)
- [ ] 2단계 인증 (2FA)
- [ ] SSO 통합 (SAML, OAuth)
- [ ] 사용자 프로필 커스터마이징
- [ ] 모바일 앱 (React Native)

### Phase 4 (1년 후)
- [ ] AI 기반 이상 활동 탐지
- [ ] 대시보드 (사용자 활동 통계)
- [ ] API 키 관리
- [ ] 웹훅 (이벤트 기반 알림)

---

## 14. 부록

### 14.1 용어 정의
- **CRUD**: Create, Read, Update, Delete
- **RBAC**: Role-Based Access Control (역할 기반 접근 제어)
- **SSO**: Single Sign-On (단일 로그인)
- **2FA**: Two-Factor Authentication (2단계 인증)
- **RTO**: Recovery Time Objective (복구 시간 목표)
- **RPO**: Recovery Point Objective (복구 지점 목표)

### 14.2 참고 문서
- Next.js 공식 문서: https://nextjs.org/docs
- Prisma 공식 문서: https://www.prisma.io/docs
- NextAuth.js 문서: https://next-auth.js.org
- Tailwind CSS 문서: https://tailwindcss.com/docs

### 14.3 변경 이력
| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-10-14 | 초안 작성 | 플고물류 개발팀 |

---

## 15. 승인

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |

---

**문서 끝**
