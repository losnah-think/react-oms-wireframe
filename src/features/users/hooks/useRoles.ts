// src/features/users/hooks/useRoles.ts
import { useState, useEffect, useCallback } from 'react';
import { roleService, RoleFilters } from '../../../lib/services/RoleService';
import { Role, Permission } from '../types/permissions';

interface UseRolesOptions {
  filters?: RoleFilters;
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

export const useRoles = (options: UseRolesOptions = {}): UseRolesReturn => {
  const { 
    filters = {}, 
    autoLoad = true 
  } = options;
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.getRoles(filters);
      
      setRoles(response.roles || []);
      setTotal(response.total || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '역할 목록을 가져오는데 실패했습니다';
      setError(errorMessage);
      console.error('역할 목록 조회 실패:', err);
      // 에러 발생 시 빈 배열로 설정
      setRoles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 새로고침
  const refresh = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  // 역할 생성
  const createRole = useCallback(async (data: { name: string; description: string; permissions: Permission[] }) => {
    try {
      setError(null);
      await roleService.createRole(data);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '역할 생성에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 역할 수정
  const updateRole = useCallback(async (id: string, updates: { name?: string; description?: string; permissions?: Permission[] }) => {
    try {
      setError(null);
      await roleService.updateRole(id, updates);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '역할 수정에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 역할 권한 수정
  const updateRolePermissions = useCallback(async (id: string, permissions: Permission[]) => {
    try {
      setError(null);
      await roleService.updateRolePermissions(id, permissions);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 수정에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 역할 삭제
  const deleteRole = useCallback(async (id: string) => {
    try {
      setError(null);
      await roleService.deleteRole(id);
      await refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '역할 삭제에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 초기 데이터 로드
  useEffect(() => {
    if (autoLoad) {
      fetchRoles();
    }
  }, [autoLoad, fetchRoles]);

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

