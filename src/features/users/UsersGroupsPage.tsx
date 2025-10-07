import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  department: string;
  manager: string;
  createdAt: string;
}

const mockGroups: UserGroup[] = [
  {
    id: "1",
    name: "IT팀",
    description: "시스템 개발 및 유지보수",
    memberCount: 12,
    department: "개발부",
    manager: "김철수",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "마케팅팀",
    description: "마케팅 전략 및 캠페인 관리",
    memberCount: 8,
    department: "마케팅부",
    manager: "이영희",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "영업팀",
    description: "고객 영업 및 관계 관리",
    memberCount: 15,
    department: "영업부",
    manager: "박민수",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "고객서비스팀",
    description: "고객 지원 및 문의 처리",
    memberCount: 10,
    department: "서비스부",
    manager: "정수진",
    createdAt: "2024-02-15",
  },
  {
    id: "5",
    name: "재무팀",
    description: "회계 및 재무 관리",
    memberCount: 6,
    department: "재무부",
    manager: "최동현",
    createdAt: "2024-03-01",
  },
];

const UsersGroupsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch = search
      ? group.name.includes(search) || group.description.includes(search) || group.manager.includes(search)
      : true;
    const matchesDepartment = departmentFilter ? group.department === departmentFilter : true;
    return matchesSearch && matchesDepartment;
  });

  const columns: TableColumn<UserGroup>[] = [
    {
      key: "name",
      title: "그룹명",
      render: (group) => (
        <div>
          <div className="font-medium text-gray-900">{group.name}</div>
          <div className="text-sm text-gray-500">{group.description}</div>
        </div>
      ),
    },
    {
      key: "department",
      title: "부서",
      render: (group) => (
        <Badge variant="secondary" size="small">{group.department}</Badge>
      ),
    },
    {
      key: "manager",
      title: "팀장",
      render: (group) => (
        <span className="text-sm text-gray-900">{group.manager}</span>
      ),
    },
    {
      key: "memberCount",
      title: "멤버 수",
      render: (group) => (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-900">{group.memberCount}명</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "생성일",
      render: (group) => (
        <span className="text-sm text-gray-500">{group.createdAt}</span>
      ),
    },
    {
      key: "actions",
      title: "작업",
      render: (group) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log("View members", group.id)}
          >
            멤버 보기
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log("Edit group", group.id)}
          >
            수정
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => console.log("Delete group", group.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  const departments = Array.from(new Set(mockGroups.map(group => group.department)));

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 그룹</h1>
            <p className="text-sm text-gray-600 mt-1">
              부서별, 팀별 사용자 그룹을 관리할 수 있습니다.
            </p>
          </div>
          <Button onClick={() => console.log("Add group")}>
            그룹 추가
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mockGroups.length}</div>
              <div className="text-sm text-gray-600">전체 그룹</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockGroups.reduce((sum, group) => sum + group.memberCount, 0)}
              </div>
              <div className="text-sm text-gray-600">총 멤버 수</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{departments.length}</div>
              <div className="text-sm text-gray-600">부서 수</div>
            </div>
          </Card>
          <Card padding="md">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(mockGroups.reduce((sum, group) => sum + group.memberCount, 0) / mockGroups.length)}
              </div>
              <div className="text-sm text-gray-600">평균 그룹 크기</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="그룹명, 설명, 팀장으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 부서</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* 그룹 테이블 */}
      <Card padding="none">
        <Table
          data={filteredGroups}
          columns={columns}
          keyField="id"
        />
      </Card>

      {/* 부서별 그룹 현황 */}
      <Card padding="lg" className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">부서별 그룹 현황</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const deptGroups = mockGroups.filter(group => group.department === dept);
            const totalMembers = deptGroups.reduce((sum, group) => sum + group.memberCount, 0);
            
            return (
              <div key={dept} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dept}</h4>
                  <Badge variant="secondary" size="small">{deptGroups.length}개 그룹</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-2">총 {totalMembers}명</div>
                <div className="space-y-1">
                  {deptGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{group.name}</span>
                      <span className="text-gray-500">{group.memberCount}명</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default UsersGroupsPage;
