import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn } from "../../design-system";

interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

const mockGroups: UserGroup[] = [
  {
    id: "1",
    name: "IT팀",
    description: "시스템 개발 및 유지보수",
    memberCount: 12,
  },
  {
    id: "2",
    name: "마케팅팀",
    description: "마케팅 전략 및 캠페인 관리",
    memberCount: 8,
  },
  {
    id: "3",
    name: "영업팀",
    description: "고객 영업 및 관계 관리",
    memberCount: 15,
  },
  {
    id: "4",
    name: "고객서비스팀",
    description: "고객 지원 및 문의 처리",
    memberCount: 10,
  },
  {
    id: "5",
    name: "재무팀",
    description: "회계 및 재무 관리",
    memberCount: 6,
  },
];

const UsersGroupsPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const filteredGroups = mockGroups.filter((group) => {
    const matchesSearch = search
      ? group.name.includes(search) || group.description.includes(search)
      : true;
    return matchesSearch;
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

        {/* 검색 */}
        <Card padding="lg" className="mb-6">
          <Input
            placeholder="그룹명 또는 설명으로 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
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
