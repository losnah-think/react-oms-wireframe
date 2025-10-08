// src/features/users/hooks/useRoles.ts
import { useState, useEffect, useCallback } from 'react';
import { Role, Permission, DEFAULT_ROLES } from '../types/permissions';

interface UseRolesOptions {
  filters?: any;
  autoLoad?: boolean;
}

interface UseRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  total: number;
  refresh: () => Promise<void>;
  createRole: (data: { name: string; description: string; permissions: Permission[] }) => Promise<void>;
  updateRole: (id: string, updates: { name?: string; description?: string; permissions?: Permission[] }) => Promise<void>;
  updateRolePermissions: (id: string, permissions: Permission[]) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

// Mock 역할 데이터 (로컬 상태)
const mockRoles: Role[] = DEFAULT_ROLES.map((role, index) => ({
  ...role,
  id: String(index + 1),
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}));

export const useRoles = (options: UseRolesOptions = {}): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(mockRoles.length);

  // 새로고침
  const refresh = useCallback(async () => {
    setRoles([...mockRoles]);
  }, []);

  // 역할 생성
  const createRole = useCallback(async (data: { name: string; description: string; permissions: Permission[] }) => {
    const newRole: Role = {
      ...data,
      id: String(roles.length + 1),
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRoles(prev => [...prev, newRole]);
  }, [roles.length]);

  // 역할 수정
  const updateRole = useCallback(async (id: string, updates: { name?: string; description?: string; permissions?: Permission[] }) => {
    setRoles(prev => prev.map(role => 
      role.id === id ? { ...role, ...updates, updatedAt: new Date().toISOString() } : role
    ));
  }, []);

  // 역할 권한 수정
  const updateRolePermissions = useCallback(async (id: string, permissions: Permission[]) => {
    setRoles(prev => prev.map(role => 
      role.id === id ? { ...role, permissions, updatedAt: new Date().toISOString() } : role
    ));
  }, []);

  // 역할 삭제
  const deleteRole = useCallback(async (id: string) => {
    setRoles(prev => prev.filter(role => role.id !== id));
  }, []);

  return {
    roles,
    loading,
    error,
    total,
    refresh,
    createRole,
    updateRole,
    updateRolePermissions,
    deleteRole
  };
};

