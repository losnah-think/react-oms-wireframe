// src/features/users/UsersListPage.tsx (개선된 버전)
import React, { useState } from "react";
import { Container, Card, Button, Input, Table, type TableColumn } from "../../design-system";
import { useUsers } from "./hooks/useUsers";
import { User, UserFilters, UserSort } from "./types";
import UserAvatar from "./components/UserAvatar";
import UserStatusBadge from "./components/UserStatusBadge";
import UserRoleBadge from "./components/UserRoleBadge";
import UserStatsCard from "./components/UserStatsCard";

const UsersListPage: React.FC = () => {
  const [filters, setFilters] = useState<UserFilters>({});
  const [sort, setSort] = useState<UserSort>({ field: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { users, loading, stats, total, refresh, updateUser, deleteUser } = useUsers({
    filters,
    sort,
    page,
    pageSize
  });

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleRoleFilter = (role: string) => {
    setFilters(prev => ({ ...prev, role: role as any }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status as any }));
  };

  const handleSort = (field: keyof User) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      title: "사용자",
      render: (user) => (
        <UserAvatar 
          name={user.name} 
          email={user.email} 
          size="md" 
          showName 
          showEmail 
        />
      ),
    },
    {
      key: "role",
      title: "역할",
      render: (user) => <UserRoleBadge role={user.role} size="small" />,
    },
    {
      key: "department",
      title: "부서",
      render: (user) => (
        <span className="text-sm text-gray-900">{user.department}</span>
      ),
    },
    {
      key: "status",
      title: "상태",
      render: (user) => <UserStatusBadge status={user.status} size="small" />,
    },
    {
      key: "lastLogin",
      title: "마지막 로그인",
      render: (user) => (
        <span className="text-sm text-gray-500">
          {user.lastLogin === "-" ? "-" : user.lastLogin}
        </span>
      ),
    },
    {
      key: "actions",
      title: "작업",
      render: (user) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log("Edit user", user.id)}
          >
            수정
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => deleteUser(user.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 목록</h1>
            <p className="text-sm text-gray-600 mt-1">
              사용자 조회 및 관리
            </p>
          </div>
          <Button onClick={() => console.log("Add user")}>
            사용자 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <UserStatsCard
            title="전체 사용자"
            value={stats?.total || 0}
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            onClick={() => setFilters({})}
          />
          <UserStatsCard
            title="활성 사용자"
            value={stats?.active || 0}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onClick={() => setFilters({ status: 'active' })}
          />
          <UserStatsCard
            title="관리자"
            value={stats?.admins || 0}
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            onClick={() => setFilters({ role: 'admin' })}
          />
          <UserStatsCard
            title="오늘 로그인"
            value={stats?.todayLogins || 0}
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="이름, 이메일, 부서로 검색"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select
            value={filters.role || ''}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 역할</option>
            <option value="admin">관리자</option>
            <option value="manager">운영자</option>
            <option value="operator">운영자</option>
            <option value="user">사용자</option>
          </select>
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기중</option>
            <option value="suspended">정지</option>
          </select>
        </div>
      </Card>

      {/* 사용자 테이블 */}
      <Card padding="none">
        <Table
          data={users}
          columns={columns}
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (newPage) => setPage(newPage)
          }}
        />
      </Card>
    </Container>
  );
};

export default UsersListPage;