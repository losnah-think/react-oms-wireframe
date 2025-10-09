// src/features/users/hooks/useUsers.ts
import { useState, useCallback } from 'react';
import { User, UserFilters, CreateUserRequest, UpdateUserRequest, UserStats } from '../types';

interface UseUsersOptions {
  filters?: UserFilters;
  sort?: any;
  page?: number;
  pageSize?: number;
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

// Mock 사용자 데이터
const mockUsersData: User[] = [
  { id: '1', name: '김철수', email: 'kim@fulgo.com', role: 'admin', companyId: 'company-1', companyName: '플고물류', department: 'IT팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-01-15T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-1234-5678', groups: ['IT팀'], groupIds: ['1'], permissions: ['*'] },
  { id: '2', name: '이영희', email: 'lee@fulgo.com', role: 'manager', companyId: 'company-1', companyName: '플고물류', department: '마케팅팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-02-20T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-2345-6789', groups: ['마케팅팀'], groupIds: ['2'], permissions: ['users:read', 'users:create', 'users:update'] },
  { id: '3', name: '정수진', email: 'jung@fulgo.com', role: 'operator', companyId: 'company-1', companyName: '플고물류', department: '운영팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-04-05T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-4567-8901', groups: ['운영팀'], groupIds: ['3'], permissions: ['users:read', 'users:update'] },
  { id: '4', name: '박민수', email: 'park@ace.com', role: 'manager', companyId: 'company-2', companyName: '에이스전자', department: '영업팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-03-10T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-3456-7890', groups: ['영업팀'], groupIds: ['4'], permissions: ['users:read', 'users:create', 'users:update'] },
  { id: '5', name: '최동욱', email: 'choi@ace.com', role: 'user', companyId: 'company-2', companyName: '에이스전자', department: 'IT팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-05-01T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-5678-9012', groups: ['IT팀'], groupIds: ['5'], permissions: [] },
  { id: '6', name: '강미래', email: 'kang@best.com', role: 'manager', companyId: 'company-3', companyName: '베스트패션', department: '디자인팀', status: 'active', lastLogin: '2025-01-14T15:30:00Z', createdAt: '2024-06-15T00:00:00Z', updatedAt: '2025-01-14T15:30:00Z', avatar: '', phone: '010-6789-0123', groups: ['디자인팀'], groupIds: ['6'], permissions: ['users:read', 'users:create', 'users:update'] },
  { id: '7', name: '윤서연', email: 'yoon@best.com', role: 'user', companyId: 'company-3', companyName: '베스트패션', department: '영업팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-07-10T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-7890-1234', groups: ['영업팀'], groupIds: ['7'], permissions: [] },
  { id: '8', name: '한지민', email: 'han@smart.com', role: 'operator', companyId: 'company-4', companyName: '스마트식품', department: '물류팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-08-01T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-8901-2345', groups: ['물류팀'], groupIds: ['8'], permissions: ['users:read', 'users:update'] },
  { id: '9', name: '송지훈', email: 'song@smart.com', role: 'user', companyId: 'company-4', companyName: '스마트식품', department: '영업팀', status: 'pending', lastLogin: '-', createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z', avatar: '', phone: '010-9012-3456', groups: [], groupIds: [], permissions: [] },
  { id: '10', name: '오민지', email: 'oh@fulgo.com', role: 'user', companyId: 'company-1', companyName: '플고물류', department: '고객지원팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-09-01T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-0123-4567', groups: ['고객지원팀'], groupIds: [], permissions: [] },
  { id: '11', name: '배성호', email: 'bae@ace.com', role: 'user', companyId: 'company-2', companyName: '에이스전자', department: '재무팀', status: 'suspended', lastLogin: '2025-01-05T10:00:00Z', createdAt: '2024-10-01T00:00:00Z', updatedAt: '2025-01-05T10:00:00Z', avatar: '', phone: '010-1234-0987', groups: ['재무팀'], groupIds: [], permissions: [] },
  { id: '12', name: '서지우', email: 'seo@best.com', role: 'user', companyId: 'company-3', companyName: '베스트패션', department: '마케팅팀', status: 'active', lastLogin: new Date().toISOString(), createdAt: '2024-11-01T00:00:00Z', updatedAt: new Date().toISOString(), avatar: '', phone: '010-2345-0987', groups: ['마케팅팀'], groupIds: [], permissions: [] }
];

const mockStats: UserStats = {
  total: 12,
  active: 9,
  inactive: 0,
  pending: 1,
  suspended: 1,
  admins: 1,
  managers: 3,
  operators: 2,
  users: 6,
  todayLogins: 8,
  weeklyLogins: 10,
  monthlyLogins: 12
};

export const useUsers = (options: UseUsersOptions = {}): UseUsersReturn => {
  const { 
    filters = {}, 
    page: initialPage = 1, 
    pageSize = 10
  } = options;
  
  const [allUsers, setAllUsers] = useState<User[]>(mockUsersData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(mockStats);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // 필터링된 사용자 목록
  const filteredUsers = allUsers.filter(user => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.companyName && user.companyName.toLowerCase().includes(searchLower));
      if (!matches) return false;
    }
    if (filters.companyId && user.companyId !== filters.companyId) return false;
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (filters.department && !user.department.includes(filters.department)) return false;
    return true;
  });

  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize);
  
  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const users = filteredUsers.slice(startIndex, startIndex + pageSize);

  const refresh = useCallback(async () => {
    setStats(mockStats);
  }, []);

  const createUser = useCallback(async (userData: CreateUserRequest) => {
    const newUser: User = {
      id: String(allUsers.length + 1),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      companyId: 'company-1',
      companyName: '플고물류',
      department: userData.department || '',
      status: 'active',
      lastLogin: '-',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: '',
      phone: userData.phone || '',
      groups: [],
      permissions: []
    };
    setAllUsers(prev => [...prev, newUser]);
  }, [allUsers.length]);

  const updateUser = useCallback(async (id: string, updates: UpdateUserRequest) => {
    setAllUsers(prev => prev.map(user =>
      user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
    ));
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setAllUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  const batchUpdateStatus = useCallback(async (userIds: string[], status: 'active' | 'inactive' | 'pending' | 'suspended') => {
    setAllUsers(prev => prev.map(user =>
      userIds.includes(user.id) ? { ...user, status } : user
    ));
  }, []);

  const batchDeleteUsers = useCallback(async (userIds: string[]) => {
    setAllUsers(prev => prev.filter(user => !userIds.includes(user.id)));
  }, []);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
  }, [allUsers]);

  const exportUsers = useCallback(async (userIds: string[], format: 'csv' | 'json' = 'csv') => {
    const exportData = allUsers.filter(user => userIds.includes(user.id));
    console.log('Export users:', exportData, format);
    return exportData;
  }, [allUsers]);

  const resetPasswords = useCallback(async (userIds: string[]) => {
    console.log('Reset passwords for:', userIds);
    return { success: userIds.length, failed: 0 };
  }, []);

  return {
    users,
    loading,
    error,
    stats,
    total,
    page: currentPage,
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
