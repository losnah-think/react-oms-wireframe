// src/features/users/hooks/useUsers.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '../../../lib/services/UserService';
import { User, UserFilters, CreateUserRequest, UpdateUserRequest, UserStats } from '../types';

interface UseUsersOptions {
  filters?: UserFilters;
  sort?: any;
  page?: number;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  stats: UserStats | null;
  total: number;
  page: number;
  totalPages: number;
  refresh: () => Promise<void>;
  updateUser: (id: string, updates: UpdateUserRequest) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  batchUpdateStatus: (userIds: string[], status: 'active' | 'inactive' | 'pending' | 'suspended') => Promise<void>;
  batchDeleteUsers: (userIds: string[]) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  exportUsers: (userIds: string[], format?: 'csv' | 'json') => Promise<any>;
  resetPasswords: (userIds: string[]) => Promise<{ success: number; failed: number }>;
}

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const { 
    filters = {}, 
    sort, 
    page: initialPage = 1, 
    pageSize = 20,
    autoRefresh = false, 
    refreshInterval = 30000 
  } = options;
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);

  // 사용자 목록 조회
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUsers({
        ...filters,
        page: filters.page || page,
        limit: filters.limit || pageSize,
        sortBy: sort?.field,
        sortOrder: sort?.direction
      });
      
      setUsers(response.users);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 목록을 가져오는데 실패했습니다';
      setError(errorMessage);
      console.error('사용자 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, sort]);

  // 통계 조회
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await userService.getUserStats();
      setStats(statsData);
    } catch (err) {
      console.error('사용자 통계 조회 실패:', err);
      // 에러 발생 시 기본 통계로 설정
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        suspended: 0,
        admins: 0,
        managers: 0,
        operators: 0,
        users: 0,
        todayLogins: 0,
        weeklyLogins: 0,
        monthlyLogins: 0
      });
    }
  }, []);

  // 새로고침
  const refresh = useCallback(async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
  }, [fetchUsers, fetchStats]);

  // 사용자 생성
  const createUser = useCallback(async (userData: CreateUserRequest) => {
    try {
      setError(null);
      await userService.createUser(userData);
      await refresh(); // 목록 새로고침
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 생성에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 사용자 수정
  const updateUser = useCallback(async (id: string, updates: UpdateUserRequest) => {
    try {
      setError(null);
      await userService.updateUser(id, updates);
      await refresh(); // 목록 새로고침
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 수정에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 사용자 삭제
  const deleteUser = useCallback(async (id: string) => {
    try {
      setError(null);
      await userService.deleteUser(id);
      await refresh(); // 목록 새로고침
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 삭제에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 일괄 상태 변경
  const batchUpdateStatus = useCallback(async (userIds: string[], status: 'active' | 'inactive' | 'pending' | 'suspended') => {
    try {
      setError(null);
      await userService.batchUpdateStatus(userIds, status);
      await refresh(); // 목록 새로고침
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일괄 상태 변경에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 일괄 삭제
  const batchDeleteUsers = useCallback(async (userIds: string[]) => {
    try {
      setError(null);
      await userService.batchDeleteUsers(userIds);
      await refresh(); // 목록 새로고침
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '일괄 삭제에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, [refresh]);

  // 사용자 검색
  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    try {
      return await userService.searchUsers(query);
    } catch (err) {
      console.error('사용자 검색 실패:', err);
      return [];
    }
  }, []);

  // 사용자 데이터 내보내기
  const exportUsers = useCallback(async (userIds: string[], format: 'csv' | 'json' = 'csv') => {
    try {
      setError(null);
      const result = await userService.exportUsers(userIds, format);
      
      if (format === 'csv') {
        const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        userService.downloadCSV(result as Blob, filename);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 데이터 내보내기에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 비밀번호 초기화
  const resetPasswords = useCallback(async (userIds: string[]) => {
    try {
      setError(null);
      return await userService.resetPasswords(userIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 초기화에 실패했습니다';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    if (filters.search || filters.role || filters.status || filters.department) {
      setPage(1);
    }
  }, [filters.search, filters.role, filters.status, filters.department]);

  return {
    users,
    loading,
    error,
    stats,
    total,
    page,
    totalPages,
    refresh,
    updateUser,
    deleteUser,
    createUser,
    batchUpdateStatus,
    batchDeleteUsers,
    searchUsers,
    exportUsers,
    resetPasswords
  };
};