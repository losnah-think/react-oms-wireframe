import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "김철수",
    email: "kim@company.com",
    role: "관리자",
    department: "IT팀",
    status: "active",
    lastLogin: "2025-01-15 09:30",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "이영희",
    email: "lee@company.com",
    role: "운영자",
    department: "마케팅팀",
    status: "active",
    lastLogin: "2025-01-15 08:45",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "박민수",
    email: "park@company.com",
    role: "사용자",
    department: "영업팀",
    status: "inactive",
    lastLogin: "2025-01-10 14:20",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "정수진",
    email: "jung@company.com",
    role: "운영자",
    department: "고객서비스팀",
    status: "active",
    lastLogin: "2025-01-15 10:15",
    createdAt: "2024-04-05",
  },
  {
    id: "5",
    name: "최동현",
    email: "choi@company.com",
    role: "사용자",
    department: "재무팀",
    status: "pending",
    lastLogin: "-",
    createdAt: "2025-01-14",
  },
];

const UsersListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = search
      ? user.name.includes(search) || user.email.includes(search) || user.department.includes(search)
      : true;
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success" size="small">활성</Badge>;
      case "inactive":
        return <Badge variant="secondary" size="small">비활성</Badge>;
      case "pending":
        return <Badge variant="warning" size="small">대기중</Badge>;
      default:
        return <Badge variant="secondary" size="small">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "관리자":
        return <Badge variant="danger" size="small">관리자</Badge>;
      case "운영자":
        return <Badge variant="primary" size="small">운영자</Badge>;
      case "사용자":
        return <Badge variant="secondary" size="small">사용자</Badge>;
      default:
        return <Badge variant="secondary" size="small">{role}</Badge>;
    }
  };

  const columns: TableColumn<User>[] = [
    {
      key: "name",
      title: "사용자",
      render: (user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {(user.name || "").charAt(0) || "?"}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "역할",
      render: (user) => getRoleBadge(user.role),
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
      render: (user) => getStatusBadge(user.status),
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
            onClick={() => console.log("Delete user", user.id)}
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
              시스템 사용자를 조회하고 관리할 수 있습니다.
            </p>
          </div>
          <Button onClick={() => console.log("Add user")}>
            사용자 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockUsers.length}</div>
              <div className="text-sm text-gray-600">전체 사용자</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockUsers.filter(u => u.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">활성 사용자</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockUsers.filter(u => u.role === "관리자").length}
              </div>
              <div className="text-sm text-gray-600">관리자</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mockUsers.filter(u => u.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">대기중</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="이름, 이메일, 부서로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 역할</option>
            <option value="관리자">관리자</option>
            <option value="운영자">운영자</option>
            <option value="사용자">사용자</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기중</option>
          </select>
        </div>
      </Card>

      {/* 사용자 테이블 */}
      <Card padding="none">
        <Table
          data={filteredUsers}
          columns={columns}
          keyField="id"
        />
      </Card>
    </Container>
  );
};

export default UsersListPage;
