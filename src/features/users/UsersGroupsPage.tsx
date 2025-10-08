import React, { useState } from "react";
import { Container, Card, Button, Input, Badge, Table, type TableColumn, Modal } from "../../design-system";
import { Permission, PERMISSION_GROUPS, getPermissionDisplayName } from './types/permissions';

interface UserGroup {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  description: string;
  memberCount: number;
  permissions: Permission[];
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
    permissions: ['products:read', 'products:update', 'orders:read', 'settings:read', 'system:logs'],
  },
  {
    id: "2",
    name: "마케팅팀",
    companyId: "company-1",
    companyName: "플고물류",
    description: "마케팅 전략 및 캠페인 관리",
    memberCount: 1,
    permissions: ['products:read', 'orders:read', 'reports:read', 'reports:export'],
  },
  {
    id: "3",
    name: "운영팀",
    companyId: "company-1",
    companyName: "플고물류",
    description: "일반 운영 업무",
    memberCount: 1,
    permissions: ['products:read', 'products:update', 'orders:read', 'orders:update', 'orders:process'],
  },
  
  // 에이스전자
  {
    id: "4",
    name: "영업팀",
    companyId: "company-2",
    companyName: "에이스전자",
    description: "제품 영업",
    memberCount: 1,
    permissions: ['products:read', 'orders:read', 'orders:create', 'reports:read'],
  },
  {
    id: "5",
    name: "IT팀",
    companyId: "company-2",
    companyName: "에이스전자",
    description: "시스템 관리",
    memberCount: 1,
    permissions: ['products:read', 'products:update', 'settings:read'],
  },
  
  // 베스트패션
  {
    id: "6",
    name: "디자인팀",
    companyId: "company-3",
    companyName: "베스트패션",
    description: "제품 디자인",
    memberCount: 1,
    permissions: ['products:read', 'products:create', 'products:update'],
  },
  {
    id: "7",
    name: "영업팀",
    companyId: "company-3",
    companyName: "베스트패션",
    description: "판매 영업",
    memberCount: 1,
    permissions: ['products:read', 'orders:read', 'orders:create'],
  },
  
  // 스마트식품
  {
    id: "8",
    name: "물류팀",
    companyId: "company-4",
    companyName: "스마트식품",
    description: "배송 및 물류",
    memberCount: 1,
    permissions: ['orders:read', 'orders:update', 'orders:process'],
  },
  {
    id: "9",
    name: "영업팀",
    companyId: "company-4",
    companyName: "스마트식품",
    description: "영업 관리",
    memberCount: 1,
    permissions: ['products:read', 'orders:read', 'orders:create', 'reports:read'],
  },
];

const UsersGroupsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [groups, setGroups] = useState<UserGroup[]>(mockGroups);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = search
      ? group.name.includes(search) || group.description.includes(search) || group.companyName.includes(search)
      : true;
    const matchesCompany = companyFilter ? group.companyId === companyFilter : true;
    return matchesSearch && matchesCompany;
  });

  const handleEditPermissions = (group: UserGroup) => {
    setSelectedGroup(group);
    setEditingPermissions([...group.permissions]);
    setShowPermissionModal(true);
  };

  const handlePermissionToggle = (permission: Permission) => {
    setEditingPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleGroupPermissionToggle = (groupPermissions: Permission[]) => {
    const hasAllGroupPermissions = groupPermissions.every(p => editingPermissions.includes(p));
    
    if (hasAllGroupPermissions) {
      setEditingPermissions(prev => prev.filter(p => !groupPermissions.includes(p)));
    } else {
      setEditingPermissions(prev => {
        const newPermissions = [...prev];
        groupPermissions.forEach(p => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleSavePermissions = () => {
    if (selectedGroup) {
      setGroups(prev => prev.map(group =>
        group.id === selectedGroup.id
          ? { ...group, permissions: editingPermissions }
          : group
      ));
      setShowPermissionModal(false);
      setSelectedGroup(null);
      setEditingPermissions([]);
    }
  };

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
      key: "permissions",
      title: "권한",
      render: (value, group) => (
        <span className="text-sm text-gray-600">
          {group.permissions.length > 0 ? `${group.permissions.length}개 권한` : '권한 없음'}
        </span>
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
            onClick={() => handleEditPermissions(group)}
          >
            권한 설정
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

        {/* 권한 설정 모달 */}
        {showPermissionModal && selectedGroup && (
          <Modal
            open={showPermissionModal}
            onClose={() => setShowPermissionModal(false)}
            title={`${selectedGroup.name} 권한 설정`}
          >
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  이 그룹에 속한 사용자는 아래 권한을 자동으로 상속받습니다
                </p>
              </div>

              {PERMISSION_GROUPS.map((group) => {
                const groupPermissions = group.permissions;
                const hasAllGroupPermissions = groupPermissions.every(p => editingPermissions.includes(p));

                return (
                  <div key={group.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hasAllGroupPermissions}
                          onChange={() => handleGroupPermissionToggle(groupPermissions)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">전체</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {groupPermissions.map((permission) => (
                        <label key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingPermissions.includes(permission)}
                            onChange={() => handlePermissionToggle(permission)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {getPermissionDisplayName(permission)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowPermissionModal(false)} fullWidth>
                  취소
                </Button>
                <Button onClick={handleSavePermissions} fullWidth>
                  저장
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Container>
  );
};

export default UsersGroupsPage;
