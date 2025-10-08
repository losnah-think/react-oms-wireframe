// src/features/users/components/UserFilters.tsx
import React, { useState, useEffect } from 'react';
import { Card, Input, Button } from '../../../design-system';
import { UserFilters as UserFiltersType, UserRole, UserStatus } from '../types';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onReset: () => void;
  loading?: boolean;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    recentUsers: false,
    inactiveUsers: false,
    adminUsers: false,
    noLoginUsers: false
  });

  const handleFilterChange = (field: keyof UserFiltersType, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined);
    
    // 검색 히스토리에 추가
    if (value && value.length > 2) {
      setSearchHistory(prev => {
        const newHistory = [value, ...prev.filter(item => item !== value)].slice(0, 5);
        localStorage.setItem('userSearchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };

  const handleQuickFilter = (filterType: keyof typeof quickFilters, enabled: boolean) => {
    setQuickFilters(prev => ({ ...prev, [filterType]: enabled }));
    
    // 빠른 필터 적용
    if (enabled) {
      switch (filterType) {
        case 'recentUsers':
          handleFilterChange('status', 'ACTIVE');
          break;
        case 'inactiveUsers':
          handleFilterChange('status', 'INACTIVE');
          break;
        case 'adminUsers':
          handleFilterChange('role', 'ADMIN');
          break;
        case 'noLoginUsers':
          // 마지막 로그인이 없는 사용자 (실제로는 별도 API 필요)
          break;
      }
    } else {
      // 빠른 필터 해제 시 해당 필터 초기화
      switch (filterType) {
        case 'recentUsers':
        case 'inactiveUsers':
          if (filters.status === 'ACTIVE' || filters.status === 'INACTIVE') {
            handleFilterChange('status', undefined);
          }
          break;
        case 'adminUsers':
          if (filters.role === 'ADMIN') {
            handleFilterChange('role', undefined);
          }
          break;
      }
    }
  };

  const handleSearchHistoryClick = (searchTerm: string) => {
    handleSearchChange(searchTerm);
    setShowSearchHistory(false);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('userSearchHistory');
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.role ||
      filters.status ||
      filters.department ||
      Object.values(quickFilters).some(Boolean)
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role) count++;
    if (filters.status) count++;
    if (filters.department) count++;
    if (Object.values(quickFilters).some(Boolean)) count++;
    return count;
  };

  // 검색 히스토리 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('userSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('검색 히스토리 로드 실패:', error);
      }
    }
  }, []);

  return (
    <Card padding="md" className="mb-6">
      <div className="space-y-4">
        {/* 기본 검색 */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="이름, 이메일로 검색..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSearchHistory(searchHistory.length > 0)}
              disabled={loading}
            />
            
            {/* 검색 히스토리 드롭다운 */}
            {showSearchHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs text-gray-500">최근 검색</span>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    전체 삭제
                  </button>
                </div>
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchHistoryClick(term)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="text-gray-400">🔍</span>
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={loading}
          >
            {showAdvanced ? '간단 검색' : '고급 검색'}
          </Button>
          
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              onClick={onReset}
              disabled={loading}
              className="text-red-600 hover:text-red-700"
            >
              초기화 ({getActiveFiltersCount()})
            </Button>
          )}
        </div>

        {/* 빠른 필터 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-2">빠른 필터:</span>
          <button
            onClick={() => handleQuickFilter('recentUsers', !quickFilters.recentUsers)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              quickFilters.recentUsers
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            활성 사용자
          </button>
          <button
            onClick={() => handleQuickFilter('inactiveUsers', !quickFilters.inactiveUsers)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              quickFilters.inactiveUsers
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            비활성 사용자
          </button>
          <button
            onClick={() => handleQuickFilter('adminUsers', !quickFilters.adminUsers)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              quickFilters.adminUsers
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            관리자
          </button>
          <button
            onClick={() => handleQuickFilter('noLoginUsers', !quickFilters.noLoginUsers)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              quickFilters.noLoginUsers
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
            disabled={loading}
          >
            로그인 없음
          </button>
        </div>

        {/* 고급 필터 */}
        {showAdvanced && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">전체</option>
                  <option value="ADMIN">시스템 관리자</option>
                  <option value="MANAGER">관리자</option>
                  <option value="OPERATOR">운영자</option>
                  <option value="USER">사용자</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">전체</option>
                  <option value="ACTIVE">활성</option>
                  <option value="INACTIVE">비활성</option>
                  <option value="PENDING">대기중</option>
                  <option value="SUSPENDED">정지</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서
                </label>
                <Input
                  placeholder="부서명"
                  value={filters.department || ''}
                  onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* 정렬 옵션 */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정렬 기준
                </label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="createdAt">생성일</option>
                  <option value="name">이름</option>
                  <option value="email">이메일</option>
                  <option value="lastLogin">마지막 로그인</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  정렬 순서
                </label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="desc">내림차순</option>
                  <option value="asc">오름차순</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 활성 필터 표시 */}
        {hasActiveFilters() && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">활성 필터:</span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  검색: {filters.search}
                  <button
                    onClick={() => handleFilterChange('search', undefined)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.role && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  역할: {filters.role}
                  <button
                    onClick={() => handleFilterChange('role', undefined)}
                    className="ml-1 text-green-600 hover:text-green-800"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  상태: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', undefined)}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.department && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  부서: {filters.department}
                  <button
                    onClick={() => handleFilterChange('department', undefined)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              )}
              {Object.entries(quickFilters).map(([key, enabled]) => {
                if (!enabled) return null;
                const labels = {
                  recentUsers: '활성 사용자',
                  inactiveUsers: '비활성 사용자',
                  adminUsers: '관리자',
                  noLoginUsers: '로그인 없음'
                };
                return (
                  <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {labels[key as keyof typeof labels]}
                    <button
                      onClick={() => handleQuickFilter(key as keyof typeof quickFilters, false)}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserFilters;
