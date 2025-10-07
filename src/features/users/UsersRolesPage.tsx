import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

const mockRoles: Role[] = [
  {
    id: "1",
    name: "시스템 관리자",
    description: "시스템 전체 관리 권한",
    permissions: ["사용자 관리", "시스템 설정", "데이터 관리", "보고서 조회"],
    userCount: 3,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "운영 관리자",
    description: "일반 운영 관리 권한",
    permissions: ["사용자 조회", "데이터 조회", "보고서 생성"],
    userCount: 8,
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "일반 사용자",
    description: "기본 사용자 권한",
    permissions: ["데이터 조회", "보고서 조회"],
    userCount: 145,
    createdAt: "2024-02-01",
  },
];

const UsersRolesPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredRoles = mockRoles.filter((role) =>
    search
      ? role.name.includes(search) || role.description.includes(search)
      : true
  );

  const columns: TableColumn<Role>[] = [
    {
      key: "name",
      title: "역할명",
      render: (role) => (
        <div>
          <div className="font-medium text-gray-900">{role.name}</div>
          <div className="text-sm text-gray-500">{role.description}</div>
        </div>
      ),
    },
    {
      key: "permissions",
      title: "권한",
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {(role.permissions || []).map((permission, index) => (
            <Badge key={index} variant="secondary" size="small">
              {permission}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "userCount",
      title: "사용자 수",
      render: (role) => (
        <span className="text-sm text-gray-900">{role.userCount}명</span>
      ),
    },
    {
      key: "createdAt",
      title: "생성일",
      render: (role) => (
        <span className="text-sm text-gray-500">{role.createdAt}</span>
      ),
    },
    {
      key: "actions",
      title: "작업",
      render: (role) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log("Edit role", role.id)}
          >
            수정
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log("Delete role", role.id)}
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
            <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
            <p className="text-sm text-gray-600 mt-1">
              사용자 역할과 권한을 정의하고 관리할 수 있습니다.
            </p>
          </div>
          <Button onClick={() => console.log("Add role")}>
            역할 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockRoles.length}</div>
              <div className="text-sm text-gray-600">전체 역할</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockRoles.reduce((sum, role) => sum + role.userCount, 0)}
              </div>
              <div className="text-sm text-gray-600">할당된 사용자</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockRoles.reduce((sum, role) => sum + role.permissions.length, 0)}
              </div>
              <div className="text-sm text-gray-600">총 권한 수</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 검색 */}
      <Card padding="lg" className="mb-6">
        <Input
          placeholder="역할명 또는 설명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* 권한 테이블 */}
      <Card padding="none">
        <Table
          data={filteredRoles}
          columns={columns}
          keyField="id"
        />
      </Card>

      {/* 권한 매트릭스 */}
      <Card padding="lg" className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">권한 매트릭스</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">역할</th>
                <th className="text-center py-2 px-3">사용자 관리</th>
                <th className="text-center py-2 px-3">시스템 설정</th>
                <th className="text-center py-2 px-3">데이터 관리</th>
                <th className="text-center py-2 px-3">데이터 조회</th>
                <th className="text-center py-2 px-3">보고서 생성</th>
                <th className="text-center py-2 px-3">보고서 조회</th>
              </tr>
            </thead>
            <tbody>
              {mockRoles.map((role) => (
                <tr key={role.id} className="border-b">
                  <td className="py-2 px-3 font-medium">{role.name}</td>
                  <td className="text-center py-2 px-3">
                    {(role.permissions || []).includes("사용자 관리") ? (
                      <Badge variant="success" size="small">✓</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center py-2 px-3">
                    {(role.permissions || []).includes("시스템 설정") ? (
                      <Badge variant="success" size="small">✓</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center py-2 px-3">
                    {(role.permissions || []).includes("데이터 관리") ? (
                      <Badge variant="success" size="small">✓</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center py-2 px-3">
                    {(role.permissions || []).includes("데이터 조회") ? (
                      <Badge variant="success" size="small">✓</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center py-2 px-3">
                    {(role.permissions || []).includes("보고서 생성") ? (
                      <Badge variant="success" size="small">✓</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="text-center py-2 px-3">
                    {(role.permissions || []).includes("보고서 조회") ? (
                      <Badge variant="success" size="small">✓</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Container>
  );
};

export default UsersRolesPage;
