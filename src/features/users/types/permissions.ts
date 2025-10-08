// src/features/users/types/permissions.ts
export type Permission = 
  // 사용자 관리
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:export'
  | 'users:reset-password'
  | 'users:batch-operations'
  
  // 상품 관리
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'products:import'
  | 'products:export'
  
  // 주문 관리
  | 'orders:read'
  | 'orders:create'
  | 'orders:update'
  | 'orders:delete'
  | 'orders:process'
  | 'orders:cancel'
  
  // 설정 관리
  | 'settings:read'
  | 'settings:update'
  | 'settings:integrations'
  | 'settings:categories'
  
  // 보고서 및 분석
  | 'reports:read'
  | 'reports:export'
  | 'reports:analytics'
  
  // 시스템 관리
  | 'system:logs'
  | 'system:backup'
  | 'system:maintenance'
  
  // 모든 권한
  | '*';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
  description: string;
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: '사용자 관리',
    description: '사용자 계정 및 권한 관리',
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'users:export',
      'users:reset-password',
      'users:batch-operations'
    ]
  },
  {
    name: '상품 관리',
    description: '상품 정보 및 재고 관리',
    permissions: [
      'products:read',
      'products:create',
      'products:update',
      'products:delete',
      'products:import',
      'products:export'
    ]
  },
  {
    name: '주문 관리',
    description: '주문 처리 및 관리',
    permissions: [
      'orders:read',
      'orders:create',
      'orders:update',
      'orders:delete',
      'orders:process',
      'orders:cancel'
    ]
  },
  {
    name: '설정 관리',
    description: '시스템 설정 및 구성',
    permissions: [
      'settings:read',
      'settings:update',
      'settings:integrations',
      'settings:categories'
    ]
  },
  {
    name: '보고서 및 분석',
    description: '데이터 분석 및 보고서 생성',
    permissions: [
      'reports:read',
      'reports:export',
      'reports:analytics'
    ]
  },
  {
    name: '시스템 관리',
    description: '시스템 유지보수 및 관리',
    permissions: [
      'system:logs',
      'system:backup',
      'system:maintenance'
    ]
  }
];

export const DEFAULT_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'ADMIN',
    description: '시스템의 모든 권한을 가진 최고 관리자',
    permissions: ['*'],
    isSystem: true
  },
  {
    name: 'MANAGER',
    description: '주요 비즈니스 기능 관리자',
    permissions: [
      'users:read',
      'users:create',
      'users:update',
      'products:read',
      'products:create',
      'products:update',
      'orders:read',
      'orders:create',
      'orders:update',
      'orders:process',
      'settings:read',
      'reports:read',
      'reports:export'
    ],
    isSystem: true
  },
  {
    name: 'OPERATOR',
    description: '일반 운영 업무 담당자',
    permissions: [
      'users:read',
      'products:read',
      'products:update',
      'orders:read',
      'orders:update',
      'orders:process',
      'settings:read'
    ],
    isSystem: true
  },
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
];

// 권한 검사 헬퍼 함수들
export const hasPermission = (userPermissions: Permission[], requiredPermission: Permission): boolean => {
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

export const getPermissionDisplayName = (permission: Permission): string => {
  const permissionNames: Record<Permission, string> = {
    // 사용자 관리
    'users:read': '사용자 조회',
    'users:create': '사용자 생성',
    'users:update': '사용자 수정',
    'users:delete': '사용자 삭제',
    'users:export': '사용자 내보내기',
    'users:reset-password': '비밀번호 초기화',
    'users:batch-operations': '일괄 작업',
    
    // 상품 관리
    'products:read': '상품 조회',
    'products:create': '상품 생성',
    'products:update': '상품 수정',
    'products:delete': '상품 삭제',
    'products:import': '상품 가져오기',
    'products:export': '상품 내보내기',
    
    // 주문 관리
    'orders:read': '주문 조회',
    'orders:create': '주문 생성',
    'orders:update': '주문 수정',
    'orders:delete': '주문 삭제',
    'orders:process': '주문 처리',
    'orders:cancel': '주문 취소',
    
    // 설정 관리
    'settings:read': '설정 조회',
    'settings:update': '설정 수정',
    'settings:integrations': '연동 관리',
    'settings:categories': '카테고리 관리',
    
    // 보고서 및 분석
    'reports:read': '보고서 조회',
    'reports:export': '보고서 내보내기',
    'reports:analytics': '분석 도구',
    
    // 시스템 관리
    'system:logs': '시스템 로그',
    'system:backup': '백업 관리',
    'system:maintenance': '시스템 유지보수',
    
    // 모든 권한
    '*': '모든 권한'
  };
  
  return permissionNames[permission] || permission;
};
