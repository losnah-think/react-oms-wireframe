import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface UserGroup {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  description: string;
  memberCount: number;
}

const mockGroups: UserGroup[] = [
  // 플고물류
  {
    id: "1",
    name: "IT팀",
    companyId: "company-1",
    companyName: "플고물류",
    description: "시스템 개발 및 유지보수",
    memberCount: 3,
  },
  {
    id: "2",
    name: "마케팅팀",
    companyId: "company-1",
    companyName: "플고물류",
    description: "마케팅 전략 및 캠페인 관리",
    memberCount: 1,
  },
  {
    id: "3",
    name: "운영팀",
    companyId: "company-1",
    companyName: "플고물류",
    description: "일반 운영 업무",
    memberCount: 1,
  },
  
  // 에이스전자
  {
    id: "4",
    name: "영업팀",
    companyId: "company-2",
    companyName: "에이스전자",
    description: "제품 영업",
    memberCount: 1,
  },
  {
    id: "5",
    name: "IT팀",
    companyId: "company-2",
    companyName: "에이스전자",
    description: "시스템 관리",
    memberCount: 1,
  },
  
  // 베스트패션
  {
    id: "6",
    name: "디자인팀",
    companyId: "company-3",
    companyName: "베스트패션",
    description: "제품 디자인",
    memberCount: 1,
  },
  {
    id: "7",
    name: "영업팀",
    companyId: "company-3",
    companyName: "베스트패션",
    description: "판매 영업",
    memberCount: 1,
  },
  
  // 스마트식품
  {
    id: "8",
    name: "물류팀",
    companyId: "company-4",
    companyName: "스마트식품",
    description: "배송 및 물류",
    memberCount: 1,
  },
  {
    id: "9",
    name: "영업팀",
    companyId: "company-4",
    companyName: "스마트식품",
    description: "영업 관리",
    memberCount: 1,
  },
];

const UsersGroupsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch = search
      ? group.name.includes(search) || group.description.includes(search) || group.companyName.includes(search)
      : true;
    const matchesCompany = companyFilter ? group.companyId === companyFilter : true;
    return matchesSearch && matchesCompany;
  });

  const columns: TableColumn<UserGroup>[] = [
    {
      key: "name",
      title: "그룹명",
      render: (value, group) => (
        <div>
          <div className="font-medium text-gray-900">{group.name}</div>
          <div className="text-sm text-gray-500">{group.description}</div>
        </div>
      ),
    },
    {
      key: "companyName",
      title: "회사",
      render: (value, group) => (
        <span className="text-sm text-gray-900">{group.companyName}</span>
      ),
    },
    {
      key: "memberCount",
      title: "인원",
      render: (value, group) => (
        <span className="text-sm text-gray-900">{group.memberCount}명</span>
      ),
    },
    {
      key: "actions",
      title: "작업",
      render: (value, group) => (
        <div className="flex gap-2">
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

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 그룹</h1>
            <p className="text-sm text-gray-600 mt-1">
              그룹별 사용자 관리
            </p>
          </div>
          <Button onClick={() => console.log("Add group")}>
            그룹 추가
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <Card padding="lg" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="그룹명, 회사, 설명으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 회사</option>
              <option value="company-1">플고물류</option>
              <option value="company-2">에이스전자</option>
              <option value="company-3">베스트패션</option>
              <option value="company-4">스마트식품</option>
            </select>
          </div>
        </Card>

        {/* 그룹 테이블 */}
        <Card padding="none">
          <Table
            data={filteredGroups}
            columns={columns}
          />
        </Card>
      </div>
    </Container>
  );
};

export default UsersGroupsPage;
