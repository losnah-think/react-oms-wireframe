// src/features/users/hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { Permission, Role, hasPermission, hasAnyPermission, hasAllPermissions } from '../types/permissions';

interface UsePermissionsOptions {
  userId?: string;
  permissions?: Permission[];
}

interface UsePermissionsReturn {
  permissions: Permission[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccess: (requiredPermissions: Permission[]) => boolean;
  refreshPermissions: () => void;
}

// Mock 데이터 (실제로는 API에서 가져옴)
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'ADMIN',
    description: '시스템의 모든 권한을 가진 최고 관리자',
    permissions: ['*'],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
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
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
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
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'USER',
    description: '일반 시스템 사용자',
    permissions: [
      'users:read',
      'products:read',
      'orders:read'
    ],
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const usePermissions = (options: UsePermissionsOptions = {}): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>(['*']); // 개발 모드: 모든 권한
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    // 개발 모드: 즉시 권한 설정
    setRoles(mockRoles);
    
    if (options.permissions) {
      setPermissions(options.permissions);
    } else {
      // 기본 권한 (관리자 - 모든 권한)
      setPermissions(['*']);
    }
  }, [options.permissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const checkPermission = useCallback((permission: Permission): boolean => {
    return hasPermission(permissions, permission);
  }, [permissions]);

  const checkAnyPermission = useCallback((requiredPermissions: Permission[]): boolean => {
    return hasAnyPermission(permissions, requiredPermissions);
  }, [permissions]);

  const checkAllPermissions = useCallback((requiredPermissions: Permission[]): boolean => {
    return hasAllPermissions(permissions, requiredPermissions);
  }, [permissions]);

  const canAccess = useCallback((requiredPermissions: Permission[]): boolean => {
    return hasAnyPermission(permissions, requiredPermissions);
  }, [permissions]);

  const refreshPermissions = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    roles,
    loading,
    error,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccess,
    refreshPermissions
  };
};

// 특정 권한을 체크하는 간단한 훅
export const usePermission = (permission: Permission, userId?: string): boolean => {
  const { hasPermission, loading } = usePermissions({ userId });
  
  if (loading) return false;
  return hasPermission(permission);
};

// 여러 권한 중 하나라도 있는지 체크하는 훅
export const useAnyPermission = (permissions: Permission[], userId?: string): boolean => {
  const { hasAnyPermission, loading } = usePermissions({ userId });
  
  if (loading) return false;
  return hasAnyPermission(permissions);
};

// 모든 권한이 있는지 체크하는 훅
export const useAllPermissions = (permissions: Permission[], userId?: string): boolean => {
  const { hasAllPermissions, loading } = usePermissions({ userId });
  
  if (loading) return false;
  return hasAllPermissions(permissions);
};
