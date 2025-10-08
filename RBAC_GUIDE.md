# RBAC (Role-Based Access Control) 가이드

## 목차
1. [개요](#개요)
2. [권한 시스템 구조](#권한-시스템-구조)
3. [역할(Role) 정의](#역할role-정의)
4. [권한(Permission) 정의](#권한permission-정의)
5. [사용 방법](#사용-방법)
6. [API 가이드](#api-가이드)

---

## 개요

이 시스템은 **역할 기반 접근 제어(RBAC)** 를 통해 사용자 권한을 관리합니다.

### 핵심 개념
- **사용자(User)**: 시스템을 사용하는 사람
- **역할(Role)**: 사용자에게 할당되는 권한의 집합
- **권한(Permission)**: 특정 리소스에 대한 작업 권한 (조회, 생성, 수정, 삭제 등)

### 권한 체계
```
사용자 → 역할 → 권한
```
- 한 사용자는 하나 이상의 역할을 가질 수 있습니다
- 한 역할은 여러 권한을 포함합니다
- 권한은 `리소스:작업` 형식으로 정의됩니다

---

## 권한 시스템 구조

### 권한 형식
```typescript
type Permission = 'resource:action'
// 예: 'users:read', 'products:create', 'orders:delete'
```

### 리소스별 권한

#### 1. 사용자 관리 (`users`)
- `users:read` - 사용자 조회
- `users:create` - 사용자 생성
- `users:update` - 사용자 수정
- `users:delete` - 사용자 삭제
- `users:export` - 사용자 데이터 내보내기
- `users:reset-password` - 비밀번호 초기화
- `users:batch-operations` - 일괄 작업

#### 2. 상품 관리 (`products`)
- `products:read` - 상품 조회
- `products:create` - 상품 생성
- `products:update` - 상품 수정
- `products:delete` - 상품 삭제
- `products:import` - 상품 가져오기
- `products:export` - 상품 내보내기

#### 3. 주문 관리 (`orders`)
- `orders:read` - 주문 조회
- `orders:create` - 주문 생성
- `orders:update` - 주문 수정
- `orders:delete` - 주문 삭제
- `orders:process` - 주문 처리
- `orders:cancel` - 주문 취소

#### 4. 설정 관리 (`settings`)
- `settings:read` - 설정 조회
- `settings:update` - 설정 수정
- `settings:integrations` - 연동 관리
- `settings:categories` - 카테고리 관리

#### 5. 보고서 및 분석 (`reports`)
- `reports:read` - 보고서 조회
- `reports:export` - 보고서 내보내기
- `reports:analytics` - 분석 도구

#### 6. 시스템 관리 (`system`)
- `system:logs` - 시스템 로그
- `system:backup` - 백업 관리
- `system:maintenance` - 시스템 유지보수

#### 7. 모든 권한
- `*` - 모든 권한 (슈퍼 관리자)

---

## 역할(Role) 정의

### 기본 시스템 역할

#### 1. ADMIN (관리자)
```typescript
{
  name: 'ADMIN',
  description: '시스템의 모든 권한을 가진 최고 관리자',
  permissions: ['*'],
  isSystem: true
}
```

#### 2. MANAGER (매니저)
```typescript
{
  name: 'MANAGER',
  description: '주요 비즈니스 기능 관리자',
  permissions: [
    'users:read', 'users:create', 'users:update',
    'products:read', 'products:create', 'products:update',
    'orders:read', 'orders:create', 'orders:update', 'orders:process',
    'settings:read',
    'reports:read', 'reports:export'
  ],
  isSystem: true
}
```

#### 3. OPERATOR (운영자)
```typescript
{
  name: 'OPERATOR',
  description: '일반 운영 업무 담당자',
  permissions: [
    'users:read',
    'products:read', 'products:update',
    'orders:read', 'orders:update', 'orders:process',
    'settings:read'
  ],
  isSystem: true
}
```

#### 4. USER (일반 사용자)
```typescript
{
  name: 'USER',
  description: '일반 시스템 사용자',
  permissions: [
    'users:read',
    'products:read',
    'orders:read'
  ],
  isSystem: true
}
```

---

## 사용 방법

### 1. Hook 사용

#### usePermissions Hook
```typescript
import { usePermissions } from '@/features/users/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  // 단일 권한 체크
  if (hasPermission('users:create')) {
    // 사용자 생성 권한이 있을 때
  }
  
  // 여러 권한 중 하나라도 있는지 체크
  if (hasAnyPermission(['users:update', 'users:delete'])) {
    // 수정 또는 삭제 권한이 있을 때
  }
  
  // 모든 권한이 있는지 체크
  if (hasAllPermissions(['users:read', 'users:create'])) {
    // 조회와 생성 권한이 모두 있을 때
  }
}
```

### 2. PermissionGate 컴포넌트

#### 기본 사용
```typescript
import PermissionGate from '@/features/users/components/PermissionGate';

function MyComponent() {
  return (
    <PermissionGate permission="users:create">
      <Button>사용자 추가</Button>
    </PermissionGate>
  );
}
```

#### 여러 권한 체크
```typescript
// 하나라도 있으면 표시
<PermissionGate 
  permissions={['users:update', 'users:delete']}
  requireAll={false}
>
  <Button>편집</Button>
</PermissionGate>

// 모두 있어야 표시
<PermissionGate 
  permissions={['users:read', 'users:export']}
  requireAll={true}
>
  <Button>내보내기</Button>
</PermissionGate>
```

#### Fallback UI
```typescript
<PermissionGate 
  permission="users:create"
  fallback={<div>권한이 없습니다</div>}
>
  <Button>사용자 추가</Button>
</PermissionGate>
```

### 3. 조건부 렌더링

```typescript
import { usePermissions } from '@/features/users/hooks/usePermissions';

function UserList() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission('users:update') && (
        <Button>수정</Button>
      )}
      
      {hasPermission('users:delete') && (
        <Button>삭제</Button>
      )}
    </div>
  );
}
```

### 4. 역할 관리

#### useRoles Hook
```typescript
import { useRoles } from '@/features/users/hooks/useRoles';

function RoleManagement() {
  const { 
    roles, 
    loading, 
    createRole, 
    updateRole, 
    updateRolePermissions,
    deleteRole 
  } = useRoles();
  
  // 역할 생성
  const handleCreate = async () => {
    await createRole({
      name: 'CUSTOM_ROLE',
      description: '커스텀 역할',
      permissions: ['users:read', 'products:read']
    });
  };
  
  // 권한 수정
  const handleUpdatePermissions = async (roleId: string) => {
    await updateRolePermissions(roleId, [
      'users:read',
      'users:create',
      'products:read'
    ]);
  };
  
  // 역할 삭제
  const handleDelete = async (roleId: string) => {
    await deleteRole(roleId);
  };
}
```

---

## API 가이드

### 역할 관리 API

#### 1. 역할 목록 조회
```http
GET /api/users/roles
Query Parameters:
  - search: string (검색어)
  - isSystem: boolean (시스템 역할 필터)

Response:
{
  "roles": [
    {
      "id": "1",
      "name": "ADMIN",
      "description": "관리자",
      "permissions": ["*"],
      "isSystem": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

#### 2. 역할 상세 조회
```http
GET /api/users/roles/{id}

Response:
{
  "role": {
    "id": "1",
    "name": "ADMIN",
    "description": "관리자",
    "permissions": ["*"],
    "isSystem": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. 역할 생성
```http
POST /api/users/roles
Content-Type: application/json

Request Body:
{
  "name": "CUSTOM_ROLE",
  "description": "커스텀 역할",
  "permissions": ["users:read", "products:read"]
}

Response:
{
  "role": {
    "id": "5",
    "name": "CUSTOM_ROLE",
    "description": "커스텀 역할",
    "permissions": ["users:read", "products:read"],
    "isSystem": false,
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

#### 4. 역할 수정
```http
PUT /api/users/roles/{id}
Content-Type: application/json

Request Body:
{
  "permissions": ["users:read", "users:create", "products:read"]
}

Response:
{
  "role": { ... },
  "message": "Role updated successfully"
}

Note: 시스템 역할(isSystem: true)은 permissions만 수정 가능
```

#### 5. 역할 삭제
```http
DELETE /api/users/roles/{id}

Response:
{
  "success": true,
  "message": "Role deleted successfully"
}

Note: 시스템 역할은 삭제 불가
```

---

## 권한 체크 헬퍼 함수

### hasPermission
```typescript
import { hasPermission } from '@/features/users/types/permissions';

const userPermissions = ['users:read', 'users:create'];
const canRead = hasPermission(userPermissions, 'users:read'); // true
const canDelete = hasPermission(userPermissions, 'users:delete'); // false
```

### hasAnyPermission
```typescript
import { hasAnyPermission } from '@/features/users/types/permissions';

const userPermissions = ['users:read'];
const canEdit = hasAnyPermission(userPermissions, ['users:update', 'users:delete']); // false
```

### hasAllPermissions
```typescript
import { hasAllPermissions } from '@/features/users/types/permissions';

const userPermissions = ['users:read', 'users:create'];
const hasAll = hasAllPermissions(userPermissions, ['users:read', 'users:create']); // true
```

---

## 보안 고려사항

### 1. 클라이언트 측 권한 체크
- UI 표시/숨김 용도로만 사용
- **보안을 위해서는 반드시 서버 측에서도 권한 체크 필요**

### 2. 서버 측 권한 체크
```typescript
// API 라우트에서
import { hasPermission } from '@/features/users/types/permissions';

export default async function handler(req, res) {
  const user = await getAuthenticatedUser(req);
  
  if (!hasPermission(user.permissions, 'users:create')) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  // 권한이 있을 때만 실행
}
```

### 3. 시스템 역할 보호
- 시스템 역할(isSystem: true)은 이름과 설명 수정 불가
- 시스템 역할은 삭제 불가
- 권한만 수정 가능

---

## 예제 시나리오

### 시나리오 1: 사용자 목록 페이지
```typescript
import { usePermissions } from '@/features/users/hooks/usePermissions';
import PermissionGate from '@/features/users/components/PermissionGate';

function UsersListPage() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      <h1>사용자 목록</h1>
      
      {/* 생성 버튼 - users:create 권한 필요 */}
      <PermissionGate permission="users:create">
        <Button>사용자 추가</Button>
      </PermissionGate>
      
      <Table
        actions={(user) => (
          <>
            {/* 수정 버튼 - users:update 권한 필요 */}
            {hasPermission('users:update') && (
              <Button onClick={() => editUser(user)}>수정</Button>
            )}
            
            {/* 삭제 버튼 - users:delete 권한 필요 */}
            {hasPermission('users:delete') && (
              <Button onClick={() => deleteUser(user)}>삭제</Button>
            )}
          </>
        )}
      />
    </div>
  );
}
```

### 시나리오 2: 역할별 대시보드
```typescript
import { usePermissions } from '@/features/users/hooks/usePermissions';

function Dashboard() {
  const { hasAnyPermission } = usePermissions();
  
  return (
    <div>
      {/* 관리자/매니저만 볼 수 있는 통계 */}
      {hasAnyPermission(['reports:read', 'reports:analytics']) && (
        <AnalyticsSection />
      )}
      
      {/* 모든 사용자가 볼 수 있는 내용 */}
      <UserInfoSection />
    </div>
  );
}
```

---

## 문제 해결

### Q1: 권한이 있는데도 UI가 표시되지 않아요
A: 다음을 확인하세요:
1. 사용자에게 올바른 역할이 할당되었는지
2. 역할에 필요한 권한이 포함되어 있는지
3. Permission 문자열이 정확한지 (`users:read` vs `user:read`)

### Q2: 시스템 역할을 수정할 수 없어요
A: 시스템 역할(ADMIN, MANAGER, OPERATOR, USER)은:
- 이름과 설명 수정 불가
- 삭제 불가
- 권한만 수정 가능

### Q3: 커스텀 역할을 만들고 싶어요
A: 
1. `/users/roles` 페이지에서 "새 역할 생성" 클릭
2. 역할 이름과 설명 입력
3. 필요한 권한 체크박스 선택
4. 저장

---

## 추가 자료

- [사용자 관리 가이드](./USER_GUIDE.md)
- [API 문서](./API_DOCUMENTATION.md)
- [개발자 가이드](./DEVELOPER_GUIDE.md)

