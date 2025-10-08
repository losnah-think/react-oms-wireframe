// pages/users/search-demo.tsx
import React, { useState } from 'react';
import { Container, Card, Button } from '../../src/design-system';
import { AutoCompleteSearch, UserFilters, ToastProvider } from '../../src/features/users/components';
import { User, UserFilters as UserFiltersType } from '../../src/features/users/types';

const SearchDemoPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFiltersType>({});
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    console.log('선택된 사용자:', user);
  };

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
    console.log('필터 변경:', newFilters);
  };

  const handleSearchDemo = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };

  return (
    <ToastProvider>
      <Container>
        <div className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              고급 검색 데모
            </h1>
            <p className="text-gray-600">
              사용자 관리 시스템의 고급 검색 및 필터링 기능을 테스트해보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 자동완성 검색 */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-4">자동완성 검색</h2>
              <div className="space-y-4">
                <AutoCompleteSearch
                  onUserSelect={handleUserSelect}
                  placeholder="사용자 이름이나 이메일로 검색..."
                />
                
                {selectedUser && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">선택된 사용자</h3>
                    <div className="text-sm text-blue-800">
                      <p><strong>이름:</strong> {selectedUser.name}</p>
                      <p><strong>이메일:</strong> {selectedUser.email}</p>
                      <p><strong>부서:</strong> {selectedUser.department}</p>
                      <p><strong>역할:</strong> {selectedUser.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 고급 필터 */}
            <Card padding="lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">고급 필터</h2>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? '숨기기' : '보기'}
                </Button>
              </div>
              
              {showFilters && (
                <div className="space-y-4">
                  <UserFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={() => setFilters({})}
                  />
                  
                  <Button
                    onClick={handleSearchDemo}
                    className="w-full"
                  >
                    필터 적용하여 검색
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <Card padding="lg" className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                검색 결과 ({searchResults.length}명)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p>부서: {user.department}</p>
                      <p>역할: {user.role}</p>
                      <p>상태: {user.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 기능 설명 */}
          <Card padding="lg" className="mt-8">
            <h2 className="text-xl font-semibold mb-4">기능 설명</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">자동완성 검색</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 실시간 검색 제안</li>
                  <li>• 키보드 네비게이션 지원</li>
                  <li>• 검색 히스토리 저장</li>
                  <li>• 사용자, 부서별 필터링</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">고급 필터</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 빠른 필터 버튼</li>
                  <li>• 역할, 상태, 부서별 필터</li>
                  <li>• 정렬 옵션</li>
                  <li>• 활성 필터 표시</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </ToastProvider>
  );
};

export default SearchDemoPage;
